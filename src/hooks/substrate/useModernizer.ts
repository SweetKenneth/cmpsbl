/**
 * useModernizer Hook — MODERNIZER → EVOLUTION mesh proxy
 * 
 * Respects debug mode kill-switch and shadow-to-production execution pipeline.
 * Part of the layered cognitive architecture.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

// Access evolution module from substrate singleton (formerly modernizer)
const modernizer = substrate.evolution;

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
  
  const invalidateModernizer = () => {
    queryClient.invalidateQueries({ queryKey: ['substrate', 'modernizer'] });
  };
  
  const status = useQuery({
    queryKey: ['substrate', 'modernizer', 'status'],
    queryFn: () => modernizer.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const pulse = useQuery({
    queryKey: ['substrate', 'modernizer', 'pulse'],
    queryFn: () => modernizer.pulse(),
    refetchInterval: pollingEnabled ? 10000 : false,
    staleTime: 5000,
    enabled: pollingEnabled,
  });
  
  const quota = useQuery({
    queryKey: ['substrate', 'modernizer', 'quota'],
    queryFn: () => modernizer.quota(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });
  
  const evolutionStatus = useQuery({
    queryKey: ['substrate', 'modernizer', 'evolution_status'],
    queryFn: () => modernizer.evolutionStatus(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const jobs = (limit = 20) => useQuery({
    queryKey: ['substrate', 'modernizer', 'jobs', limit],
    queryFn: () => modernizer.jobs(limit),
    staleTime: 30000,
  });
  
  const job = (jobId: string) => useQuery({
    queryKey: ['substrate', 'modernizer', 'job', jobId],
    queryFn: () => modernizer.job(jobId),
    staleTime: 30000,
    enabled: !!jobId,
  });
  
  const applied = useQuery({
    queryKey: ['substrate', 'modernizer', 'applied'],
    queryFn: () => modernizer.applied(),
    staleTime: 60000,
  });
  
  const archived = useQuery({
    queryKey: ['substrate', 'modernizer', 'archived'],
    queryFn: () => modernizer.archived(),
    staleTime: 120000,
  });
  
  const scan = useMutation({
    mutationFn: (options?: { module?: string; depth?: 'quick' | 'standard' | 'deep' }) => 
      modernizer.scan(options),
    onSuccess: invalidateModernizer,
  });
  
  const analyze = useMutation({
    mutationFn: (module?: string) => modernizer.analyze(module),
  });
  
  const evolve = useMutation({
    mutationFn: (options?: {
      depth?: 'quick' | 'standard' | 'deep';
      confirm_override?: boolean;
      target?: 'scan' | 'shadow' | 'production' | 'verify' | 'abort' | 'status';
    }) => modernizer.evolve(options),
    onSuccess: invalidateModernizer,
  });
  
  const exportJob = useMutation({
    mutationFn: (jobId: string) => modernizer.export(jobId),
  });
  
  const propose = useMutation({
    mutationFn: (options?: { scope?: string; notes?: string; max_changes?: number }) => 
      modernizer.propose(options),
    onSuccess: invalidateModernizer,
  });
  
  const review = useMutation({
    mutationFn: (planId: string) => modernizer.review(planId),
  });
  
  const validate = useMutation({
    mutationFn: (planId: string) => modernizer.validate(planId),
  });
  
  const diff = useMutation({
    mutationFn: (planId: string) => modernizer.diff(planId),
  });
  
  const apply = useMutation({
    mutationFn: (planId: string) => modernizer.apply(planId),
    onSuccess: invalidateModernizer,
  });
  
  const applyShadow = useMutation({
    mutationFn: (planId: string) => modernizer.applyShadow(planId),
    onSuccess: invalidateModernizer,
  });
  
  const applyProduction = useMutation({
    mutationFn: (planId: string) => modernizer.applyProduction(planId),
    onSuccess: invalidateModernizer,
  });
  
  const rollback = useMutation({
    mutationFn: (planId: string) => modernizer.rollback(planId),
    onSuccess: invalidateModernizer,
  });
  
  const deletePlan = useMutation({
    mutationFn: (params: { planId: string; reason?: string }) => 
      modernizer.delete(params.planId, params.reason),
    onSuccess: invalidateModernizer,
  });
  
  const implement = useMutation({
    mutationFn: (params: { archivedFunction: string; targetAction: string }) => 
      modernizer.implement(params.archivedFunction, params.targetAction),
    onSuccess: invalidateModernizer,
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
