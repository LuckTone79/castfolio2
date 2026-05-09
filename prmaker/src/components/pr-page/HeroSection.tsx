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
  content, heroImageUrl, talentName,
}) => {
  return (
    <section
      id="hero"
      data-section
      className="min-h-[60vh] flex items-center"
    >
      <div className="w-full mx-auto px-[var(--layout-padding-x)] py-[var(--layout-section-py)]" style={{ maxWidth: "var(--layout-max-width)" }}>
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Text */}
          <motion.div
            className="flex-1 text-center md:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p style={{ color: "var(--cs-accent)" }} className="text-sm font-semibold tracking-widest uppercase mb-2">
              {content.position}
            </p>
            <h1 style={{ fontFamily: "var(--font-family-heading)" }} className="text-4xl md:text-6xl font-bold mb-4">
              {talentName}
            </h1>
            <p className="text-xl mb-8" style={{ color: "var(--cs-text-light)" }}>
              {content.tagline}
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <a
                href={`#${content.ctaPrimary.action}`}
                className="cs-btn-primary px-6 py-3"
              >
                {content.ctaPrimary.label}
              </a>
              <a
                href={`#${content.ctaSecondary.action}`}
                className="cs-btn-ghost px-6 py-3"
              >
                {content.ctaSecondary.label}
              </a>
            </div>
          </motion.div>

          {/* Photo — 3:4 portrait ratio (sixshop imageRatio pattern) */}
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
                className="img-ratio-34 w-72 md:w-80 rounded-2xl shadow-2xl"
                loading="eager"
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
