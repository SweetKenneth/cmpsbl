/**
 * Evolution Mesh — Knowledge Packs
 * Exportable/importable bundles of learned patterns, rules, and strategies.
 * Enables structured knowledge transfer without cross-executor contamination.
 * Each pack is reviewed and curated before import.
 */

export interface KnowledgePack {
  id: string;
  name: string;
  version: string;
  description: string;
  sourceExecutorId: string;
  /** Domain this pack covers */
  domain: string;
  /** Curated patterns included */
  patterns: Array<{
    name: string;
    type: 'pattern' | 'anti_pattern';
    guidance: string;
    observedSuccessRate?: number;
  }>;
  /** Repair strategies included */
  repairStrategies: Array<{
    name: string;
    archetype: string;
    confidence: number;
  }>;
  /** Configuration recommendations */
  configRecommendations: Array<{
    key: string;
    value: unknown;
    rationale: string;
  }>;
  /** Metadata */
  exportedAt: number;
  importCount: number;
  status: 'draft' | 'reviewed' | 'published' | 'deprecated';
}

export interface ImportResult {
  packId: string;
  executorId: string;
  patternsImported: number;
  strategiesImported: number;
  configsApplied: number;
  skipped: string[];
  importedAt: number;
}

const knowledgePacks = new Map<string, KnowledgePack>();
const importHistory: ImportResult[] = [];
let packCounter = 0;

/**
 * Create a knowledge pack from executor learnings.
 */
export function createKnowledgePack(
  sourceExecutorId: string,
  name: string,
  domain: string,
  content: {
    patterns?: KnowledgePack['patterns'];
    repairStrategies?: KnowledgePack['repairStrategies'];
    configRecommendations?: KnowledgePack['configRecommendations'];
  },
  description: string = '',
): KnowledgePack {
  const id = `kp_${++packCounter}_${Date.now()}`;
  const pack: KnowledgePack = {
    id,
    name,
    version: '1.0.0',
    description,
    sourceExecutorId,
    domain,
    patterns: content.patterns ?? [],
    repairStrategies: content.repairStrategies ?? [],
    configRecommendations: content.configRecommendations ?? [],
    exportedAt: Date.now(),
    importCount: 0,
    status: 'draft',
  };
  knowledgePacks.set(id, pack);
  return pack;
}

/**
 * Review and publish a knowledge pack.
 */
export function publishPack(packId: string): boolean {
  const pack = knowledgePacks.get(packId);
  if (!pack || pack.status === 'deprecated') return false;
  pack.status = 'published';
  return true;
}

/**
 * Import a knowledge pack into an executor's context.
 * Only published packs can be imported.
 */
export function importKnowledgePack(packId: string, executorId: string): ImportResult | null {
  const pack = knowledgePacks.get(packId);
  if (!pack || pack.status !== 'published') return null;

  // Prevent self-import
  if (pack.sourceExecutorId === executorId) return null;

  const skipped: string[] = [];
  let patternsImported = 0;
  let strategiesImported = 0;
  let configsApplied = 0;

  // Import patterns (curated, not raw)
  for (const pattern of pack.patterns) {
    if (pattern.observedSuccessRate !== undefined && pattern.observedSuccessRate < 0.5) {
      skipped.push(`Pattern "${pattern.name}" — low success rate`);
      continue;
    }
    patternsImported++;
  }

  // Import strategies
  for (const strategy of pack.repairStrategies) {
    if (strategy.confidence < 0.6) {
      skipped.push(`Strategy "${strategy.name}" — low confidence`);
      continue;
    }
    strategiesImported++;
  }

  // Apply configs
  for (const config of pack.configRecommendations) {
    configsApplied++;
  }

  pack.importCount++;

  const result: ImportResult = {
    packId,
    executorId,
    patternsImported,
    strategiesImported,
    configsApplied,
    skipped,
    importedAt: Date.now(),
  };

  importHistory.push(result);
  return result;
}

/**
 * Get available published knowledge packs.
 */
export function getAvailablePacks(domain?: string): KnowledgePack[] {
  return Array.from(knowledgePacks.values())
    .filter(p => p.status === 'published' && (!domain || p.domain === domain))
    .sort((a, b) => b.importCount - a.importCount);
}

/**
 * Get all packs (including drafts) for a source executor.
 */
export function getPacksBySource(sourceExecutorId: string): KnowledgePack[] {
  return Array.from(knowledgePacks.values())
    .filter(p => p.sourceExecutorId === sourceExecutorId);
}

/**
 * Get import history for an executor.
 */
export function getImportHistory(executorId: string): ImportResult[] {
  return importHistory.filter(r => r.executorId === executorId);
}
