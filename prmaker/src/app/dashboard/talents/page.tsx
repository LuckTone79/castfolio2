import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { IntakeLinkButton } from "@/components/dashboard/IntakeLinkButton";
import { PublishedPageLinkButton } from "@/components/dashboard/PublishedPageLinkButton";

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const projectStatusLabel: Record<string, string> = {
  NEW: "신규",
  COLLECTING_MATERIALS: "자료 수집",
  DRAFTING: "제작 중",
  UNDER_REVIEW: "검토 중",
  READY_FOR_DELIVERY: "납품 준비",
  DELIVERED: "납품 완료",
  CLOSED: "종료",
  DISPUTED: "이슈",
};

export default async function TalentsPage() {
  const user = await requireUser();
  const talents = await prisma.talent.findMany({
    where: { userId: user.id, status: { not: "DELETED" } },
    orderBy: { updatedAt: "desc" },
    include: {
      projects: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: { page: { select: { slug: true, status: true } } },
      },
      _count: { select: { projects: true } },
    },
  });

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>방송인 관리</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            방송인 고객 등록, 자료 수집, 페이지 제작과 게시 링크까지 한 흐름으로 관리합니다.
          </p>
        </div>
        <Link href="/dashboard/talents/new" className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm" style={{ background: "var(--accent)" }}>
          <PlusIcon /> 새 방송인 등록
        </Link>
      </div>

      {talents.length === 0 ? (
        <div className="rounded-2xl py-20 text-center" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <div className="mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ width: 56, height: 56, background: "rgba(124,92,252,0.1)", color: "#7C5CFC" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0014 0M12 19v3M8 22h8" />
            </svg>
          </div>
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>등록된 방송인 고객이 없습니다</p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            첫 고객을 등록하면 자료 요청, 제작, 납품 흐름을 시작할 수 있습니다.
          </p>
          <Link href="/dashboard/talents/new" className="btn-primary inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm" style={{ background: "var(--accent)" }}>
            <PlusIcon /> 첫 고객 등록하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {talents.map((talent, index) => {
            const latestProject = talent.projects[0];
            const latestPage = latestProject?.page;
            const projectStatus = latestProject ? projectStatusLabel[latestProject.status] ?? latestProject.status : "프로젝트 없음";
            const intakeStatus = latestProject?.status === "COLLECTING_MATERIALS" ? "자료 요청 중" : talent._count.projects > 0 ? "진행 중" : "미요청";

            return (
              <div
                key={talent.id}
                className={`rounded-2xl p-5 card-hover fade-in-${Math.min(index + 1, 6)}`}
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0"
                      style={{ width: 42, height: 42, background: "linear-gradient(135deg, #4A36B8, #7C5CFC)", color: "#EEF2FF" }}
                    >
                      {talent.nameKo.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{talent.nameKo}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{talent.position}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${talent.status === "ACTIVE" ? "badge-emerald" : "badge-gray"}`}>
                    {talent.status === "ACTIVE" ? "활성" : "비활성"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl px-3 py-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                    <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>자료 상태</p>
                    <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{intakeStatus}</p>
                  </div>
                  <div className="rounded-xl px-3 py-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                    <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>제작 단계</p>
                    <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{projectStatus}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl px-3 py-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: "var(--text-muted)" }}>프로젝트 수</span>
                    <span style={{ color: "#A78BFA", fontWeight: 700 }}>{talent._count.projects}건</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span style={{ color: "var(--text-muted)" }}>게시 페이지</span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {latestPage?.status === "PUBLISHED" ? "공개됨" : "미공개"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    href={`/dashboard/talents/${talent.id}`}
                    className="rounded-xl px-3 py-2.5 text-center text-sm font-medium"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", textDecoration: "none" }}
                  >
                    상세 보기
                  </Link>
                  <Link
                    href={`/dashboard/projects/new?talentId=${talent.id}`}
                    className="rounded-xl px-3 py-2.5 text-center text-sm font-medium"
                    style={{ background: "var(--accent)", color: "white", textDecoration: "none" }}
                  >
                    페이지 제작
                  </Link>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <IntakeLinkButton talentId={talent.id} />
                  {latestPage?.slug && latestPage.status === "PUBLISHED" ? (
                    <PublishedPageLinkButton slug={latestPage.slug} />
                  ) : (
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>게시 링크는 공개 후 복사할 수 있습니다.</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
