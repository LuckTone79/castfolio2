"use client";
import React from "react";
import { motion } from "framer-motion";
import { ThemeConfig } from "@/types/theme";
import { PageContent } from "@/types/page-content";

interface ProfileSectionProps {
  content: PageContent["profile"];
  theme: ThemeConfig;
  profileImageUrl?: string;
  accentColor?: string;
  sectionTitle?: string;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  content,
  profileImageUrl,
  sectionTitle = "프로필",
}) => {
  return (
    <section id="profile" data-section="alt" className="py-[var(--layout-section-py)]">
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

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 md:gap-10">
          {profileImageUrl && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center md:justify-start"
            >
              <img
                src={profileImageUrl}
                alt="Profile"
                className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-3xl shadow-lg"
                loading="lazy"
              />
            </motion.div>
          )}

          <div className="flex-1">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-base leading-relaxed mb-6 whitespace-pre-line"
              style={{ color: "var(--cs-text-light)" }}
            >
              {content.intro}
            </motion.p>

            {content.infoItems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {content.infoItems.map((item, i) => (
                  <div key={i} className="rounded-xl border p-3" style={{ borderColor: "var(--cs-border)", backgroundColor: "var(--cs-background)" }}>
                    <span className="block text-xs mb-1" style={{ color: "var(--cs-accent)" }}>{item.label}</span>
                    <span className="text-sm" style={{ color: "var(--cs-text)" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

