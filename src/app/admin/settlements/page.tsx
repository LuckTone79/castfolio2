import { PageHeader } from "@/components/layout/page-header";
import { requireAdminProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminSettlementsPage() {
  await requireAdminProfile();

  const batches = await prisma.settlementBatch.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: true },
  });

  return (
    <>
      <PageHeader
        title="전체 정산 관리"
        description="파트너별 정산 배치와 플랫폼 수수료, 파트너 정산금 현황을 확인하는 공간입니다."
      />

      <div className="rounded-2xl border border-gray-800 bg-gray-900">
        {batches.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">정산 배치가 아직 생성되지 않았습니다.</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {batches.map((batch) => (
              <div key={batch.id} className="grid gap-3 px-6 py-5 lg:grid-cols-[1.2fr_1fr_1fr_0.8fr] lg:items-center">
                <div>
                  <p className="text-sm font-semibold text-white">{batch.user.name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDate(batch.periodStart)} ~ {formatDate(batch.periodEnd)}
                  </p>
                </div>
                <p className="text-sm text-gray-300">{formatCurrency(batch.totalSales.toString())}</p>
                <p className="text-sm text-gray-400">{formatCurrency(batch.totalCommission.toString())}</p>
                <div className="text-left lg:text-right">
                  <p className="text-sm text-gray-300">{batch.status}</p>
                  <p className="mt-1 text-xs text-gray-500">{formatDate(batch.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
