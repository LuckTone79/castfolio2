import { z } from "zod";

export const MAX_IMAGE_SIZE_MB = 5;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function sanitizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function validateUrl(value: string) {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function validateVideoUrl(value: string) {
  if (!value.trim()) return true;
  if (!validateUrl(value)) return false;
  return /(youtube\.com|youtu\.be|vimeo\.com|\.mp4($|\?))/i.test(value);
}

export function validateImageFile(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "이미지 형식이 올바르지 않습니다. JPG, PNG, WebP 파일만 업로드할 수 있습니다.",
    };
  }

  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return {
      valid: false,
      error: `이미지 용량이 너무 큽니다. ${MAX_IMAGE_SIZE_MB}MB 이하의 JPG, PNG, WebP 이미지를 업로드해주세요.`,
    };
  }

  return { valid: true };
}

// ─── Public (unauthenticated, token-gated) route payloads ───────────────
// These validate the raw client input for /api/public/* routes. Note that
// `pageContent` is intentionally not validated here: payloadToPageContent()
// in lib/intake.ts fully recomputes it server-side from basic/about/career/
// strengths/contact, so client-submitted pageContent is discarded regardless.

export const reviewActionSchema = z.object({
  action: z.enum(["APPROVE", "REVISION"]),
  revisionNote: z.string().trim().max(2000).optional(),
});

export const intakeSubmissionSchema = z.object({
  basic: z.object({
    nameKo: z.string().trim().max(50),
    nameEn: z.string().trim().max(50),
    position: z.string().trim().max(100),
    tagline: z.string().trim().max(200),
    heroPhotoUrl: z.string().trim().max(2000),
  }),
  about: z.object({
    bio: z.string().trim().max(5000),
    profilePhotoUrl: z.string().trim().max(2000),
    birthYear: z.string().trim().max(10),
    height: z.string().trim().max(10),
    education: z.string().trim().max(200),
  }),
  career: z
    .array(
      z.object({
        id: z.string().max(100),
        period: z.string().max(100),
        title: z.string().max(200),
        description: z.string().max(2000),
        thumbnail: z.string().max(2000).optional(),
      }),
    )
    .max(50),
  portfolio: z
    .array(
      z.object({
        id: z.string().max(100),
        type: z.enum(["image", "video"]),
        title: z.string().max(200),
        url: z.string().max(2000),
        thumbnail: z.string().max(2000).optional(),
        description: z.string().max(2000).optional(),
      }),
    )
    .max(100),
  strengths: z
    .array(
      z.object({
        id: z.string().max(100),
        title: z.string().max(200),
        description: z.string().max(2000),
        icon: z.string().max(50).optional(),
      }),
    )
    .max(20),
  contact: z.object({
    email: z.string().trim().max(200),
    phone: z.string().trim().max(50),
    kakaoOpenChat: z.string().trim().max(500),
    instagram: z.string().trim().max(500),
    youtube: z.string().trim().max(500),
    tiktok: z.string().trim().max(500),
    blog: z.string().trim().max(500),
  }),
});
