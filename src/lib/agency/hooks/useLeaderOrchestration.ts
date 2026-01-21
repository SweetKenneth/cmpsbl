/**
 * useLeaderOrchestration Hook — React hook for leader task routing
 */

import { useState, useCallback } from 'react';
import {
  createOrchestrationPlan,
  executeOrchestration,
  leaderRouteTask,
  parseIntents,
  type TeamMember,
  type OrchestrationPlan,
  type OrchestrationResult,
} from '../orchestration/leaderOrchestrator';
import { TASK_PRIMITIVES } from '../skills/taskPrimitives';

interface UseLeaderOrchestrationOptions {
  agencyId: string;
  members: TeamMember[];
  leaderId?: string;
}

interface UseLeaderOrchestrationReturn {
  // State
  isRouting: boolean;
  lastPlan: OrchestrationPlan | null;
  lastResult: OrchestrationResult | null;
  
  // Actions
  analyzeInput: (input: string) => {
    intents: string[];
    suggestedPrimitives: { id: string; name: string; description: string }[];
  };
  routeSingleTask: (input: string) => Promise<{
    success: boolean;
    taskId?: string;
    assignedTo?: string;
    error?: string;
  }>;
  orchestrateMultiple: (input: string) => Promise<OrchestrationResult>;
  
  // Helpers
  getSuggestedAgents: (primitiveId: string) => TeamMember[];
}

export function useLeaderOrchestration(
  options: UseLeaderOrchestrationOptions
): UseLeaderOrchestrationReturn {
  const { agencyId, members, leaderId } = options;
  
  const [isRouting, setIsRouting] = useState(false);
  const [lastPlan, setLastPlan] = useState<OrchestrationPlan | null>(null);
  const [lastResult, setLastResult] = useState<OrchestrationResult | null>(null);
  
  /**
   * Analyze input to understand what tasks might be created
   */
  const analyzeInput = useCallback((input: string) => {
    const intents = parseIntents(input);
    
    const suggestedPrimitives = intents.map(intent => {
      const primitive = TASK_PRIMITIVES[intent.primitive];
      return {
        id: intent.primitive,
        name: primitive?.name || intent.primitive,
        description: primitive?.description || '',
      };
    });
    
    return {
      intents: intents.map(i => i.primitive),
      suggestedPrimitives,
    };
  }, []);
  
  /**
   * Route a single task to the best agent
   */
  const routeSingleTask = useCallback(async (input: string) => {
    if (!leaderId) {
      return { success: false, error: 'No leader ID provided' };
    }
    
    setIsRouting(true);
    try {
      const result = await leaderRouteTask(agencyId, leaderId, input, members);
      return result;
    } finally {
      setIsRouting(false);
    }
  }, [agencyId, leaderId, members]);
  
  /**
   * Create and execute a multi-task orchestration plan
   */
  const orchestrateMultiple = useCallback(async (input: string) => {
    setIsRouting(true);
    
    try {
      const plan = createOrchestrationPlan(input, members);
      setLastPlan(plan);
      
      const result = await executeOrchestration(agencyId, plan);
      setLastResult(result);
      
      return result;
    } finally {
      setIsRouting(false);
    }
  }, [agencyId, members]);
  
  /**
   * Get agents that could handle a specific primitive
   */
  const getSuggestedAgents = useCallback((primitiveId: string) => {
    const primitive = TASK_PRIMITIVES[primitiveId];
    if (!primitive) return [];
    
    // Filter to non-leader agents with matching skills
    return members.filter(m => !m.is_leader);
  }, [members]);
  
  return {
    isRouting,
    lastPlan,
    lastResult,
    analyzeInput,
    routeSingleTask,
    orchestrateMultiple,
    getSuggestedAgents,
  };
}
