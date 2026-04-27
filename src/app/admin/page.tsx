import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui";
import { Users, ShoppingCart, Banknote, Globe, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboard() {
  await requireAdmin();

  const [userCount, orderCount, totalRevenue, publishedPages, riskFlags] = await Promise.all([
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { in: ["PAID", "DELIVERED", "SETTLED"] } } }),
    prisma.page.count({ where: { status: "PUBLISHED" } }),
    prisma.riskFlag.count({ where: { resolvedAt: null } }),
  ]);

  return (
    <>
      <PageHeader title="관리자 대시보드" description="플랫폼 전체 현황" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="사용자" value={userCount} icon={Users} />
        <StatCard label="전체 주문" value={orderCount} icon={ShoppingCart} />
        <StatCard label="총 매출" value={formatCurrency(totalRevenue._sum.totalAmount?.toString() || "0")} icon={Banknote} />
        <StatCard label="발행 페이지" value={publishedPages} icon={Globe} />
        <StatCard
          label="리스크 플래그"
          value={riskFlags}
          icon={AlertTriangle}
          className={riskFlags > 0 ? "border-red-800" : ""}
        />
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-500 text-sm">
        차트와 상세 분석은 추후 추가 예정입니다
      </div>
    </>
  );
}
