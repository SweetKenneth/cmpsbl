/**
 * useSEBA - React hook for Self-Evolving Bounded Agent
 * v1.2.0 — Full Cognitive × Evolution × Governance
 * Now respects debug mode kill-switch
 * 
 * Provides comprehensive access to SEBA operations:
 * - State and configuration
 * - Cycle execution
 * - Proposal management
 * - Evolution history
 * - Health monitoring
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sebaAgent } from '@/lib/substrate/seba';
import { debugMode } from '@/lib/debug-mode';
import type { 
  SEBAState, 
  SEBAConfig, 
  SEBAMode, 
  SEBACycleResult,
  SEBACommandResult,
  ImprovementProposal,
  SEBAMetrics,
} from '@/lib/substrate/seba';

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export interface UseSEBAReturn {
  // State
  state: SEBAState | null;
  config: Partial<SEBAConfig> | null;
  
  // Status
  isEnabled: boolean;
  isCycleRunning: boolean;
  mode: SEBAMode;
  phase: string;
  health: number;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Actions
  enable: () => Promise<SEBACommandResult>;
  disable: () => Promise<SEBACommandResult>;
  setMode: (mode: SEBAMode) => Promise<SEBACommandResult>;
  pause: () => Promise<SEBACommandResult>;
  resume: () => Promise<SEBACommandResult>;
  
  // Cycle operations
  runCycle: () => Promise<SEBACycleResult>;
  propose: () => Promise<SEBACommandResult>;
  
  // Proposal management
  review: () => Promise<SEBACommandResult>;
  approve: (proposalId: string) => Promise<SEBACommandResult>;
  reject: (proposalId: string, reason?: string) => Promise<SEBACommandResult>;
  execute: (proposalId: string) => Promise<SEBACommandResult>;
  rollback: (executionId: string) => Promise<SEBACommandResult>;
  
  // History & config
  getHistory: (limit?: number) => Promise<SEBACommandResult>;
  getMetrics: () => Promise<SEBACommandResult>;
  updateConfig: (updates: Partial<SEBAConfig>) => Promise<SEBACommandResult>;
  setThresholds: (thresholds: { auto_approve?: number; risk_tolerance?: string }) => Promise<SEBACommandResult>;
  
  // Generic command
  command: (cmd: { command: string; args?: Record<string, unknown> }) => Promise<SEBACommandResult>;
  
  // Refresh state
  refresh: () => void;
  
  // Error
  error: Error | null;
}

export function useSEBA(): UseSEBAReturn {
  const queryClient = useQueryClient();
  const [isCycleRunning, setIsCycleRunning] = useState(false);
  const mountedRef = useRef(true);
  const pollingEnabled = debugMode.allowModulePolling();

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Query for SEBA status
  const statusQuery = useQuery({
    queryKey: ['seba', 'status'],
    queryFn: async () => {
      const result = await sebaAgent.handleCommand('status');
      if (!result.success) throw new Error(result.message);
      return result.data as { state: SEBAState; config: Partial<SEBAConfig> };
    },
    staleTime: 5000,
    refetchInterval: pollingEnabled ? 30000 : false, // Auto-refresh every 30s
    enabled: pollingEnabled,
  });

  const state = statusQuery.data?.state ?? null;
  const config = statusQuery.data?.config ?? null;

  // Derived status
  const isEnabled = useMemo(() => config?.enabled ?? false, [config]);
  const mode = useMemo(() => (config?.mode ?? 'advisory') as SEBAMode, [config]);
  const phase = useMemo(() => state?.current_phase ?? 'idle', [state]);
  const health = useMemo(() => state?.agent_health ?? 100, [state]);

  // Refresh function
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['seba'] });
  }, [queryClient]);

  // ═══════════════════════════════════════════════════════════════════════════
  // MUTATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const enableMutation = useMutation({
    mutationFn: () => sebaAgent.handleCommand('enable'),
    onSuccess: () => refresh(),
  });

  const disableMutation = useMutation({
    mutationFn: () => sebaAgent.handleCommand('disable'),
    onSuccess: () => refresh(),
  });

  const modeMutation = useMutation({
    mutationFn: (newMode: SEBAMode) => sebaAgent.handleCommand('mode', { mode: newMode }),
    onSuccess: () => refresh(),
  });

  const cycleMutation = useMutation({
    mutationFn: async () => {
      setIsCycleRunning(true);
      try {
        return await sebaAgent.runCycle();
      } finally {
        if (mountedRef.current) setIsCycleRunning(false);
      }
    },
    onSuccess: () => refresh(),
  });

  const proposeMutation = useMutation({
    mutationFn: () => sebaAgent.handleCommand('propose'),
    onSuccess: () => refresh(),
  });

  const approveMutation = useMutation({
    mutationFn: (proposalId: string) => sebaAgent.handleCommand('approve', { proposal_id: proposalId }),
    onSuccess: () => refresh(),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ proposalId, reason }: { proposalId: string; reason?: string }) => 
      sebaAgent.handleCommand('reject', { proposal_id: proposalId, reason }),
    onSuccess: () => refresh(),
  });

  const executeMutation = useMutation({
    mutationFn: (proposalId: string) => sebaAgent.handleCommand('execute', { proposal_id: proposalId }),
    onSuccess: () => refresh(),
  });

  const rollbackMutation = useMutation({
    mutationFn: (executionId: string) => sebaAgent.handleCommand('rollback', { execution_id: executionId }),
    onSuccess: () => refresh(),
  });

  const configMutation = useMutation({
    mutationFn: (updates: Partial<SEBAConfig>) => sebaAgent.handleCommand('config', { updates }),
    onSuccess: () => refresh(),
  });

  const thresholdsMutation = useMutation({
    mutationFn: (thresholds: { auto_approve?: number; risk_tolerance?: string }) => 
      sebaAgent.handleCommand('thresholds', thresholds),
    onSuccess: () => refresh(),
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTION WRAPPERS
  // ═══════════════════════════════════════════════════════════════════════════

  const enable = useCallback(() => enableMutation.mutateAsync(), [enableMutation]);
  const disable = useCallback(() => disableMutation.mutateAsync(), [disableMutation]);
  const setModeAction = useCallback((m: SEBAMode) => modeMutation.mutateAsync(m), [modeMutation]);
  
  const pause = useCallback(() => sebaAgent.handleCommand('pause' as any), []);
  const resume = useCallback(() => sebaAgent.handleCommand('resume' as any), []);
  
  const runCycle = useCallback(() => cycleMutation.mutateAsync(), [cycleMutation]);
  const propose = useCallback(() => proposeMutation.mutateAsync(), [proposeMutation]);
  
  const review = useCallback(() => sebaAgent.handleCommand('review'), []);
  const approve = useCallback((id: string) => approveMutation.mutateAsync(id), [approveMutation]);
  const reject = useCallback((id: string, reason?: string) => 
    rejectMutation.mutateAsync({ proposalId: id, reason }), [rejectMutation]);
  const execute = useCallback((id: string) => executeMutation.mutateAsync(id), [executeMutation]);
  const rollback = useCallback((id: string) => rollbackMutation.mutateAsync(id), [rollbackMutation]);
  
  const getHistory = useCallback((limit = 20) => sebaAgent.handleCommand('history', { limit }), []);
  const getMetrics = useCallback(() => sebaAgent.handleCommand('metrics' as any), []);
  const updateConfig = useCallback((updates: Partial<SEBAConfig>) => configMutation.mutateAsync(updates), [configMutation]);
  const setThresholds = useCallback((t: { auto_approve?: number; risk_tolerance?: string }) => 
    thresholdsMutation.mutateAsync(t), [thresholdsMutation]);
  
  const command = useCallback(async (cmd: { command: string; args?: Record<string, unknown> }) => {
    const result = await sebaAgent.handleCommand(cmd.command as any, cmd.args);
    refresh();
    return result;
  }, [refresh]);

  return {
    state,
    config,
    isEnabled,
    isCycleRunning,
    mode,
    phase,
    health,
    isLoading: statusQuery.isLoading,
    isRefreshing: statusQuery.isFetching && !statusQuery.isLoading,
    enable,
    disable,
    setMode: setModeAction,
    pause,
    resume,
    runCycle,
    propose,
    review,
    approve,
    reject,
    execute,
    rollback,
    getHistory,
    getMetrics,
    updateConfig,
    setThresholds,
    command,
    refresh,
    error: statusQuery.error as Error | null,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPECIALIZED HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/** Hook for SEBA state only */
