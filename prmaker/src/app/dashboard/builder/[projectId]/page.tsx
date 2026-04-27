"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { ALL_THEMES, getTheme } from "@/themes";
import { PRPageRenderer } from "@/components/pr-page/PRPageRenderer";
import { PageContent, DraftContent } from "@/types/page-content";
import Link from "next/link";

const EMPTY_CONTENT: PageContent = {
  hero: { tagline: "", position: "", heroImageId: "", ctaPrimary: { label: "포트폴리오 보기", action: "portfolio" }, ctaSecondary: { label: "연락하기", action: "contact" } },
  profile: { intro: "", profileImageId: "", infoItems: [], strengths: [] },
  career: { items: [] },
  portfolio: { videos: [], photos: [], audioSamples: [] },
  strength: { cards: [] },
  contact: { channels: [] },
};

interface ProjectData {
  id: string;
  page: {
    id: string;
    theme: string;
    accentColor: string | null;
    status: string;
    previewToken: string;
    draftContent: DraftContent | null;
    sectionOrder: string[];
    disabledSections: string[];
  } | null;
  talent: { nameKo: string; nameEn: string };
}

type SaveState = "saved" | "saving" | "unsaved" | "error";
type ActiveLocale = "ko" | "en" | "zh";
type ActiveSection = "hero" | "profile" | "career" | "portfolio" | "strength" | "contact";

