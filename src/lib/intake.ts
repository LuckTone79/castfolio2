import { randomBytes } from "crypto";
import type { DraftContent, PageContent } from "@/types/page-content";
import type { IntakePayload } from "@/types/intake";

export type IntakeMergeMode = "fill_empty" | "overwrite";

export function createIntakeToken() {
  return `intake_${randomBytes(12).toString("base64url")}`;
}

export function buildIntakeUrl(token: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  return `${baseUrl.replace(/\/$/, "")}/submit/${token}`;
}

export function createEmptyPageContent(): PageContent {
  return {
    hero: {
      tagline: "",
      position: "",
      heroImageId: "",
      ctaPrimary: { label: "포트폴리오 보기", action: "portfolio" },
      ctaSecondary: { label: "연락하기", action: "contact" },
    },
    profile: {
      intro: "",
      profileImageId: "",
      infoItems: [],
      strengths: [],
    },
    career: { items: [] },
    portfolio: { videos: [], photos: [], audioSamples: [] },
    strength: { cards: [] },
    contact: { channels: [] },
  };
}

export function createEmptyDraftContent(): DraftContent {
  const base = createEmptyPageContent();
  return {
    ko: structuredClone(base),
    en: structuredClone(base),
    zh: structuredClone(base),
  };
}

export function createEmptyIntakePayload(nameKo: string = "", nameEn: string = ""): IntakePayload {
  return {
    basic: {
      nameKo,
      nameEn,
      position: "",
      tagline: "",
      heroPhotoUrl: "",
    },
    about: {
      bio: "",
      profilePhotoUrl: "",
      birthYear: "",
      height: "",
      education: "",
    },
    career: [],
    portfolio: [],
    strengths: [],
    contact: {
      email: "",
      phone: "",
      kakaoOpenChat: "",
      instagram: "",
      youtube: "",
      tiktok: "",
      blog: "",
    },
    pageContent: createEmptyPageContent(),
    meta: {
      submittedAt: null,
      importedAt: null,
      submittedSections: [],
      hasImages: false,
      draftSavedAt: null,
    },
  };
}

export function normalizeIntakePayload(payload: IntakePayload): IntakePayload {
  const pageContent = payloadToPageContent(payload);
  return {
    ...payload,
    pageContent,
    meta: {
      ...payload.meta,
      submittedSections: getSubmittedSections(pageContent),
      hasImages: hasImages(payload),
    },
  };
}

export function payloadToPageContent(payload: IntakePayload): PageContent {
  const infoItems = [
    payload.about.birthYear ? { label: "출생연도", value: payload.about.birthYear } : null,
    payload.about.height ? { label: "키", value: payload.about.height } : null,
    payload.about.education ? { label: "학력", value: payload.about.education } : null,
  ].filter((item): item is { label: string; value: string } => item !== null);

  const channels = [
    payload.contact.email ? { type: "email" as const, value: payload.contact.email, label: "이메일" } : null,
    payload.contact.phone ? { type: "phone" as const, value: payload.contact.phone, label: "전화" } : null,
    payload.contact.kakaoOpenChat
      ? { type: "kakao" as const, value: payload.contact.kakaoOpenChat, label: "카카오 오픈채팅" }
      : null,
    payload.contact.instagram
      ? { type: "instagram" as const, value: payload.contact.instagram, label: "인스타그램" }
      : null,
    payload.contact.youtube ? { type: "youtube" as const, value: payload.contact.youtube, label: "유튜브" } : null,
    payload.contact.tiktok ? { type: "tiktok" as const, value: payload.contact.tiktok, label: "틱톡" } : null,
    payload.contact.blog ? { type: "blog" as const, value: payload.contact.blog, label: "블로그" } : null,
  ].filter(
    (
      item,
    ): item is {
      type: "email" | "phone" | "kakao" | "instagram" | "youtube" | "tiktok" | "blog";
      value: string;
      label: string;
    } => item !== null,
  );

  return {
    hero: {
      tagline: payload.basic.tagline,
      position: payload.basic.position,
      heroImageId: payload.basic.heroPhotoUrl,
      ctaPrimary: { label: "포트폴리오 보기", action: "portfolio" },
      ctaSecondary: { label: "연락하기", action: "contact" },
    },
    profile: {
      intro: payload.about.bio,
      profileImageId: payload.about.profilePhotoUrl,
      infoItems,
      strengths: payload.strengths.map((item) => ({ icon: item.icon || "•", label: item.title })),
    },
    career: {
      items: payload.career.map((item) => ({
        period: item.period,
        title: item.title,
        description: item.description,
        imageId: item.thumbnail,
      })),
    },
    portfolio: {
      videos: payload.portfolio
        .filter((item) => item.type === "video")
        .map((item) => ({
          url: item.url,
          platform: item.url.includes("naver") ? "navertv" : "youtube",
          title: item.title,
        })),
      photos: payload.portfolio.filter((item) => item.type === "image").map((item) => item.url),
      audioSamples: [],
    },
    strength: {
      cards: payload.strengths.map((item) => ({
        icon: item.icon || "•",
        title: item.title,
        description: item.description,
      })),
    },
    contact: {
      channels,
    },
  };
}

