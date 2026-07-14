import type { User as SupabaseUser } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function ensureDbUserForSupabaseUser(user: SupabaseUser) {
  if (!user.email) return null;

  const displayName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : user.email.split("@")[0] || "User";

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [{ supabaseUid: user.id }, { email: user.email }],
    },
  });

  if (dbUser) {
    return prisma.user.update({
      where: { id: dbUser.id },
      data: {
        supabaseUid: user.id,
        name: dbUser.name || displayName,
      },
    });
  }

  return prisma.user.create({
    data: {
      email: user.email,
      name: displayName,
      supabaseUid: user.id,
    },
  });
}
