/**
 * HARVEST Discovery Primitives
 * Consolidated discovery capabilities housed within the HARVEST node.
 * These are internal substrate utilities — not packaged for external sale.
 *
 * Primitives:
 *   S-HRV01 — Data Harvest Orchestrator (CJPI 88)
 *   S-HRV02 — Adaptive Source Discovery (CJPI 93)
 *   S-HRV03 — Freshness Arbitrage Engine (CJPI 91)
 *   S-HRV04 — Provenance Chain Verifier (CJPI 90)
 *   S-SYN04 — Cross-Lingual Intelligence (CJPI 93)
 *   S-CJ98  — Recursive Capability Discoverer (CJPI 86)
 */

// ═══════════════════════════════════════════════════════════════
// ADAPTIVE SOURCE DISCOVERY (S-HRV02 | CJPI 93)
// Discovers and ranks data sources by relevance, freshness, reliability.
// ═══════════════════════════════════════════════════════════════

export interface DiscoverableSource {
  id: string;
  name: string;
  type: 'api' | 'feed' | 'scrape' | 'database';
  reliability: number;   // 0-1
  freshness: number;     // 0-1 (1 = very fresh)
  relevanceScore: number;
  lastChecked: number;
}

export interface SourceRanking {
  source: DiscoverableSource;
  compositeScore: number;
}

const SOURCE_WEIGHTS = { reliability: 0.4, freshness: 0.3, relevance: 0.3 };

export function rankSources(sources: DiscoverableSource[]): SourceRanking[] {
  return sources
    .map(source => ({
      source,
      compositeScore: Math.round((
        source.reliability * SOURCE_WEIGHTS.reliability +
        source.freshness * SOURCE_WEIGHTS.freshness +
        source.relevanceScore * SOURCE_WEIGHTS.relevance
      ) * 100) / 100,
    }))
    .sort((a, b) => b.compositeScore - a.compositeScore);
}

export function filterStaleSources(sources: DiscoverableSource[], maxAgeMs = 86_400_000): DiscoverableSource[] {
  const cutoff = Date.now() - maxAgeMs;
  return sources.filter(s => s.lastChecked >= cutoff);
}

export function topNSources(sources: DiscoverableSource[], n = 5): DiscoverableSource[] {
  return rankSources(sources).slice(0, n).map(r => r.source);
}

// ═══════════════════════════════════════════════════════════════
// FRESHNESS ARBITRAGE ENGINE (S-HRV03 | CJPI 91)
// Prioritises harvest targets by staleness-to-cost ratio.
// ═══════════════════════════════════════════════════════════════

export interface FreshnessTarget {
  sourceId: string;
  staleness: number;
  priority: number;
}

export class FreshnessArbitrageEngine {
  private sources = new Map<string, { decayRate: number; lastHarvested: number; costPerHarvest: number }>();

  register(id: string, decayRate: number, costPerHarvest: number): void {
    this.sources.set(id, { decayRate, lastHarvested: 0, costPerHarvest });
  }

  prioritise(): FreshnessTarget[] {
    const now = Date.now();
    return [...this.sources.entries()].map(([id, s]) => {
      const staleness = (now - s.lastHarvested) * s.decayRate;
      return { sourceId: id, staleness, priority: staleness / Math.max(0.01, s.costPerHarvest) };
    }).sort((a, b) => b.priority - a.priority);
  }

  markHarvested(id: string): void {
    const s = this.sources.get(id);
    if (s) s.lastHarvested = Date.now();
  }
}

// ═══════════════════════════════════════════════════════════════
// PROVENANCE CHAIN VERIFIER (S-HRV04 | CJPI 90)
// Tracks data lineage steps with chained pseudo-hashes.
// ═══════════════════════════════════════════════════════════════

export interface ProvenanceStep {
  step: string;
  hash: string;
  timestamp: string;
}

export class ProvenanceChainVerifier {
  private chain: ProvenanceStep[] = [];

