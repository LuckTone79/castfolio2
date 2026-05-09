# Report v1.0.1-20260501

- 현재 버전: v1.0.1-20260501
- 이전 버전: v1.0.0-20260501 (기준값 생성)
- 작업 일시: 2026-05-01 (Asia/Seoul)

## 작업 요약
- Google OAuth 기반 회원가입/로그인 실패 이슈를 점검하고 인증 시작/콜백 처리 로직을 보강함.
- OAuth 시작 시 브라우저 리다이렉트를 명시적으로 처리하도록 변경해 무반응 케이스를 제거함.
- 콜백 라우트에서 공급자 오류 파라미터를 수집해 로그인 화면으로 전달하도록 개선함.
- 교차모델(별도 AI) 검증에서 지적된 오픈 리다이렉트 위험을 추가 수정함.
- 로그인 화면 하단에 현재 버전 표기를 추가함.

## 변경 사항
- 추가
- `src/lib/version.ts` 생성 (`APP_VERSION` 상수)
- `VERSION` 파일 생성
- `Report/Report_v1.0.1-20260501_20260501.md` 생성

- 수정
- `src/app/login/page.tsx`
- `src/app/auth/callback/route.ts`

- 삭제
- 없음

## 변경 파일 목록
- src/app/login/page.tsx
- src/app/auth/callback/route.ts
- src/lib/version.ts
- VERSION
- Report/Report_v1.0.1-20260501_20260501.md

## 검증
- 로컬 빌드 검증: `npm run build` 성공
- 교차모델 검증: 별도 모델 리뷰 수행
  - 발견 이슈: `redirect` 파라미터 오픈 리다이렉트 가능성 2건
  - 조치: `sanitizeRedirectPath` 추가로 `//`, `\`, 절대 URL 차단
- 배포 검증: `vercel --prod --yes` 성공
  - Production URL: https://castfolio-kopbitk1m-lucktone79s-projects.vercel.app
  - Alias URL: https://www.wideget.net

## 이슈 및 후속 작업
- Supabase 대시보드(Authentication > URL Configuration)와 Google Cloud OAuth의 허용 리디렉션 URL에 운영 도메인 `/auth/callback`이 반드시 등록되어야 함.
- 실사용 계정으로 Google 로그인/회원가입 E2E 재확인 권장.
