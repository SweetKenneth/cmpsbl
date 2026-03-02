/**
 * useTreaty Hook — TREATY module operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as treatyModule from '@/lib/substrate/treaty-module';

export interface UseTreatyReturn {
  state: ReturnType<typeof useQuery>;
  createContract: ReturnType<typeof useMutation>;
  evaluateSLA: ReturnType<typeof useMutation>;
  activateContract: ReturnType<typeof useMutation>;
}

export function useTreaty(): UseTreatyReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: ['substrate', 'treaty', 'state'],
    queryFn: () => treatyModule.getTreatyState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const createContract = useMutation({
    mutationFn: (params: { name: string; parties: string[]; terms: any[]; slas: any[]; durationDays?: number }) =>
      Promise.resolve(treatyModule.createContract(params.name, params.parties, params.terms, params.slas, params.durationDays)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'treaty'] }),
  });

  const evaluateSLA = useMutation({
    mutationFn: (params: { contractId: string; metrics: Partial<Record<treatyModule.SLAMetric, number>> }) =>
      Promise.resolve(treatyModule.evaluateSLA(params.contractId, params.metrics)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'treaty'] }),
  });

  const activateContract = useMutation({
    mutationFn: (params: { contractId: string }) =>
      Promise.resolve(treatyModule.activateContract(params.contractId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'treaty'] }),
  });

  return { state, createContract, evaluateSLA, activateContract };
}
