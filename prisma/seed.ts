import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create Master Admin user (Supabase Auth에서 먼저 계정 생성 후 UID 입력)
  const adminSupabaseUid = process.env.SEED_ADMIN_SUPABASE_UID;
  if (!adminSupabaseUid) {
    console.log("SEED_ADMIN_SUPABASE_UID not set, skipping admin seed.");
    return;
  }

  const admin = await prisma.user.upsert({
    where: { supabaseUid: adminSupabaseUid },
    update: {},
    create: {
      email: process.env.SEED_ADMIN_EMAIL || "admin@castfolio.com",
      name: "Master Admin",
      role: "MASTER_ADMIN",
      supabaseUid: adminSupabaseUid,
      commissionRate: 0.15,
    },
  });

  console.log("Seeded admin:", admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
