# 작업 보고서

## 기본 정보
- **버전**: v2.0.0-20260512
- **작업 일시**: 2026-05-12
- **이전 버전**: v1.4.1-20260512
- **프로젝트명**: Castfolio (루트 `src/`)

## 작업 요약
테마 시스템 대규모 리뉴얼(v2.0). 디자인 2종(Type1 멀티섹션, Type2 슬라이드형) × 컬러 10종 = 20가지 테마 조합 시스템 구축.
크리에이트 위저드 Step 2를 디자인 선택 → 컬러 선택 2단계 UX로 재설계하고, Step 3 사이드바를 레이아웃별 실제 섹션 순서에 맞도록 수정.
React Context 패턴으로 Type1/Type2 레이아웃의 동적 컬러 테마를 지원하며, 기존 themeId 하위 호환성을 유지.

## 변경 사항

### 추가된 기능
- **ColorTheme 인터페이스 및 10종 컬러 팔레트**: warm-pink, sky-blue, crimson-red, warm-amber, ocean-blue, classic-gold, deep-burgundy, forest-green(신규), violet-purple(신규), coral-sunset(신규)
- **2×10 = 20 테마 조합 자동 생성**: `DESIGN_LAYOUTS × COLOR_THEMES` → `PAGE_THEME_OPTIONS`
- **composite themeId 체계**: `"type1-warm-pink"`, `"type2-ocean-blue"` 등 layout-color 복합키
- **레거시 themeId 매핑**: 기존 `"anchor-clean"`, `"curated-atelier"` 등 → 신규 형식으로 자동 fallback
- **hexToRgba() 유틸리티**: `src/lib/utils.ts`에 Hex→rgba 변환 함수 추가
- **React Context 기반 동적 컬러**: Type1Layout, Type2Layout 모두 `ColorCtx + useC()` 패턴 적용
- **Step 2 리디자인**: 디자인 카드(2종) → 컬러 스와치(10종) → 실시간 PRPageRenderer 미리보기
- **Step 3 레이아웃별 사이드바**: 선택된 디자인에 따라 섹션 순서 자동 전환
- **colorTheme prop**: PRPageRenderer → Type1Layout/Type2Layout에 ColorTheme 전달

### 수정된 사항
- `src/lib/page-themes.ts`: 완전 재작성 — DesignLayout, ColorTheme, 자동 생성 로직, 레거시 매핑
- `src/components/page/layouts/Type1Layout.tsx`: 모듈 스코프 하드코딩 C → React Context 기반 동적 컬러, 30+ inline rgba → hexToRgba() 변환
- `src/components/page/layouts/Type2Layout.tsx`: 동일 패턴 적용 — Context 기반 동적 컬러
- `src/components/page/pr-page-renderer.tsx`: Type1/Type2 분기 통합, getColorTheme() 활용하여 colorTheme 전달
- `src/app/(marketing)/create/page.tsx`: Step 2 UI 전면 재설계, Step 3 사이드바 레이아웃별 분기, state 구조 변경 (designLayout + colorThemeId → derived themeId)

### 삭제/제거된 사항
- 기존 7종 flat THEMES 배열 (`create/page.tsx` 내부)
- `ThemeMiniPreview` 컴포넌트 (실제 PRPageRenderer 축소 미리보기로 대체)
- 모듈 스코프 `const C` 하드코딩 (Type1Layout, Type2Layout 양쪽)

## 변경된 주요 파일
| 파일 경로 | 변경 유형 | 설명 |
|----------|---------|------|
| `src/lib/page-themes.ts` | 대폭 수정 | ColorTheme, DESIGN_LAYOUTS, COLOR_THEMES 10종, 20개 옵션 자동생성, 레거시 매핑 |
| `src/lib/utils.ts` | 수정 | hexToRgba() 유틸리티 함수 추가 |
| `src/components/page/layouts/Type1Layout.tsx` | 대폭 수정 | React Context 동적 컬러, hexToRgba 전면 적용 |
| `src/components/page/layouts/Type2Layout.tsx` | 대폭 수정 | React Context 동적 컬러, hexToRgba 전면 적용 |
| `src/components/page/pr-page-renderer.tsx` | 수정 | getColorTheme import, colorTheme prop 전달, 중복 제거 |
| `src/app/(marketing)/create/page.tsx` | 대폭 수정 | Step 2: 디자인+컬러 2단계 UI, Step 3: 레이아웃별 사이드바 |
| `src/lib/version.ts` | 수정 | v2.0.0-20260512 |
| `VERSION` | 수정 | v2.0.0-20260512 |

## 설계 검토
- 서로 다른 AI 2모델(Claude Opus / Claude Sonnet)로 교차 검증 수행
- 4건 CRITICAL, 2건 HIGH 이슈 식별 및 모두 반영:
  1. **모듈 스코프 C 문제** (CRITICAL) → React Context로 해결
  2. **inline rgba 하드코딩** (CRITICAL) → hexToRgba() 유틸리티로 전량 교체
  3. **colorTheme prop 연결** (CRITICAL) → PRPageRenderer에서 getColorTheme() 호출
  4. **NavBar rgba 배경** (HIGH) → hexToRgba(C.bg, 0.93) 동적 변환

## 알려진 이슈 / 추후 작업
- 터치 디바이스에서 ImageCropEditor 터치 이벤트 미지원
- (이전 MEDIUM) Hero 슬라이드쇼 `setInterval` 탭 비가시 상태 처리
- (이전 LOW) 나눔명조/나눔고딕 Google Fonts 미적용
- classic-dark / curated-atelier 레이아웃 렌더러 코드가 잔존 — 레거시 fallback으로 유지 중

## 버전 히스토리 요약
| 버전 | 날짜 | 주요 변경 |
|------|------|---------|
| v2.0.0 | 2026-05-12 | 테마 시스템 리뉴얼 — 2디자인×10컬러=20테마, Context 기반 동적 컬러, Step 2/3 UX 재설계 |
| v1.4.1 | 2026-05-12 | step 3 → step 2 뒤로가기 버튼 추가 |
| v1.4.0 | 2026-05-11 | 크리에이트 위저드 PRPageRenderer 적용 — Type1/Type2 실제 레이아웃 렌더링 |
| v1.3.0 | 2026-05-10 | 비주얼 크롭 에디터 + 드래그 앤 드롭 업로드 |
| v1.2.0 | 2026-05-10 | Type.1 Warm Pink + Type.2 Sky Blue 레이아웃 추가 |
