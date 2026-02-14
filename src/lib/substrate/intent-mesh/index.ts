/**
 * Intent Mesh — Module Exports
 * v10.2.0 — Emergent Module Intelligence Layer
 * 
 * The Intent Mesh enables autonomous cross-module capability discovery
 * and composition. Modules broadcast intents, the mesh routes to capable
 * resolvers, and every interaction produces an auditable receipt.
 * 
 * v10.2 additions:
 * - Per-module self-discovery (21 modules discover their own capabilities)
 * - Intent quality scoring (modules learn which intents get best responses)
 * - Auto-expansion scheduler (periodic self-improvement cycles)
 * 
 * Kill switch: mesh.toggle (off by default)
 * Dashboard: /os → Observe → Mesh Activity
 * Terminal: mesh.status, mesh.log, mesh.toggle, mesh.broadcast, mesh.discover.all
 */

// Types
export type {
  MeshResolver,
  MeshIntent,
  ResolverResponse,
  MeshResolution,
  MeshReceipt,
  MeshStatus,
} from './types';

// Manifest — the capability "phone book"
export {
  MESH_MANIFEST,
  getModuleResolvers,
  getResolversByDomain,
  getResolversByOutput,
  getMeshModules,
} from './manifest';

// Router — intent broadcasting and resolution
export {
  broadcastIntent,
  getRecentReceipts,
  getMeshStats,
  flushGapDetection,
} from './router';

// Toggle — kill switch
export {
  useMeshToggle,
  isMeshEnabled,
  enableMesh,
  disableMesh,
} from './toggle';

// Pipelines — crystallized mesh configurations
export {
  getSavedPipelines,
  savePipelineFromReceipt,
  runSavedPipeline,
  deletePipeline,
  type MeshSavedPipeline,
} from './pipelines';

// Discovery Engine — autonomous gap analysis and capability expansion
export {
  analyzeGaps,
  generateRecommendations,
  analyzeModuleAffinity,
  runDiscoveryCycle,
  getOpenGaps,
  getPendingRecommendations,
  applyRecommendation,
  getDiscoveryHistory,
  type CapabilityGap,
  type CapabilityRecommendation,
  type DiscoveryRunResult,
} from './discovery-engine';

// Refinement Engine — multi-turn intent resolution
export {
  resolveWithRefinement,
  shouldRefine,
  type RefinementResult,
  type RefinementContext,
} from './refinement';

// Composite Chains — resolver chaining for richer responses
export {
  discoverChains,
  findOptimalChain,
  executeChain,
  getChainSummary,
  type CompositeChain,
  type CompositeResult,
} from './composite';

// Module Self-Discovery — per-module autonomous capability discovery
export {
  runModuleDiscovery,
  runAllModuleDiscovery,
  persistProposals,
  approveProposal,
  rejectProposal,
  getModuleDiscoveryStates,
  getDiscoveryModules,
  type ModuleProposal,
  type ModuleDiscoveryResult,
  type ModuleDiscoveryState,
} from './module-discovery';

// Intent Quality Scoring — learn which intents get best responses
export {
  scoreResolution,
  calculateIntentScores,
  getIntentLeaderboard,
  getModuleIntentInsights,
  type IntentQualityScore,
  type IntentLeaderboard,
} from './intent-scoring';

// Auto-Expansion Scheduler — periodic self-improvement cycles
export {
  meshScheduler,
  type SchedulerConfig,
  type SchedulerState,
} from './auto-scheduler';

// CLM Feedback Loop — scoring insights auto-feed into module learning
export {
  runCLMFeedbackLoop,
  getDynamicTopics,
  getDynamicTopicStrings,
  getCLMFeedbackSummary,
  clearDynamicTopics,
  type CLMFeedbackInsight,
  type CLMFeedbackResult,
} from './clm-feedback';