export function getSubmittedSections(formData: PageContent) {
  const sections: string[] = [];
  if (formData.hero.position || formData.hero.tagline || formData.hero.heroImageId) sections.push("basic");
  if (formData.profile.intro || formData.profile.profileImageId || formData.profile.infoItems.length > 0) sections.push("about");
  if (formData.career.items.length > 0) sections.push("career");
  if (formData.portfolio.photos.length > 0 || formData.portfolio.videos.length > 0) sections.push("portfolio");
  if (formData.strength.cards.length > 0) sections.push("strengths");
  if (formData.contact.channels.length > 0) sections.push("contact");
  return sections;
}

export function mergeIntakeContent(
  existingContent: PageContent,
  submittedContent: PageContent,
  mode: IntakeMergeMode,
): PageContent {
  if (mode === "overwrite") {
    return {
      ...existingContent,
      ...submittedContent,
      hero: { ...existingContent.hero, ...submittedContent.hero },
      profile: { ...existingContent.profile, ...submittedContent.profile },
      career: { items: submittedContent.career.items },
      portfolio: {
        videos: submittedContent.portfolio.videos,
        photos: submittedContent.portfolio.photos,
        audioSamples: submittedContent.portfolio.audioSamples,
      },
      strength: { cards: submittedContent.strength.cards },
      contact: { channels: submittedContent.contact.channels },
    };
  }

  return {
    hero: {
      ...existingContent.hero,
      tagline: firstFilled(existingContent.hero.tagline, submittedContent.hero.tagline),
      position: firstFilled(existingContent.hero.position, submittedContent.hero.position),
      heroImageId: firstFilled(existingContent.hero.heroImageId, submittedContent.hero.heroImageId),
      ctaPrimary: existingContent.hero.ctaPrimary,
      ctaSecondary: existingContent.hero.ctaSecondary,
    },
    profile: {
      ...existingContent.profile,
      intro: firstFilled(existingContent.profile.intro, submittedContent.profile.intro),
      profileImageId: firstFilled(existingContent.profile.profileImageId, submittedContent.profile.profileImageId),
      infoItems: existingContent.profile.infoItems.length > 0 ? existingContent.profile.infoItems : submittedContent.profile.infoItems,
      strengths: existingContent.profile.strengths.length > 0 ? existingContent.profile.strengths : submittedContent.profile.strengths,
    },
    career: {
      items: existingContent.career.items.length > 0 ? existingContent.career.items : submittedContent.career.items,
    },
    portfolio: {
      videos: existingContent.portfolio.videos.length > 0 ? existingContent.portfolio.videos : submittedContent.portfolio.videos,
      photos: existingContent.portfolio.photos.length > 0 ? existingContent.portfolio.photos : submittedContent.portfolio.photos,
      audioSamples:
        existingContent.portfolio.audioSamples.length > 0
          ? existingContent.portfolio.audioSamples
          : submittedContent.portfolio.audioSamples,
    },
    strength: {
      cards: existingContent.strength.cards.length > 0 ? existingContent.strength.cards : submittedContent.strength.cards,
    },
    contact: {
      channels: existingContent.contact.channels.length > 0 ? existingContent.contact.channels : submittedContent.contact.channels,
    },
  };
}

export function hasMeaningfulContent(content: PageContent) {
  return (
    Boolean(content.hero.tagline) ||
    Boolean(content.hero.position) ||
    Boolean(content.hero.heroImageId) ||
    Boolean(content.profile.intro) ||
    Boolean(content.profile.profileImageId) ||
    content.profile.infoItems.length > 0 ||
    content.career.items.length > 0 ||
    content.portfolio.photos.length > 0 ||
    content.portfolio.videos.length > 0 ||
    content.strength.cards.length > 0 ||
    content.contact.channels.length > 0
  );
}

function firstFilled<T extends string>(existing: T, incoming: T) {
  return existing && existing.trim().length > 0 ? existing : incoming;
}

function hasImages(payload: IntakePayload) {
  return Boolean(
    payload.basic.heroPhotoUrl ||
      payload.about.profilePhotoUrl ||
      payload.career.some((item) => item.thumbnail) ||
      payload.portfolio.some((item) => item.type === "image" && item.url),
  );
}
