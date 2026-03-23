/**
 * useBrain Hook — BRAIN v9.0.0 "Synaptic" operations
 * Full 12-engine cognitive core + legacy memory operations
 * Respects debug mode kill-switch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';
import * as brainModule from '@/lib/substrate/brain-module';

// Access brain module from substrate singleton
const brain = substrate.brain;

export interface UseBrainReturn {
  // ── Status & Health ──
  status: ReturnType<typeof useQuery>;
  memoryState: ReturnType<typeof useQuery>;
  patterns: ReturnType<typeof useQuery>;
  curiosity: ReturnType<typeof useQuery>;
  graphSummary: ReturnType<typeof useQuery>;

  // ── v9.0.0 Synaptic Queries ──
  synapticState: ReturnType<typeof useQuery>;
  workingMemory: ReturnType<typeof useQuery>;
  metacognition: ReturnType<typeof useQuery>;
  insightRegistry: ReturnType<typeof useQuery>;
  causalGraph: ReturnType<typeof useQuery>;
  reasoningTraces: ReturnType<typeof useQuery>;
  dreamQueue: ReturnType<typeof useQuery>;

  // ── Legacy Memory Operations ──
  learn: ReturnType<typeof useMutation>;
  remember: ReturnType<typeof useMutation>;
  recall: ReturnType<typeof useMutation>;
  query: ReturnType<typeof useMutation>;

  // ── Legacy Cognitive Operations ──
  reflect: ReturnType<typeof useMutation>;
  forecast: ReturnType<typeof useMutation>;
  synthesize: ReturnType<typeof useMutation>;
  dream: ReturnType<typeof useMutation>;
  deepThink: ReturnType<typeof useMutation>;
  cognitiveCycle: ReturnType<typeof useMutation>;
  explore: ReturnType<typeof useMutation>;

  // ── Legacy Memory Management ──
  optimize: ReturnType<typeof useMutation>;
  tier: ReturnType<typeof useMutation>;
  prune: ReturnType<typeof useMutation>;
  reinforce: ReturnType<typeof useMutation>;
  graphBuild: ReturnType<typeof useMutation>;
  memoryIngest: ReturnType<typeof useMutation>;
  memoryRetrieve: ReturnType<typeof useMutation>;
  memoryCycle: ReturnType<typeof useMutation>;

  // ── Legacy Reasoning & Governance ──
  reasoningCycle: ReturnType<typeof useMutation>;
  governanceCycle: ReturnType<typeof useMutation>;
  coherenceCheck: ReturnType<typeof useMutation>;
  sessionReflection: ReturnType<typeof useMutation>;

  // ── v9.0.0 Engine 1: Multi-Strategy Reasoning ──
  multiStrategyReason: ReturnType<typeof useMutation>;

  // ── v9.0.0 Engine 2: Cognitive Load ──
  updateCognitiveLoad: ReturnType<typeof useMutation>;

  // ── v9.0.0 Engine 3: Attention ──
  setAttention: ReturnType<typeof useMutation>;

  // ── v9.0.0 Engine 4: Insights ──
  crystallizeInsight: ReturnType<typeof useMutation>;
  searchInsights: ReturnType<typeof useMutation>;

  // ── v9.0.0 Engine 5: Contradictions ──
  scanContradictions: ReturnType<typeof useMutation>;
  resolveContradiction: ReturnType<typeof useMutation>;

  // ── v9.0.0 Engine 6: Causal Graph ──
  addCausalEdge: ReturnType<typeof useMutation>;
  traceCausalChain: ReturnType<typeof useMutation>;

  // ── v9.0.0 Engine 7: Metacognition ──
  recordPrediction: ReturnType<typeof useMutation>;

  // ── v9.0.0 Engine 8: Working Memory ──
  addToWorkingMemory: ReturnType<typeof useMutation>;
  clearWorkingMemory: ReturnType<typeof useMutation>;

  // ── v9.0.0 Engine 9: Cross-Node Fusion ──
  fuseIntelligence: ReturnType<typeof useMutation>;

  // ── v9.0.0 Engine 10: Reasoning Traces ──
  createReasoningTrace: ReturnType<typeof useMutation>;
  appendTraceEntry: ReturnType<typeof useMutation>;
  verifyTrace: ReturnType<typeof useMutation>;

  // ── v9.0.0 Engine 11: Learning Rate ──
  computeLearningRate: ReturnType<typeof useMutation>;

  // ── v9.0.0 Engine 12: Dream Protocol ──
  submitToDream: ReturnType<typeof useMutation>;
  receiveDreamSolution: ReturnType<typeof useMutation>;
  validateDreamSolution: ReturnType<typeof useMutation>;
}

export function useBrain(): UseBrainReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const invalidateBrain = () => {
    queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
  };

  // ═══════════════════════════════════════════════════════════
  // QUERIES — Legacy
  // ═══════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════
  // QUERIES — v9.0.0 Synaptic Engines
  // ═══════════════════════════════════════════════════════════

  const synapticState = useQuery({
    queryKey: ['substrate', 'brain', 'synaptic'],
    queryFn: () => brainModule.getBrainSynapticState(),
    refetchInterval: pollingEnabled ? 15000 : false,
    staleTime: 8000,
    enabled: pollingEnabled,
  });

  const workingMemory = useQuery({
    queryKey: ['substrate', 'brain', 'working_memory'],
    queryFn: () => brainModule.getWorkingMemoryState(),
    refetchInterval: pollingEnabled ? 10000 : false,
    staleTime: 5000,
    enabled: pollingEnabled,
  });

  const metacognition = useQuery({
    queryKey: ['substrate', 'brain', 'metacognition'],
    queryFn: () => brainModule.getMetacognitiveState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const insightRegistry = useQuery({
    queryKey: ['substrate', 'brain', 'insights'],
    queryFn: () => brainModule.getInsights(50),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const causalGraph = useQuery({
    queryKey: ['substrate', 'brain', 'causal_graph'],
    queryFn: () => brainModule.getCausalGraph(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const reasoningTraces = useQuery({
    queryKey: ['substrate', 'brain', 'traces'],
    queryFn: () => brainModule.getTraces(30),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const dreamQueue = useQuery({
    queryKey: ['substrate', 'brain', 'dream_queue'],
    queryFn: () => brainModule.getDreamQueue(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  // ═══════════════════════════════════════════════════════════
  // MUTATIONS — Legacy
  // ═══════════════════════════════════════════════════════════

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

  const reflect = useMutation({ mutationFn: () => brain.reflect(), onSuccess: invalidateBrain });
  const forecast = useMutation({
    mutationFn: (params?: { metric?: string; window?: string }) =>
      brain.forecast(params?.metric, params?.window),
  });
  const synthesize = useMutation({ mutationFn: () => brain.synthesize(), onSuccess: invalidateBrain });
  const dream = useMutation({ mutationFn: () => brain.dream(), onSuccess: invalidateBrain });
  const deepThink = useMutation({
    mutationFn: (params: { query: string; depth?: number }) =>
      brain.deepThink(params.query, params.depth),
  });
  const cognitiveCycle = useMutation({ mutationFn: () => brain.cognitiveCycle(), onSuccess: invalidateBrain });
  const explore = useMutation({
    mutationFn: (q: string) => brain.explore(q),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'brain', 'curiosity'] }),
  });

  const optimize = useMutation({ mutationFn: (mode?: 'standard' | 'aggressive' | 'deep') => brain.optimize(mode), onSuccess: invalidateBrain });
  const tier = useMutation({ mutationFn: (mode?: 'standard' | 'aggressive' | 'deep') => brain.tier(mode), onSuccess: invalidateBrain });
  const prune = useMutation({ mutationFn: (threshold?: number) => brain.prune(threshold), onSuccess: invalidateBrain });
  const reinforce = useMutation({
    mutationFn: (params: { memoryId: string; boost?: number }) =>
      brain.reinforce(params.memoryId, params.boost),
    onSuccess: invalidateBrain,
  });
  const graphBuild = useMutation({
    mutationFn: () => brain.graphBuild(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'brain', 'graph_summary'] }),
  });
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
  const sessionReflection = useMutation({
    mutationFn: (hours?: number) => brain.sessionReflection(hours ?? 24),
  });

  // ═══════════════════════════════════════════════════════════
  // MUTATIONS — v9.0.0 Synaptic Engines
  // ═══════════════════════════════════════════════════════════

  const multiStrategyReason = useMutation({
    mutationFn: (params: { query: string; context: string[] }) =>
      Promise.resolve(brainModule.multiStrategyReason(params.query, params.context)),
    onSuccess: invalidateBrain,
  });

  const updateCognitiveLoad = useMutation({
    mutationFn: (params: { tokens: number; depth: number; switches: number }) =>
      Promise.resolve(brainModule.updateCognitiveLoad(params.tokens, params.depth, params.switches)),
  });

  const setAttention = useMutation({
    mutationFn: (params: { mode: brainModule.AttentionMode; targets: string[] }) =>
      Promise.resolve(brainModule.setAttention(params.mode, params.targets)),
  });

  const crystallizeInsight = useMutation({
    mutationFn: (params: { content: string; domain: string; novelty: number; utility: number; crossDomain: number }) =>
      Promise.resolve(brainModule.crystallizeInsight(params.content, params.domain, params.novelty, params.utility, params.crossDomain)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'brain', 'insights'] }),
  });

  const searchInsights = useMutation({
    mutationFn: (params: { query: string; limit?: number }) =>
      Promise.resolve(brainModule.searchInsights(params.query, params.limit)),
  });

  const scanContradictions = useMutation({
    mutationFn: (beliefs: string[]) =>
      Promise.resolve(brainModule.scanForContradictions(beliefs)),
  });

  const resolveContradiction = useMutation({
    mutationFn: (params: { id: string; strategy: 'evidence-weight' | 'temporal-precedence' | 'authority-rank' | 'manual'; resolution: string }) =>
      Promise.resolve(brainModule.resolveContradiction(params.id, params.strategy, params.resolution)),
  });

  const addCausalEdge = useMutation({
    mutationFn: (params: { from: string; to: string; strength?: number; interventionTested?: boolean }) =>
      Promise.resolve(brainModule.addCausalEdge(params.from, params.to, params.strength, params.interventionTested)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'brain', 'causal_graph'] }),
  });

  const traceCausalChain = useMutation({
    mutationFn: (params: { target: string; maxDepth?: number }) =>
      Promise.resolve(brainModule.traceCausalChain(params.target, params.maxDepth)),
  });

  const recordPrediction = useMutation({
    mutationFn: (params: { predicted: number; actual: number; domain?: string }) =>
      Promise.resolve(brainModule.recordPrediction(params.predicted, params.actual, params.domain)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'brain', 'metacognition'] }),
  });

  const addToWorkingMemory = useMutation({
    mutationFn: (content: string) =>
      Promise.resolve(brainModule.addToWorkingMemory(content)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'brain', 'working_memory'] }),
  });

  const clearWorkingMemory = useMutation({
    mutationFn: () => Promise.resolve(brainModule.clearWorkingMemory()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'brain', 'working_memory'] }),
  });

  const fuseIntelligence = useMutation({
    mutationFn: (params: { query: string; sourceNodes: string[] }) =>
      Promise.resolve(brainModule.fuseIntelligence(params.query, params.sourceNodes)),
  });

  const createReasoningTrace = useMutation({
    mutationFn: (query: string) =>
      Promise.resolve(brainModule.createTrace(query)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'brain', 'traces'] }),
  });

  const appendTraceEntry = useMutation({
    mutationFn: (params: { traceId: string; type: 'premise' | 'inference' | 'conclusion' | 'evidence' | 'assumption'; content: string; confidence: number }) =>
      Promise.resolve(brainModule.appendTraceEntry(params.traceId, params.type, params.content, params.confidence)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'brain', 'traces'] }),
  });

  const verifyTrace = useMutation({
    mutationFn: (traceId: string) =>
      Promise.resolve(brainModule.verifyTrace(traceId)),
  });

  const computeLearningRate = useMutation({
    mutationFn: (predictionError: number) =>
      Promise.resolve(brainModule.computeLearningRate(predictionError)),
  });

  const submitToDream = useMutation({
    mutationFn: (params: { description: string; priority?: number }) =>
      Promise.resolve(brainModule.submitToDream(params.description, params.priority)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'brain', 'dream_queue'] }),
  });

  const receiveDreamSolution = useMutation({
    mutationFn: (params: { problemId: string; solution: string }) =>
      Promise.resolve(brainModule.receiveDreamSolution(params.problemId, params.solution)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'brain', 'dream_queue'] }),
  });

  const validateDreamSolution = useMutation({
    mutationFn: (params: { problemId: string; valid: boolean }) =>
      Promise.resolve(brainModule.validateDreamSolution(params.problemId, params.valid)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'brain', 'dream_queue'] }),
  });

  return {
    // Legacy queries
    status, memoryState, patterns, curiosity, graphSummary,
    // v9.0.0 queries
    synapticState, workingMemory, metacognition, insightRegistry,
    causalGraph, reasoningTraces, dreamQueue,
    // Legacy mutations
    learn, remember, recall, query, reflect, forecast, synthesize,
    dream, deepThink, cognitiveCycle, explore, optimize, tier, prune,
    reinforce, graphBuild, memoryIngest, memoryRetrieve, memoryCycle,
    reasoningCycle, governanceCycle, coherenceCheck, sessionReflection,
    // v9.0.0 mutations
    multiStrategyReason, updateCognitiveLoad, setAttention,
    crystallizeInsight, searchInsights, scanContradictions,
    resolveContradiction, addCausalEdge, traceCausalChain,
    recordPrediction, addToWorkingMemory, clearWorkingMemory,
    fuseIntelligence, createReasoningTrace, appendTraceEntry,
    verifyTrace, computeLearningRate, submitToDream,
    receiveDreamSolution, validateDreamSolution,
  };
}

export default useBrain;
