import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const unread = url.searchParams.get("unread") === "true";
  const count = url.searchParams.get("count") === "true";

  if (count) {
    const c = await prisma.notification.count({ where: { userId: user.id, isRead: false } });
    return NextResponse.json({ count: c });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id, ...(unread ? { isRead: false } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ notifications });
}

export async function PATCH(request: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { markAllRead, ids } = body;

  if (markAllRead) {
    await prisma.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } });
  } else if (ids?.length) {
    await prisma.notification.updateMany({ where: { id: { in: ids }, userId: user.id }, data: { isRead: true } });
  }

  return NextResponse.json({ ok: true });
}
