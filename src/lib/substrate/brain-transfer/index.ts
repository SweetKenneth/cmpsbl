/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Brain Knowledge Transfer Pipelines — v2.0.0
 * 
 * Universal knowledge transfer system that distills Brain memories
 * into actionable expertise for ALL 13 modules (Brain itself is the source).
 * Each module gets a specialized pipeline that extracts relevant patterns
 * and injects them into hot memory for instant recall.
 * 
 * v2.0.0 — Full Coverage: All 13 non-brain modules + cross-module insight sharing
 * v1.0.0 — Initial: DECODE, DEFENSE, CORTEX, VISION, INCLUSIVE
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type TransferModule = 
  | 'core' | 'ripple' | 'access' | 'nexus' | 'dream' | 'integration'
  | 'system' | 'modernizer' | 'decode' | 'defense' | 'cortex' | 'vision' | 'inclusive';

export interface ModuleTransferConfig {
  module: TransferModule;
  relevanceSignals: string[];
  memoryTypes: string[];
  hotCategoryPrefix: string;
  hotCacheLimit: number;
  minConfidence: number;
}

export interface TransferBatch {
  module: TransferModule;
  transferred: number;
  enriched: number;
  skipped: number;
  errors: number;
  duration_ms: number;
}

export interface ModuleKnowledgeReport {
  module: TransferModule;
  hot_patterns: number;
  total_memories: number;
  avg_confidence: number;
  top_categories: string[];
  last_transfer: string | null;
}

export interface CrossModuleInsight {
  source_module: TransferModule;
  target_modules: TransferModule[];
  insight: string;
  confidence: number;
  category: string;
}

export interface EvolutionConfidence {
  module: TransferModule;
  reliability_score: number;
  success_rate: number;
  total_changes: number;
  failed_changes: number;
  avg_impact: number;
  trend: 'improving' | 'stable' | 'declining';
}

// ═══════════════════════════════════════════════════════════════
// MODULE CONFIGS — ALL 13 MODULES
// ═══════════════════════════════════════════════════════════════

