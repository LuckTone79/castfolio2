# Castfolio — 방송인 PR 홈페이지 디자인 가이드라인

> 이 문서는 다른 AI(디자인 생성 AI, Figma 플러그인, 코드 생성 도구 등)가
> **텍스트만 읽고** 동일한 PR 페이지를 정확히 재현할 수 있도록 작성된 상세 가이드라인입니다.

---

## 1. 제품 개요

**Castfolio**는 방송인(아나운서, 쇼호스트, MC, 리포터, 기상캐스터, 성우 등)이 자신만의 프로페셔널 PR 홈페이지를 5분 안에 만들 수 있는 서비스입니다.

최종 산출물은 **싱글 페이지 웹사이트(Single Page)** 형태로, 세로 스크롤 한 방향으로 6개 섹션이 순서대로 배치됩니다.

**타겟 사용자**: 매니지먼트사에 소속되었거나 프리랜서로 활동하는 한국 방송인
**페이지 목적**: 캐스팅 디렉터, PD, 광고주에게 보내는 온라인 포트폴리오 겸 명함
**톤앤무드**: 프리미엄, 프로페셔널, 다크 모드 기반, 미니멀하지만 임팩트 있는

---

## 2. 전체 레이아웃 구조

```
┌─────────────────────────────────────┐
│          [Hero Section]             │  전체 너비, 중앙 정렬
│   프로필 원형 + 이름 + 포지션 + 태그라인   │  padding: 96px 상하
│          [CTA 버튼 2개]             │
├─────────────────────────────────────┤
│          [Profile Section]          │  max-width: 768px, 중앙
│   자기소개 텍스트 + 스킬 뱃지 리스트    │  padding: 64px 상하
├─── border-top (gray-800) ───────────┤
│          [Career Section]           │  max-width: 768px
│   타임라인 (좌: 기간, 우: 직함+설명)   │  padding: 64px 상하
├─── border-top (gray-800) ───────────┤
│          [Portfolio Section]        │  max-width: 768px
│   영상 카드 리스트 (세로 스택)        │  padding: 64px 상하
├─── border-top (gray-800) ───────────┤
│          [Strength Section]         │  max-width: 768px
│   3열 카드 그리드                    │  padding: 64px 상하
├─── border-top (gray-800) ───────────┤
│          [Contact Section]          │  max-width: 768px
│   2열 연락처 카드 그리드              │  padding: 64px 상하
├─── border-top (gray-800) ───────────┤
│          [Footer]                   │  padding: 32px 상하
│   "Powered by Castfolio"            │  중앙 정렬
└─────────────────────────────────────┘
```

**페이지 전체**:
- 배경: `#030712` (Tailwind gray-950, 거의 순수 블랙에 가까운 딥 다크)
- 콘텐츠 최대 너비: `768px` (max-w-3xl), 좌우 padding `24px`
- 섹션 간 구분선: `1px solid #1f2937` (gray-800), 은은하게 존재감
- 전체 페이지에 네비게이션 바 없음 — PR 페이지 자체가 독립형 랜딩 페이지

---

## 3. 색상 시스템

### 3.1 기본 팔레트 (Default — Anchor Clean 테마 기준)

| 역할 | HEX | Tailwind | 용도 |
|------|-----|----------|------|
| 배경 (페이지) | `#030712` | gray-950 | 전체 페이지 배경 |
| 배경 (Hero) | `#111827` → `#030712` | gray-900 → gray-950 | Hero 그라데이션 배경 |
| 배경 (카드) | `#111827` | gray-900 | 카드, 뱃지, 연락처 항목 배경 |
| 보더 (카드/구분선) | `#1f2937` | gray-800 | 섹션 구분선, 카드 테두리 |
| 텍스트 (제목) | `#FFFFFF` | white | H1, H2, H3, 강조 텍스트 |
| 텍스트 (본문) | `#d1d5db` | gray-300 | 소개 텍스트, 뱃지 라벨 |
| 텍스트 (보조) | `#6b7280` | gray-500 | 기간, 라벨, 영문 이름 |
| 텍스트 (최저) | `#4b5563` | gray-600 | 푸터, 플랫폼 표시 |
| 링크/액션 | `#60a5fa` | blue-400 | 포트폴리오 링크 색상 |
| CTA Primary 배경 | `#FFFFFF` | white | 메인 CTA 버튼 |
| CTA Primary 텍스트 | `#111827` | gray-900 | 메인 CTA 버튼 텍스트 |
| CTA Secondary 보더 | `#374151` | gray-700 | 서브 CTA 버튼 테두리 |
| 링 (프로필) | `#374151` | gray-700 | 프로필 이미지 링 |
| 타임라인 도트 | `#4b5563` | gray-600 | 경력 타임라인 원형 점 |

