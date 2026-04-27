# Castfolio v2 — 기술 구현 상세 기록

**작성일:** 2026-03-16
**범위:** Phase 4-6 (Zustand, Tiptap, 페이지 완성)

---

## 1. Zustand 빌더 스토어 구현

### 1-1. 스토어 정의
**파일:** `src/stores/builderStore.ts`

```typescript
import { create } from "zustand";
import { PageContent, DraftContent } from "@/types/page-content";

export const EMPTY_CONTENT: PageContent = {
  hero: {
    tagline: "",
    position: "",
    heroImageId: "",
    ctaPrimary: { label: "포트폴리오 보기", action: "portfolio" },
    ctaSecondary: { label: "연락하기", action: "contact" },
  },
  profile: { intro: "", profileImageId: "", infoItems: [], strengths: [] },
  career: { items: [] },
  portfolio: { videos: [], photos: [], audioSamples: [] },
  strength: { cards: [] },
  contact: { channels: [] },
};

const DEFAULT_SECTION_ORDER = ["hero", "profile", "career", "portfolio", "strength", "contact", "footer"];

export type SaveState = "saved" | "saving" | "unsaved" | "error";
export type ActiveLocale = "ko" | "en" | "zh";
export type PreviewMode = "desktop" | "mobile";
export type ActiveSection = "hero" | "profile" | "career" | "portfolio" | "strength" | "contact";

interface BuilderStore {
  // 페이지 메타
  pageId: string | null;
  projectId: string | null;
  talentNameKo: string;
  talentNameEn: string;

  // 디자인
  theme: string;
  accentColor: string;

  // 편집 상태
  activeLocale: ActiveLocale;
  activeSection: ActiveSection;
  previewMode: PreviewMode;

  // 콘텐츠
  draftContent: DraftContent;

  // 섹션 관리
  sectionOrder: string[];
  disabledSections: string[];

  // 저장 상태
  saveState: SaveState;

  // publish 에러
  publishErrors: string[];

  // 액션
  init: (data: {
    pageId: string;
    projectId: string;
    talentNameKo: string;
    talentNameEn: string;
    theme: string;
    accentColor: string;
    draftContent: DraftContent | null;
    sectionOrder: string[];
    disabledSections: string[];
  }) => void;

  setTheme: (theme: string) => void;
  setAccentColor: (color: string) => void;
  setActiveLocale: (locale: ActiveLocale) => void;
  setActiveSection: (section: ActiveSection) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setSaveState: (state: SaveState) => void;
  setPublishErrors: (errors: string[]) => void;

  updateSection: <K extends keyof PageContent>(
    section: K,
    data: Partial<PageContent[K]>
  ) => void;
  setSectionOrder: (order: string[]) => void;
  toggleSection: (sectionKey: string) => void;
}

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  // 초기값
  pageId: null,
  projectId: null,
  talentNameKo: "방송인",
  talentNameEn: "Talent",
  theme: "anchor-clean",
  accentColor: "",
  activeLocale: "ko",
  activeSection: "hero",
  previewMode: "desktop",
  draftContent: {
    ko: { ...EMPTY_CONTENT },
    en: { ...EMPTY_CONTENT },
    zh: { ...EMPTY_CONTENT },
  },
  sectionOrder: DEFAULT_SECTION_ORDER,
  disabledSections: [],
  saveState: "saved",
  publishErrors: [],

  // init 액션
  init: ({ pageId, projectId, talentNameKo, talentNameEn, theme, accentColor, draftContent, sectionOrder, disabledSections }) => {
    set({
      pageId,
      projectId,
      talentNameKo,
      talentNameEn,
      theme,
      accentColor,
      draftContent: draftContent ?? {
        ko: { ...EMPTY_CONTENT },
        en: { ...EMPTY_CONTENT },
        zh: { ...EMPTY_CONTENT },
      },
      sectionOrder: sectionOrder.length > 0 ? sectionOrder : DEFAULT_SECTION_ORDER,
      disabledSections,
      saveState: "saved",
    });
  },

  setTheme: (theme) => set({ theme, saveState: "unsaved" }),
  setAccentColor: (accentColor) => set({ accentColor, saveState: "unsaved" }),
  setActiveLocale: (activeLocale) => set({ activeLocale }),
  setActiveSection: (activeSection) => set({ activeSection }),
  setPreviewMode: (previewMode) => set({ previewMode }),
  setSaveState: (saveState) => set({ saveState }),
  setPublishErrors: (publishErrors) => set({ publishErrors }),

  updateSection: (section, data) => {
    const { activeLocale, draftContent } = get();
    const current = draftContent[activeLocale];
    set({
      draftContent: {
        ...draftContent,
        [activeLocale]: {
          ...current,
          [section]: { ...(current[section] as object), ...data },
        },
      },
      saveState: "unsaved",
    });
  },

  setSectionOrder: (sectionOrder) => set({ sectionOrder, saveState: "unsaved" }),

  toggleSection: (sectionKey) => {
    const { disabledSections } = get();
    const isDisabled = disabledSections.includes(sectionKey);
    set({
      disabledSections: isDisabled
        ? disabledSections.filter(s => s !== sectionKey)
        : [...disabledSections, sectionKey],
      saveState: "unsaved",
    });
  },
}));
```

