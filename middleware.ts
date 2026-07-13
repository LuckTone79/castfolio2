import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

const PROTECTED_PREFIXES = ["/app", "/admin"];
const AUTH_ROUTES = ["/login"];

// /dashboard/* was retired in favor of /app/* (v2.2.0). Old emails/bookmarks
// may still point here, so preserve the path instead of dropping it at /app.
function legacyDashboardRedirectTarget(pathname: string): string | null {
  if (pathname !== "/dashboard" && !pathname.startsWith("/dashboard/")) return null;
  const rest = pathname.slice("/dashboard".length);
  if (rest.startsWith("/builder/")) {
    return `/app/builder/project${rest.slice("/builder".length)}`;
  }
  return `/app${rest}`;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const legacyTarget = legacyDashboardRedirectTarget(pathname);
  if (legacyTarget) {
    const url = new URL(legacyTarget, request.url);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url, 308);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set(name, value);
          response = NextResponse.next({ request });
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set(name, "");
          response = NextResponse.next({ request });
          response.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = AUTH_ROUTES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
