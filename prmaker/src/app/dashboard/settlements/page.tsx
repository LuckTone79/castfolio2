import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function SettlementsPage() {
  const user = await requireUser();
  const batches = await prisma.settlementBatch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const thisMonthOrders = await prisma.order.findMany({
    where: {
      userId: user.id,
      status: { in: ["PAID", "DELIVERED", "SETTLED"] },
      paidAt: { gte: thisMonthStart },
    },
    select: { totalAmount: true, commissionAmount: true, userAmount: true, paidAt: true },
    orderBy: { paidAt: "desc" },
  });

  const totalSales = thisMonthOrders.reduce((s, o) => s + Number(o.totalAmount), 0);
  const totalCommission = thisMonthOrders.reduce((s, o) => s + Number(o.commissionAmount), 0);
  const myAmount = thisMonthOrders.reduce((s, o) => s + Number(o.userAmount), 0);

  const batchStatusConfig: Record<string, { label: string; cls: string }> = {
    PENDING:   { label: "대기",  cls: "badge-amber" },
    COMPLETED: { label: "완료",  cls: "badge-emerald" },
    OVERDUE:   { label: "연체",  cls: "badge-red" },
  };

  const summaryCards = [
    { label: "이번 달 총 매출",    value: formatCurrency(totalSales),      sub: `${thisMonthOrders.length}건`, color: "#06B6D4" },
    { label: "플랫폼 수수료 (15%)", value: formatCurrency(totalCommission), sub: "공제 예정",                   color: "#EC4899" },
    { label: "내 수익 (85%)",      value: formatCurrency(myAmount),        sub: "익월 1일 정산",               color: "#10B981" },
  ];

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>정산 내역</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {new Date().getFullYear()}년 {new Date().getMonth() + 1}월 기준
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((card, i) => (
          <div
            key={card.label}
            className={`rounded-2xl p-5 fade-in-${i + 1}`}
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
          >
            <span
              className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md mb-3"
              style={{ background: `${card.color}15`, color: card.color, border: `1px solid ${card.color}25` }}
            >
              {card.sub}
            </span>
            <p className="font-bold text-2xl leading-none mb-1" style={{ color: "var(--text-primary)" }}>
              {card.value}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* This month orders */}
      {thisMonthOrders.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden fade-in-3"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>이번 달 결제 내역</h2>
          </div>
          <table className="w-full table-dark">
            <thead>
              <tr>
                {["결제일", "매출", "수수료", "내 수익"].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {thisMonthOrders.map((o, i) => (
                <tr key={i}>
                  <td style={{ color: "var(--text-muted)" }}>
                    {o.paidAt ? new Date(o.paidAt).toLocaleDateString("ko-KR") : "-"}
                  </td>
                  <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {formatCurrency(Number(o.totalAmount))}
                  </td>
                  <td style={{ color: "#FCA5A5" }}>-{formatCurrency(Number(o.commissionAmount))}</td>
                  <td style={{ color: "#6EE7B7", fontWeight: 600 }}>
                    {formatCurrency(Number(o.userAmount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* History */}
      <div
        className="rounded-2xl overflow-hidden fade-in-4"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>정산 이력</h2>
        </div>
        {batches.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              아직 정산 내역이 없습니다. 매월 1일 자동 정산됩니다.
            </p>
          </div>
        ) : (
          <table className="w-full table-dark">
            <thead>
              <tr>
                {["기간", "총 매출", "수수료", "내 수익", "상태"].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {batches.map(b => {
                const s = batchStatusConfig[b.status] ?? { label: b.status, cls: "badge-gray" };
                return (
                  <tr key={b.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                      {new Date(b.periodStart).toLocaleDateString("ko-KR")} ~ {new Date(b.periodEnd).toLocaleDateString("ko-KR")}
                    </td>
                    <td style={{ color: "var(--text-primary)" }}>{formatCurrency(Number(b.totalSales))}</td>
                    <td style={{ color: "#FCA5A5" }}>-{formatCurrency(Number(b.totalCommission))}</td>
                    <td style={{ color: "#6EE7B7", fontWeight: 600 }}>{formatCurrency(Number(b.totalUserAmount))}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
