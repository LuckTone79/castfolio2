import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { buildIntakeUrl, hasMeaningfulContent } from "@/lib/intake";
import type { PageContent } from "@/types/page-content";
import type { IntakePayload, IntakeSubmissionRecord } from "@/types/intake";

function getExistingContent(page: { draftContent: unknown; contentKo: unknown } | null): PageContent | null {
  if (!page) return null;
  const draft = page.draftContent as { ko?: PageContent } | null;
  if (draft?.ko) return draft.ko;
  return page.contentKo as PageContent | null;
}

export const getIntakeSubmissionRecords = cache(async (userId: string, projectId?: string | null) => {
  const where = projectId ? { projectId, project: { userId } } : { project: { userId } };

  const forms = await prisma.intakeForm.findMany({
    where,
    include: {
      talent: { select: { id: true, nameKo: true, position: true } },
      project: { select: { id: true, name: true, page: { select: { draftContent: true, contentKo: true } } } },
      submissions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return forms.map((form): IntakeSubmissionRecord => {
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
});
