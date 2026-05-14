import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, logTimeline } from "@/lib/audit";

export async function POST(request: Request) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { talentId, newTalent, projectName } = body;

  if (!projectName?.trim()) {
    return NextResponse.json({ error: "프로젝트명이 필요합니다." }, { status: 400 });
  }

  let resolvedTalentId: string = talentId;

  // 신규 방송인 등록이 필요한 경우 먼저 생성
  if (!talentId && newTalent) {
    const { nameKo, nameEn, position, nameCn, email, phone } = newTalent;
    if (!nameKo || !nameEn || !position) {
      return NextResponse.json(
        { error: "이름(한글), 이름(영문), 포지션은 필수입니다." },
        { status: 400 },
      );
    }

    const talent = await prisma.talent.create({
      data: {
        userId: user.id,
        nameKo,
        nameEn,
        nameCn: nameCn || null,
        position,
        email: email || null,
        phone: phone || null,
      },
    });

    await logAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "CREATE_TALENT",
      targetType: "Talent",
      targetId: talent.id,
      after: { nameKo, nameEn, position },
    });

    resolvedTalentId = talent.id;
  }

  if (!resolvedTalentId) {
    return NextResponse.json({ error: "방송인 정보가 필요합니다." }, { status: 400 });
  }

  // 소유권 확인
  const talent = await prisma.talent.findFirst({
    where: { id: resolvedTalentId, userId: user.id },
  });
  if (!talent) {
    return NextResponse.json({ error: "방송인을 찾을 수 없습니다." }, { status: 404 });
  }

  // 프로젝트 생성 — 파트너 직접 입력 모드, 자료 수집 단계 건너뜀
  const project = await prisma.project.create({
    data: {
      userId: user.id,
      talentId: resolvedTalentId,
      name: projectName.trim(),
      intakeMode: "OPERATOR_ENTRY",
      status: "DRAFTING",
    },
  });

  await logAudit({
    actorId: user.id,
    actorRole: user.role,
    action: "CREATE_PROJECT",
    targetType: "Project",
    targetId: project.id,
    after: { name: projectName, talentId: resolvedTalentId, intakeMode: "OPERATOR_ENTRY" },
  });

  await logTimeline({
    projectId: project.id,
    event: "PROJECT_CREATED",
    description: `직접 제작 모드로 프로젝트 "${projectName.trim()}" 생성됨`,
    actorId: user.id,
    actorName: user.name,
  });

  return NextResponse.json({ projectId: project.id }, { status: 201 });
}
