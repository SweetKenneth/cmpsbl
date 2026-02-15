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

  return findings;
}