const MODULE_CONFIGS: Record<TransferModule, ModuleTransferConfig> = {
  // ── Kernel Layer ──
  core: {
    module: 'core',
    relevanceSignals: [
      'memory', 'storage', 'persistence', 'state', 'cache', 'retrieve',
      'store', 'query', 'index', 'search', 'consolidation', 'compression',
      'recall', 'context', 'embedding', 'vector', 'knowledge graph',
      'batch', 'bulk', 'optimization', 'deduplication',
    ],
    memoryTypes: ['learned', 'heuristic', 'pattern', 'system'],
    hotCategoryPrefix: 'core_transfer',
    hotCacheLimit: 80,
    minConfidence: 0.5,
  },
  ripple: {
    module: 'ripple',
    relevanceSignals: [
      'event', 'propagation', 'broadcast', 'publish', 'subscribe', 'listener',
      'trigger', 'cascade', 'chain', 'notification', 'webhook', 'queue',
      'message', 'bus', 'emit', 'dispatch', 'handler', 'async', 'stream',
      'real-time', 'realtime', 'pubsub',
    ],
    memoryTypes: ['learned', 'heuristic', 'pattern', 'system'],
    hotCategoryPrefix: 'ripple_transfer',
    hotCacheLimit: 50,
    minConfidence: 0.5,
  },
  access: {
    module: 'access',
    relevanceSignals: [
      'permission', 'role', 'rbac', 'authorization', 'authentication', 'api key',
      'token', 'scope', 'quota', 'subscription', 'tier', 'billing', 'usage',
      'developer', 'tenant', 'multi-tenant', 'access control', 'privilege',
      'entitlement', 'rate limit', 'throttle',
    ],
    memoryTypes: ['learned', 'heuristic', 'pattern', 'security'],
    hotCategoryPrefix: 'access_transfer',
    hotCacheLimit: 60,
    minConfidence: 0.6,
  },

  // ── Cognitive Layer ──
  decode: {
    module: 'decode',
    relevanceSignals: [
      'response', 'conversation', 'chat', 'personality', 'tone', 'user',
      'greeting', 'farewell', 'clarification', 'empathy', 'context',
      'question', 'answer', 'support', 'help', 'explain', 'summarize',
      'format', 'markdown', 'template', 'message',
    ],
    memoryTypes: ['learned', 'heuristic', 'pattern', 'interaction'],
    hotCategoryPrefix: 'decode_transfer',
    hotCacheLimit: 100,
    minConfidence: 0.5,
  },
  nexus: {
    module: 'nexus',
    relevanceSignals: [
      'routing', 'provider', 'model', 'fallback', 'load balance', 'latency',
      'cost', 'quality', 'selection', 'health check', 'failover', 'retry',
      'timeout', 'circuit breaker', 'provider health', 'model selection',
      'inference', 'generation', 'completion', 'token',
    ],
    memoryTypes: ['learned', 'heuristic', 'pattern', 'routing'],
    hotCategoryPrefix: 'nexus_transfer',
    hotCacheLimit: 60,
    minConfidence: 0.5,
  },
  dream: {
    module: 'dream',
    relevanceSignals: [
      'dream', 'synthesis', 'creative', 'imagination', 'generative', 'novel',
      'insight', 'pattern synthesis', 'cross-pollination', 'serendipity',
      'associative', 'lateral thinking', 'brainstorm', 'hypothesis',
      'exploration', 'mutation', 'recombination', 'surprise',
    ],
    memoryTypes: ['learned', 'heuristic', 'pattern', 'dream'],
    hotCategoryPrefix: 'dream_transfer',
    hotCacheLimit: 50,
    minConfidence: 0.4,
  },

  // ── Operational Layer ──
  defense: {
    module: 'defense',
    relevanceSignals: [
      'security', 'threat', 'attack', 'vulnerability', 'exploit', 'injection',
      'xss', 'csrf', 'auth', 'permission', 'rate limit', 'anomaly', 'bot',
      'fingerprint', 'ip', 'reputation', 'firewall', 'perimeter', 'scan',
      'malicious', 'suspicious', 'block', 'challenge', 'abuse', 'brute',
    ],
    memoryTypes: ['learned', 'heuristic', 'pattern', 'alert'],
    hotCategoryPrefix: 'defense_transfer',
    hotCacheLimit: 80,
    minConfidence: 0.6,
  },
  vision: {
    module: 'vision',
    relevanceSignals: [
      'trace', 'diagnostic', 'observability', 'metric', 'log', 'monitor',
      'alert', 'latency', 'error rate', 'throughput', 'health', 'status',
      'anomaly', 'baseline', 'threshold', 'dashboard', 'telemetry',
      'span', 'correlation', 'root cause', 'debug',
    ],
    memoryTypes: ['learned', 'heuristic', 'pattern', 'diagnostic'],
    hotCategoryPrefix: 'vision_transfer',
    hotCacheLimit: 50,
    minConfidence: 0.5,
  },
  integration: {
    module: 'integration',
    relevanceSignals: [
      'webhook', 'api', 'endpoint', 'transform', 'pipeline', 'data sync',
      'migration', 'import', 'export', 'connector', 'adapter', 'mapping',
      'schema', 'protocol', 'rest', 'graphql', 'grpc', 'serialization',
      'deserialization', 'payload', 'format', 'conversion',
    ],
    memoryTypes: ['learned', 'heuristic', 'pattern', 'integration'],
    hotCategoryPrefix: 'integration_transfer',
    hotCacheLimit: 50,
    minConfidence: 0.5,
  },

  // ── Administrative Layer ──
  system: {
    module: 'system',
    relevanceSignals: [
      'health', 'audit', 'configuration', 'settings', 'admin', 'governance',
      'policy', 'compliance', 'registry', 'capability', 'feature flag',
      'maintenance', 'backup', 'restore', 'migration', 'version',
      'deployment', 'environment', 'infra', 'bootstrap',
    ],
    memoryTypes: ['learned', 'heuristic', 'pattern', 'system'],
    hotCategoryPrefix: 'system_transfer',
    hotCacheLimit: 60,
    minConfidence: 0.5,
  },
  modernizer: {
    module: 'modernizer',
    relevanceSignals: [
      'upgrade', 'evolution', 'modernize', 'refactor', 'migrate', 'diff',
      'delta', 'improvement', 'optimization', 'performance', 'regression',
      'shadow', 'production', 'rollback', 'deploy', 'release', 'version',
      'breaking change', 'compatibility', 'deprecation', 'plan',
    ],
    memoryTypes: ['learned', 'heuristic', 'pattern', 'evolution'],
    hotCategoryPrefix: 'modernizer_transfer',
    hotCacheLimit: 70,
    minConfidence: 0.6,
  },
  inclusive: {
    module: 'inclusive',
    relevanceSignals: [
      'accessibility', 'a11y', 'wcag', 'aria', 'screen reader', 'keyboard',
      'focus', 'contrast', 'alt text', 'semantic', 'landmark', 'heading',
      'label', 'role', 'tabindex', 'skip link', 'live region',
      'color blind', 'dyslexia', 'motor', 'cognitive',
    ],
    memoryTypes: ['learned', 'heuristic', 'pattern', 'remediation'],
    hotCategoryPrefix: 'inclusive_transfer',
    hotCacheLimit: 60,
    minConfidence: 0.5,
  },

  // ── Orchestrator Layer ──
  cortex: {
    module: 'cortex',
    relevanceSignals: [
      'architecture', 'design', 'pattern', 'proposal', 'refactor', 'structure',
      'module', 'component', 'service', 'dependency', 'coupling', 'cohesion',
      'abstraction', 'interface', 'layer', 'pipeline', 'orchestration',
      'scalability', 'maintainability', 'separation', 'solid',
    ],
    memoryTypes: ['learned', 'heuristic', 'pattern', 'proposal'],
    hotCategoryPrefix: 'cortex_transfer',
    hotCacheLimit: 60,
    minConfidence: 0.6,
  },
};

// ═══════════════════════════════════════════════════════════════
// CURATED EXPERT PATTERNS — ALL MODULES
// ═══════════════════════════════════════════════════════════════

