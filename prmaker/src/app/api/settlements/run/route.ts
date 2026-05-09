import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import { settlementNoticeTemplate } from "@/lib/email-templates";

export async function POST() {
  await requireAdmin().catch(() => null);

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

  // Pre-fetch users for email notifications
  const userIds = Object.keys(byUser);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  const periodLabel = `${periodStart.getFullYear()}년 ${periodStart.getMonth() + 1}월`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://castfolio.wideget.net";

  const batches = [];
  for (const [userId, entries] of Object.entries(byUser)) {
    const totalSales = entries.reduce((s, e) => s + Number(e.orderAmount), 0);
    const totalCommission = entries.reduce((s, e) => s + Number(e.commissionAmount), 0);
    const totalUserAmount = entries.reduce((s, e) => s + Number(e.userAmount), 0);
    const minimumMet = totalUserAmount >= 10000;

    const batch = await prisma.settlementBatch.create({
      data: {
        userId,
        periodStart,
        periodEnd,
        totalSales,
        totalCommission,
        totalUserAmount,
        status: minimumMet ? "PENDING" : "CARRIED_OVER",
        minimumMet,
      },
    });

    // Link ledger entries to batch
    await prisma.commissionLedger.updateMany({
      where: { id: { in: entries.map(e => e.id) } },
      data: { settlementId: batch.id },
    });

    // Send settlement notice email to partner (only if minimum met)
    if (minimumMet && userMap[userId]?.email) {
      const { subject, html } = settlementNoticeTemplate({
        partnerName: userMap[userId].name || "파트너",
        periodLabel,
        totalAmount: totalSales,
        commissionAmount: totalCommission,
        settlementAmount: totalUserAmount,
        orderCount: entries.length,
        dashboardUrl: `${appUrl}/dashboard/settlements`,
      });
      await sendEmail({ to: userMap[userId].email, subject, html }).catch(err =>
        console.error(`[settlement] email failed for user ${userId}:`, err)
      );
    }

    batches.push(batch);
  }

  return NextResponse.json({ ok: true, batchesCreated: batches.length });
}
