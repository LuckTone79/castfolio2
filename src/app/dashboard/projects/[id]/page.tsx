import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, Stepper, Button } from "@/components/ui";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink, Edit3, Eye, Send, Clock } from "lucide-react";

const PROJECT_STEPS = ["등록", "자료수집", "제작", "검수", "납품"];
const STATUS_TO_STEP: Record<string, number> = {
  NEW: 0,
  COLLECTING_MATERIALS: 1,
  DRAFTING: 2,
  UNDER_REVIEW: 3,
  READY_FOR_DELIVERY: 4,
  DELIVERED: 5,
  CLOSED: 5,
};

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      talent: true,
      page: true,
      orders: { orderBy: { createdAt: "desc" }, take: 5 },
      timeline: { orderBy: { createdAt: "desc" }, take: 10 },
      intakeForms: { select: { id: true, token: true } },
    },
  });

  if (!project) notFound();

  const currentStep = STATUS_TO_STEP[project.status] ?? 0;

  return (
    <>
      <PageHeader
        title={project.name}
        description={`${project.talent.nameKo} · ${project.talent.position || "방송인"}`}
        breadcrumbs={[
          { label: "프로젝트", href: "/dashboard/projects" },
          { label: project.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {project.page ? (
              <Link href={`/dashboard/builder/${project.id}`}>
                <Button variant="secondary" size="sm"><Edit3 size={14} /> 빌더 열기</Button>
              </Link>
            ) : (
              <Link href={`/dashboard/builder/${project.id}`}>
                <Button size="sm"><Edit3 size={14} /> 페이지 만들기</Button>
              </Link>
            )}
            {project.page?.status === "PUBLISHED" && project.page.slug && (
              <Link href={`/p/${project.page.slug}`} target="_blank">
                <Button variant="ghost" size="sm"><ExternalLink size={14} /> 보기</Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Stepper */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 mb-6">
        <Stepper steps={PROJECT_STEPS} current={currentStep} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info */}
        <div className="space-y-6">
          {/* Project Info */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-3">프로젝트 정보</h3>
            <dl className="space-y-2.5">
              <Row label="상태"><Badge color="blue">{project.status}</Badge></Row>
              <Row label="탤런트">{project.talent.nameKo}</Row>
              <Row label="목적">{project.purpose || "-"}</Row>
              <Row label="생성일">{formatDate(project.createdAt)}</Row>
              <Row label="수정일">{formatDate(project.updatedAt)}</Row>
            </dl>
          </div>

          {/* Page Status */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-3">페이지</h3>
            {project.page ? (
              <dl className="space-y-2.5">
                <Row label="상태">
                  <Badge color={project.page.status === "PUBLISHED" ? "green" : "gray"}>
                    {project.page.status}
                  </Badge>
                </Row>
                <Row label="테마">{project.page.theme || "기본"}</Row>
                {project.page.slug && <Row label="URL">/p/{project.page.slug}</Row>}
                {project.page.publishedAt && <Row label="발행일">{formatDate(project.page.publishedAt)}</Row>}
              </dl>
            ) : (
              <p className="text-sm text-gray-500">아직 페이지가 생성되지 않았습니다</p>
            )}
          </div>

          {/* Intake Forms */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-3">자료수집 폼</h3>
            {project.intakeForms.length === 0 ? (
              <p className="text-sm text-gray-500">인테이크 폼 없음</p>
            ) : (
              <div className="space-y-2">
                {project.intakeForms.map((f) => (
                  <div key={f.id} className="flex items-center justify-between text-sm">
                    <span className="text-xs text-gray-500 font-mono">{f.token.slice(0, 8)}...</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Timeline & Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Orders */}
          {project.orders.length > 0 && (
            <div className="rounded-xl border border-gray-800 bg-gray-900">
              <div className="px-5 py-4 border-b border-gray-800">
                <h3 className="text-base font-semibold text-white">주문</h3>
              </div>
              <div className="divide-y divide-gray-800">
                {project.orders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/dashboard/orders/${o.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-800/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{o.orderNumber}</p>
                      <p className="text-xs text-gray-500">{formatDate(o.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{formatCurrency(o.totalAmount.toString())}</p>
                      <Badge color={o.status === "PAID" ? "green" : o.status === "DELIVERED" ? "green" : "yellow"}>
                        {o.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <h3 className="text-base font-semibold text-white mb-4">타임라인</h3>
            {project.timeline.length === 0 ? (
              <p className="text-sm text-gray-500">아직 활동 기록이 없습니다</p>
            ) : (
              <div className="space-y-4">
                {project.timeline.map((event, i) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-gray-600 mt-2" />
                      {i < project.timeline.length - 1 && <div className="w-px flex-1 bg-gray-800" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm text-white">{event.event}</p>
                      {event.description && <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>}
                      <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                        <Clock size={12} /> {formatDate(event.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-white">{children}</dd>
    </div>
  );
}
