/**
 * useAgencyTelemetry Hook — React hook for accessing agency telemetry data
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  getAgencyTelemetry,
  getAgentLedgers,
  getTaskArtifacts,
  getRecentApiCalls,
  type TelemetryMetrics,
  type AgentLedger,
  type TaskArtifact,
  type ApiCallLog,
} from '../telemetry/agencyTelemetry';

interface UseAgencyTelemetryOptions {
  agencyId: string;
  startDate?: string;
  endDate?: string;
  refreshInterval?: number;
}

interface UseAgencyTelemetryReturn {
  // Data
  metrics: TelemetryMetrics | null;
  agentLedgers: AgentLedger[];
  recentApiCalls: ApiCallLog[];
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Actions
  refresh: () => Promise<void>;
  
  // Derived stats
  successRate: number;
  avgLatency: number | null;
  topSkills: { skill: string; count: number }[];
}

export function useAgencyTelemetry(options: UseAgencyTelemetryOptions): UseAgencyTelemetryReturn {
  const { agencyId, startDate, endDate, refreshInterval } = options;
  
  const [metrics, setMetrics] = useState<TelemetryMetrics | null>(null);
  const [agentLedgers, setAgentLedgers] = useState<AgentLedger[]>([]);
  const [recentApiCalls, setRecentApiCalls] = useState<ApiCallLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const fetchData = useCallback(async (isRefresh = false) => {
    if (!agencyId) return;
    
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const [metricsData, ledgersData, apiCallsData] = await Promise.all([
        getAgencyTelemetry(agencyId, startDate, endDate),
        getAgentLedgers(agencyId, startDate, endDate),
        getRecentApiCalls(agencyId, 50),
      ]);
      
      setMetrics(metricsData);
      setAgentLedgers(ledgersData);
      setRecentApiCalls(apiCallsData);
    } catch (err) {
      console.error('Failed to fetch telemetry:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [agencyId, startDate, endDate]);
  
  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Auto-refresh
  useEffect(() => {
    if (!refreshInterval) return;
    
    const interval = setInterval(() => {
      fetchData(true);
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval, fetchData]);
  
  // Subscribe to realtime updates
  useEffect(() => {
    if (!agencyId) return;
    
    const channel = supabase
      .channel(`telemetry-${agencyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agency_agent_telemetry',
          filter: `agency_id=eq.${agencyId}`,
        },
        () => {
          fetchData(true);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [agencyId, fetchData]);
  
  // Calculate derived stats
  const successRate = metrics
    ? metrics.tasks_completed / Math.max(metrics.tasks_completed + metrics.tasks_failed, 1)
    : 0;
  
  const avgLatency = metrics?.avg_latency_ms ?? null;
  
  const topSkills: { skill: string; count: number }[] = metrics?.skill_usage
    ? Object.entries(metrics.skill_usage)
        .map(([skill, count]) => ({ skill, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    : [];
  
  return {
    metrics,
    agentLedgers,
    recentApiCalls,
    isLoading,
    isRefreshing,
    refresh: () => fetchData(true),
    successRate,
    avgLatency,
    topSkills,
  };
}

// ============================================================================
// TASK ARTIFACTS HOOK
// ============================================================================

interface UseTaskArtifactsOptions {
  taskId: string;
}

interface UseTaskArtifactsReturn {
  artifacts: TaskArtifact[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useTaskArtifacts(options: UseTaskArtifactsOptions): UseTaskArtifactsReturn {
  const { taskId } = options;
  
  const [artifacts, setArtifacts] = useState<TaskArtifact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchArtifacts = useCallback(async () => {
    if (!taskId) return;
    
    setIsLoading(true);
    try {
      const data = await getTaskArtifacts(taskId);
      setArtifacts(data);
    } catch (err) {
      console.error('Failed to fetch artifacts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);
  
  useEffect(() => {
    fetchArtifacts();
  }, [fetchArtifacts]);
  
  return {
    artifacts,
    isLoading,
    refresh: fetchArtifacts,
  };
}
