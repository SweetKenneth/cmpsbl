/**
 * useEncoded Hook
 * React hook for Encoded agent management with enhanced guards
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  type EncodedConfig,
  type ExecutionMode,
  type PrimaryModel,
  DEFAULT_ENCODED_CONFIG,
} from '@/lib/codeagent/encoded/policy';
import {
  getEncodedConfig,
  updateEncodedConfig,
  getExecutionModeLabel,
  getPrimaryModelLabel,
} from '@/lib/codeagent/encoded/config';

export interface EncodedTask {
  module: string;
  change_type: string;
  description: string;
  file_path?: string;
  existing_code?: string;
}

export interface EncodedResult {
  success: boolean;
  dry_run: boolean;
  would_write: boolean;
  generated?: {
    code: string;
    file_path: string;
    operation: 'create' | 'modify' | 'delete';
    confidence: number;
  };
  verification?: {
    syntax_valid: boolean;
    anchors_preserved: boolean;
    narrative_clean: boolean;
    dangerous_patterns_clean: boolean;
    issues: string[];
  };
  provider?: string;
  model?: string;
  latency_ms?: number;
  error?: string;
}

export interface EncodedStats {
  patterns_learned: number;
  executions_today: number;
  version: string;
}

export function useEncoded() {
  const [config, setConfig] = useState<EncodedConfig>(DEFAULT_ENCODED_CONFIG);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<EncodedResult | null>(null);
  const [stats, setStats] = useState<EncodedStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load config on mount
  useEffect(() => {
    getEncodedConfig().then(setConfig);
  }, []);

  // Refresh stats
  const refreshStats = useCallback(async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('pf-encoded-agent', {
        body: { action: 'status' },
      });

      if (fnError) throw fnError;
      if (data?.success) {
        setStats({
          patterns_learned: data.stats?.patterns_learned || 0,
          executions_today: data.stats?.executions_today || 0,
          version: data.version || 'latest',
        });
      }
    } catch (err) {
      console.error('Failed to fetch Encoded stats:', err);
    }
  }, []);

  // Update configuration
  const updateConfig = useCallback(async (updates: Partial<EncodedConfig>) => {
    const result = await updateEncodedConfig(updates);
    if (result.success) {
      setConfig(prev => ({ ...prev, ...updates }));
    }
    return result;
  }, []);

  // Generate code (dry-run by default)
  const generate = useCallback(async (
    task: EncodedTask,
    options?: { dryRun?: boolean; sebaProposalId?: string }
  ): Promise<EncodedResult> => {
    setLoading(true);
    setError(null);

    try {
      const action = options?.dryRun !== false ? 'dry_run' : 'generate';
      
      const { data, error: fnError } = await supabase.functions.invoke('pf-encoded-agent', {
        body: {
          action,
          task,
          execution_mode: config.executionMode,
          seba_proposal_id: options?.sebaProposalId,
        },
      });

      if (fnError) throw fnError;

      const result: EncodedResult = {
        success: data?.success || false,
        dry_run: data?.dry_run || true,
        would_write: data?.would_write || false,
        generated: data?.generated,
        verification: data?.verification ? {
          ...data.verification,
          dangerous_patterns_clean: data.verification.dangerous_patterns_clean ?? true,
        } : undefined,
        provider: data?.provider,
        model: data?.model,
        latency_ms: data?.latency_ms,
        error: data?.error,
      };

      setLastResult(result);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Encoded execution failed';
      setError(errorMsg);
      
      const failResult: EncodedResult = {
        success: false,
        dry_run: true,
        would_write: false,
        error: errorMsg,
      };
      setLastResult(failResult);
      return failResult;
    } finally {
      setLoading(false);
    }
  }, [config.executionMode]);

  // Verify existing code
  const verify = useCallback(async (code: string, existingCode?: string) => {
    setLoading(true);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('pf-encoded-agent', {
        body: {
          action: 'verify',
          code,
          task: existingCode ? { existing_code: existingCode } : undefined,
        },
      });

      if (fnError) throw fnError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      return { success: false, verification: { issues: ['Verification failed'] } };
    } finally {
      setLoading(false);
    }
  }, []);

  // Record learning from outcome
  const recordLearning = useCallback(async (
    code: string,
    outcome: 'success' | 'failure' | 'rollback'
  ) => {
    try {
      await supabase.functions.invoke('pf-encoded-agent', {
        body: { action: 'learn', code, outcome },
      });
    } catch (err) {
      console.error('Failed to record learning:', err);
    }
  }, []);

  return {
    // State
    config,
    loading,
    lastResult,
    stats,
    error,

    // Actions
    generate,
    verify,
    recordLearning,
    updateConfig,
    refreshStats,

    // Display helpers
    getExecutionModeLabel,
    getPrimaryModelLabel,

    // Computed
    isDryRun: config.executionMode === 'dry_run',
    isSebaIntegrated: config.sebaIntegration,
    isNexusFleet: config.primaryModel === 'nexus_fleet',
  };
}

export default useEncoded;
