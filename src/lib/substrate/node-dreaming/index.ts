/**
 * Node-Level Dreaming — Public API
 * 
 * Every substrate node can dream: synthesizing data during
 * low-activity periods instead of just compiling via CLM.
 * 
 * Dream tiers:
 *   A (4h): BRAIN, MEMORY, DEFENSE, NEXUS
 *   B (6h): CONSCIENCE, VISION, MEDIC, CORTEX, DECODE, ENCODE
 *   C (12h): All remaining nodes
 */

export type {
  DreamTier,
  DreamCycleType,
  NodeDreamConfig,
  CrossInsight,
  DreamReport,
  DreamScheduleEntry,
} from './types';

export {
  DREAM_TIER_INTERVALS,
  DEFAULT_DREAM_BUDGET,
  HEURISTIC_AUTO_APPLY_THRESHOLD,
} from './types';

export {
  fetchDreamConfigs,
  getEligibleDreamers,
  selectCycleType,
  triggerNodeDream,
  fetchDreamLogs,
  getDreamAnalyticsSummary,
} from './engine';

export const NODE_DREAMING_VERSION = '1.0.0';
export const NODE_DREAMING_CODENAME = 'Somnium';
