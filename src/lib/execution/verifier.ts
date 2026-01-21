/**
 * Verification System — Goal state comparison and evidence collection
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  ActionResult, 
  ActionStatus, 
  EvidenceBundle, 
  ExecutionPlan 
} from './actionGrammar';

export interface VerificationResult {
  status: 'success' | 'partial' | 'fail';
  goalState: string;
  observedState: string;
  matchScore: number; // 0-100
  evidence: EvidenceBundle[];
  discrepancies: string[];
  timestamp: string;
}

export interface CreditAssignment {
  agentId: string;
  taskId: string;
  outcome: 'success' | 'partial' | 'fail';
  competencyDelta: number; // +/- adjustment
  heuristicsLearned: string[];
  successRate: number;
  attemptCount: number;
  fallbackUsed: boolean;
}

/**
 * Compare goal state with observed state
 */
export function verifyExecution(
  goalState: string,
  results: ActionResult[]
): VerificationResult {
  const successfulResults = results.filter(r => r.status === 'success');
  const failedResults = results.filter(r => r.status === 'fail');
  const evidence = results
    .filter(r => r.evidence)
    .map(r => r.evidence!);

  // Calculate match score
  const totalActions = results.length;
  const successfulActions = successfulResults.length;
  const matchScore = totalActions > 0 ? Math.round((successfulActions / totalActions) * 100) : 0;

  // Determine overall status
  let status: VerificationResult['status'];
  if (matchScore >= 80) {
    status = 'success';
  } else if (matchScore >= 40) {
    status = 'partial';
  } else {
    status = 'fail';
  }

  // Collect discrepancies
  const discrepancies = failedResults.map(r => 
    `${r.action.type}(${r.action.target}): ${r.error || 'Unknown error'}`
  );

  // Build observed state summary
  const observedState = successfulResults
    .map(r => `${r.action.type}: ${summarizeData(r.data)}`)
    .join('; ');

  return {
    status,
    goalState,
    observedState: observedState || 'No successful observations',
    matchScore,
    evidence,
    discrepancies,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Calculate credit assignment for an agent
 */
export function calculateCredit(
  agentId: string,
  taskId: string,
  verification: VerificationResult,
  previousStats: { successRate: number; attemptCount: number } = { successRate: 50, attemptCount: 0 },
  fallbackUsed: boolean = false
): CreditAssignment {
  const { status, matchScore, discrepancies } = verification;

  // Calculate competency delta
  let competencyDelta: number;
  switch (status) {
    case 'success':
      competencyDelta = Math.min(10, Math.ceil(matchScore / 10));
      break;
    case 'partial':
      competencyDelta = Math.ceil((matchScore - 50) / 10); // Can be positive or negative
      break;
    case 'fail':
      competencyDelta = Math.max(-10, -Math.ceil((100 - matchScore) / 20));
      break;
    default:
      competencyDelta = 0;
  }

  // Reduce reward if fallback was used
  if (fallbackUsed && competencyDelta > 0) {
    competencyDelta = Math.ceil(competencyDelta / 2);
  }

  // Extract heuristics from failures
  const heuristicsLearned = discrepancies.map(d => `avoid: ${extractPattern(d)}`);

  // Calculate new success rate
  const newAttemptCount = previousStats.attemptCount + 1;
  const successValue = status === 'success' ? 1 : status === 'partial' ? 0.5 : 0;
  const newSuccessRate = ((previousStats.successRate * previousStats.attemptCount) + (successValue * 100)) / newAttemptCount;

  return {
    agentId,
    taskId,
    outcome: status,
    competencyDelta,
    heuristicsLearned,
    successRate: Math.round(newSuccessRate),
    attemptCount: newAttemptCount,
    fallbackUsed,
  };
}

/**
 * Determine recovery strategy based on verification result
 */
export function determineRecoveryStrategy(
  verification: VerificationResult,
  attemptCount: number,
  maxAttempts: number = 3
): 'retry' | 'fallback' | 'escalate' | 'accept' {
  const { status, matchScore } = verification;

  if (status === 'success') {
    return 'accept';
  }

  if (attemptCount >= maxAttempts) {
    return 'escalate';
  }

  // If partial success (>50%), try one more time
  if (status === 'partial' && matchScore > 50 && attemptCount < 2) {
    return 'retry';
  }

  // If fail with some success, try fallback
  if (matchScore > 20) {
    return 'fallback';
  }

  // Total failure - escalate
  return 'escalate';
}

/**
 * Store execution trace for learning
 */
export async function storeExecutionTrace(
  plan: ExecutionPlan,
  verification: VerificationResult,
  credit: CreditAssignment
): Promise<{ success: boolean; traceId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('agency_task_logs')
      .insert({
        task_id: plan.taskId,
        member_id: plan.agentId,
        log_type: 'execution_trace',
        message: `Execution ${verification.status}: ${verification.matchScore}% match`,
        data: {
          plan: {
            id: plan.id,
            goalState: plan.goalState,
            actionCount: plan.actions.length,
          },
          verification: {
            status: verification.status,
            matchScore: verification.matchScore,
            discrepancies: verification.discrepancies,
          },
          credit: {
            competencyDelta: credit.competencyDelta,
            successRate: credit.successRate,
            heuristicsLearned: credit.heuristicsLearned,
          },
          evidence: verification.evidence.map(e => ({
            type: e.type,
            url: e.url,
            capturedAt: e.capturedAt,
            contentPreview: e.content.slice(0, 200),
          })),
        },
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to store execution trace:', error);
      return { success: false, error: error.message };
    }

    return { success: true, traceId: data.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Update agent competency based on credit assignment
 */
export async function updateAgentCompetency(credit: CreditAssignment): Promise<boolean> {
  try {
    // Get current agent stats
    const { data: member, error: fetchError } = await supabase
      .from('agency_members')
      .select('skill_weights')
      .eq('id', credit.agentId)
      .single();

    if (fetchError) {
      console.error('Failed to fetch agent:', fetchError);
      return false;
    }

    const currentWeights = (member?.skill_weights as Record<string, number>) || {};
    const currentCompetency = currentWeights.competency || 50;
    
    // Apply delta with bounds
    const newCompetency = Math.max(0, Math.min(100, currentCompetency + credit.competencyDelta));

    // Update with new stats
    const { error: updateError } = await supabase
      .from('agency_members')
      .update({
        skill_weights: {
          ...currentWeights,
          competency: newCompetency,
          successRate: credit.successRate,
          attemptCount: credit.attemptCount,
          lastUpdated: new Date().toISOString(),
        },
      })
      .eq('id', credit.agentId);

    if (updateError) {
      console.error('Failed to update agent competency:', updateError);
      return false;
    }

    // Store learned heuristics if any
    if (credit.heuristicsLearned.length > 0) {
      await supabase.from('brain_memory_hot').insert(
        credit.heuristicsLearned.map(h => ({
          content: h,
          category: 'heuristic',
          source: `agent:${credit.agentId}`,
          confidence: 0.5,
        }))
      );
    }

    return true;
  } catch (err) {
    console.error('Error updating agent competency:', err);
    return false;
  }
}

// Helper functions
function summarizeData(data: unknown): string {
  if (!data) return 'null';
  if (typeof data === 'string') return data.slice(0, 50);
  if (Array.isArray(data)) return `[${data.length} items]`;
  if (typeof data === 'object') return `{${Object.keys(data).length} keys}`;
  return String(data);
}

function extractPattern(discrepancy: string): string {
  // Extract actionable pattern from error
  const match = discrepancy.match(/(\w+)\(([^)]+)\)/);
  if (match) {
    return `${match[1]} on ${match[2].split('/')[0]}`;
  }
  return discrepancy.slice(0, 50);
}
