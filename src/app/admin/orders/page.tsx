import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_COLOR: Record<string, "gray" | "yellow" | "green" | "red" | "blue"> = {
  DRAFT: "gray", PAYMENT_PENDING: "yellow", PAID: "green", DELIVERED: "blue",
  SETTLED: "green", CANCELLED: "red", DISPUTED: "red", REFUNDED: "red",
};

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      project: { include: { talent: { select: { nameKo: true } } } },
    },
  });

  return (
    <>
      <PageHeader title="주문 모니터링" description="전체 주문 현황을 확인합니다" />

      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">주문번호</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">사용자</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">탤런트</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">금액</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">수수료</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">일자</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3 text-sm font-mono text-white">{o.orderNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{o.user.name || o.user.email}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{o.project.talent.nameKo}</td>
                <td className="px-4 py-3 text-sm text-white">{formatCurrency(o.totalAmount.toString())}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{formatCurrency(o.commissionAmount.toString())}</td>
                <td className="px-4 py-3"><Badge color={STATUS_COLOR[o.status] || "gray"}>{o.status}</Badge></td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="py-12 text-center text-gray-500 text-sm">주문이 없습니다</p>}
      </div>
    </>
  );
}
