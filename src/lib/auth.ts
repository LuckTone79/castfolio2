import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "admin" | "agent";
export type UserStatus = "active" | "suspended";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  commissionRate: number;
  companyName?: string;
  brandName?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAccess {
  isAdmin: boolean;
  isAgent: boolean;
  isSuspended: boolean;
  canAccessAdmin: boolean;
  canAccessAgentApp: boolean;
  canWrite: boolean;
}

export async function getCurrentSessionUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentDbUser(): Promise<User | null> {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser) return null;

  return prisma.user.findUnique({
    where: { supabaseUid: sessionUser.id },
  });
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const dbUser = await getCurrentDbUser();
  if (!dbUser || dbUser.status === "DELETED") return null;
  return normalizeDbUser(dbUser);
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

export async function requireAgentAppProfile(): Promise<UserProfile> {
  const profile = await getCurrentUserProfile();
  if (!profile) throw new Error("UNAUTHORIZED");
  if (!canAccessAgentApp(profile)) throw new Error("FORBIDDEN");
  return profile;
}

export async function requireAdminProfile(): Promise<UserProfile> {
  const profile = await getCurrentUserProfile();
  if (!profile) throw new Error("UNAUTHORIZED");
  if (!canAccessAdmin(profile)) throw new Error("FORBIDDEN");
  return profile;
}

export function getUserAccess(profile: UserProfile): UserAccess {
  const isAdminUser = profile.role === "admin";
  const isAgentUser = profile.role === "agent";
  const suspended = profile.status === "suspended";

  return {
    isAdmin: isAdminUser,
    isAgent: isAgentUser,
    isSuspended: suspended,
    canAccessAdmin: isAdminUser && !suspended,
    canAccessAgentApp: isAdminUser || isAgentUser,
    canWrite: !suspended,
  };
}

export function isAdmin(profile: UserProfile) {
  return getUserAccess(profile).isAdmin;
}

export function isAgent(profile: UserProfile) {
  return getUserAccess(profile).isAgent;
}

export function isSuspended(profile: UserProfile) {
  return getUserAccess(profile).isSuspended;
}

export function canAccessAdmin(profile: UserProfile) {
  return getUserAccess(profile).canAccessAdmin;
}

export function canAccessAgentApp(profile: UserProfile) {
  return getUserAccess(profile).canAccessAgentApp;
}

export function canWrite(profile: UserProfile) {
  return getUserAccess(profile).canWrite;
}

function normalizeDbUser(user: User): UserProfile {
  return {
    id: user.id,
    email: user.email,
    displayName: user.name || user.email.split("@")[0] || "사용자",
    role: user.role === "MASTER_ADMIN" ? "admin" : "agent",
    status: user.status === "SUSPENDED" ? "suspended" : "active",
    commissionRate: Number(user.commissionRate),
    companyName: user.company ?? undefined,
    brandName: user.company ?? undefined,
    contactEmail: user.email,
    contactPhone: user.phone ?? undefined,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
