/**
 * Audit Check: UI Contracts
 * Validates viewport safety, spacing, and accessibility basics
 */

import type { AuditFinding } from '../audit-types';

export function checkUIContracts(): AuditFinding[] {
  const findings: AuditFinding[] = [];

  // Check for horizontal overflow
  const hasOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
  if (hasOverflow) {
    findings.push({
      id: 'ui_horizontal_overflow',
      category: 'ui',
      severity: 'error',
      title: 'Horizontal overflow detected',
      detail: `Page scrollWidth (${document.documentElement.scrollWidth}px) > clientWidth (${document.documentElement.clientWidth}px).`,
      hint: 'Check for elements with fixed widths or missing overflow-hidden.',
    });
  } else {
    findings.push({
      id: 'ui_no_overflow',
      category: 'ui',
      severity: 'info',
      title: 'No horizontal overflow',
      detail: 'Page fits within viewport width.',
    });
  }

  // Check viewport meta
  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    findings.push({
      id: 'ui_missing_viewport',
      category: 'a11y',
      severity: 'error',
      title: 'Missing viewport meta tag',
      detail: 'No <meta name="viewport"> found. Required for responsive design.',
    });
  }

  // Check for images without alt text
  const images = document.querySelectorAll('img:not([alt])');
  if (images.length > 0) {
    findings.push({
      id: 'a11y_missing_alt',
      category: 'a11y',
      severity: 'warn',
      title: `${images.length} image(s) missing alt text`,
      detail: 'Images should have descriptive alt attributes for accessibility.',
    });
  }

  // Check color contrast — basic check for very low contrast text
  const smallText = document.querySelectorAll('p, span, a, button, label');
  let lowContrastCount = 0;
  smallText.forEach((el) => {
    const style = window.getComputedStyle(el);
    const opacity = parseFloat(style.opacity);
    if (opacity < 0.3 && el.textContent?.trim()) {
      lowContrastCount++;
    }
  });
  if (lowContrastCount > 5) {
    findings.push({
      id: 'a11y_low_contrast',
      category: 'a11y',
      severity: 'warn',
      title: `${lowContrastCount} elements with very low opacity`,
      detail: 'Elements with opacity < 0.3 may fail WCAG contrast requirements.',
    });
  }

  // Check for single H1
  const h1Elements = document.querySelectorAll('h1');
  if (h1Elements.length === 0) {
    findings.push({
      id: 'seo_missing_h1',
      category: 'seo',
      severity: 'warn',
      title: 'No H1 element found',
      detail: 'Pages should have exactly one H1 for SEO.',
    });
  } else if (h1Elements.length > 1) {
    findings.push({
      id: 'seo_multiple_h1',
      category: 'seo',
      severity: 'warn',
      title: `${h1Elements.length} H1 elements found`,
      detail: 'Pages should have exactly one H1 for optimal SEO.',
    });
  }

  // Check for interactive elements without accessible names
  const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
  let unlabeledButtons = 0;
  buttons.forEach(btn => {
    if (!btn.textContent?.trim()) unlabeledButtons++;
  });
  if (unlabeledButtons > 0) {
    findings.push({
      id: 'a11y_unlabeled_buttons',
      category: 'a11y',
      severity: 'warn',
      title: `${unlabeledButtons} button(s) without accessible label`,
      detail: 'Buttons with no text content need aria-label for screen readers.',
    });
  }

  return findings;
}
