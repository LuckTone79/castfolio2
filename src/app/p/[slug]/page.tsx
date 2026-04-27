import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRPageRenderer } from "@/components/page/pr-page-renderer";
import { prisma } from "@/lib/prisma";
import type { PageContent } from "@/types/page-content";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug, status: "PUBLISHED" },
    include: { project: { include: { talent: true } } },
  });

  if (!page) {
    return { title: "페이지를 찾을 수 없습니다" };
  }

  const talent = page.project.talent;
  const content = (page.contentKo || page.draftContent) as unknown as PageContent;

  return {
    title: `${talent.nameKo} | ${content?.hero?.position || "방송인 PR 페이지"}`,
    description: content?.hero?.tagline || `${talent.nameKo} PR 페이지`,
    openGraph: { images: page.ogImageUrl ? [page.ogImageUrl] : [] },
    robots: page.noindex ? "noindex, nofollow" : "index, follow",
  };
}

export default async function PRPublicPage({ params }: Props) {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug, status: "PUBLISHED" },
    include: {
      project: {
        include: {
          talent: true,
          mediaAssets: true,
        },
      },
    },
  });

  if (!page) {
    notFound();
  }

  prisma.page
    .update({ where: { id: page.id }, data: { viewsCount: { increment: 1 } } })
    .catch(() => {});

  const content = (page.contentKo || page.draftContent) as unknown as PageContent;
  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-sm text-gray-500">
        콘텐츠를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <PRPageRenderer
      themeId={page.theme}
      accentColor={page.accentColor}
      content={content}
      talentNameKo={page.project.talent.nameKo}
      talentNameEn={page.project.talent.nameEn}
      sectionOrder={page.sectionOrder}
      disabledSections={page.disabledSections}
      mediaAssets={page.project.mediaAssets}
    />
  );
}
