export interface PageContent {
  hero: {
    nameKo?: string;
    nameEn?: string;
    tagline: string;
    position: string;
    heroImageId: string;
    photoUrl?: string;
    ctaPrimary: { label: string; action: "portfolio" | "contact" };
    ctaSecondary: { label: string; action: "portfolio" | "contact" };
  };
  profile: {
    intro: string;
    profileImageId: string;
    profilePhotoUrl?: string;
    infoItems: Array<{ label: string; value: string }>;
    strengths: Array<{ icon: string; label: string }>;
  };
  career: {
    items: Array<{
      period: string;
      title: string;
      description: string;
      imageId?: string;
    }>;
  };
  portfolio: {
    videos: Array<{
      url: string;
      platform: "youtube" | "navertv";
      title: string;
    }>;
    photos: string[];
    audioSamples: Array<{ url: string; title: string }>;
  };
  strength: {
    cards: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  contact: {
    channels: Array<{
      type: "email" | "kakao" | "instagram" | "youtube" | "tiktok" | "blog" | "phone" | "other";
      value: string;
      label: string;
    }>;
  };
}

export interface DraftContent {
  ko: PageContent;
  en: PageContent;
  zh: PageContent;
}
