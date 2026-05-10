import { ThemeConfig } from "@/types/theme";

/**
 * Type.2 레이아웃 테마 — Sky Blue
 * 원본 참조: https://kokoboppppp2017-svg.github.io/Type.2/
 * 특징: 아이스 블루 단색 배경 + 이미지 슬라이드 히어로 + 탭 영상 + 플립 카드
 */
export const skyBlue: ThemeConfig = {
  id: "sky-blue",
  name: "Sky Blue",
  nameKo: "스카이 블루",
  description: "Ice-blue slideshow hero with tabbed video and flip-card certifications",
  descriptionKo: "슬라이드 히어로 + 탭 영상 + 플립 카드 자격증 레이아웃",
  recommendedFor: "쇼호스트, 아나운서, 프리랜서 진행자",
  colors: {
    primary: "#F0F5FC",
    secondary: "#E4EDF7",
    text: "#1A2A3A",
    textLight: "#5A7A9A",
    accent: "#5BB8F5",
    background: "#F0F5FC",
    backgroundAlt: "#FFFFFF",
    border: "rgba(91,184,245,0.2)",
    buttonBg: "#1A2A3A",
    buttonText: "#FFFFFF",
  },
  fonts: {
    headingKo: "나눔명조",
    headingEn: "Georgia",
    bodyKo: "나눔고딕",
    bodyEn: "system-ui",
  },
  backgroundStyle: "solid",
  buttonStyle: "rounded",
  animationTone: "moderate",
  colorSchemeSlot: 5,
  maxWidth: "480px",
  fontSizeBase: "14px",
  layoutVariant: "type2-skyblue",
};
