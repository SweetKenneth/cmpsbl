/**
 * useMemoryModule Hook — MEMORY module operations
 * v10.5.4 ARCHITECT Epoch
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as memoryModule from '@/lib/substrate/memory-module';

export interface UseMemoryModuleReturn {
  state: ReturnType<typeof useQuery>;
  ingest: ReturnType<typeof useMutation>;
  search: ReturnType<typeof useMutation>;
}

export function useMemoryModule(): UseMemoryModuleReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: ['substrate', 'memory', 'state'],
    queryFn: () => memoryModule.getMemoryModuleState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const ingest = useMutation({
    mutationFn: (params: { source: string; format: string }) =>
      memoryModule.ingestKnowledge(params.source, params.format),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'memory'] }),
  });

  const search = useMutation({
    mutationFn: (params: { query: string; limit?: number }) =>
      memoryModule.semanticSearch(params.query, { limit: params.limit }),
  });

  return { state, ingest, search };
}
