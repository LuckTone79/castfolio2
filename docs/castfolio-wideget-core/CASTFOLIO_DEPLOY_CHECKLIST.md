# Castfolio Deploy Checklist

## Before Remote Migration

- [x] Product scope decided from current code.
- [x] Legacy trading structure excluded.
- [x] Migration is scoped to `castfolio` and Castfolio-specific Storage buckets.
- [x] Prisma schema maps models/enums to `castfolio`.
- [ ] Review private-bucket URL follow-up.
- [ ] Confirm Auth direction for protected `/app` and `/admin` flows.

## Apply

- [ ] Apply `20260714090000_castfolio_wideget_core_initial_schema`.
- [ ] Verify no public Castfolio business tables exist.
- [ ] Verify Foundation, Goalivo, Kadit, and Locawing are unchanged.
- [ ] Verify RLS is enabled on all Castfolio tables.
- [ ] Verify no anon/authenticated write policies exist.
- [ ] Verify Storage buckets exist and are private.

## App Verification

- [ ] `npm install` / lockfile integrity
- [ ] `npx prisma validate`
- [ ] `npx prisma generate`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] Smoke test public pages.
- [ ] Smoke test protected flow behavior with Auth configured or intentionally disabled.
- [ ] Smoke test admin/cron secret behavior.
