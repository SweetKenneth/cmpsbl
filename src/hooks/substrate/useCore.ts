/**
 * useCore Hook
 * v7.1.0 — Dedicated hook for CORE (Kernel) module operations
 * Respects debugMode — when enabled, polling is disabled
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

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
  
  // Only poll if debug mode allows it
  const pollingEnabled = debugMode.allowModulePolling();
  
  const status = useQuery({
    queryKey: ['substrate', 'core', 'status'],
    queryFn: () => core.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });
  
  const pulse = useQuery({
    queryKey: ['substrate', 'core', 'pulse'],
    queryFn: () => core.pulse(),
    refetchInterval: pollingEnabled ? 10000 : false,
    staleTime: 5000,
    enabled: pollingEnabled,
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
    enabled: pollingEnabled,
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
