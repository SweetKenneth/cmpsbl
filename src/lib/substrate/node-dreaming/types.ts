/**
 * Node-Level Dreaming — Type Definitions
 * Offline synthesis and pattern refinement for all substrate nodes.
 */

export type DreamTier = 'A' | 'B' | 'C';

export type DreamCycleType =
  | 'consolidation'   // Memory compression and tiering
  | 'contradiction'   // Scan for conflicting memories
  | 'cross_pollination' // Pull insights from adjacent nodes
  | 'heuristic_gen'   // Generate new heuristics from patterns
  | 'decay';          // Accelerate SM-2 decay for low-value memories

export interface NodeDreamConfig {
  nodeId: string;
  dreamTier: DreamTier;
  intervalHours: number;
  dreamThreshold: number;
  budgetPerCycle: number;
  enabled: boolean;
  lastDreamAt: string | null;
  totalDreams: number;
  totalInsights: number;
}

export interface CrossInsight {
  sourceNode: string;
  targetNode: string;
  insightType: 'improvement' | 'discovery' | 'warning' | 'contradiction';
  confidence: number;
  summary: string;
  memoryIds?: string[];
}

export interface DreamReport {
  nodeId: string;
  dreamTier: DreamTier;
  cycleType: DreamCycleType;
  dreamtAt: string;
  contradictionsFound: number;
  patternsMerged: number;
  heuristicsProposed: number;
  memoriesDecayed: number;
  crossInsights: CrossInsight[];
  budgetUsed: number;
  budgetMax: number;
  durationMs: number;
  success: boolean;
  errorMessage?: string;
}

export interface DreamScheduleEntry {
  nodeId: string;
  dreamTier: DreamTier;
  nextDreamAt: Date;
  eligible: boolean;
  memoriesSinceLastDream: number;
}

/** Tier → interval mapping (hours) */
export const DREAM_TIER_INTERVALS: Record<DreamTier, number> = {
  A: 4,
  B: 6,
  C: 12,
};

/** Maximum vector comparisons per dream cycle */
export const DEFAULT_DREAM_BUDGET = 50;

/** Minimum confidence for auto-applying a heuristic */
export const HEURISTIC_AUTO_APPLY_THRESHOLD = 0.85;
