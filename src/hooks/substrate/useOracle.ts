/**
 * useOracle Hook — ORACLE module operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as oracleModule from '@/lib/substrate/oracle';

export interface UseOracleReturn {
  state: ReturnType<typeof useQuery>;
  predict: ReturnType<typeof useMutation>;
  simulate: ReturnType<typeof useMutation>;
}

export function useOracle(): UseOracleReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: ['substrate', 'oracle', 'state'],
    queryFn: () => oracleModule.getOracleState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const predict = useMutation({
    mutationFn: (params: { target: string; features: Record<string, number>; method?: oracleModule.Prediction['method'] }) =>
      Promise.resolve(oracleModule.predict(params.target, params.features, params.method)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'oracle'] }),
  });

  const simulate = useMutation({
    mutationFn: (params: { name: string; samplerFn: () => number; iterations?: number }) =>
      Promise.resolve(oracleModule.runMonteCarlo(params.name, params.samplerFn, params.iterations)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'oracle'] }),
  });

  return { state, predict, simulate };
}
