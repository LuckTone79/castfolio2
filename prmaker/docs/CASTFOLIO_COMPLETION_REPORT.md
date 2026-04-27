# Castfolio — 완료 보고서

> 작성일: 2026-03-16
> 기준 커밋: Claude Code 세션 (CASTFOLIO_CLAUDE_CODE_TASK_v1.4_FINAL.md 기반)

---

## 1. 프로젝트 개요

**Castfolio**는 배우·아나운서·모델 등 방송·엔터 인재를 위한 **프로필 페이지 제작 SaaS**입니다.
에이전트(User)가 소속 인재(Talent) 페이지를 관리하고, 발주사(Client)가 공개 URL이나 QR로 포트폴리오를 열람하는 구조입니다.

| 항목 | 내용 |
|------|------|
| 서비스명 | Castfolio |
| 타깃 | 방송·엔터 인재 에이전시 및 소속 인재 |
| 핵심 가치 | 편리한 페이지 빌더 + 다국어(ko/en/zh) 지원 + QR/PDF 공유 |
| 권한 구조 | Master Admin / User(Agent) / Talent / Public(토큰) |

---

## 2. 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | Next.js 14 (App Router, TypeScript strict) |
| ORM | Prisma (PostgreSQL / Supabase) |
| 인증 | @supabase/ssr (브라우저/서버 클라이언트 분리) |
| UI | Tailwind CSS (커스텀 테마 없음, 인라인 유틸리티) |
| i18n | next-intl (쿠키 기반, URL prefix 없음) |
| 이미지 | Sharp (WebP 변환, 1200px max + 400px 썸네일) |
| 이메일 | Resend (RESEND_API_KEY 미설정 시 graceful degradation) |
| QR/PDF | qrcode + pdf-lib |
| 패키지 매니저 | pnpm |
| 린터 | ESLint (@typescript-eslint/no-unused-vars) |

---

## 3. 전체 디렉토리 구조

