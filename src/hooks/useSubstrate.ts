/**
 * CMPSBL® Substrate React Hooks
 * Cognitive Orchestration Substrate (Phase 4A: Engine Bus)
 * 
 * Includes hooks for:
 * - Engine Bus dispatch and state
 * - Memory Core lifecycle
 * - Learning Engine lifecycle
 * - Imagination Engine lifecycle
 * - Reasoning Engine lifecycle (Phase 3)
 * - Governance Guard lifecycle (Phase 3)
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate, SubstrateModule, SubstrateResponse } from '@/lib/substrate';
import { engineBus, type EngineName, type DispatchOptions } from '@/lib/substrate/engine-bus';
import { memoryCore, type MemoryQuery, type MemoryStateSchema } from '@/lib/substrate/memory-core';
import { learningEngine, type LearningInput } from '@/lib/substrate/learning-engine';
import { imaginationEngine } from '@/lib/substrate/imagination-engine';
import { reasoningEngine, type ReasoningInput } from '@/lib/substrate/reasoning-engine';
import { governanceGuard, type GovernanceInput } from '@/lib/substrate/governance-guard';

// ═══════════════════════════════════════════════════════════════════════════════
// v6.4.0: ENGINE BUS HOOKS — Canonical Dispatch Layer
// ═══════════════════════════════════════════════════════════════════════════════

/** Hook for engine bus state */
export function useEngineBusState() {
  return useQuery({
    queryKey: ['engine-bus', 'state'],
    queryFn: () => engineBus.getState(),
    refetchInterval: 10000,
  });
}

/** Hook for dispatching commands through the engine bus */
export function useEngineBusDispatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { 
      command: string; 
      payload?: Record<string, unknown>; 
      options?: DispatchOptions 
    }) => engineBus.dispatch(params.command, params.payload, params.options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engine-bus'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
    },
  });
}

/** Hook for dispatching to a specific engine */
export function useEngineDispatch(engine: EngineName) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { 
      command: string; 
      payload?: Record<string, unknown>; 
      options?: DispatchOptions 
    }) => engineBus.dispatchToEngine(engine, params.command, params.payload, params.options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engine-bus'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
    },
  });
}

/** Hook for chained dispatch operations */
export function useEngineBusChain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { 
      chain: Array<{ command: string; payload?: Record<string, unknown> }>; 
      options?: DispatchOptions 
    }) => engineBus.dispatchChain(params.chain, params.options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engine-bus'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
    },
  });
}

/** Hook for engine bus execution events */
export function useEngineBusEvents(limit: number = 20) {
  return useQuery({
    queryKey: ['engine-bus', 'events', limit],
    queryFn: () => engineBus.getEvents(limit),
    refetchInterval: 5000,
  });
}

// Generic substrate hook
export function useSubstrateQuery<T = unknown>(
  module: SubstrateModule,
  action: string,
  payload?: Record<string, unknown>,
  options?: { enabled?: boolean; refetchInterval?: number }
) {
  return useQuery({
    queryKey: ['substrate', module, action, payload],
    queryFn: () => substrate.invoke<T>({ module, action, payload }),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
  });
}

export function useSubstrateMutation<T = unknown>(module: SubstrateModule, action: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: Record<string, unknown>) =>
      substrate.invoke<T>({ module, action, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', module] });
    },
  });
}

// Brain hooks
export function useBrainStatus() {
  return useSubstrateQuery('brain', 'status', undefined, { refetchInterval: 30000 });
}

export function useBrainLearn() {
  return useSubstrateMutation('brain', 'learn');
}

export function useBrainReflect() {
  return useSubstrateMutation('brain', 'reflect');
}

export function useBrainRecall() {
  return useSubstrateMutation('brain', 'recall');
}

// ═══════════════════════════════════════════════════════════════════════════════
// v6.1.0: MEMORY CORE HOOKS — Unified Memory Lifecycle
// ═══════════════════════════════════════════════════════════════════════════════

