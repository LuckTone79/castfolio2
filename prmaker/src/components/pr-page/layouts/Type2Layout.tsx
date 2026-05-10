"use client";
/**
 * Type.2 Sky Blue 레이아웃
 * 원본 참조: https://kokoboppppp2017-svg.github.io/Type.2/
 *
 * 구조:
 *  Nav → Hero (슬라이드 이미지 + 이름/태그라인)
 *    → Stats (성과 수치 3개)
 *    → Career (타임라인)
 *    → Videos (탭 기반: 라이브커머스 / 방송출연 / 브랜드협업)
 *    → Certificates (플립 카드 자격증/강점)
 *    → Gallery (포토 갤러리)
 *    → SNS 채널
 *    → Contact (카카오 + 이메일 + PDF)
 *    → Footer
 */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeConfig } from "@/types/theme";
import { PageContent } from "@/types/page-content";

interface Type2LayoutProps {
  content: PageContent;
  theme: ThemeConfig;
  accentColor?: string;
  talentName: string;
  talentNameEn?: string;
  heroImageUrl?: string;
  profileImageUrl?: string;
  photoUrls?: Record<string, string>;
  watermark?: boolean;
  showPhone?: boolean;
  emailBotProtect?: boolean;
  sectionOrder: string[];
  disabledSections: string[];
}

/* ─── 색상 상수 (원본 그대로) ─────────────────────────── */
const C = {
  bg:     "#F0F5FC",
  bgAlt:  "#E4EDF7",
  card:   "#FFFFFF",
  text:   "#1A2A3A",
  muted:  "#5A7A9A",
  muted2: "#8AABB8",
  blue:   "#5BB8F5",
  blueDk: "#2A7BC8",
  border: "rgba(91,184,245,0.2)",
  dark:   "#1A2A3A",
};

/* ─── 네비게이션 ─────────────────────────────────────── */
const NavBar = ({
  talentName,
  sections,
  isDisabled,
}: {
  talentName: string;
  sections: string[];
  isDisabled: (k: string) => boolean;
}) => {
  const LABELS: Record<string, string> = {
    hero: "홈", strength: "자격증", career: "경력",
    portfolio: "영상", profile: "갤러리", contact: "연락",
  };
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(240,245,252,0.93)",
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{
        maxWidth: 480, margin: "0 auto", padding: "0 16px",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 0, height: 44,
      }}>
        {["hero", ...sections.filter(s => s !== "hero" && s !== "contact" && !isDisabled(s)), "contact"].map(s => (
          isDisabled(s) ? null : (
            <a key={`nav-${s}`} href={`#t2-${s}`} style={{
              textDecoration: "none", color: C.muted,
              fontSize: 12, fontWeight: 600,
              padding: "0 10px", lineHeight: "44px",
              borderBottom: `2px solid transparent`,
            }}>
              {LABELS[s] ?? s}
            </a>
          )
        ))}
        <span style={{ display: "none" }}>{talentName}</span>
      </div>
    </nav>
  );
};

