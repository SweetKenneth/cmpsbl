/**
 * Omega Observer Engine — Unified Observability
 * v1.0.0 — Converges verify, analyze, and forensics
 * 
 * Three perspectives:
 * - CAN CHANGE  ← verify (eligibility)
 * - WILL CHANGE ← analyze (forward intent)
 * - HAS CHANGED ← forensics (historical truth)
 * 
 * STRICTLY READ-ONLY. Never triggers evolve/apply/heal.
 */

import { checkEligibility, type EligibilityResult } from './eligibility-gate';
import { analyzeForwardIntent, type AnalyzeResult } from './forward-analyzer';
import { runForensics, type ForensicsResult, type ForensicsSince } from './forensics';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface OmegaResult {
  component?: string;
  since: string;
  timestamp: string;
  
  // Three perspectives
  can_change: EligibilityResult;
  will_change: AnalyzeResult;
  has_changed: ForensicsResult;
  
  // Unified view
  summary: OmegaSummary;
}

export interface OmegaSummary {
  status: 'ready' | 'blocked' | 'active' | 'idle';
  inline_deltas: InlineDelta[];
  key_metrics: KeyMetric[];
}

export interface InlineDelta {
  label: string;
  value: string;
  type: 'estimated' | 'observed';  // ~ vs →
}

export interface KeyMetric {
  name: string;
  current: string;
  trend: 'up' | 'down' | 'stable';
}

// ═══════════════════════════════════════════════════════════════
// OMEGA OBSERVER
// ═══════════════════════════════════════════════════════════════

/**
 * Run Omega observation on a component
 * STRICTLY READ-ONLY — never triggers side effects
 */
export async function observeOmega(
  component?: string,
  since: ForensicsSince = '24h'
): Promise<OmegaResult> {
  // Run all three perspectives in parallel
  const [eligibility, analysis, forensics] = await Promise.all([
    checkEligibility(),
    analyzeForwardIntent(),
    runForensics(component, since),
  ]);

  // Build unified result
  const result: OmegaResult = {
    component,
    since,
    timestamp: new Date().toISOString(),
    can_change: eligibility,
    will_change: analysis,
    has_changed: forensics,
    summary: buildSummary(eligibility, analysis, forensics),
  };

  return result;
}

// ═══════════════════════════════════════════════════════════════
// SUMMARY BUILDER
// ═══════════════════════════════════════════════════════════════

function buildSummary(
  eligibility: EligibilityResult,
  analysis: AnalyzeResult,
  forensics: ForensicsResult
): OmegaSummary {
  // Determine overall status
  let status: OmegaSummary['status'] = 'idle';
  
  if (!eligibility.eligible) {
    status = 'blocked';
  } else if (analysis.planned_actions.length > 0) {
    status = 'ready';
  } else if (forensics.changes_detected.length > 0) {
    status = 'active';
  }

  // Build inline deltas with ~ and → notation
  const inlineDeltas: InlineDelta[] = [];
  
  // Add estimated deltas (~) from analysis
  for (const delta of analysis.estimated_deltas.slice(0, 3)) {
    inlineDeltas.push({
      label: delta.component,
      value: delta.estimate,
      type: 'estimated',
    });
  }
  
  // Add observed deltas (→) from forensics
  for (const delta of forensics.observed_deltas.slice(0, 3)) {
    inlineDeltas.push({
      label: delta.metric,
      value: delta.delta_display,
      type: 'observed',
    });
  }

  // Build key metrics
  const keyMetrics: KeyMetric[] = [];
  
  if (eligibility.baseline_health) {
    keyMetrics.push({
      name: 'health_score',
      current: `${(eligibility.baseline_health.overall_score * 100).toFixed(1)}%`,
      trend: 'stable',
    });
  }
  
  keyMetrics.push({
    name: 'pending_actions',
    current: String(analysis.planned_actions.length),
    trend: analysis.planned_actions.length > 0 ? 'up' : 'stable',
  });
  
  keyMetrics.push({
    name: 'recent_changes',
    current: String(forensics.changes_detected.length),
    trend: forensics.changes_detected.length > 5 ? 'up' : 'stable',
  });

  return {
    status,
    inline_deltas: inlineDeltas,
    key_metrics: keyMetrics,
  };
}

// ═══════════════════════════════════════════════════════════════
// FORMATTED OUTPUT
// ═══════════════════════════════════════════════════════════════

