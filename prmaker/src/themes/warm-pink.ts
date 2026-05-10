import { ThemeConfig } from "@/types/theme";

/**
 * Type.1 레이아웃 테마 — Warm Pink
 * 원본 참조: https://kokoboppppp2017-svg.github.io/Type.1/
 * 특징: 크림-핑크 배경 + 다크 플럼 대비 섹션 교차 + Featured Video 히어로
 */
export const warmPink: ThemeConfig = {
  id: "warm-pink",
  name: "Warm Pink",
  nameKo: "웜 핑크",
  description: "Featured video hero with alternating dark plum and cream-pink sections",
  descriptionKo: "대표영상 히어로 + 다크 플럼·크림 핑크 교차 레이아웃",
  recommendedFor: "라이브커머스 쇼호스트, 뷰티·패션 전문 진행자",
  colors: {
    primary: "#FDF5F0",
    secondary: "#F5EBE4",
    text: "#2A1520",
    textLight: "#8A6272",
    accent: "#C4607E",
    background: "#FDF5F0",
    backgroundAlt: "#F5EBE4",
    border: "rgba(196,96,126,0.15)",
    buttonBg: "#3D1E2C",
    buttonText: "#F8EEF3",
  },
  fonts: {
    headingKo: "Pretendard",
    headingEn: "Pretendard",
    bodyKo: "Pretendard",
    bodyEn: "Pretendard",
  },
  backgroundStyle: "solid",
  buttonStyle: "rounded",
  animationTone: "moderate",
  colorSchemeSlot: 4,
  maxWidth: "1040px",
  fontSizeBase: "14px",
  layoutVariant: "type1-warm",
};
