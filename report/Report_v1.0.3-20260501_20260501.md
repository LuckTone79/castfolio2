# Report v1.0.3-20260501

- 현재 버전: v1.0.3-20260501
- 이전 버전: v1.0.2-20260501
- 작업 일시: 2026-05-01 (Asia/Seoul)

## 작업 요약
- Google 회원가입 후 `/app` 진입 시 발생하던 서버 예외를 운영 로그로 재검증함.
- 실제 오류는 OAuth가 아니라 App Router의 서버/클라이언트 경계 위반이었음.
- 서버 레이아웃이 Lucide 아이콘 함수를 클라이언트 `DashboardShell`/`SideNav`로 전달하면서 `Functions cannot be passed directly to Client Components`가 발생함.

## 변경 사항
- 수정
- `src/components/layout/side-nav.tsx`
- `src/app/app/layout.tsx`
- `src/app/admin/layout.tsx`
- `src/lib/version.ts`
- `VERSION`

## 변경 상세
- `SideNav`가 아이콘 컴포넌트 함수를 직접 prop으로 받지 않도록 변경
- 서버 레이아웃들은 `icon`에 함수 대신 문자열 키만 전달
- 클라이언트 `SideNav` 내부에서 문자열 키를 Lucide 아이콘으로 매핑하도록 변경

## 검증
- 운영 로그 확인:
- `GET /app`에서 `digest: 1978993931`
- 메시지: `Functions cannot be passed directly to Client Components`
- 로컬 검증: `npm run build` 성공

## 이슈 및 후속 작업
- 운영 재배포 후 실제 Google 회원가입 플로우를 다시 확인해야 함.
