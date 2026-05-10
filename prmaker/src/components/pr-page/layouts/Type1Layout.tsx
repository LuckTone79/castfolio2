"use client";
/**
 * Type.1 Warm Pink 레이아웃
 * 원본 참조: https://kokoboppppp2017-svg.github.io/Type.1/
 *
 * 구조:
 *  Nav → Featured Video (hero image) → 이름·태그라인·뱃지
 *    → Numbers (다크 플럼 배경, 2×2 stats)
 *    → Career (크림 배경, Experience + Achievement 2컬럼)
 *    → Reference Videos (다크 플럼, 가로 스크롤 세로영상)
 *    → Gallery (크림, 2+N 그리드)
 *    → Contact (크림, 카카오+이메일+SNS)
 *    → Footer
 */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ThemeConfig } from "@/types/theme";
import { PageContent } from "@/types/page-content";

interface Type1LayoutProps {
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
  bg:       "#FDF5F0",
  bg2:      "#F5EBE4",
  card:     "#FFFFFF",
  text:     "#2A1520",
  muted:    "#8A6272",
  muted2:   "#BBA0AE",
  pink:     "#C4607E",
  pinkLt:   "#E8A3B8",
  pinkDk:   "#9E3D5C",
  plum:     "#3D1E2C",
  border:   "rgba(196,96,126,0.15)",
};

/* ─── YouTube embed URL 변환 ─────────────────────────── */
function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube")) {
      const id = u.searchParams.get("v") || u.pathname.split("/").filter(Boolean).pop() || "";
      return `https://www.youtube.com/embed/${id}?rel=0`;
    }
  } catch {}
  return url;
}

/* ─── Pill 라벨 ──────────────────────────────────────── */
const Pill = ({ children }: { children: React.ReactNode }) => (
  <span style={{
    display: "inline-block",
    fontSize: 10, fontWeight: 700,
    letterSpacing: "0.2em", textTransform: "uppercase",
    color: C.pinkDk,
    background: "rgba(196,96,126,0.10)",
    border: `1px solid rgba(196,96,126,0.25)`,
    padding: "4px 12px", borderRadius: 99, marginBottom: 12,
  }}>{children}</span>
);

const DarkPill = ({ children }: { children: React.ReactNode }) => (
  <span style={{
    display: "inline-block",
    fontSize: 10, fontWeight: 700,
    letterSpacing: "0.2em", textTransform: "uppercase",
    color: C.pinkLt,
    background: "rgba(232,163,184,0.15)",
    border: `1px solid rgba(232,163,184,0.3)`,
    padding: "4px 12px", borderRadius: 99, marginBottom: 12,
  }}>{children}</span>
);

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
    strength: "강점", career: "경력", portfolio: "레퍼런스", profile: "갤러리", contact: "연락처",
  };
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(253,245,240,0.93)",
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 18px", display: "flex", alignItems: "center", justifyContent: "center", height: 52 }}>
        <nav style={{ display: "flex", gap: 24 }}>
          {sections.filter(s => !isDisabled(s) && s !== "hero" && s !== "contact").map(s => (
            <a key={s} href={`#t1-${s}`} style={{
              textDecoration: "none", color: C.muted,
              fontSize: 13, fontWeight: 600, letterSpacing: "0.03em",
            }}>
              {LABELS[s] ?? s}
            </a>
          ))}
          {!isDisabled("contact") && (
            <a href="#t1-contact" style={{ textDecoration: "none", color: C.muted, fontSize: 13, fontWeight: 600 }}>연락처</a>
          )}
        </nav>
        <span style={{ display: "none" }}>{talentName}</span>
      </div>
    </header>
  );
};

