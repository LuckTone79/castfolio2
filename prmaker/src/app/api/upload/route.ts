import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processImage, validateImageFile } from "@/lib/image";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const projectId = formData.get("projectId") as string;
  const mediaType = (formData.get("mediaType") as string) || "OTHER";

  if (!file) return NextResponse.json({ error: "파일이 필요합니다" }, { status: 400 });

  const validation = validateImageFile(file);
  if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: 400 });

  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const processed = await processImage(buffer);

  const supabase = createServiceClient();
  const timestamp = Date.now();
  const basePath = `projects/${projectId}`;

  const [origRes, optRes, thumbRes] = await Promise.all([
    supabase.storage.from("media").upload(`${basePath}/orig-${timestamp}.${file.name.split(".").pop()}`, buffer, { contentType: file.type, upsert: false }),
    supabase.storage.from("media").upload(`${basePath}/opt-${timestamp}.webp`, processed.optimizedBuffer, { contentType: "image/webp", upsert: false }),
    supabase.storage.from("media").upload(`${basePath}/thumb-${timestamp}.webp`, processed.thumbnailBuffer, { contentType: "image/webp", upsert: false }),
  ]);

  const getUrl = (path: string) => supabase.storage.from("media").getPublicUrl(path).data.publicUrl;

  const asset = await prisma.mediaAsset.create({
    data: {
      projectId,
      type: mediaType as "HERO_PHOTO" | "PROFILE_PHOTO" | "PORTFOLIO_PHOTO" | "AUDIO_SAMPLE" | "OTHER",
      originalUrl: origRes.data ? getUrl(origRes.data.path) : "",
      optimizedUrl: optRes.data ? getUrl(optRes.data.path) : null,
      thumbnailUrl: thumbRes.data ? getUrl(thumbRes.data.path) : null,
      fileName: file.name,
      fileSize: processed.fileSize,
      mimeType: processed.mimeType,
      width: processed.width,
      height: processed.height,
      uploadedBy: user.id,
    },
  });

  return NextResponse.json(asset, { status: 201 });
}
