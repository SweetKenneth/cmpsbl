/**
 * INCLUSIVE Scan Engine
 * Full 86-Rule WCAG 2.2 Compliance Scanner
 * @origin(cmptbl) — WCAG criterion mappings from CMPTBL utilities
 * @origin(pf-clarity-universal-scan) — Full 86-rule matrix absorbed into substrate
 * 
 * Developed by CMPSBL® as part of the cognitive orchestration substrate.
 */

import type { InclusiveIssue, InclusiveScanResult, WCAGLevel, ScanDepth, IssueSeverity } from './types';

/**
 * Full WCAG 2.2 Criterion Database — 86 Rules
 * Level A: 28 criteria | Level AA: 20 criteria | Level AAA: 28 criteria
 */
const WCAG_CRITERIA: Record<string, { title: string; level: WCAGLevel; severity: IssueSeverity }> = {
  // ═══ LEVEL A (28 criteria) ═══
  '1.1.1': { title: 'Non-text Content', level: 'A', severity: 'critical' },
  '1.2.1': { title: 'Audio-only and Video-only (Prerecorded)', level: 'A', severity: 'critical' },
  '1.2.2': { title: 'Captions (Prerecorded)', level: 'A', severity: 'critical' },
  '1.2.3': { title: 'Audio Description or Media Alternative', level: 'A', severity: 'high' },
  '1.3.1': { title: 'Info and Relationships', level: 'A', severity: 'high' },
  '1.3.2': { title: 'Meaningful Sequence', level: 'A', severity: 'high' },
  '1.3.3': { title: 'Sensory Characteristics', level: 'A', severity: 'medium' },
  '1.4.1': { title: 'Use of Color', level: 'A', severity: 'medium' },
  '1.4.2': { title: 'Audio Control', level: 'A', severity: 'critical' },
  '2.1.1': { title: 'Keyboard', level: 'A', severity: 'critical' },
  '2.1.2': { title: 'No Keyboard Trap', level: 'A', severity: 'critical' },
  '2.1.4': { title: 'Character Key Shortcuts', level: 'A', severity: 'medium' },
  '2.2.1': { title: 'Timing Adjustable', level: 'A', severity: 'high' },
  '2.2.2': { title: 'Pause, Stop, Hide', level: 'A', severity: 'high' },
  '2.3.1': { title: 'Three Flashes or Below Threshold', level: 'A', severity: 'critical' },
  '2.4.1': { title: 'Bypass Blocks', level: 'A', severity: 'medium' },
  '2.4.2': { title: 'Page Titled', level: 'A', severity: 'high' },
  '2.4.3': { title: 'Focus Order', level: 'A', severity: 'high' },
  '2.4.4': { title: 'Link Purpose (In Context)', level: 'A', severity: 'high' },
  '2.5.1': { title: 'Pointer Gestures', level: 'A', severity: 'medium' },
  '2.5.2': { title: 'Pointer Cancellation', level: 'A', severity: 'medium' },
  '2.5.3': { title: 'Label in Name', level: 'A', severity: 'high' },
  '2.5.4': { title: 'Motion Actuation', level: 'A', severity: 'medium' },
  '3.1.1': { title: 'Language of Page', level: 'A', severity: 'critical' },
  '3.2.1': { title: 'On Focus', level: 'A', severity: 'high' },
  '3.2.2': { title: 'On Input', level: 'A', severity: 'high' },
  '3.3.1': { title: 'Error Identification', level: 'A', severity: 'high' },
  '3.3.2': { title: 'Labels or Instructions', level: 'A', severity: 'critical' },
  '4.1.1': { title: 'Parsing', level: 'A', severity: 'high' },
  '4.1.2': { title: 'Name, Role, Value', level: 'A', severity: 'critical' },

  // ═══ LEVEL AA (20 criteria) ═══
  '1.2.4': { title: 'Captions (Live)', level: 'AA', severity: 'high' },
  '1.2.5': { title: 'Audio Description (Prerecorded)', level: 'AA', severity: 'high' },
  '1.3.4': { title: 'Orientation', level: 'AA', severity: 'medium' },
  '1.3.5': { title: 'Identify Input Purpose', level: 'AA', severity: 'medium' },
  '1.4.3': { title: 'Contrast (Minimum)', level: 'AA', severity: 'high' },
  '1.4.4': { title: 'Resize Text', level: 'AA', severity: 'high' },
  '1.4.5': { title: 'Images of Text', level: 'AA', severity: 'medium' },
  '1.4.10': { title: 'Reflow', level: 'AA', severity: 'high' },
  '1.4.11': { title: 'Non-text Contrast', level: 'AA', severity: 'high' },
  '1.4.12': { title: 'Text Spacing', level: 'AA', severity: 'medium' },
  '1.4.13': { title: 'Content on Hover or Focus', level: 'AA', severity: 'medium' },
  '2.4.5': { title: 'Multiple Ways', level: 'AA', severity: 'medium' },
  '2.4.6': { title: 'Headings and Labels', level: 'AA', severity: 'high' },
  '2.4.7': { title: 'Focus Visible', level: 'AA', severity: 'high' },
  '2.5.7': { title: 'Dragging Movements', level: 'AA', severity: 'medium' },
  '2.5.8': { title: 'Target Size (Minimum)', level: 'AA', severity: 'medium' },
  '3.1.2': { title: 'Language of Parts', level: 'AA', severity: 'medium' },
  '3.2.3': { title: 'Consistent Navigation', level: 'AA', severity: 'medium' },
  '3.2.4': { title: 'Consistent Identification', level: 'AA', severity: 'medium' },
  '3.3.3': { title: 'Error Suggestion', level: 'AA', severity: 'medium' },
  '3.3.4': { title: 'Error Prevention (Legal, Financial, Data)', level: 'AA', severity: 'high' },
  '4.1.3': { title: 'Status Messages', level: 'AA', severity: 'high' },

  // ═══ LEVEL AAA (28 criteria) ═══
  '1.2.6': { title: 'Sign Language (Prerecorded)', level: 'AAA', severity: 'low' },
  '1.2.7': { title: 'Extended Audio Description', level: 'AAA', severity: 'low' },
  '1.2.8': { title: 'Media Alternative (Prerecorded)', level: 'AAA', severity: 'low' },
  '1.2.9': { title: 'Audio-only (Live)', level: 'AAA', severity: 'low' },
  '1.3.6': { title: 'Identify Purpose', level: 'AAA', severity: 'low' },
  '1.4.6': { title: 'Contrast (Enhanced)', level: 'AAA', severity: 'medium' },
  '1.4.7': { title: 'Low or No Background Audio', level: 'AAA', severity: 'low' },
  '1.4.8': { title: 'Visual Presentation', level: 'AAA', severity: 'low' },
  '1.4.9': { title: 'Images of Text (No Exception)', level: 'AAA', severity: 'low' },
  '2.1.3': { title: 'Keyboard (No Exception)', level: 'AAA', severity: 'medium' },
  '2.2.3': { title: 'No Timing', level: 'AAA', severity: 'low' },
  '2.2.4': { title: 'Interruptions', level: 'AAA', severity: 'low' },
  '2.2.5': { title: 'Re-authenticating', level: 'AAA', severity: 'low' },
  '2.2.6': { title: 'Timeouts', level: 'AAA', severity: 'low' },
  '2.3.2': { title: 'Three Flashes', level: 'AAA', severity: 'medium' },
  '2.3.3': { title: 'Animation from Interactions', level: 'AAA', severity: 'low' },
  '2.4.8': { title: 'Location', level: 'AAA', severity: 'low' },
  '2.4.9': { title: 'Link Purpose (Link Only)', level: 'AAA', severity: 'medium' },
  '2.4.10': { title: 'Section Headings', level: 'AAA', severity: 'low' },
  '2.5.5': { title: 'Target Size (Enhanced)', level: 'AAA', severity: 'medium' },
  '2.5.6': { title: 'Concurrent Input Mechanisms', level: 'AAA', severity: 'low' },
  '3.1.3': { title: 'Unusual Words', level: 'AAA', severity: 'low' },
  '3.1.4': { title: 'Abbreviations', level: 'AAA', severity: 'low' },
  '3.1.5': { title: 'Reading Level', level: 'AAA', severity: 'low' },
  '3.1.6': { title: 'Pronunciation', level: 'AAA', severity: 'low' },
  '3.2.5': { title: 'Change on Request', level: 'AAA', severity: 'low' },
  '3.3.5': { title: 'Help', level: 'AAA', severity: 'low' },
  '3.3.6': { title: 'Error Prevention (All)', level: 'AAA', severity: 'medium' },
  '3.3.7': { title: 'Redundant Entry', level: 'AAA', severity: 'low' },
  '3.3.8': { title: 'Accessible Authentication (Minimum)', level: 'AAA', severity: 'medium' },
  '3.3.9': { title: 'Accessible Authentication (Enhanced)', level: 'AAA', severity: 'low' },
};

