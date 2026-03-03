/**
 * useGateEngine — React hook for running & viewing GATE engine results
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { runGateEngine, persistGateRun, fetchRecentGateRuns, type GateRunResult } from '@/lib/gate/engine';
import { toast } from 'sonner';

export function useGateEngine() {
  const queryClient = useQueryClient();
  const [currentRun, setCurrentRun] = useState<GateRunResult | null>(null);

  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['gate-runs'],
    queryFn: () => fetchRecentGateRuns(20),
    staleTime: 30_000,
  });

  const runMutation = useMutation({
    mutationFn: async () => {
      const result = await runGateEngine();
      setCurrentRun(result);

      const id = await persistGateRun(result);
      if (id) result.id = id;

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['gate-runs'] });
      if (result.status === 'passed') {
        toast.success(`GATE passed — ${result.passedCount}/${result.totalPasses} in ${result.durationMs}ms`);
      } else {
        toast.error(`GATE failed — ${result.failedCount} pass(es) failed`);
      }
    },
    onError: (err: any) => {
      toast.error(`GATE engine error: ${err.message}`);
    },
  });

  const runGate = useCallback(() => {
    runMutation.mutate();
  }, [runMutation]);

  return {
    runGate,
    isRunning: runMutation.isPending,
    currentRun,
    history,
    historyLoading,
  };
}
