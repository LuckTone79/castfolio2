"use client";
import React from "react";
import { motion } from "framer-motion";
import { ThemeConfig } from "@/types/theme";
import { PageContent } from "@/types/page-content";

interface StrengthSectionProps {
  content: PageContent["strength"];
  theme: ThemeConfig;
  accentColor?: string;
  sectionTitle?: string;
}

export const StrengthSection: React.FC<StrengthSectionProps> = ({
  content, theme, accentColor, sectionTitle = "강점",
}) => {
  const accent = accentColor || theme.colors.accent;

  return (
    <section id="strength" style={{ backgroundColor: theme.colors.background, color: theme.colors.text }} className="py-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontFamily: theme.fonts.headingKo, color: accent }}
          className="text-3xl font-bold mb-12 text-center"
        >
          {sectionTitle}
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl border"
              style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.backgroundAlt }}
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: theme.colors.textLight }}>
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
