/**
 * CMPSBL® LLM Vertical — Discovery Seed Engine (GENESIS)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates 200 high-bias discoveries using the LLM primitive matrix.
 *
 * © CMPSBL® — All rights reserved.
 */

import { addDiscovery } from '../discovery-retirement';
import { routeDiscovery } from '../foundry-engine';
import { persistSeedDiscoveries, ensureSeedRun } from './seed-persistence';

// ═══════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════

export interface LlmDiscovery {
  id: string;
  name: string;
  description: string;
  cjpiScore: number;
  primitiveChain: string[];
  tier: 'Raw' | 'Mint' | 'Prime' | 'Relic' | 'Mythic' | 'Apex';
  route: 'vault' | 'showroom' | 'junkyard';
  category: 'prompt-engineering' | 'guardrails' | 'rag' | 'output-validation' | 'reasoning-chains' | 'model-routing' | 'safety' | 'evaluation';
  discoveredAt: string;
}

export interface LlmSeedResult {
  runId: string;
  totalDiscoveries: number;
  vaultCount: number;
  showroomCount: number;
  junkyardCount: number;
  memoryStreamCount: number;
  discoveries: LlmDiscovery[];
  completedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// §2 — PRIMITIVES & TEMPLATES
// ═══════════════════════════════════════════════════════════════

function seedRng(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff; };
}

const LLM_PRIMITIVES = [
  'VERITAS', 'RAMPART', 'SYLLOGISM', 'LEXICON', 'CLARITY', 'FULCRUM',
  'TETHER', 'SIEVE', 'SKEPTIC', 'TRIBUNAL', 'HERALD', 'MIMIC',
  'LINEAGE', 'EMBARGO', 'GAUNTLET', 'CUSTODIAN',
];

const SPINE_IDS = [
  'BRAIN', 'MEMORY', 'IDENTITY', 'CONSCIENCE', 'COMPASS', 'REFLEX',
  'DEFENSE', 'GOVERNANCE', 'EVOLUTION', 'SHADOW', 'SOVEREIGN',
  'TREATY', 'RELAY', 'IMMUNITY', 'BEACON', 'NERVE', 'NEXUS',
  'CORE', 'SYSTEM', 'MEDIC', 'ATLAS', 'ACCESS', 'INTENT', 'INTEGRATION',
];

interface DiscoveryTemplate {
  namePattern: string;
  descriptionPattern: string;
  category: LlmDiscovery['category'];
  primaryPrimitives: string[];
  minChainLength: number;
  maxChainLength: number;
  cjpiBias: number;
}

