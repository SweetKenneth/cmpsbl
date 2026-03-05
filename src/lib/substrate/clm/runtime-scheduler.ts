/**
 * CLM Runtime Scheduler — Constant Learning Mode
 * 
 * Client-side supplementary learning loop (server runs via pg_cron).
 * ~10 calls/min when active tab, topic-driven with 70/30 global/node split.
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
// TOPIC POOLS
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
];

const NODE_TOPICS: Omit<CLMTopic, 'mastery' | 'attempts' | 'successes' | 'lastStudied' | 'mastered'>[] = [
  { id: 'n-decode', label: 'DECODE Intent Classification', category: 'node', nodeId: 'decode' },
  { id: 'n-encode', label: 'ENCODE Code Generation', category: 'node', nodeId: 'encode' },
  { id: 'n-brain', label: 'BRAIN Reasoning Depth', category: 'node', nodeId: 'brain' },
  { id: 'n-memory', label: 'MEMORY Tiering', category: 'node', nodeId: 'memory' },
  { id: 'n-defense', label: 'DEFENSE Threat Detection', category: 'node', nodeId: 'defense' },
  { id: 'n-nexus', label: 'NEXUS Fleet Management', category: 'node', nodeId: 'nexus' },
  { id: 'n-vision', label: 'VISION Anomaly Detection', category: 'node', nodeId: 'vision' },
  { id: 'n-dream', label: 'DREAM Synthesis', category: 'node', nodeId: 'dream' },
  { id: 'n-evolution', label: 'EVOLUTION Mutation Safety', category: 'node', nodeId: 'evolution' },
  { id: 'n-cortex', label: 'CORTEX Orchestration', category: 'node', nodeId: 'cortex' },
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
  const novelty = topic.mastered ? 0.5 : 1.0; // Reduced weight if already mastered

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
    // Fall back to any non-mastered topic
    const any = Array.from(topics.values()).filter(t => !t.mastered);
    if (any.length === 0) return null;
    return any[Math.floor(Math.random() * any.length)];
  }

  // Prioritize lowest mastery
  pool.sort((a, b) => a.mastery - b.mastery);
  return pool[0];
}

// ═══════════════════════════════════════════════════════════════
// LEARNING CYCLE
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

  // Simulate learning (in production, this calls NEXUS for AI extraction)
  const success = Math.random() > 0.2; // 80% success rate baseline
  const learningGain = success ? 0.05 + Math.random() * 0.1 : 0;

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

  // Store learning in memory
  if (success && learningGain > 0) {
    try {
      await memoryCore.ingest(`CLM learning: ${topic.label}`, {
        source: `clm-${topic.category}`,
        confidence: learningGain,
      });
    } catch { /* memory storage optional */ }
  }

  const result: CLMCycleResult = {
    topic: { ...topic },
    success,
    learningGain,
    timestamp: Date.now(),
  };

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
    },
  });

  return result;
}

// ═══════════════════════════════════════════════════════════════
// STATE QUERIES
// ═══════════════════════════════════════════════════════════════

export function getCLMState(): CLMState {
  ensureTopics();
  return {
    isRunning,
    totalCycles,
    todayCycles,
    activeTopic: null,
    topicPool: Array.from(topics.values()),
    masteredCount: Array.from(topics.values()).filter(t => t.mastered).length,
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
