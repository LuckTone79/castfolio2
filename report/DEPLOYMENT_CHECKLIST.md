# Castfolio v2 — 배포 및 테스트 체크리스트

**작성일:** 2026-03-16
**대상:** 로컬 개발 → Supabase 배포 → 베타 런칭

---

## Phase 1: 로컬 개발 환경 설정

### 1-1. 의존성 설치
- [ ] `pnpm install` 실행
  ```bash
  cd "PR Maker"
  pnpm install
  ```
- [ ] 설치 완료 확인 (node_modules 생성)
- [ ] 주요 패키지 버전 확인
  ```bash
  pnpm list next zustand @tiptap/react
  ```

### 1-2. 환경 변수 설정
- [ ] `.env.local` 파일 생성 (`.env.local.example` 참고)
  ```bash
  cp .env.local.example .env.local
  ```
- [ ] 필수 변수 입력:
  - [ ] `NEXT_PUBLIC_APP_URL` = "http://localhost:3000"
  - [ ] `DATABASE_URL` = Supabase PostgreSQL 연결 문자열
  - [ ] `SUPABASE_URL` = Supabase 프로젝트 URL
  - [ ] `SUPABASE_ANON_KEY` = Supabase 익명 토큰
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` = Supabase 서비스 역할 토큰
  - [ ] `IP_HASH_SALT` = 보안용 난수 문자열
  - [ ] `SEED_ADMIN_SUPABASE_UID` = 마스터 어드민 Supabase UID

### 1-3. Prisma 설정
- [ ] Prisma 클라이언트 생성
  ```bash
  pnpm prisma generate
  ```
- [ ] DB 마이그레이션 (신규 프로젝트)
  ```bash
  pnpm prisma db push
  ```
- [ ] 마스터 어드민 시드
  ```bash
  pnpm prisma db seed
  ```
- [ ] Prisma Studio 확인 (선택)
  ```bash
  pnpm prisma studio
  ```

---

## Phase 2: 로컬 테스트

### 2-1. 개발 서버 시작
- [ ] 개발 서버 실행
  ```bash
  pnpm dev
  ```
- [ ] 접속: `http://localhost:3000`
- [ ] 페이지 로드 확인 (Hero, Features, FAQ 표시)
- [ ] 콘솔 에러 없음 확인

### 2-2. 랜딩 페이지 테스트
- [ ] `/` — 홈 페이지
  - [ ] Header 네비게이션 (기능 가이드, 데모, 로그인)
  - [ ] Hero 섹션 (제목, 설명, CTA 버튼)
  - [ ] Features 카드 (6개 표시)
  - [ ] Steps 섹션 (6단계)
  - [ ] Pricing 섹션 (15% 수수료)
  - [ ] FAQ 섹션 (5개 질문)
  - [ ] Footer

- [ ] `/guide` — 기능 가이드
  - [ ] 5개 섹션 로드
  - [ ] 마크다운 포맷 정상

- [ ] `/demo` — 테마 갤러리
  - [ ] 7개 테마 카드 표시
  - [ ] 각 테마별 미리보기 색상 적용
  - [ ] 데모 보기 링크 동작

### 2-3. 인증 테스트
- [ ] `/login` 접속
  - [ ] 로그인 폼 표시
  - [ ] 비로그인 상태 → 대시보드 접근 불가 (redirect)

- [ ] 회원가입 (Supabase Auth)
  - [ ] 이메일 입력
  - [ ] 비밀번호 입력
  - [ ] 회원가입 버튼 → 확인 이메일 발송 (Resend)
  - [ ] 이메일 링크 클릭 → 로그인

- [ ] 로그인 후
  - [ ] 대시보드 접근 가능
  - [ ] 세션 쿠키 설정 확인 (개발자 도구)

### 2-4. 대시보드 테스트 (로그인 필요)
- [ ] `/dashboard` — 프로젝트 목록
  - [ ] 프로젝트 생성 버튼
  - [ ] 기존 프로젝트 목록 표시

- [ ] 프로젝트 생성
  - [ ] 방송인 이름 입력 (한국어/영어)
  - [ ] 포지션 선택
  - [ ] 생성 버튼 → 프로젝트 생성

### 2-5. 빌더 테스트 (핵심)
- [ ] `/dashboard/builder/[projectId]` 접속
  - [ ] Zustand 초기화 (init() 호출)
  - [ ] draftContent 로드
  - [ ] sectionOrder 표시
  - [ ] disabledSections 표시

- [ ] **테마 변경**
  - [ ] 드롭다운에서 테마 선택
  - [ ] 미리보기 즉시 변경
  - [ ] `saveState` → "unsaved" 표시
  - [ ] 30초 후 자동 저장 (저장 상태 "saved")

