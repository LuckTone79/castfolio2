import Link from "next/link";
import { SquarePen, Users } from "lucide-react";
import { IntakeLinkButton } from "@/components/app/intake-link-button";
import { PageHeader } from "@/components/layout/page-header";
import { requireAgentAppProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AppTalentsPage() {
  const profile = await requireAgentAppProfile();
  const talents = await prisma.talent.findMany({
    where: { userId: profile.id, status: { not: "DELETED" } },
    orderBy: { updatedAt: "desc" },
    take: 20,
    include: {
      _count: { select: { projects: true, intakeForms: true } },
      intakeForms: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <>
      <PageHeader
        title="방송인 고객"
        description="고객별 프로필, 진행 상태, 자료 수집 이력을 파트너 관점에서 관리합니다."
      />

      <div className="rounded-2xl border border-gray-800 bg-gray-900">
        {talents.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            아직 등록된 방송인 고객이 없습니다. 고객이 등록되면 이곳에서 제작 흐름을 관리할 수 있습니다.
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {talents.map((talent) => (
              <div key={talent.id} className="flex flex-col gap-4 px-6 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <p className="text-sm font-semibold text-white">{talent.nameKo}</p>
                      <span className="rounded-full border border-gray-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-300">
                        {talent.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-400">{talent.position || "포지션 정보가 아직 없습니다."}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      프로젝트 {talent._count.projects}건 · 자료 요청 {talent._count.intakeForms}건 · 최근 업데이트 {formatDate(talent.updatedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-start gap-3">
                    <IntakeLinkButton talentId={talent.id} />
                    <Link
                      href={`/app/builder/${talent.id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-gray-800"
                    >
                      <SquarePen className="h-4 w-4" />
                      빌더 열기
                    </Link>
                  </div>
                </div>
                {talent.intakeForms[0] && (
                  <div className="rounded-xl bg-gray-950 px-4 py-3 text-xs text-gray-500">
                    최근 자료 요청 링크 발급일 {formatDate(talent.intakeForms[0].createdAt)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
