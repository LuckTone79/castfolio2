# 작업 보고서

## 기본 정보
- **버전**: v1.2.0-20260510 (루트 castfolio 프로젝트 기준)
- **작업 일시**: 2026-05-10
- **이전 버전**: v1.1.1-20260508
- **프로젝트명**: Castfolio (루트 `src/`)

## 작업 요약
이전 작업이 잘못된 디렉토리(`prmaker/src/`)에 적용되어 실제 운영 사이트(`castfolio.wideget.net`)에는 반영되지 않았던 문제를 해결.
실제 빌드되는 루트 `src/`로 Type.1 Warm Pink, Type.2 Sky Blue 두 레이아웃을 정확히 이식하고, 두 차례 서로 다른 AI 모델로 교차 검증을 거쳐 발견된 HIGH 이슈 5건을 모두 수정 후 배포.

## 변경 사항

### 추가된 기능
- `src/lib/page-themes.ts`
  - `PageThemeLayout` 타입에 `"type1-warm" | "type2-skyblue"` 추가
  - `PAGE_THEME_OPTIONS` 배열에 `warm-pink`, `sky-blue` 두 항목 추가
- `src/components/page/layouts/Type1Layout.tsx` 신규 (757라인)
- `src/components/page/layouts/Type2Layout.tsx` 신규 (881라인)

### 수정된 사항
- `src/components/page/pr-page-renderer.tsx`: `theme.layout` 분기에 `type1-warm` / `type2-skyblue` 케이스 추가, mediaAssets → photoUrls 매핑
- `src/app/(marketing)/create/page.tsx`: 테마 선택 카드 `THEMES` 배열에 두 항목 추가
- `src/lib/version.ts`: `APP_VERSION` 1.1.1-20260508 → 1.2.0-20260510

### 1차 AI 검증 (feature-dev:code-reviewer) 수정 이슈
| 심각도 | 수정 내용 |
|--------|---------|
| CRITICAL | Type2Layout 카테고리 칩 하드코딩 → `content.profile.strengths` 기반 동적 렌더 |
| CRITICAL | Type2Layout `strength` 섹션 이중 렌더링 → `cards.length`/`strengths.length` 가드 추가 |
| IMPORTANT | Type1Layout `profileImageUrl` prop 미사용 → destructure 추가 후 hero fallback 활용 |

### 2차 AI 검증 (coderabbit) 수정 이슈
| 심각도 | 수정 내용 |
|--------|---------|
| HIGH | Type2 DOM id 중복 (`t2-strength` 두 곳) → `CertsSection` id를 `t2-certs`로 변경 |
| HIGH | VideosSection 탭 전환 시 stale `activeVideo` 유지 → 탭 클릭 시 `setActiveVideo(null)` |

## 변경된 주요 파일
| 파일 경로 | 변경 유형 | 설명 |
|----------|---------|------|
| `src/lib/page-themes.ts` | 수정 | layout 타입/테마 추가 |
| `src/lib/version.ts` | 수정 | 버전 업데이트 |
| `src/components/page/layouts/Type1Layout.tsx` | 신규 | Warm Pink 레이아웃 |
| `src/components/page/layouts/Type2Layout.tsx` | 신규 | Sky Blue 레이아웃 |
| `src/components/page/pr-page-renderer.tsx` | 수정 | layout 분기 |
| `src/app/(marketing)/create/page.tsx` | 수정 | THEMES 배열 |

## 알려진 이슈 / 추후 작업
- (MEDIUM) Hero 슬라이드쇼 `setInterval`이 탭 비가시 상태에서도 동작 — `document.visibilityState` 처리 권장
- (LOW) 나눔명조/나눔고딕 폰트 글로벌 로드 미적용 — `app/layout.tsx`에 Google Fonts 링크 추가 권장
- (LOW) Type1 NavBar의 `talentName` hidden span 데드코드 정리

## 버전 히스토리 요약
| 버전 | 날짜 | 주요 변경 |
|------|------|---------|
| v1.2.0 | 2026-05-10 | Type.1 Warm Pink + Type.2 Sky Blue 레이아웃 추가 (루트 src 기준, 실제 운영 반영) |
| v1.1.1 | 2026-05-08 | 이전 버전 (5개 테마만 노출) |