- [ ] **강조색 변경**
  - [ ] 색상 픽커 클릭
  - [ ] 색상 선택 → 미리보기 변경
  - [ ] DB 저장 확인

- [ ] **언어 전환**
  - [ ] KO/EN/ZH 버튼
  - [ ] 각 언어 클릭 → 에디터 콘텐츠 전환
  - [ ] 언어별 독립 draftContent 유지

- [ ] **섹션 선택**
  - [ ] 좌측 섹션 버튼 (히어로, 프로필, 경력 등)
  - [ ] 각 섹션 클릭 → 우측 에디터 변경
  - [ ] 활성 섹션 하이라이트

- [ ] **이미지 업로드** (ImageUploader)
  - [ ] Hero 이미지
    - [ ] 드래그 & 드롭 구역
    - [ ] 파일 선택 후 업로드
    - [ ] Progress bar 표시
    - [ ] 업로드 완료 → 미리보기 표시
    - [ ] ID 저장 확인
  - [ ] Profile 사진
  - [ ] Portfolio 사진 (배열 추가)
    - [ ] 여러 사진 추가
    - [ ] 삭제 버튼 동작

- [ ] **텍스트 편집** (RichTextEditor)
  - [ ] Profile 소개
    - [ ] 텍스트 입력
    - [ ] Bold/Italic 버튼
    - [ ] Bullet/Ordered List
    - [ ] 글자 수 카운터 (500자)
    - [ ] 500자 초과 경고
  - [ ] Career 설명 (200자)
  - [ ] Strength 설명 (100자)

- [ ] **섹션 토글**
  - [ ] 섹션 우측 토글 버튼 (±)
  - [ ] 클릭 → 섹션 비활성화 (crossed out)
  - [ ] 다시 클릭 → 활성화
  - [ ] 미리보기에서 비활성 섹션 숨김
  - [ ] DB 저장 확인 (disabledSections)

- [ ] **미리보기**
  - [ ] Desktop/Mobile 버튼
  - [ ] 각 뷰포트 크기 반응형 표시
  - [ ] "미리보기 생성" 버튼
    - [ ] 클릭 → 새 탭 열림
    - [ ] Preview 페이지 로드

- [ ] **저장 & 배포**
  - [ ] "저장" 버튼 → 즉시 저장
  - [ ] "미리보기 생성" → Preview 토큰 생성 (공개 링크)
  - [ ] "배포" → 조건 확인 후 PUBLISHED 상태로

### 2-6. 주문 관리 테스트
- [ ] `/dashboard/orders` — 주문 목록
  - [ ] 주문 목록 표시
  - [ ] 상태별 필터 (선택)
  - [ ] 상세 페이지 링크

- [ ] `/dashboard/orders/[id]` — 주문 상세
  - [ ] 주문 번호, 금액, 상태 표시
  - [ ] 상태별 액션 버튼
    - [ ] DRAFT → "결제 요청" (submit)
    - [ ] PAYMENT_PENDING → "결제 확인" (confirm-payment)
    - [ ] PAID → "납품 완료" (deliver)
  - [ ] 결제 요청 → PAYMENT_PENDING 상태 변경
  - [ ] 결제 확인 → PAID 상태 변경
  - [ ] 납품 완료 → DELIVERED 상태 + deliveredAt 기록
  - [ ] 타임라인 기록 확인 (이벤트 로그)

### 2-7. 공개 페이지 테스트
- [ ] `/p/[slug]` — 공개 PR 페이지
  - [ ] 콘텐츠 표시 (hero, profile, career, portfolio, strength, contact)
  - [ ] 테마 적용 (색상, 폰트, 레이아웃)
  - [ ] 강조색 적용

- [ ] **다국어 전환** (공개 페이지에서)
  - [ ] LocaleSwitcher 표시 (KO/EN/ZH)
  - [ ] 버튼 클릭 → `/api/locale` POST
  - [ ] 쿠키 설정 (cf_locale)
  - [ ] 새로고침 → 해당 언어 유지

- [ ] **반응형**
  - [ ] Desktop (1280px+)
  - [ ] Tablet (768px)
  - [ ] Mobile (375px)

### 2-8. 보안 테스트 (중요)
- [ ] 비로그인 상태 → `/api/upload` POST → 401 반환
- [ ] 비로그인 상태 → `/api/projects` GET → 401 반환
- [ ] 비인증 관리자 → `/api/audit` GET → 403 반환
- [ ] 타 사용자의 프로젝트 → 404 반환
- [ ] 타 사용자의 주문 → 404 반환
- [ ] 콘솔에서 Prisma 쿼리 직접 실행 → 실행 불가 (CORS)

