/**
 * useMemoryModule Hook — MEMORY zone operations
 * Full capability surface: ingest, search, tiering, staleness, relevance,
 * pruning, dedup, GC, health, resilience.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as memoryModule from '@/lib/substrate/memory-module';
import { runEmergencyPrune, getTierCounts } from '@/lib/substrate/memory-pruner';
import { scanDuplicates, getDedupSummary } from '@/lib/substrate/memory-dedup';
import { runMemoryGC, getDecayStats } from '@/lib/substrate/memory-gc';

export interface UseMemoryModuleReturn {
  // Queries
  state: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  relevanceStats: ReturnType<typeof useQuery>;
  tieringConfig: ReturnType<typeof useQuery>;
  tierCounts: ReturnType<typeof useQuery>;
  decayStats: ReturnType<typeof useQuery>;

  // Core Operations
  ingest: ReturnType<typeof useMutation>;
  search: ReturnType<typeof useMutation>;

  // Staleness & Freshness
  detectStale: ReturnType<typeof useMutation>;
  refreshStale: ReturnType<typeof useMutation>;

  // Relevance Feedback
  recordFeedback: ReturnType<typeof useMutation>;

  // Tiering
  runTiering: ReturnType<typeof useMutation>;
  updateTiering: ReturnType<typeof useMutation>;

  // Maintenance
  prune: ReturnType<typeof useMutation>;
  dedup: ReturnType<typeof useMutation>;
  gc: ReturnType<typeof useMutation>;
}

export function useMemoryModule(): UseMemoryModuleReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const invalidateMemory = () => {
    queryClient.invalidateQueries({ queryKey: ['substrate', 'memory'] });
  };

  // ═══ Queries ═══
  const state = useQuery({
    queryKey: ['substrate', 'memory', 'state'],
    queryFn: () => memoryModule.getMemoryModuleState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const health = useQuery({
    queryKey: ['substrate', 'memory', 'health'],
    queryFn: () => Promise.resolve(memoryModule.getMemoryModuleHealth()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const resilience = useQuery({
    queryKey: ['substrate', 'memory', 'resilience'],
    queryFn: () => Promise.resolve(memoryModule.getMemoryResilience()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const relevanceStats = useQuery({
    queryKey: ['substrate', 'memory', 'relevance'],
    queryFn: () => Promise.resolve(memoryModule.getRelevanceStats()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const tieringConfig = useQuery({
    queryKey: ['substrate', 'memory', 'tiering-config'],
    queryFn: () => Promise.resolve(memoryModule.getTieringConfig()),
    staleTime: 60000,
    enabled: pollingEnabled,
  });

  const tierCounts = useQuery({
    queryKey: ['substrate', 'memory', 'tier-counts'],
    queryFn: () => getTierCounts(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const decayStats = useQuery({
    queryKey: ['substrate', 'memory', 'decay'],
    queryFn: () => getDecayStats(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  // ═══ Core Operations ═══
  const ingest = useMutation({
    mutationFn: (params: { source: string; format: string; chunkSize?: number }) =>
      memoryModule.ingestKnowledge(params.source, params.format, { chunkSize: params.chunkSize }),
    onSuccess: invalidateMemory,
  });

  const search = useMutation({
    mutationFn: (params: { query: string; limit?: number; threshold?: number }) =>
      memoryModule.semanticSearch(params.query, { limit: params.limit, threshold: params.threshold }),
  });

  // ═══ Staleness & Freshness ═══
  const detectStale = useMutation({
    mutationFn: () => Promise.resolve(memoryModule.detectStaleEmbeddings()),
  });

  const refreshStale = useMutation({
    mutationFn: () => Promise.resolve(memoryModule.refreshStaleEmbeddings()),
    onSuccess: invalidateMemory,
  });

  // ═══ Relevance Feedback ═══
  const recordFeedback = useMutation({
    mutationFn: (params: { queryId: string; resultId: string; wasUseful: boolean; relevanceScore?: number }) =>
      Promise.resolve(memoryModule.recordRelevanceFeedback(params.queryId, params.resultId, params.wasUseful, params.relevanceScore)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'memory', 'relevance'] });
    },
  });

  // ═══ Tiering ═══
  const runTiering = useMutation({
    mutationFn: () => Promise.resolve(memoryModule.runLocalTiering()),
    onSuccess: invalidateMemory,
  });

  const updateTiering = useMutation({
    mutationFn: (updates: Partial<memoryModule.MemoryTieringConfig>) =>
      Promise.resolve(memoryModule.updateTieringConfig(updates)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'memory', 'tiering-config'] });
    },
  });

  // ═══ Maintenance ═══
  const prune = useMutation({
    mutationFn: () => runEmergencyPrune(),
    onSuccess: invalidateMemory,
  });

  const dedup = useMutation({
    mutationFn: (params?: { dryRun?: boolean }) =>
      scanDuplicates({ dryRun: params?.dryRun }),
    onSuccess: invalidateMemory,
  });

  const gc = useMutation({
    mutationFn: (params?: { aggressiveness?: 'light' | 'standard' | 'aggressive' }) =>
      runMemoryGC(params),
    onSuccess: invalidateMemory,
  });

  return {
    state,
    health,
    resilience,
    relevanceStats,
    tieringConfig,
    tierCounts,
    decayStats,
    ingest,
    search,
    detectStale,
    refreshStale,
    recordFeedback,
    runTiering,
    updateTiering,
    prune,
    dedup,
    gc,
  };
}
