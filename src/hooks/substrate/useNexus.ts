/**
 * useNexus Hook
 * v7.0.0 — Dedicated hook for NEXUS module operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';

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
  
  const status = useQuery({
    queryKey: ['substrate', 'nexus', 'status'],
    queryFn: () => nexus.status(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const providers = useQuery({
    queryKey: ['substrate', 'nexus', 'providers'],
    queryFn: () => nexus.providers(),
    refetchInterval: 60000,
    staleTime: 30000,
  });
  
  const routeStats = useQuery({
    queryKey: ['substrate', 'nexus', 'route_stats'],
    queryFn: () => nexus.routeStats(),
    refetchInterval: 60000,
    staleTime: 30000,
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
