/**
 * CLM Topic Pipeline
 * 
 * Transforms CLM from "a learner" into a structured topic pipeline:
 *   - Global Topics (system-wide, 70% weight)
 *   - Node Solo Topics (per-node, scoped)
 *   - Dynamic Solo Topics (node-proposed, guardrailed, 30% weight)
 * 
 * Includes mastery tracking, dedup via output fingerprints, and novelty scoring.
 */

import type { CLMTopic, TopicScope, TopicMasteryHighlight, DynamicTopicProposal } from '../types';
import { intelAggregator } from '../intel/aggregator';

// ═══════════════════════════════════════════════════════════════════════════════
// TOPIC STORES
// ═══════════════════════════════════════════════════════════════════════════════

const topics: CLMTopic[] = [];
const dynamicProposals: DynamicTopicProposal[] = [];

function topicId(scope: TopicScope, title: string, node?: string): string {
  return `${scope}:${node ?? 'global'}:${title}`.toLowerCase().replace(/\s+/g, '-');
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL TOPICS (system-wide, curated)
// ═══════════════════════════════════════════════════════════════════════════════

const GLOBAL_TOPICS: Array<{ title: string; description: string; category: string; tier: number }> = [
  // Tier 1: Foundation — Harden what exists
  { title: 'Stability Patterns', description: 'Circuit breakers, graceful degradation, retry strategies', category: 'stability', tier: 1 },
  { title: 'Performance Optimization', description: 'Caching strategies, lazy loading, resource pooling', category: 'performance', tier: 1 },
  { title: 'Reliability Engineering', description: 'Redundancy, failover, data consistency guarantees', category: 'reliability', tier: 1 },
  { title: 'Security Hardening', description: 'Zero-trust, defense-in-depth, threat modeling', category: 'security', tier: 1 },

  // Tier 2: Intelligence — Make the system smarter
  { title: 'Resilience Architecture', description: 'Self-healing, bulkhead patterns, chaos engineering', category: 'resilience', tier: 2 },
  { title: 'Governance Patterns', description: 'Policy enforcement, audit trails, compliance automation', category: 'governance', tier: 2 },
  { title: 'Observability Excellence', description: 'Distributed tracing, metric correlation, alert tuning', category: 'observability', tier: 2 },
  { title: 'Cost Efficiency', description: 'Resource optimization, waste reduction, budget governance', category: 'cost', tier: 2 },

  // Tier 3: Capability — Add new features and integrations
  { title: 'Adaptive Learning', description: 'System learns from usage patterns to auto-tune configurations and thresholds', category: 'intelligence', tier: 3 },
  { title: 'Predictive Analytics', description: 'Forecast failures, traffic spikes, and resource needs before they happen', category: 'intelligence', tier: 3 },
  { title: 'Cross-Module Orchestration', description: 'Modules coordinate autonomously to handle multi-step workflows', category: 'capability', tier: 3 },
  { title: 'External Integration Patterns', description: 'Safely connect third-party APIs, webhooks, and data sources', category: 'capability', tier: 3 },

  // Tier 4: Autonomy — System operates independently
  { title: 'Self-Optimization Loops', description: 'Continuous performance tuning without human intervention', category: 'autonomy', tier: 4 },
  { title: 'Autonomous Incident Response', description: 'Detect, diagnose, and resolve issues without human involvement', category: 'autonomy', tier: 4 },
  { title: 'Evolutionary Architecture', description: 'System proposes and safely applies its own structural improvements', category: 'autonomy', tier: 4 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// NODE SOLO TOPICS (per-node, scoped to responsibilities)
// ═══════════════════════════════════════════════════════════════════════════════

const NODE_SOLO_TOPICS: Record<string, Array<{ title: string; description: string; category: string }>> = {
  BRAIN: [
    { title: 'Memory Tiering Optimization', description: 'Hot/warm/cold memory management best practices', category: 'performance' },
    { title: 'Knowledge Graph Patterns', description: 'Entity extraction, relationship mapping, semantic search', category: 'learning' },
  ],
  DEFENSE: [
    { title: 'Behavioral Fingerprinting', description: 'Bot detection, anomaly scoring, IP reputation', category: 'security' },
    { title: 'Rate Limiting Strategies', description: 'Token bucket, sliding window, adaptive throttling', category: 'security' },
  ],
  NEXUS: [
    { title: 'API Gateway Patterns', description: 'Provider failover, cost-aware routing, cache invalidation', category: 'performance' },
    { title: 'Model Selection Heuristics', description: 'Task-to-model mapping, quality/cost tradeoffs', category: 'cost' },
  ],
  DECODE: [
    { title: 'Conversational Depth', description: 'Context windowing, topic coherence, tone calibration', category: 'learning' },
    { title: 'Sovereign Voice Patterns', description: 'Institutional tone, authority signaling, clarity', category: 'learning' },
  ],
  VISION: [
    { title: 'Anomaly Detection Algorithms', description: 'Z-score, CUSUM, seasonal decomposition', category: 'observability' },
    { title: 'Metric Correlation', description: 'Cross-module signal clustering, cascade detection', category: 'observability' },
  ],
  SYSTEM: [
    { title: 'Self-Healing Strategies', description: 'Auto-recovery, circuit reset, degradation management', category: 'reliability' },
    { title: 'Incident Detection', description: 'Error pattern recognition, threshold alerting, root cause analysis', category: 'reliability' },
  ],
  CORTEX: [
    { title: 'Pipeline Orchestration', description: 'DAG execution, dependency resolution, backpressure', category: 'performance' },
  ],
  ENCODE: [
    { title: 'Code Quality Patterns', description: 'TypeScript best practices, testing strategies, refactoring safety', category: 'learning' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

function initialize(): void {
  if (topics.length > 0) return;
  
  // Register global topics
  for (const t of GLOBAL_TOPICS) {
    topics.push({
      id: topicId('global', t.title),
      scope: 'global',
      title: t.title,
      description: t.description,
      category: t.category,
      mastery_score: 0,
      mastery_threshold: 0.8,
      call_count: 0,
      novelty_score: 1.0,
      last_called: null,
      fingerprints: [],
      active: true,
    });
  }
  
  // Register node solo topics
  for (const [node, nodeTopics] of Object.entries(NODE_SOLO_TOPICS)) {
    for (const t of nodeTopics) {
      topics.push({
        id: topicId('node-solo', t.title, node),
        scope: 'node-solo',
        node,
        title: t.title,
        description: t.description,
        category: t.category,
        mastery_score: 0,
        mastery_threshold: 0.8,
        call_count: 0,
        novelty_score: 1.0,
        last_called: null,
        fingerprints: [],
        active: true,
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOPIC SELECTION (70/30 WEIGHTING)
// ═══════════════════════════════════════════════════════════════════════════════

function selectNextTopic(node?: string): CLMTopic | null {
  initialize();
  
  const globalPool = topics.filter(t => t.scope === 'global' && t.active && t.mastery_score < t.mastery_threshold);
  const soloPool = topics.filter(t =>
    (t.scope === 'node-solo' || t.scope === 'dynamic-solo') &&
    t.active &&
    t.mastery_score < t.mastery_threshold &&
    (!node || t.node === node)
  );
  
  // 70/30 weighting
  const useGlobal = Math.random() < 0.7 || soloPool.length === 0;
  const pool = useGlobal ? globalPool : soloPool;
  
  if (pool.length === 0) return null;
  
  // Prefer highest novelty, lowest mastery
  pool.sort((a, b) => {
    const scoreA = a.novelty_score * (1 - a.mastery_score);
    const scoreB = b.novelty_score * (1 - b.mastery_score);
    return scoreB - scoreA;
  });
  
  return pool[0];
}

// ═══════════════════════════════════════════════════════════════════════════════
// MASTERY + NOVELTY TRACKING
// ═══════════════════════════════════════════════════════════════════════════════

function recordTopicCall(topicId: string, outputFingerprint: string, noveltyScore: number): void {
  const topic = topics.find(t => t.id === topicId);
  if (!topic) return;
  
  topic.call_count++;
  topic.last_called = new Date().toISOString();
  
  // Dedupe: check if this output has been seen before
  const isDuplicate = topic.fingerprints.includes(outputFingerprint);
  if (!isDuplicate) {
    topic.fingerprints.push(outputFingerprint);
    // Only advance mastery on novel outputs
    topic.mastery_score = Math.min(1, topic.mastery_score + (noveltyScore * 0.1));
    topic.novelty_score = Math.max(0.1, noveltyScore);
  } else {
    // Decay novelty for duplicate outputs
    topic.novelty_score = Math.max(0.05, topic.novelty_score * 0.7);
  }
  
  // Emit mastery event to INTEL if mastered
  if (topic.mastery_score >= topic.mastery_threshold) {
    intelAggregator.ingest({
      source: 'CLM',
      category: 'learning',
      severity: 'info',
      headline: `Topic Mastery Achieved: ${topic.title}`,
      detail: `${topic.node ?? 'Global'} has reached mastery threshold (${Math.round(topic.mastery_score * 100)}%) after ${topic.call_count} calls.`,
      timestamp: new Date().toISOString(),
      data: { topic_id: topic.id, mastery: topic.mastery_score, calls: topic.call_count },
      fingerprint: `mastery:${topic.id}`,
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DYNAMIC SOLO TOPICS (guardrailed)
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_DYNAMIC_PER_NODE = 3;
const VALID_CATEGORIES = new Set(GLOBAL_TOPICS.map(t => t.category));

function proposeDynamicTopic(proposal: Omit<DynamicTopicProposal, 'id' | 'scope_valid' | 'weight' | 'status' | 'created_at'>): DynamicTopicProposal {
  // Guardrails
  const existingDynamic = topics.filter(t => t.scope === 'dynamic-solo' && t.node === proposal.node && t.active);
  const scope_valid = existingDynamic.length < MAX_DYNAMIC_PER_NODE;
  
  const full: DynamicTopicProposal = {
    ...proposal,
    id: `dyn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    scope_valid,
    weight: 0.3, // max 30% allocation
    status: scope_valid ? 'approved' : 'rejected',
    created_at: new Date().toISOString(),
  };
  
  dynamicProposals.push(full);
  
  // Auto-register if approved
  if (full.status === 'approved') {
    topics.push({
      id: topicId('dynamic-solo', proposal.proposed_title, proposal.node),
      scope: 'dynamic-solo',
      node: proposal.node,
      title: proposal.proposed_title,
      description: proposal.proposed_description,
      category: 'learning',
      mastery_score: 0,
      mastery_threshold: 0.85,
      call_count: 0,
      novelty_score: 1.0,
      last_called: null,
      fingerprints: [],
      active: true,
    });
  }
  
  return full;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MASTERY HIGHLIGHTS (for INTEL Panel)
// ═══════════════════════════════════════════════════════════════════════════════

function getMasteryHighlights(): TopicMasteryHighlight[] {
  initialize();
  return topics.map(t => ({
    node: t.node ?? 'Global',
    topic_title: t.title,
    mastery_score: t.mastery_score,
    status: t.mastery_score >= t.mastery_threshold
      ? 'mastered'
      : t.call_count === 0
        ? 'new'
        : t.novelty_score < 0.2
          ? 'stale'
          : 'progressing',
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

export const clmTopicPipeline = {
  initialize,
  selectNextTopic,
  recordTopicCall,
  proposeDynamicTopic,
  getMasteryHighlights,
  getTopics: (scope?: TopicScope) => {
    initialize();
    return scope ? topics.filter(t => t.scope === scope) : [...topics];
  },
  getGlobalTopics: () => { initialize(); return topics.filter(t => t.scope === 'global'); },
  getNodeSoloTopics: (node: string) => { initialize(); return topics.filter(t => t.scope === 'node-solo' && t.node === node); },
  getDynamicTopics: (node?: string) => { initialize(); return topics.filter(t => t.scope === 'dynamic-solo' && (!node || t.node === node)); },
  getDynamicProposals: () => [...dynamicProposals],
};
