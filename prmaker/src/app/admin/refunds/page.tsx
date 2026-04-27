import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function AdminRefundsPage() {
  await requireAdmin();

  const refunds = await prisma.refundRecord.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        include: {
          user: { select: { name: true } },
          project: { include: { talent: { select: { nameKo: true } } } },
        },
      },
    },
    take: 50,
  });

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-600",
    COMPLETED: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">환불 관리</h1>

      {refunds.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">↩️</p>
          <p className="text-gray-500">환불 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["주문번호", "담당자", "방송인", "환불금액", "사유", "상태", "신청일"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {refunds.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{r.order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{r.order.user.name}</td>
                  <td className="px-4 py-3 text-gray-700">{r.order.project.talent.nameKo}</td>
                  <td className="px-4 py-3 font-medium text-red-600">-{formatCurrency(Number(r.amount))}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{r.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status] || "bg-gray-100 text-gray-600"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
