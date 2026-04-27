import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { SendButton } from "./SendButton";

interface Props { params: { id: string } }

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

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    SENT: "bg-blue-100 text-blue-700",
    EXPIRED: "bg-gray-100 text-gray-500",
    ACCEPTED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-600",
    SUPERSEDED: "bg-gray-100 text-gray-400",
  };

  const s = statusColors[quote.status] || "bg-gray-100 text-gray-600";
  const isExpired = new Date(quote.validUntil) < new Date();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/quotes" className="text-gray-400 hover:text-gray-600 text-sm">← 견적 목록</Link>
        <h1 className="text-2xl font-bold">견적서 상세</h1>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s}`}>{quote.status}</span>
      </div>

      {/* Meta */}
      <div className="bg-white border rounded-xl p-5 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">방송인</span>
          <span className="font-medium">{quote.project.talent.nameKo}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">프로젝트</span>
          <span>{quote.project.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">발급일</span>
          <span>{quote.sentAt ? new Date(quote.sentAt).toLocaleDateString("ko-KR") : "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">유효기간</span>
          <span className={isExpired ? "text-red-500" : ""}>{new Date(quote.validUntil).toLocaleDateString("ko-KR")}까지</span>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-white border rounded-xl p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left pb-2 text-gray-500 font-medium">항목</th>
              <th className="text-right pb-2 text-gray-500 font-medium">금액</th>
            </tr>
          </thead>
          <tbody>
            {quote.lineItems.map((item, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-3">{item.description}</td>
                <td className="py-3 text-right">{formatCurrency(Number(item.amount) * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2">
              <td className="pt-3 font-bold">합계</td>
              <td className="pt-3 text-right font-bold text-xl text-blue-600">{formatCurrency(Number(quote.totalAmount))}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Quote link */}
      {quote.status === "SENT" && (
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm font-medium text-gray-700 mb-2">견적서 링크</p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
            <a href={quoteUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-blue-600 text-sm hover:underline break-all">{quoteUrl}</a>
          </div>
        </div>
      )}

      {/* Order info */}
      {quote.order && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <p className="text-sm font-medium text-green-800 mb-1">✓ 연결된 주문</p>
          <p className="text-sm text-green-700">주문번호: {quote.order.orderNumber} — {quote.order.status}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-start gap-3">
        {quote.status === "DRAFT" && (
          <SendButton quoteId={quote.id} />
        )}
        <Link
          href={`/dashboard/projects/${quote.projectId}`}
          className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
        >
          프로젝트 보기
        </Link>
      </div>
    </div>
  );
}
