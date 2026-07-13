# Task History

## 2026-07-14 - Castfolio wideget-core onboarding prep

- Audited root Castfolio code, Prisma models, API routes, Supabase helpers, Auth, Storage, and wideget-core baseline.
- Confirmed old trading/battle schema is not active product scope.
- Confirmed wideget-core has Foundation, Goalivo, and Kadit migrations and an empty Castfolio schema.
- Added Prisma multi-schema mapping to `castfolio`.
- Added Castfolio-specific bucket constants.
- Created Castfolio wideget-core migration and documentation bundle.
- Did not apply remote migration because Auth and private Storage URL behavior require explicit confirmation.
