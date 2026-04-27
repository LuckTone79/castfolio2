import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // i18n pathname 전달
    response.headers.set('x-pathname', request.nextUrl.pathname);

    // Supabase Auth 체크
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options });
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    });
                    response.cookies.set({ name, value, ...options });
                    response.headers.set('x-pathname', request.nextUrl.pathname);
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options });
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    });
                    response.cookies.set({ name, value: '', ...options });
                    response.headers.set('x-pathname', request.nextUrl.pathname);
                },
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();
    const pathname = request.nextUrl.pathname;

    // 보호 경로 처리
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Locale 쿼리스트링 쿠키 저장
    const hl = request.nextUrl.searchParams.get('hl');
    if (hl && ['ko', 'en', 'zh'].includes(hl)) {
        response.cookies.set('cf_locale', hl, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
