# 사이트 분리 아키텍처 설계안

## 목표
CastFolio를 **제작자(파트너) 전용 사이트**와 **고객(방송인) 전용 사이트**로 분리하여,
두 사용자 그룹이 서로의 인터페이스에 혼동 없이 자연스럽게 사용할 수 있도록 한다.

---

## 현재 구조 분석

### 현재 도메인: `castfolio.wideget.net` (단일)

```
castfolio.wideget.net/
│
├── /                          ← 랜딩 (파트너 대상 B2B SaaS 소개)
├── /login                     ← 파트너 로그인
├── /guide, /demo, /create     ← 마케팅 페이지 (marketing 그룹)
│
├── /app/                      ← 파트너 대시보드 (인증 필요)
│   ├── /app/talents           ← 방송인 고객 관리
│   ├── /app/intake            ← 자료 수집 관리
│   ├── /app/sales             ← 매출 관리
│   ├── /app/settlements       ← 정산 내역
│   └── /app/builder/[id]      ← PR 빌더
│
├── /admin/                    ← 관리자 (인증 + admin role)
│   ├── /admin/users           ← 파트너 관리
│   ├── /admin/pages           ← 전체 페이지
│   ├── /admin/sales           ← 전체 매출
│   └── /admin/settlements     ← 전체 정산
│
├── /p/[slug]                  ← 공개 PR 페이지 (방송인 최종 결과물)
├── /p/demo                    ← 데모 페이지
│
├── /submit/[token]            ← 방송인 자료 제출 (토큰 기반, 로그인 불필요)
├── /review/[token]            ← 방송인 검토 페이지 (토큰 기반)
│
├── /public/intake/[token]     ← 자료 수집 (구버전 경로)
├── /public/review/[token]     ← 검토 (구버전 경로)
├── /public/quote/[token]      ← 견적서
└── /public/delivered/[token]  ← 납품 완료
```

### 혼동 발생 지점
1. 방송인 고객이 `castfolio.wideget.net`에 접속하면 **파트너 B2B SaaS 랜딩 페이지**를 보게 됨
2. 방송인이 "파트너로 시작하기" 버튼을 혼동할 수 있음
3. `/submit/`, `/review/` 같은 고객용 경로와 `/app/` 파트너 경로가 같은 도메인에 혼재
4. `/create` (위저드)도 파트너가 쓰는 것인지, 고객이 쓰는 것인지 불명확

---

## 신규 분리 구조

### 도메인 배치

| 도메인 | 용도 | 대상 |
|--------|------|------|
| `partner.castfolio.kr` | 파트너(제작자) 전용 사이트 | 파트너, 관리자 |
| `castfolio.kr` | 고객(방송인) 전용 사이트 + 공개 페이지 | 방송인 고객, 일반 방문자 |

> **대안**: `app.castfolio.kr` (파트너) + `castfolio.kr` (고객)
> 또는 `studio.castfolio.kr` (파트너) + `castfolio.kr` (고객)

---

### Site A: `partner.castfolio.kr` — 파트너(제작자) 전용

```
partner.castfolio.kr/
│
├── /                          ← 파트너 랜딩 (B2B SaaS 소개, CTA: 파트너 가입)
├── /login                     ← 파트너 로그인
├── /guide                     ← 파트너 운영 가이드
│
├── /app/                      ← 파트너 대시보드
│   ├── /app/talents           ← 방송인 고객 관리
│   ├── /app/intake            ← 자료 수집 관리
│   ├── /app/sales             ← 매출 관리
│   ├── /app/settlements       ← 정산 내역
│   └── /app/builder/[id]      ← PR 빌더 (테마 시스템 v2.0)
│
├── /admin/                    ← 관리자 전용
│   ├── /admin/users
│   ├── /admin/pages
│   ├── /admin/sales
│   └── /admin/settlements
│
└── /demo                      ← 파트너에게 보여주는 샘플 갤러리
```

**이 사이트에서 볼 수 없는 것:**
- 방송인 자료 제출 폼
- 방송인 검토 페이지
- 공개 PR 페이지
- 방송인 대상 마케팅

---

### Site B: `castfolio.kr` — 고객(방송인) 전용

```
castfolio.kr/
│
├── /                          ← 방송인 랜딩
│                                 "내 PR 홈페이지가 이미 만들어지고 있습니다"
│                                 "자료 제출 링크를 받으셨나요?"
│                                 → 토큰 입력 or 자료 제출 링크 안내
│
├── /submit/[token]            ← 자료 제출 (로그인 불필요, 토큰 기반)
├── /review/[token]            ← 완성본 검토 + 수정 요청
├── /delivered/[token]         ← 납품 완료 확인
├── /quote/[token]             ← 견적서 확인
│
├── /p/[slug]                  ← 공개 PR 페이지 (최종 결과물)
├── /p/demo                    ← 데모 PR 페이지
│
├── /create                    ← 셀프 서비스 위저드 (선택적)
│                                 방송인이 직접 체험해볼 수 있는 간소화 빌더
│
└── /faq                       ← 고객 FAQ
    "누가 만들어주나요?" "비용은?" "수정 요청은 어떻게?"
```

