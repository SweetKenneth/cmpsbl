/**
 * Cognitive Capabilities — Module Index
 * 4 capabilities that enhance node cognition without destabilizing the substrate.
 * 
 * 1. Self-Assessment Probes: Periodic recall accuracy + confidence calibration
 * 2. Cross-Node Insight Sharing: Lateral validated heuristic sharing via Gen-1 lineage
 * 3. Selective Memory Replay: Consolidate high-value memories during dream cycles
 * 4. Contradiction Budgeting: Per-cycle limit on memory self-correction
 */

export {
  runSelfAssessment,
  getSelfAssessmentHistory,
  type SelfAssessmentResult,
} from './self-assessment';

export {
  shareInsight,
  receiveInsights,
  getInsightRegistry,
  type SharedInsight,
  type InsightSharingConfig,
} from './insight-sharing';

export {
  replayHighValueMemories,
  getReplayHistory,
  type MemoryReplayResult,
  type ReplayConfig,
} from './selective-replay';

export {
  enforceContradictionBudget,
  getContradictionBudgetState,
  resetContradictionBudget,
  type ContradictionBudgetState,
  type ContradictionBudgetConfig,
} from './contradiction-budget';

export const COGNITIVE_CAPABILITIES_VERSION = '1.0.0';
export const COGNITIVE_CAPABILITIES_CODENAME = 'Synapse';
