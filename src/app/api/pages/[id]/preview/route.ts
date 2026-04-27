import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, logTimeline } from "@/lib/audit";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = await prisma.page.findFirst({
    where: { id: params.id, project: { userId: user.id } },
    include: { project: true },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // DRAFT 또는 PREVIEW 상태에서 미리보기 생성/갱신 허용
  if (!["DRAFT", "PREVIEW"].includes(page.status)) {
    return NextResponse.json({ error: "DRAFT 또는 PREVIEW 상태에서만 미리보기를 갱신할 수 있습니다." }, { status: 400 });
  }

  // draftContent가 없으면 미리보기 생성 불가
  if (!page.draftContent) {
    return NextResponse.json({ error: "저장된 초안 내용이 없습니다. 빌더에서 내용을 입력 후 저장하세요." }, { status: 422 });
  }

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
