import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

// This seed creates test data WITHOUT creating Supabase auth users
// (those need to be created separately via Supabase dashboard)
// Instead, it inserts DB users with placeholder supabaseUids

const PLACEHOLDER_ADMIN_UID = "00000000-0000-0000-0000-000000000001";
const PLACEHOLDER_USER1_UID = "00000000-0000-0000-0000-000000000002";
const PLACEHOLDER_USER2_UID = "00000000-0000-0000-0000-000000000003";

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up existing data
  await prisma.pageView.deleteMany();
  await prisma.qRAsset.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.projectTimeline.deleteMany();
  await prisma.commissionLedger.deleteMany();
  await prisma.orderLineItem.deleteMany();
  await prisma.paymentRecord.deleteMany();
  await prisma.refundRecord.deleteMany();
  await prisma.order.deleteMany();
  await prisma.quoteLineItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.intakeSubmission.deleteMany();
  await prisma.intakeForm.deleteMany();
  await prisma.pageVersion.deleteMany();
  await prisma.page.deleteMany();
  await prisma.project.deleteMany();
  await prisma.talent.deleteMany();
  await prisma.pricingChangeLog.deleteMany();
  await prisma.revisionPolicy.deleteMany();
  await prisma.pricingPolicyVersion.deleteMany();
  await prisma.productPackage.deleteMany();
  await prisma.riskFlag.deleteMany();
  await prisma.adminNote.deleteMany();
  await prisma.settlementBatch.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationTemplate.deleteMany();
  await prisma.user.deleteMany();

  // =====================
  // Users
  // =====================
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@castfolio.com",
      name: "시스템 관리자",
      role: "MASTER_ADMIN",
      supabaseUid: PLACEHOLDER_ADMIN_UID,
      status: "ACTIVE",
      commissionRate: 0.15,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: "partner1@castfolio.com",
      name: "김파트너",
      role: "USER",
      userType: "INDIVIDUAL",
      supabaseUid: PLACEHOLDER_USER1_UID,
      status: "ACTIVE",
      commissionRate: 0.15,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "partner2@castfolio.com",
      name: "박에이전시",
      role: "USER",
      userType: "SOLE_PROPRIETOR",
      company: "박에이전시",
      supabaseUid: PLACEHOLDER_USER2_UID,
      status: "ACTIVE",
      commissionRate: 0.12,
    },
  });

  console.log("✅ Users created");

  // =====================
  // Product packages for user1
  // =====================
  const packages = [
    { name: "기본형 PR 페이지", price: 300000, desc: "기본 구성의 PR 페이지" },
    { name: "프리미엄 PR 페이지", price: 500000, desc: "프리미엄 구성, 다국어 지원" },
    { name: "다국어 PR 페이지", price: 700000, desc: "한/영/중 완전 지원 풀옵션" },
  ];

  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i];
    await prisma.productPackage.create({
      data: {
        userId: user1.id,
        name: pkg.name,
        description: pkg.desc,
        isTemplate: true,
        isActive: true,
        sortOrder: i,
        pricingVersions: {
          create: { versionNumber: 1, basePrice: pkg.price, isActive: true },
        },
      },
    });
  }

  console.log("✅ Product packages created");

  // =====================
  // Talents
  // =====================
  const talent1 = await prisma.talent.create({
    data: {
      userId: user1.id,
      nameKo: "김유나",
      nameEn: "Kim Yuna",
      position: "쇼호스트",
      email: "yuna@example.com",
    },
  });

  const talent2 = await prisma.talent.create({
    data: {
      userId: user1.id,
      nameKo: "이정수",
      nameEn: "Lee Jungsu",
      position: "아나운서",
      email: "jungsu@example.com",
    },
  });

  const talent3 = await prisma.talent.create({
    data: {
      userId: user2.id,
      nameKo: "박소연",
      nameEn: "Park Soyeon",
      position: "MC",
    },
  });

  const talent4 = await prisma.talent.create({
    data: {
      userId: user2.id,
      nameKo: "최민준",
      nameEn: "Choi Minjun",
      position: "리포터",
    },
  });

  console.log("✅ Talents created");

  // =====================
  // Projects
  // =====================
  const project1 = await prisma.project.create({
    data: {
      userId: user1.id,
      talentId: talent1.id,
      name: "김유나 쇼호스트 PR 페이지",
      status: "DRAFTING",
      intakeMode: "SELF_SUBMISSION",
    },
  });

  const project2 = await prisma.project.create({
    data: {
      userId: user1.id,
      talentId: talent2.id,
      name: "이정수 아나운서 PR 페이지",
      status: "COLLECTING_MATERIALS",
      intakeMode: "OPERATOR_ENTRY",
    },
  });

  const project3 = await prisma.project.create({
    data: {
      userId: user2.id,
      talentId: talent3.id,
      name: "박소연 MC PR 페이지",
      status: "DELIVERED",
    },
  });

  const project4 = await prisma.project.create({
    data: {
      userId: user2.id,
      talentId: talent4.id,
      name: "최민준 리포터 PR 페이지",
      status: "NEW",
    },
  });

  console.log("✅ Projects created");

  // =====================
  // Pages (demo data for each theme)
  // =====================
  const demoContent = {
    hero: {
      tagline: "10년 경력의 홈쇼핑 전문 쇼호스트",
      position: "Show Host · 쇼호스트",
      heroImageId: "",
      ctaPrimary: { label: "포트폴리오 보기", action: "portfolio" },
      ctaSecondary: { label: "연락하기", action: "contact" },
    },
    profile: {
      intro: "안녕하세요, 김유나입니다. 10년간 국내 주요 홈쇼핑 채널에서 뷰티, 라이프스타일 분야 전문 쇼호스트로 활동해 왔습니다.",
      profileImageId: "",
      infoItems: [{ label: "경력", value: "10년" }, { label: "전문분야", value: "뷰티" }],
      strengths: [{ icon: "💄", label: "뷰티 전문" }],
    },
    career: { items: [{ period: "2020-현재", title: "GS홈쇼핑 전속 쇼호스트", description: "뷰티/라이프스타일 전문 채널 담당" }] },
    portfolio: { videos: [], photos: [], audioSamples: [] },
    strength: { cards: [{ icon: "🏆", title: "판매 전문가", description: "10년간 쌓은 판매 노하우" }] },
    contact: { channels: [{ type: "email", value: "demo@castfolio.com", label: "이메일 문의" }] },
  };

  // Create page for project1
  await prisma.page.create({
    data: {
      projectId: project1.id,
      slug: "kim-yuna-demo",
      theme: "soft-blush",
      status: "PREVIEW",
      contentKo: demoContent,
      contentEn: demoContent,
      contentCn: demoContent,
      draftContent: { ko: demoContent, en: demoContent, zh: demoContent },
    },
  });

  // Create published page for project3
  await prisma.page.create({
    data: {
      projectId: project3.id,
      slug: "park-soyeon-mc",
      theme: "anchor-clean",
      status: "PUBLISHED",
      publishedAt: new Date(),
      noindex: false,
      contentKo: demoContent,
      contentEn: demoContent,
      contentCn: demoContent,
    },
  });

  console.log("✅ Pages created");

  // =====================
  // Notification Templates
  // =====================
  const templates = [
    { type: "intake_complete", titleKo: "자료 제출 완료", titleEn: "Materials Submitted", bodyKo: "{talentName}이 자료를 제출했습니다.", bodyEn: "{talentName} has submitted their materials." },
    { type: "review_requested", titleKo: "검토 요청", titleEn: "Review Requested", bodyKo: "{talentName}에게 검토 링크를 발송했습니다.", bodyEn: "Review link sent to {talentName}." },
    { type: "revision_requested", titleKo: "수정 요청 도착", titleEn: "Revision Requested", bodyKo: "{talentName}: {note}", bodyEn: "{talentName}: {note}" },
    { type: "quote_sent", titleKo: "견적 발송 완료", titleEn: "Quote Sent", bodyKo: "{talentName}에게 견적을 발송했습니다.", bodyEn: "Quote sent to {talentName}." },
    { type: "payment_complete", titleKo: "결제 확인 완료", titleEn: "Payment Confirmed", bodyKo: "{orderNumber} 결제가 확인되었습니다.", bodyEn: "Payment confirmed for {orderNumber}." },
    { type: "delivery_complete", titleKo: "납품 완료", titleEn: "Delivery Complete", bodyKo: "{talentName}의 PR 페이지가 배포되었습니다.", bodyEn: "{talentName}'s PR page has been published." },
    { type: "settlement_complete", titleKo: "정산 완료", titleEn: "Settlement Complete", bodyKo: "{period} 정산이 완료되었습니다.", bodyEn: "Settlement for {period} is complete." },
    { type: "settlement_overdue", titleKo: "정산 연체", titleEn: "Settlement Overdue", bodyKo: "{period} 정산이 연체되었습니다.", bodyEn: "Settlement for {period} is overdue." },
    { type: "unconfirmed_30days", titleKo: "30일 미확정 경고", titleEn: "30-Day Unconfirmed", bodyKo: "{projectName} 프로젝트가 30일 이상 미확정 상태입니다.", bodyEn: "Project {projectName} has been unconfirmed for 30 days." },
    { type: "admin_notice", titleKo: "운영 공지", titleEn: "Admin Notice", bodyKo: "{message}", bodyEn: "{message}" },
    { type: "intake_complete_proxy", titleKo: "자료 제출 완료 (대리 알림)", titleEn: "Materials Submitted (Proxy)", bodyKo: "방송인 {talentName}에게 직접 전달해주세요: 자료가 제출되었습니다.", bodyEn: "Please relay to talent {talentName}: materials submitted." },
  ];

  for (const t of templates) {
    await prisma.notificationTemplate.create({
      data: {
        type: t.type,
        titleKo: t.titleKo,
        titleEn: t.titleEn,
        titleCn: t.titleKo,
        bodyKo: t.bodyKo,
        bodyEn: t.bodyEn,
        bodyCn: t.bodyKo,
      },
    });
  }

  console.log("✅ Notification templates created");

  console.log("\n🎉 Seed complete!");
  console.log("\n📌 Note: Supabase Auth users need to be created separately.");
  console.log("   Then update supabaseUid values in the User table.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
