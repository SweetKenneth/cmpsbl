/**
 * INCLUSIVE Scan Engine
 * @origin(clarity) — Core scanner migrated from pf-clarity-scan
 * @origin(cmptbl) — WCAG criterion mappings from CMPTBL utilities
 */

import type { InclusiveIssue, InclusiveScanResult, WCAGLevel, ScanDepth, IssueSeverity } from './types';

/**
 * WCAG 2.2 Criterion Database
 * @origin(clarity) — Migrated from Clarity WCAG mapping
 */
const WCAG_CRITERIA: Record<string, { title: string; level: WCAGLevel; severity: IssueSeverity }> = {
  '1.1.1': { title: 'Non-text Content', level: 'A', severity: 'critical' },
  '1.3.1': { title: 'Info and Relationships', level: 'A', severity: 'high' },
  '1.4.3': { title: 'Contrast (Minimum)', level: 'AA', severity: 'high' },
  '1.4.6': { title: 'Contrast (Enhanced)', level: 'AAA', severity: 'medium' },
  '2.1.1': { title: 'Keyboard', level: 'A', severity: 'critical' },
  '2.4.1': { title: 'Bypass Blocks', level: 'A', severity: 'medium' },
  '2.4.2': { title: 'Page Titled', level: 'A', severity: 'high' },
  '2.4.6': { title: 'Headings and Labels', level: 'AA', severity: 'high' },
  '3.1.1': { title: 'Language of Page', level: 'A', severity: 'critical' },
  '3.3.2': { title: 'Labels or Instructions', level: 'A', severity: 'critical' },
  '4.1.1': { title: 'Parsing', level: 'A', severity: 'high' },
  '4.1.2': { title: 'Name, Role, Value', level: 'A', severity: 'critical' },
};

/**
 * Perform accessibility scan on HTML content
 * @origin(clarity) — Core logic from pf-clarity-scan performAccessibilityScan
 */
export function scanHTML(html: string, wcagLevel: WCAGLevel = 'AA'): InclusiveIssue[] {
  const issues: InclusiveIssue[] = [];
  let issueCounter = 0;

  const addIssue = (
    type: string,
    wcag: string,
    description: string,
    count?: number,
    element?: string,
    autoFixable = false
  ) => {
    const criterion = WCAG_CRITERIA[wcag];
    if (!criterion) return;
    
    // Filter by WCAG level
    const levelOrder: WCAGLevel[] = ['A', 'AA', 'AAA'];
    const targetIdx = levelOrder.indexOf(wcagLevel);
    const criterionIdx = levelOrder.indexOf(criterion.level);
    if (criterionIdx > targetIdx) return;

    issues.push({
      id: `inc_${++issueCounter}`,
      type,
      wcag_criterion: wcag,
      severity: criterion.severity,
      description,
      count,
      element,
      suggestion: getSuggestionForCriterion(wcag),
      auto_fixable: autoFixable,
    });
  };

  // === Check for missing alt text ===
  // @origin(clarity) — From pf-clarity-scan
  const imgWithoutAlt = (html.match(/<img(?![^>]*alt=)/gi) || []).length;
  if (imgWithoutAlt > 0) {
    addIssue('missing-alt-text', '1.1.1', 'Images must have alt text for screen readers', imgWithoutAlt, '<img>', true);
  }

  // === Check for missing form labels ===
  // @origin(clarity) — From pf-clarity-scan
  const inputs = html.match(/<input[^>]*>/gi) || [];
  const inputsWithoutLabels = inputs.filter(
    input => !input.includes('aria-label') && !input.includes('aria-labelledby')
  ).length;
  if (inputsWithoutLabels > 0) {
    addIssue('missing-labels', '3.3.2', 'Form inputs must have associated labels', inputsWithoutLabels, '<input>', true);
  }

  // === Check for missing language attribute ===
  // @origin(clarity) — From pf-clarity-scan
  if (!html.match(/<html[^>]*lang=/i)) {
    addIssue('missing-lang', '3.1.1', 'HTML element must have a lang attribute', 1, '<html>', true);
  }

  // === Check for heading hierarchy ===
  // @origin(clarity) — From pf-clarity-scan
  const h1Count = (html.match(/<h1/gi) || []).length;
  if (h1Count === 0) {
    addIssue('missing-h1', '2.4.6', 'Pages should have at least one H1 heading', 1, undefined, true);
  } else if (h1Count > 1) {
    addIssue('multiple-h1', '2.4.6', 'Pages should have only one H1 heading', h1Count, '<h1>', true);
  }

  // === Check for missing main landmark ===
  // @origin(cmptbl) — From pf-access-scan
  if (!html.includes('<main') && !html.includes('role="main"')) {
    addIssue('missing-main', '1.3.1', 'Page should have a main landmark for primary content', 1, undefined, true);
  }

  // === Check for potential contrast issues (heuristic) ===
  // @origin(clarity) — Simplified from pf-clarity-scan
  const hasInlineStyles = html.includes('color:') && html.includes('background');
  if (hasInlineStyles) {
    addIssue('potential-contrast', '1.4.3', 'Inline styles may have contrast issues - manual review needed', undefined, undefined, false);
  }

  // === Check for skip links (bypass blocks) ===
  if (!html.includes('skip') && !html.includes('skipnav') && !html.includes('skip-link')) {
    addIssue('missing-skip-link', '2.4.1', 'Consider adding a skip navigation link', 1, undefined, true);
  }

  // === Check for page title ===
  if (!html.match(/<title[^>]*>[^<]+<\/title>/i)) {
    addIssue('missing-title', '2.4.2', 'Page must have a descriptive title', 1, '<title>', true);
  }

  return issues;
}

