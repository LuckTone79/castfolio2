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
  content,
  photoUrls = {},
  sectionTitle = "포트폴리오",
}) => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section id="portfolio" data-section="alt" className="py-[var(--layout-section-py)]">
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

        {content.videos.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-6" style={{ color: "var(--cs-text-light)" }}>방송 영상</h3>
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
                      className="img-ratio-169 w-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveVideo(video.url)}
                      className="img-ratio-169 w-full rounded-lg flex items-center justify-center cs-card text-center px-3"
                    >
                      <div>
                        <div className="text-3xl mb-2" style={{ color: "var(--cs-accent)" }}>▶</div>
                        <p className="text-sm font-medium">{video.title}</p>
                      </div>
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {content.photos.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-6" style={{ color: "var(--cs-text-light)" }}>사진</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {content.photos.map((photoId, i) => (
                <motion.img
                  key={i}
                  src={photoUrls[photoId] || "/images/placeholder.jpg"}
                  alt={`Photo ${i + 1}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="img-ratio-34 w-full rounded-lg shadow-md"
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

