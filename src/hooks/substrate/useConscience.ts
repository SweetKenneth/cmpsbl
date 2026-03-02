/**
 * useConscience Hook — CONSCIENCE module operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as conscienceModule from '@/lib/substrate/conscience-module';

export interface UseConscienceReturn {
  state: ReturnType<typeof useQuery>;
  evaluate: ReturnType<typeof useMutation>;
  checkAlignment: ReturnType<typeof useMutation>;
}

export function useConscience(): UseConscienceReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: ['substrate', 'conscience', 'state'],
    queryFn: () => conscienceModule.getConscienceState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const evaluate = useMutation({
    mutationFn: (params: { action: string; context?: Record<string, unknown> }) =>
      Promise.resolve(conscienceModule.evaluate(params.action, params.context)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'conscience'] }),
  });

  const checkAlignment = useMutation({
    mutationFn: (params: { entity: string; values: Record<string, number> }) =>
      Promise.resolve(conscienceModule.checkAlignment(params.entity, params.values)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'conscience'] }),
  });

  return { state, evaluate, checkAlignment };
}
