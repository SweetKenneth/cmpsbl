/**
 * useNerve — React hook for the NERVE inter-primitive signaling node
 * 
 * Exposes: heartbeats, circuits, backpressure, topology, stats, CLM, hardening
 * Respects debug mode kill-switch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  getNerveStats,
  getHeartbeats,
  getAllCircuits,
  getAllBackpressure,
  getTopologySummary,
  getTopology,
  getCircuit,
  resetCircuit,
  reportQueueDepth,
  emitSignal,
  getDedupCacheSize,
  initNerve,
  shutdownNerve,
  isNerveInitialized,
  type NerveStats,
  type HeartbeatEntry,
  type CircuitState,
  type BackpressureState,
  type TopologyEdge,
} from '@/lib/substrate/nerve';
import { runNerveCLMCycle, getNerveCLMHistory, getLatestNerveCLMCycle } from '@/lib/substrate/nerve/clm';
import { getHardeningReport, type NerveHardeningReport } from '@/lib/substrate/nerve/hardening';
import type { SubstrateModuleName } from '@/lib/core/index';
import type { SignalPriority } from '@/lib/substrate/module-bus';

export interface UseNerveReturn {
  // Queries
  stats: NerveStats | undefined;
  heartbeats: HeartbeatEntry[] | undefined;
  circuits: CircuitState[] | undefined;
  backpressure: BackpressureState[] | undefined;
  topology: TopologyEdge[] | undefined;
  topologySummary: ReturnType<typeof getTopologySummary> | undefined;
  hardeningReport: NerveHardeningReport | undefined;
  dedupCacheSize: number | undefined;
  initialized: boolean;
  latestCLM: ReturnType<typeof getLatestNerveCLMCycle>;
  clmHistory: ReturnType<typeof getNerveCLMHistory>;

  // Mutations
  emitSignal: (params: {
    from: SubstrateModuleName;
    to: SubstrateModuleName | '*';
    type: string;
    payload: Record<string, unknown>;
    priority?: SignalPriority;
    idempotencyKey?: string;
  }) => void;
  resetCircuit: (nodeId: string) => void;
  reportQueueDepth: (nodeId: string, depth: number) => void;
  runCLMCycle: () => void;
  initNerve: () => void;
  shutdownNerve: () => void;

  // Loading
  isLoading: boolean;
}

const NERVE_KEYS = {
  stats: ['nerve', 'stats'],
  heartbeats: ['nerve', 'heartbeats'],
  circuits: ['nerve', 'circuits'],
  backpressure: ['nerve', 'backpressure'],
  topology: ['nerve', 'topology'],
  topologySummary: ['nerve', 'topology-summary'],
  hardening: ['nerve', 'hardening'],
  dedup: ['nerve', 'dedup'],
} as const;

export function useNerve(): UseNerveReturn {
  const qc = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const polling = pollingEnabled ? 15000 : undefined;

  const statsQ = useQuery({
    queryKey: NERVE_KEYS.stats,
    queryFn: getNerveStats,
    refetchInterval: polling,
    staleTime: 8000,
    enabled: pollingEnabled,
  });

  const heartbeatsQ = useQuery({
    queryKey: NERVE_KEYS.heartbeats,
    queryFn: getHeartbeats,
    refetchInterval: polling,
    staleTime: 8000,
    enabled: pollingEnabled,
  });

  const circuitsQ = useQuery({
    queryKey: NERVE_KEYS.circuits,
    queryFn: getAllCircuits,
    refetchInterval: polling,
    staleTime: 8000,
    enabled: pollingEnabled,
  });

  const bpQ = useQuery({
    queryKey: NERVE_KEYS.backpressure,
    queryFn: getAllBackpressure,
    refetchInterval: polling,
    staleTime: 8000,
    enabled: pollingEnabled,
  });

  const topoQ = useQuery({
    queryKey: NERVE_KEYS.topology,
    queryFn: getTopology,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const topoSumQ = useQuery({
    queryKey: NERVE_KEYS.topologySummary,
    queryFn: getTopologySummary,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const hardenQ = useQuery({
    queryKey: NERVE_KEYS.hardening,
    queryFn: getHardeningReport,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const dedupQ = useQuery({
    queryKey: NERVE_KEYS.dedup,
    queryFn: getDedupCacheSize,
    staleTime: 5000,
    enabled: pollingEnabled,
  });

  const invalidateAll = () => {
    Object.values(NERVE_KEYS).forEach(k => qc.invalidateQueries({ queryKey: k }));
  };

  const emitMut = useMutation({
    mutationFn: (p: Parameters<UseNerveReturn['emitSignal']>[0]) =>
      emitSignal(p.from, p.to, p.type, p.payload, {
        priority: p.priority,
        idempotencyKey: p.idempotencyKey,
      }),
    onSuccess: invalidateAll,
  });

  const resetCircuitMut = useMutation({
    mutationFn: (nodeId: string) => Promise.resolve(resetCircuit(nodeId)),
    onSuccess: invalidateAll,
  });

  const reportBPMut = useMutation({
    mutationFn: ({ nodeId, depth }: { nodeId: string; depth: number }) =>
      Promise.resolve(reportQueueDepth(nodeId, depth)),
    onSuccess: invalidateAll,
  });

  const clmMut = useMutation({
    mutationFn: () => Promise.resolve(runNerveCLMCycle()),
    onSuccess: invalidateAll,
  });

  const initMut = useMutation({
    mutationFn: () => Promise.resolve(initNerve()),
    onSuccess: invalidateAll,
  });

  const shutdownMut = useMutation({
    mutationFn: () => Promise.resolve(shutdownNerve()),
    onSuccess: invalidateAll,
  });

  return {
    stats: statsQ.data,
    heartbeats: heartbeatsQ.data,
    circuits: circuitsQ.data,
    backpressure: bpQ.data,
    topology: topoQ.data,
    topologySummary: topoSumQ.data,
    hardeningReport: hardenQ.data,
    dedupCacheSize: dedupQ.data,
    initialized: isNerveInitialized(),
    latestCLM: getLatestNerveCLMCycle(),
    clmHistory: getNerveCLMHistory(),

    emitSignal: (p) => emitMut.mutate(p),
    resetCircuit: (nodeId) => resetCircuitMut.mutate(nodeId),
    reportQueueDepth: (nodeId, depth) => reportBPMut.mutate({ nodeId, depth }),
    runCLMCycle: () => clmMut.mutate(),
    initNerve: () => initMut.mutate(),
    shutdownNerve: () => shutdownMut.mutate(),

    isLoading: statsQ.isLoading || heartbeatsQ.isLoading,
  };
}
