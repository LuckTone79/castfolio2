// Image processing utilities using Sharp
// Note: Sharp is a server-side only module

export interface ImageProcessResult {
  originalBuffer: Buffer;
  optimizedBuffer: Buffer;
  thumbnailBuffer: Buffer;
  width: number;
  height: number;
  mimeType: string;
  fileSize: number;
}

export async function processImage(buffer: Buffer): Promise<ImageProcessResult> {
  const sharp = (await import("sharp")).default;

  const metadata = await sharp(buffer).metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;

  // Optimize: resize if too large, convert to WebP
  const optimized = await sharp(buffer)
    .resize(1200, 1600, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  // Thumbnail
  const thumbnail = await sharp(buffer)
    .resize(400, 400, { fit: "cover" })
    .webp({ quality: 75 })
    .toBuffer();

  return {
    originalBuffer: buffer,
    optimizedBuffer: optimized,
    thumbnailBuffer: thumbnail,
    width,
    height,
    mimeType: "image/webp",
    fileSize: optimized.length,
  };
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "이미지 파일만 업로드 가능합니다 (jpg, jpeg, png, webp)" };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: "파일 크기는 10MB 이하여야 합니다" };
  }
  return { valid: true };
}
