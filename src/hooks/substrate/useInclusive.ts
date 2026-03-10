/**
 * useInclusive Hook — INCLUSIVE (Human Compatibility) module operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';

// Access inclusive module from substrate singleton
const inclusive = substrate.inclusive;

export interface UseInclusiveReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  coverage: ReturnType<typeof useQuery>;
  
  // Queries
  regressions: (hours?: number) => ReturnType<typeof useQuery>;
  
  // Actions
  scan: ReturnType<typeof useMutation>;
  repair: ReturnType<typeof useMutation>;
  validate: ReturnType<typeof useMutation>;
  selfScan: ReturnType<typeof useMutation>;
  report: ReturnType<typeof useMutation>;
}

export function useInclusive(): UseInclusiveReturn {
  const queryClient = useQueryClient();
  
  const status = useQuery({
    queryKey: ['substrate', 'inclusive', 'status'],
    queryFn: () => inclusive.status(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const coverage = useQuery({
    queryKey: ['substrate', 'inclusive', 'coverage'],
    queryFn: () => inclusive.coverage(),
    refetchInterval: 60000,
    staleTime: 30000,
  });
  
  const regressions = (hours = 24) => useQuery({
    queryKey: ['substrate', 'inclusive', 'regressions', hours],
    queryFn: () => inclusive.regressions(hours),
    refetchInterval: 60000,
    staleTime: 30000,
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
      queryClient.invalidateQueries({ queryKey: ['substrate', 'modernizer', 'status'] });
    },
  });
  
  const report = useMutation({
    mutationFn: (params: { target: string; format?: 'json' | 'markdown' }) => 
      inclusive.report(params.target, params.format),
  });
  
  return {
    status,
    coverage,
    regressions,
    scan,
    repair,
    validate,
    selfScan,
    report,
  };
}

export default useInclusive;
