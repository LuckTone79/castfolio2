import { NextResponse } from "next/server";
import type { OrderStatus } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, logTimeline } from "@/lib/audit";
import { sendNotification, notifyTalent } from "@/lib/notify";

// Only these statuses may transition to PAID. Anything else (already PAID,
// DELIVERED, SETTLED, CANCELLED, DISPUTED, REFUNDED) must be rejected so a
// duplicate/concurrent confirm can't create a second CommissionLedger entry.
const PAYABLE_STATUSES: OrderStatus[] = ["DRAFT", "PAYMENT_PENDING"];

class OrderAlreadyPaidError extends Error {}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: user.id },
    include: { project: { include: { talent: true } } },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!PAYABLE_STATUSES.includes(order.status as (typeof PAYABLE_STATUSES)[number])) {
    return NextResponse.json({ error: "이미 결제 확인되었거나 처리할 수 없는 상태의 주문입니다." }, { status: 409 });
  }

  const body = await request.json();
  const { paymentMethod, paidAt, proofUrl } = body;

  let updated;
  try {
    updated = await prisma.$transaction(async (tx) => {
      // Row-level lock via the WHERE clause: only one concurrent request can
      // match a still-payable status, so at most one CommissionLedger is created.
      const { count } = await tx.order.updateMany({
        where: { id: order.id, status: { in: PAYABLE_STATUSES } },
        data: {
          status: "PAID",
          paymentMethod,
          paidAt: paidAt ? new Date(paidAt) : new Date(),
          paymentProofUrl: proofUrl,
        },
      });
      if (count === 0) throw new OrderAlreadyPaidError();

      if (!proofUrl) {
        await tx.riskFlag.create({
          data: {
            targetType: "Order",
            targetId: order.id,
            reason: "증빙 미첨부 오프라인 결제",
            severity: "low",
          },
        });
      }

      await tx.commissionLedger.create({
        data: {
          orderId: order.id,
          userId: user.id,
          orderAmount: order.totalAmount,
          commissionRate: order.commissionRate,
          commissionAmount: order.commissionAmount,
          userAmount: order.userAmount,
          type: "sale",
        },
      });

      return tx.order.findUniqueOrThrow({ where: { id: order.id } });
    });
  } catch (err) {
    if (err instanceof OrderAlreadyPaidError) {
      return NextResponse.json({ error: "이미 결제 확인되었거나 처리할 수 없는 상태의 주문입니다." }, { status: 409 });
    }
    throw err;
  }

  await logAudit({ actorId: user.id, actorRole: user.role, action: "CONFIRM_PAYMENT", targetType: "Order", targetId: order.id, before: { status: order.status }, after: { status: "PAID" } });
  await logTimeline({ projectId: order.projectId, event: "PAYMENT_CONFIRMED", description: `결제 확인됨: ${order.orderNumber}`, actorId: user.id, actorName: user.name });

  await sendNotification({ userId: user.id, type: "payment_complete", title: "결제 확인 완료", body: `${order.project.talent.nameKo}의 주문 결제가 확인되었습니다.`, link: `/app/projects/${order.projectId}` });
  await notifyTalent({ talentId: order.project.talentId, type: "payment_complete", title: "결제가 확인되었습니다", body: `결제가 확인되었습니다. 곧 PR 페이지가 완성됩니다!` });

  return NextResponse.json(updated);
}
