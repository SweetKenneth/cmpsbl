/**
 * useSEBA Hook — SEBA (Self-Evolving Bounded Agent) operations
 * Respects debug mode kill-switch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

export interface UseSEBAHookReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  
  // Mode Management
  mode: ReturnType<typeof useMutation>;
  enable: ReturnType<typeof useMutation>;
  disable: ReturnType<typeof useMutation>;
  
  // Cycle Operations
  cycle: ReturnType<typeof useMutation>;
  propose: ReturnType<typeof useMutation>;
  review: ReturnType<typeof useMutation>;
  
  // Governance
  approve: ReturnType<typeof useMutation>;
  reject: ReturnType<typeof useMutation>;
  execute: ReturnType<typeof useMutation>;
  rollback: ReturnType<typeof useMutation>;
  
  // Configuration
  config: ReturnType<typeof useMutation>;
  thresholds: ReturnType<typeof useMutation>;
  
  // History — now a proper useQuery (not a function returning useQuery)
  history: ReturnType<typeof useQuery>;
}

export function useSEBAHook(historyLimit = 20): UseSEBAHookReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  
  const invalidateSEBA = () => {
    queryClient.invalidateQueries({ queryKey: ['substrate', 'seba'] });
  };
  
  const status = useQuery({
    queryKey: ['substrate', 'seba', 'status'],
    queryFn: () => substrate.seba.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const mode = useMutation({
    mutationFn: (newMode?: 'off' | 'observe' | 'advisory' | 'governed' | 'autonomous') => 
      substrate.seba.mode(newMode),
    onSuccess: invalidateSEBA,
  });
  
  const enable = useMutation({
    mutationFn: () => substrate.seba.enable(),
    onSuccess: invalidateSEBA,
  });
  
  const disable = useMutation({
    mutationFn: () => substrate.seba.disable(),
    onSuccess: invalidateSEBA,
  });
  
  const cycle = useMutation({
    mutationFn: () => substrate.seba.cycle(),
    onSuccess: invalidateSEBA,
  });
  
  const propose = useMutation({
    mutationFn: () => substrate.seba.propose(),
    onSuccess: invalidateSEBA,
  });
  
  const review = useMutation({
    mutationFn: () => substrate.seba.review(),
  });
  
  const approve = useMutation({
    mutationFn: (proposalId: string) => substrate.seba.approve(proposalId),
    onSuccess: invalidateSEBA,
  });
  
  const reject = useMutation({
    mutationFn: (proposalId: string) => substrate.seba.reject(proposalId),
    onSuccess: invalidateSEBA,
  });
  
  const execute = useMutation({
    mutationFn: (proposalId: string) => substrate.seba.execute(proposalId),
    onSuccess: invalidateSEBA,
  });
  
  const rollback = useMutation({
    mutationFn: (executionId: string) => substrate.seba.rollback(executionId),
    onSuccess: invalidateSEBA,
  });
  
  const config = useMutation({
    mutationFn: (updates?: Record<string, unknown>) => substrate.seba.config(updates),
    onSuccess: invalidateSEBA,
  });
  
  const thresholds = useMutation({
    mutationFn: (updates?: { auto_approve?: number; risk_tolerance?: string }) => 
      substrate.seba.thresholds(updates),
    onSuccess: invalidateSEBA,
  });
  
  // Fixed: history is now a proper useQuery at hook top-level, not a function returning useQuery
  const history = useQuery({
    queryKey: ['substrate', 'seba', 'history', historyLimit],
    queryFn: () => substrate.seba.history(historyLimit),
    staleTime: 30000,
    enabled: pollingEnabled,
  });
  
  return {
    status,
    mode,
    enable,
    disable,
    cycle,
    propose,
    review,
    approve,
    reject,
    execute,
    rollback,
    config,
    thresholds,
    history,
  };
}

export default useSEBAHook;
