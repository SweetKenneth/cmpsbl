/**
 * useSEBA Hook
 * v7.0.0 — Dedicated hook for SEBA (Self-Evolving Bounded Agent) operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';

// Access seba module from substrate singleton
const seba = substrate.seba;

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
  
  // History
  history: (limit?: number) => ReturnType<typeof useQuery>;
}

export function useSEBAHook(): UseSEBAHookReturn {
  const queryClient = useQueryClient();
  
  const invalidateSEBA = () => {
    queryClient.invalidateQueries({ queryKey: ['substrate', 'seba'] });
  };
  
  const status = useQuery({
    queryKey: ['substrate', 'seba', 'status'],
    queryFn: () => seba.status(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const mode = useMutation({
    mutationFn: (newMode?: 'off' | 'observe' | 'advisory' | 'governed' | 'autonomous') => 
      seba.mode(newMode),
    onSuccess: invalidateSEBA,
  });
  
  const enable = useMutation({
    mutationFn: () => seba.enable(),
    onSuccess: invalidateSEBA,
  });
  
  const disable = useMutation({
    mutationFn: () => seba.disable(),
    onSuccess: invalidateSEBA,
  });
  
  const cycle = useMutation({
    mutationFn: () => seba.cycle(),
    onSuccess: invalidateSEBA,
  });
  
  const propose = useMutation({
    mutationFn: () => seba.propose(),
    onSuccess: invalidateSEBA,
  });
  
  const review = useMutation({
    mutationFn: () => seba.review(),
  });
  
  const approve = useMutation({
    mutationFn: (proposalId: string) => seba.approve(proposalId),
    onSuccess: invalidateSEBA,
  });
  
  const reject = useMutation({
    mutationFn: (proposalId: string) => seba.reject(proposalId),
    onSuccess: invalidateSEBA,
  });
  
  const execute = useMutation({
    mutationFn: (proposalId: string) => seba.execute(proposalId),
    onSuccess: invalidateSEBA,
  });
  
  const rollback = useMutation({
    mutationFn: (executionId: string) => seba.rollback(executionId),
    onSuccess: invalidateSEBA,
  });
  
  const config = useMutation({
    mutationFn: (updates?: Record<string, unknown>) => seba.config(updates),
    onSuccess: invalidateSEBA,
  });
  
  const thresholds = useMutation({
    mutationFn: (updates?: { auto_approve?: number; risk_tolerance?: string }) => 
      seba.thresholds(updates),
    onSuccess: invalidateSEBA,
  });
  
  const history = (limit = 20) => useQuery({
    queryKey: ['substrate', 'seba', 'history', limit],
    queryFn: () => seba.history(limit),
    staleTime: 30000,
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
