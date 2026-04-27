import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      project: { include: { talent: { select: { nameKo: true } } } },
    },
    take: 100,
  });

  const settlements = await prisma.settlementBatch.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
    take: 50,
  });

  // Aggregate stats
  const totalRevenue = orders
    .filter(o => ["PAID", "DELIVERED", "SETTLED"].includes(o.status))
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const totalCommission = orders
    .filter(o => ["PAID", "DELIVERED", "SETTLED"].includes(o.status))
    .reduce((sum, o) => sum + Number(o.commissionAmount), 0);

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    PAYMENT_PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-blue-100 text-blue-700",
    DELIVERED: "bg-green-100 text-green-700",
    SETTLED: "bg-gray-100 text-gray-500",
    CANCELLED: "bg-red-100 text-red-500",
    REFUNDED: "bg-purple-100 text-purple-700",
    DISPUTED: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">주문 / 정산 관리</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "전체 주문", value: orders.length + "건" },
          { label: "결제 완료", value: orders.filter(o => ["PAID", "DELIVERED", "SETTLED"].includes(o.status)).length + "건" },
          { label: "총 매출", value: formatCurrency(totalRevenue) },
          { label: "총 수수료", value: formatCurrency(totalCommission) },
        ].map(stat => (
          <div key={stat.label} className="bg-white border rounded-xl p-4">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <section>
        <h2 className="text-lg font-semibold mb-3">주문 목록</h2>
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["주문번호", "담당자", "방송인", "금액", "수수료", "결제방식", "상태", "날짜"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{order.user.name}</td>
                  <td className="px-4 py-3 text-gray-700">{order.project.talent.nameKo}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(Number(order.totalAmount))}</td>
                  <td className="px-4 py-3 text-gray-500">{formatCurrency(Number(order.commissionAmount))}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{order.paymentMethod || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Settlements */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">정산 배치</h2>
          <form action="/api/settlements/run" method="POST">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              정산 배치 실행
            </button>
          </form>
        </div>
        <div className="bg-white border rounded-xl overflow-hidden">
          {settlements.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p>정산 배치 내역이 없습니다.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["담당자", "정산 기간", "총 매출", "수수료", "지급액", "상태", "생성일"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {settlements.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{s.user.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(s.periodStart).toLocaleDateString("ko-KR")} ~{" "}
                      {new Date(s.periodEnd).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3">{formatCurrency(Number(s.totalSales))}</td>
                    <td className="px-4 py-3 text-gray-500">{formatCurrency(Number(s.totalCommission))}</td>
                    <td className="px-4 py-3 font-medium text-green-700">{formatCurrency(Number(s.totalUserAmount))}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                        s.status === "OVERDUE" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {s.status === "COMPLETED" ? "완료" : s.status === "OVERDUE" ? "연체" : "대기"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(s.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
