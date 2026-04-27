"use client";
import React from "react";
import { motion } from "framer-motion";
import { ThemeConfig } from "@/types/theme";
import { PageContent } from "@/types/page-content";

interface HeroSectionProps {
  content: PageContent["hero"];
  theme: ThemeConfig;
  heroImageUrl?: string;
  talentName: string;
  accentColor?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  content, theme, heroImageUrl, talentName, accentColor,
}) => {
  const accent = accentColor || theme.colors.accent;

  return (
    <section
      id="hero"
      style={{ backgroundColor: theme.colors.background, color: theme.colors.text }}
      className="min-h-[60vh] flex items-center"
    >
      <div className="max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Text */}
          <motion.div
            className="flex-1 text-center md:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p style={{ color: accent }} className="text-sm font-semibold tracking-widest uppercase mb-2">
              {content.position}
            </p>
            <h1 style={{ fontFamily: theme.fonts.headingKo }} className="text-4xl md:text-6xl font-bold mb-4">
              {talentName}
            </h1>
            <p className="text-xl mb-8" style={{ color: theme.colors.textLight }}>
              {content.tagline}
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <a
                href={`#${content.ctaPrimary.action}`}
                style={{ backgroundColor: theme.colors.buttonBg, color: theme.colors.buttonText }}
                className={`px-6 py-3 font-semibold transition-opacity hover:opacity-90 ${
                  theme.buttonStyle === "pill" ? "rounded-full" : theme.buttonStyle === "rounded" ? "rounded-lg" : "rounded"
                }`}
              >
                {content.ctaPrimary.label}
              </a>
              <a
                href={`#${content.ctaSecondary.action}`}
                style={{ borderColor: theme.colors.border, color: theme.colors.text }}
                className={`px-6 py-3 font-semibold border transition-colors hover:bg-gray-50 ${
                  theme.buttonStyle === "pill" ? "rounded-full" : theme.buttonStyle === "rounded" ? "rounded-lg" : "rounded"
                }`}
              >
                {content.ctaSecondary.label}
              </a>
            </div>
          </motion.div>

          {/* Photo */}
          {heroImageUrl && (
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img
                src={heroImageUrl}
                alt={talentName}
                className="w-72 h-96 md:w-80 md:h-[480px] object-cover rounded-2xl shadow-2xl"
                loading="eager"
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
