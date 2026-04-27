import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQRDataUrl } from "@/lib/qr";

export async function GET(request: NextRequest) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const pageId = url.searchParams.get("pageId");

  if (!pageId) return NextResponse.json({ error: "pageId required" }, { status: 400 });

  const page = await prisma.page.findFirst({
    where: { id: pageId, project: { userId: user.id } },
    include: { qrAssets: { orderBy: { updatedAt: "desc" }, take: 1 } },
  });

  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (page.qrAssets.length > 0) {
    return NextResponse.json(page.qrAssets[0]);
  }

  // Generate preview QR (low quality with SAMPLE watermark hint)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://castfolio.com";
  const previewUrl = `${appUrl}/preview/${page.previewToken}`;
  const dataUrl = await generateQRDataUrl(previewUrl);

  return NextResponse.json({ dataUrl, isSample: true });
}
