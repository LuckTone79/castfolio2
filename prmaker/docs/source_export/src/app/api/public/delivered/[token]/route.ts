import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { token: string } }) {
  if (!params.token || params.token.length < 8) {
    return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 400 });
  }

  const page = await prisma.page.findUnique({
    where: { previewToken: params.token },
    include: {
      project: {
        include: {
          talent: { select: { nameKo: true, nameEn: true } },
          user: { select: { name: true, email: true, phone: true } },
          orders: {
            where: { status: { in: ["DELIVERED", "SETTLED"] } },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      qrAssets: { take: 1 },
    },
  });

  // 페이지 존재 여부 + PUBLISHED 상태 검증
  if (!page || page.status !== "PUBLISHED") {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  // 납품 완료 주문 필수 검증 (DELIVERED/SETTLED 주문 없으면 접근 불가)
  const order = page.project.orders[0];
  if (!order) {
    return NextResponse.json({ error: "NOT_DELIVERED" }, { status: 403 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://castfolio.com";
  const qr = page.qrAssets[0];

  return NextResponse.json({
    talent: page.project.talent,
    agent: page.project.user,
    pageUrl: `${appUrl}/p/${page.slug}`,
    slug: page.slug,
    qr: qr ? {
      pngUrl: qr.pngUrl,
      svgUrl: qr.svgUrl,
      pdfUrl: qr.pdfUrl,
    } : null,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      deliveredAt: order.deliveredAt,
    },
  });
}
