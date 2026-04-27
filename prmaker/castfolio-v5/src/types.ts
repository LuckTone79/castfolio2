// ============================================================
// CastFolio Type Definitions — v2 (2026-03-22)
// Role: owner / agent
// Buyer: caster (public, no Firebase Auth)
// ============================================================

// ─── Layout & Theme ──────────────────────────────────────────

export type LayoutId =
  | 'minimal-grid'
  | 'diva-luxe'
  | 'artistic-dark'
  | 'friendly-vibrant'
  | 'pop-star'
  | 'standard-modern'
  | 'curated-atelier'
  | 'stitch-editorial-01'
  | 'stitch-editorial-02'
  | 'stitch-editorial-03'
  | 'stitch-scrapbook-04'
  | 'stitch-noir-05'
  | 'stitch-broadcaster-06'
  | 'stitch-minimal-07'
  | 'stitch-card-08';

export type ColorSchemeId =
  | 'elegant-white'
  | 'classic-black'
  | 'soft-pink'
  | 'sky-blue'
  | 'marble-luxe'
  | 'natural-green'
  | 'warm-coral';

export type Language = 'ko' | 'en' | 'zh' | 'ja' | 'vi';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

// ─── Enums ───────────────────────────────────────────────────

export type AppRole = 'owner' | 'agent';
export type PageSectionKey = 'hero' | 'about' | 'career' | 'portfolio' | 'strengths' | 'contact';
export type PageStatus = 'draft' | 'published' | 'archived';
export type PaymentMethod = 'bank_transfer' | 'kakaopay' | 'naverpay' | 'toss' | 'card' | 'manual';
export type OrderType = 'initial_purchase' | 'revision' | 'additional_service';
export type PaymentStatus = 'created' | 'pending' | 'paid' | 'failed' | 'cancelled';
export type SettlementStatus = 'none' | 'pending' | 'settled';
export type LedgerStatus = 'accrued' | 'pending_payout' | 'paid_out' | 'reversed';
export type PaymentProvider = 'external_link' | 'platform_manual' | 'platform_pg';

// ─── Payout Info (agent → caster 결제수단 안내) ─────────────

export interface PayoutInfo {
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  tossPaymentLink?: string;
  kakaoPayPaymentLink?: string;
  naverPayPaymentLink?: string;
  cardPaymentLink?: string;
  paymentNotice?: string;
}

// ─── User ────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  role: AppRole;
  status: 'active' | 'suspended';
  commissionRate?: number;
  payoutInfo?: PayoutInfo;
  createdAt: string;
  updatedAt?: string;
}

// ─── Color / Layout Config ───────────────────────────────────

export interface ColorScheme {
  id: ColorSchemeId;
  name: string;
  colors: {
    bg: string;
    text: string;
    accent: string;
    secondary: string;
    card: string;
    border: string;
  };
}

export interface LayoutConfig {
  id: LayoutId;
  name: string;
  fonts: {
    display: string;
    body: string;
  };
}

// ─── Page Content ────────────────────────────────────────────

export interface CareerItem {
  id: string;
  period: string;
  title: string;
  role?: string;
  description: string;
  thumbnail?: string;
  youtubeUrl?: string;
  websiteUrl?: string;
}

export interface PortfolioItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title?: string;
  description?: string;
}

export interface StrengthItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface PageContent {
  hero: {
    nameKo: string;
    nameEn: string;
    label?: string;
    title?: string;
    tagline: string;
    photoUrl: string;
  };
  about: {
    title?: string;
    subtitle?: string;
    profilePhotoUrl: string;
    bio: string;
    details?: Array<{
      id: string;
      label: string;
      value: string;
    }>;
  };
  career: CareerItem[];
  careerTitle?: string;
  careerSubtitle?: string;
  portfolio: PortfolioItem[];
  portfolioTitle?: string;
  portfolioSubtitle?: string;
  strengths: StrengthItem[];
  strengthsTitle?: string;
  strengthsSubtitle?: string;
  contact: {
    title?: string;
    subtitle?: string;
    email: string;
    phone?: string;
    kakaoOpenChat?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    blog?: string;
    qrCodeUrl?: string;
  };
  translations?: Record<Language, Partial<PageContent>>;
}

// ─── Talent ──────────────────────────────────────────────────

export interface Talent {
  id: string;
  agentId: string;
  nameKo: string;
  nameEn: string;
  email: string;
  phone: string;
  position: string;
  status: 'draft' | 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  intakeToken?: string;
}

// ─── Style Overrides ─────────────────────────────────────────

