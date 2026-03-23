/**
 * CMPSBL® BRAIN — Associative Memory Graph
 * Creates "reminds me of" relational links between memories.
 * Hebbian principle: memories accessed together strengthen bonds.
 *
 * Runs entirely in-memory with periodic persistence to knowledge_graph_edges.
 * O(1) link lookup, O(k) co-activation strengthening.
 */

import { supabase } from '@/integrations/supabase/client';
import { tokenizeToSet, jaccardSimilarity } from './shared';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface AssociativeLink {
  sourceId: string;
  targetId: string;
  strength: number;     // 0-1, Hebbian reinforcement
  coActivations: number;
  lastActivated: number; // epoch ms
  linkType: 'semantic' | 'temporal' | 'contextual' | 'causal';
}

export interface AssociationCluster {
  centroidId: string;
  memberIds: string[];
  avgStrength: number;
  theme: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASSOCIATIVE GRAPH ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Max links to retain in memory */
const MAX_LINKS = 10000;
/** Strength decay per hour (Hebbian forgetting) */
const DECAY_PER_HOUR = 0.002;
/** Minimum strength before pruning */
const PRUNE_THRESHOLD = 0.05;
/** Strength boost per co-activation */
const COACTIVATION_BOOST = 0.08;

class AssociativeGraphEngine {
  private links = new Map<string, AssociativeLink>();
  private adjacency = new Map<string, Set<string>>(); // nodeId → set of linked nodeIds
  private dirty = false;

  /** Generate a canonical edge key (order-independent) */
  private edgeKey(a: string, b: string): string {
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  }

  /** Get or create a link between two memories */
  getLink(sourceId: string, targetId: string): AssociativeLink | undefined {
    return this.links.get(this.edgeKey(sourceId, targetId));
  }

  /** Get all memories associated with a given memory */
  getAssociations(memoryId: string): AssociativeLink[] {
    const neighbors = this.adjacency.get(memoryId);
    if (!neighbors) return [];
    const result: AssociativeLink[] = [];
    for (const nId of neighbors) {
      const link = this.links.get(this.edgeKey(memoryId, nId));
      if (link) result.push(link);
    }
    result.sort((a, b) => b.strength - a.strength);
    return result;
  }

  /**
   * Record co-activation — Hebbian strengthening.
   * "Neurons that fire together wire together."
   */
  coActivate(memoryIds: string[], linkType: AssociativeLink['linkType'] = 'contextual'): number {
    let linksModified = 0;
    const now = Date.now();

    for (let i = 0; i < memoryIds.length; i++) {
      for (let j = i + 1; j < memoryIds.length; j++) {
        const key = this.edgeKey(memoryIds[i], memoryIds[j]);
        const existing = this.links.get(key);

        if (existing) {
          // Hebbian reinforcement with diminishing returns
          existing.strength = Math.min(1, existing.strength + COACTIVATION_BOOST * (1 - existing.strength));
          existing.coActivations++;
          existing.lastActivated = now;
        } else {
          // New association
          this.links.set(key, {
            sourceId: memoryIds[i],
            targetId: memoryIds[j],
            strength: COACTIVATION_BOOST,
            coActivations: 1,
            lastActivated: now,
            linkType,
          });
          // Update adjacency
          if (!this.adjacency.has(memoryIds[i])) this.adjacency.set(memoryIds[i], new Set());
          if (!this.adjacency.has(memoryIds[j])) this.adjacency.set(memoryIds[j], new Set());
          this.adjacency.get(memoryIds[i])!.add(memoryIds[j]);
          this.adjacency.get(memoryIds[j])!.add(memoryIds[i]);
        }
        linksModified++;
      }
    }

    this.dirty = true;
    this.enforceCapacity();
    return linksModified;
  }

  /**
   * Create a semantic link based on content similarity.
   */
  linkBySimilarity(
    sourceId: string, sourceContent: string,
    targetId: string, targetContent: string,
    minSimilarity: number = 0.3
  ): boolean {
    const sim = jaccardSimilarity(tokenizeToSet(sourceContent), tokenizeToSet(targetContent));
    if (sim < minSimilarity) return false;

    const key = this.edgeKey(sourceId, targetId);
    const existing = this.links.get(key);
    const strength = Math.min(1, sim * 1.2); // Scale similarity to strength

    if (existing) {
      existing.strength = Math.max(existing.strength, strength);
      existing.linkType = 'semantic';
    } else {
      this.links.set(key, {
        sourceId, targetId,
        strength,
        coActivations: 0,
        lastActivated: Date.now(),
        linkType: 'semantic',
      });
      if (!this.adjacency.has(sourceId)) this.adjacency.set(sourceId, new Set());
      if (!this.adjacency.has(targetId)) this.adjacency.set(targetId, new Set());
      this.adjacency.get(sourceId)!.add(targetId);
      this.adjacency.get(targetId)!.add(sourceId);
    }

    this.dirty = true;
    return true;
  }

