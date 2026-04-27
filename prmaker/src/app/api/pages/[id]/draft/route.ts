import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Auto-save: update draftContent only. No AuditLog.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const page = await prisma.page.findFirst({
    where: { id: params.id, project: { userId: user.id } },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const { draftContent } = body;

  const updated = await prisma.page.update({
    where: { id: params.id },
    data: { draftContent },
  });

  return NextResponse.json({ ok: true, updatedAt: updated.updatedAt });
}
