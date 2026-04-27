import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, logTimeline } from "@/lib/audit";
import { sendNotification } from "@/lib/notify";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quote = await prisma.quote.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      project: { include: { talent: true } },
      lineItems: { include: { package: true } },
      order: true,
    },
  });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(quote);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body;

  const quote = await prisma.quote.findFirst({ where: { id: params.id, userId: user.id }, include: { project: { include: { talent: true } } } });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "send") {
    const updated = await prisma.quote.update({
      where: { id: params.id },
      data: { status: "SENT", sentAt: new Date() },
    });
    await logAudit({ actorId: user.id, actorRole: user.role, action: "SEND_QUOTE", targetType: "Quote", targetId: quote.id });
    await logTimeline({ projectId: quote.projectId, event: "QUOTE_SENT", description: "견적서가 발송되었습니다", actorId: user.id, actorName: user.name });
    if (quote.project.talent.email) {
      // Talent에게 이메일 알림
      await sendNotification({ userId: user.id, type: "quote_sent", title: "견적서 발송 완료", body: `${quote.project.talent.nameKo}님께 견적서가 발송되었습니다.`, link: `/dashboard/quotes/${quote.id}`, emailTo: quote.project.talent.email });
    } else {
      // Talent 이메일 없음 → proxy 알림 (지침서 규칙 L)
      await sendNotification({ userId: user.id, type: "quote_sent_proxy", title: "견적서 발송 — 직접 전달 필요", body: `${quote.project.talent.nameKo}님의 이메일이 없습니다. 견적서를 직접 전달해주세요.`, link: `/dashboard/quotes/${quote.id}`, emailTo: user.email });
    }
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
