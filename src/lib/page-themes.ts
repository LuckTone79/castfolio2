export type PageThemeLayout = "classic-dark" | "curated-atelier" | "type1-warm" | "type2-skyblue";

/* ─── 디자인 레이아웃 (2종) ─────────────────────────────── */
export type DesignLayoutId = "type1" | "type2";

export interface DesignLayout {
  id: DesignLayoutId;
  name: string;
  nameKo: string;
  desc: string;
  layout: PageThemeLayout;
}

export const DESIGN_LAYOUTS: DesignLayout[] = [
  { id: "type1", name: "Type 1", nameKo: "멀티섹션", desc: "다채로운 배경 전환의 멀티섹션 레이아웃", layout: "type1-warm" },
  { id: "type2", name: "Type 2", nameKo: "슬라이드형", desc: "모바일 친화 카드 슬라이드 레이아웃", layout: "type2-skyblue" },
];

/* ─── 컬러 테마 (10종) ──────────────────────────────────── */
export interface ColorTheme {
  id: string;
  name: string;
  nameKo: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  bg: string;
  bgAlt: string;
  card: string;
  text: string;
  muted: string;
  muted2: string;
  dark: string;
  border: string;
}

export const COLOR_THEMES: ColorTheme[] = [
  // ── 기존 7종 ──
  {
    id: "warm-pink", name: "Rose Pink", nameKo: "로즈 핑크",
    accent: "#C4607E", accentLight: "#E8A3B8", accentDark: "#9E3D5C",
    bg: "#FDF5F0", bgAlt: "#F5EBE4", card: "#FFFFFF",
    text: "#2A1520", muted: "#8A6272", muted2: "#BBA0AE",
    dark: "#3D1E2C", border: "rgba(196,96,126,0.15)",
  },
  {
    id: "sky-blue", name: "Sky Blue", nameKo: "스카이 블루",
    accent: "#5BB8F5", accentLight: "#A0D6FF", accentDark: "#2A7BC8",
    bg: "#F0F5FC", bgAlt: "#E4EDF7", card: "#FFFFFF",
    text: "#1A2A3A", muted: "#5A7A9A", muted2: "#8AABB8",
    dark: "#1A2A3A", border: "rgba(91,184,245,0.2)",
  },
  {
    id: "crimson-red", name: "Crimson Red", nameKo: "크림슨 레드",
    accent: "#E94560", accentLight: "#F5919F", accentDark: "#B82E45",
    bg: "#FFF5F5", bgAlt: "#FFE8E8", card: "#FFFFFF",
    text: "#2E1A1E", muted: "#7A4A55", muted2: "#B08A92",
    dark: "#2E1A1E", border: "rgba(233,69,96,0.15)",
  },
  {
    id: "warm-amber", name: "Warm Amber", nameKo: "웜 앰버",
    accent: "#E8A04C", accentLight: "#F5C88A", accentDark: "#C07A28",
    bg: "#FFF8F0", bgAlt: "#FFEFD8", card: "#FFFFFF",
    text: "#2D2118", muted: "#7A6248", muted2: "#B09878",
    dark: "#2D2118", border: "rgba(232,160,76,0.15)",
  },
  {
    id: "ocean-blue", name: "Ocean Blue", nameKo: "오션 블루",
    accent: "#4A90D9", accentLight: "#8AB8F0", accentDark: "#2B6CB0",
    bg: "#F0F4FF", bgAlt: "#E0EAFC", card: "#FFFFFF",
    text: "#0D1520", muted: "#4A6080", muted2: "#8098B8",
    dark: "#0D1520", border: "rgba(74,144,217,0.15)",
  },
  {
    id: "classic-gold", name: "Classic Gold", nameKo: "클래식 골드",
    accent: "#C8A035", accentLight: "#E8CC7A", accentDark: "#9A7A18",
    bg: "#FEFBF2", bgAlt: "#F8F0D8", card: "#FFFFFF",
    text: "#1C1C10", muted: "#6A6040", muted2: "#A09870",
    dark: "#1C1C10", border: "rgba(200,160,53,0.15)",
  },
  {
    id: "deep-burgundy", name: "Deep Burgundy", nameKo: "딥 버건디",
    accent: "#7A2D50", accentLight: "#B86A8A", accentDark: "#5A1838",
    bg: "#FDF3F6", bgAlt: "#F5E4EA", card: "#FFFFFF",
    text: "#2A0E1C", muted: "#7A4A60", muted2: "#B08898",
    dark: "#2A0E1C", border: "rgba(122,45,80,0.15)",
  },
  // ── 신규 3종 ──
  {
    id: "forest-green", name: "Forest Green", nameKo: "포레스트 그린",
    accent: "#2EAA5E", accentLight: "#7AD4A0", accentDark: "#1A7A3C",
    bg: "#F0FDF5", bgAlt: "#E0F5EA", card: "#FFFFFF",
    text: "#0F2A18", muted: "#3A6A4A", muted2: "#78AA8A",
    dark: "#0F2A18", border: "rgba(46,170,94,0.15)",
  },
  {
    id: "violet-purple", name: "Violet Purple", nameKo: "바이올렛 퍼플",
    accent: "#8E5BAF", accentLight: "#C09ADA", accentDark: "#6A3A8A",
    bg: "#F6F0FD", bgAlt: "#ECE0F8", card: "#FFFFFF",
    text: "#1E0F2E", muted: "#5A3A7A", muted2: "#9878B0",
    dark: "#1E0F2E", border: "rgba(142,91,175,0.15)",
  },
  {
    id: "coral-sunset", name: "Coral Sunset", nameKo: "코랄 선셋",
    accent: "#E87461", accentLight: "#F5A898", accentDark: "#C04E3A",
    bg: "#FFF5F3", bgAlt: "#FFE8E2", card: "#FFFFFF",
    text: "#2E1B15", muted: "#7A4A3A", muted2: "#B08A78",
    dark: "#2E1B15", border: "rgba(232,116,97,0.15)",
  },
];