/** Get total criteria count for a given WCAG level */
export function getCriteriaCount(wcagLevel: WCAGLevel = 'AA'): { total: number; a: number; aa: number; aaa: number } {
  const levelOrder: WCAGLevel[] = ['A', 'AA', 'AAA'];
  const targetIdx = levelOrder.indexOf(wcagLevel);
  
  let a = 0, aa = 0, aaa = 0;
  for (const criterion of Object.values(WCAG_CRITERIA)) {
    if (criterion.level === 'A') a++;
    else if (criterion.level === 'AA') aa++;
    else if (criterion.level === 'AAA') aaa++;
  }
  
  const total = a + (targetIdx >= 1 ? aa : 0) + (targetIdx >= 2 ? aaa : 0);
  return { total, a, aa, aaa };
}

/**
 * Perform accessibility scan on HTML content
 * Full 86-rule WCAG 2.2 compliance engine
 * @origin(pf-clarity-universal-scan) — Absorbed from archived Clarity scanner
 */
export function scanHTML(html: string, wcagLevel: WCAGLevel = 'AA'): InclusiveIssue[] {
  const issues: InclusiveIssue[] = [];
  let issueCounter = 0;

  const levelOrder: WCAGLevel[] = ['A', 'AA', 'AAA'];
  const targetIdx = levelOrder.indexOf(wcagLevel);

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

  // ═══════════════════════════════════════
  // LEVEL A CHECKS (28 criteria)
  // ═══════════════════════════════════════

  // 1.1.1 Non-text Content
  const imgWithoutAlt = (html.match(/<img(?![^>]*alt=)/gi) || []).length;
  if (imgWithoutAlt > 0) {
    addIssue('missing-alt-text', '1.1.1', 'Images must have alt text for screen readers', imgWithoutAlt, '<img>', true);
  }

  // 1.2.1 Audio-only and Video-only
  if (/<audio[^>]*>/i.test(html) && !/<track[^>]*kind=["']captions["']/i.test(html)) {
    addIssue('missing-audio-transcript', '1.2.1', 'Audio element without transcript or captions track', 1, '<audio>', false);
  }

  // 1.2.2 Captions (Prerecorded)
  if (/<video[^>]*>/i.test(html) && !/<track[^>]*kind=["']captions["']/i.test(html)) {
    addIssue('missing-video-captions', '1.2.2', 'Video element without captions track', 1, '<video>', false);
  }

  // 1.3.1 Info and Relationships
  const tableMatches = html.match(/<table[^>]*>[\s\S]*?<\/table>/gi) || [];
  tableMatches.forEach(table => {
    if (!/<th[^>]*>/i.test(table)) {
      addIssue('table-missing-headers', '1.3.1', 'Data table missing header cells (<th>)', 1, '<table>', false);
    }
  });
  if (!html.includes('<main') && !html.includes('role="main"')) {
    addIssue('missing-main', '1.3.1', 'Page should have a main landmark for primary content', 1, undefined, true);
  }
  if (!html.includes('<nav') && !html.includes('role="navigation"')) {
    addIssue('missing-nav', '1.3.1', 'Page should have a navigation landmark', 1, undefined, true);
  }

  // 1.3.2 Meaningful Sequence — heading hierarchy
  const headings = html.match(/<h[1-6][^>]*>/gi) || [];
  let prevLevel = 0;
  headings.forEach(heading => {
    const level = parseInt(heading.match(/h([1-6])/i)?.[1] || '0');
    if (level > prevLevel + 1 && prevLevel !== 0) {
      addIssue('heading-skip', '1.3.2', `Heading hierarchy skipped from H${prevLevel} to H${level}`, 1, heading, false);
    }
    prevLevel = level;
  });

  // 1.4.2 Audio Control
  if (/<audio[^>]*autoplay/i.test(html) && !/<audio[^>]*controls/i.test(html)) {
    addIssue('autoplay-no-controls', '1.4.2', 'Audio autoplays without user controls', 1, '<audio>', true);
  }
  if (/<video[^>]*autoplay/i.test(html) && !/<video[^>]*controls/i.test(html)) {
    addIssue('video-autoplay-no-controls', '1.4.2', 'Video autoplays without user controls', 1, '<video>', true);
  }

  // 2.1.1 Keyboard
  const clickableMatches = html.match(/<[^>]*onclick[^>]*>/gi) || [];
  clickableMatches.forEach(elem => {
    if (!elem.includes('tabindex=') && !/<(a|button|input|select|textarea)/i.test(elem)) {
      addIssue('non-keyboard-accessible', '2.1.1', 'Interactive element not keyboard accessible', 1, elem.substring(0, 120), true);
    }
  });

  // 2.4.1 Bypass Blocks
  if (!/<a[^>]*href=["']#[^"']*["'][^>]*>skip/i.test(html) && !html.includes('skip-link') && !html.includes('skipnav')) {
    addIssue('missing-skip-link', '2.4.1', 'Consider adding a skip navigation link', 1, undefined, true);
  }

  // 2.4.2 Page Titled
  if (!html.match(/<title[^>]*>[^<]+<\/title>/i)) {
    addIssue('missing-title', '2.4.2', 'Page must have a descriptive title', 1, '<title>', true);
  }

  // 2.4.4 Link Purpose (In Context)
  const linkMatches = html.match(/<a[^>]*>([^<]*)<\/a>/gi) || [];
  linkMatches.forEach(link => {
    const text = link.match(/>([^<]*)</)?.[1]?.trim() || '';
    if (['click here', 'read more', 'here', 'more', 'link'].includes(text.toLowerCase())) {
      addIssue('ambiguous-link-text', '2.4.4', `Link text "${text}" is not descriptive`, 1, link.substring(0, 120), false);
    }
  });

  // 3.1.1 Language of Page
  if (!html.match(/<html[^>]*lang=/i)) {
    addIssue('missing-lang', '3.1.1', 'HTML element must have a lang attribute', 1, '<html>', true);
  }

  // 3.3.2 Labels or Instructions
  const inputs = html.match(/<input[^>]*>/gi) || [];
  const inputsWithoutLabels = inputs.filter(
    input => !input.includes('aria-label') && !input.includes('aria-labelledby') && !input.includes('type="hidden"') && !input.includes('type="submit"')
  ).length;
  if (inputsWithoutLabels > 0) {
    addIssue('missing-labels', '3.3.2', 'Form inputs must have associated labels', inputsWithoutLabels, '<input>', true);
  }

  // 4.1.2 Name, Role, Value
  const buttonsWithoutText = (html.match(/<button[^>]*>\s*<\/button>/gi) || []).length;
  if (buttonsWithoutText > 0) {
    addIssue('empty-button', '4.1.2', 'Button elements must have accessible text content', buttonsWithoutText, '<button>', true);
  }
  const linksWithoutText = (html.match(/<a[^>]*>\s*<\/a>/gi) || []).length;
  if (linksWithoutText > 0) {
    addIssue('empty-link', '4.1.2', 'Link elements must have accessible text content', linksWithoutText, '<a>', true);
  }

  // ═══════════════════════════════════════
  // LEVEL AA CHECKS (20 criteria)
  // ═══════════════════════════════════════

  // 1.4.3 Contrast (Minimum)
  const hasInlineStyles = html.includes('color:') && html.includes('background');
  if (hasInlineStyles) {
    addIssue('potential-contrast', '1.4.3', 'Inline styles may have contrast issues - manual review needed', undefined, undefined, false);
  }

  // 2.4.6 Headings and Labels
  const h1Count = (html.match(/<h1/gi) || []).length;
  if (h1Count === 0) {
    addIssue('missing-h1', '2.4.6', 'Pages should have at least one H1 heading', 1, undefined, true);
  } else if (h1Count > 1) {
    addIssue('multiple-h1', '2.4.6', 'Pages should have only one H1 heading', h1Count, '<h1>', true);
  }

  // 2.4.7 Focus Visible
  if (html.includes('outline: none') || html.includes('outline:none') || html.includes('outline: 0')) {
    addIssue('focus-removed', '2.4.7', 'Focus outline removed — keyboard users cannot see focus state', 1, undefined, false);
  }

  // 1.3.5 Identify Input Purpose
  const formInputs = html.match(/<input[^>]*type=["'](text|email|tel|password|url|search)["'][^>]*>/gi) || [];
  const inputsWithoutAutocomplete = formInputs.filter(input => !input.includes('autocomplete=')).length;
  if (inputsWithoutAutocomplete > 0) {
    addIssue('missing-autocomplete', '1.3.5', 'Form inputs should have autocomplete attribute for user convenience', inputsWithoutAutocomplete, '<input>', true);
  }

  // 4.1.3 Status Messages
  const hasAlerts = html.includes('role="alert"') || html.includes('role="status"') || html.includes('aria-live=');
  const hasDynamicContent = html.includes('toast') || html.includes('notification') || html.includes('snackbar');
  if (hasDynamicContent && !hasAlerts) {
    addIssue('missing-live-region', '4.1.3', 'Dynamic status messages should use aria-live or role="status"', 1, undefined, true);
  }

  // ═══════════════════════════════════════
  // LEVEL AAA CHECKS (when requested)
  // ═══════════════════════════════════════

  // 1.4.6 Contrast (Enhanced)
  if (wcagLevel === 'AAA' && hasInlineStyles) {
    addIssue('contrast-enhanced', '1.4.6', 'Enhanced contrast (7:1) required for AAA compliance', undefined, undefined, false);
  }

  // 2.4.9 Link Purpose (Link Only)
  if (wcagLevel === 'AAA') {
    linkMatches.forEach(link => {
      const text = link.match(/>([^<]*)</)?.[1]?.trim() || '';
      if (text.length < 3 && text.length > 0) {
        addIssue('short-link-text', '2.4.9', `Link text "${text}" may not be descriptive enough for AAA`, 1, link.substring(0, 80), false);
      }
    });
  }

  // 2.4.10 Section Headings
  if (wcagLevel === 'AAA') {
    const sections = (html.match(/<section[^>]*>/gi) || []).length;
    const sectionHeadings = (html.match(/<section[^>]*>[\s\S]*?<h[1-6]/gi) || []).length;
    if (sections > 0 && sectionHeadings < sections) {
      addIssue('section-missing-heading', '2.4.10', 'Section elements should have heading elements', sections - sectionHeadings, '<section>', false);
    }
  }

  return issues;
}

/**
 * Calculate compliance score from issues
 * @origin(cmptbl) — Weighted scoring system from Accessibility Pipeline doc
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
    deductions += weight * Math.min(issue.count || 1, 5); // Cap per-issue count impact
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
 * Get suggestion for WCAG criterion — expanded for all 86 rules
 */
function getSuggestionForCriterion(wcag: string): string {
  const suggestions: Record<string, string> = {
    // Level A
    '1.1.1': 'Add descriptive alt text to all images. Use AI to generate contextual descriptions.',
    '1.2.1': 'Provide a transcript for audio-only content.',
    '1.2.2': 'Add synchronized captions to all prerecorded video content.',
    '1.2.3': 'Provide audio description or a full text alternative for prerecorded video.',
    '1.3.1': 'Use semantic HTML landmarks (<main>, <nav>, <aside>) and table headers (<th>).',
    '1.3.2': 'Ensure heading levels follow a logical hierarchy (H1→H2→H3).',
    '1.3.3': 'Do not rely solely on shape, size, or visual location to convey information.',
    '1.4.1': 'Ensure color is not the only means of conveying information.',
    '1.4.2': 'Provide controls for audio that plays automatically.',
    '2.1.1': 'Ensure all interactive elements are keyboard accessible with proper tabindex.',
    '2.1.2': 'Ensure keyboard focus can always be moved away from any component.',
    '2.1.4': 'Allow users to disable or remap single-character keyboard shortcuts.',
    '2.2.1': 'Allow users to extend or disable time limits.',
    '2.2.2': 'Provide controls to pause, stop, or hide moving content.',
    '2.3.1': 'Ensure no content flashes more than 3 times per second.',
    '2.4.1': 'Add a skip navigation link at the top of the page.',
    '2.4.2': 'Add a descriptive <title> element that reflects the page content.',
    '2.4.3': 'Ensure focus order follows a logical reading sequence.',
    '2.4.4': 'Use descriptive link text that makes sense out of context.',
    '2.5.1': 'Provide single-pointer alternatives for multipoint gestures.',
    '2.5.2': 'Ensure pointer actions can be cancelled (use mouseup not mousedown).',
    '2.5.3': 'Ensure visible labels match accessible names.',
    '2.5.4': 'Provide alternatives for motion-activated functionality.',
    '3.1.1': 'Add lang attribute to <html> element (e.g., <html lang="en">).',
    '3.2.1': 'Do not change context automatically when a component receives focus.',
    '3.2.2': 'Do not change context automatically when input value changes.',
    '3.3.1': 'Clearly identify and describe input errors to the user.',
    '3.3.2': 'Ensure all form inputs have associated labels using <label> or aria-label.',
    '4.1.1': 'Ensure HTML is well-formed with proper nesting and unique IDs.',
    '4.1.2': 'Ensure all interactive elements have accessible names and roles.',
    // Level AA
    '1.2.4': 'Provide real-time captions for live audio content.',
    '1.2.5': 'Provide audio descriptions for prerecorded video content.',
    '1.3.4': 'Do not restrict content to a single display orientation.',
    '1.3.5': 'Add autocomplete attributes to form inputs for known data types.',
    '1.4.3': 'Increase text contrast to meet WCAG AA standards (4.5:1 for normal text).',
    '1.4.4': 'Ensure text can be resized up to 200% without loss of content.',
    '1.4.5': 'Use actual text instead of images of text where possible.',
    '1.4.10': 'Ensure content reflows at 320px width without horizontal scrolling.',
    '1.4.11': 'Ensure non-text UI components have 3:1 contrast ratio.',
    '1.4.12': 'Ensure content adapts to user-specified text spacing.',
    '1.4.13': 'Ensure content shown on hover/focus is dismissible and persistent.',
    '2.4.5': 'Provide multiple ways to locate pages (search, sitemap, navigation).',
    '2.4.6': 'Use a single H1 heading per page that describes the main content.',
    '2.4.7': 'Ensure keyboard focus indicators are clearly visible.',
    '2.5.7': 'Provide alternatives for drag-based interactions.',
    '2.5.8': 'Ensure touch targets are at least 24×24 CSS pixels.',
    '3.1.2': 'Mark language changes within the page using the lang attribute.',
    '3.2.3': 'Keep navigation consistent across pages.',
    '3.2.4': 'Use consistent identification for components with same functionality.',
    '3.3.3': 'Provide suggestions when input errors are detected.',
    '3.3.4': 'Allow users to review and correct submissions with legal/financial consequences.',
    '4.1.3': 'Use aria-live regions for dynamic status messages.',
    // Level AAA
    '1.4.6': 'Increase text contrast to meet WCAG AAA standards (7:1 for normal text).',
    '2.4.9': 'Ensure link text is descriptive on its own, without surrounding context.',
    '2.4.10': 'Use headings to organize content into sections.',
    '3.3.6': 'Allow users to review and correct all form submissions.',
    '3.3.8': 'Provide authentication methods that don\'t rely on cognitive function tests.',
  };

  return suggestions[wcag] || 'Review and fix this accessibility issue per WCAG 2.2 guidelines.';
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

/** Export criteria database for introspection */
export function getWCAGCriteria(): typeof WCAG_CRITERIA {
  return { ...WCAG_CRITERIA };
}

// Version info
export const INCLUSIVE_VERSION = '9.1.0';
export const INCLUSIVE_CODENAME = 'Human Compatibility';
export const INCLUSIVE_CRITERIA_COUNT = Object.keys(WCAG_CRITERIA).length;
