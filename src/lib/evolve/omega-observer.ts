/**
 * Omega Observer Engine — Unified Observability
 * v2.0.0 — Converges verify, analyze, and forensics
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
  duration_ms: number;
  
  // Three perspectives
  can_change: EligibilityResult;
  will_change: AnalyzeResult;
  has_changed: ForensicsResult;
  
  // Unified view
  summary: OmegaSummary;
  
  // Insights
  insights: OmegaInsight[];
}

export interface OmegaSummary {
  status: 'ready' | 'blocked' | 'active' | 'idle' | 'evolving';
  status_description: string;
  inline_deltas: InlineDelta[];
  key_metrics: KeyMetric[];
  health_score: number;
  activity_level: 'high' | 'medium' | 'low' | 'none';
}

export interface InlineDelta {
  label: string;
  value: string;
  type: 'estimated' | 'observed';  // ~ vs →
  trend?: 'up' | 'down' | 'stable';
}

export interface KeyMetric {
  name: string;
  current: string;
  trend: 'up' | 'down' | 'stable';
  sparkline?: number[];
}

export interface OmegaInsight {
  type: 'recommendation' | 'warning' | 'info';
  message: string;
  priority: 'high' | 'medium' | 'low';
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
  const startTime = Date.now();
  
  // Run all three perspectives in parallel
  const [eligibility, analysis, forensics] = await Promise.all([
    checkEligibility(),
    analyzeForwardIntent(),
    runForensics(component, since),
  ]);

  const duration_ms = Date.now() - startTime;

  // Build unified result
  const result: OmegaResult = {
    component,
    since,
    timestamp: new Date().toISOString(),
    duration_ms,
    can_change: eligibility,
    will_change: analysis,
    has_changed: forensics,
    summary: buildSummary(eligibility, analysis, forensics),
    insights: generateInsights(eligibility, analysis, forensics),
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
  let status_description = 'System is idle — no pending changes';
  
  if (!eligibility.eligible) {
    status = 'blocked';
    status_description = eligibility.blocking_reasons[0] || 'Evolution blocked';
  } else if (analysis.planned_actions.length > 0) {
    status = 'ready';
    status_description = `${analysis.planned_actions.length} actions ready to apply`;
  } else if (forensics.changes_detected.length > 0) {
    status = 'active';
    status_description = `${forensics.changes_detected.length} recent changes detected`;
  }

  // Calculate activity level
  const activityLevel = determineActivityLevel(analysis, forensics);

  // Build inline deltas with ~ and → notation
  const inlineDeltas: InlineDelta[] = [];
  
  // Add estimated deltas (~) from analysis
  for (const delta of analysis.estimated_deltas.slice(0, 4)) {
    inlineDeltas.push({
      label: delta.component,
      value: delta.estimate,
      type: 'estimated',
      trend: delta.estimate.includes('+') ? 'up' : delta.estimate.includes('-') ? 'down' : 'stable',
    });
  }
  
  // Add observed deltas (→) from forensics
  for (const delta of forensics.observed_deltas.slice(0, 4)) {
    const numericAfter = typeof delta.after === 'number' ? delta.after : 0;
    const numericBefore = typeof delta.before === 'number' ? delta.before : 0;
    inlineDeltas.push({
      label: delta.metric,
      value: delta.delta_display,
      type: 'observed',
      trend: numericAfter > numericBefore ? 'up' : numericAfter < numericBefore ? 'down' : 'stable',
    });
  }

  // Build key metrics
  const keyMetrics: KeyMetric[] = [];
  
  if (eligibility.baseline_health) {
    const healthPct = eligibility.baseline_health.overall_score * 100;
    keyMetrics.push({
      name: 'System Health',
      current: `${healthPct.toFixed(1)}%`,
      trend: healthPct >= 90 ? 'stable' : healthPct >= 70 ? 'down' : 'down',
    });
  }
  
  keyMetrics.push({
    name: 'Pending Actions',
    current: String(analysis.planned_actions.length),
    trend: analysis.planned_actions.length > 0 ? 'up' : 'stable',
  });
  
  keyMetrics.push({
    name: 'Recent Changes',
    current: String(forensics.changes_detected.length),
    trend: forensics.changes_detected.length > 5 ? 'up' : 'stable',
  });

  keyMetrics.push({
    name: 'Risk Level',
    current: analysis.risk_level.toUpperCase(),
    trend: analysis.risk_level === 'high' ? 'down' : analysis.risk_level === 'low' ? 'up' : 'stable',
  });

  // Calculate health score
  const healthScore = eligibility.baseline_health?.overall_score ?? 1.0;

  return {
    status,
    status_description,
    inline_deltas: inlineDeltas,
    key_metrics: keyMetrics,
    health_score: healthScore,
    activity_level: activityLevel,
  };
}

function determineActivityLevel(
  analysis: AnalyzeResult,
  forensics: ForensicsResult
): 'high' | 'medium' | 'low' | 'none' {
  const totalActivity = analysis.planned_actions.length + forensics.changes_detected.length;
  
  if (totalActivity >= 10) return 'high';
  if (totalActivity >= 5) return 'medium';
  if (totalActivity >= 1) return 'low';
  return 'none';
}

// ═══════════════════════════════════════════════════════════════
// INSIGHT GENERATOR
// ═══════════════════════════════════════════════════════════════

function generateInsights(
  eligibility: EligibilityResult,
  analysis: AnalyzeResult,
  forensics: ForensicsResult
): OmegaInsight[] {
  const insights: OmegaInsight[] = [];

  // High-priority blocking reasons
  for (const reason of eligibility.blocking_reasons) {
    insights.push({
      type: 'warning',
      message: reason,
      priority: 'high',
    });
  }

  // Warnings
  for (const warning of eligibility.warnings) {
    insights.push({
      type: 'warning',
      message: warning,
      priority: 'medium',
    });
  }

  // High-risk actions
  if (analysis.risk_level === 'high') {
    insights.push({
      type: 'warning',
      message: 'High-risk actions pending — review before applying',
      priority: 'high',
    });
  }

  // Ready to evolve
  if (eligibility.eligible && analysis.planned_actions.length > 0) {
    insights.push({
      type: 'recommendation',
      message: `System eligible for evolution with ${analysis.planned_actions.length} planned actions`,
      priority: 'medium',
    });
  }

  // Low confidence forensics
  if (forensics.confidence === 'low') {
    insights.push({
      type: 'info',
      message: 'Limited historical data — forensics confidence is low',
      priority: 'low',
    });
  }

  // Unknown changes
  if (forensics.unknowns.length > 0) {
    insights.push({
      type: 'info',
      message: `${forensics.unknowns.length} unknown or incomplete change records`,
      priority: 'low',
    });
  }

  // Healthy system with no pending changes
  if (eligibility.eligible && analysis.planned_actions.length === 0 && forensics.changes_detected.length === 0) {
    insights.push({
      type: 'info',
      message: 'System is healthy with no pending changes — all clear',
      priority: 'low',
    });
  }

  return insights;
}

// ═══════════════════════════════════════════════════════════════
// FORMATTED OUTPUT
// ═══════════════════════════════════════════════════════════════

const BOX_WIDTH = 78;
const CONTENT_WIDTH = BOX_WIDTH - 4; // Account for "║  " and " ║"

function pad(str: string, width: number = CONTENT_WIDTH): string {
  return str.substring(0, width).padEnd(width);
}

function center(str: string, width: number = CONTENT_WIDTH): string {
  const padSize = Math.floor((width - str.length) / 2);
  return ' '.repeat(Math.max(0, padSize)) + str + ' '.repeat(Math.max(0, width - str.length - padSize));
}

export function formatOmega(result: OmegaResult): string {
  const lines: string[] = [];
  
  // Header with DNA helix aesthetic
  lines.push('╔══════════════════════════════════════════════════════════════════════════════╗');
  lines.push('║  ╱╲    ╱╲    ╱╲    ╱╲    ╱╲    ╱╲    ╱╲    ╱╲    ╱╲    ╱╲    ╱╲    ╱╲    ╱╲  ║');
  lines.push('║  ═══════════════════════════════════════════════════════════════════════════  ║');
  lines.push('║                        Ω OMEGA OBSERVER ENGINE v2.0                          ║');
  lines.push('║                     Unified Read-Only System Observability                   ║');
  lines.push('║  ═══════════════════════════════════════════════════════════════════════════  ║');
  lines.push('║  ╲╱    ╲╱    ╲╱    ╲╱    ╲╱    ╲╱    ╲╱    ╲╱    ╲╱    ╲╱    ╲╱    ╲╱    ╲╱  ║');
  lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');

  // Status block
  const statusIcon = {
    ready: '🟢',
    blocked: '🔴',
    active: '🟡',
    idle: '⚪',
    evolving: '🔵',
  }[result.summary.status];
  
  const statusLabel = result.summary.status.toUpperCase();
  const scope = result.component || 'ALL';
  const healthBar = renderHealthBar(result.summary.health_score, 20);
  
  lines.push(`║  ${statusIcon} STATUS: ${statusLabel.padEnd(12)} SCOPE: ${scope.padEnd(16)} SINCE: ${result.since.padEnd(8)}      ║`);
  lines.push(`║  ${pad(result.summary.status_description)}  ║`);
  lines.push(`║  Health: ${healthBar} ${(result.summary.health_score * 100).toFixed(0).padStart(3)}%    Query: ${result.duration_ms}ms                 ║`);

  // === CAN CHANGE (Eligibility) ===
  lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
  lines.push('║  ┌─ CAN CHANGE ─────────────────────────────────────────────────────────────┐ ║');
  
  const canIcon = result.can_change.eligible ? '✓' : '✗';
  const canStatus = result.can_change.eligible ? 'ELIGIBLE' : 'BLOCKED';
  const canColor = result.can_change.eligible ? '🟢' : '🔴';
  
  lines.push(`║  │ ${canColor} ${canIcon} ${canStatus.padEnd(68)} │ ║`);
  
  // Blocking reasons
  if (result.can_change.blocking_reasons.length > 0) {
    for (const reason of result.can_change.blocking_reasons.slice(0, 3)) {
      lines.push(`║  │   ⛔ ${pad(reason, 66)} │ ║`);
    }
    if (result.can_change.blocking_reasons.length > 3) {
      lines.push(`║  │   ... +${result.can_change.blocking_reasons.length - 3} more blocking reasons                                        │ ║`);
    }
  }
  
  // Warnings
  if (result.can_change.warnings.length > 0) {
    for (const warning of result.can_change.warnings.slice(0, 2)) {
      lines.push(`║  │   ⚠️  ${pad(warning, 65)} │ ║`);
    }
  }
  
  // Baseline health
  if (result.can_change.baseline_health) {
    const bh = result.can_change.baseline_health;
    lines.push(`║  │   📊 Baseline: ${(bh.overall_score * 100).toFixed(1)}% health | ${bh.error_count} errors | ${bh.warning_count} warnings          │ ║`);
  }
  
  lines.push('║  └──────────────────────────────────────────────────────────────────────────┘ ║');

  // === WILL CHANGE (Forward Intent) ===
  lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
  lines.push('║  ┌─ WILL CHANGE ────────────────────────────────────────────────────────────┐ ║');
  
  if (result.will_change.blocked) {
    lines.push(`║  │ 🔴 ✗ BLOCKED: ${pad(result.will_change.blocked_reason || 'Unknown', 55)} │ ║`);
  } else if (result.will_change.planned_actions.length === 0) {
    lines.push('║  │ ⚪ ○ No pending changes queued                                          │ ║');
  } else {
    const riskIcon = { low: '🟢', medium: '🟡', high: '🔴' }[result.will_change.risk_level];
    lines.push(`║  │ ${riskIcon} ${result.will_change.planned_actions.length} planned actions | Risk: ${result.will_change.risk_level.toUpperCase().padEnd(6)}                               │ ║`);
    
    // Show top actions
    for (const action of result.will_change.planned_actions.slice(0, 3)) {
      const conf = `${(action.confidence * 100).toFixed(0)}%`;
      const desc = `${action.action_type}: ${action.description}`.substring(0, 58);
      lines.push(`║  │   ▸ ${desc.padEnd(58)} [${conf}] │ ║`);
    }
    if (result.will_change.planned_actions.length > 3) {
      lines.push(`║  │   ... +${result.will_change.planned_actions.length - 3} more actions                                                   │ ║`);
    }
  }

  // Estimated deltas (~)
  if (result.will_change.estimated_deltas.length > 0) {
    lines.push('║  │                                                                          │ ║');
    lines.push('║  │   ESTIMATES (~):                                                         │ ║');
    for (const delta of result.will_change.estimated_deltas.slice(0, 3)) {
      const trendIcon = delta.estimate.includes('+') ? '↑' : delta.estimate.includes('-') ? '↓' : '→';
      const desc = `${trendIcon} ${delta.component}: ${delta.estimate}`.substring(0, 66);
      lines.push(`║  │     ${pad(desc, 66)} │ ║`);
    }
  }
  
  lines.push('║  └──────────────────────────────────────────────────────────────────────────┘ ║');

  // === HAS CHANGED (Forensics) ===
  lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
  lines.push('║  ┌─ HAS CHANGED ────────────────────────────────────────────────────────────┐ ║');
  
  const confIcon = { high: '🟢', medium: '🟡', low: '🔴' }[result.has_changed.confidence];
  lines.push(`║  │ ${confIcon} ${result.has_changed.changes_detected.length} changes detected | Confidence: ${result.has_changed.confidence.toUpperCase().padEnd(6)}                   │ ║`);
  
  // Recent changes
  if (result.has_changed.changes_detected.length > 0) {
    for (const change of result.has_changed.changes_detected.slice(0, 3)) {
      const time = new Date(change.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const desc = `[${change.source}] ${change.summary}`.substring(0, 56);
      lines.push(`║  │   ${time} ▸ ${desc.padEnd(56)} │ ║`);
    }
    if (result.has_changed.changes_detected.length > 3) {
      lines.push(`║  │   ... +${result.has_changed.changes_detected.length - 3} more changes                                                 │ ║`);
    }
  }

  // Observed deltas (→)
  if (result.has_changed.observed_deltas.length > 0) {
    lines.push('║  │                                                                          │ ║');
    lines.push('║  │   OBSERVED (→):                                                          │ ║');
    for (const delta of result.has_changed.observed_deltas.slice(0, 3)) {
      const desc = `${delta.metric}: ${delta.delta_display}`.substring(0, 66);
      lines.push(`║  │     ${pad(desc, 66)} │ ║`);
    }
  }

  // Unknowns
  if (result.has_changed.unknowns.length > 0) {
    lines.push('║  │                                                                          │ ║');
    lines.push('║  │   UNKNOWNS:                                                              │ ║');
    for (const unknown of result.has_changed.unknowns.slice(0, 2)) {
      lines.push(`║  │     ❓ ${pad(unknown, 64)} │ ║`);
    }
  }
  
  lines.push('║  └──────────────────────────────────────────────────────────────────────────┘ ║');

  // === KEY METRICS ===
  lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
  lines.push('║  ┌─ KEY METRICS ────────────────────────────────────────────────────────────┐ ║');
  
  // Render metrics in a grid (2 per row)
  const metrics = result.summary.key_metrics;
  for (let i = 0; i < metrics.length; i += 2) {
    const m1 = metrics[i];
    const m2 = metrics[i + 1];
    
    const t1 = { up: '↑', down: '↓', stable: '→' }[m1.trend];
    const col1 = `${m1.name}: ${m1.current} ${t1}`.padEnd(34);
    
    let col2 = '';
    if (m2) {
      const t2 = { up: '↑', down: '↓', stable: '→' }[m2.trend];
      col2 = `${m2.name}: ${m2.current} ${t2}`.padEnd(34);
    }
    
    lines.push(`║  │   ${col1}  ${col2} │ ║`);
  }
  
  lines.push('║  └──────────────────────────────────────────────────────────────────────────┘ ║');

  // === INSIGHTS ===
  if (result.insights.length > 0) {
    lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
    lines.push('║  ┌─ INSIGHTS ─────────────────────────────────────────────────────────────────┐ ║');
    
    const sortedInsights = [...result.insights].sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return priority[a.priority] - priority[b.priority];
    });
    
    for (const insight of sortedInsights.slice(0, 4)) {
      const icon = { recommendation: '💡', warning: '⚠️', info: 'ℹ️' }[insight.type];
      const priorityBadge = { high: '🔴', medium: '🟡', low: '⚪' }[insight.priority];
      const msg = insight.message.substring(0, 62);
      lines.push(`║  │  ${icon} ${priorityBadge} ${pad(msg, 62)} │ ║`);
    }
    
    if (result.insights.length > 4) {
      lines.push(`║  │     ... +${result.insights.length - 4} more insights                                                │ ║`);
    }
    
    lines.push('║  └──────────────────────────────────────────────────────────────────────────┘ ║');
  }

  // === INLINE DELTAS ===
  if (result.summary.inline_deltas.length > 0) {
    lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
    lines.push('║  ┌─ DELTA SUMMARY ────────────────────────────────────────────────────────┐ ║');
    
    for (const delta of result.summary.inline_deltas.slice(0, 4)) {
      const marker = delta.type === 'estimated' ? '~' : '→';
      const trendIcon = delta.trend === 'up' ? '↑' : delta.trend === 'down' ? '↓' : '•';
      const line = `${marker} ${delta.label}: ${delta.value} ${trendIcon}`.substring(0, 68);
      lines.push(`║  │   ${pad(line, 68)} │ ║`);
    }
    
    lines.push('║  └──────────────────────────────────────────────────────────────────────────┘ ║');
  }

  // Footer
  lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
  lines.push('║  Aliases: mo <component> | mv (verify) | mf (forensics)                       ║');
  lines.push('║  ═══════════════════════════════════════════════════════════════════════════  ║');
  lines.push(`║  ${center(`Ω Observation completed at ${new Date(result.timestamp).toLocaleString()}`)}  ║`);
  lines.push('╚══════════════════════════════════════════════════════════════════════════════╝');

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// COMPACT FORMAT (for quick checks)
// ═══════════════════════════════════════════════════════════════

export function formatOmegaCompact(result: OmegaResult): string {
  const statusIcon = { ready: '🟢', blocked: '🔴', active: '🟡', idle: '⚪', evolving: '🔵' }[result.summary.status];
  const canIcon = result.can_change.eligible ? '✓' : '✗';
  const willCount = result.will_change.planned_actions.length;
  const hasCount = result.has_changed.changes_detected.length;
  const health = (result.summary.health_score * 100).toFixed(0);
  
  const lines = [
    `Ω OMEGA ${statusIcon} ${result.summary.status.toUpperCase()} | Health: ${health}%`,
    `├─ CAN:  ${canIcon} ${result.can_change.eligible ? 'Eligible' : result.can_change.blocking_reasons[0] || 'Blocked'}`,
    `├─ WILL: ${willCount} actions (${result.will_change.risk_level} risk)`,
    `└─ HAS:  ${hasCount} changes (${result.has_changed.confidence} confidence)`,
  ];
  
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function renderHealthBar(score: number, width: number): string {
  const filled = Math.round(score * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}]`;
}
