/**
 * useCore Hook — CORE (Kernel) module operations
 * Respects debugMode kill-switch
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
  
  // Query config factory — use with useQuery(core.jobs(...))
  jobs: (status?: string, limit?: number) => {
    queryKey: unknown[];
    queryFn: () => unknown;
    staleTime: number;
    enabled: boolean;
  };
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
  
  // NOTE: `jobs` returns a query config object — consumers should call useQuery(core.jobs(...))
  // rather than invoking this inside a callback (which violates Rules of Hooks).
  const jobs = (jobStatus?: string, limit?: number) => ({
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
