import { ReceiptText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { requireAgentAppProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AppSalesPage() {
  const profile = await requireAgentAppProfile();
  const orders = await prisma.order.findMany({
    where: { userId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      project: { include: { talent: { select: { nameKo: true } } } },
    },
  });

  return (
    <>
      <PageHeader
        title="판매 관리"
        description="판매 확정 건을 기준으로 고객, 금액, 상태를 확인하고 다음 정산 흐름을 준비합니다."
      />

      <div className="rounded-2xl border border-gray-800 bg-gray-900">
        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            아직 판매 내역이 없습니다. 판매가 확정되면 이곳에서 금액과 상태를 관리할 수 있습니다.
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {orders.map((order) => (
              <div key={order.id} className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ReceiptText className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-semibold text-white">{order.orderNumber}</p>
                    <span className="rounded-full border border-gray-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-300">
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-400">
                    {order.project.talent.nameKo} · {order.project.name}
                  </p>
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-sm font-semibold text-white">{formatCurrency(order.totalAmount.toString())}</p>
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