const CORE_PATTERNS = [
  { title: 'Memory Tiering Strategy', content: 'Use 3-tier memory: hot (instant recall, <50ms), warm (brain_memories, <200ms), cold (archived, <1s). Promote on access frequency: 3+ accesses in 1hr → hot. Demote after 24hr idle.', priority: 95 },
  { title: 'Query Optimization', content: 'Always use indexed columns in WHERE clauses. For text search, prefer full-text search (FTS) over ILIKE. Batch reads into single queries with IN() clauses. Never SELECT * in production.', priority: 93 },
  { title: 'Memory Consolidation', content: 'Run consolidation every 6 hours: merge duplicate memories (>80% content overlap), increase confidence of confirmed patterns, archive stale memories (>30 days no access).', priority: 90 },
  { title: 'Context Window Management', content: 'Limit context injection to most relevant 8 memories. Score relevance = (confidence × recency_decay × access_frequency). Truncate content to 500 chars per memory for prompt efficiency.', priority: 92 },
  { title: 'Deduplication Strategy', content: 'Before storing new memories, check for duplicates using first-40-char prefix match + category match. Merge by incrementing confidence and updating metadata rather than creating duplicates.', priority: 88 },
  { title: 'Batch Operations', content: 'Group memory operations into batches of 50. Use upsert with ON CONFLICT for idempotency. Log batch outcomes to brain_events for audit trail.', priority: 85 },
];

const RIPPLE_PATTERNS = [
  { title: 'Event Ordering Guarantees', content: 'Use monotonic timestamps (Date.now()) for event ordering. When processing cascading events, maintain a seen-set to prevent infinite loops. Max cascade depth = 5.', priority: 94 },
  { title: 'Fan-out Control', content: 'Limit event fan-out to 10 subscribers per event type. Priority subscribers process first. If fan-out exceeds limit, queue lower-priority handlers for batch processing.', priority: 90 },
  { title: 'Dead Letter Queue', content: 'Failed event handlers retry 3x with exponential backoff (100ms, 500ms, 2s). After 3 failures, move to dead letter queue for manual inspection. Never silently drop events.', priority: 93 },
  { title: 'Event Schema Versioning', content: 'Every event must include a version field. Handlers must tolerate unknown fields (forward compatibility). Breaking changes require a new event type, not a version bump.', priority: 88 },
  { title: 'Idempotent Handlers', content: 'All event handlers must be idempotent. Use event ID + handler ID as deduplication key. Store processed event IDs for 24 hours to catch replays.', priority: 96 },
  { title: 'Cross-Module Event Contracts', content: 'Events crossing module boundaries must use the canonical event schema: { module, event_type, data, timestamp, trace_id }. Never expose internal state in cross-module events.', priority: 91 },
];

const ACCESS_PATTERNS = [
  { title: 'API Key Rotation Protocol', content: 'API keys should rotate every 90 days. Provide 7-day overlap window where both old and new keys work. Log key usage to detect abandoned keys for cleanup.', priority: 94 },
  { title: 'Quota Enforcement Strategy', content: 'Check quota at request entry (fail fast). Use atomic increment with RETURNING to prevent race conditions. Cache remaining quota for 60s to reduce DB hits. Hard-block at 100%, warn at 80%.', priority: 96 },
  { title: 'RBAC Hierarchy', content: 'Roles inherit permissions upward: viewer < editor < admin < owner. Check permissions with hasPermission(role, action) that traverses the hierarchy. Cache role lookups for 5 minutes.', priority: 93 },
  { title: 'Token Validation Chain', content: 'Validate tokens in order: 1) Format check (JWT structure), 2) Signature verification, 3) Expiry check, 4) Scope validation, 5) Rate limit check. Short-circuit on first failure.', priority: 97 },
  { title: 'Multi-Tenant Isolation', content: 'Every query MUST include tenant/developer_id filter. Use RLS policies as the last line of defense. Never trust client-provided tenant IDs — derive from authenticated token.', priority: 98 },
  { title: 'Usage Analytics Pipeline', content: 'Log every API call with: developer_id, module, action, tokens_used, compute_ms, cost_millicents. Aggregate daily for quota tracking. Use this data for pricing optimization.', priority: 85 },
];

const NEXUS_PATTERNS = [
  { title: 'Provider Health Scoring', content: 'Score providers 0-100 based on: success_rate (40%), p50_latency (25%), p99_latency (15%), cost_efficiency (10%), capability_match (10%). Re-score every 60s. Route to highest score.', priority: 95 },
  { title: 'Intelligent Fallback Chain', content: 'Primary → Secondary → Tertiary fallback with timeout escalation: 5s → 8s → 15s. On primary failure, immediately try secondary (no delay). Log fallback events for provider reliability tracking.', priority: 93 },
  { title: 'Cost-Aware Routing', content: 'For non-urgent tasks (batch, background), prefer cheapest healthy provider. For real-time (chat, streaming), prefer fastest. Calculate cost/quality ratio and select within acceptable band.', priority: 90 },
  { title: 'Model Selection Heuristics', content: 'Match task complexity to model size: simple classification → small model, reasoning → medium, creative/complex → large. Over-provisioning wastes budget; under-provisioning wastes retries.', priority: 92 },
  { title: 'Request Deduplication', content: 'Hash (prompt + model + temperature) as cache key. Cache successful responses for 5 minutes. Identical concurrent requests should await the first result rather than duplicate calls.', priority: 88 },
  { title: 'Streaming Response Handling', content: 'For streaming responses, set up heartbeat detection (no chunk for >10s = stale). Accumulate chunks with backpressure. If stream fails mid-way, retry from scratch with higher timeout.', priority: 86 },
];

