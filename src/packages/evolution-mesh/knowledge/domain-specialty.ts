/**
 * Evolution Mesh — Domain Specialty Trees
 * Visual mastery tracking per executor across domain branches.
 * Maps skills into a tree structure for directed growth.
 */

export interface SpecialtyNode {
  id: string;
  name: string;
  domain: string;
  parentId: string | null;
  depth: number;
  /** Mastery level 0.0–1.0 */
  mastery: number;
  /** Minimum mastery to unlock children */
  unlockThreshold: number;
  /** Attempts at this node */
  attempts: number;
  successes: number;
  children: string[];
}

export interface SpecialtyTree {
  executorId: string;
  nodes: Map<string, SpecialtyNode>;
  totalMastery: number;
  unlockedNodes: number;
  totalNodes: number;
}

export interface SpecialtySnapshot {
  executorId: string;
  domains: Array<{
    domain: string;
    mastery: number;
    depth: number;
    unlockedCount: number;
    totalCount: number;
  }>;
  overallMastery: number;
  strongestDomain: string;
  weakestDomain: string;
}

// ── Tree Template ──
interface NodeTemplate {
  id: string;
  name: string;
  domain: string;
  parentId: string | null;
  unlockThreshold: number;
}

const TREE_TEMPLATE: NodeTemplate[] = [
  // Repair Domain
  { id: 'repair_root', name: 'Repair Fundamentals', domain: 'repair', parentId: null, unlockThreshold: 0 },
  { id: 'repair_null', name: 'Null Coercion', domain: 'repair', parentId: 'repair_root', unlockThreshold: 0.6 },
  { id: 'repair_type', name: 'Type Casting', domain: 'repair', parentId: 'repair_root', unlockThreshold: 0.6 },
  { id: 'repair_sanitize', name: 'Input Sanitization', domain: 'repair', parentId: 'repair_root', unlockThreshold: 0.6 },
  { id: 'repair_multi', name: 'Multi-Strategy Chains', domain: 'repair', parentId: 'repair_type', unlockThreshold: 0.7 },
  { id: 'repair_novel', name: 'Novel Pattern Repair', domain: 'repair', parentId: 'repair_multi', unlockThreshold: 0.75 },

  // Schema Domain
  { id: 'schema_root', name: 'Schema Mastery', domain: 'schema', parentId: null, unlockThreshold: 0 },
  { id: 'schema_classify', name: 'Archetype Classification', domain: 'schema', parentId: 'schema_root', unlockThreshold: 0.6 },
  { id: 'schema_validate', name: 'Deep Validation', domain: 'schema', parentId: 'schema_root', unlockThreshold: 0.6 },
  { id: 'schema_evolve', name: 'Schema Evolution', domain: 'schema', parentId: 'schema_validate', unlockThreshold: 0.7 },

  // Routing Domain
  { id: 'routing_root', name: 'Routing Fundamentals', domain: 'routing', parentId: null, unlockThreshold: 0 },
  { id: 'routing_weight', name: 'Weight Adjustment', domain: 'routing', parentId: 'routing_root', unlockThreshold: 0.6 },
  { id: 'routing_failover', name: 'Failover Logic', domain: 'routing', parentId: 'routing_root', unlockThreshold: 0.6 },
  { id: 'routing_adaptive', name: 'Adaptive Routing', domain: 'routing', parentId: 'routing_weight', unlockThreshold: 0.7 },

  // Defense Domain
  { id: 'defense_root', name: 'Defense Basics', domain: 'defense', parentId: null, unlockThreshold: 0 },
  { id: 'defense_detect', name: 'Threat Detection', domain: 'defense', parentId: 'defense_root', unlockThreshold: 0.6 },
  { id: 'defense_rules', name: 'Rule Creation', domain: 'defense', parentId: 'defense_detect', unlockThreshold: 0.7 },
  { id: 'defense_adaptive', name: 'Adaptive Defense', domain: 'defense', parentId: 'defense_rules', unlockThreshold: 0.8 },

  // Evolution Domain
  { id: 'evolution_root', name: 'Evolution Core', domain: 'evolution', parentId: null, unlockThreshold: 0 },
  { id: 'evolution_propose', name: 'Proposal Generation', domain: 'evolution', parentId: 'evolution_root', unlockThreshold: 0.6 },
  { id: 'evolution_rollback', name: 'Rollback Operations', domain: 'evolution', parentId: 'evolution_root', unlockThreshold: 0.6 },
  { id: 'evolution_shadow', name: 'Shadow Testing', domain: 'evolution', parentId: 'evolution_propose', unlockThreshold: 0.7 },
  { id: 'evolution_pipeline', name: 'Pipeline Restructure', domain: 'evolution', parentId: 'evolution_shadow', unlockThreshold: 0.8 },
];

const executorTrees = new Map<string, SpecialtyTree>();

