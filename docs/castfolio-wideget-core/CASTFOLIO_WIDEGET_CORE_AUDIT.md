# Castfolio Wideget-core Audit

Date: 2026-07-14

## wideget-core Baseline

- Supabase project: `wideget-core`
- Project ref: `vzluurhjbcxdqopgyrnv`
- Existing schemas observed: `public`, `goalivo`, `kadit`, `castfolio`, `locawing`
- Existing migrations observed:
  - `20260710123448_wideget_core_platform_foundation`
  - `20260710123629_wideget_core_service_only_rls_policies`
  - `20260710215937_goalivo_initial_schema`
  - `20260710220050_goalivo_rls_performance_hardening`
  - `20260712205654_kadit_wideget_core_initial_schema`
- Edge Functions: none

## Existing Tables Before Castfolio Onboarding

- `public`: `apps`, `feature_flags`, `migrations_history`, `platform_settings`, `system_logs`
- `goalivo`: `feedback_posts`, `user_state`
- `kadit`: `kadit_artifacts`, `kadit_generation_schedules`, `kadit_image_jobs`, `kadit_render_jobs`, `kadit_renders`, `kadit_scheduled_runs`, `kadit_source_feeds`, `kadit_source_items`, `kadit_usage_events`, `kadit_versions`
- `castfolio`: no tables observed before this local migration
- `locawing`: no tables observed

## Current Code Inventory

- ORM: Prisma, `prisma/schema.prisma`
- Database helper: `src/lib/prisma.ts`
- Supabase server/client helpers: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`
- Auth guard: `src/lib/auth.ts`
- Protected routes: `middleware.ts` protects `/app` and `/admin`
- Public token flows: intake, review, quote, delivered pages
- Storage upload flows: `src/app/api/upload/route.ts`, `src/app/api/pages/[id]/publish/route.ts`

## Active Business Models

Core:
- `User`, `Talent`, `Project`, `Page`, `PageVersion`

Intake/review:
- `IntakeForm`, `IntakeSubmission`, `ProjectTimeline`

Pricing/sales:
- `ProductPackage`, `PricingPolicyVersion`, `RevisionPolicy`, `PricingChangeLog`, `Quote`, `QuoteLineItem`, `Order`, `OrderLineItem`

Payment/settlement:
- `PaymentRecord`, `RefundRecord`, `CommissionLedger`, `SettlementBatch`

Ops:
- `Notification`, `NotificationTemplate`, `AuditLog`, `AdminNote`, `RiskFlag`, `PageView`, `QRAsset`, `MediaAsset`

## Sensitive Values

Secret values were not printed or copied into this audit. Only variable names and required presence are documented in the env plan.

## Touch Boundary

The local migration only targets:
- `castfolio` schema
- `storage.buckets` rows for Castfolio-specific buckets

It does not modify:
- `public` Foundation table structure
- `public.wideget_set_updated_at()`
- `goalivo`
- `kadit`
- `locawing`
- qkiki or one-more-rep projects
