import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const talents = await prisma.talent.findMany({
    where: { userId: user.id, status: { not: "DELETED" } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ talents });
}

export async function POST(request: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { nameKo, nameEn, nameCn, position, email, phone, kakaoId } = body;

  if (!nameKo || !nameEn || !position) {
    return NextResponse.json({ error: "이름(한글), 이름(영문), 포지션은 필수입니다." }, { status: 400 });
  }

  const talent = await prisma.talent.create({
    data: { userId: user.id, nameKo, nameEn, nameCn, position, email, phone, kakaoId },
  });

  await logAudit({
    actorId: user.id, actorRole: user.role,
    action: "CREATE_TALENT", targetType: "Talent", targetId: talent.id,
    after: { nameKo, nameEn, position },
  });

  return NextResponse.json(talent, { status: 201 });
}
