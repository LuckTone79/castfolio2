export type PageThemeLayout = "classic-dark" | "curated-atelier";

export interface PageThemeOption {
  id: string;
  name: string;
  nameKo: string;
  desc: string;
  color: string;
  accent: string;
  layout: PageThemeLayout;
  background: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
}

export const DEFAULT_PAGE_THEME_ID = "anchor-clean";

export const DEFAULT_PAGE_SECTION_ORDER = [
  "hero",
  "profile",
  "career",
  "portfolio",
  "strength",
  "contact",
  "footer",
] as const;

export const PAGE_THEME_OPTIONS: PageThemeOption[] = [
  {
    id: "anchor-clean",
    name: "Anchor Clean",
    nameKo: "앵커 클린",
    desc: "깔끔한 뉴스 앵커 스타일",
    color: "#1a1a2e",
    accent: "#e94560",
    layout: "classic-dark",
    background: "#030712",
    surface: "#111827",
    border: "#1f2937",
    text: "#ffffff",
    textMuted: "#9ca3af",
  },
  {
    id: "warm-natural",
    name: "Warm Natural",
    nameKo: "웜 내추럴",
    desc: "따뜻한 내추럴 톤",
    color: "#2d2d2d",
    accent: "#f4a261",
    layout: "classic-dark",
    background: "#030712",
    surface: "#111827",
    border: "#1f2937",
    text: "#ffffff",
    textMuted: "#d1d5db",
  },
  {
    id: "modern-mono",
    name: "Modern Mono",
    nameKo: "모던 모노",
    desc: "모던 모노톤 미니멀",
    color: "#0d1117",
    accent: "#58a6ff",
    layout: "classic-dark",
    background: "#030712",
    surface: "#111827",
    border: "#1f2937",
    text: "#ffffff",
    textMuted: "#cbd5e1",
  },
  {
    id: "classic-gold",
    name: "Classic Gold",
    nameKo: "클래식 골드",
    desc: "클래식 골드 포멀",
    color: "#1c1c1c",
    accent: "#ffd700",
    layout: "classic-dark",
    background: "#030712",
    surface: "#111827",
    border: "#1f2937",
    text: "#ffffff",
    textMuted: "#d1d5db",
  },
  {
    id: "fresh-pastel",
    name: "Fresh Pastel",
    nameKo: "프레시 파스텔",
    desc: "프레시 파스텔 톤",
    color: "#1e1e2e",
    accent: "#cba6f7",
    layout: "classic-dark",
    background: "#030712",
    surface: "#111827",
    border: "#1f2937",
    text: "#ffffff",
    textMuted: "#d1d5db",
  },
  {
    id: "bold-dynamic",
    name: "Bold Dynamic",
    nameKo: "볼드 다이내믹",
    desc: "볼드 다이내믹 액티브",
    color: "#0f0f0f",
    accent: "#ff6b6b",
    layout: "classic-dark",
    background: "#030712",
    surface: "#111827",
    border: "#1f2937",
    text: "#ffffff",
    textMuted: "#d1d5db",
  },
  {
    id: "elegant-dark",
    name: "Elegant Dark",
    nameKo: "엘레건트 다크",
    desc: "엘레건트 다크 무드",
    color: "#0a0a0a",
    accent: "#c0c0c0",
    layout: "classic-dark",
    background: "#030712",
    surface: "#111827",
    border: "#1f2937",
    text: "#ffffff",
    textMuted: "#d1d5db",
  },
  {
    id: "curated-atelier",
    name: "Curated Atelier",
    nameKo: "큐레이티드 아틀리에",
    desc: "웜 크림 톤의 에디토리얼 럭셔리 레이아웃",
    color: "#fdf9f4",
    accent: "#460609",
    layout: "curated-atelier",
    background: "#fdf9f4",
    surface: "#f7f3ee",
    border: "#dac1bf",
    text: "#1c1c19",
    textMuted: "#554241",
  },
];

export function getPageTheme(themeId?: string): PageThemeOption {
  return PAGE_THEME_OPTIONS.find((theme) => theme.id === themeId) ?? PAGE_THEME_OPTIONS[0];
}
