/**
 * useAudit Hook — AUDIT node operations
 * Tamper-evident audit chain, logging, and verification
 * Respects debug mode kill-switch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

const audit = substrate.audit;

export interface UseAuditReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  
  // Actions
  log: ReturnType<typeof useMutation>;
  record: ReturnType<typeof useMutation>;
  verify: ReturnType<typeof useMutation>;
}

export function useAudit(): UseAuditReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  
  const invalidateAudit = () => {
    queryClient.invalidateQueries({ queryKey: ['substrate', 'audit'] });
  };
  
  const status = useQuery({
    queryKey: ['substrate', 'audit', 'status'],
    queryFn: () => audit.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const log = useMutation({
    mutationFn: (limit?: number) => audit.log(limit),
  });
  
  const record = useMutation({
    mutationFn: (params: { module: string; action: string; resource: string; resourceId: string }) =>
      audit.record(params.module, params.action, params.resource, params.resourceId),
    onSuccess: invalidateAudit,
  });
  
  const verify = useMutation({
    mutationFn: () => audit.verify(),
  });
  
  return {
    status,
    log,
    record,
    verify,
  };
}

export default useAudit;
