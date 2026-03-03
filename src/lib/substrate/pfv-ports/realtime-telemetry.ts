/**
 * PFV Port → Realtime Telemetry
 * Live log streaming via postgres_changes subscriptions
 * Benefits: VISION, NERVE
 * Source: PromptFluid-Vision hooks/useSystemTelemetry.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TelemetryLog {
  id: string;
  created_at: string;
  module: string;
  severity: string;
  message: string;
  context: Record<string, any>;
}

export interface TelemetryStatus {
  timestamp: string;
  modules: Record<string, any>;
  health: any[];
  recent_logs: TelemetryLog[];
  pending_jobs: any[];
}

/**
 * Realtime telemetry hook
 * Combines polling + realtime subscription for live system monitoring
 */
export function useRealtimeTelemetry(refreshInterval: number = 10000) {
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [status, setStatus] = useState<TelemetryStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const { data, error: fetchErr } = await supabase.functions.invoke('pf-system-status');
      if (fetchErr) throw fetchErr;
      setStatus(data);
      setLogs(data?.recent_logs || []);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Telemetry fetch failed');
      setLoading(false);
    }
  }, []);

  // Polling interval
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchStatus, refreshInterval]);

  // Realtime subscription for live log inserts
  useEffect(() => {
    const channel = supabase
      .channel('substrate-telemetry')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pf_logs' },
        (payload) => {
          const newLog = payload.new as TelemetryLog;
          setLogs(prev => [newLog, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Emit telemetry event
  const logEvent = useCallback(async (
    module: string,
    message: string,
    severity: string = 'info',
    context: Record<string, any> = {}
  ) => {
    try {
      await supabase.functions.invoke('pf-telemetry-log', {
        body: { module, message, severity, context },
      });
    } catch (err) {
      console.error('[TELEMETRY] Log emit failed:', err);
    }
  }, []);

  return { logs, status, loading, error, logEvent, refresh: fetchStatus };
}