**이 사이트에서 볼 수 없는 것:**
- 파트너 대시보드
- 관리자 패널
- 매출/정산 관련 모든 것
- "파트너로 시작하기" CTA

---

## 구현 전략

### 방법 A: Next.js Middleware 기반 도메인 라우팅 (단일 앱)

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // ═══ Site B: castfolio.kr (고객용) ═══
  if (hostname.includes("castfolio.kr") && !hostname.includes("partner.")) {
    // 고객 사이트에서 파트너 경로 차단
    if (pathname.startsWith("/app") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("https://partner.castfolio.kr" + pathname));
    }
    // 고객 사이트 랜딩 리라이트
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/client-landing", request.url));
    }
  }

  // ═══ Site A: partner.castfolio.kr (파트너용) ═══
  if (hostname.includes("partner.")) {
    // 파트너 사이트에서 고객 경로 차단
    if (pathname.startsWith("/submit") || pathname.startsWith("/review")) {
      return NextResponse.redirect(new URL("https://castfolio.kr" + pathname));
    }
    // 파트너 사이트 기본 동작 (기존 랜딩)
  }

  // ... 기존 auth 로직
}
```

**장점:** 단일 코드베이스, 단일 배포, DB/API 공유 자연스러움
**단점:** middleware 복잡도 증가, 두 사이트 결합도 높음

### 방법 B: Vercel 멀티 도메인 + 라우트 그룹 (단일 앱, 추천)

```
src/app/
├── (partner)/               ← partner.castfolio.kr 전용
│   ├── layout.tsx           ← 파트너 브랜딩
│   ├── page.tsx             ← 파트너 랜딩
│   ├── login/
│   ├── guide/
│   ├── demo/
│   ├── app/                 ← 대시보드
│   └── admin/               ← 관리자
│
├── (client)/                ← castfolio.kr 전용
│   ├── layout.tsx           ← 고객 브랜딩 (따뜻한 톤)
│   ├── page.tsx             ← 고객 랜딩
│   ├── submit/[token]/
│   ├── review/[token]/
│   ├── delivered/[token]/
│   ├── quote/[token]/
│   ├── create/
│   └── faq/
│
├── (shared)/                ← 양쪽 모두 접근 가능
│   └── p/[slug]/            ← 공개 PR 페이지
│
└── layout.tsx               ← 루트 (공통 폰트, 메타)
```

middleware에서 `hostname` 기반으로 라우트 그룹을 리라이트:

```typescript
// 간략 pseudo-code
if (isClientDomain) {
  rewrite("/(client)" + pathname);
} else if (isPartnerDomain) {
  rewrite("/(partner)" + pathname);
}
// /p/[slug]는 (shared)에 있으므로 양쪽에서 접근 가능
```

**장점:** 완전한 UI 분리, 각 사이트별 layout/브랜딩 독립, 하나의 앱으로 배포
**단점:** 기존 라우트 대규모 이동 필요

### 방법 C: 완전 분리 (두 개의 Next.js 앱) — 비추천

**장점:** 완전 독립
**단점:** 코드 중복 심각, 공유 컴포넌트/API 분리 복잡, 배포 2배

---

## 추천: 방법 B (라우트 그룹 + 도메인 라우팅)

### 마이그레이션 단계

```
Phase 1: 라우트 그룹 분리 (코드 구조)
  └── 기존 라우트를 (partner)/ (client)/ (shared)/로 재배치
  └── 각 그룹에 독립 layout.tsx 생성

Phase 2: 고객 랜딩 페이지 제작
  └── (client)/page.tsx — 방송인 대상 친근한 랜딩
  └── (client)/faq/page.tsx

Phase 3: Middleware 도메인 라우팅
  └── hostname 기반 리라이트 로직 추가
  └── 크로스 도메인 리다이렉트 (잘못된 접근 시)

Phase 4: Vercel 도메인 설정
  └── castfolio.kr → 고객 사이트
  └── partner.castfolio.kr → 파트너 사이트

