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
    // Simulated memory scores for replay
    const mockScores = Array.from({ length: 20 }, (_, i) => ({
      id: `mem-${i}`,
      score: Math.random(),
      topic: ['patterns', 'heuristics', 'observations', 'rules'][i % 4],
      tier: (['hot', 'warm', 'cold'] as const)[i % 3],
    }));
    const result = replayHighValueMemories(id, mockScores);
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
