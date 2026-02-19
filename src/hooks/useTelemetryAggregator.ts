/**
 * Hook for unified telemetry aggregation
 * Feeds dashboard with aggregated data from ai_usage_log, access_usage, brain_events
 */

import { useQuery } from '@tanstack/react-query';
import { aggregateTelemetry, type TelemetrySnapshot } from '@/lib/substrate/telemetry-aggregator';

export function useTelemetryAggregator(enabled = true) {
  return useQuery<TelemetrySnapshot>({
    queryKey: ['substrate-telemetry-aggregate'],
    queryFn: aggregateTelemetry,
    enabled,
    refetchInterval: 60_000, // Refresh every 60s
    staleTime: 30_000,
    retry: 1,
  });
}
