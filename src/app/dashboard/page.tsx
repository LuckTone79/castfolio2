import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui";
import { Users, FolderKanban, Globe, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();

  const [talentCount, projectCount, publishedCount, orderCount, recentProjects] = await Promise.all([
    prisma.talent.count({ where: { userId: user.id, status: "ACTIVE" } }),
    prisma.project.count({ where: { userId: user.id } }),
    prisma.page.count({ where: { project: { userId: user.id }, status: "PUBLISHED" } }),
    prisma.order.count({ where: { userId: user.id } }),
    prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { talent: { select: { nameKo: true } }, page: { select: { status: true } } },
    }),
  ]);

  return (
    <>
      <PageHeader title="대시보드" description="전체 현황을 한눈에 확인하세요" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="탤런트" value={talentCount} icon={Users} />
        <StatCard label="프로젝트" value={projectCount} icon={FolderKanban} />
        <StatCard label="발행 페이지" value={publishedCount} icon={Globe} />
        <StatCard label="주문" value={orderCount} icon={ShoppingCart} />
      </div>

      {/* Recent Projects */}
      <div className="rounded-xl border border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">최근 프로젝트</h2>
          <Link href="/dashboard/projects" className="text-sm text-gray-400 hover:text-white transition-colors">
            전체 보기 →
          </Link>
        </div>
        {recentProjects.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            아직 프로젝트가 없습니다.{" "}
            <Link href="/dashboard/projects" className="text-white hover:underline">
              첫 프로젝트를 만들어보세요
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {recentProjects.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/projects/${p.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-800/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-white">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.talent.nameKo}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={p.status} />
                  <p className="text-xs text-gray-600 mt-0.5">{formatDate(p.updatedAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <QuickAction href="/dashboard/talents" label="+ 탤런트 등록" />
        <QuickAction href="/dashboard/projects" label="+ 프로젝트 생성" />
        <QuickAction href="/dashboard/quotes/new" label="견적서 작성" />
        <QuickAction href="/guide" label="이용 가이드" />
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    NEW: { label: "신규", color: "text-blue-400" },
    COLLECTING_MATERIALS: { label: "자료수집", color: "text-amber-400" },
    DRAFTING: { label: "제작중", color: "text-purple-400" },
    UNDER_REVIEW: { label: "검수중", color: "text-yellow-400" },
    READY_FOR_DELIVERY: { label: "납품준비", color: "text-emerald-400" },
    DELIVERED: { label: "납품완료", color: "text-green-400" },
    CLOSED: { label: "완료", color: "text-gray-400" },
  };
  const s = map[status] || { label: status, color: "text-gray-400" };
  return <span className={`text-xs font-medium ${s.color}`}>{s.label}</span>;
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 hover:border-gray-700 transition-colors"
    >
      {label}
    </Link>
  );
}
