import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { SendButton } from "./SendButton";

interface Props { params: { id: string } }

const statusConfig: Record<string, { label: string; cls: string }> = {
  DRAFT:      { label: "초안",     cls: "badge-gray" },
  SENT:       { label: "발송됨",   cls: "badge-blue" },
  EXPIRED:    { label: "만료",     cls: "badge-gray" },
  ACCEPTED:   { label: "수락됨",   cls: "badge-emerald" },
  REJECTED:   { label: "거절됨",   cls: "badge-red" },
  SUPERSEDED: { label: "대체됨",   cls: "badge-gray" },
};

export default async function QuoteDetailPage({ params }: Props) {
  const user = await requireUser();

  const quote = await prisma.quote.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      project: { include: { talent: true } },
      lineItems: { include: { package: true } },
      order: { select: { id: true, orderNumber: true, status: true } },
    },
  });
  if (!quote) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://castfolio.com";
  const quoteUrl = `${appUrl}/quote/${quote.token}`;
  const s = statusConfig[quote.status] ?? { label: quote.status, cls: "badge-gray" };
  const isExpired = new Date(quote.validUntil) < new Date();

  return (
    <div className="max-w-2xl space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/quotes" className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          견적 목록
        </Link>
        <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>견적서 상세</h1>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>
      </div>

      {/* Meta */}
      <div
        className="rounded-2xl p-5 space-y-3 fade-in-1"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>기본 정보</p>
        {[
          { label: "방송인",   value: quote.project.talent.nameKo },
          { label: "프로젝트", value: quote.project.name },
          { label: "발급일",   value: quote.sentAt ? new Date(quote.sentAt).toLocaleDateString("ko-KR") : "—" },
          {
            label: "유효기간",
            value: `${new Date(quote.validUntil).toLocaleDateString("ko-KR")}까지`,
            valueColor: isExpired ? "#FCA5A5" : "var(--text-secondary)",
          },
        ].map(row => (
          <div key={row.label} className="flex justify-between">
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>{row.label}</span>
            <span className="text-sm font-medium" style={{ color: row.valueColor || "var(--text-secondary)" }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Line items */}
      <div
        className="rounded-2xl overflow-hidden fade-in-2"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>견적 항목</h2>
        </div>
        <table className="w-full table-dark">
          <thead>
            <tr>
              <th>항목</th>
              <th className="text-right">금액</th>
            </tr>
          </thead>
          <tbody>
            {quote.lineItems.map((item, i) => (
              <tr key={i}>
                <td style={{ color: "var(--text-primary)" }}>{item.description}</td>
                <td className="text-right font-medium" style={{ color: "var(--text-primary)" }}>
                  {formatCurrency(Number(item.amount) * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center px-5 py-4" style={{ borderTop: "1px solid var(--border-default)" }}>
          <span className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>합계</span>
          <span className="text-xl font-bold text-gradient-amber">{formatCurrency(Number(quote.totalAmount))}</span>
        </div>
      </div>

      {/* Quote link */}
      {quote.status === "SENT" && (
        <div
          className="rounded-2xl p-5 fade-in-3"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>견적서 링크</p>
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
          >
            <a
              href={quoteUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 text-xs truncate" style={{ color: "#A78BFA" }}
            >
              {quoteUrl}
            </a>
          </div>
        </div>
      )}

      {/* Order info */}
      {quote.order && (
        <div
          className="rounded-2xl p-5 fade-in-4"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <p className="text-sm font-semibold" style={{ color: "#6EE7B7" }}>연결된 주문</p>
          </div>
          <p className="text-xs" style={{ color: "#6EE7B7", opacity: 0.8 }}>
            주문번호: {quote.order.orderNumber} — {quote.order.status}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-start gap-3">
        {quote.status === "DRAFT" && <SendButton quoteId={quote.id} />}
        <Link
          href={`/dashboard/projects/${quote.projectId}`}
          className="btn-ghost px-4 py-2 rounded-lg text-sm"
        >
          프로젝트 보기
        </Link>
      </div>
    </div>
  );
}
