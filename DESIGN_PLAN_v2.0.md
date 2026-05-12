# 테마 시스템 리뉴얼 설계안 v2.0

## 목표
- 디자인 2종(Type1 멀티섹션, Type2 슬라이드형) × 컬러 10종 = 20가지 테마 조합
- Step 2: 디자인 선택 → 컬러 선택 2단계 UX
- Step 3: 레이아웃별 실제 섹션 순서에 맞는 사이드바

---

## 1. 데이터 모델 (`src/lib/page-themes.ts`)

### DesignLayout (2종)
```typescript
export type DesignLayoutId = "type1" | "type2";

export const DESIGN_LAYOUTS = [
  { id: "type1", name: "Type 1", nameKo: "멀티섹션", desc: "다채로운 배경 전환의 멀티섹션 레이아웃", layout: "type1-warm" as PageThemeLayout },
  { id: "type2", name: "Type 2", nameKo: "슬라이드형", desc: "모바일 친화 카드 슬라이드 레이아웃", layout: "type2-skyblue" as PageThemeLayout },
];
```

### ColorTheme (10종 — 기존 7 + 신규 3)
```typescript
export interface ColorTheme {
  id: string;
  name: string;
  nameKo: string;
  accent: string;       // 주 강조색
  accentLight: string;  // 밝은 강조
  accentDark: string;   // 어두운 강조
  bg: string;           // 밝은 배경
  bgAlt: string;        // 보조 배경
  card: string;         // 카드 배경
  text: string;         // 기본 텍스트
  muted: string;        // 보조 텍스트
  muted2: string;       // 더 연한 텍스트
  dark: string;         // 다크 섹션 배경
  border: string;       // 테두리
}
```

### 10가지 컬러 팔레트
| # | ID | 이름 | accent | bg | dark |
|---|------|------|--------|-----|------|
| 1 | warm-pink | 로즈 핑크 | #C4607E | #FDF5F0 | #3D1E2C |
| 2 | sky-blue | 스카이 블루 | #5BB8F5 | #F0F5FC | #1A2A3A |
| 3 | crimson-red | 크림슨 레드 | #E94560 | #FFF5F5 | #2E1A1E |
| 4 | warm-amber | 웜 앰버 | #E8A04C | #FFF8F0 | #2D2118 |
| 5 | ocean-blue | 오션 블루 | #4A90D9 | #F0F4FF | #0D1520 |
| 6 | classic-gold | 클래식 골드 | #C8A035 | #FEFBF2 | #1C1C10 |
| 7 | deep-burgundy | 딥 버건디 | #7A2D50 | #FDF3F6 | #2A0E1C |
| 8 | forest-green | 포레스트 그린 | #2EAA5E | #F0FDF5 | #0F2A18 | ← NEW
| 9 | violet-purple | 바이올렛 퍼플 | #8E5BAF | #F6F0FD | #1E0F2E | ← NEW
| 10 | coral-sunset | 코랄 선셋 | #E87461 | #FFF5F3 | #2E1B15 | ← NEW

### themeId 체계
기존: `"warm-pink"`, `"sky-blue"` 등 (flat)
신규: `"type1-warm-pink"`, `"type2-ocean-blue"` 등 (`{layout}-{color}` 복합키)

PAGE_THEME_OPTIONS는 2×10 = 20개 자동 생성:
```typescript
export function buildPageThemeOptions(): PageThemeOption[] {
  return DESIGN_LAYOUTS.flatMap(layout =>
    COLOR_THEMES.map(color => ({
      id: `${layout.id}-${color.id}`,
      name: `${layout.name} · ${color.name}`,
      nameKo: `${layout.nameKo} · ${color.nameKo}`,
      desc: `${layout.desc} (${color.nameKo})`,
      color: color.dark,
      accent: color.accent,
      layout: layout.layout,
      background: color.bg,
      surface: color.bgAlt,
      border: color.border,
      text: color.text,
      textMuted: color.muted,
    }))
  );
}
```

---

## 2. 레이아웃 컴포넌트 컬러 주입

### Type1Layout 변경
```typescript
// 기존: const C = { bg: "#FDF5F0", ... }; (하드코딩)
// 변경: props에서 colorTheme을 받아 C를 생성

interface Type1LayoutProps {
  // ...기존 props
  colorTheme?: ColorTheme;
}

export function Type1Layout({ colorTheme, ...props }: Type1LayoutProps) {
  const C = colorTheme ? {
    bg:     colorTheme.bg,
    bg2:    colorTheme.bgAlt,
    card:   colorTheme.card,
    text:   colorTheme.text,
    muted:  colorTheme.muted,
    muted2: colorTheme.muted2,
    pink:   colorTheme.accent,      // 핑크 → accent
    pinkLt: colorTheme.accentLight,
    pinkDk: colorTheme.accentDark,
    plum:   colorTheme.dark,
    border: colorTheme.border,
  } : DEFAULT_TYPE1_COLORS;
  // ...나머지 동일
}
```

### Type2Layout 변경 (동일 패턴)
```typescript
const C = colorTheme ? {
  bg:     colorTheme.bg,
  bgAlt:  colorTheme.bgAlt,
  card:   colorTheme.card,
  text:   colorTheme.text,
  muted:  colorTheme.muted,
  muted2: colorTheme.muted2,
  blue:   colorTheme.accent,      // 블루 → accent
  blueDk: colorTheme.accentDark,
  border: colorTheme.border,
  dark:   colorTheme.dark,
} : DEFAULT_TYPE2_COLORS;
```

