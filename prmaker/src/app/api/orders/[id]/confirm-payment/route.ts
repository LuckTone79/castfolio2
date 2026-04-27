import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, logTimeline } from "@/lib/audit";
import { sendNotification, notifyTalent } from "@/lib/notify";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: user.id },
    include: { project: { include: { talent: true } } },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const { paymentMethod, paidAt, proofUrl } = body;

  // Create risk flag if no proof
  if (!proofUrl) {
    await prisma.riskFlag.create({
      data: {
        targetType: "Order",
        targetId: order.id,
        reason: "증빙 미첨부 오프라인 결제",
        severity: "low",
      },
    });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      paymentMethod,
      paidAt: paidAt ? new Date(paidAt) : new Date(),
      paymentProofUrl: proofUrl,
    },
  });

  // Record commission ledger
  await prisma.commissionLedger.create({
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

  await logAudit({ actorId: user.id, actorRole: user.role, action: "CONFIRM_PAYMENT", targetType: "Order", targetId: order.id, before: { status: order.status }, after: { status: "PAID" } });
  await logTimeline({ projectId: order.projectId, event: "PAYMENT_CONFIRMED", description: `결제 확인됨: ${order.orderNumber}`, actorId: user.id, actorName: user.name });

  await sendNotification({ userId: user.id, type: "payment_complete", title: "결제 확인 완료", body: `${order.project.talent.nameKo}의 주문 결제가 확인되었습니다.`, link: `/dashboard/projects/${order.projectId}` });
  await notifyTalent({ talentId: order.project.talentId, type: "payment_complete", title: "결제가 확인되었습니다", body: `결제가 확인되었습니다. 곧 PR 페이지가 완성됩니다!` });

  return NextResponse.json(updated);
}