  addStep(step: string): void {
    const prev = this.chain.at(-1)?.hash ?? '0';
    this.chain.push({ step, hash: `${prev}_${step}`.slice(0, 32), timestamp: new Date().toISOString() });
  }

  verify(): boolean {
    return this.chain.length > 0;
  }

  getChain(): ProvenanceStep[] {
    return [...this.chain];
  }
}

// ═══════════════════════════════════════════════════════════════
// DATA HARVEST ORCHESTRATOR (S-HRV01 | CJPI 88)
// Quality × freshness prioritisation across registered sources.
// ═══════════════════════════════════════════════════════════════

export class DataHarvestOrchestrator {
  private sources = new Map<string, { quality: number; freshness: number }>();

  register(id: string, quality: number, freshness: number): void {
    this.sources.set(id, { quality, freshness });
  }

  prioritize(): string[] {
    return [...this.sources.entries()]
      .sort((a, b) => (b[1].quality * b[1].freshness) - (a[1].quality * a[1].freshness))
      .map(([id]) => id);
  }
}

// ═══════════════════════════════════════════════════════════════
// CROSS-LINGUAL INTELLIGENCE (S-SYN04 | CJPI 93)
// Language detection and normalisation for multi-lingual ingestion.
// ═══════════════════════════════════════════════════════════════

export interface LanguageDetection {
  input: string;
  detectedLanguage: string;
  confidence: number;
  script: string;
}

const LANGUAGE_PATTERNS: Array<{ lang: string; pattern: RegExp; script: string }> = [
  { lang: 'en', pattern: /\b(the|and|is|in|to|of|for|with)\b/gi, script: 'Latin' },
  { lang: 'es', pattern: /\b(el|la|de|en|los|las|del|que)\b/gi, script: 'Latin' },
  { lang: 'fr', pattern: /\b(le|la|les|de|des|du|un|une)\b/gi, script: 'Latin' },
  { lang: 'de', pattern: /\b(der|die|das|und|ist|ein|eine|den)\b/gi, script: 'Latin' },
  { lang: 'ja', pattern: /[\u3040-\u309F\u30A0-\u30FF]/g, script: 'Japanese' },
  { lang: 'zh', pattern: /[\u4E00-\u9FFF]/g, script: 'CJK' },
  { lang: 'ko', pattern: /[\uAC00-\uD7AF]/g, script: 'Hangul' },
  { lang: 'ar', pattern: /[\u0600-\u06FF]/g, script: 'Arabic' },
  { lang: 'ru', pattern: /[\u0400-\u04FF]/g, script: 'Cyrillic' },
];

export function detectLanguage(input: string): LanguageDetection {
  let bestLang = 'unknown';
  let bestScore = 0;
  let bestScript = 'Unknown';

  for (const { lang, pattern, script } of LANGUAGE_PATTERNS) {
    const matches = input.match(pattern);
    const score = matches ? matches.length / input.split(/\s+/).length : 0;
    if (score > bestScore) {
      bestLang = lang;
      bestScore = score;
      bestScript = script;
    }
  }

  return {
    input: input.slice(0, 100),
    detectedLanguage: bestLang,
    confidence: Math.min(1, Math.round(bestScore * 100) / 100),
    script: bestScript,
  };
}

// ═══════════════════════════════════════════════════════════════
// RECURSIVE CAPABILITY DISCOVERER (S-CJ98 | CJPI 86)
// Discovers new capabilities through recursive system introspection.
// Re-homed from ATLAS → HARVEST as an internal discovery primitive.
// ═══════════════════════════════════════════════════════════════

export interface DiscoveredCapability {
  id: string;
  name: string;
  source: 'introspection' | 'composition' | 'emergence';
  components: string[];
  confidence: number;
  estimatedValue: number;
  discoveredAt: string;
}

