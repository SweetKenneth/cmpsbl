/**
 * SEBA Cross-Validator — v1.0.0
 * 
 * Post-execution verification engine that compares predicted impact vs actual delta.
 * Closes the loop between SEBA's proposals and EVOLUTION's execution.
 * 
 * Also implements proposal chaining — dependent proposals that execute sequentially.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ValidationResult {
  proposal_id: string;
  predicted_impact: Record<string, string>;
  actual_impact: Record<string, number>;
  accuracy_score: number; // 0-1
  deviations: Deviation[];
  verdict: 'validated' | 'partial' | 'deviated' | 'failed';
  learning_events: string[];
  validated_at: string;
}

export interface Deviation {
  metric: string;
  predicted: string;
  actual: number;
  delta_percent: number;
  severity: 'minor' | 'moderate' | 'major';
}

export interface ProposalChain {
  id: string;
  name: string;
  proposals: ChainedProposal[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'aborted';
  current_step: number;
  created_at: string;
  completed_at?: string;
}

export interface ChainedProposal {
  proposal_id: string;
  title: string;
  depends_on?: string; // Previous proposal ID that must succeed
  condition?: 'always' | 'on_success' | 'on_failure';
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'skipped';
  validation_result?: ValidationResult;
}

// ═══════════════════════════════════════════════════════════════
// CROSS-VALIDATION ENGINE
// ═══════════════════════════════════════════════════════════════

/**
 * Validate a completed execution against its predicted impact
 */
export async function validateExecution(proposalId: string): Promise<ValidationResult> {
  // Fetch the proposal with its predicted impact
  const { data: proposal } = await supabase
    .from('evolution_proposals')
    .select('*')
    .eq('id', proposalId)
    .single();

  if (!proposal) {
    return createFailedResult(proposalId, 'Proposal not found');
  }

  const predictedImpact = (proposal.expected_impact as Record<string, unknown>) || {};
  const deviations: Deviation[] = [];
  const learningEvents: string[] = [];

  // Fetch actual metrics post-execution from brain_events
  const { data: postEvents } = await supabase
    .from('brain_events')
    .select('*')
    .eq('module', 'seba')
    .in('event_type', ['shadow_execution', 'production_execution', 'evolution_applied'])
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch system health snapshot
  const { data: healthData } = await supabase
    .from('brain_events')
    .select('data')
    .eq('module', 'system')
    .eq('event_type', 'health_snapshot')
    .order('created_at', { ascending: false })
    .limit(1);

  const actualImpact: Record<string, number> = {};
  const healthSnapshot = healthData?.[0]?.data as Record<string, unknown> || {};

  // Compare each predicted metric against actual
  for (const [metric, predicted] of Object.entries(predictedImpact)) {
    if (metric.startsWith('execution_') || metric.startsWith('shadow_')) continue;
    
    const predictedStr = String(predicted);
    const predictedValue = parseImpactValue(predictedStr);
    
    // Get actual value from health snapshot or events
    const actualValue = extractActualMetric(metric, healthSnapshot, postEvents || []);
    actualImpact[metric] = actualValue;

    if (predictedValue !== null) {
      const deltaPct = predictedValue !== 0 
        ? Math.abs((actualValue - predictedValue) / predictedValue) * 100
        : actualValue !== 0 ? 100 : 0;

      const severity: Deviation['severity'] = 
        deltaPct < 20 ? 'minor' :
        deltaPct < 50 ? 'moderate' : 'major';

      if (deltaPct > 10) {
        deviations.push({
          metric,
          predicted: predictedStr,
          actual: actualValue,
          delta_percent: deltaPct,
          severity,
        });
      }
    }
  }

  // Calculate accuracy
  const totalMetrics = Object.keys(predictedImpact).filter(k => !k.startsWith('execution_')).length;
  const accurateMetrics = totalMetrics - deviations.filter(d => d.severity !== 'minor').length;
  const accuracyScore = totalMetrics > 0 ? accurateMetrics / totalMetrics : 0.5;

  // Determine verdict
  const majorDeviations = deviations.filter(d => d.severity === 'major').length;
  const verdict: ValidationResult['verdict'] =
    majorDeviations > 0 ? 'deviated' :
    deviations.length === 0 ? 'validated' :
    accuracyScore >= 0.7 ? 'partial' : 'deviated';

  // Generate learning events from deviations
  for (const dev of deviations) {
    const event = `[CROSS_VALIDATION] ${dev.metric}: predicted ${dev.predicted}, actual ${dev.actual} (${dev.delta_percent.toFixed(1)}% deviation, ${dev.severity})`;
    learningEvents.push(event);
  }

  const result: ValidationResult = {
    proposal_id: proposalId,
    predicted_impact: Object.fromEntries(
      Object.entries(predictedImpact)
        .filter(([k]) => !k.startsWith('execution_'))
        .map(([k, v]) => [k, String(v)])
    ),
    actual_impact: actualImpact,
    accuracy_score: accuracyScore,
    deviations,
    verdict,
    learning_events: learningEvents,
    validated_at: new Date().toISOString(),
  };

  // Persist validation result
  await persistValidation(result);

  // Feed learnings back to Brain
  await feedValidationLearnings(result);

  return result;
}

