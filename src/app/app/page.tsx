import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  FileInput,
  FolderKanban,
  PackageCheck,
  ReceiptText,
  SquarePen,
  Users,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui";
import { canWrite, requireAgentAppProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

/** Production pipeline stages in workflow order. */
const PIPELINE = [
  { status: "NEW", label: "신규", tone: "text-sky-300", dot: "bg-sky-400" },
  { status: "COLLECTING_MATERIALS", label: "자료수집", tone: "text-amber-300", dot: "bg-amber-400" },
  { status: "DRAFTING", label: "제작중", tone: "text-violet-300", dot: "bg-violet-400" },
  { status: "UNDER_REVIEW", label: "검수중", tone: "text-yellow-300", dot: "bg-yellow-400" },
  { status: "READY_FOR_DELIVERY", label: "납품준비", tone: "text-emerald-300", dot: "bg-emerald-400" },
  { status: "DELIVERED", label: "납품완료", tone: "text-teal-300", dot: "bg-teal-400" },
] as const;

export default async function AgentDashboardPage() {
  const profile = await requireAgentAppProfile();
  const writeEnabled = canWrite(profile);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    salesAggregate,
    settlementAggregate,
    statusGroups,
    settlementPending,
    publishedCount,
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
    prisma.project.groupBy({
      by: ["status"],
      where: { userId: profile.id },
      _count: { _all: true },
    }),
    prisma.order.count({
      where: { userId: profile.id, status: { in: ["PAID", "DELIVERED"] } },
    }),
    prisma.page.count({
      where: { project: { userId: profile.id }, status: "PUBLISHED" },
    }),
    prisma.talent.findMany({
      where: { userId: profile.id, status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, nameKo: true, position: true, updatedAt: true },
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

  const countOf = (status: string) =>
    statusGroups.find((g) => g.status === status)?._count._all ?? 0;

  const activeProjects = statusGroups
    .filter((g) => !["DELIVERED", "CLOSED", "DISPUTED"].includes(g.status))
    .reduce((sum, g) => sum + g._count._all, 0);

  // "지금 할 일" — only surface stages that actually need partner action.
  const tasks = [
    {
      key: "ready",
      count: countOf("READY_FOR_DELIVERY"),
      icon: PackageCheck,
      title: "납품 준비 완료",
      hint: "고객에게 PR 홈페이지를 전달하세요",
      href: "/app/projects?status=READY_FOR_DELIVERY",
      accent: "emerald" as const,
    },
    {
      key: "review",
      count: countOf("UNDER_REVIEW"),
      icon: ClipboardCheck,
      title: "고객 검토 중",
      hint: "피드백을 확인하고 회신하세요",
      href: "/app/projects?status=UNDER_REVIEW",
      accent: "yellow" as const,
    },
    {
      key: "drafting",
      count: countOf("DRAFTING"),
      icon: SquarePen,
      title: "제작 진행 중",
      hint: "빌더에서 페이지를 완성하세요",
      href: "/app/projects?status=DRAFTING",
      accent: "violet" as const,
    },
    {
      key: "collecting",
      count: countOf("COLLECTING_MATERIALS"),
      icon: FileInput,
      title: "자료 수집 중",
      hint: "고객 자료 제출을 기다리는 중입니다",
      href: "/app/projects?status=COLLECTING_MATERIALS",
      accent: "amber" as const,
    },
    {
      key: "settle",
      count: settlementPending,
      icon: ReceiptText,
      title: "판매·정산 대기",
      hint: "결제 완료 건의 정산을 확인하세요",
      href: "/app/sales",
      accent: "sky" as const,
    },
  ].filter((t) => t.count > 0);

  const accentClass: Record<string, string> = {
    emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
    yellow: "border-yellow-500/30 bg-yellow-500/5 text-yellow-300",
    violet: "border-violet-500/30 bg-violet-500/5 text-violet-300",
    amber: "border-amber-500/30 bg-amber-500/5 text-amber-300",
    sky: "border-sky-500/30 bg-sky-500/5 text-sky-300",
  };

  return (
    <>
      <PageHeader
        title="파트너 대시보드"
        description="자료 수집부터 제작·검수·납품·정산까지 — 지금 처리할 일을 한눈에 확인하세요."
        actions={
          writeEnabled ? (
            <Link
              href="/app/build"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-950 transition hover:bg-gray-100"
            >
              <SquarePen className="h-4 w-4" />
              PR 홈페이지 제작
            </Link>
          ) : undefined
        }
      />

      {/* KPI strip */}
      <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="이번 달 판매금액" value={formatCurrency(salesAggregate._sum.totalAmount?.toString() || "0")} icon={ReceiptText} />
        <StatCard label="예상 정산금" value={formatCurrency(settlementAggregate._sum.userAmount?.toString() || "0")} icon={Wallet} />
        <StatCard label="진행 중 프로젝트" value={activeProjects} icon={FolderKanban} />
        <StatCard label="공개된 PR 홈페이지" value={publishedCount} icon={Users} />
      </div>

      {/* Production pipeline board */}
      <section className="mb-8 rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">제작 파이프라인</h2>
          <Link href="/app/projects" className="inline-flex items-center gap-1 text-sm text-gray-400 transition hover:text-white">
            전체 프로젝트 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {PIPELINE.map((stage, i) => (
            <Link
              key={stage.status}
              href={`/app/projects?status=${stage.status}`}
              className="group relative flex flex-col gap-2 rounded-xl border border-gray-800 bg-gray-950 px-4 py-4 transition hover:border-gray-700 hover:bg-gray-800/50"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${stage.dot}`} />
                <span className="text-xs font-medium text-gray-400">{stage.label}</span>
              </div>
              <span className={`text-2xl font-bold ${stage.tone}`}>{countOf(stage.status)}</span>
              {i < PIPELINE.length - 1 && (
                <ArrowRight className="absolute -right-[7px] top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 text-gray-700 lg:block" />
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Action center: 지금 할 일 */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-white">지금 할 일</h2>
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 px-6 py-10 text-center">
            <PackageCheck className="mx-auto mb-3 h-8 w-8 text-emerald-400/70" />
            <p className="text-sm text-gray-300">처리할 작업이 없습니다.</p>
            <p className="mt-1 text-xs text-gray-500">새 PR 홈페이지 제작을 시작해 보세요.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {tasks.map((task) => (
              <Link
                key={task.key}
                href={task.href}
                className={`flex items-center gap-4 rounded-xl border px-5 py-4 transition hover:brightness-125 ${accentClass[task.accent]}`}
              >
                <task.icon className="h-6 w-6 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{task.title}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold">{task.count}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-400">{task.hint}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-gray-500" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent activity */}
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-gray-800 bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
            <h2 className="text-base font-semibold text-white">최근 등록한 방송인 고객</h2>
            <Link href="/app/talents" className="text-xs text-gray-500 transition hover:text-white">전체보기</Link>
          </div>
          {recentTalents.length === 0 ? (
            <div className="px-5 py-10 text-sm text-gray-500">아직 등록된 방송인 고객이 없습니다.</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {recentTalents.map((talent) => (
                <Link
                  key={talent.id}
                  href={`/app/talents/${talent.id}`}
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
          <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
            <h2 className="text-base font-semibold text-white">최근 공개한 PR 홈페이지</h2>
            <Link href="/app/projects" className="text-xs text-gray-500 transition hover:text-white">전체보기</Link>
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
