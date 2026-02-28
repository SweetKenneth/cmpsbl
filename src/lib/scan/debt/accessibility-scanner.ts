/**
 * #20 — Accessibility Compliance Scanner
 * Audit for WCAG violations without rendering.
 */

export interface AccessibilityReport {
  violations: A11yViolation[];
  totalViolations: number;
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
  estimatedWCAGLevel: 'A' | 'AA' | 'AAA' | 'non-compliant';
  recommendations: string[];
  scanTimestamp: string;
}

export interface A11yViolation {
  id: string;
  rule: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  wcagCriteria: string;
  file: string;
  line: number | null;
  element: string;
  description: string;
  fix: string;
}

const A11Y_RULES: Array<{
  id: string;
  rule: string;
  pattern: RegExp;
  wcag: string;
  severity: A11yViolation['severity'];
  description: string;
  fix: string;
}> = [
  { id: 'img-alt', rule: 'Images must have alt text', pattern: /<img(?![^>]*alt\s*=)[^>]*>/gi, wcag: '1.1.1', severity: 'critical', description: 'Image missing alt attribute', fix: 'Add descriptive alt text or alt="" for decorative images' },
  { id: 'button-text', rule: 'Buttons must have accessible text', pattern: /<button[^>]*>\s*<(?:img|svg|icon)[^>]*>\s*<\/button>/gi, wcag: '4.1.2', severity: 'serious', description: 'Button contains only an icon without accessible label', fix: 'Add aria-label or visible text to the button' },
  { id: 'form-label', rule: 'Form inputs must have labels', pattern: /<input(?![^>]*(?:aria-label|id\s*=\s*['"][^'"]*['"])[^>]*type\s*=\s*['"](?:hidden|submit|button)['"])[^>]*>/gi, wcag: '1.3.1', severity: 'serious', description: 'Form input without associated label', fix: 'Add <label> element or aria-label attribute' },
  { id: 'heading-order', rule: 'Headings should be in order', pattern: /<h[3-6][^>]*>(?:(?!<h[1-2]).)*$/gis, wcag: '1.3.1', severity: 'moderate', description: 'Heading level may skip levels', fix: 'Ensure headings follow sequential order (h1 → h2 → h3)' },
  { id: 'link-text', rule: 'Links must have descriptive text', pattern: /<a[^>]*>\s*(?:click here|here|read more|learn more|more)\s*<\/a>/gi, wcag: '2.4.4', severity: 'moderate', description: 'Link text is not descriptive', fix: 'Use descriptive link text that indicates the destination' },
  { id: 'tabindex-positive', rule: 'Avoid positive tabindex', pattern: /tabindex\s*=\s*['"]([1-9]\d*)['"]|tabIndex\s*=\s*\{([1-9]\d*)\}/g, wcag: '2.4.3', severity: 'serious', description: 'Positive tabindex disrupts natural tab order', fix: 'Remove positive tabindex values. Use 0 or -1 only.' },
  { id: 'color-only', rule: 'Don\'t use color alone', pattern: /(?:color|colour)\s*(?:indicates|means|shows|represents)/i, wcag: '1.4.1', severity: 'moderate', description: 'Information conveyed by color alone', fix: 'Supplement color with text, icons, or patterns' },
  { id: 'autofocus', rule: 'Avoid autofocus', pattern: /autoFocus|autofocus/g, wcag: '3.2.1', severity: 'minor', description: 'Autofocus can disorient screen reader users', fix: 'Remove autofocus unless essential for the user flow' },
  { id: 'aria-hidden-focus', rule: 'Interactive elements in aria-hidden', pattern: /aria-hidden\s*=\s*['"]true['"][^>]*(?:button|a\s|input|select|textarea)/gi, wcag: '4.1.2', severity: 'critical', description: 'Interactive element hidden from assistive technology', fix: 'Remove aria-hidden or make element non-interactive' },
  { id: 'role-missing', rule: 'Custom elements need roles', pattern: /<div[^>]*onClick[^>]*>(?!.*role)/gi, wcag: '4.1.2', severity: 'serious', description: 'Clickable div without ARIA role', fix: 'Use <button> instead of <div onClick>, or add role="button" and tabIndex="0"' },
  { id: 'empty-link', rule: 'Links must not be empty', pattern: /<a[^>]*>\s*<\/a>/gi, wcag: '2.4.4', severity: 'serious', description: 'Empty link with no text or aria-label', fix: 'Add text content or aria-label to the link' },
  { id: 'lang-missing', rule: 'Page should have lang attribute', pattern: /<html(?![^>]*lang\s*=)[^>]*>/gi, wcag: '3.1.1', severity: 'serious', description: 'HTML element missing lang attribute', fix: 'Add lang attribute to <html> element (e.g., lang="en")' },
];

/**
 * Scan source files for accessibility violations
 */
export function scanAccessibility(
  files: Array<{ path: string; content: string }>
): AccessibilityReport {
  const violations: A11yViolation[] = [];

  for (const file of files) {
    if (!/\.[jt]sx?$|\.html?$|\.vue$|\.svelte$/i.test(file.path)) continue;
    if (/node_modules|\.test\.|\.spec\.|\.d\.ts$/i.test(file.path)) continue;

    const lines = file.content.split('\n');

    for (const rule of A11Y_RULES) {
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      let match;
      while ((match = regex.exec(file.content)) !== null) {
        const lineNum = file.content.slice(0, match.index).split('\n').length;
        violations.push({
          id: `${rule.id}-${violations.length}`,
          rule: rule.rule,
          severity: rule.severity,
          wcagCriteria: rule.wcag,
          file: file.path,
          line: lineNum,
          element: match[0].slice(0, 60),
          description: rule.description,
          fix: rule.fix,
        });
      }
    }
  }

  const bySeverity: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  for (const v of violations) {
    bySeverity[v.severity] = (bySeverity[v.severity] || 0) + 1;
    const cat = v.wcagCriteria.split('.')[0];
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  }

  const criticalCount = bySeverity['critical'] || 0;
  const seriousCount = bySeverity['serious'] || 0;

  const estimatedWCAGLevel: AccessibilityReport['estimatedWCAGLevel'] =
    criticalCount === 0 && seriousCount === 0 ? 'AA' :
    criticalCount === 0 ? 'A' : 'non-compliant';

  const recommendations: string[] = [];
  if (criticalCount > 0) recommendations.push(`Fix ${criticalCount} critical accessibility violation(s) for basic WCAG compliance`);
  if (seriousCount > 0) recommendations.push(`Address ${seriousCount} serious violation(s) for WCAG AA compliance`);

  return {
    violations,
    totalViolations: violations.length,
    bySeverity,
    byCategory,
    estimatedWCAGLevel,
    recommendations,
    scanTimestamp: new Date().toISOString(),
  };
}
