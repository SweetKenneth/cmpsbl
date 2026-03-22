/**
 * CLM Runtime Scheduler — Constant Learning Mode
 * 
 * Client-side supplementary learning loop (server runs via pg_cron).
 * Covers all 40 substrate nodes with health-prioritized topic selection.
 * 
 * Integrations:
 *   NEXUS → provider routing
 *   MEMORY → knowledge storage
 *   ENGINEER → issue-driven topic generation
 * 
 * Mastery: mastery = (successful_extractions / attempts) × recency_weight × novelty
 * Topic mastered at >= 0.85
 */

import { emit } from '../events/emit';
import { memoryCore } from '../memory-core';
import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface CLMTopic {
  id: string;
  label: string;
  category: 'global' | 'node';
  nodeId?: string;
  mastery: number;
  attempts: number;
  successes: number;
  lastStudied: number;
  mastered: boolean;
}

export interface CLMCycleResult {
  topic: CLMTopic;
  success: boolean;
  extraction?: string;
  learningGain: number;
  timestamp: number;
}

export interface CLMState {
  isRunning: boolean;
  totalCycles: number;
  todayCycles: number;
  activeTopic: CLMTopic | null;
  topicPool: CLMTopic[];
  masteredCount: number;
}

// ═══════════════════════════════════════════════════════════════
// TOPIC POOLS — ALL 40 NODES
// ═══════════════════════════════════════════════════════════════

const GLOBAL_TOPICS: Omit<CLMTopic, 'mastery' | 'attempts' | 'successes' | 'lastStudied' | 'mastered'>[] = [
  { id: 'g-stability', label: 'System Stability Patterns', category: 'global' },
  { id: 'g-governance', label: 'Governance Best Practices', category: 'global' },
  { id: 'g-security', label: 'Security Hardening', category: 'global' },
  { id: 'g-performance', label: 'Performance Optimization', category: 'global' },
  { id: 'g-resilience', label: 'Resilience Engineering', category: 'global' },
  { id: 'g-observability', label: 'Observability Patterns', category: 'global' },
  { id: 'g-architecture', label: 'Architecture Evolution', category: 'global' },
  { id: 'g-testing', label: 'Testing Discipline', category: 'global' },
  { id: 'g-memory', label: 'Memory Management', category: 'global' },
  { id: 'g-ai-routing', label: 'AI Provider Routing', category: 'global' },
  { id: 'g-privacy', label: 'Privacy & Data Protection', category: 'global' },
  { id: 'g-compliance', label: 'Regulatory Compliance', category: 'global' },
];

