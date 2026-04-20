/**
 * CMPSBL® Structural Signature Library
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Detects code SHAPES, not keywords. Each archetype defines a set of
 * structural patterns that indicate the presence of a capability
 * regardless of variable naming, language idioms, or coding style.
 *
 * A structural signature is a regex that matches the FLOW of code:
 *   counter → comparison → conditional → action
 *
 * These are language-agnostic: they work on Python, JS, TS, Go, Rust,
 * Java, C#, Ruby, and any language with similar control flow.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface StructuralSignature {
  /** Unique archetype identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Which primitives this archetype maps to (uppercase) */
  primitives: string[];
  /** Structural regex patterns — ANY match = structural presence */
  patterns: RegExp[];
  /** Lexical co-signals that strengthen a structural match */
  coSignals: string[];
  /** Intent signals found in comments/docstrings */
  intentSignals: string[];
  /** Weight of this archetype in the overall scoring (0–1) */
  weight: number;
}

export type PresenceState = 'present' | 'partial' | 'absent';

export interface StructuralMatch {
  archetypeId: string;
  archetypeName: string;
  state: PresenceState;
  /** How many structural patterns matched */
  structuralHits: number;
  /** How many lexical co-signals matched */
  lexicalHits: number;
  /** How many intent signals matched */
  intentHits: number;
  /** Overall confidence in this match (0–1) */
  confidence: number;
  /** Which primitives benefit from this match */
  primitives: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — ARCHETYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════
//
// Each archetype captures a universal software pattern. The structural
// patterns use regex to match flow shapes across languages. The patterns
// are intentionally broad — specificity comes from co-signals and the
// composite scoring engine.
// ═══════════════════════════════════════════════════════════════════════════════

const ARCHETYPES: StructuralSignature[] = [
  // ── 1. RATE LIMITING ────────────────────────────────────────────────────────
  {
    id: 'rate-limiting',
    name: 'Rate Limiting / Throttling',
    primitives: ['ACCESS', 'REFLEX', 'ECONOMY'],
    patterns: [
      // counter increment → threshold comparison → conditional block
      /(\w+)\s*[+=]\s*\d+[\s\S]{0,200}(if|when|unless)\s*\(\s*\1\s*[><=!]+\s*\w*(limit|max|threshold|quota)/i,
      // token bucket: consume → check remaining → reject/allow
      /tokens?\s*[<>=!]+\s*\d+[\s\S]{0,150}(reject|deny|block|wait|sleep|throw)/i,
      // sliding window: timestamp collection → window filter → count check
      /(Date\.now|time\.|timestamp|datetime)[\s\S]{0,300}(filter|where|select)[\s\S]{0,200}(length|count|size)\s*[><=]/i,
      // decorator/annotation pattern: @rate_limit, @throttle
      /@(rate_limit|throttle|ratelimit|limit_rate)/i,
      // middleware pattern: rate_limit middleware or limiter setup
      /(RateLimiter|TokenBucket|LeakyBucket|SlidingWindow)\s*\(/i,
      // throttle class or throttle_scope (Django REST etc)
      /(throttle_?scope|throttle_?class|num_?requests|SimpleRateThrottle|AnonRateThrottle|UserRateThrottle)/i,
      // rate/duration calculation (requests per second/minute/hour)
      /(rate|duration|period|window)\s*[=:]\s*['"]?\d+\s*\/?\s*(second|minute|hour|day|sec|min|hr)/i,
      // allow/deny based on rate: allow_request, check_throttle, is_throttled
      /(allow_?request|check_?throttl|is_?throttl|get_?rate|parse_?rate)\s*\(/i,
      // definition-side: class/function definitions for limiters
      /(def\s+allow_request|func\s+New\w*Limiter|class\s+\w*(Throttle|RateLimit|Limiter))/i,
    ],
    coSignals: [
      'throttle', 'rate_limit', 'ratelimit', 'backoff', 'cooldown',
      'quota', 'token_bucket', 'leaky_bucket', 'debounce', 'limiter',
      'sliding_window', 'requests_per', 'rpm', 'rps', 'rate_exceeded',
    ],
    intentSignals: [
      'rate limit', 'throttle', 'backoff', 'too many requests',
      'slow down', 'rate exceeded', 'quota exceeded', 'cooldown period',
    ],
    weight: 0.85,
  },

  // ── 2. ERROR RECOVERY / RESILIENCE ──────────────────────────────────────────
  {
    id: 'error-recovery',
    name: 'Error Recovery & Circuit Breaking',
    primitives: ['REFLEX', 'DEFENSE', 'MEDIC', 'IMMUNITY'],
    patterns: [
      // try → catch → retry pattern with counter
      /(try|begin)\s*[{:][\s\S]{0,500}(catch|except|rescue)[\s\S]{0,300}(retry|attempt|tries?\s*[<+=])/i,
      // circuit breaker: state tracking → failure count → open/close
      /(state|status)\s*===?\s*['"]?(open|closed|half.?open)['"]?/i,
      // exponential backoff: delay * multiplier or Math.pow
      /(delay|wait|sleep|timeout)\s*\*\s*(2|multiplier|factor|Math\.pow)/i,
      // fallback chain: primary fails → try secondary → try tertiary
      /(fallback|alternate|backup|secondary)\s*[=:][\s\S]{0,200}(catch|except|fail|error)/i,
      // retry with max attempts
      /(retries?|attempts?|tries)\s*[<>=!]+\s*(max|MAX|\d+)/i,
      // rescue/except blocks with error class handling (Ruby/Python)
      /(rescue|except)\s+(\w+Error|\w+Exception|StandardError|RuntimeError)/i,
      // failure/error handler method definitions
      /(on_?failure|handle_?error|error_?handler|fail_?safe)\s*[\(=:def]/i,
      // begin/ensure or try/finally patterns
      /(ensure|finally)\s*[{:\n][\s\S]{0,200}(close|cleanup|release|disconnect)/i,
    ],
    coSignals: [
      'retry', 'circuit_breaker', 'backoff', 'exponential', 'fallback',
      'resilience', 'recovery', 'failover', 'jitter', 'half_open',
      'bulkhead', 'timeout', 'dead_letter', 'compensate',
    ],
    intentSignals: [
      'circuit breaker', 'retry logic', 'fallback', 'error recovery',
      'graceful degradation', 'fault tolerance', 'self-healing',
      'TODO: add retry', 'TODO: handle failure', 'FIXME: no fallback',
    ],
    weight: 0.90,
  },

  // ── 3. INPUT VALIDATION / SANITIZATION ──────────────────────────────────────
  {
    id: 'input-validation',
    name: 'Input Validation & Sanitization',
    primitives: ['DEFENSE', 'ACCESS', 'GOVERNANCE'],
    patterns: [
      // schema validation: validate(input) or schema.parse(data)
      /(validate|sanitize|schema)\s*\.\s*(parse|check|verify|validate)\s*\(/i,
      // guard clause: if (!valid) throw / return early
      /if\s*\(\s*!?\s*(valid|isValid|validated|sanitized)[\s\S]{0,100}(throw|return|reject)/i,
      // type checking at function boundary
      /typeof\s+\w+\s*[!=]==?\s*['"]?(string|number|object|boolean)['"]?/i,
      // regex validation pattern
      /\/([\^]?[\[(].+[\])][\+\*\?]?.+\$?)\/(\.test|\.match|\.exec)\s*\(/i,
      // zod / joi / yup schema definition
      /(z\.|Joi\.|yup\.|schema\s*=)\s*\w+\s*\(\)/i,
    ],
    coSignals: [
      'validate', 'sanitize', 'escape', 'whitelist', 'blacklist',
      'schema', 'constraint', 'assertion', 'guard', 'invariant',
      'xss', 'sql_injection', 'parameterize', 'prepared_statement',
    ],
    intentSignals: [
      'validate input', 'sanitize', 'check input', 'user input',
      'TODO: validate', 'FIXME: no validation', 'unsafe input',
      'injection', 'untrusted data',
    ],
    weight: 0.90,
  },

  // ── 4. AUTHENTICATION / AUTHORIZATION ───────────────────────────────────────
  {
    id: 'auth-control',
    name: 'Authentication & Authorization',
    primitives: ['ACCESS', 'IDENTITY', 'GOVERNANCE'],
    patterns: [
      // token verification: verify(token) or jwt.verify
      /(verify|decode|validate)\s*\(\s*\w*(token|jwt|session|credential)/i,
      // role/permission check: hasRole, checkPermission, isAuthorized
      /(has_?role|check_?perm|is_?auth|can_?access|is_?allowed)\s*\(/i,
      // middleware auth guard: req.user, req.auth, context.user
      /(req|request|ctx|context)\s*\.\s*(user|auth|session|identity)\s/i,
      // password hashing: bcrypt, argon2, hash(password)
      /(bcrypt|argon2|scrypt|pbkdf2)\s*\.\s*(hash|compare|verify)/i,
      // OAuth flow: authorization_code, access_token, refresh_token
      /(authorization_code|access_token|refresh_token|grant_type)/i,
    ],
    coSignals: [
      'authenticate', 'authorize', 'permission', 'role', 'session',
      'token', 'jwt', 'oauth', 'credential', 'login', 'logout',
      'rbac', 'acl', 'policy', 'claim', 'scope',
    ],
    intentSignals: [
      'authentication', 'authorization', 'access control', 'permission',
      'TODO: add auth', 'FIXME: no auth check', 'security: verify user',
    ],
    weight: 0.80,
  },

  // ── 5. LOGGING / OBSERVABILITY ──────────────────────────────────────────────
  {
    id: 'observability',
    name: 'Logging & Observability',
    primitives: ['AUDIT', 'VISION', 'BEACON'],
    patterns: [
      // structured logging: logger.info({...}) or log.warn(message, context)
      /(logger|log)\s*\.\s*(info|warn|error|debug|trace|fatal)\s*\(/i,
      // metrics emission: metrics.increment, statsd, prometheus
      /(metrics?|statsd|prometheus|gauge|counter|histogram)\s*\.\s*(increment|observe|record|emit)/i,
      // tracing: span, trace, context propagation
      /(span|trace|tracer)\s*\.\s*(start|end|finish|set_?attribute)/i,
      // health check endpoint
      /['"]\/health['"]|['"]\/ready['"]|['"]\/live['"]|health_?check/i,
      // audit trail: log action with user + timestamp
      /(audit|trail|record)\s*\(\s*\{[\s\S]{0,200}(user|actor|action|timestamp)/i,
    ],
    coSignals: [
      'logger', 'logging', 'telemetry', 'metrics', 'tracing', 'span',
      'observability', 'monitoring', 'alert', 'dashboard', 'grafana',
      'datadog', 'sentry', 'opentelemetry', 'audit_log', 'structured_log',
    ],
    intentSignals: [
      'logging', 'observability', 'monitoring', 'TODO: add logging',
      'FIXME: no monitoring', 'need telemetry', 'add metrics',
    ],
    weight: 0.85,
  },

  // ── 6. COST / RESOURCE GOVERNANCE ───────────────────────────────────────────
  {
    id: 'cost-governance',
    name: 'Cost & Resource Governance',
    primitives: ['ECONOMY', 'ACCESS', 'GOVERNANCE'],
    patterns: [
      // budget check: if cost > budget → reject
      /(cost|price|budget|spend)\s*[><=!]+\s*\w*(limit|max|budget|threshold)/i,
      // usage metering: track tokens, API calls, compute time
      /(usage|meter|track|count)\s*\(\s*\{?[\s\S]{0,150}(tokens?|calls?|compute|cost)/i,
      // quota enforcement: check quota → allow/deny
      /(quota|allowance|credit)\s*[<>=!]+\s*\d+/i,
      // billing: charge, invoice, subscription
      /(charge|invoice|bill|subscription)\s*\.\s*(create|process|calculate)/i,
    ],
    coSignals: [
      'budget', 'cost', 'billing', 'metering', 'quota', 'credit',
      'pricing', 'usage', 'consumption', 'spend', 'invoice',
      'subscription', 'tier', 'overage', 'unit_cost',
    ],
    intentSignals: [
      'cost tracking', 'budget', 'billing', 'TODO: track costs',
      'FIXME: no cost limit', 'pricing', 'metering', 'resource limit',
    ],
    weight: 0.80,
  },

  // ── 7. STATE PERSISTENCE / CACHING ──────────────────────────────────────────
  {
    id: 'state-persistence',
    name: 'State Persistence & Caching',
    primitives: ['MEMORY', 'CORE', 'SANDBOX'],
    patterns: [
      // cache pattern: check cache → miss → compute → store
      /(cache|memo)\s*\.\s*(get|has)\s*\([\s\S]{0,200}(set|put|store)\s*\(/i,
      // write-through: save to both cache and DB
      /(save|write|persist|store)\s*\([\s\S]{0,300}(cache|redis|memcache)\s*\.\s*(set|put)/i,
      // TTL / expiration: expires, ttl, max_age
      /(ttl|expires?|max_?age|stale_?after)\s*[=:]\s*\d+/i,
      // serialization: serialize/deserialize, marshal/unmarshal, JSON.parse/stringify
      /(serialize|marshal|pickle|JSON\.stringify)[\s\S]{0,200}(deserialize|unmarshal|unpickle|JSON\.parse)/i,
      // LRU/LFU eviction: evict, capacity, least_recently
      /(evict|capacity|lru|lfu|max_?size)\s*[=:]/i,
    ],
    coSignals: [
      'cache', 'persist', 'serialize', 'deserialize', 'state',
      'snapshot', 'checkpoint', 'restore', 'ttl', 'expiration',
      'lru', 'memoize', 'redis', 'memcache', 'invalidate',
    ],
    intentSignals: [
      'cache', 'persist', 'state management', 'TODO: add caching',
      'FIXME: state lost', 'need persistence', 'save state',
    ],
    weight: 0.75,
  },

  // ── 8. ENCRYPTION / DATA PROTECTION ─────────────────────────────────────────
  {
    id: 'encryption',
    name: 'Encryption & Data Protection',
    primitives: ['DEFENSE', 'SOVEREIGN', 'PHANTOM'],
    patterns: [
      // encrypt/decrypt flow
      /(encrypt|cipher|encipher)\s*\([\s\S]{0,300}(decrypt|decipher)\s*\(/i,
      // key derivation or key management
      /(derive_?key|generate_?key|key_?pair|createCipher)/i,
      // hash with salt
      /(hash|digest)\s*\([\s\S]{0,100}(salt|pepper|nonce)/i,
      // AES/RSA/HMAC usage
      /(aes|rsa|hmac|ecdsa|ed25519|chacha)\s*[-_.]?\s*(encrypt|sign|verify|256|128|512)/i,
      // TLS/SSL configuration
      /(tls|ssl)\s*[=:.\[]\s*[\s\S]{0,100}(cert|key|ca|verify)/i,
      // definition-side: cipher/encrypt class and function definitions
      /(class\s+\w*(Cipher|Encrypt|Crypt)|def\s+(encrypt|decrypt)|fn\s+(encrypt|decrypt))/i,
      // NaCl/libsodium specific patterns
      /(NaCl|nacl|secretbox|crypto_box|seal\s*\()/i,
    ],
    coSignals: [
      'encrypt', 'decrypt', 'cipher', 'aes', 'rsa', 'hmac', 'hash',
      'salt', 'nonce', 'iv', 'key_pair', 'certificate', 'tls', 'ssl',
      'pki', 'signing', 'envelope', 'kms', 'vault', 'secrets',
    ],
    intentSignals: [
      'encrypt', 'data protection', 'TODO: encrypt', 'FIXME: plaintext',
      'sensitive data', 'PII', 'HIPAA', 'GDPR', 'at rest', 'in transit',
    ],
    weight: 0.85,
  },

  // ── 9. CONCURRENCY / PARALLELISM ────────────────────────────────────────────
  {
    id: 'concurrency',
    name: 'Concurrency & Parallelism',
    primitives: ['CORTEX', 'NERVE', 'RIPPLE'],
    patterns: [
      // mutex/lock: acquire → critical section → release
      /(mutex|lock|semaphore)\s*\.\s*(acquire|lock|wait)\s*\([\s\S]{0,500}(release|unlock|signal)\s*\(/i,
      // Promise.all / concurrent execution
      /Promise\s*\.\s*(all|allSettled|race)\s*\(\s*\[/i,
      // worker/thread pool
      /(Worker|Thread|Pool)\s*\(\s*[\s\S]{0,100}(postMessage|submit|execute)/i,
      // async queue / channel
      /(queue|channel|buffer)\s*\.\s*(push|send|put|enqueue)[\s\S]{0,300}(pop|receive|get|dequeue)/i,
      // Go-style goroutine/select or Rust async
      /(go\s+func|select\s*\{|tokio::spawn|async\s+fn)/i,
    ],
    coSignals: [
      'mutex', 'lock', 'semaphore', 'thread', 'worker', 'parallel',
      'concurrent', 'atomic', 'channel', 'queue', 'pool', 'async',
      'await', 'coroutine', 'goroutine', 'spawn', 'fork', 'join',
    ],
    intentSignals: [
      'concurrency', 'parallel', 'thread safety', 'race condition',
      'TODO: thread safe', 'FIXME: data race', 'deadlock', 'lock-free',
    ],
    weight: 0.70,
  },

  // ── 10. DATA PIPELINE / ETL ─────────────────────────────────────────────────
  {
    id: 'data-pipeline',
    name: 'Data Pipeline & ETL',
    primitives: ['HARVEST', 'FORGE', 'CORTEX'],
    patterns: [
      // extract → transform → load chain
      /(extract|fetch|read|ingest)\s*\([\s\S]{0,500}(transform|process|map|convert)[\s\S]{0,500}(load|write|save|insert)/i,
      // stream processing: pipe, pipeline, stream.on
      /(pipe|pipeline|stream)\s*\.\s*(pipe|on|transform|through)\s*\(/i,
      // batch processing: chunk, batch, page
      /(chunk|batch|page|partition)\s*\(\s*\w+\s*,\s*\d+/i,
      // deduplication: dedupe, unique, distinct
      /(dedupe|deduplicate|distinct|unique)\s*\(/i,
      // data validation + cleaning
      /(clean|normalize|standardize)\s*\([\s\S]{0,200}(data|record|row|entry)/i,
      // definition-side: DAG/Task/Flow/Op class definitions (Airflow, Prefect, Dagster, Luigi)
      /(class\s+\w*(DAG|Task|Flow|Pipeline|Op)|def\s+(run|execute|extract|transform|load)\s*\(self)/i,
      // task dependency: upstream/downstream, requires, depends_on
      /(upstream|downstream|requires|depends_on|set_upstream|set_downstream|>>|<<)\s*/i,
      // @task, @op, @flow decorators
      /@(task|op|flow|pipeline|dag)\s*[\(\n]/i,
    ],
    coSignals: [
      'pipeline', 'etl', 'extract', 'transform', 'load', 'ingest',
      'batch', 'stream', 'crawl', 'scrape', 'deduplicate', 'normalize',
      'warehouse', 'staging', 'sink', 'source', 'connector',
    ],
    intentSignals: [
      'data pipeline', 'ETL', 'data processing', 'TODO: add pipeline',
      'ingestion', 'data flow', 'batch processing', 'stream processing',
    ],
    weight: 0.70,
  },

  // ── 11. TESTING / SANDBOXING ────────────────────────────────────────────────
  {
    id: 'testing',
    name: 'Testing & Safe Execution',
    primitives: ['SANDBOX', 'ECHO', 'SHADOW'],
    patterns: [
      // test framework: describe/it/test block declarations
      /(describe|it|test)\s*\(\s*['"]/i,
      // assertion patterns (independent from describe)
      /(expect|assert|should)\s*\(/i,
      // mock/stub/spy
      /(mock|stub|spy|fake)\s*\(\s*\w+[\s\S]{0,200}(returns?|resolves?|rejects?|callsFake)/i,
      // snapshot testing
      /(toMatchSnapshot|toMatchInlineSnapshot|snapshot_testing)/i,
      // isolated environment: sandbox, container, vm
      /(sandbox|isolate|container|vm\.create|new\s+VM)\s*\(/i,
      // property-based testing
      /(fc\.property|forAll|hypothesis|quickcheck|prop_?test)/i,
    ],
    coSignals: [
      'test', 'spec', 'mock', 'stub', 'fixture', 'sandbox', 'isolate',
      'assert', 'expect', 'snapshot', 'coverage', 'integration_test',
      'unit_test', 'e2e', 'regression', 'smoke_test',
    ],
    intentSignals: [
      'test', 'TODO: add tests', 'FIXME: untested', 'need coverage',
      'no tests', 'testing', 'test case', 'edge case',
    ],
    weight: 0.65,
  },

  // ── 12. EVENT SOURCING / AUDIT TRAIL ────────────────────────────────────────
  {
    id: 'event-sourcing',
    name: 'Event Sourcing & Audit Trail',
    primitives: ['AUDIT', 'MEMORY', 'NERVE'],
    patterns: [
      // event store: append event → replay/project
      /(append|emit|publish)\s*\(\s*\{[\s\S]{0,200}(type|event_?type|action)[\s\S]{0,100}(payload|data|body)/i,
      // projection/reducer: events → current state
      /(reduce|project|fold|aggregate)\s*\(\s*\w+[\s\S]{0,200}(events?|history|log)/i,
      // immutable log: append-only, no updates/deletes
      /(append_?only|immutable|tamper_?proof|merkle)/i,
      // event replay: replay, rehydrate, reconstruct
      /(replay|rehydrate|reconstruct)\s*\(\s*\w*(events?|history|log)/i,
    ],
    coSignals: [
      'event', 'sourcing', 'audit', 'trail', 'log', 'append', 'replay',
      'projection', 'aggregate', 'command', 'cqrs', 'immutable',
      'merkle', 'tamper_proof', 'chain', 'ledger',
    ],
    intentSignals: [
      'event sourcing', 'audit trail', 'audit log', 'TODO: add audit',
      'FIXME: no trail', 'traceability', 'compliance logging',
    ],
    weight: 0.80,
  },

  // ── 13. DEPENDENCY INJECTION / MODULARITY ───────────────────────────────────
  {
    id: 'dependency-injection',
    name: 'Dependency Injection & Modularity',
    primitives: ['INTEGRATION', 'CORE', 'ENGINEER'],
    patterns: [
      // constructor injection: constructor(private service: Service)
      /constructor\s*\([\s\S]{0,300}(private|readonly)\s+\w+:\s*\w+/i,
      // container registration: container.register, bind, provide
      /(container|injector|provider)\s*\.\s*(register|bind|provide)\s*\(/i,
      // definition-side: DI container/injector/provider/registry classes
      /(class\s+\w*(Container|Injector|Provider|Registry)|@Injectable|@Inject|@Component)/i,
      // factory pattern: createXxx, buildXxx, makeXxx
      /(create|build|make|factory)\s*(Service|Repository|Handler|Client)\s*\(/i,
      // interface-based: implements, interface + class
      /(implements|interface)\s+\w+[\s\S]{0,500}class\s+\w+\s+implements/i,
      // module/plugin registration: register_module, add_plugin, use()
      /(register_?module|add_?plugin|include\s+\w+|extend\s+\w+Module)\s*/i,
      // require/import + instantiate pattern (Node/Python/Ruby)
      /(require|import)\s*\(?['"][\w\/.-]+['"]\)?\s*[\n;][\s\S]{0,200}new\s+\w+/i,
      // Go wire/fx/dig style injection
      /(fx\.Provide|dig\.Provide|wire\.Build|wire\.NewSet)\s*\(/i,
    ],
    coSignals: [
      'inject', 'container', 'provider', 'factory', 'singleton',
      'module', 'plugin', 'adapter', 'interface', 'abstraction',
      'registry', 'resolver', 'dependency', 'inversion',
    ],
    intentSignals: [
      'dependency injection', 'DI', 'inversion of control', 'IoC',
      'TODO: decouple', 'FIXME: tight coupling', 'modular',
    ],
    weight: 0.55,
  },

  // ── 14. SELF-EVOLUTION / VERSION MANAGEMENT ─────────────────────────────────
  {
    id: 'self-evolution',
    name: 'Self-Evolution & Version Management',
    primitives: ['EVOLUTION', 'DREAM', 'ENGINEER'],
    patterns: [
      // migration: up/down, version tracking
      /(migrate|migration)\s*\.\s*(up|down|run|execute)/i,
      // feature flags: isEnabled, flag, toggle
      /(feature_?flag|is_?enabled|toggle|canary)\s*\(\s*['"]?\w+/i,
      // A/B testing: variant, experiment, cohort
      /(variant|experiment|cohort|ab_?test)\s*[=:]\s*/i,
      // shadow deployment: shadow, dark launch, blue-green
      /(shadow|dark_?launch|blue_?green|canary_?deploy)/i,
      // self-update: check version → download → apply
      /(check_?update|auto_?update|self_?update|upgrade_?available)/i,
    ],
    coSignals: [
      'migration', 'version', 'upgrade', 'patch', 'rollback', 'deploy',
      'feature_flag', 'canary', 'experiment', 'shadow', 'evolution',
      'promotion', 'deprecate', 'backward_compatible',
    ],
    intentSignals: [
      'migration', 'version', 'upgrade', 'TODO: version control',
      'self-healing', 'auto-update', 'evolution', 'self-improving',
    ],
    weight: 0.75,
  },

  // ── 15. DATA SOVEREIGNTY / COMPLIANCE ───────────────────────────────────────
  {
    id: 'data-sovereignty',
    name: 'Data Sovereignty & Compliance',
    primitives: ['SOVEREIGN', 'CONSCIENCE', 'GOVERNANCE'],
    patterns: [
      // consent management: getConsent, checkConsent, consentRequired
      /(consent|gdpr|hipaa|ccpa|privacy)\s*\.\s*(check|get|require|verify)/i,
      // data residency: region, jurisdiction, locale enforcement
      /(region|jurisdiction|residency|locale)\s*[=:]\s*['"]?\w+[\s\S]{0,200}(enforce|restrict|route)/i,
      // right to deletion: delete_user_data, purge, anonymize
      /(delete_?user|purge|anonymize|pseudonymize|forget_?me|erasure)\s*\(/i,
      // data classification: classify, sensitivity, pii_fields
      /(classify|sensitivity|pii|phi|confidential)\s*[=:]/i,
      // compliance decorators/annotations
      /@(gdpr|hipaa|compliance|protected_data|data_protection)/i,
      // data retention/expiry policies
      /(retention_?policy|data_?retention|expire_?after|purge_?after|right_?to_?forget)\s*[=:\(]/i,
      // Authorization/Forbidden exceptions (Java/Go patterns)
      /(AuthorizationException|ForbiddenException|AccessDenied|Unauthorized)\s*/i,
      // Disclosed/credential/attribute-based access (IRMA, SSI patterns)
      /(Disclosed|DisclosedAttribute|credential|attribute_?based|verifiable_?credential)\s*[=:\[{]/i,
      // Session result with disclosure (privacy-preserving identity)
      /(SessionResult|SessionHandler|SessionPackage)\s*/i,
      // Privacy policy / terms / legal basis references
      /(legal_?basis|lawful_?basis|legitimate_?interest|data_?subject|data_?controller)\s*[=:]/i,
    ],
    coSignals: [
      'gdpr', 'hipaa', 'ccpa', 'compliance', 'consent', 'privacy',
      'sovereignty', 'jurisdiction', 'anonymize', 'pseudonymize',
      'erasure', 'retention', 'data_subject', 'controller', 'processor',
      'authorization', 'forbidden', 'unauthorized', 'disclosed',
      'credential', 'attribute', 'verifiable', 'session_result',
    ],
    intentSignals: [
      'GDPR', 'HIPAA', 'compliance', 'data protection', 'privacy',
      'TODO: GDPR', 'FIXME: no consent', 'data sovereignty', 'PII',
      'authorization', 'forbidden', 'access denied', 'disclosure',
    ],
    weight: 0.85,
  },

  // ── 16. AI / ML INFERENCE ───────────────────────────────────────────────────
  {
    id: 'ml-inference',
    name: 'AI / ML Inference',
    primitives: ['NEXUS', 'BRAIN', 'ORACLE'],
    patterns: [
      // model loading and inference: model.predict, inference, forward
      /(model|net|classifier)\s*\.\s*(predict|forward|infer|generate|classify)\s*\(/i,
      // tokenization + embedding: tokenize → encode → embed
      /(tokenize|encode|embed)\s*\([\s\S]{0,200}(vector|tensor|embedding|feature)/i,
      // prompt template: system message + user message
      /(system|user|assistant)\s*[=:]\s*['"`][\s\S]{0,200}(prompt|message|instruction)/i,
      // multi-model routing: select model based on criteria
      /(select_?model|model_?select|router|dispatch)\s*\([\s\S]{0,200}(model|provider|engine)/i,
      // confidence/probability output
      /(confidence|probability|score|logit)\s*[=:]\s*[\s\S]{0,100}(softmax|sigmoid|threshold)/i,
    ],
    coSignals: [
      'model', 'inference', 'predict', 'embedding', 'vector', 'tensor',
      'transformer', 'attention', 'llm', 'gpt', 'prompt', 'completion',
      'fine_tune', 'training', 'epoch', 'gradient', 'loss', 'optimizer',
    ],
    intentSignals: [
      'machine learning', 'AI', 'model', 'inference', 'prediction',
      'TODO: add ML', 'neural network', 'deep learning', 'NLP',
    ],
    weight: 0.75,
  },

  // ── 17. ACCESSIBILITY / INCLUSIVE DESIGN ─────────────────────────────────────
  {
    id: 'accessibility',
    name: 'Accessibility & Inclusive Design',
    primitives: ['INCLUSIVE', 'CONSCIENCE', 'VISION'],
    patterns: [
      // ARIA attributes: aria-label, aria-describedby, role
      /(aria-label|aria-describedby|aria-live|role=)/i,
      // screen reader support: sr-only, visually-hidden
      /(sr-only|visually-hidden|screen-reader|a11y)/i,
      // focus management: focus trap, tab index, keyboard nav
      /(focus_?trap|tabindex|tab_?index|keyboard_?nav|key_?handler)/i,
      // color contrast check: contrast_ratio, wcag
      /(contrast_?ratio|wcag|color_?blind|high_?contrast)/i,
      // alt text: alt=, aria-label on img
      /(<img|Image)\s+[\s\S]{0,100}alt\s*=\s*['"][^'"]+['"]/i,
      // semantic HTML elements
      /(role\s*=\s*['"]?(button|navigation|banner|main|complementary|dialog|alert))/i,
      // skip navigation / skip links
      /(skip.?nav|skip.?link|skip.?to.?content|skip.?main)/i,
      // Audit/Rule/Check classes used in a11y tooling (axe-core etc.)
      /class\s+\w*(Audit|Rule|Check)[\s\S]{0,200}(rules?|checks?|violations?|passes)/i,
      // axe-core or lighthouse a11y patterns
      /(axe|lighthouse|pa11y|deque)\s*[\.\(]/i,
      // WCAG level references: Level A, AA, AAA
      /(level\s*[=:]\s*['"]?AA?A?['"]?|wcag\s*\d)/i,
    ],
    coSignals: [
      'accessibility', 'a11y', 'aria', 'wcag', 'screen_reader',
      'keyboard', 'focus', 'contrast', 'alt_text', 'semantic',
      'landmark', 'heading_level', 'skip_link', 'caption',
      'audit', 'rule', 'check', 'violation', 'axe', 'deque',
    ],
    intentSignals: [
      'accessibility', 'a11y', 'WCAG', 'screen reader', 'TODO: a11y',
      'FIXME: not accessible', 'keyboard navigation', 'color contrast',
      'audit', 'violation', 'rule', 'check',
    ],
    weight: 0.75,
  },

  // ── 18. NETWORKING / API DESIGN ─────────────────────────────────────────────
  {
    id: 'api-design',
    name: 'API Design & Networking',
    primitives: ['RELAY', 'INTEGRATION', 'ACCESS'],
    patterns: [
      // REST endpoint: app.get/post/put/delete
      /(app|router)\s*\.\s*(get|post|put|patch|delete)\s*\(\s*['"]/i,
      // GraphQL: type Query, resolver, schema
      /(type\s+Query|type\s+Mutation|resolver|gql`)/i,
      // WebSocket: ws.on, socket.emit
      /(ws|socket|io)\s*\.\s*(on|emit|send|broadcast)\s*\(\s*['"]?\w+/i,
      // API versioning: /v1/, /v2/, api_version
      /\/v\d+\/|api_?version\s*[=:]\s*\d+/i,
      // Request/Response types: req, res, ctx, handler
      /\(\s*(req|request)\s*[,:]\s*\w+[\s\S]{0,100}(res|response)\s*[,:]\s*\w+/i,
    ],
    coSignals: [
      'endpoint', 'route', 'handler', 'middleware', 'rest', 'graphql',
      'websocket', 'grpc', 'api', 'request', 'response', 'status_code',
      'header', 'cors', 'pagination', 'openapi', 'swagger',
    ],
    intentSignals: [
      'API', 'endpoint', 'REST', 'GraphQL', 'TODO: add API',
      'webhook', 'integration', 'external service',
    ],
    weight: 0.55,
  },

  // ── 19. INTERNATIONALIZATION / LOCALIZATION ─────────────────────────────────
  {
    id: 'i18n',
    name: 'Internationalization & Localization',
    primitives: ['LINGUA', 'COMPASS', 'INCLUSIVE'],
    patterns: [
      // i18n function: t('key'), i18n.t, formatMessage
      /(^|[^a-z])t\s*\(\s*['"][\w.]+['"]\s*\)|i18n\s*\.\s*t\s*\(|formatMessage\s*\(/im,
      // locale detection: navigator.language, Accept-Language
      /(navigator\s*\.\s*language|Accept-Language|locale|getLocale)/i,
      // plural rules: plural, count, _one, _other
      /(plural|Plural|_one|_other|_few|_many)\s*[=:]/i,
      // number/date formatting: Intl.NumberFormat, Intl.DateTimeFormat
      /Intl\s*\.\s*(NumberFormat|DateTimeFormat|RelativeTimeFormat|Collator)/i,
      // definition-side: translator/localizer/i18n classes and gettext
      /(class\s+\w*(Translator|Localizer|I18n)|gettext\s*\(|ngettext\s*\(|_\s*\(\s*['"])/i,
    ],
    coSignals: [
      'i18n', 'l10n', 'locale', 'translate', 'translation', 'language',
      'plural', 'icu', 'intl', 'rtl', 'ltr', 'bidi', 'unicode',
      'gettext', 'message_catalog', 'string_table',
    ],
    intentSignals: [
      'internationalization', 'localization', 'i18n', 'translation',
      'TODO: i18n', 'FIXME: hardcoded strings', 'multi-language',
    ],
    weight: 0.55,
  },

  // ── 20. PREDICTIVE / STATISTICAL ANALYSIS ───────────────────────────────────
  {
    id: 'predictive-analysis',
    name: 'Predictive & Statistical Analysis',
    primitives: ['ORACLE', 'BRAIN', 'DREAM'],
    patterns: [
      // statistical functions: mean, std, variance, correlation
      /(mean|median|std|variance|correlation|covariance)\s*\(/i,
      // bayesian: prior, posterior, likelihood, bayes
      /(prior|posterior|likelihood|bayesian|bayes_?theorem)/i,
      // definition-side: model/forecaster/detector/classifier classes + fit/predict
      /(class\s+\w*(Model|Forecaster|Detector|Classifier)|\.fit\s*\(|\.score\s*\(|\.predict\s*\()/i,
      // monte carlo: simulation, random sampling
      /(monte_?carlo|simulation|random_?sample|bootstrap)\s*\(/i,
      // time series: forecast, seasonal, trend, arima
      /(forecast|seasonal|trend|arima|exponential_?smoothing|moving_?average)/i,
      // anomaly detection: outlier, z_score, iqr
      /(outlier|z_?score|iqr|anomaly_?detect|isolation_?forest|mad)\s*[\(=:]/i,
    ],
    coSignals: [
      'predict', 'forecast', 'regression', 'classification', 'cluster',
      'bayesian', 'monte_carlo', 'simulation', 'probability', 'distribution',
      'hypothesis', 'confidence_interval', 'p_value', 'chi_square',
    ],
    intentSignals: [
      'prediction', 'forecast', 'statistical', 'TODO: add prediction',
      'anomaly detection', 'trend analysis', 'time series',
    ],
    weight: 0.75,
  },

  // ── 21. HEURISTIC SYNTHESIS / AUTONOMOUS LEARNING ───────────────────────────
  {
    id: 'heuristic-synthesis',
    name: 'Heuristic Synthesis & Autonomous Learning',
    primitives: ['DREAM', 'EVOLUTION', 'BRAIN'],
    patterns: [
      // learning loop: observe → hypothesize → test → adapt
      /(learn|adapt|evolve|improve)\s*\([\s\S]{0,300}(feedback|reward|outcome|score)/i,
      // genetic/evolutionary: mutate, crossover, fitness, select
      /(mutate|crossover|fitness|selection|generation)\s*\(/i,
      // definition-side: agent/policy/environment/learner classes
      /(class\s+\w*(Agent|Policy|Environment|Learner)|def\s+(fit|train|update)\s*\(self)/i,
      // optimizer/learning functions: learning_rate, weight_decay, momentum, adam, sgd
      /(learning_?rate|weight_?decay|momentum|gradient_?transform|GradientTransformation)\s*[=:\(]/i,
      // reinforcement: reward, policy, action, state, q_value
      /(reward|policy|q_?value|action_?space|state_?space)\s*[=:]/i,
      // consolidation / knowledge distillation
      /(consolidate|distill|compress|prune|quantize)\s*\([\s\S]{0,200}(knowledge|model|weights?)/i,
      // autonomous cycle: schedule → execute → evaluate → iterate
      /(schedule|cron|interval|periodic)\s*\([\s\S]{0,300}(evaluate|assess|score|measure)/i,
    ],
    coSignals: [
      'heuristic', 'synthesis', 'autonomous', 'learning', 'adaptation',
      'evolution', 'genetic', 'mutation', 'fitness', 'reinforcement',
      'reward', 'policy', 'exploration', 'exploitation', 'convergence',
    ],
    intentSignals: [
      'machine learning', 'autonomous', 'self-improving', 'heuristic',
      'TODO: learn from', 'adaptive', 'evolving', 'auto-tune',
    ],
    weight: 0.80,
  },

  // ── 22. DIGITAL TWIN / SIMULATION ───────────────────────────────────────────
  {
    id: 'simulation',
    name: 'Digital Twin & Simulation',
    primitives: ['ECHO', 'SHADOW', 'PHANTOM'],
    patterns: [
      // simulation loop: step, tick, simulate, advance
      /(simulate|tick|step|advance)\s*\([\s\S]{0,200}(state|world|environment|model)/i,
      // scenario replay: replay, playback, rewind
      /(replay|playback|rewind|reconstruct)\s*\([\s\S]{0,200}(event|state|history)/i,
      // definition-side: simulator/environment/world/agent classes
      /(class\s+\w*(Simulator|Environment|World|Agent)|def\s+(step|reset|render)\s*\(self)/i,
      // divergence scoring: compare, diff, diverge
      /(diverge|diff|compare|delta)\s*\([\s\S]{0,200}(actual|expected|baseline|production)/i,
      // mock environment: virtual, simulated, synthetic
      /(virtual|simulated|synthetic|mock_?env)\s*[=:]/i,
    ],
    coSignals: [
      'simulation', 'digital_twin', 'replica', 'mirror', 'shadow',
      'scenario', 'replay', 'divergence', 'baseline', 'what_if',
      'counterfactual', 'virtual', 'synthetic', 'emulate',
    ],
    intentSignals: [
      'simulation', 'digital twin', 'shadow mode', 'what-if analysis',
      'TODO: simulate', 'replay', 'scenario testing',
    ],
    weight: 0.70,
  },

  // ── 23. DECEPTION / COUNTER-INTELLIGENCE ────────────────────────────────────
  {
    id: 'deception',
    name: 'Deception & Counter-Intelligence',
    primitives: ['PHANTOM', 'DEFENSE', 'SHADOW'],
    patterns: [
      // honeypot: trap, decoy, canary — class or variable naming
      /(honeypot|decoy|canary|trap)\s*[=:.\(]/i,
      // Honeypot class/object definition (Glastopf, Cowrie, etc.)
      /class\s+\w*(Honeypot|Honeynet|HoneyTrap|Cowrie|Glastopf)/i,
      // token/watermark: watermark, fingerprint, canary_token
      /(watermark|canary_?token|beacon_?url|tracking_?pixel)\s*[=:]/i,
      // obfuscation: obfuscate, mangle, minify
      /(obfuscate|mangle|scramble|disguise)\s*\(/i,
      // deception response: fake data, misleading, redirect attacker
      /(fake_?data|mislead|redirect_?attacker|tar_?pit)\s*[=:\(]/i,
      // code obfuscation / anti-reverse-engineering markers
      /(anti_?debug|anti_?tamper|integrity_?check|code_?sign|checksum_?verify)\s*[\(=:]/i,
      // steganography / hidden channel patterns
      /(stegan|hidden_?channel|covert_?channel|embed_?payload|encode_?payload)\s*[\(=:]/i,
      // emulator-based deception: emulators, vulnerability emulation, dork
      /(emulat|vuln_?emulat|dork|sandbox_?escape|lure)\s*[=:\(_.]/i,
      // SSH/telnet honeypot protocol keywords
      /(cowrie|kippo|dionaea|conpot|thug|mailoney)\s*/i,
    ],
    coSignals: [
      'honeypot', 'decoy', 'canary', 'trap', 'deception', 'watermark',
      'obfuscate', 'mangle', 'disguise', 'counter_intelligence',
      'tar_pit', 'beacon', 'bait', 'lure', 'steganography',
      'emulator', 'dork', 'glastopf', 'cowrie', 'kippo',
    ],
    intentSignals: [
      'honeypot', 'deception', 'canary token', 'counter-intelligence',
      'TODO: add decoy', 'trap', 'bait', 'misdirect',
      'emulate', 'vulnerability emulation', 'fake service',
    ],
    weight: 0.70,
  },

  // ── 24. BIAS / ETHICAL ASSESSMENT ───────────────────────────────────────────
  {
    id: 'ethical-assessment',
    name: 'Bias Detection & Ethical Assessment',
    primitives: ['CONSCIENCE', 'INCLUSIVE', 'GOVERNANCE'],
    patterns: [
      // fairness metrics: disparate impact, equal opportunity
      /(disparate_?impact|equal_?opportunity|demographic_?parity|equalized_?odds)/i,
      // bias detection: check_bias, measure_fairness, protected_attribute
      /(bias|fairness|protected_?attribute|sensitive_?feature)\s*[=:\(]/i,
      // ethical gate: ethics_check, review_required, human_in_loop
      /(ethics?_?check|review_?required|human_?in_?loop|approval_?gate)/i,
      // explainability: explain, interpret, shap, lime
      /(explain|interpret|shap_?value|lime|feature_?importance)\s*[\(=:]/i,
    ],
    coSignals: [
      'bias', 'fairness', 'ethics', 'equity', 'discrimination',
      'disparate', 'protected', 'sensitive', 'explainability',
      'interpretability', 'accountability', 'transparency', 'audit',
    ],
    intentSignals: [
      'bias', 'fairness', 'ethical', 'TODO: check bias', 'discrimination',
      'equity', 'responsible AI', 'explainability', 'FIXME: biased',
    ],
    weight: 0.80,
  },

  // ── 25. EMBEDDED / HARDWARE ABSTRACTION ───────────────────────────────────
  {
    id: 'embedded-hal',
    name: 'Embedded Systems & Hardware Abstraction',
    primitives: ['CORE', 'REFLEX', 'NERVE'],
    patterns: [
      // HAL / peripheral singletons
      /(HAL|hal|Peripherals?|peripheral_?driver)\s*[=:\.<{]/i,
      // GPIO / pin control
      /(gpio|pin|GPIO|digital_?write|digital_?read|set_?high|set_?low)\s*[\(=:.]/i,
      // Interrupt handling
      /(interrupt|irq|ISR|isr_?handler|critical_?section|disable_?interrupt)\s*[\(=:]/i,
      // Clock / timer configuration
      /(clock|timer|watchdog|systick|prescaler)\s*[\(=:.]/i,
      // no_std / bare-metal markers
      /(no_?std|bare.?metal|embedded.?hal|cortex.?m|riscv|xtensa)\s*/i,
      // Register-level access
      /(register|mmio|volatile|read_?reg|write_?reg|bitfield)\s*[\(=:.]/i,
      // DMA / bus configuration
      /(dma|spi|i2c|uart|usart|can_?bus|adc|dac|pwm)\s*[\(=:.]/i,
    ],
    coSignals: [
      'peripheral', 'gpio', 'interrupt', 'register', 'hal', 'embedded',
      'bare_metal', 'no_std', 'cortex', 'riscv', 'dma', 'spi', 'i2c',
      'uart', 'watchdog', 'timer', 'clock', 'pin', 'singleton',
    ],
    intentSignals: [
      'hardware abstraction', 'HAL', 'peripheral', 'embedded',
      'bare-metal', 'no_std', 'microcontroller', 'GPIO', 'interrupt',
    ],
    weight: 0.65,
  },

  // ── 26. CODE SMELLS / SECURITY GAPS (gap-class) ─────────────────────────────
  // Detects anti-patterns the substrate should *flag* as opportunities for
  // upgrade. Maps to DEFENSE/CONSCIENCE/IMMUNITY so the gap surfaces in
  // capability discovery instead of being silently exported.
  {
    id: 'security-gaps',
    name: 'Security Smells & Anti-Patterns',
    primitives: ['DEFENSE', 'CONSCIENCE', 'IMMUNITY'],
    patterns: [
      // SQL string concat / template-literal injection
      /(query|execute|exec)\s*\(\s*["'`][^"'`]*\$?\{?\s*\w+\s*\}?[^"'`]*["'`]\s*\+/i,
      /["'`]\s*SELECT[\s\S]{0,80}["'`]\s*\+\s*\w+/i,
      // Hardcoded secrets / API keys
      /(api[_-]?key|secret|password|token)\s*[:=]\s*["'][A-Za-z0-9_\-]{12,}["']/i,
      /Authorization\s*:\s*["']Bearer\s+[A-Za-z0-9_\-]{12,}["']/i,
      // C# blocking async (.Result / .Wait()) on Task
      /\.\s*(Result|Wait)\s*\(\s*\)\s*;/,
      // Ruby blanket rescue
      /\brescue\s+Exception\b/,
      // Bare except: in Python
      /^\s*except\s*:\s*$/m,
      // eval / exec / Function constructor
      /\b(eval|exec|Function)\s*\(\s*[\w.+]+\s*\)/,
      // innerHTML with variable (XSS)
      /\.\s*innerHTML\s*=\s*[^"'`;]+[\w)]/,
      // shell injection patterns
      /(child_process|subprocess|os\.system|Runtime\.getRuntime\(\)\.exec)\s*[\.\(]/,
      // missing TLS verification
      /(verify\s*[:=]\s*false|rejectUnauthorized\s*:\s*false|InsecureSkipVerify\s*:\s*true)/i,
    ],
    coSignals: [
      'eval', 'exec', 'innerhtml', 'rescue', 'unsafe', 'todo', 'fixme',
      'hack', 'xxx', 'temporary', 'workaround', 'plaintext',
      'password', 'secret', 'apikey', 'token', 'hardcoded',
    ],
    intentSignals: [
      'TODO', 'FIXME', 'HACK', 'XXX', 'unsafe', 'insecure',
      'remove before commit', 'do not ship', 'temporary fix',
    ],
    weight: 0.95,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — SCANNING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract comment/docstring content from code for intent channel analysis.
 * Language-agnostic: handles //, #, /★...★/, """, ''', --, etc.
 */
function extractIntentLayer(code: string): string {
  const commentPatterns = [
    /\/\/[^\n]*/g,                    // JS/TS/Go/Rust single-line
    /#[^\n]*/g,                       // Python/Ruby/Shell
    /\/\*[\s\S]*?\*\//g,             // Block comments
    /"""[\s\S]*?"""/g,               // Python docstrings (double)
    /'''[\s\S]*?'''/g,               // Python docstrings (single)
    /--[^\n]*/g,                      // SQL/Lua/Haskell
    /\{-[\s\S]*?-\}/g,              // Haskell block
    /<!--[\s\S]*?-->/g,             // HTML
  ];

  const fragments: string[] = [];
  for (const pat of commentPatterns) {
    const matches = code.match(pat);
    if (matches) fragments.push(...matches);
  }
  return fragments.join(' ').toLowerCase();
}

/**
 * Run all structural signatures against code content.
 * Returns matches with tristate classification and confidence scores.
 */
export function runStructuralAnalysis(codeContent: string): StructuralMatch[] {
  const lowerCode = codeContent.toLowerCase();
  const intentLayer = extractIntentLayer(codeContent);
  const matches: StructuralMatch[] = [];

  for (const arch of ARCHETYPES) {
    // Structural pattern matching (against original case for regex accuracy)
    let structuralHits = 0;
    for (const pattern of arch.patterns) {
      if (pattern.test(codeContent)) structuralHits++;
    }

    // Lexical co-signal matching
    let lexicalHits = 0;
    for (const sig of arch.coSignals) {
      if (lowerCode.includes(sig)) lexicalHits++;
    }

    // Intent channel matching (comments/docstrings)
    let intentHits = 0;
    for (const sig of arch.intentSignals) {
      if (intentLayer.includes(sig.toLowerCase())) intentHits++;
    }

    // Skip noise: require structural evidence OR meaningful lexical/intent density.
    // Without this gate, single coSignal overlaps (e.g. "state", "log") produce
    // hundreds of LOW-confidence false positives that drown real detections.
    const hasStructural = structuralHits >= 1;
    const hasLexicalDensity = lexicalHits >= 3;
    const hasIntentSignal = intentHits >= 1;
    const hasLexicalPlusIntent = lexicalHits >= 2 && intentHits >= 1;

    if (!hasStructural && !hasLexicalDensity && !hasLexicalPlusIntent && !hasIntentSignal) continue;

    // ── Tristate classification ──
    // PRESENT: structural match + at least one supporting channel
    // PARTIAL: lexical/intent signals suggest capability exists but no flow proof
    let state: PresenceState;
    if (hasStructural && (lexicalHits >= 2 || hasIntentSignal)) {
      state = 'present';
    } else if (hasStructural || hasLexicalDensity) {
      state = 'present';
    } else if (hasLexicalPlusIntent || (lexicalHits >= 2 && hasIntentSignal)) {
      state = 'partial';
    } else {
      state = 'partial';
    }

    // ── Confidence scoring ──
    // Structural: normalize against min(patternCount, 3) so that 2+ hits = strong.
    // Adding more patterns to an archetype shouldn't dilute existing matches.
    // Lexical: normalize against min(coSignals, 6) — 4+ co-signals = saturated.
    // Intent: normalize against min(intentSignals, 3).
    const structNorm = Math.min(arch.patterns.length, 3);
    const lexNorm = Math.min(arch.coSignals.length, 6);
    const intentNorm = Math.min(arch.intentSignals.length, 3);

    const structConf = Math.min(structuralHits / structNorm, 1);
    const lexConf = Math.min(lexicalHits / lexNorm, 1);
    const intentConf = Math.min(intentHits / intentNorm, 1);

    const confidence = Math.round(
      (structConf * 0.50 + lexConf * 0.30 + intentConf * 0.20) * 1000
    ) / 1000;

    matches.push({
      archetypeId: arch.id,
      archetypeName: arch.name,
      state,
      structuralHits,
      lexicalHits,
      intentHits,
      confidence,
      primitives: arch.primitives,
    });
  }

  return matches.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Build a primitive → archetype boost map from structural analysis.
 * Each primitive gets the maximum confidence from any archetype that
 * maps to it, weighted by the archetype's own weight.
 *
 * Returns a Map<primitiveName, boost> where boost is 0–1.
 */
export function buildStructuralBoostMap(
  matches: StructuralMatch[],
): Map<string, number> {
  const boosts = new Map<string, number>();

  for (const match of matches) {
    // Only PRESENT and PARTIAL contribute — PARTIAL at reduced weight
    const stateMultiplier = match.state === 'present' ? 1.0 : match.state === 'partial' ? 0.4 : 0;
    if (stateMultiplier === 0) continue;

    const arch = ARCHETYPES.find(a => a.id === match.archetypeId);
    const archWeight = arch?.weight ?? 0.5;
    const boost = match.confidence * stateMultiplier * archWeight;

    for (const prim of match.primitives) {
      const existing = boosts.get(prim) ?? 0;
      // Take the maximum boost across all matching archetypes
      boosts.set(prim, Math.max(existing, boost));
    }
  }

  return boosts;
}

/** Get all archetype definitions (for diagnostics) */
export function getArchetypes(): readonly StructuralSignature[] {
  return ARCHETYPES;
}

/** Get archetype count */
export function getArchetypeCount(): number {
  return ARCHETYPES.length;
}
