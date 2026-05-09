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
  content,
  sectionTitle = "강점",
}) => {
  return (
    <section id="strength" data-section className="py-[var(--layout-section-py)]">
      <div className="mx-auto px-[var(--layout-padding-x)]" style={{ maxWidth: "var(--layout-max-width)" }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontFamily: "var(--font-family-heading)", color: "var(--cs-accent)" }}
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
              className="rounded-2xl border p-6"
              style={{ borderColor: "var(--cs-border)", backgroundColor: "var(--cs-background)" }}
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--cs-text-light)" }}>
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

