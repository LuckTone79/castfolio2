export const MAX_IMAGE_SIZE_MB = 5;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function sanitizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function validateUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateVideoUrl(value: string) {
  if (!value) return true;
  if (!validateUrl(value)) return false;
  return /youtube\.com|youtu\.be|vimeo\.com|\.mp4(\?|$)/i.test(value);
}

export function validateImageFile(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "JPG, PNG, WebP 형식의 이미지만 업로드할 수 있습니다.",
    };
  }

  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return {
      valid: false,
      error: `이미지 용량이 너무 큽니다. ${MAX_IMAGE_SIZE_MB}MB 이하 이미지를 업로드해주세요.`,
    };
  }

  return { valid: true };
}