---

## Phase 3: Supabase 배포

### 3-1. Supabase 프로젝트 생성
- [ ] Supabase 콘솔 → 프로젝트 생성
- [ ] Region: 서울 (ap-southeast-2)
- [ ] Database password 설정 및 저장
- [ ] 프로젝트 생성 대기 (2-3분)

### 3-2. Supabase 자격증명 설정
- [ ] Project Settings → API
  - [ ] `SUPABASE_URL` 복사
  - [ ] `SUPABASE_ANON_KEY` 복사
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` 복사 (비공개 관리)

- [ ] `.env.local` 업데이트
  ```
  SUPABASE_URL=https://xxx.supabase.co
  SUPABASE_ANON_KEY=eyJxxx...
  SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
  DATABASE_URL=postgresql://postgres:...@xxx.supabase.co
  ```

### 3-3. 데이터베이스 마이그레이션
- [ ] Prisma 스키마 적용
  ```bash
  pnpm prisma db push
  ```
  - [ ] 스키마 확인: 모든 테이블 생성됨
  - [ ] 관계 설정 확인

- [ ] 마스터 어드민 시드
  ```bash
  pnpm prisma db seed
  ```
  - [ ] User (Master Admin) 생성 확인
  - [ ] `user.role === "ADMIN"`

### 3-4. Storage 설정 (이미지)
- [ ] Supabase Console → Storage
- [ ] Bucket 생성: `media-assets`
- [ ] Public 설정 (읽기 공개, 쓰기 인증 필요)
- [ ] CORS 설정
  ```json
  {
    "allowed_origins": ["*"],
    "allowed_methods": ["GET", "POST", "PUT", "DELETE"],
    "allowed_headers": ["*"]
  }
  ```

### 3-5. Auth 설정 (이메일 인증)
- [ ] Authentication → Email Auth
  - [ ] Enable Email/Password
  - [ ] Confirm Email (필수)
  - [ ] Email Templates 확인

- [ ] SMTP 설정 (Resend)
  - [ ] Resend API 키 설정
  - [ ] 발신 이메일 주소 설정

---

## Phase 4: Vercel 배포

### 4-1. Vercel 프로젝트 생성
- [ ] Vercel 콘솔 → New Project
- [ ] GitHub 저장소 연결 (또는 import from Git)
- [ ] 프로젝트 명: `castfolio`
- [ ] Framework: Next.js
- [ ] Root Directory: `.` (기본값)

### 4-2. 환경 변수 설정
- [ ] Vercel Project Settings → Environment Variables
- [ ] 다음 변수 추가:
  ```
  NEXT_PUBLIC_APP_URL=https://castfolio.vercel.app
  SUPABASE_URL=...
  SUPABASE_ANON_KEY=...
  SUPABASE_SERVICE_ROLE_KEY=...
  DATABASE_URL=...
  IP_HASH_SALT=...
  SEED_ADMIN_SUPABASE_UID=...
  ```

### 4-3. 배포
- [ ] "Deploy" 버튼 클릭
- [ ] 배포 진행률 모니터링 (5-10분)
- [ ] 배포 완료 확인
- [ ] 공개 URL 확인: `https://castfolio.vercel.app`

### 4-4. 배포 후 테스트
- [ ] 홈 페이지 로드 확인
- [ ] 회원가입/로그인 테스트
- [ ] 빌더 기능 테스트
- [ ] 이미지 업로드 테스트 (Supabase Storage)
- [ ] 콘솔 에러 없음 확인

---

## Phase 5: 통합 테스트 (End-to-End)

### 5-1. 전체 사용자 여정
**Scenario: 새로운 에이전트가 방송인 PR 페이지를 제작하고 고객에게 납품**

#### Step 1: 가입 및 로그인
- [ ] `https://castfolio.vercel.app/login` 접속
- [ ] 이메일 입력 (test@example.com)
- [ ] 비밀번호 입력
- [ ] "회원가입" 클릭
- [ ] 이메일 확인 클릭
- [ ] 대시보드 접속 확인

#### Step 2: 방송인 등록
- [ ] `/dashboard` 프로젝트 목록
- [ ] "새 프로젝트" 클릭
- [ ] 방송인 정보 입력
  - [ ] 이름: "김유나" / "Kim Yuna"
  - [ ] 포지션: "쇼호스트"
- [ ] 프로젝트 생성
- [ ] 프로젝트 상세 페이지 접속

