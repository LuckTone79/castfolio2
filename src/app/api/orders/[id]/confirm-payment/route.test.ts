import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  requireUser: vi.fn(),
}));
vi.mock("@/lib/audit", () => ({
  logAudit: vi.fn(),
  logTimeline: vi.fn(),
}));
vi.mock("@/lib/notify", () => ({
  sendNotification: vi.fn(),
  notifyTalent: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findFirst: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { POST } from "./route";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const baseOrder = {
  id: "order-1",
  userId: "user-1",
  status: "PAYMENT_PENDING",
  totalAmount: 100000,
  commissionRate: 0.15,
  commissionAmount: 15000,
  userAmount: 85000,
  projectId: "project-1",
  orderNumber: "ORD-001",
  project: { talentId: "talent-1", talent: { nameKo: "홍길동" } },
};

function makeRequest(body: object) {
  return new Request("http://localhost/api/orders/order-1/confirm-payment", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders/[id]/confirm-payment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (requireUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      role: "agent",
      name: "Partner",
    });
  });

  it("rejects re-confirmation once the order is already PAID (no transaction attempted)", async () => {
    (prisma.order.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...baseOrder,
      status: "PAID",
    });

    const res = await POST(makeRequest({ proofUrl: "https://proof" }), { params: { id: "order-1" } });

    expect(res.status).toBe(409);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("blocks a concurrent double-submit even when the pre-check status was still payable", async () => {
    (prisma.order.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...baseOrder,
      status: "PAYMENT_PENDING",
    });

    // Simulates another request winning the race inside the transaction.
    const tx = {
      order: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        findUniqueOrThrow: vi.fn(),
      },
      riskFlag: { create: vi.fn() },
      commissionLedger: { create: vi.fn() },
    };
    (prisma.$transaction as unknown as ReturnType<typeof vi.fn>).mockImplementation((cb: (tx: unknown) => unknown) =>
      cb(tx),
    );

    const res = await POST(makeRequest({ proofUrl: "https://proof" }), { params: { id: "order-1" } });

    expect(res.status).toBe(409);
    expect(tx.commissionLedger.create).not.toHaveBeenCalled();
  });

  it("creates exactly one commission ledger entry on a normal confirmation", async () => {
    (prisma.order.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...baseOrder,
      status: "PAYMENT_PENDING",
    });

    const tx = {
      order: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: vi.fn().mockResolvedValue({ ...baseOrder, status: "PAID" }),
      },
      riskFlag: { create: vi.fn() },
      commissionLedger: { create: vi.fn() },
    };
    (prisma.$transaction as unknown as ReturnType<typeof vi.fn>).mockImplementation((cb: (tx: unknown) => unknown) =>
      cb(tx),
    );

    const res = await POST(makeRequest({ proofUrl: "https://proof" }), { params: { id: "order-1" } });

    expect(res.status).toBe(200);
    expect(tx.commissionLedger.create).toHaveBeenCalledTimes(1);
    expect(tx.riskFlag.create).not.toHaveBeenCalled();
  });

  it("flags a risk entry when no proof URL is attached", async () => {
    (prisma.order.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...baseOrder,
      status: "PAYMENT_PENDING",
    });

    const tx = {
      order: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: vi.fn().mockResolvedValue({ ...baseOrder, status: "PAID" }),
      },
      riskFlag: { create: vi.fn() },
      commissionLedger: { create: vi.fn() },
    };
    (prisma.$transaction as unknown as ReturnType<typeof vi.fn>).mockImplementation((cb: (tx: unknown) => unknown) =>
      cb(tx),
    );

    await POST(makeRequest({}), { params: { id: "order-1" } });

    expect(tx.riskFlag.create).toHaveBeenCalledTimes(1);
  });
});
