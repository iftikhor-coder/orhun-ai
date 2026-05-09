import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always',
});

// Maxfiy kalit — siz bu URL bilan kirsangiz, sayt sizga ochiladi:
// https://orhun-ai.vercel.app/?key=orhun-admin-2026
const BYPASS_KEY = 'orhun-admin-2026';
const COOKIE_NAME = 'orhun-bypass';

export default function middleware(request: NextRequest) {
  const isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE === 'true';
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Bypass orqali kirish (URL'da ?key=...)
  const bypassParam = url.searchParams.get('key');
  if (bypassParam === BYPASS_KEY) {
    const cleanUrl = new URL(pathname, url);
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(COOKIE_NAME, 'true', {
      maxAge: 60 * 60 * 24 * 30, // 30 kun
      sameSite: 'lax',
      path: '/',
    });
    return response;
  }

  // Cookie tekshirish
  const hasBypass = request.cookies.get(COOKIE_NAME)?.value === 'true';

  // Maintenance rejimi — bypass bo'lmasa, maintenance sahifaga yo'naltirish
  if (isMaintenance && !hasBypass) {
    const isMaintenancePage = locales.some((l) => pathname === `/${l}/maintenance`);
    if (!isMaintenancePage) {
      const locale = locales.find((l) => pathname.startsWith(`/${l}/`)) || 'en';
      return NextResponse.redirect(new URL(`/${locale}/maintenance`, url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
