import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function PATCH(request: Request) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // 허용된 필드만 명시적으로 추출 (undefined/null 보호)
  const data: { name?: string; phone?: string; company?: string } = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.phone === "string") data.phone = body.phone.trim() || null as unknown as string;
  if (typeof body.company === "string") data.company = body.company.trim() || null as unknown as string;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "변경할 항목이 없습니다." }, { status: 400 });
  }

  const before = { name: user.name, phone: user.phone, company: user.company };
  await prisma.user.update({ where: { id: user.id }, data });
  await logAudit({
    actorId: user.id,
    actorRole: user.role,
    action: "UPDATE_PROFILE",
    targetType: "User",
    targetId: user.id,
    before,
    after: data,
  });

  return NextResponse.json({ ok: true });
}