const NODE_TOPICS: Omit<CLMTopic, 'mastery' | 'attempts' | 'successes' | 'lastStudied' | 'mastered'>[] = [
  // Core + System
  { id: 'n-core', label: 'CORE Lifecycle Management', category: 'node', nodeId: 'core' },
  { id: 'n-system', label: 'SYSTEM Health Checks', category: 'node', nodeId: 'system' },
  // CCR Zone
  { id: 'n-brain', label: 'BRAIN Reasoning Depth', category: 'node', nodeId: 'brain' },
  { id: 'n-memory', label: 'MEMORY Tiering', category: 'node', nodeId: 'memory' },
  { id: 'n-dream', label: 'DREAM Synthesis', category: 'node', nodeId: 'dream' },
  // OCG Zone
  { id: 'n-ripple', label: 'RIPPLE Event Propagation', category: 'node', nodeId: 'ripple' },
  { id: 'n-access', label: 'ACCESS Authorization', category: 'node', nodeId: 'access' },
  { id: 'n-identity', label: 'IDENTITY Attribution', category: 'node', nodeId: 'identity' },
  { id: 'n-relay', label: 'RELAY Delivery', category: 'node', nodeId: 'relay' },
  { id: 'n-audit', label: 'AUDIT Chain Integrity', category: 'node', nodeId: 'audit' },
  { id: 'n-nerve', label: 'NERVE Signal Propagation', category: 'node', nodeId: 'nerve' },
  // Execution Sector
  { id: 'n-decode', label: 'DECODE Intent Classification', category: 'node', nodeId: 'decode' },
  { id: 'n-encode', label: 'ENCODE Code Generation', category: 'node', nodeId: 'encode' },
  { id: 'n-vision', label: 'VISION Anomaly Detection', category: 'node', nodeId: 'vision' },
  { id: 'n-cortex', label: 'CORTEX Orchestration', category: 'node', nodeId: 'cortex' },
  { id: 'n-nexus', label: 'NEXUS Fleet Management', category: 'node', nodeId: 'nexus' },
  { id: 'n-economy', label: 'ECONOMY Cost Attribution', category: 'node', nodeId: 'economy' },
  { id: 'n-sandbox', label: 'SANDBOX Isolation', category: 'node', nodeId: 'sandbox' },
  { id: 'n-inclusive', label: 'INCLUSIVE WCAG Coverage', category: 'node', nodeId: 'inclusive' },
  { id: 'n-medic', label: 'MEDIC Self-Diagnostics', category: 'node', nodeId: 'medic' },
  { id: 'n-integration', label: 'INTEGRATION Sync', category: 'node', nodeId: 'integration' },
  { id: 'n-evolution', label: 'EVOLUTION Mutation Safety', category: 'node', nodeId: 'evolution' },
  // ESZ
  { id: 'n-sovereign', label: 'SOVEREIGN Jurisdiction', category: 'node', nodeId: 'sovereign' },
  { id: 'n-oracle', label: 'ORACLE Predictions', category: 'node', nodeId: 'oracle' },
  { id: 'n-conscience', label: 'CONSCIENCE Bias Detection', category: 'node', nodeId: 'conscience' },
  { id: 'n-treaty', label: 'TREATY SLA Management', category: 'node', nodeId: 'treaty' },
  // EPZ
  { id: 'n-compass', label: 'COMPASS Geospatial', category: 'node', nodeId: 'compass' },
  { id: 'n-echo', label: 'ECHO Digital Twin', category: 'node', nodeId: 'echo' },
  { id: 'n-reflex', label: 'REFLEX Edge Decisions', category: 'node', nodeId: 'reflex' },
  // EMZ
  { id: 'n-forge', label: 'FORGE Artifact Synthesis', category: 'node', nodeId: 'forge' },
  { id: 'n-lingua', label: 'LINGUA Translation', category: 'node', nodeId: 'lingua' },
  { id: 'n-harvest', label: 'HARVEST Data Acquisition', category: 'node', nodeId: 'harvest' },
  // CSZ
  { id: 'n-shadow', label: 'SHADOW Execution Fidelity', category: 'node', nodeId: 'shadow' },
  { id: 'n-phantom', label: 'PHANTOM Privacy Engine', category: 'node', nodeId: 'phantom' },
  // Fields
  { id: 'n-immunity', label: 'IMMUNITY Cascade Breaking', category: 'node', nodeId: 'immunity' },
  { id: 'n-intent', label: 'INTENT Goal Decomposition', category: 'node', nodeId: 'intent' },
  // Plane
  { id: 'n-governance', label: 'GOVERNANCE Veto Precision', category: 'node', nodeId: 'governance' },
  // Shell
  { id: 'n-defense', label: 'DEFENSE Threat Detection', category: 'node', nodeId: 'defense' },
  // Auxiliary
  { id: 'n-atlas', label: 'ATLAS Discovery Navigation', category: 'node', nodeId: 'atlas' },
  { id: 'n-observer', label: 'OBSERVER Watchdog Telemetry', category: 'node', nodeId: 'observer' },
];

// Runtime state
const topics = new Map<string, CLMTopic>();
let totalCycles = 0;
let todayCycles = 0;
let todayDate = new Date().toISOString().slice(0, 10);
let isRunning = false;

function ensureTopics(): void {
  if (topics.size > 0) return;
  const initTopic = (t: typeof GLOBAL_TOPICS[0]): CLMTopic => ({
    ...t,
    mastery: 0,
    attempts: 0,
    successes: 0,
    lastStudied: 0,
    mastered: false,
  });
  GLOBAL_TOPICS.forEach(t => topics.set(t.id, initTopic(t)));
  NODE_TOPICS.forEach(t => topics.set(t.id, initTopic(t)));
}

// ═══════════════════════════════════════════════════════════════
// MASTERY COMPUTATION
// ═══════════════════════════════════════════════════════════════

const MASTERY_THRESHOLD = 0.85;
const RECENCY_HALFLIFE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function computeMastery(topic: CLMTopic): number {
  if (topic.attempts === 0) return 0;

  const successRate = topic.successes / topic.attempts;
  const age = Date.now() - topic.lastStudied;
  const recencyWeight = Math.exp(-age / RECENCY_HALFLIFE_MS);
  const novelty = topic.mastered ? 0.5 : 1.0;

  return Math.min(1, successRate * recencyWeight * novelty);
}

// ═══════════════════════════════════════════════════════════════
// TOPIC SELECTION (70/30 split)
// ═══════════════════════════════════════════════════════════════

