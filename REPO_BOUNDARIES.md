# Repository Boundaries: root vs `prmaker/`

Confirmed 2026-07-06 via Vercel API (`vercel.com/lucktone79s-projects`).

## Root app (`src/`, this repo's primary app)

- Vercel project: `castfolio` (`prj_MZWDlXkIIWqcYkS5AYqOCWSEZpZL`)
- Domains: `www.wideget.net`, `castfolio.wideget.net` (production)
- Status: **live product**, last deployed 2026-06-04, currently at v2.2.0

## `prmaker/` (nested self-contained Next.js app)

- Own `package.json` (`"name": "prmaker"`, v0.1.0), own `prisma/schema.prisma`, own `node_modules` — not built or imported by the root app. Root `tsconfig.json` explicitly excludes it.
- Vercel project: `prmaker` (`prj_91SzgxtujtSIkxBSPCFdMODN9Bka`) — **separate deployment**, same Vercel team
- Domains: `prmaker.vercel.app` only — **no custom domain ever attached**
- Status: last production deploy 2026-05-10 (still `READY`), last project change 2026-05-25. Git history for this folder tops out around "v1.7.0"; the root app has since diverged significantly (v2.2.0, `/app` route tree, theme system v2.0) with no equivalent changes ported here.

**Reading**: `prmaker/` is an earlier, superseded lineage of the same product, not the live one — but it is still a real, separately-deployed Vercel project reachable at its `.vercel.app` URL, not a harmless local-only copy.

## Rule for future cleanup

Do not delete or archive `prmaker/` as part of routine repo cleanup. Before any decommission:
1. Confirm there's no real traffic hitting `prmaker.vercel.app` (Vercel Analytics or logs).
2. Confirm nothing external (old marketing links, partner emails, QR codes) points at it.
3. Get explicit sign-off — it's a deploy-boundary decision, not a file-cleanup one.

## Database note

The Supabase project named `castfolio` (ref `vrbawgqrhigtkyiengkm`) does **not** hold this app's schema — it contains an unrelated app's tables. The real production Postgres for this app was not identified from the Supabase account connected during the 2026-07-06 audit. Confirm the correct `DATABASE_URL`/Supabase project before running any migration against "production."
