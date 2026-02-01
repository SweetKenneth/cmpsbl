/**
 * useSEBA Hook
 * v1.0.0 — React interface for Self-Evolving Bounded Agent
 */

import { useState, useEffect, useCallback } from 'react';
import { sebaAgent } from './seba-agent';
import type { 
  SEBAState, 
  SEBAMode, 
  SEBACycleResult, 
  SEBACommandResult,
  ImprovementProposal 
} from './types';

export interface UseSEBAReturn {
  // State
  state: SEBAState | null;
  loading: boolean;
  error: string | null;
  
  // Commands
  enable: () => Promise<SEBACommandResult>;
  disable: () => Promise<SEBACommandResult>;
  setMode: (mode: SEBAMode) => Promise<SEBACommandResult>;
  runCycle: () => Promise<SEBACycleResult>;
  propose: () => Promise<SEBACommandResult>;
  review: () => Promise<SEBACommandResult>;
  approve: (proposalId: string) => Promise<SEBACommandResult>;
  reject: (proposalId: string) => Promise<SEBACommandResult>;
  execute: (proposalId: string) => Promise<SEBACommandResult>;
  rollback: (executionId: string) => Promise<SEBACommandResult>;
  getHistory: (limit?: number) => Promise<SEBACommandResult>;
  getConfig: () => Promise<SEBACommandResult>;
  setThresholds: (updates: { auto_approve?: number; risk_tolerance?: string }) => Promise<SEBACommandResult>;
  
  // Refresh
  refresh: () => Promise<void>;
}

export function useSEBA(): UseSEBAReturn {
  const [state, setState] = useState<SEBAState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await sebaAgent.handleCommand('status');
      if (result.success && result.data) {
        setState((result.data as { state: SEBAState }).state);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch SEBA state');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    refresh();
  }, [refresh]);
  
  const enable = useCallback(async () => {
    const result = await sebaAgent.handleCommand('enable');
    await refresh();
    return result;
  }, [refresh]);
  
  const disable = useCallback(async () => {
    const result = await sebaAgent.handleCommand('disable');
    await refresh();
    return result;
  }, [refresh]);
  
  const setMode = useCallback(async (mode: SEBAMode) => {
    const result = await sebaAgent.handleCommand('mode', { mode });
    await refresh();
    return result;
  }, [refresh]);
  
  const runCycle = useCallback(async () => {
    setLoading(true);
    try {
      const result = await sebaAgent.runCycle();
      await refresh();
      return result;
    } finally {
      setLoading(false);
    }
  }, [refresh]);
  
  const propose = useCallback(async () => {
    setLoading(true);
    try {
      const result = await sebaAgent.handleCommand('propose');
      await refresh();
      return result;
    } finally {
      setLoading(false);
    }
  }, [refresh]);
  
  const review = useCallback(async () => {
    return sebaAgent.handleCommand('review');
  }, []);
  
  const approve = useCallback(async (proposalId: string) => {
    const result = await sebaAgent.handleCommand('approve', { proposal_id: proposalId });
    await refresh();
    return result;
  }, [refresh]);
  
  const reject = useCallback(async (proposalId: string) => {
    const result = await sebaAgent.handleCommand('reject', { proposal_id: proposalId });
    await refresh();
    return result;
  }, [refresh]);
  
  const execute = useCallback(async (proposalId: string) => {
    setLoading(true);
    try {
      const result = await sebaAgent.handleCommand('execute', { proposal_id: proposalId });
      await refresh();
      return result;
    } finally {
      setLoading(false);
    }
  }, [refresh]);
  
  const rollback = useCallback(async (executionId: string) => {
    setLoading(true);
    try {
      const result = await sebaAgent.handleCommand('rollback', { execution_id: executionId });
      await refresh();
      return result;
    } finally {
      setLoading(false);
    }
  }, [refresh]);
  
  const getHistory = useCallback(async (limit = 20) => {
    return sebaAgent.handleCommand('history', { limit });
  }, []);
  
  const getConfig = useCallback(async () => {
    return sebaAgent.handleCommand('config');
  }, []);
  
  const setThresholds = useCallback(async (updates: { auto_approve?: number; risk_tolerance?: string }) => {
    const result = await sebaAgent.handleCommand('thresholds', updates);
    await refresh();
    return result;
  }, [refresh]);
  
  return {
    state,
    loading,
    error,
    enable,
    disable,
    setMode,
    runCycle,
    propose,
    review,
    approve,
    reject,
    execute,
    rollback,
    getHistory,
    getConfig,
    setThresholds,
    refresh,
  };
}
