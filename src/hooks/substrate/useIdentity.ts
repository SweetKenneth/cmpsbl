/**
 * useIdentity Hook — IDENTITY module operations
 * v9.0.0 ARCHITECT Epoch
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as identityModule from '@/lib/substrate/identity-module';

export interface UseIdentityReturn {
  state: ReturnType<typeof useQuery>;
  register: ReturnType<typeof useMutation>;
  sign: ReturnType<typeof useMutation>;
}

export function useIdentity(): UseIdentityReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: ['substrate', 'identity', 'state'],
    queryFn: () => identityModule.getIdentityState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const register = useMutation({
    mutationFn: (params: { id: string; type: identityModule.ActorType; displayName: string }) =>
      Promise.resolve(identityModule.registerActor(params.id, params.type, params.displayName)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'identity'] }),
  });

  const sign = useMutation({
    mutationFn: (params: { actorId: string; action: string }) =>
      Promise.resolve(identityModule.signAction(params.actorId, params.action)),
  });

  return { state, register, sign };
}
