/**
 * AutoBlog Primitive v4.0.0
 * Governed, autonomous, self-learning blog automation with quality pipeline
 *
 * v4 additions (ported from RCRDBL):
 *  - Confidence Engine (multi-factor scoring)
 *  - Contradiction Engine (adversarial quality gate)
 *  - Split Brain Evaluation (reader/skeptic dual review)
 *  - Assumption Labeler (extract + track assumptions)
 *  - Monthly Memory Compression (self-reflection)
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

// Types
export type { AutoblogSettings, AutoblogQueueItem, AutoblogDraft, AutoblogRun, AutonomousState } from './types';

export const AUTOBLOG_VERSION = '4.0.0';
