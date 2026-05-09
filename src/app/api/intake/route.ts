import { NextResponse } from "next/server";
import { logAudit, logTimeline } from "@/lib/audit";
import { createIntakeToken } from "@/lib/intake";
import { getIntakeSubmissionRecords } from "@/lib/intake-records";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  const records = await getIntakeSubmissionRecords(user.id, projectId);

  return NextResponse.json({ forms: records });
}

export async function POST(request: Request) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectId, expiresAt } = body;

  if (!projectId) {
    return NextResponse.json({ error: "projectId가 필요합니다." }, { status: 400 });
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
    include: { talent: true },
  });
  if (!project) {
    return NextResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });
  }

  const form = await prisma.intakeForm.create({
    data: {
      projectId,
      talentId: project.talentId,
      token: createIntakeToken(),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    },
  });

  await logAudit({
    actorId: user.id,
    actorRole: user.role,
    action: "CREATE_INTAKE_FORM",
    targetType: "IntakeForm",
    targetId: form.id,
    after: { projectId },
  });
  await logTimeline({
    projectId,
    event: "INTAKE_LINK_CREATED",
    description: "자료 제출 링크가 생성되었습니다.",
    actorId: user.id,
    actorName: user.name,
  });

  return NextResponse.json(form, { status: 201 });
}
