/**
 * useInclusive Hook — INCLUSIVE (Human Compatibility) module operations
 * Hardened: debugMode polling guards, Rules-of-Hooks compliant
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

const inclusive = substrate.inclusive;

export interface UseInclusiveReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  coverage: ReturnType<typeof useQuery>;

  // Actions (all mutations — no hook violations)
  fetchRegressions: ReturnType<typeof useMutation>;
  scan: ReturnType<typeof useMutation>;
  repair: ReturnType<typeof useMutation>;
  validate: ReturnType<typeof useMutation>;
  selfScan: ReturnType<typeof useMutation>;
  report: ReturnType<typeof useMutation>;
}

export function useInclusive(): UseInclusiveReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const status = useQuery({
    queryKey: ['substrate', 'inclusive', 'status'],
    queryFn: () => inclusive.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const coverage = useQuery({
    queryKey: ['substrate', 'inclusive', 'coverage'],
    queryFn: () => inclusive.coverage(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  // Fixed: was returning useQuery from function (hook violation)
  const fetchRegressions = useMutation({
    mutationFn: (hours?: number) => inclusive.regressions(hours ?? 24),
  });

  const scan = useMutation({
    mutationFn: (params: { target: string; autoRepair?: boolean }) => {
      if (params.autoRepair) {
        return inclusive.scanAndRepair(params.target);
      }
      return inclusive.scan(params.target);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'inclusive'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'vision', 'health'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'evolution', 'status'] });
    },
  });

  const repair = useMutation({
    mutationFn: (target: string) => inclusive.repair(target),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'inclusive'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'evolution'] });
    },
  });

  const validate = useMutation({
    mutationFn: (target: string) => inclusive.validate(target),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'inclusive'] });
    },
  });

  const selfScan = useMutation({
    mutationFn: (params?: { autoRepair?: boolean }) => {
      if (params?.autoRepair) {
        return inclusive.selfScanAndRepair();
      }
      return inclusive.selfScan();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'inclusive'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'system', 'audit'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'vision', 'health'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'evolution', 'status'] });
    },
  });

  const report = useMutation({
    mutationFn: (params: { target: string; format?: 'json' | 'markdown' }) =>
      inclusive.report(params.target, params.format),
  });

  return {
    status,
    coverage,
    fetchRegressions,
    scan,
    repair,
    validate,
    selfScan,
    report,
  };
}

export default useInclusive;
