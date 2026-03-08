/**
 * Discovery → Learning Bridge
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Post-discovery hook that feeds accepted discoveries into the substrate's
 * learning systems. This makes the system smarter over time WITHOUT altering
 * what gets exported — the crystallized pipeline remains the same artifact,
 * but the substrate learns which module chains, categories, and synergy
 * patterns produce high-scoring pipelines.
 *
 * Consumers:
 *   1. Domain-Focused Learning — deepens mastery in discovery categories
 *   2. Evolution Mesh Rules   — contributes synergy patterns as learned rules
 *   3. Synergy Memory Bridge  — records pipeline outcomes for trend analysis
 *
 * This is purely internal optimization. Exported software value is unchanged.
 */

import { submitLearning, registerDomain, getDomain } from '@/lib/substrate/simnap-ports/domain-focused-learning';
import { contributeRule } from '@/packages/evolution-mesh/learning/rules';
import { recordSynergyOutcome } from '@/lib/substrate/inter-node-bridges/synergy-memory-bridge';
import { emit } from '@/lib/substrate/events';
import { log } from '@/lib/system/log';
import type { ReactorCandidate } from './reactor';

// ── Discovery Domain Registry ─────────────────────────────────────

const DISCOVERY_DOMAINS: Record<string, { name: string; description: string; priority: number; minQuality: number; tags: string[] }> = {
  'discovery:security': {
    name: 'Security Pipeline Discovery',
    description: 'Patterns for threat detection, vulnerability scanning, and defense pipelines',
    priority: 8,
    minQuality: 6,
    tags: ['security', 'defense', 'threat', 'vulnerability'],
  },
  'discovery:intelligence': {
    name: 'Intelligence Pipeline Discovery',
    description: 'Patterns for data analysis, learning, and cognitive pipelines',
    priority: 9,
    minQuality: 5,
    tags: ['intelligence', 'learning', 'cognitive', 'analysis'],
  },
  'discovery:compliance': {
    name: 'Compliance Pipeline Discovery',
    description: 'Patterns for audit, governance, and regulatory pipelines',
    priority: 7,
    minQuality: 6,
    tags: ['compliance', 'audit', 'governance', 'regulation'],
  },
  'discovery:infrastructure': {
    name: 'Infrastructure Pipeline Discovery',
    description: 'Patterns for system health, monitoring, and resilience pipelines',
    priority: 8,
    minQuality: 5,
    tags: ['infrastructure', 'monitoring', 'resilience', 'health'],
  },
  'discovery:synthesis': {
    name: 'Cross-Module Synthesis Discovery',
    description: 'Patterns for multi-module synergy and emergent capability pipelines',
    priority: 10,
    minQuality: 7,
    tags: ['synthesis', 'synergy', 'cross-module', 'emergent'],
  },
};

// Map discovery categories to learning domain IDs
const CATEGORY_TO_DOMAIN: Record<string, string> = {
  security: 'discovery:security',
  defense: 'discovery:security',
  threat: 'discovery:security',
  intelligence: 'discovery:intelligence',
  learning: 'discovery:intelligence',
  cognitive: 'discovery:intelligence',
  analysis: 'discovery:intelligence',
  compliance: 'discovery:compliance',
  audit: 'discovery:compliance',
  governance: 'discovery:compliance',
  infrastructure: 'discovery:infrastructure',
  monitoring: 'discovery:infrastructure',
  resilience: 'discovery:infrastructure',
  synthesis: 'discovery:synthesis',
  synergy: 'discovery:synthesis',
};

let domainsInitialized = false;

function ensureDomainsRegistered(): void {
  if (domainsInitialized) return;
  for (const [id, config] of Object.entries(DISCOVERY_DOMAINS)) {
    if (!getDomain(id)) {
      registerDomain({ id, ...config });
    }
  }
  domainsInitialized = true;
}

function resolveDomainId(category: string): string {
  const normalized = category.toLowerCase().replace(/[^a-z]/g, '');
  return CATEGORY_TO_DOMAIN[normalized] || 'discovery:synthesis';
}

// ── Quality & Novelty Scoring ─────────────────────────────────────

