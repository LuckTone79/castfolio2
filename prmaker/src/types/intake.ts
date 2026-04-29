import type { PageContent } from "@/types/page-content";

export type IntakeSubmissionWorkflowStatus = "requested" | "submitted" | "imported";
export type PortfolioItemType = "image" | "video";

export interface IntakeCareerItem {
  id: string;
  period: string;
  title: string;
  description: string;
  thumbnail?: string;
}

export interface IntakePortfolioItem {
  id: string;
  type: PortfolioItemType;
  title: string;
  url: string;
  thumbnail?: string;
  description?: string;
}

export interface IntakeStrengthItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface IntakePayload {
  basic: {
    nameKo: string;
    nameEn: string;
    position: string;
    tagline: string;
    heroPhotoUrl: string;
  };
  about: {
    bio: string;
    profilePhotoUrl: string;
    birthYear: string;
    height: string;
    education: string;
  };
  career: IntakeCareerItem[];
  portfolio: IntakePortfolioItem[];
  strengths: IntakeStrengthItem[];
  contact: {
    email: string;
    phone: string;
    kakaoOpenChat: string;
    instagram: string;
    youtube: string;
    tiktok: string;
    blog: string;
  };
  pageContent: PageContent;
  meta: {
    submittedAt: string | null;
    importedAt: string | null;
    submittedSections: string[];
    hasImages: boolean;
    draftSavedAt: string | null;
  };
}

export interface IntakeSubmissionRecord {
  id: string;
  formId: string;
  projectId: string;
  talentId: string;
  talentName: string;
  projectName: string;
  position: string;
  token: string;
  workflowStatus: IntakeSubmissionWorkflowStatus;
  submittedAt: string | null;
  importedAt: string | null;
  latestSubmissionId: string | null;
  latestPayload: IntakePayload | null;
  intakeUrl: string;
  hasExistingContent: boolean;
}
