/**
 * Forward Analyzer — Project WHAT WILL CHANGE
 * Plan-independent forward intent projection
 * 
 * Runs at any phase (idle, mid-cycle, paused)
 * Works without existing plan (virtual preview)
 * 
 * NEVER applies or mutates state
 */

import { supabase } from '@/integrations/supabase/client';
import { evolutionScan, type ScanResultExtended } from './scan';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface AnalyzeResult {
  planned_actions: PlannedAction[];
  expected_outcomes: ExpectedOutcome[];
  risk_level: 'low' | 'medium' | 'high';
  dependencies: string[];
  estimated_deltas: EstimatedDelta[];
  blocked: boolean;
  blocked_reason?: string;
  timestamp: string;
}

export interface PlannedAction {
  id: string;
  action_type: string;
  target: string;
  description: string;
  confidence: number;
}

export interface ExpectedOutcome {
  metric: string;
  current: number | string;
  expected: number | string;
  delta_estimate: string; // Uses "~" prefix
}

export interface EstimatedDelta {
  component: string;
  metric: string;
  estimate: string; // e.g., "~+12% memory compression"
}

// ═══════════════════════════════════════════════════════════════
// FORWARD ANALYZER
// ═══════════════════════════════════════════════════════════════

/**
 * Analyze what WILL change based on current state
 * PURE READ-ONLY — never applies or mutates
 */
