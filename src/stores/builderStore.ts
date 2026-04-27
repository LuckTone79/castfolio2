import { create } from "zustand";
import { PageContent, DraftContent } from "@/types/page-content";

export const EMPTY_CONTENT: PageContent = {
  hero: {
    tagline: "",
    position: "",
    heroImageId: "",
    ctaPrimary: { label: "포트폴리오 보기", action: "portfolio" },
    ctaSecondary: { label: "연락하기", action: "contact" },
  },
  profile: { intro: "", profileImageId: "", infoItems: [], strengths: [] },
  career: { items: [] },
  portfolio: { videos: [], photos: [], audioSamples: [] },
  strength: { cards: [] },
  contact: { channels: [] },
};

const DEFAULT_SECTION_ORDER = ["hero", "profile", "career", "portfolio", "strength", "contact", "footer"];

export type SaveState = "saved" | "saving" | "unsaved" | "error";
export type ActiveLocale = "ko" | "en" | "zh";
export type PreviewMode = "desktop" | "mobile";
export type ActiveSection = "hero" | "profile" | "career" | "portfolio" | "strength" | "contact";

interface BuilderStore {
  // 페이지 메타
  pageId: string | null;
  projectId: string | null;
  talentNameKo: string;
  talentNameEn: string;

  // 디자인
  theme: string;
  accentColor: string;

  // 편집 상태
  activeLocale: ActiveLocale;
  activeSection: ActiveSection;
  previewMode: PreviewMode;

  // 콘텐츠
  draftContent: DraftContent;

  // 섹션 관리
  sectionOrder: string[];
  disabledSections: string[];

  // 저장 상태
  saveState: SaveState;

  // publish 에러
  publishErrors: string[];

  // 액션
  init: (data: {
    pageId: string;
    projectId: string;
    talentNameKo: string;
    talentNameEn: string;
    theme: string;
    accentColor: string;
    draftContent: DraftContent | null;
    sectionOrder: string[];
    disabledSections: string[];
  }) => void;

  setTheme: (theme: string) => void;
  setAccentColor: (color: string) => void;
  setActiveLocale: (locale: ActiveLocale) => void;
  setActiveSection: (section: ActiveSection) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setSaveState: (state: SaveState) => void;
  setPublishErrors: (errors: string[]) => void;

  updateSection: <K extends keyof PageContent>(section: K, data: Partial<PageContent[K]>) => void;
  setSectionOrder: (order: string[]) => void;
  toggleSection: (sectionKey: string) => void;
}

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  pageId: null,
  projectId: null,
  talentNameKo: "방송인",
  talentNameEn: "Talent",
  theme: "anchor-clean",
  accentColor: "",
  activeLocale: "ko",
  activeSection: "hero",
  previewMode: "desktop",
  draftContent: {
    ko: { ...EMPTY_CONTENT },
    en: { ...EMPTY_CONTENT },
    zh: { ...EMPTY_CONTENT },
  },
  sectionOrder: DEFAULT_SECTION_ORDER,
  disabledSections: [],
  saveState: "saved",
  publishErrors: [],

  init: ({ pageId, projectId, talentNameKo, talentNameEn, theme, accentColor, draftContent, sectionOrder, disabledSections }) => {
    set({
      pageId,
      projectId,
      talentNameKo,
      talentNameEn,
      theme,
      accentColor,
      draftContent: draftContent ?? {
        ko: { ...EMPTY_CONTENT },
        en: { ...EMPTY_CONTENT },
        zh: { ...EMPTY_CONTENT },
      },
      sectionOrder: sectionOrder.length > 0 ? sectionOrder : DEFAULT_SECTION_ORDER,
      disabledSections,
      saveState: "saved",
    });
  },

  setTheme: (theme) => set({ theme, saveState: "unsaved" }),
  setAccentColor: (accentColor) => set({ accentColor, saveState: "unsaved" }),
  setActiveLocale: (activeLocale) => set({ activeLocale }),
  setActiveSection: (activeSection) => set({ activeSection }),
  setPreviewMode: (previewMode) => set({ previewMode }),
  setSaveState: (saveState) => set({ saveState }),
  setPublishErrors: (publishErrors) => set({ publishErrors }),

  updateSection: (section, data) => {
    const { activeLocale, draftContent } = get();
    const current = draftContent[activeLocale];
    set({
      draftContent: {
        ...draftContent,
        [activeLocale]: {
          ...current,
          [section]: { ...(current[section] as object), ...data },
        },
      },
      saveState: "unsaved",
    });
  },

  setSectionOrder: (sectionOrder) => set({ sectionOrder, saveState: "unsaved" }),

  toggleSection: (sectionKey) => {
    const { disabledSections } = get();
    const isDisabled = disabledSections.includes(sectionKey);
    set({
      disabledSections: isDisabled
        ? disabledSections.filter(s => s !== sectionKey)
        : [...disabledSections, sectionKey],
      saveState: "unsaved",
    });
  },
}));
