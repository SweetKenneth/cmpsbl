/**
 * Substrate Navigator — Codebase Navigation Intelligence for ENCODE & DECODE
 *
 * Teaches agents HOW to find things in the substrate the same way a human would:
 *   1. Semantic alias mapping    — "cognition" → brain, "security" → defense
 *   2. Convention-based paths    — adapters, handlers, hooks, hardening files
 *   3. Cross-cutting concerns    — "rate limit X" → multiple rate-limit files
 *   4. Intent-to-file targeting  — "add metric to BRAIN" → brain.adapter.ts
 *   5. Database table awareness  — module → relevant Supabase tables
 *
 * Usage:
 *   const nav = navigateIntent('rate limit BRAIN cognition');
 *   // → returns every file, table, and convention path relevant to that intent
 */

import { SYSTEM_MODULES, resolveModule, type ModuleEntry } from './system-manifest';

// ═══════════════════════════════════════════════════════════════
// 1. SEMANTIC ALIAS MAP — Natural language → module ID
// ═══════════════════════════════════════════════════════════════

/** Maps natural-language synonyms and domain terms to canonical module IDs */
const SEMANTIC_ALIASES: Record<string, string> = {
  // BRAIN
  cognition: 'brain', cognitive: 'brain', learning: 'brain', knowledge: 'brain',
  training: 'brain', 'ai learning': 'brain', intelligence: 'brain', clm: 'brain',

  // MEMORY
  recall: 'memory', storage: 'memory', persist: 'memory', remember: 'memory',
  'memory bank': 'memory', retention: 'memory', cache: 'memory',

  // DREAM
  dream: 'dream', synthesis: 'dream', 'dream pool': 'dream', imagination: 'dream',
  subconscious: 'dream',

  // DECODE
  intent: 'decode', interpret: 'decode', parse: 'decode', 'natural language': 'decode',
  nlp: 'decode', conversation: 'decode', chat: 'decode', 'system voice': 'decode',

  // ENCODE
  codegen: 'encode', 'code generation': 'encode', patch: 'encode', refactor: 'encode',
  implementation: 'encode', 'code agent': 'encode',

  // DEFENSE
  security: 'defense', threat: 'defense', firewall: 'defense', 'rate limit': 'defense',
  'bot detection': 'defense', stealth: 'defense', protection: 'defense', waf: 'defense',

  // IMMUNITY
  resilience: 'immunity', 'self-healing': 'immunity', 'shadow training': 'immunity',
  'gap classification': 'immunity', recovery: 'immunity',

  // EVOLUTION
  evolution: 'evolution', mutation: 'evolution', modernizer: 'evolution',
  'self-improvement': 'evolution', canary: 'evolution', 'a/b test': 'evolution',
  seba: 'evolution',

  // NEXUS
  'ai gateway': 'nexus', 'ai router': 'nexus', provider: 'nexus', llm: 'nexus',
  'model routing': 'nexus', 'ai provider': 'nexus',

  // VISION
  analytics: 'vision', telemetry: 'vision', metrics: 'vision', observability: 'vision',
  dashboard: 'vision', monitoring: 'vision',

  // CORTEX
  pipeline: 'cortex', orchestration: 'cortex', workflow: 'cortex',
  'cognitive pipeline': 'cortex',

  // ECONOMY
  cost: 'economy', budget: 'economy', pricing: 'economy', billing: 'economy',
  marketplace: 'economy', revenue: 'economy', reprice: 'economy', 'consensus pricing': 'economy',
  'pricing anomaly': 'economy', 'pricing governance': 'economy',

  // SANDBOX
  isolation: 'sandbox', 'safe execution': 'sandbox', testing: 'sandbox',
  speculative: 'sandbox',

  // INCLUSIVE
  accessibility: 'inclusive', wcag: 'inclusive', a11y: 'inclusive',

  // GOVERNANCE
  governance: 'governance', ethics: 'governance', veto: 'governance',
  epistemic: 'governance', coherence: 'governance',

  // INTEGRATION
  oauth: 'integration', api: 'integration', 'third party': 'integration',
  connector: 'integration', webhook: 'integration',

  // MEDIC
  diagnostics: 'medic', 'self-repair': 'medic', 'health check': 'medic',
  'failure forecast': 'medic',

  // NERVE
  signaling: 'nerve', heartbeat: 'nerve', consensus: 'nerve', partition: 'nerve',
  'state sync': 'nerve',

  // Expansion modules
  sovereignty: 'sovereign', gdpr: 'sovereign', ccpa: 'sovereign',
  prediction: 'oracle', bayesian: 'oracle', 'monte carlo': 'oracle',
  bias: 'conscience', fairness: 'conscience', ethical: 'conscience',
  contract: 'treaty', sla: 'treaty',
  geospatial: 'compass', navigation: 'compass', location: 'compass',
  'digital twin': 'echo', replay: 'echo', simulation: 'echo',
  edge: 'reflex', 'low latency': 'reflex',
  forge: 'forge', artifact: 'forge', template: 'forge',
  translation: 'lingua', localization: 'lingua', i18n: 'lingua',
  privacy: 'phantom', anonymization: 'phantom', pii: 'phantom',
  etl: 'harvest', ingestion: 'harvest', 'data acquisition': 'harvest',
};

