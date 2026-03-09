/**
 * useHarvest Hook — HARVEST module operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as harvestModule from '@/lib/substrate/harvest';

export interface UseHarvestReturn {
  state: ReturnType<typeof useQuery>;
  registerSource: ReturnType<typeof useMutation>;
  runJob: ReturnType<typeof useMutation>;
  createPipeline: ReturnType<typeof useMutation>;
}

export function useHarvest(): UseHarvestReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: ['substrate', 'harvest', 'state'],
    queryFn: () => harvestModule.getHarvestState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const registerSource = useMutation({
    mutationFn: (params: { name: string; type: harvestModule.SourceType; endpoint: string; pollIntervalMs?: number }) =>
      Promise.resolve(harvestModule.registerSource(params.name, params.type, params.endpoint, params.pollIntervalMs)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'harvest'] }),
  });

  const runJob = useMutation({
    mutationFn: (params: { sourceId: string }) =>
      Promise.resolve(harvestModule.runJob(params.sourceId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'harvest'] }),
  });

  const createPipeline = useMutation({
    mutationFn: (params: { name: string; sourceIds: string[]; transformations: string[]; destination: string }) =>
      Promise.resolve(harvestModule.createPipeline(params.name, params.sourceIds, params.transformations, params.destination)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'harvest'] }),
  });

  return { state, registerSource, runJob, createPipeline };
}
