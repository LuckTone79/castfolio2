import { NextResponse } from "next/server";
import { getCurrentSessionUser } from "@/lib/auth";
import { syncSupabaseUser } from "@/lib/auth/sync-supabase-user";

export async function POST() {
  const user = await getCurrentSessionUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const syncedUser = await syncSupabaseUser(user);

  return NextResponse.json({ ok: true, userId: syncedUser.id });
}