export async function analyzeForwardIntent(): Promise<AnalyzeResult> {
  const result: AnalyzeResult = {
    planned_actions: [],
    expected_outcomes: [],
    risk_level: 'low',
    dependencies: [],
    estimated_deltas: [],
    blocked: false,
    timestamp: new Date().toISOString(),
  };

  try {
    // Check for existing active plan
    const activePlan = await getActivePlan();
    
    if (activePlan) {
      // Use existing plan data
      result.planned_actions = extractActionsFromPlan(activePlan);
      result.expected_outcomes = projectOutcomes(activePlan);
      result.risk_level = (activePlan.risk_level as 'low' | 'medium' | 'high') || 'medium';
      result.dependencies = extractDependencies(activePlan);
      result.estimated_deltas = calculateEstimatedDeltas(activePlan);
    } else {
      // Run virtual scan to project potential changes
      const scanResult = await evolutionScan({ dry_run: true });
      
      if (!scanResult.plan_ready && scanResult.blocked_reasons && scanResult.blocked_reasons.length > 0) {
        result.blocked = true;
        result.blocked_reason = scanResult.blocked_reasons.join('; ');
      }

      result.planned_actions = scanResultToActions(scanResult);
      result.expected_outcomes = projectFromScan(scanResult);
      result.risk_level = determineRiskFromScan(scanResult);
      result.dependencies = extractScanDependencies(scanResult);
      result.estimated_deltas = estimateDeltasFromScan(scanResult);
    }

    return result;
  } catch (error) {
    result.blocked = true;
    result.blocked_reason = error instanceof Error ? error.message : 'Analysis failed';
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function getActivePlan(): Promise<Record<string, unknown> | null> {
  try {
    const { data } = await supabase
      .from('evolution_runs')
      .select('*')
      .not('phase', 'in', '("verified","aborted","failed")')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return null;
    
    // Get associated plan metadata
    const runData = data as Record<string, unknown>;
    const metadata = runData.metadata as Record<string, unknown> | undefined;
    return {
      ...runData,
      ...(metadata || {}),
    };
  } catch {
    return null;
  }
}

function extractActionsFromPlan(plan: Record<string, unknown>): PlannedAction[] {
  const actions: PlannedAction[] = [];
  const metadata = plan.metadata as Record<string, unknown> | undefined;
  const proposals = (plan.proposals || metadata?.proposals || []) as Array<Record<string, unknown>>;
  
  for (const p of proposals) {
    actions.push({
      id: (p.id as string) || crypto.randomUUID().slice(0, 8),
      action_type: (p.action_type as string) || 'update',
      target: (p.target_file as string) || (p.scope as string) || 'unknown',
      description: (p.title as string) || (p.description as string) || 'Planned action',
      confidence: (p.confidence as number) || 0.8,
    });
  }

  return actions;
}

function projectOutcomes(plan: Record<string, unknown>): ExpectedOutcome[] {
  const outcomes: ExpectedOutcome[] = [];
  const metadata = plan.metadata as Record<string, unknown> | undefined;
  const totalActions = (plan.total_actions as number) || (metadata?.total_actions as number) || 0;

  // Project based on action count and type
  if (totalActions > 0) {
    outcomes.push({
      metric: 'system_complexity',
      current: 'baseline',
      expected: 'reduced',
      delta_estimate: `~-${Math.min(totalActions * 5, 25)}% redundancy`,
    });

    outcomes.push({
      metric: 'code_health',
      current: 'baseline',
      expected: 'improved',
      delta_estimate: `~+${Math.min(totalActions * 3, 20)}% maintainability`,
    });
  }

  return outcomes;
}

function extractDependencies(plan: Record<string, unknown>): string[] {
  const deps: string[] = [];
  const metadata = plan.metadata as Record<string, unknown> | undefined;
  const proposals = (plan.proposals || metadata?.proposals || []) as Array<Record<string, unknown>>;
  
  for (const p of proposals) {
    const target = (p.target_file as string) || '';
    if (target.includes('lib/')) deps.push('library');
    if (target.includes('hooks/')) deps.push('hooks');
    if (target.includes('components/')) deps.push('components');
  }

  return [...new Set(deps)];
}

function calculateEstimatedDeltas(plan: Record<string, unknown>): EstimatedDelta[] {
  const deltas: EstimatedDelta[] = [];
  const confidence = (plan.confidence_score as number) || 0.8;
  const metadata = plan.metadata as Record<string, unknown> | undefined;
  const totalActions = (plan.total_actions as number) || (metadata?.total_actions as number) || 0;

  if (totalActions > 0) {
    deltas.push({
      component: 'modernizer',
      metric: 'evolution_success',
      estimate: `~${(confidence * 100).toFixed(0)}% confidence`,
    });

    deltas.push({
      component: 'system',
      metric: 'health_delta',
      estimate: `~+${Math.min(totalActions * 2, 15)}% after apply`,
    });
  }

  return deltas;
}

function scanResultToActions(scan: ScanResultExtended): PlannedAction[] {
  return scan.proposals.map((p, idx) => ({
    id: `scan-${idx}`,
    action_type: p.action_type || 'code_change',
    target: p.affected_modules?.[0] || 'system',
    description: p.title,
    confidence: p.confidence_score || 0.7,
  }));
}

function projectFromScan(scan: ScanResultExtended): ExpectedOutcome[] {
  const outcomes: ExpectedOutcome[] = [];
  
  if (scan.proposals.length > 0) {
    outcomes.push({
      metric: 'pending_improvements',
      current: scan.proposals.length,
      expected: 0,
      delta_estimate: `~-${scan.proposals.length} issues`,
    });
  }

  return outcomes;
}

function determineRiskFromScan(scan: ScanResultExtended): 'low' | 'medium' | 'high' {
  const highRisk = scan.proposals.filter(p => p.risk_level === 'high').length;
  const mediumRisk = scan.proposals.filter(p => p.risk_level === 'medium').length;
  
  if (highRisk > 0) return 'high';
  if (mediumRisk > scan.proposals.length / 2) return 'medium';
  return 'low';
}

function extractScanDependencies(scan: ScanResultExtended): string[] {
  const deps: string[] = [];
  
  for (const p of scan.proposals) {
    for (const mod of p.affected_modules || []) {
      deps.push(mod);
    }
  }

  return [...new Set(deps)];
}

function estimateDeltasFromScan(scan: ScanResultExtended): EstimatedDelta[] {
  const deltas: EstimatedDelta[] = [];
  
  for (const p of scan.proposals.slice(0, 3)) {
    if (p.confidence_score >= 0.7) {
      deltas.push({
        component: p.affected_modules?.[0] || 'system',
        metric: p.action_type || 'improvement',
        estimate: `~${(p.confidence_score * 100).toFixed(0)}% likelihood`,
      });
    }
  }

  return deltas;
}

// ═══════════════════════════════════════════════════════════════
// FORMATTED OUTPUT
// ═══════════════════════════════════════════════════════════════

export function formatAnalysis(result: AnalyzeResult): string {
  const lines = ['╔══════════════════════════════════════════════════════════════╗'];
  lines.push('║  FORWARD ANALYSIS — WILL CHANGE?                             ║');
  lines.push('╠══════════════════════════════════════════════════════════════╣');

  if (result.blocked) {
    lines.push(`║  ⛔ BLOCKED: ${(result.blocked_reason || 'Unknown').substring(0, 46).padEnd(46)} ║`);
    lines.push('╚══════════════════════════════════════════════════════════════╝');
    return lines.join('\n');
  }

  const riskIcon = result.risk_level === 'low' ? '🟢' : result.risk_level === 'medium' ? '🟡' : '🔴';
  lines.push(`║  Risk Level: ${riskIcon} ${result.risk_level.toUpperCase().padEnd(46)} ║`);
  lines.push(`║  Actions:    ${String(result.planned_actions.length).padEnd(48)} ║`);

  if (result.planned_actions.length > 0) {
    lines.push('╠══════════════════════════════════════════════════════════════╣');
    lines.push('║  PLANNED ACTIONS:                                            ║');
    for (const action of result.planned_actions.slice(0, 5)) {
      const desc = `${action.action_type}: ${action.description}`.substring(0, 54);
      lines.push(`║    ▸ ${desc.padEnd(54)} ║`);
    }
    if (result.planned_actions.length > 5) {
      lines.push(`║    ... and ${result.planned_actions.length - 5} more actions                            ║`);
    }
  }

  if (result.estimated_deltas.length > 0) {
    lines.push('╠══════════════════════════════════════════════════════════════╣');
    lines.push('║  ESTIMATED DELTAS (~):                                       ║');
    for (const delta of result.estimated_deltas.slice(0, 5)) {
      const desc = `${delta.component}: ${delta.estimate}`.substring(0, 54);
      lines.push(`║    ${desc.padEnd(56)} ║`);
    }
  }

  if (result.dependencies.length > 0) {
    lines.push('╠══════════════════════════════════════════════════════════════╣');
    lines.push(`║  Dependencies: ${result.dependencies.join(', ').substring(0, 44).padEnd(44)} ║`);
  }

  lines.push('╚══════════════════════════════════════════════════════════════╝');
  return lines.join('\n');
}