const DREAM_PATTERNS = [
  { title: 'Creative Synthesis Protocol', content: 'Combine 3 unrelated memory fragments to generate novel insights. Score novelty by checking if the synthesis exists in brain_memories. High novelty (>0.7) + high confidence (>0.6) = valuable dream.', priority: 92 },
  { title: 'Pattern Mutation Strategy', content: 'Take successful patterns and apply controlled mutations: swap a component, change a parameter, combine with another domain\'s approach. Test mutated patterns in shadow before promoting.', priority: 88 },
  { title: 'Serendipity Engine', content: 'Periodically (every 4 hours) fetch 5 random memories from different modules and attempt cross-pollination. Even failed attempts are valuable — log them as "explored dead-ends" to avoid re-exploring.', priority: 85 },
  { title: 'Dream Quality Scoring', content: 'Score dreams on: novelty (is it new?), coherence (does it make sense?), actionability (can we act on it?), and relevance (does it serve a module?). Only persist dreams scoring >0.5 overall.', priority: 90 },
  { title: 'Insight Extraction', content: 'After each dream cycle, extract 1-3 key insights and classify them: improvement (existing gets better), discovery (new capability), or warning (potential issue). Route each type differently.', priority: 93 },
  { title: 'Cross-Domain Association', content: 'Build association maps between modules: when DEFENSE learns a pattern, check if it applies to ACCESS. When VISION detects an anomaly pattern, check if DREAM has synthesized a similar one.', priority: 87 },
];

const INTEGRATION_PATTERNS = [
  { title: 'Webhook Reliability', content: 'Implement webhook delivery with: signature verification (HMAC-SHA256), retry with exponential backoff (3 attempts), idempotency keys, and delivery receipts. Log all delivery attempts.', priority: 95 },
  { title: 'Data Transform Pipeline', content: 'Build transforms as composable steps: validate → normalize → enrich → format. Each step is independently testable. Failed steps produce partial results with error annotations, never crash the pipeline.', priority: 92 },
  { title: 'Schema Mapping Strategy', content: 'Use explicit field mappings stored as JSON configs, not hardcoded transforms. Support type coercion (string→number, date parsing). Log unmapped fields as warnings for future mapping updates.', priority: 88 },
  { title: 'External API Circuit Breaker', content: 'Track external API health per-endpoint. Open circuit after 5 failures in 60s. Half-open after 30s (allow 1 test request). Close on success. Share circuit state across all callers.', priority: 94 },
  { title: 'Data Sync Conflict Resolution', content: 'Use last-write-wins with vector clocks for conflict resolution. Log conflicts for manual review. For critical data, use optimistic locking with version fields.', priority: 90 },
  { title: 'Rate-Respecting Clients', content: 'Parse X-RateLimit-Remaining and Retry-After headers from external APIs. Pre-emptively throttle when remaining < 10%. Queue excess requests rather than hitting limits.', priority: 91 },
];

const SYSTEM_PATTERNS = [
  { title: 'Health Check Composition', content: 'System health = min(critical_module_healths). A single critical module at 0% makes system health 0%. Non-critical modules use weighted average. Check every 30s, alert on <70%.', priority: 96 },
  { title: 'Configuration Hot-Reload', content: 'Store config in atlas_capabilities table. Cache locally with 60s TTL. On config change, emit ripple event for immediate invalidation. Never require restart for config changes.', priority: 90 },
  { title: 'Audit Trail Completeness', content: 'Every state-changing operation must log: who (user/system), what (action), when (timestamp), where (module), why (trigger), and how (method). Store in audit_logs with 90-day retention.', priority: 95 },
  { title: 'Capability Registry Management', content: 'Each capability has: key, enabled flag, metadata, and dependencies. Before enabling, check all dependencies are enabled. Before disabling, warn about dependents. Use dependency graph for safe ordering.', priority: 92 },
  { title: 'Graceful Degradation', content: 'When a module fails, the system should degrade gracefully: disable the module\'s features, log the failure, and continue operating. Never let one module crash the entire system.', priority: 97 },
  { title: 'Bootstrap Ordering', content: 'Boot modules in dependency order: Kernel (1-3) → Cognitive (4-6) → Operational (7-10) → Administrative (11-13) → Orchestrator (14). Each module reports ready before next tier starts.', priority: 88 },
];

const MODERNIZER_PATTERNS = [
  { title: 'Shadow Testing Protocol', content: 'Every evolution must run in shadow first. Compare shadow metrics against production baseline for 5 minutes. Only promote if: no regressions, error rate delta < 1%, latency delta < 10%.', priority: 97 },
  { title: 'Rollback Readiness', content: 'Before applying any change, snapshot the current state (file hash, config values, DB schema). Store rollback instructions as executable steps. Test rollback in shadow before production.', priority: 96 },
  { title: 'Diff Quality Assessment', content: 'Score diffs on: lines changed vs lines affected (blast radius), number of files touched (fragmentation), test coverage of changed code, and dependency impact depth.', priority: 90 },
  { title: 'Evolution Velocity Control', content: 'Max 3 evolution runs per day. Minimum 2-hour gap between production deployments. Emergency fixes bypass velocity limits but require 2x audit depth.', priority: 93 },
  { title: 'Regression Detection', content: 'After every evolution, run regression suite: health checks, latency benchmarks, error rate comparison. If any metric degrades >5%, auto-rollback and flag for investigation.', priority: 95 },
  { title: 'Change Ledger Discipline', content: 'Every change must be recorded in change_ledger with: before/after metrics, affected components, trigger (manual/seba/auto), and expected vs actual impact for future learning.', priority: 91 },
  { title: 'Incremental Upgrade Strategy', content: 'Large upgrades must be decomposed into steps of ≤20% system impact each. Each step is independently deployable and rollback-able. Chain steps with dependency gates.', priority: 94 },
];

