import { NextRequest, NextResponse } from "next/server";

const VALID_LOCALES = ["ko", "en", "zh"];

// POST /api/locale — cf_locale 쿠키 설정
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { locale } = body as { locale?: string };

  if (!locale || !VALID_LOCALES.includes(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, locale });
  response.cookies.set("cf_locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1년
    sameSite: "lax",
    httpOnly: false,
  });
  return response;
}