Phase 5: 기존 URL 호환
  └── /submit/[token] → castfolio.kr/submit/[token] 리다이렉트
  └── /public/* 레거시 → castfolio.kr/* 리다이렉트
```

---

## 라우트 매핑 상세

### 기존 → 신규 경로 매핑

| 기존 경로 | 신규 위치 | 도메인 |
|-----------|----------|--------|
| `/` (파트너 랜딩) | `(partner)/page.tsx` | partner.castfolio.kr |
| `/login` | `(partner)/login/page.tsx` | partner.castfolio.kr |
| `/guide` | `(partner)/guide/page.tsx` | partner.castfolio.kr |
| `/demo` | `(partner)/demo/page.tsx` | partner.castfolio.kr |
| `/app/*` | `(partner)/app/*` | partner.castfolio.kr |
| `/admin/*` | `(partner)/admin/*` | partner.castfolio.kr |
| `/create` | `(client)/create/page.tsx` | castfolio.kr |
| `/submit/[token]` | `(client)/submit/[token]/page.tsx` | castfolio.kr |
| `/review/[token]` | `(client)/review/[token]/page.tsx` | castfolio.kr |
| `/public/intake/[token]` | `(client)/submit/[token]` 리다이렉트 | castfolio.kr |
| `/public/review/[token]` | `(client)/review/[token]` 리다이렉트 | castfolio.kr |
| `/public/quote/[token]` | `(client)/quote/[token]/page.tsx` | castfolio.kr |
| `/public/delivered/[token]` | `(client)/delivered/[token]/page.tsx` | castfolio.kr |
| `/p/[slug]` | `(shared)/p/[slug]/page.tsx` | 양쪽 |
| `/p/demo` | `(shared)/p/demo/page.tsx` | 양쪽 |

---

## 브랜딩 차별화

### Site A: partner.castfolio.kr

```
톤: 전문적, B2B SaaS, 업무 중심
색상: Slate/Indigo 기반 (현재 유지)
로고: "CastFolio Partner"
CTA: "파트너로 시작하기", "고객 관리 시작"
네비게이션: 운영 구조 · 파트너 기능 · 업무 흐름 · 수수료 · FAQ
```

### Site B: castfolio.kr

```
톤: 친근한, 신뢰감, 방송인 중심
색상: Warm neutral / Soft accent
로고: "CastFolio" (Partner 미표시)
CTA: "자료 제출하기", "내 페이지 확인하기"
네비게이션: 자료 제출 · 제작 과정 · FAQ · 데모 보기
메인 메시지: "당신의 PR 홈페이지, 전문가가 만들어드립니다"
```

---

## 고객 랜딩 페이지 구조 (신규)

```
castfolio.kr/
┌─────────────────────────────────────────────┐
│  CastFolio                    자료 제출 안내 │
├─────────────────────────────────────────────┤
│                                             │
│  당신만의 PR 홈페이지,                       │
│  전문가가 만들어드립니다                      │
│                                             │
│  [자료 제출 링크가 있으신가요?]               │
│  → 토큰 입력 필드                            │
│                                             │
│  ──── 또는 ────                              │
│                                             │
│  [데모 페이지 보기]  [직접 만들어보기]        │
│                                             │
├─────────────────────────────────────────────┤
│  이런 분들을 위한 서비스                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │아나운서│ │쇼호스트│ │  MC  │ │리포터 │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│                                             │
├─────────────────────────────────────────────┤
│  제작 과정                                   │
│  1. 자료 제출 → 2. 전문가 제작 →            │
│  3. 검토/수정 → 4. 최종 납품                │
│                                             │
├─────────────────────────────────────────────┤
│  자주 묻는 질문                               │
│  "비용은 얼마인가요?"                         │
│  "수정은 몇 번까지 가능한가요?"               │
│  "제작 기간은 얼마나 걸리나요?"               │
│                                             │
├─────────────────────────────────────────────┤
│  © CastFolio  |  제작 파트너이신가요?         │
│                  → partner.castfolio.kr     │
└─────────────────────────────────────────────┘
```

---

## API 라우트 처리

API는 내부적이므로 도메인 분리 불필요. 단일 `/api/*`로 유지.

```
/api/public/intake/[token]     ← 고객 자료 제출 API
/api/public/review/[token]     ← 고객 검토 API
/api/app/*                     ← 파트너 대시보드 API (인증 필요)
/api/admin/*                   ← 관리자 API (인증 필요)
```

---

## Vercel 도메인 설정

```
Project: castfolio2
Domains:
  - castfolio.kr              → Production (고객 사이트)
  - partner.castfolio.kr      → Production (파트너 사이트)
  - castfolio.wideget.net     → Legacy redirect → castfolio.kr
```

---

## 위험 요소

1. **SEO 영향**: 기존 URL에서 신규 URL로 301 리다이렉트 필수
2. **토큰 링크 유효성**: 기존에 발송된 `/submit/[token]` 링크가 castfolio.wideget.net 기준 → 리다이렉트 필요
3. **Supabase Auth 도메인**: 두 도메인에서 같은 Supabase 프로젝트 사용 시 CORS/redirect URL 설정 추가
4. **쿠키 도메인**: `.castfolio.kr` 와일드카드로 설정하면 서브도메인 간 세션 공유 가능
5. **middleware 복잡도**: 도메인 판별 로직이 개발환경(localhost)과 프로덕션에서 다르게 동작

---

## 검토 요청 사항

1. 방법 B(라우트 그룹 + 도메인 라우팅) vs 방법 A(순수 middleware) 선택
2. 도메인 네이밍: `partner.castfolio.kr` vs `app.castfolio.kr` vs `studio.castfolio.kr`
3. `/create` 위저드의 위치: 고객 사이트? 파트너 사이트? 양쪽?
4. 고객 랜딩 페이지의 톤/메시지 방향성
5. 마이그레이션 우선순위 (Phase 1-5 중 어디까지 한 번에?)
