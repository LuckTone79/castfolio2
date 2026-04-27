import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, logTimeline } from "@/lib/audit";
import { notifyTalent } from "@/lib/notify";

// PAID → DELIVERED
export async function POST(_: Request, { params }: { params: { id: string } }) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: user.id },
    include: { project: { include: { talent: true, page: true } } },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.status !== "PAID") {
    return NextResponse.json({ error: "PAID 상태의 주문만 납품 완료 처리할 수 있습니다." }, { status: 400 });
  }

  const now = new Date();
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: "DELIVERED", deliveredAt: now },
  });

  // 프로젝트 상태 업데이트
  await prisma.project.update({
    where: { id: order.projectId },
    data: { status: "DELIVERED" },
  });

  await logAudit({ actorId: user.id, actorRole: user.role, action: "DELIVER_ORDER", targetType: "Order", targetId: order.id, before: { status: "PAID" }, after: { status: "DELIVERED" } });
  await logTimeline({ projectId: order.projectId, event: "DELIVERED", description: `주문 ${order.orderNumber} 납품 완료`, actorId: user.id, actorName: user.name });

  // T-04 납품 완료 링크 발송
  const talent = order.project.talent;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://castfolio.com";
  const page = order.project.page;
  const deliveredLink = page ? `${appUrl}/p/${page.slug}` : undefined;

  await notifyTalent({
    talentId: talent.id,
    type: "delivered",
    title: "PR 페이지가 납품되었습니다!",
    body: `${talent.nameKo}님의 PR 페이지가 완성되어 납품되었습니다.${deliveredLink ? ` 공개 링크: ${deliveredLink}` : ""}`,
    link: deliveredLink,
  });

  return NextResponse.json(updated);
}
