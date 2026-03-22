/**
 * useTSAC Hook — React interface for TSAC verification engine
 * Provides queries for stats + history, and mutations for verification runs.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  getTSACStats,
  getTSACHistory,
  fullVerify,
  generateCriteria,
  type TSACVerification,
  type TSACExecutorStats,
  type TSACHistoryRecord,
  type AcceptanceCriterion,
} from '@/lib/substrate/tsac-engine';

export interface UseTSACReturn {
  stats: TSACExecutorStats[];
  statsLoading: boolean;
  history: TSACHistoryRecord[];
  historyLoading: boolean;

  verify: ReturnType<typeof useMutation>;
  genCriteria: ReturnType<typeof useMutation>;

  refetch: () => void;
}

export function useTSAC(executorFilter?: string): UseTSACReturn {
  const pollingEnabled = debugMode.allowModulePolling();

  const statsQuery = useQuery({
    queryKey: ['tsac', 'stats'],
    queryFn: getTSACStats,
    staleTime: 30_000,
    enabled: pollingEnabled,
  });

  const historyQuery = useQuery({
    queryKey: ['tsac', 'history', executorFilter ?? 'all'],
    queryFn: () => getTSACHistory(executorFilter),
    staleTime: 15_000,
    enabled: pollingEnabled,
  });

  const verify = useMutation({
    mutationFn: (params: Parameters<typeof fullVerify>[0]) => fullVerify(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tsac'] });
    },
  });

  const genCriteria = useMutation({
    mutationFn: (params: { taskDescription: string; context?: string }) =>
      generateCriteria(params.taskDescription, params.context),
  });

  const refetch = () => {
    qc.invalidateQueries({ queryKey: ['tsac'] });
  };

  return {
    stats: statsQuery.data ?? [],
    statsLoading: statsQuery.isLoading,
    history: historyQuery.data ?? [],
    historyLoading: historyQuery.isLoading,
    verify,
    genCriteria,
    refetch,
  };
}

export default useTSAC;
