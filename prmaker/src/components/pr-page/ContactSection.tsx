"use client";
import React from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Instagram, Youtube, Phone, Link as LinkIcon } from "lucide-react";
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

const CHANNEL_ICON_COMPONENT: Record<PageContent["contact"]["channels"][number]["type"], React.ComponentType<{ className?: string }>> = {
  email: Mail,
  kakao: MessageCircle,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: LinkIcon,
  blog: LinkIcon,
  phone: Phone,
  other: LinkIcon,
};

export const ContactSection: React.FC<ContactSectionProps> = ({
  content,
  showPhone,
  emailBotProtect,
  sectionTitle = "연락처",
}) => {
  const renderChannel = (channel: PageContent["contact"]["channels"][0]) => {
    if (channel.type === "phone" && !showPhone) return null;
    const Icon = CHANNEL_ICON_COMPONENT[channel.type] || LinkIcon;
    const href =
      channel.type === "email" ? `mailto:${channel.value}` :
      channel.type === "phone" ? `tel:${channel.value}` :
      channel.value;
    const isExternal = !["email", "phone"].includes(channel.type);

    if (channel.type === "email" && emailBotProtect) {
      return (
        <button
          type="button"
          onClick={() => { window.location.href = href; }}
          className="flex items-center gap-3 p-4 rounded-xl transition-colors w-full text-left border"
          style={{ borderColor: "var(--cs-border)", backgroundColor: "var(--cs-background)" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--cs-background-alt)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--cs-background)"; }}
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium break-all">{channel.label || channel.value}</span>
        </button>
      );
    }

    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="flex items-center gap-3 p-4 rounded-xl transition-colors border"
        style={{ borderColor: "var(--cs-border)", backgroundColor: "var(--cs-background)" }}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="text-sm font-medium break-all">{channel.label || channel.value}</span>
      </a>
    );
  };

  return (
    <section id="contact" data-section="alt" className="py-[var(--layout-section-py)]">
      <div className="max-w-3xl mx-auto px-[var(--layout-padding-x)] text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontFamily: "var(--font-family-heading)", color: "var(--cs-accent)" }}
          className="text-3xl font-bold mb-12"
        >
          {sectionTitle}
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
          {content.channels.map((channel, i) => (
            <motion.div
              key={`${channel.type}-${channel.value}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              {renderChannel(channel)}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

