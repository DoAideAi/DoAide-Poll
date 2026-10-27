#!/usr/bin/env node
/**
 * prerender-routes.mjs
 *
 * Generates static HTML snapshots for each static route so search-engine
 * crawlers that do NOT execute JavaScript still see full <head> meta and
 * body content.
 *
 * Usage:
 *   1. npm run build          (produces dist/)
 *   2. node scripts/prerender-routes.mjs
 *
 * What it does:
 *   - Reads routeMeta.js for the list of static routes and their SEO data.
 *   - For each route, copies dist/index.html and injects the correct
 *     <title>, <meta>, <link rel="canonical">, Open Graph, Twitter Card,
 *     and JSON-LD into the <head>.
 *   - Writes the result to dist/<route>/index.html (e.g. dist/create/index.html).
 *
 * Dynamic routes (/poll/:id) are NOT prerendered — they rely on the
 * useSEO hook at runtime (and ideally server-side rendering or a
 * prerender service in production).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'dist');
const TEMPLATE = readFileSync(resolve(DIST, 'index.html'), 'utf-8');

const SITE = 'https://poll.doaide.com';
const SITE_NAME = 'DoAide Poll';
const OG_IMAGE = `${SITE}/og-image.png`;

/**
 * Route metadata — kept in sync with src/routeMeta.js.
 * We duplicate it here to avoid importing ESM with JSX tooling at build time.
 */
const routes = {
  '/': {
    title: 'DoAide Poll — Free Online Poll & Survey Creator',
    description:
      'Create free polls and surveys in seconds. Share with anyone and get instant results. No login required. Perfect for teams, classrooms, events, and social media.',
    canonical: `${SITE}/`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: SITE_NAME,
      url: SITE,
      description:
        'Create free polls and surveys in seconds. Share with anyone and get instant results. No login required.',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      creator: { '@type': 'Organization', name: 'DoAide', url: 'https://doaide.com' },
    },
  },
  '/create': {
    title: 'Create a Free Poll — DoAide Poll',
    description:
      'Build a poll or survey in under 15 seconds. Add multiple-choice, text, rating, or yes/no questions. Share via link, WhatsApp, or embed on your website.',
    canonical: `${SITE}/create`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Create a Free Poll',
      url: `${SITE}/create`,
      description:
        'Build a poll or survey in under 15 seconds. Add multiple-choice, text, rating, or yes/no questions.',
      isPartOf: { '@type': 'WebApplication', name: SITE_NAME, url: SITE },
    },
  },
};

function injectMeta(html, meta) {
  // Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);

  // Replace description
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${meta.description}" />`
  );

  // Replace canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${meta.canonical}" />`
  );

  // Replace OG tags
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${meta.title}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${meta.description}" />`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${meta.canonical}" />`
  );

  // Replace Twitter tags
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${meta.title}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${meta.description}" />`
  );

  // Inject JSON-LD before </head>
  if (meta.jsonLd) {
    const jsonLdTag = `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`;
    html = html.replace('</head>', `    ${jsonLdTag}\n  </head>`);
  }

  return html;
}

console.log('Prerendering static routes...\n');

for (const [route, meta] of Object.entries(routes)) {
  const html = injectMeta(TEMPLATE, meta);

  // "/" → dist/index.html (already there, overwrite with enriched version)
  // "/create" → dist/create/index.html
  const outDir = route === '/' ? DIST : resolve(DIST, route.slice(1));
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const outFile = resolve(outDir, 'index.html');
  writeFileSync(outFile, html, 'utf-8');
  console.log(`  ✓ ${route} → ${outFile}`);
}

// Route each prerendered URL to its own index.html, with the SPA fallback
// last. `serve -s` would put its own catch-all first and shadow these, so the
// web unit runs plain `serve dist`. serve-handler re-applies the remaining
// rewrites to a rewritten path, so the fallback only matches dot-free paths.
const serveConfig = {
  rewrites: [
    ...Object.keys(routes)
      .filter((path) => path !== '/')
      .map((path) => ({ source: path, destination: `${path}/index.html` })),
    { source: '/:path([^.]+)', destination: '/index.html' },
  ],
  headers: [
    { source: '/assets/**', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
  ],
};
writeFileSync(resolve(DIST, 'serve.json'), JSON.stringify(serveConfig, null, 2) + '\n');

console.log('\nDone! Static routes prerendered.');
