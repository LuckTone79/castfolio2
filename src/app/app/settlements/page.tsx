import { PageHeader } from "@/components/layout/page-header";
import { requireAgentAppProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AppSettlementsPage() {
  const profile = await requireAgentAppProfile();
  const settlements = await prisma.settlementBatch.findMany({
    where: { userId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <>
      <PageHeader
        title="정산 내역"
        description="판매 확정 건을 기준으로 파트너 수익과 플랫폼 수수료를 확인합니다."
      />

      <div className="rounded-2xl border border-gray-800 bg-gray-900">
        {settlements.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            아직 집계된 정산 배치가 없습니다. 판매가 누적되면 이곳에서 정산 흐름을 확인할 수 있습니다.
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {settlements.map((batch) => (
              <div key={batch.id} className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {formatDate(batch.periodStart)} ~ {formatDate(batch.periodEnd)}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">생성일 {formatDate(batch.createdAt)}</p>
                </div>
                <div className="grid gap-1 text-left lg:text-right">
                  <p className="text-sm text-gray-400">총 판매금액 {formatCurrency(batch.totalSales.toString())}</p>
                  <p className="text-sm text-gray-400">플랫폼 수수료 {formatCurrency(batch.totalCommission.toString())}</p>
                  <p className="text-sm font-semibold text-white">파트너 정산금 {formatCurrency(batch.totalUserAmount.toString())}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
