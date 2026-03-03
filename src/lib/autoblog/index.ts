/**
 * AutoBlog Primitive v5.0.0
 * Governed, autonomous, self-learning blog automation
 * with unified epistemic calibration, content expansion, and adaptive governance
 *
 * v5 additions:
 *  - Semantic Drift Detection (calibration only)
 *  - Adaptive Confidence Weight Governance
 *  - Slow Site Scanner (topic seeding)
 *  - Cyclical Length Cadence (850/850/1200)
 *  - Contextual Internal Interlinking
 *  - Enhanced Image Density
 *  - Self-Selected Publish Governor (token bucket + readiness)
 */

// Core orchestration
export { getAutoblogStatus, autoblogPlan, autoblogDraft, autoblogVerify, autoblogPublish, autoblogPublishAll, autoblogAbort } from './orchestrator';
export { getAutoblogSettings, updateAutoblogSettings, getAutoblogQueue, getAutoblogRuns } from './store';

// Circuit breaker & healing
export { checkAutoblogCircuit, tripAutoblogCircuit, resetAutoblogCircuit } from './circuit';
export { healAutoblog } from './heal';

// Autonomous modes
export { startAutonomousMode, stopAutonomousMode, getAutonomousState } from './autonomous-engine';
export { startCLMMode, stopCLMMode, getCLMState, getCLMStatus } from './clm-engine';
export { startFullAuto, stopAuto, getAutoStatus, getAutoState } from './autonomous-controller';

// Content generation
export { seedAutoblogPosts, quickSeed } from './seeder';
export { publishDraft, publishAllReady, assessContent } from './publisher';
export { generateInsightfulContent, pickOptimalTopic, getTopicInventory, DEEP_TOPICS } from './content-intelligence';

// Quality pipeline (v4)
export {
  runQualityPipeline,
  computeConfidence,
  runContradictionEngine,
  runSplitBrain,
  extractAssumptions,
  checkAssumptionBreaks,
  type QualityPipelineResult,
  type ConfidenceResult,
  type ContradictionResult,
  type SplitBrainResult,
  type ExtractedAssumption,
} from './quality-pipeline';

// Memory compression (v4)
export {
  runMemoryCompression,
  shouldRunMemoryCompression,
  getLatestMemoryReport,
  type MemoryReport,
} from './memory-compression';

// Semantic Drift (v5)
export {
  evaluateSemanticDrift,
  type SemanticDriftResult,
  type DriftDirection,
} from './semantic-drift';

// Adaptive Confidence Governor (v5)
export {
  getEffectiveWeights,
  updateWeights,
  DEFAULT_WEIGHTS,
  type ConfidenceWeights,
} from './confidence-governor';

// Site Scanner (v5)
export {
  runSiteScan,
  getTopicSeedAlignment,
  type ScanResult,
  type SiteScanSummary,
} from './site-scanner';

// Length Cadence (v5)
export {
  getTargetWordLength,
  incrementPublishCount,
  buildLengthInstruction,
  type LengthTarget,
} from './length-cadence';

// Interlinker (v5)
export {
  injectInternalLinks,
  type InterlinkResult,
} from './interlinker';

// Image Expander (v5)
export {
  expandImages,
  type ImageExpansionResult,
} from './image-expander';

// Publish Governor (v5)
export {
  getGovernorDecision,
  consumeToken,
  resetStreak,
  type GovernorDecision,
  type GovernorSignals,
  type GovernorResult,
} from './publish-governor';

// Types
export type { AutoblogSettings, AutoblogQueueItem, AutoblogDraft, AutoblogRun, AutonomousState } from './types';

export const AUTOBLOG_VERSION = '5.0.0';
