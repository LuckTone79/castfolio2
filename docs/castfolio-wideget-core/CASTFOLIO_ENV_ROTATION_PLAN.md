# Castfolio Env Rotation Plan

## Required wideget-core Values

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_SCHEMA=castfolio`
- `DATABASE_URL`
- `DIRECT_URL`
- `ADMIN_SECRET`
- `CRON_SECRET`
- `SUPABASE_CASTFOLIO_MEDIA_BUCKET=castfolio-media`
- `SUPABASE_CASTFOLIO_QR_BUCKET=castfolio-qr`

## Notes

- `DIRECT_URL` is documented for migration/direct DB operations. It is not wired into `schema.prisma` yet because the current Prisma CLI flow would fail in environments that do not provide it.
- Browser code may only receive public URL and anon/publishable key.
- Service-role key remains server-only.
- Do not log DB URLs or secrets.

## Vercel Rotation

Rotate these in Preview and Production after wideget-core is ready:

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- bucket env vars

Keep `NEXT_PUBLIC_APP_URL` unchanged unless the domain changes.
