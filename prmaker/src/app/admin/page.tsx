import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function AdminHomePage() {
  await requireAdmin();

  const [totalUsers, totalProjects, riskFlags, pendingSettlements, todayOrders, refundDisputes] = await Promise.all([
    prisma.user.count({ where: { role: "USER", status: "ACTIVE" } }),
    prisma.project.count(),
    prisma.riskFlag.count({ where: { resolvedAt: null } }),
    prisma.settlementBatch.aggregate({ where: { status: "PENDING" }, _sum: { totalUserAmount: true } }),
    prisma.order.count({ where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
    prisma.order.count({ where: { status: { in: ["DISPUTED", "REFUNDED"] } } }),
  ]);

  const totalRevenue = await prisma.order.aggregate({
    where: { status: { in: ["PAID", "DELIVERED", "SETTLED"] } },
    _sum: { totalAmount: true, commissionAmount: true },
  });

  const cards = [
    { label: "오늘 신규 주문", value: String(todayOrders), icon: "📦", color: "bg-blue-50" },
    { label: "위험 플래그", value: String(riskFlags), icon: "⚠️", color: "bg-yellow-50" },
    { label: "정산 대기 총액", value: formatCurrency(Number(pendingSettlements._sum.totalUserAmount || 0)), icon: "💰", color: "bg-green-50" },
    { label: "환불/분쟁", value: String(refundDisputes), icon: "🚨", color: "bg-red-50" },
    { label: "총 사용자", value: String(totalUsers), icon: "👥", color: "bg-purple-50" },
    { label: "총 프로젝트", value: String(totalProjects), icon: "📁", color: "bg-indigo-50" },
    { label: "총 매출", value: formatCurrency(Number(totalRevenue._sum.totalAmount || 0)), icon: "📈", color: "bg-emerald-50" },
    { label: "총 수수료", value: formatCurrency(Number(totalRevenue._sum.commissionAmount || 0)), icon: "💎", color: "bg-teal-50" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">관리자 대시보드</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.label} className={`${card.color} rounded-xl p-4 border border-white`}>
            <div className="text-2xl mb-2">{card.icon}</div>
            <p className="text-xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