const DISCOVERY_TEMPLATES: DiscoveryTemplate[] = [
  // ═══ PROMPT ENGINEERING (high CJPI) ═══
  { namePattern: 'Chain-of-Thought Injection Compiler', descriptionPattern: 'Automatically restructures prompts into multi-step reasoning chains with intermediate verification checkpoints and self-correction hooks.', category: 'prompt-engineering', primaryPrimitives: ['SYLLOGISM', 'CLARITY', 'LEXICON'], minChainLength: 5, maxChainLength: 8, cjpiBias: 30 },
  { namePattern: 'Adversarial Prompt Hardening Engine', descriptionPattern: 'Systematically stress-tests prompts against known jailbreak patterns and injection attacks, producing hardened variants with defense layers.', category: 'prompt-engineering', primaryPrimitives: ['GAUNTLET', 'RAMPART', 'SKEPTIC'], minChainLength: 5, maxChainLength: 8, cjpiBias: 28 },
  { namePattern: 'Context Window Optimization Pipeline', descriptionPattern: 'Intelligent context pruning and prioritization ensuring maximum information density within token limits without semantic loss.', category: 'prompt-engineering', primaryPrimitives: ['SIEVE', 'LEXICON', 'CLARITY'], minChainLength: 5, maxChainLength: 8, cjpiBias: 32 },
  { namePattern: 'Few-Shot Example Curator', descriptionPattern: 'Automated selection and ordering of few-shot examples from a corpus to maximize in-context learning effectiveness for novel tasks.', category: 'prompt-engineering', primaryPrimitives: ['LEXICON', 'MIMIC', 'CLARITY'], minChainLength: 5, maxChainLength: 7, cjpiBias: 29 },

  // ═══ GUARDRAILS (high CJPI) ═══
  { namePattern: 'Multi-Layer Output Firewall', descriptionPattern: 'Cascading output filter chain with toxicity detection, PII redaction, hallucination flagging, and policy compliance verification.', category: 'guardrails', primaryPrimitives: ['RAMPART', 'EMBARGO', 'CUSTODIAN'], minChainLength: 5, maxChainLength: 8, cjpiBias: 30 },
  { namePattern: 'Semantic Boundary Enforcement Engine', descriptionPattern: 'Prevents model outputs from exceeding defined semantic boundaries with topic drift detection and automatic redirection.', category: 'guardrails', primaryPrimitives: ['TETHER', 'RAMPART', 'TRIBUNAL'], minChainLength: 5, maxChainLength: 7, cjpiBias: 27 },
  { namePattern: 'PII Detection and Redaction Pipeline', descriptionPattern: 'Real-time personally identifiable information detection across 40+ entity types with contextual redaction and audit trail generation.', category: 'guardrails', primaryPrimitives: ['CUSTODIAN', 'SIEVE', 'EMBARGO'], minChainLength: 4, maxChainLength: 7, cjpiBias: 25 },
  { namePattern: 'Content Policy Compliance Gate', descriptionPattern: 'Configurable policy engine that evaluates model outputs against organizational content guidelines with severity scoring and escalation.', category: 'guardrails', primaryPrimitives: ['TRIBUNAL', 'RAMPART', 'GOVERNANCE'], minChainLength: 5, maxChainLength: 7, cjpiBias: 26 },

  // ═══ RAG (mid-high CJPI) ═══
  { namePattern: 'Hybrid Retrieval Fusion Engine', descriptionPattern: 'Combines dense vector search, sparse BM25 retrieval, and knowledge graph traversal with reciprocal rank fusion for maximum recall.', category: 'rag', primaryPrimitives: ['LEXICON', 'SIEVE', 'BRAIN'], minChainLength: 4, maxChainLength: 6, cjpiBias: 20 },
  { namePattern: 'Retrieval Quality Scoring Pipeline', descriptionPattern: 'Post-retrieval relevance scoring that filters noise chunks, re-ranks by semantic alignment, and detects contradictory sources.', category: 'rag', primaryPrimitives: ['SKEPTIC', 'SIEVE', 'VERITAS'], minChainLength: 4, maxChainLength: 6, cjpiBias: 18 },
  { namePattern: 'Document Chunking Strategy Engine', descriptionPattern: 'Adaptive document segmentation that respects semantic boundaries, preserves context overlap, and optimizes chunk size for retrieval quality.', category: 'rag', primaryPrimitives: ['LEXICON', 'CLARITY', 'SIEVE'], minChainLength: 3, maxChainLength: 5, cjpiBias: 16 },
  { namePattern: 'Citation and Provenance Tracker', descriptionPattern: 'Attaches source citations to every generated claim with page-level provenance, enabling fact-checking against original documents.', category: 'rag', primaryPrimitives: ['LINEAGE', 'VERITAS', 'LEXICON'], minChainLength: 4, maxChainLength: 6, cjpiBias: 17 },

  // ═══ OUTPUT VALIDATION (mid CJPI) ═══
  { namePattern: 'Structured Output Schema Enforcer', descriptionPattern: 'Validates and repairs model outputs against JSON Schema, XML Schema, or custom format specifications with type coercion and default filling.', category: 'output-validation', primaryPrimitives: ['VERITAS', 'CLARITY', 'TETHER'], minChainLength: 3, maxChainLength: 5, cjpiBias: 14 },
  { namePattern: 'Hallucination Detection Engine', descriptionPattern: 'Cross-references generated facts against retrieval corpus and knowledge base to flag unsupported claims with confidence scoring.', category: 'output-validation', primaryPrimitives: ['SKEPTIC', 'VERITAS', 'LINEAGE'], minChainLength: 3, maxChainLength: 5, cjpiBias: 12 },
  { namePattern: 'Temporal Fact Verification System', descriptionPattern: 'Validates time-sensitive claims by checking temporal consistency against known event timelines and detecting anachronistic statements.', category: 'output-validation', primaryPrimitives: ['VERITAS', 'SKEPTIC', 'BRAIN'], minChainLength: 3, maxChainLength: 5, cjpiBias: 10 },

  // ═══ REASONING CHAINS (mid CJPI) ═══
  { namePattern: 'Multi-Step Reasoning Verifier', descriptionPattern: 'Validates logical consistency across multi-step reasoning chains by checking intermediate conclusions and detecting logical fallacies.', category: 'reasoning-chains', primaryPrimitives: ['SYLLOGISM', 'SKEPTIC', 'VERITAS'], minChainLength: 4, maxChainLength: 6, cjpiBias: 20 },
  { namePattern: 'Ensemble Arbitration Engine', descriptionPattern: 'Runs multiple reasoning paths in parallel, compares conclusions, and selects the most consistent answer through structured debate.', category: 'reasoning-chains', primaryPrimitives: ['TRIBUNAL', 'SYLLOGISM', 'FULCRUM'], minChainLength: 3, maxChainLength: 5, cjpiBias: 15 },
  { namePattern: 'Self-Consistency Checker', descriptionPattern: 'Samples multiple completions for the same prompt and detects inconsistencies that indicate model uncertainty or knowledge gaps.', category: 'reasoning-chains', primaryPrimitives: ['SKEPTIC', 'SYLLOGISM', 'CLARITY'], minChainLength: 3, maxChainLength: 5, cjpiBias: 13 },
  { namePattern: 'Logical Fallacy Detection Engine', descriptionPattern: 'Pattern-based detection of common logical fallacies in model reasoning including circular reasoning, false dichotomies, and appeal to authority.', category: 'reasoning-chains', primaryPrimitives: ['SYLLOGISM', 'SKEPTIC', 'CONSCIENCE'], minChainLength: 3, maxChainLength: 5, cjpiBias: 11 },

  // ═══ MODEL ROUTING (mid CJPI) ═══
  { namePattern: 'Cost-Optimized Model Router', descriptionPattern: 'Routes prompts to the cheapest model capable of meeting quality thresholds using task complexity estimation and historical performance data.', category: 'model-routing', primaryPrimitives: ['FULCRUM', 'HERALD', 'MIMIC'], minChainLength: 3, maxChainLength: 5, cjpiBias: 15 },
  { namePattern: 'Latency-Aware Model Selector', descriptionPattern: 'Real-time model selection based on current latency profiles, queue depths, and SLA requirements with fallback cascading.', category: 'model-routing', primaryPrimitives: ['HERALD', 'FULCRUM', 'RELAY'], minChainLength: 3, maxChainLength: 5, cjpiBias: 14 },

  // ═══ SAFETY (lower CJPI) ═══
  { namePattern: 'Prompt Injection Detection Scanner', descriptionPattern: 'Heuristic and pattern-based detection of prompt injection attempts including indirect injection via retrieved documents.', category: 'safety', primaryPrimitives: ['GAUNTLET', 'RAMPART'], minChainLength: 2, maxChainLength: 4, cjpiBias: 8 },
  { namePattern: 'Token Budget Enforcer', descriptionPattern: 'Hard and soft token limits with progressive summarization when approaching budget ceiling to prevent runaway costs.', category: 'safety', primaryPrimitives: ['EMBARGO', 'TETHER'], minChainLength: 2, maxChainLength: 3, cjpiBias: 4 },
  { namePattern: 'Model Output Rate Limiter', descriptionPattern: 'Configurable rate limiting for model API calls with token bucket algorithm, queue management, and priority lanes.', category: 'safety', primaryPrimitives: ['EMBARGO', 'CUSTODIAN'], minChainLength: 2, maxChainLength: 3, cjpiBias: 2 },

  // ═══ EVALUATION (lower CJPI, junkyard candidates) ═══
  { namePattern: 'Automated Eval Suite Runner', descriptionPattern: 'Batch evaluation framework running standardized benchmarks across model versions with regression detection and score tracking.', category: 'evaluation', primaryPrimitives: ['VERITAS', 'TRIBUNAL'], minChainLength: 2, maxChainLength: 3, cjpiBias: 0 },
  { namePattern: 'Human Preference Alignment Scorer', descriptionPattern: 'Simulated preference scoring that predicts human evaluation outcomes using proxy metrics calibrated against historical preference data.', category: 'evaluation', primaryPrimitives: ['MIMIC', 'VERITAS'], minChainLength: 2, maxChainLength: 3, cjpiBias: -2 },
  { namePattern: 'Response Quality Telemetry Collector', descriptionPattern: 'Lightweight telemetry collection for response quality metrics including latency, token usage, and user satisfaction signals.', category: 'evaluation', primaryPrimitives: ['HERALD', 'BEACON'], minChainLength: 2, maxChainLength: 3, cjpiBias: -3 },
];