/* ─── HERO (슬라이드쇼 + 이름/태그라인) ─────────────── */
const HeroSection = ({
  content,
  talentName,
  talentNameEn,
  heroImageUrl,
  profileImageUrl,
  photoUrls = {},
  photos,
}: {
  content: PageContent["hero"];
  talentName: string;
  talentNameEn?: string;
  heroImageUrl?: string;
  profileImageUrl?: string;
  photoUrls?: Record<string, string>;
  photos: string[];
}) => {
  const [slide, setSlide] = useState(0);

  // 슬라이드 이미지 목록 (최대 3장) — useMemo로 참조 안정화
  const slideImages = useMemo(() => (
    [heroImageUrl, profileImageUrl, ...photos.slice(0, 2).map(id => photoUrls[id])]
      .filter(Boolean) as string[]
  ).slice(0, 3), [heroImageUrl, profileImageUrl, photos, photoUrls]);

  const nextSlide = useCallback(() => {
    if (slideImages.length > 1) setSlide(s => (s + 1) % slideImages.length);
  }, [slideImages.length]);

  useEffect(() => {
    if (slideImages.length <= 1) return;
    const timer = setInterval(nextSlide, 3800);
    return () => clearInterval(timer);
  }, [nextSlide, slideImages.length]);

  const year = new Date().getFullYear();

  return (
    <section id="t2-hero" style={{ background: C.bg, padding: "28px 0 0" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px" }}>
        {/* 상단 텍스트 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(91,184,245,0.12)",
            border: `1px solid rgba(91,184,245,0.3)`,
            borderRadius: 99, padding: "4px 12px",
            fontSize: 11, fontWeight: 700, color: C.blue,
            marginBottom: 12,
          }}>
            ✦ {content.position || "쇼호스트 & 아나운서"}
          </div>

          <h1 style={{
            fontFamily: "'나눔명조', Georgia, serif",
            fontSize: "clamp(2.8rem, 10vw, 3.8rem)",
            fontWeight: 700, lineHeight: 1.1,
            color: C.text, marginBottom: 4,
            letterSpacing: "-0.02em",
          }}>
            {talentName}
          </h1>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, fontFamily: "나눔고딕, sans-serif" }}>
            {talentNameEn ? `${talentNameEn} · ` : ""}{year}
          </p>

          {content.tagline && (
            <div style={{
              borderLeft: `3px solid ${C.blue}`,
              paddingLeft: 14,
              marginBottom: 16,
              fontFamily: "'나눔명조', Georgia, serif",
            }}>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
                {content.tagline.includes(",") ? (
                  <>
                    {content.tagline.split(",")[0]},<br />
                    <strong style={{ color: C.text, fontWeight: 700 }}>
                      {content.tagline.split(",").slice(1).join(",").trim()}
                    </strong>
                  </>
                ) : (
                  <strong style={{ color: C.text, fontWeight: 700 }}>{content.tagline}</strong>
                )}
              </p>
            </div>
          )}

          {/* 카테고리 칩 */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
            {["라이브 커머스", "뷰티·패션", "식품·헬스", "기업행사 MC"].map(tag => (
              <span key={tag} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 99, padding: "5px 12px",
                fontSize: 11, fontWeight: 600, color: C.muted,
              }}>{tag}</span>
            ))}
          </div>
        </motion.div>

        {/* 슬라이드 이미지 */}
        {slideImages.length > 0 && (
          <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", background: C.bgAlt }}>
            <div style={{ position: "relative", width: "100%", paddingTop: "133%", overflow: "hidden" }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={slide}
                  src={slideImages[slide]}
                  alt={talentName}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%",
                    objectFit: "cover", display: "block",
                  }}
                  loading="eager"
                />
              </AnimatePresence>
            </div>
            {/* 슬라이드 인디케이터 */}
            {slideImages.length > 1 && (
              <div style={{
                position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
                display: "flex", gap: 6,
              }}>
                {slideImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    style={{
                      width: i === slide ? 20 : 6, height: 6,
                      borderRadius: 99, border: "none", cursor: "pointer",
                      background: i === slide ? C.blue : "rgba(255,255,255,0.5)",
                      transition: "all 0.3s",
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            )}
            {/* 다음 버튼 */}
            {slideImages.length > 1 && (
              <button
                onClick={nextSlide}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.8)", border: "none",
                  width: 32, height: 32, borderRadius: "50%", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: C.text,
                }}
              >›</button>
            )}
          </div>
        )}

        {slideImages.length === 0 && (
          <div style={{
            borderRadius: 20, background: C.bgAlt,
            aspectRatio: "3/4",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 13, color: C.muted2 }}>이미지를 추가해주세요</span>
          </div>
        )}
      </div>
    </section>
  );
};

