/**
 * CMPSBL® GENESIS — Dynamic Seed Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates 200 domain-specific discoveries for any dynamically
 * instantiated vertical, matching the quality of hand-built
 * seed engines (cyber-seed, llm-seed, etc.).
 *
 * Derives discovery templates from the vertical's primitive
 * capabilities and categories — no manual template authoring needed.
 *
 * © CMPSBL® — All rights reserved.
 */

import { routeDiscovery } from './foundry-engine';
import { persistSeedDiscoveries, ensureSeedRun } from './verticals/seed-persistence';
import type { VerticalPrimitive } from './vertical-substrate';

// ═══════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════

export interface GenesisSeedDiscovery {
  id: string;
  name: string;
  description: string;
  cjpiScore: number;
  primitiveChain: string[];
  tier: 'Raw' | 'Mint' | 'Prime' | 'Relic' | 'Mythic' | 'Apex';
  route: 'vault' | 'showroom' | 'junkyard';
  category: string;
  discoveredAt: string;
}

export interface GenesisSeedResult {
  runId: string;
  vertical: string;
  totalDiscoveries: number;
  vaultCount: number;
  showroomCount: number;
  junkyardCount: number;
  discoveries: GenesisSeedDiscovery[];
  completedAt: string;
  persisted: boolean;
}

// ═══════════════════════════════════════════════════════════════
// §2 — DETERMINISTIC RNG
// ═══════════════════════════════════════════════════════════════

function seedRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/** Derive a deterministic seed from the vertical ID */
function verticalSeed(verticalId: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < verticalId.length; i++) {
    h ^= verticalId.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// ═══════════════════════════════════════════════════════════════
// §3 — TEMPLATE DERIVATION FROM PRIMITIVES
// ═══════════════════════════════════════════════════════════════

const SPINE_IDS = [
  'BRAIN', 'MEMORY', 'IDENTITY', 'CONSCIENCE', 'COMPASS', 'REFLEX',
  'DEFENSE', 'GOVERNANCE', 'EVOLUTION', 'SHADOW', 'SOVEREIGN',
  'TREATY', 'RELAY', 'IMMUNITY', 'BEACON', 'NERVE', 'NEXUS',
  'CORE', 'SYSTEM', 'MEDIC', 'ATLAS', 'ACCESS', 'INTENT', 'INTEGRATION',
];

interface DerivedTemplate {
  namePattern: string;
  descriptionPattern: string;
  category: string;
  primaryPrimitives: string[];
  minChainLength: number;
  maxChainLength: number;
  cjpiBias: number;
}

/**
 * Derive discovery templates from a vertical's primitive definitions.
 * Each primitive generates 2-3 templates based on its capabilities,
 * producing 32-48 templates for 16 primitives — enough to generate
 * 200+ unique discoveries with variants.
 */
function deriveTemplates(
  engines: VerticalPrimitive[],
  agents: VerticalPrimitive[],
  categories: string[],
): DerivedTemplate[] {
  const templates: DerivedTemplate[] = [];
  const allPrimitives = [...engines, ...agents];

  for (let pi = 0; pi < allPrimitives.length; pi++) {
    const p = allPrimitives[pi];
    const caps = p.capabilities;

    // Template 1: Primary capability — high CJPI bias (vault candidates)
    if (caps.length >= 2) {
      const cap1 = caps[0].replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const cap2 = caps[1].replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      // Pair with a complementary primitive
      const partner = allPrimitives[(pi + 3) % allPrimitives.length];
      const thirdPartner = allPrimitives[(pi + 7) % allPrimitives.length];

      templates.push({
        namePattern: `${cap1} ${cap2} Engine`,
        descriptionPattern: `Advanced ${cap1.toLowerCase()} implementation leveraging ${p.name}'s ${cap2.toLowerCase()} capabilities for autonomous ${categories[pi % categories.length]} operations.`,
        category: categories[pi % categories.length],
        primaryPrimitives: [p.id, partner.id, thirdPartner.id],
        minChainLength: 5,
        maxChainLength: 8,
        cjpiBias: 30 - pi, // First primitives get highest bias
      });
    }

    // Template 2: Cross-primitive synergy — mid CJPI
    if (caps.length >= 3) {
      const cap3 = caps[2].replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const synPartner = allPrimitives[(pi + 5) % allPrimitives.length];

      templates.push({
        namePattern: `${p.name}-${synPartner.name} ${cap3} Protocol`,
        descriptionPattern: `Cross-primitive synergy protocol combining ${p.name}'s ${cap3.toLowerCase()} with ${synPartner.name}'s ${synPartner.capabilities[0]?.replace(/_/g, ' ') ?? 'core'} capabilities for compound intelligence.`,
        category: categories[(pi + 1) % categories.length],
        primaryPrimitives: [p.id, synPartner.id],
        minChainLength: 3,
        maxChainLength: 6,
        cjpiBias: 15 - Math.floor(pi / 2),
      });
    }

    // Template 3: Utility pattern — lower CJPI (showroom/junkyard)
    if (caps.length >= 1) {
      const capU = caps[Math.min(caps.length - 1, 3)]?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        ?? caps[0].replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      templates.push({
        namePattern: `${capU} Utility Module`,
        descriptionPattern: `Standalone ${capU.toLowerCase()} module from the ${p.name} ${p.role} providing reusable ${categories[(pi + 2) % categories.length]} capabilities.`,
        category: categories[(pi + 2) % categories.length],
        primaryPrimitives: [p.id],
        minChainLength: 2,
        maxChainLength: 4,
        cjpiBias: -5 + Math.floor(pi / 4),
      });
    }
  }

  return templates;
}

// ═══════════════════════════════════════════════════════════════
// §4 — SCORING & CLASSIFICATION
// ═══════════════════════════════════════════════════════════════

function scoreCjpi(chainLength: number, bias: number, rand: () => number): number {
  const chainBonus = chainLength * 5;
  const base = 45 + chainBonus + Math.floor(rand() * 15);
  return Math.min(100, Math.max(30, base + bias));
}

function classifyTier(score: number): GenesisSeedDiscovery['tier'] {
  if (score === 100) return 'Apex';
  if (score >= 94) return 'Mythic';
  if (score >= 90) return 'Relic';
  if (score >= 80) return 'Prime';
  if (score >= 68) return 'Mint';
  return 'Raw';
}

// ═══════════════════════════════════════════════════════════════
// §5 — CHAIN BUILDER
// ═══════════════════════════════════════════════════════════════

function buildChain(
  template: DerivedTemplate,
  allPrimitiveIds: string[],
  rand: () => number,
): string[] {
  const chain = [...template.primaryPrimitives];
  const targetLen = template.minChainLength +
    Math.floor(rand() * (template.maxChainLength - template.minChainLength + 1));
  const pool = [...allPrimitiveIds, ...SPINE_IDS];

  while (chain.length < targetLen) {
    const candidate = pool[Math.floor(rand() * pool.length)];
    if (!chain.includes(candidate)) chain.push(candidate);
  }
  return chain;
}

// ═══════════════════════════════════════════════════════════════
// §6 — VARIANT NAME GENERATOR
// ═══════════════════════════════════════════════════════════════

const VARIANT_PREFIXES = [
  'Autonomous', 'Adaptive', 'Recursive', 'Distributed', 'Hardened',
  'Proactive', 'Predictive', 'Self-Healing', 'Dynamic', 'Deterministic',
  'Continuous', 'Intelligent', 'Mission-Critical', 'Zero-Latency', 'Resilient',
  'Compound', 'Multi-Vector', 'Cross-Domain', 'Context-Aware', 'Deep',
];

const VARIANT_SUFFIXES = [
  'Engine', 'Protocol', 'Pipeline', 'Matrix', 'Orchestrator',
  'Analyzer', 'Shield', 'Mesh', 'Sentinel', 'Controller',
  'Optimizer', 'Scanner', 'Layer', 'Fabric', 'Core',
];

function generateVariantName(base: string, index: number, rand: () => number): string {
  if (index === 0) return base;
  const prefix = VARIANT_PREFIXES[Math.floor(rand() * VARIANT_PREFIXES.length)];
  const suffix = VARIANT_SUFFIXES[Math.floor(rand() * VARIANT_SUFFIXES.length)];
  const core = base.split(' ').slice(0, 3).join(' ');
  return `${prefix} ${core} ${suffix}`;
}

// ═══════════════════════════════════════════════════════════════
// §7 — MAIN SEED ENGINE
// ═══════════════════════════════════════════════════════════════

const TOTAL_DISCOVERIES = 200;
const ARCHITECTURE_GATE_THRESHOLD = 95;

/**
 * Generate and persist 200 discoveries for a dynamic vertical.
 *
 * This is the production equivalent of cyber-seed.ts, llm-seed.ts, etc.
 * but derived automatically from the vertical's primitive definitions.
 */
export async function runGenesisSeed(
  verticalId: string,
  engines: VerticalPrimitive[],
  agents: VerticalPrimitive[],
  categories: string[],
): Promise<GenesisSeedResult> {
  const rand = seedRng(verticalSeed(verticalId));
  const allPrimitiveIds = [...engines, ...agents].map(p => p.id);

  // Derive templates from the vertical's own primitives
  const templates = deriveTemplates(engines, agents, categories);

  const discoveries: GenesisSeedDiscovery[] = [];
  let vaultCount = 0;
  let showroomCount = 0;
  let junkyardCount = 0;
  let templateIdx = 0;

  // Generate prefix from vertical ID (e.g. 'health' → 'HLT')
  const idPrefix = verticalId
    .replace(/-v\d+$/, '')
    .substring(0, 3)
    .toUpperCase();

  for (let i = 0; i < TOTAL_DISCOVERIES; i++) {
    const template = templates[templateIdx % templates.length];
    const variantIndex = Math.floor(templateIdx / templates.length);
    templateIdx++;

    const chain = buildChain(template, allPrimitiveIds, rand);
    const cjpiScore = scoreCjpi(chain.length, template.cjpiBias, rand);
    const tier = classifyTier(cjpiScore);
    const route = cjpiScore >= ARCHITECTURE_GATE_THRESHOLD ? 'vault' : routeDiscovery(cjpiScore);

    discoveries.push({
      id: `${idPrefix}-DSC-${String(i + 1).padStart(3, '0')}`,
      name: generateVariantName(template.namePattern, variantIndex, rand),
      description: template.descriptionPattern,
      cjpiScore,
      primitiveChain: chain,
      tier,
      route,
      category: template.category,
      discoveredAt: new Date().toISOString(),
    });

    if (route === 'vault') vaultCount++;
    else if (route === 'showroom') showroomCount++;
    else junkyardCount++;
  }

  // Persist to unified discoveries table
  const runId = `genesis-${verticalId}-${Date.now().toString(36)}`;
  let persisted = false;

  try {
    await ensureSeedRun(runId, verticalId, TOTAL_DISCOVERIES);
    const rows = discoveries.map(d => ({
      id: d.id,
      name: d.name,
      description: d.description,
      cjpiScore: d.cjpiScore,
      primitiveChain: d.primitiveChain,
      tier: d.tier,
      route: d.route,
      category: d.category,
      vertical: verticalId.replace(/-v\d+$/, ''),
      runId,
    }));
    const result = await persistSeedDiscoveries(rows, verticalId.replace(/-v\d+$/, ''), runId);
    persisted = result.errors === 0;
  } catch {
    // Seed persistence failure is non-fatal — vertical still functions
    persisted = false;
  }

  return {
    runId,
    vertical: verticalId,
    totalDiscoveries: TOTAL_DISCOVERIES,
    vaultCount,
    showroomCount,
    junkyardCount,
    discoveries,
    completedAt: new Date().toISOString(),
    persisted,
  };
}

// ═══════════════════════════════════════════════════════════════
// §8 — CATEGORY INFERENCE
// ═══════════════════════════════════════════════════════════════

/**
 * Infer discovery categories from a vertical's primitive capabilities.
 * Groups capabilities into 6-8 logical categories for the seed engine.
 */
export function inferCategories(
  engines: VerticalPrimitive[],
  agents: VerticalPrimitive[],
): string[] {
  const capWords = new Set<string>();
  for (const p of [...engines, ...agents]) {
    for (const cap of p.capabilities) {
      // Extract the domain word (e.g. 'threat_detection' → 'detection')
      const parts = cap.split('_');
      if (parts.length >= 2) capWords.add(parts[0]);
      else capWords.add(cap);
    }
  }

  // Take the 8 most common root words as categories
  const categories = [...capWords].slice(0, 8);

  // Ensure we have at least 4 categories
  while (categories.length < 4) {
    categories.push(`domain-${categories.length + 1}`);
  }

  return categories;
}
