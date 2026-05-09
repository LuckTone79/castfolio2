import { NextResponse } from "next/server";
import { requireReviewToken } from "@/lib/tokens";
import { prisma } from "@/lib/prisma";
import { logTimeline } from "@/lib/audit";
import { sendNotification } from "@/lib/notify";

export async function GET(_: Request, { params }: { params: { token: string } }) {
  try {
    const form = await requireReviewToken(params.token);
    const submission = form.submissions[0];

    // Fetch page data for PR preview
    const page = await prisma.page.findFirst({
      where: { projectId: form.projectId },
      select: { draftContent: true, theme: true, accentColor: true, sectionOrder: true, disabledSections: true },
    });

    return NextResponse.json({
      submission: submission?.data,
      status: form.project.verificationStatus,
      talent: { nameKo: form.talent.nameKo, nameEn: form.talent.nameEn },
      page: page ?? null,
    });
  } catch {
    return NextResponse.json({ error: "INVALID" }, { status: 404 });
  }
}

export async function POST(request: Request, { params }: { params: { token: string } }) {
  try {
    const form = await requireReviewToken(params.token);
    const body = await request.json();
    const { action, revisionNote } = body;

    // 이미 승인된 경우 재처리 차단
    if (form.project.verificationStatus === "APPROVED" && action === "APPROVE") {
      return NextResponse.json({ error: "이미 승인된 검토입니다." }, { status: 409 });
    }

    if (action === "APPROVE") {
      await prisma.project.update({
        where: { id: form.projectId },
        data: { verificationStatus: "APPROVED", verifiedAt: new Date() },
      });
      await logTimeline({ projectId: form.projectId, event: "REVIEW_APPROVED", description: "방송인이 자료를 확인 완료했습니다", actorName: form.talent.nameKo });
    } else if (action === "REVISION") {
      await prisma.project.update({
        where: { id: form.projectId },
        data: { verificationStatus: "REVISION_REQUESTED" },
      });
      await sendNotification({ userId: form.project.userId, type: "revision_requested", title: "수정 요청 도착", body: `${form.talent.nameKo}: ${revisionNote}`, link: `/dashboard/projects/${form.projectId}`, emailTo: form.project.user.email });
      await logTimeline({ projectId: form.projectId, event: "REVISION_REQUESTED", description: `수정 요청: ${revisionNote}`, actorName: form.talent.nameKo });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "INVALID" }, { status: 404 });
  }
}