/**
 * Initialize a specialty tree for an executor.
 */
export function initSpecialtyTree(executorId: string): SpecialtyTree {
  const nodes = new Map<string, SpecialtyNode>();
  
  for (const template of TREE_TEMPLATE) {
    const depth = calculateDepth(template.id);
    nodes.set(template.id, {
      id: template.id,
      name: template.name,
      domain: template.domain,
      parentId: template.parentId,
      depth,
      mastery: 0,
      unlockThreshold: template.unlockThreshold,
      attempts: 0,
      successes: 0,
      children: TREE_TEMPLATE.filter(t => t.parentId === template.id).map(t => t.id),
    });
  }

  const tree: SpecialtyTree = {
    executorId,
    nodes,
    totalMastery: 0,
    unlockedNodes: TREE_TEMPLATE.filter(t => t.parentId === null).length,
    totalNodes: TREE_TEMPLATE.length,
  };

  executorTrees.set(executorId, tree);
  return tree;
}

function calculateDepth(nodeId: string): number {
  let depth = 0;
  let current = TREE_TEMPLATE.find(t => t.id === nodeId);
  while (current?.parentId) {
    depth++;
    current = TREE_TEMPLATE.find(t => t.id === current!.parentId);
  }
  return depth;
}

/**
 * Record a skill attempt and update mastery.
 */
export function recordSpecialtyAttempt(executorId: string, nodeId: string, success: boolean): {
  mastery: number;
  newUnlocks: string[];
} {
  let tree = executorTrees.get(executorId);
  if (!tree) tree = initSpecialtyTree(executorId);

  const node = tree.nodes.get(nodeId);
  if (!node) return { mastery: 0, newUnlocks: [] };

  node.attempts++;
  if (success) node.successes++;
  node.mastery = node.attempts > 0 ? node.successes / node.attempts : 0;

  // Check for child unlocks
  const newUnlocks: string[] = [];
  for (const childId of node.children) {
    const child = tree.nodes.get(childId);
    if (child && node.mastery >= child.unlockThreshold) {
      newUnlocks.push(childId);
    }
  }

  // Recalculate tree stats
  const allNodes = Array.from(tree.nodes.values());
  tree.totalMastery = allNodes.reduce((s, n) => s + n.mastery, 0) / allNodes.length;
  tree.unlockedNodes = allNodes.filter(n => isNodeUnlocked(tree!, n.id)).length;

  return { mastery: node.mastery, newUnlocks };
}

function isNodeUnlocked(tree: SpecialtyTree, nodeId: string): boolean {
  const node = tree.nodes.get(nodeId);
  if (!node) return false;
  if (!node.parentId) return true; // Root nodes always unlocked
  const parent = tree.nodes.get(node.parentId);
  if (!parent) return false;
  return parent.mastery >= node.unlockThreshold;
}

/**
 * Get a snapshot of executor specialties.
 */
export function getSpecialtySnapshot(executorId: string): SpecialtySnapshot {
  let tree = executorTrees.get(executorId);
  if (!tree) tree = initSpecialtyTree(executorId);

  const domainMap = new Map<string, { mastery: number; depth: number; unlocked: number; total: number }>();
  for (const node of tree.nodes.values()) {
    const existing = domainMap.get(node.domain) ?? { mastery: 0, depth: 0, unlocked: 0, total: 0 };
    existing.mastery += node.mastery;
    existing.depth = Math.max(existing.depth, node.depth);
    existing.total++;
    if (isNodeUnlocked(tree, node.id)) existing.unlocked++;
    domainMap.set(node.domain, existing);
  }

  const domains = Array.from(domainMap.entries()).map(([domain, data]) => ({
    domain,
    mastery: Math.round((data.mastery / data.total) * 1000) / 1000,
    depth: data.depth,
    unlockedCount: data.unlocked,
    totalCount: data.total,
  }));

  const strongest = domains.reduce((best, d) => d.mastery > best.mastery ? d : best, domains[0]);
  const weakest = domains.reduce((worst, d) => d.mastery < worst.mastery ? d : worst, domains[0]);

  return {
    executorId,
    domains,
    overallMastery: tree.totalMastery,
    strongestDomain: strongest?.domain ?? 'none',
    weakestDomain: weakest?.domain ?? 'none',
  };
}

/**
 * Get the full specialty tree for an executor.
 */
export function getSpecialtyTree(executorId: string): SpecialtyTree | undefined {
  return executorTrees.get(executorId);
}

// ── #26 Node-Level Mastery Decay ──

export interface MasteryDecayConfig {
  /** How many days of inactivity before mastery starts decaying */
  inactivityThresholdDays: number;
  /** Decay rate per day of inactivity (0.0–1.0) */
  decayRatePerDay: number;
  /** Minimum mastery floor (mastery won't decay below this) */
  masteryFloor: number;
}

