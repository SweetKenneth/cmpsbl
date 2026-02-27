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
    // Check for version numbers in title (per custom instructions: never use version numbers in SEO)
    const hasVersion = /v\d+[\.\d]*/i.test(title);
    if (hasVersion) {
      findings.push({
        id: 'seo_version_in_title',
        category: 'seo',
        severity: 'error',
        title: 'Version number in page title',
        detail: `Title "${title}" contains a version number. Version numbers must never appear in SEO metadata.`,
        hint: 'Remove version numbers from all page titles and OG tags.',
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
    const desc = metaDesc.getAttribute('content') || '';
    // Check version numbers in description
    if (/v\d+[\.\d]*/i.test(desc)) {
      findings.push({
        id: 'seo_version_in_description',
        category: 'seo',
        severity: 'warn',
        title: 'Version number in meta description',
        detail: `Description contains a version number. Remove it.`,
      });
    } else {
      findings.push({
        id: 'seo_description_ok',
        category: 'seo',
        severity: 'info',
        title: 'Meta description present',
        detail: `Description: "${desc.slice(0, 80)}..."`,
      });
    }
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

  // Check OG tags for version numbers
  const ogTags = document.querySelectorAll('meta[property^="og:"]');
  ogTags.forEach((tag) => {
    const content = tag.getAttribute('content') || '';
    if (/v\d+[\.\d]*/i.test(content)) {
      findings.push({
        id: `seo_version_in_og_${tag.getAttribute('property')}`,
        category: 'seo',
        severity: 'warn',
        title: `Version number in ${tag.getAttribute('property')}`,
        detail: `OG tag contains version number. Remove it.`,
      });
    }
  });

  return findings;
}
