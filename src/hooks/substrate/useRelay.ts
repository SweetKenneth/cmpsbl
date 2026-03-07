/**
 * useRelay Hook — RELAY node operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as relayModule from '@/lib/substrate/relay-module';

export interface UseRelayReturn {
  state: ReturnType<typeof useQuery>;
  dispatch: ReturnType<typeof useMutation>;
}

export function useRelay(): UseRelayReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: ['substrate', 'relay', 'state'],
    queryFn: () => relayModule.getRelayState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const dispatch = useMutation({
    mutationFn: (params: { target: string; payload: unknown; retries?: number }) =>
      relayModule.dispatch(params.target, params.payload, { retries: params.retries }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'relay'] }),
  });

  return { state, dispatch };
}