### 3.2 테마 시스템 (7종)

테마는 Hero 섹션의 배경색과 악센트 컬러를 변경합니다.
빌더(create) 프리뷰에서는 테마 색상이 Hero 배경, 프로필 링, 포지션 텍스트, 타임라인 도트, CTA 버튼, 연락처 아이콘에 적용됩니다.

| 테마 ID | 이름 | 배경 HEX | 악센트 HEX | 설명 |
|---------|------|---------|-----------|------|
| `anchor-clean` | Anchor Clean | `#1a1a2e` | `#e94560` | 깔끔한 뉴스 앵커 스타일. 네이비+레드 |
| `warm-natural` | Warm Natural | `#2d2d2d` | `#f4a261` | 따뜻한 내추럴 톤. 다크그레이+오렌지 |
| `modern-mono` | Modern Mono | `#0d1117` | `#58a6ff` | 모던 모노톤 미니멀. 블랙+블루 |
| `classic-gold` | Classic Gold | `#1c1c1c` | `#ffd700` | 클래식 골드 포멀. 블랙+골드 |
| `fresh-pastel` | Fresh Pastel | `#1e1e2e` | `#cba6f7` | 프레시 파스텔 톤. 딥퍼플+라벤더 |
| `bold-dynamic` | Bold Dynamic | `#0f0f0f` | `#ff6b6b` | 볼드 다이나믹 액티브. 블랙+코랄레드 |
| `elegant-dark` | Elegant Dark | `#0a0a0a` | `#c0c0c0` | 엘레건트 다크 무드. 블랙+실버 |

**테마 적용 위치** (빌더 프리뷰 기준):
- Hero 섹션 `background-color` → 테마 배경색
- 프로필 원형 `border-color`, `box-shadow`, `color` → 악센트 색
- 프로필 원형 `background` → 악센트 색 + 13% 불투명도 (`accent + "22"`)
- 포지션 텍스트 `color` → 악센트 색
- CTA Primary `background` → 악센트 색, `color` → 테마 배경색
- 타임라인 도트 `background` → 악센트 색
- 연락처 아이콘 원형 `background` → 악센트 색 + 13%, `color` → 악센트 색

---

## 4. 타이포그래피

폰트: 시스템 기본 (Tailwind 기본 sans-serif 스택)
한국어 폰트 스택 우선순위: Apple SD Gothic Neo → Malgun Gothic → sans-serif

| 요소 | 크기 | 굵기 | 행간 | 자간 | 색상 |
|------|------|------|------|------|------|
| H1 (이름) | 36px → 48px (반응형) | Bold (700) | 1 | tight (-0.025em) | white |
| H2 (섹션 제목) | 24px | Bold (700) | 1.2 | normal | white |
| H3 (항목 제목) | 16px | Semibold (600) | 1.4 | normal | white |
| 영문 이름 | 18px | Regular (400) | 1.4 | normal | gray-500 |
| 포지션 | 20px | Regular (400) | 1.4 | normal | gray-300 |
| 태그라인 | 18px | Regular (400) | 1.5 | normal | gray-400, italic |
| 본문 (소개) | 14px | Regular (400) | relaxed (1.625) | normal | gray-300 |
| 카드 제목 | 16px | Semibold (600) | 1.4 | normal | white |
| 카드 설명 | 14px | Regular (400) | 1.5 | normal | gray-400 |
| 뱃지 라벨 | 14px | Regular (400) | 1.4 | normal | gray-300 |
| 기간 (타임라인) | 14px | Regular (400) | 1.4 | normal | gray-500, monospace |
| 연락처 라벨 | 12px | Regular (400) | 1.4 | uppercase | gray-500 |
| 연락처 값 | 14px | Regular (400) | 1.4 | normal | white |
| 푸터 | 12px | Regular (400) | 1.4 | normal | gray-600 |

