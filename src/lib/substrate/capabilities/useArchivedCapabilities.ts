/**
 * useArchivedCapabilities Hook
 * SPARTA Epoch — React hook for accessing archived edge function capabilities
 */

import { useState, useCallback } from 'react';
import {
  archivedAdapters,
  type HypothesisTestResult,
  type SystemsReasoningResult,
  type SelfCritiqueResult,
  type PatternFusionResult,
  type AnomalyDetectionResult,
  type ResilienceMonitorResult,
  type TemporalScoreResult,
  type EthicalBoundaryResult,
  type ImprovementEngineResult,
  type CuriosityReflectResult,
} from './archived-adapters';

export interface UseArchivedCapabilitiesReturn {
  // State
  loading: boolean;
  error: string | null;
  
  // Capability functions (v9.1.0 simplified signatures)
  testHypothesis: (claim: string, strategy?: string) => Promise<HypothesisTestResult | null>;
  analyzeSystem: (system: string, issue: string) => Promise<SystemsReasoningResult | null>;
  critiqueOutput: (output: string) => Promise<SelfCritiqueResult | null>;
  fusePatterns: (problem: string, domain1: string, domain2: string) => Promise<PatternFusionResult | null>;
  detectAnomalies: (lookbackHours?: number) => Promise<AnomalyDetectionResult | null>;
  checkResilience: () => Promise<ResilienceMonitorResult | null>;
  scoreTemporally: (query: string) => Promise<TemporalScoreResult | null>;
  checkEthics: (proposedAction: string) => Promise<EthicalBoundaryResult | null>;
  runImprovement: (focusDomain?: string) => Promise<ImprovementEngineResult | null>;
  reflectCuriosity: (forceReflection?: boolean) => Promise<CuriosityReflectResult | null>;
  
  // Utilities
  clearError: () => void;
}

export function useArchivedCapabilities(): UseArchivedCapabilitiesReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const clearError = useCallback(() => setError(null), []);
  
  const wrapAsync = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const testHypothesis = useCallback(async (
    claim: string,
    strategy?: string
  ): Promise<HypothesisTestResult | null> => {
    return wrapAsync(async () => {
      const result = await archivedAdapters.hypothesisTest(claim, strategy);
      return result.hypothesis_test;
    });
  }, [wrapAsync]);
  
  const analyzeSystem = useCallback(async (
    system: string,
    issue: string
  ): Promise<SystemsReasoningResult | null> => {
    return wrapAsync(async () => {
      const result = await archivedAdapters.systemsReasoning(system, issue);
      return result.analysis;
    });
  }, [wrapAsync]);
  
  const critiqueOutput = useCallback(async (
    output: string
  ): Promise<SelfCritiqueResult | null> => {
    return wrapAsync(async () => {
      const result = await archivedAdapters.selfCritique(output);
      return result.critique;
    });
  }, [wrapAsync]);
  
  const fusePatterns = useCallback(async (
    problem: string,
    domain1: string,
    domain2: string
  ): Promise<PatternFusionResult | null> => {
    return wrapAsync(async () => {
      const result = await archivedAdapters.patternFusion(problem, domain1, domain2);
      return result.fusion;
    });
  }, [wrapAsync]);
  
  const detectAnomalies = useCallback(async (
    lookbackHours: number = 24
  ): Promise<AnomalyDetectionResult | null> => {
    return wrapAsync(async () => {
      return archivedAdapters.anomalyDetection(lookbackHours);
    });
  }, [wrapAsync]);
  
  const checkResilience = useCallback(async (): Promise<ResilienceMonitorResult | null> => {
    return wrapAsync(async () => {
      return archivedAdapters.resilienceMonitor();
    });
  }, [wrapAsync]);
  
  const scoreTemporally = useCallback(async (
    query: string
  ): Promise<TemporalScoreResult | null> => {
    return wrapAsync(async () => {
      const result = await archivedAdapters.temporalScore(query);
      return {
        ranked_memories: result.ranked_memories,
        temporal_stats: result.temporal_stats,
      };
    });
  }, [wrapAsync]);
  
  const checkEthics = useCallback(async (
    proposedAction: string
  ): Promise<EthicalBoundaryResult | null> => {
    return wrapAsync(async () => {
      const result = await archivedAdapters.ethicalBoundary(proposedAction);
      return result.ethical_analysis;
    });
  }, [wrapAsync]);
  
  const runImprovement = useCallback(async (
    focusDomain?: string
  ): Promise<ImprovementEngineResult | null> => {
    return wrapAsync(async () => {
      return archivedAdapters.improvementEngine(focusDomain);
    });
  }, [wrapAsync]);
  
  const reflectCuriosity = useCallback(async (
    forceReflection?: boolean
  ): Promise<CuriosityReflectResult | null> => {
    return wrapAsync(async () => {
      return archivedAdapters.curiosityReflect(forceReflection);
    });
  }, [wrapAsync]);
  
  return {
    loading,
    error,
    testHypothesis,
    analyzeSystem,
    critiqueOutput,
    fusePatterns,
    detectAnomalies,
    checkResilience,
    scoreTemporally,
    checkEthics,
    runImprovement,
    reflectCuriosity,
    clearError,
  };
}

export default useArchivedCapabilities;
