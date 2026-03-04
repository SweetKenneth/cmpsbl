/**
 * Structured Breadcrumbs — Item #9
 * Auto-generates JSON-LD breadcrumb schema from URL path.
 * Complements the visual PublicBreadcrumb component.
 */

import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const LABEL_MAP: Record<string, string> = {
  blog: 'Blog',
  modules: 'Modules',
  admin: 'Admin',
  substrate: 'Substrate',
  documentation: 'Documentation',
  'start-here': 'Start Here',
  'persistent-memory': 'Persistent Memory',
  'composable-cognitives': 'Minds',
  'feed-dream-eater': 'Dream Eater',
  decode: 'DECODE',
  upgrade: 'Pricing',
  packs: 'Pipeline Packs',
  store: 'Store',
  solutions: 'Solutions',
  about: 'About',
  contact: 'Contact',
};

function segmentToLabel(segment: string): string {
  if (LABEL_MAP[segment]) return LABEL_MAP[segment];
  return segment
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function StructuredBreadcrumbs() {
  const { pathname } = useLocation();
  if (pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);
  const items = [
    { name: 'Home', url: 'https://cmpsbl.com' },
    ...segments.map((seg, i) => ({
      name: segmentToLabel(seg),
      url: `https://cmpsbl.com/${segments.slice(0, i + 1).join('/')}`,
    })),
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
