# Castfolio Storage Plan

## Current Code Usage

Current active code uses:

- Media uploads in `src/app/api/upload/route.ts`
- QR/QR-card uploads in `src/app/api/pages/[id]/publish/route.ts`

Old `payment-proof` is not used by current root app code and is not recreated.

## Buckets

- `castfolio-media`
- `castfolio-qr`

Both are created private by the local migration.

## Environment Variables

- `SUPABASE_CASTFOLIO_MEDIA_BUCKET`
- `SUPABASE_CASTFOLIO_QR_BUCKET`

## Security Position

Uploads happen server-side with the service client. Browser service-role access is forbidden.

## Follow-up Gate

The current code still stores URLs from `getPublicUrl()`. Since the new buckets are private, production should either:

1. Add server proxy routes for media and QR assets, or
2. Store object paths and generate signed URLs on demand, or
3. Explicitly decide that specific public assets may live in public buckets.

Do not silently rely on private bucket objects being readable through old public URL behavior.
