/**
 * useCore Hook
 * v7.0.0 — Dedicated hook for CORE (Kernel) module operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';

// Access core module from substrate singleton
const core = substrate.core;

export interface UseCoreReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  pulse: ReturnType<typeof useQuery>;
  
  // Actions
  boot: ReturnType<typeof useMutation>;
  schedule: ReturnType<typeof useMutation>;
  process: ReturnType<typeof useMutation>;
  shutdown: ReturnType<typeof useMutation>;
  config: ReturnType<typeof useMutation>;
  
  // Query helpers
  jobs: (status?: string, limit?: number) => ReturnType<typeof useQuery>;
}

export function useCore(): UseCoreReturn {
  const queryClient = useQueryClient();
  
  const status = useQuery({
    queryKey: ['substrate', 'core', 'status'],
    queryFn: () => core.status(),
    refetchInterval: 30000,
    staleTime: 10000,
  });
  
  const pulse = useQuery({
    queryKey: ['substrate', 'core', 'pulse'],
    queryFn: () => core.pulse(),
    refetchInterval: 10000,
    staleTime: 5000,
  });
  
  const boot = useMutation({
    mutationFn: () => core.boot(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'core'] });
      queryClient.invalidateQueries({ queryKey: ['substrate'] });
    },
  });
  
  const schedule = useMutation({
    mutationFn: (options: {
      module: string;
      action: string;
      payload?: Record<string, unknown>;
      delay?: string;
      priority?: number;
    }) => core.schedule(options as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'core', 'jobs'] });
    },
  });
  
  const process = useMutation({
    mutationFn: () => core.process(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'core', 'jobs'] });
    },
  });
  
  const shutdown = useMutation({
    mutationFn: () => core.shutdown(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate'] });
    },
  });
  
  const config = useMutation({
    mutationFn: (params: { key?: string; value?: unknown }) => core.config(params.key, params.value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'core', 'config'] });
    },
  });
  
  const jobs = (jobStatus?: string, limit?: number) => useQuery({
    queryKey: ['substrate', 'core', 'jobs', jobStatus, limit],
    queryFn: () => core.jobs(jobStatus as any, limit),
    staleTime: 15000,
  });
  
  return {
    status,
    pulse,
    boot,
    schedule,
    process,
    shutdown,
    config,
    jobs,
  };
}

export default useCore;
