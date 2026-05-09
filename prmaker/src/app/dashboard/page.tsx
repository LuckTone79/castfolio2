import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

const statusConfig: Record<string, { label: string; cls: string }> = {
  NEW: { label: "신규", cls: "badge-gray" },
  COLLECTING_MATERIALS: { label: "자료 수집", cls: "badge-amber" },
  DRAFTING: { label: "제작 중", cls: "badge-blue" },
  UNDER_REVIEW: { label: "검토 중", cls: "badge-violet" },
  READY_FOR_DELIVERY: { label: "납품 준비", cls: "badge-emerald" },
  DELIVERED: { label: "납품 완료", cls: "badge-emerald" },
  CLOSED: { label: "종료", cls: "badge-gray" },
  DISPUTED: { label: "이슈", cls: "badge-red" },
};

const pageStatusConfig: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "초안", cls: "badge-gray" },
  PREVIEW: { label: "프리뷰", cls: "badge-amber" },
  PUBLISHED: { label: "공개", cls: "badge-emerald" },
  INACTIVE: { label: "비활성", cls: "badge-red" },
};

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default async function DashboardHomePage() {
  const user = await requireUser();

  const [projects, pendingOrders, paidOrdersThisMonth, intakeRequested, reviewProjects, publishedPages, recentTalents] = await Promise.all([
    prisma.project.count({
      where: { userId: user.id, status: { notIn: ["CLOSED", "DELIVERED"] } },
    }),
    prisma.order.count({
      where: { userId: user.id, status: "PAYMENT_PENDING" },
    }),
    prisma.order.findMany({
      where: {
        userId: user.id,
        status: { in: ["PAID", "DELIVERED", "SETTLED"] },
        paidAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      select: { totalAmount: true, commissionAmount: true },
    }),
    prisma.project.count({
      where: { userId: user.id, status: "COLLECTING_MATERIALS" },
    }),
    prisma.project.count({
      where: { userId: user.id, status: "UNDER_REVIEW" },
    }),
    prisma.page.count({
      where: { project: { userId: user.id }, status: "PUBLISHED" },
    }),
    prisma.talent.findMany({
      where: { userId: user.id, status: { not: "DELETED" } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { _count: { select: { projects: true } } },
    }),
  ]);

  const recentProjects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 6,
    include: {
      talent: { select: { nameKo: true } },
      page: { select: { status: true } },
    },
  });

  const monthlyRevenue = paidOrdersThisMonth.reduce((acc, order) => acc + Number(order.totalAmount), 0);
  const monthlyCommission = paidOrdersThisMonth.reduce((acc, order) => acc + Number(order.commissionAmount), 0);
  const expectedSettlement = Math.max(monthlyRevenue - monthlyCommission, 0);

  const kpis = [
    {
      label: "이번 달 판매금액",
      value: formatCurrency(monthlyRevenue),
      sub: "판매 확정 기준",
      color: "#10B981",
      href: "/dashboard/quotes",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      ),
    },
    {
      label: "예상 정산금",
      value: formatCurrency(expectedSettlement),
      sub: "파트너 수익 85%",
      color: "#7C5CFC",
      href: "/dashboard/settlements",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
          <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      label: "자료 제출 대기",
      value: String(intakeRequested),
      sub: "자료 수집 단계",
      color: "#F59E0B",
      href: "/dashboard/intake",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
        </svg>
      ),
    },
    {
      label: "검토 요청 중",
      value: String(reviewProjects),
      sub: "고객 검토 단계",
      color: "#8B5CF6",
      href: "/dashboard/projects",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      label: "판매 확정 대기",
      value: String(pendingOrders),
      sub: "오프라인 확인 포함",
      color: "#EC4899",
      href: "/dashboard/quotes",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
          <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>
            파트너 대시보드
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            방송인 고객 등록부터 자료 수집, PR 홈페이지 제작, 검토, 납품, 판매 확정까지 한곳에서 관리합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/talents/new" className="btn-ghost flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold">
            <PlusIcon /> 고객 추가
          </Link>
          <Link href="/dashboard/projects/new" className="btn-primary flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs" style={{ background: "var(--accent)" }}>
            <PlusIcon /> 새 프로젝트
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((kpi, index) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className={`card-hover rounded-xl p-4 fade-in-${index + 1}`}
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", textDecoration: "none" }}
          >
            <div className="rounded-lg flex items-center justify-center mb-3" style={{ width: 34, height: 34, background: `${kpi.color}15`, color: kpi.color }}>
              {kpi.icon}
            </div>
            <p className="font-bold text-lg leading-none mb-1" style={{ color: "var(--text-primary)" }}>
              {kpi.value}
            </p>
            <p className="text-xs font-medium leading-tight" style={{ color: "var(--text-secondary)" }}>
              {kpi.label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {kpi.sub}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl p-5 fade-in-2" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <div>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              빠른 작업
            </h2>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              복붙 없이 바로 다음 단계로 이어가세요.
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { href: "/dashboard/talents/new", title: "방송인 고객 추가", desc: "새 고객을 등록하고 제작 흐름을 시작합니다." },
              { href: "/dashboard/intake", title: "자료 수집 관리", desc: "제출 링크 발송과 제출 현황 확인을 진행합니다." },
              { href: "/dashboard/projects", title: "PR 빌더 열기", desc: "제작 중인 프로젝트를 이어서 편집합니다." },
              { href: "/dashboard/quotes", title: "판매 관리", desc: "결제 확인과 판매 확정 내역을 처리합니다." },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl p-4 transition-colors"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", textDecoration: "none" }}
              >
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                <p className="mt-1 text-xs leading-6" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5 fade-in-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            이번 달 운영 현황
          </h2>
          <div className="mt-4 space-y-3">
            {[
              { label: "진행 중인 제작 프로젝트", value: String(projects) },
              { label: "공개된 PR 홈페이지", value: String(publishedPages) },
              { label: "판매 완료 건수", value: String(paidOrdersThisMonth.length) },
              { label: "플랫폼 수수료", value: formatCurrency(monthlyCommission) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</span>
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl overflow-hidden fade-in-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              최근 제작 프로젝트
            </h2>
            <Link href="/dashboard/projects" className="flex items-center gap-1 text-xs transition-colors" style={{ color: "var(--text-muted)" }}>
              전체 보기 <ArrowRight />
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="py-14 text-center">
              <div className="mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ width: 48, height: 48, background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                </svg>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                제작 프로젝트가 없습니다
              </p>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                방송인 고객을 등록하고 첫 제작 건을 시작해보세요.
              </p>
              <Link href="/dashboard/projects/new" className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg transition-colors" style={{ color: "#A78BFA", background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.2)" }}>
                <PlusIcon /> 프로젝트 생성
              </Link>
            </div>
          ) : (
            <div>
              {recentProjects.map((project, index) => {
                const status = statusConfig[project.status] ?? { label: project.status, cls: "badge-gray" };
                const pageStatus = project.page ? pageStatusConfig[project.page.status] ?? { label: project.page.status, cls: "badge-gray" } : null;

                return (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center justify-between px-5 py-3.5 transition-colors group"
                    style={{ borderBottom: index < recentProjects.length - 1 ? "1px solid var(--border-subtle)" : "none", textDecoration: "none" }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{project.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{project.talent.nameKo}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {pageStatus && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pageStatus.cls}`}>{pageStatus.label}</span>}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.cls}`}>{status.label}</span>
                      <ArrowRight />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl overflow-hidden fade-in-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              최근 등록한 방송인 고객
            </h2>
            <Link href="/dashboard/talents" className="text-xs" style={{ color: "var(--text-muted)" }}>
              전체 보기
            </Link>
          </div>
          <div>
            {recentTalents.length === 0 ? (
              <div className="px-5 py-10 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                등록된 고객이 없습니다.
              </div>
            ) : (
              recentTalents.map((talent, index) => (
                <Link
                  key={talent.id}
                  href={`/dashboard/talents/${talent.id}`}
                  className="flex items-center justify-between px-5 py-3.5"
                  style={{ borderBottom: index < recentTalents.length - 1 ? "1px solid var(--border-subtle)" : "none", textDecoration: "none" }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{talent.nameKo}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{talent.position}</p>
                  </div>
                  <span className="text-xs" style={{ color: "#A78BFA" }}>
                    프로젝트 {talent._count.projects}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
