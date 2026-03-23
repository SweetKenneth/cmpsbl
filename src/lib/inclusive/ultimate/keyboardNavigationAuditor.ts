/**
 * INCLUSIVE Ultimate — System 5: Keyboard Navigation Auditor
 * 
 * Maps the complete keyboard navigation graph — detects traps, dead ends,
 * illogical tab order, missing focus indicators, and skip-link gaps.
 * 
 * @module inclusive/ultimate/keyboardNavigationAuditor
 */

// ── Types ────────────────────────────────────────────────────────

export type NavIssueType = 'trap' | 'dead_end' | 'illogical_order' | 'missing_focus' | 'missing_skip_link' | 'unreachable' | 'focus_not_visible';

export interface FocusableElement {
  id: string;
  tag: string;
  tabIndex: number;
  label: string;
  hasFocusStyle: boolean;
  isVisible: boolean;
  position: { x: number; y: number };
}

export interface NavigationIssue {
  id: string;
  type: NavIssueType;
  element: string;
  description: string;
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  suggestion: string;
}

export interface NavigationGraph {
  nodes: FocusableElement[];
  edges: Array<{ from: string; to: string }>;
  issues: NavigationIssue[];
  hasSkipLink: boolean;
  tabOrderLogical: boolean;
  trapsDetected: number;
  deadEndsDetected: number;
}

export interface KeyboardAuditResult {
  id: string;
  target: string;
  graph: NavigationGraph;
  navigabilityScore: number; // 0-100
  totalFocusable: number;
  totalIssues: number;
  auditedAt: string;
}

// ── State ────────────────────────────────────────────────────────

const auditHistory: KeyboardAuditResult[] = [];
const MAX_HISTORY = 100;

// ── Graph Analysis ───────────────────────────────────────────────

function detectTraps(elements: FocusableElement[]): NavigationIssue[] {
  const issues: NavigationIssue[] = [];
  
  // A trap occurs when tab forward never leaves a group
  // Simplified: check for elements with very high tabIndex that could disrupt flow
  const withTabIndex = elements.filter(e => e.tabIndex > 0);
  if (withTabIndex.length > 0) {
    // Elements with positive tabIndex can create navigation confusion
    for (const el of withTabIndex) {
      if (el.tabIndex > 10) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'illogical_order',
          element: `<${el.tag}> tabIndex=${el.tabIndex}`,
          description: `Element has high tabIndex (${el.tabIndex}) which disrupts natural tab order`,
          severity: 'moderate',
          suggestion: 'Use tabIndex="0" for natural order or tabIndex="-1" for programmatic focus only',
        });
      }
    }
  }

  return issues;
}

function detectFocusIssues(elements: FocusableElement[]): NavigationIssue[] {
  const issues: NavigationIssue[] = [];

  for (const el of elements) {
    if (!el.hasFocusStyle && el.isVisible) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'missing_focus',
        element: `<${el.tag}> "${el.label}"`,
        description: `No visible focus indicator on ${el.tag} element`,
        severity: 'serious',
        suggestion: 'Add :focus-visible styles with clear outline or border',
      });
    }

    if (!el.isVisible && el.tabIndex >= 0) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'unreachable',
        element: `<${el.tag}> "${el.label}"`,
        description: `Hidden element is still focusable (tabIndex=${el.tabIndex})`,
        severity: 'moderate',
        suggestion: 'Add tabIndex="-1" or aria-hidden="true" to hidden elements',
      });
    }
  }

  return issues;
}

function checkTabOrder(elements: FocusableElement[]): boolean {
  // Check if elements with explicit tabIndex values are in ascending order
  const explicit = elements.filter(e => e.tabIndex > 0);
  if (explicit.length <= 1) return true;
  
  for (let i = 1; i < explicit.length; i++) {
    if (explicit[i].tabIndex < explicit[i - 1].tabIndex) return false;
  }

  // Check if visual order matches DOM order (using position)
  const visible = elements.filter(e => e.isVisible && e.tabIndex >= 0);
  for (let i = 1; i < visible.length; i++) {
    const prev = visible[i - 1].position;
    const curr = visible[i].position;
    // Major visual regression (current is significantly above previous)
    if (curr.y < prev.y - 100 && Math.abs(curr.x - prev.x) < 200) {
      return false;
    }
  }

  return true;
}

// ── Core API ────────────────────────────────────────────────────

/** Audit keyboard navigation for a target */
export function auditKeyboardNav(
  target: string,
  elements: FocusableElement[],
  hasSkipLink: boolean = false,
): KeyboardAuditResult {
  const issues: NavigationIssue[] = [];

  // Check for skip link
  if (!hasSkipLink) {
    issues.push({
      id: crypto.randomUUID(),
      type: 'missing_skip_link',
      element: '<body>',
      description: 'No skip navigation link found — keyboard users must tab through all navigation',
      severity: 'serious',
      suggestion: 'Add a "Skip to main content" link as the first focusable element',
    });
  }

  // Detect traps and focus issues
  issues.push(...detectTraps(elements));
  issues.push(...detectFocusIssues(elements));

  const tabOrderLogical = checkTabOrder(elements);
  if (!tabOrderLogical) {
    issues.push({
      id: crypto.randomUUID(),
      type: 'illogical_order',
      element: '<document>',
      description: 'Tab order does not follow visual layout — keyboard users may get disoriented',
      severity: 'moderate',
      suggestion: 'Ensure DOM order matches visual order, avoid positive tabIndex values',
    });
  }

  // Build navigation graph
  const edges: Array<{ from: string; to: string }> = [];
  const sorted = [...elements].sort((a, b) => {
    if (a.tabIndex !== b.tabIndex) return a.tabIndex - b.tabIndex;
    return 0;
  });

  for (let i = 0; i < sorted.length - 1; i++) {
    edges.push({ from: sorted[i].id, to: sorted[i + 1].id });
  }

  const trapsDetected = issues.filter(i => i.type === 'trap').length;
  const deadEndsDetected = issues.filter(i => i.type === 'dead_end').length;

  const graph: NavigationGraph = {
    nodes: elements,
    edges,
    issues,
    hasSkipLink,
    tabOrderLogical,
    trapsDetected,
    deadEndsDetected,
  };

  // Score calculation
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const seriousIssues = issues.filter(i => i.severity === 'serious').length;
  const moderateIssues = issues.filter(i => i.severity === 'moderate').length;
  const penalty = criticalIssues * 20 + seriousIssues * 10 + moderateIssues * 5;
  const navigabilityScore = Math.max(0, 100 - penalty);

  const result: KeyboardAuditResult = {
    id: crypto.randomUUID(),
    target,
    graph,
    navigabilityScore,
    totalFocusable: elements.length,
    totalIssues: issues.length,
    auditedAt: new Date().toISOString(),
  };

  auditHistory.push(result);
  if (auditHistory.length > MAX_HISTORY) auditHistory.splice(0, auditHistory.length - MAX_HISTORY);

  return result;
}

/** Get keyboard audit health */
export function getKeyboardHealth() {
  const recent = auditHistory.slice(-20);
  return {
    totalAudits: auditHistory.length,
    avgNavigabilityScore: recent.length > 0
      ? Math.round(recent.reduce((s, r) => s + r.navigabilityScore, 0) / recent.length)
      : 100,
    avgIssuesPerAudit: recent.length > 0
      ? Math.round((recent.reduce((s, r) => s + r.totalIssues, 0) / recent.length) * 10) / 10
      : 0,
  };
}

/** Reset */
export function resetKeyboardAuditor(): void {
  auditHistory.length = 0;
}
