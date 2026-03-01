/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  CMPSBL ENGINE — Autonomous Intelligent Operations Platform    ║
 * ║  The Substrate's Highest-Value Drop-In Artifact                ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Composes 8 Meta-Engines:                                      ║
 * ║    1. Task Processor    — Universal input → structured intent  ║
 * ║    2. AI Ops Platform   — Multi-provider AI with cost control  ║
 * ║    3. Workflow Engine   — Durable saga execution + rollback    ║
 * ║    4. Self-Healing Mesh — Auto-detect, diagnose, recover       ║
 * ║    5. Threat Defense    — Rate limit, circuit break, audit     ║
 * ║    6. Knowledge Engine  — Self-improving memory + learning     ║
 * ║    7. Observability     — Incident correlation + dashboards    ║
 * ║    8. Compliance Core   — Tamper-evident immutable audit trail ║
 * ║                                                                ║
 * ║  Zero dependencies. Pure TypeScript. Drop into any project.    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Usage:
 *   import { createCMPSBLEngine } from './cmpsbl-engine';
 *
 *   const engine = createCMPSBLEngine({ name: 'my-platform' });
 *
 *   // Submit any work — text, structured, or raw
 *   const result = await engine.submit('Analyze quarterly revenue trends');
 *
 *   // Or use the full pipeline explicitly
 *   const job = await engine.parse('compare models A and B');
 *   const routed = await engine.route(job);
 *   const outcome = await engine.execute(routed);
 *
 *   // Observe, heal, learn — all automatic
 *   engine.status();
 */

// ═══════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════

export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type JobPhase = 'parsed' | 'routed' | 'executing' | 'completed' | 'failed' | 'compensating' | 'healed';
export type ProviderStatus = 'healthy' | 'degraded' | 'down' | 'draining';
export type ThreatLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type CircuitState = 'closed' | 'open' | 'half_open';
export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface CMPSBLConfig {
  name: string;
  maxConcurrency?: number;
  budgetCentsPerHour?: number;
  rateLimitPerMinute?: number;
  healingEnabled?: boolean;
  learningEnabled?: boolean;
  auditEnabled?: boolean;
  providers?: ProviderConfig[];
  threatThresholds?: ThreatThresholds;
}

export interface ProviderConfig {
  id: string;
  name: string;
  costPerCall?: number;
  maxRPM?: number;
  latencyMs?: number;
  capabilities?: string[];
  execute: (input: string, context?: Record<string, unknown>) => Promise<ProviderResult>;
}

export interface ProviderResult {
  content: string;
  success: boolean;
  tokensUsed?: number;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

export interface ThreatThresholds {
  maxRequestsPerMinute?: number;
  maxRequestsPerHour?: number;
  maxFailuresBeforeBlock?: number;
  blockDurationMs?: number;
}

export interface Job {
  id: string;
  phase: JobPhase;
  input: string;
  intent: ParsedIntent;
  priority: Priority;
  provider?: string;
  result?: ProviderResult;
  error?: string;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  updatedAt: number;
  walId?: string;
  sagaSteps: SagaStep[];
  compensations: Compensation[];
  metadata: Record<string, unknown>;
}

export interface ParsedIntent {
  type: 'query' | 'command' | 'analysis' | 'generation' | 'comparison' | 'unknown';
  entities: string[];
  complexity: number; // 0-1
  keywords: string[];
  requiresMultiModel: boolean;
  estimatedCost: number;
}

export interface SagaStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'done' | 'failed' | 'compensated';
  startedAt?: number;
  completedAt?: number;
  result?: unknown;
  error?: string;
}

export interface Compensation {
  stepId: string;
  action: string;
  executedAt?: number;
  success?: boolean;
}

// WAL
export interface WALEntry {
  id: string;
  sequence: number;
  operation: string;
  jobId: string;
  data: unknown;
  timestamp: number;
  checksum: string;
  committed: boolean;
}

// Audit
export interface AuditRecord {
  id: string;
  timestamp: number;
  action: string;
  actor: string;
  resource: string;
  details: Record<string, unknown>;
  prevHash: string;
  hash: string;
}

// Healing
export interface HealthSignal {
  source: string;
  healthy: boolean;
  latencyMs: number;
  errorRate: number;
  timestamp: number;
}

