/**
 * useIntentMesh Hook — INTENT module operations
 * Full capability surface: broadcasting, discovery, pipelines,
 * A/B experiments, federation, health, patterns, CLM feedback.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  // Router
  broadcastIntent,
  getRecentReceipts,
  getMeshStats,
  // Toggle
  isMeshEnabled,
  enableMesh,
  disableMesh,
  // Pipelines
  getSavedPipelines,
  savePipelineFromReceipt,
  runSavedPipeline,
  deletePipeline,
  // Discovery
  analyzeGaps,
  generateRecommendations,
  runDiscoveryCycle,
  getOpenGaps,
  getPendingRecommendations,
  applyRecommendation,
  // Module self-discovery
  runAllModuleDiscovery,
  getModuleDiscoveryStates,
  approveProposal,
  rejectProposal,
  // Intent scoring
  getIntentLeaderboard,
  // CLM feedback
  runCLMFeedbackLoop,
  getCLMFeedbackSummary,
  // Live gap execution
  runLiveGapExecution,
  // Affinity
  buildAffinityMatrix,
  // Pattern recognition
  detectPatterns,
  getLatestPatterns,
  // Mesh health
  checkMeshHealth,
  // Federation
  getFederationConfig,
  getFederationStats,
  getKnownPeers,
  // Composite chains
  discoverChains,
  findOptimalChain,
  executeChain,
  // Manifest
  getMeshModules,
  type MeshIntent,
  type MeshReceipt,
} from '@/lib/substrate/intent-mesh';

export interface UseIntentMeshReturn {
  // Queries
  stats: ReturnType<typeof useQuery>;
  enabled: ReturnType<typeof useQuery>;
  pipelines: ReturnType<typeof useQuery>;
  openGaps: ReturnType<typeof useQuery>;
  pendingRecommendations: ReturnType<typeof useQuery>;
  discoveryStates: ReturnType<typeof useQuery>;
  leaderboard: ReturnType<typeof useQuery>;
  clmFeedback: ReturnType<typeof useQuery>;
  latestPatterns: ReturnType<typeof useQuery>;
  meshHealth: ReturnType<typeof useQuery>;
  federationConfig: ReturnType<typeof useQuery>;
  federationStats: ReturnType<typeof useQuery>;
  knownPeers: ReturnType<typeof useQuery>;
  modules: ReturnType<typeof useQuery>;

  // Core mutations
  broadcast: ReturnType<typeof useMutation>;
  fetchReceipts: ReturnType<typeof useMutation>;
  enable: ReturnType<typeof useMutation>;
  disable: ReturnType<typeof useMutation>;

  // Pipelines
  savePipeline: ReturnType<typeof useMutation>;
  runPipeline: ReturnType<typeof useMutation>;
  deletePipeline: ReturnType<typeof useMutation>;

  // Discovery
  analyzeGaps: ReturnType<typeof useMutation>;
  generateRecommendations: ReturnType<typeof useMutation>;
  applyRecommendation: ReturnType<typeof useMutation>;
  runDiscovery: ReturnType<typeof useMutation>;
  runAllModuleDiscovery: ReturnType<typeof useMutation>;
  approveProposal: ReturnType<typeof useMutation>;
  rejectProposal: ReturnType<typeof useMutation>;

  // Intelligence
  runCLMFeedback: ReturnType<typeof useMutation>;
  runLiveGapExecution: ReturnType<typeof useMutation>;
  buildAffinity: ReturnType<typeof useMutation>;
  detectPatterns: ReturnType<typeof useMutation>;

  // Chains
  discoverChains: ReturnType<typeof useMutation>;
  findOptimalChain: ReturnType<typeof useMutation>;
  executeChain: ReturnType<typeof useMutation>;
}

export function useIntentMesh(): UseIntentMeshReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'intent'] });

  // ── Queries ──
  const stats = useQuery({
    queryKey: ['substrate', 'intent', 'stats'],
    queryFn: () => getMeshStats(),
    refetchInterval: pollingEnabled ? 15000 : false,
    staleTime: 5000,
    enabled: pollingEnabled,
  });

  const enabled = useQuery({
    queryKey: ['substrate', 'intent', 'enabled'],
    queryFn: () => ({ enabled: isMeshEnabled() }),
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const pipelines = useQuery({
    queryKey: ['substrate', 'intent', 'pipelines'],
    queryFn: () => getSavedPipelines(),
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const openGaps = useQuery({
    queryKey: ['substrate', 'intent', 'gaps'],
    queryFn: () => getOpenGaps(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const pendingRecommendations = useQuery({
    queryKey: ['substrate', 'intent', 'recommendations'],
    queryFn: () => getPendingRecommendations(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const discoveryStates = useQuery({
    queryKey: ['substrate', 'intent', 'discoveryStates'],
    queryFn: () => getModuleDiscoveryStates(),
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const leaderboard = useQuery({
    queryKey: ['substrate', 'intent', 'leaderboard'],
    queryFn: () => getIntentLeaderboard(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const clmFeedback = useQuery({
    queryKey: ['substrate', 'intent', 'clmFeedback'],
    queryFn: () => getCLMFeedbackSummary(),
    staleTime: 60000,
    enabled: pollingEnabled,
  });

  const latestPatterns = useQuery({
    queryKey: ['substrate', 'intent', 'patterns'],
    queryFn: () => getLatestPatterns(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const meshHealth = useQuery({
    queryKey: ['substrate', 'intent', 'meshHealth'],
    queryFn: () => checkMeshHealth(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const federationConfig = useQuery({
    queryKey: ['substrate', 'intent', 'federationConfig'],
    queryFn: () => getFederationConfig(),
    staleTime: 60000,
    enabled: pollingEnabled,
  });

  const federationStatsQ = useQuery({
    queryKey: ['substrate', 'intent', 'federationStats'],
    queryFn: () => getFederationStats(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const knownPeersQ = useQuery({
    queryKey: ['substrate', 'intent', 'peers'],
    queryFn: () => getKnownPeers(),
    staleTime: 60000,
    enabled: pollingEnabled,
  });

  const modules = useQuery({
    queryKey: ['substrate', 'intent', 'modules'],
    queryFn: () => getMeshModules(),
    staleTime: 120000,
    enabled: pollingEnabled,
  });

  // ── Core Mutations ──
  const broadcast = useMutation({
    mutationFn: (intent: MeshIntent) => broadcastIntent(intent),
    onSuccess: invalidate,
  });

  const fetchReceipts = useMutation({
    mutationFn: (params?: { limit?: number }) =>
      Promise.resolve(getRecentReceipts(params?.limit)),
  });

  const enableMut = useMutation({
    mutationFn: () => Promise.resolve(enableMesh()),
    onSuccess: invalidate,
  });

  const disableMut = useMutation({
    mutationFn: () => Promise.resolve(disableMesh()),
    onSuccess: invalidate,
  });

  // ── Pipelines ──
  const savePipeline = useMutation({
    mutationFn: (params: { receipt: MeshReceipt; name: string }) =>
      savePipelineFromReceipt(params.receipt, params.name),
    onSuccess: invalidate,
  });

  const runPipeline = useMutation({
    mutationFn: (params: { pipeline: any }) =>
      runSavedPipeline(params.pipeline),
    onSuccess: invalidate,
  });

  const deletePipelineMut = useMutation({
    mutationFn: (params: { pipelineId: string }) =>
      deletePipeline(params.pipelineId),
    onSuccess: invalidate,
  });

  // ── Discovery ──
  const analyzeGapsMut = useMutation({
    mutationFn: () => analyzeGaps(),
    onSuccess: invalidate,
  });

  const generateRecommendationsMut = useMutation({
    mutationFn: (params: { gaps: any[] }) =>
      Promise.resolve(generateRecommendations(params.gaps)),
    onSuccess: invalidate,
  });

  const applyRecommendationMut = useMutation({
    mutationFn: (params: { recommendationId: string }) =>
      applyRecommendation(params.recommendationId),
    onSuccess: invalidate,
  });

  const runDiscovery = useMutation({
    mutationFn: () => runDiscoveryCycle(),
    onSuccess: invalidate,
  });

  const runAllModuleDiscoveryMut = useMutation({
    mutationFn: () => runAllModuleDiscovery(),
    onSuccess: invalidate,
  });

  const approveProposalMut = useMutation({
    mutationFn: (params: { proposalId: string }) =>
      approveProposal(params.proposalId),
    onSuccess: invalidate,
  });

  const rejectProposalMut = useMutation({
    mutationFn: (params: { proposalId: string }) =>
      rejectProposal(params.proposalId),
    onSuccess: invalidate,
  });

  // ── Intelligence ──
  const runCLMFeedback = useMutation({
    mutationFn: () => runCLMFeedbackLoop(),
    onSuccess: invalidate,
  });

  const runLiveGapExecutionMut = useMutation({
    mutationFn: () => runLiveGapExecution(),
    onSuccess: invalidate,
  });

  const buildAffinity = useMutation({
    mutationFn: () => buildAffinityMatrix(),
  });

  const detectPatternsMut = useMutation({
    mutationFn: () => detectPatterns(),
    onSuccess: invalidate,
  });

  // ── Chains ──
  const discoverChainsMut = useMutation({
    mutationFn: (params: { seedInputKeys: string[]; options?: { maxDepth?: number; maxChains?: number } }) =>
      Promise.resolve(discoverChains(params.seedInputKeys, params.options)),
  });

  const findOptimalChainMut = useMutation({
    mutationFn: (params: { intentType: string; inputKeys: string[] }) =>
      Promise.resolve(findOptimalChain(params.intentType, params.inputKeys)),
  });

  const executeChainMut = useMutation({
    mutationFn: (params: { chain: any; initialInput: Record<string, unknown> }) =>
      executeChain(params.chain, params.initialInput),
    onSuccess: invalidate,
  });

  return {
    stats,
    enabled,
    pipelines,
    openGaps,
    pendingRecommendations,
    discoveryStates,
    leaderboard,
    clmFeedback,
    latestPatterns,
    meshHealth,
    federationConfig,
    federationStats: federationStatsQ,
    knownPeers: knownPeersQ,
    modules,
    broadcast,
    fetchReceipts,
    enable: enableMut,
    disable: disableMut,
    savePipeline,
    runPipeline,
    deletePipeline: deletePipelineMut,
    analyzeGaps: analyzeGapsMut,
    generateRecommendations: generateRecommendationsMut,
    applyRecommendation: applyRecommendationMut,
    runDiscovery,
    runAllModuleDiscovery: runAllModuleDiscoveryMut,
    approveProposal: approveProposalMut,
    rejectProposal: rejectProposalMut,
    runCLMFeedback,
    runLiveGapExecution: runLiveGapExecutionMut,
    buildAffinity,
    detectPatterns: detectPatternsMut,
    discoverChains: discoverChainsMut,
    findOptimalChain: findOptimalChainMut,
    executeChain: executeChainMut,
  };
}
