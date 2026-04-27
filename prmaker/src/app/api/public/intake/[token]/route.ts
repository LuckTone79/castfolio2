import { NextResponse } from "next/server";
import { requireIntakeToken } from "@/lib/tokens";
import { prisma } from "@/lib/prisma";
import { logTimeline } from "@/lib/audit";
import { sendNotification } from "@/lib/notify";

export async function GET(_: Request, { params }: { params: { token: string } }) {
  try {
    const form = await requireIntakeToken(params.token);
    return NextResponse.json({
      talentName: form.talent.nameKo,
      customFields: form.customFields,
      expiresAt: form.expiresAt,
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
    const body = await request.json();

    const submission = await prisma.intakeSubmission.create({
      data: {
        formId: form.id,
        data: body,
        submittedBy: `talent:${form.talentId}`,
        status: "COMPLETE",
      },
    });

    // Update project status
    await prisma.project.update({
      where: { id: form.projectId },
      data: { status: "COLLECTING_MATERIALS" },
    });

    await logTimeline({ projectId: form.projectId, event: "INTAKE_SUBMITTED", description: "방송인이 자료를 제출했습니다", actorName: form.talent.nameKo });
    await sendNotification({ userId: form.project.userId, type: "intake_complete", title: "자료 제출 완료", body: `${form.talent.nameKo}이 자료를 제출했습니다.`, link: `/dashboard/projects/${form.projectId}`, emailTo: form.project.user.email });

    return NextResponse.json({ ok: true, submissionId: submission.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error";
    if (message === "TOKEN_EXPIRED") return NextResponse.json({ error: "EXPIRED" }, { status: 410 });
    return NextResponse.json({ error: "INVALID" }, { status: 404 });
  }
}
