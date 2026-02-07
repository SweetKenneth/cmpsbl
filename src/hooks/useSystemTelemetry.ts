/**
 * System Telemetry Hook
 * Real-time system logs and metrics via Supabase Realtime
 * 
 * Respects debugMode — when enabled, polling and realtime are disabled
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { debugMode } from '@/lib/debug-mode';

interface SystemLog {
  id: string;
  created_at: string;
  module: string;
  severity: string;
  message: string;
  context: Record<string, any>;
}

interface SystemStatus {
  timestamp: string;
  modules: Record<string, any>;
  health: any[];
  recent_logs: SystemLog[];
  pending_jobs: any[];
}

export function useSystemTelemetry(refreshInterval: number = 10000) {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial status
  useEffect(() => {
    // Skip if debug mode is active
    if (!debugMode.allowPolling()) {
      setLoading(false);
      return;
    }
    
    const fetchStatus = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('pf-system-status');
        
        if (error) throw error;
        
        setStatus(data);
        setLogs(data.recent_logs || []);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch status');
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(() => {
      if (debugMode.allowPolling()) {
        fetchStatus();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Subscribe to real-time log updates (respects debug mode)
  useEffect(() => {
    // Skip if debug mode is active
    if (!debugMode.allowRealtime()) {
      return;
    }
    
    const channel = supabase
      .channel('system-logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pf_logs'
        },
        (payload) => {
          const newLog = payload.new as SystemLog;
          setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Log function for modules to use (respects debug mode)
  const logEvent = async (module: string, message: string, severity: string = 'info', context: Record<string, any> = {}) => {
    // Skip if debug mode is active
    if (!debugMode.allowTelemetry()) {
      return;
    }
    
    try {
      await supabase.functions.invoke('pf-telemetry-log', {
        body: { module, message, severity, context }
      });
    } catch (err) {
      console.error('Failed to log event:', err);
    }
  };

  return {
    logs,
    status,
    loading,
    error,
    logEvent
  };
}