export function formatOmega(result: OmegaResult): string {
  const lines = ['╔══════════════════════════════════════════════════════════════════════════╗'];
  lines.push('║  Ω OMEGA OBSERVER — Unified System View                                  ║');
  lines.push('╠══════════════════════════════════════════════════════════════════════════╣');

  // Status line
  const statusIcon = {
    ready: '🟢 READY',
    blocked: '🔴 BLOCKED',
    active: '🟡 ACTIVE',
    idle: '⚪ IDLE',
  }[result.summary.status];
  
  const scope = result.component || 'all';
  lines.push(`║  Status: ${statusIcon.padEnd(20)} Scope: ${scope.padEnd(26)} ║`);
  lines.push(`║  Since:  ${result.since.padEnd(20)} Time:  ${new Date(result.timestamp).toLocaleTimeString().padEnd(26)} ║`);

  // === CAN CHANGE ===
  lines.push('╠══════════════════════════════════════════════════════════════════════════╣');
  lines.push('║  ◆ CAN CHANGE (Eligibility)                                              ║');
  
  const canIcon = result.can_change.eligible ? '✅' : '❌';
  lines.push(`║    ${canIcon} ${result.can_change.eligible ? 'Eligible for evolution' : 'BLOCKED'}                                               ║`);
  
  for (const reason of result.can_change.blocking_reasons.slice(0, 2)) {
    lines.push(`║       ⛔ ${reason.substring(0, 62).padEnd(62)} ║`);
  }
  for (const warning of result.can_change.warnings.slice(0, 2)) {
    lines.push(`║       ⚠️  ${warning.substring(0, 61).padEnd(61)} ║`);
  }

  // === WILL CHANGE ===
  lines.push('╠══════════════════════════════════════════════════════════════════════════╣');
  lines.push('║  ◆ WILL CHANGE (Forward Intent)                                         ║');
  
  if (result.will_change.blocked) {
    lines.push(`║    ⛔ BLOCKED                                                             ║`);
  } else if (result.will_change.planned_actions.length === 0) {
    lines.push('║    ○ No pending changes                                                   ║');
  } else {
    const riskIcon = result.will_change.risk_level === 'low' ? '🟢' : result.will_change.risk_level === 'medium' ? '🟡' : '🔴';
    lines.push(`║    ${riskIcon} ${result.will_change.planned_actions.length} planned actions (${result.will_change.risk_level} risk)                                   ║`);
    
    for (const action of result.will_change.planned_actions.slice(0, 2)) {
      const desc = `${action.action_type}: ${action.description}`.substring(0, 60);
      lines.push(`║       ▸ ${desc.padEnd(63)} ║`);
    }
  }

  // Estimated deltas (~)
  if (result.will_change.estimated_deltas.length > 0) {
    lines.push('║    Estimates (~):                                                         ║');
    for (const delta of result.will_change.estimated_deltas.slice(0, 2)) {
      const desc = `${delta.component}: ${delta.estimate}`.substring(0, 62);
      lines.push(`║       ${desc.padEnd(65)} ║`);
    }
  }

  // === HAS CHANGED ===
  lines.push('╠══════════════════════════════════════════════════════════════════════════╣');
  lines.push('║  ◆ HAS CHANGED (Historical Truth)                                        ║');
  
  const confIcon = result.has_changed.confidence === 'high' ? '🟢' : result.has_changed.confidence === 'medium' ? '🟡' : '🔴';
  lines.push(`║    ${confIcon} ${result.has_changed.changes_detected.length} changes detected (${result.has_changed.confidence} confidence)                        ║`);
  
  for (const change of result.has_changed.changes_detected.slice(0, 2)) {
    const desc = `[${change.source}] ${change.summary}`.substring(0, 60);
    lines.push(`║       ▸ ${desc.padEnd(63)} ║`);
  }

  // Observed deltas (→)
  if (result.has_changed.observed_deltas.length > 0) {
    lines.push('║    Observed (→):                                                          ║');
    for (const delta of result.has_changed.observed_deltas.slice(0, 2)) {
      const desc = `${delta.metric}: ${delta.delta_display}`.substring(0, 62);
      lines.push(`║       ${desc.padEnd(65)} ║`);
    }
  }

  // Unknowns
  if (result.has_changed.unknowns.length > 0) {
    lines.push('║    Unknowns:                                                              ║');
    for (const unknown of result.has_changed.unknowns.slice(0, 2)) {
      lines.push(`║       ? ${unknown.substring(0, 63).padEnd(63)} ║`);
    }
  }

  // === SUMMARY ===
  lines.push('╠══════════════════════════════════════════════════════════════════════════╣');
  lines.push('║  ◆ KEY METRICS                                                           ║');
  
  for (const metric of result.summary.key_metrics) {
    const trendIcon = metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→';
    const line = `${metric.name}: ${metric.current} ${trendIcon}`.substring(0, 66);
    lines.push(`║    ${line.padEnd(68)} ║`);
  }

  // Inline deltas
  if (result.summary.inline_deltas.length > 0) {
    lines.push('╠══════════════════════════════════════════════════════════════════════════╣');
    lines.push('║  ◆ INLINE DELTAS                                                         ║');
    
    for (const delta of result.summary.inline_deltas) {
      const marker = delta.type === 'estimated' ? '~' : '→';
      const line = `${marker} ${delta.label}: ${delta.value}`.substring(0, 66);
      lines.push(`║    ${line.padEnd(68)} ║`);
    }
  }

  lines.push('╚══════════════════════════════════════════════════════════════════════════╝');
  return lines.join('\n');
}