**특기사항**:
- 태그라인은 이탤릭 + 쌍따옴표(`" "`)로 감쌈
- 기간 텍스트는 monospace 폰트 (숫자 정렬을 위해)
- H1은 모바일 36px → 데스크탑 48px 반응형

---

## 5. 섹션별 상세 디자인

### 5.1 Hero Section

**레이아웃**: 전체 너비, 중앙 정렬, 세로 스택
**배경**: `gray-900` → `gray-950` 세로 그라데이션 (위에서 아래)
**패딩**: 상하 96px, 좌우 24px

**구성 요소 (위→아래 순서)**:

1. **프로필 원형 (Avatar Circle)**
   - 크기: 112px × 112px (w-28 h-28)
   - 모양: 완전한 원 (border-radius: 9999px)
   - 배경: `#1f2937` (gray-800)
   - 링: 4px 두께, `#374151` (gray-700)
   - 내부: 이름의 첫 글자 (예: "김"), 30px bold, gray-500
   - 이미지가 있으면 원형 크롭된 프로필 사진으로 대체
   - 하단 마진: 24px

2. **이름 (한국어)**
   - 텍스트: 예) "김유나"
   - 스타일: H1 (36~48px bold white tracking-tight)

3. **이름 (영문)** — 선택적
   - 텍스트: 예) "Yuna Kim"
   - 스타일: 18px gray-500, 상단 마진 4px

4. **포지션**
   - 텍스트: 예) "쇼호스트 · MC"
   - 스타일: 20px gray-300, 상단 마진 12px

5. **태그라인** — 선택적
   - 텍스트: 예) "진심을 전하는 목소리, 시청자와 함께 만드는 라이브"
   - 스타일: 18px gray-400 italic, 상단 마진 16px
   - 양쪽 쌍따옴표로 감쌈: `"…"`

6. **CTA 버튼 2개** (수평 배치, gap 12px)
   - 상단 마진: 32px
   - **Primary CTA**: pill 형태 (border-radius: 9999px), 배경 white, 텍스트 gray-900, 14px medium, padding 24px×12px
   - **Secondary CTA**: pill 형태, 배경 투명, border 1px gray-700, 텍스트 white, 14px medium, padding 24px×12px

### 5.2 Profile Section (소개)

**조건**: intro 텍스트가 있을 때만 표시
**패딩**: 상하 64px

**구성 요소**:

1. **섹션 제목**: "소개" — H2 (24px bold white, 하단 마진 24px)
2. **자기소개 텍스트**
   - 여러 줄 텍스트 (whitespace: pre-wrap으로 줄바꿈 보존)
   - 14px gray-300, line-height: relaxed (1.625)
3. **스킬/키워드 뱃지 리스트** — 선택적
   - 상단 마진: 24px
   - flex-wrap 레이아웃, gap 8px
   - 각 뱃지:
     - pill 형태 (border-radius: 9999px)
     - 배경: gray-800, 보더: 1px gray-700
     - padding: 6px 12px
     - 내용: 이모지 아이콘 + 라벨 텍스트 (14px gray-300)
     - 예) `🎙️ 라이브 커머스`, `💄 뷰티 전문`, `🌐 한/영 이중언어`
   - 권장 개수: 3~6개

### 5.3 Career Section (경력)

**조건**: 경력 항목이 1개 이상일 때만 표시
**구분선**: 상단 border-top 1px gray-800
**패딩**: 상하 64px

**레이아웃**: 세로형 타임라인

**구성 요소**:

1. **섹션 제목**: "경력" — H2 (24px bold white, 하단 마진 32px)

2. **타임라인 항목** (반복, space-y 24px):
   - 2컬럼 수평 레이아웃 (gap 24px)
   - **좌측 (기간)**: 너비 112px 고정, 우측 정렬
     - 텍스트: 예) "2024 — 현재"
     - 14px gray-500 monospace
   - **우측 (내용)**: flex-1, 좌측 보더라인 1px gray-800, padding-left 24px
     - **타임라인 도트**: 보더라인 위에 절대 위치
       - 크기: 10px × 10px 원형
       - 색상: gray-600 (또는 테마 악센트 색)
       - 위치: 보더라인 중심 (left: -5px, top: 4px)
     - **직함**: 16px semibold white
     - **설명**: 14px gray-400, 상단 마진 4px (선택적)