### 1-2. 빌더 페이지에서 사용

```typescript
const {
  pageId, projectId, talentNameKo, talentNameEn,
  theme, accentColor, activeLocale, activeSection, previewMode,
  draftContent, sectionOrder, disabledSections, saveState, publishErrors,
  init, setTheme, setAccentColor, setActiveLocale, setActiveSection,
  setPreviewMode, setSaveState, setPublishErrors, updateSection,
  setSectionOrder, toggleSection,
} = useBuilderStore();

// 섹션 업데이트 예시
updateSection("hero", { position: "쇼호스트" });

// 섹션 토글
toggleSection("career");

// 저장 상태 변경
setSaveState("saving");
```

### 1-3. 자동 저장 로직

```typescript
// 초기 로드 플래그
const isInitialLoad = useRef(true);

// 30초 자동 저장
useEffect(() => {
  if (isInitialLoad.current) {
    isInitialLoad.current = false;
    return;
  }

  if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

  autoSaveTimer.current = setTimeout(saveDraft, 30000);

  return () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
  };
}, [draftContent, theme, accentColor, saveDraft]);

// 미저장 경고
useEffect(() => {
  const handler = (e: BeforeUnloadEvent) => {
    if (saveState === "unsaved" || saveState === "saving") {
      e.preventDefault();
      e.returnValue = "저장하지 않은 내용이 있습니다.";
    }
  };
  window.addEventListener("beforeunload", handler);
  return () => window.removeEventListener("beforeunload", handler);
}, [saveState]);
```

---

## 2. Tiptap WYSIWYG 에디터 구현

### 2-1. RichTextEditor 컴포넌트
**파일:** `src/components/builder/RichTextEditor.tsx`

```typescript
"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  maxLength,
  className = "",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        code: false,
        horizontalRule: false,
        heading: false,
        blockquote: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || "내용을 입력하세요...",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[80px] px-3 py-2",
      },
    },
  });

  // 외부 값 변경 동기화 (locale 전환 등)
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const textLength = editor.state.doc.textContent.length;

  return (
    <div className={`border rounded-md overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b bg-gray-50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="굵게 (Ctrl+B)"
        >
          <strong className="text-xs">B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="기울임 (Ctrl+I)"
        >
          <em className="text-xs">I</em>
        </ToolbarButton>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="글머리 기호"
        >
          <span className="text-xs">≡</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="번호 목록"
        >
          <span className="text-xs">1.</span>
        </ToolbarButton>
        <div className="ml-auto text-xs text-gray-400">
          {maxLength ? (
            <span className={textLength > maxLength ? "text-orange-500" : ""}>
              {textLength}/{maxLength}
            </span>
          ) : (
            <span>{textLength}자</span>
          )}
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Warning */}
      {maxLength && textLength > maxLength && (
        <p className="text-xs text-orange-500 px-3 py-1 bg-orange-50">
          {maxLength}자 이내 권장
        </p>
      )}
    </div>
  );
}

