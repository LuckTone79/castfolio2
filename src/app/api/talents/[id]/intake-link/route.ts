import { NextResponse } from "next/server";
import { logAudit, logTimeline } from "@/lib/audit";
import { buildIntakeUrl, createIntakeToken } from "@/lib/intake";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const talent = await prisma.talent.findFirst({
    where: { id: params.id, userId: user.id, status: { not: "DELETED" } },
    include: {
      projects: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: { intakeForms: { orderBy: { createdAt: "desc" }, take: 1 } },
      },
    },
  });

  if (!talent) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let project = talent.projects[0];
  if (!project) {
    project = await prisma.project.create({
      data: {
        userId: user.id,
        talentId: talent.id,
        name: `${talent.nameKo} PR 프로젝트`,
        intakeMode: "SELF_SUBMISSION",
      },
      include: { intakeForms: true },
    });
  }

  const existingForm = project.intakeForms[0];
  if (existingForm) {
    return NextResponse.json({
      formId: existingForm.id,
      token: existingForm.token,
      intakeUrl: buildIntakeUrl(existingForm.token),
      alreadyExisted: true,
    });
  }

  const form = await prisma.intakeForm.create({
    data: {
      projectId: project.id,
      talentId: talent.id,
      token: createIntakeToken(),
    },
  });

  await logAudit({
    actorId: user.id,
    actorRole: user.role,
    action: "INTAKE_LINK_CREATED",
    targetType: "IntakeForm",
    targetId: form.id,
    after: { talentId: talent.id, token: `${form.token.slice(0, 12)}...` },
  });
  await logTimeline({
    projectId: project.id,
    event: "INTAKE_LINK_CREATED",
    description: "자료 요청 링크가 생성되었습니다.",
    actorId: user.id,
    actorName: user.name,
  });

  return NextResponse.json({
    formId: form.id,
    token: form.token,
    intakeUrl: buildIntakeUrl(form.token),
    alreadyExisted: false,
  });
}
