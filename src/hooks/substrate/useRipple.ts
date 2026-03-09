/**
 * useRipple Hook — RIPPLE kernel zone (Signal Bus) operations
 * v8.0.0 "Tempest"
 *
 * Full-featured hook exposing core bus, persistent event store,
 * ordered delivery, cross-node propagation, replay engine,
 * analytics, and 35-feature hardening suite.
 *
 * Part of the 40-Node / 12-Sector Architecture (Kernel Zone)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate, type SubstrateModule } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

// Tempest engines (direct lib access for local-state queries)
import { getEventStoreStats, getAllConsumerPositions, getConsumerLag } from '@/lib/ripple/persistentEventStore';
import { getOrderingStats, getAllPartitionStats, getStalePartitions } from '@/lib/ripple/orderedDelivery';
import { getPropagationStats, getSectorTopology, getSubscribedNodes } from '@/lib/ripple/crossNodePropagation';
import { getReplayStats, getActiveSessions, cleanupSessions } from '@/lib/ripple/eventReplayEngine';
import { getEventAnalytics as getLocalAnalytics, getEventPatterns, findCorrelations } from '@/lib/ripple/eventAnalytics';
import {
  calculateTempestHealth,
  calculateRippleHealth,
  getBackpressureState,
  getDLQDepth,
  getThroughputStats,
  getTopicHeatmap,
  getPersistentStoreHealth,
  getExactlyOnceStats,
  getPropagationMetrics,
  getCausalViolations,
  getPartitionHealth,
  getConsumerLagAlerts,
  getCompactionStats,
  getSectorBroadcastStats,
  getRippleSLA,
} from '@/lib/ripple/ripple-hardening';

const ripple = substrate.ripple;

export interface UseRippleReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  pulse: ReturnType<typeof useQuery>;
  metrics: ReturnType<typeof useQuery>;
  topics: ReturnType<typeof useQuery>;
  circuits: ReturnType<typeof useQuery>;
  tempestHealth: ReturnType<typeof useQuery>;
  sla: ReturnType<typeof useQuery>;

  // Queries — Core Bus
  events: (options?: { topic?: string; limit?: number; status?: string }) => ReturnType<typeof useQuery>;
  jobs: (options?: { queue?: string; status?: string; limit?: number }) => ReturnType<typeof useQuery>;
  deadLetter: (queue?: string, limit?: number) => ReturnType<typeof useQuery>;

  // Queries — Persistent Store (Tempest)
  eventStoreStats: ReturnType<typeof useQuery>;
  consumerPositions: ReturnType<typeof useQuery>;

  // Queries — Ordered Delivery (Tempest)
  orderingStats: ReturnType<typeof useQuery>;
  partitionStats: ReturnType<typeof useQuery>;
  stalePartitions: ReturnType<typeof useQuery>;

  // Queries — Propagation (Tempest)
  propagationStats: ReturnType<typeof useQuery>;
  sectorTopology: ReturnType<typeof useQuery>;
  subscribedNodes: ReturnType<typeof useQuery>;

  // Queries — Replay (Tempest)
  replayStats: ReturnType<typeof useQuery>;
  activeSessions: ReturnType<typeof useQuery>;

  // Queries — Analytics
  analytics: ReturnType<typeof useQuery>;
  eventPatterns: ReturnType<typeof useQuery>;

  // Queries — Hardening
  backpressure: ReturnType<typeof useQuery>;
  throughput: ReturnType<typeof useQuery>;
  topicHeatmap: ReturnType<typeof useQuery>;
  persistentStoreHealth: ReturnType<typeof useQuery>;
  exactlyOnceStats: ReturnType<typeof useQuery>;
  propagationMetrics: ReturnType<typeof useQuery>;
  causalViolations: ReturnType<typeof useQuery>;
  partitionHealth: ReturnType<typeof useQuery>;
  consumerLagAlerts: ReturnType<typeof useQuery>;
  compactionStats: ReturnType<typeof useQuery>;
  sectorBroadcasts: ReturnType<typeof useQuery>;

  // Actions — Core Bus
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

  // Actions — Replay Engine
  cleanupReplaySessions: ReturnType<typeof useMutation>;
}

export function useRipple(): UseRippleReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const invalidateRipple = () => {
    queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple'] });
  };

  // ── Status & Health ────────────────────────────────────────────

  const status = useQuery({
    queryKey: ['substrate', 'ripple', 'status'],
    queryFn: () => ripple.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const pulse = useQuery({
    queryKey: ['substrate', 'ripple', 'pulse'],
    queryFn: () => ripple.pulse(),
    refetchInterval: pollingEnabled ? 10000 : false,
    staleTime: 5000,
    enabled: pollingEnabled,
  });

  const metrics = useQuery({
    queryKey: ['substrate', 'ripple', 'metrics'],
    queryFn: () => ripple.metrics(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const topics = useQuery({
    queryKey: ['substrate', 'ripple', 'topics'],
    queryFn: () => ripple.topics(),
    staleTime: 30000,
  });

  const circuits = useQuery({
    queryKey: ['substrate', 'ripple', 'circuits'],
    queryFn: () => ripple.circuits(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const tempestHealth = useQuery({
    queryKey: ['substrate', 'ripple', 'tempestHealth'],
    queryFn: () => calculateTempestHealth(),
    staleTime: 30000,
    refetchInterval: pollingEnabled ? 60000 : false,
  });

  const sla = useQuery({
    queryKey: ['substrate', 'ripple', 'sla'],
    queryFn: () => getRippleSLA(),
    staleTime: 60000,
  });

  // ── Core Bus Queries ───────────────────────────────────────────

  const events = (options?: { topic?: string; limit?: number; status?: string }) => useQuery({
    queryKey: ['substrate', 'ripple', 'events', options],
    queryFn: () => ripple.events(options),
    refetchInterval: pollingEnabled ? 10000 : false,
    staleTime: 5000,
    enabled: pollingEnabled,
  });

  const jobs = (options?: { queue?: string; status?: string; limit?: number }) => useQuery({
    queryKey: ['substrate', 'ripple', 'jobs', options],
    queryFn: () => ripple.jobs(options),
    refetchInterval: pollingEnabled ? 10000 : false,
    staleTime: 5000,
    enabled: pollingEnabled,
  });

  const deadLetter = (queue?: string, limit?: number) => useQuery({
    queryKey: ['substrate', 'ripple', 'dead_letter', queue, limit],
    queryFn: () => ripple.deadLetter(queue, limit),
    staleTime: 30000,
  });

  // ── Persistent Store (Tempest) ─────────────────────────────────

  const eventStoreStats = useQuery({
    queryKey: ['substrate', 'ripple', 'eventStoreStats'],
    queryFn: () => getEventStoreStats(),
    staleTime: 30000,
  });

  const consumerPositions = useQuery({
    queryKey: ['substrate', 'ripple', 'consumerPositions'],
    queryFn: () => getAllConsumerPositions(),
    staleTime: 15000,
    refetchInterval: pollingEnabled ? 30000 : false,
  });

  // ── Ordered Delivery (Tempest) ─────────────────────────────────

  const orderingStats = useQuery({
    queryKey: ['substrate', 'ripple', 'orderingStats'],
    queryFn: () => getOrderingStats(),
    staleTime: 15000,
    refetchInterval: pollingEnabled ? 30000 : false,
  });

  const partitionStats = useQuery({
    queryKey: ['substrate', 'ripple', 'partitionStats'],
    queryFn: () => getAllPartitionStats(),
    staleTime: 15000,
  });

  const stalePartitionsQuery = useQuery({
    queryKey: ['substrate', 'ripple', 'stalePartitions'],
    queryFn: () => getStalePartitions(),
    staleTime: 10000,
    refetchInterval: pollingEnabled ? 15000 : false,
  });

  // ── Propagation (Tempest) ──────────────────────────────────────

  const propagationStatsQuery = useQuery({
    queryKey: ['substrate', 'ripple', 'propagationStats'],
    queryFn: () => getPropagationStats(),
    staleTime: 30000,
    refetchInterval: pollingEnabled ? 60000 : false,
  });

  const sectorTopology = useQuery({
    queryKey: ['substrate', 'ripple', 'sectorTopology'],
    queryFn: () => getSectorTopology(),
    staleTime: 300000, // 5 min — topology is static
  });

  const subscribedNodesQuery = useQuery({
    queryKey: ['substrate', 'ripple', 'subscribedNodes'],
    queryFn: () => getSubscribedNodes(),
    staleTime: 30000,
  });

  // ── Replay Engine (Tempest) ────────────────────────────────────

  const replayStatsQuery = useQuery({
    queryKey: ['substrate', 'ripple', 'replayStats'],
    queryFn: () => getReplayStats(),
    staleTime: 30000,
  });

  const activeSessionsQuery = useQuery({
    queryKey: ['substrate', 'ripple', 'activeSessions'],
    queryFn: () => getActiveSessions(),
    staleTime: 10000,
    refetchInterval: pollingEnabled ? 15000 : false,
  });

  // ── Analytics ──────────────────────────────────────────────────

  const analyticsQuery = useQuery({
    queryKey: ['substrate', 'ripple', 'analytics'],
    queryFn: () => getLocalAnalytics('24h'),
    staleTime: 60000,
  });

  const eventPatternsQuery = useQuery({
    queryKey: ['substrate', 'ripple', 'eventPatterns'],
    queryFn: () => getEventPatterns(3),
    staleTime: 60000,
  });

  // ── Hardening Monitors ─────────────────────────────────────────

  const backpressureQuery = useQuery({
    queryKey: ['substrate', 'ripple', 'backpressure'],
    queryFn: () => getBackpressureState(),
    staleTime: 10000,
    refetchInterval: pollingEnabled ? 15000 : false,
  });

  const throughputQuery = useQuery({
    queryKey: ['substrate', 'ripple', 'throughput'],
    queryFn: () => getThroughputStats(),
    staleTime: 10000,
    refetchInterval: pollingEnabled ? 15000 : false,
  });

  const topicHeatmapQuery = useQuery({
    queryKey: ['substrate', 'ripple', 'topicHeatmap'],
    queryFn: () => getTopicHeatmap(),
    staleTime: 30000,
  });

  const persistentStoreHealthQuery = useQuery({
    queryKey: ['substrate', 'ripple', 'persistentStoreHealth'],
    queryFn: () => getPersistentStoreHealth(),
    staleTime: 30000,
    refetchInterval: pollingEnabled ? 60000 : false,
  });

  const exactlyOnceStatsQuery = useQuery({
    queryKey: ['substrate', 'ripple', 'exactlyOnceStats'],
    queryFn: () => getExactlyOnceStats(),
    staleTime: 30000,
  });

  const propagationMetricsQuery = useQuery({
    queryKey: ['substrate', 'ripple', 'propagationMetrics'],
    queryFn: () => getPropagationMetrics(),
    staleTime: 30000,
  });

  const causalViolationsQuery = useQuery({
    queryKey: ['substrate', 'ripple', 'causalViolations'],
    queryFn: () => getCausalViolations(20),
    staleTime: 15000,
  });

  const partitionHealthQuery = useQuery({
    queryKey: ['substrate', 'ripple', 'partitionHealth'],
    queryFn: () => getPartitionHealth(),
    staleTime: 30000,
    refetchInterval: pollingEnabled ? 60000 : false,
  });

  const consumerLagAlertsQuery = useQuery({
    queryKey: ['substrate', 'ripple', 'consumerLagAlerts'],
    queryFn: () => getConsumerLagAlerts(20),
    staleTime: 15000,
  });

  const compactionStatsQuery = useQuery({
    queryKey: ['substrate', 'ripple', 'compactionStats'],
    queryFn: () => getCompactionStats(),
    staleTime: 60000,
  });

  const sectorBroadcastsQuery = useQuery({
    queryKey: ['substrate', 'ripple', 'sectorBroadcasts'],
    queryFn: () => getSectorBroadcastStats(),
    staleTime: 30000,
  });

  // ── Mutations — Core Bus ───────────────────────────────────────

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

  const replayMut = useMutation({
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

  const workMut = useMutation({
    mutationFn: (params: { queue?: string; once?: boolean }) =>
      ripple.work(params.queue, params.once),
    onSuccess: invalidateRipple,
  });

  const drainMut = useMutation({
    mutationFn: (queue?: string) => ripple.drain(queue),
    onSuccess: invalidateRipple,
  });

  const ackMut = useMutation({
    mutationFn: (jobId: string) => ripple.ack(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'jobs'] });
    },
  });

  const nackMut = useMutation({
    mutationFn: (params: { jobId: string; reason?: string }) =>
      ripple.nack(params.jobId, params.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'dead_letter'] });
    },
  });

  const retryMut = useMutation({
    mutationFn: (jobId: string) => ripple.retry(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'dead_letter'] });
    },
  });

  // ── Mutations — Replay Engine ──────────────────────────────────

  const cleanupReplaySessionsMut = useMutation({
    mutationFn: (olderThanMs?: number) =>
      Promise.resolve(cleanupSessions(olderThanMs)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'activeSessions'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'ripple', 'replayStats'] });
    },
  });

  return {
    // Status & Health
    status,
    pulse,
    metrics,
    topics,
    circuits,
    tempestHealth,
    sla,
    // Core Bus Queries
    events,
    jobs,
    deadLetter,
    // Persistent Store
    eventStoreStats,
    consumerPositions,
    // Ordered Delivery
    orderingStats,
    partitionStats,
    stalePartitions: stalePartitionsQuery,
    // Propagation
    propagationStats: propagationStatsQuery,
    sectorTopology,
    subscribedNodes: subscribedNodesQuery,
    // Replay
    replayStats: replayStatsQuery,
    activeSessions: activeSessionsQuery,
    // Analytics
    analytics: analyticsQuery,
    eventPatterns: eventPatternsQuery,
    // Hardening
    backpressure: backpressureQuery,
    throughput: throughputQuery,
    topicHeatmap: topicHeatmapQuery,
    persistentStoreHealth: persistentStoreHealthQuery,
    exactlyOnceStats: exactlyOnceStatsQuery,
    propagationMetrics: propagationMetricsQuery,
    causalViolations: causalViolationsQuery,
    partitionHealth: partitionHealthQuery,
    consumerLagAlerts: consumerLagAlertsQuery,
    compactionStats: compactionStatsQuery,
    sectorBroadcasts: sectorBroadcastsQuery,
    // Mutations — Core
    publish,
    subscribe,
    replay: replayMut,
    enqueue,
    dequeue,
    work: workMut,
    drain: drainMut,
    ack: ackMut,
    nack: nackMut,
    retry: retryMut,
    // Mutations — Replay
    cleanupReplaySessions: cleanupReplaySessionsMut,
  };
}

export default useRipple;
