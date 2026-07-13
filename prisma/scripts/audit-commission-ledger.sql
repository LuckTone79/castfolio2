-- Read-only audit for the payment/settlement duplication bug class fixed in
-- this session (confirm-payment idempotency, settlement transaction).
-- Run this against the REAL production database once it's identified
-- (see ../../REPO_BOUNDARIES.md — it was not found among the Supabase
-- projects reachable during the 2026-07-06 session).
--
-- Usage: paste into Supabase SQL Editor, or `psql "$DATABASE_URL" -f this-file`
-- Nothing here writes data — safe to run any time.

-- 1. Duplicate CommissionLedger entries per (orderId, type).
--    This is exactly the failure mode the confirm-payment fix prevents going
--    forward; any rows here are pre-existing duplicates from before the fix.
SELECT "orderId", "type", COUNT(*) AS entry_count,
       SUM("commissionAmount"::numeric) AS total_commission_amount,
       SUM("userAmount"::numeric) AS total_user_amount
FROM "CommissionLedger"
GROUP BY "orderId", "type"
HAVING COUNT(*) > 1
ORDER BY entry_count DESC;

-- 2. Orders already PAID/DELIVERED/SETTLED with zero "sale" ledger entries
--    (a missed commission — the inverse problem: money collected but never
--    recorded for settlement).
SELECT o.id, o."orderNumber", o.status, o."userId", o."totalAmount"
FROM "Order" o
LEFT JOIN "CommissionLedger" cl ON cl."orderId" = o.id AND cl."type" = 'sale'
WHERE o.status IN ('PAID', 'DELIVERED', 'SETTLED') AND cl.id IS NULL;

-- 3. Duplicate SettlementBatch rows for the same partner + period
--    (would happen if /api/settlements/run was re-run before this session's
--    duplicate-batch guard existed).
SELECT "userId", "periodStart", COUNT(*) AS batch_count
FROM "SettlementBatch"
GROUP BY "userId", "periodStart"
HAVING COUNT(*) > 1;

-- 4. SettlementBatch totals that don't match the sum of the ledger entries
--    actually linked to them (drift from a partial/non-transactional run).
SELECT sb.id AS batch_id, sb."userId", sb."periodStart",
       sb."totalUserAmount" AS batch_recorded_total,
       COALESCE(SUM(cl."userAmount"::numeric), 0) AS actual_linked_total
FROM "SettlementBatch" sb
LEFT JOIN "CommissionLedger" cl ON cl."settlementId" = sb.id
GROUP BY sb.id, sb."userId", sb."periodStart", sb."totalUserAmount"
HAVING sb."totalUserAmount"::numeric <> COALESCE(SUM(cl."userAmount"::numeric), 0);

-- ─── If rows come back from query 1 (duplicates) ──────────────────────────
-- Do NOT delete blindly. Before applying the schema's new
-- @@unique([orderId, type]) constraint via migration, decide per duplicate
-- group which row is canonical (usually the earliest `createdAt`) and how
-- to handle any that already have a non-null settlementId — removing a row
-- already paid out to a partner needs a manual reconciliation decision, not
-- an automated delete.
