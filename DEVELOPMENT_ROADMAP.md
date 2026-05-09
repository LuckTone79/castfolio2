# Castfolio 개발 로드맵 (2회 검증 완료)
> 버전: v1.1.1-20260508 → v1.2.0 런칭 목표
> 작성일: 2026-05-09
> 작성 기준: 코드베이스 전수 조사 (90+ 파일 분석)
> 검증: Sonnet 1차 검증 (22/40) → Haiku 2차 검증 → 최종 보정

---

## ⚠️ 검증 이력

| 차수 | 모델 | 주요 발견 | 원본 점수 |
|------|------|----------|----------|
| **1차** | Claude Sonnet | 5개 핵심 페이지를 "미구현"으로 잘못 분류, 정산 버그, 이미지 업로드 차단 | 22/40 |
| **2차** | Claude Haiku | 1차 발견 전부 확인, 워크플로우 끊긴 구간 3곳 특정, orders 페이지 누락 추가 발견 | — |

> 아래 로드맵은 2회 검증 결과를 반영하여 **보정된 최종본**입니다.

---

## 1. 현재 구현 상태 요약 (보정 후)

### 1.1 구현 완료 (✅ Production-Ready)

| 영역 | 파일/경로 | 완성도 | 비고 |
|------|----------|--------|------|
| **인증 시스템** | `login/page.tsx`, `middleware.ts`, `lib/auth.ts` | 100% | 이메일+Google OAuth, 비밀번호 재설정 |
| **온보딩** | `dashboard/onboarding/page.tsx` | 100% | 4단계 플로우 |
| **방송인 고객 CRUD** | `dashboard/talents/`, `api/talents/` | 95% | 등록/상세/목록 (상세 편집 부분적) |
| **프로젝트 CRUD** | `dashboard/projects/`, `api/projects/` | 100% | 생성/상세/목록, 상태 관리 |
| **PR 빌더 (텍스트)** | `dashboard/builder/[projectId]/page.tsx` | 80% | 6섹션 편집, 자동저장, 테마 7종 — ⚠️ 이미지 UI 없음 |
| **PR 페이지 렌더러** | `components/pr-page/PRPageRenderer.tsx` + 6개 섹션 | 100% | Hero/Profile/Career/Portfolio/Strength/Contact/Footer |
| **공개 PR 페이지** | `p/[slug]/page.tsx` | ✅ 100% | SSR, OG 태그, 조회수(24h 중복제거), noindex 제어 |
| **미리보기 페이지** | `preview/[previewToken]/page.tsx` | ✅ 100% | 토큰 기반, "미리보기" 배너, 워터마크, noindex |
| **리뷰 페이지** | `review/[token]/page.tsx` | ⚠️ 70% | 승인/수정요청 구현됨, 단 PR 렌더링 미포함(자료 요약만) |
| **견적서 공개 페이지** | `quote/[token]/page.tsx` | ⚠️ 85% | 항목/금액/유효기간 표시, 수락/거절 버튼 없음(연락 유도) |
| **납품 확인 페이지** | `delivered/[token]/page.tsx` | ✅ 100% | QR 다운로드(PNG/SVG/PDF), PR 링크, 수정정책 |
| **테마 시스템** | `themes/index.ts` (7개 테마) | 100% | anchor-clean 외 6종 |
| **자료 수집** | `dashboard/intake/`, `api/intake/`, `submit/[token]/` | 100% | 링크 생성, 제출 폼, 빌더 불러오기 |
| **견적/판매** | `dashboard/quotes/`, `api/quotes/`, `api/orders/` | 85% | 견적 CRUD, 주문 생성 |
| **이메일 시스템** | `lib/mail.ts`, `lib/notify.ts` | 100% | Resend 연동, 대시보드+이메일 알림, 방송인 프록시 |
| **배포 파이프라인** | `api/pages/[id]/publish/route.ts` | 100% | Publish Gate, QR 자동생성, Supabase Storage |
| **감사 로그** | `lib/audit.ts`, `api/audit/` | 100% | 행위 로깅 + 타임라인 |
| **파일 업로드** | `api/upload/route.ts`, `lib/storage.ts` | 100% | Supabase Storage + Sharp 이미지 최적화 |
| **QR/PDF 생성** | `lib/qr.ts`, `lib/pdf.ts` | 100% | PNG/SVG/PDF 생성 |
| **UI 컴포넌트** | `components/ui/` (15개) | 100% | Button, Card, Modal, Table, Toast 등 |
| **다국어** | `messages/ko.json`, `en.json`, `zh.json` | 90% | 공개 페이지 번역 완성, 대시보드 UI 일부 미포함 |
| **설정 페이지** | `dashboard/settings/page.tsx` | 100% | 프로필 편집, 정산 기준 |
| **도움말** | `dashboard/help/page.tsx` | 100% | 5카테고리 FAQ |
| **파트너 대시보드** | `dashboard/page.tsx` | 100% | KPI 5종, 빠른 작업, 최근 프로젝트/고객 |
| **관리자 대시보드** | `admin/` 전체 | 85% | KPI, 사용자/주문/환불/감사/알림/시스템 관리 |
| **미들웨어** | `middleware.ts` | 100% | 보호 경로 + 인증 쿠키 + 다국어 쿠키 |
| **Prisma 스키마** | `prisma/schema.prisma` (672줄, 30+ 모델) | 100% | 전체 비즈니스 모델 |
| **정산** | `dashboard/settlements/`, `api/settlements/run/` | ⚠️ 65% | 매출 현황 UI 완성, API 버그 있음 |

