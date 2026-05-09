# 작업 보고서

## 기본 정보
- **버전**: v1.3.0-20260509
- **작업 일시**: 2026-05-09
- **이전 버전**: v1.2.0-20260509
- **프로젝트명**: Castfolio (캐스트폴리오)

## 작업 요약
런칭 차단 요인 3건을 모두 해결했습니다. 빌더 이미지 업로드 UI 구현으로 배포 게이트 통과가 가능해졌고, 정산 버그 수정(CARRIED_OVER enum 추가 + DB 마이그레이션), 결제 확인 UI 구현으로 판매 워크플로우가 완전히 연결되었습니다.

## 변경 사항

### 추가된 기능
- **빌더 이미지 업로드 UI** (`DashboardBuilder`)
  - Hero 섹션: 대표 사진 업로드 (HERO_PHOTO) — 배포 게이트 필수 조건 해결
  - Profile 섹션: 프로필 사진 업로드 (PROFILE_PHOTO)
  - Portfolio 섹션: 포트폴리오 사진 다중 업로드 (PORTFOLIO_PHOTO)
  - 기존 업로드 이미지 로드 시 URL 맵 자동 구성
  - PRPageRenderer에 heroImageUrl / profileImageUrl / photoUrls 연결
- **결제 확인 UI** (`ConfirmPaymentButton.tsx`)
  - 판매 관리(quotes) 페이지에 주문 목록 섹션 추가
  - 결제 대기(PAYMENT_PENDING) 주문에 "결제 확인" 버튼 표시
  - 결제 수단·결제일·증빙 URL 입력 모달 구현
  - `/api/orders/[id]/confirm-payment` API 연결

### 수정된 사항
- **정산 API 버그 수정** (`/api/settlements/run/route.ts`)
  - `status: minimumMet ? "PENDING" : "PENDING"` → `"PENDING" : "CARRIED_OVER"` 수정
  - 최소금액 미달 시 이월 처리 로직 정상 작동
- **Prisma 스키마 `SettlementStatus` enum에 `CARRIED_OVER` 추가**
  - Supabase DB 마이그레이션 적용 완료 (`castfolio` schema)
  - Prisma client 재생성 완료
- **프로젝트 API** (`/api/projects/[id]/route.ts`)
  - `mediaAssets` 필드를 include에 추가하여 빌더 초기 로드 시 기존 이미지 URL 복원 지원
- 버전 표시 v1.2.0 → v1.3.0

### 삭제/제거된 사항
- 없음

## 변경된 주요 파일
| 파일 경로 | 변경 유형 | 설명 |
|----------|---------|------|
| prmaker/src/app/dashboard/builder/[projectId]/page.tsx | 수정 | 이미지 업로드 UI (Hero/Profile/Portfolio) 전면 추가 |
| prmaker/src/components/dashboard/ConfirmPaymentButton.tsx | 신규 생성 | 결제 확인 모달 클라이언트 컴포넌트 |
| prmaker/src/app/dashboard/quotes/page.tsx | 수정 | 주문 목록 + 결제 확인 버튼 섹션 추가 |
| prmaker/src/app/api/settlements/run/route.ts | 수정 | CARRIED_OVER 버그 수정 |
| prmaker/src/app/api/projects/[id]/route.ts | 수정 | mediaAssets include 추가 |
| prmaker/prisma/schema.prisma | 수정 | SettlementStatus에 CARRIED_OVER 추가 |
| VERSION | 수정 | v1.2.0-20260509 → v1.3.0-20260509 |
| prmaker/src/components/layout/DashboardSidebar.tsx | 수정 | 버전 표시 v1.3.0 업데이트 |

## DB 마이그레이션
- **마이그레이션명**: `add_carried_over_settlement_status`
- **대상**: Supabase 프로젝트 `vrbawgqrhigtkyiengkm`, schema `castfolio`
- **내용**: `ALTER TYPE "castfolio"."SettlementStatus" ADD VALUE IF NOT EXISTS 'CARRIED_OVER'`
- **적용 결과**: 성공

## 런칭 차단 요인 해결 현황
| # | 차단 요인 | 상태 |
|---|----------|------|
| 1 | 빌더 이미지 업로드 UI 없음 | ✅ 해결 |
| 2 | 정산 API 버그 (PENDING→PENDING) | ✅ 해결 |
| 3 | 결제 확인 UI 없음 | ✅ 해결 |

## 알려진 이슈 / 추후 작업
- 리뷰 페이지 UX 개선 (PR 렌더링 추가)
- 견적서 수락/거절 액션 추가
- 주문 관리 전용 대시보드 (`/dashboard/orders`) 신규 구현
- 모바일 반응형 개선
- 총 런칭까지 예상: 1~2주 (차단 요인 해결로 단축)

## 버전 히스토리 요약
| 버전 | 날짜 | 주요 변경 |
|------|------|---------|
| v1.3.0 | 2026-05-09 | 런칭 차단 요인 3건 해결 (이미지 업로드, 결제 확인 UI, 정산 버그 수정) |
| v1.2.0 | 2026-05-09 | 개발 로드맵 수립 (2회 AI 교차 검증), 런칭 차단 요인 3건 특정 |
| v1.1.1 | 2026-05-08 | 파트너 앱 성능 개선 (인증 캐시, 자료수집 SSR) |
| v1.1.0 | 2026-05-01 | 파트너 대시보드 UI 개선, 테마 시스템 확장 |
| v1.0.3 | 2026-05-01 | 빌더 섹션 에디터 완성 |
