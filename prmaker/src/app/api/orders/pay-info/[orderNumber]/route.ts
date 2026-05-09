/**
 * Public endpoint: Returns minimal order info for the payment page.
 * No auth required — accessed by talent (customer) via a link sent by partner.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { orderNumber: string } }) {
  const order = await prisma.order.findFirst({
    where: { orderNumber: params.orderNumber },
    include: {
      project: { include: { talent: true } },
      user: { select: { name: true } },
      quote: { include: { lineItems: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
  }

  // Build description from line items or default
  const description = order.quote?.lineItems
    ?.map((li) => li.description)
    .filter(Boolean)
    .join(", ") || "PR 홈페이지 제작";

  return NextResponse.json({
    orderNumber: order.orderNumber,
    totalAmount: Number(order.totalAmount),
    talentName: order.project.talent.nameKo,
    partnerName: order.user.name || "담당 제작자",
    description,
    status: order.status,
  });
}
