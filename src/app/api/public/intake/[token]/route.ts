import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { logTimeline } from "@/lib/audit";
import { normalizeIntakePayload, payloadToPageContent } from "@/lib/intake";
import { sendNotification } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { requireIntakeToken } from "@/lib/tokens";
import type { IntakePayload } from "@/types/intake";

export async function GET(_: Request, { params }: { params: { token: string } }) {
  try {
    const form = await requireIntakeToken(params.token);
    const latestSubmission = await prisma.intakeSubmission.findFirst({
      where: { formId: form.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      talentName: form.talent.nameKo,
      talentNameEn: form.talent.nameEn,
      projectName: form.project.name,
      customFields: form.customFields,
      expiresAt: form.expiresAt,
      latestSubmission: latestSubmission?.data ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error";
    if (message === "TOKEN_EXPIRED") return NextResponse.json({ error: "EXPIRED" }, { status: 410 });
    return NextResponse.json({ error: "INVALID" }, { status: 404 });
  }
}

export async function POST(request: Request, { params }: { params: { token: string } }) {
  try {
    const form = await requireIntakeToken(params.token);
    const body = (await request.json()) as IntakePayload;
    const payload = normalizeIntakePayload({
      ...body,
      pageContent: payloadToPageContent(body),
      meta: {
        ...body.meta,
        submittedAt: new Date().toISOString(),
        importedAt: null,
      },
    });

    const submission = await prisma.intakeSubmission.create({
      data: {
        formId: form.id,
        data: payload as unknown as Prisma.InputJsonValue,
        submittedBy: `talent:${form.talentId}`,
        status: "COMPLETE",
      },
    });

    await prisma.project.update({
      where: { id: form.projectId },
      data: { status: "COLLECTING_MATERIALS" },
    });

    await logTimeline({
      projectId: form.projectId,
      event: "INTAKE_SUBMITTED",
      description: "방송인 고객이 자료 제출을 완료했습니다.",
      actorName: form.talent.nameKo,
    });
    await sendNotification({
      userId: form.project.userId,
      type: "intake_complete",
      title: "자료 제출 완료",
      body: `${form.talent.nameKo} 고객이 자료를 제출했습니다.`,
      link: `/app/intake`,
      emailTo: form.project.user.email,
    });

    return NextResponse.json({ ok: true, submissionId: submission.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error";
    if (message === "TOKEN_EXPIRED") return NextResponse.json({ error: "EXPIRED" }, { status: 410 });
    return NextResponse.json({ error: "INVALID" }, { status: 404 });
  }
}
