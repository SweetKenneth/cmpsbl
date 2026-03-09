/**
 * useCompass Hook — COMPASS module operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as compassModule from '@/lib/substrate/compass';

export interface UseCompassReturn {
  state: ReturnType<typeof useQuery>;
  optimizeRoute: ReturnType<typeof useMutation>;
  forecast: ReturnType<typeof useMutation>;
}

export function useCompass(): UseCompassReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const state = useQuery({
    queryKey: ['substrate', 'compass', 'state'],
    queryFn: () => compassModule.getCompassState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const optimizeRoute = useMutation({
    mutationFn: (params: { waypoints: compassModule.GeoPoint[] }) =>
      Promise.resolve(compassModule.optimizeRoute(params.waypoints)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'compass'] }),
  });

  const forecast = useMutation({
    mutationFn: (params: { metric: string; dataPoints: { timestamp: number; value: number }[]; horizonSteps?: number }) =>
      Promise.resolve(compassModule.forecastTimeSeries(params.metric, params.dataPoints, params.horizonSteps)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'compass'] }),
  });

  return { state, optimizeRoute, forecast };
}