**타임라인 시각 구조**:
```
        2024 — 현재  │ ● CJ온스타일 쇼호스트
                     │   뷰티·패션 카테고리 전담, 월 평균 방송 40회
                     │
        2021 — 2024  │ ● 네이버 쇼핑라이브 MC
                     │   브랜드 라이브 커머스 진행, 누적 시청 500만+
```

- 권장 항목 수: 3~6개
- 최신 경력이 위, 과거가 아래 (역시간순)

### 5.4 Portfolio Section (포트폴리오)

**조건**: 영상 또는 사진이 1개 이상일 때만 표시
**구분선**: 상단 border-top 1px gray-800
**패딩**: 상하 64px
**앵커**: `id="portfolio"` (Hero CTA에서 링크)

**구성 요소**:

1. **섹션 제목**: "포트폴리오" — H2 (24px bold white, 하단 마진 32px)

2. **영상 카드 리스트** (세로 스택, gap 16px):
   - 각 카드:
     - 모양: rounded-xl (12px), 배경 gray-900, 보더 1px gray-800
     - padding: 16px
     - 내부 레이아웃: 세로 스택
       - **영상 제목**: 14px medium white, 하단 마진 8px
       - **링크**: "영상 보기" + ExternalLink 아이콘(12px), 14px blue-400, hover시 underline

**향후 확장 가능 요소**:
- 영상 썸네일 프리뷰 (YouTube oEmbed)
- 사진 갤러리 (그리드 레이아웃)
- 오디오 샘플 플레이어

### 5.5 Strength Section (강점)

**조건**: 강점 카드가 1개 이상일 때만 표시
**구분선**: 상단 border-top 1px gray-800
**패딩**: 상하 64px

**구성 요소**:

1. **섹션 제목**: "강점" — H2 (24px bold white, 하단 마진 32px)

2. **카드 그리드**: 3열 (데스크탑), 1열 (모바일), gap 16px
   - 각 카드:
     - 모양: rounded-xl (12px), 배경 gray-900, 보더 1px gray-800
     - padding: 20px
     - **이모지 아이콘**: 24px, 하단 마진 12px (예: 🎯, 💬, 📚)
     - **제목**: 16px semibold white, 하단 마진 8px
     - **설명**: 14px gray-400

- 권장 카드 수: 정확히 3개 (그리드 밸런스)

### 5.6 Contact Section (연락처)

**조건**: 연락 채널이 1개 이상일 때만 표시
**구분선**: 상단 border-top 1px gray-800
**패딩**: 상하 64px
**앵커**: `id="contact"` (Hero CTA에서 링크)

**구성 요소**:

1. **섹션 제목**: "연락처" — H2 (24px bold white, 하단 마진 32px)

2. **연락처 카드 그리드**: 2열 (데스크탑), 1열 (모바일), gap 12px
   - 각 카드:
     - 모양: rounded-xl (12px), 배경 gray-900, 보더 1px gray-800
     - padding: 16px
     - 수평 레이아웃: 아이콘 + 텍스트 (gap 12px)
     - **아이콘**: lucide-react 아이콘 18px gray-400
       - email → Mail 아이콘
       - phone → Phone 아이콘
       - kakao → MessageCircle 아이콘
       - instagram → Instagram 아이콘
       - youtube → Youtube 아이콘
       - 기타 → Globe 아이콘
     - **라벨**: 12px gray-500 uppercase (예: "이메일", "전화")
     - **값**: 14px white (예: "yuna@example.com")

- 권장 채널 수: 3~5개

### 5.7 Footer

**구분선**: 상단 border-top 1px gray-800
**패딩**: 상하 32px
**정렬**: 중앙

- 텍스트: "Powered by Castfolio"
- 스타일: 12px gray-600, "Castfolio" 부분만 gray-500

---

## 6. 반응형 디자인

### 브레이크포인트

| 범위 | 구분 | 레이아웃 변화 |
|------|------|-------------|
| < 768px | 모바일 | H1: 36px, 강점 1열, 연락처 1열, 경력 기간 텍스트 축소 |
| ≥ 768px | 데스크탑 | H1: 48px, 강점 3열, 연락처 2열 |

