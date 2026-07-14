import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { buildAuthCallbackUrl } from "@/lib/auth-redirect";

function sanitizeRedirectPath(value: string | null, fallback: string) {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  if (value.includes("\\")) return fallback;
  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const redirect = sanitizeRedirectPath(requestUrl.searchParams.get("redirect"), "/app");
  const callbackUrl = buildAuthCallbackUrl(request.url, redirect);

  const cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }> = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookiesToSet.push({ name, value, options });
        },
        remove(name: string, options: CookieOptions) {
          cookiesToSet.push({ name, value: "", options: { ...options, maxAge: 0 } });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: { prompt: "select_account" },
    },
  });

  if (error || !data.url) {
    console.error("[auth/google] signInWithOAuth error:", error?.message ?? "Missing OAuth URL");
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "oauth_callback_failed");
    loginUrl.searchParams.set("redirect", redirect);
    return NextResponse.redirect(loginUrl);
  }

  const redirectResponse = NextResponse.redirect(data.url);
  cookiesToSet.forEach(({ name, value, options }) => {
    redirectResponse.cookies.set(name, value, options ?? {});
  });
  return redirectResponse;
}
