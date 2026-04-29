import { requireUser } from "@/lib/auth";
import { IntakeLinkButton } from "@/components/dashboard/IntakeLinkButton";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export default async function TalentsPage() {
  const user = await requireUser();
  const talents = await prisma.talent.findMany({
    where: { userId: user.id, status: { not: "DELETED" } },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { projects: true } } },
  });

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>방송인 관리</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>총 {talents.length}명 등록</p>
        </div>
        <Link
          href="/dashboard/talents/new"
          className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm"
          style={{ background: "var(--accent)" }}
        >
          <PlusIcon /> 방송인 등록
        </Link>
      </div>

      {talents.length === 0 ? (
        <div
          className="rounded-2xl py-20 text-center"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <div
            className="mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ width: 56, height: 56, background: "rgba(124,92,252,0.1)", color: "#7C5CFC" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3"/>
              <path d="M5 10a7 7 0 0014 0M12 19v3M8 22h8"/>
            </svg>
          </div>
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>등록된 방송인이 없습니다</p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            방송인을 등록하고 PR 페이지 제작을 시작하세요.
          </p>
          <Link
            href="/dashboard/talents/new"
            className="btn-primary inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm"
            style={{ background: "var(--accent)" }}
          >
            <PlusIcon /> 첫 방송인 등록하기
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
                {["방송인", "포지션", "프로젝트", "상태", "액션"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {talents.map(t => (
                <tr key={t.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0"
                        style={{
                          width: 32, height: 32,
                          background: "linear-gradient(135deg, #4A36B8, #7C5CFC)",
                          color: "#EEF2FF",
                        }}
                      >
                        {t.nameKo.slice(0, 1)}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{t.nameKo}</p>
                        {t.nameEn && (
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.nameEn}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{t.position}</td>
                  <td>
                    <span
                      className="inline-flex items-center justify-center rounded-full font-semibold text-xs"
                      style={{ width: 24, height: 24, background: "rgba(124,92,252,0.15)", color: "#A78BFA" }}
                    >
                      {t._count.projects}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.status === "ACTIVE" ? "badge-emerald" : "badge-gray"}`}>
                      {t.status === "ACTIVE" ? "활성" : "비활성"}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/dashboard/talents/${t.id}`}
                        className="text-xs font-medium"
                        style={{ color: "#A78BFA" }}
                      >
                        상세
                      </Link>
                      <IntakeLinkButton talentId={t.id} />
                      <Link
                        href={`/dashboard/projects/new?talentId=${t.id}`}
                        className="text-xs font-medium"
                        style={{ color: "var(--text-muted)" }}
                      >
                        프로젝트
                      </Link>
                    </div>
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
