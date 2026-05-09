"use client";
import React from "react";
import { ThemeConfig } from "@/types/theme";
import { PageContent } from "@/types/page-content";
import { HeroSection } from "./HeroSection";
import { ProfileSection } from "./ProfileSection";
import { CareerSection } from "./CareerSection";
import { PortfolioSection } from "./PortfolioSection";
import { StrengthSection } from "./StrengthSection";
import { ContactSection } from "./ContactSection";
import { FooterSection } from "./FooterSection";

interface PRPageRendererProps {
  content: PageContent;
  theme: ThemeConfig;
  accentColor?: string;
  talentName: string;
  talentNameEn?: string;
  sectionOrder: string[];
  disabledSections: string[];
  showPhone?: boolean;
  emailBotProtect?: boolean;
  heroImageUrl?: string;
  profileImageUrl?: string;
  photoUrls?: Record<string, string>;
  watermark?: boolean;
  locale?: string;
}

const SECTION_TITLES_KO: Record<string, string> = {
  profile: "프로필",
  career: "경력",
  portfolio: "포트폴리오",
  strength: "강점",
  contact: "연락처",
};

const SECTION_TITLES_EN: Record<string, string> = {
  profile: "Profile",
  career: "Career",
  portfolio: "Portfolio",
  strength: "Strengths",
  contact: "Contact",
};

const SECTION_TITLES_ZH: Record<string, string> = {
  profile: "个人简介",
  career: "经历",
  portfolio: "作品集",
  strength: "优势",
  contact: "联系方式",
};

export const PRPageRenderer: React.FC<PRPageRendererProps> = ({
  content,
  theme,
  accentColor,
  talentName,
  talentNameEn,
  sectionOrder,
  disabledSections,
  showPhone,
  emailBotProtect,
  heroImageUrl,
  profileImageUrl,
  photoUrls,
  watermark,
  locale = "ko",
}) => {
  const sectionTitles =
    locale === "en" ? SECTION_TITLES_EN :
    locale === "zh" ? SECTION_TITLES_ZH :
    SECTION_TITLES_KO;

  const isDisabled = (key: string) => disabledSections.includes(key);
  const reorderedSections = [...sectionOrder].filter((s) => !["hero", "contact", "footer"].includes(s));
  const visibleSectionKeys = reorderedSections.filter((key) => !isDisabled(key));

  const renderSection = (key: string) => {
    if (isDisabled(key)) return null;
    switch (key) {
      case "profile":
        return <ProfileSection content={content.profile} theme={theme} accentColor={accentColor} profileImageUrl={profileImageUrl} sectionTitle={sectionTitles.profile} />;
      case "career":
        return content.career.items.length > 0 ? <CareerSection content={content.career} theme={theme} accentColor={accentColor} sectionTitle={sectionTitles.career} /> : null;
      case "portfolio":
        return (content.portfolio.videos.length > 0 || content.portfolio.photos.length > 0)
          ? <PortfolioSection content={content.portfolio} theme={theme} accentColor={accentColor} photoUrls={photoUrls} sectionTitle={sectionTitles.portfolio} />
          : null;
      case "strength":
        return content.strength.cards.length > 0 ? <StrengthSection content={content.strength} theme={theme} accentColor={accentColor} sectionTitle={sectionTitles.strength} /> : null;
      default:
        return null;
    }
  };

  const buttonRadius =
    theme.buttonStyle === "pill" ? "var(--button-capsule-border-radius)" :
    theme.buttonStyle === "rounded" ? "var(--button-round-rect-border-radius)" :
    "var(--button-rect-border-radius)";

  const cssTokens = {
    "--cs-accent": accentColor || theme.colors.accent,
    "--cs-accent-glow": `${accentColor || theme.colors.accent}26`,
    "--cs-background": theme.colors.background,
    "--cs-background-alt": theme.colors.backgroundAlt,
    "--cs-text": theme.colors.text,
    "--cs-text-light": theme.colors.textLight,
    "--cs-border": theme.colors.border,
    "--cs-button-bg": theme.colors.buttonBg,
    "--cs-button-text": theme.colors.buttonText,
    "--font-family-heading": theme.fonts.headingKo,
    "--font-family-body": theme.fonts.bodyKo,
    "--button-primary-border-radius": buttonRadius,
    "--layout-max-width": theme.maxWidth ?? "1200px",
    "--font-size-base": theme.fontSizeBase ?? "15px",
  } as React.CSSProperties;

  return (
    <div
      className="relative"
      data-color-scheme={theme.colorSchemeSlot ?? undefined}
      style={{ fontFamily: "var(--font-family-body)", fontSize: "var(--font-size-base)", ...cssTokens }}
    >
      {watermark && (
        <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center overflow-hidden">
          <div className="text-gray-400 text-6xl font-bold opacity-10 rotate-[-30deg] whitespace-nowrap select-none" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            PREVIEW
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-30 border-b backdrop-blur-md" style={{ backgroundColor: `${theme.colors.background}d9`, borderColor: "var(--cs-border)" }}>
        <div className="mx-auto flex items-center justify-between px-[var(--layout-padding-x)] py-4" style={{ maxWidth: "var(--layout-max-width)" }}>
          <div className="text-sm md:text-base font-semibold tracking-wide" style={{ fontFamily: "var(--font-family-heading)" }}>
            {talentName}
          </div>
          <div className="hidden md:flex items-center gap-5 text-xs uppercase tracking-[0.18em]">
            {visibleSectionKeys.map((key) => (
              <a key={key} href={`#${key}`} className="opacity-80 hover:opacity-100 transition-opacity">
                {sectionTitles[key] ?? key}
              </a>
            ))}
            {!isDisabled("contact") && (
              <a href="#contact" className="opacity-80 hover:opacity-100 transition-opacity">
                {sectionTitles.contact}
              </a>
            )}
          </div>
        </div>
      </nav>

      <HeroSection
        content={content.hero}
        theme={theme}
        accentColor={accentColor}
        heroImageUrl={heroImageUrl}
        talentName={talentName}
      />

      <main className="mx-auto px-[var(--layout-padding-x)] pb-[var(--layout-section-py)]" style={{ maxWidth: "var(--layout-max-width)" }}>
        <div className="space-y-6 md:space-y-8">
          {reorderedSections.map((key) => {
            const section = renderSection(key);
            if (!section) return null;
            return (
              <section
                key={`panel-${key}`}
                className="rounded-3xl border shadow-[0_20px_50px_-28px_rgba(0,0,0,0.35)] overflow-hidden"
                style={{ backgroundColor: "var(--cs-background-alt)", borderColor: "var(--cs-border)" }}
              >
                {section}
              </section>
            );
          })}

          {!isDisabled("contact") && (
            <section
              className="rounded-3xl border p-1 shadow-[0_24px_56px_-32px_rgba(0,0,0,0.4)]"
              style={{ backgroundColor: "var(--cs-background-alt)", borderColor: "var(--cs-border)" }}
            >
              <ContactSection
                content={content.contact}
                theme={theme}
                accentColor={accentColor}
                showPhone={showPhone}
                emailBotProtect={emailBotProtect}
                sectionTitle={sectionTitles.contact}
              />
            </section>
          )}
        </div>
      </main>

      <FooterSection talentName={talentNameEn || talentName} />
    </div>
  );
};