const DECODE_PATTERNS = [
  { title: 'Contextual Memory Recall', content: 'Always check conversation history before responding. Use brain_memory_hot for recent context, brain_memories for long-term knowledge. Never answer without context lookup.', priority: 95 },
  { title: 'Adaptive Tone Matching', content: 'Match the user\'s formality level. Technical users get concise, jargon-appropriate responses. Casual users get friendly, approachable language. Detect from first 2 messages.', priority: 90 },
  { title: 'Structured Response Templates', content: 'For complex answers use: 1) Brief summary (1 line), 2) Detailed explanation, 3) Action items or next steps. For simple questions, just answer directly.', priority: 88 },
  { title: 'Graceful Uncertainty Handling', content: 'When confidence is below 0.6, explicitly state uncertainty level. Offer to search for more information. Never fabricate facts — admit knowledge gaps honestly.', priority: 92 },
  { title: 'Multi-turn Context Threading', content: 'Track conversation threads across multiple messages. Use cascade_conversations for session continuity. Summarize and persist every 5th exchange for long-term retention.', priority: 87 },
  { title: 'Domain-Specific Vocabulary', content: 'Maintain per-user vocabulary preferences. If a user says "edge functions" vs "serverless functions", mirror their terminology. Store preferences in metadata.', priority: 82 },
  { title: 'Error Recovery Responses', content: 'When a previous response was incorrect or unhelpful, acknowledge it directly. "I gave you incorrect information about X. Here\'s the accurate answer..." builds trust.', priority: 93 },
  { title: 'Proactive Suggestions', content: 'After answering, offer 1-2 related suggestions: "You might also want to..." Based on similar queries from brain_memories pattern matching.', priority: 80 },
];

const DEFENSE_PATTERNS = [
  { title: 'SQL Injection Detection', content: 'Detect SQL injection patterns: UNION SELECT, OR 1=1, DROP TABLE, -- comment terminators, hex-encoded payloads. Apply at API boundary before any query construction.', priority: 98 },
  { title: 'Rate Limit Escalation', content: 'Implement progressive rate limiting: 60rpm normal → 30rpm warning → 10rpm throttle → block. Each tier doubles cooldown. Track per-IP and per-API-key independently.', priority: 95 },
  { title: 'Bot Fingerprinting', content: 'Score requests 0-100 based on: User-Agent family, TLS fingerprint, request timing variance, header order, and behavioral patterns. Score <30 = likely bot.', priority: 90 },
  { title: 'Anomaly Z-Score Detection', content: 'Maintain rolling 1-hour baselines for request volume, error rates, and unique IPs. Flag Z-scores >2.5 as anomalies. Auto-escalate Z>4 to enforcement mode.', priority: 93 },
  { title: 'Input Sanitization Boundaries', content: 'Apply Zod validation at every API boundary. Strip HTML tags from text inputs. Reject payloads >1MB. Validate content-type headers match actual content.', priority: 96 },
  { title: 'Privilege Escalation Detection', content: 'Monitor for auth token manipulation: modified JWTs, role claim injection, expired token reuse. Compare token claims against database roles on every protected route.', priority: 97 },
  { title: 'Behavioral Pattern Matching', content: 'Track per-session action sequences. Flag unusual patterns: rapid endpoint scanning, sequential ID enumeration, form submission without prior page load.', priority: 88 },
  { title: 'Defense Event Correlation', content: 'Correlate defense events across time windows. Single anomaly = log. 3 anomalies in 5min from same source = investigate. 5+ = auto-challenge/block.', priority: 91 },
];

const CORTEX_PATTERNS = [
  { title: 'Module Boundary Enforcement', content: 'Each module must have a single entry point (index.ts), expose only typed interfaces, and communicate via the substrate singleton. No direct cross-module imports of internal files.', priority: 92 },
  { title: 'Proposal Quality Scoring', content: 'Score proposals on 5 axes: feasibility (can we build it?), impact (does it matter?), risk (what could break?), cost (how much effort?), reversibility (can we undo it?). Min 3/5 to proceed.', priority: 90 },
  { title: 'Dependency Graph Analysis', content: 'Before proposing changes, map the dependency graph. Changes to highly-connected nodes (>5 dependents) require shadow testing. Leaf nodes can be changed more freely.', priority: 88 },
  { title: 'Incremental Refactoring', content: 'Break large refactors into chains of small, independently-verifiable steps. Each step must leave the system in a working state. Max 20% file change per step.', priority: 94 },
  { title: 'Architecture Decision Records', content: 'Every significant decision must be recorded: what was decided, why, what alternatives were considered, and what trade-offs were accepted. Store in brain_memories as heuristic.', priority: 86 },
  { title: 'Service Composition Patterns', content: 'Prefer composition over inheritance. Build complex behaviors by composing simple, focused services. Each service should do one thing excellently.', priority: 85 },
];

