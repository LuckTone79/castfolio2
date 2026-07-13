# Castfolio Database Schema

## Schema

All business objects are created in:

- `castfolio`

No Castfolio business tables are created in `public`.

## Migration

Local migration:

- `prisma/migrations/20260714090000_castfolio_wideget_core_initial_schema/migration.sql`

## Tables

Account:
- `User`

Talent/project/page:
- `Talent`
- `Project`
- `Page`
- `PageVersion`
- `MediaAsset`
- `PageView`
- `QRAsset`

Intake/review:
- `IntakeForm`
- `IntakeSubmission`
- `ProjectTimeline`

Pricing/sales/order:
- `ProductPackage`
- `PricingPolicyVersion`
- `RevisionPolicy`
- `PricingChangeLog`
- `Quote`
- `QuoteLineItem`
- `Order`
- `OrderLineItem`

Payment/settlement:
- `PaymentRecord`
- `RefundRecord`
- `CommissionLedger`
- `SettlementBatch`

Ops:
- `Notification`
- `NotificationTemplate`
- `AuditLog`
- `AdminNote`
- `RiskFlag`

## Constraints

The migration includes primary keys, foreign keys, unique constraints, enum status constraints, and FK/read-path indexes generated from the current Prisma schema plus hardening indexes.

## Money Types

Current Prisma schema uses `Decimal`, emitted by Prisma as `DECIMAL(65,30)`. This preserves current code behavior. A later product decision can narrow money columns to integer minor units or `numeric(14,2)`, but that is deliberately not mixed into onboarding.

## RLS

All business tables have RLS enabled. No client role policies are created.
