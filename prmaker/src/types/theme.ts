export interface ThemeConfig {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  recommendedFor: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
    textLight: string;
    accent: string;
    background: string;
    backgroundAlt: string;
    border: string;
    buttonBg: string;
    buttonText: string;
  };
  fonts: {
    headingKo: string;
    headingEn: string;
    bodyKo: string;
    bodyEn: string;
  };
  backgroundStyle: "solid" | "texture" | "gradient";
  /** Maps to --button-{rect|round-rect|capsule}-border-radius token */
  buttonStyle: "rounded" | "sharp" | "pill";
  animationTone: "subtle" | "moderate" | "elegant";
  /** data-color-scheme attribute value (1–5); drives --cs-* CSS variable slot */
  colorSchemeSlot?: 1 | 2 | 3 | 4 | 5;
  /** Max content width for this theme (sets --layout-max-width) */
  maxWidth?: string;
  /** Base font size (sets --font-size-base) */
  fontSizeBase?: string;
}