```
prmaker/
├── prisma/
│   └── schema.prisma              # 30+ 모델 정의
├── public/
│   └── locales/                   # ko.json, en.json, zh.json
├── src/
│   ├── app/
│   │   ├── (public)/              # 공개 페이지 (토큰 기반 접근)
│   │   │   └── p/[token]/         # 공개 프로필 페이지
│   │   ├── admin/                 # Master Admin 전용
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           # Admin 대시보드
│   │   │   ├── users/page.tsx     # 유저 관리
│   │   │   ├── projects/page.tsx  # 프로젝트 관리
│   │   │   ├── monitoring/page.tsx # 모니터링 (RiskFlag, 30일 미확정)
│   │   │   ├── orders/page.tsx    # 주문/정산 관리
│   │   │   ├── refunds/page.tsx   # 환불 관리
│   │   │   ├── notifications/page.tsx # 공지 발송
│   │   │   └── system/page.tsx    # 시스템 설정
│   │   ├── dashboard/             # User(Agent) 전용
│   │   │   ├── layout.tsx         # 인증 게이트 + Sidebar + Header
│   │   │   ├── page.tsx           # 대시보드 홈
│   │   │   ├── onboarding/page.tsx
│   │   │   ├── builder/[projectId]/page.tsx  # 페이지 빌더 (핵심)
│   │   │   ├── projects/page.tsx  # 프로젝트 목록
│   │   │   ├── projects/new/page.tsx
│   │   │   ├── projects/[id]/page.tsx
│   │   │   ├── talents/page.tsx
│   │   │   ├── talents/new/page.tsx
│   │   │   ├── talents/[id]/page.tsx
│   │   │   ├── intake/page.tsx    # 자료 요청 링크 관리
│   │   │   ├── orders/page.tsx    # 주문 목록
│   │   │   ├── orders/[id]/page.tsx
│   │   │   ├── quotes/page.tsx    # 견적 목록
│   │   │   ├── quotes/new/page.tsx # 견적 생성
│   │   │   ├── quotes/[id]/page.tsx # 견적 상세
│   │   │   ├── pricing/page.tsx   # 상품 목록
│   │   │   ├── pricing/new/page.tsx # 상품 추가
│   │   │   ├── pricing/[id]/page.tsx # 상품 상세
│   │   │   ├── notifications/page.tsx # 알림 목록
│   │   │   └── settings/page.tsx  # 계정 설정
│   │   ├── api/
│   │   │   ├── projects/
│   │   │   │   ├── route.ts       # GET(목록), POST(생성)
│   │   │   │   └── [id]/route.ts  # GET, PATCH, DELETE
│   │   │   ├── projects/[id]/
│   │   │   │   ├── autosave/route.ts  # PATCH (draftContent만)
│   │   │   │   ├── preview/route.ts   # POST (draftContent → contentKo/En/Cn)
│   │   │   │   ├── publish/route.ts   # POST (Publish Gate 검증)
│   │   │   │   └── unpublish/route.ts # POST
│   │   │   ├── talents/route.ts
│   │   │   ├── talents/[id]/route.ts
│   │   │   ├── intake/route.ts    # 자료 요청 GET/POST
│   │   │   ├── intake/[token]/route.ts # 자료 제출 (공개)
│   │   │   ├── orders/route.ts
│   │   │   ├── orders/[id]/route.ts
│   │   │   ├── quotes/route.ts    # 견적 GET/POST
│   │   │   ├── quotes/[id]/route.ts
│   │   │   ├── pricing/route.ts   # 상품 GET/POST
│   │   │   ├── pricing/[id]/route.ts
│   │   │   ├── notifications/route.ts
│   │   │   ├── users/me/route.ts
│   │   │   ├── public/
│   │   │   │   ├── page/[token]/route.ts    # 공개 페이지 데이터
│   │   │   │   ├── review/[token]/route.ts  # 검토 요청 처리
│   │   │   │   ├── quote/[token]/route.ts   # 공개 견적 조회
│   │   │   │   └── delivered/[token]/route.ts
│   │   │   └── admin/
│   │   │       ├── users/route.ts
│   │   │       ├── projects/route.ts
│   │   │       ├── orders/route.ts
│   │   │       ├── settlement/route.ts
│   │   │       ├── refunds/route.ts
│   │   │       └── notify/route.ts # 공지 발송 (전체/특정)
│   │   ├── login/page.tsx
│   │   └── layout.tsx             # Root layout
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardSidebar.tsx
│   │   │   └── DashboardHeader.tsx  # 알림 벨 (unread count)
│   │   ├── builder/               # 빌더 서브 컴포넌트
│   │   ├── public/                # 공개 페이지 컴포넌트
│   │   └── ui/                    # 공통 UI 컴포넌트
│   ├── lib/
│   │   ├── auth.ts                # getCurrentDbUser, requireUser
│   │   ├── prisma.ts              # PrismaClient singleton
│   │   ├── notify.ts              # notifyUser, notifyTalent (proxy 규칙)
│   │   ├── utils.ts               # cn, formatCurrency, formatDate, hashIp 등
│   │   ├── themes.ts              # 7개 테마 ThemeConfig
│   │   ├── audit.ts               # logAudit, logTimeline
│   │   ├── image.ts               # Sharp 파이프라인
│   │   └── supabase/
│   │       ├── client.ts          # 브라우저 클라이언트
│   │       └── server.ts          # 서버 클라이언트 + SERVICE_ROLE 클라이언트
│   └── types/
│       └── index.ts               # PageContent, ThemeConfig 등 공유 타입
├── middleware.ts                  # 세션 갱신 + 라우트 보호
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## 4. 핵심 아키텍처 설계

### 4-1. 인증 흐름

```
브라우저 요청
  └─ middleware.ts
       ├─ createServerClient (supabase/ssr)
       ├─ getSession() → 세션 갱신
       └─ 보호 라우트 미로그인 → /login 리다이렉트

Server Component / Route Handler
  └─ getCurrentDbUser()
       ├─ supabase.auth.getUser()  ← 서버 전용
       └─ prisma.user.findUnique({ where: { supabaseId } })
