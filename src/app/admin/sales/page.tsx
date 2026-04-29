import { PageHeader } from "@/components/layout/page-header";
import { requireAdminProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminSalesPage() {
  await requireAdminProfile();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      project: { include: { talent: true } },
      user: true,
    },
  });

  return (
    <>
      <PageHeader
        title="전체 판매 내역"
        description="파트너별 판매 확정 흐름과 금액, 수수료 집계를 운영 관점에서 확인합니다."
      />

      <div className="rounded-2xl border border-gray-800 bg-gray-900">
        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">집계된 판매 내역이 없습니다.</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {orders.map((order) => (
              <div key={order.id} className="grid gap-3 px-6 py-5 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr] lg:items-center">
                <div>
                  <p className="text-sm font-semibold text-white">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {order.user.name} · {order.project.talent.nameKo}
                  </p>
                </div>
                <p className="text-sm text-gray-300">{formatCurrency(order.totalAmount.toString())}</p>
                <p className="text-sm text-gray-400">수수료 {formatCurrency(order.commissionAmount.toString())}</p>
                <div className="text-left lg:text-right">
                  <p className="text-sm text-gray-300">{order.status}</p>
                  <p className="mt-1 text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
