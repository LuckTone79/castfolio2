import { notFound } from "next/navigation";
import { requireQuoteToken } from "@/lib/tokens";
import { formatCurrency } from "@/lib/utils";

interface Props { params: { token: string } }

export default async function QuotePage({ params }: Props) {
  let quote;
  let isExpired = false;

  try {
    quote = await requireQuoteToken(params.token);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";
    if (message === "TOKEN_EXPIRED") isExpired = true;
    else notFound();
  }

  if (isExpired) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <p className="text-4xl mb-4">⏰</p>
        <h1 className="text-xl font-bold mb-2">견적이 만료되었습니다</h1>
        <p className="text-gray-500">이 견적은 만료되었습니다. 담당자에게 문의해주세요.</p>
      </div>
    </div>
  );

  if (!quote) notFound();

  const talent = quote.project.talent;
  const user = quote.user;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header with branding */}
        <div className="text-center mb-8">
          {user.brandLogoUrl && <img src={user.brandLogoUrl} alt={user.name} className="h-10 mx-auto mb-3 object-contain" />}
          <h1 className="text-2xl font-bold">견적서</h1>
          <p className="text-gray-500 mt-1">{talent.nameKo}님의 PR 페이지 제작</p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">발급일</span>
              <span>{quote.sentAt ? new Date(quote.sentAt).toLocaleDateString("ko-KR") : "-"}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">유효기간</span>
              <span className={new Date(quote.validUntil) < new Date() ? "text-red-500" : ""}>
                {new Date(quote.validUntil).toLocaleDateString("ko-KR")}까지
              </span>
            </div>
          </div>

          <div className="px-6 py-4">
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
                    <td className="py-3 text-right">{formatCurrency(Number(item.amount))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2">
                  <td className="pt-3 font-bold">합계</td>
                  <td className="pt-3 text-right font-bold text-xl text-blue-600">
                    {formatCurrency(Number(quote.totalAmount))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {quote.message && (
            <div className="px-6 pb-4">
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{quote.message}</p>
            </div>
          )}
        </div>

        {/* Payment instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="font-semibold text-blue-900 mb-2">💳 결제 방법</h2>
          <p className="text-sm text-blue-800 mb-4">
            아래 담당자에게 연락하여 결제를 진행해주세요.
          </p>
          <div className="space-y-2">
            {user.email && (
              <a href={`mailto:${user.email}`} className="flex items-center gap-2 text-sm text-blue-700 hover:underline">
                <span>✉️</span> {user.email}
              </a>
            )}
            {user.phone && (
              <a href={`tel:${user.phone}`} className="flex items-center gap-2 text-sm text-blue-700 hover:underline">
                <span>📞</span> {user.phone}
              </a>
            )}
          </div>
          {user.email && (
            <a href={`mailto:${user.email}?subject=${encodeURIComponent(`[견적] ${talent.nameKo} PR 페이지 결제 문의`)}`}
              className="mt-4 block w-full py-2.5 bg-blue-600 text-white text-center rounded-lg font-medium hover:bg-blue-700 text-sm">
              문의하기
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
