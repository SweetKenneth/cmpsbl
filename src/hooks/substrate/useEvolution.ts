/**
 * useEvolution Hook — EVOLUTION module operations
 * Part of the CSZ (Covert Systems Zone)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as evolutionModule from '@/lib/substrate/evolution';
import type { MutationChange } from '@/lib/substrate/matrix/mutation-pipeline';
import type { SubstrateModuleName } from '@/lib/core/index';

export interface UseEvolutionReturn {
  state: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  recentCycles: ReturnType<typeof useQuery>;
  activeCycle: ReturnType<typeof useQuery>;
  runCycle: ReturnType<typeof useMutation>;
  rollback: ReturnType<typeof useMutation>;
}

export function useEvolution(): UseEvolutionReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: ['substrate', 'evolution', 'state'],
    queryFn: () => evolutionModule.getEvolutionState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const health = useQuery({
    queryKey: ['substrate', 'evolution', 'health'],
    queryFn: () => evolutionModule.getEvolutionHealth(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const resilience = useQuery({
    queryKey: ['substrate', 'evolution', 'resilience'],
    queryFn: () => evolutionModule.getEvolutionResilience(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const recentCycles = useQuery({
    queryKey: ['substrate', 'evolution', 'cycles', 'recent'],
    queryFn: () => evolutionModule.getRecentCycles(20),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const activeCycle = useQuery({
    queryKey: ['substrate', 'evolution', 'cycles', 'active'],
    queryFn: () => evolutionModule.getActiveCycle(),
    refetchInterval: pollingEnabled ? 15000 : false,
    staleTime: 8000,
    enabled: pollingEnabled,
  });

  const runCycle = useMutation({
    mutationFn: (params: {
      title: string;
      changes: MutationChange[];
      targets: SubstrateModuleName[];
      healthBefore?: number;
    }) =>
      evolutionModule.runEvolutionCycle(
        params.title,
        params.changes,
        params.targets,
        params.healthBefore
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'evolution'] });
    },
  });

  const rollback = useMutation({
    mutationFn: (params: { cycleId: string; reason: string }) =>
      evolutionModule.rollbackEvolution(params.cycleId, params.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'evolution'] });
    },
  });

  return {
    state,
    health,
    resilience,
    recentCycles,
    activeCycle,
    runCycle,
    rollback,
  };
}
