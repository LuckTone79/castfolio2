"use client";
import React from "react";
import { motion } from "framer-motion";
import { ThemeConfig } from "@/types/theme";
import { PageContent } from "@/types/page-content";

interface CareerSectionProps {
  content: PageContent["career"];
  theme: ThemeConfig;
  accentColor?: string;
  sectionTitle?: string;
}

export const CareerSection: React.FC<CareerSectionProps> = ({
  content, theme, accentColor, sectionTitle = "경력",
}) => {
  const accent = accentColor || theme.colors.accent;

  return (
    <section id="career" style={{ backgroundColor: theme.colors.background, color: theme.colors.text }} className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontFamily: theme.fonts.headingKo, color: accent }}
          className="text-3xl font-bold mb-12 text-center"
        >
          {sectionTitle}
        </motion.h2>

        <div className="space-y-8">
          {content.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full mt-1.5" style={{ backgroundColor: accent }} />
                {i < content.items.length - 1 && (
                  <div className="w-0.5 flex-1 mt-1" style={{ backgroundColor: theme.colors.border }} />
                )}
              </div>
              <div className="flex-1 pb-8">
                <p className="text-sm mb-1" style={{ color: theme.colors.textLight }}>{item.period}</p>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                {item.description && (
                  <p className="text-sm leading-relaxed" style={{ color: theme.colors.textLight }}>
                    {item.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
