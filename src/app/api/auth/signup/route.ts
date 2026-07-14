import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { buildAuthCallbackUrl } from "@/lib/auth-redirect";
import { ensureDbUserForSupabaseUser } from "@/lib/auth-profile";

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getCookie(request: Request, name: string) {
  return request.headers
    .get("cookie")
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown; redirect?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isValidEmail(body.email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  if (typeof body.password !== "string" || body.password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const email = body.email;
  const password = body.password;
  const redirect =
    typeof body.redirect === "string" && body.redirect.startsWith("/") && !body.redirect.startsWith("//")
      ? body.redirect
      : "/app";
  const response = NextResponse.json({ ok: true, needsConfirmation: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return getCookie(request, name);
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: buildAuthCallbackUrl(request.url, redirect).toString(),
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data.session && data.user) {
    await ensureDbUserForSupabaseUser(data.user);
    const signedInResponse = NextResponse.json({ ok: true, needsConfirmation: false });
    response.cookies.getAll().forEach((cookie) => signedInResponse.cookies.set(cookie));
    return signedInResponse;
  }

  return response;
}
