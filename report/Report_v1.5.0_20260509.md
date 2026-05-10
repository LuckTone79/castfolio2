# 작업 보고서

## 기본 정보
- **버전**: v1.5.0-20260509
- **작업 일시**: 2026-05-09
- **이전 버전**: v1.4.1-20260509
- **프로젝트명**: Castfolio (PR Maker)

## 작업 요약
DEVELOPMENT_ROADMAP.md Section 4 운영 안정화 항목(4.1~4.5) 전체를 일괄 구현했습니다.
빌더 자동저장 안정성, 전역 에러 바운더리, 보안 강화(rate limiting + 업로드 검증), 이벤트별 브랜드 이메일 템플릿 4종을 추가했으며 TypeScript 컴파일 통과 후 GitHub main 브랜치에 배포했습니다.

## 변경 사항

### 추가된 기능

#### Task 4.1 — 빌더 자동저장 개선
- `src/app/dashboard/builder/[projectId]/page.tsx`
  - debounce 간격 **30초 → 5초**로 단축
  - 저장 실패 시 **지수 백오프 재시도** (최대 3회, 2s/4s 간격)
  - **`beforeunload` 경고**: unsaved/saving 상태에서 탭/브라우저 닫기 시 "저장되지 않은 변경 사항" 경고 표시

#### Task 4.3 — 에러 처리
- `src/app/error.tsx` (신규): 글로벌 에러 바운더리 — digest 오류 코드 표시, 다시 시도/대시보드 버튼
- `src/app/dashboard/error.tsx` (신규): 대시보드 전용 에러 UI — 경량 카드 형태

#### Task 4.4 — 보안 강화
- `src/lib/rate-limit.ts` (신규): IP 기반 슬라이딩 윈도우 rate limiter
  - `Map` + `forEach` 방식으로 ES2015 호환
  - 5분마다 stale 엔트리 자동 정리
- 공개 API 3곳 rate limiting 적용:
  - `POST /api/public/intake/[token]`: 5회/10분
  - `POST /api/public/review/[token]`: 10회/시간
  - `POST /api/public/quote/[token]`: 5회/10분
- `src/lib/image.ts` 업로드 검증 강화:
  - MIME 타입 + 파일 확장자 **이중 검증** (SVG/GIF/HEIC 차단)
  - 빈 파일(`size === 0`) 차단
  - 에러 메시지 한국어 개선

#### Task 4.5 — 이메일 템플릿
- `src/lib/email-templates.ts` (신규): Castfolio 브랜드 HTML 이메일 4종
  - `intakeRequestTemplate`: 자료 제출 요청 (제출 항목 안내 + 유효기간 표시)
  - `reviewRequestTemplate`: 검수 요청 (승인/수정 선택지 시각적 안내)
  - `deliveryCompleteTemplate`: 배포 완료 (PR 페이지 링크 + 활용 안내)
  - `settlementNoticeTemplate`: 정산 안내 (매출/수수료/정산금 테이블)
- 이메일 발송 연동:
  - `api/intake/route.ts`: 자료 수집 링크 생성 시 → 방송인에게 `intakeRequestTemplate` 자동 발송
  - `api/pages/[id]/publish/route.ts`: 배포 완료 시 → 방송인(또는 파트너 프록시)에게 `deliveryCompleteTemplate` 발송
  - `api/settlements/run/route.ts`: 정산 실행 시 → 최소 정산금 충족 파트너에게 `settlementNoticeTemplate` 발송

### 수정된 사항
- `components/layout/DashboardSidebar.tsx`: 버전 표시 v1.4.1 → v1.5.0

### 삭제/제거된 사항
- 없음

## 변경된 주요 파일
| 파일 경로 | 변경 유형 | 설명 |
|----------|---------|------|
| `src/app/dashboard/builder/[projectId]/page.tsx` | 수정 | 자동저장 debounce 5s + 재시도 + beforeunload |
| `src/app/error.tsx` | 신규 | 글로벌 에러 바운더리 |
| `src/app/dashboard/error.tsx` | 신규 | 대시보드 에러 UI |
| `src/lib/rate-limit.ts` | 신규 | IP 기반 rate limiter |
| `src/lib/email-templates.ts` | 신규 | 브랜드 이메일 템플릿 4종 |
| `src/lib/image.ts` | 수정 | 파일 검증 강화 |
| `src/app/api/public/intake/[token]/route.ts` | 수정 | rate limiting 적용 |
| `src/app/api/public/review/[token]/route.ts` | 수정 | rate limiting 적용 |
| `src/app/api/public/quote/[token]/route.ts` | 수정 | rate limiting 적용 |
| `src/app/api/intake/route.ts` | 수정 | intake 링크 생성 시 방송인 이메일 발송 |
| `src/app/api/pages/[id]/publish/route.ts` | 수정 | 배포 완료 이메일 템플릿 적용 |
| `src/app/api/settlements/run/route.ts` | 수정 | 정산 안내 이메일 발송 추가 |
| `src/components/layout/DashboardSidebar.tsx` | 수정 | 버전 표시 업데이트 |
| `VERSION` | 수정 | v1.5.0-20260509 |

## 알려진 이슈 / 추후 작업

### Rate Limiting 제한사항
- Vercel serverless 환경에서는 인스턴스가 분리되어 in-memory rate limiter가 인스턴스 간 공유되지 않음
- 엄격한 제한이 필요할 경우 Upstash Redis 또는 Vercel WAF 사용 권장
- 현재 구현은 소량 트래픽 기준 우발적 중복 제출 방지 용도로 충분함

### 리뷰 요청 이메일 미연결
- `reviewRequestTemplate`은 구현되었으나 아직 특정 트리거 API에 연결되지 않음
- 리뷰 링크 발송 기능이 대시보드에서 구현될 때 연결 예정

### 남은 작업 (v1.6.0 이후)
- 페이지뷰 분석 대시보드
- SEO 최적화 (sitemap, robots.txt, JSON-LD)
- PG사 연동 (토스페이먼츠)
- 빌더 섹션 드래그&드롭
- portfolio/[id] DB 연동
- payment-proof Supabase 버킷 생성
- 법적 페이지 (이용약관, 개인정보처리방침)

## 버전 히스토리 요약
| 버전 | 날짜 | 주요 변경 |
|------|------|---------|
| v1.5.0 | 2026-05-09 | 운영 안정화 4.1~4.5 전체 구현 |
| v1.4.1 | 2026-05-09 | 2모델 교차 검증 버그 수정 4건 |
| v1.4.0 | 2026-05-09 | 후속작업 4건 (리뷰 PR 미리보기, 견적 수락/거절, 주문 대시보드, 모바일 반응형) |
| v1.3.0 | 2026-05-09 | 런칭 차단 요인 3건 해결 (이미지 업로드, 정산 버그, 결제 확인 UI) |
| v1.2.0 | 2026-05-08 | 파트너 대시보드 UI, PR 페이지 컴포넌트, 인증 개선 |
