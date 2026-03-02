/**
 * useReflex Hook — REFLEX module operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as reflexModule from '@/lib/substrate/reflex-module';

export interface UseReflexReturn {
  state: ReturnType<typeof useQuery>;
  registerNode: ReturnType<typeof useMutation>;
  decide: ReturnType<typeof useMutation>;
  addRule: ReturnType<typeof useMutation>;
}

export function useReflex(): UseReflexReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: ['substrate', 'reflex', 'state'],
    queryFn: () => reflexModule.getReflexState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const registerNode = useMutation({
    mutationFn: (params: { name: string; region: string }) =>
      Promise.resolve(reflexModule.registerNode(params.name, params.region)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'reflex'] }),
  });

  const decide = useMutation({
    mutationFn: (params: { trigger: string; context?: Record<string, unknown> }) =>
      Promise.resolve(reflexModule.decide(params.trigger, params.context)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'reflex'] }),
  });

  const addRule = useMutation({
    mutationFn: (params: { name: string; condition: string; action: string; priority?: reflexModule.DecisionPriority }) =>
      Promise.resolve(reflexModule.addRule(params.name, params.condition, params.action, params.priority)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'reflex'] }),
  });

  return { state, registerNode, decide, addRule };
}
