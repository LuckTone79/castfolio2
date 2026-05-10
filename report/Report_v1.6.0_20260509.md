# 작업 보고서

## 기본 정보
- **버전**: v1.6.0-20260509
- **작업 일시**: 2026-05-09
- **이전 버전**: v1.5.0-20260509
- **프로젝트명**: Castfolio (PR Maker)

## 작업 요약
DEVELOPMENT_ROADMAP.md Section 5 부가 기능 전체와 인프라/법적 항목을 순차적으로 구현했습니다.
SEO, 페이지뷰 분석, 빌더 드래그&드롭, 법적 페이지, Toss Payments PG 연동, portfolio DB 연동, Supabase 버킷 생성까지 모두 처리했으며 TypeScript 컴파일 통과 후 GitHub main 배포 완료.

## 변경 사항

### 추가된 기능

#### SEO 최적화
- `app/sitemap.ts`: 동적 sitemap — 정적 페이지 4개 + 배포된 모든 PR 페이지 자동 포함
- `app/robots.ts`: `/p/`, `/terms`, `/privacy` 허용, 대시보드/API/관리자 경로 차단
- `app/layout.tsx`: `metadataBase` 추가 (OG 이미지 절대 경로 보장)

#### 페이지뷰 분석 대시보드
- `api/analytics/route.ts`: 일별 방문 집계(raw SQL), 순방문자, 유입 경로 TOP10
  - 기간 파라미터: 7일 / 30일 / 90일
- `dashboard/analytics/page.tsx`: KPI 3종(방문/순방문자/페이지 수), 바 차트, 페이지별 테이블, 유입 경로 막대 그래프
- `DashboardSidebar`: 방문 분석 메뉴 + `IconChart` SVG 추가

#### 빌더 섹션 드래그&드롭
- `builder/[projectId]/page.tsx`: HTML5 `draggable` API로 섹션 순서 변경
  - hero(첫 번째), contact(마지막) 고정; 나머지 4섹션 자유 이동
  - `⠿` 핸들 표시, dragStart/dragEnter/dragEnd 핸들러
  - sectionOrder 상태 → PRPageRenderer preview에 실시간 반영
- `api/pages/[id]/draft/route.ts`: `sectionOrder`, `theme`, `accentColor` 저장 추가 (기존엔 draftContent만 저장)

#### portfolio/[id] DB 연동
- `portfolio/[id]/page.tsx`: Mock 데이터 완전 제거
  - `id` 파라미터를 Page slug로 사용
  - MediaAsset 포토 갤러리 그리드 (2~3열)
  - 방송 영상 URL 목록
  - PR 페이지 링크 제공
  - 콘텐츠 없을 시 fallback UI

#### 법적 페이지
- `app/terms/page.tsx`: 이용약관 8개 조항 (목적/정의/계약/요금/콘텐츠/제한/분쟁/문의)
- `app/privacy/page.tsx`: 개인정보처리방침 8개 항목 (처리목적/항목/제3자/위탁/권리/책임자/쿠키/변경)
- `DashboardSidebar` 하단에 이용약관/개인정보처리방침 링크 추가

#### Toss Payments PG 연동
- `api/payments/toss/route.ts`: 서버사이드 결제 확인
  - Toss API Basic 인증으로 `paymentKey` 검증
  - `prisma.$transaction`: Order → PAID + CommissionLedger 원자적 생성
  - 멱등성 가드: `status: "PAYMENT_PENDING"` 조건 검증
- `pay/[orderNumber]/page.tsx`: 방송인용 공개 결제 페이지
  - Toss CDN 스크립트 동적 로드 (npm 의존성 없음)
  - 성공/실패/이미결제/에러 상태 처리
- `api/orders/pay-info/[orderNumber]/route.ts`: 인증 불필요 주문 정보 공개 API

#### 인프라
- Supabase `payment-proof` 버킷 생성 (비공개, 5MB, JPG/PNG/WebP/PDF)
- RLS 정책: `authenticated` 사용자 업로드·조회 허용

### 수정된 사항
- `DashboardSidebar`: 버전 표시 v1.5.0 → v1.6.0, 약관/정책 링크 추가

### 삭제/제거된 사항
- `portfolio/[id]/page.tsx`: 모든 Mock 데이터 및 framer-motion/lucide 의존 코드 제거

## 변경된 주요 파일
| 파일 경로 | 변경 유형 | 설명 |
|----------|---------|------|
| `src/app/sitemap.ts` | 신규 | 동적 sitemap |
| `src/app/robots.ts` | 신규 | robots.txt |
| `src/app/api/analytics/route.ts` | 신규 | 분석 API |
| `src/app/dashboard/analytics/page.tsx` | 신규 | 분석 대시보드 |
| `src/app/portfolio/[id]/page.tsx` | 수정 | Mock → DB 연동 |
| `src/app/dashboard/builder/[projectId]/page.tsx` | 수정 | drag-and-drop + sectionOrder |
| `src/app/api/pages/[id]/draft/route.ts` | 수정 | sectionOrder/theme 저장 |
| `src/app/terms/page.tsx` | 신규 | 이용약관 |
| `src/app/privacy/page.tsx` | 신규 | 개인정보처리방침 |
| `src/app/api/payments/toss/route.ts` | 신규 | Toss 결제 확인 API |
| `src/app/pay/[orderNumber]/page.tsx` | 신규 | 방송인 결제 페이지 |
| `src/app/api/orders/pay-info/[orderNumber]/route.ts` | 신규 | 공개 주문 정보 API |
| `src/app/layout.tsx` | 수정 | metadataBase 추가 |
| `src/components/layout/DashboardSidebar.tsx` | 수정 | 분석·약관·버전 업데이트 |
| `VERSION` | 수정 | v1.6.0-20260509 |

## 알려진 이슈 / 추후 작업

### Toss Payments 환경 변수 필요
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`: 클라이언트 결제창 키 (Toss 대시보드에서 발급)
- `TOSS_SECRET_KEY`: 서버 결제 확인 키
- 두 키가 없으면 결제 기능 비활성화 (503 반환)

### pay/[orderNumber] 링크 발송 미구현
- 주문 생성 후 방송인에게 `pay/[orderNumber]` 링크를 이메일로 보내는 트리거 필요
- 현재는 파트너가 수동으로 링크를 공유해야 함

### 분석 API raw SQL 스키마 경로
- `PageView` 테이블이 `castfolio` 스키마에 있으므로 raw SQL에 `"castfolio"."PageView"` 사용
- 스키마 경로가 다를 경우 수정 필요

## 버전 히스토리 요약
| 버전 | 날짜 | 주요 변경 |
|------|------|---------|
| v1.6.0 | 2026-05-09 | SEO, 분석, DnD, 법적 페이지, Toss PG, portfolio DB, payment-proof 버킷 |
| v1.5.0 | 2026-05-09 | 운영 안정화 (자동저장·에러바운더리·보안·이메일 템플릿) |
| v1.4.1 | 2026-05-09 | 2모델 교차 검증 버그 수정 4건 |
| v1.4.0 | 2026-05-09 | 후속작업 4건 (리뷰 PR 미리보기, 견적 수락/거절, 주문 대시보드, 모바일 반응형) |
| v1.3.0 | 2026-05-09 | 런칭 차단 요인 3건 해결 |
| v1.2.0 | 2026-05-08 | 파트너 대시보드, PR 페이지 컴포넌트 |