#### Step 3: 자료 수집
- [ ] Intake Form 제출 (또는 담당자 입력)
- [ ] 이미지 업로드
- [ ] 텍스트 입력

#### Step 4: PR 페이지 제작
- [ ] 빌더 열기
- [ ] 테마 선택 (7개 중 1개)
- [ ] 이미지 업로드 (hero, profile, portfolio)
- [ ] 텍스트 편집 (intro, career, strength 설명)
- [ ] 연락처 채널 추가
- [ ] 각 언어별 입력 (ko/en/zh)
- [ ] 미리보기 생성

#### Step 5: 검토 링크 공유
- [ ] 미리보기 링크 복사
- [ ] 방송인에게 공유
- [ ] 방송인이 공개 미리보기 확인

#### Step 6: 견적 & 결제
- [ ] 견적서 생성 (API 또는 수동)
- [ ] 고객에게 발송

#### Step 7: 배포 & QR
- [ ] 빌더 → "배포" 버튼
- [ ] 페이지 공개 상태 변경 (PUBLISHED)
- [ ] QR 코드 생성
- [ ] PDF 명함 생성

#### Step 8: 주문 관리
- [ ] `/dashboard/orders` 목록
- [ ] 주문 상태 추적 (DRAFT → PAYMENT_PENDING → PAID → DELIVERED)
- [ ] 각 액션 버튼 테스트

#### Step 9: 월 정산
- [ ] 정산 대시보드 (Admin)
- [ ] 정산 금액 계산 확인
- [ ] 정산 기록 조회

### 5-2. 크로스 브라우저 테스트
- [ ] Chrome (최신)
- [ ] Firefox (최신)
- [ ] Safari (최신)
- [ ] Edge (최신)
- [ ] Safari Mobile (iPhone)

### 5-3. 성능 테스트
- [ ] Lighthouse (Google Chrome DevTools)
  - [ ] Performance: 90+
  - [ ] Accessibility: 90+
  - [ ] Best Practices: 90+
  - [ ] SEO: 90+

- [ ] Core Web Vitals
  - [ ] LCP (Largest Contentful Paint): < 2.5s
  - [ ] FID (First Input Delay): < 100ms
  - [ ] CLS (Cumulative Layout Shift): < 0.1

---

## Phase 6: 베타 런칭

### 6-1. 베타 테스터 모집
- [ ] 내부 테스터 5-10명 모집
- [ ] 테스트 시나리오 배포
- [ ] 피드백 수집

### 6-2. 버그 수정 & 개선
- [ ] 버그 리스트 정리
- [ ] 우선순위 설정
- [ ] 수정 및 배포 (Hot fix)

### 6-3. 문서화
- [ ] 사용자 매뉴얼 작성
- [ ] FAQ 페이지
- [ ] API 문서 (선택)

### 6-4. 마케팅 준비
- [ ] 랜딩 페이지 최적화
- [ ] SEO 설정 (메타 태그, robots.txt)
- [ ] 소셜 미디어 콘텐츠
- [ ] 초기 고객 리스트

### 6-5. 공식 런칭
- [ ] 베타 단계 종료
- [ ] 공식 홈페이지 오픈
- [ ] 사용자 초청 (이메일)
- [ ] 소셜 미디어 공지

---

## 체크리스트 항목별 상태

| 항목 | 상태 | 담당 | 기한 |
|------|------|------|------|
| Phase 1: 로컬 환경 설정 | ⬜ | DevOps | 2026-03-17 |
| Phase 2: 로컬 테스트 | ⬜ | QA | 2026-03-18 |
| Phase 3: Supabase 배포 | ⬜ | DevOps | 2026-03-17 |
| Phase 4: Vercel 배포 | ⬜ | DevOps | 2026-03-18 |
| Phase 5: 통합 테스트 | ⬜ | QA + PM | 2026-03-19 ~ 20 |
| Phase 6: 베타 런칭 | ⬜ | 전체팀 | 2026-03-21+ |

---

## 긴급 연락처 & 리소스

### Supabase Support
- 공식 문서: https://supabase.com/docs
- 커뮤니티: https://discord.supabase.io
- 상태 페이지: https://status.supabase.com

### Vercel Support
- 공식 문서: https://vercel.com/docs
- 커뮤니티: https://github.com/vercel/next.js/discussions
- 상태 페이지: https://www.vercel-status.com

### Next.js
- 공식 문서: https://nextjs.org/docs
- 포럼: https://github.com/vercel/next.js/discussions

---

**작성자:** Claude Haiku 4.5
**최종 수정:** 2026-03-16
**상태:** ✅ 준비 완료
