/**
 * Module CLM React Hook
 * SPARTA Epoch — React integration for 24-module self-learning
 */

import { useState, useEffect, useCallback } from 'react';
import {
  moduleCLM,
  type ModuleName,
  type ModuleSelfAnalysis,
  type ModuleCLMState,
  type ModuleLearningConfig,
  MODULE_CLM_CONFIGS,
} from './index';

export interface UseModuleCLMReturn {
  // Feed
  feed: ModuleSelfAnalysis[];
  loading: boolean;
  error: string | null;

  // Module states
  moduleStates: ModuleCLMState[];
  
  // Actions
  runModuleLearning: (moduleId: ModuleName) => Promise<ModuleSelfAnalysis | null>;
  runAllLearning: () => Promise<ModuleSelfAnalysis[]>;
  acknowledgeAnalysis: (analysisId: string) => Promise<void>;
  refreshFeed: () => Promise<void>;

  // Helpers
  getModuleConfig: (moduleId: ModuleName) => ModuleLearningConfig | undefined;
  getModuleState: (moduleId: ModuleName) => ModuleCLMState | undefined;
}

export function useModuleCLM(autoRefresh: boolean = true): UseModuleCLMReturn {
  const [feed, setFeed] = useState<ModuleSelfAnalysis[]>([]);
  const [moduleStates, setModuleStates] = useState<ModuleCLMState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshFeed = useCallback(async () => {
    try {
      setLoading(true);
      const data = await moduleCLM.getFeed(50);
      setFeed(data);
      setModuleStates(moduleCLM.getAllModuleStates());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFeed();

    if (autoRefresh) {
      const interval = setInterval(refreshFeed, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [refreshFeed, autoRefresh]);

  const runModuleLearning = useCallback(async (moduleId: ModuleName) => {
    const result = await moduleCLM.runModuleLearning(moduleId);
    if (result) {
      await refreshFeed();
    }
    return result;
  }, [refreshFeed]);

  const runAllLearning = useCallback(async () => {
    const results = await moduleCLM.runAllModuleLearning();
    await refreshFeed();
    return results;
  }, [refreshFeed]);

  const acknowledgeAnalysis = useCallback(async (analysisId: string) => {
    await moduleCLM.acknowledgeAnalysis(analysisId);
    await refreshFeed();
  }, [refreshFeed]);

  const getModuleConfig = useCallback((moduleId: ModuleName) => {
    return MODULE_CLM_CONFIGS[moduleId];
  }, []);

  const getModuleState = useCallback((moduleId: ModuleName) => {
    return moduleCLM.getModuleState(moduleId);
  }, []);

  return {
    feed,
    loading,
    error,
    moduleStates,
    runModuleLearning,
    runAllLearning,
    acknowledgeAnalysis,
    refreshFeed,
    getModuleConfig,
    getModuleState,
  };
}
