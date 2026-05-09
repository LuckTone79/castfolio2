# Castfolio 아키텍처 상세 다이어그램

## 1. 시스템 아키텍처 (전체 구조)

```
┌─────────────────────────────────────────────────────────────────┐
│                        클라이언트 (Browser)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  파트너      │    │  방송인      │    │   운영자     │      │
│  │  대시보드    │    │  (로그인X)   │    │  대시보드    │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Vercel (Next.js + React)                       │
│                   castfolio.wideget.net                         │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (UI Layer)                                             │
│  ├─ Page Router: /, /login, /dashboard, /admin                 │
│  ├─ Styling: Tailwind CSS + Framer Motion                      │
│  └─ i18n: next-intl (Ko, En, Cn)                               │
├─────────────────────────────────────────────────────────────────┤
│  API Server (Next.js Route Handlers)                            │
│  ├─ /api/auth/* (인증)                                         │
│  ├─ /api/projects/* (프로젝트)                                 │
│  ├─ /api/pages/* (페이지)                                      │
│  ├─ /api/orders/* (주문)                                       │
│  ├─ /api/intake/* (자료 수집)                                  │
│  └─ /api/public/* (로그인 불필요)                             │
├─────────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                            │
│  ├─ lib/auth.ts (인증 헬퍼)                                    │
│  ├─ lib/storage.ts (파일 저장)                                 │
│  ├─ lib/mail.ts (이메일)                                       │
│  ├─ lib/pdf.ts (PDF 생성)                                      │
│  ├─ lib/qr.ts (QR 코드)                                        │
│  └─ lib/image.ts (이미지 최적화)                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     External Services                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │   Supabase       │  │    Resend      │  │   Google      │  │
│  │  (PostgreSQL)    │  │   (Email API)  │  │   GenAI       │  │
│  │  + Storage       │  │                │  │  (AI SDK)     │  │
│  │  + Auth          │  │                │  │               │  │
│  └──────────────────┘  └────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 데이터베이스 관계도 (ER Diagram)

```
┌──────────────┐
│    User      │ (파트너)
│  - id        │
│  - email     │
│  - name      │
│  - company   │
│  - commission│
└──────┬───────┘
       │ 1:N
       ├─────────────────────────┐
       │                         │
       ↓                         ↓
┌──────────────┐        ┌──────────────────┐
│   Talent     │        │ ProductPackage   │
│  - id        │        │  - id            │
│  - nameKo    │        │  - name          │
│  - position  │        │  - description   │
│  - email     │        └──────┬───────────┘
└──────┬───────┘                │ 1:N
       │ 1:N                    ↓
       │           ┌─────────────────────────┐
       │           │ PricingPolicyVersion    │
       │           │  - basePrice            │
       │           │  - promoPrice           │
       │           └─────────────────────────┘
       │
       ↓
┌─────────────────────┐
│    Project          │
│  - id               │
│  - talentId         │
│  - userId           │
│  - status           │
│  - intakeMode       │
└──────┬──────────────┘
       │ 1:N
       ├─────────────────────────┐
       │                         │
       ↓                         ↓
┌──────────────┐        ┌──────────────────┐
│    Page      │        │   IntakeForm     │
│  - id        │        │  - id            │
│  - slug      │        │  - token         │
│  - theme     │        │  - expiresAt     │
│  - contentKo │        └──────┬───────────┘
│  - contentEn │               │ 1:N
│  - contentCn │               ↓
│  - status    │        ┌─────────────────────┐
└──────────────┘        │ IntakeSubmission    │
                        │  - data (JSON)      │
                        │  - submittedBy      │
                        └─────────────────────┘
                        
       │ 1:1
       ↓
┌─────────────────────┐
│   PageVersion       │
│  - versionName      │
│  - draftSnapshot    │
│  - savedBy          │
└─────────────────────┘

       │ 1:N
       │
       ├─────────────────────────┐
       │                         │
       ↓                         ↓
┌──────────────┐        ┌──────────────────┐
│  Quote       │        │   MediaAsset     │
│  - token     │        │  - projectId     │
│  - status    │        │  - type          │
│  - amount    │        │  - originalUrl   │
│  - validUntil        │  - optimizedUrl  │
└──────┬───────┘        └──────────────────┘
       │ 0:1
       ↓
