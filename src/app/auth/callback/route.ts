import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";
  const safeNext = next.startsWith("/") ? next : "/dashboard";

  if (!code) {
    // No code present — redirect to login with error
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "oauth_callback_failed");
    return NextResponse.redirect(loginUrl);
  }

  // Build a mutable response FIRST so setAll can attach cookies to it
  const redirectUrl = new URL(safeNext, requestUrl.origin);
  // Use a temporary 200 response we can mutate, then redirect at the end
  // We need to set cookies on the actual redirect response
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Read all cookies from the incoming request (includes the PKCE code verifier)
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          // Write session cookies directly onto the redirect response
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options ?? {});
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession error:", error.message);
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "oauth_callback_failed");
    loginUrl.searchParams.set("redirect", safeNext);
    return NextResponse.redirect(loginUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    const displayName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name
          : user.email.split("@")[0];

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ supabaseUid: user.id }, { email: user.email }],
      },
    });

    if (dbUser) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          supabaseUid: user.id,
          name: dbUser.name || displayName,
        },
      });
    } else {
      await prisma.user.create({
        data: {
          email: user.email,
          name: displayName,
          supabaseUid: user.id,
        },
      });
    }
  }

  return response;
}
