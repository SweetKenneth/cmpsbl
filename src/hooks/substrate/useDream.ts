/**
 * useDream Hook
 * v7.0.0 — Dedicated hook for DREAM module operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dream } from '@/lib/substrate';

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
  
  const status = useQuery({
    queryKey: ['substrate', 'dream', 'status'],
    queryFn: () => dream.status(),
    refetchInterval: 30000,
    staleTime: 15000,
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
