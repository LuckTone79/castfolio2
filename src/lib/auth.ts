import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

export async function getCurrentSessionUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentDbUser(): Promise<User | null> {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser) return null;
  return prisma.user.findUnique({
    where: { supabaseUid: sessionUser.id },
  });
}

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
