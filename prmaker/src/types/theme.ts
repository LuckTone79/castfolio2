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
  /**
   * Layout variant — determines the overall page structure.
   * "default"      : standard card-based layout (all existing themes)
   * "type1-warm"   : Type.1 featured-video hero + alternating dark/light sections
   * "type2-skyblue": Type.2 slideshow hero + tab-based video + flip-cert cards
   */
  layoutVariant?: "default" | "type1-warm" | "type2-skyblue";
}
