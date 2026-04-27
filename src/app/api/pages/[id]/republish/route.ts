import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, logTimeline } from "@/lib/audit";

// INACTIVE → PUBLISHED (재공개)
export async function POST(_: Request, { params }: { params: { id: string } }) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = await prisma.page.findFirst({
    where: { id: params.id, project: { userId: user.id } },
    include: {
      project: {
        include: {
          orders: {
            where: { status: { notIn: ["REFUNDED", "CANCELLED"] } },
            take: 1,
          },
        },
      },
    },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (page.status !== "INACTIVE") {
    return NextResponse.json({ error: "INACTIVE 상태에서만 재공개할 수 있습니다." }, { status: 400 });
  }
  if (page.project.orders.length === 0) {
    return NextResponse.json({ error: "유효한 주문이 없어 재공개할 수 없습니다." }, { status: 422 });
  }

  const updated = await prisma.page.update({
    where: { id: page.id },
    data: { status: "PUBLISHED", noindex: false },
  });

  await logAudit({ actorId: user.id, actorRole: user.role, action: "REPUBLISH_PAGE", targetType: "Page", targetId: page.id, before: { status: "INACTIVE" }, after: { status: "PUBLISHED" } });
  await logTimeline({ projectId: page.projectId, event: "PAGE_REPUBLISHED", description: "PR 페이지 재공개됨", actorId: user.id, actorName: user.name });

  return NextResponse.json({ ok: true, status: updated.status, slug: page.slug });
}