// ═══════════════════════════════════════════════════════════════
// §3 — SCORING
// ═══════════════════════════════════════════════════════════════

function scoreCjpi(chainLength: number, bias: number, rand: () => number): number {
  const chainBonus = chainLength * 5;
  const base = 45 + chainBonus + Math.floor(rand() * 15);
  return Math.min(100, Math.max(30, base + bias));
}

function classifyTier(score: number): LlmDiscovery['tier'] {
  if (score === 100) return 'Apex';
  if (score >= 94) return 'Mythic';
  if (score >= 90) return 'Relic';
  if (score >= 80) return 'Prime';
  if (score >= 68) return 'Mint';
  return 'Raw';
}

// ═══════════════════════════════════════════════════════════════
// §4 — CHAIN BUILDER
// ═══════════════════════════════════════════════════════════════

function buildChain(template: DiscoveryTemplate, rand: () => number): string[] {
  const chain = [...template.primaryPrimitives];
  const targetLen = template.minChainLength + Math.floor(rand() * (template.maxChainLength - template.minChainLength + 1));
  const allPool = [...LLM_PRIMITIVES, ...SPINE_IDS];
  while (chain.length < targetLen) {
    const candidate = allPool[Math.floor(rand() * allPool.length)];
    if (!chain.includes(candidate)) chain.push(candidate);
  }
  return chain;
}

