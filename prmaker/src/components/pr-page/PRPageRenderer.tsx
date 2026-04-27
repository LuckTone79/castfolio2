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
  profile: "个人资料",
  career: "职业经历",
  portfolio: "作品集",
  strength: "优势",
  contact: "联系方式",
};

export const PRPageRenderer: React.FC<PRPageRendererProps> = ({
  content, theme, accentColor, talentName, talentNameEn,
  sectionOrder, disabledSections,
  showPhone, emailBotProtect,
  heroImageUrl, profileImageUrl, photoUrls,
  watermark, locale = "ko",
}) => {
  const sectionTitles =
    locale === "en" ? SECTION_TITLES_EN :
    locale === "zh" ? SECTION_TITLES_ZH :
    SECTION_TITLES_KO;

  const isDisabled = (key: string) => disabledSections.includes(key);

  const reorderedSections = [...sectionOrder].filter(s =>
    !["hero", "contact", "footer"].includes(s)
  );

  const renderSection = (key: string) => {
    if (isDisabled(key)) return null;
    switch (key) {
      case "profile":
        return <ProfileSection key={key} content={content.profile} theme={theme} accentColor={accentColor} profileImageUrl={profileImageUrl} sectionTitle={sectionTitles.profile} />;
      case "career":
        return content.career.items.length > 0 ? <CareerSection key={key} content={content.career} theme={theme} accentColor={accentColor} sectionTitle={sectionTitles.career} /> : null;
      case "portfolio":
        return (content.portfolio.videos.length > 0 || content.portfolio.photos.length > 0) ? <PortfolioSection key={key} content={content.portfolio} theme={theme} accentColor={accentColor} photoUrls={photoUrls} sectionTitle={sectionTitles.portfolio} /> : null;
      case "strength":
        return content.strength.cards.length > 0 ? <StrengthSection key={key} content={content.strength} theme={theme} accentColor={accentColor} sectionTitle={sectionTitles.strength} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="relative" style={{ fontFamily: theme.fonts.bodyKo }}>
      {/* Watermark */}
      {watermark && (
        <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center overflow-hidden">
          <div
            className="text-gray-400 text-6xl font-bold opacity-10 rotate-[-30deg] whitespace-nowrap select-none"
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            PREVIEW
          </div>
        </div>
      )}

      {/* Hero — always first */}
      <HeroSection
        content={content.hero}
        theme={theme}
        accentColor={accentColor}
        heroImageUrl={heroImageUrl}
        talentName={talentName}
      />

      {/* Reordered middle sections */}
      {reorderedSections.map(key => renderSection(key))}

      {/* Contact — always last */}
      {!isDisabled("contact") && (
        <ContactSection
          content={content.contact}
          theme={theme}
          accentColor={accentColor}
          showPhone={showPhone}
          emailBotProtect={emailBotProtect}
          sectionTitle={sectionTitles.contact}
        />
      )}

      <FooterSection
        theme={theme}
        talentName={talentNameEn || talentName}
      />
    </div>
  );
};
