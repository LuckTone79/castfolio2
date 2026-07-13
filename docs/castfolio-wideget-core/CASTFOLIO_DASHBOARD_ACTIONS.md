# Castfolio Dashboard Actions

## Supabase Dashboard

- Confirm `castfolio` is not added as an exposed schema unless a specific server-mediated API replacement has been designed.
- Configure Auth only if the product keeps Supabase Auth:
  - Site URL
  - Redirect URLs
  - OAuth providers
  - Email templates
- Confirm Storage buckets:
  - `castfolio-media`
  - `castfolio-qr`
- Confirm both buckets are private unless a public asset decision is explicitly made.

## Vercel Dashboard

- Add wideget-core Supabase env values.
- Add `DIRECT_URL` for migration/direct operations if needed.
- Add `CRON_SECRET`.
- Add bucket env vars.
- Verify Preview and Production scopes separately.

## Do Not Configure Yet

- Do not add new custom password auth.
- Do not restore old Auth users.
- Do not enable table-wide public read/write policies.
