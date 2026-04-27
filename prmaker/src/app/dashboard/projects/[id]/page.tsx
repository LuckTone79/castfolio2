import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Props { params: { id: string } }

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

const orderStatusConfig: Record<string, { label: string; cls: string }> = {
  DRAFT:           { label: "초안",     cls: "badge-gray" },
  PAYMENT_PENDING: { label: "결제대기", cls: "badge-amber" },
  PAID:            { label: "결제완료", cls: "badge-blue" },
  DELIVERED:       { label: "납품완료", cls: "badge-emerald" },
  SETTLED:         { label: "정산완료", cls: "badge-emerald" },
  CANCELLED:       { label: "취소",     cls: "badge-gray" },
  REFUNDED:        { label: "환불",     cls: "badge-red" },
};

const verifyConfig: Record<string, { label: string; cls: string }> = {
  APPROVED:           { label: "승인됨",      cls: "badge-emerald" },
  REVISION_REQUESTED: { label: "수정 요청됨", cls: "badge-amber" },
  PENDING:            { label: "미검토",      cls: "badge-gray" },
};

export default async function ProjectDetailPage({ params }: Props) {
  const user = await requireUser();
  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      talent: true,
      page: { include: { qrAssets: { take: 1 } } },
      intakeForms: {
        include: { submissions: { orderBy: { createdAt: "desc" }, take: 1 } },
        orderBy: { createdAt: "desc" }, take: 1,
      },
      quotes: { orderBy: { createdAt: "desc" }, take: 3 },
      orders: { orderBy: { createdAt: "desc" }, take: 3 },
      timeline: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!project) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const previewUrl = project.page ? `${appUrl}/preview/${project.page.previewToken}` : null;
  const publicUrl = project.page?.status === "PUBLISHED" ? `${appUrl}/p/${project.page.slug}` : null;

  const ps  = statusConfig[project.status] ?? { label: project.status, cls: "badge-gray" };
  const pgs = project.page ? (pageStatusConfig[project.page.status] ?? { label: project.page.status, cls: "badge-gray" }) : null;
  const vs  = verifyConfig[project.verificationStatus] ?? verifyConfig.PENDING;

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: "var(--text-muted)" }}>
            <Link href="/dashboard/projects" style={{ color: "var(--text-muted)" }}>프로젝트</Link>
            <span>/</span>
            <span style={{ color: "var(--text-secondary)" }}>{project.name}</span>
          </div>
          <h1 className="font-bold text-xl mb-1" style={{ color: "var(--text-primary)" }}>{project.name}</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{project.talent.nameKo} · {project.talent.position}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ps.cls}`}>{ps.label}</span>
          {pgs && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pgs.cls}`}>{pgs.label}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 fade-in-1">
        <Link href={`/dashboard/builder/${project.id}`} className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm" style={{ background: "var(--accent)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          빌더 열기
        </Link>
        {project.page?.status === "PREVIEW" && previewUrl && (
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            미리보기
          </a>
        )}
        {project.page?.status === "PUBLISHED" && publicUrl && (
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "rgba(16,185,129,0.12)", color: "#6EE7B7", border: "1px solid rgba(16,185,129,0.2)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
            공개 페이지
          </a>
        )}
        <Link href={`/dashboard/quotes/new?projectId=${project.id}`} className="btn-ghost flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16l2.5-1.5L9 20l2.5-1.5L14 20l2.5-1.5L19 20V8z"/></svg>
          견적 생성
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left */}
        <div className="space-y-4">
          <div className="rounded-2xl p-5 fade-in-2" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>자료 수집</h2>
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>수집 방식</span>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {project.intakeMode === "SELF_SUBMISSION" ? "직접 제출" : project.intakeMode === "OPERATOR_ENTRY" ? "대행 입력" : "혼합"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>검토 상태</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${vs.cls}`}>{vs.label}</span>
              </div>
              {project.intakeForms.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>제출 상태</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${project.intakeForms[0].submissions.length > 0 ? "badge-emerald" : "badge-gray"}`}>
                    {project.intakeForms[0].submissions.length > 0 ? "제출 완료" : "미제출"}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <Link href={`/dashboard/intake?projectId=${project.id}`} className="text-xs" style={{ color: "#A78BFA" }}>자료 요청 생성 →</Link>
            </div>
          </div>

          {project.page && (
            <div className="rounded-2xl p-5 fade-in-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>페이지 상태</h2>
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>상태</span>
                  {pgs && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pgs.cls}`}>{pgs.label}</span>}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>테마</span>
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{project.page.theme}</span>
                </div>
                {project.page.publishedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>배포일</span>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{new Date(project.page.publishedAt).toLocaleDateString("ko-KR")}</span>
                  </div>
                )}
                {project.page.viewsCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>조회수</span>
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{project.page.viewsCount.toLocaleString()}</span>
                  </div>
                )}
              </div>
              {previewUrl && project.page.status === "PREVIEW" && (
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>미리보기 링크</p>
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-xs truncate block" style={{ color: "#A78BFA" }}>{previewUrl}</a>
                </div>
              )}
            </div>
          )}

          {project.quotes.length > 0 && (
            <div className="rounded-2xl p-5 fade-in-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>견적</h2>
              <div className="space-y-2">
                {project.quotes.map(q => {
                  const qs = ({ DRAFT: "badge-gray", SENT: "badge-blue", ACCEPTED: "badge-emerald", EXPIRED: "badge-gray", REJECTED: "badge-red" } as Record<string,string>)[q.status] || "badge-gray";
                  return (
                    <div key={q.id} className="flex justify-between items-center">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(q.createdAt).toLocaleDateString("ko-KR")}</span>
                      <span className="text-sm font-medium text-gradient-amber">{formatCurrency(Number(q.totalAmount))}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${qs}`}>{q.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {project.orders.length > 0 && (
            <div className="rounded-2xl p-5 fade-in-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>주문</h2>
              <div className="space-y-2">
                {project.orders.map(o => {
                  const os = orderStatusConfig[o.status] ?? { label: o.status, cls: "badge-gray" };
                  return (
                    <div key={o.id} className="flex justify-between items-center">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{o.orderNumber}</span>
                      <span className="text-sm font-medium text-gradient-amber">{formatCurrency(Number(o.totalAmount))}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${os.cls}`}>{os.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="rounded-2xl p-5 fade-in-2" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--text-muted)" }}>활동 타임라인</h2>
          {project.timeline.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>활동 내역이 없습니다.</p>
          ) : (
            <div>
              {project.timeline.map((event, i) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full flex-shrink-0" style={{ width: 7, height: 7, background: "#7C5CFC", marginTop: 5 }} />
                    {i < project.timeline.length - 1 && (
                      <div className="flex-1 my-1" style={{ width: 1, background: "var(--border-subtle)" }} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{event.description}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {event.actorName && `${event.actorName} · `}
                      {new Date(event.createdAt).toLocaleString("ko-KR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