export default function BuilderPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageId, setPageId] = useState<string | null>(null);

  const [theme, setTheme] = useState("anchor-clean");
  const [accentColor, setAccentColor] = useState("");
  const [activeLocale, setActiveLocale] = useState<ActiveLocale>("ko");
  const [activeSection, setActiveSection] = useState<ActiveSection>("hero");
  const [draftContent, setDraftContent] = useState<DraftContent>({ ko: { ...EMPTY_CONTENT }, en: { ...EMPTY_CONTENT }, zh: { ...EMPTY_CONTENT } });
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [publishError, setPublishError] = useState<string[]>([]);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then(r => r.json())
      .then(async (data: ProjectData) => {
        setProjectData(data);

        if (!data.page) {
          // Create page if it doesn't exist
          const res = await fetch("/api/pages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId, theme: "anchor-clean" }),
          });
          const page = await res.json();
          setPageId(page.id);
          setTheme(page.theme || "anchor-clean");
        } else {
          setPageId(data.page.id);
          setTheme(data.page.theme || "anchor-clean");
          setAccentColor(data.page.accentColor || "");
          if (data.page.draftContent) {
            setDraftContent(data.page.draftContent as DraftContent);
          }
        }
        setLoading(false);
      });
  }, [projectId]);

  const saveDraft = useCallback(async (content: DraftContent) => {
    if (!pageId) return;
    setSaveState("saving");
    const res = await fetch(`/api/pages/${pageId}/draft`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draftContent: content, theme, accentColor }),
    });
    setSaveState(res.ok ? "saved" : "error");
  }, [pageId, theme, accentColor]);

  // Auto-save every 30 seconds (초기 로딩 시 미저장 상태 표시 방지)
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaveState("unsaved");
    autoSaveTimer.current = setTimeout(() => {
      saveDraft(draftContent);
    }, 30000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [draftContent, saveDraft]);

  const updateSection = (section: keyof PageContent, data: Partial<PageContent[keyof PageContent]>) => {
    setDraftContent(prev => ({
      ...prev,
      [activeLocale]: {
        ...prev[activeLocale],
        [section]: { ...(prev[activeLocale][section] as object), ...data },
      },
    }));
  };

  const handlePreview = async () => {
    if (!pageId) return;
    await saveDraft(draftContent);
    const res = await fetch(`/api/pages/${pageId}/preview`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      window.open(`/preview/${data.previewToken}`, "_blank");
    }
  };

  const handlePublish = async () => {
    if (!pageId) return;
    const res = await fetch(`/api/pages/${pageId}/publish`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setPublishError(data.errors || [data.error]);
    } else {
      window.open(`/p/${data.slug}`, "_blank");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  const currentTheme = getTheme(theme);
  const currentContent = draftContent[activeLocale] || EMPTY_CONTENT;
  const talent = projectData?.talent;

  const SECTIONS = [
    { key: "hero", label: "히어로", fixed: "first", icon: "🖼️" },
    { key: "profile", label: "프로필", icon: "👤" },
    { key: "career", label: "경력", icon: "💼" },
    { key: "portfolio", label: "포트폴리오", icon: "🎬" },
    { key: "strength", label: "강점", icon: "⚡" },
    { key: "contact", label: "연락처", fixed: "last", icon: "📞" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Left Panel - Sections */}
      <div className="w-52 bg-white border-r flex flex-col shrink-0">
        <div className="px-4 py-3 border-b">
          <Link href={`/dashboard/projects/${projectId}`} className="text-xs text-gray-500 hover:text-gray-700">← 프로젝트로</Link>
          <p className="font-semibold text-sm mt-1">{projectData?.talent.nameKo}</p>
        </div>
        <div className="flex-1 p-2 overflow-y-auto">
          <p className="text-xs font-medium text-gray-400 uppercase px-2 mb-2">섹션</p>
          {SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key as ActiveSection)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${activeSection === s.key ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
              {s.fixed && <span className="ml-auto text-xs text-gray-300">고정</span>}
            </button>
          ))}
        </div>

        {/* Save state */}
        <div className="px-4 py-3 border-t text-xs text-gray-400">
          {saveState === "saving" && "저장 중..."}
          {saveState === "saved" && "✓ 저장됨"}
          {saveState === "unsaved" && "미저장"}
          {saveState === "error" && "⚠ 저장 실패"}
        </div>
      </div>

      {/* Center - Preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b px-4 py-2 flex items-center gap-3">
          <select value={theme} onChange={e => setTheme(e.target.value)}
            className="text-sm border rounded px-2 py-1.5 bg-white">
            {ALL_THEMES.map(t => <option key={t.id} value={t.id}>{t.nameKo}</option>)}
          </select>
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-500">강조색</label>
            <input type="color" value={accentColor || currentTheme.colors.accent}
              onChange={e => setAccentColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border" />
          </div>
          <div className="flex gap-1 border rounded overflow-hidden">
            {(["ko", "en", "zh"] as const).map(l => (
              <button key={l} onClick={() => setActiveLocale(l)}
                className={`px-3 py-1 text-xs ${activeLocale === l ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-1 border rounded overflow-hidden ml-auto">
            <button onClick={() => setPreviewMode("desktop")} className={`px-2 py-1 text-xs ${previewMode === "desktop" ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}>🖥️</button>
            <button onClick={() => setPreviewMode("mobile")} className={`px-2 py-1 text-xs ${previewMode === "mobile" ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}>📱</button>
          </div>
          <button onClick={() => saveDraft(draftContent)}
            className="px-3 py-1.5 text-xs border rounded hover:bg-gray-50">저장</button>
          <button onClick={handlePreview}
            className="px-3 py-1.5 text-xs bg-yellow-400 text-yellow-900 rounded hover:bg-yellow-500 font-medium">미리보기 생성</button>
          <button onClick={handlePublish}
            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 font-medium">배포</button>
        </div>

        {publishError.length > 0 && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2">
            <p className="text-xs text-red-700 font-medium">배포 조건 미충족:</p>
            <ul className="list-disc list-inside text-xs text-red-600">
              {publishError.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        {/* Preview */}
        <div className="flex-1 overflow-y-auto bg-gray-200 flex justify-center p-4">
          <div className={`bg-white shadow-xl overflow-y-auto ${previewMode === "mobile" ? "w-[390px]" : "w-full max-w-5xl"}`}>
            <PRPageRenderer
              content={currentContent}
              theme={currentTheme}
              accentColor={accentColor || undefined}
              talentName={talent?.nameKo || "방송인"}
              talentNameEn={talent?.nameEn}
              sectionOrder={["hero", "profile", "career", "portfolio", "strength", "contact", "footer"]}
              disabledSections={[]}
              watermark={true}
              locale={activeLocale}
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Editor */}
      <div className="w-72 bg-white border-l flex flex-col shrink-0">
        <div className="px-4 py-3 border-b">
          <p className="font-semibold text-sm">{SECTIONS.find(s => s.key === activeSection)?.label} 편집</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {activeSection === "hero" && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">포지션</label>
                <input value={currentContent.hero.position}
                  onChange={e => updateSection("hero", { position: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm" placeholder="쇼호스트" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">한 줄 소개 ({currentContent.hero.tagline.length}/30)</label>
                <input value={currentContent.hero.tagline} maxLength={50}
                  onChange={e => updateSection("hero", { tagline: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm" placeholder="30자 이내 권장" />
                {currentContent.hero.tagline.length > 30 && <p className="text-xs text-orange-500 mt-1">30자 이내 권장</p>}
              </div>
            </>
          )}
          {activeSection === "profile" && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">자기소개 ({currentContent.profile.intro.length}/500)</label>
                <textarea value={currentContent.profile.intro} rows={6}
                  onChange={e => updateSection("profile", { intro: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm resize-y"
                  placeholder="500자 이내 권장" />
                {currentContent.profile.intro.length > 500 && <p className="text-xs text-orange-500 mt-1">500자 이내 권장</p>}
              </div>
            </>
          )}
          {activeSection === "contact" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600">연락처 채널</label>
                <button onClick={() => {
                  const channels = [...currentContent.contact.channels, { type: "email" as const, value: "", label: "" }];
                  updateSection("contact", { channels });
                }} className="text-xs text-blue-600 hover:underline">+ 추가</button>
              </div>
              {currentContent.contact.channels.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-3">채널을 추가하세요.</p>
              )}
              {currentContent.contact.channels.map((ch, i) => (
                <div key={i} className="border rounded-lg p-3 mb-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <select
                      value={ch.type}
                      onChange={e => {
                        const channels = [...currentContent.contact.channels];
                        channels[i] = { ...ch, type: e.target.value as typeof ch.type };
                        updateSection("contact", { channels });
                      }}
                      className="text-xs border rounded px-2 py-1 bg-white"
                    >
                      <option value="email">이메일</option>
                      <option value="phone">전화</option>
                      <option value="kakao">카카오톡</option>
                      <option value="instagram">인스타그램</option>
                      <option value="youtube">유튜브</option>
                      <option value="navertv">네이버TV</option>
                      <option value="website">웹사이트</option>
                      <option value="other">기타</option>
                    </select>
                    <button onClick={() => {
                      const channels = currentContent.contact.channels.filter((_, idx) => idx !== i);
                      updateSection("contact", { channels });
                    }} className="text-red-400 hover:text-red-600 text-xs">삭제</button>
                  </div>
                  <input
                    value={ch.value}
                    placeholder={ch.type === "email" ? "example@email.com" : ch.type === "phone" ? "010-0000-0000" : "URL 또는 아이디"}
                    onChange={e => {
                      const channels = [...currentContent.contact.channels];
                      channels[i] = { ...ch, value: e.target.value };
                      updateSection("contact", { channels });
                    }}
                    className="w-full px-2 py-1.5 border rounded text-xs"
                  />
                  <input
                    value={ch.label}
                    placeholder="표시 이름 (예: 공식 이메일)"
                    onChange={e => {
                      const channels = [...currentContent.contact.channels];
                      channels[i] = { ...ch, label: e.target.value };
                      updateSection("contact", { channels });
                    }}
                    className="w-full px-2 py-1.5 border rounded text-xs"
                  />
                </div>
              ))}
            </div>
          )}
          {activeSection === "career" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-gray-600">경력 항목</label>
                <button
                  onClick={() => {
                    const items = [...currentContent.career.items, { period: "", title: "", description: "" }];
                    updateSection("career", { items });
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  + 추가
                </button>
              </div>
              {currentContent.career.items.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">경력 항목이 없습니다.</p>
              )}
              {currentContent.career.items.map((item, i) => (
                <div key={i} className="border rounded-lg p-3 mb-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">#{i + 1}</span>
                    <button
                      onClick={() => {
                        const items = currentContent.career.items.filter((_, idx) => idx !== i);
                        updateSection("career", { items });
                      }}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      삭제
                    </button>
                  </div>
                  <input
                    value={item.period}
                    onChange={e => {
                      const items = [...currentContent.career.items];
                      items[i] = { ...item, period: e.target.value };
                      updateSection("career", { items });
                    }}
                    placeholder="기간 (예: 2020.03 ~ 2023.06)"
                    className="w-full px-2 py-1.5 border rounded text-xs"
                  />
                  <input
                    value={item.title}
                    onChange={e => {
                      const items = [...currentContent.career.items];
                      items[i] = { ...item, title: e.target.value };
                      updateSection("career", { items });
                    }}
                    placeholder="소속/역할 (예: OO방송국 리포터)"
                    className="w-full px-2 py-1.5 border rounded text-xs"
                  />
                  <textarea
                    value={item.description}
                    onChange={e => {
                      const items = [...currentContent.career.items];
                      items[i] = { ...item, description: e.target.value };
                      updateSection("career", { items });
                    }}
                    placeholder={`설명 (${item.description.length}/200)`}
                    rows={3}
                    maxLength={300}
                    className="w-full px-2 py-1.5 border rounded text-xs resize-y"
                  />
                  {item.description.length > 200 && (
                    <p className="text-xs text-orange-500">200자 이내 권장</p>
                  )}
                </div>
              ))}
            </div>
          )}
          {activeSection === "portfolio" && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-600">방송 영상 URL</label>
                  <button
                    onClick={() => {
                      const videos = [...currentContent.portfolio.videos, { url: "", platform: "youtube" as const, title: "" }];
                      updateSection("portfolio", { videos });
                    }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    + 추가
                  </button>
                </div>
                {currentContent.portfolio.videos.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">영상 없음</p>
                )}
                {currentContent.portfolio.videos.map((v, i) => (
                  <div key={i} className="border rounded-lg p-3 mb-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <select
                        value={v.platform}
                        onChange={e => {
                          const videos = [...currentContent.portfolio.videos];
                          videos[i] = { ...v, platform: e.target.value as "youtube" | "navertv" };
                          updateSection("portfolio", { videos });
                        }}
                        className="text-xs border rounded px-2 py-1 bg-white"
                      >
                        <option value="youtube">YouTube</option>
                        <option value="navertv">네이버TV</option>
                      </select>
                      <button
                        onClick={() => {
                          const videos = currentContent.portfolio.videos.filter((_, idx) => idx !== i);
                          updateSection("portfolio", { videos });
                        }}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        삭제
                      </button>
                    </div>
                    <input
                      value={v.url}
                      onChange={e => {
                        const videos = [...currentContent.portfolio.videos];
                        videos[i] = { ...v, url: e.target.value };
                        updateSection("portfolio", { videos });
                      }}
                      placeholder="https://youtu.be/..."
                      className="w-full px-2 py-1.5 border rounded text-xs"
                    />
                    <input
                      value={v.title}
                      onChange={e => {
                        const videos = [...currentContent.portfolio.videos];
                        videos[i] = { ...v, title: e.target.value };
                        updateSection("portfolio", { videos });
                      }}
                      placeholder="영상 제목"
                      className="w-full px-2 py-1.5 border rounded text-xs"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">포트폴리오 사진 ID</label>
                <p className="text-xs text-gray-400">사진은 자료 제출 또는 업로드를 통해 추가됩니다.</p>
                {currentContent.portfolio.photos.length > 0 && (
                  <p className="text-xs text-gray-600 mt-1">{currentContent.portfolio.photos.length}장 등록됨</p>
                )}
              </div>
            </div>
          )}
          {activeSection === "strength" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-gray-600">강점 카드</label>
                <button
                  onClick={() => {
                    const cards = [...currentContent.strength.cards, { icon: "⭐", title: "", description: "" }];
                    updateSection("strength", { cards });
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  + 추가
                </button>
              </div>
              {currentContent.strength.cards.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">강점 카드가 없습니다.</p>
              )}
              {currentContent.strength.cards.map((card, i) => (
                <div key={i} className="border rounded-lg p-3 mb-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">카드 #{i + 1}</span>
                    <button
                      onClick={() => {
                        const cards = currentContent.strength.cards.filter((_, idx) => idx !== i);
                        updateSection("strength", { cards });
                      }}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      삭제
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={card.icon}
                      onChange={e => {
                        const cards = [...currentContent.strength.cards];
                        cards[i] = { ...card, icon: e.target.value };
                        updateSection("strength", { cards });
                      }}
                      placeholder="🎤"
                      className="w-14 px-2 py-1.5 border rounded text-center text-sm"
                    />
                    <input
                      value={card.title}
                      onChange={e => {
                        const cards = [...currentContent.strength.cards];
                        cards[i] = { ...card, title: e.target.value };
                        updateSection("strength", { cards });
                      }}
                      placeholder="강점 제목"
                      className="flex-1 px-2 py-1.5 border rounded text-xs"
                    />
                  </div>
                  <textarea
                    value={card.description}
                    onChange={e => {
                      const cards = [...currentContent.strength.cards];
                      cards[i] = { ...card, description: e.target.value };
                      updateSection("strength", { cards });
                    }}
                    placeholder={`설명 (${card.description.length}/100)`}
                    rows={2}
                    maxLength={150}
                    className="w-full px-2 py-1.5 border rounded text-xs resize-y"
                  />
                  {card.description.length > 100 && (
                    <p className="text-xs text-orange-500">100자 이내 권장</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
