/**
 * useModernizer Hook — EVOLUTION mesh proxy
 * 
 * Respects debug mode kill-switch and shadow-to-production execution pipeline.
 * Part of the layered cognitive architecture.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

// Access evolution module from substrate singleton
const evolution = substrate.evolution;

export interface UseModernizerReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  pulse: ReturnType<typeof useQuery>;
  quota: ReturnType<typeof useQuery>;
  evolutionStatus: ReturnType<typeof useQuery>;
  
  // Queries
  jobs: (limit?: number) => ReturnType<typeof useQuery>;
  job: (jobId: string) => ReturnType<typeof useQuery>;
  applied: ReturnType<typeof useQuery>;
  archived: ReturnType<typeof useQuery>;
  
  // Actions
  scan: ReturnType<typeof useMutation>;
  analyze: ReturnType<typeof useMutation>;
  evolve: ReturnType<typeof useMutation>;
  export: ReturnType<typeof useMutation>;
  
  // Plan Management
  propose: ReturnType<typeof useMutation>;
  review: ReturnType<typeof useMutation>;
  validate: ReturnType<typeof useMutation>;
  diff: ReturnType<typeof useMutation>;
  apply: ReturnType<typeof useMutation>;
  applyShadow: ReturnType<typeof useMutation>;
  applyProduction: ReturnType<typeof useMutation>;
  rollback: ReturnType<typeof useMutation>;
  deletePlan: ReturnType<typeof useMutation>;
  
  // Archived Functions
  implement: ReturnType<typeof useMutation>;
}

export function useModernizer(): UseModernizerReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  
  const invalidateEvolution = () => {
    queryClient.invalidateQueries({ queryKey: ['substrate', 'evolution'] });
  };
  
  const status = useQuery({
    queryKey: ['substrate', 'evolution', 'status'],
    queryFn: () => evolution.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const pulse = useQuery({
    queryKey: ['substrate', 'evolution', 'pulse'],
    queryFn: () => evolution.pulse(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const quota = useQuery({
    queryKey: ['substrate', 'evolution', 'quota'],
    queryFn: () => evolution.quota(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });
  
  const evolutionStatus = useQuery({
    queryKey: ['substrate', 'evolution', 'evolution_status'],
    queryFn: () => evolution.evolutionStatus(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const jobs = (limit = 20) => useQuery({
    queryKey: ['substrate', 'evolution', 'jobs', limit],
    queryFn: () => evolution.jobs(limit),
    staleTime: 30000,
  });
  
  const job = (jobId: string) => useQuery({
    queryKey: ['substrate', 'evolution', 'job', jobId],
    queryFn: () => evolution.job(jobId),
    staleTime: 30000,
    enabled: !!jobId,
  });
  
  const applied = useQuery({
    queryKey: ['substrate', 'evolution', 'applied'],
    queryFn: () => evolution.applied(),
    staleTime: 60000,
  });
  
  const archived = useQuery({
    queryKey: ['substrate', 'evolution', 'archived'],
    queryFn: () => evolution.archived(),
    staleTime: 120000,
  });
  
  const scan = useMutation({
    mutationFn: (options?: { module?: string; depth?: 'quick' | 'standard' | 'deep' }) => 
      evolution.scan(options),
    onSuccess: invalidateEvolution,
  });
  
  const analyze = useMutation({
    mutationFn: (module?: string) => evolution.analyze(module),
  });
  
  const evolve = useMutation({
    mutationFn: (options?: {
      depth?: 'quick' | 'standard' | 'deep';
      confirm_override?: boolean;
      target?: 'scan' | 'shadow' | 'production' | 'verify' | 'abort' | 'status';
    }) => evolution.evolve(options),
    onSuccess: invalidateEvolution,
  });
  
  const exportJob = useMutation({
    mutationFn: (jobId: string) => evolution.export(jobId),
  });
  
  const propose = useMutation({
    mutationFn: (options?: { scope?: string; notes?: string; max_changes?: number }) => 
      evolution.propose(options),
    onSuccess: invalidateEvolution,
  });
  
  const review = useMutation({
    mutationFn: (planId: string) => evolution.review(planId),
  });
  
  const validate = useMutation({
    mutationFn: (planId: string) => evolution.validate(planId),
  });
  
  const diff = useMutation({
    mutationFn: (planId: string) => evolution.diff(planId),
  });
  
  const apply = useMutation({
    mutationFn: (planId: string) => evolution.apply(planId),
    onSuccess: invalidateEvolution,
  });
  
  const applyShadow = useMutation({
    mutationFn: (planId: string) => evolution.applyShadow(planId),
    onSuccess: invalidateEvolution,
  });
  
  const applyProduction = useMutation({
    mutationFn: (planId: string) => evolution.applyProduction(planId),
    onSuccess: invalidateEvolution,
  });
  
  const rollback = useMutation({
    mutationFn: (planId: string) => evolution.rollback(planId),
    onSuccess: invalidateEvolution,
  });
  
  const deletePlan = useMutation({
    mutationFn: (params: { planId: string; reason?: string }) => 
      evolution.delete(params.planId, params.reason),
    onSuccess: invalidateEvolution,
  });
  
  const implement = useMutation({
    mutationFn: (params: { archivedFunction: string; targetAction: string }) => 
      evolution.implement(params.archivedFunction, params.targetAction),
    onSuccess: invalidateEvolution,
  });
  
  return {
    status,
    pulse,
    quota,
    evolutionStatus,
    jobs,
    job,
    applied,
    archived,
    scan,
    analyze,
    evolve,
    export: exportJob,
    propose,
    review,
    validate,
    diff,
    apply,
    applyShadow,
    applyProduction,
    rollback,
    deletePlan,
    implement,
  };
}

export default useModernizer;
