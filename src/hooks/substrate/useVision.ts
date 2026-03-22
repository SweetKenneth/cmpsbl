/**
 * useVision Hook — VISION module operations
 * Full capability surface: metrics, anomaly detection, watchdog,
 * SLA monitoring, predictive alerts, alert management, tracing.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';
import type { SubstrateModule } from '@/lib/substrate';
import {
  analyzeWindow,
  getRecentAnomalies,
  resolveAnomaly,
  getAnomalyCounts,
} from '@/lib/vision/anomaly';
import { runVisionWatchdog, getVisionMode } from '@/lib/vision/watchdog';
import {
  recordMetric,
  getRealtimeMetrics,
  getDashboardMetrics,
  checkMetricAlerts,
  flushMetricsToDatabase,
} from '@/lib/vision/metricAggregation';

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

  // Anomaly detection
  anomalyCounts: ReturnType<typeof useQuery>;
  visionMode: ReturnType<typeof useQuery>;

  // Actions (mutations)
  fetchLogs: ReturnType<typeof useMutation>;
  fetchAudit: ReturnType<typeof useMutation>;
  alert: ReturnType<typeof useMutation>;
  trace: ReturnType<typeof useMutation>;

  // Anomaly management
  fetchAnomalies: ReturnType<typeof useMutation>;
  analyzeAnomalies: ReturnType<typeof useMutation>;
  resolveAnomaly: ReturnType<typeof useMutation>;

  // Watchdog
  runWatchdog: ReturnType<typeof useMutation>;

  // Metrics management
  recordMetric: ReturnType<typeof useMutation>;
  checkAlerts: ReturnType<typeof useMutation>;
  flushMetrics: ReturnType<typeof useMutation>;
}

export function useVision(): UseVisionReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidateVision = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'vision'] });

  // ── Existing Queries (preserved) ──
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

  const resilienceQuery = useQuery({
    queryKey: ['substrate', 'vision', 'resilience'],
    queryFn: () => vision.resilience(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const analyticsQuery = useQuery({
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

  // ── New: Anomaly & Watchdog Queries ──
  const anomalyCounts = useQuery({
    queryKey: ['substrate', 'vision', 'anomaly_counts'],
    queryFn: () => getAnomalyCounts(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const visionMode = useQuery({
    queryKey: ['substrate', 'vision', 'mode'],
    queryFn: () => getVisionMode(),
    staleTime: 120000,
    enabled: pollingEnabled,
  });

  // ── Existing Mutations ──
  const fetchLogs = useMutation({
    mutationFn: (params?: { module?: SubstrateModule; limit?: number }) =>
      vision.logs(params?.module, params?.limit),
  });

  const fetchAudit = useMutation({
    mutationFn: (params?: { entity?: string; action?: string }) =>
      vision.audit(params?.entity, params?.action),
  });

  const alertMut = useMutation({
    mutationFn: (params: {
      severity: 'info' | 'warn' | 'error' | 'critical';
      message: string;
      metadata?: Record<string, unknown>;
    }) => vision.alert(params.severity, params.message, params.metadata),
    onSuccess: invalidateVision,
  });

  const traceMut = useMutation({
    mutationFn: (params: {
      traceId?: string;
      options?: { create?: boolean; module?: string; action?: string; duration_ms?: number };
    }) => vision.trace(params.traceId, params.options),
  });

  // ── New: Anomaly Management ──
  const fetchAnomalies = useMutation({
    mutationFn: (params?: { limit?: number; includeResolved?: boolean }) =>
      getRecentAnomalies(params?.limit, params?.includeResolved),
  });

  const analyzeAnomalies = useMutation({
    mutationFn: (params?: { window?: '5m' | '1h' | '24h' }) =>
      analyzeWindow(params?.window),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'vision', 'anomaly_counts'] }),
  });

  const resolveAnomalyMut = useMutation({
    mutationFn: (params: { anomalyId: string; resolutionAction: string }) =>
      resolveAnomaly(params.anomalyId, params.resolutionAction),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'vision', 'anomaly_counts'] }),
  });

  // ── New: Watchdog ──
  const runWatchdog = useMutation({
    mutationFn: () => runVisionWatchdog(),
    onSuccess: invalidateVision,
  });

  // ── New: Metrics Management ──
  const recordMetricMut = useMutation({
    mutationFn: (params: { module: SubstrateModule; metric: string; value: number; tags?: Record<string, string> }) =>
      Promise.resolve(recordMetric(params.module, params.metric, params.value, params.tags)),
  });

  const checkAlerts = useMutation({
    mutationFn: () => Promise.resolve(checkMetricAlerts()),
  });

  const flushMetrics = useMutation({
    mutationFn: () => flushMetricsToDatabase(),
    onSuccess: invalidateVision,
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
    resilience: resilienceQuery,
    analytics: analyticsQuery,
    dependencyMap,
    anomalyCounts,
    visionMode,
    fetchLogs,
    fetchAudit,
    alert: alertMut,
    trace: traceMut,
    fetchAnomalies,
    analyzeAnomalies,
    resolveAnomaly: resolveAnomalyMut,
    runWatchdog,
    recordMetric: recordMetricMut,
    checkAlerts,
    flushMetrics,
  };
}

export default useVision;
