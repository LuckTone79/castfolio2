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
  content,
  sectionTitle = "경력",
}) => {
  return (
    <section id="career" data-section className="py-[var(--layout-section-py)]">
      <div className="mx-auto px-[var(--layout-padding-x)]" style={{ maxWidth: "880px" }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontFamily: "var(--font-family-heading)", color: "var(--cs-accent)" }}
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
              className="grid grid-cols-[18px_1fr] gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full mt-1.5" style={{ backgroundColor: "var(--cs-accent)" }} />
                {i < content.items.length - 1 && (
                  <div className="w-0.5 flex-1 mt-1" style={{ backgroundColor: "var(--cs-border)" }} />
                )}
              </div>
              <div className="rounded-2xl border p-5 md:p-6" style={{ borderColor: "var(--cs-border)", backgroundColor: "var(--cs-background)" }}>
                <p className="text-sm mb-2" style={{ color: "var(--cs-text-light)" }}>{item.period}</p>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                {item.description && (
                  <p className="text-sm leading-relaxed" style={{ color: "var(--cs-text-light)" }}>
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

