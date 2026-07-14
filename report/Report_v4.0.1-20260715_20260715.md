# 작업 보고서

## 기본 정보

- 현재 버전: v4.0.1-20260715
- 이전 버전: v4.0.0-20260714
- 작업 일시: 2026-07-15
- 프로젝트명: Castfolio / PR Maker

## 작업 요약

이메일 회원가입과 Google 로그인 실패 원인을 auth redirect 및 Castfolio DB 사용자 생성 흐름에서 수정했다. 이메일 확인 링크와 OAuth callback을 `/auth/callback`으로 통일하고, Supabase Auth 사용자가 로그인 완료되는 시점에 `castfolio.User` 레코드를 자동 생성/연결하도록 공통 helper를 추가했다.

## 변경 사항

### 추가

- `/api/auth/signup` 서버 라우트 추가
- Supabase Auth redirect origin helper 추가
- Supabase Auth user와 Castfolio DB user를 연결하는 profile helper 추가

### 수정

- 이메일 회원가입을 클라이언트 직접 호출에서 서버 라우트 호출로 변경
- 회원가입 confirmation redirect를 `/auth/callback?next=/app` 계열로 변경
- Google OAuth redirect URL을 canonical app origin 기반으로 생성
- Auth callback의 DB 사용자 생성/연결 로직을 공통 helper로 분리
- 앱/패키지 버전을 v4.0.1-20260715로 갱신

### 삭제

- 없음

## 변경 파일 목록

| 파일 경로 | 변경 유형 | 설명 |
|---|---|---|
| `src/app/api/auth/signup/route.ts` | 추가 | 이메일 회원가입 서버 처리 및 세션/프로필 생성 |
| `src/lib/auth-redirect.ts` | 추가 | Auth callback origin 생성 |
| `src/lib/auth-profile.ts` | 추가 | Supabase user와 DB user 연결 |
| `src/app/login/page.tsx` | 수정 | 회원가입 API 호출 방식 변경 |
| `src/app/auth/google/route.ts` | 수정 | OAuth callback URL 생성 방식 변경 |
| `src/app/auth/callback/route.ts` | 수정 | DB user upsert 공통화 |
| `VERSION` | 수정 | v4.0.1-20260715 |
| `src/lib/version.ts` | 수정 | 앱 버전 표시 갱신 |
| `package.json`, `package-lock.json` | 수정 | package version 4.0.1 |

## 이슈 및 후속 작업

- Supabase Dashboard의 Google provider 자체 활성화와 redirect allow list는 외부 설정이므로 운영에서 최종 확인이 필요하다.
- 운영 환경 `NEXT_PUBLIC_APP_URL`은 `https://castfolio.wideget.net` 기준으로 맞추는 것이 안전하다.

## 버전 히스토리 요약

| 버전 | 날짜 | 주요 변경 |
|---|---|---|
| v4.0.1-20260715 | 2026-07-15 | 이메일 회원가입 및 Google 로그인 auth redirect/profile 생성 수정 |
| v4.0.0-20260714 | 2026-07-14 | Castfolio wideget-core 온보딩 준비 |
