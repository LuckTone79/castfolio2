import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const talent = await prisma.talent.findFirst({
    where: { id: params.id, userId: user.id },
    include: { projects: { orderBy: { updatedAt: "desc" }, include: { page: true } }, intakeForms: true },
  });

  if (!talent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(talent);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const talent = await prisma.talent.findFirst({ where: { id: params.id, userId: user.id } });
  if (!talent) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const updated = await prisma.talent.update({
    where: { id: params.id },
    data: {
      nameKo: body.nameKo, nameEn: body.nameEn, nameCn: body.nameCn,
      position: body.position, email: body.email, phone: body.phone, kakaoId: body.kakaoId,
      status: body.status,
    },
  });

  await logAudit({
    actorId: user.id, actorRole: user.role,
    action: "UPDATE_TALENT", targetType: "Talent", targetId: talent.id,
    before: talent, after: updated,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const talent = await prisma.talent.findFirst({ where: { id: params.id, userId: user.id } });
  if (!talent) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.talent.update({ where: { id: params.id }, data: { status: "DELETED" } });

  await logAudit({
    actorId: user.id, actorRole: user.role,
    action: "DELETE_TALENT", targetType: "Talent", targetId: talent.id,
  });

  return NextResponse.json({ ok: true });
}
