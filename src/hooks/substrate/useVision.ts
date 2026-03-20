/**
 * useVision Hook — VISION module operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import type { SubstrateModule } from '@/lib/substrate';

// Access vision module from substrate singleton
const vision = substrate.vision;

export interface UseVisionReturn {
  // Status & Health
  health: ReturnType<typeof useQuery>;
  status: ReturnType<typeof useQuery>;
  pulse: ReturnType<typeof useQuery>;
  metrics: ReturnType<typeof useQuery>;
  dashboard: ReturnType<typeof useQuery>;
  healthSnapshot: ReturnType<typeof useQuery>;
  introspection: ReturnType<typeof useQuery>;
  quota: ReturnType<typeof useQuery>;
  
  // Actions
  logs: (module?: SubstrateModule, limit?: number) => ReturnType<typeof useQuery>;
  alert: ReturnType<typeof useMutation>;
  audit: (entity?: string, action?: string) => ReturnType<typeof useQuery>;
  trace: ReturnType<typeof useMutation>;
  monitor: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  analytics: ReturnType<typeof useQuery>;
  dependencyMap: ReturnType<typeof useQuery>;
}

export function useVision(): UseVisionReturn {
  const queryClient = useQueryClient();
  
  const health = useQuery({
    queryKey: ['substrate', 'vision', 'health'],
    queryFn: () => vision.health(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const status = useQuery({
    queryKey: ['substrate', 'vision', 'status'],
    queryFn: () => vision.status(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const pulse = useQuery({
    queryKey: ['substrate', 'vision', 'pulse'],
    queryFn: () => vision.pulse(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const metrics = useQuery({
    queryKey: ['substrate', 'vision', 'metrics'],
    queryFn: () => vision.metrics(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const dashboard = useQuery({
    queryKey: ['substrate', 'vision', 'dashboard'],
    queryFn: () => vision.dashboard(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const healthSnapshot = useQuery({
    queryKey: ['substrate', 'vision', 'health_snapshot'],
    queryFn: () => vision.healthSnapshot(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const introspection = useQuery({
    queryKey: ['substrate', 'vision', 'introspection'],
    queryFn: () => vision.introspection(),
    staleTime: 60000,
  });
  
  const quota = useQuery({
    queryKey: ['substrate', 'vision', 'quota'],
    queryFn: () => vision.quota(),
    refetchInterval: 60000,
    staleTime: 30000,
  });
  
  const logs = (module?: SubstrateModule, limit?: number) => useQuery({
    queryKey: ['substrate', 'vision', 'logs', module, limit],
    queryFn: () => vision.logs(module, limit),
    staleTime: 15000,
  });
  
  const alert = useMutation({
    mutationFn: (params: { 
      severity: 'info' | 'warn' | 'error' | 'critical'; 
      message: string;
      metadata?: Record<string, unknown>;
    }) => vision.alert(params.severity, params.message, params.metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'vision', 'health'] });
    },
  });
  
  const audit = (entity?: string, action?: string) => useQuery({
    queryKey: ['substrate', 'vision', 'audit', entity, action],
    queryFn: () => vision.audit(entity, action),
    staleTime: 30000,
  });
  
  const trace = useMutation({
    mutationFn: (params: { 
      traceId?: string; 
      options?: { create?: boolean; module?: string; action?: string; duration_ms?: number } 
    }) => vision.trace(params.traceId, params.options),
  });
  
  const monitor = useQuery({
    queryKey: ['substrate', 'vision', 'monitor'],
    queryFn: () => vision.monitor(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const resilience = useQuery({
    queryKey: ['substrate', 'vision', 'resilience'],
    queryFn: () => vision.resilience(),
    refetchInterval: 60000,
    staleTime: 30000,
  });
  
  const analytics = useQuery({
    queryKey: ['substrate', 'vision', 'analytics'],
    queryFn: () => vision.analytics(),
    refetchInterval: 60000,
    staleTime: 30000,
  });
  
  const dependencyMap = useQuery({
    queryKey: ['substrate', 'vision', 'dependency_map'],
    queryFn: () => vision.dependencyMap(),
    staleTime: 120000,
  });
  
  return {
    health,
    status,
    pulse,
    metrics,
    dashboard,
    healthSnapshot,
    introspection,
    quota,
    logs,
    alert,
    audit,
    trace,
    monitor,
    resilience,
    analytics,
    dependencyMap,
  };
}

export default useVision;
