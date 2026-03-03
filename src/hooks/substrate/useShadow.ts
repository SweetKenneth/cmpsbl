/**
 * useShadow Hook — SHADOW module operations
 * Part of the CSZ (Covert Systems Zone)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as shadowModule from '@/lib/substrate/shadow-module';

export interface UseShadowReturn {
  state: ReturnType<typeof useQuery>;
  executeRun: ReturnType<typeof useMutation>;
  configureMesh: ReturnType<typeof useMutation>;
}

export function useShadow(): UseShadowReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: ['substrate', 'shadow', 'state'],
    queryFn: () => shadowModule.getShadowState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const executeRun = useMutation({
    mutationFn: (params: { proposalId: string; mode?: shadowModule.ShadowRunMode }) =>
      Promise.resolve(shadowModule.executeShadowRun(params.proposalId, params.mode)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'shadow'] }),
  });

  const configureMesh = useMutation({
    mutationFn: (config: Partial<shadowModule.ShadowMeshConfig>) =>
      Promise.resolve(shadowModule.configureMesh(config)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'shadow'] }),
  });

  return { state, executeRun, configureMesh };
}
