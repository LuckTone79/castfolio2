import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATH_PREFIXES = ["/dashboard", "/admin"];
const AUTH_COOKIE_PREFIXES = ["castfolio-auth", "sb-"];

function hasAuthCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some(({ name }) => AUTH_COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix)));
}

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("x-pathname", request.nextUrl.pathname);

  const pathname = request.nextUrl.pathname;

  if (PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix)) && !hasAuthCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const hl = request.nextUrl.searchParams.get("hl");
  if (hl && ["ko", "en", "zh"].includes(hl)) {
    response.cookies.set("cf_locale", hl, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