// ═══════════════════════════════════════════════════════════════
// 2. CONVENTION PATTERNS — Where things live by convention
// ═══════════════════════════════════════════════════════════════

/** File conventions that apply to every module */
interface ConventionPaths {
  /** Module adapter for GOAL metrics */
  metricAdapter: (moduleId: string) => string;
  /** Terminal command handler */
  terminalHandler: (moduleId: string) => string;
  /** React hook */
  hook: (moduleId: string) => string;
  /** Hardening file */
  hardening: (moduleId: string) => string;
  /** CLM topic config */
  clmTopic: () => string;
  /** Module-level test */
  test: (moduleId: string) => string;
}

export const CONVENTIONS: ConventionPaths = {
  metricAdapter: (id) => `src/core/metrics/moduleAdapters/${id}.adapter.ts`,
  terminalHandler: (id) => {
    // Some handlers are grouped
    const groupMap: Record<string, string> = {
      decode: 'src/lib/terminal/encode-handlers.ts',
      encode: 'src/lib/terminal/encode-handlers.ts',
      brain: 'src/lib/terminal/encode-handlers.ts',
      defense: 'src/lib/terminal/hardening-handlers.ts',
      immunity: 'src/lib/terminal/hardening-handlers.ts',
      evolution: 'src/lib/terminal/seba-handlers.ts',
      nexus: 'src/lib/terminal/observability-handlers.ts',
      vision: 'src/lib/terminal/observability-handlers.ts',
      cortex: 'src/lib/terminal/synergy-handlers.ts',
    };
    return groupMap[id] || `src/lib/terminal/hardening-handlers.ts`;
  },
  hook: (id) => `src/hooks/substrate/use${capitalize(id)}.ts`,
  hardening: (id) => `src/lib/${id}/${id}-hardening.ts`,
  clmTopic: () => 'src/lib/substrate/module-clm/index.ts',
  test: (id) => `src/lib/${id}/${id}.test.ts`,
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ═══════════════════════════════════════════════════════════════
// 3. CROSS-CUTTING CONCERN MAP — "rate limit" → multiple files
// ═══════════════════════════════════════════════════════════════

export type ConcernType =
  | 'rate_limit'
  | 'circuit_breaker'
  | 'quota'
  | 'auth'
  | 'audit'
  | 'telemetry'
  | 'error_handling'
  | 'caching'
  | 'rls_policy'
  | 'tenant_isolation';

/** Files that implement each cross-cutting concern */
const CONCERN_FILES: Record<ConcernType, string[]> = {
  rate_limit: [
    'src/lib/system/rateLimit.ts',
    'src/lib/substrate/adaptive-rate-limit/index.ts',
    'src/lib/substrate/pfv-ports/adaptive-quota-manager.ts',
  ],
  circuit_breaker: [
    'src/lib/substrate/tenant-circuit-breaker.ts',
    'src/lib/codeagent/circuit-breaker.ts',
  ],
  quota: [
    'src/lib/substrate/pfv-ports/adaptive-quota-manager.ts',
    'src/lib/substrate/economy-module/',
  ],
  auth: [
    'src/lib/auth/',
    'src/hooks/useAuth.ts',
    'src/pages/Auth.tsx',
  ],
  audit: [
    'src/lib/substrate/audit/',
    'src/lib/substrate/governance/',
  ],
  telemetry: [
    'src/lib/substrate/telemetry-engine.ts',
    'src/core/metrics/',
  ],
  error_handling: [
    'src/lib/substrate/encode-error-patterns/',
    'src/lib/codeagent/error-patterns.ts',
  ],
  caching: [
    'src/lib/substrate/request-coalescer.ts',
  ],
  rls_policy: [
    'supabase/migrations/',
  ],
  tenant_isolation: [
    'src/lib/substrate/tenant-isolator.ts',
    'src/lib/substrate/tenant-circuit-breaker.ts',
  ],
};

// ═══════════════════════════════════════════════════════════════
// 4. DATABASE TABLE AWARENESS — Module → relevant tables
// ═══════════════════════════════════════════════════════════════

const MODULE_TABLES: Record<string, string[]> = {
  brain: ['ai_learning_data', 'ai_daily_quota', 'ai_usage_log'],
  memory: ['ai_learning_data'],
  dream: ['agency_dream_pool', 'agency_dream_memory', 'agency_dream_consent'],
  decode: ['analytics_events'],
  encode: ['analytics_events', 'audit_logs'],
  defense: ['analytics_events', 'audit_logs'],
  nexus: ['ai_usage_log', 'ai_daily_quota'],
  vision: ['analytics_snapshots', 'analytics_events'],
  economy: ['access_usage', 'access_quotas', 'access_subscriptions'],
  evolution: ['analytics_events', 'audit_logs'],
  governance: ['audit_logs', 'audit_chain_anchors'],
  access: ['access_api_keys', 'access_developers', 'access_products', 'access_subscriptions', 'access_usage', 'access_quotas'],
  inclusive: ['accessibility_scans'],
  identity: ['analytics_events'],
  audit: ['audit_logs', 'audit_chain_anchors'],
  system: ['analytics_snapshots'],
  medic: ['analytics_events'],
  nerve: ['analytics_events'],
  sandbox: ['analytics_events'],
  cortex: ['analytics_events'],
  integration: ['analytics_events'],
  immunity: ['analytics_events'],
  intent: ['analytics_events'],
  sovereign: ['analytics_events'],
  oracle: ['ai_usage_log', 'analytics_events'],
  conscience: ['analytics_events'],
  forge: ['analytics_events'],
  lingua: ['ai_usage_log'],
  harvest: ['analytics_events'],
  phantom: ['analytics_events'],
};

// ═══════════════════════════════════════════════════════════════
// 5. INTENT KEYWORDS — Detect cross-cutting concerns from text
// ═══════════════════════════════════════════════════════════════

const CONCERN_KEYWORDS: Record<ConcernType, string[]> = {
  rate_limit: ['rate limit', 'throttle', 'throttling', 'requests per', 'rpm', 'rps', 'too many requests', '429'],
  circuit_breaker: ['circuit', 'breaker', 'half-open', 'trip', 'cooldown', 'failure threshold'],
  quota: ['quota', 'budget', 'daily limit', 'calls_used', 'calls_budget', 'allowance'],
  auth: ['auth', 'login', 'signup', 'session', 'jwt', 'token', 'permission'],
  audit: ['audit', 'log', 'receipt', 'trail', 'merkle', 'tamper'],
  telemetry: ['metric', 'telemetry', 'observe', 'monitor', 'health score', 'uptime'],
  error_handling: ['error', 'exception', 'retry', 'fallback', 'dead letter', 'dlq'],
  caching: ['cache', 'coalesce', 'deduplicate', 'memoize'],
  rls_policy: ['rls', 'row level', 'policy', 'permission', 'access control'],
  tenant_isolation: ['tenant', 'isolat', 'multi-tenant', 'subscriber'],
};

// ═══════════════════════════════════════════════════════════════
// 6. THE NAVIGATOR — Primary API
// ═══════════════════════════════════════════════════════════════

export interface NavigationResult {
  /** Resolved primary module(s) from the intent */
  modules: ModuleEntry[];
  /** All file paths relevant to the intent */
  targetFiles: string[];
  /** Cross-cutting concerns detected */
  concerns: ConcernType[];
  /** Database tables relevant to the target module(s) */
  tables: string[];
  /** Convention-based paths for the resolved module(s) */
  conventionPaths: Record<string, string>;
  /** Dependency chain — what else might be affected */
  impactChain: string[];
  /** Human-readable navigation summary */
  summary: string;
}

/**
 * Navigate an intent string to locate every relevant file, table, and convention.
 *
 * Examples:
 *   navigateIntent('rate limit BRAIN cognition')
 *   navigateIntent('add metric to DEFENSE')
 *   navigateIntent('fix circuit breaker for NEXUS')
 *   navigateIntent('ORACLE prediction accuracy')
 */
export function navigateIntent(intentText: string): NavigationResult {
  const lower = intentText.toLowerCase();

  // ── Step 1: Resolve target modules ──────────────────────────
  const moduleIds = new Set<string>();

  // Direct module name match — use word boundary to avoid "ai" matching inside "brain"
  for (const [id] of Object.entries(SYSTEM_MODULES)) {
    const boundary = new RegExp(`\\b${id}\\b`);
    if (boundary.test(lower)) moduleIds.add(id);
  }

  // Semantic alias match
  for (const [alias, moduleId] of Object.entries(SEMANTIC_ALIASES)) {
    if (lower.includes(alias)) moduleIds.add(moduleId);
  }

  const modules = [...moduleIds]
    .map(id => resolveModule(id))
    .filter((m): m is ModuleEntry => !!m);

  // ── Step 2: Detect cross-cutting concerns ──────────────────
  const concerns: ConcernType[] = [];
  for (const [concern, keywords] of Object.entries(CONCERN_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      concerns.push(concern as ConcernType);
    }
  }

  // ── Step 3: Gather target files ─────────────────────────────
  const targetFiles = new Set<string>();

  // Module core paths
  for (const mod of modules) {
    targetFiles.add(mod.corePath);
    if (mod.hookPath) targetFiles.add(mod.hookPath);
    if (mod.dashboardPath) targetFiles.add(mod.dashboardPath);
  }

  // Convention-based paths for each module
  const conventionPaths: Record<string, string> = {};
  for (const mod of modules) {
    const adapter = CONVENTIONS.metricAdapter(mod.id);
    const handler = CONVENTIONS.terminalHandler(mod.id);
    const hook = CONVENTIONS.hook(mod.id);
    const hardening = CONVENTIONS.hardening(mod.id);

    conventionPaths[`${mod.id}.metricAdapter`] = adapter;
    conventionPaths[`${mod.id}.terminalHandler`] = handler;
    conventionPaths[`${mod.id}.hook`] = hook;
    conventionPaths[`${mod.id}.hardening`] = hardening;

    targetFiles.add(adapter);
    targetFiles.add(handler);
    targetFiles.add(hook);
    targetFiles.add(hardening);
  }

  // Cross-cutting concern files
  for (const concern of concerns) {
    for (const file of CONCERN_FILES[concern]) {
      targetFiles.add(file);
    }
  }

  // ── Step 4: Database tables ─────────────────────────────────
  const tables = new Set<string>();
  for (const mod of modules) {
    const modTables = MODULE_TABLES[mod.id] || [];
    modTables.forEach(t => tables.add(t));
  }

  // ── Step 5: Impact chain (dependencies + dependents) ────────
  const impactChain = new Set<string>();
  for (const mod of modules) {
    mod.dependencies.forEach(d => impactChain.add(d));
    mod.dependents.forEach(d => impactChain.add(d));
  }

  // ── Step 6: Build summary ──────────────────────────────────
  const moduleNames = modules.map(m => m.name).join(', ') || 'UNKNOWN';
  const concernLabels = concerns.join(', ') || 'none';
  const summary = [
    `🎯 Target: ${moduleNames}`,
    `📁 Files: ${targetFiles.size} locations identified`,
    `🔗 Concerns: ${concernLabels}`,
    `🗄️ Tables: ${[...tables].join(', ') || 'none'}`,
    `💥 Impact chain: ${[...impactChain].join(', ') || 'self-contained'}`,
  ].join('\n');

  return {
    modules,
    targetFiles: [...targetFiles],
    concerns,
    tables: [...tables],
    conventionPaths,
    impactChain: [...impactChain],
    summary,
  };
}

// ═══════════════════════════════════════════════════════════════
// 7. HELPERS — For DECODE intent parsing
// ═══════════════════════════════════════════════════════════════

/** Resolve a single natural-language term to a module ID */
export function resolveAlias(term: string): string | null {
  const lower = term.toLowerCase().trim();
  // Direct ID match
  if (SYSTEM_MODULES[lower]) return lower;
  // Alias match
  return SEMANTIC_ALIASES[lower] ?? null;
}

/** Get all known aliases for a module */
export function getAliasesForModule(moduleId: string): string[] {
  return Object.entries(SEMANTIC_ALIASES)
    .filter(([, id]) => id === moduleId)
    .map(([alias]) => alias);
}

/** Detect which concerns a piece of text is about */
export function detectConcerns(text: string): ConcernType[] {
  const lower = text.toLowerCase();
  return (Object.entries(CONCERN_KEYWORDS) as [ConcernType, string[]][])
    .filter(([, keywords]) => keywords.some(kw => lower.includes(kw)))
    .map(([concern]) => concern);
}

/** Get all files for a specific concern type */
export function getConcernFiles(concern: ConcernType): string[] {
  return CONCERN_FILES[concern] || [];
}

/** Get database tables relevant to a module */
export function getModuleTables(moduleId: string): string[] {
  return MODULE_TABLES[moduleId] || [];
}

/** Quick lookup: "Where does X live?" */
export function whereIs(query: string): string {
  const result = navigateIntent(query);
  if (result.modules.length === 0) {
    return `❌ Could not resolve "${query}" to any known module or concern.`;
  }
  return result.summary;
}