/**
 * Parse a predicted impact string like "+15% efficiency" into a number
 */
function parseImpactValue(predicted: string): number | null {
  const match = predicted.match(/([+-]?\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Extract actual metric value from health data
 */
function extractActualMetric(
  metric: string, 
  healthSnapshot: Record<string, unknown>,
  events: Array<Record<string, unknown>>
): number {
  // Try direct lookup
  if (metric in healthSnapshot) return Number(healthSnapshot[metric]) || 0;

  // Map common metric names
  const metricMap: Record<string, string[]> = {
    memory: ['memory_usage', 'memory_efficiency', 'memory_health'],
    speed: ['response_time', 'avg_latency', 'speed_score'],
    learning: ['learning_rate', 'convergence_speed'],
    resilience: ['uptime_percent', 'error_rate'],
    health: ['system_health', 'overall_health'],
    cpu: ['cpu_usage', 'cpu_percent'],
    latency: ['avg_latency_ms', 'p99_latency'],
    accuracy: ['prediction_accuracy', 'classification_accuracy'],
  };

  const aliases = metricMap[metric] || [];
  for (const alias of aliases) {
    if (alias in healthSnapshot) return Number(healthSnapshot[alias]) || 0;
  }

  // Estimate from event count if no direct metric
  return events.length > 0 ? 0.5 : 0;
}

/**
 * Persist validation result to database
 */
async function persistValidation(result: ValidationResult): Promise<void> {
  await supabase.from('brain_events').insert({
    module: 'seba',
    event_type: 'cross_validation',
    data: {
      proposal_id: result.proposal_id,
      accuracy_score: result.accuracy_score,
      verdict: result.verdict,
      deviations_count: result.deviations.length,
      major_deviations: result.deviations.filter(d => d.severity === 'major').length,
    },
    outcome: result.verdict === 'validated' ? 'success' : result.verdict === 'failed' ? 'failure' : 'partial',
  });
}

/**
 * Feed validation learnings back into brain for future proposal improvement
 */
async function feedValidationLearnings(result: ValidationResult): Promise<void> {
  if (result.learning_events.length === 0) return;

  const content = [
    `[SEBA_VALIDATION_LEARNING] Proposal ${result.proposal_id.slice(0, 8)}`,
    `Verdict: ${result.verdict} (accuracy: ${(result.accuracy_score * 100).toFixed(0)}%)`,
    ...result.learning_events,
    result.verdict === 'deviated' 
      ? 'ACTION: Calibrate prediction models for these metric categories'
      : 'NOTE: Predictions were reasonably accurate',
  ].join('\n');

  await supabase.from('brain_memories').insert({
    content,
    memory_type: 'learned',
    source: 'seba_cross_validation',
    confidence: result.accuracy_score,
    metadata: {
      proposal_id: result.proposal_id,
      verdict: result.verdict,
      deviations: result.deviations.length,
    },
  });
}

function createFailedResult(proposalId: string, reason: string): ValidationResult {
  return {
    proposal_id: proposalId,
    predicted_impact: {},
    actual_impact: {},
    accuracy_score: 0,
    deviations: [],
    verdict: 'failed',
    learning_events: [`FAILED: ${reason}`],
    validated_at: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════
// PROPOSAL CHAINING
// ═══════════════════════════════════════════════════════════════

/**
 * Create a chain of dependent proposals
 */
export async function createProposalChain(
  name: string,
  proposalIds: string[],
  conditions: Array<ChainedProposal['condition']> = []
): Promise<ProposalChain> {
  const chain: ProposalChain = {
    id: crypto.randomUUID(),
    name,
    proposals: proposalIds.map((pid, i) => ({
      proposal_id: pid,
      title: `Step ${i + 1}`,
      depends_on: i > 0 ? proposalIds[i - 1] : undefined,
      condition: conditions[i] || (i > 0 ? 'on_success' : 'always'),
      status: 'pending',
    })),
    status: 'pending',
    current_step: 0,
    created_at: new Date().toISOString(),
  };

  // Enrich titles from database
  const { data: proposals } = await supabase
    .from('evolution_proposals')
    .select('id, title')
    .in('id', proposalIds);

  if (proposals) {
    for (const p of proposals) {
      const chainItem = chain.proposals.find(cp => cp.proposal_id === p.id);
      if (chainItem) chainItem.title = p.title;
    }
  }

  // Persist chain
  await supabase.from('brain_events').insert({
    module: 'seba',
    event_type: 'chain_created',
    data: {
      chain_id: chain.id,
      chain_name: name,
      steps: chain.proposals.length,
      proposal_ids: proposalIds,
    },
    outcome: 'success',
  });

  return chain;
}

/**
 * Execute next step in a proposal chain
 */
export async function executeChainStep(chain: ProposalChain): Promise<{
  chain: ProposalChain;
  step_result: 'executed' | 'skipped' | 'blocked' | 'completed';
}> {
  if (chain.current_step >= chain.proposals.length) {
    chain.status = 'completed';
    chain.completed_at = new Date().toISOString();
    return { chain, step_result: 'completed' };
  }

  const current = chain.proposals[chain.current_step];
  
  // Check dependency condition
  if (current.depends_on) {
    const prev = chain.proposals.find(p => p.proposal_id === current.depends_on);
    if (prev) {
      if (current.condition === 'on_success' && prev.status !== 'succeeded') {
        current.status = 'skipped';
        chain.current_step++;
        return { chain, step_result: 'skipped' };
      }
      if (current.condition === 'on_failure' && prev.status !== 'failed') {
        current.status = 'skipped';
        chain.current_step++;
        return { chain, step_result: 'skipped' };
      }
    }
  }

  // Execute this step (mark as running, actual execution happens via seba.execute)
  current.status = 'running';
  chain.status = 'in_progress';

  await supabase.from('brain_events').insert({
    module: 'seba',
    event_type: 'chain_step_started',
    data: {
      chain_id: chain.id,
      step: chain.current_step,
      proposal_id: current.proposal_id,
    },
    outcome: 'success',
  });

  return { chain, step_result: 'executed' };
}

/**
 * Mark a chain step as completed and advance
 */
export async function completeChainStep(
  chain: ProposalChain,
  success: boolean
): Promise<ProposalChain> {
  const current = chain.proposals[chain.current_step];
  current.status = success ? 'succeeded' : 'failed';

  // Validate the step
  if (success) {
    current.validation_result = await validateExecution(current.proposal_id);
  }

  chain.current_step++;

  // Check if chain is complete
  if (chain.current_step >= chain.proposals.length) {
    chain.status = 'completed';
    chain.completed_at = new Date().toISOString();
  }

  // If step failed and remaining steps depend on it, abort
  if (!success) {
    const remainingDependents = chain.proposals
      .slice(chain.current_step)
      .filter(p => p.condition === 'on_success');
    
    if (remainingDependents.length === chain.proposals.length - chain.current_step) {
      chain.status = 'aborted';
      remainingDependents.forEach(p => p.status = 'skipped');
    }
  }

  return chain;
}