/**
 * Calculate compliance score from issues
 * @origin(clarity) — From pf-clarity-scan calculateComplianceScore
 */
export function calculateScore(issues: InclusiveIssue[]): number {
  const weights: Record<IssueSeverity, number> = {
    critical: 15,
    high: 10,
    medium: 5,
    low: 2,
  };

  let deductions = 0;
  issues.forEach(issue => {
    const weight = weights[issue.severity];
    deductions += weight * (issue.count || 1);
  });

  return Math.max(0, 100 - deductions);
}

/**
 * Determine overall severity from issues
 */
export function determineOverallSeverity(issues: InclusiveIssue[]): IssueSeverity {
  if (issues.some(i => i.severity === 'critical')) return 'critical';
  if (issues.some(i => i.severity === 'high')) return 'high';
  if (issues.some(i => i.severity === 'medium')) return 'medium';
  return 'low';
}

/**
 * Get suggestion for WCAG criterion
 * @origin(clarity) — From pf-clarity-scan getSuggestionForIssue
 */
function getSuggestionForCriterion(wcag: string): string {
  const suggestions: Record<string, string> = {
    '1.1.1': 'Add descriptive alt text to all images. Use AI to generate contextual descriptions.',
    '1.3.1': 'Use semantic HTML landmarks (<main>, <nav>, <aside>) for structure.',
    '1.4.3': 'Increase text contrast to meet WCAG AA standards (4.5:1 for normal text).',
    '1.4.6': 'Increase text contrast to meet WCAG AAA standards (7:1 for normal text).',
    '2.1.1': 'Ensure all interactive elements are keyboard accessible.',
    '2.4.1': 'Add a skip navigation link at the top of the page.',
    '2.4.2': 'Add a descriptive <title> element that reflects the page content.',
    '2.4.6': 'Use a single H1 heading per page that describes the main content.',
    '3.1.1': 'Add lang attribute to <html> element (e.g., <html lang="en">).',
    '3.3.2': 'Ensure all form inputs have associated labels using <label> elements or aria-label.',
    '4.1.1': 'Ensure HTML is well-formed with proper nesting and unique IDs.',
    '4.1.2': 'Ensure all interactive elements have accessible names and roles.',
  };

  return suggestions[wcag] || 'Review and fix this accessibility issue.';
}

/**
 * Build complete scan result
 */
export function buildScanResult(
  target: string,
  html: string,
  wcagLevel: WCAGLevel = 'AA',
  scanDepth: ScanDepth = 'quick'
): InclusiveScanResult {
  const startTime = Date.now();
  const issues = scanHTML(html, wcagLevel);
  const score = calculateScore(issues);
  const severity = determineOverallSeverity(issues);
  const duration = Date.now() - startTime;

  return {
    target,
    issues,
    severity,
    repairs: [],
    score,
    metadata: {
      wcag_level: wcagLevel,
      scan_depth: scanDepth,
      scanned_at: new Date().toISOString(),
      duration_ms: duration,
    },
  };
}
