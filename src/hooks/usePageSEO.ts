/**
 * usePageSEO — Hook to auto-resolve SEO metadata from the centralized seoMap.
 *
 * Usage in any page:
 *   const seo = usePageSEO();           // auto-resolves from current route
 *   const seo = usePageSEO('/about');   // explicit route override
 *
 * Then pass to SEO component:
 *   <SEO {...seo.helmetProps} />
 *
 * NOTE: We intentionally pass `image` (the per-route OG image) so every page
 * gets its own social-card preview instead of the default. Without this,
 * Discord/Slack/X (which run JS) and our own crawler-side fallbacks all
 * collapse to the home OG image.
 */

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getSEO } from '@/lib/seo/seoMap';

export interface HelmetSEOProps {
  title: string;
  description: string;
  keywords: string[];
  image: string;
  noindex?: boolean;
}

export function usePageSEO(overridePath?: string) {
  const location = useLocation();
  const path = overridePath || location.pathname;

  return useMemo(() => {
    const entry = getSEO(path);
    return {
      entry,
      helmetProps: {
        title: entry.title,
        description: entry.description,
        keywords: entry.keywords,
        image: entry.ogImage,
        noindex: entry.noindex,
      } satisfies HelmetSEOProps,
    };
  }, [path]);
}
