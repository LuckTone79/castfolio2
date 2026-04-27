import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTheme } from "@/themes";
import { PRPageRenderer } from "@/components/pr-page/PRPageRenderer";
import { PageContent } from "@/types/page-content";
import { cookies } from "next/headers";

interface Props {
  params: { previewToken: string };
  searchParams: { hl?: string };
}

export const metadata = {
  robots: { index: false },
};

export default async function PreviewPage({ params, searchParams }: Props) {
  const page = await prisma.page.findUnique({
    where: { previewToken: params.previewToken },
    include: { project: { include: { talent: true } } },
  });

  if (!page || page.status !== "PREVIEW") notFound();

  const cookieStore = cookies();
  const localeOptions = ["ko", "en", "zh"];
  let locale = "ko";
  const hl = searchParams.hl;
  if (hl && localeOptions.includes(hl)) locale = hl;
  else {
    const cfLocale = cookieStore.get("cf_locale")?.value;
    if (cfLocale && localeOptions.includes(cfLocale)) locale = cfLocale;
  }

  const theme = getTheme(page.theme);
  const talent = page.project.talent;

  const contentMap: Record<string, object> = {
    ko: page.contentKo as object,
    en: page.contentEn as object,
    zh: page.contentCn as object,
  };

  const rawContent = (contentMap[locale] || page.contentKo) as Partial<PageContent>;
  const content: PageContent = {
    hero: { tagline: "", position: "", heroImageId: "", ctaPrimary: { label: "포트폴리오 보기", action: "portfolio" }, ctaSecondary: { label: "연락하기", action: "contact" }, ...(rawContent.hero || {}) },
    profile: { intro: "", profileImageId: "", infoItems: [], strengths: [], ...(rawContent.profile || {}) },
    career: { items: [], ...(rawContent.career || {}) },
    portfolio: { videos: [], photos: [], audioSamples: [], ...(rawContent.portfolio || {}) },
    strength: { cards: [], ...(rawContent.strength || {}) },
    contact: { channels: [], ...(rawContent.contact || {}) },
  };

  const heroImageUrl = content.hero.heroImageId
    ? (await prisma.mediaAsset.findUnique({ where: { id: content.hero.heroImageId } }))?.optimizedUrl || undefined
    : undefined;

  const profileImageUrl = content.profile.profileImageId
    ? (await prisma.mediaAsset.findUnique({ where: { id: content.profile.profileImageId } }))?.optimizedUrl || undefined
    : undefined;

  const talentName = locale === "en" ? talent.nameEn : locale === "zh" ? (talent.nameCn || talent.nameKo) : talent.nameKo;

  return (
    <div>
      {/* Preview banner */}
      <div className="sticky top-0 z-50 bg-yellow-400 text-yellow-900 text-sm text-center py-2 font-medium">
        ⚠️ 이 페이지는 미리보기입니다. 정식 배포 전입니다.
      </div>

      <PRPageRenderer
        content={content}
        theme={theme}
        accentColor={page.accentColor || undefined}
        talentName={talentName}
        talentNameEn={talent.nameEn}
        sectionOrder={page.sectionOrder}
        disabledSections={page.disabledSections}
        showPhone={page.showPhone}
        emailBotProtect={page.emailBotProtect}
        heroImageUrl={heroImageUrl}
        profileImageUrl={profileImageUrl}
        watermark={true}
        locale={locale}
      />
    </div>
  );
}
