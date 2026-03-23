/**
 * Matrix Primitive Health Monitor Hook
 * Tracks health status of all Matrix Nodes via substrate
 * Respects debugMode — when enabled, auto-check is disabled
 */

import { useState, useEffect } from 'react';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

interface ModuleHealth {
  module: string;
  status: 'healthy' | 'degraded' | 'down';
  response_time_ms?: number;
  error_count?: number;
  health_score: number;
  last_checked?: string;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  modules: ModuleHealth[];
  overall_health: number;
}

export function useModuleHealth(autoCheck: boolean = true, intervalMs: number = 60000) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    // Skip if debug mode disables module polling
    if (!debugMode.allowModulePolling()) {
      setLoading(false);
      return;
    }
    
    try {
      // Use system.health from substrate instead of deprecated pf-health-check
      const response = await substrate.invoke({ module: 'system', action: 'health' });
      
      if (!response.success) {
        throw new Error('Health check failed');
      }
      
      const data = response.data as {
        overall_health?: number;
        overall_status?: string;
        diagnostics?: Array<{ module: string; status: string; health_score: number }>;
      };
      
      const modules: ModuleHealth[] = (data?.diagnostics || []).map((d) => ({
        module: d.module,
        status: (d.status as 'healthy' | 'degraded' | 'down') || 'healthy',
        health_score: d.health_score || 100,
        last_checked: new Date().toISOString(),
      }));
      
      setHealth({
        status: (data?.overall_status as 'healthy' | 'degraded' | 'down') || 'healthy',
        timestamp: new Date().toISOString(),
        modules,
        overall_health: data?.overall_health || 100,
      });
      setLoading(false);
    } catch (err) {
      console.error('Health check failed:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Skip if debug mode disables module polling
    if (!debugMode.allowModulePolling()) {
      setLoading(false);
      return;
    }
    
    if (autoCheck) {
      checkHealth();
      const interval = setInterval(checkHealth, intervalMs);
      return () => clearInterval(interval);
    }
  }, [autoCheck, intervalMs]);

  return {
    health,
    loading,
    checkHealth
  };
}
