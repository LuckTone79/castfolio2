import Link from "next/link";
import { FileStack, ReceiptText, ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui";
import { requireAdminProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  await requireAdminProfile();

  const [
    partnerCount,
    activePartnerCount,
    talentCount,
    totalPages,
    publishedPages,
    salesAggregate,
    commissionAggregate,
    unsettledAggregate,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER", status: { not: "DELETED" } } }),
    prisma.user.count({ where: { role: "USER", status: "ACTIVE" } }),
    prisma.talent.count({ where: { status: { not: "DELETED" } } }),
    prisma.page.count(),
    prisma.page.count({ where: { status: "PUBLISHED" } }),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.order.aggregate({ _sum: { commissionAmount: true } }),
    prisma.order.aggregate({
      _sum: { commissionAmount: true },
      where: { status: { in: ["PAID", "DELIVERED"] } },
    }),
  ]);

  const shortcuts = [
    { href: "/admin/users", label: "파트너 관리", icon: Users },
    { href: "/admin/pages", label: "전체 페이지 관리", icon: FileStack },
    { href: "/admin/sales", label: "전체 판매 내역", icon: ReceiptText },
    { href: "/admin/settlements", label: "전체 정산 관리", icon: ShieldCheck },
    { href: "/admin/audit-logs", label: "감사 로그", icon: ShieldCheck },
  ];

  return (
    <>
      <PageHeader
        title="관리자 대시보드"
        description="파트너 계정, 전체 PR 홈페이지, 판매 확정, 정산, 감사 로그를 관리합니다."
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="전체 파트너 수" value={partnerCount} icon={Users} />
        <StatCard label="활성 파트너 수" value={activePartnerCount} icon={Users} />
        <StatCard label="전체 방송인 고객 수" value={talentCount} icon={Users} />
        <StatCard label="전체 PR 페이지 수" value={totalPages} icon={FileStack} />
        <StatCard label="게시된 페이지 수" value={publishedPages} icon={FileStack} />
        <StatCard label="총 판매금액" value={formatCurrency(salesAggregate._sum.totalAmount?.toString() || "0")} icon={ReceiptText} />
        <StatCard label="플랫폼 수수료" value={formatCurrency(commissionAggregate._sum.commissionAmount?.toString() || "0")} icon={ShieldCheck} />
        <StatCard label="미정산 수수료" value={formatCurrency(unsettledAggregate._sum.commissionAmount?.toString() || "0")} icon={ShieldCheck} />
      </div>

      <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-bold text-white">관리 바로가기</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {shortcuts.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-gray-800 bg-gray-950 px-4 py-4 text-sm font-medium text-gray-300 transition hover:border-gray-700 hover:bg-gray-800 hover:text-white"
            >
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
