"use client";
import React from "react";
import { motion } from "framer-motion";
import { ThemeConfig } from "@/types/theme";
import { PageContent } from "@/types/page-content";

interface ContactSectionProps {
  content: PageContent["contact"];
  theme: ThemeConfig;
  showPhone?: boolean;
  emailBotProtect?: boolean;
  accentColor?: string;
  sectionTitle?: string;
}

const CHANNEL_ICONS: Record<string, string> = {
  email: "✉️",
  kakao: "💬",
  instagram: "📸",
  youtube: "▶️",
  tiktok: "🎵",
  blog: "📝",
  phone: "📞",
  other: "🔗",
};

export const ContactSection: React.FC<ContactSectionProps> = ({
  content, theme, showPhone, emailBotProtect, accentColor, sectionTitle = "연락처",
}) => {
  const accent = accentColor || theme.colors.accent;

  const renderChannel = (channel: PageContent["contact"]["channels"][0]) => {
    if (channel.type === "phone" && !showPhone) return null;

    const icon = CHANNEL_ICONS[channel.type] || "🔗";

    if (channel.type === "email" && emailBotProtect) {
      return (
        <button
          onClick={() => { window.location.href = `mailto:${channel.value}`; }}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
        >
          <span className="text-xl">{icon}</span>
          <span className="text-sm font-medium">{channel.label || channel.value}</span>
        </button>
      );
    }

    return (
      <a
        href={channel.type === "email" ? `mailto:${channel.value}` : channel.type === "phone" ? `tel:${channel.value}` : channel.value}
        target={["email", "phone"].includes(channel.type) ? undefined : "_blank"}
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-medium">{channel.label || channel.value}</span>
      </a>
    );
  };

  return (
    <section id="contact" style={{ backgroundColor: theme.colors.backgroundAlt, color: theme.colors.text }} className="py-20">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontFamily: theme.fonts.headingKo, color: accent }}
          className="text-3xl font-bold mb-12"
        >
          {sectionTitle}
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto">
          {content.channels.map((channel, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {renderChannel(channel)}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