/**
 * Convert CJPI score (0-100) to a learning quality score (1-10)
 */
function cjpiToQuality(cjpi: number): number {
  return Math.max(1, Math.min(10, Math.round(cjpi / 10)));
}

/**
 * Compute novelty based on module chain uniqueness.
 * More modules + less common combinations = higher novelty.
 */
function computeNovelty(candidate: ReactorCandidate): number {
  const chainLength = candidate.moduleChain.length;
  const synergyBonus = (candidate.synergyMultiplier - 1) * 0.5;
  // Longer chains with higher synergy multipliers are more novel
  const base = Math.min(1, (chainLength / 6) * 0.6 + synergyBonus);
  return Math.max(0.1, Math.min(1, base));
}

// ── Main Learning Hook ────────────────────────────────────────────

export interface DiscoveryLearningResult {
  candidatesProcessed: number;
  domainLearnings: number;
  rulesContributed: number;
  synergyOutcomesRecorded: number;
  skipped: number;
}

/**
 * Feed accepted discoveries into the substrate's learning systems.
 * Called by the reactor AFTER persisting discoveries and promotions.
 *
 * This does NOT modify the exported pipeline — it only enriches
 * the substrate's internal knowledge about what patterns work.
 */
export function feedDiscoveriesToLearning(
  accepted: ReactorCandidate[],
  runId: string,
  dryRun: boolean,
): DiscoveryLearningResult {
  const result: DiscoveryLearningResult = {
    candidatesProcessed: 0,
    domainLearnings: 0,
    rulesContributed: 0,
    synergyOutcomesRecorded: 0,
    skipped: 0,
  };

  if (dryRun || accepted.length === 0) {
    return result;
  }

  ensureDomainsRegistered();

  for (const candidate of accepted) {
    try {
      result.candidatesProcessed++;

      // ─── 1. Domain-Focused Learning ───────────────────────
      // Teaches the system which categories produce high-quality pipelines
      const domainId = resolveDomainId(candidate.category);
      const quality = cjpiToQuality(candidate.cjpi);
      const novelty = computeNovelty(candidate);

      const learningEvent = submitLearning(
        domainId,
        `Discovered pipeline: ${candidate.name} (${candidate.moduleChain.join(' → ')}) — CJPI ${candidate.cjpi}`,
        quality,
        novelty,
        `discovery-reactor:${runId}`,
      );

      if (learningEvent.accepted) {
        result.domainLearnings++;
      }

      // ─── 2. Evolution Mesh Rules ──────────────────────────
      // Contributes the synergy pattern as a learned rule so the
      // evolution mesh can apply similar patterns in future mutations
      if (candidate.cjpi >= 85 && candidate.moduleChain.length >= 2) {
        const confidence = candidate.cjpi / 100;
        contributeRule(
          `discovery:${candidate.name}`,
          `synergy-chain:${candidate.moduleChain.join('+')}`,
          candidate.tier || 'standard',
          confidence,
          candidate.category,
        );
        result.rulesContributed++;
      }

      // ─── 3. Synergy Memory Bridge ─────────────────────────
      // Records the discovery as a synergy outcome so the system
      // can track which pipeline patterns trend well over time
      if (candidate.moduleChain.length >= 2) {
        recordSynergyOutcome({
          synergyId: `pipeline:${candidate.id}`,
          modules: candidate.moduleChain,
          category: candidate.category,
          success: true,
          executionMs: candidate.maxExecutionMs || 5000,
          confidence: candidate.cjpi / 100,
          timestamp: new Date().toISOString(),
        });
        result.synergyOutcomesRecorded++;
      }
    } catch (err) {
      log('warn', 'discovery-learning', `Failed to learn from candidate ${candidate.name}`, { error: String(err) });
      result.skipped++;
    }
  }

  // Emit summary event
  emit({
    module: 'MEMORY',
    event_type: 'discovery.learning_complete',
    outcome: 'succeeded',
    data: {
      runId,
      ...result,
    },
  });

  log('info', 'discovery-learning', `Post-discovery learning: ${result.domainLearnings} domain learnings, ${result.rulesContributed} rules, ${result.synergyOutcomesRecorded} synergy outcomes`);

  return result;
}
