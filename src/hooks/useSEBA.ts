/**
 * useSEBA - React hook for Self-Evolving Bounded Agent
 * v1.0.0 — Full Cognitive × Evolution × Governance
 * 
 * Provides comprehensive access to SEBA operations:
 * - State and configuration
 * - Cycle execution
 * - Proposal management
 * - Evolution history
 */

import { useState, useCallback, useMemo } from 'react';
import { sebaAgent } from '@/lib/substrate/seba';
import type { 
  SEBAState, 
  SEBAConfig, 
  SEBAMode, 
  SEBACycleResult,
  SEBACommandResult,
  ImprovementProposal,
} from '@/lib/substrate/seba';

export interface UseSEBAReturn {
  // State
  state: SEBAState | null;
  config: Partial<SEBAConfig> | null;
  
  // Status
  isEnabled: boolean;
  isCycleRunning: boolean;
  mode: SEBAMode;
  phase: string;
  
  // Actions
  enable: () => Promise<SEBACommandResult>;
  disable: () => Promise<SEBACommandResult>;
  setMode: (mode: SEBAMode) => Promise<SEBACommandResult>;
  
  // Cycle operations
  runCycle: () => Promise<SEBACycleResult>;
  propose: () => Promise<SEBACommandResult>;
  
  // Proposal management
  review: () => Promise<SEBACommandResult>;
  approve: (proposalId: string) => Promise<SEBACommandResult>;
  reject: (proposalId: string) => Promise<SEBACommandResult>;
  execute: (proposalId: string) => Promise<SEBACommandResult>;
  rollback: (executionId: string) => Promise<SEBACommandResult>;
  
  // History & config
  getHistory: (limit?: number) => Promise<SEBACommandResult>;
  updateConfig: (updates: Partial<SEBAConfig>) => Promise<SEBACommandResult>;
  
  // Generic command
  command: (cmd: { command: string; args?: Record<string, unknown> }) => Promise<SEBACommandResult>;
  
  // Refresh state
  refresh: () => void;
}

export function useSEBA(): UseSEBAReturn {
  const [state, setState] = useState<SEBAState | null>(null);
  const [config, setConfig] = useState<Partial<SEBAConfig> | null>(null);
  const [isCycleRunning, setIsCycleRunning] = useState(false);

  // Refresh state from agent
  const refresh = useCallback(() => {
    const result = sebaAgent.handleCommand('status');
    result.then((r) => {
      if (r.success && r.data) {
        const data = r.data as { state: SEBAState; config: Partial<SEBAConfig> };
        setState(data.state);
        setConfig(data.config);
      }
    });
  }, []);

  // Initial load
  useMemo(() => {
    refresh();
  }, [refresh]);

  // Status helpers
  const isEnabled = useMemo(() => config?.enabled ?? false, [config]);
  const mode = useMemo(() => (config?.mode ?? 'advisory') as SEBAMode, [config]);
  const phase = useMemo(() => state?.current_phase ?? 'idle', [state]);

  // Enable/Disable
  const enable = useCallback(async (): Promise<SEBACommandResult> => {
    const result = await sebaAgent.handleCommand('enable');
    refresh();
    return result;
  }, [refresh]);

  const disable = useCallback(async (): Promise<SEBACommandResult> => {
    const result = await sebaAgent.handleCommand('disable');
    refresh();
    return result;
  }, [refresh]);

  // Set mode
  const setMode = useCallback(async (newMode: SEBAMode): Promise<SEBACommandResult> => {
    const result = await sebaAgent.handleCommand('mode', { mode: newMode });
    refresh();
    return result;
  }, [refresh]);

  // Run cycle
  const runCycle = useCallback(async (): Promise<SEBACycleResult> => {
    setIsCycleRunning(true);
    try {
      const result = await sebaAgent.runCycle();
      refresh();
      return result;
    } finally {
      setIsCycleRunning(false);
    }
  }, [refresh]);

  // Propose only
  const propose = useCallback(async (): Promise<SEBACommandResult> => {
    return sebaAgent.handleCommand('propose');
  }, []);

  // Review pending
  const review = useCallback(async (): Promise<SEBACommandResult> => {
    return sebaAgent.handleCommand('review');
  }, []);

  // Approve proposal
  const approve = useCallback(async (proposalId: string): Promise<SEBACommandResult> => {
    const result = await sebaAgent.handleCommand('approve', { proposal_id: proposalId });
    refresh();
    return result;
  }, [refresh]);

  // Reject proposal
  const reject = useCallback(async (proposalId: string): Promise<SEBACommandResult> => {
    const result = await sebaAgent.handleCommand('reject', { proposal_id: proposalId });
    refresh();
    return result;
  }, [refresh]);

  // Execute proposal
  const execute = useCallback(async (proposalId: string): Promise<SEBACommandResult> => {
    const result = await sebaAgent.handleCommand('execute', { proposal_id: proposalId });
    refresh();
    return result;
  }, [refresh]);

  // Rollback execution
  const rollback = useCallback(async (executionId: string): Promise<SEBACommandResult> => {
    const result = await sebaAgent.handleCommand('rollback', { execution_id: executionId });
    refresh();
    return result;
  }, [refresh]);

  // Get history
  const getHistory = useCallback(async (limit = 20): Promise<SEBACommandResult> => {
    return sebaAgent.handleCommand('history', { limit });
  }, []);

  // Update config
  const updateConfig = useCallback(async (updates: Partial<SEBAConfig>): Promise<SEBACommandResult> => {
    const result = await sebaAgent.handleCommand('config', { updates });
    refresh();
    return result;
  }, [refresh]);

  // Generic command
  const command = useCallback(async (cmd: { command: string; args?: Record<string, unknown> }): Promise<SEBACommandResult> => {
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
    updateConfig,
    command,
    refresh,
  };
}

// Simpler hooks for specific use cases
export function useSEBAState() {
  const { state, phase, refresh } = useSEBA();
  return { state, phase, refresh };
}

export function useSEBAConfig() {
  const { config, isEnabled, mode, updateConfig } = useSEBA();
  return { config, isEnabled, mode, updateConfig };
}

export function useSEBACycle() {
  const { runCycle, isCycleRunning, propose } = useSEBA();
  return { runCycle, isCycleRunning, propose };
}

export function useSEBAPropose() {
  const { propose } = useSEBA();
  return { propose };
}

export function useSEBAReview() {
  const { review, approve, reject } = useSEBA();
  return { review, approve, reject };
}

export function useSEBAExecute() {
  const { execute, rollback } = useSEBA();
  return { execute, rollback };
}

export function useSEBAHistory() {
  const { getHistory } = useSEBA();
  return { getHistory };
}

export function useSEBACommand() {
  const { command } = useSEBA();
  return { command };
}

export function useSEBADecision() {
  const { approve, reject } = useSEBA();
  return { approve, reject };
}

export function useSEBARollback() {
  const { rollback } = useSEBA();
  return { rollback };
}