┌──────────────┐
│    Order     │
│  - id        │
│  - status    │
│  - amount    │
│  - commission│
└──────┬───────┘
       │ 1:N
       │
       ├─────────────────────────────────────┐
       │                                     │
       ↓                                     ↓
┌────────────────┐            ┌──────────────────────┐
│ OrderLineItem  │            │ CommissionLedger     │
│  - amount      │            │  - orderAmount       │
│  - quantity    │            │  - commissionAmount  │
└────────────────┘            │  - userAmount        │
                              └──────┬───────────────┘
                                     │
                                     ↓
                              ┌────────────────────┐
                              │ SettlementBatch    │
                              │  - periodStart     │
                              │  - periodEnd       │
                              │  - totalSales      │
                              │  - totalCommission │
                              └────────────────────┘
```

---

## 3. 서비스 흐름 (Swimlane Diagram)

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  Castfolio   │   파트너     │   자료 수집   │  방송사/PD  │
│   운영자     │   (Creator)  │   (Talent)   │   (Recruiter)│
└──────────────┴──────────────┴──────────────┴──────────────┘

1️⃣  아카운트 관리
    │ 파트너 계정 승인
    │────────────→│
    │            │
    │            │ 자신의 고객 추가 (Talent)
    │            │────────────→│


2️⃣  자료 수집
    │            │ 자료 요청 링크 생성
    │←───────────│
    │            │ 로그인 불필요 URL 발급
    │            │────────────→│
    │            │            │ 사진, 자료 제출
    │            │←───────────│
    │ (모니터링) │←───────────│


3️⃣  페이지 제작
    │            │
    │            │ 자료 import → 홈페이지 초안 생성
    │            │ (Builder로 theme 선택, 수정)
    │            │
    │            │ 검토 링크 발급
    │            │────────────→│
    │            │            │ 검토 및 수정 요청
    │            │←───────────│
    │            │


4️⃣  판매 및 납품
    │            │
    │            │ 판매 확정 (가격 입력)
    │            │ 최종 공개 URL 확정
    │            │────────────────────→│
    │            │                    │ 방송사/PD 제출
    │            │


5️⃣  정산
    │ 판매 확정 금액 기준 수수료 계산
    │ Partner: 85% / Platform: 15%
    │
    │ 월별 정산 배치 실행
    │ CommissionLedger → SettlementBatch
    │
    │ 파트너에게 정산액 통보
    │ (이메일)
    │────────────→│

```

---

## 4. API 요청-응답 흐름

### 4.1 로그인 흐름

```
┌─────────────────────────────────────────────────────────┐
│ 1. Client: GET /login                                   │
│    → Next.js 렌더링 (로그인 폼)                         │
│    ← 200: HTML + Form                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 2. Client: POST /auth/login (email, password)           │
│    → Supabase Auth API 호출                             │
│    ← 200: { session, user }                             │
│           (JWT 토큰 포함)                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 3. Client: GET /api/auth/me                             │
│    Headers: Authorization: Bearer {token}               │
│    → Prisma: User 조회                                  │
│    ← 200: { user, role, company, ... }                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 4. Client → /dashboard (with session)                   │
│    ← 200: Dashboard UI (권한 기반)                      │
└─────────────────────────────────────────────────────────┘
```

### 4.2 프로젝트 생성 흐름

```
┌─────────────────────────────────────────────────────────┐
│ 1. Client: POST /api/projects                           │
│    Body: {                                              │
│      talentId: "uuid",                                  │
│      name: "방송인 이름",                               │
│      purpose: "이력서용"                                │
│    }                                                    │
│    Headers: Authorization: Bearer {token}              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Server: 권한 검증 (user.id = userId)               │
│    ✓ 통과 → Prisma 저장                                │
│    ✗ 실패 → 403 Forbidden                              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Server: Project 생성 + IntakeForm 생성              │
│    Project {                                            │
│      id: "uuid",                                        │
│      userId, talentId,                                  │
│      status: "NEW",                                     │
│      intakeMode: "SELF_SUBMISSION"                      │
│    }                                                    │
│    IntakeForm {                                         │
│      projectId: "uuid",                                 │
│      token: "uuid" ← 자료 수집 링크용                  │
│    }                                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Server → Client: 200 OK                              │
│    {                                                    │
│      projectId: "uuid",                                 │
│      intakeLink: "/public/intake/{token}",             │
│      message: "자료 수집 링크 생성됨"                   │
│    }                                                    │
└─────────────────────────────────────────────────────────┘
```

