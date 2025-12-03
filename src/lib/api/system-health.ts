/**
 * PromptFluid System Health Monitor
 * Real-time system status and health checks
 */

import { supabase } from '@/integrations/supabase/client';
import { getNexusStatus } from '../nexus/core';

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  components: {
    supabase: ComponentStatus;
    nexus: ComponentStatus;
    ai_routes: ComponentStatus;
    edge_functions: ComponentStatus;
  };
  errors: string[];
  timestamp: number;
}

interface ComponentStatus {
  status: 'ok' | 'warning' | 'error';
  latency?: number;
  message?: string;
}

/**
 * Perform comprehensive system health check
 */
export async function checkSystemHealth(): Promise<SystemHealth> {
  const startTime = Date.now();
  const errors: string[] = [];

  // Check Supabase connectivity
  const supabaseStatus = await checkSupabase();
  if (supabaseStatus.status === 'error') {
    errors.push('Supabase connectivity issue');
  }

  // Check Nexus Brain status
  const nexusStatus = await checkNexus();
  if (nexusStatus.status === 'error') {
    errors.push('Nexus Brain unavailable');
  }

  // Check AI routing
  const aiRoutesStatus = await checkAIRoutes();
  if (aiRoutesStatus.status === 'error') {
    errors.push('AI routing failures detected');
  }

  // Check Edge Functions
  const edgeFunctionsStatus = await checkEdgeFunctions();
  if (edgeFunctionsStatus.status === 'error') {
    errors.push('Edge function issues detected');
  }

  // Calculate overall status
  const allStatuses = [
    supabaseStatus.status,
    nexusStatus.status,
    aiRoutesStatus.status,
    edgeFunctionsStatus.status,
  ];

  let overallStatus: 'healthy' | 'degraded' | 'down';
  if (allStatuses.includes('error')) {
    overallStatus = allStatuses.filter(s => s === 'error').length > 2 ? 'down' : 'degraded';
  } else if (allStatuses.includes('warning')) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'healthy';
  }

  return {
    status: overallStatus,
    uptime: calculateUptime(),
    components: {
      supabase: supabaseStatus,
      nexus: nexusStatus,
      ai_routes: aiRoutesStatus,
      edge_functions: edgeFunctionsStatus,
    },
    errors,
    timestamp: Date.now(),
  };
}

async function checkSupabase(): Promise<ComponentStatus> {
  try {
    const start = Date.now();
    const { error } = await supabase.from('brain_memory_hot').select('id').limit(1);
    const latency = Date.now() - start;

    if (error) {
      return { status: 'error', latency, message: error.message };
    }

    return { status: 'ok', latency };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkNexus(): Promise<ComponentStatus> {
  try {
    const start = Date.now();
    const status = await getNexusStatus();
    const latency = Date.now() - start;

    if (!status.active) {
      return { status: 'error', latency, message: 'Nexus inactive' };
    }

    return { status: 'ok', latency };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Nexus check failed',
    };
  }
}

async function checkAIRoutes(): Promise<ComponentStatus> {
  // Placeholder - would test actual AI route availability
  return { status: 'ok', latency: 50 };
}

async function checkEdgeFunctions(): Promise<ComponentStatus> {
  // Placeholder - would ping edge functions
  return { status: 'ok', latency: 100 };
}

function calculateUptime(): number {
  // In production, track actual uptime
  // For now, return mock high uptime
  return 99.9;
}
