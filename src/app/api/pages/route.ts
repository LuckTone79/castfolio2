import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { randomBytes } from "crypto";

function generateSlugSuffix(size: number = 6): string {
  return randomBytes(size).toString("base64url").slice(0, size);
}

export async function POST(request: Request) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectId, theme, accentColor } = body;

  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Return existing page if already created
  const existing = await prisma.page.findUnique({ where: { projectId } });
  if (existing) return NextResponse.json(existing);

  const talent = await prisma.talent.findUnique({ where: { id: project.talentId } });
  const baseName = (talent?.nameEn || "talent").toLowerCase().replace(/\s+/g, "-");

  // Retry up to 3 times on slug collision
  let page;
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = baseName + "-" + generateSlugSuffix(6);
    try {
      page = await prisma.page.create({
        data: {
          projectId,
          slug,
          theme: theme || "anchor-clean",
          accentColor,
          status: "DRAFT",
          contentKo: {},
          contentEn: {},
          contentCn: {},
        },
      });
      break;
    } catch (e: unknown) {
      const isUnique = e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002";
      if (!isUnique || attempt === 2) throw e;
    }
  }

  if (!page) return NextResponse.json({ error: "Failed to create page" }, { status: 500 });

  await logAudit({ actorId: user.id, actorRole: user.role, action: "CREATE_PAGE", targetType: "Page", targetId: page.id, after: { projectId, theme } });

  return NextResponse.json(page, { status: 201 });
}