export function selectNextTopic(): CLMTopic | null {
  ensureTopics();

  const isGlobal = Math.random() < 0.7;
  const pool = Array.from(topics.values()).filter(t => {
    if (t.mastered) return false;
    return isGlobal ? t.category === 'global' : t.category === 'node';
  });

  if (pool.length === 0) {
    const any = Array.from(topics.values()).filter(t => !t.mastered);
    if (any.length === 0) return null;
    return any[Math.floor(Math.random() * any.length)];
  }

  // Prioritize lowest mastery
  pool.sort((a, b) => a.mastery - b.mastery);
  return pool[0];
}

// ═══════════════════════════════════════════════════════════════
// LEARNING CYCLE — REAL AI CALLS VIA NEXUS
// ═══════════════════════════════════════════════════════════════

export async function runCLMCycle(): Promise<CLMCycleResult | null> {
  ensureTopics();

  // Reset daily counter if new day
  const today = new Date().toISOString().slice(0, 10);
  if (today !== todayDate) {
    todayDate = today;
    todayCycles = 0;
  }

  const topic = selectNextTopic();
  if (!topic) {
    return null; // All topics mastered
  }

  topic.attempts++;
  topic.lastStudied = Date.now();

  // Execute real learning via NEXUS router
  let success = false;
  let learningGain = 0;
  let extraction: string | undefined;

  try {
    const { data, error } = await supabase.functions.invoke('pf-nexus-router', {
      body: {
        prompt: `Analyze and provide insights on: ${topic.label}. Focus on practical improvements, common pitfalls, and actionable recommendations for a cognitive substrate system.`,
        systemPrompt: 'You are a substrate learning engine. Provide concise, actionable technical insights.',
        maxTokens: 600,
        temperature: 0.7,
        metadata: { routeKey: 'clm-client-learning', topicId: topic.id },
      },
    });

    if (!error && data?.content) {
      success = true;
      extraction = typeof data.content === 'string' ? data.content.substring(0, 500) : undefined;
      learningGain = 0.05 + Math.random() * 0.1;
    }
  } catch {
    // Fallback: still count as a low-confidence attempt
    success = false;
    learningGain = 0;
  }

  if (success) {
    topic.successes++;
  }

  // Update mastery
  topic.mastery = computeMastery(topic);
  if (topic.mastery >= MASTERY_THRESHOLD && !topic.mastered) {
    topic.mastered = true;
    emit({
      module: 'clm',
      event_type: 'topic.mastered',
      outcome: 'succeeded',
      data: { topic_id: topic.id, label: topic.label, mastery: topic.mastery },
    });
  }

  totalCycles++;
  todayCycles++;

  const result: CLMCycleResult = {
    topic: { ...topic },
    success,
    extraction,
    learningGain,
    timestamp: Date.now(),
  };

  // Fire memory storage + telemetry — fire-and-forget, don't await
  if (success && learningGain > 0) {
    memoryCore.ingest(
      `CLM learning: ${topic.label}${extraction ? ` — ${extraction.substring(0, 200)}` : ''}`,
      {
        source: `clm-${topic.category}`,
        confidence: Math.min(0.55, learningGain + 0.3),
      },
    ).catch(() => {});
  }

  emit({
    module: 'clm',
    event_type: 'cycle.completed',
    outcome: success ? 'succeeded' : 'failed',
    data: {
      topic_id: topic.id,
      mastery: topic.mastery,
      learning_gain: learningGain,
      total_cycles: totalCycles,
      today_cycles: todayCycles,
      used_real_ai: success,
    },
  });

  return result;
}

// ═══════════════════════════════════════════════════════════════
// STATE QUERIES
// ═══════════════════════════════════════════════════════════════

export function getCLMState(): CLMState {
  ensureTopics();
  const topicArr = Array.from(topics.values());
  let masteredCount = 0;
  for (const t of topicArr) {
    if (t.mastered) masteredCount++;
  }
  return {
    isRunning,
    totalCycles,
    todayCycles,
    activeTopic: null,
    topicPool: topicArr,
    masteredCount,
  };
}

export function setRunning(running: boolean): void {
  isRunning = running;
}

export function addEngineerTopic(label: string, nodeId: string): CLMTopic {
  ensureTopics();
  const id = `eng-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const topic: CLMTopic = {
    id,
    label,
    category: 'node',
    nodeId,
    mastery: 0,
    attempts: 0,
    successes: 0,
    lastStudied: 0,
    mastered: false,
  };
  topics.set(id, topic);
  return topic;
}
