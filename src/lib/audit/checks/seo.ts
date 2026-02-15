/**
 * Audit Check: SEO Contracts
 * Validates per-page SEO metadata coverage
 */

import type { AuditFinding } from '../audit-types';

export function checkSEO(): AuditFinding[] {
  const findings: AuditFinding[] = [];

  // Check current page has title
  const title = document.title;
  if (!title || title === 'Vite + React + TS') {
    findings.push({
      id: 'seo_missing_title',
      category: 'seo',
      severity: 'error',
      title: 'Page has default/missing title',
      detail: `Current page title: "${title}". Should be unique and descriptive.`,
      hint: 'Ensure usePageSEO hook is applied to all routes.',
    });
  } else {
    findings.push({
      id: 'seo_title_ok',
      category: 'seo',
      severity: 'info',
      title: 'Page title set',
      detail: `Title: "${title}".`,
    });
  }

  // Check meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc || !metaDesc.getAttribute('content')) {
    findings.push({
      id: 'seo_missing_description',
      category: 'seo',
      severity: 'warn',
      title: 'Missing meta description',
      detail: 'No meta description found on current page.',
      hint: 'Add description via SEO component or usePageSEO.',
    });
  } else {
    findings.push({
      id: 'seo_description_ok',
      category: 'seo',
      severity: 'info',
      title: 'Meta description present',
      detail: `Description: "${metaDesc.getAttribute('content')?.slice(0, 80)}..."`,
    });
  }

  // Check canonical
  const canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    findings.push({
      id: 'seo_missing_canonical',
      category: 'seo',
      severity: 'warn',
      title: 'Missing canonical link',
      detail: 'No <link rel="canonical"> found.',
      hint: 'Add canonical URL to prevent duplicate content.',
    });
  }

  return findings;
}
