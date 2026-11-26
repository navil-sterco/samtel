import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { API_URL } from './config/config';

function buildCsp(nonce: string, isDev: boolean): string {
  const apiOrigin = API_URL ? new URL(API_URL).origin : '';

  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'
      https://cdn.example.com
      https://cdn.keka.com
      https://www.google.com
      https://www.gstatic.com
      https://www.recaptcha.net
      https://www.googletagmanager.com
      https://www.google-analytics.com
      https://cdn.jsdelivr.net
      ${isDev ? "'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline'
      https://fonts.googleapis.com
      https://cdn.jsdelivr.net
      https://cdn.keka.com;
    img-src 'self' data: blob: https:;
    media-src 'self' https:;
    font-src 'self'
      https://fonts.gstatic.com
      https://cdn.jsdelivr.net
      https://cdn.keka.com
      data:;
    connect-src 'self'
      ${apiOrigin}
      https://project-demo.in
      https://*.keka.com
      https://www.google-analytics.com
      https://analytics.google.com
      https://stats.g.doubleclick.net
      https://www.gstatic.com
      https://www.recaptcha.net
      https://*.clarity.ms;
    frame-src 'self'
      https://www.youtube.com
      https://youtube.com
      https://www.youtube-nocookie.com
      https://youtube-nocookie.com
      https://www.google.com
      https://www.gstatic.com
      https://www.recaptcha.net
      https://samtel.keka.com
      https://maps.google.com
      https://www.google.com/maps/
      https://maps.googleapis.com
      https://www.googletagmanager.com;
    frame-ancestors 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  `
    .replace(/\s{2,}/g, ' ')
    .trim();
}


// Per-instance cache of redirect lookups so repeat hits skip the API call.
const REDIRECT_TTL_MS = 60_000;
const redirectCache = new Map<string, { value: unknown; expires: number }>();

function toInternalTarget(
  newUrl: string,
  request: NextRequest
): { pathname: string; search: string } | null {
  try {
    // For relative values, resolve against the current origin
    const base = request.nextUrl.origin + '/';
    const target = new URL(newUrl.trim(), base);

    // Treat www and non-www as the same site
    const strip = (h: string) => h.toLowerCase().replace(/^www\./, '');
    if (strip(target.hostname) !== strip(request.nextUrl.hostname)) {
      return null; // external redirect, reject
    }

    return { pathname: target.pathname, search: target.search };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDev = process.env.NODE_ENV === 'development';
  const nonce = btoa(crypto.randomUUID()).replace(/=/g, '');
  const cspHeader = buildCsp(nonce, isDev);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set('Content-Security-Policy', cspHeader);

  // Lowercase so "/Careers.html" matches the same redirect as "/careers.html"
  const slug = pathname.replace(/^\/+/, '').toLowerCase();
  if (!slug) {
    response.headers.set('x-pathname', pathname);
    return response;
  }

  try {
    if (!API_URL) {
      throw new Error('NEXT_PUBLIC_API_URL is not configured');
    }

    const apiUrl = `${API_URL}redirect/${slug}`;
    const cached = redirectCache.get(slug);
    let json: unknown;

    if (cached && cached.expires > Date.now()) {
      json = cached.value;
    } else {
      const res = await fetch(apiUrl, {
        cache: 'no-store',
        signal: AbortSignal.timeout(2500), // never let a slow API stall the page
      });
      json = res.ok ? await res.json() : null;
      if (redirectCache.size > 500) redirectCache.clear();
      redirectCache.set(slug, { value: json, expires: Date.now() + REDIRECT_TTL_MS });
    }

    if (json) {

      if (
        typeof json === 'object' &&
        json !== null &&
        'success' in json &&
        json.success === true &&
        'data' in json &&
        typeof json.data === 'object' &&
        json.data !== null &&
        'new_url' in json.data &&
        typeof json.data.new_url === 'string'
      ) {
        const target = toInternalTarget(json.data.new_url, request);

        if (target && target.pathname !== pathname) {
          const redirectUrl = request.nextUrl.clone();
          if (
            request.nextUrl.hostname === 'samtelavionics.com' ||
            request.nextUrl.hostname === 'www.samtelavionics.com'
          ) {
            redirectUrl.hostname = 'www.samtelavionics.com';
          }
          redirectUrl.pathname = target.pathname;
          redirectUrl.search = target.search;

          const redirectResponse = NextResponse.redirect(redirectUrl, 301);
          redirectResponse.headers.set('x-pathname', pathname);
          redirectResponse.headers.set('Content-Security-Policy', cspHeader);
          return redirectResponse;
        }
      }
    }
  } catch (err) {
    console.error('Redirect API error:', err);
  }

  response.headers.set('x-pathname', pathname);

  return response;
}

export const config = {
  // Skip static files: they never need a CSP nonce or a redirect lookup, and
  // without this every image/script request triggered an API round-trip.
  matcher: [
    '/((?!_next/|assets/|js/|api/|favicon\\.ico|robots\\.txt|llms\\.txt|sitemap.*\\.xml|.*\\.(?:png|jpe?g|gif|webp|avif|svg|ico|mp4|webm|woff2?|ttf|otf|css|js|map|txt|xml|json|pdf)$).*)',
  ],
};