import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  // 6자리 랜덤 → 충돌 확률 대폭 감소. DB unique 제약과 함께 사용
  const rand = Math.floor(Math.random() * 900000) + 100000;
  return `CF-${date}-${rand}`;
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function getVideoEmbedUrl(url: string, platform: "youtube" | "navertv"): string {
  if (platform === "youtube") {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  if (platform === "navertv") {
    const match = url.match(/tv\.naver\.com\/v\/(\d+)/);
    if (match) return `https://tv.naver.com/embed/${match[1]}`;
  }
  return url;
}

export function detectVideoPlatform(url: string): "youtube" | "navertv" | null {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("tv.naver.com")) return "navertv";
  return null;
}

/** Hex → rgba 변환. 레이아웃 컴포넌트에서 동적 컬러 투명도 적용에 사용 */
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// 서버 전용: IP 익명화 (SHA-256). 클라이언트에서 호출 금지.
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "";
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createHash } = require("crypto") as typeof import("crypto");
  return createHash("sha256").update(ip + salt).digest("hex").slice(0, 16);
}
