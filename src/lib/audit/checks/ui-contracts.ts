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
  const unlabeledDetails: string[] = [];
  buttons.forEach(btn => {
    if (!btn.textContent?.trim()) {
      // Capture element context for debugging
      const cls = btn.className?.slice(0, 60) || '';
      const parent = btn.parentElement?.tagName?.toLowerCase() || '';
      const parentCls = btn.parentElement?.className?.slice(0, 40) || '';
      unlabeledDetails.push(`<button class="${cls}"> in <${parent} class="${parentCls}">`);
    }
  });
  if (unlabeledDetails.length > 0) {
    findings.push({
      id: 'a11y_unlabeled_buttons',
      category: 'a11y',
      severity: 'warn',
      title: `${unlabeledDetails.length} button(s) without accessible label`,
      detail: `Buttons with no text content need aria-label for screen readers. Elements: ${unlabeledDetails.slice(0, 4).join('; ')}`,
    });
  }

  // Check for skip navigation link
  const skipLink = document.querySelector('a[href="#main-content"], a[href="#main"], [data-skip-nav]');
  if (!skipLink) {
    findings.push({
      id: 'a11y_missing_skip_link',
      category: 'a11y',
      severity: 'warn',
      title: 'Missing skip navigation link',
      detail: 'No skip-to-content link found. Screen reader users need this for keyboard navigation.',
      hint: 'Add a visually hidden skip link at the top of the page.',
    });
  }

  // Check for focus-visible styles
  const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
  let missingFocusVisible = 0;
  focusableElements.forEach((el) => {
    const style = window.getComputedStyle(el);
    if (style.outlineStyle === 'none' && style.boxShadow === 'none') {
      missingFocusVisible++;
    }
  });
  if (missingFocusVisible > 20) {
    findings.push({
      id: 'a11y_focus_visible',
      category: 'a11y',
      severity: 'warn',
      title: `${missingFocusVisible} elements may lack focus indicators`,
      detail: 'Elements with outline:none and no box-shadow may be invisible to keyboard users.',
    });
  }

  // Check for lang attribute
  const htmlLang = document.documentElement.getAttribute('lang');
  if (!htmlLang) {
    findings.push({
      id: 'a11y_missing_lang',
      category: 'a11y',
      severity: 'error',
      title: 'Missing lang attribute on <html>',
      detail: 'The <html> element must have a lang attribute for screen readers.',
    });
  }

  // Check for form inputs without labels
  const inputs = document.querySelectorAll('input:not([type="hidden"]):not([aria-label]):not([aria-labelledby])');
  let unlabeledInputs = 0;
  inputs.forEach(input => {
    const id = input.getAttribute('id');
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (!label) unlabeledInputs++;
    } else {
      // No id and no aria-label — check if wrapped in <label>
      if (!input.closest('label')) unlabeledInputs++;
    }
  });
  if (unlabeledInputs > 0) {
    findings.push({
      id: 'a11y_unlabeled_inputs',
      category: 'a11y',
      severity: 'warn',
      title: `${unlabeledInputs} input(s) without accessible label`,
      detail: 'Form inputs need associated <label>, aria-label, or aria-labelledby for screen readers.',
    });
  }

  // Check for heading hierarchy gaps
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let prevLevel = 0;
  let hierarchyGaps = 0;
  headings.forEach(h => {
    const level = parseInt(h.tagName[1]);
    if (prevLevel > 0 && level > prevLevel + 1) {
      hierarchyGaps++;
    }
    prevLevel = level;
  });
  if (hierarchyGaps > 0) {
    findings.push({
      id: 'a11y_heading_hierarchy',
      category: 'a11y',
      severity: 'warn',
      title: `${hierarchyGaps} heading hierarchy gap(s)`,
      detail: 'Headings skip levels (e.g., H1 → H3). Use sequential levels for screen reader navigation.',
    });
  }

  return findings;
}