/** Hook for memory state schema (short-term/long-term/latent) */
export function useMemoryState() {
  return useQuery({
    queryKey: ['memory-core', 'state'],
    queryFn: () => memoryCore.getState(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

/** Hook for ingesting new memories into the lifecycle */
export function useMemoryIngest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { 
      content: string; 
      type?: string; 
      source?: string; 
      confidence?: number; 
      tags?: string[] 
    }) => memoryCore.ingest(params.content, {
      type: params.type as any,
      source: params.source,
      confidence: params.confidence,
      tags: params.tags,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-core'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
    },
  });
}

/** Hook for retrieving memories with multi-strategy search */
export function useMemoryRetrieve() {
  return useMutation({
    mutationFn: (query: MemoryQuery) => memoryCore.retrieve(query),
  });
}

/** Hook for triggering reflection cycle */
export function useMemoryReflect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options?: { scope?: 'session' | 'daily' | 'weekly'; depth?: 'shallow' | 'standard' | 'deep' }) =>
      memoryCore.reflect(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-core'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
    },
  });
}

/** Hook for running full memory lifecycle cycle */
export function useMemoryCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { content: string; autoIndex?: boolean; autoReflect?: boolean }) =>
      memoryCore.runFullCycle(params.content, {
        autoIndex: params.autoIndex,
        autoReflect: params.autoReflect,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-core'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// v6.2.0: LEARNING ENGINE HOOKS — Unified Learning Lifecycle
// ═══════════════════════════════════════════════════════════════════════════════

/** Hook for learning engine state */
export function useLearningState() {
  return useQuery({
    queryKey: ['learning-engine', 'state'],
    queryFn: () => learningEngine.getState(),
    refetchInterval: 30000,
  });
}

/** Hook for learning input (replaces train) */
export function useLearningInput() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LearningInput) => learningEngine.input(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-engine'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
    },
  });
}

/** Hook for learning feedback */
export function useLearningFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (signal: { memory_id?: string; outcome: 'positive' | 'negative' | 'neutral'; score: number; context?: string }) =>
      learningEngine.feedback(signal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-engine'] });
    },
  });
}

/** Hook for full learning cycle */
export function useLearningCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input?: LearningInput) => learningEngine.runCycle(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-engine'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// v6.2.0: IMAGINATION ENGINE HOOKS — Unified Imagination Lifecycle
// ═══════════════════════════════════════════════════════════════════════════════

/** Hook for imagination engine state */
export function useImaginationState() {
  return useQuery({
    queryKey: ['imagination-engine', 'state'],
    queryFn: () => imaginationEngine.getState(),
    refetchInterval: 30000,
  });
}

/** Hook for imagination dream cycle */
export function useImaginationDream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options?: { force?: boolean; send_email?: boolean }) =>
      imaginationEngine.dream(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imagination-engine'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
    },
  });
}

/** Hook for pattern fusion */
export function usePatternFusion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { problem: string; domain_1: string; domain_2: string }) =>
      imaginationEngine.patternFusion(params.problem, params.domain_1, params.domain_2),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imagination-engine'] });
    },
  });
}

/** Hook for full imagination cycle */
export function useImaginationCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options?: { tier?: 'hot' | 'warm' | 'cold'; type?: 'dream' | 'insight' | 'fusion' | 'pattern' }) =>
      imaginationEngine.runCycle(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imagination-engine'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// v6.3.0: REASONING ENGINE HOOKS — Unified Reasoning Lifecycle
// ═══════════════════════════════════════════════════════════════════════════════

/** Hook for reasoning engine state */
export function useReasoningState() {
  return useQuery({
    queryKey: ['reasoning-engine', 'state'],
    queryFn: () => reasoningEngine.getState(),
    refetchInterval: 30000,
  });
}

/** Hook for causal mapping */
export function useCausalMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReasoningInput) => reasoningEngine.causalMapping(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reasoning-engine'] });
    },
  });
}

/** Hook for hypothesis validation */
export function useHypothesisValidation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (hypothesis: { id: string; statement: string; confidence: number; supporting_evidence: string[]; contradicting_evidence: string[]; status: 'pending' | 'validated' | 'rejected' | 'uncertain' }) =>
      reasoningEngine.hypothesisValidation(hypothesis),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reasoning-engine'] });
    },
  });
}

