# Castfolio — 이번 세션 작업 파일 모음

> 생성일: 2026-03-16
> 총 파일 수: 25개 (신규 19 + 수정 6)

## 복사 방법

이 폴더 안의 `src/` 디렉토리를 프로젝트 루트에 덮어씌우면 됩니다.

```
prmaker/
└── docs/source_export/
    └── src/   ← 이 폴더를 prmaker/src/ 에 병합
```

---

## 신규 생성 파일 (19개)

| 파일 경로 | 설명 |
|-----------|------|
| `src/app/dashboard/notifications/page.tsx` | 알림 목록 페이지 (타입별 아이콘, 읽음처리) |
| `src/app/dashboard/intake/page.tsx` | 자료요청 링크 생성/관리 UI |
| `src/app/dashboard/quotes/new/page.tsx` | 견적서 생성 폼 (초안저장/발송 분리) |
| `src/app/dashboard/quotes/[id]/page.tsx` | 견적서 상세 페이지 |
| `src/app/dashboard/pricing/new/page.tsx` | 상품 추가 폼 |
| `src/app/dashboard/pricing/[id]/page.tsx` | 상품 상세 (버전이력, 수정정책, 변경이력) |
| `src/app/admin/monitoring/page.tsx` | 프로젝트 모니터링 (30일 미확정, RiskFlag) |
| `src/app/admin/orders/page.tsx` | 주문/정산 관리 (통계카드 4종, 정산배치) |
| `src/app/admin/refunds/page.tsx` | 환불 관리 |
| `src/app/admin/notifications/page.tsx` | 공지 발송 UI (전체/특정 사용자) |
| `src/app/admin/system/page.tsx` | 시스템 설정 (현황, 환경변수 상태, 기본설정) |
| `src/app/api/intake/route.ts` | 자료요청 API (GET 목록, POST 생성) |
| `src/app/api/pricing/route.ts` | 상품 API (GET 활성목록, POST 생성) |
| `src/app/api/quotes/route.ts` | 견적 API (GET, POST + SUPERSEDED 처리) |
| `src/app/api/quotes/[id]/route.ts` | 견적 상세/발송 액션 API |
| `src/app/api/public/quote/[token]/route.ts` | 공개 견적 토큰 API (세션 없이 토큰만 검증) |
| `src/app/api/public/delivered/[token]/route.ts` | 납품완료 확인 토큰 API |
| `src/app/api/admin/notify/route.ts` | Admin 공지 발송 API |

---

## 수정된 파일 (6개)

| 파일 경로 | 수정 내용 |
|-----------|-----------|
| `src/app/dashboard/builder/[projectId]/page.tsx` | Career / Portfolio / Strength 편집 패널 완전 구현 |
| `src/components/layout/DashboardHeader.tsx` | userId prop 제거, 알림 벨 unread count 기능 |
| `src/app/dashboard/layout.tsx` | DashboardHeader userId prop 제거 |
| `src/lib/supabase/server.ts` | `catch (error)` → `catch { }` (ESLint 수정) |
| `src/lib/utils.ts` | 미사용 `clsx` import 제거 (ESLint 수정) |
| `src/app/api/public/review/[token]/route.ts` | 미사용 `logAudit` import 제거 (ESLint 수정) |

> `src/app/api/users/me/route.ts` — 미사용 `const updated` 변수 제거 (ESLint 수정)
