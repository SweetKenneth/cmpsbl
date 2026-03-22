/**
 * useCognitiveCapabilities — React hook for cognitive enhancement operations
 * Provides self-assessment, insight sharing, memory replay, and contradiction budgeting.
 */

import { useState, useCallback } from 'react';
import {
  runSelfAssessment,
  getSelfAssessmentHistory,
  shareInsight,
  receiveInsights,
  getInsightRegistry,
  replayHighValueMemories,
  getReplayHistory,
  enforceContradictionBudget,
  getContradictionBudgetState,
  resetContradictionBudget,
  type SelfAssessmentResult,
  type SharedInsight,
  type MemoryReplayResult,
  type ContradictionBudgetState,
} from '@/lib/substrate/cognitive-capabilities';

export function useCognitiveCapabilities(nodeId?: string) {
  const [lastAssessment, setLastAssessment] = useState<SelfAssessmentResult | null>(null);
  const [lastReplay, setLastReplay] = useState<MemoryReplayResult | null>(null);
  const [budgetState, setBudgetState] = useState<ContradictionBudgetState | null>(null);

  const assess = useCallback((targetNodeId?: string) => {
    const id = targetNodeId || nodeId;
    if (!id) return null;
    const result = runSelfAssessment(id);
    setLastAssessment(result);
    return result;
  }, [nodeId]);

  const replay = useCallback((targetNodeId?: string) => {
    const id = targetNodeId || nodeId;
    if (!id) return null;
    // Pull real scores from assessment history for this node
    const history = getSelfAssessmentHistory(id);
    const memoryScores = history.length > 0
      ? history.map((entry, i) => ({
          id: `assess-${i}-${entry.timestamp}`,
          score: entry.overallScore / 100,
          topic: entry.recommendations[0] || ['patterns', 'heuristics', 'observations', 'rules'][i % 4],
          tier: (entry.overallScore > 70 ? 'hot' : entry.overallScore > 40 ? 'warm' : 'cold') as 'hot' | 'warm' | 'cold',
        }))
      : // Bootstrap from a fresh assessment if no history exists
        (() => {
          const fresh = runSelfAssessment(id);
          return fresh.dimensions.map((dim, i) => ({
            id: `dim-${i}-${dim.name}`,
            score: dim.score / 100,
            topic: dim.name,
            tier: (dim.score > 70 ? 'hot' : dim.score > 40 ? 'warm' : 'cold') as 'hot' | 'warm' | 'cold',
          }));
        })();
    const result = replayHighValueMemories(id, memoryScores);
    setLastReplay(result);
    return result;
  }, [nodeId]);

  const checkBudget = useCallback((targetNodeId?: string) => {
    const id = targetNodeId || nodeId;
    if (!id) return null;
    const state = getContradictionBudgetState(id);
    setBudgetState(state);
    return state;
  }, [nodeId]);

  return {
    assess,
    replay,
    checkBudget,
    lastAssessment,
    lastReplay,
    budgetState,
    // Pass-through utilities
    shareInsight,
    receiveInsights,
    getInsightRegistry,
    getSelfAssessmentHistory,
    getReplayHistory,
    enforceContradictionBudget,
    resetContradictionBudget,
  };
}
