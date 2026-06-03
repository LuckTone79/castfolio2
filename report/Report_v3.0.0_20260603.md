# 작업 보고서

## 기본 정보
- **버전**: v3.0.0-20260603
- **작업 일시**: 2026-06-03
- **이전 버전**: v2.2.0-20260515
- **프로젝트명**: Castfolio (루트 `src/`)

## 작업 요약
프로그램의 목적(방송인 PR 홈페이지 제작/판매 파트너용 SaaS)에 비해 **구성이 사용자 친화적이지 않던 구조 문제**를 개선했다.
**제작하는 PR 홈페이지(결과물) 디자인은 그대로 유지**하고, 파트너가 사용하는 작업공간(앱)의 구성·정보구조(IA)만 재설계했다.

### 발견한 핵심 문제
1. **파트너 작업공간이 `/dashboard`와 `/app` 두 갈래로 중복** → 어느 쪽을 써야 하는지 불명확.
2. `/dashboard/layout.tsx`가 모든 `/dashboard/*`를 무조건 `/app`으로 리다이렉트 → 견적·주문·프로젝트·가격정책·설정·**실제 빌더 편집기(`/dashboard/builder/[projectId]`, 490줄)** 등 핵심 기능이 **클릭하면 홈으로 튕겨 사실상 사용 불가**한 죽은 경로가 됨.
3. **빌더 진입점이 4개**(`/dashboard/builder`, `/app/builder/[talentId]`, `/app/build`, `/create`)로 혼란.
4. 내부 링크·알림 딥링크가 도달 불가능한 `/dashboard/*`를 가리킴.

## 변경 사항

### 단일 작업공간(`/app`)으로 일원화
- `/dashboard/*`의 살아있는 관리 페이지를 모두 `/app/*`로 이전(파일 이동, git 히스토리 보존):
  - `projects`, `projects/[id]`, `orders`, `orders/[id]`, `quotes`, `quotes/new`, `pricing`(+`new`/`[id]`), `settings`, `talents/[id]`, `builder/[projectId]`(실제 페이지 편집기)
- 방송인 고객 목록을 검색·등록 모달이 있는 풍부한 버전으로 교체(`/app/talents`).
- 중복 빌더 허브(`/app/builder/[talentId]`)·레거시 대시보드 홈(`/dashboard`)·리다이렉트 전용 레이아웃 제거.
- 빌더 라우트를 `/app/builder/[projectId]`(편집기) 하나로 정리하여 동적 세그먼트 충돌 해소.

### 정보구조(IA) 재설계 — 사이드바
- 평면 6항목 → **워크플로우 기반 섹션 그룹**으로 재구성:
  - 대시보드
  - **제작 흐름**: 방송인 고객 · 자료 수집 · PR 홈페이지 제작 · 프로젝트
  - **판매·정산**: 견적서 · 주문 내역 · 판매 확정 · 정산 내역
  - **설정**: 상품·가격 · 내 계정
- `SideNav`에 섹션 헤딩(`section: true`) 지원 추가(접힘 상태에서는 구분선으로 표시). 관리자 네비게이션은 영향 없음.

### 기능 보존
- 삭제한 빌더 허브가 제공하던 기능을 고객 상세(`/app/talents/[id]`)에 통합: **자료 요청 링크 발급** + 프로젝트별 **빌더 열기** + **PR 홈페이지 제작** 진입.

### 링크/리다이렉트 정합성
- 이전된 페이지 내부 링크 `/dashboard/*` → `/app/*` 일괄 정정.
- API 알림 딥링크(`link:`) `/dashboard/*` → `/app/*` 정정(견적·주문·프로젝트·배포 알림).
- 자료 수집 컴포넌트의 잘못된 빌더 링크 수정: talentId를 편집기에 넘기던 버그 → 고객 작업실(`/app/talents/[id]`)로 연결, import 후 편집기 경로(`/app/builder/[projectId]`)로 정정.
- `next.config.js`에 `/dashboard` 및 `/dashboard/:path*` → `/app/*` 301 리다이렉트 추가(기존 북마크·외부 링크 호환).

### 유지(미변경) — 결과물 디자인
- PR 페이지 렌더러(`pr-page-renderer.tsx`), `Type1Layout`/`Type2Layout`, 테마 시스템(2×10=20), 공개 페이지 `/p/[slug]`는 **전혀 변경하지 않음**.

## 변경된 주요 파일
| 파일/경로 | 변경 유형 | 설명 |
|----------|---------|------|
| `src/app/app/{projects,orders,quotes,pricing,settings}/**` | 이동 | dashboard → app 작업공간 통합 |
| `src/app/app/talents/page.tsx`, `talents/[id]/page.tsx` | 이동/보강 | 검색·등록 목록 + 상세에 자료요청/빌더 진입 추가 |
| `src/app/app/builder/[projectId]/page.tsx` | 이동 | 실제 PR 페이지 편집기 복구 |
| `src/app/app/builder/[talentId]/`, `src/app/dashboard/**` | 삭제 | 중복/죽은 경로 제거 |
| `src/app/app/layout.tsx` | 수정 | 워크플로우 기반 섹션 네비게이션 |
| `src/components/layout/side-nav.tsx` | 수정 | 섹션 헤딩 지원 + 아이콘 추가 |
| `src/components/app/intake-submission-list.tsx` | 수정 | 빌더/고객 링크 정정 |
| `src/app/api/**` | 수정 | 알림 딥링크 `/app/*`로 정정 |
| `next.config.js` | 수정 | 레거시 `/dashboard` 리다이렉트 |
| `src/app/app/page.tsx` | 수정 | 최근 고객 링크 → 고객 상세 |
| `src/lib/version.ts`, `VERSION` | 수정 | v3.0.0-20260603 |

## 검증
- `npx tsc --noEmit` → 통과(0 에러).
- `npx prisma generate` → 정상.
- 최종 `/app` 라우트 18개, 동적 세그먼트 충돌 없음.

## 알려진 이슈 / 추후 작업
- 사용하지 않는 `next.config.ts`(Next 14는 `.js` 사용)와 레거시 `/public/*` 토큰 경로 정리는 후속 과제.
- 고객 사이트 분리(SITE_SEPARATION_PLAN: partner./client 도메인)는 별도 단계로 진행 예정.
- 빌드 게이트(`next build`)는 DB 환경변수 필요로 본 작업 범위에서 미실행(타입체크로 대체 검증).

## 버전 히스토리 요약
| 버전 | 날짜 | 주요 변경 |
|------|------|---------|
| v3.0.0 | 2026-06-03 | 파트너 작업공간 `/app` 단일화 + 워크플로우 IA 재설계(결과물 디자인 유지) |
| v2.2.0 | 2026-05-15 | 직접 제작 — 자료 수집 없이 바로 빌더 시작 |
| v2.1.0 | 2026-05-13 | 사이트 분리 설계 + 고객 전용 임시 랜딩 |
| v2.0.0 | 2026-05-12 | 테마 시스템 리뉴얼 2×10=20 |
