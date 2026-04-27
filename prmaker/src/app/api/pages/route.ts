import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { randomBytes } from "crypto";

function generateSlugSuffix(size: number = 6): string {
  return randomBytes(size).toString("base64url").slice(0, size);
}

export async function POST(request: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { projectId, theme, accentColor } = body;

  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check if page already exists
  const existing = await prisma.page.findUnique({ where: { projectId } });
  if (existing) return NextResponse.json(existing);

  const talent = await prisma.talent.findUnique({ where: { id: project.talentId } });
  const baseSlug = (talent?.nameEn || "talent").toLowerCase().replace(/\s+/g, "-") + "-" + generateSlugSuffix(6);

  const page = await prisma.page.create({
    data: {
      projectId,
      slug: baseSlug,
      theme: theme || "anchor-clean",
      accentColor,
      status: "DRAFT",
      contentKo: {},
      contentEn: {},
      contentCn: {},
    },
  });

  await logAudit({ actorId: user.id, actorRole: user.role, action: "CREATE_PAGE", targetType: "Page", targetId: page.id, after: { projectId, theme } });

  return NextResponse.json(page, { status: 201 });
}