function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
        active
          ? "bg-gray-900 text-white"
          : "hover:bg-gray-200 text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}
```

### 2-2. 패키지 설치

```bash
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
```

### 2-3. 빌더에서 적용

```typescript
{/* Profile 소개 */}
<RichTextEditor
  value={currentContent.profile.intro}
  onChange={(html) => updateSection("profile", { intro: html })}
  placeholder="500자 이내 권장"
  maxLength={500}
/>

{/* Career 설명 */}
<RichTextEditor
  value={item.description}
  onChange={(html) => {
    const items = [...currentContent.career.items];
    items[i] = { ...item, description: html };
    updateSection("career", { items });
  }}
  placeholder="설명"
  maxLength={200}
/>

{/* Strength 설명 */}
<RichTextEditor
  value={card.description}
  onChange={(html) => {
    const cards = [...currentContent.strength.cards];
    cards[i] = { ...card, description: html };
    updateSection("strength", { cards });
  }}
  placeholder="설명"
  maxLength={100}
/>
```

---

## 3. 이미지 업로더 개선

### 3-1. ImageUploader 업데이트

**변경사항:**
```typescript
// Before
interface ImageUploaderProps {
  mediaType: "HERO_PHOTO" | "PROFILE_PHOTO" | "PORTFOLIO_PHOTO";
  onUpload: (assetId: string, previewUrl: string) => void;
}

// After
interface ImageUploaderProps {
  mediaType: string;  // 더 유연함
  onUpload: (assetId: string, previewUrl?: string) => void;  // previewUrl 옵셔널
  className?: string;  // className 지원
}
```

### 3-2. 빌더에서 사용

```typescript
// Hero 이미지
<ImageUploader
  label="히어로 이미지"
  currentImageId={currentContent.hero.heroImageId}
  onUpload={(assetId) => updateSection("hero", { heroImageId: assetId })}
  onRemove={() => updateSection("hero", { heroImageId: "" })}
  projectId={projectId}
  mediaType="HERO_PHOTO"
/>

// Portfolio 사진 (배열)
<ImageUploader
  label="사진 추가"
  onUpload={(assetId) => {
    const photos = [...currentContent.portfolio.photos, assetId];
    updateSection("portfolio", { photos });
  }}
  projectId={projectId}
  mediaType="PORTFOLIO_PHOTO"
  className="mt-2"