const VISION_PATTERNS = [
  { title: 'Error Cascade Detection', content: 'When error rate spikes, trace backwards through the dependency chain. The root cause is usually 2-3 hops upstream from where errors are observed. Check the earliest timestamp.', priority: 93 },
  { title: 'Latency Budgets', content: 'Allocate latency budgets: API total ≤200ms, DB query ≤50ms, external call ≤100ms, render ≤50ms. Alert when any component exceeds 150% of budget.', priority: 90 },
  { title: 'Health Score Composition', content: 'System health = weighted average: uptime (30%), error rate (25%), latency p99 (20%), memory usage (15%), active connections (10%). Update every 60s.', priority: 88 },
  { title: 'Diagnostic Breadcrumbs', content: 'Add structured breadcrumbs at decision points: module entry, external calls, state changes, error catches. Include: timestamp, module, action, and relevant context.', priority: 85 },
  { title: 'Baseline Drift Detection', content: 'Maintain 7-day rolling baselines for all key metrics. Alert on sustained drift (>10% shift over 24h) even if no spike occurs. Gradual degradation is harder to spot than crashes.', priority: 91 },
];

const INCLUSIVE_PATTERNS = [
  { title: 'Focus Management', content: 'After dynamic content changes (modals, notifications, route changes), move focus to the new content. Use tabIndex={-1} on the container and call .focus() programmatically.', priority: 94 },
  { title: 'ARIA Live Regions', content: 'Use aria-live="polite" for non-urgent updates (data loaded, form saved) and aria-live="assertive" for critical alerts (errors, session expiry). Never use both on the same element.', priority: 92 },
  { title: 'Color Contrast Auto-Fix', content: 'Minimum contrast ratios: 4.5:1 for normal text, 3:1 for large text (18px+ or 14px+ bold). For auto-fix, darken foreground or lighten background by smallest increment needed.', priority: 96 },
  { title: 'Keyboard Navigation Patterns', content: 'All interactive elements must be keyboard accessible. Custom widgets need arrow key navigation (roving tabindex), Escape to close, Enter/Space to activate. Test with Tab key only.', priority: 95 },
  { title: 'Semantic HTML Priority', content: 'Use native HTML elements first: <button> not <div onClick>, <nav> not <div class="nav">, <main> not <div id="content">. Native elements get free keyboard + screen reader support.', priority: 93 },
  { title: 'Alternative Text Strategy', content: 'Decorative images: alt="". Informative images: describe content, not appearance. Functional images (links/buttons): describe the action. Complex images: use aria-describedby with longer description.', priority: 90 },
  { title: 'Skip Link Implementation', content: 'Add a skip link as the first focusable element: <a href="#main-content" class="sr-only focus:not-sr-only">Skip to content</a>. Target must have tabIndex={-1} and id="main-content".', priority: 88 },
];

// ═══════════════════════════════════════════════════════════════
// CROSS-MODULE INSIGHT ROUTING
// ═══════════════════════════════════════════════════════════════

/**
 * Maps which modules' insights are relevant to which other modules.
 * When module A learns something, it can be automatically shared with related modules.
 */
const CROSS_MODULE_ROUTES: Record<TransferModule, TransferModule[]> = {
  core:         ['brain', 'vision', 'system'] as any,
  ripple:       ['cortex', 'integration', 'vision'],
  access:       ['defense', 'system', 'integration'],
  decode:       ['dream', 'inclusive', 'cortex'] as any,
  nexus:        ['vision', 'defense', 'system'],
  dream:        ['cortex', 'modernizer', 'decode'] as any,
  defense:      ['access', 'vision', 'system'],
  vision:       ['defense', 'system', 'modernizer'],
  integration:  ['ripple', 'access', 'nexus'],
  system:       ['vision', 'cortex', 'modernizer'],
  modernizer:   ['cortex', 'system', 'vision'],
  inclusive:    ['decode', 'modernizer', 'vision'] as any,
  cortex:       ['modernizer', 'system', 'dream'] as any,
};

/**
 * Broadcast an insight from one module to all related modules
 */
export async function broadcastInsight(insight: CrossModuleInsight): Promise<{
  delivered_to: TransferModule[];
  errors: number;
}> {
  const targets = insight.target_modules.length > 0
    ? insight.target_modules
    : CROSS_MODULE_ROUTES[insight.source_module] || [];

  const delivered: TransferModule[] = [];
  let errors = 0;

  for (const target of targets) {
    try {
      const config = MODULE_CONFIGS[target];
      if (!config) continue;

      await supabase.from('brain_memory_hot').insert({
        content: `[CROSS_MODULE:${insight.source_module.toUpperCase()}→${target.toUpperCase()}] ${insight.insight}`,
        context: `${config.hotCategoryPrefix}:cross_module`,
        priority: clampPriority(insight.confidence * 100),
        access_count: 0,
        metadata: {
          source_module: insight.source_module,
          target_module: target,
          category: insight.category,
          shared_at: new Date().toISOString(),
        },
      });
      delivered.push(target);
    } catch {
      errors++;
    }
  }

  // Log the broadcast
  await supabase.from('brain_events').insert([{
    module: 'brain',
    event_type: 'cross_module_broadcast',
    data: {
      source: insight.source_module,
      targets: delivered,
      category: insight.category,
      confidence: insight.confidence,
    } as any,
    outcome: 'success',
  }]);

  return { delivered_to: delivered, errors };
}

// ═══════════════════════════════════════════════════════════════
// EVOLUTION CONFIDENCE SCORING
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate evolution confidence for a module based on historical outcomes
 */
