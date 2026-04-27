import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  await requireAdmin().catch(() => {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  });

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const action = url.searchParams.get("action");
  const actorId = url.searchParams.get("actorId");

  const where = {
    ...(action ? { action } : {}),
    ...(actorId ? { actorId } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      include: { actor: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, page, limit });
}