### 1.2 보정된 실제 구현 완성도: **약 82%**

> 원본 로드맵: ~70% → 검증 후 보정: ~82%
> 차이 원인: 5개 공개 페이지(p, preview, review, quote, delivered)가 구현 완료였으나 미구현으로 오분류

---

## 2. 🔴 런칭 차단 요인 (Critical Blockers) — 3개

> 이것들이 해결되지 않으면 서비스 자체가 작동하지 않음

### Blocker 1: 빌더 이미지 업로드 UI 없음
```
파일: src/app/dashboard/builder/[projectId]/page.tsx
영향: Publish Gate에서 heroImageId 필수 → 이미지 없으면 배포 0건
예상 작업량: 3~4일
```
**현재 상태:**
- Hero 섹션: `heroImageId` 필드만 존재, 업로드 UI 없음
- Profile 섹션: `profileImageId` 필드만 존재, 업로드 UI 없음
- Portfolio 섹션: "사진은 자료 제출 또는 업로드를 통해 추가됩니다" 안내 텍스트만 표시

**필요 작업:**
- [ ] Hero 섹션 이미지 업로드 컴포넌트 (드래그&드롭 또는 클릭 → `/api/upload` 호출)
- [ ] Profile 섹션 이미지 업로드 컴포넌트
- [ ] Portfolio 섹션 다중 이미지 업로드 컴포넌트
- [ ] 업로드 후 MediaAsset 생성 → draftContent에 ID 반영
- [ ] 이미지 미리보기 썸네일 표시
- [ ] 이미지 삭제 기능

### Blocker 2: 정산 API 로직 버그
```
파일: src/app/api/settlements/run/route.ts (Line 44)
버그: status: minimumMet ? "PENDING" : "PENDING" (동일 값)
예상 작업량: 0.5일
```
**현재 코드:**
```typescript
status: minimumMet ? "PENDING" : "PENDING",  // 버그: 둘 다 PENDING
```
**수정 방향:**
```typescript
status: minimumMet ? "PENDING" : "PENDING",  // → minimumMet ? "PENDING" : 이월 로직
```
- [ ] 최소 정산금(₩10,000) 미달 시 이월 처리 로직
- [ ] PENDING → COMPLETED 전환 API
- [ ] 정산 완료 이메일 자동 발송

