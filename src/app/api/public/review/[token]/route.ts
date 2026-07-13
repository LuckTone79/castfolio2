import { NextResponse } from "next/server";
import { requireReviewToken } from "@/lib/tokens";
import { prisma } from "@/lib/prisma";
import { logTimeline } from "@/lib/audit";
import { sendNotification } from "@/lib/notify";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { reviewActionSchema } from "@/lib/validators";

export async function GET(request: Request, { params }: { params: { token: string } }) {
  const limit = rateLimit(`review:get:${getClientIp(request)}`, 30, 5 * 60 * 1000);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  try {
    const form = await requireReviewToken(params.token);
    const submission = form.submissions[0];
    return NextResponse.json({ submission: submission?.data, status: form.project.verificationStatus });
  } catch {
    return NextResponse.json({ error: "INVALID" }, { status: 404 });
  }
}

export async function POST(request: Request, { params }: { params: { token: string } }) {
  const limit = rateLimit(`review:post:${getClientIp(request)}`, 10, 5 * 60 * 1000);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const parsed = reviewActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
  }
  const { action, revisionNote } = parsed.data;

  try {
    const form = await requireReviewToken(params.token);

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
      await sendNotification({ userId: form.project.userId, type: "revision_requested", title: "수정 요청 도착", body: `${form.talent.nameKo}: ${revisionNote}`, link: `/app/projects/${form.projectId}`, emailTo: form.project.user.email });
      await logTimeline({ projectId: form.projectId, event: "REVISION_REQUESTED", description: `수정 요청: ${revisionNote}`, actorName: form.talent.nameKo });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "INVALID" }, { status: 404 });
  }
}
