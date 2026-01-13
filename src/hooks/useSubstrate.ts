/**
 * promptfluid® Substrate React Hooks
 * v2026.01 — Cognitive Orchestration Substrate
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate, SubstrateModule, SubstrateResponse } from '@/lib/substrate';

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

// Cascade hooks
export function useCascadeStatus() {
  return useSubstrateQuery('cascade', 'status', undefined, { refetchInterval: 30000 });
}

export function useCascadeChat() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const mutation = useSubstrateMutation<{ reply: string }>('cascade', 'chat');

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

export function useCascadeDream() {
  return useSubstrateMutation('cascade', 'dream');
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
  const cascade = useCascadeStatus();
  const defense = useDefenseStatus();
  const nexus = useNexusStatus();
  const vision = useVisionHealth();

  const isLoading = brain.isLoading || cascade.isLoading || defense.isLoading || nexus.isLoading || vision.isLoading;
  const isError = brain.isError || cascade.isError || defense.isError || nexus.isError || vision.isError;

  const modules = {
    brain: brain.data,
    cascade: cascade.data,
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
      cascade.refetch();
      defense.refetch();
      nexus.refetch();
      vision.refetch();
    },
  };
}
