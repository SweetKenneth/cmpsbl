/**
 * Memory Stream Lineage Registry
 * Tracks module ancestry of crystallized pipelines.
 * Capped at 1000 entries with FIFO eviction.
 */

export interface PipelineLineageRecord {
  id: string;
  pipelineName: string;
  modules: string[];
  cjpi: number | null;
  crystallizedAt: string;
}

const MAX_ENTRIES = 1000;
const registry: PipelineLineageRecord[] = [];

/**
 * Record the lineage of a crystallized pipeline.
 * @param name Pipeline name
 * @param modules Participating module IDs (will be uppercased)
 * @param cjpi Optional CJPI score
 */
export function recordPipelineLineage(
  name: string,
  modules: string[],
  cjpi?: number | null,
): PipelineLineageRecord {
  const record: PipelineLineageRecord = {
    id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    pipelineName: name,
    modules: modules.map(m => m.toUpperCase()),
    cjpi: cjpi ?? null,
    crystallizedAt: new Date().toISOString(),
  };
  registry.push(record);
  if (registry.length > MAX_ENTRIES) {
    registry.splice(0, registry.length - MAX_ENTRIES);
  }
  return record;
}

/**
 * Get pipeline lineage records (most recent first).
 */
export function getPipelineLineage(limit?: number): PipelineLineageRecord[] {
  const entries = [...registry].reverse();
  return limit ? entries.slice(0, limit) : entries;
}

/**
 * Get lineage for a specific pipeline by name.
 */
export function getLineageByName(pipelineName: string): PipelineLineageRecord | undefined {
  for (let i = registry.length - 1; i >= 0; i--) {
    if (registry[i].pipelineName === pipelineName) return registry[i];
  }
  return undefined;
}

/**
 * Get total count of lineage records.
 */
export function getLineageCount(): number {
  return registry.length;
}
