/**
 * promptfluid® Substrate React Hooks
 * v6.1.0 — Cognitive Orchestration Substrate
 * 
 * Includes hooks for unified memory_core lifecycle
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate, SubstrateModule, SubstrateResponse } from '@/lib/substrate';
import { memoryCore, type MemoryQuery, type MemoryStateSchema } from '@/lib/substrate/memory-core';

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