### 4.3 로그인 불필요 자료 제출 (공개 링크)

```
┌─────────────────────────────────────────────────────────┐
│ 1. 파트너가 방송인에게 링크 발송                         │
│    https://castfolio.wideget.net/public/intake/{token}  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 2. 방송인: 로그인 없이 폼 접근 가능                      │
│    GET /public/intake/{token}                           │
│    → 200: 자료 제출 폼 (HTML)                           │
│    (별도 인증 불필요)                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 3. 방송인: 자료 제출 (사진, 자료 텍스트, 경력, 영상)   │
│    POST /api/public/intake/{token}                      │
│    Content-Type: multipart/form-data                    │
│    Body: {                                              │
│      profilePhoto: File,                                │
│      introduction: "문자열",                            │
│      career: "경력 데이터",                             │
│      videoLinks: ["url1", "url2"]                       │
│    }                                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Server: 파일 업로드 (Supabase Storage)              │
│    ├─ 이미지 최적화 (Sharp)                            │
│    ├─ 썸네일 생성                                      │
│    └─ URL 저장 (MediaAsset)                            │
│                                                         │
│    IntakeSubmission 저장 (data as JSON)                │
│    {                                                    │
│      formId: "uuid",                                    │
│      data: {                                            │
│        profilePhotoUrl: "...",                          │
│        introduction: "...",                             │
│        career: "...",                                   │
│        videoLinks: [...]                               │
│      },                                                 │
│      status: "COMPLETE"                                │
│    }                                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Server → Client: 200 OK                              │
│    {                                                    │
│      message: "자료가 접수되었습니다.",                 │
│      submissionId: "uuid"                               │
│    }                                                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 6. 파트너 대시보드에 반영                                │
│    (Real-time: Webhook / Polling)                       │
│    자료 수집 완료 상태 표시                             │
│    "수집 완료: 사진 3장, 영상 2개"                      │
└─────────────────────────────────────────────────────────┘
```

### 4.4 페이지 빌더 저장 흐름

