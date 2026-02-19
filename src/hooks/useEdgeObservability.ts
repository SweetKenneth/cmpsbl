/**
 * Edge Observability Hook
 * Queries access_usage for edge function monitoring in OS Dashboard
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EdgeFunctionMetric {
  module: string;
  action: string;
  callCount: number;
  totalCostMillicents: number;
  avgTokens: number;
}

export function useEdgeObservability(enabled = true) {
  return useQuery({
    queryKey: ['edge-observability'],
    queryFn: async (): Promise<EdgeFunctionMetric[]> => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('access_usage')
        .select('module, action, cost_millicents, tokens_used')
        .gte('created_at', since)
        .limit(1000);

      if (error || !data) return [];

      // Aggregate by module+action
      const grouped: Record<string, EdgeFunctionMetric> = {};
      for (const row of data) {
        const key = `${row.module}:${row.action}`;
        if (!grouped[key]) {
          grouped[key] = {
            module: row.module,
            action: row.action,
            callCount: 0,
            totalCostMillicents: 0,
            avgTokens: 0,
          };
        }
        grouped[key].callCount++;
        grouped[key].totalCostMillicents += row.cost_millicents || 0;
        grouped[key].avgTokens += row.tokens_used || 0;
      }

      return Object.values(grouped).map(m => ({
        ...m,
        avgTokens: m.callCount > 0 ? Math.round(m.avgTokens / m.callCount) : 0,
      })).sort((a, b) => b.callCount - a.callCount);
    },
    enabled,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}
