/**
 * Dream Lineage & Semantic Drift Protection — Type Definitions
 * Tracks provenance of all synthesized memories and heuristics.
 */

/** Provenance metadata attached to every memory */
export interface MemoryLineage {
  source_events: string[];
  derived_from: string[];
  generation: number;
  confidence: number;
}

/** Maximum allowed abstraction depth before forcing raw refresh */
export const MAX_GENERATION = 3;

/** Dream metrics surfaced in ATLAS */
export interface DreamMetrics {
  node_id: string;
  dreams_last_24h: number;
  heuristics_generated: number;
  contradictions_resolved: number;
  avg_generation_depth: number;
  drift_alerts: number;
}
