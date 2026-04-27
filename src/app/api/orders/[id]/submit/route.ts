import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, logTimeline } from "@/lib/audit";
import { sendNotification, notifyTalent } from "@/lib/notify";

// DRAFT → PAYMENT_PENDING
export async function POST(_: Request, { params }: { params: { id: string } }) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: user.id },
    include: { project: { include: { talent: true } } },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.status !== "DRAFT") {
    return NextResponse.json({ error: "DRAFT 상태의 주문만 결제 대기로 전환할 수 있습니다." }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: "PAYMENT_PENDING" },
  });

  await logAudit({ actorId: user.id, actorRole: user.role, action: "SUBMIT_ORDER", targetType: "Order", targetId: order.id, before: { status: "DRAFT" }, after: { status: "PAYMENT_PENDING" } });
  await logTimeline({ projectId: order.projectId, event: "PAYMENT_PENDING", description: `주문 ${order.orderNumber} 결제 대기 상태로 전환`, actorId: user.id, actorName: user.name });

  const talent = order.project.talent;
  await sendNotification({ userId: user.id, type: "payment_pending", title: "결제 대기 중", body: `${talent.nameKo} 주문 ${order.orderNumber}이 결제 대기 상태입니다.`, link: `/dashboard/orders/${order.id}` });

  await notifyTalent({ talentId: talent.id, type: "payment_pending", title: "결제 요청이 도착했습니다", body: `견적 ${order.orderNumber}에 대한 결제를 완료해주세요.`, link: `/dashboard/orders/${order.id}` });

  return NextResponse.json(updated);
}
