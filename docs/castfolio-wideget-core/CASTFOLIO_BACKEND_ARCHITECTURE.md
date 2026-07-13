# Castfolio Backend Architecture

## Runtime Shape

Castfolio remains a server-owned Next.js application using Prisma for application data and Supabase for PostgreSQL, Auth runtime, and Storage.

## Data Ownership

- All Castfolio business tables are mapped to the `castfolio` schema through Prisma multi-schema mapping.
- `public` remains reserved for wideget-core Foundation tables.
- Goalivo, Kadit, and Locawing schemas are out of scope.

## Access Model

- Business tables have RLS enabled.
- No `anon` or `authenticated` table policies are created.
- Application writes are expected to go through server routes using trusted server credentials and Prisma.
- Public token flows are server-mediated and never grant direct table access.

## Auth State

The current code still uses Supabase Auth sessions for partner/admin screens. No old Auth users are restored and no new custom password system is created. Before production cutover, decide whether to:

1. Keep Supabase Auth and configure it in wideget-core.
2. Temporarily disable protected flows until auth is intentionally rebuilt.

## Storage

Current code uploads media and QR assets through server routes. Bucket names are now environment-driven:

- `SUPABASE_CASTFOLIO_MEDIA_BUCKET`
- `SUPABASE_CASTFOLIO_QR_BUCKET`

The migration creates private buckets. The current code still stores public URLs, so a signed URL or server proxy follow-up is required before relying on private bucket behavior in production.
