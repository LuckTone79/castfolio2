import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MINIMUM_SETTLEMENT_AMOUNT = 10000;

// Triggered by Vercel Cron (GET + `Authorization: Bearer $CRON_SECRET`) on
// the 1st of each month. Cron requests carry no admin session, so this uses
// a shared-secret check instead of requireAdmin().
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runMonthlySettlement();
}

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return runMonthlySettlement();
}

async function runMonthlySettlement() {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Get all unsettled commission ledgers from last month
  const unsettled = await prisma.commissionLedger.findMany({
    where: {
      settlementId: null,
      type: "sale",
      createdAt: { gte: periodStart, lte: periodEnd },
    },
    include: { order: true },
  });

  // Group by user
  const byUser: Record<string, typeof unsettled> = {};
  for (const entry of unsettled) {
    if (!byUser[entry.userId]) byUser[entry.userId] = [];
    byUser[entry.userId].push(entry);
  }

  type LedgerEntry = (typeof unsettled)[number];
  const batches = [];
  let carriedOverUsers = 0;

  for (const [userId, entries] of Object.entries(byUser)) {
    const totalSales = entries.reduce((s: number, e: LedgerEntry) => s + Number(e.orderAmount), 0);
    const totalCommission = entries.reduce((s: number, e: LedgerEntry) => s + Number(e.commissionAmount), 0);
    const totalUserAmount = entries.reduce((s: number, e: LedgerEntry) => s + Number(e.userAmount), 0);
    const minimumMet = totalUserAmount >= MINIMUM_SETTLEMENT_AMOUNT;

    // Policy: below the minimum, create no batch and leave these ledger
    // entries unlinked (settlementId stays null). They roll into next
    // month's `unsettled` query automatically and keep accumulating until
    // the running total clears the threshold. This avoids ever "losing"
    // a partner's balance behind a batch that never gets paid out.
    if (!minimumMet) {
      carriedOverUsers += 1;
      continue;
    }

    // Guard against re-running this endpoint for an already-settled period —
    // complements the DB-level unique constraint on (userId, periodStart).
    const existing = await prisma.settlementBatch.findFirst({
      where: { userId, periodStart },
    });
    if (existing) continue;

    const batch = await prisma.$transaction(async (tx) => {
      const created = await tx.settlementBatch.create({
        data: {
          userId,
          periodStart,
          periodEnd,
          totalSales,
          totalCommission,
          totalUserAmount,
          status: "PENDING",
          minimumMet: true,
        },
      });

      await tx.commissionLedger.updateMany({
        where: { id: { in: entries.map((e: LedgerEntry) => e.id) } },
        data: { settlementId: created.id },
      });

      return created;
    });

    batches.push(batch);
  }

  return NextResponse.json({ ok: true, batchesCreated: batches.length, carriedOverUsers });
}
