# 작업 보고서

## 기본 정보
- **버전**: v1.4.0-20260511
- **작업 일시**: 2026-05-11
- **이전 버전**: v1.3.0-20260510
- **프로젝트명**: Castfolio (루트 `src/`)

## 작업 요약
크리에이트 위저드(`/create?step=3`)에서 Warm Pink / Sky Blue 테마 선택 시 레퍼런스 홈페이지(Type1Layout/Type2Layout) 구조가 아닌 제네릭 `DemoPreview` 레이아웃으로 렌더링되던 문제를 해결.
실제 `PRPageRenderer`를 사용하도록 전면 교체하고, 2모델 교차 검증(feature-dev:code-reviewer + coderabbit)에서 발견된 CRITICAL 2건 + HIGH 2건을 모두 수정.

## 변경 사항

### 추가된 기능
- 크리에이트 위저드 step 3(편집), step 4(미리보기)에서 `PRPageRenderer` 사용
  - Warm Pink → `Type1Layout` (핑크/플럼 멀티섹션 구조)
  - Sky Blue → `Type2Layout` (모바일 슬라이드형 구조)
  - 기타 클래식/큐레이티드 테마 → 기존 `ClassicThemePage` / `CuratedAtelierPage`
- 테마별 DOM ID 매핑 (`getSectionDomId`) — 사이드바 섹션 클릭 시 정확한 위치로 스크롤

### 수정된 사항
- `src/app/(marketing)/create/page.tsx`
  - `DemoPreview` 함수 완전 제거 → `PRPageRenderer` 교체
  - `sectionRefs` (6개 useRef) 제거 → `previewScrollRef` + `document.getElementById` 방식 전환
  - QR 코드를 미리보기 컨테이너 밖으로 분리 (발행된 페이지에는 QR 없으므로)
  - `DEFAULT_SECTION_ORDER`를 모듈 스코프로 이동 (매 렌더 시 새 배열 생성 방지)
- `src/components/page/pr-page-renderer.tsx`
  - `resolveMediaUrl`에 `data:` prefix 지원 추가 (이미지 크롭 에디터의 base64 이미지 표시)
  - Type1/Type2 `photoUrls` 빌드 시 `content.portfolio.photos`의 인라인 data/http URL도 포함
- `src/components/page/layouts/Type2Layout.tsx`
  - 빈 콘텐츠 상태에서도 `t2-strength` 앵커 DOM 노드가 존재하도록 빈 div fallback 추가
- `src/lib/version.ts`: 1.3.0-20260510 → 1.4.0-20260511

### 삭제/제거된 사항
- `create/page.tsx` 내 `DemoPreview` 함수 (제네릭 플랫 레이아웃)
- React `MutableRefObject` import (더 이상 미사용)
- 6개의 `useRef<HTMLElement>` (sectionRefs)

## 1차 AI 검증 (feature-dev:code-reviewer) 수정 이슈
| 심각도 | 수정 내용 |
|--------|---------|
| CRITICAL | `getSectionDomId("profile")` → sky-blue에서 `t2-profile` 생성하지만 Type2Layout에 해당 ID 없음 → `t2-gallery`로 매핑 |
| CRITICAL | Type2Layout `t2-strength`가 빈 콘텐츠 시 조건부 미렌더링 → 빈 div 앵커 fallback 추가 |
| HIGH | `portfolio.photos` data URL이 `photoUrls[id]` 조회 실패 → photoUrls에 인라인 URL도 포함 |
| HIGH | `DEFAULT_SECTION_ORDER`가 컴포넌트 내부에서 매 렌더 재생성 → 모듈 스코프 이동 |

## 2차 AI 검증 (coderabbit:code-reviewer) 수정 이슈
| 심각도 | 수정 내용 |
|--------|---------|
| CRITICAL | `t2-profile` ID 부재 확인 → 1차 검증과 동일, `t2-gallery`로 매핑으로 수정 완료 |

## 변경된 주요 파일
| 파일 경로 | 변경 유형 | 설명 |
|----------|---------|------|
| `src/app/(marketing)/create/page.tsx` | 수정 | DemoPreview 제거, PRPageRenderer 적용, 스크롤 로직 교체 |
| `src/components/page/pr-page-renderer.tsx` | 수정 | data: URL 지원, photoUrls 인라인 URL 포함 |
| `src/components/page/layouts/Type2Layout.tsx` | 수정 | 빈 strength 앵커 div 추가 |
| `src/lib/version.ts` | 수정 | 버전 업데이트 |

## 알려진 이슈 / 추후 작업
- Type1Layout의 `t1-profile`은 Gallery 섹션이며 프로필 소개(intro)는 별도 표시되지 않음 — UX 개선 검토 필요
- 터치 디바이스에서 ImageCropEditor 터치 이벤트 미지원
- (이전 MEDIUM) Hero 슬라이드쇼 `setInterval` 탭 비가시 상태 처리
- (이전 LOW) 나눔명조/나눔고딕 Google Fonts 미적용

## 버전 히스토리 요약
| 버전 | 날짜 | 주요 변경 |
|------|------|---------|
| v1.4.0 | 2026-05-11 | 크리에이트 위저드 PRPageRenderer 적용 — Type1/Type2 실제 레이아웃 렌더링 |
| v1.3.0 | 2026-05-10 | 비주얼 크롭 에디터 + 드래그 앤 드롭 업로드 |
| v1.2.0 | 2026-05-10 | Type.1 Warm Pink + Type.2 Sky Blue 레이아웃 추가 |
| v1.1.1 | 2026-05-08 | 이전 버전 (5개 테마만 노출) |
