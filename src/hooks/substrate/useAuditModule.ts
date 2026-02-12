/**
 * useAuditModule Hook — AUDIT module operations
 * v9.0.0 ARCHITECT Epoch
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as auditModule from '@/lib/substrate/audit-module';

export interface UseAuditModuleReturn {
  state: ReturnType<typeof useQuery>;
  verify: ReturnType<typeof useMutation>;
  log: ReturnType<typeof useMutation>;
}

export function useAuditModule(): UseAuditModuleReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: ['substrate', 'audit', 'state'],
    queryFn: () => auditModule.getAuditState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const verify = useMutation({
    mutationFn: () => Promise.resolve(auditModule.verifyAuditChain()),
  });

  const log = useMutation({
    mutationFn: (params: { actor: { id: string; type: 'human' | 'agent' | 'system' }; module: string; action: string; resource: string; resourceId: string }) =>
      Promise.resolve(auditModule.recordAuditEntry(params.actor, params.module, params.action, params.resource, params.resourceId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'audit'] }),
  });

  return { state, verify, log };
}
