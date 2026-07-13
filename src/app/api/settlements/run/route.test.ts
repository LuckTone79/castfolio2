import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  requireAdmin: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    commissionLedger: { findMany: vi.fn() },
    settlementBatch: { findFirst: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { POST } from "./route";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function ledgerEntry(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "ledger-1",
    userId: "user-1",
    orderAmount: 50000,
    commissionAmount: 7500,
    userAmount: 42500,
    order: {},
    ...overrides,
  };
}

describe("POST /api/settlements/run", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (requireAdmin as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "admin-1" });
  });

  it("creates no batch and leaves ledger entries unlinked when below the minimum (carry-over)", async () => {
    (prisma.commissionLedger.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      ledgerEntry({ orderAmount: 1000, commissionAmount: 150, userAmount: 850 }),
    ]);

    const res = await POST();
    const body = await res.json();

    expect(body.batchesCreated).toBe(0);
    expect(body.carriedOverUsers).toBe(1);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("skips creating a duplicate batch when one already exists for the period", async () => {
    (prisma.commissionLedger.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([ledgerEntry()]);
    (prisma.settlementBatch.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "existing-batch",
    });

    const res = await POST();
    const body = await res.json();

    expect(body.batchesCreated).toBe(0);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("creates one batch and links ledger entries atomically when the minimum is met", async () => {
    (prisma.commissionLedger.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([ledgerEntry()]);
    (prisma.settlementBatch.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const tx = {
      settlementBatch: { create: vi.fn().mockResolvedValue({ id: "batch-1" }) },
      commissionLedger: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
    };
    (prisma.$transaction as unknown as ReturnType<typeof vi.fn>).mockImplementation((cb: (tx: unknown) => unknown) =>
      cb(tx),
    );

    const res = await POST();
    const body = await res.json();

    expect(body.batchesCreated).toBe(1);
    expect(tx.commissionLedger.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { settlementId: "batch-1" } }),
    );
  });

  it("rejects the run when the caller is not an admin", async () => {
    (requireAdmin as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("FORBIDDEN"));

    const res = await POST();

    expect(res.status).toBe(403);
    expect(prisma.commissionLedger.findMany).not.toHaveBeenCalled();
  });
});