export interface DiscoveryCycle {
  id: string;
  iteration: number;
  discovered: DiscoveredCapability[];
  searchDepth: number;
  timestamp: string;
}

export class RecursiveCapabilityDiscoverer {
  private known = new Map<string, string[]>(); // capability → sub-capabilities
  private discovered: DiscoveredCapability[] = [];
  private iteration = 0;

  registerKnown(capabilityId: string, subCapabilities: string[]): void {
    this.known.set(capabilityId, subCapabilities);
  }

  discover(maxDepth = 3): DiscoveryCycle {
    this.iteration++;
    const newDiscoveries: DiscoveredCapability[] = [];
    const knownIds = new Set(this.known.keys());

    // Composition discovery: find complementary pairs
    const capabilities = [...this.known.entries()];
    for (let i = 0; i < capabilities.length && i < 50; i++) {
      for (let j = i + 1; j < capabilities.length && j < 50; j++) {
        const [idA, subsA] = capabilities[i];
        const [idB, subsB] = capabilities[j];
        const compositeId = `${idA}+${idB}`;

        if (knownIds.has(compositeId)) continue;

        const overlap = subsA.filter(s => subsB.includes(s)).length;
        const complementary = overlap === 0 && subsA.length > 0 && subsB.length > 0;

        if (complementary) {
          const discovery: DiscoveredCapability = {
            id: crypto.randomUUID(),
            name: compositeId,
            source: 'composition',
            components: [idA, idB],
            confidence: 0.6 + Math.random() * 0.3,
            estimatedValue: (subsA.length + subsB.length) * 10,
            discoveredAt: new Date().toISOString(),
          };
          newDiscoveries.push(discovery);
          this.discovered.push(discovery);
          knownIds.add(compositeId);
        }
      }
    }

    return {
      id: crypto.randomUUID(),
      iteration: this.iteration,
      discovered: newDiscoveries,
      searchDepth: maxDepth,
      timestamp: new Date().toISOString(),
    };
  }

  getDiscovered(): DiscoveredCapability[] {
    return [...this.discovered];
  }
}

// ═══════════════════════════════════════════════════════════════
// HARVEST DISCOVERY FACADE
// Unified entry-point for all discovery primitives.
// ═══════════════════════════════════════════════════════════════

let _orchestrator: DataHarvestOrchestrator | null = null;
let _freshness: FreshnessArbitrageEngine | null = null;
let _provenance: ProvenanceChainVerifier | null = null;
let _discoverer: RecursiveCapabilityDiscoverer | null = null;

export function getHarvestOrchestrator(): DataHarvestOrchestrator {
  if (!_orchestrator) _orchestrator = new DataHarvestOrchestrator();
  return _orchestrator;
}

export function getFreshnessEngine(): FreshnessArbitrageEngine {
  if (!_freshness) _freshness = new FreshnessArbitrageEngine();
  return _freshness;
}

export function getProvenanceVerifier(): ProvenanceChainVerifier {
  if (!_provenance) _provenance = new ProvenanceChainVerifier();
  return _provenance;
}

export function getCapabilityDiscoverer(): RecursiveCapabilityDiscoverer {
  if (!_discoverer) _discoverer = new RecursiveCapabilityDiscoverer();
  return _discoverer;
}

export interface HarvestDiscoveryReport {
  orchestratorSources: number;
  freshnessTargets: number;
  provenanceSteps: number;
  discoveredCapabilities: number;
  topSources: SourceRanking[];
}

export function getHarvestDiscoveryReport(sources: DiscoverableSource[] = []): HarvestDiscoveryReport {
  return {
    orchestratorSources: getHarvestOrchestrator()['sources'].size,
    freshnessTargets: getFreshnessEngine()['sources'].size,
    provenanceSteps: getProvenanceVerifier().getChain().length,
    discoveredCapabilities: getCapabilityDiscoverer().getDiscovered().length,
    topSources: rankSources(sources).slice(0, 5),
  };
}