// ═══════════════════════════════════════════════════════════════
// §5 — VARIANT NAME GENERATOR
// ═══════════════════════════════════════════════════════════════

const VARIANT_PREFIXES = [
  'Autonomous', 'Adaptive', 'Recursive', 'Distributed', 'Multi-Model',
  'Adversarial', 'Proactive', 'Hardened', 'Predictive', 'Semantic',
  'Continuous', 'Deterministic', 'Intelligent', 'Self-Correcting', 'Dynamic',
  'Production-Grade', 'Mission-Critical', 'Context-Aware', 'Token-Efficient', 'Zero-Shot',
];

const VARIANT_SUFFIXES = [
  'Engine', 'Guard', 'Protocol', 'Pipeline', 'Matrix',
  'Orchestrator', 'Analyzer', 'Framework', 'System', 'Validator',
  'Network', 'Controller', 'Optimizer', 'Scanner', 'Layer',
];

function generateVariantName(base: string, index: number, rand: () => number): string {
  if (index === 0) return base;
  const prefix = VARIANT_PREFIXES[Math.floor(rand() * VARIANT_PREFIXES.length)];
  const suffix = VARIANT_SUFFIXES[Math.floor(rand() * VARIANT_SUFFIXES.length)];
  const core = base.split(' ').slice(0, 3).join(' ');
  return `${prefix} ${core} ${suffix}`;
}

// ═══════════════════════════════════════════════════════════════
// §6 — VAULT & MEMORY STREAM POOL
// ═══════════════════════════════════════════════════════════════

const LLM_VAULT = new Map<string, LlmDiscovery>();
const LLM_MEMORY_STREAM_POOL: LlmDiscovery[] = [];

