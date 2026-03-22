/**
 * useCompass Hook — COMPASS module operations
 * Spatial-Temporal Reasoning, Route Optimization, Time-Series Forecasting
 * Full capability surface: distance, routing, forecasts, patterns, CLM
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  initCompass,
  calculateDistance,
  optimizeRoute,
  forecastTimeSeries,
  detectPatterns,
  getCompassState,
  getCompassHealth,
  getCompassResilience,
  getCompassHardening,
  upgradeCompassEngine,
  type GeoPoint,
} from '@/lib/substrate/compass-module';
import { runCompassCLMCycle } from '@/lib/substrate/compass/clm';

export interface UseCompassReturn {
  state: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  hardening: ReturnType<typeof useQuery>;
  init: ReturnType<typeof useMutation>;
  upgradeEngine: ReturnType<typeof useMutation>;
  runCLM: ReturnType<typeof useMutation>;
  optimizeRoute: ReturnType<typeof useMutation>;
  forecast: ReturnType<typeof useMutation>;
  detectPatterns: ReturnType<typeof useMutation>;
  calculateDistance: ReturnType<typeof useMutation>;
}

export function useCompass(): UseCompassReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'compass'] });

  const state = useQuery({
    queryKey: ['substrate', 'compass', 'state'],
    queryFn: () => Promise.resolve(getCompassState()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const health = useQuery({
    queryKey: ['substrate', 'compass', 'health'],
    queryFn: () => Promise.resolve(getCompassHealth()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const resilience = useQuery({
    queryKey: ['substrate', 'compass', 'resilience'],
    queryFn: () => Promise.resolve(getCompassResilience()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const hardeningQuery = useQuery({
    queryKey: ['substrate', 'compass', 'hardening'],
    queryFn: () => Promise.resolve(getCompassHardening()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const init = useMutation({
    mutationFn: () => Promise.resolve(initCompass()),
    onSuccess: invalidate,
  });

  const upgradeEngine = useMutation({
    mutationFn: (params: { version: string }) => Promise.resolve(upgradeCompassEngine(params.version)),
    onSuccess: invalidate,
  });

  const runCLM = useMutation({
    mutationFn: () => Promise.resolve(runCompassCLMCycle()),
  });

  const optimizeRouteMut = useMutation({
    mutationFn: (params: { waypoints: GeoPoint[] }) =>
      Promise.resolve(optimizeRoute(params.waypoints)),
    onSuccess: invalidate,
  });

  const forecastMut = useMutation({
    mutationFn: (params: { metric: string; dataPoints: { timestamp: number; value: number }[]; horizonSteps?: number }) =>
      Promise.resolve(forecastTimeSeries(params.metric, params.dataPoints, params.horizonSteps)),
    onSuccess: invalidate,
  });

  const detectPatternsMut = useMutation({
    mutationFn: (params: { dataPoints: { timestamp: number; value: number }[] }) =>
      Promise.resolve(detectPatterns(params.dataPoints)),
  });

  const calculateDistanceMut = useMutation({
    mutationFn: (params: { a: GeoPoint; b: GeoPoint }) =>
      Promise.resolve(calculateDistance(params.a, params.b)),
  });

  return {
    state, health, resilience, hardening: hardeningQuery,
    init, upgradeEngine, runCLM,
    optimizeRoute: optimizeRouteMut, forecast: forecastMut,
    detectPatterns: detectPatternsMut, calculateDistance: calculateDistanceMut,
  };
}

export default useCompass;
