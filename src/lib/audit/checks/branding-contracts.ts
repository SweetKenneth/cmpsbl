/**
 * Audit Check: Branding & Pricing Contracts
 * Validates no legacy branding or stale pricing leaks into user-facing surfaces
 */

import type { AuditFinding } from '../audit-types';

const FORBIDDEN_BRANDING = [
  'lovable ai',
  'lovable.ai',
  'promptfluid',
  'ai.gateway.lovable',
  'powered by lovable',
  'built with lovable',
  'lovableproject.com',
];

const CANONICAL_PRICING = {
  studio: '$29',
  creator: '$49',
  architect: '$79',
  enterprise: 'custom',
};

export function checkBrandingContracts(): AuditFinding[] {
  const findings: AuditFinding[] = [];

  // Check page title for branding violations
  const title = document.title || '';
  const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
  const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';

  const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || '';
  const twitterDesc = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || '';

  const surfaces = [
    { label: 'title', value: title },
    { label: 'meta description', value: metaDesc },
    { label: 'og:title', value: ogTitle },
    { label: 'og:description', value: ogDesc },
    { label: 'twitter:title', value: twitterTitle },
    { label: 'twitter:description', value: twitterDesc },
  ];

  for (const surface of surfaces) {
    for (const term of FORBIDDEN_BRANDING) {
      if (surface.value.toLowerCase().includes(term)) {
        findings.push({
          id: `branding_forbidden_${surface.label}_${term.replace(/\W/g, '_')}`,
          category: 'seo',
          severity: 'error',
          title: `Forbidden branding in ${surface.label}`,
          detail: `"${term}" found in ${surface.label}. Must use CMPSBL or NEXUS branding.`,
          hint: 'Remove legacy branding references from all user-facing metadata.',
        });
      }
    }
  }

  // Check for version numbers in SEO surfaces
  const versionRegex = /\bv\d+\.\d+/i;
  for (const surface of surfaces) {
    if (versionRegex.test(surface.value)) {
      findings.push({
        id: `branding_version_in_${surface.label}`,
        category: 'seo',
        severity: 'warn',
        title: `Version number in ${surface.label}`,
        detail: `"${surface.value.match(versionRegex)?.[0]}" found. Version numbers are forbidden in SEO metadata.`,
      });
    }
  }

  // If no violations
  if (findings.length === 0) {
    findings.push({
      id: 'branding_clean',
      category: 'seo',
      severity: 'info',
      title: 'Branding contracts clean',
      detail: `No forbidden branding or version leaks detected in page metadata.`,
    });
  }

  return findings;
}
