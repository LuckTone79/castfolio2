import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, logTimeline } from "@/lib/audit";
import { generateOrderNumber } from "@/lib/utils";

export async function GET() {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      project: { include: { talent: { select: { nameKo: true } } } },
    },
  });

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { projectId, totalAmount, paymentMethod, quoteId } = body;

  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const commissionRate = Number(user.commissionRate);
  const total = Number(totalAmount);
  const commissionAmount = total * commissionRate;
  const userAmount = total - commissionAmount;

  const order = await prisma.order.create({
    data: {
      projectId,
      userId: user.id,
      quoteId: quoteId || null,
      orderNumber: generateOrderNumber(),
      status: "DRAFT",
      totalAmount: total,
      commissionRate,
      commissionAmount,
      userAmount,
      paymentMethod: paymentMethod || null,
      pricingSnapshot: body.pricingSnapshot || {},
    },
  });

  await logAudit({ actorId: user.id, actorRole: user.role, action: "CREATE_ORDER", targetType: "Order", targetId: order.id, after: { projectId, totalAmount, orderNumber: order.orderNumber } });
  await logTimeline({ projectId, event: "ORDER_CREATED", description: `주문 ${order.orderNumber} 생성됨`, actorId: user.id, actorName: user.name });

  return NextResponse.json(order, { status: 201 });
}
