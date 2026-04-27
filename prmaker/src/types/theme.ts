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
  buttonStyle: "rounded" | "sharp" | "pill";
  animationTone: "subtle" | "moderate" | "elegant";
}
