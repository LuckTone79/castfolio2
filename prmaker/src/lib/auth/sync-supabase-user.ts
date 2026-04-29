import type { User as SupabaseUser } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function syncSupabaseUser(user: SupabaseUser) {
  if (!user.email) {
    throw new Error("Supabase user email is required");
  }

  const displayName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : user.email.split("@")[0];

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ supabaseUid: user.id }, { email: user.email }],
    },
  });

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data: {
        supabaseUid: user.id,
        name: existingUser.name || displayName,
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
