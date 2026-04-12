/**
 * Findings Bridge — Ascension ↔ Mana Convergence
 *
 * Bridges Ascension's scan diagnostics into Mana's surgical attachment
 * configuration. Ascension scans and diagnoses; Mana deploys and defends.
 *
 * The bridge performs two functions:
 *   1. detectFunctionBoundaries() — extracts function names from source code
 *   2. buildAttachmentPlan() — maps primitives to specific function targets
 *
 * © CMPSBL® — All rights reserved.
 */

import type { ManaCapability, AscensionFinding, ManaAttachmentEntry } from './types';

// ═══════════════════════════════════════════════════════════════
// §1 — Function Boundary Detection
// ═══════════════════════════════════════════════════════════════

/**
 * Regex patterns for function declarations across common languages.
 * Extracts the function name from each match group 1.
 */
const FUNCTION_PATTERNS: RegExp[] = [
  // JS/TS: function name(...), const name = (...) =>, export function name
  /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_$]\w*)\s*\(/g,
  /(?:const|let|var)\s+([a-zA-Z_$]\w*)\s*=\s*(?:async\s+)?\(?[^)]*\)?\s*=>/g,
  // Python: def name(
  /def\s+([a-zA-Z_]\w*)\s*\(/g,
  // Rust: fn name(, pub fn name(
  /(?:pub\s+)?(?:async\s+)?fn\s+([a-zA-Z_]\w*)\s*[(<]/g,
  // Go: func name(, func (r Type) name(
  /func\s+(?:\([^)]*\)\s+)?([a-zA-Z_]\w*)\s*\(/g,
  // Java/C#/Kotlin: access type name(
  /(?:public|private|protected|internal|static|override|suspend)\s+(?:\w+\s+)+([a-zA-Z_]\w*)\s*\(/g,
  // Ruby: def name
  /def\s+([a-zA-Z_]\w*[?!]?)/g,
  // C/C++: type name(
  /(?:void|int|char|bool|auto|string|float|double|size_t)\s+([a-zA-Z_]\w*)\s*\(/g,
  // PHP: function name(
  /function\s+([a-zA-Z_]\w*)\s*\(/g,
  // Swift: func name(
  /func\s+([a-zA-Z_]\w*)\s*[(<]/g,
  // Class methods: name(args) {  or  name: function
  /^\s+([a-zA-Z_$]\w*)\s*\([^)]*\)\s*\{/gm,
];

/** Names to exclude — language built-ins and test boilerplate */
const EXCLUDED_NAMES = new Set([
  'if', 'for', 'while', 'switch', 'catch', 'return', 'yield',
  'constructor', 'toString', 'valueOf', 'hasOwnProperty',
  'describe', 'it', 'test', 'expect', 'beforeEach', 'afterEach',
  'main', '__init__', '__str__', '__repr__', '__eq__',
]);

export interface FunctionBoundary {
  readonly name: string;
  readonly line: number;
}

/**
 * Detect function boundaries in source code.
 * Returns deduplicated function names in declaration order.
 */
export function detectFunctionBoundaries(source: string): FunctionBoundary[] {
  const seen = new Set<string>();
  const boundaries: FunctionBoundary[] = [];
  const lines = source.split('\n');

  for (const pattern of FUNCTION_PATTERNS) {
    // Reset lastIndex for global regex reuse
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(source)) !== null) {
      const name = match[1];
      if (!name || EXCLUDED_NAMES.has(name) || seen.has(name)) continue;
      if (name.length < 2 || name.startsWith('_')) continue;

      seen.add(name);
      // Calculate line number
      const beforeMatch = source.slice(0, match.index);
      const line = beforeMatch.split('\n').length;
      boundaries.push({ name, line });
    }
  }

  // Sort by line number for consistent output
  boundaries.sort((a, b) => a.line - b.line);
  return boundaries;
}

// ═══════════════════════════════════════════════════════════════
// §2 — Signal-to-Capability Mapping
// ═══════════════════════════════════════════════════════════════

/** Function name patterns that indicate specific capability needs */
const CAPABILITY_SIGNALS: Array<{
  patterns: RegExp[];
  capability: ManaCapability;
  primitive: string;
  reason: string;
}> = [
  // ── DEFENSE family ──
  {
    patterns: [
      /^(parse|validate|sanitize|decode|deserialize|handle.*input|process.*request|accept|receive|read.*body)/i,
    ],
    capability: 'defense_gate',
    primitive: 'DEFENSE',
    reason: 'Handles untrusted input — boundary enforcement required',
  },
  {
    patterns: [
      /^(sanitize|clean|strip|escape|normalize|purify|bleach)/i,
    ],
    capability: 'input_sanitizer',
    primitive: 'DEFENSE',
    reason: 'Input sanitization — strips dangerous patterns before processing',
  },
  {
    patterns: [
      /^(score|rank|assess|evaluate|classify|grade|rate).*(threat|risk|danger|severity)/i,
      /^(handle|process|on).*(request|input|data|payload|message|event|upload|form|payment|transaction|order)/i,
    ],
    capability: 'threat_scorer',
    primitive: 'DEFENSE',
    reason: 'Threat scoring — assigns risk level to invocations',
  },
  {
    patterns: [
      /^(throttle|limit|restrict|cap|quota|budget)/i,
    ],
    capability: 'rate_limiter',
    primitive: 'DEFENSE',
    reason: 'Rate limiting — prevents abuse via excessive invocations',
  },
  {
    patterns: [
      /^(validate|check|verify|assert|ensure).*(payload|schema|shape|type|format|body)/i,
    ],
    capability: 'payload_validator',
    primitive: 'DEFENSE',
    reason: 'Payload validation — enforces argument constraints',
  },
  {
    patterns: [
      /^(execute|eval|run|compile|interpret|render.*template)/i,
      /^(process|execute|run).*(payment|charge|transfer|withdraw|deposit)/i,
    ],
    capability: 'injection_guard',
    primitive: 'DEFENSE',
    reason: 'Injection guard — blocks SQL/XSS/template injection patterns',
  },
  // ── BEACON family ──
  {
    patterns: [
      /^(measure|profile|benchmark|time|perf)/i,
    ],
    capability: 'latency_profiler',
    primitive: 'BEACON',
    reason: 'Latency profiling — percentile-aware execution timing',
  },
  {
    patterns: [
      /^(handle.*error|catch|on.*error|on.*fail|recover|rescue)/i,
    ],
    capability: 'error_tracker',
    primitive: 'BEACON',
    reason: 'Error tracking — categorizes and counts failures',
  },
  {
    patterns: [
      /^(process|handle|consume|dispatch|route|serve)/i,
    ],
    capability: 'throughput_meter',
    primitive: 'BEACON',
    reason: 'Throughput measurement — calls/second observation',
  },
  {
    patterns: [
      /^(call|invoke|delegate|forward|dispatch.*to|proxy.*to)/i,
    ],
    capability: 'dependency_mapper',
    primitive: 'BEACON',
    reason: 'Dependency mapping — traces inter-function call chains',
  },
  // ── GOVERNANCE family ──
  {
    patterns: [
      /^(save|update|delete|remove|create|insert|write|set|put|patch|modify|mutate|assign|overwrite)/i,
    ],
    capability: 'governance_hook',
    primitive: 'GOVERNANCE',
    reason: 'Mutates state — governance audit required',
  },
  {
    patterns: [
      /^(mutate|transform|morph|alter|change.*state)/i,
      /^(handle|process|on).*(save|update|delete|create|submit|commit|push)/i,
    ],
    capability: 'mutation_guard',
    primitive: 'GOVERNANCE',
    reason: 'Mutation guard — freezes inputs to detect unauthorized changes',
  },
  {
    patterns: [
      /^(enforce|apply|check).*(policy|rule|constraint|regulation)/i,
    ],
    capability: 'policy_enforcer',
    primitive: 'GOVERNANCE',
    reason: 'Policy enforcement — declarative rule-based gating',
  },
  {
    patterns: [
      /^(consent|agree|accept|opt.*in|approve|authorize.*user)/i,
    ],
    capability: 'consent_gate',
    primitive: 'GOVERNANCE',
    reason: 'Consent gate — requires explicit user consent before execution',
  },
  {
    patterns: [
      /^(comply|regulate|audit.*compliance|check.*gdpr|check.*hipaa|check.*pci|verify.*compliance)/i,
    ],
    capability: 'compliance_check',
    primitive: 'GOVERNANCE',
    reason: 'Compliance check — regulatory requirement verification',
  },
  {
    patterns: [
      /^(auth|login|logout|verify|check.*perm|grant|revoke|elevate|impersonate)/i,
      /^(is.*admin|has.*role|can.*access|is.*authorized|is.*authenticated)/i,
    ],
    capability: 'access_controller',
    primitive: 'GOVERNANCE',
    reason: 'Access control — role-based permission enforcement',
  },
  // ── FAILSAFE family ──
  {
    patterns: [
      /^(fetch|call|request|query|get.*api|post|send|connect|subscribe|poll|ping)/i,
    ],
    capability: 'circuit_breaker',
    primitive: 'FAILSAFE',
    reason: 'External call — circuit breaker for fault isolation',
  },
  {
    patterns: [
      /^(retry|attempt|try.*again|reattempt|backoff)/i,
    ],
    capability: 'retry_handler',
    primitive: 'FAILSAFE',
    reason: 'Retry handler — automatic retry with backoff on failure',
  },
  {
    patterns: [
      /^(load|download|upload|stream|pipe|forward|proxy|relay)/i,
    ],
    capability: 'timeout_guard',
    primitive: 'FAILSAFE',
    reason: 'Timeout guard — enforces execution time limits',
  },
  {
    patterns: [
      /^(batch|parallel|concurrent|pool|queue|worker|spawn|fork)/i,
    ],
    capability: 'bulkhead_isolator',
    primitive: 'FAILSAFE',
    reason: 'Bulkhead isolator — concurrency limits to prevent cascade failures',
  },
  {
    patterns: [
      /^(fallback|default|backup|recover|graceful|degrade)/i,
    ],
    capability: 'fallback_provider',
    primitive: 'FAILSAFE',
    reason: 'Fallback provider — graceful degradation on failure',
  },
  // ── AUDIT family ──
  {
    patterns: [
      /^(log|track|record|emit|report|audit|trace|capture|observe|measure|monitor)/i,
    ],
    capability: 'audit_trail',
    primitive: 'AUDIT',
    reason: 'Observation point — audit trail for provenance',
  },
  {
    patterns: [
      /^(persist|store|cache|write.*log|append|push.*event)/i,
    ],
    capability: 'call_logger',
    primitive: 'AUDIT',
    reason: 'Call logger — structured invocation logging',
  },
  {
    patterns: [
      /^(snapshot|checkpoint|save.*state|backup.*state|capture.*state)/i,
    ],
    capability: 'state_snapshot',
    primitive: 'AUDIT',
    reason: 'State snapshot — captures before/after state for diffing',
  },
  {
    patterns: [
      /^(investigate|forensic|evidence|chain.*of.*custody|tamper)/i,
    ],
    capability: 'forensic_recorder',
    primitive: 'AUDIT',
    reason: 'Forensic recorder — deep call-stack and context recording',
  },
  // ── SHADOW family ──
  {
    patterns: [
      /^(render|display|output|format|serialize|stringify|respond|return.*data)/i,
    ],
    capability: 'output_filter',
    primitive: 'DEFENSE',
    reason: 'Output filter — strips sensitive patterns from return values',
  },
  {
    patterns: [
      /^(mask|redact|anonymize|pseudonymize|obfuscate|hide|censor)/i,
    ],
    capability: 'data_masker',
    primitive: 'DEFENSE',
    reason: 'Data masker — PII/PHI masking in arguments',
  },
  {
    patterns: [
      /^(shadow|override|intercept|replace.*output|transform.*result)/i,
    ],
    capability: 'shadow_rule',
    primitive: 'SHADOW',
    reason: 'Shadow rule — Lex-governed output override',
  },
  // ── DREAM family ──
  {
    patterns: [
      /^(detect|flag|alert|warn|notify|signal).*(anomaly|outlier|unusual|suspicious|abnormal)/i,
    ],
    capability: 'anomaly_detector',
    primitive: 'DREAM',
    reason: 'Anomaly detection — statistical outlier flagging via z-score',
  },
  {
    patterns: [
      /^(drift|diverge|shift|deviate|regress|degrade.*over.*time)/i,
    ],
    capability: 'drift_monitor',
    primitive: 'DREAM',
    reason: 'Drift monitor — behavioral change detection over time',
  },
  // ── MEMORY family ──
  {
    patterns: [
      /^(cache|memoize|remember|store.*result|lookup|get.*cached)/i,
    ],
    capability: 'memory_cache',
    primitive: 'MEMORY',
    reason: 'Memory cache — memoizes results to eliminate redundant computation',
  },
  {
    patterns: [
      /^(expire|ttl|evict|invalidate|flush.*cache|clear.*cache)/i,
    ],
    capability: 'memory_ttl',
    primitive: 'MEMORY',
    reason: 'Memory TTL — enforces time-to-live on cached data',
  },
  {
    patterns: [
      /^(track.*state|watch.*state|observe.*state|subscribe.*state|on.*change)/i,
    ],
    capability: 'memory_state_track',
    primitive: 'MEMORY',
    reason: 'State tracking — monitors state transitions for audit',
  },
  // ── NEXUS family ──
  {
    patterns: [
      /^(route|dispatch|forward|proxy|delegate).*(ai|llm|model|provider)/i,
      /^(call.*llm|call.*ai|invoke.*model|chat.*completion)/i,
    ],
    capability: 'nexus_router',
    primitive: 'NEXUS',
    reason: 'Nexus router — model-agnostic AI call routing',
  },
  {
    patterns: [
      /^(budget|cost|spend|charge|bill|meter.*cost)/i,
    ],
    capability: 'nexus_cost_gate',
    primitive: 'NEXUS',
    reason: 'Nexus cost gate — enforces per-call and daily budget limits',
  },
  // ── BRAIN family ──
  {
    patterns: [
      /^(reason|infer|deduce|analyze|think|plan|solve|decide)/i,
    ],
    capability: 'brain_reasoning_trace',
    primitive: 'BRAIN',
    reason: 'Reasoning trace — captures multi-step inference chains',
  },
  {
    patterns: [
      /^(context|prompt|token|embed|encode.*text)/i,
    ],
    capability: 'brain_context_guard',
    primitive: 'BRAIN',
    reason: 'Context guard — enforces token/context window limits',
  },
  {
    patterns: [
      /^(confident|uncertain|calibrate|score.*confidence)/i,
    ],
    capability: 'brain_confidence_gate',
    primitive: 'BRAIN',
    reason: 'Confidence gate — flags low-confidence outputs',
  },
  // ── ORACLE family ──
  {
    patterns: [
      /^(predict|forecast|project|estimate|anticipate)/i,
    ],
    capability: 'oracle_predictor',
    primitive: 'ORACLE',
    reason: 'Predictive observation — captures forecast accuracy',
  },
  {
    patterns: [
      /^(cause|root.*cause|correlate|attribute|explain.*why)/i,
    ],
    capability: 'oracle_causal_trace',
    primitive: 'ORACLE',
    reason: 'Causal trace — maps cause-effect chains in execution',
  },
  // ── CORTEX family ──
  {
    patterns: [
      /^(orchestrate|coordinate|schedule|dag|pipeline|workflow)/i,
    ],
    capability: 'cortex_orchestrator',
    primitive: 'CORTEX',
    reason: 'Orchestrator — DAG-based multi-step task coordination',
  },
  {
    patterns: [
      /^(allocate|provision|scale|assign.*resource|distribute)/i,
    ],
    capability: 'cortex_resource_gate',
    primitive: 'CORTEX',
    reason: 'Resource gate — governs compute/memory allocation',
  },
  // ── ECHO family ──
  {
    patterns: [
      /^(amplify|boost|enhance|strengthen|reinforce)/i,
    ],
    capability: 'echo_amplifier',
    primitive: 'ECHO',
    reason: 'Signal amplifier — strengthens recurring success patterns',
  },
  // ── HARVEST family ──
  {
    patterns: [
      /^(crawl|scrape|ingest|fetch.*data|import.*data|pull.*data)/i,
    ],
    capability: 'harvest_quality_gate',
    primitive: 'HARVEST',
    reason: 'Harvest quality gate — validates ingested data quality',
  },
  {
    patterns: [
      /^(dedup|deduplicate|unique|distinct|merge.*duplicates)/i,
    ],
    capability: 'harvest_dedup',
    primitive: 'HARVEST',
    reason: 'Deduplication — prevents duplicate data ingestion',
  },
  // ── PHANTOM family ──
  {
    patterns: [
      /^(stealth|covert|silent|invisible|undetectable)/i,
    ],
    capability: 'phantom_stealth',
    primitive: 'PHANTOM',
    reason: 'Stealth mode — minimal-footprint execution',
  },
  // ── LINGUA family ──
  {
    patterns: [
      /^(translate|localize|i18n|internationalize|locale)/i,
    ],
    capability: 'lingua_normalizer',
    primitive: 'LINGUA',
    reason: 'Lingua normalizer — multilingual text normalization',
  },
  // ── NERVE family ──
  {
    patterns: [
      /^(prioritize|urgent|critical|escalate|triage)/i,
    ],
    capability: 'nerve_priority_router',
    primitive: 'NERVE',
    reason: 'Priority router — urgency-based signal routing',
  },
  // ── COMPASS family ──
  {
    patterns: [
      /^(intent|classify.*intent|parse.*intent|understand|interpret)/i,
    ],
    capability: 'compass_intent_resolver',
    primitive: 'COMPASS',
    reason: 'Intent resolver — disambiguates user intent',
  },
  // ── SANDBOX family ──
  {
    patterns: [
      /^(sandbox|isolate|contain|quarantine.*exec|safe.*exec)/i,
    ],
    capability: 'sandbox_isolator',
    primitive: 'SANDBOX',
    reason: 'Sandbox isolator — executes untrusted code in isolation',
  },
  // ── RIPPLE family ──
  {
    patterns: [
      /^(impact|ripple|cascade|propagate|downstream)/i,
    ],
    capability: 'ripple_impact_tracer',
    primitive: 'RIPPLE',
    reason: 'Impact tracer — traces downstream effects of changes',
  },
  // ── IDENTITY family ──
  {
    patterns: [
      /^(session|bind.*session|fingerprint.*device|attest)/i,
    ],
    capability: 'identity_session_bind',
    primitive: 'IDENTITY',
    reason: 'Session binding — authenticates and binds sessions',
  },
  {
    patterns: [
      /^(authenticate|verify.*identity|check.*token|validate.*jwt)/i,
    ],
    capability: 'identity_auth_gate',
    primitive: 'IDENTITY',
    reason: 'Auth gate — identity verification before execution',
  },
  // ── VISION family ──
  {
    patterns: [
      /^(perf|performance|cwv|vitals|lcp|cls|fid|inp)/i,
    ],
    capability: 'vision_perf_monitor',
    primitive: 'VISION',
    reason: 'Performance monitor — tracks Core Web Vitals',
  },
  {
    patterns: [
      /^(a11y|accessibility|wcag|aria|screen.*reader)/i,
    ],
    capability: 'vision_accessibility_check',
    primitive: 'VISION',
    reason: 'Accessibility check — WCAG compliance validation',
  },
  // ── RELAY family ──
  {
    patterns: [
      /^(sync|realtime|websocket|push|subscribe.*event)/i,
    ],
    capability: 'relay_sync',
    primitive: 'RELAY',
    reason: 'Relay sync — real-time state synchronization',
  },
  {
    patterns: [
      /^(offline|service.*worker|cache.*first|background.*sync)/i,
    ],
    capability: 'relay_offline_cache',
    primitive: 'RELAY',
    reason: 'Offline cache — service worker cache with background sync',
  },
  // ── INTEGRATION family ──
  {
    patterns: [
      /^(integrate|connect|bridge|adapter|connector)/i,
    ],
    capability: 'integration_bridge',
    primitive: 'INTEGRATION',
    reason: 'Integration bridge — external service connector',
  },
  {
    patterns: [
      /^(webhook|callback|notify.*endpoint|on.*event.*post)/i,
    ],
    capability: 'integration_webhook',
    primitive: 'INTEGRATION',
    reason: 'Webhook handler — event-driven integration endpoint',
  },
  // ── MEDIC family ──
  {
    patterns: [
      /^(health|heartbeat|ping|alive|ready|liveness)/i,
    ],
    capability: 'medic_health_check',
    primitive: 'MEDIC',
    reason: 'Health check — runtime diagnostics and liveness probes',
  },
  // ── IMMUNITY family ──
  {
    patterns: [
      /^(heal|recover|repair|restore|fix.*auto|self.*fix)/i,
    ],
    capability: 'immunity_self_heal',
    primitive: 'IMMUNITY',
    reason: 'Self-healing — autonomous error recovery',
  },
  // ── EVOLUTION family ──
  {
    patterns: [
      /^(patch|upgrade|migrate|evolve|improve|refactor)/i,
    ],
    capability: 'evolution_patch',
    primitive: 'EVOLUTION',
    reason: 'Evolution patch — governed self-improvement',
  },
  // ── SOVEREIGN family ──
  {
    patterns: [
      /^(encrypt|decrypt|cipher|aes|rsa|sign.*data)/i,
    ],
    capability: 'sovereign_encrypt',
    primitive: 'SOVEREIGN',
    reason: 'Sovereign encrypt — data sovereignty and encryption',
  },
  {
    patterns: [
      /^(tenant|multi.*tenant|isolate.*tenant|partition)/i,
    ],
    capability: 'sovereign_tenant_isolate',
    primitive: 'SOVEREIGN',
    reason: 'Tenant isolation — cryptographic data separation',
  },
  // ── ACCESS family ──
  {
    patterns: [
      /^(rbac|role|permission|can.*do|has.*permission|authorize)/i,
    ],
    capability: 'access_rbac_gate',
    primitive: 'ACCESS',
    reason: 'RBAC gate — role-based access control enforcement',
  },
  {
    patterns: [
      /^(api.*key|token.*validate|key.*rotate|key.*revoke)/i,
    ],
    capability: 'access_api_key_check',
    primitive: 'ACCESS',
    reason: 'API key check — lifecycle management and validation',
  },
  // ── CONSCIENCE family ──
  {
    patterns: [
      /^(ethic|moral|fair|bias|harm|responsible|safe.*ai)/i,
    ],
    capability: 'conscience_ethics_gate',
    primitive: 'CONSCIENCE',
    reason: 'Ethics gate — evaluates actions against ethical guidelines',
  },
  // ── TREATY family ──
  {
    patterns: [
      /^(contract|sla|agreement|terms|enforce.*contract)/i,
    ],
    capability: 'treaty_contract_check',
    primitive: 'TREATY',
    reason: 'Contract enforcement — inter-service agreement validation',
  },
  // ── FORGE family ──
  {
    patterns: [
      /^(package|bundle|build|compile|export.*package|seal)/i,
    ],
    capability: 'forge_package_seal',
    primitive: 'FORGE',
    reason: 'Package seal — integrity verification on export artifacts',
  },
  // ── CORE family ──
  {
    patterns: [
      /^(lifecycle|init|boot|startup|shutdown|destroy|dispose)/i,
    ],
    capability: 'core_lifecycle_guard',
    primitive: 'CORE',
    reason: 'Lifecycle guard — enforces valid state transitions',
  },
  // ── SYSTEM family ──
  {
    patterns: [
      /^(telemetry|instrument|metric|counter|histogram)/i,
    ],
    capability: 'system_telemetry',
    primitive: 'SYSTEM',
    reason: 'System telemetry — structured metric collection',
  },
  {
    patterns: [
      /^(feature.*flag|toggle|rollout|experiment|ab.*test)/i,
    ],
    capability: 'system_feature_flag',
    primitive: 'SYSTEM',
    reason: 'Feature flag — runtime feature toggles with kill-switch',
  },
];

// ═══════════════════════════════════════════════════════════════
// §3 — Attachment Plan Builder
// ═══════════════════════════════════════════════════════════════

/**
 * Map detected function boundaries against primitive signals to produce
 * targeted Mana attachment findings.
 *
 * @param boundaries  Function boundaries from detectFunctionBoundaries()
 * @param activePrimitives  Primitive names selected by Ascension scanner
 * @returns Targeted findings — each maps a function to a specific capability
 */
export function buildAttachmentPlan(
  boundaries: FunctionBoundary[],
  activePrimitives: ReadonlySet<string>,
): AscensionFinding[] {
  const findings: AscensionFinding[] = [];
  const assigned = new Set<string>(); // Track function→capability pairs to avoid dupes

  for (const boundary of boundaries) {
    for (const signal of CAPABILITY_SIGNALS) {
      // Only apply if the relevant primitive was selected by the scanner
      if (!activePrimitives.has(signal.primitive)) continue;

      const matched = signal.patterns.some(p => {
        p.lastIndex = 0;
        return p.test(boundary.name);
      });

      if (!matched) continue;

      const key = `${boundary.name}:${signal.capability}`;
      if (assigned.has(key)) continue;
      assigned.add(key);

      findings.push({
        functionName: boundary.name,
        capability: signal.capability,
        primitive: signal.primitive,
        reason: signal.reason,
        confidence: 0.85, // Signal-matched — high confidence
      });
    }
  }

  // BEACON telemetry on all exported/public functions not already wrapped
  if (activePrimitives.has('BEACON') || activePrimitives.has('MEDIC') || activePrimitives.has('VISION')) {
    for (const boundary of boundaries) {
      const key = `${boundary.name}:beacon_telemetry`;
      if (assigned.has(key)) continue;
      assigned.add(key);

      findings.push({
        functionName: boundary.name,
        capability: 'beacon_telemetry',
        primitive: 'BEACON',
        reason: 'Public function — telemetry observation',
        confidence: 0.60,
      });
    }
  }

  // Sort by confidence descending, then alphabetically
  findings.sort((a, b) => b.confidence - a.confidence || a.functionName.localeCompare(b.functionName));

  return findings;
}

/**
 * Convert AscensionFindings into serializable ManaAttachmentEntries
 * suitable for embedding in export artifacts.
 */
export function serializeAttachmentPlan(findings: AscensionFinding[]): ManaAttachmentEntry[] {
  return findings.map(f => ({
    functionName: f.functionName,
    capability: f.capability,
    primitive: f.primitive,
    reason: f.reason,
  }));
}
