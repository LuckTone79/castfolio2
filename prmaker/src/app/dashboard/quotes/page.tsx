import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { ConfirmPaymentButton } from "@/components/dashboard/ConfirmPaymentButton";

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const quoteStatusConfig: Record<string, { label: string; cls: string }> = {
  DRAFT:      { label: "초안",   cls: "badge-gray" },
  SENT:       { label: "발송됨", cls: "badge-blue" },
  EXPIRED:    { label: "만료",   cls: "badge-gray" },
  ACCEPTED:   { label: "수락됨", cls: "badge-emerald" },
  REJECTED:   { label: "거절됨", cls: "badge-red" },
  SUPERSEDED: { label: "대체됨", cls: "badge-gray" },
};

const orderStatusConfig: Record<string, { label: string; cls: string }> = {
  PAYMENT_PENDING: { label: "결제 대기", cls: "badge-amber" },
  PAID:            { label: "결제 완료", cls: "badge-emerald" },
  IN_PROGRESS:     { label: "제작 중",  cls: "badge-blue" },
  DELIVERED:       { label: "납품 완료", cls: "badge-emerald" },
  CANCELLED:       { label: "취소",     cls: "badge-red" },
  REFUNDED:        { label: "환불",     cls: "badge-gray" },
};

export default async function QuotesPage() {
  const user = await requireUser();
  const [quotes, pendingOrders] = await Promise.all([
    prisma.quote.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        project: { include: { talent: { select: { nameKo: true } } } },
      },
      take: 50,
    }),
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        project: { include: { talent: { select: { nameKo: true } } } },
      },
      take: 30,
    }),
  ]);

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>판매 메뉴</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>견적 발송, 주문 확인, 판매 확정 흐름을 관리합니다.</p>
        </div>
        <Link
          href="/dashboard/quotes/new"
          className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm"
          style={{ background: "var(--accent)" }}
        >
          <PlusIcon /> 판매 견적 생성
        </Link>
      </div>

      {/* Orders section — payment confirmation */}
      {pendingOrders.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: "var(--border-subtle)" }}>
            <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>주문 관리</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(251,191,36,0.15)", color: "#F59E0B" }}>
              결제 대기 {pendingOrders.filter(o => o.status === "PAYMENT_PENDING").length}건
            </span>
          </div>
          <table className="w-full table-dark">
            <thead>
              <tr>
                {["방송인", "주문번호", "금액", "상태", "주문일", "액션"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map(o => {
                const s = orderStatusConfig[o.status] ?? { label: o.status, cls: "badge-gray" };
                return (
                  <tr key={o.id}>
                    <td>
                      <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                        {o.project.talent.nameKo}
                      </p>
                    </td>
                    <td>
                      <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                        {o.orderNumber}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold text-sm text-gradient-amber">
                        {formatCurrency(Number(o.totalAmount))}
                      </span>
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
                        {s.label}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {new Date(o.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/projects/${o.projectId}`}
                          className="text-xs font-medium"
                          style={{ color: "#A78BFA" }}
                        >
                          프로젝트
                        </Link>
                        {o.status === "PAYMENT_PENDING" && (
                          <ConfirmPaymentButton
                            orderId={o.id}
                            orderNumber={o.orderNumber}
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

      {/* Quotes section */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        {quotes.length === 0 ? (
          <div className="py-20 text-center">
            <div
              className="mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ width: 56, height: 56, background: "rgba(124,92,252,0.1)", color: "#7C5CFC" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16l2.5-1.5L9 20l2.5-1.5L14 20l2.5-1.5L19 20V8z"/>
                <path d="M14 2v6h5M16 13H8M16 17H8M10 9H8"/>
              </svg>
            </div>
            <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>생성된 판매 견적이 없습니다</p>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>프로젝트에 대한 판매 제안서와 결제 안내 흐름을 시작해보세요.</p>
            <Link
              href="/dashboard/quotes/new"
              className="btn-primary inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm"
              style={{ background: "var(--accent)" }}
            >
              <PlusIcon /> 첫 견적 생성
            </Link>
          </div>
        ) : (
          <table className="w-full table-dark">
            <thead>
              <tr>
                {["방송인", "프로젝트", "금액", "유효기간", "상태", "액션"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => {
                const s = quoteStatusConfig[q.status] ?? { label: q.status, cls: "badge-gray" };
                const isExpired = new Date(q.validUntil) < new Date();
                return (
                  <tr key={q.id}>
                    <td>
                      <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                        {q.project.talent.nameKo}
                      </p>
                    </td>
                    <td>{q.project.name}</td>
                    <td>
                      <span className="font-semibold text-sm text-gradient-amber">
                        {formatCurrency(Number(q.totalAmount))}
                      </span>
                    </td>
                    <td>
                      <span
                        className="text-xs"
                        style={{ color: isExpired ? "var(--accent-red)" : "var(--text-muted)" }}
                      >
                        {new Date(q.validUntil).toLocaleDateString("ko-KR")}
                      </span>
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
                        {s.label}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/quotes/${q.id}`}
                        className="text-xs font-medium"
                        style={{ color: "#A78BFA" }}
                      >
                        보기
                      </Link>
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
