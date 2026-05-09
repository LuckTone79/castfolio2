import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { ConfirmPaymentButton } from "@/components/dashboard/ConfirmPaymentButton";

const orderStatusConfig: Record<string, { label: string; cls: string; icon: string }> = {
  DRAFT:           { label: "초안",      cls: "badge-gray",    icon: "○" },
  PAYMENT_PENDING: { label: "결제 대기", cls: "badge-amber",   icon: "⏳" },
  PAID:            { label: "결제 완료", cls: "badge-emerald", icon: "✓" },
  DELIVERED:       { label: "납품 완료", cls: "badge-emerald", icon: "📦" },
  SETTLED:         { label: "정산 완료", cls: "badge-violet",  icon: "💰" },
  CANCELLED:       { label: "취소",      cls: "badge-red",     icon: "✕" },
  DISPUTED:        { label: "이슈",      cls: "badge-red",     icon: "⚠" },
  REFUNDED:        { label: "환불",      cls: "badge-gray",    icon: "↩" },
};

export default async function OrdersPage() {
  const user = await requireUser();

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      project: {
        include: {
          talent: { select: { nameKo: true, nameEn: true } },
          page: { select: { status: true, slug: true } },
        },
      },
      quote: { select: { id: true } },
    },
  });

  const stats = {
    total: orders.length,
    pendingPayment: orders.filter(o => o.status === "PAYMENT_PENDING").length,
    paid: orders.filter(o => o.status === "PAID").length,
    delivered: orders.filter(o => o.status === "DELIVERED").length,
    settled: orders.filter(o => o.status === "SETTLED").length,
    totalRevenue: orders
      .filter(o => ["PAID", "DELIVERED", "SETTLED"].includes(o.status))
      .reduce((sum, o) => sum + Number(o.userAmount), 0),
  };

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>주문 관리</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          견적 수락 후 생성된 모든 주문을 관리합니다.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "전체", value: stats.total, cls: "var(--text-primary)" },
          { label: "결제 대기", value: stats.pendingPayment, cls: "#F59E0B" },
          { label: "결제 완료", value: stats.paid, cls: "#34D399" },
          { label: "납품 완료", value: stats.delivered, cls: "#A78BFA" },
          { label: "정산 완료", value: stats.settled, cls: "#60A5FA" },
          { label: "순수익", value: formatCurrency(stats.totalRevenue), cls: "#34D399" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            <p className="font-bold text-lg mt-1" style={{ color: s.cls }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        {orders.length === 0 ? (
          <div className="py-20 text-center">
            <div
              className="mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ width: 56, height: 56, background: "rgba(124,92,252,0.1)", color: "#7C5CFC" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>아직 주문이 없습니다</p>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              견적서를 발송하고 고객이 수락하면 주문이 생성됩니다.
            </p>
            <Link
              href="/dashboard/quotes/new"
              className="btn-primary inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm"
              style={{ background: "var(--accent)" }}
            >
              견적 생성하기
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-dark min-w-[700px]">
              <thead>
                <tr>
                  {["방송인", "주문번호", "금액", "순수익", "상태", "주문일", "액션"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const s = orderStatusConfig[order.status] ?? { label: order.status, cls: "badge-gray", icon: "?" };
                  return (
                    <tr key={order.id}>
                      <td>
                        <div>
                          <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                            {order.project.talent.nameKo}
                          </p>
                          {order.project.talent.nameEn && (
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                              {order.project.talent.nameEn}
                            </p>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                          {order.orderNumber}
                        </span>
                      </td>
                      <td>
                        <span className="font-semibold text-sm text-gradient-amber">
                          {formatCurrency(Number(order.totalAmount))}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm" style={{ color: "#34D399" }}>
                          {formatCurrency(Number(order.userAmount))}
                        </span>
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
                          {s.icon} {s.label}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/dashboard/projects/${order.projectId}`}
                            className="text-xs font-medium"
                            style={{ color: "#A78BFA" }}
                          >
                            프로젝트
                          </Link>
                          {order.project.page?.status === "PUBLISHED" && order.project.page?.slug && (
                            <Link
                              href={`/p/${order.project.page.slug}`}
                              target="_blank"
                              className="text-xs font-medium"
                              style={{ color: "#34D399" }}
                            >
                              PR 페이지
                            </Link>
                          )}
                          {order.status === "PAYMENT_PENDING" && (
                            <ConfirmPaymentButton
                              orderId={order.id}
                              orderNumber={order.orderNumber}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