export async function getEvolutionConfidence(module: TransferModule): Promise<EvolutionConfidence> {
  // Get evolution history for this module
  const { data: events } = await supabase
    .from('brain_events')
    .select('*')
    .eq('module', module)
    .in('event_type', ['evolution_applied', 'evolution_failed', 'evolution_rolled_back', 'change_applied', 'change_failed'])
    .order('created_at', { ascending: false })
    .limit(100);

  const total = events?.length || 0;
  const successes = events?.filter(e => 
    e.outcome === 'success' || e.event_type === 'evolution_applied' || e.event_type === 'change_applied'
  ).length || 0;
  const failures = events?.filter(e =>
    e.outcome === 'failed' || e.event_type === 'evolution_failed' || e.event_type === 'evolution_rolled_back' || e.event_type === 'change_failed'
  ).length || 0;

  const successRate = total > 0 ? successes / total : 0.5;

  // Calculate impact from recent changes
  const recentEvents = events?.slice(0, 10) || [];
  const avgImpact = recentEvents.length > 0
    ? recentEvents.reduce((sum, e) => {
        const impact = (e.data as any)?.impact_score || (e.data as any)?.predicted_impact || 0.5;
        return sum + impact;
      }, 0) / recentEvents.length
    : 0.5;

  // Determine trend from last 20 vs previous 20
  const recent20 = events?.slice(0, 20) || [];
  const older20 = events?.slice(20, 40) || [];
  const recentSuccessRate = recent20.length > 0
    ? recent20.filter(e => e.outcome === 'success').length / recent20.length
    : 0.5;
  const olderSuccessRate = older20.length > 0
    ? older20.filter(e => e.outcome === 'success').length / older20.length
    : 0.5;

  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (recentSuccessRate > olderSuccessRate + 0.1) trend = 'improving';
  else if (recentSuccessRate < olderSuccessRate - 0.1) trend = 'declining';

  return {
    module,
    reliability_score: Math.round(successRate * 100),
    success_rate: successRate,
    total_changes: total,
    failed_changes: failures,
    avg_impact: avgImpact,
    trend,
  };
}

/**
 * Get evolution confidence for ALL modules
 */
export async function getAllEvolutionConfidence(): Promise<EvolutionConfidence[]> {
  const ALL_MODULES: TransferModule[] = [
    'core', 'ripple', 'access', 'decode', 'nexus', 'dream',
    'defense', 'vision', 'integration', 'system', 'modernizer',
    'inclusive', 'cortex',
  ];

  const results: EvolutionConfidence[] = [];
  for (const module of ALL_MODULES) {
    results.push(await getEvolutionConfidence(module));
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// TRANSFER ENGINE
// ═══════════════════════════════════════════════════════════════

export async function transferKnowledge(module: TransferModule): Promise<TransferBatch> {
  const startTime = Date.now();
  const config = MODULE_CONFIGS[module];
  let transferred = 0, enriched = 0, skipped = 0, errors = 0;

  try {
    const { data: memories } = await supabase
      .from('brain_memories')
      .select('*')
      .gte('confidence', config.minConfidence)
      .in('memory_type', config.memoryTypes)
      .order('confidence', { ascending: false })
      .limit(100);

    if (!memories) {
      return { module, transferred: 0, enriched: 0, skipped: 0, errors: 0, duration_ms: Date.now() - startTime };
    }

    const relevant = memories.filter(m => {
      const lower = (m.content || '').toLowerCase();
      return config.relevanceSignals.some(signal => lower.includes(signal));
    });

    for (const memory of relevant) {
      try {
        const hotQuery: any = supabase.from('brain_memory_hot').select('id, access_count');
        const existingResult = await hotQuery
          .eq('context', `${config.hotCategoryPrefix}:${memory.memory_type}`)
          .limit(1);
        const existing = existingResult.data as any[] | null;
        const isDuplicate = existing?.some((e: any) => memory.content.slice(0, 40).length > 0);

        if (isDuplicate && existing && existing.length > 0) {
          await supabase.from('brain_memory_hot').update({
            access_count: (existing[0].access_count || 0) + 1,
          }).eq('id', existing[0].id);
          enriched++;
        } else {
          const countQuery: any = supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true });
          const { count } = await countQuery.like('context', `${config.hotCategoryPrefix}%`);

          if ((count || 0) >= config.hotCacheLimit) {
            skipped++;
            continue;
          }

          await supabase.from('brain_memory_hot').insert({
            content: `[${module.toUpperCase()}_KNOWLEDGE] ${memory.content}`,
            context: `${config.hotCategoryPrefix}:${memory.memory_type}`,
            priority: clampPriority((memory.confidence || 0.5) * 10),
            access_count: 0,
            metadata: {
              source_memory_id: memory.id,
              module,
              transferred_at: new Date().toISOString(),
            },
          });
          transferred++;
        }
      } catch {
        errors++;
      }
    }
  } catch (err) {
    console.error(`[BrainTransfer:${module}] Transfer failed:`, err);
    errors++;
  }

  const batch: TransferBatch = { module, transferred, enriched, skipped, errors, duration_ms: Date.now() - startTime };

  await supabase.from('brain_events').insert([{
    module: 'brain',
    event_type: `knowledge_transfer_${module}`,
    data: batch as any,
    outcome: errors > 0 ? 'partial' : 'success',
  }]);

  return batch;
}

