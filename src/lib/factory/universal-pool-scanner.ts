/**
 * CMPSBL® Universal Pool Scanner
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * The brain of the Ultimate substrate. Aggregates EVERY primitive in the
 * CMPSBL ecosystem — Spine (Organs + Layers), all vertical expansion
 * primitives (Cyber, Robotics, Quantum, LLM, Agency), and 16 Universal
 * gap-filler primitives — into a single candidate pool.
 * 
 * During Ascension, it scores EVERY candidate against the uploaded code
 * and selects the optimal 40 primitives that produce the maximum
 * compounding effect. No spine lock. No category restrictions. No
 * organ/layer/engine/agent quotas. Just the 40 best primitives for the job.
 * 
 * The scanner uses extended collision time to deeply evaluate all
 * candidates before surfacing the final 40.
 * 
 * The scanner supports dual-matrix mode: in Ascension/MemoryStream mode,
 * primitives are boosted by gap-closure and wow-factor scores instead of
 * static structural bonuses. In substrate mode, boot-order weighting applies.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { VerticalPrimitive } from './vertical-substrate';
import { getSpinePrimitives, getConceptualSpinePrimitives } from './vertical-substrate';
import { getCyberSecurityEngines, getCyberSecurityAgents } from './verticals/cybersecurity';
import { getRoboticsEngines, getRoboticsAgents } from './verticals/robotics';
import { getQuantumEngines, getQuantumAgents } from './verticals/quantum';
import { getLLMEngines, getLLMAgents } from './verticals/llm';
import { getAgencyEngines, getAgencyAgents } from './verticals/agency';
import { getMediaEngines, getMediaAgents } from './verticals/media';
import {
  ULTIMATE_ALL_ENGINES,
  ULTIMATE_ALL_AGENTS,
  ULTIMATE_AFFINITY_SIGNALS,
} from './verticals/ultimate';
import {
  computeAscensionBoost,
  type AscensionMode,
} from '../ascension/ascension-weights';
import {
  runStructuralAnalysis,
  buildStructuralBoostMap,
  type StructuralMatch,
  type PresenceState,
} from '../ascension/structural-signatures';
import {
  bandResults,
  getBandDistribution,
  type BandedResult,
  type ConfidenceBand,
} from '../ascension/confidence-banding';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PoolCandidate {
  primitive: VerticalPrimitive;
  sourceVertical: string;
  affinityScore: number;
  signalHits: number;
  totalSignals: number;
  compoundingScore: number;
  /** Structural archetype boost applied to this candidate (0–1) */
  structuralBoost: number;
}