export interface StyleOverrides {
  [elementId: string]: {
    fontSize?: string | number;
    color?: string;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: string | number;
    letterSpacing?: string;
    lineHeight?: string | number;
    marginTop?: string | number;
    marginBottom?: string | number;
    width?: string | number;
    height?: string | number;
    x?: number;
    y?: number;
  };
}

// ─── Page ────────────────────────────────────────────────────

export interface Page {
  id: string;
  talentId: string;
  agentId: string;
  slug: string;
  layout: LayoutId;
  colorScheme: ColorSchemeId;
  accentColor?: string;
  content: PageContent;
  visibleSections: Record<PageSectionKey, boolean>;
  sectionOrder: PageSectionKey[];
  styleOverrides?: StyleOverrides;
  isPublished: boolean;
  status: PageStatus;
  seo: {
    title?: string;
    description?: string;
    imageUrl?: string;
  };
  qrCard: {
    enabled: boolean;
    title?: string;
    subtitle?: string;
  };
  publishedAt?: string;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Pricing Plan (agent가 정의하는 판매 메뉴) ─────────────

export interface RevisionPolicy {
  firstRevisionFree: boolean;
  includedRevisionCount: number;
  extraRevisionPrice: number;
  notes?: string;
}

export interface PricingPlan {
  id: string;
  agentId: string;
  talentId?: string | null;
  title: string;
  description: string;
  basePrice: number;
  salePrice?: number | null;
  currency: 'KRW';
  badge?: string;
  isActive: boolean;
  sortOrder: number;
  revisionPolicy: RevisionPolicy;
  createdAt: string;
  updatedAt: string;
}

// ─── Checkout Session (caster 구매 세션) ─────────────────────

export interface CheckoutSession {
  id: string;
  agentId: string;
  talentId?: string;
  pageId?: string;
  pricingPlanId: string;
  pricingPlanSnapshot: PricingPlan;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  amount: number;
  paymentMethod: PaymentMethod;
  provider?: PaymentProvider;
  status: PaymentStatus;
  paymentInstructionSnapshot?: PayoutInfo;
  providerTransactionId?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string | null;
}

// ─── Sale (확정된 판매) ──────────────────────────────────────

export interface Sale {
  id: string;
  agentId: string;
  talentId: string;
  pageId: string;
  checkoutSessionId?: string;
  pricingPlanId?: string;
  pricingPlanSnapshot?: PricingPlan;
  orderType: OrderType;
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  grossAmount: number;
  commissionRate: number;
  platformCommissionAmount: number;
  agentPayoutAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  settlementStatus: SettlementStatus;
  provider?: string;
  providerTransactionId?: string;
  evidenceUrl?: string;
  notes?: string;
  confirmedAt?: string;
  settledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Platform Ledger (15% 수수료 원장) ───────────────────────

export interface PlatformLedger {
  id: string;
  saleId: string;
  agentId: string;
  ownerId: string;
  grossAmount: number;
  commissionRate: number;
  platformCommissionAmount: number;
  agentPayoutAmount: number;
  status: LedgerStatus;
  createdAt: string;
  updatedAt: string;
  payoutAt?: string | null;
}

// ─── Settlement (agent 정산) ─────────────────────────────────

export interface Settlement {
  id: string;
  agentId: string;
  startDate: string;
  endDate: string;
  totalGrossAmount: number;
  totalPlatformCommission: number;
  totalAgentPayout: number;
  status: 'pending' | 'completed';
  saleIds: string[];
  ledgerIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Audit Log ───────────────────────────────────────────────

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  targetLabel: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

// ─── Work Activity Log (owner 활동 추적) ─────────────────────

export interface WorkActivityLog {
  id: string;
  actorId: string;
  actorRole: AppRole;
  actorEmail: string;
  activityType: string;
  targetType: string;
  targetId: string;
  targetLabel: string;
  summary: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

// ─── Page View ───────────────────────────────────────────────

export interface PageView {
  id: string;
  pageId: string;
  viewedAt: string;
  referrer?: string;
  userAgent?: string;
  sessionId: string;
}

// ─── Intake Submission ───────────────────────────────────────

export interface IntakeSubmission {
  id: string;
  talentId: string;
  agentId: string;
  token: string;
  status: 'draft' | 'submitted' | 'imported';
  formData: Partial<PageContent>;
  submittedAt?: string;
  importedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Dashboard Tab Type ──────────────────────────────────────

export type DashboardTab = 'talents' | 'intake' | 'pricing' | 'paymentSettings' | 'sales' | 'owner';