/** Hook for full reasoning cycle */
export function useReasoningCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReasoningInput) => reasoningEngine.runCycle(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reasoning-engine'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// v6.3.0: GOVERNANCE GUARD HOOKS — Unified Governance Lifecycle
// ═══════════════════════════════════════════════════════════════════════════════

/** Hook for governance guard state */
export function useGovernanceState() {
  return useQuery({
    queryKey: ['governance-guard', 'state'],
    queryFn: () => governanceGuard.getState(),
    refetchInterval: 30000,
  });
}

/** Hook for coherence validation */
export function useCoherenceValidation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GovernanceInput) => governanceGuard.coherenceValidation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-guard'] });
    },
  });
}

/** Hook for ethical constraint check */
export function useEthicalCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GovernanceInput) => governanceGuard.ethicalConstraintCheck(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-guard'] });
    },
  });
}

/** Hook for full governance cycle */
export function useGovernanceCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GovernanceInput) => governanceGuard.runCycle(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-guard'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
    },
  });
}

// Decode hooks
export function useDecodeStatus() {
  return useSubstrateQuery('decode', 'status', undefined, { refetchInterval: 30000 });
}

export function useDecodeChat() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const mutation = useSubstrateMutation<{ reply: string }>('decode', 'chat');

  const sendMessage = useCallback(async (message: string, sessionId?: string) => {
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    const response = await mutation.mutateAsync({ message, sessionId });
    
    if (response.success && response.data?.reply) {
      setMessages(prev => [...prev, { role: 'assistant', content: response.data!.reply }]);
    }
    
    return response;
  }, [mutation]);

  return {
    messages,
    sendMessage,
    isLoading: mutation.isPending,
    error: mutation.error,
    clearMessages: () => setMessages([]),
  };
}

export function useDecodeDream() {
  return useSubstrateMutation('decode', 'dream');
}

// Defense hooks
export function useDefenseStatus() {
  return useSubstrateQuery('defense', 'status', undefined, { refetchInterval: 30000 });
}

export function useDefenseAnalyze() {
  return useSubstrateMutation('defense', 'analyze');
}

export function useDefenseRules() {
  return useSubstrateQuery('defense', 'rules');
}

// Nexus hooks
export function useNexusStatus() {
  return useSubstrateQuery('nexus', 'status', undefined, { refetchInterval: 30000 });
}

export function useNexusText() {
  return useSubstrateMutation('nexus', 'text');
}

export function useNexusImage() {
  return useSubstrateMutation('nexus', 'image');
}

// Vision hooks
export function useVisionHealth() {
  return useSubstrateQuery('vision', 'health', undefined, { refetchInterval: 10000 });
}

export function useVisionMetrics() {
  return useSubstrateQuery('vision', 'metrics', undefined, { refetchInterval: 30000 });
}

export function useVisionLogs(module?: SubstrateModule, limit?: number) {
  return useSubstrateQuery('vision', 'logs', { module, limit });
}

// Combined substrate health
export function useSubstrateHealth() {
  const brain = useBrainStatus();
  const decode = useDecodeStatus();
  const defense = useDefenseStatus();
  const nexus = useNexusStatus();
  const vision = useVisionHealth();

  const isLoading = brain.isLoading || decode.isLoading || defense.isLoading || nexus.isLoading || vision.isLoading;
  const isError = brain.isError || decode.isError || defense.isError || nexus.isError || vision.isError;

  const modules = {
    brain: brain.data,
    decode: decode.data,
    defense: defense.data,
    nexus: nexus.data,
    vision: vision.data,
  };

  const healthScore = Object.values(modules).filter(m => m?.success).length / 5 * 100;

  return {
    isLoading,
    isError,
    modules,
    healthScore,
    refetch: () => {
      brain.refetch();
      decode.refetch();
      defense.refetch();
      nexus.refetch();
      vision.refetch();
    },
  };
}
