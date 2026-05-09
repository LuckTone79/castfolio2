import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { IntakeLinkButton } from "@/components/dashboard/IntakeLinkButton";

interface Props {
  params: { id: string };
}

const pageStatusConfig: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "초안", cls: "badge-gray" },
  PREVIEW: { label: "프리뷰", cls: "badge-amber" },
  PUBLISHED: { label: "공개", cls: "badge-emerald" },
  INACTIVE: { label: "비활성", cls: "badge-red" },
};

export default async function TalentDetailPage({ params }: Props) {
  const user = await requireUser();
  const talent = await prisma.talent.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      projects: {
        orderBy: { updatedAt: "desc" },
        include: { page: { select: { status: true, slug: true } } },
      },
    },
  });

  if (!talent) notFound();

  const initials = talent.nameKo.slice(0, 2);
  const contactItems = [
    { label: "이메일", value: talent.email },
    { label: "전화", value: talent.phone },
    { label: "카카오", value: talent.kakaoId },
  ].filter((item) => item.value);

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: "var(--text-muted)" }}>
            <Link href="/dashboard/talents" style={{ color: "var(--text-muted)" }}>방송인 고객</Link>
            <span>/</span>
            <span style={{ color: "var(--text-secondary)" }}>{talent.nameKo}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ width: 48, height: 48, background: "linear-gradient(135deg, #4A36B8 0%, #7C5CFC 100%)", color: "#EEF2FF" }}>
              {initials}
            </div>
            <div>
              <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>{talent.nameKo}</h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {talent.nameEn ? `${talent.nameEn} · ` : ""}{talent.position}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IntakeLinkButton talentId={talent.id} />
          <Link href={`/dashboard/projects/new?talentId=${talent.id}`} className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm" style={{ background: "var(--accent)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            프로젝트 생성
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl p-5 fade-in-1" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>연락처</h2>
          {contactItems.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>등록된 연락처가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {contactItems.map((item) => (
                <div key={item.label} className="flex gap-3">
                  <span className="text-xs w-14 flex-shrink-0 pt-0.5 font-semibold" style={{ color: "var(--text-muted)" }}>{item.label}</span>
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
          {talent.nameCn && (
            <div className="mt-4 pt-4 flex gap-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <span className="text-xs w-14 flex-shrink-0 font-semibold" style={{ color: "var(--text-muted)" }}>중문명</span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{talent.nameCn}</span>
            </div>
          )}
        </div>

        <div className="rounded-2xl p-5 fade-in-2" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
            프로젝트 목록 ({talent.projects.length})
          </h2>
          {talent.projects.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>프로젝트가 없습니다.</p>
              <Link href={`/dashboard/projects/new?talentId=${talent.id}`} className="text-xs" style={{ color: "#A78BFA" }}>
                첫 프로젝트 만들기 →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {talent.projects.map((project) => {
                const pageStatus = project.page ? pageStatusConfig[project.page.status] ?? { label: project.page.status, cls: "badge-gray" } : null;
                return (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-xl transition-colors"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
                  >
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{project.name}</span>
                    {pageStatus && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pageStatus.cls}`}>{pageStatus.label}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
          파트너 운영 흐름
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { title: "1. 자료 요청", desc: "자료 요청 링크를 보내 로그인 없이 사진, 경력, 소개 자료를 수집합니다." },
            { title: "2. PR 홈페이지 제작", desc: "제출 자료를 Builder로 불러와 초안을 만들고 고객 이미지에 맞게 편집합니다." },
            { title: "3. 납품 및 판매 확정", desc: "검토와 납품 후 실제 결제 확인 시 판매 확정을 입력해 정산 흐름으로 넘깁니다." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{item.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
