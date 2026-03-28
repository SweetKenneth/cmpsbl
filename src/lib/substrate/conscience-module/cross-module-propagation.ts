/**
 * CONSCIENCE — Cross-Module Propagation
 * Emits conscience.ethical_flag events for GOVERNANCE and DEFENSE
 * to react to system-wide. Uses the existing event bus pattern.
 */

import { emit } from '../events';

export type EthicalFlagSeverity = 'info' | 'warning' | 'critical' | 'emergency';

export interface EthicalFlag {
  id: string;
  source: 'CONSCIENCE';
  severity: EthicalFlagSeverity;
  action: string;
  compositeScore: number;
  recommendation: 'proceed' | 'caution' | 'block';
  biasCount: number;
  targetModules: string[];
  message: string;
  timestamp: number;
}

const MAX_FLAGS = 200;
const flagHistory: EthicalFlag[] = [];
let flagCount = 0;

/** Determine severity from evaluation results */
function determineSeverity(
  compositeScore: number,
  recommendation: 'proceed' | 'caution' | 'block',
  biasCount: number,
): EthicalFlagSeverity {
  if (recommendation === 'block') return biasCount > 2 ? 'emergency' : 'critical';
  if (recommendation === 'caution' && compositeScore < 40) return 'warning';
  if (biasCount > 3) return 'warning';
  return 'info';
}

/** Determine which modules should be notified */
function getTargetModules(severity: EthicalFlagSeverity): string[] {
  switch (severity) {
    case 'emergency': return ['GOVERNANCE', 'DEFENSE', 'CORE', 'CORTEX'];
    case 'critical':  return ['GOVERNANCE', 'DEFENSE'];
    case 'warning':   return ['GOVERNANCE'];
    case 'info':      return [];
  }
}

/** Propagate an ethical evaluation result across the substrate */
export function propagateEthicalFlag(
  action: string,
  compositeScore: number,
  recommendation: 'proceed' | 'caution' | 'block',
  biasCount: number,
): EthicalFlag | null {
  const severity = determineSeverity(compositeScore, recommendation, biasCount);

  // Only propagate warnings and above (info stays local)
  if (severity === 'info') return null;

  const targetModules = getTargetModules(severity);
  const flag: EthicalFlag = {
    id: `eflag-${Date.now()}-${++flagCount}`,
    source: 'CONSCIENCE',
    severity,
    action: action.slice(0, 200),
    compositeScore,
    recommendation,
    biasCount,
    targetModules,
    message: `CONSCIENCE ${severity.toUpperCase()}: "${action.slice(0, 60)}" scored ${compositeScore}% (${recommendation})`,
    timestamp: Date.now(),
  };

  // Store in ring buffer
  if (flagHistory.length >= MAX_FLAGS) flagHistory.shift();
  flagHistory.push(flag);

  // Emit to substrate event bus (non-blocking)
  try {
    emit('conscience', 'ethical_flag', {
      severity,
      compositeScore,
      recommendation,
      action: action.slice(0, 100),
      targetModules,
    });
  } catch {
    // Non-blocking — never interrupt evaluation
  }

  return flag;
}

/** Get flag history */
export function getFlagHistory(count: number = 50): EthicalFlag[] {
  return flagHistory.slice(-count);
}

/** Get flag stats */
export function getFlagStats() {
  const bySeverity: Record<string, number> = {};
  for (const f of flagHistory) {
    bySeverity[f.severity] = (bySeverity[f.severity] ?? 0) + 1;
  }
  return {
    total: flagHistory.length,
    bySeverity,
    lastFlagAt: flagHistory.length > 0 ? flagHistory[flagHistory.length - 1].timestamp : 0,
  };
}