export function getLlmVault(): LlmDiscovery[] { return Array.from(LLM_VAULT.values()); }
export function getLlmVaultCount(): number { return LLM_VAULT.size; }
export function getLlmMemoryStreamPool(): LlmDiscovery[] { return [...LLM_MEMORY_STREAM_POOL]; }
export function getLlmMemoryStreamCount(): number { return LLM_MEMORY_STREAM_POOL.length; }

// ═══════════════════════════════════════════════════════════════
// §7 — MAIN SEED ENGINE (GENESIS)
// ═══════════════════════════════════════════════════════════════

const TOTAL_DISCOVERIES = 200;
const ARCHITECTURE_GATE_THRESHOLD = 95;
let _seedResult: LlmSeedResult | null = null;

export function seedLlmDiscoveries(): LlmSeedResult {
  if (_seedResult) return _seedResult;

  const runId = 'lm-seed-' + Date.now().toString(36);
  const rand = seedRng(0xA1E0_CAFE);
  const discoveries: LlmDiscovery[] = [];
  let vaultCount = 0, showroomCount = 0, junkyardCount = 0, memoryStreamCount = 0;
  let templateIdx = 0;

  for (let i = 0; i < TOTAL_DISCOVERIES; i++) {
    const template = DISCOVERY_TEMPLATES[templateIdx % DISCOVERY_TEMPLATES.length];
    const variantIndex = Math.floor(templateIdx / DISCOVERY_TEMPLATES.length);
    templateIdx++;

    const chain = buildChain(template, rand);
    const cjpiScore = scoreCjpi(chain.length, template.cjpiBias, rand);
    const tier = classifyTier(cjpiScore);
    const route = cjpiScore >= ARCHITECTURE_GATE_THRESHOLD ? 'vault' : routeDiscovery(cjpiScore);

    const discovery: LlmDiscovery = {
      id: `LDSC-${String(i + 1).padStart(3, '0')}`,
      name: generateVariantName(template.namePattern, variantIndex, rand),
      description: template.descriptionPattern,
      cjpiScore, primitiveChain: chain, tier, route,
      category: template.category,
      discoveredAt: new Date().toISOString(),
    };

    discoveries.push(discovery);
    if (route === 'vault') { LLM_VAULT.set(discovery.id, discovery); vaultCount++; }
    else {
      addDiscovery(discovery.id, discovery.name, discovery.description, discovery.cjpiScore, discovery.primitiveChain);
      if (route === 'showroom') showroomCount++; else junkyardCount++;
      LLM_MEMORY_STREAM_POOL.push(discovery); memoryStreamCount++;
    }
  }

  _seedResult = { runId, totalDiscoveries: TOTAL_DISCOVERIES, vaultCount, showroomCount, junkyardCount, memoryStreamCount, discoveries, completedAt: new Date().toISOString() };

  const seedRunId = `lm-seed-${Date.now().toString(36)}`;
  ensureSeedRun(seedRunId, 'llm', TOTAL_DISCOVERIES).then(() => {
    const rows = discoveries.map(d => ({ id: d.id, name: d.name, description: d.description, cjpiScore: d.cjpiScore, primitiveChain: d.primitiveChain, tier: d.tier, route: d.route, category: d.category, vertical: 'llm', runId: seedRunId }));
    persistSeedDiscoveries(rows, 'llm', seedRunId);
  });

  return _seedResult;
}

export function getLlmSeedResult(): LlmSeedResult | null { return _seedResult; }
export function getLlmSeedSummary() {
  if (!_seedResult) return { total: 0, vault: 0, showroom: 0, junkyard: 0, memoryStream: 0 };
  return { total: _seedResult.totalDiscoveries, vault: _seedResult.vaultCount, showroom: _seedResult.showroomCount, junkyard: _seedResult.junkyardCount, memoryStream: _seedResult.memoryStreamCount };
}
export function resetLlmSeed(): void { _seedResult = null; LLM_VAULT.clear(); LLM_MEMORY_STREAM_POOL.length = 0; }
