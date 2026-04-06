/**
 * CMPSBL® Vault-to-Glossary Bridge
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Iterates Crown Jewel vaults (S-Tier, A-Tier) and the Showroom/Junkyard
 * catalog across all verticals. Extracts names, descriptions, and
 * dependency footprints as confirmed ground-truth signals and feeds
 * them into the scanner's feedback loop and ecosystem registry.
 *
 * This accelerates scanner learning by orders of magnitude: every vault
 * entry is governor-curated, CJPI-scored, and already classified by
 * primitive — the highest-quality training data available.
 *
 * § DB Bridge: Also ingests all discoveries from the `discoveries` table
 * (the 2,800+ manually and autonomously discovered capabilities) to
 * close the backlog learning gap.
 *
 * © CMPSBL® — All rights reserved.
 */

import { getAllVerticalJewels } from '@/crownjewels/expansion-jewels/index';
import { getATierVault } from '@/crownjewels/a-tier/index';
import { supabase } from '@/integrations/supabase/client';
import type { STierEntry } from '@/crownjewels/types';
import {
  getAvailableDiscoveries,
  getJunkyardDiscoveries,
  getRetiredDiscoveries,
  type ShowroomDiscovery,
} from '@/lib/factory/discovery-retirement';
import {
  SYNTHESIS_TEMPLATES,
  type SynthesisTemplate,
} from '@/lib/discovery/reactor';
import {
  recordConfirmedMatch,
  getFeedbackStats,
  type FeedbackExtraction,
} from './feedback-loop';
import {
  recordImplementation,
  getRegistryStats,
} from './ecosystem-registry';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface VaultBridgeResult {
  /** Total vault entries processed */
  totalProcessed: number;
  /** Signals injected into the feedback loop */
  signalsInjected: number;
  /** Implementations registered in ecosystem registry */
  implementationsRegistered: number;
  /** Archetype mappings discovered from vault vocabulary */
  archetypeMappings: number;
  /** Processing time */
  durationMs: number;
  /** Breakdown by source */
  breakdown: {
    sTierExpansion: number;
    aTierVault: number;
    showroom: number;
    junkyard: number;
    retired: number;
    dbDiscoveries: number;
  };
  /** Feedback stats after bridge run */
  feedbackStats: { totalSignals: number; uniquePrimitives: number };
  /** Registry stats after bridge run */
  registryStats: { totalEntries: number; avgQuality: number };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — ARCHETYPE VOCABULARY MAPPING
// ═══════════════════════════════════════════════════════════════════════════════
//
// Maps Crown Jewel vocabulary (names, descriptions) to scanner archetypes.
// Each entry: archetype ID → keywords that indicate this archetype.
// ═══════════════════════════════════════════════════════════════════════════════

const ARCHETYPE_VOCABULARY: Record<string, RegExp> = {
  'rate-limiting': /\b(rate.?limit|throttl|bucket|quota|backpressure|flow.?control|admission.?control)\b/i,
  'error-recovery': /\b(circuit.?break|retry|fallback|resilien|self.?heal|fault.?toleran|recovery|failover|bulkhead)\b/i,
  'input-validation': /\b(validat|sanitiz|schema|constraint|guard|assertion|boundary.?check|input.?filter)\b/i,
  'auth-control': /\b(auth|identity|access.?control|rbac|permission|credential|token|session|oauth|jwt|sso)\b/i,
  'observability': /\b(observ|trac|metric|log|telemetry|monitor|instrument|diagnostic|health.?check|heartbeat)\b/i,
  'cost-governance': /\b(cost|billing|budget|quota|metering|pricing|usage.?track|resource.?govern|spend)\b/i,
  'state-persistence': /\b(persist|state.?manage|cache|store|snapshot|checkpoint|durabil|storage|serializ)\b/i,
  'encryption': /\b(encrypt|cipher|crypto|key.?manage|hashing|sign|seal|vault|secret|certificate|tls|ssl)\b/i,
  'concurrency': /\b(concurren|parallel|thread|mutex|lock|semaphore|atomic|async|channel|worker|pool)\b/i,
  'data-pipeline': /\b(pipeline|etl|ingest|transform|workflow|dag|orchestrat|batch|stream.?process|data.?flow)\b/i,
  'testing': /\b(test|assert|mock|fixture|bench|spec|verif|validat.*suite|coverage|regression)\b/i,
  'event-sourcing': /\b(event.?sourc|cqrs|event.?store|command|aggregate|projection|replay|journal|ledger)\b/i,
  'dependency-injection': /\b(inject|container|provider|resolv|factory|ioc|registry|wire|bind|module.?load)\b/i,
  'self-evolution': /\b(evolv|mutat|adapt|self.?improv|auto.?patch|genetic|breed|generation|fitness|crossover)\b/i,
  'data-sovereignty': /\b(sovereign|gdpr|privacy|consent|compliance|data.?residen|regulation|retention|pii|anonymiz)\b/i,
  'ml-inference': /\b(infer|model|predict|neural|tensor|embedding|classification|regression|train|feature)\b/i,
  'accessibility': /\b(accessib|wcag|aria|screen.?read|a11y|inclusive|assistive|disability|alt.?text)\b/i,
  'api-design': /\b(api|endpoint|rest|graphql|grpc|openapi|swagger|route|middleware|gateway|schema.?first)\b/i,
  'i18n': /\b(i18n|l10n|locale|translat|internation|localiz|pluraliz|gettext|message.?catalog)\b/i,
  'predictive-analysis': /\b(predict|forecast|anomaly|detect|classif|regress|time.?series|trend|outlier|score)\b/i,
  'heuristic-synthesis': /\b(heuristic|reinforc|reward|policy|agent|optimi|gradient|learning.?rate|exploration|exploit)\b/i,
  'simulation': /\b(simulat|environment|step|reset|render|physics|tick|world|episode|trajectory)\b/i,
  'deception': /\b(deception|honeypot|canary|decoy|trap|lure|bait|fake|disinform|counter.?intellig)\b/i,
  'ethical-assessment': /\b(ethic|bias|fairness|equit|accountability|transparenc|explainab|audit.*ethic|responsible)\b/i,
  'embedded-hal': /\b(hardware|hal|register|gpio|interrupt|peripheral|firmware|embedded|driver|dma|spi|i2c|uart)\b/i,
};

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — PRIMITIVE-TO-ARCHETYPE AFFINITY MAP
// ═══════════════════════════════════════════════════════════════════════════════
//
// Primitives that strongly correlate with specific archetypes.
// Used to boost archetype assignment when the primitive is known.
// ═══════════════════════════════════════════════════════════════════════════════

const PRIMITIVE_ARCHETYPE_AFFINITY: Record<string, string[]> = {
  'ACCESS': ['rate-limiting', 'auth-control'],
  'REFLEX': ['rate-limiting', 'error-recovery'],
  'DEFENSE': ['encryption', 'deception', 'auth-control'],
  'MEDIC': ['error-recovery'],
  'IMMUNITY': ['error-recovery', 'self-evolution'],
  'AUDIT': ['observability', 'event-sourcing', 'ethical-assessment'],
  'VISION': ['observability', 'predictive-analysis'],
  'SANDBOX': ['testing', 'simulation'],
  'ECHO': ['testing', 'event-sourcing'],
  'HARVEST': ['data-pipeline'],
  'CORTEX': ['data-pipeline', 'concurrency'],
  'IDENTITY': ['auth-control'],
  'SOVEREIGN': ['data-sovereignty', 'encryption'],
  'CONSCIENCE': ['ethical-assessment', 'accessibility', 'data-sovereignty'],
  'INCLUSIVE': ['accessibility'],
  'NEXUS': ['ml-inference', 'api-design'],
  'BRAIN': ['ml-inference', 'predictive-analysis', 'heuristic-synthesis'],
  'ORACLE': ['predictive-analysis'],
  'DREAM': ['heuristic-synthesis', 'self-evolution', 'simulation'],
  'EVOLUTION': ['self-evolution'],
  'GOVERNANCE': ['cost-governance', 'auth-control'],
  'ECONOMY': ['cost-governance'],
  'MEMORY': ['state-persistence'],
  'FORGE': ['dependency-injection'],
  'LINGUA': ['i18n'],
  'INTEGRATION': ['api-design', 'dependency-injection'],
  'INTENT': ['api-design', 'event-sourcing'],
  'COMPASS': ['observability'],
  'ENGINEER': ['data-pipeline', 'api-design'],
  'ENCODE': ['encryption', 'state-persistence'],
  'RELAY': ['concurrency', 'api-design'],
  // Expansion primitives — Cyber
  'WATCHTOWER': ['observability', 'deception'],
  'SHADE': ['deception', 'encryption'],
  'AEGIS': ['encryption', 'auth-control'],
  'CIPHER': ['encryption'],
  'BASTION': ['auth-control', 'rate-limiting'],
  'PROWLER': ['deception'],
  'TRACER': ['observability'],
  'IRONCLAD': ['encryption', 'auth-control'],
  // Expansion primitives — Robotics
  'SERVO': ['embedded-hal', 'concurrency'],
  'KINETIC': ['simulation', 'embedded-hal'],
  'LIDAR': ['predictive-analysis', 'embedded-hal'],
  'FABRICATOR': ['data-pipeline', 'embedded-hal'],
  'SWARM': ['concurrency', 'heuristic-synthesis'],
  // Expansion primitives — Quantum
  'QUBIT': ['simulation', 'heuristic-synthesis'],
  'HADRON': ['simulation'],
  'ENTANGLE': ['concurrency', 'state-persistence'],
  'LATTICE': ['simulation', 'encryption'],
  // Expansion primitives — LLM
  'VERITAS': ['ethical-assessment', 'input-validation'],
  'LEXICON': ['i18n', 'ml-inference'],
  'CLARITY': ['observability', 'ethical-assessment'],
  'SKEPTIC': ['input-validation', 'ethical-assessment'],
  'SIEVE': ['input-validation', 'data-pipeline'],
  // Expansion primitives — Agency
  'MANDATE': ['auth-control', 'cost-governance'],
  'DELEGATE': ['concurrency', 'dependency-injection'],
  'SCRIBE': ['observability', 'event-sourcing'],
  'REASON': ['ml-inference', 'heuristic-synthesis'],
  'OVERSEER': ['observability', 'cost-governance'],
  'WARDEN': ['auth-control', 'deception'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — TERM EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/** Noise words to skip during term extraction */
const VAULT_NOISE = new Set([
  'the', 'and', 'for', 'with', 'that', 'from', 'this', 'into', 'over',
  'each', 'all', 'any', 'can', 'may', 'will', 'has', 'its', 'are', 'was',
  'not', 'but', 'also', 'when', 'than', 'more', 'most', 'very', 'just',
  'only', 'been', 'being', 'have', 'does', 'done', 'used', 'using',
  'based', 'level', 'high', 'full', 'real', 'time', 'data', 'system',
  'engine', 'module', 'core', 'tier', 'crown', 'jewel', 'cmpsbl',
]);

/**
 * Extract meaningful terms from a vault entry's name and description.
 * Returns deduplicated, noise-filtered identifiers.
 */
function extractVaultTerms(name: string, description: string, deps: string[]): string[] {
  const combined = `${name} ${description} ${deps.join(' ')}`;
  const raw = combined
    .replace(/[^a-zA-Z0-9_-]/g, ' ')
    .split(/\s+/)
    .map(t => t.toLowerCase().replace(/^-+|-+$/g, ''))
    .filter(t => t.length >= 4 && !VAULT_NOISE.has(t));

  // Also extract compound terms (hyphenated/underscored)
  const compounds = combined.match(/[a-zA-Z]+[-_][a-zA-Z]+[-_]?[a-zA-Z]*/g) || [];
  const compoundTerms = compounds.map(c => c.toLowerCase()).filter(c => c.length >= 6);

  return [...new Set([...raw, ...compoundTerms])].slice(0, 40);
}

/**
 * Determine which archetypes a vault entry maps to based on its vocabulary.
 */
function mapToArchetypes(
  name: string,
  description: string,
  primitive: string,
): string[] {
  const combined = `${name} ${description}`;
  const matched = new Set<string>();

  // Vocabulary-based matching
  for (const [archetypeId, pattern] of Object.entries(ARCHETYPE_VOCABULARY)) {
    if (pattern.test(combined)) {
      matched.add(archetypeId);
    }
  }

  // Primitive affinity boost
  const affinities = PRIMITIVE_ARCHETYPE_AFFINITY[primitive.toUpperCase()];
  if (affinities) {
    for (const a of affinities) {
      matched.add(a);
    }
  }

  return [...matched];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — BRIDGE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Process a single vault entry: extract terms, map to archetypes,
 * inject into feedback loop and ecosystem registry.
 */
function processVaultEntry(
  name: string,
  description: string,
  primitive: string,
  cjpi: number,
  deps: string[],
  ecosystem: string,
): { signals: number; implementations: number; mappings: number } {
  const archetypes = mapToArchetypes(name, description, primitive);
  if (archetypes.length === 0) return { signals: 0, implementations: 0, mappings: 0 };

  const terms = extractVaultTerms(name, description, deps);
  let signalCount = 0;

  // Inject terms as confirmed signals for each matched archetype
  for (const archetypeId of archetypes) {
    const extraction: FeedbackExtraction = {
      identifiers: terms,
      imports: deps.filter(d => d.length > 0),
      commentFragments: [description.slice(0, 80).toLowerCase()].filter(Boolean),
      primitive: primitive.toUpperCase(),
      archetypeId,
    };

    const added = recordConfirmedMatch(extraction);
    signalCount += added.length;
  }

  // Register in ecosystem registry as a known implementation
  recordImplementation({
    archetypeId: archetypes[0], // Primary archetype
    name: name.toLowerCase().replace(/\s+/g, '-').slice(0, 50),
    ecosystem,
    qualityScore: Math.min(100, Math.round(cjpi * 1.05)), // Vault entries are high quality
    primitives: [primitive.toUpperCase()],
    packages: deps,
    description: description.slice(0, 120),
  });

  return { signals: signalCount, implementations: 1, mappings: archetypes.length };
}

/**
 * Process an S-Tier or A-Tier Crown Jewel entry.
 */
function processSTierEntry(
  entry: STierEntry,
  vertical: string,
): { signals: number; implementations: number; mappings: number } {
  return processVaultEntry(
    entry.name,
    entry.description,
    entry.module,
    entry.cjpi,
    entry.dependencyFootprint,
    vertical,
  );
}

/**
 * Process a Showroom/Junkyard discovery.
 */
function processShowroomEntry(
  discovery: ShowroomDiscovery,
): { signals: number; implementations: number; mappings: number } {
  return processVaultEntry(
    discovery.name,
    discovery.description,
    discovery.primitiveChain[0] || 'UNKNOWN',
    discovery.cjpiScore,
    discovery.primitiveChain,
    'substrate',
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run the full vault-to-glossary bridge.
 * Iterates all vault sources and feeds confirmed ground-truth signals
 * into the scanner's feedback loop and ecosystem registry.
 *
 * Safe to call multiple times — the feedback loop handles dedup and
 * weight accumulation naturally.
 */
export function runVaultBridge(): VaultBridgeResult {
  const start = performance.now();
  let totalSignals = 0;
  let totalImplementations = 0;
  let totalMappings = 0;

  const breakdown = {
    sTierExpansion: 0,
    aTierVault: 0,
    showroom: 0,
    junkyard: 0,
    retired: 0,
    dbDiscoveries: 0,
  };

  // ── Source 1: S-Tier Expansion Jewels (1,008 entries across 7 verticals) ──
  const sTierJewels = getAllVerticalJewels();
  for (const entry of sTierJewels) {
    const vertical = inferVertical(entry.module);
    const result = processSTierEntry(entry, vertical);
    totalSignals += result.signals;
    totalImplementations += result.implementations;
    totalMappings += result.mappings;
    breakdown.sTierExpansion++;
  }

  // ── Source 2: A-Tier Vault (400 entries across 5 verticals) ──
  const aTierVault = getATierVault();
  for (const entry of aTierVault.entries) {
    const vertical = inferVertical(entry.module);
    const result = processSTierEntry(entry, vertical);
    totalSignals += result.signals;
    totalImplementations += result.implementations;
    totalMappings += result.mappings;
    breakdown.aTierVault++;
  }

  // ── Source 3: Showroom discoveries ──
  const showroom = getAvailableDiscoveries();
  for (const discovery of showroom) {
    const result = processShowroomEntry(discovery);
    totalSignals += result.signals;
    totalImplementations += result.implementations;
    totalMappings += result.mappings;
    breakdown.showroom++;
  }

  // ── Source 4: Junkyard discoveries ──
  const junkyard = getJunkyardDiscoveries();
  for (const discovery of junkyard) {
    const result = processShowroomEntry(discovery);
    totalSignals += result.signals;
    totalImplementations += result.implementations;
    totalMappings += result.mappings;
    breakdown.junkyard++;
  }

  // ── Source 5: Retired (purchased) discoveries ──
  const retired = getRetiredDiscoveries();
  for (const discovery of retired) {
    const result = processShowroomEntry(discovery);
    totalSignals += result.signals;
    totalImplementations += result.implementations;
    totalMappings += result.mappings;
    breakdown.retired++;
  }

  const totalProcessed = breakdown.sTierExpansion + breakdown.aTierVault +
    breakdown.showroom + breakdown.junkyard + breakdown.retired;

  const feedbackStats = getFeedbackStats();
  const registryStats = getRegistryStats();

  return {
    totalProcessed,
    signalsInjected: totalSignals,
    implementationsRegistered: totalImplementations,
    archetypeMappings: totalMappings,
    durationMs: Math.round(performance.now() - start),
    breakdown,
    feedbackStats: {
      totalSignals: feedbackStats.totalSignals,
      uniquePrimitives: feedbackStats.uniquePrimitives,
    },
    registryStats: {
      totalEntries: registryStats.totalEntries,
      avgQuality: registryStats.avgQuality,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6b — DB-BACKED DISCOVERY BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════
//
// Fetches ALL discoveries from the `discoveries` table (the 4,000+ backlog)
// and processes them as ground-truth training data. This closes the gap
// where manually-discovered items were never fed into the scanner.
// ═══════════════════════════════════════════════════════════════════════════════

/** Page size for DB fetches — avoids the 1000-row default limit */
const DB_PAGE_SIZE = 500;

interface DBDiscoveryRow {
  id: string;
  name: string;
  description: string | null;
  cjpi: number | null;
  module_chain: string[] | null;
  category: string | null;
}

/**
 * Fetch all discoveries from the database in pages.
 * Returns a flat array of all rows.
 */
async function fetchAllDBDiscoveries(): Promise<DBDiscoveryRow[]> {
  const all: DBDiscoveryRow[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('discoveries')
      .select('id, name, description, cjpi, module_chain, category')
      .range(offset, offset + DB_PAGE_SIZE - 1)
      .order('cjpi', { ascending: false });

    if (error || !data || data.length === 0) {
      hasMore = false;
      break;
    }

    all.push(...(data as DBDiscoveryRow[]));
    offset += DB_PAGE_SIZE;
    if (data.length < DB_PAGE_SIZE) hasMore = false;
  }

  return all;
}

/**
 * Run the full vault-to-glossary bridge WITH database-backed discoveries.
 * This is the production version that includes all 4,000+ manually
 * discovered capabilities from the `discoveries` table.
 *
 * Call this instead of `runVaultBridge()` during autonomous cycles
 * to ensure the complete discovery backlog trains the scanner.
 */
export async function runVaultBridgeWithDB(): Promise<VaultBridgeResult> {
  // First run the synchronous bridge (S-Tier, A-Tier, in-memory catalog)
  const syncResult = runVaultBridge();

  // Then layer on the DB discoveries
  const dbStart = performance.now();
  const dbRows = await fetchAllDBDiscoveries();

  let dbSignals = 0;
  let dbImplementations = 0;
  let dbMappings = 0;

  for (const row of dbRows) {
    if (!row.name || row.cjpi == null) continue;

    const primaryPrimitive = row.module_chain?.[0] || 'SYSTEM';
    const result = processVaultEntry(
      row.name,
      row.description || '',
      primaryPrimitive,
      row.cjpi,
      row.module_chain || [],
      'db-discoveries',
    );

    dbSignals += result.signals;
    dbImplementations += result.implementations;
    dbMappings += result.mappings;

    // Inject each non-primary primitive for co-firing pattern learning
    if (row.module_chain && row.module_chain.length > 1) {
      for (let i = 1; i < Math.min(row.module_chain.length, 6); i++) {
        const secondaryResult = processVaultEntry(
          row.name,
          row.description || '',
          row.module_chain[i],
          row.cjpi,
          row.module_chain,
          'db-discoveries',
        );
        dbSignals += secondaryResult.signals;
        dbMappings += secondaryResult.mappings;
      }
    }
  }

  const dbDuration = Math.round(performance.now() - dbStart);
  const feedbackStats = getFeedbackStats();
  const registryStats = getRegistryStats();

  return {
    totalProcessed: syncResult.totalProcessed + dbRows.length,
    signalsInjected: syncResult.signalsInjected + dbSignals,
    implementationsRegistered: syncResult.implementationsRegistered + dbImplementations,
    archetypeMappings: syncResult.archetypeMappings + dbMappings,
    durationMs: syncResult.durationMs + dbDuration,
    breakdown: {
      ...syncResult.breakdown,
      dbDiscoveries: dbRows.length,
    },
    feedbackStats: {
      totalSignals: feedbackStats.totalSignals,
      uniquePrimitives: feedbackStats.uniquePrimitives,
    },
    registryStats: {
      totalEntries: registryStats.totalEntries,
      avgQuality: registryStats.avgQuality,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — REACTOR CHAIN BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════

export interface ReactorChainBridgeResult {
  /** Total reactor templates processed */
  templatesProcessed: number;
  /** Signals injected into the feedback loop */
  signalsInjected: number;
  /** Implementations registered */
  implementationsRegistered: number;
  /** Archetype mappings discovered */
  archetypeMappings: number;
  /** Processing time */
  durationMs: number;
  /** Categories covered */
  categoriesCovered: number;
  /** Unique primitives seen across all chains */
  uniquePrimitives: number;
}

/**
 * Run the Reactor Chain Bridge.
 * Processes all 126 SynthesisTemplates from the discovery reactor
 * as ground-truth training data. Each template contains:
 *   - namePattern + descriptionPattern → vocabulary signals
 *   - modulePattern → primitive co-firing chains (behavioral ground truth)
 *   - category → domain mapping
 *   - rationale → intent-layer vocabulary
 *
 * This is higher-quality than vault entries because templates encode
 * behavioral relationships between primitives, not just static classifications.
 */
export function runReactorChainBridge(): ReactorChainBridgeResult {
  const start = performance.now();
  let totalSignals = 0;
  let totalImplementations = 0;
  let totalMappings = 0;
  const categories = new Set<string>();
  const allPrimitives = new Set<string>();

  for (const template of SYNTHESIS_TEMPLATES) {
    categories.add(template.category);
    for (const m of template.modulePattern) allPrimitives.add(m.toUpperCase());

    // Each template acts as a confirmed ground-truth entry:
    // name + description + rationale provide vocabulary,
    // modulePattern provides primitive co-firing data
    const combinedDescription = `${template.descriptionPattern}. ${template.rationale}`;
    const primaryPrimitive = template.modulePattern[0] || 'SYSTEM';

    const result = processVaultEntry(
      template.namePattern,
      combinedDescription,
      primaryPrimitive,
      computeTemplateCjpi(template),
      template.modulePattern, // Primitive chain as "deps" — feeds vocabulary extraction
      'reactor-chains',
    );

    totalSignals += result.signals;
    totalImplementations += result.implementations;
    totalMappings += result.mappings;

    // Additionally, inject each non-primary primitive as a separate
    // confirmed signal to capture co-firing patterns the primary misses
    for (let i = 1; i < template.modulePattern.length; i++) {
      const secondaryResult = processVaultEntry(
        template.namePattern,
        combinedDescription,
        template.modulePattern[i],
        computeTemplateCjpi(template),
        template.modulePattern,
        'reactor-chains',
      );
      totalSignals += secondaryResult.signals;
      // Don't double-count implementations — only one per template
      totalMappings += secondaryResult.mappings;
    }
  }

  return {
    templatesProcessed: SYNTHESIS_TEMPLATES.length,
    signalsInjected: totalSignals,
    implementationsRegistered: totalImplementations,
    archetypeMappings: totalMappings,
    durationMs: Math.round(performance.now() - start),
    categoriesCovered: categories.size,
    uniquePrimitives: allPrimitives.size,
  };
}

/**
 * Compute effective CJPI from a template's baseBreakdown.
 * Uses the same weighted formula as the reactor.
 */
function computeTemplateCjpi(template: SynthesisTemplate): number {
  const b = template.baseBreakdown;
  // Weighted average matching reactor scoring
  return Math.round(
    b.strategicLeverage * 0.20 +
    b.recursionPotential * 0.15 +
    b.crossNodeImpact * 0.20 +
    b.composability * 0.15 +
    b.governanceInfluence * 0.15 +
    b.moatSensitivity * 0.15
  );
}

/**
 * Infer vertical from primitive name.
 * Used to tag ecosystem registry entries with the correct vertical.
 */
function inferVertical(primitive: string): string {
  const CYBER_PRIMS = new Set(['WATCHTOWER', 'SHADE', 'AEGIS', 'CIPHER', 'RECON', 'VANGUARD', 'BASTION', 'TEMPEST', 'PROWLER', 'ONYX', 'SPECTER', 'BLACKOUT', 'TRACER', 'NOCTURNE', 'IRONCLAD', 'CITADEL']);
  const ROBOTICS_PRIMS = new Set(['SERVO', 'KINETIC', 'LIDAR', 'FABRICATOR', 'FLUX', 'VECTOR', 'TENSOR', 'CALIBER', 'GRIPPER', 'SWARM', 'ENVIRON', 'MARSHAL', 'DISPATCH', 'WELDER', 'INSPECTOR', 'PIONEER']);
  const QUANTUM_PRIMS = new Set(['HADRON', 'QUBIT', 'PHOTON', 'FERMION', 'ENTANGLE', 'LATTICE', 'PLASMA', 'CRYOGEN', 'MUON', 'BOSON', 'NEUTRINO', 'GLUON', 'GRAVITON', 'TACHYON', 'MESON', 'PRISM']);
  const LLM_PRIMS = new Set(['VERITAS', 'RAMPART', 'SYLLOGISM', 'LEXICON', 'CLARITY', 'FULCRUM', 'TETHER', 'SIEVE', 'SKEPTIC', 'TRIBUNAL', 'HERALD', 'MIMIC', 'LINEAGE', 'EMBARGO', 'GAUNTLET', 'CUSTODIAN']);
  const AGENCY_PRIMS = new Set(['MANDATE', 'DELEGATE', 'RECONN', 'UPLINK', 'SCRIBE', 'INCENTIVE', 'REASON', 'TOOLKIT', 'OPERATOR', 'OVERSEER', 'LIAISON', 'SCHOLAR', 'ENVOY', 'WARDEN', 'ROGUE', 'ANCHOR']);
  const ULTIMATE_PRIMS = new Set(['APEX', 'CONDUIT', 'GENESIS', 'CRUCIBLE', 'MERIDIAN', 'DYNAMO', 'SENTINEL', 'CATALYST', 'ARBITER', 'NOMAD', 'PHOENIX']);

  const p = primitive.toUpperCase();
  if (CYBER_PRIMS.has(p)) return 'cyber';
  if (ROBOTICS_PRIMS.has(p)) return 'robotics';
  if (QUANTUM_PRIMS.has(p)) return 'quantum';
  if (LLM_PRIMS.has(p)) return 'llm';
  if (AGENCY_PRIMS.has(p)) return 'agency';
  if (ULTIMATE_PRIMS.has(p)) return 'ultimate';
  return 'substrate';
}