"use client";

import { useCallback, useMemo, useRef, useState, Suspense, type MutableRefObject } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Crop, Eye, GripVertical, Image as ImageIcon, Monitor, Plus, QrCode, Smartphone, Trash2 } from "lucide-react";
import { Button, FormField, Input, Select, Stepper } from "@/components/ui";
import type { PageContent } from "@/types/page-content";
import { APP_VERSION } from "@/lib/version";

const STEP_LABELS = ["정보 입력", "테마 선택", "페이지 편집", "미리보기"];
type PreviewMode = "desktop" | "mobile";
type ActiveSection = "hero" | "profile" | "career" | "portfolio" | "strength" | "contact";

const THEMES = [
  { id: "anchor-clean", name: "Anchor Clean", desc: "깔끔한 뉴스 앵커 스타일", color: "#1a1a2e", accent: "#e94560" },
  { id: "warm-natural", name: "Warm Natural", desc: "따뜻한 내추럴 톤", color: "#2d2d2d", accent: "#f4a261" },
  { id: "modern-mono", name: "Modern Mono", desc: "모던 모노 미니멀", color: "#0d1117", accent: "#58a6ff" },
  { id: "classic-gold", name: "Classic Gold", desc: "클래식 골드 포멀", color: "#1c1c1c", accent: "#ffd700" },
  { id: "curated-atelier", name: "Curated Atelier", desc: "에디토리얼 레이아웃", color: "#fdf9f4", accent: "#460609" },
  { id: "warm-pink", name: "Warm Pink", desc: "방송인 핑크/플럼 멀티섹션", color: "#3D1E2C", accent: "#C4607E" },
  { id: "sky-blue", name: "Sky Blue", desc: "모바일 슬라이드형 스카이블루", color: "#1A2A3A", accent: "#5BB8F5" },
];

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
  const [themeId, setThemeId] = useState("anchor-clean");
  const [themePreviewId, setThemePreviewId] = useState("anchor-clean");
  const [activeSection, setActiveSection] = useState<ActiveSection>("hero");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [content, setContent] = useState<PageContent>(EMPTY_CONTENT);

  const sectionRefs = {
    hero: useRef<HTMLElement | null>(null),
    profile: useRef<HTMLElement | null>(null),
    career: useRef<HTMLElement | null>(null),
    portfolio: useRef<HTMLElement | null>(null),
    strength: useRef<HTMLElement | null>(null),
    contact: useRef<HTMLElement | null>(null),
  };

  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  const previewTheme = THEMES.find((t) => t.id === themePreviewId) || theme;

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

  const scrollToSection = (section: ActiveSection) => {
    setActiveSection(section);
    const target = sectionRefs[section].current;
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-6xl px-6 pt-8 pb-16">
          <Stepper steps={STEP_LABELS} current={1} className="mx-auto mb-10 max-w-lg" />
          <div className="mb-6 flex items-center justify-between"><h1 className="text-3xl font-bold">테마 선택</h1><Button variant="ghost" size="sm" onClick={() => goStep(1)}><ArrowLeft size={14} /> 이전</Button></div>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {THEMES.map((t) => (
                <button key={t.id} onMouseEnter={() => setThemePreviewId(t.id)} onFocus={() => setThemePreviewId(t.id)} onClick={() => { setThemeId(t.id); setThemePreviewId(t.id); }} className={`overflow-hidden rounded-2xl border text-left transition ${themeId === t.id ? "border-white ring-2 ring-white" : "border-gray-700 hover:border-gray-500"}`}>
                  <div className="h-32 p-4" style={{ background: t.color }}>
                    <div className="h-10 w-10 rounded-full border-2" style={{ borderColor: t.accent }} />
                    <p className="mt-4 text-sm font-semibold" style={{ color: t.accent }}>{t.name}</p>
                  </div>
                  <div className="bg-gray-900 p-3"><p className="text-xs text-gray-400">{t.desc}</p></div>
                </button>
              ))}
            </div>
            <div className="rounded-2xl border border-gray-700 bg-gray-900 p-4">
              <p className="mb-2 text-xs text-gray-400">클릭/호버 테마 미리보기</p>
              <ThemeMiniPreview name={nameKo} nameEn={nameEn} position={content.hero.position} theme={previewTheme} />
            </div>
          </div>
          <Button className="mt-8 w-full" onClick={() => goStep(3)}>다음: 페이지 편집 <ArrowRight size={16} /></Button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    const sections: Array<{ key: ActiveSection; label: string }> = [
      { key: "hero", label: "히어로" },
      { key: "profile", label: "프로필" },
      { key: "career", label: "경력" },
      { key: "portfolio", label: "포트폴리오" },
      { key: "strength", label: "강점" },
      { key: "contact", label: "연락처" },
    ];

    return (
      <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-gray-950 text-white">
        <aside className="w-52 shrink-0 border-r border-gray-800 p-2">
          {sections.map((s) => (
            <button key={s.key} onClick={() => scrollToSection(s.key)} className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${activeSection === s.key ? "bg-gray-800" : "text-gray-300 hover:bg-gray-800/60"}`}>
              <GripVertical size={12} className="text-gray-600" />{s.label}
            </button>
          ))}
          <Button className="mt-3 w-full" size="sm" onClick={() => goStep(4)}><Eye size={14} /> 미리보기</Button>
        </aside>

        <main className="flex-1 overflow-y-auto bg-gray-900 p-5">
          <div className={`mx-auto overflow-hidden rounded-xl border border-gray-800 ${previewMode === "mobile" ? "w-[390px]" : "w-full max-w-4xl"}`}>
            <DemoPreview content={content} name={nameKo} nameEn={nameEn} theme={theme} sectionRefs={sectionRefs} pageUrl={pageUrl} qrUrl={qrUrl} />
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

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="sticky top-14 z-30 border-b border-gray-800 bg-gray-950/90">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-6"><Button variant="ghost" size="sm" onClick={() => goStep(3)}><ArrowLeft size={14} /> 편집으로</Button><span className="text-sm">최종 미리보기</span></div>
      </div>
      <div className="mx-auto flex max-w-6xl justify-center px-4 py-8">
        <div className={`overflow-hidden rounded-xl border border-gray-800 ${previewMode === "mobile" ? "w-[390px]" : "w-full max-w-4xl"}`}>
          <DemoPreview content={content} name={nameKo} nameEn={nameEn} theme={theme} sectionRefs={sectionRefs} pageUrl={pageUrl} qrUrl={qrUrl} />
        </div>
      </div>
      <div className="pb-16 text-center"><Link href="/"><Button>완료</Button></Link></div>
    </div>
  );
}

function ThemeMiniPreview({ name, nameEn, position, theme }: { name: string; nameEn: string; position: string; theme: { color: string; accent: string } }) {
  return (
    <div className="rounded-xl p-6 text-center" style={{ background: theme.color }}>
      <div className="mx-auto mb-4 h-14 w-14 rounded-full border-2" style={{ borderColor: theme.accent }} />
      <p className="text-2xl font-bold text-white">{name || "이름"}</p>
      <p className="text-gray-400">{nameEn || "Name"}</p>
      <p className="mt-1" style={{ color: theme.accent }}>{position || "포지션"}</p>
    </div>
  );
}

function DemoPreview({ content, name, nameEn, theme, sectionRefs, pageUrl, qrUrl }: { content: PageContent; name: string; nameEn: string; theme: { color: string; accent: string }; sectionRefs: Record<ActiveSection, MutableRefObject<HTMLElement | null>>; pageUrl: string; qrUrl: string }) {
  return (
    <div>
      <section ref={sectionRefs.hero} className="px-6 py-16 text-center" style={{ background: theme.color }}>
        {content.hero.heroImageId ? <img src={content.hero.heroImageId} alt="hero" className="mx-auto mb-4 h-24 w-24 rounded-full object-cover" /> : <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full" style={{ background: `${theme.accent}22`, color: theme.accent }}>{name[0]}</div>}
        <h1 className="text-3xl font-bold text-white">{name}</h1><p className="text-gray-400">{nameEn}</p>
      </section>
      <section ref={sectionRefs.profile} className="border-t border-gray-800 px-6 py-12"><h2 className="mb-4 text-xl text-white">프로필</h2>{content.profile.profileImageId && <img src={content.profile.profileImageId} alt="profile" className="mb-4 h-40 w-full rounded-lg object-cover" />}<p className="text-gray-300">{content.profile.intro}</p></section>
      <section ref={sectionRefs.career} className="border-t border-gray-800 px-6 py-12"><h2 className="mb-4 text-xl text-white">경력</h2>{content.career.items.map((item, i) => <div key={i} className="mb-4 rounded-lg border border-gray-800 p-3 text-white">{item.imageId && <img src={item.imageId} alt="career" className="mb-2 h-32 w-full rounded object-cover" />}<p>{item.period} · {item.title}</p><p className="text-sm text-gray-400">{item.description}</p></div>)}</section>
      <section ref={sectionRefs.portfolio} className="border-t border-gray-800 px-6 py-12"><h2 className="mb-4 text-xl text-white">포트폴리오</h2><div className="grid gap-3 md:grid-cols-2">{content.portfolio.photos.map((p, i) => <img key={i} src={p} alt="portfolio" className="h-40 w-full rounded-lg object-cover" />)}</div></section>
      <section ref={sectionRefs.strength} className="border-t border-gray-800 px-6 py-12"><h2 className="mb-4 text-xl text-white">강점</h2><div className="grid gap-3 md:grid-cols-3">{content.strength.cards.map((c, i) => <div key={i} className="rounded-lg border border-gray-800 p-3 text-white"><p>{c.title}</p><p className="text-xs text-gray-400">{c.description}</p></div>)}</div></section>
      <section ref={sectionRefs.contact} className="border-t border-gray-800 px-6 py-12"><h2 className="mb-4 text-xl text-white">연락처</h2>{content.contact.channels.map((c, i) => <p key={i} className="text-gray-300">{c.label || c.type}: {c.value}</p>)}</section>
      <section className="border-t border-gray-800 px-6 py-12 text-center">
        <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300"><QrCode size={14} /> 홈페이지 QR</div>
        <img src={qrUrl} alt="qr" className="mx-auto h-44 w-44 rounded bg-white p-2" />
        <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block text-sm text-blue-300 underline">{pageUrl}</a>
      </section>
    </div>
  );
}

function SectionEditor({ section, content, updateSection }: { section: ActiveSection; content: PageContent; updateSection: <K extends keyof PageContent>(section: K, data: Partial<PageContent[K]>) => void }) {
  if (section === "hero") {
    return <div className="space-y-4"><FormField label="포지션"><Input value={content.hero.position} onChange={(e) => updateSection("hero", { position: e.target.value })} /></FormField><FormField label="한 줄 소개"><Input value={content.hero.tagline} onChange={(e) => updateSection("hero", { tagline: e.target.value })} /></FormField><ImageEditor label="히어로 이미지" value={content.hero.heroImageId} onChange={(url) => updateSection("hero", { heroImageId: url })} /></div>;
  }
  if (section === "profile") {
    return <div className="space-y-4"><FormField label="자기소개"><textarea className="h-28 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm" value={content.profile.intro} onChange={(e) => updateSection("profile", { intro: e.target.value })} /></FormField><ImageEditor label="프로필 이미지" value={content.profile.profileImageId} onChange={(url) => updateSection("profile", { profileImageId: url })} /></div>;
  }
  if (section === "career") {
    return <div><div className="mb-3 flex items-center justify-between"><label className="text-xs text-gray-400">경력</label><button onClick={() => updateSection("career", { items: [...content.career.items, { period: "", title: "", description: "", imageId: "" }] })} className="text-xs text-blue-400"><Plus size={12} className="inline" /> 추가</button></div>{content.career.items.map((item, i) => <div key={i} className="mb-3 space-y-2 rounded-lg border border-gray-800 p-3"><div className="flex justify-end"><button onClick={() => updateSection("career", { items: content.career.items.filter((_, idx) => idx !== i) })}><Trash2 size={13} className="text-gray-500" /></button></div><Input placeholder="기간" value={item.period} onChange={(e) => { const items = [...content.career.items]; items[i] = { ...item, period: e.target.value }; updateSection("career", { items }); }} /><Input placeholder="직함" value={item.title} onChange={(e) => { const items = [...content.career.items]; items[i] = { ...item, title: e.target.value }; updateSection("career", { items }); }} /><Input placeholder="설명" value={item.description} onChange={(e) => { const items = [...content.career.items]; items[i] = { ...item, description: e.target.value }; updateSection("career", { items }); }} /><ImageEditor label="경력 이미지" value={item.imageId || ""} onChange={(url) => { const items = [...content.career.items]; items[i] = { ...item, imageId: url }; updateSection("career", { items }); }} /></div>)}</div>;
  }
  if (section === "portfolio") {
    return <div className="space-y-4"><ImageEditor label="포트폴리오 이미지" value="" onChange={(url) => updateSection("portfolio", { photos: [...content.portfolio.photos, url] })} /><div className="grid grid-cols-2 gap-2">{content.portfolio.photos.map((photo, i) => <div key={i} className="relative"><img src={photo} alt="portfolio" className="h-20 w-full rounded object-cover" /><button onClick={() => updateSection("portfolio", { photos: content.portfolio.photos.filter((_, idx) => idx !== i) })} className="absolute right-1 top-1 rounded bg-black/60 p-1"><Trash2 size={12} /></button></div>)}</div></div>;
  }
  if (section === "strength") {
    return <div><div className="mb-3 flex items-center justify-between"><label className="text-xs text-gray-400">강점 카드</label><button onClick={() => updateSection("strength", { cards: [...content.strength.cards, { icon: "⭐", title: "", description: "" }] })} className="text-xs text-blue-400"><Plus size={12} className="inline" /> 추가</button></div>{content.strength.cards.map((card, i) => <div key={i} className="mb-2 space-y-2 rounded border border-gray-800 p-3"><Input placeholder="제목" value={card.title} onChange={(e) => { const cards = [...content.strength.cards]; cards[i] = { ...card, title: e.target.value }; updateSection("strength", { cards }); }} /><Input placeholder="설명" value={card.description} onChange={(e) => { const cards = [...content.strength.cards]; cards[i] = { ...card, description: e.target.value }; updateSection("strength", { cards }); }} /></div>)}</div>;
  }
  return <div><div className="mb-3 flex items-center justify-between"><label className="text-xs text-gray-400">연락처</label><button onClick={() => updateSection("contact", { channels: [...content.contact.channels, { type: "email", value: "", label: "" }] })} className="text-xs text-blue-400"><Plus size={12} className="inline" /> 추가</button></div>{content.contact.channels.map((ch, i) => <div key={i} className="mb-2 space-y-2 rounded border border-gray-800 p-3"><Select value={ch.type} onChange={(e) => { const channels = [...content.contact.channels]; channels[i] = { ...ch, type: e.target.value as typeof ch.type }; updateSection("contact", { channels }); }}>{["email", "phone", "instagram", "youtube", "other"].map((t) => <option key={t} value={t}>{t}</option>)}</Select><Input placeholder="값" value={ch.value} onChange={(e) => { const channels = [...content.contact.channels]; channels[i] = { ...ch, value: e.target.value }; updateSection("contact", { channels }); }} /></div>)}</div>;
}

function ImageEditor({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const [rawDataUrl, setRawDataUrl] = useState(value);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropSize, setCropSize] = useState(100);
  const [outputWidth, setOutputWidth] = useState(900);
  const [outputHeight, setOutputHeight] = useState(600);

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setRawDataUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const applyCrop = () => {
    if (!rawDataUrl) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const cropW = (img.width * cropSize) / 100;
      const cropH = (img.height * cropSize) / 100;
      const sx = (img.width * cropX) / 100;
      const sy = (img.height * cropY) / 100;
      ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, outputWidth, outputHeight);
      const result = canvas.toDataURL("image/jpeg", 0.9);
      onChange(result);
    };
    img.src = rawDataUrl;
  };

  return (
    <div className="rounded-lg border border-gray-800 p-3">
      <p className="mb-2 text-xs text-gray-400">{label}</p>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-gray-700 px-3 py-1 text-xs"><ImageIcon size={13} /> 이미지 첨부<input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} /></label>
      {rawDataUrl && (
        <div className="mt-3 space-y-2">
          <img src={rawDataUrl} alt="source" className="max-h-28 w-full rounded object-cover" />
          <div className="grid grid-cols-3 gap-2 text-xs"><label>X<input type="range" min={0} max={100} value={cropX} onChange={(e) => setCropX(Number(e.target.value))} /></label><label>Y<input type="range" min={0} max={100} value={cropY} onChange={(e) => setCropY(Number(e.target.value))} /></label><label>영역<input type="range" min={20} max={100} value={cropSize} onChange={(e) => setCropSize(Number(e.target.value))} /></label></div>
          <div className="grid grid-cols-2 gap-2 text-xs"><Input type="number" value={String(outputWidth)} onChange={(e) => setOutputWidth(Number(e.target.value) || 900)} /><Input type="number" value={String(outputHeight)} onChange={(e) => setOutputHeight(Number(e.target.value) || 600)} /></div>
          <Button size="sm" variant="secondary" onClick={applyCrop}><Crop size={13} /> 크기조정 + 자르기 적용</Button>
        </div>
      )}
      {value && <img src={value} alt="result" className="mt-3 max-h-28 w-full rounded border border-gray-800 object-cover" />}
    </div>
  );
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
