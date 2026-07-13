# Castfolio No-auth / Auth-disabled Security Plan

## Current Reality

The current app contains Supabase Auth login, signup, OAuth, session middleware, and Prisma user sync.

## Onboarding Rule

Do not restore old Auth users, old password hashes, old sessions, or old Storage objects from the retired Castfolio project.

## Safe Interim Position

- Keep business tables service-only.
- Do not expose table read/write policies to `anon` or `authenticated`.
- Keep protected `/app` and `/admin` flows behind server-side session checks until Auth is intentionally configured in wideget-core.
- If Auth is not configured, protected flows should fail closed rather than expose private data.

## Admin APIs

- Session-admin routes continue to require `requireAdmin()`.
- Cron settlement route requires `CRON_SECRET`.
- Any future no-session admin route must use `ADMIN_SECRET` or a deployment-native trusted identity.
- Secrets must be compared server-side and never exposed to the browser.

## Follow-up Required

Before production cutover, decide whether Supabase Auth remains the login provider. If yes, configure Auth URL settings and providers in wideget-core and seed/approve initial admin users intentionally.
