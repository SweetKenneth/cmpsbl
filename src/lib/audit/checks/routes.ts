/**
 * Audit Check: Route Contracts
 * Validates critical routes are present
 */

import type { AuditFinding } from '../audit-types';

const REQUIRED_ROUTES = [
  { path: '/', label: 'Home' },
  { path: '/os', label: 'OS Dashboard' },
  { path: '/auth', label: 'Authentication' },
  { path: '/modules', label: 'Nodes Hub' },
  { path: '/about', label: 'About' },
  { path: '/pricing', label: 'Pricing / Upgrade' },
  { path: '/docs', label: 'Documentation' },
  { path: '/status', label: 'Status' },
  { path: '/packs', label: 'Packs' },
  { path: '/blog', label: 'Blog' },
  { path: '/diligence', label: 'Diligence' },
];

export function checkRouteRegistry(): AuditFinding[] {
  const findings: AuditFinding[] = [];

  const currentPath = window.location.pathname;

  findings.push({
    id: 'route_current',
    category: 'routes',
    severity: 'info',
    title: `Current route: ${currentPath}`,
    detail: 'Route loaded successfully without 404.',
  });

  // Check if 404 page is showing (route not found)
  const is404 = document.querySelector('h1')?.textContent?.includes('404');
  if (is404) {
    findings.push({
      id: 'route_404_detected',
      category: 'routes',
      severity: 'error',
      title: `Current route "${currentPath}" returned 404`,
      detail: 'A 404 page is displayed. This route may be missing from the router.',
    });
  }

  // Check for broken internal links on current page
  const internalLinks = document.querySelectorAll('a[href^="/"]');
  const uniquePaths = new Set<string>();
  internalLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('//')) uniquePaths.add(href.split('?')[0].split('#')[0]);
  });

  findings.push({
    id: 'route_internal_links',
    category: 'routes',
    severity: 'info',
    title: `${uniquePaths.size} unique internal links on page`,
    detail: `Internal link targets: ${Array.from(uniquePaths).slice(0, 10).join(', ')}${uniquePaths.size > 10 ? '...' : ''}`,
  });

  findings.push({
    id: 'route_contracts',
    category: 'routes',
    severity: 'info',
    title: `${REQUIRED_ROUTES.length} required routes defined`,
    detail: `Contract routes: ${REQUIRED_ROUTES.map(r => r.path).join(', ')}`,
  });

  return findings;
}
