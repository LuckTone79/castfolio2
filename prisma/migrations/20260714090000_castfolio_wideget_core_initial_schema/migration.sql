-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "castfolio";

-- CreateEnum
CREATE TYPE "castfolio"."UserRole" AS ENUM ('MASTER_ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "castfolio"."UserType" AS ENUM ('INDIVIDUAL', 'SOLE_PROPRIETOR', 'CORPORATION');

-- CreateEnum
CREATE TYPE "castfolio"."AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "castfolio"."TalentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "castfolio"."ProjectStatus" AS ENUM ('NEW', 'COLLECTING_MATERIALS', 'DRAFTING', 'UNDER_REVIEW', 'READY_FOR_DELIVERY', 'DELIVERED', 'CLOSED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "castfolio"."IntakeMode" AS ENUM ('SELF_SUBMISSION', 'OPERATOR_ENTRY', 'HYBRID');

-- CreateEnum
CREATE TYPE "castfolio"."SourceChannel" AS ENUM ('KAKAO', 'EMAIL', 'PHONE', 'OFFLINE', 'UPLOAD_LINK', 'MIXED');

-- CreateEnum
CREATE TYPE "castfolio"."VerificationStatus" AS ENUM ('NOT_REQUESTED', 'REQUESTED', 'APPROVED', 'REVISION_REQUESTED');

-- CreateEnum
CREATE TYPE "castfolio"."DataEnteredBy" AS ENUM ('TALENT', 'USER', 'BOTH');

-- CreateEnum
CREATE TYPE "castfolio"."PageStatus" AS ENUM ('DRAFT', 'PREVIEW', 'PUBLISHED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "castfolio"."MediaType" AS ENUM ('HERO_PHOTO', 'PROFILE_PHOTO', 'PORTFOLIO_PHOTO', 'AUDIO_SAMPLE', 'OTHER');

-- CreateEnum
CREATE TYPE "castfolio"."SubmissionStatus" AS ENUM ('PENDING', 'PARTIAL', 'COMPLETE');

-- CreateEnum
CREATE TYPE "castfolio"."QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'EXPIRED', 'SUPERSEDED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "castfolio"."OrderStatus" AS ENUM ('DRAFT', 'PAYMENT_PENDING', 'PAID', 'DELIVERED', 'SETTLED', 'CANCELLED', 'DISPUTED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "castfolio"."PaymentMethod" AS ENUM ('ONLINE_CARD', 'ONLINE_KAKAO', 'ONLINE_NAVER', 'ONLINE_TRANSFER', 'OFFLINE_CASH', 'OFFLINE_TRANSFER', 'OFFLINE_OTHER');

-- CreateEnum
CREATE TYPE "castfolio"."SettlementStatus" AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "castfolio"."NotificationChannel" AS ENUM ('DASHBOARD', 'EMAIL');

-- CreateTable
CREATE TABLE "castfolio"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "castfolio"."UserRole" NOT NULL DEFAULT 'USER',
    "userType" "castfolio"."UserType",
    "company" TEXT,
    "phone" TEXT,
    "commissionRate" DECIMAL(65,30) NOT NULL DEFAULT 0.15,
    "status" "castfolio"."AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "supabaseUid" TEXT NOT NULL,
    "brandLogoUrl" TEXT,
    "brandColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."Talent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nameKo" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameCn" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "kakaoId" TEXT,
    "position" TEXT NOT NULL,
    "status" "castfolio"."TalentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Talent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "talentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT,
    "status" "castfolio"."ProjectStatus" NOT NULL DEFAULT 'NEW',
    "intakeMode" "castfolio"."IntakeMode" NOT NULL DEFAULT 'SELF_SUBMISSION',
    "sourceChannel" "castfolio"."SourceChannel",
    "dataEnteredBy" "castfolio"."DataEnteredBy",
    "verificationStatus" "castfolio"."VerificationStatus" NOT NULL DEFAULT 'NOT_REQUESTED',
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."Page" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "previewToken" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "accentColor" TEXT,
    "status" "castfolio"."PageStatus" NOT NULL DEFAULT 'DRAFT',
    "contentKo" JSONB NOT NULL DEFAULT '{}',
    "contentEn" JSONB NOT NULL DEFAULT '{}',
    "contentCn" JSONB NOT NULL DEFAULT '{}',
    "draftContent" JSONB,
    "sectionOrder" TEXT[] DEFAULT ARRAY['hero', 'profile', 'career', 'portfolio', 'strength', 'contact', 'footer']::TEXT[],
    "disabledSections" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "noindex" BOOLEAN NOT NULL DEFAULT true,
    "ogImageUrl" TEXT,
    "showPhone" BOOLEAN NOT NULL DEFAULT false,
    "emailBotProtect" BOOLEAN NOT NULL DEFAULT true,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."PageVersion" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "versionName" TEXT NOT NULL,
    "draftSnapshot" JSONB NOT NULL,
    "theme" TEXT NOT NULL,
    "accentColor" TEXT,
    "sectionOrder" TEXT[],
    "savedBy" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."MediaAsset" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "castfolio"."MediaType" NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "optimizedUrl" TEXT,
    "thumbnailUrl" TEXT,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."IntakeForm" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "talentId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "customFields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntakeForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."IntakeSubmission" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "source" "castfolio"."SourceChannel",
    "status" "castfolio"."SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntakeSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."ProductPackage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."PricingPolicyVersion" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "basePrice" DECIMAL(65,30) NOT NULL,
    "promoPrice" DECIMAL(65,30),
    "promoStartAt" TIMESTAMP(3),
    "promoEndAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "options" JSONB,
    "changeSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingPolicyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."RevisionPolicy" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "freeRevisions" INTEGER NOT NULL DEFAULT 0,
    "extraRevisionFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "revisionWindowDays" INTEGER NOT NULL DEFAULT 14,
    "freeScope" JSONB,
    "paidScope" JSONB,
    "excludedScope" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevisionPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."PricingChangeLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT NOT NULL,
    "newValue" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."Quote" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "castfolio"."QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "message" TEXT,
    "pricingSnapshot" JSONB NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."QuoteLineItem" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "QuoteLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."Order" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "castfolio"."OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "commissionRate" DECIMAL(65,30) NOT NULL,
    "commissionAmount" DECIMAL(65,30) NOT NULL,
    "userAmount" DECIMAL(65,30) NOT NULL,
    "paymentMethod" "castfolio"."PaymentMethod",
    "paymentProofUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "pricingSnapshot" JSONB NOT NULL,
    "revisionSnapshot" JSONB,
    "deliveredAt" TIMESTAMP(3),
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."OrderLineItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "type" TEXT NOT NULL,

    CONSTRAINT "OrderLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."PaymentRecord" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "method" "castfolio"."PaymentMethod" NOT NULL,
    "pgTxId" TEXT,
    "status" TEXT NOT NULL,
    "proofUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."RefundRecord" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "reason" TEXT NOT NULL,
    "refundedCommission" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "processedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefundRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."CommissionLedger" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "settlementId" TEXT,
    "orderAmount" DECIMAL(65,30) NOT NULL,
    "commissionRate" DECIMAL(65,30) NOT NULL,
    "commissionAmount" DECIMAL(65,30) NOT NULL,
    "userAmount" DECIMAL(65,30) NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommissionLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."SettlementBatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalSales" DECIMAL(65,30) NOT NULL,
    "totalCommission" DECIMAL(65,30) NOT NULL,
    "totalUserAmount" DECIMAL(65,30) NOT NULL,
    "status" "castfolio"."SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "minimumMet" BOOLEAN NOT NULL DEFAULT true,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettlementBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" "castfolio"."NotificationChannel" NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."NotificationTemplate" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "titleKo" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleCn" TEXT,
    "bodyKo" TEXT NOT NULL,
    "bodyEn" TEXT NOT NULL,
    "bodyCn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "reason" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."ProjectTimeline" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."AdminNote" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."RiskFlag" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."PageView" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "referrer" TEXT,
    "country" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castfolio"."QRAsset" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "pngUrl" TEXT,
    "svgUrl" TEXT,
    "pdfUrl" TEXT,
    "showPhoto" BOOLEAN NOT NULL DEFAULT false,
    "nameDisplay" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QRAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "castfolio"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseUid_key" ON "castfolio"."User"("supabaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "Page_projectId_key" ON "castfolio"."Page"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "castfolio"."Page"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Page_previewToken_key" ON "castfolio"."Page"("previewToken");

-- CreateIndex
CREATE UNIQUE INDEX "IntakeForm_token_key" ON "castfolio"."IntakeForm"("token");

-- CreateIndex
CREATE UNIQUE INDEX "RevisionPolicy_packageId_key" ON "castfolio"."RevisionPolicy"("packageId");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_token_key" ON "castfolio"."Quote"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Order_quoteId_key" ON "castfolio"."Order"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "castfolio"."Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionLedger_orderId_type_key" ON "castfolio"."CommissionLedger"("orderId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "SettlementBatch_userId_periodStart_key" ON "castfolio"."SettlementBatch"("userId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_type_key" ON "castfolio"."NotificationTemplate"("type");

-- CreateIndex
CREATE INDEX "PageView_pageId_ipHash_viewedAt_idx" ON "castfolio"."PageView"("pageId", "ipHash", "viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "QRAsset_pageId_key" ON "castfolio"."QRAsset"("pageId");

-- AddForeignKey
ALTER TABLE "castfolio"."Talent" ADD CONSTRAINT "Talent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "castfolio"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "castfolio"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."Project" ADD CONSTRAINT "Project_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES "castfolio"."Talent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."Page" ADD CONSTRAINT "Page_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "castfolio"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."PageVersion" ADD CONSTRAINT "PageVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "castfolio"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."MediaAsset" ADD CONSTRAINT "MediaAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "castfolio"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."IntakeForm" ADD CONSTRAINT "IntakeForm_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "castfolio"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."IntakeForm" ADD CONSTRAINT "IntakeForm_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES "castfolio"."Talent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."IntakeSubmission" ADD CONSTRAINT "IntakeSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "castfolio"."IntakeForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."ProductPackage" ADD CONSTRAINT "ProductPackage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "castfolio"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."PricingPolicyVersion" ADD CONSTRAINT "PricingPolicyVersion_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "castfolio"."ProductPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."RevisionPolicy" ADD CONSTRAINT "RevisionPolicy_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "castfolio"."ProductPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."PricingChangeLog" ADD CONSTRAINT "PricingChangeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "castfolio"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."PricingChangeLog" ADD CONSTRAINT "PricingChangeLog_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "castfolio"."ProductPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."Quote" ADD CONSTRAINT "Quote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "castfolio"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."Quote" ADD CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "castfolio"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."QuoteLineItem" ADD CONSTRAINT "QuoteLineItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "castfolio"."Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."QuoteLineItem" ADD CONSTRAINT "QuoteLineItem_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "castfolio"."ProductPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."Order" ADD CONSTRAINT "Order_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "castfolio"."Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."Order" ADD CONSTRAINT "Order_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "castfolio"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "castfolio"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."OrderLineItem" ADD CONSTRAINT "OrderLineItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "castfolio"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."PaymentRecord" ADD CONSTRAINT "PaymentRecord_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "castfolio"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."RefundRecord" ADD CONSTRAINT "RefundRecord_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "castfolio"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."CommissionLedger" ADD CONSTRAINT "CommissionLedger_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "castfolio"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."CommissionLedger" ADD CONSTRAINT "CommissionLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "castfolio"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."CommissionLedger" ADD CONSTRAINT "CommissionLedger_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "castfolio"."SettlementBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."SettlementBatch" ADD CONSTRAINT "SettlementBatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "castfolio"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "castfolio"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "castfolio"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."ProjectTimeline" ADD CONSTRAINT "ProjectTimeline_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "castfolio"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."AdminNote" ADD CONSTRAINT "AdminNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "castfolio"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."PageView" ADD CONSTRAINT "PageView_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "castfolio"."Page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castfolio"."QRAsset" ADD CONSTRAINT "QRAsset_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "castfolio"."Page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Castfolio wideget-core hardening.
-- All Castfolio business tables live in the castfolio schema and are service-only by default.
-- No anon/authenticated table policies are created in this migration.
ALTER TABLE "castfolio"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."Talent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."Page" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."PageVersion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."MediaAsset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."IntakeForm" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."IntakeSubmission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."ProductPackage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."PricingPolicyVersion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."RevisionPolicy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."PricingChangeLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."Quote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."QuoteLineItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."OrderLineItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."PaymentRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."RefundRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."CommissionLedger" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."SettlementBatch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."NotificationTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."ProjectTimeline" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."AdminNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."RiskFlag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."PageView" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "castfolio"."QRAsset" ENABLE ROW LEVEL SECURITY;

-- FK/read-path indexes to avoid the known unindexed-foreign-key advisor noise.
CREATE INDEX "Talent_userId_idx" ON "castfolio"."Talent"("userId");
CREATE INDEX "Project_userId_idx" ON "castfolio"."Project"("userId");
CREATE INDEX "Project_talentId_idx" ON "castfolio"."Project"("talentId");
CREATE INDEX "PageVersion_projectId_idx" ON "castfolio"."PageVersion"("projectId");
CREATE INDEX "MediaAsset_projectId_idx" ON "castfolio"."MediaAsset"("projectId");
CREATE INDEX "IntakeForm_projectId_idx" ON "castfolio"."IntakeForm"("projectId");
CREATE INDEX "IntakeForm_talentId_idx" ON "castfolio"."IntakeForm"("talentId");
CREATE INDEX "IntakeSubmission_formId_idx" ON "castfolio"."IntakeSubmission"("formId");
CREATE INDEX "ProductPackage_userId_idx" ON "castfolio"."ProductPackage"("userId");
CREATE INDEX "PricingPolicyVersion_packageId_idx" ON "castfolio"."PricingPolicyVersion"("packageId");
CREATE INDEX "PricingChangeLog_userId_idx" ON "castfolio"."PricingChangeLog"("userId");
CREATE INDEX "PricingChangeLog_packageId_idx" ON "castfolio"."PricingChangeLog"("packageId");
CREATE INDEX "Quote_projectId_idx" ON "castfolio"."Quote"("projectId");
CREATE INDEX "Quote_userId_idx" ON "castfolio"."Quote"("userId");
CREATE INDEX "QuoteLineItem_quoteId_idx" ON "castfolio"."QuoteLineItem"("quoteId");
CREATE INDEX "QuoteLineItem_packageId_idx" ON "castfolio"."QuoteLineItem"("packageId");
CREATE INDEX "Order_projectId_idx" ON "castfolio"."Order"("projectId");
CREATE INDEX "Order_userId_idx" ON "castfolio"."Order"("userId");
CREATE INDEX "OrderLineItem_orderId_idx" ON "castfolio"."OrderLineItem"("orderId");
CREATE INDEX "PaymentRecord_orderId_idx" ON "castfolio"."PaymentRecord"("orderId");
CREATE INDEX "RefundRecord_orderId_idx" ON "castfolio"."RefundRecord"("orderId");
CREATE INDEX "CommissionLedger_orderId_idx" ON "castfolio"."CommissionLedger"("orderId");
CREATE INDEX "CommissionLedger_userId_idx" ON "castfolio"."CommissionLedger"("userId");
CREATE INDEX "CommissionLedger_settlementId_idx" ON "castfolio"."CommissionLedger"("settlementId");
CREATE INDEX "SettlementBatch_userId_idx" ON "castfolio"."SettlementBatch"("userId");
CREATE INDEX "Notification_userId_idx" ON "castfolio"."Notification"("userId");
CREATE INDEX "AuditLog_actorId_idx" ON "castfolio"."AuditLog"("actorId");
CREATE INDEX "ProjectTimeline_projectId_idx" ON "castfolio"."ProjectTimeline"("projectId");
CREATE INDEX "AdminNote_authorId_idx" ON "castfolio"."AdminNote"("authorId");

-- Common application query paths.
CREATE INDEX "Talent_userId_status_createdAt_idx" ON "castfolio"."Talent"("userId", "status", "createdAt");
CREATE INDEX "Project_userId_status_createdAt_idx" ON "castfolio"."Project"("userId", "status", "createdAt");
CREATE INDEX "Quote_userId_status_createdAt_idx" ON "castfolio"."Quote"("userId", "status", "createdAt");
CREATE INDEX "Order_userId_status_createdAt_idx" ON "castfolio"."Order"("userId", "status", "createdAt");
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "castfolio"."Notification"("userId", "isRead", "createdAt");
CREATE INDEX "IntakeSubmission_formId_createdAt_idx" ON "castfolio"."IntakeSubmission"("formId", "createdAt");

-- Storage buckets are Castfolio-specific and private by default.
-- The current app still stores public URLs, so signed-download/proxy migration is documented as a follow-up gate.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('castfolio-media', 'castfolio-media', false, 10485760, ARRAY['image/jpeg','image/jpg','image/png','image/webp']),
  ('castfolio-qr', 'castfolio-qr', false, 5242880, ARRAY['image/png','image/svg+xml','application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  updated_at = now();

