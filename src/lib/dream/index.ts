/**
 * DREAM Module
 * Nocturnal Processing & Autonomous Learning Synthesis
 * 
 * The unconscious layer for:
 * - Memory consolidation during low-activity periods
 * - Cross-pattern recognition and fusion
 * - Nightmare detection and mitigation
 * - Autonomous learning synthesis
 */

// Scheduler - low-activity period detection
export {
  getSystemLoad,
  findOptimalDreamWindow,
  scheduleDreamCycle,
  shouldDreamNow,
  executePendingDreams,
  getDreamScheduleStatus,
  type DreamSchedule,
  type SystemLoadMetrics,
} from './scheduler';

// Cross-pattern recognition
export {
  analyzeCrossDreamPatterns,
  getPatternHistory,
  type DreamPattern,
  type PatternCluster,
} from './crossPatternRecognition';

// Nightmare detection & mitigation (simulation only)
export {
  createNightmareScenario,
  createNightmareArtifact,
  assertSimulationOnly,
  REFERENCE_NIGHTMARES,
  NIGHTMARE_MODE_VERSION,
  NIGHTMARE_MODE_STATUS,
  type NightmareVector,
  type NightmareSeverity,
  type NightmareScenario,
  type NightmareArtifact,
} from './nightmares';

// Insight extraction & knowledge synthesis
export * from './insightExtraction';
 
// Creative synthesis
export * from './creativeSynthesis';

// Pattern mutation
export * from './patternMutation';

// Insight generator
export {
  type InsightType,
  type InsightConfidence,
  type GeneratedInsight,
  type InsightGeneratorConfig,
  generateInsights,
  getCachedInsights,
  acknowledgeInsight as acknowledgeGeneratedInsight,
  getInsightStats as getGeneratedInsightStats,
  updateInsightConfig,
  clearInsightCache,
} from './insightGenerator';

// Lineage provenance tracker
export * from './lineageTracker';

// Semantic drift detection
export * from './semanticDrift';

// Dream candidate filter pipeline
export * from './candidateFilter';

// Heuristic builder
export {
  CONFIDENCE_DECAY_FACTOR,
  MAX_COUNTER_EXAMPLES,
  type DreamHeuristic,
  buildHeuristic,
  recordCounterExample,
  validateHeuristic,
  getHeuristics,
  getHeuristicStats,
} from './heuristicBuilder';

// Consolidation orchestrator
export * from './consolidationOrchestrator';

// Lucid dreaming mode
export * from './lucidDreaming';

// Dream journal
export * from './dreamJournal';

// Subconscious priority queue
export * from './subconsciousQueue';

// Coherence validator
export * from './coherenceValidator';

// Dream metrics dashboard feed
export * from './dreamMetricsFeed';

// Version info
export const DREAM_VERSION = '8.0.0';
export const DREAM_CODENAME = 'Nocturne';

// Dream cycle types
export type DreamCycleType = 
  | 'consolidation'  // Memory compression and tiering
  | 'mutation'       // Pattern variation and evolution
  | 'reflection'     // Cross-domain insight synthesis
  | 'synthesis';     // New pattern generation

// Dream state
export interface DreamState {
  isActive: boolean;
  currentCycle: DreamCycleType | null;
  lastCycleAt: string | null;
  totalCycles: number;
  successfulCycles: number;
  insightsGenerated: number;
  nightmaresDetected: number;
}

// In-memory dream state
let dreamState: DreamState = {
  isActive: false,
  currentCycle: null,
  lastCycleAt: null,
  totalCycles: 0,
  successfulCycles: 0,
  insightsGenerated: 0,
  nightmaresDetected: 0,
};

/**
 * Get current dream state
 */
export function getDreamState(): DreamState {
  return { ...dreamState };
}

/**
 * Update dream state
 */
export function updateDreamState(updates: Partial<DreamState>): void {
  dreamState = { ...dreamState, ...updates };
}

/**
 * Start a dream cycle
 */
export async function startDreamCycle(type: DreamCycleType): Promise<{
  success: boolean;
  cycleId: string;
  message: string;
}> {
  if (dreamState.isActive) {
    return {
      success: false,
      cycleId: '',
      message: 'Dream cycle already in progress',
    };
  }
  
  const cycleId = `dream_${Date.now()}_${type}`;
  
  dreamState = {
    ...dreamState,
    isActive: true,
    currentCycle: type,
  };
  
  return {
    success: true,
    cycleId,
    message: `Started ${type} dream cycle`,
  };
}

/**
 * End a dream cycle
 */
export function endDreamCycle(success: boolean, insightsCount: number = 0): void {
  dreamState = {
    ...dreamState,
    isActive: false,
    currentCycle: null,
    lastCycleAt: new Date().toISOString(),
    totalCycles: dreamState.totalCycles + 1,
    successfulCycles: dreamState.successfulCycles + (success ? 1 : 0),
    insightsGenerated: dreamState.insightsGenerated + insightsCount,
  };
}

/**
 * Record a nightmare detection
 */
export function recordNightmare(): void {
  dreamState = {
    ...dreamState,
    nightmaresDetected: dreamState.nightmaresDetected + 1,
  };
}

/**
 * Get dream analytics
 */
export function getDreamAnalytics(): {
  successRate: number;
  avgInsightsPerCycle: number;
  nightmareRate: number;
  status: 'healthy' | 'degraded' | 'critical';
} {
  const successRate = dreamState.totalCycles > 0
    ? dreamState.successfulCycles / dreamState.totalCycles
    : 1;
  
  const avgInsightsPerCycle = dreamState.successfulCycles > 0
    ? dreamState.insightsGenerated / dreamState.successfulCycles
    : 0;
  
  const nightmareRate = dreamState.totalCycles > 0
    ? dreamState.nightmaresDetected / dreamState.totalCycles
    : 0;
  
  let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
  if (successRate < 0.5 || nightmareRate > 0.3) {
    status = 'critical';
  } else if (successRate < 0.8 || nightmareRate > 0.1) {
    status = 'degraded';
  }
  
  return { successRate, avgInsightsPerCycle, nightmareRate, status };
}
