/**
 * useVision Hook — VISION module operations
 * Hardened: debugMode polling guards, Rules-of-Hooks compliant
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';
import type { SubstrateModule } from '@/lib/substrate';

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
  monitor: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  analytics: ReturnType<typeof useQuery>;
  dependencyMap: ReturnType<typeof useQuery>;

  // Actions (mutations — no hook violations)
  fetchLogs: ReturnType<typeof useMutation>;
  fetchAudit: ReturnType<typeof useMutation>;
  alert: ReturnType<typeof useMutation>;
  trace: ReturnType<typeof useMutation>;
}

export function useVision(): UseVisionReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const health = useQuery({
    queryKey: ['substrate', 'vision', 'health'],
    queryFn: () => vision.health(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const status = useQuery({
    queryKey: ['substrate', 'vision', 'status'],
    queryFn: () => vision.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const pulse = useQuery({
    queryKey: ['substrate', 'vision', 'pulse'],
    queryFn: () => vision.pulse(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const metrics = useQuery({
    queryKey: ['substrate', 'vision', 'metrics'],
    queryFn: () => vision.metrics(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const dashboard = useQuery({
    queryKey: ['substrate', 'vision', 'dashboard'],
    queryFn: () => vision.dashboard(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const healthSnapshot = useQuery({
    queryKey: ['substrate', 'vision', 'health_snapshot'],
    queryFn: () => vision.healthSnapshot(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const introspection = useQuery({
    queryKey: ['substrate', 'vision', 'introspection'],
    queryFn: () => vision.introspection(),
    staleTime: 60000,
    enabled: pollingEnabled,
  });

  const quota = useQuery({
    queryKey: ['substrate', 'vision', 'quota'],
    queryFn: () => vision.quota(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const monitor = useQuery({
    queryKey: ['substrate', 'vision', 'monitor'],
    queryFn: () => vision.monitor(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const resilience = useQuery({
    queryKey: ['substrate', 'vision', 'resilience'],
    queryFn: () => vision.resilience(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const analytics = useQuery({
    queryKey: ['substrate', 'vision', 'analytics'],
    queryFn: () => vision.analytics(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const dependencyMap = useQuery({
    queryKey: ['substrate', 'vision', 'dependency_map'],
    queryFn: () => vision.dependencyMap(),
    staleTime: 120000,
    enabled: pollingEnabled,
  });

  // ── MUTATIONS (fixed: was returning useQuery from functions) ──

  const fetchLogs = useMutation({
    mutationFn: (params?: { module?: SubstrateModule; limit?: number }) =>
      vision.logs(params?.module, params?.limit),
  });

  const fetchAudit = useMutation({
    mutationFn: (params?: { entity?: string; action?: string }) =>
      vision.audit(params?.entity, params?.action),
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

  const trace = useMutation({
    mutationFn: (params: {
      traceId?: string;
      options?: { create?: boolean; module?: string; action?: string; duration_ms?: number };
    }) => vision.trace(params.traceId, params.options),
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
    monitor,
    resilience,
    analytics,
    dependencyMap,
    fetchLogs,
    fetchAudit,
    alert,
    trace,
  };
}

export default useVision;
