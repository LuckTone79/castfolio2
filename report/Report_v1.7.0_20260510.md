# 작업 보고서

## 기본 정보
- **버전**: v1.7.0-20260510
- **작업 일시**: 2026-05-10
- **이전 버전**: v1.6.0-20260509
- **프로젝트명**: Castfolio (PR Maker)

## 작업 요약
두 개의 외부 참조 홈페이지(Type.1 Warm Pink, Type.2 Sky Blue)의 레이아웃을 0부터 100까지 분석하여  
CastFolio 빌더에서 선택 가능한 새 레이아웃 테마로 완전히 구현했습니다.  
구조, UI, 색상, 배경 구성, 애니메이션, 사진 배치를 원본과 동일하게 재현하였으며,  
Sonnet + Opus 2회 교차 AI 검증을 거쳐 모든 HIGH 이슈 수정 후 배포 완료.

## 변경 사항

### 추가된 기능

#### Type.1 Warm Pink 레이아웃
- **원본 참조**: https://kokoboppppp2017-svg.github.io/Type.1/
- `src/themes/warm-pink.ts`: 웜 핑크 테마 설정 (id: `warm-pink`, layoutVariant: `type1-warm`)
- `src/components/pr-page/layouts/Type1Layout.tsx`: 전체 레이아웃 구현
  - **NavBar**: sticky, 배경색 rgba(253,245,240,0.93) + blur, 핑크 hover 언더라인
  - **Hero**: 전체 너비 대표 영상 썸네일 카드 (그라디언트 오버레이, YouTube 태그, FEATURED VIDEO 메타)
  - **Numbers**: 다크 플럼(`#3D1E2C`) 배경, 2×2 stats 카드 (strength.cards 매핑)
  - **Career**: 크림-베이지 배경, Experience + Achievement 2컬럼 반응형 그리드
  - **Reference Videos**: 다크 플럼 배경, 세로형(9:16) 가로 스크롤 영상 카드
  - **Gallery**: 크림 배경, 첫 번째 이미지 전체 너비 + 나머지 2컬럼 그리드
  - **Contact**: 카카오톡 CTA(노란 버튼) + 이메일 카드 + Instagram/YouTube SNS 카드 2컬럼
  - **Footer**: 다크 플럼 배경, 연도 자동 갱신

#### Type.2 Sky Blue 레이아웃
- **원본 참조**: https://kokoboppppp2017-svg.github.io/Type.2/
- `src/themes/sky-blue.ts`: 스카이 블루 테마 설정 (id: `sky-blue`, layoutVariant: `type2-skyblue`)
- `src/components/pr-page/layouts/Type2Layout.tsx`: 전체 레이아웃 구현
  - **NavBar**: 컴팩트(44px), 중앙 정렬 링크, 아이스 블루 배경
  - **Hero**: 이름/태그라인 상단 배치 + 하단 자동 슬라이드 이미지(3.8초 간격, 인디케이터)
  - **Stats**: 3개 수치 카드 (strength.cards 매핑)
  - **Career**: 좌측 타임라인 선 + 파란 점 인디케이터
  - **Videos**: 3탭 전환 UI (라이브커머스/방송출연/브랜드협업), 모듈러 분배
  - **Certificates**: 6개 플립 카드 (클릭 시 rotateY 180° → 설명 텍스트 노출)
  - **Gallery**: 수평 스크롤 사진 스트립
  - **SNS**: 인스타그램/유튜브/틱톡 채널 카드
  - **Contact**: 카카오 오픈채팅 + 이메일 버튼 + 이메일 링크
  - **Footer**: 다크(`#1A2A3A`) 배경

#### 공통 인프라
- `src/types/theme.ts`: `layoutVariant` 필드 추가 (`"default" | "type1-warm" | "type2-skyblue"`)
- `src/themes/index.ts`: `warmPink`, `skyBlue` 테마 등록
- `src/components/pr-page/PRPageRenderer.tsx`: layoutVariant 기반 레이아웃 분기 로직

### 수정된 사항
- `DashboardSidebar`: 버전 표시 v1.6.0 → v1.7.0

### 1차 AI 검증 (Sonnet) 수정 이슈

