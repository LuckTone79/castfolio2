import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await prisma.page.findFirst({
    where: { slug: params.id, status: "PUBLISHED" },
    include: { project: { include: { talent: true } } },
  });
  if (!page) return { title: "Not Found" };

  const talent = page.project.talent;
  return {
    title: `${talent.nameKo} 포트폴리오 갤러리`,
    description: `${talent.nameKo}의 방송 포트폴리오 사진 모음`,
    robots: { index: false }, // Portfolio gallery pages are supplemental
  };
}

export default async function PortfolioGalleryPage({ params }: Props) {
  const page = await prisma.page.findFirst({
    where: { slug: params.id, status: "PUBLISHED" },
    include: { project: { include: { talent: true } } },
  });

  if (!page) notFound();

  const talent = page.project.talent;

  // Load portfolio photo assets from the page's content
  const content = page.contentKo as { portfolio?: { photos?: string[]; videos?: Array<{ url: string; title?: string }> } } | null;
  const photoIds: string[] = content?.portfolio?.photos ?? [];
  const videos: Array<{ url: string; title?: string }> = content?.portfolio?.videos ?? [];

  const photoAssets = photoIds.length > 0
    ? await prisma.mediaAsset.findMany({
        where: { id: { in: photoIds }, projectId: page.projectId },
        orderBy: { createdAt: "asc" },
      })
    : [];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://castfolio.wideget.net";

  return (
    <main className="min-h-screen bg-[#f9f9f7]">
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">포트폴리오 갤러리</p>
            <p className="text-sm font-bold text-slate-900 leading-tight">{talent.nameKo}</p>
          </div>
          <Link
            href={`/p/${page.slug}`}
            className="px-4 py-2 bg-slate-950 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            PR 페이지 보기 →
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* No content fallback */}
        {photoAssets.length === 0 && videos.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <p className="text-4xl mb-3">🎬</p>
            <p className="font-semibold text-slate-600">포트폴리오 콘텐츠가 없습니다</p>
            <p className="text-sm mt-1">PR 페이지에서 더 많은 정보를 확인하세요.</p>
            <Link href={`/p/${page.slug}`} className="inline-block mt-4 text-sm font-semibold text-purple-600 hover:underline">
              {talent.nameKo} PR 페이지 →
            </Link>
          </div>
        )}

        {/* Photo Gallery */}
        {photoAssets.length > 0 && (
          <section className="mb-10">
            <h2 className="text-base font-bold text-slate-900 mb-4">📸 사진 ({photoAssets.length}장)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photoAssets.map((asset, i) => (
                <a
                  key={asset.id}
                  href={asset.originalUrl || asset.optimizedUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100 block"
                >
                  {(asset.optimizedUrl || asset.thumbnailUrl) && (
                    <Image
                      src={asset.thumbnailUrl || asset.optimizedUrl!}
                      alt={`${talent.nameKo} 포트폴리오 ${i + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-2xl" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Video List */}
        {videos.length > 0 && (
          <section className="mb-10">
            <h2 className="text-base font-bold text-slate-900 mb-4">🎬 방송 영상 ({videos.length}건)</h2>
            <div className="space-y-3">
              {videos.map((v, i) => (
                <a
                  key={i}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-black/5 hover:border-black/15 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#EF4444">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {v.title || `영상 ${i + 1}`}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{v.url}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" className="flex-shrink-0 group-hover:stroke-slate-700 transition-colors">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Back to PR page */}
        <div className="text-center pt-4 border-t border-black/5">
          <p className="text-xs text-slate-400 mb-3">더 많은 정보는 PR 페이지에서 확인하세요</p>
          <Link
            href={`/p/${page.slug}`}
            className="inline-block px-6 py-3 bg-slate-950 text-white text-sm font-semibold rounded-2xl hover:bg-slate-800 transition-colors"
          >
            {talent.nameKo} PR 페이지 보기 →
          </Link>
          <p className="text-[10px] text-slate-300 mt-4">Powered by <a href={appUrl} className="hover:underline">Castfolio</a></p>
        </div>
      </div>
    </main>
  );
}