export function useSEBAState() {
  const { state, phase, health, isLoading, refresh, error } = useSEBA();
  return { state, phase, health, isLoading, refresh, error };
}

/** Hook for SEBA config management */
export function useSEBAConfig() {
  const { config, isEnabled, mode, updateConfig, setThresholds, setMode, isLoading } = useSEBA();
  return { config, isEnabled, mode, updateConfig, setThresholds, setMode, isLoading };
}

/** Hook for cycle operations */
export function useSEBACycle() {
  const { runCycle, isCycleRunning, propose, phase } = useSEBA();
  return { runCycle, isCycleRunning, propose, phase };
}

/** Hook for proposal management */
export function useSEBAProposals() {
  const { review, approve, reject, execute } = useSEBA();
  const [proposals, setProposals] = useState<ImprovementProposal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const result = await review();
      if (result.success && result.data) {
        setProposals((result.data as any).proposals || []);
      }
    } finally {
      setLoading(false);
    }
  }, [review]);

  return { proposals, loading, fetchProposals, approve, reject, execute };
}

/** Hook for evolution/rollback operations */
export function useSEBAEvolution() {
  const { execute, rollback, getHistory } = useSEBA();
  return { execute, rollback, getHistory };
}

/** Hook for SEBA health monitoring */
export function useSEBAHealth() {
  const { state, health, refresh } = useSEBA();
  
  const healthStatus = useMemo(() => {
    if (health >= 90) return 'excellent';
    if (health >= 70) return 'good';
    if (health >= 50) return 'fair';
    if (health >= 30) return 'poor';
    return 'critical';
  }, [health]);

  return { 
    health, 
    healthStatus, 
    cognitiveUtilization: state?.cognitive_utilization ?? 0,
    governanceCompliance: state?.governance_compliance ?? 100,
    refresh,
  };
}

/** Hook for generic SEBA commands */
export function useSEBACommand() {
  const { command } = useSEBA();
  return { command };
}

export default useSEBA;