/* ─── STATS (성과 수치) ─────────────────────────────── */
const StatsSection = ({ cards }: { cards: PageContent["strength"]["cards"] }) => {
  const defaults = [
    { icon: "100만+", title: "유튜브", description: "누적 조회수" },
    { icon: "120+", title: "라이브", description: "진행 횟수" },
    { icon: "1,000만+", title: "라이브 최대", description: "단일 판매액" },
  ];
  const items = cards.length > 0 ? cards.slice(0, 3) : defaults;

  return (
    <section id="t2-strength" style={{ background: C.bg, padding: "48px 0 0" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.blue, marginBottom: 6 }}>
            PERFORMANCE
          </p>
          <h2 style={{
            fontFamily: "'나눔명조', Georgia, serif",
            fontSize: 24, fontWeight: 700, color: C.text, lineHeight: 1.2,
          }}>
            숫자가 말해주는<br />
            <span style={{ color: C.blue }}>성과</span>
          </h2>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                flex: 1,
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 14, padding: "16px 12px", textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: C.text, lineHeight: 1, marginBottom: 4 }}>
                {item.icon}
              </div>
              <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.4 }}>
                {item.title}<br />
                <span style={{ color: C.muted2 }}>{item.description}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── CAREER ─────────────────────────────────────────── */
