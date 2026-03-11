/**
 * INCLUSIVE Glue Layer — Cross-Module Integration
 * Wires INCLUSIVE to SYSTEM, VISION, DEFENSE, EVOLUTION, TEMPLATES, MARKETPLACE
 *
 * @origin(cmptbl) — Human Compatibility Pipeline (14th Substrate Module)
 * Developed by CMPSBL® as part of the cognitive orchestration substrate.
 *
 * Integration Points:
 * - SYSTEM: inclusive.selfScan → system.audit aggregation
 * - VISION: inclusive.score → vision.health metrics
 * - DEFENSE: severity escalation → defense risk pipeline
 * - EVOLUTION: regressions → evolution.propose triggers
 * - TEMPLATES: scan → repair → validate → approve pipeline
 * - MARKETPLACE: block publishing on critical violations
 * - ACCESS: Role-based capability gating
 */

import type { InclusiveScanResult, InclusiveIssue, IssueSeverity, InclusiveModuleStatus } from './types';
import { scanHTML, calculateScore, determineOverallSeverity } from './scan';
import { repairHTML } from './repair';
import { validateRepairs, validateTemplate } from './validate';
import { generateReport } from './report';

// ═══════════════════════════════════════════════════════════════
// SYSTEM INTEGRATION — Audit & Health Surface
// ═══════════════════════════════════════════════════════════════

export interface InclusiveAuditEntry {
  timestamp: string;
  action: 'scan' | 'repair' | 'validate' | 'self_scan';
  target: string;
  score: number;
  issues_found: number;
  repairs_applied: number;
  severity: IssueSeverity;
  wcag_level: 'A' | 'AA' | 'AAA';
}

// In-memory audit buffer for system.audit integration
const auditBuffer: InclusiveAuditEntry[] = [];
const MAX_AUDIT_ENTRIES = 100;

/**
 * Log action to audit buffer for system.audit aggregation
 */