  /**
   * Apply temporal decay to all links (call periodically).
   * Returns number of links pruned.
   */
  applyDecay(): number {
    const now = Date.now();
    let pruned = 0;

    for (const [key, link] of this.links) {
      const hoursSince = (now - link.lastActivated) / 3600000;
      link.strength *= Math.exp(-DECAY_PER_HOUR * hoursSince);

      if (link.strength < PRUNE_THRESHOLD) {
        this.links.delete(key);
        this.adjacency.get(link.sourceId)?.delete(link.targetId);
        this.adjacency.get(link.targetId)?.delete(link.sourceId);
        pruned++;
      }
    }

    if (pruned > 0) this.dirty = true;
    return pruned;
  }

  /**
   * Spread activation — retrieve memories reachable from a set of seeds.
   * BFS with strength-weighted decay per hop.
   */
  spreadActivation(seedIds: string[], maxHops: number = 3, minStrength: number = 0.1): Map<string, number> {
    const activations = new Map<string, number>();
    const frontier: Array<{ id: string; activation: number; hop: number }> = [];

    for (const id of seedIds) {
      activations.set(id, 1.0);
      frontier.push({ id, activation: 1.0, hop: 0 });
    }

    while (frontier.length > 0) {
      const { id, activation, hop } = frontier.shift()!;
      if (hop >= maxHops) continue;

      const neighbors = this.adjacency.get(id);
      if (!neighbors) continue;

      for (const nId of neighbors) {
        const link = this.links.get(this.edgeKey(id, nId));
        if (!link) continue;

        const spreadActivationValue = activation * link.strength * 0.7; // 30% decay per hop
        if (spreadActivationValue < minStrength) continue;

        const current = activations.get(nId) || 0;
        if (spreadActivationValue > current) {
          activations.set(nId, spreadActivationValue);
          frontier.push({ id: nId, activation: spreadActivationValue, hop: hop + 1 });
        }
      }
    }

    // Remove seeds from results
    for (const id of seedIds) activations.delete(id);
    return activations;
  }

  /**
   * Detect association clusters via connected components with strength threshold.
   */
  detectClusters(minStrength: number = 0.3): AssociationCluster[] {
    const visited = new Set<string>();
    const clusters: AssociationCluster[] = [];

    for (const nodeId of this.adjacency.keys()) {
      if (visited.has(nodeId)) continue;

      const cluster: string[] = [];
      const queue = [nodeId];
      let totalStrength = 0;
      let linkCount = 0;

      while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current)) continue;
        visited.add(current);
        cluster.push(current);

        const neighbors = this.adjacency.get(current);
        if (!neighbors) continue;

        for (const nId of neighbors) {
          const link = this.links.get(this.edgeKey(current, nId));
          if (link && link.strength >= minStrength && !visited.has(nId)) {
            totalStrength += link.strength;
            linkCount++;
            queue.push(nId);
          }
        }
      }

      if (cluster.length >= 2) {
        clusters.push({
          centroidId: cluster[0],
          memberIds: cluster,
          avgStrength: linkCount > 0 ? totalStrength / linkCount : 0,
          theme: `cluster-${clusters.length}`,
        });
      }
    }

    return clusters;
  }

  /** Enforce max link capacity by pruning weakest */
  private enforceCapacity(): void {
    if (this.links.size <= MAX_LINKS) return;
    const sorted = [...this.links.entries()].sort((a, b) => a[1].strength - b[1].strength);
    const toRemove = sorted.slice(0, this.links.size - MAX_LINKS);
    for (const [key, link] of toRemove) {
      this.links.delete(key);
      this.adjacency.get(link.sourceId)?.delete(link.targetId);
      this.adjacency.get(link.targetId)?.delete(link.sourceId);
    }
  }

  /** Persist strong links to knowledge_graph_edges (fire-and-forget) */
  async persist(): Promise<number> {
    if (!this.dirty) return 0;

    const strongLinks = [...this.links.values()].filter(l => l.strength >= 0.2);
    if (strongLinks.length === 0) return 0;

    const edges = strongLinks.slice(0, 100).map(l => ({
      source_id: l.sourceId,
      target_id: l.targetId,
      relation: `associative:${l.linkType}`,
      relation_type: l.linkType,
      weight: l.strength,
      confidence: Math.min(1, l.coActivations / 10),
    }));

    try {
      await supabase.from('knowledge_graph_edges').upsert(edges, { onConflict: 'source_id,target_id,relation' });
      this.dirty = false;
      return edges.length;
    } catch {
      return 0;
    }
  }

  /** Stats */
  getStats() {
    return {
      totalLinks: this.links.size,
      totalNodes: this.adjacency.size,
      avgStrength: this.links.size > 0
        ? [...this.links.values()].reduce((s, l) => s + l.strength, 0) / this.links.size
        : 0,
    };
  }

  clear(): void {
    this.links.clear();
    this.adjacency.clear();
    this.dirty = false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let _graph: AssociativeGraphEngine | null = null;

export function getAssociativeGraph(): AssociativeGraphEngine {
  if (!_graph) _graph = new AssociativeGraphEngine();
  return _graph;
}

export function resetAssociativeGraph(): void {
  _graph = null;
}
