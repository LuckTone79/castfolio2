import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

const statusConfig: Record<string, { label: string; cls: string }> = {
  NEW:                  { label: "신규",     cls: "badge-gray" },
  COLLECTING_MATERIALS: { label: "자료수집", cls: "badge-amber" },
  DRAFTING:             { label: "제작중",   cls: "badge-blue" },
  UNDER_REVIEW:         { label: "검토중",   cls: "badge-violet" },
  READY_FOR_DELIVERY:   { label: "납품준비", cls: "badge-emerald" },
  DELIVERED:            { label: "납품완료", cls: "badge-emerald" },
  CLOSED:               { label: "종료",     cls: "badge-gray" },
  DISPUTED:             { label: "분쟁",     cls: "badge-red" },
};

const pageStatusConfig: Record<string, { label: string; cls: string }> = {
  DRAFT:     { label: "초안",   cls: "badge-gray" },
  PREVIEW:   { label: "프리뷰", cls: "badge-amber" },
  PUBLISHED: { label: "공개",   cls: "badge-emerald" },
  INACTIVE:  { label: "비활성", cls: "badge-red" },
};

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const ArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default async function DashboardHomePage() {
  const user = await requireUser();

  const [projects, pendingOrders, paidOrdersThisMonth] = await Promise.all([
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
  ]);

  const monthlyRevenue = paidOrdersThisMonth.reduce((acc, o) => acc + Number(o.totalAmount), 0);
  const monthlyCommission = paidOrdersThisMonth.reduce((acc, o) => acc + Number(o.commissionAmount), 0);

  const recentProjects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 6,
    include: {
      talent: { select: { nameKo: true } },
      page: { select: { status: true } },
    },
  });

  const kpis = [
    {
      label: "진행 중 프로젝트",
      value: String(projects),
      sub: "활성 프로젝트",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
        </svg>
      ),
      color: "#7C5CFC",
      href: "/dashboard/projects",
    },
    {
      label: "결제 대기",
      value: String(pendingOrders),
      sub: "처리 필요",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <path d="M2 10h20"/>
          <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none"/>
        </svg>
      ),
      color: "#F59E0B",
      href: "/dashboard/quotes",
    },
    {
      label: "이번 달 매출",
      value: formatCurrency(monthlyRevenue),
      sub: "총 결제 금액",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
          <polyline points="16 7 22 7 22 13"/>
        </svg>
      ),
      color: "#10B981",
      href: "/dashboard/settlements",
    },
    {
      label: "이번 달 수수료",
      value: formatCurrency(monthlyCommission),
      sub: "플랫폼 수수료 15%",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 12h8M12 8v8"/>
        </svg>
      ),
      color: "#EC4899",
      href: "/dashboard/settlements",
    },
    {
      label: "판매 건수",
      value: String(paidOrdersThisMonth.length),
      sub: "이번 달 완료",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
      color: "#06B6D4",
      href: "/dashboard/quotes",
    },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>
            안녕하세요, {user.name}님
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            오늘도 좋은 하루 되세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/talents/new"
            className="btn-ghost flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold"
          >
            <PlusIcon /> 방송인
          </Link>
          <Link
            href="/dashboard/projects/new"
            className="btn-primary flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs"
            style={{ background: "var(--accent)" }}
          >
            <PlusIcon /> 프로젝트
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((kpi, i) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className={`card-hover rounded-xl p-4 fade-in-${i + 1}`}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              textDecoration: "none",
            }}
          >
            <div
              className="rounded-lg flex items-center justify-center mb-3"
              style={{
                width: 34,
                height: 34,
                background: `${kpi.color}15`,
                color: kpi.color,
              }}
            >
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

      {/* Recent projects */}
      <div
        className="rounded-2xl overflow-hidden fade-in-3"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            최근 프로젝트
          </h2>
          <Link
            href="/dashboard/projects"
            className="flex items-center gap-1 text-xs transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#A78BFA")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            전체 보기 <ArrowRight />
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="py-14 text-center">
            <div
              className="mx-auto mb-3 rounded-xl flex items-center justify-center"
              style={{ width: 48, height: 48, background: "var(--bg-elevated)", color: "var(--text-muted)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
              </svg>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              프로젝트가 없습니다
            </p>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>첫 프로젝트를 생성해보세요.</p>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg transition-colors"
              style={{ color: "#A78BFA", background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.2)" }}
            >
              <PlusIcon /> 프로젝트 생성
            </Link>
          </div>
        ) : (
          <div>
            {recentProjects.map((p, i) => {
              const status = statusConfig[p.status] ?? { label: p.status, cls: "badge-gray" };
              const pageStatus = p.page ? pageStatusConfig[p.page.status] ?? { label: p.page.status, cls: "badge-gray" } : null;
              return (
                <Link
                  key={p.id}
                  href={`/dashboard/projects/${p.id}`}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors group"
                  style={{
                    borderBottom: i < recentProjects.length - 1 ? "1px solid var(--border-subtle)" : "none",
                    textDecoration: "none",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-elevated)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {p.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {p.talent.nameKo}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {pageStatus && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pageStatus.cls}`}>
                        {pageStatus.label}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.cls}`}>
                      {status.label}
                    </span>
                    <ArrowRight />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