/* ─── 기존 호환 인터페이스 (PRPageRenderer, dashboard 등에서 사용) ─── */
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

export const DEFAULT_PAGE_THEME_ID = "type1-warm-pink";

export const DEFAULT_PAGE_SECTION_ORDER = [
  "hero",
  "profile",
  "career",
  "portfolio",
  "strength",
  "contact",
  "footer",
] as const;

/* ─── 디자인별 섹션 순서 ─────────────────────────────────── */
export const TYPE1_SECTION_ORDER = ["hero", "strength", "career", "portfolio", "profile", "contact", "footer"] as const;
export const TYPE2_SECTION_ORDER = ["hero", "strength", "career", "portfolio", "profile", "contact", "footer"] as const;

export function getSectionOrderForLayout(layoutId: DesignLayoutId): readonly string[] {
  return layoutId === "type1" ? TYPE1_SECTION_ORDER : TYPE2_SECTION_ORDER;
}

/* ─── 2×10 = 20 테마 옵션 자동 생성 ────────────────────── */
function buildThemeOptions(): PageThemeOption[] {
  return DESIGN_LAYOUTS.flatMap((layout) =>
    COLOR_THEMES.map((color) => ({
      id: `${layout.id}-${color.id}`,
      name: `${layout.name} · ${color.name}`,
      nameKo: `${layout.nameKo} · ${color.nameKo}`,
      desc: `${layout.desc} (${color.nameKo})`,
      color: color.dark,
      accent: color.accent,
      layout: layout.layout,
      background: color.bg,
      surface: color.bgAlt,
      border: color.border,
      text: color.text,
      textMuted: color.muted,
    }))
  );
}

/* ─── 기존 themeId → 신규 themeId 매핑 (하위 호환) ──────── */
const LEGACY_THEME_MAP: Record<string, string> = {
  "warm-pink": "type1-warm-pink",
  "sky-blue": "type2-sky-blue",
  "anchor-clean": "type1-crimson-red",
  "warm-natural": "type1-warm-amber",
  "modern-mono": "type1-ocean-blue",
  "classic-gold": "type1-classic-gold",
  "curated-atelier": "type1-deep-burgundy",
  "fresh-pastel": "type1-violet-purple",
  "bold-dynamic": "type1-coral-sunset",
  "elegant-dark": "type1-ocean-blue",
};

export const PAGE_THEME_OPTIONS: PageThemeOption[] = buildThemeOptions();

export function getPageTheme(themeId?: string): PageThemeOption {
  const id = themeId ?? DEFAULT_PAGE_THEME_ID;
  // 직접 매치
  const direct = PAGE_THEME_OPTIONS.find((t) => t.id === id);
  if (direct) return direct;
  // 레거시 매핑
  const mapped = LEGACY_THEME_MAP[id];
  if (mapped) {
    const legacy = PAGE_THEME_OPTIONS.find((t) => t.id === mapped);
    if (legacy) return legacy;
  }
  // 최종 fallback
  return PAGE_THEME_OPTIONS[0];
}

/* ─── themeId → ColorTheme 추출 ─────────────────────────── */
export function getColorTheme(themeId?: string): ColorTheme {
  const pageTheme = getPageTheme(themeId);
  // themeId format: "type1-warm-pink" → colorId = "warm-pink"
  const parts = pageTheme.id.split("-");
  const colorId = parts.slice(1).join("-"); // "warm-pink", "sky-blue", etc.
  return COLOR_THEMES.find((c) => c.id === colorId) ?? COLOR_THEMES[0];
}

/* ─── themeId → DesignLayoutId 추출 ─────────────────────── */
export function getDesignLayoutId(themeId?: string): DesignLayoutId {
  const pageTheme = getPageTheme(themeId);
  return pageTheme.layout === "type2-skyblue" ? "type2" : "type1";
}