/>
```

---

## 4. 빌더 페이지 전면 리팩토링

### 4-1. 이전 구조 (useState 기반)

```typescript
const [theme, setTheme] = useState("anchor-clean");
const [accentColor, setAccentColor] = useState("");
const [activeLocale, setActiveLocale] = useState<ActiveLocale>("ko");
const [activeSection, setActiveSection] = useState<ActiveSection>("hero");
const [draftContent, setDraftContent] = useState<DraftContent>({ ... });
const [saveState, setSaveState] = useState<SaveState>("saved");
// ... 10+ 개의 useState
```

### 4-2. 새로운 구조 (Zustand)

```typescript
const {
  pageId, projectId, talentNameKo, talentNameEn,
  theme, accentColor, activeLocale, activeSection, previewMode,
  draftContent, sectionOrder, disabledSections, saveState, publishErrors,
  init, setTheme, setAccentColor, setActiveLocale, ...actions
} = useBuilderStore();
```

**장점:**
- ✅ 상태 관리 중앙화
- ✅ 클로저 버그 제거
- ✅ 리렌더링 최적화
- ✅ 지속성 (LocalStorage 확장 가능)

### 4-3. 섹션 토글 기능

```typescript
{SECTIONS.map(s => {
  const isDisabled = disabledSections.includes(s.key);
  return (
    <div key={s.key} className="flex items-center gap-1 mb-1">
      {/* 섹션 클릭 */}
      <button
        onClick={() => setActiveSection(s.key as ActiveSection)}
        className={...}
      >
        {s.label}
      </button>

      {/* 활성화/비활성화 토글 */}
      {!s.fixed && (
        <button
          onClick={() => toggleSection(s.key)}
          className={isDisabled ? "...disabled" : "...enabled"}
        >
          {isDisabled ? "+" : "−"}
        </button>
      )}
    </div>
  );
})}
```

**동작:**
1. 사용자가 토글 버튼 클릭
2. `toggleSection(sectionKey)` 호출
3. `disabledSections` 배열 업데이트
4. `saveState: "unsaved"` 설정
5. 30초 후 자동 저장 (DB에 반영)

---

## 5. API 개선 사항

### 5-1. 주문 조회 API (신규)
**파일:** `src/app/api/orders/[id]/route.ts`

```typescript
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  // 안전한 인증 (try/catch)
  let user: Awaited<ReturnType<typeof requireUser>>;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 자신의 주문만 조회
  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      project: {
        include: {
          talent: { select: { nameKo: true, nameEn: true } },
          page: { select: { id: true, slug: true, status: true } },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
```

### 5-2. 언어 설정 API (신규)
**파일:** `src/app/api/locale/route.ts`

```typescript
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { locale } = await request.json();

  if (!["ko", "en", "zh"].includes(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  (await cookies()).set("cf_locale", locale, {
    maxAge: 60 * 60 * 24 * 365, // 1년
    path: "/",
  });

  return response;
}
```

### 5-3. Page 생성 API 개선 (slug 충돌 재시도)
**파일:** `src/app/api/pages/route.ts`

```typescript
// Slug 충돌 재시도 로직
let page;
for (let attempt = 0; attempt < 3; attempt++) {
  const slug = baseName + "-" + generateSlugSuffix(6);
  try {
    page = await prisma.page.create({
      data: {
        projectId,
        slug,
        theme: theme || "anchor-clean",
        accentColor,
        status: "DRAFT",
        contentKo: {},
        contentEn: {},
        contentCn: {},
      },
    });
    break;  // 성공하면 루프 탈출
  } catch (e: unknown) {
    // P2002 = Unique constraint violation
    const isUnique = e && typeof e === "object" && "code" in e &&
                     (e as { code: string }).code === "P2002";
    if (!isUnique || attempt === 2) throw e;  // 재시도 아니면 에러 던지기
  }
}
```

---

## 6. LocaleSwitcher 컴포넌트

**파일:** `src/components/ui/LocaleSwitcher.tsx`

```typescript
"use client";
import { useRouter } from "next/navigation";

export function LocaleSwitcher() {
  const router = useRouter();

  const handleLocaleChange = async (locale: "ko" | "en" | "zh") => {
    // 1. 쿠키 설정 API 호출
    const res = await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });

    if (res.ok) {
      // 2. 페이지 새로고침 (쿠키 반영)
      router.refresh();
    }
  };

  return (
    <div className="flex gap-2 border rounded-lg p-1">
      {(["ko", "en", "zh"] as const).map(l => (
        <button
          key={l}
          onClick={() => handleLocaleChange(l)}
          className="px-3 py-1 text-xs hover:bg-gray-100 rounded"
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

---

## 7. 주문 상세 페이지

### 7-1. UI 구성
**파일:** `src/app/dashboard/orders/[id]/page.tsx`

```typescript
{/* 상태 배지 */}
<span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.color}`}>
  {statusInfo.label}
</span>

{/* 액션 버튼 */}
{order.status === "DRAFT" && (
  <button onClick={() => handleAction("submit")}>
    결제 요청
  </button>
)}

{order.status === "PAYMENT_PENDING" && (
  <button onClick={() => handleAction("confirm-payment")}>
    결제 확인
  </button>
)}

{order.status === "PAID" && (
  <button onClick={() => handleAction("deliver")}>
    납품 완료 처리
  </button>
)}
```

### 7-2. 상태 전이 매핑

```typescript
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "초안", color: "bg-gray-100 text-gray-600" },
  PAYMENT_PENDING: { label: "결제 대기", color: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "결제 완료", color: "bg-blue-100 text-blue-700" },
  DELIVERED: { label: "납품 완료", color: "bg-green-100 text-green-700" },
  SETTLED: { label: "정산 완료", color: "bg-purple-100 text-purple-700" },
  REFUNDED: { label: "환불", color: "bg-red-100 text-red-600" },
  CANCELLED: { label: "취소", color: "bg-red-100 text-red-600" },
};
```

---

## 8. 보안 개선 상세

### 8-1. 20개 API 인증 패턴 통일

**Before:**
```typescript
const user = await requireUser().catch(() => null);
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

**After:**
```typescript
let user: Awaited<ReturnType<typeof requireUser>>;
try { user = await requireUser(); } catch {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

**차이점:**
- ❌ catch 콜백의 return은 미들웨어 return이 아님 (실행 흐름 계속)
- ✅ try/catch의 return은 Route Handler return (실행 중단)

### 8-2. requireAdmin 보호

```typescript
// settlements/run/route.ts
export async function POST(_: Request, { params }: { params: { id: string } }) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 추가: Admin 권한 확인
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ... 관리자 전용 로직
}
```

---

## 9. 성능 최적화

### 9-1. Zustand 리렌더링 최적화

```typescript
// 구독 선택 (선택적 업데이트)
const { theme, accentColor } = useBuilderStore((state) => ({
  theme: state.theme,
  accentColor: state.accentColor,
}));

// 액션만 구독
const { updateSection } = useBuilderStore((state) => ({
  updateSection: state.updateSection,
}));
```

### 9-2. 메모이제이션

```typescript
const saveDraft = useCallback(async () => {
  if (!pageId) return;
  // ...
}, [pageId, draftContent, theme, accentColor, setSaveState]);

const updateSection = useCallback((section, data) => {
  // ...
}, [activeLocale, draftContent]);
```

### 9-3. 이미지 최적화

```typescript
const handleFile = useCallback(
  async (file: File) => {
    // MIME 타입 검증
    if (!accept.split(",").some(t => file.type.trim() === t.trim())) {
      setError("지원하지 않는 형식");
      return;
    }

    // 파일 크기 검증
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`${maxSizeMB}MB를 초과합니다.`);
      return;
    }

    // ... 업로드
  },
  [maxSizeMB, accept, onUpload]
);
```

---

## 10. 테스트 체크리스트

### 단위 테스트
- [ ] `useBuilderStore`
  - [ ] init() 초기화
  - [ ] updateSection() 상태 변경
  - [ ] toggleSection() 토글
  - [ ] setSectionOrder() 순서 변경

- [ ] `RichTextEditor`
  - [ ] value prop 동기화
  - [ ] onChange 콜백
  - [ ] maxLength 검증
  - [ ] 도구모음 버튼

- [ ] `ImageUploader`
  - [ ] MIME 타입 검증
  - [ ] 파일 크기 검증
  - [ ] 업로드 진행률
  - [ ] 에러 처리

### 통합 테스트
- [ ] 빌더 로드 → init() 호출 → sectionOrder 표시
- [ ] 테마 변경 → setTheme() → saveState "unsaved"
- [ ] 히어로 이미지 업로드 → onUpload() → updateSection()
- [ ] 프로필 소개 입력 → onChange() → updateSection()
- [ ] 섹션 토글 → toggleSection() → disabledSections 변경
- [ ] 자동 저장 타이머 (30초) → saveDraft() → DB 반영

---

**작성자:** Claude Haiku 4.5
**최종 수정:** 2026-03-16
**상태:** ✅ 완료
