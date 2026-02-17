/**
 * React Hook for Cognitive Engines
 * v10.5.4 ARCHITECT — Access compound capability execution across 76 engines
 */

import { useState, useCallback, useMemo } from 'react';
import {
  ENGINE_REGISTRY,
  listEngines,
  getEngine,
  getEnginesByCategory,
  getEnginesByModule,
  getEngineSummary,
  runEngine,
  runEnginesBatch,
} from './index';
import type {
  EngineId,
  EngineDefinition,
  EngineCategory,
  EngineExecutionResult,
  EngineSummary,
} from './types';

export interface UseEnginesReturn {
  // Data
  engines: EngineDefinition[];
  summary: EngineSummary;
  
  // Queries
  getEngine: (id: EngineId) => EngineDefinition | undefined;
  getByCategory: (category: EngineCategory) => EngineDefinition[];
  getByModule: (module: string) => EngineDefinition[];
  
  // Execution
  execute: (id: EngineId, input?: Record<string, unknown>) => Promise<EngineExecutionResult>;
  executeBatch: (ids: EngineId[], input?: Record<string, unknown>, parallel?: boolean) => Promise<EngineExecutionResult[]>;
  
  // State
  isExecuting: boolean;
  lastResult: EngineExecutionResult | null;
  executionHistory: EngineExecutionResult[];
}

export function useEngines(): UseEnginesReturn {
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<EngineExecutionResult | null>(null);
  const [executionHistory, setExecutionHistory] = useState<EngineExecutionResult[]>([]);
  
  const engines = useMemo(() => listEngines(), []);
  const summary = useMemo(() => getEngineSummary(), []);
  
  const execute = useCallback(async (
    id: EngineId,
    input: Record<string, unknown> = {}
  ): Promise<EngineExecutionResult> => {
    setIsExecuting(true);
    try {
      const result = await runEngine(id, input);
      setLastResult(result);
      setExecutionHistory(prev => [...prev.slice(-19), result]);
      return result;
    } finally {
      setIsExecuting(false);
    }
  }, []);
  
  const executeBatch = useCallback(async (
    ids: EngineId[],
    input: Record<string, unknown> = {},
    parallel: boolean = true
  ): Promise<EngineExecutionResult[]> => {
    setIsExecuting(true);
    try {
      const results = await runEnginesBatch(ids, input, { parallel });
      if (results.length > 0) {
        setLastResult(results[results.length - 1]);
        setExecutionHistory(prev => [...prev.slice(-(20 - results.length)), ...results]);
      }
      return results;
    } finally {
      setIsExecuting(false);
    }
  }, []);
  
  return {
    engines,
    summary,
    getEngine,
    getByCategory: getEnginesByCategory,
    getByModule: getEnginesByModule,
    execute,
    executeBatch,
    isExecuting,
    lastResult,
    executionHistory,
  };
}

export default useEngines;
