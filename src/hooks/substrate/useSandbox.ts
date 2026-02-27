/**
 * useSandbox Hook — SANDBOX module operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as sandboxModule from '@/lib/substrate/sandbox-module';

export interface UseSandboxReturn {
  state: ReturnType<typeof useQuery>;
  create: ReturnType<typeof useMutation>;
  execute: ReturnType<typeof useMutation>;
  teardown: ReturnType<typeof useMutation>;
}

export function useSandbox(): UseSandboxReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: ['substrate', 'sandbox', 'state'],
    queryFn: () => sandboxModule.getSandboxState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const create = useMutation({
    mutationFn: (params?: { ttl?: string; isolation?: 'standard' | 'strict' | 'hermetic' }) =>
      Promise.resolve(sandboxModule.createSandbox(params)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'sandbox'] }),
  });

  const execute = useMutation({
    mutationFn: (params: { sandboxId: string; code: string }) =>
      Promise.resolve(sandboxModule.execute(params.sandboxId, params.code)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'sandbox'] }),
  });

  const teardown = useMutation({
    mutationFn: (params: { sandboxId: string }) => {
      sandboxModule.teardown(params.sandboxId);
      return Promise.resolve();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'sandbox'] }),
  });

  return { state, create, execute, teardown };
}
