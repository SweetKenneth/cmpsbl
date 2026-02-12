/**
 * useEconomy Hook — ECONOMY module operations
 * v9.0.0 ARCHITECT Epoch
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as economyModule from '@/lib/substrate/economy-module';

export interface UseEconomyReturn {
  state: ReturnType<typeof useQuery>;
  recordCost: ReturnType<typeof useMutation>;
  setBudget: ReturnType<typeof useMutation>;
}

export function useEconomy(): UseEconomyReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: ['substrate', 'economy', 'state'],
    queryFn: () => economyModule.getEconomyState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const recordCost = useMutation({
    mutationFn: (params: { module: string; action: string; tokenCount: number; computeMs: number; costMillicents: number }) =>
      Promise.resolve(economyModule.recordCost(params.module, params.action, params.tokenCount, params.computeMs, params.costMillicents)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'economy'] }),
  });

  const setBudget = useMutation({
    mutationFn: (params: { module: string; dailyLimitMillicents: number }) => {
      economyModule.setBudget(params.module, params.dailyLimitMillicents);
      return Promise.resolve();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'economy'] }),
  });

  return { state, recordCost, setBudget };
}