### PRPageRenderer 변경
```typescript
// theme.layout가 type1-warm일 때
const colorTheme = getColorThemeFromPageTheme(theme); // PageThemeOption → ColorTheme 변환
<Type1Layout colorTheme={colorTheme} ...otherProps />
```

---

## 3. Create Wizard Step 2 리디자인

### UI 구조
```
┌─────────────────────────────────────────────┐
│  Stepper: [1 정보입력] → [2★ 테마선택]     │
├─────────────────────────────────────────────┤
│                                             │
│  디자인 선택                    ← 이전      │
│  ┌────────────────┐ ┌────────────────┐     │
│  │   Type 1       │ │   Type 2       │     │
│  │  멀티섹션 구조  │ │ 슬라이드형 구조 │     │
│  │   [미니프리뷰]  │ │  [미니프리뷰]  │     │
│  └────────────────┘ └────────────────┘     │
│                                             │
│  컬러 테마 선택                              │
│  ● ● ● ● ● ● ● ● ● ●                     │
│  핑크 블루 레드 앰버 오션 골드 버건디 ...    │
│                                             │
│  ┌────────────────────────────────────┐     │
│  │     선택한 디자인+컬러 미리보기     │     │
│  └────────────────────────────────────┘     │
│                                             │
│  [다음: 페이지 편집 →]                      │
└─────────────────────────────────────────────┘
```

### State 변경
```typescript
// 기존
const [themeId, setThemeId] = useState("anchor-clean");

// 신규
const [designLayout, setDesignLayout] = useState<DesignLayoutId>("type1");
const [colorThemeId, setColorThemeId] = useState("warm-pink");
// themeId는 derived: `${designLayout}-${colorThemeId}`
const themeId = `${designLayout}-${colorThemeId}`;
```

---

## 4. Step 3 사이드바 — 레이아웃별 섹션 순서

### Type1 (멀티섹션) 실제 DOM 순서
```
t1-hero      → 히어로
t1-strength  → 강점
t1-career    → 경력
t1-portfolio → 포트폴리오
t1-profile   → 갤러리
t1-contact   → 연락처
```

### Type2 (슬라이드형) 실제 DOM 순서
```
t2-hero      → 히어로
t2-strength  → 강점
t2-career    → 경력
t2-portfolio → 포트폴리오
t2-gallery   → 갤러리
t2-contact   → 연락처
```

```typescript
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
  { key: "profile", label: "갤러리" },  // maps to t2-gallery
  { key: "contact", label: "연락처" },
];
```

### getSectionDomId 업데이트
```typescript
const getSectionDomId = (section: ActiveSection): string => {
  if (designLayout === "type1") return `t1-${section}`;
  // type2
  if (section === "profile") return "t2-gallery";
  return `t2-${section}`;
};
```

---

## 5. 변경 파일 목록

| 파일 | 변경 유형 | 주요 변경 |
|------|----------|----------|
| `src/lib/page-themes.ts` | 대폭 수정 | ColorTheme, DESIGN_LAYOUTS, COLOR_THEMES 추가, PAGE_THEME_OPTIONS 20개 자동생성 |
| `src/components/page/layouts/Type1Layout.tsx` | 수정 | colorTheme prop 추가, C를 prop 기반으로 생성 |
| `src/components/page/layouts/Type2Layout.tsx` | 수정 | colorTheme prop 추가, C를 prop 기반으로 생성 |
| `src/components/page/pr-page-renderer.tsx` | 수정 | colorTheme 해석 후 레이아웃에 전달 |
| `src/app/(marketing)/create/page.tsx` | 대폭 수정 | Step 2 UI 리디자인, Step 3 사이드바 레이아웃별 분기 |
| `src/lib/version.ts` | 수정 | 버전 업데이트 |
| `VERSION` | 수정 | 버전 업데이트 |

---

## 6. 하위 호환성

- 기존 themeId(`"warm-pink"`, `"sky-blue"`, `"anchor-clean"` 등)가 DB에 저장된 페이지가 있을 수 있음
- `getPageTheme()` 함수에서 구형 themeId를 신규 형식으로 매핑하는 fallback 필요:
  - `"warm-pink"` → `"type1-warm-pink"`로 fallback
  - `"sky-blue"` → `"type2-sky-blue"`로 fallback
  - `"anchor-clean"` 등 classic-dark → `"type1-crimson-red"`로 fallback (가장 유사)
  - `"curated-atelier"` → `"type1-deep-burgundy"`로 fallback

---

## 7. 위험요소

1. **Type1/Type2 색상 하드코딩**: 레이아웃 전체에서 C.pink, C.blue 등을 직접 참조 → 누락 시 undefined 렌더링
2. **accentColor prop과 colorTheme 중복**: PRPageRenderer가 accentColor를 별도 전달 — colorTheme과 일치시켜야 함
3. **NavBar 컬러**: Type2의 NavBar가 C.blue를 직접 사용 → colorTheme.accent로 대체 필요
4. **기존 테마 제거**: classic-dark, curated-atelier 레이아웃 렌더러가 코드에 남아있음 → 제거하지 않고 fallback으로 유지

---

## 검토 요청 사항

1. ColorTheme ↔ C 매핑에서 누락되는 속성이 없는지
2. Step 2 UX: 디자인 선택 → 컬러 선택 순서가 직관적인지
3. 기존 themeId fallback 전략이 안전한지
4. Type1/Type2 내부에서 accent 색상을 참조하는 모든 곳이 colorTheme으로 대체 가능한지
