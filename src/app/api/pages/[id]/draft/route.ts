import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Auto-save: update draftContent only. No AuditLog.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = await prisma.page.findFirst({
    where: { id: params.id, project: { userId: user.id } },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const { draftContent, theme, accentColor, sectionOrder, disabledSections } = body;
  const data: Record<string, unknown> = { draftContent };
  if (theme) data.theme = theme;
  if (accentColor !== undefined) data.accentColor = accentColor;
  if (Array.isArray(sectionOrder)) data.sectionOrder = sectionOrder;
  if (Array.isArray(disabledSections)) data.disabledSections = disabledSections;

  const updated = await prisma.page.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ ok: true, updatedAt: updated.updatedAt });
}
