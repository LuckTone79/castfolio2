import type { CSSProperties, ReactNode } from "react";
import type { PageContent } from "@/types/page-content";
import {
  ExternalLink,
  Globe,
  Instagram,
  Mail,
  MessageCircle,
  Phone,
  Youtube,
} from "lucide-react";
import {
  DEFAULT_PAGE_SECTION_ORDER,
  DEFAULT_PAGE_THEME_ID,
  getPageTheme,
} from "@/lib/page-themes";
import { cn } from "@/lib/utils";

type SectionKey = (typeof DEFAULT_PAGE_SECTION_ORDER)[number];

export interface PageMediaAsset {
  id: string;
  originalUrl: string;
  optimizedUrl?: string | null;
  thumbnailUrl?: string | null;
}

interface PRPageRendererProps {
  themeId?: string | null;
  accentColor?: string | null;
  content: PageContent;
  talentNameKo: string;
  talentNameEn?: string | null;
  sectionOrder?: string[];
  disabledSections?: string[];
  mediaAssets?: PageMediaAsset[];
  className?: string;
}

interface PageRenderContext {
  content: PageContent;
  nameKo: string;
  nameEn?: string | null;
  accent: string;
  orderedSections: SectionKey[];
  heroImageUrl?: string;
  profileImageUrl?: string;
  mediaAssets: PageMediaAsset[];
}

const CONTACT_PRIORITY: Record<string, number> = {
  email: 0,
  kakao: 1,
  phone: 2,
  instagram: 3,
  youtube: 4,
  tiktok: 5,
  blog: 6,
  other: 7,
};

export function PRPageRenderer({
  themeId,
  accentColor,
  content,
  talentNameKo,
  talentNameEn,
  sectionOrder,
  disabledSections = [],
  mediaAssets = [],
  className,
}: PRPageRendererProps) {
  const theme = getPageTheme(themeId ?? DEFAULT_PAGE_THEME_ID);
  const orderedSections = normalizeSectionOrder(sectionOrder, disabledSections);
  const accent = accentColor || theme.accent;
  const heroImageUrl = resolveMediaUrl(content.hero.heroImageId, mediaAssets);
  const profileImageUrl = resolveMediaUrl(content.profile.profileImageId, mediaAssets);

  const context: PageRenderContext = {
    content,
    nameKo: talentNameKo,
    nameEn: talentNameEn,
    accent,
    orderedSections,
    heroImageUrl,
    profileImageUrl,
    mediaAssets,
  };

  if (theme.layout === "curated-atelier") {
    return <CuratedAtelierPage context={context} className={className} />;
  }

  return <ClassicThemePage context={context} themeColor={theme.color} className={className} />;
}

function ClassicThemePage({
  context,
  themeColor,
  className,
}: {
  context: PageRenderContext;
  themeColor: string;
  className?: string;
}) {
  const availableSections = new Set(context.orderedSections);
  const primaryHref = resolveCtaHref(context.content.hero.ctaPrimary?.action, availableSections);
  const secondaryHref = resolveCtaHref(context.content.hero.ctaSecondary?.action, availableSections);

  return (
    <div className={cn("min-h-full text-white", className)} style={{ backgroundColor: "#030712" }}>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${themeColor} 0%, #030712 100%)`,
          }}
        />
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
          <ClassicAvatar
            name={context.nameKo}
            imageUrl={context.heroImageUrl || context.profileImageUrl}
            accent={context.accent}
          />
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{context.nameKo}</h1>
          {context.nameEn && <p className="mt-1 text-lg text-gray-400">{context.nameEn}</p>}
          {context.content.hero.position && (
            <p className="mt-3 text-xl" style={{ color: context.accent }}>
              {context.content.hero.position}
            </p>
          )}
          {context.content.hero.tagline && (
            <p className="mx-auto mt-4 max-w-2xl text-lg italic text-gray-300">
              &ldquo;{context.content.hero.tagline}&rdquo;
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={primaryHref}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: context.accent, color: "#111827" }}
            >
              {context.content.hero.ctaPrimary?.label || "연락하기"}
            </a>
            <a
              href={secondaryHref}
              className="inline-flex items-center gap-2 rounded-full border border-gray-700 px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
            >
              {context.content.hero.ctaSecondary?.label || "포트폴리오"}
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6">
        {context.orderedSections.map((section) => renderClassicSection(section, context))}
      </div>

      <footer className="border-t border-gray-800 py-8 text-center">
        <p className="text-xs text-gray-600">
          Powered by <span className="text-gray-500">Castfolio</span>
        </p>
      </footer>
    </div>
  );
}

