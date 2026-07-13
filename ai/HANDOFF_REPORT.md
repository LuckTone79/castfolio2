# Castfolio wideget-core Handoff

Date: 2026-07-14
Version: v4.0.0-20260714

## Summary

Prepared current-code-driven Castfolio onboarding for the shared `wideget-core` Supabase project. The old Castfolio DB dump was treated as reference only and was not restored.

## Key Decision

Current Castfolio is the agency / PR-page production product, not the old trading/battle product. The generated migration creates only Castfolio agency/product tables in the `castfolio` schema.

## Created / Updated

- Prisma models/enums mapped to `castfolio` schema.
- Castfolio bucket names moved to environment-driven constants.
- wideget-core scoped migration created:
  - `prisma/migrations/20260714090000_castfolio_wideget_core_initial_schema/migration.sql`
- Planning and gate docs created under:
  - `docs/castfolio-wideget-core/`
- Version bumped to:
  - `v4.0.0-20260714`

## Remote Status

The migration has **not** been applied to remote wideget-core yet.

## Blocking Confirmation Before Remote Apply

- Decide whether Supabase Auth remains active for `/app` and `/admin` or protected flows are temporarily disabled.
- Resolve private Storage bucket behavior: current code stores `getPublicUrl()` values, while the migration creates private buckets.

## Safe Next Step

Review `docs/castfolio-wideget-core/CASTFOLIO_DEPLOY_CHECKLIST.md`, then either approve remote migration with the known follow-up gates or request the private Storage/Auth adjustments first.