### 모바일 고려사항
- 콘텐츠 패딩: 좌우 24px 유지
- 타임라인: 기간 텍스트가 좁아지면 자연스럽게 줄바꿈
- CTA 버튼: 수평 배치 유지 (충분히 작은 패딩)
- 카드 그리드: 모두 1열 풀 너비

---

## 7. 컴포넌트 상세 사양

### 7.1 Pill Badge (스킬 뱃지)

```
┌──────────────────┐
│ 🎙️ 라이브 커머스  │
└──────────────────┘
```
- border-radius: 9999px (완전한 pill)
- background: gray-800 (`#1f2937`)
- border: 1px solid gray-700 (`#374151`)
- padding: 6px 12px
- font: 14px gray-300
- 이모지 + 텍스트 사이 gap: 4px

### 7.2 Timeline Dot (타임라인 점)

```
──────│─────
      ●
──────│─────
```
- 크기: 10px × 10px
- border-radius: 100%
- background: gray-600 (기본) 또는 테마 악센트 색
- 세로 라인 위에 정확히 중앙 배치 (left: -5px)

### 7.3 Content Card (콘텐츠 카드)

```
┌─────────────────────────┐
│ 🎯                      │
│ 높은 전환율              │
│ 평균 전환율 8.5%로...    │
└─────────────────────────┘
```
- border-radius: 12px (rounded-xl)
- background: gray-900 (`#111827`)
- border: 1px solid gray-800 (`#1f2937`)
- padding: 20px
- 아이콘 → 제목 → 설명 세로 스택

### 7.4 Contact Card (연락처 카드)

```
┌──────────────────────────────┐
│  [📧]  이메일                │
│        yuna@example.com      │
└──────────────────────────────┘
```
- border-radius: 12px (rounded-xl)
- background: gray-900
- border: 1px solid gray-800
- padding: 16px
- 아이콘(18px) + 텍스트 블록 수평 배치

### 7.5 CTA Button (Hero 버튼)

**Primary**:
```
┌─────────────┐
│  연락하기    │  ← white bg, dark text
└─────────────┘
```
- border-radius: 9999px
- background: #FFFFFF
- color: gray-900
- font: 14px medium
- padding: 12px 24px
- hover: gray-100

**Secondary**:
```
┌─────────────┐
│  포트폴리오  │  ← transparent bg, white text, gray border
└─────────────┘
```
- border-radius: 9999px
- background: transparent
- border: 1px solid gray-700
- color: white
- font: 14px medium
- padding: 12px 24px
- hover: gray-800 bg

---

## 8. 데이터 스키마 (콘텐츠 구조)

페이지에 표시되는 모든 콘텐츠는 아래 구조를 따릅니다.
디자인 AI가 더미 데이터를 생성할 때 이 스키마를 참고하세요.

```typescript
interface PageContent {
  hero: {
    tagline: string;           // 한 줄 소개 (예: "진심을 전하는 목소리...")
    position: string;          // 포지션 (예: "쇼호스트 · MC")
    heroImageId: string;       // 히어로 이미지 ID (없으면 이니셜 표시)
    ctaPrimary: {
      label: string;           // 예: "연락하기"
      action: "portfolio" | "contact";
    };
    ctaSecondary: {
      label: string;           // 예: "포트폴리오"
      action: "portfolio" | "contact";
    };
  };
  profile: {
    intro: string;             // 자기소개 (여러 줄, \n 줄바꿈)
    profileImageId: string;    // 프로필 이미지 ID
    infoItems: Array<{         // 정보 항목 (경력 년수, 전문분야, 학력 등)
      label: string;
      value: string;
    }>;
    strengths: Array<{         // 스킬 뱃지
      icon: string;            // 이모지 (예: "🎙️")
      label: string;           // 라벨 (예: "라이브 커머스")
    }>;
  };
  career: {
    items: Array<{
      period: string;          // 기간 (예: "2024 — 현재")
      title: string;           // 직함 (예: "CJ온스타일 쇼호스트")
      description: string;     // 설명 (예: "뷰티·패션 카테고리 전담")
      imageId?: string;        // 선택적 이미지
    }>;
  };
  portfolio: {
    videos: Array<{
      url: string;
      platform: "youtube" | "navertv";
      title: string;
    }>;
    photos: string[];          // 사진 ID 배열
    audioSamples: Array<{      // 오디오 샘플 (성우 등)
      url: string;
      title: string;
    }>;
  };
  strength: {
    cards: Array<{
      icon: string;            // 이모지 (예: "🎯")
      title: string;           // 제목 (예: "높은 전환율")
      description: string;     // 설명 (2~3문장)
    }>;
  };
  contact: {
    channels: Array<{
      type: "email" | "kakao" | "instagram" | "youtube"
            | "tiktok" | "blog" | "phone" | "other";
      value: string;           // 연락처 값
      label: string;           // 표시 라벨
    }>;
  };
}
```

