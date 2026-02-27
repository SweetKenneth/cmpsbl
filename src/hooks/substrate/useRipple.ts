/**
 * useRipple Hook — RIPPLE zone (Signal Bus) operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate, type SubstrateModule } from '@/lib/substrate';

// Access ripple module from substrate singleton
const ripple = substrate.ripple;

export interface UseRippleReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  pulse: ReturnType<typeof useQuery>;
  metrics: ReturnType<typeof useQuery>;
  topics: ReturnType<typeof useQuery>;
  circuits: ReturnType<typeof useQuery>;
  
  // Queries
  events: (options?: { topic?: string; limit?: number; status?: string }) => ReturnType<typeof useQuery>;
  jobs: (options?: { queue?: string; status?: string; limit?: number }) => ReturnType<typeof useQuery>;
  deadLetter: (queue?: string, limit?: number) => ReturnType<typeof useQuery>;
  
  // Actions
  publish: ReturnType<typeof useMutation>;
  subscribe: ReturnType<typeof useMutation>;
  replay: ReturnType<typeof useMutation>;
  enqueue: ReturnType<typeof useMutation>;
  dequeue: ReturnType<typeof useMutation>;
  work: ReturnType<typeof useMutation>;
  drain: ReturnType<typeof useMutation>;
  ack: ReturnType<typeof useMutation>;
  nack: ReturnType<typeof useMutation>;
  retry: ReturnType<typeof useMutation>;
}

export function useRipple(): UseRippleReturn {
  const queryClient = useQueryClient();
  
  const status = useQuery({
    queryKey: ['substrate', 'ripple', 'status'],
    queryFn: () => ripple.status(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const pulse = useQuery({
    queryKey: ['substrate', 'ripple', 'pulse'],
    queryFn: () => ripple.pulse(),
    refetchInterval: 10000,
    staleTime: 5000,
  });
  
  const metrics = useQuery({
    queryKey: ['substrate', 'ripple', 'metrics'],
    queryFn: () => ripple.metrics(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const topics = useQuery({
    queryKey: ['substrate', 'ripple', 'topics'],
    queryFn: () => ripple.topics(),
    staleTime: 30000,
  });
  
  const circuits = useQuery({
    queryKey: ['substrate', 'ripple', 'circuits'],
    queryFn: () => ripple.circuits(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const events = (options?: { topic?: string; limit?: number; status?: string }) => useQuery({
    queryKey: ['substrate', 'ripple', 'events', options],
    queryFn: () => ripple.events(options),
    refetchInterval: 10000,
    staleTime: 5000,
  });
  
  const jobs = (options?: { queue?: string; status?: string; limit?: number }) => useQuery({
    queryKey: ['substrate', 'ripple', 'jobs', options],
    queryFn: () => ripple.jobs(options),
    refetchInterval: 10000,
    staleTime: 5000,
  });
  
  const deadLetter = (queue?: string, limit?: number) => useQuery({
    queryKey: ['substrate', 'ripple', 'dead_letter', queue, limit],
    queryFn: () => ripple.deadLetter(queue, limit),
    staleTime: 30000,
  });
  
  const publish = useMutation({
    mutationFn: (params: { topic: string; eventType: string; payload: Record<string, unknown> }) => 
      ripple.publish(params.topic, params.eventType, params.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'metrics'] });
    },
  });
  
  const subscribe = useMutation({
    mutationFn: (params: { topic: string; module: SubstrateModule; action: string; filter?: Record<string, unknown> }) => 
      ripple.subscribe(params.topic, params.module, params.action, params.filter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'topics'] });
    },
  });
  
  const replay = useMutation({
    mutationFn: (params: { topic: string; limit?: number }) => 
      ripple.replay(params.topic, params.limit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'events'] });
    },
  });
  
  const enqueue = useMutation({
    mutationFn: (params: { queue: string; payload: Record<string, unknown>; options?: { priority?: number; delay?: string } }) => 
      ripple.enqueue(params.queue, params.payload, params.options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'jobs'] });
    },
  });
  
  const dequeue = useMutation({
    mutationFn: (queue: string) => ripple.dequeue(queue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'jobs'] });
    },
  });
  
  const work = useMutation({
    mutationFn: (params: { queue?: string; once?: boolean }) => 
      ripple.work(params.queue, params.once),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'metrics'] });
    },
  });
  
  const drain = useMutation({
    mutationFn: (queue?: string) => ripple.drain(queue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'metrics'] });
    },
  });
  
  const ack = useMutation({
    mutationFn: (jobId: string) => ripple.ack(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'jobs'] });
    },
  });
  
  const nack = useMutation({
    mutationFn: (params: { jobId: string; reason?: string }) => 
      ripple.nack(params.jobId, params.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'dead_letter'] });
    },
  });
  
  const retry = useMutation({
    mutationFn: (jobId: string) => ripple.retry(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'dead_letter'] });
    },
  });
  
  return {
    status,
    pulse,
    metrics,
    topics,
    circuits,
    events,
    jobs,
    deadLetter,
    publish,
    subscribe,
    replay,
    enqueue,
    dequeue,
    work,
    drain,
    ack,
    nack,
    retry,
  };
}

export default useRipple;