```

- `createClient()` : ANON_KEY, 일반 인증용
- `createServiceClient()` : SERVICE_ROLE_KEY, Admin API 전용 (서버에서만 호출)
- `requireUser()` : 인증 실패 시 throw → Route Handler에서 401 반환

### 4-2. 페이지 상태 머신

```
DRAFT ──[preview]──▶ PREVIEW ──[publish]──▶ PUBLISHED
  ▲                     │                       │
  └──[unpublish]────────┘                       │
  └──────────────────────[unpublish]────────────┘
  └──[admin deactivate]──────────────────▶ INACTIVE
```

**Publish Gate** (서버 검증, `/api/projects/[id]/publish`):
1. hero 섹션 (이름 또는 이미지)
2. profile 섹션 (소개글)
3. contact 섹션 (연락처)
4. 결제 완료 Order 1건 이상

### 4-3. draftContent 통합 JSON 구조

```typescript
// draftContent (DB: Json 타입)
{
  ko: PageContent,
  en: PageContent,
  zh: PageContent
}

interface PageContent {
  hero:     { name, tagline, imageUrl }
  profile:  { bio }
  career:   { items: [{ period, title, description }] }
  portfolio:{ items: [{ url, platform, title }] }
  strength: { items: [{ icon, title, description }] }
  contact:  { email, phone, sns }
}
```

- **자동 저장**: `draftContent`만 업데이트 (AuditLog 미생성)
- **Preview/Publish**: `draftContent` → `contentKo` / `contentEn` / `contentZh` 반영

### 4-4. i18n (next-intl)

- URL prefix 없음 (`/p/[token]` 단일 경로)
- 언어 감지 순서: 쿼리파라미터 `?lang=` → 쿠키 `cf_locale` → `Accept-Language` → `ko`
- 공개 페이지만 다국어, 대시보드/Admin은 한국어 고정

### 4-5. 이미지 파이프라인 (Sharp)

```
원본 업로드
  └─ Sharp 처리
       ├─ 원본 그대로 저장 (original/)
       ├─ WebP 변환 + 1200px max (optimized/)
       └─ WebP 변환 + 400×400 crop center (thumbnail/)
```

### 4-6. QR / PDF 생성

```typescript
// qrcode → Data URL → pdf-lib로 삽입
const qrDataUrl = await QRCode.toDataURL(pageUrl);
const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage([200, 280]); // 명함 비율
// 이름 텍스트 + QR 이미지 + URL 텍스트 배치
```

### 4-7. 정산 흐름 (CommissionLedger)

```
Order 확정(CONFIRMED)
  └─ CommissionLedger 즉시 생성
       ├─ orderAmount
       ├─ commissionRate (User별 설정)
       └─ commissionAmount

월 정산 배치 (/api/admin/settlement POST)
  └─ PENDING 레코드 집계 → SettlementBatch 생성 → PROCESSED 처리
```

### 4-8. 알림 시스템

```typescript
// notifyUser: 직접 알림
// notifyTalent: Talent.email 없으면 담당 User에게 "_proxy" 접미사로 알림
await notifyTalent(talentId, "review_requested", { ... });
// → Talent.email 없음 → User에게 "review_requested_proxy" 채널로 전달

