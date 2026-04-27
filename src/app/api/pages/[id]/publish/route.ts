import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, logTimeline } from "@/lib/audit";
import { sendNotification, notifyTalent } from "@/lib/notify";
import { generateQRPng, generateQRSvg } from "@/lib/qr";
import { generateQRCardPdf } from "@/lib/pdf";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = await prisma.page.findFirst({
    where: { id: params.id, project: { userId: user.id } },
    include: { project: { include: { talent: true, orders: { where: { status: { in: ["PAID", "DELIVERED", "SETTLED"] } } } } } },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (page.status !== "PREVIEW") return NextResponse.json({ error: "PREVIEW 상태에서만 배포할 수 있습니다." }, { status: 400 });

  const content = page.contentKo as { hero?: { heroImageId?: string; tagline?: string; position?: string }; profile?: { intro?: string }; contact?: { channels?: unknown[] } };
  const talent = page.project.talent;

  // Publish Gate validation
  const errors: string[] = [];
  if (!content?.hero?.heroImageId) errors.push("대표 사진이 필요합니다");
  if (!content?.hero?.tagline || content.hero.tagline.length < 5) errors.push("한 줄 소개는 5자 이상이어야 합니다");
  if (!content?.hero?.position) errors.push("포지션이 필요합니다");
  if (!talent.nameKo || !talent.nameEn) errors.push("방송인 한글/영문 이름이 필요합니다");
  if (!content?.profile?.intro || content.profile.intro.length < 20) errors.push("자기소개는 20자 이상이어야 합니다");
  if (!content?.contact?.channels || (content.contact.channels as unknown[]).length === 0) errors.push("연락처가 최소 1개 필요합니다");
  if (page.project.orders.length === 0) errors.push("결제 완료된 주문이 필요합니다");

  if (errors.length > 0) {
    return NextResponse.json({ error: "배포 조건 미충족", errors }, { status: 422 });
  }

  // Generate QR codes
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://castfolio.com";
  const pageUrl = `${appUrl}/p/${page.slug}`;

  let qrPngBuffer: Buffer | null = null;
  let pngUrl: string | null = null;
  let svgUrl: string | null = null;
  let pdfUrl: string | null = null;

  try {
    qrPngBuffer = await generateQRPng(pageUrl, { size: 300 });
    const svgContent = await generateQRSvg(pageUrl);
    const pdfBuffer = await generateQRCardPdf({ nameEn: talent.nameEn, url: pageUrl, qrPngBuffer });

    const supabase = createServiceClient();
    const timestamp = Date.now();

    const [pngRes, svgRes, pdfRes] = await Promise.all([
      supabase.storage.from("qr").upload(`${page.slug}/qr-${timestamp}.png`, qrPngBuffer, { contentType: "image/png", upsert: true }),
      supabase.storage.from("qr").upload(`${page.slug}/qr-${timestamp}.svg`, Buffer.from(svgContent), { contentType: "image/svg+xml", upsert: true }),
      supabase.storage.from("qr").upload(`${page.slug}/qr-card-${timestamp}.pdf`, pdfBuffer, { contentType: "application/pdf", upsert: true }),
    ]);

    if (pngRes.data) {
      const { data } = supabase.storage.from("qr").getPublicUrl(pngRes.data.path);
      pngUrl = data.publicUrl;
    }
    if (svgRes.data) {
      const { data } = supabase.storage.from("qr").getPublicUrl(svgRes.data.path);
      svgUrl = data.publicUrl;
    }
    if (pdfRes.data) {
      const { data } = supabase.storage.from("qr").getPublicUrl(pdfRes.data.path);
      pdfUrl = data.publicUrl;
    }

    await prisma.qRAsset.upsert({
      where: { pageId: page.id },
      create: { pageId: page.id, pngUrl, svgUrl, pdfUrl, nameDisplay: talent.nameEn },
      update: { pngUrl, svgUrl, pdfUrl, updatedAt: new Date() },
    });
  } catch (err) {
    console.error("QR generation failed:", err);
  }

  const updated = await prisma.page.update({
    where: { id: page.id },
    data: { status: "PUBLISHED", publishedAt: new Date(), noindex: false },
  });

  await logAudit({ actorId: user.id, actorRole: user.role, action: "PUBLISH_PAGE", targetType: "Page", targetId: page.id });
  await logTimeline({ projectId: page.projectId, event: "PAGE_PUBLISHED", description: `PR 페이지 공개됨: /p/${page.slug}`, actorId: user.id, actorName: user.name });

  await sendNotification({ userId: user.id, type: "delivery_complete", title: "PR 페이지 배포 완료", body: `${talent.nameKo}의 PR 페이지가 배포되었습니다.`, link: `/dashboard/projects/${page.projectId}` });

  await notifyTalent({ talentId: talent.id, type: "delivery_complete", title: "PR 페이지가 완성되었습니다!", body: `${talent.nameKo}님의 PR 페이지가 공개되었습니다. 링크: ${pageUrl}` });

  return NextResponse.json({ ok: true, slug: page.slug, status: updated.status, qrPngUrl: pngUrl });
}
