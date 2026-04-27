import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, logTimeline } from "@/lib/audit";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const page = await prisma.page.findFirst({
    where: { id: params.id, project: { userId: user.id } },
    include: { project: true },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (page.status !== "DRAFT") return NextResponse.json({ error: "DRAFT 상태에서만 미리보기를 생성할 수 있습니다." }, { status: 400 });

  // Move draftContent to contentKo/En/Cn
  const draft = (page.draftContent as { ko?: object; en?: object; zh?: object }) || {};

  const updated = await prisma.page.update({
    where: { id: params.id },
    data: {
      contentKo: draft.ko || {},
      contentEn: draft.en || {},
      contentCn: draft.zh || {},
      status: "PREVIEW",
    },
  });

  await logAudit({ actorId: user.id, actorRole: user.role, action: "CREATE_PREVIEW", targetType: "Page", targetId: page.id });
  await logTimeline({ projectId: page.projectId, event: "PREVIEW_CREATED", description: "미리보기 생성됨", actorId: user.id, actorName: user.name });

  return NextResponse.json({ ok: true, previewToken: updated.previewToken, status: updated.status });
}
