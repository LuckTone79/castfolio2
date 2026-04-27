"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ThemeConfig } from "@/types/theme";
import { PageContent } from "@/types/page-content";
import { getVideoEmbedUrl } from "@/lib/utils";

interface PortfolioSectionProps {
  content: PageContent["portfolio"];
  theme: ThemeConfig;
  photoUrls?: Record<string, string>;
  accentColor?: string;
  sectionTitle?: string;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  content, theme, photoUrls = {}, accentColor, sectionTitle = "포트폴리오",
}) => {
  const accent = accentColor || theme.colors.accent;
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section id="portfolio" style={{ backgroundColor: theme.colors.backgroundAlt, color: theme.colors.text }} className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontFamily: theme.fonts.headingKo, color: accent }}
          className="text-3xl font-bold mb-12 text-center"
        >
          {sectionTitle}
        </motion.h2>

        {/* Videos */}
        {content.videos.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-6" style={{ color: theme.colors.textLight }}>방송 영상</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.videos.map((video, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  {activeVideo === video.url ? (
                    <iframe
                      src={getVideoEmbedUrl(video.url, video.platform)}
                      title={video.title}
                      className="w-full aspect-video rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                      allowFullScreen
                    />
                  ) : (
                    <div
                      onClick={() => setActiveVideo(video.url)}
                      className="w-full aspect-video rounded-lg flex items-center justify-center cursor-pointer"
                      style={{ backgroundColor: theme.colors.secondary }}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">▶</div>
                        <p className="text-sm font-medium px-2">{video.title}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Photos */}
        {content.photos.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-6" style={{ color: theme.colors.textLight }}>사진</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.photos.map((photoId, i) => (
                <motion.img
                  key={i}
                  src={photoUrls[photoId] || "/images/placeholder.jpg"}
                  alt={`Photo ${i + 1}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