---

## 9. 더미 데이터 예시 (데모용)

디자인 AI가 프리뷰를 생성할 때 사용할 수 있는 완성형 더미 데이터:

```json
{
  "nameKo": "김유나",
  "nameEn": "Yuna Kim",
  "hero": {
    "position": "쇼호스트 · MC",
    "tagline": "진심을 전하는 목소리, 시청자와 함께 만드는 라이브",
    "ctaPrimary": { "label": "연락하기" },
    "ctaSecondary": { "label": "포트폴리오" }
  },
  "profile": {
    "intro": "안녕하세요, 쇼호스트 김유나입니다.\n\n10년간 라이브 커머스와 TV 홈쇼핑에서 활동하며, 누적 방송 3,000회 이상을 진행했습니다. 뷰티·패션·리빙 카테고리에 전문성을 갖추고 있으며, 시청자와의 실시간 소통을 가장 중요하게 생각합니다.\n\n자연스러운 진행과 따뜻한 에너지로 브랜드의 가치를 전달합니다.",
    "strengths": [
      { "icon": "🎙️", "label": "라이브 커머스" },
      { "icon": "💄", "label": "뷰티 전문" },
      { "icon": "🏠", "label": "리빙 카테고리" },
      { "icon": "🌐", "label": "한/영 이중언어" },
      { "icon": "📱", "label": "SNS 마케팅" }
    ]
  },
  "career": {
    "items": [
      { "period": "2024 — 현재", "title": "CJ온스타일 쇼호스트", "description": "뷰티·패션 카테고리 전담, 월 평균 방송 40회" },
      { "period": "2021 — 2024", "title": "네이버 쇼핑라이브 MC", "description": "브랜드 라이브 커머스 진행, 누적 시청 500만+" },
      { "period": "2019 — 2021", "title": "GS홈쇼핑 게스트 쇼호스트", "description": "리빙·키친 카테고리 게스트 출연" },
      { "period": "2017 — 2019", "title": "프리랜서 행사 MC", "description": "기업 행사, 세미나, 전시회 MC 활동" },
      { "period": "2016", "title": "한국외국어대학교 졸업", "description": "미디어커뮤니케이션학과" }
    ]
  },
  "portfolio": {
    "videos": [
      { "title": "CJ온스타일 뷰티 라이브 하이라이트" },
      { "title": "네이버 쇼핑라이브 베스트 클립" },
      { "title": "2024 서울 뷰티위크 MC 영상" }
    ]
  },
  "strength": {
    "cards": [
      { "icon": "🎯", "title": "높은 전환율", "description": "평균 전환율 8.5%로, 업계 평균 대비 2배 이상의 성과를 기록하고 있습니다." },
      { "icon": "💬", "title": "실시간 소통", "description": "시청자 댓글에 즉각 반응하며, 참여형 라이브를 통해 체류 시간을 극대화합니다." },
      { "icon": "📚", "title": "철저한 준비", "description": "모든 제품을 직접 사용하고 리서치한 뒤 방송에 임합니다. 진정성 있는 리뷰가 강점입니다." }
    ]
  },
  "contact": {
    "channels": [
      { "type": "email", "value": "yuna@example.com", "label": "이메일" },
      { "type": "phone", "value": "010-1234-5678", "label": "전화" },
      { "type": "kakao", "value": "yuna_host", "label": "카카오톡" },
      { "type": "instagram", "value": "@yuna_official", "label": "인스타그램" },
      { "type": "youtube", "value": "유나TV", "label": "유튜브" }
    ]
  }
}
```

---

