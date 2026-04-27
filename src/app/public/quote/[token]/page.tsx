import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { Sparkles, FileText, CheckCircle, XCircle } from "lucide-react";

export default async function PublicQuotePage({ params }: { params: { token: string } }) {
  const quote = await prisma.quote.findFirst({
    where: { token: params.token },
    include: {
      lineItems: { include: { package: true } },
      project: { include: { talent: true } },
      user: { select: { name: true, email: true, brandLogoUrl: true } },
    },
  });

  if (!quote) notFound();

  const expired = quote.validUntil && new Date(quote.validUntil) < new Date();
  const isActionable = quote.status === "SENT" && !expired;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Mini Header */}
      <header className="flex items-center justify-center gap-2 py-4 border-b border-gray-800">
        <Sparkles size={18} className="text-white" />
        <span className="text-sm font-semibold text-white">Castfolio</span>
      </header>

      <main className="flex-1 flex items-start justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} className="text-gray-400" />
                <h1 className="text-lg font-semibold text-white">견적서</h1>
              </div>
              <p className="text-sm text-gray-400">
                {quote.project.talent.nameKo}님의 PR 페이지 제작 견적입니다
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge color={quote.status === "ACCEPTED" ? "green" : quote.status === "SENT" ? "blue" : "gray"}>
                  {quote.status}
                </Badge>
                {expired && <Badge color="red">만료됨</Badge>}
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-800">
              {quote.lineItems.map((li) => (
                <div key={li.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm text-white">{li.description}</p>
                    {li.package && <p className="text-xs text-gray-500">{li.package.name}</p>}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {formatCurrency(li.amount.toString())} × {li.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-950 border-t border-gray-800">
              <span className="text-sm font-medium text-gray-400">합계</span>
              <span className="text-xl font-bold text-white">{formatCurrency(quote.totalAmount.toString())}</span>
            </div>

            {/* Message */}
            {quote.message && (
              <div className="px-6 py-4 border-t border-gray-800">
                <p className="text-sm text-gray-400 whitespace-pre-wrap">{quote.message}</p>
              </div>
            )}

            {/* Meta */}
            <div className="px-6 py-4 border-t border-gray-800">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>발행: {quote.user.name || quote.user.email}</span>
                <span>작성: {formatDate(quote.createdAt)}</span>
              </div>
              {quote.validUntil && (
                <p className="text-xs text-gray-500 mt-1">유효기간: {formatDate(quote.validUntil)}</p>
              )}
            </div>

            {/* Actions (placeholder for client component) */}
            {isActionable && (
              <div className="px-6 py-4 border-t border-gray-800 flex gap-2">
                <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white text-gray-900 font-medium text-sm hover:bg-gray-100 transition-colors">
                  <CheckCircle size={16} /> 승인
                </button>
                <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-700 text-gray-300 font-medium text-sm hover:bg-gray-800 transition-colors">
                  <XCircle size={16} /> 거절
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-4 text-center border-t border-gray-800">
        <p className="text-xs text-gray-600">Powered by Castfolio</p>
      </footer>
    </div>
  );
}
