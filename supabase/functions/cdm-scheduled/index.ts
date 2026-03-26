/**
 * CDM Scheduled — Constant Discovery Mode
 * Server-side scheduled edge function that runs the discovery reactor
 * autonomously every 8 hours via pg_cron.
 *
 * Discovers new software pipelines, scores them (CJPI), promotes S-Tier
 * to vault, and feeds Memory Stream — all without a browser tab.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── System identity for autonomous runs ───────────────────────────
const CDM_SYSTEM_ID = '00000000-0000-0000-0000-000000000001';
const CDM_SCORING_VERSION = '2.0-cdm';

// ─── CJPI Weights (canonical) ──────────────────────────────────────
const CJPI_WEIGHTS: Record<string, number> = {
  strategicLeverage: 0.30,
  recursionPotential: 0.20,
  crossNodeImpact: 0.15,
  composability: 0.15,
  governanceInfluence: 0.10,
  moatSensitivity: 0.10,
};

interface CJPIBreakdown {
  strategicLeverage: number;
  recursionPotential: number;
  crossNodeImpact: number;
  composability: number;
  governanceInfluence: number;
  moatSensitivity: number;
}

function computeCJPI(b: CJPIBreakdown): number {
  let score = 0;
  for (const [key, weight] of Object.entries(CJPI_WEIGHTS)) {
    score += ((b as any)[key] ?? 0) * weight;
  }
  return Math.round(Math.min(100, Math.max(0, score)) * 10) / 10;
}

function autoAssignTier(cjpi: number): string | null {
  if (cjpi >= 95) return 'cmpsbl-only';
  if (cjpi >= 85) return 'enterprise';
  if (cjpi >= 70) return 'architect';
  if (cjpi >= 55) return 'creator';
  return null;
}

function computeStableHash(name: string, moduleChain: string[], category: string): string {
  const payload = `${name}|${[...moduleChain].sort().join(',')}|${category}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = ((hash << 5) - hash) + payload.charCodeAt(i);
    hash |= 0;
  }
  return `disc-${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

function computeSynergyMultiplier(moduleChain: string[]): number {
  const unique = new Set(moduleChain);
  if (unique.size >= 4) return 1.15;
  if (unique.size >= 3) return 1.08;
  return 1.0;
}

// ─── Synthesis Templates ───────────────────────────────────────────
// Same canonical templates as client-side reactor
interface SynthesisTemplate {
  namePattern: string;
  descriptionPattern: string;
  category: string;
  modulePattern: string[];
  entryPattern: string;
  exitPattern: string;
  errorStrategy: string;
  maxExecutionMs: number;
  baseBreakdown: CJPIBreakdown;
  discoveredBy: string;
  rationale: string;
}

const SYNTHESIS_TEMPLATES: SynthesisTemplate[] = [
  // COGNITIVE
  { namePattern: 'Adaptive Working Memory Controller', descriptionPattern: 'Dynamic working memory allocation based on task complexity and cognitive load estimation', category: 'cognitive', modulePattern: ['BRAIN', 'CORTEX', 'MEMORY'], entryPattern: 'working-memory-allocator', exitPattern: 'memory-controlled', errorStrategy: 'fallback', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 88, crossNodeImpact: 85, composability: 88, governanceInfluence: 62, moatSensitivity: 90 }, discoveredBy: 'cdm', rationale: 'Working memory is the bottleneck for complex reasoning' },
  { namePattern: 'Concept Drift Corrector', descriptionPattern: 'Detects and corrects semantic concept drift in long-running cognitive sessions', category: 'cognitive', modulePattern: ['BRAIN', 'VISION', 'CORTEX'], entryPattern: 'drift-monitor', exitPattern: 'drift-corrected', errorStrategy: 'retry', maxExecutionMs: 3000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 82, crossNodeImpact: 80, composability: 82, governanceInfluence: 65, moatSensitivity: 88 }, discoveredBy: 'cdm', rationale: 'Concept drift degrades output quality over time' },
  { namePattern: 'Causal Reasoning Engine', descriptionPattern: 'Structured causal inference from observational data with counterfactual generation', category: 'cognitive', modulePattern: ['CORTEX', 'BRAIN', 'DREAM', 'VISION'], entryPattern: 'causal-graph-builder', exitPattern: 'causal-inference-complete', errorStrategy: 'skip', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 92, crossNodeImpact: 88, composability: 82, governanceInfluence: 72, moatSensitivity: 96 }, discoveredBy: 'cdm', rationale: 'Causal reasoning moves beyond correlation to true understanding' },
  { namePattern: 'Epistemic State Tracker', descriptionPattern: 'Tracks what the system knows, believes, and is uncertain about across all primitives', category: 'cognitive', modulePattern: ['BRAIN', 'CORTEX', 'GOVERNANCE'], entryPattern: 'epistemic-scanner', exitPattern: 'epistemic-map-updated', errorStrategy: 'skip', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 90, crossNodeImpact: 85, composability: 80, governanceInfluence: 78, moatSensitivity: 92 }, discoveredBy: 'cdm', rationale: 'Self-aware knowledge tracking prevents hallucination' },
  { namePattern: 'Analogical Transfer Engine', descriptionPattern: 'Cross-domain analogy discovery and structural mapping for novel problem solving', category: 'cognitive', modulePattern: ['DREAM', 'BRAIN', 'CORTEX'], entryPattern: 'analogy-finder', exitPattern: 'analogy-applied', errorStrategy: 'skip', maxExecutionMs: 10000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 95, crossNodeImpact: 82, composability: 85, governanceInfluence: 58, moatSensitivity: 92 }, discoveredBy: 'cdm', rationale: 'Analogical reasoning is uniquely powerful for creative problem-solving' },
  // EVOLUTION
  { namePattern: 'Fitness Landscape Navigator', descriptionPattern: 'Maps and navigates the fitness landscape of system configurations for optimal evolution paths', category: 'evolution', modulePattern: ['EVOLUTION', 'VISION', 'BRAIN', 'CORTEX'], entryPattern: 'landscape-mapper', exitPattern: 'optimal-path-found', errorStrategy: 'rollback', maxExecutionMs: 20000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 92, crossNodeImpact: 90, composability: 78, governanceInfluence: 80, moatSensitivity: 96 }, discoveredBy: 'cdm', rationale: 'Navigating fitness landscapes prevents local optima traps' },
  { namePattern: 'Mutation Impact Simulator', descriptionPattern: 'Monte Carlo simulation of mutation outcomes across system state space', category: 'evolution', modulePattern: ['EVOLUTION', 'CORTEX', 'VISION'], entryPattern: 'mutation-simulator', exitPattern: 'impact-distribution', errorStrategy: 'skip', maxExecutionMs: 30000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 85, crossNodeImpact: 90, composability: 75, governanceInfluence: 85, moatSensitivity: 92 }, discoveredBy: 'cdm', rationale: 'Simulation before execution dramatically reduces risk' },
  { namePattern: 'Evolutionary Pressure Calibrator', descriptionPattern: 'Dynamically adjusts selection pressure based on population diversity and convergence rate', category: 'evolution', modulePattern: ['EVOLUTION', 'ANALYTICS', 'BRAIN'], entryPattern: 'pressure-analyzer', exitPattern: 'pressure-calibrated', errorStrategy: 'skip', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 90, crossNodeImpact: 82, composability: 80, governanceInfluence: 72, moatSensitivity: 88 }, discoveredBy: 'cdm', rationale: 'Balancing exploration vs exploitation is critical' },
  { namePattern: 'Co-Evolutionary Synchronizer', descriptionPattern: 'Coordinates co-evolutionary dynamics between interdependent module populations', category: 'evolution', modulePattern: ['EVOLUTION', 'CORTEX', 'SYSTEM', 'GOVERNANCE'], entryPattern: 'co-evolution-tracker', exitPattern: 'co-evolution-synced', errorStrategy: 'rollback', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 88, crossNodeImpact: 95, composability: 72, governanceInfluence: 85, moatSensitivity: 92 }, discoveredBy: 'cdm', rationale: 'Co-evolution between modules creates emergent capabilities' },
  { namePattern: 'Genetic Memory Archiver', descriptionPattern: 'Archives successful evolutionary strategies as reusable genetic templates', category: 'evolution', modulePattern: ['EVOLUTION', 'BRAIN', 'DREAM'], entryPattern: 'strategy-extractor', exitPattern: 'genetic-template-stored', errorStrategy: 'retry', maxExecutionMs: 8000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 92, crossNodeImpact: 80, composability: 85, governanceInfluence: 68, moatSensitivity: 90 }, discoveredBy: 'cdm', rationale: 'Preserving winning strategies prevents re-discovery costs' },
  // SECURITY
  { namePattern: 'Cognitive Firewall', descriptionPattern: 'Deep inspection of cognitive operations for adversarial manipulation attempts', category: 'security', modulePattern: ['DEFENSE', 'BRAIN', 'CORTEX', 'GOVERNANCE'], entryPattern: 'cognitive-inspector', exitPattern: 'manipulation-blocked', errorStrategy: 'abort', maxExecutionMs: 1000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 75, crossNodeImpact: 92, composability: 68, governanceInfluence: 95, moatSensitivity: 98 }, discoveredBy: 'cdm', rationale: 'Cognitive-layer attacks bypass traditional security' },
  { namePattern: 'Supply Chain Integrity Verifier', descriptionPattern: 'Cryptographic verification of module provenance and dependency integrity', category: 'security', modulePattern: ['DEFENSE', 'SYSTEM', 'GOVERNANCE', 'AUDIT'], entryPattern: 'provenance-checker', exitPattern: 'integrity-verified', errorStrategy: 'abort', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 62, crossNodeImpact: 90, composability: 68, governanceInfluence: 95, moatSensitivity: 92 }, discoveredBy: 'cdm', rationale: 'Software supply chain attacks are the fastest growing threat vector' },
  { namePattern: 'Deception Detection Network', descriptionPattern: 'Multi-signal deception detection across input channels with confidence scoring', category: 'security', modulePattern: ['DEFENSE', 'BRAIN', 'VISION'], entryPattern: 'deception-analyzer', exitPattern: 'deception-classified', errorStrategy: 'abort', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 78, crossNodeImpact: 85, composability: 72, governanceInfluence: 88, moatSensitivity: 92 }, discoveredBy: 'cdm', rationale: 'Adversarial inputs are increasingly sophisticated' },
  // LEARNING
  { namePattern: 'Meta-Learning Optimizer', descriptionPattern: 'Learns optimal learning strategies from learning history — learning to learn faster', category: 'learning', modulePattern: ['BRAIN', 'DREAM', 'CORTEX', 'EVOLUTION'], entryPattern: 'meta-learner', exitPattern: 'learning-strategy-optimized', errorStrategy: 'skip', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 98, crossNodeImpact: 85, composability: 82, governanceInfluence: 65, moatSensitivity: 96 }, discoveredBy: 'cdm', rationale: 'Meta-learning is the ultimate force multiplier' },
  { namePattern: 'Knowledge Crystallization Engine', descriptionPattern: 'Converts fluid experiential knowledge into stable, reusable crystallized knowledge structures', category: 'learning', modulePattern: ['BRAIN', 'DREAM', 'MEMORY'], entryPattern: 'experience-distiller', exitPattern: 'knowledge-crystallized', errorStrategy: 'retry', maxExecutionMs: 10000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 92, crossNodeImpact: 82, composability: 85, governanceInfluence: 62, moatSensitivity: 92 }, discoveredBy: 'cdm', rationale: 'Crystallized knowledge persists across sessions' },
  // PREDICTION
  { namePattern: 'Oracle-Ripple Precognition Chain', descriptionPattern: 'Fuses ORACLE probabilistic forecasting with RIPPLE causal propagation to predict downstream effects', category: 'prediction', modulePattern: ['ORACLE', 'RIPPLE', 'CORTEX', 'NERVE'], entryPattern: 'precognition-scanner', exitPattern: 'preemptive-action-dispatched', errorStrategy: 'rollback', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 96, recursionPotential: 90, crossNodeImpact: 95, composability: 78, governanceInfluence: 72, moatSensitivity: 96 }, discoveredBy: 'cdm', rationale: 'Combining prediction with causal propagation creates genuine precognition' },
  { namePattern: 'Multi-Horizon Forecast Synthesizer', descriptionPattern: 'Synthesizes predictions across time horizons from milliseconds to months', category: 'prediction', modulePattern: ['ORACLE', 'ANALYTICS', 'BRAIN', 'MEMORY'], entryPattern: 'horizon-scanner', exitPattern: 'multi-horizon-forecast', errorStrategy: 'skip', maxExecutionMs: 20000, baseBreakdown: { strategicLeverage: 94, recursionPotential: 90, crossNodeImpact: 88, composability: 82, governanceInfluence: 70, moatSensitivity: 94 }, discoveredBy: 'cdm', rationale: 'Multi-horizon synthesis resolves short-term vs long-term strategy' },
  // SYNTHESIS
  { namePattern: 'Forge-Evolution Capability Genesis', descriptionPattern: 'Closed-loop capability creation where FORGE synthesizes and EVOLUTION pressure-tests', category: 'synthesis', modulePattern: ['FORGE', 'EVOLUTION', 'CORTEX', 'GOVERNANCE'], entryPattern: 'genesis-trigger', exitPattern: 'capability-born', errorStrategy: 'rollback', maxExecutionMs: 30000, baseBreakdown: { strategicLeverage: 96, recursionPotential: 98, crossNodeImpact: 90, composability: 82, governanceInfluence: 78, moatSensitivity: 98 }, discoveredBy: 'cdm', rationale: 'A system that breeds its own capabilities is the ultimate moat' },
  { namePattern: 'Blueprint Evolution Compiler', descriptionPattern: 'Compiles learned architectural blueprints from successful capability patterns into reusable templates', category: 'synthesis', modulePattern: ['FORGE', 'EVOLUTION', 'BRAIN', 'MEMORY'], entryPattern: 'blueprint-extractor', exitPattern: 'blueprint-compiled', errorStrategy: 'rollback', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 93, recursionPotential: 92, crossNodeImpact: 85, composability: 90, governanceInfluence: 68, moatSensitivity: 95 }, discoveredBy: 'cdm', rationale: 'Blueprint compilation enables exponential capability creation' },
  // ETHICS
  { namePattern: 'Conscience-Phantom Ethical Stealth Arbiter', descriptionPattern: 'Resolves tension between ethical transparency and operational privacy', category: 'ethics', modulePattern: ['CONSCIENCE', 'PHANTOM', 'GOVERNANCE', 'AUDIT'], entryPattern: 'ethics-privacy-resolver', exitPattern: 'disclosure-calibrated', errorStrategy: 'abort', maxExecutionMs: 3000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 80, crossNodeImpact: 90, composability: 72, governanceInfluence: 98, moatSensitivity: 95 }, discoveredBy: 'cdm', rationale: 'The ethics-privacy tension is unsolved in the industry' },
  { namePattern: 'Multi-Framework Moral Reasoner', descriptionPattern: 'Evaluates decisions through utilitarian, deontological, virtue ethics, and care ethics simultaneously', category: 'ethics', modulePattern: ['CONSCIENCE', 'BRAIN', 'CORTEX', 'GOVERNANCE'], entryPattern: 'moral-graph-builder', exitPattern: 'moral-evaluation-complete', errorStrategy: 'abort', maxExecutionMs: 8000, baseBreakdown: { strategicLeverage: 93, recursionPotential: 85, crossNodeImpact: 90, composability: 72, governanceInfluence: 98, moatSensitivity: 95 }, discoveredBy: 'cdm', rationale: 'No single ethical framework is sufficient' },
  // ORCHESTRATION
  { namePattern: 'Elastic Pipeline Scaler', descriptionPattern: 'Auto-scales pipeline parallelism based on workload prediction and resource availability', category: 'orchestration', modulePattern: ['CORTEX', 'SYSTEM', 'ANALYTICS', 'NEXUS'], entryPattern: 'workload-predictor', exitPattern: 'pipeline-scaled', errorStrategy: 'fallback', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 78, crossNodeImpact: 90, composability: 85, governanceInfluence: 68, moatSensitivity: 85 }, discoveredBy: 'cdm', rationale: 'Elastic scaling prevents over- and under-provisioning' },
  { namePattern: 'Mesh-Relay Resilient Communication Backbone', descriptionPattern: 'Indestructible communication backbone with 99.999% delivery', category: 'orchestration', modulePattern: ['MESH', 'RELAY', 'NERVE', 'SYSTEM'], entryPattern: 'backbone-monitor', exitPattern: 'delivery-guaranteed', errorStrategy: 'retry', maxExecutionMs: 1000, baseBreakdown: { strategicLeverage: 93, recursionPotential: 78, crossNodeImpact: 95, composability: 82, governanceInfluence: 72, moatSensitivity: 90 }, discoveredBy: 'cdm', rationale: 'Message delivery is the nervous system of the substrate' },
  // OBSERVABILITY
  { namePattern: 'Emergent Behavior Detector', descriptionPattern: 'Detects unexpected emergent behaviors from multi-module interactions', category: 'observability', modulePattern: ['VISION', 'ANALYTICS', 'CORTEX'], entryPattern: 'emergence-scanner', exitPattern: 'emergence-classified', errorStrategy: 'skip', maxExecutionMs: 8000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 85, crossNodeImpact: 90, composability: 75, governanceInfluence: 78, moatSensitivity: 92 }, discoveredBy: 'cdm', rationale: 'Emergent behaviors can be both opportunities and risks' },
  { namePattern: 'Cognitive Flame Graph Generator', descriptionPattern: 'Generates flame graphs of cognitive execution paths', category: 'observability', modulePattern: ['OBSERVABILITY', 'CORTEX', 'BRAIN', 'ANALYTICS'], entryPattern: 'execution-profiler', exitPattern: 'flame-graph-generated', errorStrategy: 'skip', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 82, crossNodeImpact: 88, composability: 85, governanceInfluence: 70, moatSensitivity: 92 }, discoveredBy: 'cdm', rationale: 'Flame graphs for cognitive pipelines are unprecedented' },
  // COMPLIANCE
  { namePattern: 'Data Sovereignty Partitioner', descriptionPattern: 'Automated data partitioning enforcing sovereignty requirements', category: 'compliance', modulePattern: ['SOVEREIGN', 'COMPASS', 'SYSTEM', 'DEFENSE'], entryPattern: 'sovereignty-scanner', exitPattern: 'data-partitioned', errorStrategy: 'abort', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 94, recursionPotential: 75, crossNodeImpact: 92, composability: 78, governanceInfluence: 98, moatSensitivity: 94 }, discoveredBy: 'cdm', rationale: 'Data sovereignty is legally mandated in 50+ jurisdictions' },
  { namePattern: 'Regulatory Genome Mapper', descriptionPattern: 'Decomposes regulatory frameworks into atomic constraint primitives', category: 'compliance', modulePattern: ['SOVEREIGN', 'BRAIN', 'ANALYTICS', 'GOVERNANCE'], entryPattern: 'regulation-decomposer', exitPattern: 'genome-mapped', errorStrategy: 'skip', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 88, crossNodeImpact: 88, composability: 85, governanceInfluence: 95, moatSensitivity: 92 }, discoveredBy: 'cdm', rationale: 'Regulatory atomization enables compositional compliance' },
  // PRIVACY
  { namePattern: 'Selective Memory Erasure Controller', descriptionPattern: 'Surgical data removal across all memory layers while preserving system coherence', category: 'privacy', modulePattern: ['PHANTOM', 'MEMORY', 'BRAIN', 'DREAM'], entryPattern: 'erasure-planner', exitPattern: 'memory-erased', errorStrategy: 'abort', maxExecutionMs: 10000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 78, crossNodeImpact: 92, composability: 70, governanceInfluence: 90, moatSensitivity: 95 }, discoveredBy: 'cdm', rationale: 'Right-to-be-forgotten requires surgical precision' },
  // INTEGRATION
  { namePattern: 'Event-Driven Integration Mesh', descriptionPattern: 'Normalized event streams with schema evolution and exactly-once delivery', category: 'integration', modulePattern: ['INTEGRATION', 'RELAY', 'DECODE', 'SYSTEM'], entryPattern: 'event-normalizer', exitPattern: 'event-integrated', errorStrategy: 'retry', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 78, crossNodeImpact: 90, composability: 88, governanceInfluence: 68, moatSensitivity: 88 }, discoveredBy: 'cdm', rationale: 'Event-driven integration decouples external from internal' },
  // CROSS-MODULE SYNERGIES
  { namePattern: 'Immunity-Evolution Adaptive Defense Breeder', descriptionPattern: 'Breeds stronger immune responses by applying evolutionary pressure to defense strategies', category: 'evolution', modulePattern: ['IMMUNITY', 'EVOLUTION', 'DEFENSE', 'BRAIN'], entryPattern: 'defense-breeding-trigger', exitPattern: 'stronger-defense-promoted', errorStrategy: 'rollback', maxExecutionMs: 20000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 92, crossNodeImpact: 92, composability: 78, governanceInfluence: 78, moatSensitivity: 96 }, discoveredBy: 'cdm', rationale: 'Evolutionary pressure creates ever-hardening immunity' },
  { namePattern: 'Intent-Decode Conversational Intent Compiler', descriptionPattern: 'Compiles natural language into executable intent graphs', category: 'cognitive', modulePattern: ['INTENT', 'DECODE', 'BRAIN', 'CORTEX'], entryPattern: 'conversation-parser', exitPattern: 'intent-graph-compiled', errorStrategy: 'fallback', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 94, recursionPotential: 88, crossNodeImpact: 90, composability: 85, governanceInfluence: 65, moatSensitivity: 92 }, discoveredBy: 'cdm', rationale: 'The gap between user language and system action is the primary UX bottleneck' },
  { namePattern: 'Access-Identity Zero-Trust Continuous Verifier', descriptionPattern: 'Continuous zero-trust verification with behavioral biometrics', category: 'security', modulePattern: ['ACCESS', 'IDENTITY', 'DEFENSE', 'GOVERNANCE'], entryPattern: 'continuous-verifier', exitPattern: 'trust-revalidated', errorStrategy: 'abort', maxExecutionMs: 500, baseBreakdown: { strategicLeverage: 93, recursionPotential: 78, crossNodeImpact: 90, composability: 78, governanceInfluence: 95, moatSensitivity: 92 }, discoveredBy: 'cdm', rationale: 'Static authentication is a single point of failure' },
  { namePattern: 'Multi-Stage Semantic Encoding Pipeline', descriptionPattern: 'Transforms raw inputs through tokenization, embedding, contextualization into dense representations', category: 'cognitive', modulePattern: ['ENCODE', 'BRAIN', 'CORTEX', 'MEMORY'], entryPattern: 'raw-input-receiver', exitPattern: 'encoding-complete', errorStrategy: 'fallback', maxExecutionMs: 3000, baseBreakdown: { strategicLeverage: 94, recursionPotential: 85, crossNodeImpact: 88, composability: 90, governanceInfluence: 62, moatSensitivity: 92 }, discoveredBy: 'cdm', rationale: 'Encoding quality determines the ceiling of all downstream cognitive operations' },
  { namePattern: 'Federated Identity Resolver', descriptionPattern: 'Cross-domain identity resolution with progressive trust establishment', category: 'security', modulePattern: ['IDENTITY', 'ACCESS', 'BRAIN', 'GOVERNANCE'], entryPattern: 'identity-linker', exitPattern: 'identity-resolved', errorStrategy: 'abort', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 93, recursionPotential: 78, crossNodeImpact: 90, composability: 82, governanceInfluence: 88, moatSensitivity: 90 }, discoveredBy: 'cdm', rationale: 'Federated identity is the foundation of multi-system trust' },
  { namePattern: 'Technical Debt Quantifier', descriptionPattern: 'Multi-dimensional technical debt analysis with ROI estimates per fix', category: 'observability', modulePattern: ['EVOLUTION', 'VISION', 'ANALYTICS', 'ECONOMY'], entryPattern: 'debt-scanner', exitPattern: 'debt-quantified', errorStrategy: 'skip', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 93, recursionPotential: 82, crossNodeImpact: 88, composability: 80, governanceInfluence: 78, moatSensitivity: 90 }, discoveredBy: 'cdm', rationale: 'Unquantified technical debt is invisible' },
];

// ─── Lock Management ───────────────────────────────────────────────
async function acquireLock(supabase: ReturnType<typeof createClient>): Promise<boolean> {
  const nowIso = new Date().toISOString();
  const expiryIso = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { data: current } = await supabase
    .from('discovery_lock')
    .select('id, locked_by, expires_at')
    .eq('id', 'global')
    .maybeSingle();

  if (!current) {
    const { error: initErr } = await supabase.from('discovery_lock').insert({ id: 'global', locked_by: null, locked_at: null, expires_at: null });
    if (initErr) {
      console.log('[CDM] Lock init failed:', initErr.message);
      return false;
    }
  }

  // Check if lock is held by someone else and not expired
  const lockedBy = current?.locked_by;
  const expiresAt = current?.expires_at;
  const isLocked = !!lockedBy
    && lockedBy.trim() !== ''
    && lockedBy !== CDM_SYSTEM_ID
    && !!expiresAt
    && new Date(expiresAt) > new Date();

  if (isLocked) {
    console.log(`[CDM] Lock held by ${lockedBy}, expires ${expiresAt}`);
    return false;
  }

  const { error, count } = await supabase
    .from('discovery_lock')
    .update({ locked_by: CDM_SYSTEM_ID, locked_at: nowIso, expires_at: expiryIso })
    .eq('id', 'global');

  if (error) {
    console.log(`[CDM] Lock update error: ${error.message} (code: ${error.code})`);
    return false;
  }
  console.log(`[CDM] Lock acquired successfully`);
  return true;
}

async function releaseLock(supabase: ReturnType<typeof createClient>): Promise<void> {
  await supabase
    .from('discovery_lock')
    .update({ locked_by: null, locked_at: null, expires_at: null })
    .eq('id', 'global');
}

// ─── Main Reactor ──────────────────────────────────────────────────
async function runCDMCycle(supabase: ReturnType<typeof createClient>) {
  const startTime = Date.now();

  const locked = await acquireLock(supabase);
  if (!locked) {
    return { ok: false, reason: 'lock_held', durationMs: Date.now() - startTime };
  }

  try {
    // Fetch already-promoted and already-discovered IDs
    const [{ data: existingPromotions }, { data: existingDiscoveries }] = await Promise.all([
      supabase.from('vault_promotions').select('discovery_id'),
      supabase.from('discoveries').select('id'),
    ]);

    const promotedIds = new Set((existingPromotions ?? []).map((p: any) => p.discovery_id));
    const knownIds = new Set((existingDiscoveries ?? []).map((d: any) => d.id));

    // Generate candidates
    const candidates: any[] = [];
    let skippedCount = 0;

    for (const template of SYNTHESIS_TEMPLATES) {
      const stableId = computeStableHash(template.namePattern, template.modulePattern, template.category);

      if (promotedIds.has(stableId) || knownIds.has(stableId)) {
        skippedCount++;
        continue;
      }

      const baseCjpi = computeCJPI(template.baseBreakdown);
      const synergyMultiplier = computeSynergyMultiplier(template.modulePattern);
      const finalCjpi = Math.round(Math.min(100, baseCjpi * synergyMultiplier) * 10) / 10;
      const tier = autoAssignTier(finalCjpi);

      if (finalCjpi < 80) continue;

      candidates.push({
        id: stableId,
        name: template.namePattern,
        description: template.descriptionPattern,
        category: template.category,
        moduleChain: template.modulePattern,
        entryCapability: template.entryPattern,
        exitCapability: template.exitPattern,
        errorStrategy: template.errorStrategy,
        maxExecutionMs: template.maxExecutionMs,
        cjpiBreakdown: template.baseBreakdown,
        cjpi: finalCjpi,
        tier,
        synergyMultiplier,
        discoveredBy: 'cdm-scheduled',
        rationale: template.rationale,
      });
    }

    candidates.sort((a: any, b: any) => b.cjpi - a.cjpi);

    const topFind = candidates.length > 0 ? { name: candidates[0].name, cjpi: candidates[0].cjpi } : null;

    // Persist run
    const { data: run, error: runError } = await supabase
      .from('discovery_runs')
      .insert({
        status: 'completed',
        total_candidates: candidates.length + skippedCount,
        accepted_count: candidates.length,
        top_find_name: topFind?.name ?? null,
        top_find_cjpi: topFind?.cjpi ?? null,
        scoring_version: CDM_SCORING_VERSION,
        dry_run: false,
        exploratory_mode: false,
        finished_at: new Date().toISOString(),
        created_by: CDM_SYSTEM_ID,
        logs: [{ event: 'cdm_scheduled_cycle', candidates: candidates.length, skipped: skippedCount, timestamp: new Date().toISOString() }],
      })
      .select()
      .single();

    if (runError || !run) throw new Error(`Failed to create run: ${runError?.message}`);

    // Persist discoveries
    if (candidates.length > 0) {
      const rows = candidates.map((c: any) => ({
        id: c.id,
        run_id: run.id,
        name: c.name,
        description: c.description,
        category: c.category,
        tier: c.tier,
        cjpi: c.cjpi,
        synergy_multiplier: c.synergyMultiplier,
        components: JSON.parse(JSON.stringify({ entry: c.entryCapability, exit: c.exitCapability })),
        module_chain: c.moduleChain,
        rationale: c.rationale,
        provenance: `CDM Scheduled v${CDM_SCORING_VERSION}`,
        error_strategy: c.errorStrategy,
        max_execution_ms: c.maxExecutionMs,
        cjpi_breakdown: JSON.parse(JSON.stringify(c.cjpiBreakdown)),
        discovered_by: c.discoveredBy,
        written_to_registry: true,
      }));

      await supabase.from('discoveries').upsert(rows, { onConflict: 'id' });

      // S-Tier promotion (CJPI >= 95)
      const promotable = candidates.filter((c: any) => c.cjpi >= 95 && c.tier);
      if (promotable.length > 0) {
        const promotionRows = promotable.map((c: any) => ({
          discovery_id: c.id,
          run_id: run.id,
          name: c.name,
          cjpi: c.cjpi,
          tier: c.tier,
          module_chain: c.moduleChain,
          description: c.description,
          category: c.category,
          promoted_at: new Date().toISOString(),
          export_ready: true,
          status: 'promoted',
        }));
        await supabase.from('vault_promotions').upsert(promotionRows, { onConflict: 'discovery_id' });
      }

      // Feed Memory Stream (pipeline_vault)
      const memoryRows = candidates.map((c: any) => ({
        user_id: CDM_SYSTEM_ID,
        pipeline_name: c.name,
        pipeline_score: c.cjpi,
        pipeline_tier: c.tier ?? 'untiered',
        pipeline_category: c.category,
        system_chain: c.moduleChain,
        pipeline_fingerprint: c.id,
        valuation_display: null,
        mine_result_id: run.id,
      }));
      await supabase.from('pipeline_vault').upsert(memoryRows, { onConflict: 'pipeline_fingerprint', ignoreDuplicates: true });
    }

    return {
      ok: true,
      runId: run.id,
      newDiscoveries: candidates.length,
      skipped: skippedCount,
      topFind,
      sTierPromoted: candidates.filter((c: any) => c.cjpi >= 95).length,
      durationMs: Date.now() - startTime,
    };
  } finally {
    await releaseLock(supabase);
  }
}

// ─── Edge Function Handler ─────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    console.log(`[CDM] Scheduled discovery cycle starting...`);
    const result = await runCDMCycle(supabase);
    console.log(`[CDM] Cycle complete:`, JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error(`[CDM] Fatal error:`, err.message);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
