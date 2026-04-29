import Link from "next/link";
import { FileInput, ReceiptText, SquarePen, Users, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui";
import { canWrite, requireAgentAppProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AgentDashboardPage() {
  const profile = await requireAgentAppProfile();
  const writeEnabled = canWrite(profile);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    salesAggregate,
    settlementAggregate,
    intakePending,
    reviewingCount,
    salePending,
    recentTalents,
    recentPages,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        userId: profile.id,
        createdAt: { gte: monthStart },
        status: { in: ["PAID", "DELIVERED", "SETTLED"] },
      },
    }),
    prisma.order.aggregate({
      _sum: { userAmount: true },
      where: {
        userId: profile.id,
        status: { in: ["PAID", "DELIVERED"] },
      },
    }),
    prisma.project.count({
      where: { userId: profile.id, status: "COLLECTING_MATERIALS" },
    }),
    prisma.project.count({
      where: { userId: profile.id, status: "UNDER_REVIEW" },
    }),
    prisma.project.count({
      where: { userId: profile.id, status: "READY_FOR_DELIVERY" },
    }),
    prisma.talent.findMany({
      where: { userId: profile.id, status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        nameKo: true,
        position: true,
        updatedAt: true,
      },
    }),
    prisma.page.findMany({
      where: { project: { userId: profile.id }, status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        publishedAt: true,
        project: { select: { talent: { select: { nameKo: true } } } },
      },
    }),
  ]);

  const quickActions = [
    { href: "/app/talents", label: "방송인 고객 추가", icon: Users, disabled: !writeEnabled },
    { href: "/app/intake", label: "자료 요청 링크 만들기", icon: FileInput, disabled: !writeEnabled },
    { href: "/app/talents", label: "PR 홈페이지 제작", icon: SquarePen, disabled: !writeEnabled },
    { href: "/app/sales", label: "판매 확정 입력", icon: ReceiptText, disabled: !writeEnabled },
  ];

  return (
    <>
      <PageHeader
        title="파트너 대시보드"
        description="방송인 고객 등록부터 자료 수집, PR 홈페이지 제작, 검토, 납품, 판매 확정까지 한곳에서 관리합니다."
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="이번 달 판매금액" value={formatCurrency(salesAggregate._sum.totalAmount?.toString() || "0")} icon={ReceiptText} />
        <StatCard label="예상 정산금" value={formatCurrency(settlementAggregate._sum.userAmount?.toString() || "0")} icon={Wallet} />
        <StatCard label="자료 제출 대기" value={intakePending} icon={FileInput} />
        <StatCard label="검토 요청 중" value={reviewingCount} icon={SquarePen} />
        <StatCard label="판매 확정 대기" value={salePending} icon={Users} />
      </div>

      <section className="mb-8 rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-bold text-white">빠른 작업</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) =>
            action.disabled ? (
              <div
                key={action.label}
                className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm font-medium text-amber-100"
              >
                <div className="flex items-center gap-2">
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </div>
                <p className="mt-2 text-xs leading-6 text-amber-100/75">
                  계정 상태가 정상화되면 다시 사용할 수 있습니다.
                </p>
              </div>
            ) : (
              <Link
                key={action.label}
                href={action.href}
                className="rounded-xl border border-gray-800 bg-gray-950 px-4 py-4 text-sm font-medium text-gray-300 transition hover:border-gray-700 hover:bg-gray-800 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </div>
              </Link>
            ),
          )}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-gray-800 bg-gray-900">
          <div className="border-b border-gray-800 px-5 py-4">
            <h2 className="text-base font-semibold text-white">최근 등록한 방송인 고객</h2>
          </div>
          {recentTalents.length === 0 ? (
            <div className="px-5 py-10 text-sm text-gray-500">아직 등록된 방송인 고객이 없습니다.</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {recentTalents.map((talent) => (
                <Link
                  key={talent.id}
                  href={`/app/builder/${talent.id}`}
                  className="flex items-center justify-between px-5 py-4 transition hover:bg-gray-800/40"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{talent.nameKo}</p>
                    <p className="text-xs text-gray-500">{talent.position || "포지션 미정"}</p>
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(talent.updatedAt)}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900">
          <div className="border-b border-gray-800 px-5 py-4">
            <h2 className="text-base font-semibold text-white">최근 공개한 PR 홈페이지</h2>
          </div>
          {recentPages.length === 0 ? (
            <div className="px-5 py-10 text-sm text-gray-500">아직 공개된 PR 홈페이지가 없습니다.</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {recentPages.map((page) => (
                <Link
                  key={page.id}
                  href={`/p/${page.slug}`}
                  className="flex items-center justify-between px-5 py-4 transition hover:bg-gray-800/40"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{page.project.talent.nameKo}</p>
                    <p className="text-xs text-gray-500">/p/{page.slug}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {page.publishedAt ? formatDate(page.publishedAt) : "공개일 미정"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
