import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { logAudit, logTimeline } from "@/lib/audit";
import {
  createEmptyDraftContent,
  createEmptyPageContent,
  hasMeaningfulContent,
  mergeIntakeContent,
  type IntakeMergeMode,
} from "@/lib/intake";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { DraftContent } from "@/types/page-content";
import type { IntakePayload } from "@/types/intake";

function generateSlug(base: string) {
  const suffix = randomBytes(6).toString("base64url").slice(0, 6);
  return `${base}-${suffix}`;
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { mode?: IntakeMergeMode };
  const mode: IntakeMergeMode = body.mode === "overwrite" ? "overwrite" : "fill_empty";

  const form = await prisma.intakeForm.findFirst({
    where: { id: params.id, project: { userId: user.id } },
    include: {
      talent: true,
      project: { include: { page: true } },
      submissions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!form || form.submissions.length === 0) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const submission = form.submissions[0];
  const payload = submission.data as unknown as IntakePayload;
  const submittedContent = payload.pageContent;

  let page = form.project.page;
  if (!page) {
    const baseName = (form.talent.nameEn || form.talent.nameKo || "talent").toLowerCase().replace(/\s+/g, "-");
    page = await prisma.page.create({
      data: {
        projectId: form.projectId,
        slug: generateSlug(baseName),
        theme: "anchor-clean",
        status: "DRAFT",
        contentKo: {},
        contentEn: {},
        contentCn: {},
        draftContent: createEmptyDraftContent() as unknown as Prisma.InputJsonValue,
      },
    });
  }

  const existingDraft = (page.draftContent as DraftContent | null) ?? createEmptyDraftContent();
  const existingKo = existingDraft.ko ?? createEmptyPageContent();
  const hadExistingContent = hasMeaningfulContent(existingKo);
  const mergedKo = mergeIntakeContent(existingKo, submittedContent, mode);
  const nextDraft: DraftContent = {
    ...existingDraft,
    ko: mergedKo,
  };

  const updatedPayload: IntakePayload = {
    ...payload,
    meta: {
      ...payload.meta,
      importedAt: new Date().toISOString(),
    },
  };

  await prisma.$transaction([
    prisma.page.update({
      where: { id: page.id },
      data: { draftContent: nextDraft as unknown as Prisma.InputJsonValue },
    }),
    prisma.project.update({
      where: { id: form.projectId },
      data: { status: "DRAFTING" },
    }),
    prisma.intakeSubmission.update({
      where: { id: submission.id },
      data: { data: updatedPayload as unknown as Prisma.InputJsonValue },
    }),
  ]);

  await logAudit({
    actorId: user.id,
    actorRole: user.role,
    action: "INTAKE_IMPORTED_TO_BUILDER",
    targetType: "IntakeSubmission",
    targetId: submission.id,
    after: {
      mode,
      pageId: page.id,
      importedSections: payload.meta.submittedSections,
      submissionId: submission.id,
    },
  });
  await logTimeline({
    projectId: form.projectId,
    event: "INTAKE_IMPORTED_TO_BUILDER",
    description: "제출 자료가 빌더 초안으로 반영되었습니다.",
    actorId: user.id,
    actorName: user.name,
    metadata: { mode },
  });

  return NextResponse.json({
    ok: true,
    pageId: page.id,
    projectId: form.projectId,
    talentId: form.talentId,
    hadExistingContent,
  });
}