/* ─── HERO (Featured Video + 이름) ──────────────────── */
const HeroSection = ({
  content,
  talentName,
  heroImageUrl,
  firstVideoUrl,
}: {
  content: PageContent["hero"];
  talentName: string;
  heroImageUrl?: string;
  firstVideoUrl?: string;
}) => {
  const imgSrc = heroImageUrl || firstVideoUrl || "https://placehold.co/1280x720/3D1E2C/E8A3B8?text=대표+영상";

  return (
    <section id="t1-hero" style={{ padding: "36px 0 52px", background: C.bg }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 18px" }}>
        {/* Featured Video 썸네일 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            display: "block",
            position: "relative",
            width: "100%",
            borderRadius: 14,
            overflow: "hidden",
            background: C.plum,
            boxShadow: `0 16px 48px rgba(61,30,44,0.2)`,
          }}
        >
          <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
            <img
              src={imgSrc}
              alt={talentName}
              style={{
                position: "absolute", top: 0, left: 0,
                width: "100%", height: "100%",
                objectFit: "cover", display: "block",
              }}
            />
            {/* 그라디언트 오버레이 */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(150deg, rgba(61,30,44,0.35) 0%, rgba(61,30,44,0.02) 50%, rgba(196,96,126,0.18) 100%)",
            }} />
            {/* 하단 메타 */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              padding: "32px 18px 18px",
              background: "linear-gradient(to top, rgba(61,30,44,0.75) 0%, transparent 100%)",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.pinkLt, marginBottom: 4 }}>
                FEATURED VIDEO
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.35 }}>
                {talentName} — About me & 실전 피티
              </div>
            </div>
            {/* YouTube 태그 */}
            <div style={{
              position: "absolute", top: 14, right: 14,
              display: "flex", alignItems: "center", gap: 5,
              background: "rgba(61,30,44,0.6)", backdropFilter: "blur(8px)",
              borderRadius: 99, padding: "5px 11px 5px 8px",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff0000">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>YouTube에서 보기</span>
            </div>
          </div>
        </motion.div>

        {/* 이름 + 태그라인 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ marginTop: 28, textAlign: "center" }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: C.pink, marginBottom: 8 }}>
            {content.position || "Show Host · Live Commerce"}
          </div>
          <div style={{
            fontSize: "clamp(3rem, 11vw, 5rem)",
            fontWeight: 900, lineHeight: 1,
            letterSpacing: "-0.03em", color: C.plum,
            fontFamily: "Pretendard, sans-serif",
            marginBottom: 16,
          }}>
            {talentName}
          </div>
          {content.tagline && (
            <div style={{
              display: "inline-block",
              fontSize: 13, fontWeight: 800, color: C.plum,
              background: "rgba(196,96,126,0.1)",
              borderLeft: `3px solid ${C.pink}`,
              padding: "10px 16px",
              borderRadius: "0 9px 9px 0",
              textAlign: "left",
              marginBottom: 18, maxWidth: "100%",
            }}>
              {`"${content.tagline}"`}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

/* ─── NUMBERS (다크 플럼 배경) ───────────────────────── */
const NumbersSection = ({ cards }: { cards: PageContent["strength"]["cards"] }) => (
  <section id="t1-strength" style={{ background: C.plum, padding: "60px 0" }}>
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 18px" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <DarkPill>Numbers</DarkPill>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: "#F8EEF3", marginBottom: 8, fontFamily: "Pretendard, sans-serif" }}>
          숫자로 말합니다
        </h2>
        <p style={{ fontSize: 14, color: "rgba(248,238,243,0.55)", lineHeight: 1.75 }}>
          추상적인 말 대신, 실제 방송에서 만들어낸 결과입니다.
        </p>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 10,
      }}>
        {(cards.length > 0 ? cards : [
          { icon: "15", title: "평균 구매 전환율", description: "업계 평균 대비\n2배 이상 달성" },
          { icon: "320", title: "목표 매출 달성", description: "브랜드 런칭 방송\n역대 최고 기록" },
          { icon: "10만", title: "동시 시청자", description: "라이브 단일 방송 달성" },
          { icon: "3년+", title: "라이브 커머스 경력", description: "전 카테고리 경험" },
        ]).map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14,
              padding: "22px 16px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2.2rem", fontWeight: 900, color: C.pinkLt, lineHeight: 1, marginBottom: 8 }}>
              {card.icon}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(248,238,243,0.8)", marginBottom: 4 }}>
              {card.title}
            </div>
            <div style={{ fontSize: 11, color: "rgba(248,238,243,0.45)", lineHeight: 1.5, whiteSpace: "pre-line" }}>
              {card.description}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── CAREER (크림 배경, 2컬럼) ───────────────────────── */
const CareerSection = ({
  items,
  achievements,
}: {
  items: PageContent["career"]["items"];
  achievements: PageContent["profile"]["strengths"];
}) => (
  <section id="t1-career" style={{ background: C.bg2, padding: "60px 0" }}>
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 18px" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <Pill>Career</Pill>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: C.plum, fontFamily: "Pretendard, sans-serif" }}>
          경력 및 주요 성과
        </h2>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 12,
      }}>
        {/* Experience 블록 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: C.pinkDk, marginBottom: 14 }}>
            Experience
          </div>
          {items.length === 0 ? (
            <p style={{ fontSize: 13, color: C.muted }}>경력 정보를 입력해주세요.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {items.map((item, i) => (
                <li key={i} style={{
                  display: "flex", gap: 12, padding: "11px 0",
                  borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none",
                  alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.pink, whiteSpace: "nowrap", marginTop: 2, minWidth: 74 }}>
                    {item.period}
                  </span>
                  <div>
                    <strong style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.plum, marginBottom: 2 }}>
                      {item.title}
                    </strong>
                    {item.description && (
                      <span style={{ fontSize: 12, color: C.muted }}>{item.description}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Achievement 블록 */}
        {achievements.length > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: C.pinkDk, marginBottom: 14 }}>
              Achievement
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {achievements.map((a, i) => (
                <li key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 9,
                  padding: "9px 0",
                  borderBottom: i < achievements.length - 1 ? `1px solid ${C.border}` : "none",
                  fontSize: 13, lineHeight: 1.55, color: C.muted,
                }}>
                  <span style={{ color: C.pink, fontSize: 9, marginTop: 5, flexShrink: 0 }}>✦</span>
                  {a.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  </section>
);

/* ─── REFERENCE VIDEOS (다크 플럼, 세로영상 스크롤) ────── */
const VideosSection = ({ videos }: { videos: PageContent["portfolio"]["videos"] }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const CATS = ["Beauty", "Fashion", "Living", "Digital", "Other"];

  return (
    <section id="t1-portfolio" style={{ background: C.plum, padding: "60px 0" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 18px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <DarkPill>Reference</DarkPill>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#F8EEF3", fontFamily: "Pretendard, sans-serif" }}>
            레퍼런스 영상
          </h2>
          <p style={{ fontSize: 14, color: "rgba(248,238,243,0.55)", lineHeight: 1.75 }}>
            실제 방송 화면을 확인해보세요.
          </p>
        </div>

        <div style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          paddingBottom: 4,
          scrollbarWidth: "none",
        }}>
          {(videos.length > 0 ? videos : []).map((video, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                flex: "0 0 160px",
                scrollSnapAlign: "start",
                borderRadius: 14, overflow: "hidden",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div style={{ position: "relative", width: "100%", paddingTop: "177.78%", background: "#000" }}>
                {activeIdx === i ? (
                  <iframe
                    src={toEmbedUrl(video.url)}
                    title={video.title}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    style={{
                      position: "absolute", inset: 0,
                      width: "100%", height: "100%",
                      background: "transparent", border: "none", cursor: "pointer",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <div style={{ fontSize: 32, color: C.pinkLt, marginBottom: 8 }}>▶</div>
                    <span style={{ fontSize: 11, color: "rgba(248,238,243,0.7)", padding: "0 8px", textAlign: "center" }}>
                      {video.title}
                    </span>
                  </button>
                )}
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: C.pinkLt, textTransform: "uppercase", marginBottom: 3 }}>
                  {CATS[i % CATS.length]}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(248,238,243,0.9)", lineHeight: 1.4 }}>
                  {video.title}
                </div>
              </div>
            </motion.div>
          ))}

          {videos.length === 0 && [0, 1, 2, 3].map(i => (
            <div key={i} style={{
              flex: "0 0 160px",
              borderRadius: 14, overflow: "hidden",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div style={{ position: "relative", width: "100%", paddingTop: "177.78%", background: "rgba(255,255,255,0.04)" }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "rgba(248,238,243,0.2)", fontSize: 11 }}>영상 없음</span>
                </div>
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontSize: 9, color: C.pinkLt, textTransform: "uppercase", marginBottom: 3 }}>{CATS[i]}</div>
                <div style={{ fontSize: 12, color: "rgba(248,238,243,0.4)" }}>영상을 추가해주세요</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── GALLERY ────────────────────────────────────────── */
const GallerySection = ({
  photos,
  photoUrls,
}: {
  photos: string[];
  photoUrls: Record<string, string>;
}) => (
  <section id="t1-profile" style={{ background: C.bg, padding: "60px 0" }}>
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 18px" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <Pill>Gallery</Pill>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: C.plum, fontFamily: "Pretendard, sans-serif" }}>갤러리</h2>
      </div>
      {photos.length === 0 ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              borderRadius: 9, overflow: "hidden",
              aspectRatio: i === 0 ? "4/3" : "3/4",
              gridColumn: i === 0 ? "1 / -1" : undefined,
              background: C.bg2,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 12, color: C.muted2 }}>사진 추가</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}>
          {photos.map((id, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              style={{
                borderRadius: 9, overflow: "hidden",
                aspectRatio: i === 0 ? "4/3" : "3/4",
                gridColumn: i === 0 ? "1 / -1" : undefined,
                background: C.bg2,
              }}
            >
              <img
                src={photoUrls[id] || "https://placehold.co/600x800/3D1E2C/C4607E?text=사진"}
                alt={`Gallery ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  </section>
);

/* ─── CONTACT ────────────────────────────────────────── */
const ContactSection = ({
  channels,
  showPhone: _showPhone,
}: {
  channels: PageContent["contact"]["channels"];
  showPhone?: boolean;
}) => {
  const kakao = channels.find(c => c.type === "kakao");
  const email = channels.find(c => c.type === "email");
  const instagram = channels.find(c => c.type === "instagram");
  const youtube = channels.find(c => c.type === "youtube");

  return (
    <section id="t1-contact" style={{ background: C.bg2, padding: "60px 0 80px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 18px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Pill>Contact</Pill>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: C.plum, lineHeight: 1.2, fontFamily: "Pretendard, sans-serif" }}>
            함께 하실<br />브랜드를 기다립니다
          </h2>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginTop: 8 }}>편하신 방법으로 언제든 연락 주세요.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 560, margin: "0 auto" }}>
          {/* 카카오톡 CTA */}
          <div style={{
            background: C.plum, borderRadius: 14,
            padding: "24px 20px",
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 900, color: "#F8EEF3", marginBottom: 3 }}>
                가장 빠른 응답 보장 ⚡
              </p>
              <span style={{ fontSize: 12, color: "rgba(248,238,243,0.5)" }}>평일 기준 2시간 내 답변 드립니다</span>
            </div>
            {kakao ? (
              <a href={kakao.value} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "#FEE500", color: "#191919",
                textDecoration: "none", fontWeight: 800, fontSize: 14,
                padding: "13px 20px", borderRadius: 9,
              }}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.7 1.56 5.1 3.93 6.6L5 21l4.08-2.13C10.32 19.28 11.16 19.44 12 19.44c5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
                </svg>
                카카오톡으로 문의하기
              </a>
            ) : (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#FEE50044", color: "#FEE500",
                fontSize: 13, fontWeight: 600,
                padding: "13px 20px", borderRadius: 9,
              }}>
                카카오톡 링크를 등록해주세요
              </div>
            )}
          </div>

          {/* 이메일 */}
          {email && (
            <a href={`mailto:${email.value}`} style={{
              display: "flex", alignItems: "center", gap: 14,
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "16px 18px", textDecoration: "none",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "rgba(196,96,126,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={C.pinkDk} strokeWidth="2" width="20" height="20" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <div>
                <strong style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.plum }}>{email.value}</strong>
                <span style={{ fontSize: 12, color: C.muted }}>이메일로 협업 제안하기</span>
              </div>
              <div style={{ marginLeft: "auto", color: C.muted2 }}>→</div>
            </a>
          )}

          {/* SNS 카드 */}
          {(instagram || youtube) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {instagram && (
                <a href={instagram.value} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 9,
                  background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: "18px 14px", textDecoration: "none",
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: "linear-gradient(135deg, #f9ce34, #ee2a7b, #6228d7)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: C.plum }}>Instagram</span>
                  <span style={{ fontSize: 11, color: C.muted }}>{instagram.label || "@" + instagram.value.split("/").pop()}</span>
                </a>
              )}
              {youtube && (
                <a href={youtube.value} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 9,
                  background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: "18px 14px", textDecoration: "none",
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: "#ff0000",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: C.plum }}>YouTube</span>
                  <span style={{ fontSize: 11, color: C.muted }}>영상 포트폴리오</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/* ─── Footer ─────────────────────────────────────────── */
const FooterBar = ({ name }: { name: string }) => (
  <footer style={{
    textAlign: "center", padding: "22px 20px",
    background: C.plum,
    fontSize: 12, color: "rgba(248,238,243,0.3)",
  }}>
    <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
  </footer>
);

/* ─── 메인 렌더러 ─────────────────────────────────────── */
export const Type1Layout: React.FC<Type1LayoutProps> = ({
  content,
  talentName,
  talentNameEn,
  heroImageUrl,
  photoUrls = {},
  watermark,
  showPhone,
  sectionOrder,
  disabledSections,
}) => {
  const isDisabled = (key: string) => disabledSections.includes(key);
  const firstVideo = content.portfolio.videos[0];
  // 레퍼런스 섹션에는 전체 영상 목록 표시 (원본과 동일: 모든 영상을 세로 카드로)
  const restVideos = content.portfolio.videos;

  return (
    <div style={{ fontFamily: "Pretendard, sans-serif", fontSize: 14, background: C.bg, color: C.text, overflowX: "hidden" }}>
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
        heroImageUrl={heroImageUrl}
        firstVideoUrl={firstVideo?.url}
      />

      {!isDisabled("strength") && (
        <NumbersSection cards={content.strength.cards} />
      )}

      {!isDisabled("career") && (
        <CareerSection
          items={content.career.items}
          achievements={content.profile.strengths}
        />
      )}

      {!isDisabled("portfolio") && (
        <VideosSection videos={restVideos} />
      )}

      {!isDisabled("profile") && (
        <GallerySection photos={content.portfolio.photos} photoUrls={photoUrls} />
      )}

      {!isDisabled("contact") && (
        <ContactSection channels={content.contact.channels} showPhone={showPhone} />
      )}

      <FooterBar name={talentNameEn || talentName} />
    </div>
  );
};
