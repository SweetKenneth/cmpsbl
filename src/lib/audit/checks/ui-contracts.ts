/**
 * Audit Check: UI Contracts — Optimized
 * Validates viewport safety, spacing, and accessibility basics
 * Uses batched DOM reads and avoids getComputedStyle loops
 */

import type { AuditFinding } from '../audit-types';

export function checkUIContracts(): AuditFinding[] {
  const findings: AuditFinding[] = [];

  // === Viewport overflow ===
  const hasOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
  findings.push({
    id: hasOverflow ? 'ui_horizontal_overflow' : 'ui_no_overflow',
    category: 'ui',
    severity: hasOverflow ? 'error' : 'info',
    title: hasOverflow ? 'Horizontal overflow detected' : 'No horizontal overflow',
    detail: hasOverflow
      ? `Page scrollWidth (${document.documentElement.scrollWidth}px) > clientWidth (${document.documentElement.clientWidth}px).`
      : 'Page fits within viewport width.',
    ...(hasOverflow && { hint: 'Check for elements with fixed widths or missing overflow-hidden.' }),
  });

  // === Viewport meta ===
  if (!document.querySelector('meta[name="viewport"]')) {
    findings.push({
      id: 'ui_missing_viewport',
      category: 'a11y',
      severity: 'error',
      title: 'Missing viewport meta tag',
      detail: 'No <meta name="viewport"> found. Required for responsive design.',
    });
  }

  // === Images without alt ===
  const imgCount = document.querySelectorAll('img:not([alt])').length;
  if (imgCount > 0) {
    findings.push({
      id: 'a11y_missing_alt',
      category: 'a11y',
      severity: 'warn',
      title: `${imgCount} image(s) missing alt text`,
      detail: 'Images should have descriptive alt attributes for accessibility.',
    });
  }

  // === Low contrast — sample-based instead of full scan ===
  // Only check opacity on a random sample of text elements to avoid full DOM walk
  const textElements = document.querySelectorAll('p, span, a, button, label');
  let lowContrastCount = 0;
  const sampleSize = Math.min(textElements.length, 200); // Cap at 200
  const step = Math.max(1, Math.floor(textElements.length / sampleSize));
  for (let i = 0; i < textElements.length; i += step) {
    const style = window.getComputedStyle(textElements[i]);
    if (parseFloat(style.opacity) < 0.3 && textElements[i].textContent?.trim()) {
      lowContrastCount++;
    }
  }
  // Scale estimate if sampled
  if (step > 1) lowContrastCount = Math.round(lowContrastCount * step);
  if (lowContrastCount > 5) {
    findings.push({
      id: 'a11y_low_contrast',
      category: 'a11y',
      severity: 'warn',
      title: `~${lowContrastCount} elements with very low opacity`,
      detail: 'Elements with opacity < 0.3 may fail WCAG contrast requirements.',
    });
  }

  // === Single H1 ===
  const h1Count = document.querySelectorAll('h1').length;
  if (h1Count === 0) {
    findings.push({ id: 'seo_missing_h1', category: 'seo', severity: 'warn', title: 'No H1 element found', detail: 'Pages should have exactly one H1 for SEO.' });
  } else if (h1Count > 1) {
    findings.push({ id: 'seo_multiple_h1', category: 'seo', severity: 'warn', title: `${h1Count} H1 elements found`, detail: 'Pages should have exactly one H1 for optimal SEO.' });
  }

  // === Unlabeled buttons ===
  const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
  const unlabeledDetails: string[] = [];
  buttons.forEach(btn => {
    if (!btn.textContent?.trim()) {
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

  // === Skip navigation ===
  if (!document.querySelector('a[href="#main-content"], a[href="#main"], [data-skip-nav]')) {
    findings.push({
      id: 'a11y_missing_skip_link',
      category: 'a11y',
      severity: 'warn',
      title: 'Missing skip navigation link',
      detail: 'No skip-to-content link found. Screen reader users need this for keyboard navigation.',
      hint: 'Add a visually hidden skip link at the top of the page.',
    });
  }

  // === Focus visible — sample-based ===
  const focusable = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
  let missingFocusVisible = 0;
  const focusSample = Math.min(focusable.length, 100);
  const focusStep = Math.max(1, Math.floor(focusable.length / focusSample));
  for (let i = 0; i < focusable.length; i += focusStep) {
    const style = window.getComputedStyle(focusable[i]);
    if (style.outlineStyle === 'none' && style.boxShadow === 'none') {
      missingFocusVisible++;
    }
  }
  if (focusStep > 1) missingFocusVisible = Math.round(missingFocusVisible * focusStep);
  if (missingFocusVisible > 20) {
    findings.push({
      id: 'a11y_focus_visible',
      category: 'a11y',
      severity: 'warn',
      title: `~${missingFocusVisible} elements may lack focus indicators`,
      detail: 'Elements with outline:none and no box-shadow may be invisible to keyboard users.',
    });
  }

  // === Lang attribute ===
  if (!document.documentElement.getAttribute('lang')) {
    findings.push({
      id: 'a11y_missing_lang',
      category: 'a11y',
      severity: 'error',
      title: 'Missing lang attribute on <html>',
      detail: 'The <html> element must have a lang attribute for screen readers.',
    });
  }

  // === Unlabeled inputs ===
  const inputs = document.querySelectorAll('input:not([type="hidden"]):not([aria-label]):not([aria-labelledby])');
  let unlabeledInputs = 0;
  inputs.forEach(input => {
    const id = input.getAttribute('id');
    if (id) {
      if (!document.querySelector(`label[for="${id}"]`)) unlabeledInputs++;
    } else if (!input.closest('label')) {
      unlabeledInputs++;
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

  // === Heading hierarchy ===
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let prevLevel = 0;
  let hierarchyGaps = 0;
  headings.forEach(h => {
    const level = parseInt(h.tagName[1]);
    if (prevLevel > 0 && level > prevLevel + 1) hierarchyGaps++;
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
