/**
 * useDream Hook
 * v9.1.0 ARCHITECT — Dedicated hook for DREAM module operations
 * Respects debugMode — when enabled, polling is disabled
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

// Access dream module from substrate singleton
const dream = substrate.dream;

export interface UseDreamReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  
  // Actions
  cycle: ReturnType<typeof useMutation>;
  consume: ReturnType<typeof useMutation>;
  interpret: ReturnType<typeof useMutation>;
  mutate: ReturnType<typeof useMutation>;
  reflect: ReturnType<typeof useMutation>;
  mood: ReturnType<typeof useMutation>;
}

export function useDream(): UseDreamReturn {
  const queryClient = useQueryClient();
  
  // Only poll if debug mode allows it
  const pollingEnabled = debugMode.allowModulePolling();
  
  const status = useQuery({
    queryKey: ['substrate', 'dream', 'status'],
    queryFn: () => dream.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const cycle = useMutation({
    mutationFn: () => dream.cycle(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'dream'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
    },
  });
  
  const consume = useMutation({
    mutationFn: (dreamId: string) => dream.consume(dreamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'dream'] });
    },
  });
  
  const interpret = useMutation({
    mutationFn: (dreamText: string) => dream.interpret(dreamText),
  });
  
  const mutate = useMutation({
    mutationFn: () => dream.mutate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'dream'] });
    },
  });
  
  const reflect = useMutation({
    mutationFn: () => dream.reflect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'dream'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
    },
  });
  
  const mood = useMutation({
    mutationFn: (newMood?: string) => dream.mood(newMood),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'dream', 'status'] });
    },
  });
  
  return {
    status,
    cycle,
    consume,
    interpret,
    mutate,
    reflect,
    mood,
  };
}

export default useDream;
