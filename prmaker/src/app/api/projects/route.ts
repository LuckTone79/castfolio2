import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, logTimeline } from "@/lib/audit";

export async function GET() {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      talent: { select: { nameKo: true, nameEn: true } },
      page: { select: { status: true, slug: true, previewToken: true } },
      orders: { select: { status: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, talentId, purpose, intakeMode } = body;

  if (!name || !talentId) {
    return NextResponse.json({ error: "프로젝트명과 방송인은 필수입니다." }, { status: 400 });
  }

  const talent = await prisma.talent.findFirst({ where: { id: talentId, userId: user.id } });
  if (!talent) return NextResponse.json({ error: "방송인을 찾을 수 없습니다." }, { status: 404 });

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      talentId,
      name,
      purpose,
      intakeMode: intakeMode || "SELF_SUBMISSION",
    },
  });

  await logAudit({ actorId: user.id, actorRole: user.role, action: "CREATE_PROJECT", targetType: "Project", targetId: project.id, after: { name, talentId } });
  await logTimeline({ projectId: project.id, event: "PROJECT_CREATED", description: `프로젝트 "${name}" 생성됨`, actorId: user.id, actorName: user.name });

  return NextResponse.json(project, { status: 201 });
}
