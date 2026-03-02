/**
 * usePhantom Hook — PHANTOM module operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as phantomModule from '@/lib/substrate/phantom-module';

export interface UsePhantomReturn {
  state: ReturnType<typeof useQuery>;
  generateSynthetic: ReturnType<typeof useMutation>;
  anonymize: ReturnType<typeof useMutation>;
}

export function usePhantom(): UsePhantomReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: ['substrate', 'phantom', 'state'],
    queryFn: () => phantomModule.getPhantomState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const generateSynthetic = useMutation({
    mutationFn: (params: { name: string; columns: string[]; rowCount: number; mechanism?: phantomModule.PrivacyMechanism }) =>
      Promise.resolve(phantomModule.generateSynthetic(params.name, params.columns, params.rowCount, params.mechanism)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'phantom'] }),
  });

  const anonymize = useMutation({
    mutationFn: (params: { data: Record<string, unknown>; method?: phantomModule.AnonymizationMethod }) =>
      Promise.resolve(phantomModule.anonymize(params.data, params.method)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'phantom'] }),
  });

  return { state, generateSynthetic, anonymize };
}
