/**
 * S-Tier 058 — Attribution Laundering Detector
 * CJPI: 93 | Node: PHANTOM | ID: S-PHA02
 *
 * Detects when actions are routed through intermediary modules
 * to obscure their true origin — a substrate-level audit trail integrity check.
 */

export interface ActionTrace {
  actionId: string;
  originModule: string;
  intermediaries: string[];
  finalModule: string;
  timestamp: number;
}

export interface LaunderingAlert {
  actionId: string;
  severity: 'low' | 'medium' | 'high';
  reason: string;
  hopCount: number;
  suspiciousPath: string[];
}

const SUSPICIOUS_HOP_THRESHOLD = 3;
const KNOWN_PROXY_MODULES = ['relay', 'nexus', 'integration'];

export function detectLaundering(traces: ActionTrace[]): LaunderingAlert[] {
  const alerts: LaunderingAlert[] = [];

  for (const trace of traces) {
    const hopCount = trace.intermediaries.length;
    const reasons: string[] = [];

    // Too many hops
    if (hopCount >= SUSPICIOUS_HOP_THRESHOLD) {
      reasons.push(`Excessive hops: ${hopCount}`);
    }

    // Circular routing (origin appears in intermediaries)
    if (trace.intermediaries.includes(trace.originModule)) {
      reasons.push('Circular routing detected');
    }

    // Non-proxy modules acting as intermediaries
    const nonProxy = trace.intermediaries.filter(m => !KNOWN_PROXY_MODULES.includes(m));
    if (nonProxy.length > 1) {
      reasons.push(`Non-proxy intermediaries: ${nonProxy.join(', ')}`);
    }

    if (reasons.length > 0) {
      const severity: LaunderingAlert['severity'] =
        reasons.length >= 3 ? 'high' : reasons.length >= 2 ? 'medium' : 'low';

      alerts.push({
        actionId: trace.actionId,
        severity,
        reason: reasons.join('; '),
        hopCount,
        suspiciousPath: [trace.originModule, ...trace.intermediaries, trace.finalModule],
      });
    }
  }

  return alerts.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
}
