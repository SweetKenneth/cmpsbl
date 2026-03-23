/**
 * ECHO v9.0.0 "Resonance" — Ultimate Signal Reverberation & Pattern Amplification Engine
 *
 * Engines:
 *  1. Resonance Pattern Engine — harmonic detection across signal co-occurrences
 *  2. Signal Decay & Half-Life — priority-weighted graceful signal fade
 *  3. Echo Chamber Detection — anti-feedback loop cycle breaking
 *  4. Cross-Node Signal Correlation — causal chain discovery
 *  5. Signal Compression & Summarization — burst deduplication
 *  6. Selective Amplification — EMA-weighted signal value scoring
 *  7. Temporal Replay Engine — time-windowed forensic reconstruction
 *  8. Signal Bus Metrics — throughput, saturation, latency percentiles
 *  9. Signal Schema Registry — typed contracts with validation
 * 10. Predictive Echo (Forecasting) — n-gram signal sequence prediction
 * 11. Priority Routing Rules — governance-gated delivery lanes
 * 12. Digital Twin Simulation — preserved from v1 (what-if scenarios)
 *
 * Also retains: Circuit Breaker + Hot-Swap + Graceful Fallback
 */

import { emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';
import { validateStringInput, clampNumber } from '@/lib/system/hardening';
import { createModuleHardening, type ModuleHardening } from '../module-hardening';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type SignalPriority = 'critical' | 'high' | 'normal' | 'background';
export type SignalDecayTier = 'critical' | 'warning' | 'info' | 'heartbeat';

export interface EchoSignal {
  id: string;
  sourceNode: string;
  targetNode: string;
  signalType: string;
  payload: Record<string, unknown>;
  priority: SignalPriority;
  decayTier: SignalDecayTier;
  /** Remaining strength 0–1 (decays over time) */
  strength: number;
  /** Amplification multiplier from selective amplification engine */
  amplification: number;
  bounceCount: number;
  timestamp: number;
  expiresAt: number;
}

export interface ResonancePattern {
  id: string;
  signalTypes: string[];
  coOccurrenceCount: number;
  /** Time window in ms where signals co-occur */
  windowMs: number;
  avgInterval: number;
  confidence: number;
  discoveredAt: number;
  lastSeenAt: number;
}

export interface SignalCorrelation {
  id: string;
  /** Ordered sequence of signal types forming a causal chain */
  chain: string[];
  frequency: number;
  avgLatencyMs: number;
  confidence: number;
  lastObservedAt: number;
}

export interface CompressedBurst {
  id: string;
  signalType: string;
  sourceNode: string;
  count: number;
  firstTimestamp: number;
  lastTimestamp: number;
  avgPayload: Record<string, unknown>;
}

export interface SignalSchema {
  id: string;
  signalType: string;
  version: number;
  fields: Array<{ name: string; type: string; required: boolean }>;
  createdAt: number;
}

export interface RoutingRule {
  id: string;
  condition: { signalType?: string; sourceNode?: string; priority?: SignalPriority };
  targets: string[];
  priority: SignalPriority;
  enabled: boolean;
  governanceLocked: boolean;
}

export interface SignalForecast {
  predictedSignalType: string;
  probability: number;
  expectedInMs: number;
  basedOnSequence: string[];
}

export interface BusMetrics {
  throughputPerSecond: number;
  totalSignals: number;
  activeSignals: number;
  expiredSignals: number;
  compressedBursts: number;
  echoChambersDetected: number;
  echoChambersBlocked: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  saturationPercent: number;
}

// Digital twin types (preserved from v1)
export interface DigitalTwin {
  id: string;
  name: string;
  entityType: string;
  state: Record<string, number>;
  parameters: Record<string, number>;
  history: TwinSnapshot[];
  createdAt: number;
  lastSyncedAt: number;
}

export interface TwinSnapshot {
  timestamp: number;
  state: Record<string, number>;
  delta: Record<string, number>;
}

export interface Scenario {
  id: string;
  twinId: string;
  name: string;
  interventions: Intervention[];
  results: ScenarioResult | null;
  status: 'pending' | 'running' | 'complete' | 'failed';
  createdAt: number;
}

export interface Intervention {
  parameter: string;
  operation: 'set' | 'multiply' | 'add';
  value: number;
  atStep: number;
}

export interface ScenarioResult {
  steps: number;
  finalState: Record<string, number>;
  trajectory: Record<string, number[]>;
  divergenceFromBaseline: number;
  insights: string[];
}

export interface EchoModuleState {
  initialized: boolean;
  version: string;
  // Signal engine
  signals: EchoSignal[];
  resonancePatterns: ResonancePattern[];
  correlations: SignalCorrelation[];
  compressedBursts: CompressedBurst[];
  schemas: SignalSchema[];
  routingRules: RoutingRule[];
  forecasts: SignalForecast[];
  busMetrics: BusMetrics;
  // Digital twin engine (preserved)
  twins: DigitalTwin[];
  scenarios: Scenario[];
  totalSimulations: number;
  totalTwins: number;
  avgDivergence: number;
  // Signal engine stats
  totalSignalsProcessed: number;
  amplificationScores: Map<string, number>;
  /** n-gram model: 2-gram and 3-gram frequency maps */
  ngramModel: Map<string, Map<string, number>>;
  /** Recent signal type sequence for pattern detection */
  recentSignalSequence: string[];
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const SIGNAL_RING_CAP = 5000;
const PATTERN_CAP = 200;
const CORRELATION_CAP = 100;
const BURST_CAP = 100;
const SCHEMA_CAP = 200;
const RULE_CAP = 50;
const FORECAST_CAP = 20;
const TWIN_CAP = 100;
const SCENARIO_CAP = 200;
const SEQUENCE_WINDOW = 100;
const MAX_BOUNCE_DEPTH = 5;
const COMPRESSION_WINDOW_MS = 10_000;
const MIN_BURST_COUNT = 5;
const AMP_EMA_ALPHA = 0.1;
const LATENCY_RING_CAP = 1000;

const DECAY_HALF_LIVES: Record<SignalDecayTier, number> = {
  critical: 3_600_000,   // 1 hour
  warning: 900_000,      // 15 minutes
  info: 300_000,         // 5 minutes
  heartbeat: 60_000,     // 60 seconds
};

const PRIORITY_ORDER: Record<SignalPriority, number> = {
  critical: 0, high: 1, normal: 2, background: 3,
};

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const state: EchoModuleState = {
  initialized: false,
  version: '9.0.0',
  signals: [],
  resonancePatterns: [],
  correlations: [],
  compressedBursts: [],
  schemas: [],
  routingRules: [],
  forecasts: [],
  busMetrics: {
    throughputPerSecond: 0, totalSignals: 0, activeSignals: 0,
    expiredSignals: 0, compressedBursts: 0, echoChambersDetected: 0,
    echoChambersBlocked: 0, latencyP50: 0, latencyP95: 0, latencyP99: 0,
    saturationPercent: 0,
  },
  twins: [],
  scenarios: [],
  totalSimulations: 0,
  totalTwins: 0,
  avgDivergence: 0,
  totalSignalsProcessed: 0,
  amplificationScores: new Map(),
  ngramModel: new Map(),
  recentSignalSequence: [],
};

const latencyRing: number[] = [];
let moduleEngine: ModuleEngine | null = null;
let hardening: ModuleHardening | null = null;
let throughputWindowStart = Date.now();
let throughputCount = 0;

// ═══════════════════════════════════════════════════════════════
// 1. RESONANCE PATTERN ENGINE
// ═══════════════════════════════════════════════════════════════

function detectResonancePatterns(newSignalType: string): void {
  const now = Date.now();
  const windows = [1000, 10_000, 60_000, 300_000];

  for (const windowMs of windows) {
    const cutoff = now - windowMs;
    const recentTypes = state.signals
      .filter(s => s.timestamp >= cutoff)
      .map(s => s.signalType);

    // Find co-occurring pairs with the new signal
    const coTypes = new Set(recentTypes.filter(t => t !== newSignalType));
    for (const coType of coTypes) {
      const pairKey = [newSignalType, coType].sort().join('+');
      const existing = state.resonancePatterns.find(p =>
        p.signalTypes.join('+') === pairKey && p.windowMs === windowMs
      );

      if (existing) {
        existing.coOccurrenceCount++;
        existing.confidence = Math.min(1, existing.coOccurrenceCount / 50);
        existing.lastSeenAt = now;
      } else if (state.resonancePatterns.length < PATTERN_CAP) {
        state.resonancePatterns.push({
          id: `res-${pairKey}-${windowMs}`,
          signalTypes: [newSignalType, coType].sort(),
          coOccurrenceCount: 1,
          windowMs,
          avgInterval: windowMs / 2,
          confidence: 0.02,
          discoveredAt: now,
          lastSeenAt: now,
        });
      }
    }
  }

  // Prune stale patterns (not seen in 10 minutes)
  const staleCutoff = now - 600_000;
  const beforeLen = state.resonancePatterns.length;
  state.resonancePatterns = state.resonancePatterns.filter(p => p.lastSeenAt > staleCutoff);
  if (state.resonancePatterns.length < beforeLen) {
    // pruned stale patterns
  }
}

// ═══════════════════════════════════════════════════════════════
// 2. SIGNAL DECAY & HALF-LIFE
// ═══════════════════════════════════════════════════════════════

function calculateDecay(signal: EchoSignal): number {
  const elapsed = Date.now() - signal.timestamp;
  const halfLife = DECAY_HALF_LIVES[signal.decayTier];
  return Math.pow(0.5, elapsed / halfLife);
}

function pruneExpiredSignals(): void {
  const now = Date.now();
  const before = state.signals.length;
  state.signals = state.signals.filter(s => {
    const strength = calculateDecay(s);
    s.strength = strength;
    return strength > 0.01 && now < s.expiresAt;
  });
  state.busMetrics.expiredSignals += before - state.signals.length;
}

// ═══════════════════════════════════════════════════════════════
// 3. ECHO CHAMBER DETECTION & PREVENTION
// ═══════════════════════════════════════════════════════════════

function detectEchoChamber(source: string, target: string, signalType: string): boolean {
  // Check recent signals for bounce pattern: A→B→A→B of same type
  const recent = state.signals.slice(-20);
  let bounces = 0;
  for (let i = recent.length - 1; i >= 0; i--) {
    const s = recent[i];
    if (s.signalType !== signalType) continue;
    if ((s.sourceNode === source && s.targetNode === target) ||
        (s.sourceNode === target && s.targetNode === source)) {
      bounces++;
    }
    if (bounces >= MAX_BOUNCE_DEPTH) {
      state.busMetrics.echoChambersDetected++;
      state.busMetrics.echoChambersBlocked++;
      return true;
    }
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════
// 4. CROSS-NODE SIGNAL CORRELATION
// ═══════════════════════════════════════════════════════════════

function updateCorrelations(): void {
  const seq = state.recentSignalSequence;
  if (seq.length < 3) return;

  // Build 2-gram and 3-gram frequency
  for (let n = 2; n <= 3; n++) {
    if (seq.length < n) continue;
    const ngram = seq.slice(-n).join('→');
    const prefix = seq.slice(-(n), -1).join('→');

    if (!state.ngramModel.has(prefix)) {
      state.ngramModel.set(prefix, new Map());
    }
    const followers = state.ngramModel.get(prefix)!;
    const lastType = seq[seq.length - 1];
    followers.set(lastType, (followers.get(lastType) ?? 0) + 1);
  }

  // Detect causal chains from high-frequency 3-grams
  if (seq.length >= 3) {
    const chain = seq.slice(-3);
    const chainKey = chain.join('→');
    const existing = state.correlations.find(c => c.chain.join('→') === chainKey);
    if (existing) {
      existing.frequency++;
      existing.confidence = Math.min(1, existing.frequency / 30);
      existing.lastObservedAt = Date.now();
    } else if (state.correlations.length < CORRELATION_CAP) {
      state.correlations.push({
        id: `corr-${Date.now()}`,
        chain,
        frequency: 1,
        avgLatencyMs: 0,
        confidence: 0.03,
        lastObservedAt: Date.now(),
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// 5. SIGNAL COMPRESSION & SUMMARIZATION
// ═══════════════════════════════════════════════════════════════

function tryCompressBurst(signalType: string, sourceNode: string): CompressedBurst | null {
  const now = Date.now();
  const windowStart = now - COMPRESSION_WINDOW_MS;
  const burstSignals = state.signals.filter(s =>
    s.signalType === signalType && s.sourceNode === sourceNode && s.timestamp >= windowStart
  );

  if (burstSignals.length < MIN_BURST_COUNT) return null;

  const burst: CompressedBurst = {
    id: `burst-${Date.now()}`,
    signalType,
    sourceNode,
    count: burstSignals.length,
    firstTimestamp: burstSignals[0].timestamp,
    lastTimestamp: burstSignals[burstSignals.length - 1].timestamp,
    avgPayload: {},
  };

  if (state.compressedBursts.length >= BURST_CAP) state.compressedBursts.shift();
  state.compressedBursts.push(burst);
  state.busMetrics.compressedBursts++;
  return burst;
}

// ═══════════════════════════════════════════════════════════════
// 6. SELECTIVE AMPLIFICATION ENGINE
// ═══════════════════════════════════════════════════════════════

function getAmplification(signalType: string): number {
  return state.amplificationScores.get(signalType) ?? 1.0;
}

export function recordSignalOutcome(signalType: string, hadImpact: boolean): void {
  const current = state.amplificationScores.get(signalType) ?? 1.0;
  const newScore = hadImpact
    ? current * (1 - AMP_EMA_ALPHA) + 1.5 * AMP_EMA_ALPHA  // amplify
    : current * (1 - AMP_EMA_ALPHA) + 0.5 * AMP_EMA_ALPHA;  // dampen
  state.amplificationScores.set(signalType, clampNumber(newScore, 0.1, 3.0, 1.0));
}

// ═══════════════════════════════════════════════════════════════
// 7. TEMPORAL REPLAY ENGINE
// ═══════════════════════════════════════════════════════════════

export function replayTimeWindow(startMs: number, endMs: number): EchoSignal[] {
  return state.signals
    .filter(s => s.timestamp >= startMs && s.timestamp <= endMs)
    .sort((a, b) => a.timestamp - b.timestamp);
}

export function replayByNode(nodeId: string, limit: number = 50): EchoSignal[] {
  return state.signals
    .filter(s => s.sourceNode === nodeId || s.targetNode === nodeId)
    .slice(-limit);
}

// ═══════════════════════════════════════════════════════════════
// 8. SIGNAL BUS METRICS
// ═══════════════════════════════════════════════════════════════

function updateBusMetrics(latencyMs: number): void {
  // Throughput calculation
  const now = Date.now();
  throughputCount++;
  const elapsed = (now - throughputWindowStart) / 1000;
  if (elapsed >= 1) {
    state.busMetrics.throughputPerSecond = throughputCount / elapsed;
    throughputWindowStart = now;
    throughputCount = 0;
  }

  // Latency percentiles
  if (latencyRing.length >= LATENCY_RING_CAP) latencyRing.shift();
  latencyRing.push(latencyMs);

  const sorted = [...latencyRing].sort((a, b) => a - b);
  const len = sorted.length;
  state.busMetrics.latencyP50 = sorted[Math.floor(len * 0.5)] ?? 0;
  state.busMetrics.latencyP95 = sorted[Math.floor(len * 0.95)] ?? 0;
  state.busMetrics.latencyP99 = sorted[Math.floor(len * 0.99)] ?? 0;

  // Saturation
  state.busMetrics.activeSignals = state.signals.filter(s => s.strength > 0.01).length;
  state.busMetrics.saturationPercent = (state.busMetrics.activeSignals / SIGNAL_RING_CAP) * 100;
}

// ═══════════════════════════════════════════════════════════════
// 9. SIGNAL SCHEMA REGISTRY
// ═══════════════════════════════════════════════════════════════

export function registerSignalSchema(
  signalType: string,
  fields: Array<{ name: string; type: string; required: boolean }>,
  version: number = 1
): SignalSchema {
  // Replace existing schema for same type
  const idx = state.schemas.findIndex(s => s.signalType === signalType);
  const schema: SignalSchema = {
    id: `schema-${signalType}-v${version}`,
    signalType,
    version,
    fields,
    createdAt: Date.now(),
  };

  if (idx >= 0) {
    state.schemas[idx] = schema;
  } else {
    if (state.schemas.length >= SCHEMA_CAP) state.schemas.shift();
    state.schemas.push(schema);
  }
  return schema;
}

function validateAgainstSchema(signalType: string, payload: Record<string, unknown>): boolean {
  const schema = state.schemas.find(s => s.signalType === signalType);
  if (!schema) return true; // No schema = no validation

  for (const field of schema.fields) {
    if (field.required && !(field.name in payload)) return false;
    if (field.name in payload) {
      const val = payload[field.name];
      if (field.type === 'string' && typeof val !== 'string') return false;
      if (field.type === 'number' && typeof val !== 'number') return false;
      if (field.type === 'boolean' && typeof val !== 'boolean') return false;
    }
  }
  return true;
}

export function getSchemaForType(signalType: string): SignalSchema | null {
  return state.schemas.find(s => s.signalType === signalType) ?? null;
}

// ═══════════════════════════════════════════════════════════════
// 10. PREDICTIVE ECHO (SIGNAL FORECASTING)
// ═══════════════════════════════════════════════════════════════

function generateForecasts(): void {
  const seq = state.recentSignalSequence;
  if (seq.length < 2) return;

  state.forecasts = [];

  // 2-gram prediction
  const lastType = seq[seq.length - 1];
  const followers2 = state.ngramModel.get(lastType);
  if (followers2) {
    const total = Array.from(followers2.values()).reduce((s, v) => s + v, 0);
    for (const [predicted, count] of followers2) {
      if (state.forecasts.length >= FORECAST_CAP) break;
      state.forecasts.push({
        predictedSignalType: predicted,
        probability: count / total,
        expectedInMs: 5000,
        basedOnSequence: [lastType],
      });
    }
  }

  // 3-gram prediction (higher confidence)
  if (seq.length >= 2) {
    const prefix3 = seq.slice(-2).join('→');
    const followers3 = state.ngramModel.get(prefix3);
    if (followers3) {
      const total = Array.from(followers3.values()).reduce((s, v) => s + v, 0);
      for (const [predicted, count] of followers3) {
        const existing = state.forecasts.find(f => f.predictedSignalType === predicted);
        const prob = count / total;
        if (existing) {
          // Blend: 3-gram gets higher weight
          existing.probability = existing.probability * 0.3 + prob * 0.7;
          existing.basedOnSequence = seq.slice(-2);
        } else if (state.forecasts.length < FORECAST_CAP) {
          state.forecasts.push({
            predictedSignalType: predicted,
            probability: prob,
            expectedInMs: 3000,
            basedOnSequence: seq.slice(-2),
          });
        }
      }
    }
  }

  // Sort by probability descending
  state.forecasts.sort((a, b) => b.probability - a.probability);
}

// ═══════════════════════════════════════════════════════════════
// 11. PRIORITY ROUTING RULES ENGINE
// ═══════════════════════════════════════════════════════════════

export function addRoutingRule(rule: Omit<RoutingRule, 'id'>): RoutingRule {
  const newRule: RoutingRule = { ...rule, id: `rule-${Date.now()}` };
  if (state.routingRules.length >= RULE_CAP) state.routingRules.shift();
  state.routingRules.push(newRule);
  return newRule;
}

export function removeRoutingRule(ruleId: string): boolean {
  const idx = state.routingRules.findIndex(r => r.id === ruleId);
  if (idx === -1) return false;
  if (state.routingRules[idx].governanceLocked) return false;
  state.routingRules.splice(idx, 1);
  return true;
}

function matchRoutingRules(signal: EchoSignal): RoutingRule[] {
  return state.routingRules.filter(r => {
    if (!r.enabled) return false;
    if (r.condition.signalType && r.condition.signalType !== signal.signalType) return false;
    if (r.condition.sourceNode && r.condition.sourceNode !== signal.sourceNode) return false;
    if (r.condition.priority && PRIORITY_ORDER[r.condition.priority] > PRIORITY_ORDER[signal.priority]) return false;
    return true;
  });
}

// ═══════════════════════════════════════════════════════════════
// CORE SIGNAL PROCESSING
// ═══════════════════════════════════════════════════════════════

export function emitSignal(
  sourceNode: string,
  targetNode: string,
  signalType: string,
  payload: Record<string, unknown> = {},
  priority: SignalPriority = 'normal',
  decayTier: SignalDecayTier = 'info'
): EchoSignal | null {
  const start = performance.now();

  // Echo chamber check
  if (detectEchoChamber(sourceNode, targetNode, signalType)) {
    return null; // Blocked
  }

  // Schema validation
  if (!validateAgainstSchema(signalType, payload)) {
    return null; // Invalid payload
  }

  const halfLife = DECAY_HALF_LIVES[decayTier];
  const amplification = getAmplification(signalType);

  const signal: EchoSignal = {
    id: `sig-${Date.now()}-${state.totalSignalsProcessed}`,
    sourceNode: validateStringInput(sourceNode, { maxLength: 50 }) ?? 'unknown',
    targetNode: validateStringInput(targetNode, { maxLength: 50 }) ?? 'unknown',
    signalType,
    payload,
    priority,
    decayTier,
    strength: 1.0,
    amplification,
    bounceCount: 0,
    timestamp: Date.now(),
    expiresAt: Date.now() + halfLife * 4, // Signal fully expires after 4 half-lives
  };

  // Ring buffer management
  if (state.signals.length >= SIGNAL_RING_CAP) state.signals.shift();
  state.signals.push(signal);
  state.totalSignalsProcessed++;
  state.busMetrics.totalSignals = state.totalSignalsProcessed;

  // Update sequence window for pattern detection
  if (state.recentSignalSequence.length >= SEQUENCE_WINDOW) state.recentSignalSequence.shift();
  state.recentSignalSequence.push(signalType);

  // Run engines
  detectResonancePatterns(signalType);
  updateCorrelations();
  tryCompressBurst(signalType, sourceNode);
  generateForecasts();

  const latency = performance.now() - start;
  updateBusMetrics(latency);

  // Periodic signal pruning (every 100 signals)
  if (state.totalSignalsProcessed % 100 === 0) {
    pruneExpiredSignals();
  }

  return signal;
}

// ═══════════════════════════════════════════════════════════════
// 12. DIGITAL TWIN SIMULATION (preserved from v1)
// ═══════════════════════════════════════════════════════════════

export function createTwin(name: string, entityType: string, initialState: Record<string, number>, parameters: Record<string, number> = {}): DigitalTwin {
  const twin: DigitalTwin = {
    id: `twin-${Date.now()}-${state.totalTwins}`, name,
    entityType: validateStringInput(entityType, { maxLength: 100 }) ?? 'generic',
    state: { ...initialState }, parameters: { ...parameters },
    history: [{ timestamp: Date.now(), state: { ...initialState }, delta: {} }],
    createdAt: Date.now(), lastSyncedAt: Date.now(),
  };
  if (state.twins.length >= TWIN_CAP) state.twins.shift();
  state.twins.push(twin);
  state.totalTwins++;
  return twin;
}

export function syncTwin(twinId: string, realWorldState: Record<string, number>): DigitalTwin | null {
  const twin = state.twins.find(t => t.id === twinId);
  if (!twin) return null;
  const delta: Record<string, number> = {};
  for (const [key, value] of Object.entries(realWorldState)) {
    delta[key] = value - (twin.state[key] ?? 0);
    twin.state[key] = value;
  }
  if (twin.history.length >= 500) twin.history.shift();
  twin.history.push({ timestamp: Date.now(), state: { ...twin.state }, delta });
  twin.lastSyncedAt = Date.now();
  return twin;
}

export function runScenario(twinId: string, name: string, interventions: Intervention[], steps: number = 100): Scenario {
  const twin = state.twins.find(t => t.id === twinId);
  const scenario: Scenario = {
    id: `scn-${Date.now()}-${state.totalSimulations}`, twinId, name, interventions,
    results: null, status: 'pending', createdAt: Date.now(),
  };
  if (!twin) { scenario.status = 'failed'; return scenario; }

  const { result } = withResilienceSync('echo', () => {
    scenario.status = 'running';
    const safeSteps = clampNumber(steps, 1, 10_000, 100);
    const simState = { ...twin.state };
    const trajectory: Record<string, number[]> = {};
    for (const key of Object.keys(simState)) trajectory[key] = [];

    for (let step = 0; step < safeSteps; step++) {
      for (const intv of interventions) {
        if (intv.atStep === step && simState[intv.parameter] !== undefined) {
          switch (intv.operation) {
            case 'set': simState[intv.parameter] = intv.value; break;
            case 'multiply': simState[intv.parameter] *= intv.value; break;
            case 'add': simState[intv.parameter] += intv.value; break;
          }
        }
      }
      for (const key of Object.keys(simState)) {
        const rate = twin.parameters[`${key}_rate`] ?? 0;
        simState[key] += rate;
        trajectory[key].push(simState[key]);
      }
    }

    let divergence = 0;
    for (const key of Object.keys(twin.state)) {
      divergence += Math.abs((simState[key] ?? 0) - (twin.state[key] ?? 0));
    }
    divergence /= Object.keys(twin.state).length || 1;

    scenario.results = {
      steps: safeSteps, finalState: { ...simState }, trajectory,
      divergenceFromBaseline: divergence,
      insights: divergence > 10
        ? ['High divergence detected — scenario significantly alters system state']
        : ['Scenario within normal operating bounds'],
    };
    scenario.status = 'complete';
    if (state.scenarios.length >= SCENARIO_CAP) state.scenarios.shift();
    state.scenarios.push(scenario);
    state.totalSimulations++;
    recalculateTwins();
    return scenario;
  }, scenario, 'run_scenario');

  return result;
}

function recalculateTwins(): void {
  const completed = state.scenarios.filter(s => s.results).slice(-20);
  state.avgDivergence = completed.length > 0
    ? completed.reduce((s, sc) => s + (sc.results?.divergenceFromBaseline ?? 0), 0) / completed.length
    : 0;
}

// ═══════════════════════════════════════════════════════════════
// LIFECYCLE & PUBLIC API
// ═══════════════════════════════════════════════════════════════

export function initEcho(): void {
  emitStarted('echo', 'init', {});
  try {
    initCircuitBreaker('echo', { failureThreshold: 5, recoveryTimeout: 30_000 });
    moduleEngine = activateModuleEngine('echo', '9.0.0');
    hardening = createModuleHardening('echo', { maxConcurrent: 16, rateLimit: 200, healthThreshold: 30 });
    state.initialized = true;
    state.version = '9.0.0';
    hardening.startAutoRestore(() => getEchoHealth(), () => { state.avgDivergence = 0; }, 30_000);
    hardening.snapshot(state);
    emitSucceeded('echo', 'init', {
      engineId: moduleEngine.instance.id,
      version: '9.0.0',
      capabilities: [
        'resonance-patterns', 'signal-decay', 'echo-chamber-detection',
        'signal-correlation', 'burst-compression', 'selective-amplification',
        'temporal-replay', 'bus-metrics', 'signal-schema-registry',
        'predictive-echo', 'priority-routing', 'digital-twins',
      ],
    });
  } catch (err) {
    state.initialized = true;
    emitFailed('echo', 'init', err instanceof Error ? err.message : String(err));
  }
}

export function getEchoState(): EchoModuleState {
  return {
    ...state,
    amplificationScores: new Map(state.amplificationScores),
    ngramModel: new Map(state.ngramModel),
  };
}

export function getEchoHealth(): number {
  if (!state.initialized) return 0;
  let h = 100;

  // Deduct for echo chambers
  if (state.busMetrics.echoChambersDetected > 0) h -= Math.min(state.busMetrics.echoChambersDetected * 2, 20);

  // Deduct for saturation
  if (state.busMetrics.saturationPercent > 80) h -= 15;
  else if (state.busMetrics.saturationPercent > 60) h -= 5;

  // Deduct for high latency
  if (state.busMetrics.latencyP95 > 50) h -= 10;
  if (state.busMetrics.latencyP99 > 100) h -= 10;

  if (hardening?.isDegraded()) return Math.min(h, 40);
  return Math.max(0, Math.min(100, h));
}

export function getEchoResilience() { return getModuleResilienceReport('echo', getEchoHealth()); }
export function getEchoEngine() { return moduleEngine; }
export function getEchoHardening() { return hardening?.getHardeningReport() ?? null; }
export function upgradeEchoEngine(v: string) {
  if (moduleEngine && hardening) { hardening.snapshot(state); moduleEngine = hardening.upgradeEngine(moduleEngine, v); }
  return moduleEngine;
}

export function getBusMetrics(): BusMetrics { return { ...state.busMetrics }; }
export function getResonancePatterns(): ResonancePattern[] { return [...state.resonancePatterns]; }
export function getCorrelations(): SignalCorrelation[] { return [...state.correlations]; }
export function getForecasts(): SignalForecast[] { return [...state.forecasts]; }
export function getCompressedBursts(): CompressedBurst[] { return [...state.compressedBursts]; }
export function getRoutingRules(): RoutingRule[] { return [...state.routingRules]; }
export function getAmplificationScores(): Record<string, number> { return Object.fromEntries(state.amplificationScores); }
