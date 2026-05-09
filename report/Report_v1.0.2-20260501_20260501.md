# Report v1.0.2-20260501

- 현재 버전: v1.0.2-20260501
- 이전 버전: v1.0.1-20260501
- 작업 일시: 2026-05-01 (Asia/Seoul)

## 작업 요약
- Google 로그인 실패의 실제 원인을 운영 Vercel 로그로 확인함.
- 실제 에러: `PKCE code verifier not found in storage`
- 근본 원인: 설치된 `@supabase/ssr` 0.3.0은 `cookies.get/set/remove` API를 기대하지만, 미들웨어와 OAuth 콜백 코드가 `getAll/setAll` 형태로 작성되어 서버가 PKCE verifier 쿠키를 읽거나 쓸 수 없었음.
- Google OAuth 시작을 서버 라우트(`/auth/google`)로 이동하고, 미들웨어/콜백 쿠키 어댑터를 패키지 버전에 맞게 수정함.

## 변경 사항
- 추가
- `src/app/auth/google/route.ts`: 서버에서 Google OAuth 시작 및 PKCE verifier 쿠키 설정
- `Report/Report_v1.0.2-20260501_20260501.md`

- 수정
- `src/app/login/page.tsx`: Google 버튼이 `/auth/google`로 이동하도록 변경
- `src/app/auth/callback/route.ts`: `cookies.get/set/remove` 기반 쿠키 어댑터로 수정
- `middleware.ts`: `cookies.get/set/remove` 기반 세션 쿠키 어댑터로 수정
- `src/lib/version.ts`: `1.0.2-20260501`
- `VERSION`: `v1.0.2-20260501`

- 삭제
- 없음

## 검증
- `npm run build` 성공
- 코드 검색으로 `getAll/setAll` 잔존 사용 없음 확인
- 운영 재배포 성공
- 운영 검증:
- `https://castfolio.wideget.net/auth/google?redirect=%2Fapp` 응답이 Supabase OAuth URL로 307 redirect
- 동일 응답에 `sb-vrbawgqrhigtkyiengkm-auth-token-code-verifier` `Set-Cookie` 포함 확인
- `curl` cookie jar로 OAuth 시작 응답의 verifier 쿠키를 콜백 요청까지 전달 가능함을 확인

## 배포
- Production URL: `https://castfolio-5d9u7zufi-lucktone79s-projects.vercel.app`
- Alias URL: `https://castfolio.wideget.net`
- Alias URL: `https://www.wideget.net`

## 이슈 및 후속 작업
- 실제 Google 계정 선택 이후 최종 세션 생성은 사용자의 Google 계정 인증 단계가 필요해 자동 완료하지 않음.
- Google Cloud Console과 Supabase Auth 설정에 `https://castfolio.wideget.net/auth/callback`이 허용 리디렉션 URL로 등록되어 있어야 함.
