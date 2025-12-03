/**
 * Module Health Monitor Hook
 * Tracks health status of all PromptFluid modules
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ModuleHealth {
  module: string;
  status: 'healthy' | 'degraded' | 'down';
  response_time_ms: number;
  error_count: number;
  last_checked?: string;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  modules: ModuleHealth[];
}

export function useModuleHealth(autoCheck: boolean = true, intervalMs: number = 60000) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('pf-health-check');
      
      if (error) throw error;
      
      setHealth(data);
      setLoading(false);
    } catch (err) {
      console.error('Health check failed:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
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
