/**
 * useNodeDreaming — React hook for node-level dream operations
 * Provides dream configs, logs, analytics, and manual dream triggers.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  fetchDreamConfigs,
  fetchDreamLogs,
  getDreamAnalyticsSummary,
  triggerNodeDream,
  type DreamCycleType,
} from '@/lib/substrate/node-dreaming';

export function useNodeDreaming(nodeId?: string) {
  const pollingEnabled = debugMode.allowModulePolling();
  const queryClient = useQueryClient();

  const configs = useQuery({
    queryKey: ['substrate', 'dreaming', 'configs'],
    queryFn: fetchDreamConfigs,
    staleTime: 60000,
    enabled: pollingEnabled,
  });

  const logs = useQuery({
    queryKey: ['substrate', 'dreaming', 'logs', nodeId],
    queryFn: () => fetchDreamLogs(nodeId, 20),
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const analytics = useQuery({
    queryKey: ['substrate', 'dreaming', 'analytics'],
    queryFn: getDreamAnalyticsSummary,
    staleTime: 60000,
    enabled: pollingEnabled,
  });

  const triggerDream = useMutation({
    mutationFn: ({ nodeId, cycleType }: { nodeId: string; cycleType?: DreamCycleType }) =>
      triggerNodeDream(nodeId, cycleType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'dreaming'] });
    },
  });

  return {
    configs,
    logs,
    analytics,
    triggerDream,
  };
}

export default useNodeDreaming;