const CareerSection = ({ items }: { items: PageContent["career"]["items"] }) => (
  <section id="t2-career" style={{ background: C.bg, padding: "48px 0 0" }}>
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px" }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.blue, marginBottom: 6 }}>
        CAREER
      </p>
      <h2 style={{
        fontFamily: "'나눔명조', Georgia, serif",
        fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 20,
      }}>
        경력 사항
      </h2>

      <div style={{ position: "relative", paddingLeft: 20 }}>
        {/* 타임라인 선 */}
        <div style={{
          position: "absolute", left: 6, top: 8, bottom: 8,
          width: 2, background: `linear-gradient(to bottom, ${C.blue}, ${C.border})`,
          borderRadius: 2,
        }} />

        {(items.length > 0 ? items : [
          { period: "2022 – 현재", title: "프리랜서 쇼호스트", description: "라이브 커머스 전문 진행" },
          { period: "2021 – 2022", title: "전속 쇼호스트", description: "S커머스 플랫폼 전속" },
          { period: "2020 – 2021", title: "쇼호스트 양성 과정", description: "전문 교육 이수" },
        ]).map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            style={{ marginBottom: 20, paddingLeft: 16, position: "relative" }}
          >
            {/* 타임라인 점 */}
            <div style={{
              position: "absolute", left: -20, top: 4,
              width: 10, height: 10, borderRadius: "50%",
              background: C.blue, border: `2px solid ${C.bg}`,
              boxShadow: `0 0 0 2px ${C.blue}`,
            }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: C.blue, marginBottom: 3 }}>{item.period}</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>{item.title}</p>
            {item.description && (
              <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{item.description}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── VIDEOS (탭 기반) ───────────────────────────────── */
const VideosSection = ({ videos }: { videos: PageContent["portfolio"]["videos"] }) => {
  const TABS = ["라이브커머스 진행", "방송출연 · 자기소개", "브랜드 협업 콘텐츠"];
  const [activeTab, setActiveTab] = useState(0);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // 영상을 탭별로 균등 분배 (최소 1개씩 배치 보장)
  const tabVideos = useMemo(() => {
    if (videos.length === 0) return [[], [], []];
    return TABS.map((_, i) => videos.filter((_, idx) => idx % 3 === i));
  }, [videos]);

  const toEmbed = useCallback((url: string) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube")) {
        const id = u.searchParams.get("v") || u.pathname.split("/").filter(Boolean).pop() || "";
        return `https://www.youtube.com/embed/${id}?rel=0`;
      }
    } catch {}
    return url;
  }, []);

  return (
    <section id="t2-portfolio" style={{ background: C.bg, padding: "48px 0 0" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.blue, marginBottom: 6 }}>
          VIDEO
        </p>
        <h2 style={{
          fontFamily: "'나눔명조', Georgia, serif",
          fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 16,
        }}>
          활동 영상
        </h2>

        {/* 탭 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              style={{
                padding: "6px 12px", borderRadius: 99,
                border: `1px solid ${activeTab === i ? C.blue : C.border}`,
                background: activeTab === i ? C.blue : "transparent",
                color: activeTab === i ? "#fff" : C.muted,
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 영상 카드 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tabVideos[activeTab].length === 0 ? (
            // 빈 상태 fallback
            [0, 1].map(i => (
              <div key={i} style={{
                borderRadius: 14, overflow: "hidden",
                background: C.card, border: `1px solid ${C.border}`,
                aspectRatio: "16/9",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 12, color: C.muted2 }}>영상을 추가해주세요</span>
              </div>
            ))
          ) : (
            tabVideos[activeTab].map((video, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ borderRadius: 14, overflow: "hidden", background: C.card, border: `1px solid ${C.border}` }}
              >
                {activeVideo === video.url ? (
                  <iframe
                    src={toEmbed(video.url)}
                    title={video.title}
                    style={{ width: "100%", aspectRatio: "16/9", display: "block", border: "none" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveVideo(video.url)}
                    style={{
                      width: "100%", aspectRatio: "16/9",
                      background: C.bgAlt, border: "none", cursor: "pointer",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: C.blue,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ color: "#fff", fontSize: 16, marginLeft: 3 }}>▶</span>
                    </div>
                    <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{video.title}</span>
                  </button>
                )}
                <div style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, background: C.blue, color: "#fff",
                      padding: "2px 6px", borderRadius: 4, letterSpacing: "0.1em",
                    }}>LIVE</span>
                    <span style={{ fontSize: 11, color: C.muted }}>방송</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{video.title}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

/* ─── CERTIFICATES (플립 카드) ──────────────────────── */
const CertsSection = ({
  cards,
  strengths,
}: {
  cards: PageContent["strength"]["cards"];
  strengths: PageContent["profile"]["strengths"];
}) => {
  const [flipped, setFlipped] = useState<number | null>(null);

  // strength.cards가 있으면 사용, 없으면 profile.strengths 사용
  const items = cards.length > 0
    ? cards
    : strengths.map(s => ({ icon: s.icon, title: s.label, description: "" }));

  return (
    <section id="t2-strength" style={{ background: C.bg, padding: "48px 0 0" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.blue, marginBottom: 6 }}>
          CERTIFICATE
        </p>
        <h2 style={{
          fontFamily: "'나눔명조', Georgia, serif",
          fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 8,
        }}>
          자격증, 역량
        </h2>
        <p style={{ fontSize: 11, color: C.muted2, marginBottom: 16 }}>카드를 터치하면 설명이 나타나요</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {items.map((item, i) => (
            <div
              key={i}
              onClick={() => setFlipped(flipped === i ? null : i)}
              style={{ cursor: "pointer", height: 120, perspective: 600 }}
            >
              <motion.div
                animate={{ rotateY: flipped === i ? 180 : 0 }}
                transition={{ duration: 0.45 }}
                style={{
                  width: "100%", height: "100%",
                  transformStyle: "preserve-3d",
                  position: "relative",
                }}
              >
                {/* 앞면 */}
                <div style={{
                  position: "absolute", inset: 0,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: 16,
                  display: "flex", flexDirection: "column",
                  justifyContent: "center", alignItems: "center",
                  gap: 8,
                }}>
                  <div style={{ fontSize: 24 }}>{item.icon || "📋"}</div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.text, textAlign: "center", lineHeight: 1.3 }}>
                    {item.title}
                  </p>
                </div>

                {/* 뒷면 */}
                <div style={{
                  position: "absolute", inset: 0,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: C.blue, borderRadius: 14,
                  padding: 14,
                  display: "flex", flexDirection: "column",
                  justifyContent: "center",
                }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{item.title}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
                    {item.description || "역량을 인증하는 전문 자격"}
                  </p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── GALLERY ─────────────────────────────────────────── */
const GallerySection = ({
  photos,
  photoUrls,
}: {
  photos: string[];
  photoUrls: Record<string, string>;
}) => (
  <section id="t2-gallery" style={{ background: C.bg, padding: "48px 0 0" }}>
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px" }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.blue, marginBottom: 6 }}>
        GALLERY
      </p>
      <h2 style={{
        fontFamily: "'나눔명조', Georgia, serif",
        fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 16,
      }}>
        포토 갤러리
      </h2>

      {photos.length === 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{
              borderRadius: 10, background: C.bgAlt,
              aspectRatio: i === 0 ? "16/9" : "3/4",
              gridColumn: i === 0 ? "1 / -1" : undefined,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 10, color: C.muted2 }}>사진 추가</span>
            </div>
          ))}
        </div>
      ) : (
        // 수평 스크롤 갤러리
        <div style={{
          display: "flex", gap: 8,
          overflowX: "auto", scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none", paddingBottom: 4,
        }}>
          {photos.map((id, i) => (
            <motion.img
              key={i}
              src={photoUrls[id] || "https://placehold.co/300x400/E4EDF7/5BB8F5?text=Photo"}
              alt={`Gallery ${i + 1}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              style={{
                flex: "0 0 180px", height: 240,
                objectFit: "cover", borderRadius: 12,
                scrollSnapAlign: "start",
              }}
              loading="lazy"
            />
          ))}
        </div>
      )}
    </div>
  </section>
);

/* ─── SNS ─────────────────────────────────────────────── */
const SNSSection = ({ channels }: { channels: PageContent["contact"]["channels"] }) => {
  const snsList = channels.filter(c => ["instagram", "youtube", "tiktok"].includes(c.type));
  if (snsList.length === 0) return null;

  const SNS_META: Record<string, { label: string; bg: string; icon: React.ReactNode }> = {
    instagram: {
      label: "인스타그램", bg: "linear-gradient(135deg, #f9ce34, #ee2a7b, #6228d7)",
      icon: <svg viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
    },
    youtube: {
      label: "유튜브", bg: "#ff0000",
      icon: <svg viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
    },
    tiktok: {
      label: "틱톡", bg: "#010101",
      icon: <svg viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.88a8.27 8.27 0 0 0 4.83 1.54V7c-.01 0-1.02-.08-1.06-.31z"/></svg>,
    },
  };

  return (
    <section id="t2-sns" style={{ background: C.bg, padding: "48px 0 0" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.blue, marginBottom: 6 }}>
          SNS CHANNEL
        </p>
        <h2 style={{
          fontFamily: "'나눔명조', Georgia, serif",
          fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 16,
        }}>
          소셜 미디어
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {snsList.map((ch, i) => {
            const meta = SNS_META[ch.type];
            if (!meta) return null;
            return (
              <a key={i} href={ch.value} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", gap: 14,
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 14, padding: "14px 16px", textDecoration: "none",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: meta.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {meta.icon}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>{meta.label}</p>
                  <p style={{ fontSize: 11, color: C.muted }}>{ch.label || ch.value}</p>
                </div>
                <div style={{ marginLeft: "auto", color: C.muted2, fontSize: 16 }}>›</div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ─── CONTACT ─────────────────────────────────────────── */
const ContactSection = ({
  channels,
  talentName,
}: {
  channels: PageContent["contact"]["channels"];
  talentName: string;
}) => {
  const kakao = channels.find(c => c.type === "kakao");
  const email = channels.find(c => c.type === "email");

  return (
    <section id="t2-contact" style={{ background: C.bg, padding: "48px 0 64px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <h2 style={{
            fontFamily: "'나눔명조', Georgia, serif",
            fontSize: 22, fontWeight: 700, color: C.text,
            lineHeight: 1.3, marginBottom: 8,
          }}>
            지금, 당신의 브랜드에<br />
            <span style={{ color: C.blue }}>{talentName}</span>가 필요합니다.
          </h2>
          <p style={{ fontSize: 13, color: C.muted }}>채용 · 협업 · 광고 문의 모두 환영합니다. 편하게 연락 주세요 ✉️</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {kakao && (
            <a href={kakao.value} target="_blank" rel="noopener noreferrer" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              background: "#FEE500", color: "#191919",
              textDecoration: "none", fontWeight: 800, fontSize: 14,
              padding: "14px 20px", borderRadius: 12,
            }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.7 1.56 5.1 3.93 6.6L5 21l4.08-2.13C10.32 19.28 11.16 19.44 12 19.44c5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
              </svg>
              카카오톡 오픈채팅으로 문의하기
            </a>
          )}

          {email && (
            <a href={`mailto:${email.value}`} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              background: C.card, color: C.text,
              border: `1px solid ${C.border}`,
              textDecoration: "none", fontWeight: 700, fontSize: 14,
              padding: "14px 20px", borderRadius: 12,
            }}>
              ✉️ 이메일로 문의하기
            </a>
          )}

          <div style={{
            marginTop: 8, padding: "16px", background: C.card,
            border: `1px solid ${C.border}`, borderRadius: 12,
            fontSize: 12, color: C.muted, textAlign: "center",
          }}>
            {email && (
              <p>이메일 : <a href={`mailto:${email.value}`} style={{ color: C.blue, textDecoration: "none" }}>{email.value}</a></p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Footer ─────────────────────────────────────────── */
const FooterBar = ({ name }: { name: string }) => (
  <footer style={{
    textAlign: "center", padding: "20px 20px",
    background: C.dark,
    fontSize: 11, color: "rgba(255,255,255,0.3)",
    fontFamily: "나눔고딕, sans-serif",
  }}>
    <p>© {new Date().getFullYear()} {name} · All rights reserved</p>
  </footer>
);

/* ─── 메인 렌더러 ─────────────────────────────────────── */
export const Type2Layout: React.FC<Type2LayoutProps> = ({
  content,
  talentName,
  talentNameEn,
  heroImageUrl,
  profileImageUrl,
  photoUrls = {},
  watermark,
  sectionOrder,
  disabledSections,
}) => {
  const isDisabled = (key: string) => disabledSections.includes(key);

  return (
    <div style={{
      fontFamily: "나눔고딕, sans-serif",
      fontSize: 14, background: C.bg, color: C.text, overflowX: "hidden",
    }}>
      {watermark && (
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 40,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            color: "#888", fontSize: 60, fontWeight: 700, opacity: 0.1,
            transform: "rotate(-30deg)", whiteSpace: "nowrap", userSelect: "none",
          }}>PREVIEW</div>
        </div>
      )}

      <NavBar talentName={talentName} sections={sectionOrder} isDisabled={isDisabled} />

      <HeroSection
        content={content.hero}
        talentName={talentName}
        talentNameEn={talentNameEn}
        heroImageUrl={heroImageUrl}
        profileImageUrl={profileImageUrl}
        photoUrls={photoUrls}
        photos={content.portfolio.photos}
      />

      {!isDisabled("strength") && (
        <StatsSection cards={content.strength.cards} />
      )}

      {!isDisabled("career") && (
        <CareerSection items={content.career.items} />
      )}

      {!isDisabled("portfolio") && (
        <VideosSection videos={content.portfolio.videos} />
      )}

      {!isDisabled("strength") && (
        <CertsSection
          cards={content.strength.cards}
          strengths={content.profile.strengths}
        />
      )}

      {!isDisabled("profile") && (
        <GallerySection photos={content.portfolio.photos} photoUrls={photoUrls} />
      )}

      <SNSSection channels={content.contact.channels} />

      {!isDisabled("contact") && (
        <ContactSection channels={content.contact.channels} talentName={talentName} />
      )}

      <FooterBar name={talentNameEn || talentName} />
    </div>
  );
};
