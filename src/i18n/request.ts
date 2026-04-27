import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, Locale } from './config';

export default getRequestConfig(async () => {
    const headersList = headers();
    const pathname = headersList.get('x-pathname') || '';

    const i18nPaths = ['/p/', '/preview/', '/submit/', '/review/', '/quote/', '/delivered/'];
    const isI18nPath = i18nPaths.some(p => pathname.startsWith(p));

    let locale: Locale = DEFAULT_LOCALE;

    if (isI18nPath) {
        const cookieStore = cookies();
        const hlCookie = cookieStore.get('cf_locale')?.value;
        if (hlCookie && SUPPORTED_LOCALES.includes(hlCookie as Locale)) {
            locale = hlCookie as Locale;
        }
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});
