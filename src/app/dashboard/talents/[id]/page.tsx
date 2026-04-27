import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Mail, Phone, MessageCircle } from "lucide-react";

export default async function TalentDetailPage({ params }: { params: { id: string } }) {
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

  return (
    <>
      <PageHeader
        title={talent.nameKo}
        description={talent.position || undefined}
        breadcrumbs={[
          { label: "탤런트", href: "/dashboard/talents" },
          { label: talent.nameKo },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">프로필 정보</h3>
          <dl className="space-y-3">
            <InfoRow label="한글 이름" value={talent.nameKo} />
            <InfoRow label="영문 이름" value={talent.nameEn || "-"} />
            <InfoRow label="중문 이름" value={talent.nameCn || "-"} />
            <InfoRow label="포지션" value={talent.position || "-"} />
            <InfoRow label="상태">
              <Badge color={talent.status === "ACTIVE" ? "green" : "gray"}>
                {talent.status === "ACTIVE" ? "활성" : "비활성"}
              </Badge>
            </InfoRow>
            <InfoRow label="등록일" value={formatDate(talent.createdAt)} />
          </dl>

          {/* Contact */}
          <h3 className="text-sm font-medium text-gray-400 mt-6 mb-3">연락처</h3>
          <div className="space-y-2">
            {talent.email && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Mail size={14} className="text-gray-500" /> {talent.email}
              </div>
            )}
            {talent.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Phone size={14} className="text-gray-500" /> {talent.phone}
              </div>
            )}
            {talent.kakaoId && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <MessageCircle size={14} className="text-gray-500" /> {talent.kakaoId}
              </div>
            )}
          </div>
        </div>

        {/* Projects */}
        <div className="lg:col-span-2 rounded-xl border border-gray-800 bg-gray-900">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h3 className="text-base font-semibold text-white">프로젝트 ({talent.projects.length})</h3>
          </div>
          {talent.projects.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">아직 프로젝트가 없습니다</p>
          ) : (
            <div className="divide-y divide-gray-800">
              {talent.projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/projects/${p.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-800/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    <p className="text-xs text-gray-500">{formatDate(p.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">{p.status}</span>
                    {p.page?.slug && (
                      <p className="text-xs text-emerald-400">/{p.page.slug}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-white">{children || value}</dd>
    </div>
  );
}