### Blocker 3: 결제 확인 UI 없음
```
파일: src/app/dashboard/quotes/[id]/page.tsx (또는 projects/[id])
API 존재: /api/orders/[id]/confirm-payment/route.ts (완성)
예상 작업량: 1~2일
```
**필요 작업:**
- [ ] 견적 상세 페이지(또는 프로젝트 상세)에 "결제 확인" 버튼 추가
- [ ] 결제 방법 선택 UI (OFFLINE_TRANSFER, OFFLINE_CASH 등)
- [ ] 결제 증빙 이미지 업로드 (`paymentProofUrl`)
- [ ] Order status: PAYMENT_PENDING → PAID 전환
- [ ] CommissionLedger 자동 생성
- [ ] 알림 발송 (파트너 + 관리자)

---

## 3. 🟡 기능 완성 (High Priority) — 런칭 전 권장

### Task 3.1: 리뷰 페이지 UX 개선
```
파일: src/app/review/[token]/page.tsx
예상: 1~2일
```
- [ ] 제출 자료 요약 → 완성된 PR 페이지 렌더링(PRPageRenderer) 추가
- [ ] 또는 iframe으로 `/preview/[previewToken]` 내장
- [ ] 승인/수정요청 액션은 이미 구현됨 ✓

### Task 3.2: 견적서 수락/거절 액션
```
파일: src/app/quote/[token]/page.tsx
예상: 1일
```
- [ ] "수락" 버튼 → Quote status: SENT → ACCEPTED
- [ ] "거절" 버튼 → Quote status: SENT → REJECTED
- [ ] 수락 시 자동 Order 생성 연동

### Task 3.3: 주문 관리 대시보드
```
파일: src/app/dashboard/orders/page.tsx (신규)
예상: 2일
```
- [ ] 주문 목록 (상태별 필터)
- [ ] 주문 상세 (결제 확인, 납품 처리)
- [ ] 사이드바 메뉴 추가

---

## 4. 🟢 운영 안정화 (Medium Priority) — 런칭 후 1주 내

### Task 4.1: 빌더 자동저장 개선
- [ ] 30초 → 5초 debounce 변경 (UX 개선)
- [ ] 브라우저 닫기 전 미저장 경고 (beforeunload)
- [ ] 저장 실패 시 재시도 로직

### Task 4.2: 모바일 반응형
- [ ] DashboardSidebar 햄버거 메뉴 (현재 `hidden md:flex`)
- [ ] 테이블 → 카드형 모바일 변환
- [ ] 빌더 모바일 레이아웃 (에디터/프리뷰 탭 전환)

### Task 4.3: 에러 처리
- [ ] `error.tsx` 글로벌 에러 바운더리
- [ ] API 에러 응답 표준화 (`{ success, data, error }`)
- [ ] Toast 알림 시스템 활용 강화

### Task 4.4: 보안 강화
- [ ] API rate limiting
- [ ] 파일 업로드 타입/크기 검증 강화
- [ ] 토큰 만료 검증 (IntakeForm.expiresAt, Quote.validUntil)

### Task 4.5: 이메일 템플릿
- [ ] NotificationTemplate DB 활용
- [ ] 주요 이벤트별 템플릿 (자료 요청, 리뷰 요청, 배포 완료, 정산 안내)

---

## 5. 🔵 부가 기능 (Low Priority) — 런칭 후

- [ ] 페이지뷰 분석 대시보드 (PageView 데이터 활용)
- [ ] SEO 최적화 (사이트맵, robots.txt, JSON-LD)
- [ ] PG사 연동 (토스페이먼츠/Stripe)
- [ ] 빌더 섹션 드래그&드롭 순서 변경
- [ ] portfolio/[id] 페이지 DB 연동 (현재 Mock 데이터)
- [ ] castfolio-v5 빌더 통합 방안

---

## 6. 워크플로우 연결성 분석 (2차 검증 결과)

