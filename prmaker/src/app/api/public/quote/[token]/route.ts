import { NextResponse } from "next/server";
import { requireQuoteToken } from "@/lib/tokens";
import { prisma } from "@/lib/prisma";
import { logTimeline } from "@/lib/audit";
import { sendNotification } from "@/lib/notify";

export async function GET(_: Request, { params }: { params: { token: string } }) {
  try {
    const quote = await requireQuoteToken(params.token);
    return NextResponse.json({
      id: quote.id,
      status: quote.status,
      totalAmount: quote.totalAmount,
      validUntil: quote.validUntil,
      sentAt: quote.sentAt,
      message: quote.message,
      lineItems: quote.lineItems.map(item => ({
        description: item.description,
        amount: item.amount,
        quantity: item.quantity,
      })),
      talent: {
        nameKo: quote.project.talent.nameKo,
      },
      user: {
        name: quote.user.name,
        email: quote.user.email,
        phone: quote.user.phone,
        brandLogoUrl: quote.user.brandLogoUrl,
        brandColor: quote.user.brandColor,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error";
    if (message === "TOKEN_EXPIRED") return NextResponse.json({ error: "EXPIRED" }, { status: 410 });
    return NextResponse.json({ error: "INVALID" }, { status: 404 });
  }
}

export async function POST(request: Request, { params }: { params: { token: string } }) {
  try {
    const quote = await requireQuoteToken(params.token);
    const body = await request.json();
    const { action } = body;

    if (quote.status !== "SENT") {
      return NextResponse.json({ error: "이미 처리된 견적서입니다." }, { status: 409 });
    }

    if (action === "ACCEPT") {
      // 원자적 처리: quote 상태를 ACCEPTED로 변경 + Order 생성 (race condition 방지)
      const commissionRate = Number(quote.user.commissionRate ?? 0.15);
      const totalAmount = Number(quote.totalAmount);
      const commissionAmount = Math.round(totalAmount * commissionRate);
      const userAmount = totalAmount - commissionAmount;
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

      try {
        await prisma.$transaction([
          prisma.quote.update({
            where: { id: quote.id, status: "SENT" }, // status 조건으로 동시 요청 중 하나만 통과
            data: { status: "ACCEPTED" },
          }),
          prisma.order.create({
            data: {
              projectId: quote.projectId,
              userId: quote.userId,
              quoteId: quote.id,
              orderNumber,
              status: "PAYMENT_PENDING",
              totalAmount,
              commissionRate,
              commissionAmount,
              userAmount,
              pricingSnapshot: {
                lineItems: quote.lineItems.map(li => ({
                  description: li.description,
                  amount: Number(li.amount),
                  quantity: li.quantity,
                })),
                totalAmount,
                commissionRate,
              },
            },
          }),
        ]);
      } catch {
        // 트랜잭션 실패 = 이미 다른 요청이 처리했거나 상태 불일치
        return NextResponse.json({ error: "이미 처리된 견적서입니다." }, { status: 409 });
      }

      await logTimeline({
        projectId: quote.projectId,
        event: "QUOTE_ACCEPTED",
        description: `${quote.project.talent.nameKo}님이 견적서를 수락했습니다.`,
        actorName: quote.project.talent.nameKo,
      });

      await sendNotification({
        userId: quote.userId,
        type: "quote_accepted",
        title: "견적서 수락됨",
        body: `${quote.project.talent.nameKo}님이 견적서를 수락했습니다. 결제를 확인해주세요.`,
        link: `/dashboard/quotes`,
      });

      return NextResponse.json({ ok: true, action: "ACCEPTED", orderNumber });

    } else if (action === "REJECT") {
      await prisma.quote.update({
        where: { id: quote.id },
        data: { status: "REJECTED" },
      });

      await logTimeline({
        projectId: quote.projectId,
        event: "QUOTE_REJECTED",
        description: `${quote.project.talent.nameKo}님이 견적서를 거절했습니다.`,
        actorName: quote.project.talent.nameKo,
      });

      await sendNotification({
        userId: quote.userId,
        type: "quote_rejected",
        title: "견적서 거절됨",
        body: `${quote.project.talent.nameKo}님이 견적서를 거절했습니다.`,
        link: `/dashboard/quotes`,
      });

      return NextResponse.json({ ok: true, action: "REJECTED" });
    }

    return NextResponse.json({ error: "알 수 없는 액션" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error";
    if (message === "TOKEN_EXPIRED") return NextResponse.json({ error: "EXPIRED" }, { status: 410 });
    return NextResponse.json({ error: "INVALID" }, { status: 404 });
  }
}
