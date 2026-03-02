/**
 * useSovereign Hook — SOVEREIGN module operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as sovereignModule from '@/lib/substrate/sovereign-module';

export interface UseSovereignReturn {
  state: ReturnType<typeof useQuery>;
  checkCompliance: ReturnType<typeof useMutation>;
  recordConsent: ReturnType<typeof useMutation>;
  classifyData: ReturnType<typeof useMutation>;
}

export function useSovereign(): UseSovereignReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: ['substrate', 'sovereign', 'state'],
    queryFn: () => sovereignModule.getSovereignState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const checkCompliance = useMutation({
    mutationFn: (params: { framework: sovereignModule.ComplianceFramework; jurisdiction: sovereignModule.Jurisdiction }) =>
      Promise.resolve(sovereignModule.checkCompliance(params.framework, params.jurisdiction)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'sovereign'] }),
  });

  const recordConsent = useMutation({
    mutationFn: (params: { subjectId: string; purpose: string; status: sovereignModule.ConsentStatus; framework: sovereignModule.ComplianceFramework }) =>
      Promise.resolve(sovereignModule.recordConsent(params.subjectId, params.purpose, params.status, params.framework)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'sovereign'] }),
  });

  const classifyData = useMutation({
    mutationFn: (params: { dataType: string; content?: string }) =>
      Promise.resolve(sovereignModule.classifyData(params.dataType, params.content)),
  });

  return { state, checkCompliance, recordConsent, classifyData };
}