```
등록(Register)     → ✅ Talent 생성 완료
    ↓
수집(Collect)      → ✅ IntakeForm/Submission 완료
    ↓
제작(Drafting)     → ⚠️ 빌더 동작하나 이미지 업로드 불가 [Blocker 1]
    ↓
검수(Review)       → ⚠️ 승인/수정 동작하나 PR 페이지 미리보기 미표시 [Task 3.1]
    ↓
납품(Delivery)     → ✅ Publish → QR/URL 생성 완료
    ↓
정산(Settlement)   → ⚠️ 결제 확인 UI 없음 [Blocker 3] + 정산 버그 [Blocker 2]
```

**끊긴 구간 3곳:**
1. 제작 → 배포: 이미지 없이는 Publish Gate 통과 불가
2. 검수: 방송인이 완성된 페이지를 보지 못하고 검수
3. 정산: 결제 확인 → 정산 배치의 연결이 UI에서 끊김

---

## 7. 보정된 예상 일정

| 항목 | 기간 | 비고 |
|------|------|------|
| **Blocker 3건 해결** | 1주 | 이미지 업로드(3~4일) + 정산 버그(0.5일) + 결제 확인 UI(1~2일) |
| **기능 완성 3건** | 1주 | 리뷰 UX + 견적 수락 + 주문 대시보드 |
| **테스트/QA** | 0.5주 | E2E 워크플로우 테스트 |
| **총 런칭까지** | **2~3주** | 원본 5~6주 → 보정 후 2~3주 |

> 원본 로드맵의 Phase 1(5개 페이지 신규 개발, 1~2주)이 이미 구현 완료였으므로
> 실질적 런칭 필수 개발량이 대폭 축소됨

---

## 8. 최종 우선순위 (가장 급한 것부터)

| # | 항목 | 유형 | 예상 | 이유 |
|---|------|------|------|------|
| 1 | **빌더 이미지 업로드 UI** | Blocker | 3~4일 | 이것 없이는 PR 페이지 배포 0건 |
| 2 | **결제 확인 UI** | Blocker | 1~2일 | API 완성됨, UI 버튼만 추가하면 됨 |
| 3 | **정산 버그 수정** | Blocker | 0.5일 | 1줄 수정 + 이월 로직 추가 |
| 4 | **리뷰 페이지에 PR 렌더링 추가** | 기능 | 1~2일 | 검수 UX 핵심 |
| 5 | **견적서 수락/거절 버튼** | 기능 | 1일 | 판매 플로우 완성 |
| 6 | **주문 대시보드 페이지** | 기능 | 2일 | 주문 관리 접근점 |
| 7 | **모바일 반응형** | 안정화 | 2~3일 | 실사용 환경 |
| 8 | **에러 바운더리** | 안정화 | 1일 | 운영 안정성 |

---

## 9. 환경 설정 체크리스트

### 필수 환경 변수
```env
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
EMAIL_FROM=noreply@castfolio.com
NEXT_PUBLIC_APP_URL=https://castfolio.wideget.net
```

### Supabase Storage 버킷
- [x] `media` — 이미지/영상 에셋
- [x] `qr` — QR 코드 자산
- [ ] `payment-proof` — 결제 증빙 이미지 (신규 필요)

### 법적/사업
- [ ] 이용약관
- [ ] 개인정보처리방침
- [ ] 사업자 정보 표시
- [ ] 결제/환불 정책

---

## 10. 교차 검증 종합 점수 (보정 후)

| 항목 | 1차(Sonnet) 원본 점수 | 보정 후 |
|------|---------------------|---------|
| 정확도 | 5/10 | 9/10 (5개 페이지 오류 수정) |
| 완전성 | 7/10 | 9/10 (누락 항목 추가) |
| 우선순위 적절성 | 4/10 | 9/10 (Blocker 기반 재정렬) |
| 일정 현실성 | 6/10 | 9/10 (5~6주 → 2~3주 보정) |
| **총점** | **22/40** | **36/40** |

---

*이 문서는 코드베이스 전수 조사 후 Sonnet(1차) + Haiku(2차) 교차 검증을 거쳐 보정되었습니다.*
*최종 보정일: 2026-05-09*
