import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, logTimeline } from "@/lib/audit";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      talent: true,
      page: true,
      intakeForms: { include: { submissions: { orderBy: { createdAt: "desc" }, take: 1 } } },
      quotes: { orderBy: { createdAt: "desc" }, take: 3 },
      orders: { orderBy: { createdAt: "desc" }, take: 3 },
      timeline: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findFirst({ where: { id: params.id, userId: user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const updated = await prisma.project.update({
    where: { id: params.id },
    data: {
      name: body.name,
      purpose: body.purpose,
      status: body.status,
      intakeMode: body.intakeMode,
      sourceChannel: body.sourceChannel,
    },
  });

  await logAudit({ actorId: user.id, actorRole: user.role, action: "UPDATE_PROJECT", targetType: "Project", targetId: project.id, before: project, after: updated });
  await logTimeline({ projectId: project.id, event: "PROJECT_UPDATED", description: "프로젝트 정보 수정됨", actorId: user.id, actorName: user.name });

  return NextResponse.json(updated);
}
