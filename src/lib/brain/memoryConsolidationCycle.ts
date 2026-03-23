/**
 * CMPSBL® BRAIN — Memory Consolidation Cycle ("Sleep Cycle")
 * Automated merge, compress, and deduplicate process for memory tiers.
 *
 * Runs periodically to:
 * 1. Merge similar memories into consolidated summaries
 * 2. Compress low-value memories
 * 3. Promote reinforced memories, demote decayed ones
 * 4. Generate consolidation reports
 *
 * Integrates with: contradictionDetector, hebbianPathways, plasticityGovernor
 */

import { getContradictionDetector } from './contradictionDetector';
import { getHebbianEngine } from './hebbianPathways';
import { getPlasticityGovernor } from './neuralPlasticity';
import { tokenizeToSet, jaccardSimilarity, extractKeywords } from './shared';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConsolidationCycleInput {
  id: string;
  content: string;
  context: string;
  tier: 'hot' | 'warm' | 'cold' | 'glacier';
  valueScore: number;
  accessCount: number;
  createdAt: string;
}

export interface ConsolidationCycleResult {
  cycleId: string;
  startedAt: number;
  duration: number;
  memoriesProcessed: number;
  mergedGroups: number;
  promotions: number;
  demotions: number;
  contradictionsFound: number;
  pathwaysStrengthened: number;
  spaceRecoveredEstimate: number; // bytes
}

export interface MergeGroup {
  canonicalId: string;
  mergedIds: string[];
  mergedContent: string;
  similarity: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

let cycleCounter = 0;

/**
 * Run a full consolidation cycle on a set of memories.
 */
export function runConsolidationCycle(memories: ConsolidationCycleInput[]): ConsolidationCycleResult {
  const start = Date.now();
  const cycleId = `consolidation-${++cycleCounter}`;
  const plasticity = getPlasticityGovernor();
  const hebbian = getHebbianEngine();
  const contradictions = getContradictionDetector();

  let mergedGroups = 0;
  let promotions = 0;
  let demotions = 0;
  let contradictionsFound = 0;
  let pathwaysStrengthened = 0;
  let spaceRecovered = 0;

  // Phase 1: Find similar memory groups for merging
  const groups = findMergeGroups(memories, 0.7);
  mergedGroups = groups.length;
  spaceRecovered = groups.reduce((s, g) => s + g.mergedIds.length * 100, 0); // rough estimate

  // Phase 2: Detect contradictions within each tier
  const tierGroups = new Map<string, ConsolidationCycleInput[]>();
  for (const m of memories) {
    const list = tierGroups.get(m.tier) || [];
    list.push(m);
    tierGroups.set(m.tier, list);
  }

  for (const [, tierMemories] of tierGroups) {
    if (tierMemories.length < 2) continue;
    // Sample check: compare recent memories against older ones
    const recent = tierMemories.slice(0, 10);
    const older = tierMemories.slice(10, 30);
    if (older.length === 0) continue;

    for (const newMem of recent) {
      const result = contradictions.detect(
        newMem.content,
        newMem.id,
        older.map(m => ({ id: m.id, content: m.content, createdAt: m.createdAt }))
      );
      contradictionsFound += result.contradictions.length;
    }
  }

  // Phase 3: Tier promotion/demotion recommendations
  for (const m of memories) {
    const learningRate = plasticity.getEffectiveRate(0.5);

    if (m.tier === 'warm' && m.accessCount > 10 && m.valueScore > 0.7) {
      promotions++; // Recommend promote to hot
      hebbian.recordAccess(m.id, m.context);
      pathwaysStrengthened++;
    }

    if (m.tier === 'hot' && m.accessCount <= 1 && m.valueScore < 0.3) {
      demotions++; // Recommend demote to warm
    }

    // Record learning outcome for plasticity tracking
    if (m.accessCount > 0) {
      plasticity.recordOutcome({
        success: m.valueScore > 0.5,
        novelty: Math.min(1, 1 / (m.accessCount + 1)),
        impact: learningRate * m.valueScore,
        domain: m.context,
      });
    }
  }

  // Phase 4: Strengthen co-accessed memory pathways
  const hotMemories = memories.filter(m => m.tier === 'hot').slice(0, 20);
  if (hotMemories.length >= 2) {
    // Group by context and strengthen within-context pathways
    const contextGroups = new Map<string, string[]>();
    for (const m of hotMemories) {
      const list = contextGroups.get(m.context) || [];
      list.push(m.id);
      contextGroups.set(m.context, list);
    }
    for (const [ctx, ids] of contextGroups) {
      if (ids.length >= 2) {
        hebbian.strengthenPathway(ids.slice(0, 5), ctx);
        pathwaysStrengthened += ids.length;
      }
    }
  }

  return {
    cycleId,
    startedAt: start,
    duration: Date.now() - start,
    memoriesProcessed: memories.length,
    mergedGroups,
    promotions,
    demotions,
    contradictionsFound,
    pathwaysStrengthened,
    spaceRecoveredEstimate: spaceRecovered,
  };
}

/**
 * Find groups of similar memories that can be merged.
 */
function findMergeGroups(memories: ConsolidationCycleInput[], threshold: number): MergeGroup[] {
  const groups: MergeGroup[] = [];
  const merged = new Set<string>();

  // Pre-tokenize all memories
  const tokenSets = memories.map(m => ({
    memory: m,
    tokens: tokenizeToSet(m.content),
  }));

  for (let i = 0; i < tokenSets.length; i++) {
    if (merged.has(tokenSets[i].memory.id)) continue;

    const group: ConsolidationCycleInput[] = [tokenSets[i].memory];

    for (let j = i + 1; j < tokenSets.length; j++) {
      if (merged.has(tokenSets[j].memory.id)) continue;

      const similarity = jaccardSimilarity(tokenSets[i].tokens, tokenSets[j].tokens);
      if (similarity >= threshold) {
        group.push(tokenSets[j].memory);
        merged.add(tokenSets[j].memory.id);
      }
    }

    if (group.length >= 2) {
      // Choose highest-value as canonical
      group.sort((a, b) => b.valueScore - a.valueScore);
      const canonical = group[0];
      const keywords = extractKeywords(group.map(g => g.content).join(' ')).slice(0, 10);

      groups.push({
        canonicalId: canonical.id,
        mergedIds: group.slice(1).map(g => g.id),
        mergedContent: `[Consolidated ${group.length} memories] Key: ${keywords.join(', ')}. Primary: ${canonical.content.slice(0, 200)}`,
        similarity: threshold,
      });

      merged.add(canonical.id);
    }
  }

  return groups;
}

/** Get consolidation cycle counter */
export function getConsolidationCycleCount(): number {
  return cycleCounter;
}

export function resetConsolidationCycles(): void {
  cycleCounter = 0;
}
