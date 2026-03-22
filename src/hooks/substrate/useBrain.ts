/**
 * useBrain Hook — BRAIN zone (Cognitive Memory) operations
 * Respects debug mode kill-switch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

// Access brain module from substrate singleton
const brain = substrate.brain;

export interface UseBrainReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  memoryState: ReturnType<typeof useQuery>;
  patterns: ReturnType<typeof useQuery>;
  curiosity: ReturnType<typeof useQuery>;
  graphSummary: ReturnType<typeof useQuery>;
  
  // Memory Operations
  learn: ReturnType<typeof useMutation>;
  remember: ReturnType<typeof useMutation>;
  recall: ReturnType<typeof useMutation>;
  query: ReturnType<typeof useMutation>;
  
  // Cognitive Operations
  reflect: ReturnType<typeof useMutation>;
  forecast: ReturnType<typeof useMutation>;
  synthesize: ReturnType<typeof useMutation>;
  dream: ReturnType<typeof useMutation>;
  deepThink: ReturnType<typeof useMutation>;
  cognitiveCycle: ReturnType<typeof useMutation>;
  explore: ReturnType<typeof useMutation>;
  
  // Memory Management
  optimize: ReturnType<typeof useMutation>;
  tier: ReturnType<typeof useMutation>;
  prune: ReturnType<typeof useMutation>;
  reinforce: ReturnType<typeof useMutation>;
  
  // Graph Operations
  graphBuild: ReturnType<typeof useMutation>;
  
  // Memory Core Lifecycle
  memoryIngest: ReturnType<typeof useMutation>;
  memoryRetrieve: ReturnType<typeof useMutation>;
  memoryCycle: ReturnType<typeof useMutation>;
  
  // Reasoning & Governance
  reasoningCycle: ReturnType<typeof useMutation>;
  governanceCycle: ReturnType<typeof useMutation>;
  coherenceCheck: ReturnType<typeof useMutation>;
  
  // Session — now mutation-based to avoid Rules-of-Hooks violation
  sessionReflection: ReturnType<typeof useMutation>;
}

export function useBrain(): UseBrainReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  
  const invalidateBrain = () => {
    queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
  };
  
  const status = useQuery({
    queryKey: ['substrate', 'brain', 'status'],
    queryFn: () => brain.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const memoryState = useQuery({
    queryKey: ['substrate', 'brain', 'memory_state'],
    queryFn: () => brain.memoryState(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });
  
  const patterns = useQuery({
    queryKey: ['substrate', 'brain', 'patterns'],
    queryFn: () => brain.patterns(),
    staleTime: 60000,
    enabled: pollingEnabled,
  });
  
  const curiosity = useQuery({
    queryKey: ['substrate', 'brain', 'curiosity'],
    queryFn: () => brain.curiosity(),
    staleTime: 60000,
    enabled: pollingEnabled,
  });
  
  const graphSummary = useQuery({
    queryKey: ['substrate', 'brain', 'graph_summary'],
    queryFn: () => brain.graphSummary(),
    staleTime: 120000,
    enabled: pollingEnabled,
  });
  
  // Memory Operations
  const learn = useMutation({
    mutationFn: (params: { content: string; source?: string }) => 
      brain.learn(params.content, params.source),
    onSuccess: invalidateBrain,
  });
  
  const remember = useMutation({
    mutationFn: (params: { content: string; memoryType: string; confidence?: number; metadata?: Record<string, unknown> }) => 
      brain.remember(params.content, params.memoryType, params.confidence, params.metadata),
    onSuccess: invalidateBrain,
  });
  
  const recall = useMutation({
    mutationFn: (params: { query: string; limit?: number }) => 
      brain.recall(params.query, params.limit),
  });
  
  const query = useMutation({
    mutationFn: (params: { queryText: string; limit?: number }) => 
      brain.query(params.queryText, params.limit),
  });
  
  // Cognitive Operations
  const reflect = useMutation({
    mutationFn: () => brain.reflect(),
    onSuccess: invalidateBrain,
  });
  
  const forecast = useMutation({
    mutationFn: (params?: { metric?: string; window?: string }) => 
      brain.forecast(params?.metric, params?.window),
  });
  
  const synthesize = useMutation({
    mutationFn: () => brain.synthesize(),
    onSuccess: invalidateBrain,
  });
  
  const dream = useMutation({
    mutationFn: () => brain.dream(),
    onSuccess: invalidateBrain,
  });
  
  const deepThink = useMutation({
    mutationFn: (params: { query: string; depth?: number }) => 
      brain.deepThink(params.query, params.depth),
  });
  
  const cognitiveCycle = useMutation({
    mutationFn: () => brain.cognitiveCycle(),
    onSuccess: invalidateBrain,
  });
  
  const explore = useMutation({
    mutationFn: (query: string) => brain.explore(query),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain', 'curiosity'] });
    },
  });
  
  // Memory Management
  const optimize = useMutation({
    mutationFn: (mode?: 'standard' | 'aggressive' | 'deep') => brain.optimize(mode),
    onSuccess: invalidateBrain,
  });
  
  const tier = useMutation({
    mutationFn: (mode?: 'standard' | 'aggressive' | 'deep') => brain.tier(mode),
    onSuccess: invalidateBrain,
  });
  
  const prune = useMutation({
    mutationFn: (threshold?: number) => brain.prune(threshold),
    onSuccess: invalidateBrain,
  });
  
  const reinforce = useMutation({
    mutationFn: (params: { memoryId: string; boost?: number }) => 
      brain.reinforce(params.memoryId, params.boost),
    onSuccess: invalidateBrain,
  });
  
  // Graph Operations
  const graphBuild = useMutation({
    mutationFn: () => brain.graphBuild(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain', 'graph_summary'] });
    },
  });
  
  // Memory Core Lifecycle
  const memoryIngest = useMutation({
    mutationFn: (params: { content: string; options?: { type?: string; source?: string; confidence?: number; tags?: string[] } }) => 
      brain.memoryIngest(params.content, params.options),
    onSuccess: invalidateBrain,
  });
  
  const memoryRetrieve = useMutation({
    mutationFn: (params: { query: string; options?: { tier?: string; type?: string; limit?: number; strategy?: string } }) => 
      brain.memoryRetrieve(params.query, params.options),
  });
  
  const memoryCycle = useMutation({
    mutationFn: (params: { content: string; options?: { autoIndex?: boolean; autoReflect?: boolean } }) => 
      brain.memoryCycle(params.content, params.options),
    onSuccess: invalidateBrain,
  });
  
  // Reasoning & Governance
  const reasoningCycle = useMutation({
    mutationFn: (params: { context: string; options?: { domain?: string; depth?: 'shallow' | 'standard' | 'deep' } }) => 
      brain.reasoningCycle(params.context, params.options),
  });
  
  const governanceCycle = useMutation({
    mutationFn: (params: { content: string; options?: { context?: string; strict_mode?: boolean } }) => 
      brain.governanceCycle(params.content, params.options),
  });
  
  const coherenceCheck = useMutation({
    mutationFn: (depth?: 'standard' | 'deep') => brain.coherenceCheck(depth),
  });
  
  // Session — converted to mutation to avoid Rules-of-Hooks violation
  const sessionReflection = useMutation({
    mutationFn: (hours?: number) => brain.sessionReflection(hours ?? 24),
  });
  
  return {
    status,
    memoryState,
    patterns,
    curiosity,
    graphSummary,
    learn,
    remember,
    recall,
    query,
    reflect,
    forecast,
    synthesize,
    dream,
    deepThink,
    cognitiveCycle,
    explore,
    optimize,
    tier,
    prune,
    reinforce,
    graphBuild,
    memoryIngest,
    memoryRetrieve,
    memoryCycle,
    reasoningCycle,
    governanceCycle,
    coherenceCheck,
    sessionReflection,
  };
}

export default useBrain;
