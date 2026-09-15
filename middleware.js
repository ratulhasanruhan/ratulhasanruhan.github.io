/**
 * Vercel Edge Middleware — "Markdown for Agents" content negotiation.
 *
 * Vercel resolves static files before `rewrites`, so an Accept-based rewrite
 * in vercel.json never fires for `/` (it matches index.html first). Middleware
 * runs ahead of the filesystem, so it can hand agents that ask for
 * `Accept: text/markdown` the markdown profile (ratul-hasan-ruhan.md — a copy
 * of README.md, because Vercel does not serve a root README.md) while browsers
 * keep getting HTML. GitHub Pages and Firebase ignore this file.
 */

export const config = {
  // Only the SPA routes — never assets, data files, or the markdown itself.
  matcher: [
    '/',
    '/about',
    '/resume',
    '/projects',
    '/writings',
    '/writting',
    '/research',
    '/recognition',
    '/contact',
    '/bn',
    '/bn/',
  ],
};

export default async function middleware(request) {
  const accept = request.headers.get('accept') || '';
  if (!/\btext\/markdown\b/i.test(accept)) {
    return; // fall through to the normal static response
  }

  const markdownUrl = new URL('/ratul-hasan-ruhan.md', request.url);
  const upstream = await fetch(markdownUrl, {
    headers: { accept: 'text/markdown' },
  });
  if (!upstream.ok) {
    return; // let the HTML response through rather than 500
  }

  const body = await upstream.text();
  if (/^\s*<!doctype html/i.test(body)) {
    return; // upstream misconfigured — fall through rather than mislabel HTML
  }

  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'content-language': 'en',
      'vary': 'Accept',
      'cache-control': 'public, max-age=300, s-maxage=3600',
      // Rough token estimate (~4 chars/token) so agents can budget context.
      'x-markdown-tokens': String(Math.ceil(body.length / 4)),
      'link': '<https://also.ratulruhan.cv/>; rel="alternate"; type="text/html", ' +
        '<https://also.ratulruhan.cv/ratul-hasan-ruhan.json>; rel="describedby"; type="application/ld+json"',
    },
  });
}
