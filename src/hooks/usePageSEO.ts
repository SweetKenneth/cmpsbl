/**
 * usePageSEO — Hook to auto-resolve SEO metadata from the centralized seoMap.
 * 
 * Usage in any page:
 *   const seo = usePageSEO();           // auto-resolves from current route
 *   const seo = usePageSEO('/about');   // explicit route override
 * 
 * Then pass to SEO component:
 *   <SEO {...seo.helmetProps} />
 */

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getSEO, type PageSEO } from '@/lib/seo/seoMap';

export interface HelmetSEOProps {
  title: string;
  description: string;
  keywords: string[];
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
        noindex: entry.noindex,
      } satisfies HelmetSEOProps,
    };
  }, [path]);
}
