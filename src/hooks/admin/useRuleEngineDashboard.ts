/**
 * Hook for the Governed Rule Engine dashboard data.
 * Aggregates from DB tables with caching.
 */

import { useQuery } from '@tanstack/react-query';
import { aggregateRuleEngineDashboard, type RuleEngineDashboard } from '@/lib/immune/rule-engine/aggregator';
import { DASHBOARD_CACHE_TTL_MS } from '@/lib/immune/rule-engine/constants';

export function useRuleEngineDashboard(enabled = true) {
  return useQuery<RuleEngineDashboard>({
    queryKey: ['rule-engine-dashboard'],
    queryFn: aggregateRuleEngineDashboard,
    enabled,
    refetchInterval: 60_000,
    staleTime: DASHBOARD_CACHE_TTL_MS,
    retry: 1,
  });
}
