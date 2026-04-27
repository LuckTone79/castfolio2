import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTheme } from "@/themes";
import { PRPageRenderer } from "@/components/pr-page/PRPageRenderer";
import { PageContent } from "@/types/page-content";
import { headers } from "next/headers";
import { hashIp } from "@/lib/utils";
import { cookies } from "next/headers";

interface Props {
  params: { slug: string };
  searchParams: { hl?: string };
}

export async function generateMetadata({ params }: Props) {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
    include: { project: { include: { talent: true } } },
  });
  if (!page || page.status !== "PUBLISHED") return { title: "Not Found" };

  const content = page.contentKo as { hero?: { tagline?: string; position?: string } };
  const talent = page.project.talent;

  return {
    title: `${talent.nameKo} | ${content?.hero?.position || "방송인"}`,
    description: content?.hero?.tagline || "",
    openGraph: {
      title: `${talent.nameKo} | ${content?.hero?.position || "방송인"}`,
      description: content?.hero?.tagline || "",
      images: page.ogImageUrl ? [page.ogImageUrl] : [],
      url: `${process.env.NEXT_PUBLIC_APP_URL}/p/${page.slug}`,
    },
    robots: page.noindex ? { index: false } : { index: true },
  };
}

async function recordPageView(pageId: string) {
  try {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const ipHash = hashIp(ip);
    const userAgent = headersList.get("user-agent") || "";
    const referrer = headersList.get("referer") || "";

    // Check for duplicate view in 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await prisma.pageView.findFirst({
      where: { pageId, ipHash, viewedAt: { gte: yesterday } },
    });

    if (!existing) {
      await prisma.pageView.create({
        data: { pageId, ipHash, userAgent, referrer },
      });
      await prisma.page.update({
        where: { id: pageId },
        data: { viewsCount: { increment: 1 } },
      });
    }
  } catch {
    // Non-critical, ignore errors
  }
}

export default async function PublishedPRPage({ params, searchParams }: Props) {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
    include: {
      project: { include: { talent: true } },
      qrAssets: { orderBy: { updatedAt: "desc" }, take: 1 },
    },
  });

  if (!page || page.status !== "PUBLISHED") notFound();

  // Determine locale
  const cookieStore = cookies();
  const hl = searchParams.hl;
  const localeOptions = ["ko", "en", "zh"];
  let locale = "ko";
  if (hl && localeOptions.includes(hl)) locale = hl;
  else {
    const cfLocale = cookieStore.get("cf_locale")?.value;
    if (cfLocale && localeOptions.includes(cfLocale)) locale = cfLocale;
  }

  // Record page view (non-blocking)
  recordPageView(page.id);

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

  // Resolve media asset URLs
  const heroImageUrl = content.hero.heroImageId
    ? (await prisma.mediaAsset.findUnique({ where: { id: content.hero.heroImageId } }))?.optimizedUrl || undefined
    : undefined;

  const profileImageUrl = content.profile.profileImageId
    ? (await prisma.mediaAsset.findUnique({ where: { id: content.profile.profileImageId } }))?.optimizedUrl || undefined
    : undefined;

  const photoIds = content.portfolio.photos;
  const photoAssets = photoIds.length > 0
    ? await prisma.mediaAsset.findMany({ where: { id: { in: photoIds } } })
    : [];
  const photoUrls = Object.fromEntries(photoAssets.map(a => [a.id, a.optimizedUrl || a.originalUrl]));

  const talentName = locale === "en" ? talent.nameEn : locale === "zh" ? (talent.nameCn || talent.nameKo) : talent.nameKo;

  return (
    <div>
      {/* Language switcher */}
      <div className="fixed top-4 right-4 z-50 flex gap-1 bg-white/90 backdrop-blur rounded-full shadow px-2 py-1">
        {[{ code: "ko", flag: "🇰🇷" }, { code: "en", flag: "🇺🇸" }, { code: "zh", flag: "🇨🇳" }].map(l => (
          <a
            key={l.code}
            href={`/p/${page.slug}?hl=${l.code}`}
            className={`px-2 py-1 text-sm rounded-full transition-colors ${locale === l.code ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}
          >
            {l.flag}
          </a>
        ))}
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
        photoUrls={photoUrls}
        locale={locale}
      />

      {/* Mobile bottom contact bar */}
      {content.contact.channels.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t shadow-lg flex">
          {content.contact.channels.slice(0, 3).map((ch, i) => {
            const icons: Record<string, string> = { email: "✉️", kakao: "💬", instagram: "📸", phone: "📞", youtube: "▶️", tiktok: "🎵", blog: "📝", other: "🔗" };
            const href = ch.type === "email" ? `mailto:${ch.value}` : ch.type === "phone" ? `tel:${ch.value}` : ch.value;
            return (
              <a key={i} href={href} target={["email", "phone"].includes(ch.type) ? undefined : "_blank"} rel="noopener noreferrer"
                className="flex-1 flex flex-col items-center py-3 text-xs text-gray-600 hover:bg-gray-50">
                <span className="text-xl">{icons[ch.type] || "🔗"}</span>
                <span className="mt-0.5">{ch.label || ch.type}</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
