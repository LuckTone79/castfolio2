# Castfolio Product Scope Decision

Date: 2026-07-14

## Decision

Current Castfolio is classified as **B: agency / PR-page production / quote / order / payment management**.

The trading/battle structure found in the old Castfolio Supabase backup is excluded from wideget-core onboarding.

## Evidence

- `package.json` identifies the root product as `castfolio` and builds a Next.js/Prisma app.
- `PROGRAM_ANALYSIS.md` describes the product as a partner PR delivery SaaS for broadcaster PR pages.
- `prisma/schema.prisma` models the active domain around `User`, `Talent`, `Project`, `Page`, `Quote`, `Order`, `PaymentRecord`, `CommissionLedger`, and settlement/admin records.
- `src/app/app/**`, `src/app/api/**`, and `src/app/public/**` call Prisma models for talents, projects, pages, quotes, orders, intake forms, and delivery/review flows.
- Trading names such as `battles`, `strategies`, `signal_boxes`, and `sp_transactions` do not appear as active Prisma models or active route/service dependencies in the root app.

## Excluded Legacy Structures

- Old `public` trading/battle tables.
- Old `public.users.password_hash` custom-auth structure.
- Old Supabase Auth users/session rows from the retired Castfolio project.
- Old `payment-proof` Storage bucket contents.

## Auth Scope

The current app still contains Supabase Auth login/signup/OAuth code. For wideget-core onboarding, no new user registration or old Auth restore is performed. Auth remains a deployment/runtime gate and must be handled explicitly before enabling protected partner/admin flows.

## Schema Scope

- Use only `castfolio` schema for Castfolio business tables.
- Do not create `castfolio_agency`; the current code does not prove two simultaneously active domains requiring separate schema ownership.
- Do not create Castfolio business tables in `public`.
