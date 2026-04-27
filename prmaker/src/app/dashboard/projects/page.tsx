import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

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

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      talent: { select: { nameKo: true } },
      page: { select: { status: true } },
      orders: { select: { status: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>프로젝트 관리</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>총 {projects.length}개</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm"
          style={{ background: "var(--accent)" }}
        >
          <PlusIcon /> 프로젝트 생성
        </Link>
      </div>

      {projects.length === 0 ? (
        <div
          className="rounded-2xl py-20 text-center"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <div
            className="mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ width: 56, height: 56, background: "rgba(124,92,252,0.1)", color: "#7C5CFC" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
            </svg>
          </div>
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>프로젝트가 없습니다</p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            방송인을 선택하고 첫 프로젝트를 시작해보세요.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="btn-primary inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm"
            style={{ background: "var(--accent)" }}
          >
            <PlusIcon /> 첫 프로젝트 만들기
          </Link>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <table className="w-full table-dark">
            <thead>
              <tr>
                {["프로젝트명", "방송인", "상태", "페이지", "최종수정", "액션"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map(p => {
                const ps = statusConfig[p.status] ?? { label: p.status, cls: "badge-gray" };
                const pgs = p.page
                  ? (pageStatusConfig[p.page.status] ?? { label: p.page.status, cls: "badge-gray" })
                  : null;
                return (
                  <tr key={p.id}>
                    <td>
                      <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                    </td>
                    <td>{p.talent.nameKo}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ps.cls}`}>
                        {ps.label}
                      </span>
                    </td>
                    <td>
                      {pgs ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pgs.cls}`}>
                          {pgs.label}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>미생성</span>
                      )}
                    </td>
                    <td>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {new Date(p.updatedAt).toLocaleDateString("ko-KR")}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/projects/${p.id}`}
                        className="text-xs font-medium"
                        style={{ color: "#A78BFA" }}
                      >
                        상세
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
