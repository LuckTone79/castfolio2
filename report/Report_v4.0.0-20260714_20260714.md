# 작업 보고서

## 기본 정보

- 현재 버전: v4.0.0-20260714
- 이전 버전: v3.1.1-20260604
- 작업 일시: 2026-07-14
- 프로젝트명: Castfolio / PR Maker

## 작업 요약

Castfolio를 과거 Supabase dump 복원이 아니라 현재 코드 기준으로 `wideget-core` Supabase 프로젝트에 온보딩하기 위한 준비 작업을 완료했다. 기존 원격 `main`의 최신 `/app` 워크플로우 IA와 모바일 고객 진입점 복구 변경은 유지하고, Castfolio 전용 `castfolio` schema, Prisma multi-schema 설정, Storage bucket 환경변수화, 배포 전 점검 문서를 추가했다.

## 변경 사항

### 추가

- Castfolio wideget-core 감사, 설계, 배포, 롤백 문서 추가
- Castfolio 전용 Supabase Storage bucket 상수 추가
- `castfolio` schema 기준 초기 migration 추가
- 작업 handoff 및 task history 문서 추가

### 수정

- Prisma schema에 multi-schema 설정 및 `castfolio` schema mapping 추가
- upload / publish API의 Storage bucket 이름을 환경변수 기반 상수로 변경
- `.env.local.example`에 wideget-core 전환용 환경변수 placeholder 추가
- 앱 버전 표시를 `4.0.0-20260714`로 갱신
- `package.json`, `package-lock.json`, `VERSION`을 v4.0.0 계열로 갱신

### 삭제

- 없음

## 변경 파일 목록

| 파일 경로 | 변경 유형 | 설명 |
|---|---|---|
| `VERSION` | 수정 | v4.0.0-20260714로 갱신 |
| `package.json` | 수정 | package version 4.0.0으로 갱신 |
| `package-lock.json` | 수정 | lockfile root package version 4.0.0으로 갱신 |
| `src/lib/version.ts` | 수정 | 앱 버전 상수 갱신 |
| `prisma/schema.prisma` | 수정 | Prisma multi-schema 및 castfolio schema mapping |
| `prisma/migrations/20260714090000_castfolio_wideget_core_initial_schema/migration.sql` | 추가 | Castfolio wideget-core 초기 migration |
| `src/lib/supabase/buckets.ts` | 추가 | Castfolio Storage bucket env helper |
| `src/app/api/upload/route.ts` | 수정 | media bucket env 적용 |
| `src/app/api/pages/[id]/publish/route.ts` | 수정 | QR bucket env 적용 |
| `.env.local.example` | 수정 | wideget-core env placeholder 추가 |
| `docs/castfolio-wideget-core/*` | 추가 | 감사, 설계, 배포, 롤백 산출물 |
| `ai/HANDOFF_REPORT.md` | 추가 | 작업 handoff |
| `ai/TASK_HISTORY.md` | 추가 | 작업 이력 |

## 이슈 및 후속 작업

- remote wideget-core migration은 아직 적용하지 않았다.
- Supabase Auth 유지 여부와 protected flow 정책은 remote 적용 전에 최종 확인이 필요하다.
- migration은 private bucket을 만들지만 현재 일부 코드가 `getPublicUrl()` 값을 저장하므로, remote 적용 전 signed URL 또는 server proxy 전환 여부를 결정해야 한다.
- remote 적용 후 Supabase Security Advisor ERROR/WARN 0 검증이 필요하다.

## 버전 히스토리 요약

| 버전 | 날짜 | 주요 변경 |
|---|---|---|
| v4.0.0-20260714 | 2026-07-14 | Castfolio wideget-core 온보딩 준비 |
| v3.1.1-20260604 | 2026-06-04 | 고객 전용 페이지 버튼 모바일 노출 |
| v3.1.0-20260603 | 2026-06-03 | 홈 워크플로우 액션 센터 재설계 |
| v3.0.0-20260603 | 2026-06-03 | 파트너 작업공간 `/app` 단일화 |