// Resend 미설정 시 DASHBOARD 채널만 생성 (에러 없이 진행)
if (process.env.RESEND_API_KEY) {
  await resend.emails.send({ ... });
}
```

---

## 5. DB 스키마 주요 모델

| 모델 | 주요 필드 | 설명 |
|------|-----------|------|
| User | id, supabaseId, email, name, role, userType, status | 에이전트 계정 |
| Talent | id, userId, name, email, phone | 소속 인재 |
| Project | id, userId, talentId, status, draftContent, contentKo/En/Zh, publicToken, themeId | 핵심 모델 |
| IntakeRequest | id, projectId, token, expiresAt, submittedAt | 자료 요청 링크 |
| Order | id, projectId, status, amount, paymentMethod | 주문 |
| Quote | id, projectId, token, status, lineItems, totalAmount | 견적서 |
| Pricing | id, userId, name, basePrice, status | 상품 |
| PricingPolicyVersion | id, pricingId, version, price, memo | 상품 버전이력 |
| CommissionLedger | id, orderId, userId, orderAmount, commissionRate, commissionAmount, status | 수수료 원장 |
| SettlementBatch | id, userId, month, totalAmount, status | 정산 배치 |
| RiskFlag | id, targetType, targetId, severity, reason, resolvedAt | 위험 플래그 |
| Notification | id, userId, type, channel, title, body, readAt | 알림 |
| AuditLog | id, userId, action, targetType, targetId, before, after | 감사 로그 |
| ProjectTimeline | id, projectId, event, note, createdAt | 프로젝트 타임라인 |
| RefundRecord | id, orderId, amount, reason, status | 환불 |

---

## 6. 7개 테마 시스템

| themeId | 이름 | 특징 |
|---------|------|------|
| minimal | Minimal | 화이트 배경, 블랙 타이포, 미니멀 레이아웃 |
| elegant | Elegant | 아이보리 배경, 세리프 폰트, 우아한 라인 |
| bold | Bold | 다크 배경, 대형 타이포, 강렬한 contrast |
| warm | Warm | 크림/베이지 톤, 둥근 모서리, 따뜻한 느낌 |
| cool | Cool | 회청색 팔레트, 모던 산세리프, 차가운 느낌 |
| classic | Classic | 전통적 레이아웃, 보수적 색상, 신뢰감 |
| vibrant | Vibrant | 채도 높은 컬러, 에너지틱, 젊은 감성 |

- 각 테마는 accent color 1색만 커스터마이징 가능
- `ThemeConfig` 타입: `{ id, name, bgColor, textColor, accentColor, fontFamily, borderRadius }`

---

## 7. API 엔드포인트 전체 목록

### 인증 필요 (User/Agent)

| Method | Path | 설명 |
|--------|------|------|
| GET/POST | /api/projects | 프로젝트 목록/생성 |
| GET/PATCH/DELETE | /api/projects/[id] | 프로젝트 상세/수정/삭제 |
| PATCH | /api/projects/[id]/autosave | draftContent 자동저장 |
| POST | /api/projects/[id]/preview | Preview 전환 |
| POST | /api/projects/[id]/publish | Publish (Gate 검증) |
| POST | /api/projects/[id]/unpublish | Unpublish |
| GET/POST | /api/talents | 인재 목록/등록 |
| GET/PATCH/DELETE | /api/talents/[id] | 인재 상세/수정/삭제 |
| GET/POST | /api/intake | 자료요청 목록/생성 |
| GET/POST | /api/orders | 주문 목록/생성 |
| GET/PATCH | /api/orders/[id] | 주문 상세/수정 |
| GET/POST | /api/quotes | 견적 목록/생성 |
| GET/PATCH | /api/quotes/[id] | 견적 상세/수정(발송) |
| GET/POST | /api/pricing | 상품 목록/추가 |
| GET/PATCH | /api/pricing/[id] | 상품 상세/수정 |
| GET/PATCH | /api/notifications | 알림 목록/읽음처리 |
| PATCH | /api/users/me | 내 정보 수정 |

### 공개 (토큰 기반, 세션 불필요)

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/public/page/[token] | 공개 프로필 데이터 |
| POST | /api/public/review/[token] | 검토 요청 처리 |
| GET/POST | /api/public/quote/[token] | 공개 견적 조회/승인 |
| GET | /api/public/delivered/[token] | 납품완료 확인 |
| POST | /api/intake/[token] | 자료 제출 (공개) |

### Admin 전용 (MASTER_ADMIN role)

| Method | Path | 설명 |
|--------|------|------|
| GET/PATCH | /api/admin/users | 유저 목록/관리 |
| GET | /api/admin/projects | 전체 프로젝트 조회 |
| GET | /api/admin/orders | 전체 주문/정산 조회 |
| POST | /api/admin/settlement | 정산 배치 실행 |
| GET/POST | /api/admin/refunds | 환불 목록/처리 |
| POST | /api/admin/notify | 공지 발송 (전체/특정) |

---

## 8. 이번 세션 작업 파일 목록

### 신규 생성

| 파일 | 설명 |
|------|------|
| src/app/dashboard/notifications/page.tsx | 알림 목록 페이지 |
| src/app/dashboard/intake/page.tsx | 자료요청 링크 관리 |
| src/app/dashboard/quotes/new/page.tsx | 견적서 생성 폼 |
| src/app/dashboard/quotes/[id]/page.tsx | 견적서 상세 |
| src/app/dashboard/pricing/new/page.tsx | 상품 추가 폼 |
| src/app/dashboard/pricing/[id]/page.tsx | 상품 상세 (버전이력) |
| src/app/admin/monitoring/page.tsx | 프로젝트 모니터링 |
| src/app/admin/orders/page.tsx | 주문/정산 관리 |
| src/app/admin/refunds/page.tsx | 환불 관리 |
| src/app/admin/notifications/page.tsx | 공지 발송 |
| src/app/admin/system/page.tsx | 시스템 설정 |
| src/app/api/intake/route.ts | 자료요청 API |
| src/app/api/pricing/route.ts | 상품 API |
| src/app/api/quotes/route.ts | 견적 API |
| src/app/api/quotes/[id]/route.ts | 견적 상세 API |
| src/app/api/public/quote/[token]/route.ts | 공개 견적 토큰 API |
| src/app/api/public/delivered/[token]/route.ts | 납품완료 토큰 API |
| src/app/api/admin/notify/route.ts | Admin 공지 발송 API |

### 수정 (버그/ESLint 수정)

| 파일 | 수정 내용 |
|------|-----------|
| src/app/dashboard/builder/[projectId]/page.tsx | Career/Portfolio/Strength 패널 완전 구현 (stub → 실제 코드) |
| src/components/layout/DashboardHeader.tsx | userId prop 완전 제거, 알림 벨 구현 |
| src/app/dashboard/layout.tsx | DashboardHeader userId prop 제거 |
| src/lib/supabase/server.ts | catch (error) → catch { } (ESLint) |
| src/lib/utils.ts | 미사용 clsx import 제거 (ESLint) |
| src/app/api/public/review/[token]/route.ts | 미사용 logAudit import 제거 (ESLint) |
| src/app/api/users/me/route.ts | 미사용 const updated 변수 제거 (ESLint) |

---

## 9. Phase별 완료 현황

| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 1 | DB 스키마 (prisma/schema.prisma) | 완료 |
| Phase 2 | 인증 & 미들웨어 | 완료 |
| Phase 3 | 대시보드 레이아웃 & 홈 | 완료 |
| Phase 4 | 페이지 빌더 (builder/[projectId]) | 완료 |
| Phase 5 | 인재/프로젝트 CRUD | 완료 |
| Phase 6 | 자료요청(Intake) & 주문(Order) | 완료 |
| Phase 7 | 견적(Quote) & 상품(Pricing) | 완료 |
| Phase 8 | 공개 페이지 & 토큰 API | 완료 |
| Phase 9 | 알림 시스템 | 완료 |
| Phase 10 | Admin 패널 (유저/프로젝트/주문/정산/환불/모니터링) | 완료 |
| Phase 11 | ESLint/빌드 오류 수정 → pnpm build 성공 | 완료 |

---

## 10. 빌드 오류 수정 이력

| 파일 | 오류 | 수정 |
|------|------|------|
| DashboardHeader.tsx | `userId` unused prop | prop + interface 완전 제거 |
| supabase/server.ts | `catch (error)` unused var | `catch { }` |
| utils.ts | `clsx` unused import | import 제거 |
| public/review/[token]/route.ts | `logAudit` unused import | import 제거 |
| users/me/route.ts | `const updated` unused var | 변수 할당 제거 |

---

*이 보고서는 Claude Code (claude-sonnet-4-6)가 CASTFOLIO_CLAUDE_CODE_TASK_v1.4_FINAL.md 기반으로 작업한 전체 내용을 요약한 것입니다.*