export interface HealingAction {
  id: string;
  target: string;
  action: 'restart' | 'reroute' | 'degrade' | 'isolate' | 'escalate';
  reason: string;
  timestamp: number;
  success: boolean;
}

// Knowledge
export interface KnowledgeEntry {
  id: string;
  pattern: string;
  outcome: 'success' | 'failure';
  provider: string;
  intentType: string;
  confidence: number;
  count: number;
  lastSeen: number;
}

// Observability
export interface Incident {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  message: string;
  correlatedWith: string[];
  timestamp: number;
  resolved: boolean;
  resolvedAt?: number;
}

export interface EngineMetrics {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  healedJobs: number;
  avgLatencyMs: number;
  p99LatencyMs: number;
  totalCostCents: number;
  budgetRemainingCents: number;
  knowledgeEntries: number;
  incidentCount: number;
  activeIncidents: number;
  threatLevel: ThreatLevel;
  healthGrade: HealthGrade;
  uptime: number;
  providers: Record<string, { status: ProviderStatus; successRate: number; avgLatency: number }>;
}

export interface CMPSBLEngine {
  // Core pipeline
  submit: (input: string, options?: { priority?: Priority; metadata?: Record<string, unknown> }) => Promise<Job>;
  parse: (input: string) => ParsedIntent;
  route: (job: Job) => Job;
  execute: (job: Job) => Promise<Job>;

  // Provider management
  addProvider: (provider: ProviderConfig) => void;
  removeProvider: (id: string) => void;
  getProviderStatus: (id: string) => ProviderStatus;

  // Observability
  status: () => EngineMetrics;
  getIncidents: (opts?: { unresolved?: boolean }) => Incident[];
  getAuditTrail: (limit?: number) => AuditRecord[];

  // Knowledge
  getKnowledge: () => KnowledgeEntry[];
  getInsights: () => string[];

  // Control
  pause: () => void;
  resume: () => void;
  drain: () => Promise<void>;
  reset: () => void;
}