## 10. 간격 체계 (Spacing System)

모든 간격은 4px 배수 체계를 따릅니다.

| 토큰 | 값 | 용도 |
|------|------|------|
| `space-1` | 4px | 아이콘-텍스트 gap, 최소 간격 |
| `space-2` | 8px | 뱃지 간 gap, 카드 내부 요소 간격 |
| `space-3` | 12px | CTA 버튼 간 gap, 연락처 카드 간 gap |
| `space-4` | 16px | 카드 패딩, 포트폴리오 카드 간 gap |
| `space-5` | 20px | 강점 카드 패딩 |
| `space-6` | 24px | 프로필 원형 하단 마진, 타임라인 gap, 좌우 패딩 |
| `space-8` | 32px | 섹션 제목 하단 마진, CTA 상단 마진, 푸터 패딩 |
| `space-16` | 64px | 섹션 상하 패딩 |
| `space-24` | 96px | Hero 섹션 상하 패딩 |

---

## 11. 아이콘 사양

### 연락처 아이콘 (lucide-react 스타일)
- 선 두께: 2px (stroke-width: 2)
- 크기: 18px × 18px
- 색상: gray-400 (`#9ca3af`)
- 스타일: 아웃라인 (채움 없음)

| 연락 유형 | 아이콘 이름 | 설명 |
|-----------|------------|------|
| email | Mail | 봉투 모양 |
| phone | Phone | 전화기 모양 |
| kakao | MessageCircle | 말풍선 모양 |
| instagram | Instagram | 카메라 사각형 |
| youtube | Youtube | 재생 버튼 삼각형 |
| tiktok | Globe | 지구본 (대체) |
| blog | Globe | 지구본 |
| other | Globe | 지구본 |

### 스킬/강점 아이콘
- 이모지 사용 (OS 네이티브 렌더링)
- 크기: 뱃지 내 14px, 카드 내 24px
- 자주 사용되는 이모지: 🎙️ 🎯 💬 📚 💄 🏠 🌐 📱 🏆 ⚡

---

## 12. 인터랙션 & 애니메이션

현재 버전은 최소한의 인터랙션만 포함합니다:

| 요소 | 인터랙션 | 효과 |
|------|---------|------|
| CTA Primary | hover | background: gray-100 (0.15s ease) |
| CTA Secondary | hover | background: gray-800 (0.15s ease) |
| 포트폴리오 링크 | hover | text-decoration: underline |
| 전체 transition | 모두 | `transition-colors` (0.15s ease) |

**애니메이션 없음**: 스크롤 애니메이션, 페이드인, 패럴랙스 등은 현재 미적용.
향후 추가 가능: 섹션 진입 시 fade-up 애니메이션 (intersection observer)

---

## 13. 접근성 (Accessibility)

- 모든 섹션에 시맨틱 `<section>` 태그 사용
- 섹션 제목에 `<h2>` 계층 구조 유지
- CTA 버튼은 `<a>` 태그 + `href="#section-id"` 앵커 링크
- 외부 링크에 `target="_blank"` + `rel="noopener noreferrer"`
- 색상 대비: 모든 텍스트가 WCAG AA 기준 충족 (다크 배경 위 밝은 텍스트)
- 푸터에 서비스 브랜딩

---

## 14. 디자인 핵심 원칙 요약

1. **다크 퍼스트**: 100% 다크 모드. 라이트 모드 없음. 고급스러운 느낌 유지
2. **콘텐츠 중심**: 장식 최소화, 텍스트와 구조로 전문성 전달
3. **일관된 카드 언어**: 모든 그룹 콘텐츠는 `rounded-xl + gray-900 bg + gray-800 border` 카드
4. **pill 뱃지 패턴**: 태그/스킬 표시는 항상 pill 형태 (완전한 둥근 모서리)
5. **모노톤 + 단일 악센트**: 기본은 그레이스케일, 테마 악센트 색 하나로 포인트
6. **여백의 미**: 섹션 간 충분한 64px 패딩, 호흡감 있는 레이아웃
7. **타임라인 내러티브**: 경력을 시각적 타임라인으로 — 캐스팅 디렉터가 한눈에 파악
8. **모바일 우선이되 데스크탑 최적화**: 그리드가 1열↔3열 자연스럽게 전환
