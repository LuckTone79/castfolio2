# Figma 대표 화면 고정 — 완료 보고서

**작성일**: 2026-03-21

## 목표
Figma 내보내기를 위해 8개 대표 화면을 로그인/DB 없이 항상 렌더링되도록 고정

## 완료된 작업

### 1. 대표 화면 8개 URL (모두 HTTP 200 확인)

| # | URL | 설명 |
|---|-----|------|
| 1 | `http://localhost:3000/` | 랜딩 페이지 |
| 2 | `http://localhost:3000/guide` | 이용 가이드 |
| 3 | `http://localhost:3000/demo` | 테마 갤러리 |
| 4 | `http://localhost:3000/create?step=1` | 제작 위자드 — 기본 정보 |
| 5 | `http://localhost:3000/create?step=2` | 제작 위자드 — 테마 선택 |
| 6 | `http://localhost:3000/create?step=3` | 제작 위자드 — 빌더 |
| 7 | `http://localhost:3000/create?step=4` | 제작 위자드 — 최종 미리보기 |
| 8 | `http://localhost:3000/p/demo` | 퍼블릭 PR 페이지 (더미 데이터) |

### 2. 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/app/page.tsx` | `/login` → `/create` 링크 변경 |
| `src/components/layout/marketing-nav.tsx` | 로그인 버튼 제거, `/create` 링크 |
| `src/app/(marketing)/guide/page.tsx` | `/login` → `/create` |
| `src/app/(marketing)/demo/page.tsx` | `/login` → `/create` |
| `src/app/(marketing)/create/page.tsx` | **신규** — 4단계 위자드, `?step=1~4` 지원 |
| `src/app/p/demo/page.tsx` | **신규** — 더미 데이터 완성형 PR 페이지 |
| `src/app/login/page.tsx` | Suspense 래퍼 추가 (빌드 에러 수정) |

### 3. 기술 사항
- 모든 페이지: 로그인/DB 의존성 없음 (하드코딩 더미 데이터 사용)
- `/create`: `useSearchParams()` + Suspense로 step 쿼리 파라미터 처리
- `/p/demo`: 서버 컴포넌트, Prisma 쿼리 없이 정적 렌더링
- `next build` 성공 (에러 0건)

## 빌드 결과
✅ Compiled successfully
✅ Type check passed
✅ Static generation completed
✅ 모든 8개 URL HTTP 200 확인
