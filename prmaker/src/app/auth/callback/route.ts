import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard/onboarding";
  const safeNext = next.startsWith("/") ? next : "/dashboard/onboarding";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth_callback_failed", request.url));
  }

  // Build redirect response FIRST — so setAll() can attach session cookies to it
  const redirectUrl = new URL(safeNext, requestUrl.origin);
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Read PKCE code verifier from the incoming request cookies
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          // Write the session cookies onto the redirect response
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options ?? {});
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[prmaker/auth/callback] exchangeCodeForSession error:", error.message);
    return NextResponse.redirect(new URL("/login?error=oauth_callback_failed", request.url));
  }

  return response;
}

