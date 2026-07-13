# Migration baseline — not yet applied

`0_baseline/migration.sql` was generated locally from the current
`schema.prisma` (via `prisma migrate diff --from-empty`, no DB connection
used). It has **not** been run or resolved against any real database —
the correct production `DATABASE_URL`/Supabase project was not identified
during the 2026-07-06 audit (see [REPO_BOUNDARIES.md](../../REPO_BOUNDARIES.md)).

Before using `prisma migrate dev`/`migrate deploy` against the real
production DB for the first time, you must mark this baseline as already
applied — the tables already exist there (created via `prisma db push`),
so re-running the CREATE TABLE statements would fail:

```bash
npx prisma migrate resolve --applied 0_baseline
```

Only after that should `prisma migrate dev` be used for new schema changes.
Do not run `prisma db push` again once this is done — it bypasses migration
history and will cause drift.
