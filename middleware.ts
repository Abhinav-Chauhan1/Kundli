import { NextRequest, NextResponse } from 'next/server';

const LOCALES = ['en', 'hi'];
const DEFAULT_LOCALE = 'en';

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookie && LOCALES.includes(cookie)) return cookie;

  const acceptLang = request.headers.get('Accept-Language');
  if (acceptLang) {
    const lang = acceptLang.split(',')[0].split('-')[0].toLowerCase();
    if (LOCALES.includes(lang)) return lang;
  }

  return DEFAULT_LOCALE;
}

export default function middleware(request: NextRequest) {
  const locale = detectLocale(request);
  const response = NextResponse.next();
  response.headers.set('x-next-intl-locale', locale);
  if (!request.cookies.get('NEXT_LOCALE')) {
    response.cookies.set('NEXT_LOCALE', locale, {
      maxAge: 31536000,
      sameSite: 'lax',
      path: '/',
    });
  }
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
