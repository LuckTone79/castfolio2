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
  content, theme, profileImageUrl, accentColor, sectionTitle = "프로필",
}) => {
  const accent = accentColor || theme.colors.accent;

  return (
    <section id="profile" style={{ backgroundColor: theme.colors.backgroundAlt, color: theme.colors.text }} className="py-20">
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

        <div className="flex flex-col md:flex-row gap-10">
          {profileImageUrl && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-shrink-0"
            >
              <img
                src={profileImageUrl}
                alt="Profile"
                className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-full mx-auto shadow-lg"
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
              style={{ color: theme.colors.textLight }}
            >
              {content.intro}
            </motion.p>

            {content.infoItems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {content.infoItems.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="font-medium text-sm" style={{ color: theme.colors.text }}>{item.label}:</span>
                    <span className="text-sm" style={{ color: theme.colors.textLight }}>{item.value}</span>
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
