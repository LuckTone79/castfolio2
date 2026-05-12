"use client";

import { useCallback, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Eye, GripVertical, Monitor, Plus, QrCode, Smartphone, Trash2 } from "lucide-react";
import { Button, FormField, Input, Select, Stepper } from "@/components/ui";
import { ImageCropEditor } from "@/components/ui/ImageCropEditor";
import { PRPageRenderer } from "@/components/page/pr-page-renderer";
import type { PageContent } from "@/types/page-content";
import { APP_VERSION } from "@/lib/version";
import {
  DESIGN_LAYOUTS,
  COLOR_THEMES,
  type DesignLayoutId,
  type ColorTheme,
} from "@/lib/page-themes";

const STEP_LABELS = ["정보 입력", "테마 선택", "페이지 편집", "미리보기"];
type PreviewMode = "desktop" | "mobile";
type ActiveSection = "hero" | "profile" | "career" | "portfolio" | "strength" | "contact";

/* ─── 레이아웃별 사이드바 섹션 순서 ─────────────────── */
const TYPE1_SECTIONS: Array<{ key: ActiveSection; label: string }> = [
  { key: "hero", label: "히어로" },
  { key: "strength", label: "강점" },
  { key: "career", label: "경력" },
  { key: "portfolio", label: "포트폴리오" },
  { key: "profile", label: "갤러리" },
  { key: "contact", label: "연락처" },
];

const TYPE2_SECTIONS: Array<{ key: ActiveSection; label: string }> = [
  { key: "hero", label: "히어로" },
  { key: "strength", label: "강점" },
  { key: "career", label: "경력" },
  { key: "portfolio", label: "포트폴리오" },
  { key: "profile", label: "갤러리" },
  { key: "contact", label: "연락처" },
];

const DEFAULT_SECTION_ORDER = ["hero", "profile", "career", "portfolio", "strength", "contact", "footer"];

const EMPTY_CONTENT: PageContent = {
  hero: { tagline: "", position: "", heroImageId: "", ctaPrimary: { label: "포트폴리오 보기", action: "portfolio" }, ctaSecondary: { label: "연락하기", action: "contact" } },
  profile: { intro: "", profileImageId: "", infoItems: [], strengths: [] },
  career: { items: [] },
  portfolio: { videos: [], photos: [], audioSamples: [] },
  strength: { cards: [] },
  contact: { channels: [] },
};

function CreatePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialStep = Math.min(Math.max(Number(searchParams.get("step") || "1"), 1), 4);

  const [step, setStep] = useState(initialStep);
  const [nameKo, setNameKo] = useState("카리나");
  const [nameEn, setNameEn] = useState("Karina");

  // ── v2.0: 디자인 + 컬러 2단계 선택 ──
  const [designLayout, setDesignLayout] = useState<DesignLayoutId>("type1");
  const [colorThemeId, setColorThemeId] = useState("warm-pink");
  const themeId = `${designLayout}-${colorThemeId}`;

  const [activeSection, setActiveSection] = useState<ActiveSection>("hero");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [content, setContent] = useState<PageContent>(EMPTY_CONTENT);

  const previewScrollRef = useRef<HTMLDivElement>(null);

  const selectedColor = COLOR_THEMES.find((c) => c.id === colorThemeId) ?? COLOR_THEMES[0];

  const pageUrl = useMemo(() => {
    const slug = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "demo";
    return `https://castfolio.widgetnet.net/p/${slug}`;
  }, [nameEn]);

  const qrUrl = useMemo(() => `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pageUrl)}`, [pageUrl]);

  const goStep = (next: number) => {
    setStep(next);
    router.replace(`/create?step=${next}`, { scroll: false });
  };

  const updateSection = useCallback(<K extends keyof PageContent>(section: K, data: Partial<PageContent[K]>) => {
    setContent((prev) => ({ ...prev, [section]: { ...(prev[section] as object), ...data } }));
  }, []);

  // Map generic section key → actual DOM element ID (layout-aware)
  const getSectionDomId = (section: ActiveSection): string => {
    if (designLayout === "type1") return `t1-${section}`;
    // Type2
    if (section === "profile") return "t2-gallery";
    return `t2-${section}`;
  };

  const scrollToSection = (section: ActiveSection) => {
    setActiveSection(section);
    if (section === "hero") {
      previewScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(getSectionDomId(section));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ═══════════════════════ STEP 1 ═══════════════════════
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-lg px-6 pt-8 pb-16">
          <Stepper steps={STEP_LABELS} current={0} className="mb-10" />
          <h1 className="mb-6 text-3xl font-bold">기본 정보 입력</h1>
          <div className="space-y-5">
            <FormField label="이름 (국문)" required><Input value={nameKo} onChange={(e) => setNameKo(e.target.value)} /></FormField>
            <FormField label="이름 (영문)"><Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} /></FormField>
            <FormField label="포지션"><Input value={content.hero.position} onChange={(e) => updateSection("hero", { position: e.target.value })} placeholder="아나운서" /></FormField>
          </div>
          <Button className="mt-8 w-full" onClick={() => goStep(2)} disabled={!nameKo.trim()}>다음: 테마 선택 <ArrowRight size={16} /></Button>
        </div>
      </div>
    );
  }

  // ═══════════════════════ STEP 2 ═══════════════════════
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-6xl px-6 pt-8 pb-16">
          <Stepper steps={STEP_LABELS} current={1} className="mx-auto mb-10 max-w-lg" />
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">테마 선택</h1>
            <Button variant="ghost" size="sm" onClick={() => goStep(1)}><ArrowLeft size={14} /> 이전</Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            {/* 좌측: 선택 UI */}
            <div className="space-y-8">
              {/* 1단계: 디자인 선택 */}
              <div>
                <p className="mb-3 text-sm font-semibold text-gray-300">1. 디자인 선택</p>
                <div className="grid grid-cols-2 gap-4">
                  {DESIGN_LAYOUTS.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => setDesignLayout(layout.id)}
                      className={`relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all ${
                        designLayout === layout.id
                          ? "border-white bg-gray-800 shadow-lg shadow-white/5"
                          : "border-gray-700 bg-gray-900 hover:border-gray-500"
                      }`}
                    >
                      {designLayout === layout.id && (
                        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white">
                          <Check size={14} className="text-gray-900" />
                        </div>
                      )}
                      <div className="mb-3 flex h-16 items-center justify-center rounded-xl" style={{
                        background: designLayout === layout.id
                          ? `linear-gradient(135deg, ${selectedColor.accent}30, ${selectedColor.bg})`
                          : "linear-gradient(135deg, #2a2a3a, #1a1a2a)",
                      }}>
                        <span className="text-2xl font-bold" style={{
                          color: designLayout === layout.id ? selectedColor.accent : "#666",
                        }}>
                          {layout.id === "type1" ? "⬡" : "⬢"}
                        </span>
                      </div>
                      <p className="text-sm font-bold">{layout.nameKo}</p>
                      <p className="mt-1 text-xs text-gray-400">{layout.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2단계: 컬러 선택 */}
              <div>
                <p className="mb-3 text-sm font-semibold text-gray-300">2. 컬러 테마 선택</p>
                <div className="grid grid-cols-5 gap-3">
                  {COLOR_THEMES.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setColorThemeId(color.id)}
                      className={`group relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${
                        colorThemeId === color.id
                          ? "border-white bg-gray-800"
                          : "border-gray-700 bg-gray-900 hover:border-gray-500"
                      }`}
                    >
                      <div
                        className="relative h-10 w-10 rounded-full border-2 transition-transform group-hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${color.accent}, ${color.accentDark})`,
                          borderColor: colorThemeId === color.id ? "#fff" : "transparent",
                        }}
                      >
                        {colorThemeId === color.id && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check size={16} className="text-white drop-shadow" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 group-hover:text-gray-200">{color.nameKo}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 선택 정보 요약 */}
              <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-full"
                    style={{ background: `linear-gradient(135deg, ${selectedColor.accent}, ${selectedColor.accentDark})` }}
                  />
                  <div>
                    <p className="text-sm font-semibold">
                      {DESIGN_LAYOUTS.find(l => l.id === designLayout)?.nameKo} · {selectedColor.nameKo}
                    </p>
                    <p className="text-xs text-gray-400">
                      테마 ID: {themeId}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 우측: 미리보기 */}
            <div className="rounded-2xl border border-gray-700 bg-gray-900 p-4">
              <p className="mb-3 text-xs text-gray-400">실시간 미리보기</p>
              <div className="overflow-hidden rounded-xl border border-gray-800" style={{ maxHeight: 520, overflowY: "auto" }}>
                <div style={{ transform: "scale(0.55)", transformOrigin: "top left", width: "182%", pointerEvents: "none" }}>
                  <PRPageRenderer
                    themeId={themeId}
                    content={content}
                    talentNameKo={nameKo}
                    talentNameEn={nameEn}
                    sectionOrder={DEFAULT_SECTION_ORDER}
                    disabledSections={[]}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button className="mt-8 w-full" onClick={() => goStep(3)}>다음: 페이지 편집 <ArrowRight size={16} /></Button>
        </div>
      </div>
    );
  }

  // ═══════════════════════ STEP 3 ═══════════════════════
  if (step === 3) {
    const sections = designLayout === "type1" ? TYPE1_SECTIONS : TYPE2_SECTIONS;

    return (
      <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-gray-950 text-white">
        <aside className="w-52 shrink-0 border-r border-gray-800 p-2">
          <Button variant="ghost" size="sm" className="mb-2 w-full justify-start text-gray-400" onClick={() => goStep(2)}>
            <ArrowLeft size={14} /> 테마 선택
          </Button>
          <div className="mb-2 h-px bg-gray-800" />
          {sections.map((s) => (
            <button key={s.key} onClick={() => scrollToSection(s.key)} className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${activeSection === s.key ? "bg-gray-800" : "text-gray-300 hover:bg-gray-800/60"}`}>
              <GripVertical size={12} className="text-gray-600" />{s.label}
            </button>
          ))}
          <Button className="mt-3 w-full" size="sm" onClick={() => goStep(4)}><Eye size={14} /> 미리보기</Button>
        </aside>

        <main ref={previewScrollRef} className="flex-1 overflow-y-auto bg-gray-900 p-5">
          <div className={`mx-auto overflow-hidden rounded-xl border border-gray-800 ${previewMode === "mobile" ? "w-[390px]" : "w-full max-w-4xl"}`}>
            <PRPageRenderer
              themeId={themeId}
              content={content}
              talentNameKo={nameKo}
              talentNameEn={nameEn}
              sectionOrder={DEFAULT_SECTION_ORDER}
              disabledSections={[]}
            />
          </div>
        </main>

        <aside className="w-96 shrink-0 border-l border-gray-800 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">{activeSection} 편집</p>
            <div className="flex overflow-hidden rounded border border-gray-700">
              <button onClick={() => setPreviewMode("desktop")} className={`p-1 ${previewMode === "desktop" ? "bg-gray-800" : "text-gray-500"}`}><Monitor size={14} /></button>
              <button onClick={() => setPreviewMode("mobile")} className={`p-1 ${previewMode === "mobile" ? "bg-gray-800" : "text-gray-500"}`}><Smartphone size={14} /></button>
            </div>
          </div>
          <SectionEditor section={activeSection} content={content} updateSection={updateSection} />
        </aside>
      </div>
    );
  }

  // ═══════════════════════ STEP 4 ═══════════════════════
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="sticky top-14 z-30 border-b border-gray-800 bg-gray-950/90">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-6"><Button variant="ghost" size="sm" onClick={() => goStep(3)}><ArrowLeft size={14} /> 편집으로</Button><span className="text-sm">최종 미리보기</span></div>
      </div>
      <div className="mx-auto flex max-w-6xl justify-center px-4 py-8">
        <div className={`overflow-hidden rounded-xl border border-gray-800 ${previewMode === "mobile" ? "w-[390px]" : "w-full max-w-4xl"}`}>
          <PRPageRenderer
            themeId={themeId}
            content={content}
            talentNameKo={nameKo}
            talentNameEn={nameEn}
            sectionOrder={DEFAULT_SECTION_ORDER}
            disabledSections={[]}
          />
        </div>
      </div>
      <div className="py-10 text-center">
        <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300"><QrCode size={14} /> 홈페이지 QR</div>
        <img src={qrUrl} alt="qr" className="mx-auto h-44 w-44 rounded bg-white p-2" />
        <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block text-sm text-blue-300 underline">{pageUrl}</a>
      </div>
      <div className="pb-16 text-center"><Link href="/"><Button>완료</Button></Link></div>
    </div>
  );
}

function SectionEditor({ section, content, updateSection }: { section: ActiveSection; content: PageContent; updateSection: <K extends keyof PageContent>(section: K, data: Partial<PageContent[K]>) => void }) {
  if (section === "hero") {
    return <div className="space-y-4"><FormField label="포지션"><Input value={content.hero.position} onChange={(e) => updateSection("hero", { position: e.target.value })} /></FormField><FormField label="한 줄 소개"><Input value={content.hero.tagline} onChange={(e) => updateSection("hero", { tagline: e.target.value })} /></FormField><ImageCropEditor label="히어로 이미지" value={content.hero.heroImageId} onChange={(url) => updateSection("hero", { heroImageId: url })} /></div>;
  }
  if (section === "profile") {
    return <div className="space-y-4"><FormField label="자기소개"><textarea className="h-28 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm" value={content.profile.intro} onChange={(e) => updateSection("profile", { intro: e.target.value })} /></FormField><ImageCropEditor label="프로필 이미지" value={content.profile.profileImageId} onChange={(url) => updateSection("profile", { profileImageId: url })} outputWidth={400} outputHeight={400} /></div>;
  }
  if (section === "career") {
    return <div><div className="mb-3 flex items-center justify-between"><label className="text-xs text-gray-400">경력</label><button onClick={() => updateSection("career", { items: [...content.career.items, { period: "", title: "", description: "", imageId: "" }] })} className="text-xs text-blue-400"><Plus size={12} className="inline" /> 추가</button></div>{content.career.items.map((item, i) => <div key={i} className="mb-3 space-y-2 rounded-lg border border-gray-800 p-3"><div className="flex justify-end"><button onClick={() => updateSection("career", { items: content.career.items.filter((_, idx) => idx !== i) })}><Trash2 size={13} className="text-gray-500" /></button></div><Input placeholder="기간" value={item.period} onChange={(e) => { const items = [...content.career.items]; items[i] = { ...item, period: e.target.value }; updateSection("career", { items }); }} /><Input placeholder="직함" value={item.title} onChange={(e) => { const items = [...content.career.items]; items[i] = { ...item, title: e.target.value }; updateSection("career", { items }); }} /><Input placeholder="설명" value={item.description} onChange={(e) => { const items = [...content.career.items]; items[i] = { ...item, description: e.target.value }; updateSection("career", { items }); }} /><ImageCropEditor label="경력 이미지" value={item.imageId || ""} onChange={(url) => { const items = [...content.career.items]; items[i] = { ...item, imageId: url }; updateSection("career", { items }); }} /></div>)}</div>;
  }
  if (section === "portfolio") {
    return <div className="space-y-4"><ImageCropEditor label="포트폴리오 이미지" value="" onChange={(url) => updateSection("portfolio", { photos: [...content.portfolio.photos, url] })} /><div className="grid grid-cols-2 gap-2">{content.portfolio.photos.map((photo, i) => <div key={i} className="relative"><img src={photo} alt="portfolio" className="h-20 w-full rounded object-cover" /><button onClick={() => updateSection("portfolio", { photos: content.portfolio.photos.filter((_, idx) => idx !== i) })} className="absolute right-1 top-1 rounded bg-black/60 p-1"><Trash2 size={12} /></button></div>)}</div></div>;
  }
  if (section === "strength") {
    return <div><div className="mb-3 flex items-center justify-between"><label className="text-xs text-gray-400">강점 카드</label><button onClick={() => updateSection("strength", { cards: [...content.strength.cards, { icon: "⭐", title: "", description: "" }] })} className="text-xs text-blue-400"><Plus size={12} className="inline" /> 추가</button></div>{content.strength.cards.map((card, i) => <div key={i} className="mb-2 space-y-2 rounded border border-gray-800 p-3"><Input placeholder="제목" value={card.title} onChange={(e) => { const cards = [...content.strength.cards]; cards[i] = { ...card, title: e.target.value }; updateSection("strength", { cards }); }} /><Input placeholder="설명" value={card.description} onChange={(e) => { const cards = [...content.strength.cards]; cards[i] = { ...card, description: e.target.value }; updateSection("strength", { cards }); }} /></div>)}</div>;
  }
  return <div><div className="mb-3 flex items-center justify-between"><label className="text-xs text-gray-400">연락처</label><button onClick={() => updateSection("contact", { channels: [...content.contact.channels, { type: "email", value: "", label: "" }] })} className="text-xs text-blue-400"><Plus size={12} className="inline" /> 추가</button></div>{content.contact.channels.map((ch, i) => <div key={i} className="mb-2 space-y-2 rounded border border-gray-800 p-3"><Select value={ch.type} onChange={(e) => { const channels = [...content.contact.channels]; channels[i] = { ...ch, type: e.target.value as typeof ch.type }; updateSection("contact", { channels }); }}>{["email", "phone", "instagram", "youtube", "other"].map((t) => <option key={t} value={t}>{t}</option>)}</Select><Input placeholder="값" value={ch.value} onChange={(e) => { const channels = [...content.contact.channels]; channels[i] = { ...ch, value: e.target.value }; updateSection("contact", { channels }); }} /></div>)}</div>;
}


export default function CreatePage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
        <CreatePageInner />
      </Suspense>
      <div className="fixed bottom-3 right-3 rounded-full border border-gray-700 bg-gray-900 px-3 py-1 text-xs text-gray-400">
        v{APP_VERSION}
      </div>
    </>
  );
}