```
┌─────────────────────────────────────────────────────────┐
│ 1. Client: 파트너가 Builder에서 콘텐츠 편집            │
│    (Theme 선택, Sections 구성, 텍스트 입력)            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 2. Client: 자동 저장 (3초 마다)                         │
│    POST /api/pages/{pageId}/draft                       │
│    Body: {                                              │
│      draftContent: {                                    │
│        ko: { hero: {...}, profile: {...}, ... },      │
│        en: { hero: {...}, profile: {...}, ... },      │
│        zh: { hero: {...}, profile: {...}, ... }       │
│      },                                                 │
│      theme: "theme-1",                                  │
│      sectionOrder: ["hero", "profile", ...]           │
│    }                                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Server: Prisma 저장                                  │
│    Page {                                               │
│      id: "uuid",                                        │
│      draftContent: {...},  ← JSON blob                  │
│      status: "DRAFT",                                   │
│      updatedAt: NOW()                                   │
│    }                                                    │
│                                                         │
│    + PageVersion (버전 관리)                           │
│    {                                                    │
│      projectId: "uuid",                                 │
│      versionName: "auto_2026-05-08_15:30:45",         │
│      draftSnapshot: {...},                              │
│      savedBy: "userId"                                  │
│    }                                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Server → Client: 200 OK                              │
│    {                                                    │
│      pageId: "uuid",                                    │
│      lastSaved: "2026-05-08T15:30:45Z",               │
│      versionId: "version-uuid"                          │
│    }                                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 5. 배포 구조

```
┌─────────────────────────────────────────────────────────┐
│            Vercel (Production Environment)              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Next.js Application                            │ │
│  │  ├─ Frontend (React Components)                  │ │
│  │  │  ├─ /pages → Server Components              │ │
│  │  │  └─ /components → Client Components         │ │
│  │  │                                              │ │
│  │  ├─ API Routes (/api/*)                        │ │
│  │  │  └─ Route Handlers (TypeScript)             │ │
│  │  │                                              │ │
│  │  └─ Static Assets                               │ │
│  │     ├─ /public (Images, Icons)                 │ │
│  │     └─ /fonts (Custom Fonts)                   │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Environment Variables (from Vercel Secrets)    │ │
│  │  ├─ DATABASE_URL                               │ │
│  │  ├─ SUPABASE_URL / SUPABASE_ANON_KEY           │ │
│  │  ├─ RESEND_API_KEY                             │ │
│  │  └─ GOOGLE_GENAI_API_KEY (for castfolio-v5)   │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Build Process (vercel.json)                    │ │
│  │  ├─ Commands:                                   │ │
│  │  │  buildCommand: "prisma generate && next     │ │
│  │  │                 build"                       │ │
│  │  │  startCommand: "next start"                  │ │
│  │  │  installCommand: "npm install"              │ │
│  │  │                                              │ │
│  │  └─ Caching:                                    │ │
│  │     ├─ .next/cache (Build Cache)               │ │
│  │     └─ node_modules (Dependency Cache)         │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Domains                                         │ │
│  │  ├─ castfolio.wideget.net (Primary)            │ │
│  │  └─ Custom domain config (CNAME/A record)      │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  SSL/TLS (Vercel Managed)                       │ │
│  │  ├─ Auto-renewal: ✅                            │ │
│  │  └─ Security Headers: ✅ (HSTS, etc.)          │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘

                          ↓
        
┌─────────────────────────────────────────────────────────┐
│              External Services (Multi-Region)           │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌────────────────────┐      │
│  │  Supabase            │  │  Resend            │      │
│  │  (PostgreSQL)        │  │  (Email Service)   │      │
│  │  Region: US-East     │  │  Region: Global    │      │
│  │  ├─ Auth             │  │  ├─ SMTP API       │      │
│  │  ├─ Database         │  │  └─ Email Logs     │      │
│  │  ├─ Storage (S3)     │  └────────────────────┘      │
│  │  └─ Realtime (WS)    │                              │
│  └──────────────────────┘  ┌────────────────────┐      │
│                             │  Google GenAI      │      │
│                             │  (AI API)          │      │
│                             │  ├─ Text Gen       │      │
│                             │  └─ Content        │      │
│                             │     Moderation     │      │
│                             └────────────────────┘      │
└─────────────────────────────────────────────────────────┘

                          ↓

┌─────────────────────────────────────────────────────────┐
│              CDN (Vercel Edge Network)                  │
├─────────────────────────────────────────────────────────┤
│  ├─ Static Files Caching                               │
│  ├─ Image Optimization (Next.js Image)                 │
│  ├─ Edge Middleware                                    │
│  └─ Geo-location Routing                               │
└─────────────────────────────────────────────────────────┘
```

---

## 6. 데이터 흐름 (State Management)

```
┌──────────────────────────────────────────────────────────┐
│             Client-Side State (Zustand)                  │
├──────────────────────────────────────────────────────────┤
│  Store:                                                  │
│  ├─ User (로그인 사용자 정보)                            │
│  │  ├─ id, email, name, role                           │
│  │  ├─ company, commissionRate                         │
│  │  └─ permissions                                      │
│  │                                                      │
│  ├─ Projects (프로젝트 목록 캐시)                       │
│  │  ├─ [{ id, name, status, talent, ... }, ...]      │
│  │  └─ selectedProjectId                               │
│  │                                                      │
│  ├─ PageDraft (Builder 임시 상태)                      │
│  │  ├─ draftContent ({ ko, en, zh })                 │
│  │  ├─ theme                                           │
│  │  ├─ isDirty (변경 감지)                            │
│  │  └─ lastSaved                                       │
│  │                                                      │
│  └─ UI (UI 상태)                                       │
│     ├─ sidebarOpen                                     │
│     ├─ theme (dark/light)                              │
│     └─ notificationToast                               │
│                                                         │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│             Server-Side Session (Supabase)               │
├──────────────────────────────────────────────────────────┤
│  JWT Token:                                              │
│  ├─ user_id (claim)                                    │
│  ├─ email (claim)                                      │
│  ├─ exp (만료 시간)                                    │
│  └─ ... (기타 claims)                                  │
│                                                         │
│  Stored in:                                             │
│  ├─ HTTP-only Cookie (Secure)                          │
│  └─ localStorage (Fallback)                            │
│                                                         │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│             Database Layer (Prisma + PostgreSQL)         │
├──────────────────────────────────────────────────────────┤
│  Relationships:                                          │
│  ├─ User → Projects                                    │
│  ├─ User → Talents                                     │
│  ├─ Project → Pages                                    │
│  ├─ Project → Orders                                   │
│  └─ Order → CommissionLedger                           │
│                                                         │
│  Caching Strategy:                                      │
│  ├─ Query Results (in-memory, 60s TTL)               │
│  ├─ User Profile (30s TTL)                            │
│  └─ Pricing Rules (never, reload on update)           │
│                                                         │
└──────────────────────────────────────────────────────────┘
```

---

## 7. 보안 계층 (Security Stack)

```
┌──────────────────────────────────────────────────────────┐
│                  Transport Security                      │
├──────────────────────────────────────────────────────────┤
│  ├─ HTTPS/TLS 1.3 (Vercel Managed)                     │
│  ├─ HSTS (Strict-Transport-Security)                    │
│  ├─ CSP (Content-Security-Policy)                       │
│  └─ X-Frame-Options (Clickjacking Protection)           │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                  Authentication                          │
├──────────────────────────────────────────────────────────┤
│  ├─ Supabase Auth (OAuth2 + JWT)                        │
│  ├─ Password Hashing (bcrypt, Supabase handled)         │
│  ├─ Session Management (Secure Cookies)                 │
│  └─ Email Verification                                  │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                  Authorization                           │
├──────────────────────────────────────────────────────────┤
│  ├─ Role-Based Access Control (RBAC)                    │
│  │  ├─ MASTER_ADMIN (Full access)                      │
│  │  └─ USER (Partner, limited access)                  │
│  │                                                      │
│  ├─ Row-Level Security (Supabase RLS)                  │
│  │  ├─ User can only access own projects              │
│  │  ├─ Talent can only submit to own intake forms      │
│  │  └─ Public routes (public intake, review, etc.)    │
│  │                                                      │
│  └─ API Authorization (Next.js Middleware)             │
│     ├─ Token validation (JWT)                          │
│     └─ User context injection                          │
│                                                         │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                  Data Security                           │
├──────────────────────────────────────────────────────────┤
│  ├─ Sensitive Fields Encryption                         │
│  │  ├─ Phone numbers                                    │
│  │  ├─ Email addresses (optional)                       │
│  │  └─ Payment info (not stored)                        │
│  │                                                      │
│  ├─ File Upload Security                               │
│  │  ├─ File type validation                            │
│  │  ├─ Virus scanning (optional, via Resend)          │
│  │  └─ Private storage bucket (Supabase)               │
│  │                                                      │
│  └─ PII Protection                                      │
│     ├─ No logging of sensitive data                     │
│     └─ Audit trail                                      │
│                                                         │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                  API Security                            │
├──────────────────────────────────────────────────────────┤
│  ├─ Rate Limiting (TODO: implement)                     │
│  ├─ CORS Policy (defined)                               │
│  ├─ CSRF Protection (built into Next.js)                │
│  └─ Input Validation (validators.ts)                    │
│     ├─ XSS prevention (DOMPurify, sanitize HTML)      │
│     └─ SQL injection prevention (Prisma parameterized) │
│                                                         │
└──────────────────────────────────────────────────────────┘
```

---

**작성일**: 2026-05-08  
**아키텍처 버전**: v1.1.0
