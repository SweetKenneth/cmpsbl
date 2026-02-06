/**
 * React Hook for Meta-Engines
 * v7.8.0 — Access compound engine orchestration
 */

import { useState, useCallback, useMemo } from 'react';
import {
  META_ENGINE_REGISTRY,
  listMetaEngines,
  getMetaEngine,
  getMetaEnginesByCategory,
  getMetaEnginesByEngine,
  getMetaEngineSummary,
} from './registry';
import { runMetaEngine, runMetaEnginesBatch } from './executors';
import type {
  MetaEngineId,
  MetaEngineDefinition,
  MetaEngineCategory,
  MetaEngineExecutionResult,
  MetaEngineSummary,
} from './types';

export interface UseMetaEnginesReturn {
  // Data
  metaEngines: MetaEngineDefinition[];
  summary: MetaEngineSummary;
  
  // Queries
  getMetaEngine: (id: MetaEngineId) => MetaEngineDefinition | undefined;
  getByCategory: (category: MetaEngineCategory) => MetaEngineDefinition[];
  getByEngine: (engineId: string) => MetaEngineDefinition[];
  
  // Execution
  execute: (id: MetaEngineId, input?: Record<string, unknown>) => Promise<MetaEngineExecutionResult>;
  executeBatch: (ids: MetaEngineId[], input?: Record<string, unknown>, parallel?: boolean) => Promise<MetaEngineExecutionResult[]>;
  
  // State
  isExecuting: boolean;
  lastResult: MetaEngineExecutionResult | null;
  executionHistory: MetaEngineExecutionResult[];
}

export function useMetaEngines(): UseMetaEnginesReturn {
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<MetaEngineExecutionResult | null>(null);
  const [executionHistory, setExecutionHistory] = useState<MetaEngineExecutionResult[]>([]);
  
  const metaEngines = useMemo(() => listMetaEngines(), []);
  const summary = useMemo(() => getMetaEngineSummary(), []);
  
  const execute = useCallback(async (
    id: MetaEngineId,
    input: Record<string, unknown> = {}
  ): Promise<MetaEngineExecutionResult> => {
    setIsExecuting(true);
    try {
      const result = await runMetaEngine(id, input);
      setLastResult(result);
      setExecutionHistory(prev => [...prev.slice(-9), result]);
      return result;
    } finally {
      setIsExecuting(false);
    }
  }, []);
  
  const executeBatch = useCallback(async (
    ids: MetaEngineId[],
    input: Record<string, unknown> = {},
    parallel: boolean = true
  ): Promise<MetaEngineExecutionResult[]> => {
    setIsExecuting(true);
    try {
      const results = await runMetaEnginesBatch(ids, input, { parallel });
      if (results.length > 0) {
        setLastResult(results[results.length - 1]);
        setExecutionHistory(prev => [...prev.slice(-(10 - results.length)), ...results]);
      }
      return results;
    } finally {
      setIsExecuting(false);
    }
  }, []);
  
  return {
    metaEngines,
    summary,
    getMetaEngine,
    getByCategory: getMetaEnginesByCategory,
    getByEngine: getMetaEnginesByEngine,
    execute,
    executeBatch,
    isExecuting,
    lastResult,
    executionHistory,
  };
}

export default useMetaEngines;
