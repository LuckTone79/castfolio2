/**
 * Toss Payments server-side payment confirmation.
 *
 * Flow:
 * 1. Client (pay/[orderNumber]) calls Toss loadTossPayments() → opens payment widget
 * 2. On success, Toss redirects to /pay/[orderNumber]/success?paymentKey=&amount=&orderId=
 * 3. Client POSTs { paymentKey, amount, orderId } to this endpoint
 * 4. This endpoint calls Toss Payments API to confirm
 * 5. If confirmed, updates Order to PAID + creates CommissionLedger
 *
 * Docs: https://docs.tosspayments.com/reference#결제-승인
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logTimeline } from "@/lib/audit";
import { sendNotification } from "@/lib/notify";

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || "";
const TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

export async function POST(request: Request) {
  if (!TOSS_SECRET_KEY) {
    return NextResponse.json({ error: "결제 서비스가 구성되지 않았습니다." }, { status: 503 });
  }

  const { paymentKey, orderId, amount } = await request.json();

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.json({ error: "필수 파라미터가 누락되었습니다." }, { status: 400 });
  }

  // Find the Order by orderNumber (Toss orderId = our orderNumber)
  const order = await prisma.order.findFirst({
    where: { orderNumber: orderId },
    include: { project: { include: { talent: true } }, user: true },
  });

  if (!order) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
  }

  // Idempotency guard
  if (order.status !== "PAYMENT_PENDING") {
    return NextResponse.json({ error: "이미 처리된 주문입니다." }, { status: 409 });
  }

  // Verify amount matches
  if (Number(order.totalAmount) !== Number(amount)) {
    return NextResponse.json({ error: "결제 금액이 주문 금액과 일치하지 않습니다." }, { status: 400 });
  }

  // Call Toss API to confirm payment
  const authHeader = `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString("base64")}`;
  const tossRes = await fetch(TOSS_CONFIRM_URL, {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  if (!tossRes.ok) {
    const err = await tossRes.json().catch(() => ({}));
    console.error("[Toss] Confirm failed:", err);
    return NextResponse.json({ error: err.message || "결제 승인에 실패했습니다." }, { status: 400 });
  }

  const tossData = await tossRes.json();

  // Update order to PAID and create CommissionLedger atomically
  const commissionRate = Number(order.commissionRate ?? 0.15);
  const totalAmount = Number(order.totalAmount);
  const commissionAmount = Math.round(totalAmount * commissionRate);
  const userAmount = totalAmount - commissionAmount;

  try {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id, status: "PAYMENT_PENDING" },
        data: {
          status: "PAID",
          paidAt: new Date(),
          paymentMethod: "ONLINE_CARD",
          // Store Toss payment confirmation data in revisionSnapshot for audit trail
          revisionSnapshot: {
            tossPaymentKey: tossData.paymentKey,
            tossMethod: tossData.method,
            tossApprovedAt: tossData.approvedAt,
            tossStatus: tossData.status,
          },
        },
      }),
      prisma.commissionLedger.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          type: "sale",
          orderAmount: totalAmount,
          commissionRate,
          commissionAmount,
          userAmount,
        },
      }),
    ]);
  } catch {
    return NextResponse.json({ error: "이미 처리된 결제입니다." }, { status: 409 });
  }

  await logTimeline({
    projectId: order.projectId,
    event: "PAYMENT_CONFIRMED",
    description: `온라인 결제 완료 (Toss): ₩${totalAmount.toLocaleString()}`,
    actorName: order.project.talent.nameKo,
  });

  await sendNotification({
    userId: order.userId,
    type: "payment_confirmed",
    title: "결제 확인됨",
    body: `${order.project.talent.nameKo}님의 결제가 완료되었습니다. ₩${totalAmount.toLocaleString()}`,
    link: `/dashboard/orders`,
    emailTo: order.user.email,
  });

  return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
}
