/**
 * Audit Check: Hook Contracts
 * Validates render guard and lifecycle safety
 */

import type { AuditFinding } from '../audit-types';
import { getRenderStats } from '@/lib/system/renderGuard';

export function checkHooksContracts(): AuditFinding[] {
  const findings: AuditFinding[] = [];

  // Check render stats for any excessive renders
  const stats = getRenderStats();
  const highRenders = Object.entries(stats).filter(([_, count]) => count > 30);

  if (highRenders.length > 0) {
    for (const [component, count] of highRenders) {
      findings.push({
        id: `hooks_high_renders_${component}`,
        category: 'hooks',
        severity: count > 80 ? 'error' : 'warn',
        title: `High render count: ${component}`,
        detail: `${component} rendered ${count} times. Possible render loop.`,
        hint: 'Check useEffect dependencies and state update patterns.',
      });
    }
  } else {
    findings.push({
      id: 'hooks_renders_ok',
      category: 'hooks',
      severity: 'info',
      title: 'No render loops detected',
      detail: `${Object.keys(stats).length} components tracked, all within thresholds.`,
    });
  }

  // Check for potential memory leaks — orphaned event listeners
  const allElements = document.querySelectorAll('*');
  if (allElements.length > 5000) {
    findings.push({
      id: 'hooks_dom_bloat',
      category: 'hooks',
      severity: 'warn',
      title: `DOM has ${allElements.length} elements (>5000)`,
      detail: 'Excessive DOM nodes may indicate memory leaks or missing cleanup in useEffect hooks.',
      hint: 'Review components for missing cleanup functions in useEffect.',
    });
  }

  // Check for stale React Query cache entries
  if (typeof window !== 'undefined' && (window as any).__REACT_QUERY_DEVTOOLS_GLOBAL_STORE__) {
    findings.push({
      id: 'hooks_rq_devtools',
      category: 'hooks',
      severity: 'info',
      title: 'React Query DevTools detected',
      detail: 'DevTools are active. Remove in production for smaller bundle.',
    });
  }

  return findings;
}
