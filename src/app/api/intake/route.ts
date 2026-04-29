import { NextResponse } from "next/server";
import { logAudit, logTimeline } from "@/lib/audit";
import { buildIntakeUrl, createIntakeToken, hasMeaningfulContent } from "@/lib/intake";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PageContent } from "@/types/page-content";
import type { IntakePayload, IntakeSubmissionRecord } from "@/types/intake";

function getExistingContent(page: { draftContent: unknown; contentKo: unknown } | null): PageContent | null {
  if (!page) return null;
  const draft = page.draftContent as { ko?: PageContent } | null;
  if (draft?.ko) return draft.ko;
  const content = page.contentKo as PageContent | null;
  return content;
}

export async function GET(request: Request) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");

  const where = projectId ? { projectId, project: { userId: user.id } } : { project: { userId: user.id } };

  const forms = await prisma.intakeForm.findMany({
    where,
    include: {
      talent: { select: { id: true, nameKo: true, position: true } },
      project: { select: { id: true, name: true, page: { select: { draftContent: true, contentKo: true } } } },
      submissions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const records: IntakeSubmissionRecord[] = forms.map((form) => {
    const latestSubmission = form.submissions[0];
    const payload = (latestSubmission?.data ?? null) as IntakePayload | null;
    const importedAt = payload?.meta.importedAt ?? null;
    const submittedAt = payload?.meta.submittedAt ?? latestSubmission?.createdAt.toISOString() ?? null;
    const existingContent = getExistingContent(form.project.page);

    return {
      id: form.id,
      formId: form.id,
      projectId: form.project.id,
      talentId: form.talent.id,
      talentName: form.talent.nameKo,
      projectName: form.project.name,
      position: form.talent.position || "",
      token: form.token,
      workflowStatus: importedAt ? "imported" : latestSubmission ? "submitted" : "requested",
      submittedAt,
      importedAt,
      latestSubmissionId: latestSubmission?.id ?? null,
      latestPayload: payload,
      intakeUrl: buildIntakeUrl(form.token),
      hasExistingContent: existingContent ? hasMeaningfulContent(existingContent) : false,
    };
  });

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