| 심각도 | 수정 내용 |
|--------|---------|
| HIGH | Type1 NavBar: contact 링크 중복 제거 (`s !== "contact"` 필터 추가) |
| HIGH | Type1 strength 섹션 조건: `>= 0` → 조건 단순화 (항상 fallback 데이터 표시) |
| HIGH | Type2 GallerySection: `!isDisabled("profile")` 가드 추가 |
| HIGH | Type2 slideImages: `useMemo`로 참조 안정화, setInterval 재생성 방지 |
| HIGH | Type2 탭 영상 분배: 단순 3등분 → 모듈러(%) 방식으로 균등 분배 |
| MEDIUM | Type1/Type2 YouTube URL 파싱: `replace("/", "")` → `split("/").filter(Boolean).pop()` |
| MEDIUM | Type1 Career 섹션: 1컬럼 → `repeat(auto-fit, minmax(280px, 1fr))` 2컬럼 반응형 |
| MEDIUM | Type1 미사용 `getVideoEmbedUrl` import 제거 |
| MEDIUM | Type2 NavBar: contact key 중복 제거, key 값 `nav-${s}` 접두사 |
| MEDIUM | Type2 StatsSection 빈 `<span>` → `"성과"` 텍스트로 수정 |
| MEDIUM | Type2 CertsSection: id `t2-profile` → `t2-strength`, 렌더 조건 `strength`로 교정 |

### 2차 AI 검증 (Opus) 결과
- **배포 안전 (CRITICAL 이슈 없음)** 판정
- SSR/Hydration 안전성, "use client" 지시자, Props 전달 완전성, 메모리 누수, 접근성 모두 통과

## 변경된 주요 파일
| 파일 경로 | 변경 유형 | 설명 |
|----------|---------|------|
| `src/types/theme.ts` | 수정 | layoutVariant 타입 추가 |
| `src/themes/warm-pink.ts` | 신규 | Type.1 웜 핑크 테마 |
| `src/themes/sky-blue.ts` | 신규 | Type.2 스카이 블루 테마 |
| `src/themes/index.ts` | 수정 | 두 테마 등록 |
| `src/components/pr-page/layouts/Type1Layout.tsx` | 신규 | Type.1 전체 레이아웃 |
| `src/components/pr-page/layouts/Type2Layout.tsx` | 신규 | Type.2 전체 레이아웃 |
| `src/components/pr-page/PRPageRenderer.tsx` | 수정 | layoutVariant 분기 추가 |
| `src/components/layout/DashboardSidebar.tsx` | 수정 | 버전 표시 업데이트 |
| `VERSION` | 수정 | v1.7.0-20260510 |

## 알려진 이슈 / 추후 작업

### 빌더 UI 테마 선택 카드
- 빌더 step2(테마 선택) 화면에서 `warm-pink`, `sky-blue` 테마의 **미리보기 카드 UI**(원형 색상 + 설명 텍스트)가 현재 기존 7개 테마와 동일한 방식으로 자동 렌더링됨
- 별도 커스텀 카드 아이콘이 필요하면 빌더 페이지(`dashboard/builder/[projectId]/page.tsx`)에서 추가 작업 가능

### 나눔명조/나눔고딕 폰트 로드
- Type.2는 `나눔명조`, `나눔고딕` 폰트를 사용
- 글로벌 CSS(`app/globals.css`)나 `layout.tsx`에 Google Fonts/CDN 로드가 없으면 시스템 fallback 폰트로 표시됨
- `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&family=Nanum+Gothic:wght@400;700;800&display=swap">` 추가 권장

## 버전 히스토리 요약
| 버전 | 날짜 | 주요 변경 |
|------|------|---------|
| v1.7.0 | 2026-05-10 | Type.1 Warm Pink + Type.2 Sky Blue 레이아웃 추가 |
| v1.6.0 | 2026-05-09 | SEO, 분석, DnD, 법적 페이지, Toss PG, portfolio DB, payment-proof 버킷 |
| v1.5.0 | 2026-05-09 | 운영 안정화 (자동저장·에러바운더리·보안·이메일 템플릿) |
| v1.4.1 | 2026-05-09 | 2모델 교차 검증 버그 수정 4건 |
| v1.4.0 | 2026-05-09 | 후속작업 4건 |
| v1.3.0 | 2026-05-09 | 런칭 차단 요인 3건 해결 |
| v1.2.0 | 2026-05-08 | 파트너 대시보드, PR 페이지 컴포넌트 |