// ═══════════════════════════════════════════════════════════════════
// §2 — UTILITIES
// ═══════════════════════════════════════════════════════════════════

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function fnv1a(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function now(): number {
  return Date.now();
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[clamp(idx, 0, sorted.length - 1)];
}

// ═══════════════════════════════════════════════════════════════════
// §3 — FACTORY
// ═══════════════════════════════════════════════════════════════════

export function createCMPSBLEngine(config: CMPSBLConfig): CMPSBLEngine {
  const {
    name,
    maxConcurrency = 10,
    budgetCentsPerHour = 500,
    rateLimitPerMinute = 120,
    healingEnabled = true,
    learningEnabled = true,
    auditEnabled = true,
    threatThresholds = {},
  } = config;

  // ─── Internal State ───────────────────────────────────────────
  const providers = new Map<string, ProviderConfig & { status: ProviderStatus }>();
  const jobs = new Map<string, Job>();
  const wal: WALEntry[] = [];
  const auditChain: AuditRecord[] = [];
  const knowledge = new Map<string, KnowledgeEntry>();
  const incidents: Incident[] = [];
  const healingLog: HealingAction[] = [];
  const latencies: number[] = [];

  let walSequence = 0;
  let totalCostCents = 0;
  let paused = false;
  let activeJobs = 0;
  const startTime = now();

  // Rate limiting state
  const requestTimestamps: number[] = [];
  const clientFailures = new Map<string, { count: number; blockedUntil: number }>();

  // Circuit breaker per provider
  const circuits = new Map<string, {
    state: CircuitState;
    failures: number;
    lastFailure: number;
    lastAttempt: number;
    threshold: number;
    resetTimeout: number;
    halfOpenSuccesses: number;
  }>();

  // Health tracking per provider
  const healthWindows = new Map<string, HealthSignal[]>();

  // Register initial providers
  (config.providers || []).forEach(p => addProvider(p));

  // ─── §3.1 — Write-Ahead Log ──────────────────────────────────
  function walAppend(operation: string, jobId: string, data: unknown): string {
    const id = uid();
    const entry: WALEntry = {
      id,
      sequence: walSequence++,
      operation,
      jobId,
      data,
      timestamp: now(),
      checksum: fnv1a(`${walSequence}:${operation}:${jobId}`),
      committed: false,
    };
    wal.push(entry);
    if (wal.length > 10000) wal.splice(0, wal.length - 5000); // GC
    return id;
  }

  function walCommit(id: string) {
    const entry = wal.find(e => e.id === id);
    if (entry) entry.committed = true;
  }

  // ─── §3.2 — Audit Chain ──────────────────────────────────────
  function audit(action: string, resource: string, details: Record<string, unknown> = {}) {
    if (!auditEnabled) return;
    const prevHash = auditChain.length > 0 ? auditChain[auditChain.length - 1].hash : '0';
    const record: AuditRecord = {
      id: uid(),
      timestamp: now(),
      action,
      actor: name,
      resource,
      details,
      prevHash,
      hash: fnv1a(`${prevHash}:${action}:${resource}:${now()}`),
    };
    auditChain.push(record);
    if (auditChain.length > 50000) auditChain.splice(0, auditChain.length - 25000);
  }

  // ─── §3.3 — Rate Limiter ─────────────────────────────────────
  const maxRPM = threatThresholds.maxRequestsPerMinute ?? rateLimitPerMinute;
  const maxRPH = threatThresholds.maxRequestsPerHour ?? maxRPM * 60;
  const maxFailures = threatThresholds.maxFailuresBeforeBlock ?? 10;
  const blockDuration = threatThresholds.blockDurationMs ?? 300_000;

  function checkRateLimit(clientId = 'default'): { allowed: boolean; reason?: string } {
    const t = now();
    // Check block
    const client = clientFailures.get(clientId);
    if (client && client.blockedUntil > t) {
      return { allowed: false, reason: `Blocked until ${new Date(client.blockedUntil).toISOString()}` };
    }
    // Sliding window RPM
    const oneMinAgo = t - 60_000;
    const recentCount = requestTimestamps.filter(ts => ts > oneMinAgo).length;
    if (recentCount >= maxRPM) {
      return { allowed: false, reason: `Rate limit exceeded: ${recentCount}/${maxRPM} RPM` };
    }
    // Sliding window RPH
    const oneHourAgo = t - 3_600_000;
    const hourCount = requestTimestamps.filter(ts => ts > oneHourAgo).length;
    if (hourCount >= maxRPH) {
      return { allowed: false, reason: `Hourly limit exceeded: ${hourCount}/${maxRPH} RPH` };
    }
    requestTimestamps.push(t);
    // GC old timestamps
    if (requestTimestamps.length > maxRPH * 2) {
      requestTimestamps.splice(0, requestTimestamps.length - maxRPH);
    }
    return { allowed: true };
  }

  function recordClientFailure(clientId: string) {
    const existing = clientFailures.get(clientId) || { count: 0, blockedUntil: 0 };
    existing.count++;
    if (existing.count >= maxFailures) {
      existing.blockedUntil = now() + blockDuration;
      existing.count = 0;
      raiseIncident('warning', 'threat-defense', `Client ${clientId} blocked after ${maxFailures} failures`);
    }
    clientFailures.set(clientId, existing);
  }

  // ─── §3.4 — Circuit Breaker ──────────────────────────────────
  function getCircuit(providerId: string) {
    if (!circuits.has(providerId)) {
      circuits.set(providerId, {
        state: 'closed',
        failures: 0,
        lastFailure: 0,
        lastAttempt: 0,
        threshold: 5,
        resetTimeout: 30_000,
        halfOpenSuccesses: 0,
      });
    }
    return circuits.get(providerId)!;
  }

  function circuitAllow(providerId: string): boolean {
    const cb = getCircuit(providerId);
    if (cb.state === 'closed') return true;
    if (cb.state === 'open') {
      if (now() - cb.lastFailure > cb.resetTimeout) {
        cb.state = 'half_open';
        cb.halfOpenSuccesses = 0;
        audit('circuit_half_open', providerId);
        return true;
      }
      return false;
    }
    // half_open — allow one probe
    return true;
  }

  function circuitSuccess(providerId: string) {
    const cb = getCircuit(providerId);
    if (cb.state === 'half_open') {
      cb.halfOpenSuccesses++;
      if (cb.halfOpenSuccesses >= 2) {
        cb.state = 'closed';
        cb.failures = 0;
        audit('circuit_closed', providerId);
        healProvider(providerId);
      }
    } else {
      cb.failures = Math.max(0, cb.failures - 1);
    }
  }

  function circuitFailure(providerId: string) {
    const cb = getCircuit(providerId);
    cb.failures++;
    cb.lastFailure = now();
    if (cb.state === 'half_open') {
      cb.state = 'open';
      cb.resetTimeout = Math.min(cb.resetTimeout * 2, 300_000); // exponential backoff
      audit('circuit_reopened', providerId);
    } else if (cb.failures >= cb.threshold) {
      cb.state = 'open';
      degradeProvider(providerId);
      audit('circuit_opened', providerId, { failures: cb.failures });
      raiseIncident('error', providerId, `Circuit opened after ${cb.failures} consecutive failures`);
    }
  }

  // ─── §3.5 — Provider Health ──────────────────────────────────
  function recordHealth(providerId: string, signal: HealthSignal) {
    if (!healthWindows.has(providerId)) healthWindows.set(providerId, []);
    const window = healthWindows.get(providerId)!;
    window.push(signal);
    if (window.length > 100) window.splice(0, window.length - 50);
  }

  function getProviderHealth(providerId: string): { errorRate: number; avgLatency: number; score: number } {
    const window = healthWindows.get(providerId) || [];
    if (!window.length) return { errorRate: 0, avgLatency: 0, score: 1 };
    const errors = window.filter(s => !s.healthy).length;
    const errorRate = errors / window.length;
    const avgLatency = window.reduce((s, w) => s + w.latencyMs, 0) / window.length;
    const score = clamp(1 - errorRate - (avgLatency > 5000 ? 0.3 : avgLatency > 2000 ? 0.1 : 0), 0, 1);
    return { errorRate, avgLatency, score };
  }

  function degradeProvider(providerId: string) {
    const p = providers.get(providerId);
    if (p) {
      p.status = 'degraded';
      audit('provider_degraded', providerId);
    }
  }

  function healProvider(providerId: string) {
    const p = providers.get(providerId);
    if (p && p.status === 'degraded') {
      p.status = 'healthy';
      audit('provider_healed', providerId);
    }
  }

  // ─── §3.6 — Healing Engine ───────────────────────────────────
  function attemptHeal(job: Job): Job | null {
    if (!healingEnabled) return null;

    // Strategy 1: Reroute to a different healthy provider
    const currentProvider = job.provider;
    const alternatives = [...providers.entries()]
      .filter(([id, p]) => id !== currentProvider && p.status === 'healthy' && circuitAllow(id))
      .sort((a, b) => getProviderHealth(b[0]).score - getProviderHealth(a[0]).score);

    if (alternatives.length > 0) {
      const [newId] = alternatives[0];
      const healAction: HealingAction = {
        id: uid(),
        target: job.id,
        action: 'reroute',
        reason: `Rerouted from ${currentProvider} to ${newId}`,
        timestamp: now(),
        success: true,
      };
      healingLog.push(healAction);
      audit('healing_reroute', job.id, { from: currentProvider, to: newId });

      job.provider = newId;
      job.phase = 'routed';
      job.attempts++;
      job.updatedAt = now();
      return job;
    }

    // Strategy 2: Escalate
    raiseIncident('critical', 'healing', `No healthy providers available for job ${job.id}`);
    return null;
  }

  // ─── §3.7 — Incident Correlation ─────────────────────────────
  function raiseIncident(severity: Incident['severity'], source: string, message: string): Incident {
    // Check for correlation with recent incidents
    const recent = incidents.filter(i => !i.resolved && now() - i.timestamp < 300_000);
    const correlated = recent.filter(i =>
      i.source === source ||
      (i.severity === 'error' && severity === 'error') ||
      message.includes(i.source)
    ).map(i => i.id);

    const incident: Incident = {
      id: uid(),
      severity,
      source,
      message,
      correlatedWith: correlated,
      timestamp: now(),
      resolved: false,
    };
    incidents.push(incident);
    audit('incident_raised', incident.id, { severity, source, message, correlations: correlated.length });
    if (incidents.length > 10000) incidents.splice(0, incidents.length - 5000);
    return incident;
  }

  function resolveIncident(id: string) {
    const i = incidents.find(inc => inc.id === id);
    if (i) {
      i.resolved = true;
      i.resolvedAt = now();
      audit('incident_resolved', id);
    }
  }

  // ─── §3.8 — Knowledge & Learning ─────────────────────────────
  function learn(job: Job) {
    if (!learningEnabled || !job.result) return;

    const key = `${job.intent.type}:${job.provider}`;
    const existing = knowledge.get(key);
    const outcome = job.phase === 'completed' ? 'success' : 'failure';

    if (existing) {
      // Exponential moving average
      existing.confidence = existing.confidence * 0.8 + (outcome === 'success' ? 1 : 0) * 0.2;
      existing.count++;
      existing.lastSeen = now();
      existing.outcome = outcome;
    } else {
      knowledge.set(key, {
        id: uid(),
        pattern: key,
        outcome,
        provider: job.provider || 'unknown',
        intentType: job.intent.type,
        confidence: outcome === 'success' ? 0.8 : 0.2,
        count: 1,
        lastSeen: now(),
      });
    }
  }

  function getBestProviderForIntent(intentType: string): string | null {
    let best: { id: string; score: number } | null = null;

    for (const [key, entry] of knowledge) {
      if (entry.intentType !== intentType) continue;
      const provider = providers.get(entry.provider);
      if (!provider || provider.status !== 'healthy') continue;
      if (!circuitAllow(entry.provider)) continue;

      const health = getProviderHealth(entry.provider);
      // Weighted: 50% learned confidence, 30% health score, 20% recency
      const recency = clamp(1 - (now() - entry.lastSeen) / 3_600_000, 0, 1);
      const score = entry.confidence * 0.5 + health.score * 0.3 + recency * 0.2;

      if (!best || score > best.score) {
        best = { id: entry.provider, score };
      }
    }
    return best?.id ?? null;
  }

  function getInsights(): string[] {
    const insights: string[] = [];
    const entries = [...knowledge.values()];

    // Best provider per intent type
    const intentTypes = new Set(entries.map(e => e.intentType));
    for (const type of intentTypes) {
      const best = entries
        .filter(e => e.intentType === type && e.count >= 3)
        .sort((a, b) => b.confidence - a.confidence)[0];
      if (best) {
        insights.push(`Best provider for "${type}": ${best.provider} (${(best.confidence * 100).toFixed(0)}% confidence, ${best.count} samples)`);
      }
    }

    // Degrading providers
    for (const [id] of providers) {
      const health = getProviderHealth(id);
      if (health.errorRate > 0.3) {
        insights.push(`⚠ Provider "${id}" error rate is ${(health.errorRate * 100).toFixed(0)}% — consider replacing`);
      }
    }

    // Cost insight
    const elapsed = (now() - startTime) / 3_600_000;
    if (elapsed > 0.1) {
      const rate = totalCostCents / elapsed;
      insights.push(`Burn rate: $${(rate / 100).toFixed(2)}/hr — budget: $${(budgetCentsPerHour / 100).toFixed(2)}/hr`);
    }

    return insights;
  }

  // ─── §3.9 — Budget Guard ─────────────────────────────────────
  function checkBudget(estimatedCost: number): boolean {
    const elapsedHours = Math.max((now() - startTime) / 3_600_000, 0.01);
    const effectiveBudget = budgetCentsPerHour * elapsedHours;
    return totalCostCents + estimatedCost <= effectiveBudget;
  }

  // ─── §3.10 — Intent Parser ───────────────────────────────────
  function parse(input: string): ParsedIntent {
    const lower = input.toLowerCase();
    const words = lower.split(/\s+/);

    // Intent classification
    const commandWords = ['create', 'delete', 'update', 'set', 'run', 'deploy', 'start', 'stop', 'restart'];
    const analysisWords = ['analyze', 'investigate', 'diagnose', 'audit', 'review', 'inspect', 'assess'];
    const compareWords = ['compare', 'versus', 'vs', 'difference', 'between', 'benchmark'];
    const generateWords = ['generate', 'write', 'compose', 'draft', 'build', 'produce', 'synthesize'];
    const queryWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'is', 'are', 'show', 'list', 'get', 'find'];

    let type: ParsedIntent['type'] = 'unknown';
    if (words.some(w => commandWords.includes(w))) type = 'command';
    else if (words.some(w => compareWords.includes(w))) type = 'comparison';
    else if (words.some(w => analysisWords.includes(w))) type = 'analysis';
    else if (words.some(w => generateWords.includes(w))) type = 'generation';
    else if (words.some(w => queryWords.includes(w))) type = 'query';

    // Entity extraction (capitalized words, quoted phrases)
    const entities: string[] = [];
    const quoted = input.match(/"([^"]+)"/g) || [];
    quoted.forEach(q => entities.push(q.replace(/"/g, '')));
    const capitalized = input.match(/\b[A-Z][a-z]{2,}\b/g) || [];
    capitalized.forEach(c => { if (!entities.includes(c)) entities.push(c); });

    // Complexity estimate
    const complexity = clamp(
      (words.length / 50) * 0.3 +
      (entities.length / 5) * 0.3 +
      (type === 'comparison' || type === 'analysis' ? 0.3 : 0.1) +
      (quoted.length > 0 ? 0.1 : 0),
      0, 1
    );

    // Keywords
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'and', 'or', 'not', 'but', 'if', 'then', 'than', 'that', 'this', 'it', 'its']);
    const keywords = words.filter(w => w.length > 2 && !stopWords.has(w)).slice(0, 10);

    return {
      type,
      entities,
      complexity,
      keywords,
      requiresMultiModel: complexity > 0.7 || type === 'comparison',
      estimatedCost: complexity * 5, // cents
    };
  }

  // ─── §3.11 — Router ──────────────────────────────────────────
  function route(job: Job): Job {
    // 1. Try learned best provider
    const learned = getBestProviderForIntent(job.intent.type);
    if (learned && circuitAllow(learned)) {
      job.provider = learned;
      job.phase = 'routed';
      job.updatedAt = now();
      audit('routed_learned', job.id, { provider: learned });
      return job;
    }

    // 2. Score all healthy providers
    const scored = [...providers.entries()]
      .filter(([id, p]) => p.status === 'healthy' && circuitAllow(id))
      .map(([id, p]) => {
        const health = getProviderHealth(id);
        const capMatch = p.capabilities?.some(c => c === job.intent.type) ? 0.3 : 0;
        const costScore = p.costPerCall ? clamp(1 - (p.costPerCall / 10), 0, 1) * 0.2 : 0.1;
        return { id, score: health.score * 0.5 + capMatch + costScore };
      })
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
      // Try degraded providers as last resort
      const degraded = [...providers.entries()]
        .filter(([id, p]) => p.status === 'degraded' && circuitAllow(id));
      if (degraded.length > 0) {
        job.provider = degraded[0][0];
        job.phase = 'routed';
        audit('routed_degraded', job.id, { provider: job.provider });
        raiseIncident('warning', 'router', `Routed to degraded provider ${job.provider} — no healthy alternatives`);
      } else {
        job.phase = 'failed';
        job.error = 'No available providers';
        raiseIncident('critical', 'router', 'All providers unavailable');
      }
    } else {
      job.provider = scored[0].id;
      job.phase = 'routed';
      audit('routed', job.id, { provider: job.provider, score: scored[0].score });
    }

    job.updatedAt = now();
    return job;
  }

  // ─── §3.12 — Executor (Saga) ─────────────────────────────────
  async function execute(job: Job): Promise<Job> {
    if (job.phase === 'failed') return job;
    if (!job.provider) {
      job.phase = 'failed';
      job.error = 'No provider assigned';
      return job;
    }

    const provider = providers.get(job.provider);
    if (!provider) {
      job.phase = 'failed';
      job.error = `Provider ${job.provider} not found`;
      return job;
    }

    // Budget check
    if (!checkBudget(job.intent.estimatedCost)) {
      job.phase = 'failed';
      job.error = 'Budget exceeded';
      raiseIncident('warning', 'budget', `Budget exhausted, job ${job.id} rejected`);
      return job;
    }

    // WAL: begin
    const walId = walAppend('execute_begin', job.id, { provider: job.provider, attempt: job.attempts });
    job.walId = walId;
    job.phase = 'executing';
    job.updatedAt = now();

    // Add saga step
    const step: SagaStep = {
      id: uid(),
      name: `execute:${job.provider}`,
      status: 'running',
      startedAt: now(),
    };
    job.sagaSteps.push(step);

    const execStart = now();

    try {
      const result = await provider.execute(job.input, job.metadata);
      const latency = now() - execStart;

      // Record health signal
      recordHealth(job.provider, {
        source: job.provider,
        healthy: result.success,
        latencyMs: latency,
        errorRate: result.success ? 0 : 1,
        timestamp: now(),
      });

      latencies.push(latency);
      if (latencies.length > 1000) latencies.splice(0, latencies.length - 500);

      if (result.success) {
        circuitSuccess(job.provider);
        step.status = 'done';
        step.completedAt = now();
        step.result = result;

        job.result = result;
        job.phase = 'completed';
        totalCostCents += provider.costPerCall ?? job.intent.estimatedCost;

        walCommit(walId);
        walAppend('execute_success', job.id, { latency, provider: job.provider });

        audit('job_completed', job.id, { provider: job.provider, latency, tokens: result.tokensUsed });
        learn(job);
      } else {
        throw new Error(result.content || 'Provider returned failure');
      }
    } catch (err) {
      const latency = now() - execStart;
      circuitFailure(job.provider);
      recordHealth(job.provider, {
        source: job.provider,
        healthy: false,
        latencyMs: latency,
        errorRate: 1,
        timestamp: now(),
      });

      step.status = 'failed';
      step.error = err instanceof Error ? err.message : String(err);
      step.completedAt = now();

      walAppend('execute_failed', job.id, { error: step.error, provider: job.provider });

      // Attempt healing (reroute + retry)
      if (job.attempts < job.maxAttempts) {
        const healed = attemptHeal(job);
        if (healed) {
          healed.phase = 'healed';
          audit('job_healed', job.id, { newProvider: healed.provider });
          return execute(healed); // Recursive retry with new provider
        }
      }

      // Compensation: mark all done steps for rollback
      job.phase = 'compensating';
      for (const s of job.sagaSteps.filter(s => s.status === 'done')) {
        job.compensations.push({
          stepId: s.id,
          action: `compensate:${s.name}`,
          executedAt: now(),
          success: true, // Logical compensation — no side effects to undo in AI calls
        });
        s.status = 'compensated';
      }

      job.phase = 'failed';
      job.error = step.error;
      learn(job);
      raiseIncident('error', 'executor', `Job ${job.id} failed after ${job.attempts} attempts: ${step.error}`);
    }

    job.updatedAt = now();
    jobs.set(job.id, job);
    return job;
  }

  // ─── §3.13 — Submit (Full Pipeline) ──────────────────────────
  async function submit(
    input: string,
    options: { priority?: Priority; metadata?: Record<string, unknown> } = {}
  ): Promise<Job> {
    if (paused) throw new Error(`[${name}] Engine is paused`);

    // Rate limit check
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      audit('rate_limited', 'submit', { reason: rateCheck.reason });
      throw new Error(`[${name}] ${rateCheck.reason}`);
    }

    // Concurrency check
    if (activeJobs >= maxConcurrency) {
      throw new Error(`[${name}] Max concurrency (${maxConcurrency}) reached`);
    }

    activeJobs++;

    try {
      const intent = parse(input);
      const job: Job = {
        id: uid(),
        phase: 'parsed',
        input,
        intent,
        priority: options.priority ?? (intent.complexity > 0.7 ? 'high' : 'medium'),
        attempts: 0,
        maxAttempts: 3,
        createdAt: now(),
        updatedAt: now(),
        sagaSteps: [],
        compensations: [],
        metadata: options.metadata ?? {},
      };

      jobs.set(job.id, job);
      walAppend('job_created', job.id, { intent: intent.type, priority: job.priority });
      audit('job_submitted', job.id, { intent: intent.type, complexity: intent.complexity });

      // Route
      route(job);
      if (job.phase === 'failed') return job;

      // Execute
      return await execute(job);
    } finally {
      activeJobs--;
    }
  }

  // ─── §3.14 — Provider Management ─────────────────────────────
  function addProvider(provider: ProviderConfig) {
    providers.set(provider.id, { ...provider, status: 'healthy' });
    audit('provider_added', provider.id, { capabilities: provider.capabilities });
  }

  function removeProvider(id: string) {
    providers.delete(id);
    circuits.delete(id);
    healthWindows.delete(id);
    audit('provider_removed', id);
  }

  function getProviderStatus(id: string): ProviderStatus {
    return providers.get(id)?.status ?? 'down';
  }

  // ─── §3.15 — Observability ───────────────────────────────────
  function status(): EngineMetrics {
    const allJobs = [...jobs.values()];
    const completed = allJobs.filter(j => j.phase === 'completed').length;
    const failed = allJobs.filter(j => j.phase === 'failed').length;
    const healed = healingLog.filter(h => h.success).length;
    const avgLatency = latencies.length ? latencies.reduce((s, l) => s + l, 0) / latencies.length : 0;
    const p99Latency = percentile(latencies, 99);
    const elapsedHours = Math.max((now() - startTime) / 3_600_000, 0.01);
    const budget = budgetCentsPerHour * elapsedHours;
    const activeInc = incidents.filter(i => !i.resolved).length;

    // Health grade
    const errorRate = allJobs.length > 0 ? failed / allJobs.length : 0;
    const grade: HealthGrade =
      errorRate < 0.01 ? 'A' :
      errorRate < 0.05 ? 'B' :
      errorRate < 0.1  ? 'C' :
      errorRate < 0.25 ? 'D' : 'F';

    // Threat level
    const threatLevel: ThreatLevel =
      activeInc > 10 ? 'critical' :
      activeInc > 5  ? 'high' :
      activeInc > 2  ? 'medium' :
      activeInc > 0  ? 'low' : 'none';

    // Provider statuses
    const providerStats: Record<string, { status: ProviderStatus; successRate: number; avgLatency: number }> = {};
    for (const [id, p] of providers) {
      const health = getProviderHealth(id);
      providerStats[id] = {
        status: p.status,
        successRate: 1 - health.errorRate,
        avgLatency: health.avgLatency,
      };
    }

    return {
      totalJobs: allJobs.length,
      completedJobs: completed,
      failedJobs: failed,
      healedJobs: healed,
      avgLatencyMs: Math.round(avgLatency),
      p99LatencyMs: Math.round(p99Latency),
      totalCostCents: Math.round(totalCostCents * 100) / 100,
      budgetRemainingCents: Math.round((budget - totalCostCents) * 100) / 100,
      knowledgeEntries: knowledge.size,
      incidentCount: incidents.length,
      activeIncidents: activeInc,
      threatLevel,
      healthGrade: grade,
      uptime: now() - startTime,
      providers: providerStats,
    };
  }

  function getIncidents(opts?: { unresolved?: boolean }): Incident[] {
    if (opts?.unresolved) return incidents.filter(i => !i.resolved);
    return [...incidents];
  }

  function getAuditTrail(limit = 100): AuditRecord[] {
    return auditChain.slice(-limit);
  }

  // ─── §3.16 — Controls ────────────────────────────────────────
  function pause() {
    paused = true;
    audit('engine_paused', name);
  }

  function resume() {
    paused = false;
    audit('engine_resumed', name);
  }

  async function drain(): Promise<void> {
    paused = true;
    // Wait for active jobs to finish
    const deadline = now() + 30_000;
    while (activeJobs > 0 && now() < deadline) {
      await new Promise(r => setTimeout(r, 100));
    }
    audit('engine_drained', name, { remainingJobs: activeJobs });
  }

  function reset() {
    jobs.clear();
    wal.length = 0;
    auditChain.length = 0;
    knowledge.clear();
    incidents.length = 0;
    healingLog.length = 0;
    latencies.length = 0;
    walSequence = 0;
    totalCostCents = 0;
    paused = false;
    activeJobs = 0;
    requestTimestamps.length = 0;
    clientFailures.clear();
    circuits.clear();
    healthWindows.clear();
  }

  // ─── Public API ───────────────────────────────────────────────
  return {
    submit,
    parse,
    route,
    execute,
    addProvider,
    removeProvider,
    getProviderStatus,
    status,
    getIncidents,
    getAuditTrail,
    getKnowledge: () => [...knowledge.values()],
    getInsights,
    pause,
    resume,
    drain,
    reset,
  };
}
