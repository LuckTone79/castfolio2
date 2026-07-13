# Castfolio Rollback Plan

## If Migration Has Not Been Applied

Delete the local migration branch/files or revise them before applying. No remote rollback is needed.

## If Migration Was Applied But App Not Cut Over

- Keep Vercel env pointed at the previous working backend.
- Leave `castfolio` schema unused in wideget-core.
- Create a follow-up rollback migration only after confirming no production data was written.

## If App Was Cut Over

- Stop writes first.
- Export rows from `castfolio` tables.
- Repoint Vercel env to the previous known-good backend if available.
- Preserve Storage objects from `castfolio-media` and `castfolio-qr`.

## Destructive Operations

Do not drop schemas, truncate tables, or delete buckets without a fresh backup and explicit approval.
