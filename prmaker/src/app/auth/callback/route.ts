import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncSupabaseUser } from "@/lib/auth/sync-supabase-user";

function getSafeNext(nextValue: string | null) {
  if (!nextValue || !nextValue.startsWith("/")) {
    return "/dashboard/onboarding";
  }

  return nextValue;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const providerError = requestUrl.searchParams.get("error");
  const providerErrorDescription = requestUrl.searchParams.get("error_description");
  const safeNext = getSafeNext(requestUrl.searchParams.get("next"));

  if (providerError) {
    console.error("[prmaker/auth/callback] provider error:", providerError, providerErrorDescription);
    return NextResponse.redirect(new URL("/login?error=oauth_callback_failed", request.url));
  }

  if (!code) {
    console.error("[prmaker/auth/callback] missing OAuth code");
    return NextResponse.redirect(new URL("/login?error=oauth_callback_failed", request.url));
  }

  const supabase = createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("[prmaker/auth/callback] exchangeCodeForSession error:", exchangeError.message);
    return NextResponse.redirect(new URL("/login?error=oauth_callback_failed", request.url));
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    console.error("[prmaker/auth/callback] getUser error:", userError?.message ?? "missing user");
    return NextResponse.redirect(new URL("/login?error=oauth_callback_failed", request.url));
  }

  try {
    await syncSupabaseUser(user);
  } catch (error) {
    console.error("[prmaker/auth/callback] profile sync error:", error);
    return NextResponse.redirect(new URL("/login?error=profile_sync_failed", request.url));
  }

  return NextResponse.redirect(new URL(safeNext, request.url));
}
