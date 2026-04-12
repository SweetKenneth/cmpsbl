/**
 * CMPSBL® Recommended Behaviors Generator — Phase 4
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Transforms scan output into human-readable behavior recommendations.
 *
 * Scanning produces "recommended behaviors" — not just findings.
 * Each recommendation includes: what, why, how, and what happens if skipped.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { ScanFinding, PolicyRecommendation, ScanToPolicyResult } from './scan-to-policy';
import { mapFindingsToPolicy } from './scan-to-policy';
import type { BehaviorEngine } from './engines/primitive-engine-map';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

/** A developer-facing behavior recommendation */
export interface BehaviorRecommendation {
  /** Target function name */
  readonly target: string;
  /** Risk level derived from capability + confidence */
  readonly risk: RiskLevel;
  /** Short imperative: "Add input validation to parseUserData" */
  readonly title: string;
  /** What this behavior does at runtime */
  readonly what: string;
  /** Why this behavior is needed */
  readonly why: string;
  /** What happens if this recommendation is ignored */
  readonly ifSkipped: string;
  /** Primitive driving this recommendation */
  readonly primitive: string;
  /** Engine archetype */
  readonly engine: BehaviorEngine;
  /** Whether auto-enforced or requires opt-in */
  readonly autoEnforced: boolean;
  /** Original confidence */
  readonly confidence: number;
}

/** Complete recommendation report */
export interface BehaviorReport {
  /** All recommendations sorted by risk */
  readonly recommendations: readonly BehaviorRecommendation[];
  /** Count by risk level */
  readonly riskBreakdown: Record<RiskLevel, number>;
  /** Total enforcing behaviors */
  readonly autoEnforcedCount: number;
  /** Total observing behaviors */
  readonly observingCount: number;
  /** One-line executive summary */
  readonly summary: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — RISK CLASSIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

function classifyRisk(capability: string, confidence: number): RiskLevel {
  const enforcing = new Set(['defense_gate', 'shadow_rule', 'circuit_breaker']);
  if (enforcing.has(capability) && confidence >= 0.8) return 'critical';
  if (enforcing.has(capability)) return 'high';
  if (capability === 'governance_hook') return 'medium';
  if (capability === 'audit_trail') return 'low';
  return 'info';
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — SKIP-RISK DESCRIPTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const SKIP_RISKS: Record<string, string> = {
  defense_gate: 'Untrusted input reaches business logic — injection and XSS vectors remain open',
  governance_hook: 'State mutations occur without audit trail — compliance and debugging blind spots',
  circuit_breaker: 'Failed external calls cascade upstream — potential full-system degradation',
  audit_trail: 'No provenance record — incident investigation and compliance gaps',
  beacon_telemetry: 'No runtime health signal — operational blindness in production',
  shadow_rule: 'Auth boundaries unmonitored — privilege escalation vectors remain unchecked',
  dream_synthesis: 'Execution outcomes not captured — compounding intelligence disabled',
};

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — RECOMMENDATION BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

function buildRecommendation(rec: PolicyRecommendation): BehaviorRecommendation {
  const risk = classifyRisk(rec.capability, rec.confidence);

  const titleVerbs: Record<string, string> = {
    defense_gate: 'Add input validation to',
    governance_hook: 'Add governance audit to',
    circuit_breaker: 'Add circuit breaker to',
    audit_trail: 'Add audit trail to',
    beacon_telemetry: 'Add health telemetry to',
    shadow_rule: 'Add auth boundary check to',
    dream_synthesis: 'Add synthesis capture to',
  };

  const title = `${titleVerbs[rec.capability] ?? 'Add behavior to'} ${rec.functionName}`;

  return {
    target: rec.functionName,
    risk,
    title,
    what: rec.behaviorDescription,
    why: rec.capability === 'defense_gate'
      ? `${rec.functionName} handles untrusted input at the function boundary`
      : rec.capability === 'circuit_breaker'
      ? `${rec.functionName} makes external calls that can fail`
      : rec.capability === 'governance_hook'
      ? `${rec.functionName} mutates state without audit`
      : `${rec.functionName} is an observable execution point`,
    ifSkipped: SKIP_RISKS[rec.capability] ?? 'Reduced runtime observability and governance coverage',
    primitive: rec.primitive,
    engine: rec.engine,
    autoEnforced: rec.enforces,
    confidence: rec.confidence,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate behavior recommendations from scan findings.
 *
 * This is the Phase 4 developer-facing output: scan → recommended behaviors.
 */
export function generateBehaviorReport(findings: readonly ScanFinding[]): BehaviorReport {
  const policyResult = mapFindingsToPolicy(findings);
  const recommendations = policyResult.recommendations.map(buildRecommendation);

  // Sort by risk severity
  const riskOrder: Record<RiskLevel, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  recommendations.sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk]);

  const riskBreakdown: Record<RiskLevel, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const r of recommendations) riskBreakdown[r.risk]++;

  const autoEnforcedCount = recommendations.filter(r => r.autoEnforced).length;

  const criticalCount = riskBreakdown.critical + riskBreakdown.high;
  const summary = criticalCount > 0
    ? `${criticalCount} critical/high-risk function${criticalCount > 1 ? 's' : ''} detected — ${autoEnforcedCount} auto-enforced, ${recommendations.length - autoEnforcedCount} observing`
    : `${recommendations.length} behavior${recommendations.length !== 1 ? 's' : ''} recommended — all observational`;

  return {
    recommendations,
    riskBreakdown,
    autoEnforcedCount,
    observingCount: recommendations.length - autoEnforcedCount,
    summary,
  };
}

/**
 * Render behavior report as structured text for artifact embedding.
 */
export function renderBehaviorReportText(report: BehaviorReport): string {
  const lines: string[] = [
    '═══ CMPSBL® Recommended Behaviors ═══',
    '',
    report.summary,
    '',
  ];

  const riskEmoji: Record<RiskLevel, string> = {
    critical: '🔴', high: '🟠', medium: '🟡', low: '🟢', info: '⚪',
  };

  for (const rec of report.recommendations) {
    lines.push(`${riskEmoji[rec.risk]} [${rec.risk.toUpperCase()}] ${rec.title}`);
    lines.push(`   What: ${rec.what}`);
    lines.push(`   Why:  ${rec.why}`);
    lines.push(`   Skip: ${rec.ifSkipped}`);
    lines.push(`   Engine: ${rec.engine} | Primitive: ${rec.primitive} | Auto: ${rec.autoEnforced ? 'YES' : 'NO'}`);
    lines.push('');
  }

  return lines.join('\n');
}
