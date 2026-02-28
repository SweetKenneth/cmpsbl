/**
 * vite-seo-prerender — Build-time static HTML shell generation
 * 
 * Generates per-route index.html files with correct SEO meta tags
 * so crawlers (Googlebot, Bingbot, etc.) get real metadata without
 * waiting for JS hydration.
 * 
 * How it works:
 * 1. After Vite build completes, reads dist/index.html as template
 * 2. For each route in seoMap, creates dist/<route>/index.html
 * 3. Each file has the correct <title>, meta description, OG tags,
 *    Twitter cards, and canonical URL swapped in
 * 4. The React app still hydrates normally on top
 * 
 * No puppeteer, no headless browser — just string replacement.
 */

import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

interface PrerenderedRoute {
  path: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  keywords: string[];
  canonical?: string;
  noindex?: boolean;
}

interface SeoPreRenderOptions {
  /** Base URL for canonical/OG URLs */
  baseUrl: string;
  /** Routes to prerender — pulled from seoMap at build time */
  routes: PrerenderedRoute[];
  /** Optional: additional static content to inject into <body> for each route */
  bodyContent?: (route: PrerenderedRoute) => string;
}

/**
 * Replace meta tag content by attribute selector
 */
function replaceMeta(html: string, attr: string, value: string, content: string): string {
  // Match meta tags with the specified attribute
  const regex = new RegExp(
    `(<meta\\s+(?:[^>]*?)${attr}="${value}"\\s+content=")([^"]*)(")`,
    'i'
  );
  const regexReverse = new RegExp(
    `(<meta\\s+content=")([^"]*)(\\s*"\\s+${attr}="${value}")`,
    'i'
  );
  
  if (regex.test(html)) {
    return html.replace(regex, `$1${content}$3`);
  }
  if (regexReverse.test(html)) {
    return html.replace(regexReverse, `$1${content}$3`);
  }
  return html;
}

/**
 * Replace or insert a meta tag by name or property
 */
function setMeta(html: string, type: 'name' | 'property', key: string, content: string): string {
  const escaped = content.replace(/"/g, '&quot;');
  const result = replaceMeta(html, type, key, escaped);
  return result;
}

function generateRouteHtml(template: string, route: PrerenderedRoute, baseUrl: string): string {
  let html = template;

  // 1. Replace <title>
  html = html.replace(
    /<title>[^<]*<\/title>/i,
    `<title>${route.title}</title>`
  );

  // 2. Meta description
  html = setMeta(html, 'name', 'description', route.description);

  // 3. Keywords
  if (route.keywords.length > 0) {
    html = setMeta(html, 'name', 'keywords', route.keywords.join(', '));
  }

  // 4. Open Graph
  html = setMeta(html, 'property', 'og:title', route.ogTitle);
  html = setMeta(html, 'property', 'og:description', route.ogDescription);
  html = setMeta(html, 'property', 'og:url', `${baseUrl}${route.path === '/' ? '' : route.path}`);
  if (route.ogImage) {
    html = setMeta(html, 'property', 'og:image', route.ogImage);
    html = setMeta(html, 'property', 'og:image:secure_url', route.ogImage);
  }

  // 5. Twitter Card
  html = setMeta(html, 'name', 'twitter:title', route.ogTitle);
  html = setMeta(html, 'name', 'twitter:description', route.ogDescription);
  if (route.ogImage) {
    html = setMeta(html, 'name', 'twitter:image', route.ogImage);
  }

  // 6. Canonical URL
  const canonicalUrl = route.canonical || `${baseUrl}${route.path === '/' ? '' : route.path}`;
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  // 7. Robots (noindex if specified)
  if (route.noindex) {
    html = setMeta(html, 'name', 'robots', 'noindex, nofollow');
    html = setMeta(html, 'name', 'googlebot', 'noindex, nofollow');
  }

  // 8. Inject a hidden semantic content block for crawlers
  // This gives bots real text content even before React hydrates
  const semanticBlock = `
    <noscript>
      <div id="seo-fallback" style="padding:2rem;max-width:800px;margin:0 auto">
        <h1>${escapeHtml(route.title)}</h1>
        <p>${escapeHtml(route.description)}</p>
        <p><a href="${baseUrl}">Return to CMPSBL</a></p>
      </div>
    </noscript>`;
  
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root"></div>${semanticBlock}`
  );

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function seoPrerender(options: SeoPreRenderOptions): Plugin {
  return {
    name: 'vite-seo-prerender',
    apply: 'build',
    enforce: 'post',

    closeBundle: {
      sequential: true,
      async handler() {
        const distDir = path.resolve(process.cwd(), 'dist');
        const templatePath = path.join(distDir, 'index.html');

        if (!fs.existsSync(templatePath)) {
          console.warn('[seo-prerender] dist/index.html not found, skipping prerender');
          return;
        }

        const template = fs.readFileSync(templatePath, 'utf-8');
        let generated = 0;

        for (const route of options.routes) {
          // Skip root — it already has index.html
          if (route.path === '/') {
            // Still update the root index.html with correct meta
            const rootHtml = generateRouteHtml(template, route, options.baseUrl);
            fs.writeFileSync(templatePath, rootHtml, 'utf-8');
            generated++;
            continue;
          }

          // Create directory structure: /about -> dist/about/index.html
          const routeDir = path.join(distDir, route.path.replace(/^\//, ''));
          fs.mkdirSync(routeDir, { recursive: true });

          const routeHtml = generateRouteHtml(template, route, options.baseUrl);
          const outputPath = path.join(routeDir, 'index.html');
          
          // Don't overwrite if a file already exists (e.g., from a real page component)
          if (!fs.existsSync(outputPath)) {
            fs.writeFileSync(outputPath, routeHtml, 'utf-8');
            generated++;
          }
        }

        console.log(`[seo-prerender] Generated ${generated} static HTML shells for ${options.routes.length} routes`);
      }
    }
  };
}
