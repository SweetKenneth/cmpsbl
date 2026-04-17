/**
 * prerender-routes.ts — Build-time route list derived from seoMap.
 *
 * IMPORTANT: this file is NO LONGER manually maintained. It pulls
 * directly from src/lib/seo/seoMap.ts at build time so adding a new
 * route in seoMap automatically generates a static HTML shell with
 * the correct OG image, title, and description for social scrapers
 * (iMessage, Twitter/X, Slack, Discord, LinkedIn, Facebook).
 *
 * Why static shells matter: iMessage and most preview bots do NOT
 * execute JavaScript. They read OG tags from the raw HTML the server
 * returns. Without a per-route shell, every page falls back to the
 * single index.html OG image — the bug we just fixed.
 */

import { seoMap, type PageSEO } from '../src/lib/seo/seoMap';

interface PrerenderRoute {
  path: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  keywords: string[];
  noindex?: boolean;
}

function toPrerender(path: string, entry: PageSEO): PrerenderRoute {
  return {
    path,
    title: entry.title,
    description: entry.description,
    ogTitle: entry.ogTitle,
    ogDescription: entry.ogDescription,
    ogImage: entry.ogImage,
    keywords: entry.keywords,
    noindex: entry.noindex,
  };
}

export const prerenderRoutes: PrerenderRoute[] = Object.entries(seoMap)
  .filter(([, entry]) => !entry.noindex)
  .map(([path, entry]) => toPrerender(path, entry));
