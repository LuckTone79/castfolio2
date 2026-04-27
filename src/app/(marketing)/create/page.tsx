"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Stepper, Input, Select, FormField } from "@/components/ui";
import { ArrowLeft, ArrowRight, Eye, Monitor, Smartphone, Plus, Trash2, GripVertical } from "lucide-react";
import type { PageContent, DraftContent } from "@/types/page-content";

// ── Demo data for screenshots ────────────────────
const DEMO_CONTENT: PageContent = {
  hero: {
    tagline: "시청자의 마음을 움직이는 진심 어린 방송",
    position: "쇼호스트",
    heroImageId: "",
    ctaPrimary: { label: "포트폴리오 보기", action: "portfolio" },
    ctaSecondary: { label: "연락하기", action: "contact" },
  },
  profile: {
    intro: "안녕하세요, 김유나입니다. 10년간 국내 주요 홈쇼핑 채널에서 뷰티·라이프스타일 전문 쇼호스트로 활동해 왔습니다. 고객의 마음을 움직이는 진심 어린 방송으로 연간 최고 판매 기록을 보유하고 있습니다.",
    profileImageId: "",
    infoItems: [
      { label: "경력", value: "10년" },
      { label: "전문분야", value: "뷰티/라이프스타일" },
      { label: "학력", value: "서울대 언론정보학과" },
    ],
    strengths: [
      { icon: "💄", label: "뷰티 전문" },
      { icon: "🎤", label: "발성 우수" },
      { icon: "🌍", label: "영어 능통" },
    ],
  },
  career: {
    items: [
      { period: "2020 – 현재", title: "GS홈쇼핑 전속 쇼호스트", description: "뷰티/라이프 채널 담당, 연간 매출 1,000억 달성" },
      { period: "2018 – 2020", title: "CJ온스타일 쇼호스트", description: "식품/건강 카테고리 전담, 런칭 방송 최고 시청률" },
      { period: "2016 – 2018", title: "MBC 방송 리포터", description: "뉴스 및 예능 프로그램 다수 출연" },
    ],
  },
  portfolio: {
    videos: [
      { url: "https://youtu.be/dQw4w9WgXcQ", platform: "youtube", title: "GS홈쇼핑 뷰티 런칭 방송" },
      { url: "https://youtu.be/dQw4w9WgXcQ", platform: "youtube", title: "CJ온스타일 식품 특집" },
    ],
    photos: [],
    audioSamples: [],
  },
  strength: {
    cards: [
      { icon: "🏆", title: "판매 전문가", description: "10년간 쌓은 판매 노하우로 시청자의 구매 욕구를 이끌어냅니다." },
      { icon: "💬", title: "탁월한 소통력", description: "편안하면서도 신뢰감 있는 화법으로 시청자와 깊이 소통합니다." },
      { icon: "📚", title: "전문 지식", description: "뷰티, 라이프스타일, 건강 분야의 깊은 제품 지식을 보유하고 있습니다." },
    ],
  },
  contact: {
    channels: [
      { type: "email", value: "yuna.kim@example.com", label: "이메일" },
      { type: "instagram", value: "@yuna_host", label: "인스타그램" },
      { type: "phone", value: "010-1234-5678", label: "전화" },
    ],
  },
};

const EMPTY_CONTENT: PageContent = {
  hero: { tagline: "", position: "", heroImageId: "", ctaPrimary: { label: "포트폴리오 보기", action: "portfolio" }, ctaSecondary: { label: "연락하기", action: "contact" } },
  profile: { intro: "", profileImageId: "", infoItems: [], strengths: [] },
  career: { items: [] },
  portfolio: { videos: [], photos: [], audioSamples: [] },
  strength: { cards: [] },
  contact: { channels: [] },
};