const DEFAULT_MASTERY_DECAY: MasteryDecayConfig = {
  inactivityThresholdDays: 14,
  decayRatePerDay: 0.02,
  masteryFloor: 0.1,
};

const nodeLastActivity = new Map<string, number>(); // key: `${executorId}:${nodeId}` → timestamp
const masteryDecayConfigs = new Map<string, MasteryDecayConfig>(); // per-domain overrides

/**
 * Set custom mastery decay config for a domain.
 */
export function setMasteryDecayConfig(domain: string, config: Partial<MasteryDecayConfig>): void {
  masteryDecayConfigs.set(domain, { ...DEFAULT_MASTERY_DECAY, ...config });
}

/**
 * Record activity on a specialty node (called when recordSpecialtyAttempt runs).
 */
export function recordNodeActivity(executorId: string, nodeId: string): void {
  nodeLastActivity.set(`${executorId}:${nodeId}`, Date.now());
}

/**
 * Apply mastery decay across all nodes for an executor based on inactivity.
 * Returns nodes that decayed and may need refresher training.
 */
export function applyMasteryDecay(executorId: string): Array<{
  nodeId: string;
  nodeName: string;
  domain: string;
  previousMastery: number;
  decayedMastery: number;
  inactivityDays: number;
  needsRefresher: boolean;
}> {
  const tree = executorTrees.get(executorId);
  if (!tree) return [];

  const now = Date.now();
  const decayedNodes: Array<{
    nodeId: string;
    nodeName: string;
    domain: string;
    previousMastery: number;
    decayedMastery: number;
    inactivityDays: number;
    needsRefresher: boolean;
  }> = [];

  for (const [nodeId, node] of tree.nodes.entries()) {
    if (node.mastery <= 0) continue;

    const lastActive = nodeLastActivity.get(`${executorId}:${nodeId}`) ?? (now - 30 * 24 * 60 * 60 * 1000); // default: 30 days ago
    const inactivityMs = now - lastActive;
    const inactivityDays = inactivityMs / (24 * 60 * 60 * 1000);

    const config = masteryDecayConfigs.get(node.domain) ?? DEFAULT_MASTERY_DECAY;

    if (inactivityDays <= config.inactivityThresholdDays) continue;

    const daysOverThreshold = inactivityDays - config.inactivityThresholdDays;
    const previousMastery = node.mastery;
    const decayAmount = daysOverThreshold * config.decayRatePerDay;
    const decayedMastery = Math.max(config.masteryFloor, node.mastery - decayAmount);

    if (decayedMastery < previousMastery) {
      node.mastery = Math.round(decayedMastery * 1000) / 1000;
      const needsRefresher = previousMastery >= 0.6 && decayedMastery < 0.5;

      decayedNodes.push({
        nodeId,
        nodeName: node.name,
        domain: node.domain,
        previousMastery: Math.round(previousMastery * 1000) / 1000,
        decayedMastery: node.mastery,
        inactivityDays: Math.round(inactivityDays * 10) / 10,
        needsRefresher,
      });
    }
  }

  // Recalculate tree stats
  if (decayedNodes.length > 0) {
    const allNodes = Array.from(tree.nodes.values());
    tree.totalMastery = allNodes.reduce((s, n) => s + n.mastery, 0) / allNodes.length;
  }

  return decayedNodes;
}

/**
 * Get nodes at risk of mastery decay for an executor.
 */
export function getNodesAtDecayRisk(executorId: string): Array<{
  nodeId: string;
  nodeName: string;
  domain: string;
  mastery: number;
  daysSinceActive: number;
  daysUntilDecay: number;
}> {
  const tree = executorTrees.get(executorId);
  if (!tree) return [];

  const now = Date.now();
  const atRisk: Array<{
    nodeId: string;
    nodeName: string;
    domain: string;
    mastery: number;
    daysSinceActive: number;
    daysUntilDecay: number;
  }> = [];

  for (const [nodeId, node] of tree.nodes.entries()) {
    if (node.mastery <= 0.1) continue;

    const lastActive = nodeLastActivity.get(`${executorId}:${nodeId}`);
    if (!lastActive) continue;

    const daysSinceActive = (now - lastActive) / (24 * 60 * 60 * 1000);
    const config = masteryDecayConfigs.get(node.domain) ?? DEFAULT_MASTERY_DECAY;
    const daysUntilDecay = Math.max(0, config.inactivityThresholdDays - daysSinceActive);

    if (daysUntilDecay <= 5) { // within 5 days of decay onset
      atRisk.push({
        nodeId,
        nodeName: node.name,
        domain: node.domain,
        mastery: node.mastery,
        daysSinceActive: Math.round(daysSinceActive * 10) / 10,
        daysUntilDecay: Math.round(daysUntilDecay * 10) / 10,
      });
    }
  }

  return atRisk.sort((a, b) => a.daysUntilDecay - b.daysUntilDecay);
}
