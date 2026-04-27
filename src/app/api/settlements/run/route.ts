import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
  for (const [userId, entries] of Object.entries(byUser)) {
    const totalSales = entries.reduce((s: number, e: LedgerEntry) => s + Number(e.orderAmount), 0);
    const totalCommission = entries.reduce((s: number, e: LedgerEntry) => s + Number(e.commissionAmount), 0);
    const totalUserAmount = entries.reduce((s: number, e: LedgerEntry) => s + Number(e.userAmount), 0);
    const minimumMet = totalUserAmount >= 10000;

    const batch = await prisma.settlementBatch.create({
      data: {
        userId,
        periodStart,
        periodEnd,
        totalSales,
        totalCommission,
        totalUserAmount,
        status: minimumMet ? "PENDING" : "PENDING",
        minimumMet,
      },
    });

    // Link ledger entries to batch
    await prisma.commissionLedger.updateMany({
      where: { id: { in: entries.map((e: LedgerEntry) => e.id) } },
      data: { settlementId: batch.id },
    });

    batches.push(batch);
  }

  return NextResponse.json({ ok: true, batchesCreated: batches.length });
}