export function logToAudit(entry: Omit<InclusiveAuditEntry, 'timestamp'>): void {
  auditBuffer.unshift({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  
  // Trim buffer
  if (auditBuffer.length > MAX_AUDIT_ENTRIES) {
    auditBuffer.pop();
  }
}

/**
 * Get audit entries for system.audit integration
 */
export function getAuditEntries(since?: string, limit = 50): InclusiveAuditEntry[] {
  let entries = auditBuffer;
  
  if (since) {
    const sinceDate = new Date(since);
    entries = entries.filter(e => new Date(e.timestamp) >= sinceDate);
  }
  
  return entries.slice(0, limit);
}

/**
 * Get inclusive data for system.health card
 */
export function getSystemHealthData(): {
  module: 'inclusive';
  status: 'healthy' | 'degraded' | 'critical';
  score: number;
  violations_24h: number;
  regressions_24h: number;
  last_scan: string | null;
} {
  const status = getModuleStatus();
  
  let healthStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
  if (status.global_score < 50) healthStatus = 'critical';
  else if (status.global_score < 70) healthStatus = 'degraded';
  
  return {
    module: 'inclusive',
    status: healthStatus,
    score: status.global_score,
    violations_24h: status.total_violations,
    regressions_24h: status.regressions_24h,
    last_scan: status.last_scan,
  };
}

// ═══════════════════════════════════════════════════════════════
// VISION INTEGRATION — Metrics & Observability
// ═══════════════════════════════════════════════════════════════

export interface InclusiveVisionMetrics {
  global_score: number;
  total_scans: number;
  total_violations: number;
  auto_repairs_applied: number;
  templates_scanned: number;
  templates_passing: number;
  coverage_percent: number;
  regressions_24h: number;
  severity_distribution: Record<IssueSeverity, number>;
}

// Metrics accumulator
let metricsState: InclusiveVisionMetrics = {
  global_score: 100,
  total_scans: 0,
  total_violations: 0,
  auto_repairs_applied: 0,
  templates_scanned: 0,
  templates_passing: 0,
  coverage_percent: 0,
  regressions_24h: 0,
  severity_distribution: { critical: 0, high: 0, medium: 0, low: 0 },
};

/**
 * Update metrics after scan
 */
export function updateVisionMetrics(result: InclusiveScanResult): void {
  metricsState.total_scans++;
  metricsState.total_violations += result.issues.length;
  metricsState.auto_repairs_applied += result.repairs.length;
  
  // Update severity distribution
  result.issues.forEach(issue => {
    metricsState.severity_distribution[issue.severity]++;
  });
  
  // Rolling average for global score
  metricsState.global_score = Math.round(
    (metricsState.global_score * (metricsState.total_scans - 1) + result.score) / 
    metricsState.total_scans
  );
}

/**
 * Get metrics for vision.health integration
 */
export function getVisionMetrics(): InclusiveVisionMetrics {
  return { ...metricsState };
}

/**
 * Get data for vision.health_snapshot
 */
export function getHealthSnapshot(): {
  inclusive: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    critical_count: number;
    last_updated: string;
  };
} {
  const criticalCount = metricsState.severity_distribution.critical;
  // Calculate trend from score history
  const globalHistory = scoreHistory.get('global') || [];
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (globalHistory.length >= 2) {
    const recent = globalHistory[globalHistory.length - 1];
    const previous = globalHistory[globalHistory.length - 2];
    if (recent > previous + 2) trend = 'up';
    else if (recent < previous - 2) trend = 'down';
  }

  return {
    inclusive: {
      score: metricsState.global_score,
      trend,
      critical_count: criticalCount,
      last_updated: new Date().toISOString(),
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// DEFENSE INTEGRATION — Severity Escalation
// ═══════════════════════════════════════════════════════════════

export interface DefenseRiskEvent {
  type: 'accessibility_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: 'inclusive';
  target: string;
  issues: InclusiveIssue[];
  wcag_criteria: string[];
  recommended_action: 'monitor' | 'alert' | 'block';
  timestamp: string;
}

/**
 * Map inclusive severity to defense risk tier
 */
export function mapToDefenseRisk(
  inclusiveSeverity: IssueSeverity
): 'low' | 'medium' | 'high' | 'critical' {
  return inclusiveSeverity; // Direct mapping for now
}

/**
 * Create defense risk event from scan result
 * Only triggers for high/critical severity
 */
export function createDefenseRiskEvent(
  target: string,
  issues: InclusiveIssue[]
): DefenseRiskEvent | null {
  const overallSeverity = determineOverallSeverity(issues);
  
  // Only escalate high/critical
  if (overallSeverity !== 'high' && overallSeverity !== 'critical') {
    return null;
  }
  
  const criticalIssues = issues.filter(
    i => i.severity === 'critical' || i.severity === 'high'
  );
  
  return {
    type: 'accessibility_violation',
    severity: mapToDefenseRisk(overallSeverity),
    source: 'inclusive',
    target,
    issues: criticalIssues,
    wcag_criteria: [...new Set(criticalIssues.map(i => i.wcag_criterion))],
    recommended_action: overallSeverity === 'critical' ? 'block' : 'alert',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check if defense should trigger alert
 */
export function shouldTriggerDefenseAlert(issues: InclusiveIssue[]): boolean {
  const severity = determineOverallSeverity(issues);
  return severity === 'high' || severity === 'critical';
}

// ═══════════════════════════════════════════════════════════════
// EVOLUTION INTEGRATION — Proposal Triggers
// ═══════════════════════════════════════════════════════════════

export interface EvolutionProposal {
  type: 'fix_accessibility';
  source: 'inclusive';
  tag: 'human_compatibility';
  priority: 'low' | 'medium' | 'high' | 'critical';
  regressions: RegressionRecord[];
  suggested_actions: string[];
  auto_apply_eligible: boolean;
  created_at: string;
}

export interface RegressionRecord {
  target: string;
  previous_score: number;
  current_score: number;
  delta: number;
  new_issues: InclusiveIssue[];
  detected_at: string;
}

// Regression tracking
const regressionHistory: RegressionRecord[] = [];
const scoreHistory: Map<string, number[]> = new Map();

/**
 * Track score for regression detection
 */
export function trackScore(target: string, score: number): void {
  const history = scoreHistory.get(target) || [];
  history.push(score);
  
  // Keep last 10 scores
  if (history.length > 10) {
    history.shift();
  }
  
  scoreHistory.set(target, history);
}

/**
 * Detect regression and record it
 */
export function detectRegression(
  target: string,
  currentScore: number,
  currentIssues: InclusiveIssue[]
): RegressionRecord | null {
  const history = scoreHistory.get(target) || [];
  
  if (history.length < 2) {
    return null;
  }
  
  const previousScore = history[history.length - 2];
  const delta = currentScore - previousScore;
  
  // Regression = score dropped by 5+ points
  if (delta < -5) {
    const regression: RegressionRecord = {
      target,
      previous_score: previousScore,
      current_score: currentScore,
      delta,
      new_issues: currentIssues,
      detected_at: new Date().toISOString(),
    };
    
    regressionHistory.unshift(regression);
    
    // Keep last 50 regressions
    if (regressionHistory.length > 50) {
      regressionHistory.pop();
    }
    
    return regression;
  }
  
  return null;
}

/**
 * Get regressions in time window
 */
export function getRegressions(hours = 24): RegressionRecord[] {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return regressionHistory.filter(r => new Date(r.detected_at) >= cutoff);
}

/**
 * Create evolution proposal from regressions
 */
export function createEvolutionProposal(
  regressions: RegressionRecord[]
): EvolutionProposal | null {
  if (regressions.length === 0) {
    return null;
  }
  
  // Determine priority based on worst regression
  const worstDelta = Math.min(...regressions.map(r => r.delta));
  let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (worstDelta < -20) priority = 'critical';
  else if (worstDelta < -15) priority = 'high';
  else if (worstDelta < -10) priority = 'medium';
  
  // Collect suggested actions
  const allIssues = regressions.flatMap(r => r.new_issues);
  const autoFixable = allIssues.filter(i => i.auto_fixable);
  
  const suggestedActions: string[] = [];
  if (autoFixable.length > 0) {
    suggestedActions.push(`Run inclusive.repair on ${regressions.length} target(s) to auto-fix ${autoFixable.length} issue(s)`);
  }
  
  const criticalIssues = allIssues.filter(i => i.severity === 'critical');
  if (criticalIssues.length > 0) {
    suggestedActions.push(`Address ${criticalIssues.length} critical WCAG violation(s) immediately`);
  }
  
  return {
    type: 'fix_accessibility',
    source: 'inclusive',
    tag: 'human_compatibility',
    priority,
    regressions,
    suggested_actions: suggestedActions,
    auto_apply_eligible: priority === 'low' && autoFixable.length === allIssues.length,
    created_at: new Date().toISOString(),
  };
}

/** @deprecated Use EvolutionProposal */
export type ModernizerProposal = EvolutionProposal;
/** @deprecated Use createEvolutionProposal */
export const createModernizerProposal = createEvolutionProposal;

// ═══════════════════════════════════════════════════════════════
// TEMPLATE PIPELINE — Compliance Gate
// ═══════════════════════════════════════════════════════════════

export interface TemplatePipelineResult {
  template_id: string;
  approved: boolean;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  stages: {
    scan: { success: boolean; issues: number; duration_ms: number };
    repair: { success: boolean; repairs: number; duration_ms: number };
    validate: { success: boolean; score_improvement: number; duration_ms: number };
  };
  blockers: string[];
  wcag_level: 'A' | 'AA' | 'AAA';
  completed_at: string;
}

/**
 * Run full template compliance pipeline
 * scan → repair → validate → approve
 */
export function runTemplatePipeline(
  templateId: string,
  html: string,
  minScore = 70,
  wcagLevel: 'A' | 'AA' | 'AAA' = 'AA'
): TemplatePipelineResult {
  const pipelineStart = Date.now();
  
  // Stage 1: Scan
  const scanStart = Date.now();
  const issues = scanHTML(html, wcagLevel);
  const initialScore = calculateScore(issues);
  const scanDuration = Date.now() - scanStart;
  
  // Stage 2: Repair
  const repairStart = Date.now();
  const { html: repairedHtml, repairs } = repairHTML(html, issues);
  const repairDuration = Date.now() - repairStart;
  
  // Stage 3: Validate
  const validateStart = Date.now();
  const validation = validateRepairs(html, repairedHtml, repairs, wcagLevel);
  const validateDuration = Date.now() - validateStart;
  
  // Stage 4: Approve/Reject
  const templateCheck = validateTemplate(repairedHtml, minScore, wcagLevel);
  
  // Log to audit
  logToAudit({
    action: 'validate',
    target: templateId,
    score: validation.new_score,
    issues_found: issues.length,
    repairs_applied: repairs.length,
    severity: determineOverallSeverity(issues),
    wcag_level: wcagLevel,
  });
  
  // Update metrics
  metricsState.templates_scanned++;
  if (templateCheck.approved) {
    metricsState.templates_passing++;
  }
  metricsState.coverage_percent = Math.round(
    (metricsState.templates_passing / metricsState.templates_scanned) * 100
  );
  
  return {
    template_id: templateId,
    approved: templateCheck.approved,
    score: validation.new_score,
    grade: templateCheck.score >= 90 ? 'A' : 
           templateCheck.score >= 80 ? 'B' : 
           templateCheck.score >= 70 ? 'C' : 
           templateCheck.score >= 60 ? 'D' : 'F',
    stages: {
      scan: { success: true, issues: issues.length, duration_ms: scanDuration },
      repair: { success: repairs.length > 0, repairs: repairs.length, duration_ms: repairDuration },
      validate: { success: validation.valid, score_improvement: validation.score_improvement, duration_ms: validateDuration },
    },
    blockers: templateCheck.blockers,
    wcag_level: wcagLevel,
    completed_at: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════
// MARKETPLACE INTEGRATION — Publish Gate
// ═══════════════════════════════════════════════════════════════

export interface MarketplacePublishResult {
  allowed: boolean;
  template_id: string;
  score: number;
  blocking_reason?: string;
  wcag_violations?: {
    criterion: string;
    title: string;
    severity: IssueSeverity;
    description: string;
  }[];
  recommendations: string[];
}

/**
 * Check if template can be published to marketplace
 * Blocks on critical accessibility failures
 */
export function checkMarketplacePublish(
  templateId: string,
  html: string,
  wcagLevel: 'A' | 'AA' | 'AAA' = 'AA'
): MarketplacePublishResult {
  const issues = scanHTML(html, wcagLevel);
  const score = calculateScore(issues);
  const severity = determineOverallSeverity(issues);
  
  // Block on critical violations
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  
  if (criticalIssues.length > 0) {
    return {
      allowed: false,
      template_id: templateId,
      score,
      blocking_reason: `${criticalIssues.length} critical WCAG violation(s) must be fixed before publishing`,
      wcag_violations: criticalIssues.map(i => ({
        criterion: i.wcag_criterion,
        title: i.type,
        severity: i.severity,
        description: i.description,
      })),
      recommendations: [
        'Run inclusive.repair to auto-fix supported issues',
        'Address critical violations manually for unsupported fixes',
        'Re-run inclusive.scan after fixes to verify compliance',
      ],
    };
  }
  
  // Allow with warnings for high severity
  const highIssues = issues.filter(i => i.severity === 'high');
  
  return {
    allowed: true,
    template_id: templateId,
    score,
    wcag_violations: highIssues.length > 0 ? highIssues.map(i => ({
      criterion: i.wcag_criterion,
      title: i.type,
      severity: i.severity,
      description: i.description,
    })) : undefined,
    recommendations: highIssues.length > 0 
      ? ['Consider fixing high-priority issues to improve accessibility score']
      : ['Template meets WCAG compliance standards'],
  };
}

// ═══════════════════════════════════════════════════════════════
// ACCESS INTEGRATION — Role-Based Capabilities
// ═══════════════════════════════════════════════════════════════

export type InclusiveRole = 'observer' | 'operator' | 'governor';

export interface InclusiveCapabilities {
  can_view_reports: boolean;
  can_scan: boolean;
  can_validate: boolean;
  can_repair: boolean;
  can_apply_global: boolean;
  can_modify_settings: boolean;
}

/**
 * Get capabilities for role
 */
export function getCapabilitiesForRole(role: InclusiveRole): InclusiveCapabilities {
  switch (role) {
    case 'governor':
      return {
        can_view_reports: true,
        can_scan: true,
        can_validate: true,
        can_repair: true,
        can_apply_global: true,
        can_modify_settings: true,
      };
    case 'operator':
      return {
        can_view_reports: true,
        can_scan: true,
        can_validate: true,
        can_repair: false,
        can_apply_global: false,
        can_modify_settings: false,
      };
    case 'observer':
    default:
      return {
        can_view_reports: true,
        can_scan: false,
        can_validate: false,
        can_repair: false,
        can_apply_global: false,
        can_modify_settings: false,
      };
  }
}

/**
 * Check if action is allowed for role
 */
export function isActionAllowed(
  role: InclusiveRole,
  action: 'scan' | 'repair' | 'validate' | 'report' | 'apply_global' | 'settings'
): boolean {
  const caps = getCapabilitiesForRole(role);
  
  switch (action) {
    case 'scan': return caps.can_scan;
    case 'repair': return caps.can_repair;
    case 'validate': return caps.can_validate;
    case 'report': return caps.can_view_reports;
    case 'apply_global': return caps.can_apply_global;
    case 'settings': return caps.can_modify_settings;
    default: return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// MODULE STATUS — Central State
// ═══════════════════════════════════════════════════════════════

/**
 * Get complete module status
 */
export function getModuleStatus(): InclusiveModuleStatus {
  const recentRegressions = getRegressions(24);
  const auditEntries = getAuditEntries(undefined, 1);
  
  return {
    active: true,
    version: '6.0.0',
    global_score: metricsState.global_score,
    total_violations: metricsState.total_violations,
    pending_repairs: metricsState.severity_distribution.critical + metricsState.severity_distribution.high,
    regressions_24h: recentRegressions.length,
    template_coverage: metricsState.coverage_percent,
    last_scan: auditEntries[0]?.timestamp || null,
  };
}

/**
 * Reset metrics (for testing)
 */
export function resetMetrics(): void {
  metricsState = {
    global_score: 100,
    total_scans: 0,
    total_violations: 0,
    auto_repairs_applied: 0,
    templates_scanned: 0,
    templates_passing: 0,
    coverage_percent: 0,
    regressions_24h: 0,
    severity_distribution: { critical: 0, high: 0, medium: 0, low: 0 },
  };
}
