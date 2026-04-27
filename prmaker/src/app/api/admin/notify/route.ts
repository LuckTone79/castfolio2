import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notify";

export async function POST(request: Request) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { targetType, userId, title, body: notifBody, type = "admin_notice" } = body;

  if (!title || !notifBody) {
    return NextResponse.json({ error: "title과 body는 필수입니다." }, { status: 400 });
  }

  if (targetType === "specific") {
    if (!userId) return NextResponse.json({ error: "userId가 필요합니다." }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    await sendNotification({ userId, type, title, body: notifBody, emailTo: user.email });
    return NextResponse.json({ ok: true, sent: 1 });
  }

  // Send to all active users
  const users = await prisma.user.findMany({
    where: { role: "USER", status: "ACTIVE" },
    select: { id: true, email: true },
  });

  await Promise.all(
    users.map(u => sendNotification({ userId: u.id, type, title, body: notifBody, emailTo: u.email }))
  );

  return NextResponse.json({ ok: true, sent: users.length });
}