function renderClassicSection(section: SectionKey, context: PageRenderContext) {
  switch (section) {
    case "hero":
    case "footer":
      return null;
    case "profile":
      if (!context.content.profile.intro) return null;
      return (
        <section key={section} id="profile" className="py-16">
          <h2 className="mb-6 text-2xl font-bold text-white">소개</h2>
          <p className="whitespace-pre-wrap leading-8 text-gray-300">{context.content.profile.intro}</p>
          {context.content.profile.infoItems.length > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {context.content.profile.infoItems.map((item, index) => (
                <div key={`${item.label}-${index}`} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="mt-1 text-sm font-medium text-white">{item.value}</p>
                </div>
              ))}
            </div>
          )}
          {context.content.profile.strengths.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {context.content.profile.strengths.map((item, index) => (
                <span
                  key={`${item.label}-${index}`}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300"
                >
                  {item.icon && <span>{item.icon}</span>}
                  {item.label}
                </span>
              ))}
            </div>
          )}
        </section>
      );
    case "career":
      if (context.content.career.items.length === 0) return null;
      return (
        <section key={section} id="career" className="border-t border-gray-800 py-16">
          <h2 className="mb-8 text-2xl font-bold text-white">경력</h2>
          <div className="space-y-6">
            {context.content.career.items.map((item, index) => (
              <div key={`${item.period}-${item.title}-${index}`} className="flex gap-6">
                <div className="w-28 shrink-0 pt-1 text-right">
                  <span className="font-mono text-sm text-gray-500">{item.period}</span>
                </div>
                <div className="relative flex-1 border-l border-gray-800 pl-6">
                  <div
                    className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: context.accent }}
                  />
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  {item.description && <p className="mt-1 text-sm text-gray-400">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    case "portfolio":
      return renderPortfolioSection(section, context, "dark");
    case "strength":
      if (context.content.strength.cards.length === 0) return null;
      return (
        <section key={section} id="strength" className="border-t border-gray-800 py-16">
          <h2 className="mb-8 text-2xl font-bold text-white">강점</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {context.content.strength.cards.map((card, index) => (
              <div key={`${card.title}-${index}`} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                {card.icon && <div className="mb-3 text-2xl">{card.icon}</div>}
                <h3 className="mb-2 text-base font-semibold text-white">{card.title}</h3>
                <p className="text-sm text-gray-400">{card.description}</p>
              </div>
            ))}
          </div>
        </section>
      );
    case "contact":
      if (context.content.contact.channels.length === 0) return null;
      return (
        <section key={section} id="contact" className="border-t border-gray-800 py-16">
          <h2 className="mb-8 text-2xl font-bold text-white">연락처</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {context.content.contact.channels.map((channel, index) => (
              <ContactCard
                key={`${channel.type}-${channel.value}-${index}`}
                channel={channel}
                tone="dark"
              />
            ))}
          </div>
        </section>
      );
    default:
      return null;
  }
}

function CuratedAtelierPage({
  context,
  className,
}: {
  context: PageRenderContext;
  className?: string;
}) {
  const visibleNavSections = context.orderedSections.filter(
    (section) => !["hero", "strength", "footer"].includes(section),
  );
  const sortedContacts = [...context.content.contact.channels].sort(
    (left, right) =>
      (CONTACT_PRIORITY[left.type] ?? 99) - (CONTACT_PRIORITY[right.type] ?? 99),
  );
  const featuredContact = sortedContacts[0];
  const secondaryContacts = sortedContacts.slice(1);

  return (
    <div
      className={cn("min-h-full text-[#1c1c19]", className)}
      style={{ backgroundColor: "#fdf9f4" }}
    >
      <div id="top" />
      <nav className="sticky top-0 z-20 border-b border-[#dac1bf]/60 bg-[#fdf9f4]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
          <span className="font-serif text-lg font-bold uppercase tracking-[0.35em]" style={{ color: context.accent }}>
            {context.nameEn || context.nameKo}
          </span>
          <div className="hidden items-center gap-6 md:flex">
            {visibleNavSections.map((section) => (
              <a
                key={section}
                href={`#${section}`}
                className="text-sm font-medium text-[#745853] transition-transform duration-300 hover:scale-[1.02] hover:text-[#460609]"
              >
                {getSectionLabel(section)}
              </a>
            ))}
            <a
              href="#contact"
              className="rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white transition-transform duration-300 hover:scale-[1.02]"
              style={{ backgroundColor: context.accent }}
            >
              Work With Me
            </a>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
        <section className="mb-24 text-center">
          <div className="relative mb-12 inline-block">
            <div className="w-60 overflow-hidden rounded-xl bg-[#ebe8e3] shadow-[0_24px_70px_rgba(28,28,25,0.14)] md:w-64">
              <div className="-rotate-2 transform">
                {context.heroImageUrl || context.profileImageUrl ? (
                  <img
                    src={context.heroImageUrl || context.profileImageUrl}
                    alt={`${context.nameKo} portrait`}
                    className="h-80 w-full object-cover grayscale transition duration-700 hover:grayscale-0"
                  />
                ) : (
                  <div className="flex h-80 w-full items-center justify-center bg-[#ebe8e3] text-5xl font-serif font-bold uppercase text-[#460609]">
                    {getInitials(context.nameEn || context.nameKo)}
                  </div>
                )}
              </div>
            </div>
            <div
              className="absolute -bottom-5 -right-5 flex h-28 w-28 items-center justify-center rounded-full border bg-[#fdf9f4] p-4 text-center font-serif text-sm italic shadow-[0_18px_40px_rgba(70,6,9,0.1)]"
              style={{ borderColor: `${context.accent}25`, color: context.accent }}
            >
              Voice &amp; Presence
            </div>
          </div>
          <h1 className="font-serif text-5xl font-extrabold uppercase tracking-tight text-[#460609] md:text-6xl">
            {context.nameEn || context.nameKo}
          </h1>
          {context.content.hero.position && (
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.32em] text-[#745853]">
              {context.content.hero.position}
            </p>
          )}
          {context.content.hero.tagline && (
            <p className="mt-8 font-serif text-xl italic leading-9 text-[#554241]">
              &ldquo;{context.content.hero.tagline}&rdquo;
            </p>
          )}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={resolveCtaHref(context.content.hero.ctaPrimary?.action, new Set(context.orderedSections))}
              className="rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white transition-transform duration-300 hover:scale-[1.02]"
              style={{ backgroundColor: context.accent }}
            >
              {context.content.hero.ctaPrimary?.label || "Contact"}
            </a>
            <a
              href={resolveCtaHref(context.content.hero.ctaSecondary?.action, new Set(context.orderedSections))}
              className="rounded-full border px-8 py-3 text-xs font-semibold uppercase tracking-[0.24em] transition-transform duration-300 hover:scale-[1.02]"
              style={{ borderColor: "#dac1bf", color: context.accent }}
            >
              {context.content.hero.ctaSecondary?.label || "Portfolio"}
            </a>
          </div>
        </section>

        {context.orderedSections.map((section) => {
          switch (section) {
            case "hero":
            case "footer":
              return null;
            case "profile":
              if (!context.content.profile.intro) return null;
              return (
                <section key={section} id="profile" className="mb-24">
                  <SectionHeading title="소개" />
                  <p className="whitespace-pre-wrap text-[1.05rem] font-light leading-9 text-[#554241]">
                    {context.content.profile.intro}
                  </p>
                  {context.content.profile.infoItems.length > 0 && (
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                      {context.content.profile.infoItems.map((item, index) => (
                        <div key={`${item.label}-${index}`} className="rounded-xl bg-[#f7f3ee] px-5 py-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#745853]">
                            {item.label}
                          </p>
                          <p className="mt-2 text-sm font-medium text-[#1c1c19]">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {context.content.profile.strengths.length > 0 && (
                    <div className="mt-8 flex flex-wrap gap-3">
                      {context.content.profile.strengths.map((item, index) => (
                        <span
                          key={`${item.label}-${index}`}
                          className="rounded-full bg-[#fed7d0] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#795c57]"
                        >
                          {item.icon ? `${item.icon} ` : ""}
                          {item.label}
                        </span>
                      ))}
                    </div>
                  )}
                </section>
              );
            case "career":
              if (context.content.career.items.length === 0) return null;
              return (
                <section key={section} id="career" className="mb-24">
                  <SectionHeading title="경력" />
                  <div className="space-y-10">
                    {context.content.career.items.map((item, index) => (
                      <div key={`${item.period}-${item.title}-${index}`} className="relative border-l pb-2 pl-8" style={{ borderColor: `${context.accent}22` }}>
                        <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full" style={{ backgroundColor: index === 0 ? context.accent : "#887270" }} />
                        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#745853]">
                          {item.period}
                        </span>
                        <h3 className="font-serif text-xl text-[#460609]">{item.title}</h3>
                        {item.description && <p className="mt-2 text-sm leading-7 text-[#554241]">{item.description}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              );
            case "portfolio":
              return renderPortfolioSection(section, context, "editorial");
            case "strength":
              if (context.content.strength.cards.length === 0) return null;
              return (
                <section key={section} id="strength" className="mb-24">
                  <SectionHeading title="강점" />
                  <div className="grid gap-6 md:grid-cols-3">
                    {context.content.strength.cards.map((card, index) => (
                      <div
                        key={`${card.title}-${index}`}
                        className="rounded-xl border px-6 py-7 text-center transition-colors hover:border-[#460609]/20"
                        style={{ borderColor: "#dac1bf33" }}
                      >
                        {card.icon && <div className="mb-4 text-3xl" style={{ color: context.accent }}>{card.icon}</div>}
                        <h3 className="mb-3 font-serif text-xl text-[#460609]">{card.title}</h3>
                        <p className="text-sm leading-7 text-[#554241]">{card.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            case "contact":
              if (sortedContacts.length === 0) return null;
              return (
                <section key={section} id="contact" className="mb-20">
                  <SectionHeading title="연락처" />
                  <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
                    {featuredContact ? (
                      <FeaturedContactCard channel={featuredContact} accent={context.accent} />
                    ) : (
                      <div className="rounded-2xl bg-[#460609] p-8 text-white" />
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {secondaryContacts.map((channel, index) => (
                        <ContactCard
                          key={`${channel.type}-${channel.value}-${index}`}
                          channel={channel}
                          tone="editorial"
                        />
                      ))}
                    </div>
                  </div>
                </section>
              );
            default:
              return null;
          }
        })}
      </main>

      <footer className="border-t border-[#dac1bf]/50 px-6 py-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
          <span className="font-serif text-xl text-[#460609]">{context.nameEn || context.nameKo}</span>
          <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#745853]">
            <span>Privacy Policy</span>
            <span>Press Kit</span>
            <span>Inquiries</span>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#887270]">
              Powered by Castfolio
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function renderPortfolioSection(section: SectionKey, context: PageRenderContext, tone: "dark" | "editorial") {
  const hasPortfolio =
    context.content.portfolio.videos.length > 0 ||
    context.content.portfolio.photos.length > 0 ||
    context.content.portfolio.audioSamples.length > 0;

  if (!hasPortfolio) return null;

  const isEditorial = tone === "editorial";
  const sectionClass = isEditorial ? "mb-24" : "border-t border-gray-800 py-16";
  const cardClass = isEditorial
    ? "rounded-xl bg-[#f7f3ee] p-4 transition-colors duration-500 hover:bg-[#ebe8e3]"
    : "rounded-xl border border-gray-800 bg-gray-900 p-4";
  const textClass = isEditorial ? "text-[#460609]" : "text-white";
  const mutedClass = isEditorial ? "text-[#745853]" : "text-gray-500";

  return (
    <section key={section} id="portfolio" className={sectionClass}>
      {isEditorial ? <SectionHeading title="포트폴리오" /> : <h2 className="mb-8 text-2xl font-bold text-white">포트폴리오</h2>}
      <div className="grid gap-6 md:grid-cols-2">
        {context.content.portfolio.videos.map((video, index) => (
          <a
            key={`${video.title}-${index}`}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cardClass}
          >
            <PortfolioPreviewCard
              title={video.title}
              meta={video.platform.toUpperCase()}
              accent={context.accent}
              tone={tone}
            />
          </a>
        ))}
        {context.content.portfolio.photos.map((photo, index) => {
          const resolvedPhoto = resolveMediaUrl(photo, context.mediaAssets);
          return (
            <div key={`${photo}-${index}`} className={cardClass}>
              <div className={cn("mb-4 aspect-video overflow-hidden rounded-lg", isEditorial ? "bg-[#ebe8e3]" : "bg-gray-800")}>
                {resolvedPhoto ? (
                  <img src={resolvedPhoto} alt={`portfolio-${index + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <div className={cn("flex h-full w-full items-center justify-center text-sm", isEditorial ? "text-[#745853]" : "text-gray-500")}>
                    Photo Sample
                  </div>
                )}
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className={cn("text-lg font-semibold", textClass)}>Photo Portfolio</h4>
                  <p className={cn("mt-1 text-xs uppercase tracking-[0.24em]", mutedClass)}>Visual Sample</p>
                </div>
                <ExternalLink size={16} className={cn(isEditorial ? "text-[#460609]" : "text-gray-400")} />
              </div>
            </div>
          );
        })}
        {context.content.portfolio.audioSamples.map((audio, index) => (
          <a
            key={`${audio.title}-${index}`}
            href={audio.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cardClass}
          >
            <div className={cn("mb-4 flex aspect-video items-center justify-center rounded-lg", isEditorial ? "bg-[#ebe8e3] text-[#745853]" : "bg-gray-800 text-gray-500")}>
              Audio Sample
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className={cn("text-lg font-semibold", textClass)}>{audio.title}</h4>
                <p className={cn("mt-1 text-xs uppercase tracking-[0.24em]", mutedClass)}>Audio Sample</p>
              </div>
              <ExternalLink size={16} className={cn(isEditorial ? "text-[#460609]" : "text-gray-400")} />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function PortfolioPreviewCard({
  title,
  meta,
  accent,
  tone,
}: {
  title: string;
  meta: string;
  accent: string;
  tone: "dark" | "editorial";
}) {
  const isEditorial = tone === "editorial";

  return (
    <>
      <div className={cn("mb-4 aspect-video overflow-hidden rounded-lg", isEditorial ? "bg-[#ebe8e3]" : "bg-gray-800")}>
        <div
          className="h-full w-full"
          style={{
            background: isEditorial
              ? `linear-gradient(135deg, ${accent}14 0%, #ebe8e3 100%)`
              : `linear-gradient(135deg, ${accent}20 0%, #111827 100%)`,
          }}
        />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className={cn("text-lg font-semibold", isEditorial ? "text-[#460609]" : "text-white")}>{title}</h4>
          <p className={cn("mt-1 text-xs uppercase tracking-[0.24em]", isEditorial ? "text-[#745853]" : "text-gray-500")}>{meta}</p>
        </div>
        <ExternalLink size={16} className={cn(isEditorial ? "text-[#460609]" : "text-gray-400")} />
      </div>
    </>
  );
}

function FeaturedContactCard({
  channel,
  accent,
}: {
  channel: PageContent["contact"]["channels"][number];
  accent: string;
}) {
  return (
    <ContactSurface
      href={getContactHref(channel)}
      className="group flex items-center gap-6 rounded-2xl p-8 text-white transition-transform hover:scale-[1.02]"
      style={{ backgroundColor: accent }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
        <ContactIcon type={channel.type} className="text-white" />
      </div>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
          {channel.label || channel.type}
        </p>
        <p className="text-sm font-medium">{channel.value}</p>
      </div>
    </ContactSurface>
  );
}

function ContactCard({
  channel,
  tone,
}: {
  channel: PageContent["contact"]["channels"][number];
  tone: "dark" | "editorial";
}) {
  const isEditorial = tone === "editorial";
  const cardClass = isEditorial
    ? "rounded-2xl bg-[#f1ede8] p-5"
    : "rounded-xl border border-gray-800 bg-gray-900 p-4";
  const labelClass = isEditorial ? "text-[#745853]" : "text-gray-500";
  const valueClass = isEditorial ? "text-[#1c1c19]" : "text-white";
  const iconClass = isEditorial ? "text-[#460609]" : "text-gray-400";

  return (
    <ContactSurface href={getContactHref(channel)} className={cn("flex items-center gap-3", cardClass)}>
      <ContactIcon type={channel.type} className={iconClass} />
      <div>
        <p className={cn("text-xs uppercase", labelClass)}>{channel.label || channel.type}</p>
        <p className={cn("text-sm font-medium", valueClass)}>{channel.value}</p>
      </div>
    </ContactSurface>
  );
}

function ContactSurface({
  href,
  className,
  style,
  children,
}: {
  href?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  if (href) {
    const isWebLink = href.startsWith("http://") || href.startsWith("https://");
    return (
      <a
        href={href}
        target={isWebLink ? "_blank" : undefined}
        rel={isWebLink ? "noopener noreferrer" : undefined}
        className={className}
        style={style}
      >
        {children}
      </a>
    );
  }

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-10 flex items-center gap-4">
      <h2 className="font-serif text-3xl text-[#460609]">{title}</h2>
      <div className="h-px flex-1 bg-[#dac1bf]/50" />
    </div>
  );
}

function ClassicAvatar({
  name,
  imageUrl,
  accent,
}: {
  name: string;
  imageUrl?: string;
  accent: string;
}) {
  if (imageUrl) {
    return (
      <div className="mx-auto mb-6 h-28 w-28 overflow-hidden rounded-full ring-4" style={{ boxShadow: `0 0 0 4px ${accent}20` }}>
        <img src={imageUrl} alt={`${name} profile`} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gray-800 text-3xl font-bold text-white ring-4"
      style={{ boxShadow: `0 0 0 4px ${accent}25` }}
    >
      {name[0]}
    </div>
  );
}

function ContactIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "email":
      return <Mail size={18} className={className} />;
    case "phone":
      return <Phone size={18} className={className} />;
    case "kakao":
      return <MessageCircle size={18} className={className} />;
    case "instagram":
      return <Instagram size={18} className={className} />;
    case "youtube":
      return <Youtube size={18} className={className} />;
    default:
      return <Globe size={18} className={className} />;
  }
}

function getSectionLabel(section: SectionKey) {
  switch (section) {
    case "profile":
      return "Profile";
    case "career":
      return "Career";
    case "portfolio":
      return "Portfolio";
    case "contact":
      return "Contact";
    case "strength":
      return "Strength";
    default:
      return section;
  }
}

function getContactHref(channel: PageContent["contact"]["channels"][number]) {
  switch (channel.type) {
    case "email":
      return `mailto:${channel.value}`;
    case "phone":
      return `tel:${channel.value.replace(/\s+/g, "")}`;
    case "instagram":
      return channel.value.startsWith("http")
        ? channel.value
        : `https://instagram.com/${channel.value.replace(/^@/, "")}`;
    case "youtube":
      return channel.value.startsWith("http") ? channel.value : undefined;
    case "blog":
    case "other":
    case "kakao":
    case "tiktok":
      return channel.value.startsWith("http") ? channel.value : undefined;
    default:
      return undefined;
  }
}

function normalizeSectionOrder(sectionOrder?: string[], disabledSections: string[] = []): SectionKey[] {
  const disabled = new Set(disabledSections);
  const safeOrder = (sectionOrder ?? DEFAULT_PAGE_SECTION_ORDER).filter((section): section is SectionKey =>
    (DEFAULT_PAGE_SECTION_ORDER as readonly string[]).includes(section),
  );

  const ordered = [...safeOrder];

  for (const section of DEFAULT_PAGE_SECTION_ORDER) {
    if (!ordered.includes(section)) ordered.push(section);
  }

  return ordered.filter((section) => !disabled.has(section));
}

function resolveCtaHref(action: "portfolio" | "contact" | undefined, availableSections: Set<SectionKey>) {
  if (action === "portfolio" && availableSections.has("portfolio")) return "#portfolio";
  if (action === "contact" && availableSections.has("contact")) return "#contact";
  if (availableSections.has("contact")) return "#contact";
  if (availableSections.has("portfolio")) return "#portfolio";
  return "#top";
}

function resolveMediaUrl(mediaRef: string | undefined, mediaAssets: PageMediaAsset[]) {
  if (!mediaRef) return undefined;
  if (mediaRef.startsWith("http://") || mediaRef.startsWith("https://")) return mediaRef;

  const matchedAsset = mediaAssets.find((asset) => asset.id === mediaRef);
  if (!matchedAsset) return undefined;

  return matchedAsset.optimizedUrl || matchedAsset.originalUrl || matchedAsset.thumbnailUrl || undefined;
}

function getInitials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "CF";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}