export interface UniversalScanResult {
  /** The primitives selected as the optimal surface for this code (variable count) */
  selectedPrimitives: PoolCandidate[];
  /** Full primitive surface (the selected primitives, rebalanced) */
  fullSurface: VerticalPrimitive[];
  /** All candidates that were evaluated */
  totalCandidatesEvaluated: number;
  /** How many passed the affinity threshold */
  candidatesAboveThreshold: number;
  /** Source distribution in the selection */
  sourceDistribution: Record<string, number>;
  /** Role distribution in the selection */
  roleDistribution: Record<string, number>;
  /** Duration of the scan in ms */
  durationMs: number;
  /** Number of collision passes performed */
  collisionPasses: number;
  /** Structural archetype matches (tristate: present/partial/absent) */
  structuralMatches: StructuralMatch[];
  /** Confidence band distribution across selected primitives */
  confidenceBands: BandedResult[];
  /** Band summary counts */
  bandDistribution: Record<ConfidenceBand, number>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — AFFINITY SIGNAL DERIVATION
// ═══════════════════════════════════════════════════════════════════════════════

/** Build affinity signals from a primitive's capabilities + description */
function deriveSignals(p: VerticalPrimitive): string[] {
  const signals: string[] = [];
  for (const cap of p.capabilities) {
    // Compound Signal Preservation: keep the full capability as a signal
    // so high-intent expansion terms like 'copyright_detection' match
    // as a unit instead of being diluted into generic 'copyright' + 'detection'
    signals.push(cap);
    // Also push individual tokens for partial matching
    const parts = cap.split('_');
    if (parts.length > 1) {
      signals.push(...parts);
    }
  }
  const descWords = p.description.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  signals.push(...descWords);
  return [...new Set(signals)];
}

// Spine-specific affinity signals for deeper matching.
// Each primitive has a broad, language-agnostic vocabulary covering
// Python, TypeScript, Rust, Go, C/C++, Java, Ruby, Swift, Kotlin,
// Solidity, VHDL, SystemVerilog, shell scripts, config files, and more.
// Organized by semantic domain so additions are easy to audit.
const SPINE_AFFINITY_SIGNALS: Record<string, string[]> = {

  // ── CORE — kernel, bootstrap, lifecycle, orchestration ──
  CORE: [
    // Bootstrap & entry
    'kernel', 'boot', 'init', 'startup', 'main', 'entry', 'entrypoint', 'bootstrap',
    'setup', 'teardown', 'shutdown', 'cleanup', 'finalize', 'dispose',
    // Lifecycle
    'lifecycle', 'heartbeat', 'tick', 'loop', 'poll', 'schedule', 'cron', 'daemon',
    'supervisor', 'orchestrat', 'coordinator', 'conductor', 'cadence',
    // Runtime
    'runtime', 'process', 'subprocess', 'spawn', 'fork', 'exec', 'pid', 'signal',
    'interrupt', 'sigterm', 'sigint', 'sighup',
    // Pipeline
    'pipeline', 'stage', 'phase', 'step', 'chain', 'sequence', 'workflow',
    // Loading
    'load', 'preload', 'lazy', 'eager', 'prefetch', 'warmup',
    // File patterns
    'main.py', 'index.ts', 'app.py', 'server.py', 'run.py', 'manage.py',
    '__main__', '__init__', 'mod.rs', 'main.go', 'main.rs', 'program.cs',
  ],

  // ── SYSTEM — configuration, environment, platform ──
  SYSTEM: [
    // Config
    'config', 'configuration', 'environment', 'env', 'setting', 'preference',
    'option', 'flag', 'toggle', 'feature_flag', 'dotenv', 'toml', 'yaml', 'json',
    'ini', 'properties', 'plist',
    // Setup
    'lifecycle', 'setup', 'init', 'configur', 'reconfigur', 'provision',
    // Platform
    'platform', 'backend', 'frontend', 'client', 'server', 'host', 'hostname',
    'port', 'socket', 'bind', 'listen',
    // Defaults
    'default', 'fallback', 'override', 'global', 'singleton', 'instance',
    // OS / system
    'os', 'arch', 'cpu', 'memory', 'disk', 'filesystem', 'path', 'tempdir',
    'homedir', 'cwd', 'environ', 'sysctl', 'uname', 'locale', 'timezone',
    // File patterns
    'config.ts', 'config.py', 'settings.py', 'constants.ts', 'env.d.ts',
    '.env', 'docker-compose', 'dockerfile', 'makefile', 'cmake',
    'cargo.toml', 'pyproject.toml', 'package.json', 'go.mod', 'build.gradle',
  ],

  // ── BRAIN — reasoning, classification, inference ──
  BRAIN: [
    // Reasoning
    'reason', 'infer', 'inference', 'deduce', 'conclude', 'hypothesis',
    'heuristic', 'cognitive', 'think', 'decide', 'evaluate', 'assess',
    // Classification
    'classify', 'classif', 'categorize', 'label', 'tag', 'annotate',
    'predict', 'forecast', 'estimate', 'probability', 'likelihood',
    // ML / AI patterns
    'model', 'neural', 'network', 'layer', 'weight', 'bias', 'activation',
    'tensor', 'gradient', 'backprop', 'optimizer', 'loss', 'epoch', 'batch',
    'train', 'training', 'finetune', 'pretrain', 'embedding', 'tokenizer',
    'attention', 'transformer', 'encoder', 'decoder', 'softmax', 'relu',
    'sigmoid', 'dropout', 'normalization', 'convolution', 'pooling',
    'lstm', 'recurrent', 'diffusion',
    // Knowledge
    'knowledge', 'pattern', 'feature', 'extraction', 'recognition',
    'detection', 'similarity', 'distance', 'cluster', 'centroid',
    // Logic
    'logic', 'rule', 'condition', 'predicate', 'assert', 'axiom',
  ],

  // ── MEMORY — storage, persistence, caching, serialization ──
  MEMORY: [
    // Cache
    'cache', 'lru', 'ttl', 'expir', 'invalidat', 'evict', 'memo', 'memoiz',
    // Storage
    'store', 'persist', 'save', 'load', 'read', 'write', 'flush', 'sync',
    'storage', 'retain', 'archive', 'snapshot', 'dump', 'restore',
    // State
    'state', 'session', 'context', 'scope', 'stack', 'heap', 'arena',
    'pool', 'slab', 'allocat', 'dealloc', 'malloc', 'free', 'gc',
    'garbage', 'reference_count', 'weak_ref', 'strong_ref',
    // Database
    'database', 'db', 'sql', 'query', 'select', 'insert', 'update', 'delete',
    'transaction', 'commit', 'rollback', 'savepoint', 'cursor', 'prepared',
    'connection_pool', 'orm', 'migration', 'schema', 'index', 'constraint',
    'foreign_key', 'primary_key', 'join', 'aggregate',
    // Serialization
    'serialize', 'deserialize', 'marshal', 'unmarshal', 'pickle', 'unpickle',
    'protobuf', 'msgpack', 'avro', 'thrift', 'flatbuffer', 'cbor',
    // Memory-mapped
    'mmap', 'shared_memory', 'shm', 'memoryview', 'bytearray', 'bytebuffer',
    // Checkpoint
    'checkpoint', 'ckpt', 'safetensors', 'statedict', 'state_dict',
    // Key-value
    'redis', 'memcached', 'leveldb', 'rocksdb', 'sqlite', 'etcd',
    // Buffer
    'buffer', 'ring_buffer', 'circular', 'fifo', 'lifo',
  ],

  // ── DREAM — synthesis, emergence, creativity ──
  DREAM: [
    'synthesis', 'synthesize', 'emerge', 'emergent', 'heuristic', 'creative',
    'fragment', 'subconscious', 'discover', 'insight', 'intuition',
    'serendipity', 'novel', 'unexpect', 'latent', 'subliminal',
    'recombine', 'mutate', 'evolve', 'generate', 'imagine', 'dream',
    'hallucinate', 'interpolat', 'extrapolat', 'blend', 'morph',
  ],

  // ── NERVE — signals, events, messaging, pub/sub ──
  NERVE: [
    // Event system
    'signal', 'event', 'dispatch', 'emit', 'fire', 'trigger', 'raise',
    'publish', 'subscribe', 'unsubscribe', 'observe', 'notify', 'broadcast',
    // Routing
    'route', 'router', 'bus', 'eventbus', 'messagebus', 'mediator',
    // Callbacks
    'callback', 'hook', 'handler', 'listener', 'delegate', 'closure',
    'promise', 'future', 'deferred', 'observable', 'subject', 'stream',
    // Registration
    'register', 'unregister', 'bind', 'unbind', 'attach', 'detach',
    'addEventListener', 'removeEventListener', 'on_', 'once',
    // Async patterns
    'async', 'await', 'coroutine', 'goroutine', 'channel', 'chan',
    'select', 'yield', 'generator', 'iterator', 'next',
    // Concurrency
    'mutex', 'semaphore', 'lock', 'unlock', 'rwlock', 'atomic',
    'thread', 'spawn', 'join', 'wait', 'notify_all', 'condition_variable',
    'barrier', 'latch', 'countdown',
    // File patterns
    'events.ts', 'emitter.py', 'signals.py', 'pubsub', 'broker',
  ],

  // ── IDENTITY — authentication, users, context, devices ──
  IDENTITY: [
    // Auth
    'auth', 'authenticat', 'login', 'logout', 'signin', 'signup', 'register',
    'credential', 'password', 'passphrase', 'passkey', 'biometric',
    // Tokens
    'token', 'jwt', 'bearer', 'refresh_token', 'access_token', 'api_key',
    'oauth', 'oauth2', 'oidc', 'saml', 'sso', 'mfa', 'totp', 'otp',
    // User
    'user', 'profile', 'account', 'tenant', 'organization', 'workspace',
    'principal', 'subject', 'claim', 'assertion',
    // Session
    'session', 'cookie', 'fingerprint', 'device_id', 'user_agent',
    // Device / context
    'device', 'cuda', 'gpu', 'tpu', 'accelerator', 'hardware',
    'location', 'geolocation', 'ip_address', 'locale',
    // Identity providers
    'ldap', 'active_directory', 'cognito', 'auth0', 'firebase_auth',
    'supabase_auth', 'keycloak', 'okta',
  ],

  // ── RELAY — messaging, queues, forwarding ──
  RELAY: [
    // Messaging
    'message', 'msg', 'packet', 'datagram', 'frame', 'payload', 'envelope',
    'queue', 'dequeue', 'enqueue', 'topic', 'subscription', 'consumer',
    'producer', 'publisher', 'subscriber',
    // Forward
    'relay', 'forward', 'proxy', 'redirect', 'passthrough', 'pipe',
    // Webhooks & notifications
    'webhook', 'notification', 'push', 'alert', 'sms', 'email',
    // Protocols
    'pubsub', 'amqp', 'mqtt', 'kafka', 'rabbitmq', 'nats', 'zeromq',
    'grpc', 'websocket', 'sse', 'long_poll',
    // Middleware
    'middleware', 'interceptor', 'filter', 'chain', 'pipeline',
    // File patterns
    'queue.py', 'worker.py', 'consumer.py', 'producer.py', 'broker.py',
  ],

  // ── AUDIT — logging, compliance, immutable records ──
  AUDIT: [
    // Logging
    'log', 'logger', 'logging', 'syslog', 'journal', 'logfile',
    'debug', 'info', 'warn', 'warning', 'error', 'critical', 'fatal',
    'verbose', 'trace', 'span', 'correlation_id', 'request_id',
    // Audit
    'audit', 'audit_log', 'audit_trail', 'tamper', 'immutable',
    'append_only', 'write_once', 'ledger',
    // Compliance
    'compliance', 'regulation', 'gdpr', 'hipaa', 'sox', 'pci', 'fedramp',
    // Chain / integrity
    'chain', 'hash_chain', 'merkle', 'merkle_tree', 'hash', 'digest',
    'checksum', 'crc', 'sha256', 'sha512', 'md5', 'blake2',
    // Record
    'record', 'receipt', 'provenance', 'lineage', 'changelog',
    'track', 'trace', 'breadcrumb', 'telemetry', 'metric',
    // Observability
    'opentelemetry', 'jaeger', 'zipkin', 'prometheus', 'grafana',
    'datadog', 'newrelic', 'sentry', 'bugsnag',
    // File patterns
    'audit.py', 'logger.ts', 'logging.conf', 'log4j', 'winston',
  ],

  // ── RIPPLE — cascading effects, propagation, containment ──
  RIPPLE: [
    'cascade', 'cascading', 'propagat', 'ripple', 'spread', 'fanout',
    'broadcast', 'multicast', 'flood', 'diffuse',
    'boundary', 'perimeter', 'fence', 'barrier', 'bulkhead',
    'enforce', 'contain', 'isolat', 'quarantine', 'blast_radius',
    'impact', 'downstream', 'upstream', 'transitive', 'dependency',
    'domino', 'chain_reaction', 'side_effect', 'spillover',
  ],

  // ── ACCESS — permissions, RBAC, authorization ──
  ACCESS: [
    // Core
    'permission', 'permiss', 'role', 'privilege', 'entitlement',
    'rbac', 'abac', 'pbac', 'acl', 'capability',
    // Actions
    'authorize', 'authoriz', 'grant', 'revoke', 'deny', 'allow',
    'restrict', 'forbid', 'block', 'whitelist', 'blacklist',
    'allowlist', 'denylist', 'blocklist',
    // Scope
    'scope', 'claim', 'policy', 'rule', 'constraint',
    'tenant', 'multi_tenant', 'row_level', 'column_level',
    // Guards
    'guard', 'canactivate', 'middleware', 'interceptor', 'decorator',
    'before_action', 'before_filter', 'policy_class',
    // File patterns
    'permissions.py', 'policies.ts', 'guards.ts', 'authorize.rb',
    'access_control', 'iam', 'security_group',
  ],

  // ── GOVERNANCE — approval, oversight, policy enforcement ──
  GOVERNANCE: [
    // Core
    'govern', 'governance', 'approve', 'reject', 'deny', 'veto',
    'gate', 'checkpoint', 'review', 'oversight', 'supervisor',
    // Policy
    'policy', 'rule', 'constraint', 'regulation', 'compliance',
    'enforce', 'verdict', 'decision', 'adjudicat', 'arbitrat',
    // Validation
    'validate', 'validation', 'verify', 'verification', 'certify',
    'check', 'assert', 'ensure', 'confirm', 'require',
    'schema_valid', 'type_check', 'lint', 'linter',
    // Restriction
    'restrict', 'allow', 'permit', 'limit', 'quota', 'throttle',
    'rate_limit', 'circuit_break', 'kill_switch', 'feature_gate',
    // Workflow
    'workflow', 'approval_flow', 'sign_off', 'stakeholder',
    'auto_fix', 'auto_approve', 'manual_review',
    'governance_policy', 'legitimacy',
    // File patterns
    'validators.py', 'rules.ts', 'policies', 'governance',
  ],

  // ── DEFENSE — security, encryption, threat protection ──
  DEFENSE: [
    // Core security
    'security', 'secure', 'insecure', 'threat', 'attack', 'exploit',
    'vulnerability', 'vuln', 'cve', 'patch', 'remediat',
    // Firewall & perimeter
    'firewall', 'waf', 'ids', 'ips', 'perimeter', 'dmz',
    'ingress', 'egress', 'allowlist', 'denylist', 'blocklist',
    // Encryption
    'encrypt', 'decrypt', 'cipher', 'aes', 'rsa', 'ecdsa', 'ed25519',
    'tls', 'ssl', 'https', 'certificate', 'cert', 'pki', 'x509',
    'keystore', 'truststore', 'vault', 'seal', 'unseal',
    // Hashing & signing
    'hmac', 'digest', 'sign', 'signature', 'nonce', 'salt', 'pepper',
    'bcrypt', 'scrypt', 'argon2', 'pbkdf2',
    // Web security
    'csrf', 'xss', 'sqli', 'injection', 'sanitize', 'escape', 'encode',
    'cors', 'csp', 'hsts', 'referrer_policy', 'x_frame',
    // Trust
    'protect', 'shield', 'guard', 'defend', 'safe', 'unsafe',
    'trust', 'untrust', 'malicious', 'suspicious', 'anomal',
    // Secrets
    'secret', 'credential', 'rotation', 'expiry', 'revoke', 'revocation',
    // Network
    'scan', 'probe', 'pentest', 'fuzz', 'brute_force',
    'intrusion', 'detection', 'prevention', 'quarantine',
    'risk', 'severity', 'critical', 'high', 'medium', 'low',
    // File patterns
    'security.py', 'crypto.ts', 'auth.py', 'firewall.conf',
    'security_smell', 'blocked', 'deny_all', 'allow_all',
  ],

  // ── IMMUNITY — self-healing, recovery, resilience ──
  IMMUNITY: [
    // Healing
    'heal', 'self_heal', 'auto_heal', 'recover', 'recovery', 'repair',
    'restore', 'resurrect', 'revive', 'regenerat',
    // Quarantine
    'quarantine', 'isolat', 'contain', 'sandbox', 'jail',
    // Anomaly
    'anomaly', 'anomalous', 'outlier', 'deviation', 'drift',
    'corrupt', 'corrupted', 'integrity_check', 'consistency_check',
    // Resilience
    'resilient', 'resilience', 'redundant', 'redundancy', 'failover',
    'replica', 'replicat', 'standby', 'hot_spare', 'cold_spare',
    // Immune
    'immune', 'immun', 'adapt', 'adaptive', 'antibody',
    // Rollback
    'rollback', 'undo', 'revert', 'snapshot', 'checkpoint',
    'pre_snapshot', 'post_snapshot', 'backup', 'archive',
    // Wrapper
    'envelope', 'wrapper', 'shim', 'proxy', 'interceptor',
    'rollbackavailable', 'restore_point', 'safe_mode',
  ],

  // ── CONSCIENCE — ethics, bias detection, safety ──
  CONSCIENCE: [
    // Ethics
    'ethic', 'ethical', 'moral', 'virtue', 'principle', 'value',
    'fair', 'fairness', 'equity', 'justice', 'impartial',
    // Bias
    'bias', 'biased', 'unbias', 'skew', 'discriminat', 'disparity',
    'demographic', 'parity', 'equalized_odds',
    // Safety
    'safe', 'safety', 'unsafe', 'harm', 'harmful', 'toxic', 'toxicity',
    'danger', 'dangerous', 'abuse', 'abusive', 'offensive',
    // Boundaries
    'boundary', 'limit', 'guardrail', 'redline', 'constraint',
    'content_filter', 'moderat', 'censor', 'flag', 'report',
    // Trust
    'responsible', 'accountab', 'transparent', 'transparen', 'explainab',
    'interpretab', 'audit_trail',
    // Review
    'preflight', 'review_required', 'human_in_loop', 'oversight',
    'blocked_categories', 'conscience', 'trust_score',
  ],

  // ── INTENT — purpose, goal, action resolution ──
  INTENT: [
    'intent', 'intention', 'purpose', 'goal', 'objective', 'target',
    'action', 'command', 'directive', 'instruction', 'request',
    'resolve', 'resolv', 'interpret', 'interpret', 'parse', 'extract',
    'understand', 'comprehend', 'disambiguat', 'classify',
    'slot', 'entity', 'ner', 'named_entity', 'utterance',
    'dialog', 'dialogue', 'conversation', 'turn', 'context',
    'plan', 'planner', 'scheduler', 'task', 'subtask',
    'dispatch', 'route', 'delegate', 'assign', 'allocat',
  ],

  // ── ATLAS — topology, service registry, dependency graph ──
  ATLAS: [
    'topology', 'graph', 'tree', 'dag', 'dependency_graph',
    'capability', 'registry', 'catalog', 'inventory', 'manifest',
    'service_discovery', 'consul', 'eureka', 'zookeeper',
    'namespace', 'domain', 'subdomain', 'bounded_context',
    'map', 'mapping', 'schema', 'blueprint', 'diagram',
    'node', 'edge', 'vertex', 'link', 'adjacen', 'neighbor',
    'traverse', 'walk', 'bfs', 'dfs', 'shortest_path',
    'cluster', 'partition', 'shard', 'segment', 'zone', 'region',
  ],

  // ── ENGINEER — maintenance, patching, technical debt ──
  ENGINEER: [
    // Maintenance
    'maintain', 'maintenance', 'patch', 'hotfix', 'bugfix',
    'fix', 'repair', 'remediat', 'workaround', 'hack',
    // Drift & debt
    'drift', 'debt', 'tech_debt', 'technical_debt', 'code_smell',
    'refactor', 'restructur', 'rewrite', 'cleanup', 'tidy',
    // Upgrade
    'upgrade', 'downgrade', 'migration', 'migrat', 'backward_compat',
    'forward_compat', 'breaking_change', 'semver',
    // Version
    'version', 'compat', 'compatib', 'deprecat', 'deprecated',
    'legacy', 'obsolete', 'sunset', 'end_of_life', 'eol',
    // Detection
    'detect', 'scan', 'lint', 'linter', 'static_analysis',
    'code_review', 'autofix', 'auto_fix', 'suggestion',
    'stale', 'unused', 'dead_code', 'unreachable',
    // Build
    'compile', 'build', 'link', 'bundle', 'minify', 'transpile',
    'polyfill', 'shim', 'vendor', 'lockfile',
    // File patterns
    'renovate', 'dependabot', 'changelog', 'release_notes',
  ],

  // ── DECODE — language processing, NLP, parsing ──
  DECODE: [
    // NLP
    'language', 'nlp', 'natural_language', 'linguist', 'semantic',
    'syntax', 'grammar', 'lexer', 'lexical', 'tokenize', 'tokenizer',
    'stemm', 'lemmatiz', 'stopword', 'ngram', 'tfidf', 'bpe',
    'wordpiece', 'sentencepiece', 'vocab', 'vocabulary',
    // Chat
    'chat', 'chatbot', 'conversation', 'dialog', 'dialogue',
    'message', 'prompt', 'completion', 'response', 'reply',
    // Parse
    'parse', 'parser', 'ast', 'abstract_syntax', 'cst',
    'interpret', 'compiler', 'transpiler', 'visitor', 'walker',
    // Text
    'text', 'string', 'unicode', 'utf8', 'encoding', 'decoding',
    'regex', 'regexp', 'pattern', 'match', 'search', 'replace',
    'split', 'join', 'strip', 'trim', 'normalize',
    // Formats
    'markdown', 'html', 'xml', 'json', 'csv', 'tsv', 'yaml',
  ],

  // ── ENCODE — code generation, compilation, scaffolding ──
  ENCODE: [
    // Generation
    'generate', 'generator', 'scaffold', 'template', 'boilerplate',
    'codegen', 'code_gen', 'metaprogram', 'macro', 'preprocessor',
    // Compilation
    'code', 'compile', 'compiler', 'build', 'link', 'linker',
    'assemble', 'assembler', 'bytecode', 'ir', 'llvm', 'wasm',
    // Blueprint
    'blueprint', 'schema', 'spec', 'specification', 'definition',
    'interface', 'protocol', 'contract', 'abi',
    // Output
    'write', 'output', 'render', 'emit', 'produce', 'synthesize',
    // Encoding
    'encode', 'encoding', 'base64', 'hex', 'binary', 'ascii',
    'struct', 'pack', 'unpack', 'format', 'formatter',
    'serializ', 'marshal', 'stringify', 'dump',
    // HDL
    'vhdl', 'verilog', 'systemverilog', 'rtl', 'fpga', 'asic',
    'netlist', 'synthesis', 'bitstream',
  ],

  // ── VISION — image, video, visual processing ──
  VISION: [
    // Image
    'image', 'img', 'photo', 'picture', 'bitmap', 'raster', 'vector',
    'pixel', 'rgb', 'rgba', 'hsv', 'hsl', 'grayscale',
    // Formats
    'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif', 'tiff', 'bmp',
    // Processing
    'resize', 'crop', 'rotate', 'flip', 'blur', 'sharpen', 'threshold',
    'contour', 'edge', 'segment', 'mask', 'overlay', 'composite',
    // OCR & recognition
    'ocr', 'tesseract', 'recognition', 'detection', 'classification',
    'bounding_box', 'annotation', 'label',
    // Video
    'video', 'frame', 'fps', 'codec', 'transcode', 'stream',
    'camera', 'webcam', 'capture', 'record',
    // Canvas
    'canvas', 'webgl', 'opengl', 'vulkan', 'directx', 'shader',
    'render', 'rasteriz', 'texture', 'mesh', 'geometry',
    // Screenshot
    'screenshot', 'thumbnail', 'preview', 'viewport',
  ],

  // ── ECONOMY — cost, billing, metering, pricing ──
  ECONOMY: [
    // Cost
    'cost', 'price', 'pricing', 'fee', 'charge', 'bill', 'billing',
    'invoice', 'receipt', 'payment', 'pay', 'checkout', 'cart',
    // Budget
    'budget', 'spend', 'expenditure', 'allocation', 'forecast',
    // Metering
    'meter', 'metering', 'usage', 'consumption', 'quota', 'limit',
    'overage', 'throttle', 'rate_limit',
    // Revenue
    'revenue', 'profit', 'margin', 'roi', 'roi_calculat',
    'subscription', 'recurring', 'mrr', 'arr', 'churn',
    // Currency
    'currency', 'cents', 'dollar', 'stripe', 'paypal', 'braintree',
    'tax', 'vat', 'discount', 'coupon', 'promo',
    // Credits
    'credit', 'debit', 'balance', 'ledger', 'account',
    'token_usage', 'compute_cost', 'api_call_cost',
  ],

  // ── SANDBOX — isolation, containment, eval safety ──
  SANDBOX: [
    // Isolation
    'isolat', 'sandbox', 'sandboxed', 'contain', 'container',
    'docker', 'podman', 'lxc', 'chroot', 'jail', 'namespace',
    'cgroup', 'seccomp', 'apparmor', 'selinux',
    // Eval
    'eval', 'exec', 'execute', 'interpret', 'repl', 'playground',
    'notebook', 'jupyter', 'colab',
    // Restriction
    'restrict', 'confine', 'limit', 'cap', 'ceiling',
    'read_only', 'readonly', 'immutable', 'frozen',
    // Security context
    'unpickl', 'weights_only', 'safe_load', 'trusted', 'untrusted',
    'allowlist', 'denylist', 'permit', 'forbid',
    // Virtualization
    'vm', 'virtual_machine', 'hypervisor', 'emulat', 'simulat',
    'wasm', 'webassembly', 'v8', 'isolate',
  ],

  // ── INCLUSIVE — accessibility, a11y, universal design ──
  INCLUSIVE: [
    'accessible', 'accessibility', 'a11y', 'wcag', 'aria',
    'screen_reader', 'screenreader', 'voiceover', 'talkback', 'nvda', 'jaws',
    'disability', 'inclusive', 'universal_design',
    'alt_text', 'alt', 'label', 'caption', 'subtitle', 'transcript',
    'keyboard', 'focus', 'tabindex', 'skip_link', 'landmark',
    'contrast', 'color_blind', 'dyslexia', 'cognitive',
    'i18n', 'l10n', 'internationalization', 'localization',
    'rtl', 'ltr', 'bidi', 'translation', 'locale',
  ],

  // ── MEDIC — diagnostics, triage, severity assessment ──
  MEDIC: [
    'diagnos', 'diagnostic', 'triage', 'assess', 'assessment',
    'repair', 'fix', 'patch', 'remedy', 'prescription',
    'severity', 'priority', 'critical', 'major', 'minor', 'trivial',
    'damage', 'impact', 'blast_radius', 'scope',
    'symptom', 'root_cause', 'postmortem', 'incident', 'outage',
    'triageissue', 'triageall', 'riskscore', 'autofixable',
    'health_check', 'healthcheck', 'status_page', 'uptime',
    'slo', 'sla', 'sli', 'error_budget', 'mttr', 'mttf', 'mtbf',
    'runbook', 'playbook', 'escalat', 'on_call', 'pager',
  ],

  // ── SOVEREIGN — data classification, jurisdiction, compliance ──
  SOVEREIGN: [
    // Policy
    'policy', 'compliance', 'regulation', 'regulatory', 'statute',
    'ordinance', 'mandate', 'requirement',
    // Classification
    'classify', 'classification', 'label', 'tier', 'level',
    'confidential', 'secret', 'top_secret', 'public', 'internal',
    'sensitive', 'pii', 'phi', 'pci', 'spii',
    // Jurisdiction
    'jurisdiction', 'territory', 'region', 'sovereign', 'sovereignty',
    'data_residency', 'data_locality', 'cross_border',
    // Consent
    'consent', 'opt_in', 'opt_out', 'preference', 'notice',
    'gdpr', 'ccpa', 'hipaa', 'ferpa', 'coppa', 'pipeda',
    // Governance
    'data_class', 'data_owner', 'data_steward', 'retention',
    'blockedcategories', 'governancepolicy', 'embargo', 'sanction',
  ],

  // ── COMPASS — direction, priority, ranking, scoring ──
  COMPASS: [
    'direction', 'priority', 'prioritiz', 'weight', 'rank', 'ranking',
    'sort', 'order', 'sequence', 'position',
    'threshold', 'cutoff', 'baseline', 'benchmark', 'target',
    'severity_order', 'confidence', 'score', 'rating',
    'riskscore', 'risk_score', 'trust_score',
    'top_k', 'top_n', 'percentile', 'quantile', 'median',
    'gradient', 'direction', 'vector', 'heading', 'bearing',
    'north_star', 'kpi', 'metric', 'indicator', 'signal',
    'heatmap', 'distribution', 'histogram', 'sparkline',
  ],

  // ── SHADOW — canary, tracing, monitoring, A/B testing ──
  SHADOW: [
    // Canary & shadow
    'canary', 'shadow', 'dark_launch', 'feature_flag', 'toggle',
    'a_b_test', 'ab_test', 'experiment', 'variant', 'cohort',
    'blue_green', 'rolling', 'progressive', 'gradual',
    // Tracing
    'trace', 'tracing', 'span', 'context_propagat',
    'distributed_trac', 'correlation', 'request_id', 'trace_id',
    // Monitoring
    'monitor', 'monitoring', 'watch', 'watchdog', 'sentinel',
    'observe', 'observ', 'instrument', 'profil', 'sampl',
    // Snapshot & diff
    'snapshot', 'baseline', 'compare', 'diff', 'delta', 'drift',
    'pre_snapshot', 'post_snapshot', 'presnapshot', 'postsnapshot',
    'before', 'after', 'regression',
  ],

  // ── EVOLUTION — mutation, versioning, adaptation ──
  EVOLUTION: [
    // Mutation
    'evolve', 'evolution', 'mutate', 'mutation', 'transform',
    'generation', 'genetic', 'crossover', 'selection', 'fitness',
    'population', 'chromosome', 'allele', 'gene',
    // Adaptation
    'adapt', 'adaptive', 'learn', 'improve', 'optim', 'tuning',
    // Version
    'upgrade', 'patch', 'update', 'hotfix', 'release',
    'version', 'semver', 'changelog', 'release_notes',
    'compat', 'backward', 'forward', 'breaking',
    // Migration
    'migrate', 'migration', 'transition', 'convert', 'transform',
    'updateconfig', 'reconfigur',
    // CI/CD
    'deploy', 'deployment', 'rollout', 'rollback', 'promote',
    'staging', 'production', 'canary', 'blue_green',
    'ci', 'cd', 'pipeline', 'github_actions', 'gitlab_ci', 'jenkins',
  ],

  // ── REFLEX — resilience, circuit breakers, error handling ──
  REFLEX: [
    // Circuit breaker
    'retry', 'retries', 'circuit', 'breaker', 'circuit_breaker',
    'open', 'closed', 'half_open', 'trip', 'reset',
    // Timeout
    'timeout', 'deadline', 'cancel', 'abort', 'abort_controller',
    'context_deadline', 'context_cancel',
    // Backoff
    'backoff', 'exponential', 'jitter', 'delay', 'cooldown', 'debounce',
    'throttle', 'rate_limit',
    // Fallback
    'fallback', 'default', 'degrade', 'degradation', 'graceful',
    'best_effort', 'partial', 'eventual',
    // Error handling
    'error', 'exception', 'panic', 'recover', 'rescue',
    'raise', 'throw', 'catch', 'try', 'finally', 'ensure',
    'result', 'option', 'maybe', 'either', 'unwrap',
    'fail', 'failure', 'fault', 'toleran',
    // Resilience patterns
    'bulkhead', 'shed', 'load_shed', 'backpressure',
    'health_check', 'liveness', 'readiness',
  ],

  // ── INTEGRATION — adapters, bridges, protocol translation ──
  INTEGRATION: [
    // Patterns
    'adapter', 'bridge', 'facade', 'wrapper', 'shim', 'polyfill',
    'decorator', 'proxy', 'mediator', 'translator',
    // Transform
    'transform', 'convert', 'map', 'translate', 'normalize', 'denormalize',
    'serialize', 'deserialize', 'marshal', 'unmarshal',
    // Protocol
    'protocol', 'format', 'codec', 'transcode', 'interop', 'compat',
    'api', 'rest', 'graphql', 'grpc', 'soap', 'xmlrpc', 'jsonrpc',
    // Data formats
    'json', 'xml', 'csv', 'protobuf', 'avro', 'parquet', 'orc',
    'msgpack', 'bson', 'cbor', 'toml', 'yaml', 'ini',
    // Connectors
    'connector', 'driver', 'client', 'sdk', 'library', 'plugin',
    'extension', 'addon', 'module', 'package', 'crate', 'gem',
    // ETL
    'etl', 'extract', 'transform', 'load', 'ingest', 'pipeline',
    // File patterns
    'adapter.ts', 'bridge.py', 'connector.go', 'driver.rs',
  ],

  // ── TREATY — contracts, SLA, agreements ──
  TREATY: [
    'contract', 'agreement', 'sla', 'slo', 'sli',
    'obligation', 'terms', 'binding', 'enforce', 'breach',
    'guarantee', 'warranty', 'promise', 'pledge', 'commitment',
    'interface', 'protocol', 'spec', 'specification', 'schema',
    'precondition', 'postcondition', 'invariant', 'assert',
    'expect', 'require', 'ensure', 'satisfy', 'fulfill',
    'handshake', 'negotiate', 'accept', 'reject', 'counter',
    'version', 'revision', 'amendment', 'addendum',
  ],

  // ── NEXUS — routing, load balancing, failover ──
  NEXUS: [
    // Routing
    'router', 'routing', 'route', 'dispatch', 'forward',
    'gateway', 'api_gateway', 'ingress', 'egress',
    // Load balancing
    'balance', 'balancer', 'load_balanc', 'round_robin',
    'least_connect', 'weighted', 'consistent_hash',
    // Failover
    'failover', 'fallback', 'redundan', 'backup', 'standby',
    'primary', 'secondary', 'replica', 'mirror',
    // Provider
    'provider', 'endpoint', 'upstream', 'downstream',
    'service', 'microservice', 'mesh', 'sidecar', 'envoy', 'istio',
    // Proxy
    'proxy', 'reverse_proxy', 'nginx', 'haproxy', 'caddy', 'traefik',
    // DNS
    'dns', 'resolve', 'resolver', 'lookup', 'cname', 'a_record',
    // CDN
    'cdn', 'edge', 'cache', 'origin', 'distribution',
  ],

  // ── BEACON — health signals, uptime, telemetry ──
  BEACON: [
    // Health
    'beacon', 'heartbeat', 'ping', 'pong', 'keepalive', 'keep_alive',
    'health', 'healthy', 'unhealthy', 'health_check', 'healthcheck',
    'health_signal', 'healthsignal',
    // Status
    'status', 'state', 'condition', 'readiness', 'liveness',
    'available', 'unavailable', 'degraded', 'operational',
    // Monitoring
    'monitor', 'watchdog', 'sentinel', 'probe', 'check',
    'alive', 'dead', 'zombie', 'orphan', 'stale',
    // Telemetry
    'telemetry', 'metric', 'counter', 'gauge', 'histogram',
    'uptime', 'downtime', 'latency', 'throughput', 'bandwidth',
    'p50', 'p95', 'p99', 'percentile',
    // Signals
    'emithealthsignal', 'beaconhealthsignal',
    'alert', 'alarm', 'threshold', 'anomaly', 'spike', 'drop',
    // File patterns
    'health.ts', 'healthcheck.py', 'status.go', 'monitor.rs',
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — POOL ASSEMBLY
// ═══════════════════════════════════════════════════════════════════════════════

interface TaggedPrimitive {
  primitive: VerticalPrimitive;
  sourceVertical: string;
  signals: string[];
}

/** Assemble the COMPLETE universal pool — every primitive in the ecosystem */
function assembleUniversalPool(): TaggedPrimitive[] {
  const pool: TaggedPrimitive[] = [];

  const tag = (prims: VerticalPrimitive[], source: string, signalMap?: Record<string, string[]>) => {
    for (const p of prims) {
      const explicitSignals = signalMap?.[p.id] ?? ULTIMATE_AFFINITY_SIGNALS[p.id];
      const derived = deriveSignals(p);
      // Merge explicit + derived, but cap total signals to prevent
      // density dilution. Explicit signals get priority (listed first).
      const merged = explicitSignals
        ? [...new Set([...explicitSignals, ...derived])]
        : derived;
      // Cap at 50 signals — enough for broad matching without diluting density
      const capped = merged.length > 50 ? merged.slice(0, 50) : merged;
      pool.push({ primitive: p, sourceVertical: source, signals: capped });
    }
  };

  // Spine — Organs + Layers (24) — now candidates, not locked
  tag(getSpinePrimitives(), 'spine', SPINE_AFFINITY_SIGNALS);

  // Cyber (16)
  tag(getCyberSecurityEngines(), 'cyber');
  tag(getCyberSecurityAgents(), 'cyber');

  // Robotics (16)
  tag(getRoboticsEngines(), 'robotics');
  tag(getRoboticsAgents(), 'robotics');

  // Quantum (16)
  tag(getQuantumEngines(), 'quantum');
  tag(getQuantumAgents(), 'quantum');

  // LLM (16)
  tag(getLLMEngines(), 'llm');
  tag(getLLMAgents(), 'llm');

  // Agency (16)
  tag(getAgencyEngines(), 'agency');
  tag(getAgencyAgents(), 'agency');

  // Media (16)
  tag(getMediaEngines(), 'media');
  tag(getMediaAgents(), 'media');

  // Ultimate Universal (16)
  tag(ULTIMATE_ALL_ENGINES, 'ultimate');
  tag(ULTIMATE_ALL_AGENTS, 'ultimate');

  // Conceptual Spine Extensions (7) — materialized from signal mappings
  tag(getConceptualSpinePrimitives(), 'spine', SPINE_AFFINITY_SIGNALS);

  return pool;
}

// Pre-compute pool on first access
let _cachedPool: TaggedPrimitive[] | null = null;
function getPool(): TaggedPrimitive[] {
  if (!_cachedPool) _cachedPool = assembleUniversalPool();
  return _cachedPool;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — EXTENDED SCORING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Number of collision passes for deep evaluation */
const COLLISION_PASSES = 3;

/**
 * Score a single candidate primitive against the uploaded code.
 * Multi-pass scoring for deeper evaluation:
 *   Pass 1: Signal hit density (keyword matching)
 *   Pass 2: Capability breadth and composability potential
 *   Pass 3: Cross-candidate synergy estimation
 */
function scoreCandidate(
  tagged: TaggedPrimitive,
  lowerCode: string,
  codeTokens: Set<string>,
  signalDocFreq: Record<string, number>,
  poolSize: number,
  mode: AscensionMode = 'ascension',
  structuralBoosts?: Map<string, number>,
): PoolCandidate {
  // Pass 1 — IDF-weighted signal hit density
  // Rare signals (appearing in few candidates) count more than common ones.
  let hits = 0;
  let idfWeightedHits = 0;
  let idfWeightedTotal = 0;
  for (const signal of tagged.signals) {
    const df = signalDocFreq[signal] ?? 1;
    const idf = Math.log(poolSize / df);
    idfWeightedTotal += idf;
    if (lowerCode.includes(signal)) {
      hits++;
      idfWeightedHits += idf;
    }
  }
  const hitRatio = idfWeightedTotal > 0 ? idfWeightedHits / idfWeightedTotal : 0;
  const signalAffinity = Math.min(hitRatio / 0.25, 1);

  // Pass 2 — Capability breadth and structural matching
  let capHits = 0;
  for (const cap of tagged.primitive.capabilities) {
    if (codeTokens.has(cap)) { capHits++; continue; }
    const capTokens = cap.split('_');
    for (const t of capTokens) {
      if (codeTokens.has(t)) { capHits++; break; }
    }
  }
  const capRatio = tagged.primitive.capabilities.length > 0
    ? capHits / tagged.primitive.capabilities.length
    : 0;
  const breadthScore = Math.min(tagged.primitive.capabilities.length / 6, 1);

  // Pass 3 — Weight-based importance and composability
  const weightFactor = Math.min(tagged.primitive.weight / 0.03, 1);

  // ── DUAL-MATRIX BONUS ──────────────────────────────────────────────────
  // In substrate mode: static structural bonus based on spine membership
  // and signal density (boot-order priorities).
  // In ascension/memorystream mode: dynamic boost from the Ascension Weight
  // Matrix — scored by gap-closure (universal software weaknesses) and
  // wow-factor (category-defining differentiation like DREAM).
  const isSpine = tagged.primitive.role === 'organ' || tagged.primitive.role === 'layer';
  const signalDensity = tagged.signals.length > 0 ? hits / tagged.signals.length : 0;

  let contextBonus: number;
  if (mode === 'substrate') {
    // Original structural bonus — spine gets up to 0.08 based on density
    contextBonus = (isSpine && hits > 0) ? 0.08 * Math.min(signalDensity / 0.20, 1) : 0;
  } else {
    // Ascension/MemoryStream: gap-closure + wow-factor driven boost (up to 0.15)
    // Only awarded when signals actually match — prevents phantom boosts
    const ascensionBoost = computeAscensionBoost(tagged.primitive.name, mode);
    contextBonus = hits > 0 ? ascensionBoost * Math.min(signalDensity / 0.15, 1) : 0;
  }

  // Raw hit density bonus — rewards high absolute hit counts regardless
  // of IDF weighting, preventing common-but-genuine matches from being
  // penalized by the rarity filter.
  const rawDensity = tagged.signals.length > 0 ? hits / tagged.signals.length : 0;
  const rawDensityBonus = Math.min(rawDensity / 0.30, 1) * 0.10;

  // ── STRUCTURAL ARCHETYPE BOOST ─────────────────────────────────────────
  // If structural analysis found that this primitive maps to a confirmed
  // archetype (rate limiting, error recovery, etc.), apply an additional
  // boost. This rewards primitives that match CODE SHAPES, not just keywords.
  const primName = tagged.primitive.name.toUpperCase();
  const structBoost = structuralBoosts?.get(primName) ?? 0;
  const structuralArchetypeBonus = structBoost * 0.12; // Up to 12% from structural patterns

  // Composite scoring — signal-dominant, context-aware, structure-boosted
  const affinity = Math.min(signalAffinity * 0.5 + capRatio * 0.5, 1);
  const compounding =
    signalAffinity * 0.35 +
    rawDensityBonus +
    capRatio * 0.15 +
    breadthScore * 0.08 +
    weightFactor * 0.05 +
    contextBonus +
    structuralArchetypeBonus;

  return {
    primitive: tagged.primitive,
    sourceVertical: tagged.sourceVertical,
    affinityScore: Math.round(affinity * 1000) / 1000,
    signalHits: hits,
    totalSignals: tagged.signals.length,
    compoundingScore: Math.round(compounding * 1000) / 1000,
    structuralBoost: Math.round(structBoost * 1000) / 1000,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — DYNAMIC SLOT SELECTION (CODE-DRIVEN)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Minimum compounding score to qualify for selection.
 * Primitives below this threshold add noise, not value.
 */
const SELECTION_THRESHOLD = 0.10;

/**
 * The score gap that triggers a natural cutoff.
 * If the next candidate's score drops by more than 40% relative to the
 * current candidate, the scanner stops — the code doesn't need more.
 */
const DROP_OFF_RATIO = 0.40;

/** Absolute maximum to prevent degenerate cases */
const MAX_SLOTS = 40;

/** Minimum selection — at least a few primitives for any code */
const MIN_SLOTS = 8;

/**
 * Select the optimal primitives for this specific codebase.
 * The count is DYNAMIC — driven by what the code actually needs.
 * No category restrictions. No spine lock. No organ/layer quotas.
 * Diversity constraint: max 10 from any single non-spine source,
 * max 16 from spine (since spine has the most semantic breadth).
 */
function selectOptimalPrimitives(
  candidates: PoolCandidate[],
): PoolCandidate[] {
  const sorted = [...candidates]
    .filter(c => c.compoundingScore >= SELECTION_THRESHOLD && c.signalHits >= 2)
    .sort((a, b) => b.compoundingScore - a.compoundingScore);

  const selected: PoolCandidate[] = [];
  const sourceCounts: Record<string, number> = {};
  const usedIds = new Set<string>();

  for (let i = 0; i < sorted.length; i++) {
    if (selected.length >= MAX_SLOTS) break;

    const candidate = sorted[i];

    // Natural cutoff: if there's a significant score drop-off after minimum,
    // stop — the code doesn't benefit from more primitives
    if (selected.length >= MIN_SLOTS && i > 0) {
      const prevScore = sorted[i - 1].compoundingScore;
      const dropOff = (prevScore - candidate.compoundingScore) / prevScore;
      if (dropOff >= DROP_OFF_RATIO) break;
    }

    // Diversity: spine gets 24 (broadest semantic range, 31+ primitives),
    // others capped at 5 to ensure expansion primitives don't crowd out
    // architecturally significant spine matches
    const maxForSource = candidate.sourceVertical === 'spine' ? 24 : 5;
    const sc = sourceCounts[candidate.sourceVertical] ?? 0;
    if (sc >= maxForSource) continue;

    // Dedup by primitive ID
    if (usedIds.has(candidate.primitive.id)) continue;

    selected.push(candidate);
    sourceCounts[candidate.sourceVertical] = sc + 1;
    usedIds.add(candidate.primitive.id);
  }

  return selected;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run the Universal Pool Scanner against uploaded code.
 * Evaluates every primitive in the ecosystem and selects the optimal
 * set that produces the maximum compounding effect.
 *
 * @param codeContent  Raw source code to analyze
 * @param mode         Scoring context — 'ascension' uses gap-closure + wow-factor
 *                     weights; 'substrate' uses boot-order structural bonuses.
 *                     Defaults to 'ascension' for code augmentation runs.
 */
export function runUniversalPoolScan(
  codeContent: string,
  mode: AscensionMode = 'ascension',
): UniversalScanResult {
  const start = performance.now();
  const pool = getPool();
  const lowerCode = codeContent.toLowerCase();

  // Build token set for capability matching (Pass 2)
  const codeTokens = new Set(
    lowerCode.split(/\W+/).filter(w => w.length > 2)
  );

  // Compute signal IDF (Inverse Document Frequency) across the pool.
  const signalDocFreq: Record<string, number> = {};
  for (const tagged of pool) {
    const seen = new Set<string>();
    for (const signal of tagged.signals) {
      if (!seen.has(signal)) {
        signalDocFreq[signal] = (signalDocFreq[signal] ?? 0) + 1;
        seen.add(signal);
      }
    }
  }
  const poolSize = pool.length;

  // ── STRUCTURAL ANALYSIS ────────────────────────────────────────────────
  // Run structural pattern matching BEFORE candidate scoring so the
  // archetype boosts can influence which primitives surface.
  const structuralMatches = runStructuralAnalysis(codeContent);
  const structuralBoosts = buildStructuralBoostMap(structuralMatches);

  // Build intent-confirmed primitive set from structural analysis
  const intentPrimitives = new Set<string>();
  for (const match of structuralMatches) {
    if (match.intentHits > 0) {
      for (const prim of match.primitives) {
        intentPrimitives.add(prim.toUpperCase());
      }
    }
  }

  // Score all candidates with mode-aware dual-matrix weighting + structural boosts
  const scored = pool.map(tagged =>
    scoreCandidate(tagged, lowerCode, codeTokens, signalDocFreq, poolSize, mode, structuralBoosts)
  );

  // Select the optimal primitives — count is CODE-DRIVEN, not hardcoded
  const selected = selectOptimalPrimitives(scored);

  // Rebalance weights so selected primitives sum to 1.0
  const totalScore = selected.reduce((sum, c) => sum + c.compoundingScore, 0);
  const fullSurface: VerticalPrimitive[] = selected.map(c => ({
    ...c.primitive,
    weight: totalScore > 0
      ? Math.round((c.compoundingScore / totalScore) * 10000) / 10000
      : Math.round((1.0 / selected.length) * 10000) / 10000,
    inherited: false,
  }));

  // Source distribution
  const sourceDistribution: Record<string, number> = {};
  const roleDistribution: Record<string, number> = {};
  for (const s of selected) {
    sourceDistribution[s.sourceVertical] = (sourceDistribution[s.sourceVertical] ?? 0) + 1;
    roleDistribution[s.primitive.role] = (roleDistribution[s.primitive.role] ?? 0) + 1;
  }

  // ── CONFIDENCE BANDING ─────────────────────────────────────────────────
  const confidenceBands = bandResults(selected, structuralBoosts, intentPrimitives);
  const bandDistribution = getBandDistribution(confidenceBands);

  return {
    selectedPrimitives: selected,
    fullSurface,
    totalCandidatesEvaluated: pool.length,
    candidatesAboveThreshold: scored.filter(c => c.compoundingScore >= SELECTION_THRESHOLD).length,
    sourceDistribution,
    roleDistribution,
    durationMs: Math.round(performance.now() - start),
    collisionPasses: COLLISION_PASSES,
    structuralMatches,
    confidenceBands,
    bandDistribution,
  };
}

/** Get the total number of primitives in the universal pool */
export function getUniversalPoolSize(): number {
  return getPool().length;
}

/** Get pool breakdown by source */
export function getUniversalPoolBreakdown(): Record<string, number> {
  const breakdown: Record<string, number> = {};
  for (const tagged of getPool()) {
    breakdown[tagged.sourceVertical] = (breakdown[tagged.sourceVertical] ?? 0) + 1;
  }
  return breakdown;
}

/** Clear cached pool (for testing) */
export function resetUniversalPool(): void {
  _cachedPool = null;
}

// Re-export Ascension weight types for consumer convenience
export type { AscensionMode } from '../ascension/ascension-weights';
export {
  getAscensionRankings,
  getTopByDimension,
  getAllAscensionWeights,
} from '../ascension/ascension-weights';
