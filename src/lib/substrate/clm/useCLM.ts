/**
 * CLM React Hook
 * v6.7.0 — React integration for Constant Learning Mode
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getCLMStatus,
  enableCLM,
  disableCLM,
  activateKillSwitch,
  deactivateKillSwitch,
  runCLMCycle,
  budgetGovernor,
  type BudgetState,
  type TierInfo,
  type OrchestratorState,
  type LearningJobResult,
} from './index';

export interface UseCLMReturn {
  // State
  enabled: boolean;
  running: boolean;
  budget: BudgetState;
  tier: TierInfo;
  srQueueSize: number;
  orchestratorState: OrchestratorState;
  lastResult: LearningJobResult | null;
  
  // Actions
  enable: () => void;
  disable: () => void;
  triggerKillSwitch: () => void;
  deactivateKill: () => void;
  runOnce: () => Promise<LearningJobResult | null>;
  resetBudget: () => void;
  resumeFromErrors: () => void;
  
  // Refresh
  refresh: () => void;
}

export function useCLM(): UseCLMReturn {
  const [status, setStatus] = useState(getCLMStatus);
  const [lastResult, setLastResult] = useState<LearningJobResult | null>(null);

  const refresh = useCallback(() => {
    setStatus(getCLMStatus());
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [refresh]);

  const enable = useCallback(() => {
    enableCLM();
    refresh();
  }, [refresh]);

  const disable = useCallback(() => {
    disableCLM();
    refresh();
  }, [refresh]);

  const triggerKillSwitch = useCallback(() => {
    activateKillSwitch();
    refresh();
  }, [refresh]);

  const deactivateKill = useCallback(() => {
    deactivateKillSwitch();
    refresh();
  }, [refresh]);

  const runOnce = useCallback(async () => {
    const result = await runCLMCycle();
    setLastResult(result);
    refresh();
    return result;
  }, [refresh]);

  const resetBudget = useCallback(() => {
    budgetGovernor.resetBudgetCounter();
    refresh();
  }, [refresh]);

  const resumeFromErrors = useCallback(() => {
    budgetGovernor.resumeFromErrors();
    refresh();
  }, [refresh]);

  return {
    ...status,
    lastResult,
    enable,
    disable,
    triggerKillSwitch,
    deactivateKill,
    runOnce,
    resetBudget,
    resumeFromErrors,
    refresh,
  };
}
