/**
 * SEO Auto-Breadcrumbs — generates BreadcrumbList from route path
 * Item #8: Automatic breadcrumb structured data for all nested routes
 */

interface BreadcrumbItem {
  name: string;
  url: string;
}

const ROUTE_LABELS: Record<string, string> = {
  '': 'Home',
  'os': 'Substrate OS',
  'ai-operating-system': 'AI Operating System',
  'modules': 'Architecture',
  'store': 'Artifact Store',
  'composable-cognitives': 'Cognitives',
  'engines': 'Engines',
  'persistent-memory': 'Persistent Memory',
  'decode': 'DECODE',
  'feed-dream-eater': 'Dream Feeder',
  'proof': 'Proof Mode',
  'demo': 'Demo',
  'gaming': 'Gaming AI',
  'developers': 'Developers',
  'documentation': 'Documentation',
  'academy': 'Academy',
  'changelog': 'Changelog',
  'solutions': 'Solutions',
  'pricing': 'Pricing',
  'investors': 'Investors',
  'marketplace': 'Marketplace',
  'about': 'About',
  'contact': 'Contact',
  'blog': 'Blog',
  'privacy': 'Privacy',
  'terms': 'Terms',
  'namespace': 'Namespace',
  'architecture': 'Architecture',
  'lab': 'Lab',
  'codelab': 'Developers Playground',
  'system-feed': 'System Feed',
  'insights': 'Insights',
  'intent-mesh': 'Intent Mesh',
  'forge': 'Forge',
  'ascension': 'Ascension',
};

/**
 * Generate breadcrumb trail from a URL path.
 * e.g. /blog/my-post → [Home, Blog, My Post]
 */
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: BreadcrumbItem[] = [
    { name: 'Home', url: 'https://cmpsbl.com' }
  ];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = ROUTE_LABELS[segment] || segment
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    crumbs.push({ name: label, url: `https://cmpsbl.com${currentPath}` });
  }

  return crumbs;
}
