import Link from "next/link";
import { SquarePen } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { canWrite, requireAgentAppProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Props {
  params: { talentId: string };
}

export default async function AppBuilderPage({ params }: Props) {
  const profile = await requireAgentAppProfile();
  const talent = await prisma.talent.findFirst({
    where: { id: params.talentId, userId: profile.id },
    include: {
      projects: {
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: { page: true },
      },
    },
  });

  if (!talent) {
    notFound();
  }

  const writeEnabled = canWrite(profile);

  return (
    <>
      <PageHeader
        title={`${talent.nameKo} PR 빌더`}
        description="선택한 방송인 고객의 프로젝트 상태와 페이지 제작 진입점을 이곳에서 관리합니다."
        breadcrumbs={[
          { label: "방송인 고객", href: "/app/talents" },
          { label: talent.nameKo },
        ]}
      />

      <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">{talent.nameKo}</p>
            <p className="mt-2 text-sm text-gray-400">{talent.position || "포지션 정보가 아직 없습니다."}</p>
            <p className="mt-2 text-xs text-gray-500">
              프로젝트 {talent.projects.length}건 · 연락처 {talent.email || talent.phone || "미등록"}
            </p>
          </div>
          {writeEnabled ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-gray-100"
              >
                <SquarePen className="h-4 w-4" />
                새 빌더 세션 열기
              </Link>
              {talent.projects[0] && (
                <Link
                  href={`/dashboard/builder/${talent.projects[0].id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-100 transition hover:bg-gray-800"
                >
                  <SquarePen className="h-4 w-4" />
                  최근 프로젝트 이어서 열기
                </Link>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100">
              현재는 페이지 생성과 공개 작업이 제한됩니다.
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {talent.projects.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-gray-950 px-4 py-5 text-sm text-gray-500">
              아직 연결된 프로젝트가 없습니다. 자료 수집과 제작 흐름이 이어지면 이 고객의 작업 이력이 여기에 표시됩니다.
            </div>
          ) : (
            talent.projects.map((project) => (
              <div key={project.id} className="rounded-xl border border-gray-800 bg-gray-950 px-4 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{project.name}</p>
                    <p className="mt-1 text-xs text-gray-500">상태 {project.status}</p>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <p className="text-xs text-gray-500">
                      {project.page ? `/p/${project.page.slug}` : "아직 공개 페이지가 없습니다."}
                    </p>
                    {writeEnabled && (
                      <Link
                        href={`/dashboard/builder/${project.id}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-200 transition hover:bg-gray-800"
                      >
                        <SquarePen className="h-3.5 w-3.5" />
                        이 프로젝트 열기
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