const THEMES = [
  { id: "anchor-clean", name: "Anchor Clean", desc: "깔끔한 뉴스 앵커 스타일", color: "#1a1a2e", accent: "#e94560" },
  { id: "warm-natural", name: "Warm Natural", desc: "따뜻한 내추럴 톤", color: "#2d2d2d", accent: "#f4a261" },
  { id: "modern-mono", name: "Modern Mono", desc: "모던 모노톤 미니멀", color: "#0d1117", accent: "#58a6ff" },
  { id: "classic-gold", name: "Classic Gold", desc: "클래식 골드 포멀", color: "#1c1c1c", accent: "#ffd700" },
  { id: "fresh-pastel", name: "Fresh Pastel", desc: "프레시 파스텔 톤", color: "#1e1e2e", accent: "#cba6f7" },
  { id: "bold-dynamic", name: "Bold Dynamic", desc: "볼드 다이나믹 액티브", color: "#0f0f0f", accent: "#ff6b6b" },
  { id: "elegant-dark", name: "Elegant Dark", desc: "엘레건트 다크 무드", color: "#0a0a0a", accent: "#c0c0c0" },
  { id: "curated-atelier", name: "Curated Atelier", desc: "웜 크림 톤의 에디토리얼 레이아웃", color: "#fdf9f4", accent: "#460609" },
];

const STEP_LABELS = ["정보 입력", "테마 선택", "페이지 편집", "미리보기"];

type ActiveSection = "hero" | "profile" | "career" | "portfolio" | "strength" | "contact";

function CreatePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialStep = Math.min(Math.max(Number(searchParams.get("step") || "1"), 1), 4);

  const [step, setStep] = useState(initialStep);
  const [nameKo, setNameKo] = useState(initialStep > 1 ? "김유나" : "");
  const [nameEn, setNameEn] = useState(initialStep > 1 ? "Kim Yuna" : "");
  const [position, setPosition] = useState(initialStep > 1 ? "쇼호스트" : "");
  const [themeId, setThemeId] = useState("anchor-clean");
  const [activeSection, setActiveSection] = useState<ActiveSection>("hero");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [content, setContent] = useState<PageContent>(initialStep >= 3 ? DEMO_CONTENT : EMPTY_CONTENT);
  const [disabledSections, setDisabledSections] = useState<string[]>([]);

  const goStep = (n: number) => {
    setStep(n);
    router.replace(`/create?step=${n}`, { scroll: false });
  };

  const updateSection = useCallback(<K extends keyof PageContent>(section: K, data: Partial<PageContent[K]>) => {
    setContent(prev => ({ ...prev, [section]: { ...(prev[section] as object), ...data } }));
  }, []);

  const toggleSection = (key: string) => {
    setDisabledSections(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]);
  };

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];

  // ── STEP 1: Basic info ──────────────────────────
  if (step === 1) return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-lg mx-auto px-6 pt-8 pb-16">
        <Stepper steps={STEP_LABELS} current={0} className="mb-10" />
        <h1 className="text-3xl font-bold mb-2">방송인 정보 입력</h1>
        <p className="text-gray-400 mb-8">PR 페이지에 표시될 기본 정보를 입력하세요.</p>
        <div className="space-y-5">
          <FormField label="이름 (한국어)" required>
            <Input value={nameKo} onChange={e => setNameKo(e.target.value)} placeholder="예: 김유나" />
          </FormField>
          <FormField label="이름 (영문)">
            <Input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="예: Kim Yuna" />
          </FormField>
          <FormField label="포지션">
            <Select value={position} onChange={e => setPosition(e.target.value)}>
              <option value="">선택하세요</option>
              {["아나운서","쇼호스트","MC","리포터","기상캐스터","스포츠캐스터","내레이터","성우"].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </FormField>
        </div>
        <Button
          className="w-full mt-8"
          disabled={!nameKo.trim()}
          onClick={() => {
            setContent(prev => ({ ...prev, hero: { ...prev.hero, position } }));
            goStep(2);
          }}
        >
          다음: 테마 선택 <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );

  // ── STEP 2: Theme selection ─────────────────────
  if (step === 2) return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-16">
        <Stepper steps={STEP_LABELS} current={1} className="mb-10 max-w-lg mx-auto" />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">테마 선택</h1>
            <p className="text-gray-400">{nameKo || "김유나"}님에게 어울리는 테마를 선택하세요.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => goStep(1)}><ArrowLeft size={14} /> 이전</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {THEMES.map(t => (
            <button key={t.id} onClick={() => setThemeId(t.id)}
              className={`rounded-2xl overflow-hidden text-left transition-all ${themeId === t.id ? "ring-2 ring-white scale-[1.02]" : "opacity-70 hover:opacity-100"}`}
            >
              <div className="h-40 flex items-center justify-center relative" style={{ background: t.color }}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-2 mx-auto mb-2" style={{ borderColor: t.accent }} />
                  <p style={{ color: t.accent, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>{t.desc}</p>
                  <p className="text-white text-lg font-bold mt-1">{nameKo || "김유나"}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{position || "쇼호스트"}</p>
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 border-t-0 rounded-b-2xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{t.name}</h3>
                  <p className="text-xs text-gray-500">{t.desc}</p>
                </div>
                {themeId === t.id && <span className="text-xs bg-white text-gray-900 px-2 py-0.5 rounded-full font-bold">선택</span>}
              </div>
            </button>
          ))}
        </div>
        <Button className="w-full mt-10" onClick={() => goStep(3)}>
          다음: 페이지 편집 <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );

  // ── STEP 3: Builder ─────────────────────────────
  const SECTIONS = [
    { key: "hero" as const, label: "히어로", icon: "🖼️" },
    { key: "profile" as const, label: "프로필", icon: "👤" },
    { key: "career" as const, label: "경력", icon: "💼" },
    { key: "portfolio" as const, label: "포트폴리오", icon: "🎬" },
    { key: "strength" as const, label: "강점", icon: "⚡" },
    { key: "contact" as const, label: "연락처", icon: "📞" },
  ];

  if (step === 3) return (
    <div className="flex h-[calc(100vh-56px)] bg-gray-950 text-white overflow-hidden">
      {/* Left: Section nav */}
      <div className="w-48 border-r border-gray-800 flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-gray-800">
          <button onClick={() => goStep(2)} className="text-xs text-gray-500 hover:text-white flex items-center gap-1"><ArrowLeft size={12} /> 테마</button>
          <p className="font-semibold text-sm mt-1">{nameKo || "김유나"}</p>
          <p className="text-xs text-gray-500">{position || "쇼호스트"}</p>
        </div>
        <div className="flex-1 p-2 overflow-y-auto space-y-0.5">
          {SECTIONS.map(s => {
            const off = disabledSections.includes(s.key);
            return (
              <div key={s.key} className="flex items-center gap-1">
                <button onClick={() => setActiveSection(s.key)}
                  className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${activeSection === s.key ? "bg-gray-800 text-white" : off ? "text-gray-600" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}>
                  <span>{s.icon}</span> <span className={off ? "line-through" : ""}>{s.label}</span>
                </button>
                {s.key !== "hero" && (
                  <button onClick={() => toggleSection(s.key)} className="text-xs w-5 h-5 rounded flex items-center justify-center text-gray-600 hover:text-white hover:bg-gray-800">
                    {off ? "+" : "−"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="p-3 border-t border-gray-800">
          <Button className="w-full" size="sm" onClick={() => goStep(4)}>
            <Eye size={14} /> 미리보기
          </Button>
        </div>
      </div>

      {/* Center: Preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-800">
          <span className="text-xs text-gray-500">테마:</span>
          <span className="text-xs text-white font-medium">{theme.name}</span>
          <div className="flex gap-1 ml-auto border border-gray-700 rounded overflow-hidden">
            <button onClick={() => setPreviewDevice("desktop")} className={`p-1 ${previewDevice === "desktop" ? "bg-gray-800 text-white" : "text-gray-500"}`}><Monitor size={14} /></button>
            <button onClick={() => setPreviewDevice("mobile")} className={`p-1 ${previewDevice === "mobile" ? "bg-gray-800 text-white" : "text-gray-500"}`}><Smartphone size={14} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-900 flex justify-center p-4">
          <div className={`bg-gray-950 border border-gray-800 rounded-xl overflow-y-auto ${previewDevice === "mobile" ? "w-[390px]" : "w-full max-w-4xl"}`}>
            <DemoPreview content={content} name={nameKo || "김유나"} nameEn={nameEn || "Kim Yuna"} theme={theme} disabledSections={disabledSections} />
          </div>
        </div>
      </div>

      {/* Right: Editor */}
      <div className="w-80 border-l border-gray-800 flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-gray-800">
          <p className="font-semibold text-sm">{SECTIONS.find(s => s.key === activeSection)?.icon} {SECTIONS.find(s => s.key === activeSection)?.label} 편집</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          <SectionEditor section={activeSection} content={content} updateSection={updateSection} />
        </div>
      </div>
    </div>
  );

  // ── STEP 4: Full preview ────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="sticky top-14 z-40 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => goStep(3)}><ArrowLeft size={14} /> 편집으로</Button>
          <span className="text-sm font-medium">{nameKo || "김유나"} — 미리보기</span>
          <div className="flex gap-2">
            <div className="flex gap-0.5 border border-gray-700 rounded overflow-hidden">
              <button onClick={() => setPreviewDevice("desktop")} className={`p-1.5 ${previewDevice === "desktop" ? "bg-gray-800 text-white" : "text-gray-500"}`}><Monitor size={14} /></button>
              <button onClick={() => setPreviewDevice("mobile")} className={`p-1.5 ${previewDevice === "mobile" ? "bg-gray-800 text-white" : "text-gray-500"}`}><Smartphone size={14} /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center py-8 px-4">
        <div className={`bg-gray-950 border border-gray-800 rounded-xl overflow-hidden ${previewDevice === "mobile" ? "w-[390px]" : "w-full max-w-4xl"}`}>
          <DemoPreview content={content} name={nameKo || "김유나"} nameEn={nameEn || "Kim Yuna"} theme={theme} disabledSections={disabledSections} />
        </div>
      </div>

      <div className="text-center py-12">
        <p className="text-gray-500 text-sm mb-4">실제 배포하려면 회원가입 후 이용하세요.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => goStep(3)}>계속 편집</Button>
          <Link href="/"><Button>홈으로</Button></Link>
        </div>
      </div>
    </div>
  );
}

// ── Inline preview (no DB, no theme engine) ──────
function DemoPreview({ content, name, nameEn, theme, disabledSections }: {
  content: PageContent; name: string; nameEn: string;
  theme: { color: string; accent: string; name: string };
  disabledSections: string[];
}) {
  const off = (k: string) => disabledSections.includes(k);
  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 text-center" style={{ background: theme.color }}>
        <div className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 flex items-center justify-center text-2xl font-bold" style={{ borderColor: theme.accent, background: `${theme.accent}22`, color: theme.accent, boxShadow: `0 0 0 4px ${theme.accent}33` }}>
          {name[0]}
        </div>
        <h1 className="text-4xl font-bold text-white">{name}</h1>
        {nameEn && <p className="text-gray-500 mt-1">{nameEn}</p>}
        <p className="text-lg mt-2" style={{ color: theme.accent }}>{content.hero.position}</p>
        {content.hero.tagline && <p className="text-gray-400 mt-3 italic max-w-md mx-auto">&ldquo;{content.hero.tagline}&rdquo;</p>}
        <div className="flex gap-3 justify-center mt-6">
          <span className="px-5 py-2.5 rounded-full text-sm font-medium" style={{ background: theme.accent, color: theme.color }}>{content.hero.ctaPrimary.label}</span>
          <span className="px-5 py-2.5 rounded-full text-sm font-medium border border-gray-600 text-white">{content.hero.ctaSecondary.label}</span>
        </div>
      </section>

      {/* Profile */}
      {!off("profile") && content.profile.intro && (
        <section className="max-w-3xl mx-auto px-6 py-14">
          <h2 className="text-xl font-bold text-white mb-4">소개</h2>
          <p className="text-gray-300 leading-relaxed">{content.profile.intro}</p>
          {content.profile.infoItems.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              {content.profile.infoItems.map((item, i) => (
                <div key={i} className="text-center p-3 rounded-lg bg-gray-900 border border-gray-800">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm text-white font-medium mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          )}
          {content.profile.strengths.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {content.profile.strengths.map((s, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-sm text-gray-300">{s.icon} {s.label}</span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Career */}
      {!off("career") && content.career.items.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-14 border-t border-gray-800">
          <h2 className="text-xl font-bold text-white mb-6">경력</h2>
          <div className="space-y-4">
            {content.career.items.map((item, i) => (
              <div key={i} className="flex gap-5">
                <span className="text-xs text-gray-500 font-mono w-28 shrink-0 text-right pt-0.5">{item.period}</span>
                <div className="border-l border-gray-800 pl-5 pb-2 relative">
                  <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full" style={{ background: theme.accent }} />
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Portfolio */}
      {!off("portfolio") && content.portfolio.videos.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-14 border-t border-gray-800">
          <h2 className="text-xl font-bold text-white mb-6">포트폴리오</h2>
          <div className="grid gap-3">
            {content.portfolio.videos.map((v, i) => (
              <div key={i} className="rounded-lg bg-gray-900 border border-gray-800 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{v.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{v.platform}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full border border-gray-700 text-gray-400">영상 보기</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Strength */}
      {!off("strength") && content.strength.cards.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-14 border-t border-gray-800">
          <h2 className="text-xl font-bold text-white mb-6">강점</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {content.strength.cards.map((c, i) => (
              <div key={i} className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                <div className="text-2xl mb-2">{c.icon}</div>
                <h3 className="text-sm font-semibold text-white mb-1">{c.title}</h3>
                <p className="text-xs text-gray-400">{c.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      {!off("contact") && content.contact.channels.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-14 border-t border-gray-800">
          <h2 className="text-xl font-bold text-white mb-6">연락처</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {content.contact.channels.map((ch, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-900 border border-gray-800 p-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${theme.accent}22`, color: theme.accent }}>
                  {ch.type[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-gray-500">{ch.label || ch.type}</p>
                  <p className="text-sm text-white">{ch.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-gray-800 py-6 text-center">
        <p className="text-xs text-gray-600">Powered by Castfolio</p>
      </footer>
    </div>
  );
}

// ── Section editor (right panel) ──────────────────
function SectionEditor({ section, content, updateSection }: {
  section: ActiveSection; content: PageContent;
  updateSection: <K extends keyof PageContent>(s: K, d: Partial<PageContent[K]>) => void;
}) {
  if (section === "hero") return (
    <>
      <FormField label="포지션">
        <Input value={content.hero.position} onChange={e => updateSection("hero", { position: e.target.value })} placeholder="쇼호스트" />
      </FormField>
      <FormField label="한 줄 소개">
        <Input value={content.hero.tagline} onChange={e => updateSection("hero", { tagline: e.target.value })} placeholder="시청자의 마음을 움직이는..." maxLength={50} />
      </FormField>
    </>
  );

  if (section === "profile") return (
    <>
      <FormField label="자기소개">
        <textarea value={content.profile.intro} onChange={e => updateSection("profile", { intro: e.target.value })}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-gray-500"
          rows={4} placeholder="자기소개를 입력하세요..." />
      </FormField>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-400">프로필 정보</label>
          <button onClick={() => updateSection("profile", { infoItems: [...content.profile.infoItems, { label: "", value: "" }] })}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={12} /> 추가</button>
        </div>
        {content.profile.infoItems.map((item, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <Input className="w-1/3" value={item.label} placeholder="항목" onChange={e => {
              const items = [...content.profile.infoItems]; items[i] = { ...item, label: e.target.value }; updateSection("profile", { infoItems: items });
            }} />
            <Input className="flex-1" value={item.value} placeholder="내용" onChange={e => {
              const items = [...content.profile.infoItems]; items[i] = { ...item, value: e.target.value }; updateSection("profile", { infoItems: items });
            }} />
            <button onClick={() => updateSection("profile", { infoItems: content.profile.infoItems.filter((_, idx) => idx !== i) })} className="text-gray-600 hover:text-red-400"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </>
  );

  if (section === "career") return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-medium text-gray-400">경력</label>
        <button onClick={() => updateSection("career", { items: [...content.career.items, { period: "", title: "", description: "" }] })}
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={12} /> 추가</button>
      </div>
      {content.career.items.length === 0 && <p className="text-xs text-gray-600 text-center py-4">항목을 추가하세요.</p>}
      {content.career.items.map((item, i) => (
        <div key={i} className="border border-gray-800 rounded-lg p-3 mb-3 space-y-2">
          <div className="flex justify-between"><span className="text-xs text-gray-600">#{i + 1}</span>
            <button onClick={() => updateSection("career", { items: content.career.items.filter((_, idx) => idx !== i) })} className="text-gray-600 hover:text-red-400"><Trash2 size={12} /></button>
          </div>
          <Input value={item.period} placeholder="기간" onChange={e => { const items = [...content.career.items]; items[i] = { ...item, period: e.target.value }; updateSection("career", { items }); }} />
          <Input value={item.title} placeholder="소속/역할" onChange={e => { const items = [...content.career.items]; items[i] = { ...item, title: e.target.value }; updateSection("career", { items }); }} />
          <Input value={item.description} placeholder="설명" onChange={e => { const items = [...content.career.items]; items[i] = { ...item, description: e.target.value }; updateSection("career", { items }); }} />
        </div>
      ))}
    </div>
  );

  if (section === "portfolio") return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-medium text-gray-400">영상</label>
        <button onClick={() => updateSection("portfolio", { videos: [...content.portfolio.videos, { url: "", platform: "youtube", title: "" }] })}
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={12} /> 추가</button>
      </div>
      {content.portfolio.videos.map((v, i) => (
        <div key={i} className="border border-gray-800 rounded-lg p-3 mb-2 space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">{v.platform}</span>
            <button onClick={() => updateSection("portfolio", { videos: content.portfolio.videos.filter((_, idx) => idx !== i) })} className="text-gray-600 hover:text-red-400"><Trash2 size={12} /></button>
          </div>
          <Input value={v.title} placeholder="영상 제목" onChange={e => { const vids = [...content.portfolio.videos]; vids[i] = { ...v, title: e.target.value }; updateSection("portfolio", { videos: vids }); }} />
          <Input value={v.url} placeholder="https://youtu.be/..." onChange={e => { const vids = [...content.portfolio.videos]; vids[i] = { ...v, url: e.target.value }; updateSection("portfolio", { videos: vids }); }} />
        </div>
      ))}
    </div>
  );

  if (section === "strength") return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-medium text-gray-400">강점 카드</label>
        <button onClick={() => updateSection("strength", { cards: [...content.strength.cards, { icon: "⭐", title: "", description: "" }] })}
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={12} /> 추가</button>
      </div>
      {content.strength.cards.map((c, i) => (
        <div key={i} className="border border-gray-800 rounded-lg p-3 mb-2 space-y-2">
          <div className="flex justify-between">
            <Input className="w-12 text-center" value={c.icon} onChange={e => { const cards = [...content.strength.cards]; cards[i] = { ...c, icon: e.target.value }; updateSection("strength", { cards }); }} />
            <button onClick={() => updateSection("strength", { cards: content.strength.cards.filter((_, idx) => idx !== i) })} className="text-gray-600 hover:text-red-400"><Trash2 size={12} /></button>
          </div>
          <Input value={c.title} placeholder="강점 제목" onChange={e => { const cards = [...content.strength.cards]; cards[i] = { ...c, title: e.target.value }; updateSection("strength", { cards }); }} />
          <Input value={c.description} placeholder="설명" onChange={e => { const cards = [...content.strength.cards]; cards[i] = { ...c, description: e.target.value }; updateSection("strength", { cards }); }} />
        </div>
      ))}
    </div>
  );

  // contact
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-medium text-gray-400">연락처</label>
        <button onClick={() => updateSection("contact", { channels: [...content.contact.channels, { type: "email", value: "", label: "" }] })}
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={12} /> 추가</button>
      </div>
      {content.contact.channels.map((ch, i) => (
        <div key={i} className="border border-gray-800 rounded-lg p-3 mb-2 space-y-2">
          <div className="flex justify-between">
            <select value={ch.type} onChange={e => { const chs = [...content.contact.channels]; chs[i] = { ...ch, type: e.target.value as typeof ch.type }; updateSection("contact", { channels: chs }); }}
              className="text-xs bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white">
              {["email","phone","kakao","instagram","youtube","blog","other"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={() => updateSection("contact", { channels: content.contact.channels.filter((_, idx) => idx !== i) })} className="text-gray-600 hover:text-red-400"><Trash2 size={12} /></button>
          </div>
          <Input value={ch.value} placeholder="값" onChange={e => { const chs = [...content.contact.channels]; chs[i] = { ...ch, value: e.target.value }; updateSection("contact", { channels: chs }); }} />
          <Input value={ch.label} placeholder="표시명" onChange={e => { const chs = [...content.contact.channels]; chs[i] = { ...ch, label: e.target.value }; updateSection("contact", { channels: chs }); }} />
        </div>
      ))}
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <CreatePageInner />
    </Suspense>
  );
}
