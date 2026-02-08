/**
 * useNexus Hook
 * v8.0.0 SYNERGY+ — Dedicated hook for NEXUS module operations
 * Respects debugMode — when enabled, polling is disabled
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

// Access nexus module from substrate singleton
const nexus = substrate.nexus;

export interface UseNexusReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  providers: ReturnType<typeof useQuery>;
  routeStats: ReturnType<typeof useQuery>;
  
  // Actions
  text: ReturnType<typeof useMutation>;
  image: ReturnType<typeof useMutation>;
  route: ReturnType<typeof useMutation>;
}

export function useNexus(): UseNexusReturn {
  const queryClient = useQueryClient();
  
  // Only poll if debug mode allows it
  const pollingEnabled = debugMode.allowModulePolling();
  
  const status = useQuery({
    queryKey: ['substrate', 'nexus', 'status'],
    queryFn: () => nexus.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const providers = useQuery({
    queryKey: ['substrate', 'nexus', 'providers'],
    queryFn: () => nexus.providers(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });
  
  const routeStats = useQuery({
    queryKey: ['substrate', 'nexus', 'route_stats'],
    queryFn: () => nexus.routeStats(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });
  
  const text = useMutation({
    mutationFn: (params: { prompt: string; model?: string }) => 
      nexus.text(params.prompt, params.model),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'nexus', 'route_stats'] });
    },
  });
  
  const image = useMutation({
    mutationFn: (params: { prompt: string; model?: string }) => 
      nexus.image(params.prompt, params.model),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'nexus', 'route_stats'] });
    },
  });
  
  const route = useMutation({
    mutationFn: (task: string) => nexus.route(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'nexus', 'route_stats'] });
    },
  });
  
  return {
    status,
    providers,
    routeStats,
    text,
    image,
    route,
  };
}

export default useNexus;
