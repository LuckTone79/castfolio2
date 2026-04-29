import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

export const getCurrentSessionUser = cache(async () => {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("[auth] getUser failed:", error.message);
      return null;
    }

    return user;
  } catch (error) {
    console.error("[auth] unexpected getUser failure:", error);
    return null;
  }
});

export const getCurrentDbUser = cache(async (): Promise<User | null> => {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser) return null;

  return prisma.user.findUnique({
    where: { supabaseUid: sessionUser.id },
  });
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentDbUser();
  if (!user) throw new Error("UNAUTHORIZED");
  if (user.status === "SUSPENDED") throw new Error("SUSPENDED");
  if (user.status === "DELETED") throw new Error("DELETED");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "MASTER_ADMIN") throw new Error("FORBIDDEN");
  return user;
}
