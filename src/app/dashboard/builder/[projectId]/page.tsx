"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBuilderStore, ActiveSection } from "@/stores/builderStore";
import { Button, Input, Textarea, FormField, Badge, Select } from "@/components/ui";
import { PRPageRenderer } from "@/components/page/pr-page-renderer";
import { DEFAULT_PAGE_THEME_ID, PAGE_THEME_OPTIONS } from "@/lib/page-themes";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Eye, Send, Monitor, Smartphone, Save,
  Image as ImageIcon, Type, Users, Briefcase, FolderOpen, Star, Phone,
  GripVertical, EyeOff, ChevronDown,
} from "lucide-react";
import Link from "next/link";

const SECTION_META: Record<string, { label: string; icon: typeof Type }> = {
  hero: { label: "히어로", icon: ImageIcon },
  profile: { label: "프로필", icon: Users },
  career: { label: "경력", icon: Briefcase },
  portfolio: { label: "포트폴리오", icon: FolderOpen },
  strength: { label: "강점", icon: Star },
  contact: { label: "연락처", icon: Phone },
};

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  const store = useBuilderStore();

  // Load page data
  useEffect(() => {
    async function load() {
      try {
        // Create page if not exists
        const pagesRes = await fetch("/api/pages");
        const pagesData = await pagesRes.json();
        const pages = pagesData.pages || pagesData;
        let page = pages.find((p: { projectId: string }) => p.projectId === projectId);

        if (!page) {
          const createRes = await fetch("/api/pages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId }),
          });
          if (!createRes.ok) throw new Error("페이지 생성 실패");
          page = await createRes.json();
        }

        // Get project info
        const projRes = await fetch(`/api/projects/${projectId}`);
        const proj = await projRes.json();

        store.init({
          pageId: page.id,
          projectId,
          talentNameKo: proj.talent?.nameKo || "방송인",
          talentNameEn: proj.talent?.nameEn || "Talent",
          theme: page.theme || DEFAULT_PAGE_THEME_ID,
          accentColor: page.accentColor || "",
          draftContent: page.draftContent ? (typeof page.draftContent === "string" ? JSON.parse(page.draftContent) : page.draftContent) : null,
          sectionOrder: page.sectionOrder || [],
          disabledSections: page.disabledSections || [],
        });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "로드 실패");
      }
      setInitLoading(false);
    }
    load();
  }, [projectId]);

  // Auto-save (30s debounce)
  const autoSave = useCallback(async () => {
    const { pageId, draftContent, theme, accentColor, sectionOrder, disabledSections } = useBuilderStore.getState();
    if (!pageId) return;
    store.setSaveState("saving");
    try {
      const res = await fetch(`/api/pages/${pageId}/draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftContent, theme, accentColor, sectionOrder, disabledSections }),
      });
      if (!res.ok) throw new Error();
      store.setSaveState("saved");
    } catch {
      store.setSaveState("error");
    }
  }, []);

  useEffect(() => {
    if (store.saveState !== "unsaved") return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(autoSave, 3000);
    return () => clearTimeout(saveTimer.current);
  }, [store.saveState, autoSave]);

  // Warn on leave
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (store.saveState === "unsaved" || store.saveState === "saving") {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [store.saveState]);

  if (initLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-gray-500 text-sm">빌더 로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-red-400">{error}</p>
        <Button variant="ghost" onClick={() => router.back()}>돌아가기</Button>
      </div>
    );
  }

  const content = store.draftContent[store.activeLocale];

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] -m-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-gray-800 bg-gray-950 shrink-0">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/projects/${projectId}`} className="text-gray-400 hover:text-white">
            <ArrowLeft size={18} />
          </Link>
          <span className="text-sm font-medium text-white">{store.talentNameKo} PR</span>
          <SaveIndicator state={store.saveState} />
        </div>
        <div className="flex items-center gap-2">
          {/* Locale Switch */}
          <div className="flex rounded-lg border border-gray-800 overflow-hidden">
            {(["ko", "en", "zh"] as const).map((l) => (
              <button
                key={l}
                onClick={() => store.setActiveLocale(l)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium transition-colors",
                  store.activeLocale === l ? "bg-white text-gray-900" : "text-gray-500 hover:text-white",
                )}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          {/* Preview Mode */}
          <div className="flex rounded-lg border border-gray-800 overflow-hidden">
            <button
              onClick={() => store.setPreviewMode("desktop")}
              className={cn("p-1.5 transition-colors", store.previewMode === "desktop" ? "bg-gray-800 text-white" : "text-gray-500")}
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => store.setPreviewMode("mobile")}
              className={cn("p-1.5 transition-colors", store.previewMode === "mobile" ? "bg-gray-800 text-white" : "text-gray-500")}
            >
              <Smartphone size={14} />
            </button>
          </div>
          <Select
            value={store.theme}
            onChange={(e) => store.setTheme(e.target.value)}
            className="h-8 w-44 border-gray-800 bg-gray-900 px-2 text-xs"
          >
            {PAGE_THEME_OPTIONS.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.nameKo}
              </option>
            ))}
          </Select>
          <Button variant="secondary" size="sm" onClick={autoSave}>
            <Save size={14} /> 저장
          </Button>
          <Button size="sm" variant="ghost"><Eye size={14} /> 미리보기</Button>
          <Button size="sm"><Send size={14} /> 발행</Button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Section List */}
        <aside className="w-48 border-r border-gray-800 bg-gray-950 py-2 overflow-y-auto shrink-0">
          {store.sectionOrder.filter((s) => s !== "footer").map((sKey) => {
            const meta = SECTION_META[sKey];
            if (!meta) return null;
            const disabled = store.disabledSections.includes(sKey);
            return (
              <button
                key={sKey}
                onClick={() => !disabled && store.setActiveSection(sKey as ActiveSection)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors",
                  store.activeSection === sKey ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800/50",
                  disabled && "opacity-40",
                )}
              >
                <GripVertical size={12} className="text-gray-600" />
                <meta.icon size={14} />
                <span className="flex-1 text-left">{meta.label}</span>
                {disabled && <EyeOff size={12} />}
              </button>
            );
          })}
        </aside>

        {/* Canvas */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-8 flex justify-center">
          <div
            className={cn(
              "overflow-hidden rounded-xl border border-gray-800 min-h-[600px] transition-all",
              store.previewMode === "desktop" ? "w-full max-w-4xl" : "w-[375px]",
            )}
          >
            <PRPageRenderer
              themeId={store.theme}
              accentColor={store.accentColor}
              content={content}
              talentNameKo={store.talentNameKo}
              talentNameEn={store.talentNameEn}
              sectionOrder={store.sectionOrder}
              disabledSections={store.disabledSections}
            />
          </div>
        </main>

        {/* Property Panel */}
        <aside className="w-80 border-l border-gray-800 bg-gray-950 overflow-y-auto shrink-0">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-white">
              {SECTION_META[store.activeSection]?.label || store.activeSection}
            </h3>
          </div>
          <div className="p-4">
            <SectionEditor section={store.activeSection} content={content} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function SaveIndicator({ state }: { state: string }) {
  const map: Record<string, { label: string; color: string }> = {
    saved: { label: "저장됨", color: "text-gray-500" },
    saving: { label: "저장 중...", color: "text-amber-400" },
    unsaved: { label: "변경사항 있음", color: "text-amber-400" },
    error: { label: "저장 실패", color: "text-red-400" },
  };
  const s = map[state] || map.saved;
  return <span className={`text-xs ${s.color}`}>{s.label}</span>;
}

function CanvasPreview({ content, talentName }: { content: import("@/types/page-content").PageContent; talentName: string }) {
  return (
    <div className="p-8 space-y-8">
      {/* Hero */}
      <section className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-10 text-center">
        <div className="w-24 h-24 rounded-full bg-gray-700 mx-auto mb-4 flex items-center justify-center">
          <ImageIcon size={32} className="text-gray-500" />
        </div>
        <h1 className="text-2xl font-bold text-white">{talentName}</h1>
        <p className="text-gray-400 mt-1">{content.hero.position || "포지션"}</p>
        <p className="text-gray-500 mt-2 italic">{content.hero.tagline || "태그라인을 입력하세요"}</p>
      </section>

      {/* Profile */}
      <section className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-3">프로필</h2>
        <p className="text-sm text-gray-400 whitespace-pre-wrap">
          {content.profile.intro || "자기소개를 작성해 주세요..."}
        </p>
      </section>

      {/* Career */}
      {content.career.items.length > 0 && (
        <section className="rounded-xl bg-gray-900 border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">경력</h2>
          <div className="space-y-3">
            {content.career.items.map((c, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-xs text-gray-500 w-24 shrink-0">{c.period}</span>
                <div>
                  <p className="text-sm font-medium text-white">{c.title}</p>
                  {c.description && <p className="text-xs text-gray-400">{c.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      {content.contact.channels.length > 0 && (
        <section className="rounded-xl bg-gray-900 border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">연락처</h2>
          <div className="space-y-2">
            {content.contact.channels.map((ch, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                <Badge color="blue">{ch.type}</Badge>
                <span>{ch.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

void CanvasPreview;

function SectionEditor({ section, content }: { section: ActiveSection; content: import("@/types/page-content").PageContent }) {
  const store = useBuilderStore();

  switch (section) {
    case "hero":
      return (
        <div className="space-y-4">
          <FormField label="태그라인" hint="방송인을 소개하는 한 줄">
            <Input
              value={content.hero.tagline}
              onChange={(e) => store.updateSection("hero", { tagline: e.target.value })}
              placeholder="신뢰를 전하는 목소리"
            />
          </FormField>
          <FormField label="포지션">
            <Input
              value={content.hero.position}
              onChange={(e) => store.updateSection("hero", { position: e.target.value })}
              placeholder="KBS 아나운서"
            />
          </FormField>
          <FormField label="CTA 버튼 1">
            <Input
              value={content.hero.ctaPrimary.label}
              onChange={(e) => store.updateSection("hero", { ctaPrimary: { ...content.hero.ctaPrimary, label: e.target.value } })}
            />
          </FormField>
          <FormField label="CTA 버튼 2">
            <Input
              value={content.hero.ctaSecondary.label}
              onChange={(e) => store.updateSection("hero", { ctaSecondary: { ...content.hero.ctaSecondary, label: e.target.value } })}
            />
          </FormField>
        </div>
      );

    case "profile":
      return (
        <div className="space-y-4">
          <FormField label="자기소개">
            <Textarea
              value={content.profile.intro}
              onChange={(e) => store.updateSection("profile", { intro: e.target.value })}
              placeholder="방송인의 이력과 소개를 작성하세요..."
              rows={6}
            />
          </FormField>
        </div>
      );

    case "career":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">경력 항목</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const items = [...content.career.items, { period: "", title: "", description: "" }];
                store.updateSection("career", { items });
              }}
            >
              + 추가
            </Button>
          </div>
          {content.career.items.map((item, i) => (
            <div key={i} className="space-y-2 p-3 rounded-lg bg-gray-900 border border-gray-800">
              <Input
                placeholder="기간 (2024~현재)"
                value={item.period}
                onChange={(e) => {
                  const items = [...content.career.items];
                  items[i] = { ...items[i], period: e.target.value };
                  store.updateSection("career", { items });
                }}
              />
              <Input
                placeholder="직책/활동"
                value={item.title}
                onChange={(e) => {
                  const items = [...content.career.items];
                  items[i] = { ...items[i], title: e.target.value };
                  store.updateSection("career", { items });
                }}
              />
              <Input
                placeholder="설명 (선택)"
                value={item.description}
                onChange={(e) => {
                  const items = [...content.career.items];
                  items[i] = { ...items[i], description: e.target.value };
                  store.updateSection("career", { items });
                }}
              />
            </div>
          ))}
        </div>
      );

    case "contact":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">연락 채널</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const channels = [...content.contact.channels, { type: "email" as const, value: "", label: "" }];
                store.updateSection("contact", { channels });
              }}
            >
              + 추가
            </Button>
          </div>
          {content.contact.channels.map((ch, i) => (
            <div key={i} className="flex gap-2">
              <select
                value={ch.type}
                onChange={(e) => {
                  const channels = [...content.contact.channels];
                  channels[i] = { ...channels[i], type: e.target.value as typeof ch.type };
                  store.updateSection("contact", { channels });
                }}
                className="w-24 h-10 rounded-lg border border-gray-700 bg-gray-900 px-2 text-sm text-white"
              >
                {["email", "kakao", "instagram", "youtube", "tiktok", "blog", "phone", "other"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <Input
                className="flex-1"
                placeholder="값"
                value={ch.value}
                onChange={(e) => {
                  const channels = [...content.contact.channels];
                  channels[i] = { ...channels[i], value: e.target.value };
                  store.updateSection("contact", { channels });
                }}
              />
            </div>
          ))}
        </div>
      );

    default:
      return <p className="text-sm text-gray-500">이 섹션의 편집 패널 준비 중...</p>;
  }
}
