import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, logTimeline } from "@/lib/audit";

// PUBLISHED → INACTIVE (비공개 처리)
export async function POST(_: Request, { params }: { params: { id: string } }) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = await prisma.page.findFirst({
    where: { id: params.id, project: { userId: user.id } },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (page.status !== "PUBLISHED") {
    return NextResponse.json({ error: "PUBLISHED 상태에서만 비공개 처리할 수 있습니다." }, { status: 400 });
  }

  const updated = await prisma.page.update({
    where: { id: page.id },
    data: { status: "INACTIVE", noindex: true },
  });

  await logAudit({ actorId: user.id, actorRole: user.role, action: "UNPUBLISH_PAGE", targetType: "Page", targetId: page.id, before: { status: "PUBLISHED" }, after: { status: "INACTIVE" } });
  await logTimeline({ projectId: page.projectId, event: "PAGE_UNPUBLISHED", description: "PR 페이지 비공개 처리됨", actorId: user.id, actorName: user.name });

  return NextResponse.json({ ok: true, status: updated.status });
}
