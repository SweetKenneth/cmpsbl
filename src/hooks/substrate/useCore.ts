/**
 * useCore Hook — CORE (Kernel) module operations
 * Respects debugMode kill-switch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

const core = substrate.core;

export interface UseCoreReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  pulse: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  version: ReturnType<typeof useQuery>;
  uptime: ReturnType<typeof useQuery>;
  diagnostics: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  modules: ReturnType<typeof useQuery>;
  
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
  const pollingEnabled = debugMode.allowModulePolling();
  
  const invalidateCore = () => {
    queryClient.invalidateQueries({ queryKey: ['substrate', 'core'] });
  };
  
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
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const health = useQuery({
    queryKey: ['substrate', 'core', 'health'],
    queryFn: () => core.health(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const version = useQuery({
    queryKey: ['substrate', 'core', 'version'],
    queryFn: () => core.version(),
    staleTime: 300000, // 5 minutes — rarely changes
    enabled: pollingEnabled,
  });

  const uptime = useQuery({
    queryKey: ['substrate', 'core', 'uptime'],
    queryFn: () => core.uptime(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const diagnostics = useQuery({
    queryKey: ['substrate', 'core', 'diagnostics'],
    queryFn: () => core.diagnostics({ verbose: true }),
    staleTime: 60000,
    enabled: pollingEnabled,
  });

  const resilience = useQuery({
    queryKey: ['substrate', 'core', 'resilience'],
    queryFn: () => core.resilience(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const modules = useQuery({
    queryKey: ['substrate', 'core', 'modules'],
    queryFn: () => core.modules(),
    staleTime: 60000,
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
    onSuccess: invalidateCore,
  });
  
  const config = useMutation({
    mutationFn: (params: { key?: string; value?: unknown }) => core.config(params.key, params.value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'core', 'config'] });
    },
  });
  
  // NOTE: `jobs` returns a query config object — consumers should call useQuery(core.jobs(...))
  const jobs = (jobStatus?: string, limit?: number) => ({
    queryKey: ['substrate', 'core', 'jobs', jobStatus, limit],
    queryFn: () => core.jobs(jobStatus as any, limit),
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  return {
    status,
    pulse,
    health,
    version,
    uptime,
    diagnostics,
    resilience,
    modules,
    boot,
    schedule,
    process,
    shutdown,
    config,
    jobs,
  };
}

export default useCore;
