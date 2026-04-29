import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { requireAdminProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminPagesPage() {
  await requireAdminProfile();

  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      project: { include: { talent: true, user: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="전체 페이지 관리"
        description="파트너가 제작한 PR 페이지의 공개 상태와 소속 계정을 한 번에 모니터링합니다."
      />

      <div className="rounded-2xl border border-gray-800 bg-gray-900">
        {pages.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">등록된 PR 페이지가 없습니다.</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {pages.map((page) => (
              <div key={page.id} className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{page.project.talent.nameKo}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    파트너 {page.project.user.name} · 상태 {page.status} · 슬러그 {page.slug}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xs text-gray-500">{formatDate(page.updatedAt)}</p>
                  <Link
                    href={`/p/${page.slug}`}
                    className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-200 transition hover:bg-gray-800"
                  >
                    공개 페이지 보기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
