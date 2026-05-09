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
  // Explicitly allowed MIME types only — no SVG (XSS risk), no GIF, no HEIC
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  // Guard against MIME-type spoofing: check both type string and extension
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "지원하지 않는 파일 형식입니다. JPG, PNG, WebP만 업로드 가능합니다." };
  }
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: "파일 확장자가 올바르지 않습니다. JPG, PNG, WebP만 업로드 가능합니다." };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: `파일 크기가 너무 큽니다. 최대 ${MAX_SIZE / 1024 / 1024}MB까지 업로드 가능합니다.` };
  }
  if (file.size === 0) {
    return { valid: false, error: "빈 파일은 업로드할 수 없습니다." };
  }
  return { valid: true };
}
