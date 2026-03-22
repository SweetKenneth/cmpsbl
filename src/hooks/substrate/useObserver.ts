/**
 * useObserver Hook — OBSERVER module operations (Node 27)
 * Watchdog Monitoring, Telemetry Aggregation, Anomaly Detection, Alert Management
 * Full capability surface
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  ingestTelemetry,
  registerAlert,
  silenceAlert,
  runWatchdogSweep,
  getTelemetrySummary,
  acknowledgeEscalation,
  type TelemetrySnapshot,
  type AlertCondition,
} from '@/lib/substrate/observer-module';

export interface UseObserverReturn {
  // Queries
  watchdogReport: ReturnType<typeof useQuery>;
  telemetrySummary: ReturnType<typeof useQuery>;

  // Telemetry
  ingestTelemetry: ReturnType<typeof useMutation>;

  // Alerts
  registerAlert: ReturnType<typeof useMutation>;
  silenceAlert: ReturnType<typeof useMutation>;
  acknowledgeEscalation: ReturnType<typeof useMutation>;

  // Watchdog
  runSweep: ReturnType<typeof useMutation>;

  // Scoped summary
  getModuleSummary: ReturnType<typeof useMutation>;
}

export function useObserver(): UseObserverReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'observer'] });

  const watchdogReport = useQuery({
    queryKey: ['substrate', 'observer', 'watchdog'],
    queryFn: () => Promise.resolve(runWatchdogSweep()),
    refetchInterval: pollingEnabled ? 15000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const telemetrySummary = useQuery({
    queryKey: ['substrate', 'observer', 'summary'],
    queryFn: () => Promise.resolve(getTelemetrySummary()),
    refetchInterval: pollingEnabled ? 20000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const ingestTelemetryMut = useMutation({
    mutationFn: (snapshot: TelemetrySnapshot) =>
      Promise.resolve(ingestTelemetry(snapshot)),
    onSuccess: invalidate,
  });

  const registerAlertMut = useMutation({
    mutationFn: (condition: Omit<AlertCondition, 'triggerCount' | 'lastTriggeredAt'>) =>
      Promise.resolve(registerAlert(condition)),
    onSuccess: invalidate,
  });

  const silenceAlertMut = useMutation({
    mutationFn: (params: { alertId: string; durationMs: number }) =>
      Promise.resolve(silenceAlert(params.alertId, params.durationMs)),
    onSuccess: invalidate,
  });

  const acknowledgeEscalationMut = useMutation({
    mutationFn: (params: { alertId: string }) =>
      Promise.resolve(acknowledgeEscalation(params.alertId)),
    onSuccess: invalidate,
  });

  const runSweep = useMutation({
    mutationFn: () => Promise.resolve(runWatchdogSweep()),
    onSuccess: invalidate,
  });

  const getModuleSummaryMut = useMutation({
    mutationFn: (params: { module: string }) =>
      Promise.resolve(getTelemetrySummary(params.module)),
  });

  return {
    watchdogReport, telemetrySummary,
    ingestTelemetry: ingestTelemetryMut,
    registerAlert: registerAlertMut, silenceAlert: silenceAlertMut,
    acknowledgeEscalation: acknowledgeEscalationMut,
    runSweep, getModuleSummary: getModuleSummaryMut,
  };
}

export default useObserver;