export async function ingestModulePatterns(module: TransferModule): Promise<{
  ingested: number;
  errors: number;
}> {
  const patternSets: Record<TransferModule, typeof DECODE_PATTERNS> = {
    core: CORE_PATTERNS,
    ripple: RIPPLE_PATTERNS,
    access: ACCESS_PATTERNS,
    decode: DECODE_PATTERNS,
    nexus: NEXUS_PATTERNS,
    dream: DREAM_PATTERNS,
    defense: DEFENSE_PATTERNS,
    vision: VISION_PATTERNS,
    integration: INTEGRATION_PATTERNS,
    system: SYSTEM_PATTERNS,
    modernizer: MODERNIZER_PATTERNS,
    inclusive: INCLUSIVE_PATTERNS,
    cortex: CORTEX_PATTERNS,
  };

  const patterns = patternSets[module];
  const config = MODULE_CONFIGS[module];
  let ingested = 0, patternErrors = 0;

  for (const pattern of patterns) {
    try {
      await supabase.from('brain_memories').insert({
        content: `[${module.toUpperCase()}_EXPERT] ${pattern.title}: ${pattern.content}`,
        memory_type: 'heuristic',
        source: `${module}_expert_patterns`,
        confidence: 0.95,
        metadata: {
          module,
          title: pattern.title,
          priority: pattern.priority,
          ingested_at: new Date().toISOString(),
        },
      });
      ingested++;
    } catch {
      patternErrors++;
    }
  }

  // Also load top patterns into hot memory
  const hotPatterns = patterns
    .sort((a, b) => b.priority - a.priority)
    .slice(0, Math.min(patterns.length, config.hotCacheLimit / 2));

  for (const pattern of hotPatterns) {
    try {
      await supabase.from('brain_memory_hot').insert({
        content: `[${module.toUpperCase()}_EXPERT] ${pattern.title}: ${pattern.content}`,
        context: `${config.hotCategoryPrefix}:expert`,
        priority: clampPriority(pattern.priority / 10),
        access_count: 0,
        metadata: { module, title: pattern.title },
      });
    } catch {
      // Non-fatal
    }
  }

  await supabase.from('brain_events').insert([{
    module: 'brain',
    event_type: `expert_patterns_ingested_${module}`,
    data: { module, ingested, errors: patternErrors, total: patterns.length } as any,
    outcome: 'success',
  }]);

  return { ingested, errors: patternErrors };
}

/**
 * Run knowledge transfer for ALL modules at once
 */
export async function transferAllModules(): Promise<{
  results: TransferBatch[];
  total_transferred: number;
  total_enriched: number;
}> {
  const modules: TransferModule[] = [
    'core', 'ripple', 'access', 'decode', 'nexus', 'dream',
    'defense', 'vision', 'integration', 'system', 'modernizer',
    'inclusive', 'cortex',
  ];
  const results: TransferBatch[] = [];

  for (const module of modules) {
    const result = await transferKnowledge(module);
    results.push(result);
  }

  return {
    results,
    total_transferred: results.reduce((sum, r) => sum + r.transferred, 0),
    total_enriched: results.reduce((sum, r) => sum + r.enriched, 0),
  };
}

/**
 * Ingest expert patterns for ALL modules at once
 */
export async function ingestAllModulePatterns(): Promise<{
  results: Record<TransferModule, { ingested: number; errors: number }>;
  total_ingested: number;
}> {
  const modules: TransferModule[] = [
    'core', 'ripple', 'access', 'decode', 'nexus', 'dream',
    'defense', 'vision', 'integration', 'system', 'modernizer',
    'inclusive', 'cortex',
  ];
  const results = {} as Record<TransferModule, { ingested: number; errors: number }>;
  let totalIngested = 0;

  for (const module of modules) {
    const result = await ingestModulePatterns(module);
    results[module] = result;
    totalIngested += result.ingested;
  }

  return { results, total_ingested: totalIngested };
}

/**
 * Get knowledge report for a module
 */
export async function getModuleKnowledgeReport(module: TransferModule): Promise<ModuleKnowledgeReport> {
  const config = MODULE_CONFIGS[module];

  const { count: hotCount } = await supabase
    .from('brain_memory_hot')
    .select('id', { count: 'exact', head: true })
    .ilike('category', `${config.hotCategoryPrefix}%`);

  const { data: memories } = await supabase
    .from('brain_memories')
    .select('confidence, source')
    .eq('source', `${module}_expert_patterns`)
    .limit(200);

  const { data: lastEvent } = await supabase
    .from('brain_events')
    .select('created_at')
    .eq('event_type', `knowledge_transfer_${module}`)
    .order('created_at', { ascending: false })
    .limit(1);

  const avgConfidence = memories && memories.length > 0
    ? memories.reduce((sum, m) => sum + (m.confidence || 0), 0) / memories.length
    : 0;

  return {
    module,
    hot_patterns: hotCount || 0,
    total_memories: memories?.length || 0,
    avg_confidence: avgConfidence,
    top_categories: config.relevanceSignals.slice(0, 5),
    last_transfer: lastEvent?.[0]?.created_at || null,
  };
}

/**
 * Get all module knowledge reports
 */
export async function getAllModuleKnowledgeReports(): Promise<ModuleKnowledgeReport[]> {
  const modules: TransferModule[] = [
    'core', 'ripple', 'access', 'decode', 'nexus', 'dream',
    'defense', 'vision', 'integration', 'system', 'modernizer',
    'inclusive', 'cortex',
  ];

  const reports: ModuleKnowledgeReport[] = [];
  for (const module of modules) {
    reports.push(await getModuleKnowledgeReport(module));
  }
  return reports;
}
