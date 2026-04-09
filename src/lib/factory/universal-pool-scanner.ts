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
 * compounding effect. The final selection is MATRIX-ENFORCED:
 *   12 Organs · 12 Layers · 8 Engines · 8 Agents = 40 Primitives
 * This architectural invariant is non-negotiable across all verticals.
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
import { getFintechEngines, getFintechAgents } from './verticals/fintech';
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
import { detectEcosystem, detectDrift, type DriftDetection } from '../ascension/semantic-drift';
import { extractContract, profileEnvironment, type InterfaceContract, type EnvironmentProfile } from '../ascension/contract-extractor';
import { batchCompatibility, type CompatibilityReport } from '../ascension/compatibility-scoring';
import { runMergeSimulation, type MergeReport } from '../ascension/merge-simulation';
import { extractContext, recordConfirmedMatch } from '../ascension/feedback-loop';
import { suggestForGaps, type RegistrySuggestion } from '../ascension/ecosystem-registry';

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
  /** Position in the deterministic execution chain (0-indexed) */
  chainPosition: number;
  /** Cascading collision score — influenced by predecessor in chain */
  collisionScore: number;
}

export interface UniversalScanResult {
  /** The primitives selected as the optimal surface for this code — CHAIN-ORDERED */
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
  /** Detected ecosystem of the scanned code */
  ecosystem: string;
  /** Semantic drift detections (cross-language synonym matches) */
  driftDetections: DriftDetection[];
  /** Interface contract extracted from the code */
  contract: InterfaceContract;
  /** Environment profile of the target codebase */
  environmentProfile: EnvironmentProfile;
  /** 4-axis compatibility reports per selected primitive */
  compatibilityReports: CompatibilityReport[];
  /** Merge simulation results */
  mergeReport: MergeReport;
  /** Ecosystem registry suggestions for identified gaps */
  registrySuggestions: RegistrySuggestion[];
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
// §2B — VERTICAL EXPANSION AFFINITY SIGNALS
// ═══════════════════════════════════════════════════════════════════════════════
// Deep signal vocabularies for vertical expansion primitives. Without these,
// expansion primitives rely only on capability-derived signals which are too
// narrow to compete with the spine's broad vocabulary.

/** Media vertical — creative content, music, video, marketing */
const MEDIA_AFFINITY_SIGNALS: Record<string, string[]> = {
  CANVAS: [
    'image', 'photo', 'graphic', 'illustration', 'thumbnail', 'banner',
    'design', 'layout', 'visual', 'pixel', 'render', 'draw', 'paint',
    'svg', 'png', 'jpg', 'webp', 'canvas', 'figma', 'sketch',
    'style_transfer', 'filter', 'overlay', 'composite', 'crop', 'resize',
    'brand', 'logo', 'icon', 'avatar', 'placeholder', 'hero_image',
  ],
  SCORE: [
    'music', 'audio', 'sound', 'track', 'beat', 'melody', 'harmony',
    'tempo', 'bpm', 'synthesizer', 'synth', 'midi', 'wav', 'mp3',
    'sample', 'loop', 'mix', 'master', 'equalize', 'reverb', 'delay',
    'podcast', 'jingle', 'soundtrack', 'composer', 'instrument',
    'vocal', 'voice', 'speech', 'frequency', 'amplitude', 'waveform',
  ],
  REEL: [
    'video', 'clip', 'frame', 'scene', 'cut', 'edit', 'timeline',
    'fps', 'resolution', 'aspect_ratio', 'transcode', 'codec', 'h264',
    'mp4', 'webm', 'subtitle', 'caption', 'transition', 'animation',
    'motion', 'render', 'storyboard', 'highlight', 'reel', 'short',
    'youtube', 'tiktok', 'instagram', 'vimeo', 'stream', 'broadcast',
  ],
  COPY: [
    'copy', 'copywriting', 'headline', 'tagline', 'slogan', 'cta',
    'call_to_action', 'persuade', 'persuasion', 'hook', 'lead',
    'body_copy', 'ad_copy', 'email_copy', 'landing_page', 'conversion',
    'tone', 'voice', 'brand_voice', 'messaging', 'value_proposition',
    'a_b_test', 'variant', 'subject_line', 'preview_text',
  ],
  CAMPAIGN: [
    'campaign', 'marketing', 'launch', 'promote', 'promotion', 'drip',
    'funnel', 'nurture', 'segment', 'audience', 'channel', 'multi_channel',
    'omnichannel', 'outreach', 'awareness', 'consideration', 'conversion',
    'retarget', 'remarketing', 'impression', 'click', 'ctr', 'cpc',
    'budget', 'spend', 'roi', 'attribution', 'touchpoint',
  ],
  FEED: [
    'social', 'post', 'tweet', 'share', 'like', 'comment', 'follow',
    'hashtag', 'trending', 'viral', 'engage', 'engagement', 'reach',
    'schedule', 'queue', 'publish', 'autopost', 'crosspost', 'thread',
    'story', 'reel', 'carousel', 'poll', 'community', 'influencer',
    'linkedin', 'twitter', 'facebook', 'instagram', 'tiktok', 'reddit',
  ],
  PALETTE: [
    'brand', 'branding', 'identity', 'style_guide', 'design_system',
    'color', 'palette', 'typography', 'font', 'typeface', 'spacing',
    'token', 'design_token', 'theme', 'variant', 'dark_mode', 'light_mode',
    'consistency', 'guideline', 'template', 'asset', 'logo', 'watermark',
  ],
  RENDER: [
    'render', 'transcode', 'encode', 'decode', 'format', 'convert',
    'compress', 'optimize', 'thumbnail', 'preview', 'export', 'batch',
    'gpu', 'hardware_accel', 'ffmpeg', 'imagemagick', 'sharp', 'pillow',
    'resolution', 'bitrate', 'quality', 'lossless', 'lossy',
  ],
  CURATOR: [
    'curate', 'curation', 'editorial', 'recommend', 'discover', 'trend',
    'trending', 'popular', 'featured', 'spotlight', 'collection', 'playlist',
    'feed', 'algorithm', 'personalize', 'taste', 'preference',
  ],
  CRITIC: [
    'review', 'evaluate', 'score', 'rating', 'quality', 'feedback',
    'critique', 'compare', 'benchmark', 'variant', 'winner', 'loser',
    'a_b_test', 'split_test', 'performance', 'creative_score',
  ],
  AMPLIFY: [
    'distribute', 'distribution', 'seo', 'search', 'optimize', 'organic',
    'paid', 'boost', 'amplify', 'reach', 'impression', 'visibility',
    'backlink', 'keyword', 'rank', 'serp', 'index', 'crawl',
  ],
  PERSONA: [
    'persona', 'audience', 'segment', 'demographic', 'psychographic',
    'behavior', 'target', 'profile', 'cohort', 'lookalike', 'interest',
    'intent', 'buyer', 'customer', 'user_persona', 'avatar',
  ],
  STORYARC: [
    'story', 'narrative', 'arc', 'plot', 'chapter', 'episode', 'series',
    'calendar', 'content_calendar', 'editorial_calendar', 'cadence',
    'theme', 'pillar', 'topic_cluster', 'content_strategy',
  ],
  MUSE: [
    'inspire', 'inspiration', 'idea', 'ideate', 'brainstorm', 'creative',
    'prompt', 'concept', 'brief', 'mood_board', 'reference', 'style',
    'aesthetic', 'vision', 'direction', 'experiment', 'explore',
  ],
  COMPLY: [
    'moderate', 'moderation', 'content_policy', 'copyright', 'dmca',
    'takedown', 'flag', 'report', 'nsfw', 'sensitive', 'age_gate',
    'platform_policy', 'community_guidelines', 'terms_of_service',
    'license', 'royalty', 'rights', 'clearance', 'attribution',
  ],
  METRIC: [
    'analytics', 'metric', 'kpi', 'dashboard', 'report', 'attribution',
    'roi', 'roas', 'cac', 'ltv', 'churn', 'retention', 'funnel',
    'conversion_rate', 'bounce_rate', 'engagement_rate', 'impression',
    'click_through', 'cost_per', 'revenue', 'performance',
  ],
};

/** Fintech vertical — banking, payments, trading, risk, compliance */
const FINTECH_AFFINITY_SIGNALS: Record<string, string[]> = {
  LEDGER: [
    'ledger', 'accounting', 'journal', 'debit', 'credit', 'balance',
    'double_entry', 'trial_balance', 'general_ledger', 'subledger',
    'accrual', 'reconcile', 'reconciliation', 'posting', 'entry',
    'chart_of_accounts', 'fiscal', 'period_close', 'multi_currency',
    'invoice', 'receivable', 'payable', 'amortize', 'depreciate',
  ],
  VAULT_FIN: [
    'vault', 'custody', 'safekeep', 'escrow', 'multisig', 'cold_wallet',
    'hot_wallet', 'key_management', 'hsm', 'hardware_security',
    'digital_asset', 'tokenize', 'tokenization', 'asset', 'secure_storage',
    'withdrawal', 'deposit', 'sweep', 'segregat',
  ],
  TICKER: [
    'ticker', 'price', 'quote', 'market_data', 'feed', 'real_time',
    'exchange', 'symbol', 'ohlc', 'candle', 'candlestick', 'vwap',
    'bid', 'ask', 'spread', 'depth', 'order_book', 'level2',
    'websocket', 'stream', 'latency', 'tick', 'bar',
  ],
  CLEARING: [
    'clear', 'clearing', 'settlement', 'settle', 'netting', 'novation',
    'margin', 'collateral', 'delivery', 'dvp', 'fail', 'counterparty',
    't_plus', 'ccp', 'central_counterparty', 'post_trade',
  ],
  RISKCORE: [
    'risk', 'var', 'value_at_risk', 'cvar', 'stress_test', 'scenario',
    'monte_carlo', 'simulation', 'greeks', 'delta', 'gamma', 'vega',
    'theta', 'rho', 'portfolio_risk', 'correlation', 'volatility',
    'beta', 'sharpe', 'sortino', 'drawdown', 'exposure', 'hedge',
  ],
  PAYRAIL: [
    'payment', 'pay', 'transfer', 'remittance', 'ach', 'wire', 'swift',
    'sepa', 'fednow', 'instant_payment', 'card', 'visa', 'mastercard',
    'checkout', 'payout', 'disbursement', 'batch_payment', 'routing',
    'gateway', 'processor', 'acquirer', 'issuer', 'merchant', 'pos',
    'stripe', 'paypal', 'plaid', 'finicity',
  ],
  TAXENGINE: [
    'tax', 'withholding', 'capital_gain', 'fifo', 'lifo', 'hifo',
    '1099', 'w8', 'w9', 'irs', 'hmrc', 'vat', 'gst', 'sales_tax',
    'jurisdiction', 'nexus', 'wash_sale', 'tax_loss', 'harvesting',
    'form', 'filing', 'return', 'deduction', 'exemption',
  ],
  MATCHBOOK: [
    'order', 'match', 'matching_engine', 'order_book', 'limit_order',
    'market_order', 'stop', 'iceberg', 'fill', 'partial_fill',
    'execution', 'trade', 'exchange', 'auction', 'cross', 'dark_pool',
    'price_time', 'pro_rata', 'queue', 'priority', 'circuit_breaker',
  ],
  SENTINEL_FIN: [
    'fraud', 'fraudulent', 'suspicious', 'anomaly', 'chargeback',
    'dispute', 'velocity', 'behavioral', 'biometric', 'pattern',
    'score', 'risk_score', 'block', 'decline', 'review',
    'aml', 'anti_money_laundering', 'laundering', 'structuring',
  ],
  REGULATOR: [
    'regulation', 'regulatory', 'comply', 'compliance', 'basel',
    'mifid', 'dodd_frank', 'psd2', 'sca', 'strong_authentication',
    'kyc', 'know_your_customer', 'aml', 'sanctions', 'ofac',
    'reporting', 'filing', 'examination', 'audit', 'examiner',
  ],
  ARBITER: [
    'dispute', 'chargeback', 'representment', 'arbitration', 'evidence',
    'claim', 'resolution', 'mediate', 'refund', 'reversal',
    'reason_code', 'compelling_evidence', 'rebuttal',
  ],
  UNDERWRITER: [
    'underwrite', 'underwriting', 'credit', 'credit_score', 'fico',
    'loan', 'lending', 'originate', 'origination', 'mortgage',
    'approval', 'decline', 'debt', 'dti', 'income', 'collateral',
    'covenant', 'default', 'delinquent', 'collection',
  ],
  TREASURER: [
    'treasury', 'cash', 'liquidity', 'sweep', 'concentration',
    'forecast', 'cash_flow', 'working_capital', 'interest_rate',
    'hedge', 'fx', 'foreign_exchange', 'currency', 'position',
  ],
  AUDITOR: [
    'audit', 'internal_audit', 'sox', 'sarbanes_oxley', 'control',
    'control_testing', 'segregation_of_duties', 'exception',
    'finding', 'remediation', 'assurance', 'attestation',
  ],
  PORTFOLIO: [
    'portfolio', 'rebalance', 'allocation', 'asset_allocation',
    'benchmark', 'index', 'tracking_error', 'drift', 'factor',
    'attribution', 'performance', 'return', 'yield', 'dividend',
    'diversif', 'weight', 'sector', 'geography',
  ],
  COMPLIANCE: [
    'compliance', 'pre_trade', 'post_trade', 'surveillance', 'monitor',
    'limit', 'position_limit', 'restricted', 'insider', 'market_abuse',
    'front_running', 'spoofing', 'layering', 'wash_trade',
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
  tag(getMediaEngines(), 'media', MEDIA_AFFINITY_SIGNALS);
  tag(getMediaAgents(), 'media', MEDIA_AFFINITY_SIGNALS);

  // Fintech (16)
  tag(getFintechEngines(), 'fintech', FINTECH_AFFINITY_SIGNALS);
  tag(getFintechAgents(), 'fintech', FINTECH_AFFINITY_SIGNALS);

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
  verticalAffinity?: string,
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

  // ── VERTICAL BOOST (Tier 3) ─────────────────────────────────────────
  // Expansion primitives on their home vertical get 2× score multiplier.
  // Ultimate vertical gets NO vertical boost — pure meritocracy.
  // Gated by signal density to prevent phantom boosts for irrelevant primitives.
  const isHomeVertical = verticalAffinity
    && verticalAffinity !== 'ultimate'
    && tagged.sourceVertical === verticalAffinity
    && hits > 0;
  const verticalAffinityBonus = isHomeVertical
    ? 0.10 * Math.min(rawDensity / 0.15, 1)
    : 0;

  // Composite scoring — signal-dominant, context-aware, structure-boosted, vertical-aware
  const affinity = Math.min(signalAffinity * 0.5 + capRatio * 0.5, 1);
  const compounding =
    signalAffinity * 0.35 +
    rawDensityBonus +
    capRatio * 0.15 +
    breadthScore * 0.08 +
    weightFactor * 0.05 +
    contextBonus +
    structuralArchetypeBonus +
    verticalAffinityBonus;

  return {
    primitive: tagged.primitive,
    sourceVertical: tagged.sourceVertical,
    affinityScore: Math.round(affinity * 1000) / 1000,
    signalHits: hits,
    totalSignals: tagged.signals.length,
    compoundingScore: Math.round(compounding * 1000) / 1000,
    structuralBoost: Math.round(structBoost * 1000) / 1000,
    chainPosition: -1,   // Set by chain sequencer after selection
    collisionScore: 0,   // Set by chain sequencer after selection
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4B — CHAIN EXECUTION SEQUENCER (v23.0.0)
// ═══════════════════════════════════════════════════════════════════════════════
//
// After selection, primitives are ordered into a deterministic execution chain.
// Each primitive's collision score cascades from its predecessor — the chain
// narrows the behavioral space stage by stage, creating coordinated system
// behavior rather than isolated enhancements.
//
// v23 Chain Architecture — 13 stages, expanded where cognitive density warrants:
//   Stage 1:  Foundation   (CORE, SYSTEM, MEMORY)            — bootstrap, config, state
//   Stage 2:  Perception   (NERVE, ENCODE, RELAY, IDENTITY)  — signals, parsing, context
//   Stage 3:  Reasoning    (BRAIN, DREAM, LINGUA, ORACLE)    — cognition, synthesis, prediction
//   Stage 4:  Protection   (DEFENSE, GOVERNANCE, CONSCIENCE, AUDIT) — security → compliance → ethics → record
//   Stage 5:  Resilience   (REFLEX, RIPPLE, FAILSAFE)        — recovery, containment
//   Stage 6:  Observation  (BEACON, VISION, SHADOW)          — telemetry, monitoring
//   Stage 7:  Evolution    (EVOLUTION, FORGE, ENGINEER)       — adaptation, infrastructure
//   Stage 8:  Integration  (NEXUS, INTEGRATION, CORTEX, TREATY) — routing, orchestration, contracts
//   Stage 9:  Operations   (ACCESS, HARVEST, ECHO, ECONOMY)  — permissions, collection, cost
//   Stage 10: Stealth      (WRAITH, PHANTOM, SANDBOX)        — covert, isolated execution
//   Stage 11: Sovereign    (SOVEREIGN, COMPASS, ATLAS)       — autonomy, direction, observability
//   Stage 12: Cognitive    (INCLUSIVE, MEDIC, DECODE)         — accessibility, healing, extraction
//   Stage 13+: Vertical Injection                            — domain-specific capabilities
//
// Key v23 changes:
//   - CONSCIENCE moved to Protection (Stage 4) — ethics BEFORE execution
//   - DREAM stays Iron Law at Stage 3 — Kenneth's DOI, autonomous heartbeat
//   - ORACLE added to Reasoning (Stage 3) — predict after synthesize
//   - ENCODE added to Perception (Stage 2) — parse before reason
//   - LINGUA added to Reasoning (Stage 3) — language processing pre-prediction
//   - CORTEX added to Integration (Stage 8) — multi-agent orchestration
//   - ECONOMY added to Operations (Stage 9) — cost tracking
//   - Synergy pairs boost co-selected complementary primitives by 15%
//   - Two-phase cascade decay: 0.87 spine / 0.93 extension
//
// The only differentiator between scanners is WHICH capabilities fill the chain.
// The chain spine itself is universal across all verticals.
// ═══════════════════════════════════════════════════════════════════════════════

/** Deterministic chain order — primitives listed earlier run first in the chain */
const CHAIN_ORDER_MAP: Record<string, number> = {
  // Stage 1: Foundation
  CORE: 1, SYSTEM: 2, MEMORY: 3,
  // Stage 2: Perception
  NERVE: 4, ENCODE: 5, RELAY: 6, IDENTITY: 7,
  // Stage 3: Reasoning
  BRAIN: 8, DREAM: 9, LINGUA: 10, ORACLE: 11,
  // Stage 4: Protection (security → compliance → ethics → record)
  DEFENSE: 12, GOVERNANCE: 13, CONSCIENCE: 14, AUDIT: 15,
  // Stage 5: Resilience
  REFLEX: 16, RIPPLE: 17, FAILSAFE: 18,
  // Stage 6: Observation
  BEACON: 19, VISION: 20, SHADOW: 21,
  // Stage 7: Evolution
  EVOLUTION: 22, FORGE: 23, ENGINEER: 24,
  // Stage 8: Integration
  NEXUS: 25, INTEGRATION: 26, CORTEX: 27, TREATY: 28,
  // Stage 9: Operations
  ACCESS: 29, HARVEST: 30, ECHO: 31, ECONOMY: 32,
  // Stage 10: Stealth & Advanced
  WRAITH: 33, PHANTOM: 34, SANDBOX: 35,
  // Stage 11: Sovereign & Specialist
  SOVEREIGN: 36, COMPASS: 37, ATLAS: 38,
  // Stage 12: Cognitive Core
  INCLUSIVE: 39, MEDIC: 40, DECODE: 41,
  // Stage 13+: Reserved for vertical expansion (auto-assigned)
};

/** The maximum known spine position — expansion primitives start after this */
const MAX_SPINE_CHAIN_POS = 41;

/**
 * Cascade decay factors — two-phase model.
 * Spine (positions 1-28): tight coordination at 0.87
 * Extension (positions 29+): gentler 0.93 preserves vertical identity
 */
const SPINE_DECAY = 0.87;
const EXTENSION_DECAY = 0.93;

/**
 * Synergy pairs — complementary primitives that produce exponential value
 * when co-selected. Each primitive in a pair gets a 15% collision score
 * boost applied AFTER cascade decay. Multiplicative if a primitive appears
 * in multiple pairs (e.g., DREAM paired with both BRAIN and MEMORY).
 */
const SYNERGY_PAIRS: ReadonlyArray<[string, string]> = [
  ['BRAIN', 'DREAM'],          // Cognitive reasoning + offline synthesis
  ['DEFENSE', 'IMMUNITY'],     // Threat detection + behavioral fingerprinting
  ['FORGE', 'ENGINEER'],       // Code generation + infrastructure
  ['ENCODE', 'DECODE'],        // Bidirectional data I/O
  ['HARVEST', 'ECHO'],         // Data collection + replay/simulation
  ['NEXUS', 'CORTEX'],         // AI routing + multi-agent orchestration
  ['GOVERNANCE', 'CONSCIENCE'],// Policy enforcement + ethical gating
  ['MEMORY', 'DREAM'],         // Persistent state + pattern synthesis
  ['EVOLUTION', 'VISION'],     // Self-improvement + future-state modeling
  ['ORACLE', 'COMPASS'],       // Prediction + strategic direction
];

/** Synergy boost multiplier per co-selected pair */
const SYNERGY_BOOST = 1.15;

/**
 * Sequence selected primitives into a deterministic execution chain.
 *
 * This is the architectural bridge between "individual scoring" and
 * "coordinated system behavior". After this pass:
 *   - Every primitive has a chainPosition (execution order)
 *   - Every primitive has a collisionScore (cascading from predecessor)
 *   - Synergy pairs receive a 15% post-cascade boost
 *   - The chain is identical regardless of vertical — only the injected
 *     capabilities differ
 *
 * @param selected The 40 selected primitives (unordered)
 * @returns The same primitives, chain-ordered with cascading collision scores
 */
function sequenceChain(selected: PoolCandidate[]): PoolCandidate[] {
  // Assign chain positions: spine primitives use fixed order,
  // expansion primitives are appended by score after the spine
  const spineSlots: PoolCandidate[] = [];
  const expansionSlots: PoolCandidate[] = [];

  for (const c of selected) {
    const knownPos = CHAIN_ORDER_MAP[c.primitive.name.toUpperCase()];
    if (knownPos !== undefined) {
      c.chainPosition = knownPos;
      spineSlots.push(c);
    } else {
      expansionSlots.push(c);
    }
  }

  // Sort spine by fixed chain order
  spineSlots.sort((a, b) => a.chainPosition - b.chainPosition);

  // Expansion primitives: order by compounding score descending,
  // assigned positions after the spine
  expansionSlots.sort((a, b) => b.compoundingScore - a.compoundingScore);
  let nextPos = MAX_SPINE_CHAIN_POS + 1;
  for (const c of expansionSlots) {
    c.chainPosition = nextPos++;
  }

  // Merge into final chain
  const chain = [...spineSlots, ...expansionSlots];

  // Build synergy lookup — which primitives are co-selected partners?
  const selectedNames = new Set(chain.map(c => c.primitive.name.toUpperCase()));
  const synergyMultipliers = new Map<string, number>();
  for (const [a, b] of SYNERGY_PAIRS) {
    if (selectedNames.has(a) && selectedNames.has(b)) {
      synergyMultipliers.set(a, (synergyMultipliers.get(a) ?? 1) * SYNERGY_BOOST);
      synergyMultipliers.set(b, (synergyMultipliers.get(b) ?? 1) * SYNERGY_BOOST);
    }
  }

  // Compute cascading collision scores with two-phase decay.
  // The first primitive gets its raw compounding score as collision score.
  // Each subsequent primitive's collision score is:
  //   predecessor.collisionScore * decay + own.compoundingScore * (1 - decay)
  // where decay = SPINE_DECAY for positions 1-28, EXTENSION_DECAY for 29+.
  // Synergy boost is applied AFTER cascade computation.
  if (chain.length > 0) {
    const baseScore = Math.round(chain[0].compoundingScore * 100);
    chain[0].collisionScore = Math.min(99, Math.max(20, baseScore));

    // Apply synergy to first primitive if applicable
    const firstSynergy = synergyMultipliers.get(chain[0].primitive.name.toUpperCase());
    if (firstSynergy) {
      chain[0].collisionScore = Math.round(Math.min(99, chain[0].collisionScore * firstSynergy));
    }

    for (let i = 1; i < chain.length; i++) {
      const decay = chain[i].chainPosition <= 28 ? SPINE_DECAY : EXTENSION_DECAY;
      const predecessor = chain[i - 1].collisionScore;
      const ownContribution = chain[i].compoundingScore * 100;
      let cascaded = predecessor * decay + ownContribution * (1 - decay);

      // Apply synergy boost if this primitive has co-selected partners
      const synergy = synergyMultipliers.get(chain[i].primitive.name.toUpperCase());
      if (synergy) {
        cascaded *= synergy;
      }

      chain[i].collisionScore = Math.round(Math.min(99, Math.max(10, cascaded)));
    }
  }

  return chain;
}


// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Minimum compounding score to qualify for selection.
 * Primitives below this threshold add noise, not value.
 */
const SELECTION_THRESHOLD = 0.10;

/**
 * The 40-Primitive Matrix — non-negotiable architectural invariant.
 * Every Ascension output MUST produce exactly this topology:
 *   12 Organs · 12 Layers · 8 Engines · 8 Agents = 40 Primitives
 */
const MATRIX_QUOTAS: Record<string, number> = {
  organ: 12,
  layer: 12,
  engine: 8,
  agent: 8,
};
const MAX_SLOTS = 40;

/**
 * §5 — 3-TIER MANDATORY PRIMITIVE MODEL
 *
 * Tier 1 — IRON LAW (always selected, no exceptions)
 *   Architectural invariants from doc-04. Every scan, every vertical,
 *   every upload MUST include them.
 *
 * Tier 2 — STRONG DEFAULT (loaded unless score is literally 0)
 *   High-value for any software. Only absent if the code genuinely has
 *   zero affinity AND no structural archetype match.
 *
 * Tier 3 — VERTICAL BOOST (2× scoring weight within home vertical)
 *   Vertical expansion primitives get doubled score on their home
 *   vertical. Ultimate gets Iron Law + Strong Default only — NO
 *   vertical boost — to remain pure meritocracy.
 */

/** Tier 1: Architectural invariants — ALWAYS selected, no exceptions */
const IRON_LAW_PRIMITIVES: ReadonlySet<string> = new Set([
  'CORE',        // Bootstrap primitive — the kernel
  'DEFENSE',     // Invariant #3: DEFENSE is terminal
  'GOVERNANCE',  // Invariant #2: GOVERNANCE cannot be bypassed
  'CONSCIENCE',  // Ethical gating — pre-execution, non-negotiable
  'AUDIT',       // Invariant #1: AUDIT is immutable
  'FAILSAFE',    // Circuit breakers — always
  'MEMORY',      // 4-tier persistent state — always
  'BRAIN',       // Cognitive processing — always
  'DREAM',       // Kenneth's DOI — autonomous offline synthesis, substrate heartbeat
]);

/** Tier 2: Near-guaranteed — only absent if truly zero affinity */
const STRONG_DEFAULT_PRIMITIVES: ReadonlySet<string> = new Set([
  'MEDIC',       // Self-healing diagnostics
  'ENGINEER',    // Infrastructure management
  'INCLUSIVE',   // Accessibility — first-class, not afterthought
  'VISION',      // Future-state modeling and prediction
  'ORACLE',      // Prediction and forecasting
  'WRAITH',      // Stealth operations and obfuscation
]);

/** Score floors per tier */
const IRON_LAW_SCORE_FLOOR = 0.30;
const STRONG_DEFAULT_SCORE_FLOOR = 0.15;

/** Vertical boost multiplier for expansion primitives on home vertical */
const VERTICAL_BOOST_MULTIPLIER = 2.0;

/**
 * Select the optimal 40 primitives enforcing the 12/12/8/8 matrix.
 *
 * Phase 0: Force-select mandatory primitives (DEFENSE, MEMORY, AUDIT, etc.)
 *          with a score floor so they always appear in every scan result.
 * Phase 1: Score-rank remaining candidates and greedily fill each role quota
 *          with the highest-scoring primitives of that role.
 * Phase 2: If any role is under-filled (code didn't trigger enough signals),
 *          backfill from the remaining candidates of that role, relaxing
 *          the signal-hit minimum to 1, then to 0 if needed.
 * Phase 3: Final validation — every slot filled, topology locked.
 */
function selectOptimalPrimitives(
  candidates: PoolCandidate[],
  verticalAffinity?: string,
): PoolCandidate[] {
  // Sort all candidates by score descending
  const sorted = [...candidates]
    .sort((a, b) => b.compoundingScore - a.compoundingScore);

  // Bucket candidates by role
  const byRole: Record<string, PoolCandidate[]> = {
    organ: [],
    layer: [],
    engine: [],
    agent: [],
  };
  for (const c of sorted) {
    const role = c.primitive.role;
    if (byRole[role]) byRole[role].push(c);
  }

  const selected: PoolCandidate[] = [];
  const usedIds = new Set<string>();

  // Phase 0A: Force-select IRON LAW primitives (Tier 1)
  // These are architectural invariants — every scan MUST include them.
  const roleCounters: Record<string, number> = { organ: 0, layer: 0, engine: 0, agent: 0 };

  for (const c of sorted) {
    if (!IRON_LAW_PRIMITIVES.has(c.primitive.name)) continue;
    if (usedIds.has(c.primitive.id)) continue;

    const role = c.primitive.role;
    const quota = MATRIX_QUOTAS[role] ?? 0;
    if (roleCounters[role] >= quota) continue;

    // Iron Law primitives never score below their floor
    if (c.compoundingScore < IRON_LAW_SCORE_FLOOR) {
      c.compoundingScore = IRON_LAW_SCORE_FLOOR;
    }

    selected.push(c);
    usedIds.add(c.primitive.id);
    roleCounters[role]++;
  }

  // Phase 0B: Force-select STRONG DEFAULT primitives (Tier 2)
  // Only skipped if the primitive has literally zero affinity (score === 0
  // AND no signal hits AND no structural match). Otherwise, floor-boosted.
  for (const c of sorted) {
    if (!STRONG_DEFAULT_PRIMITIVES.has(c.primitive.name)) continue;
    if (usedIds.has(c.primitive.id)) continue;

    // Strong Defaults can be skipped if truly zero relevance
    if (c.compoundingScore === 0 && c.signalHits === 0 && c.structuralBoost === 0) continue;

    const role = c.primitive.role;
    const quota = MATRIX_QUOTAS[role] ?? 0;
    if (roleCounters[role] >= quota) continue;

    // Apply score floor so they rank competitively
    if (c.compoundingScore < STRONG_DEFAULT_SCORE_FLOOR) {
      c.compoundingScore = STRONG_DEFAULT_SCORE_FLOOR;
    }

    selected.push(c);
    usedIds.add(c.primitive.id);
    roleCounters[role]++;
  }

  // Phase 0C: Apply VERTICAL BOOST (Tier 3) — 2× score multiplier
  // for expansion primitives on their home vertical. Ultimate = no boost.
  // This doesn't force-select; it multiplies score so they win competitively.
  if (verticalAffinity && verticalAffinity !== 'ultimate') {
    for (const c of sorted) {
      if (usedIds.has(c.primitive.id)) continue;
      if (c.sourceVertical === verticalAffinity && c.signalHits > 0) {
        c.compoundingScore *= VERTICAL_BOOST_MULTIPLIER;
      }
    }
  }

  // Phase 1: Fill each role quota with highest-scoring candidates
  // that meet the quality threshold (score >= threshold AND signalHits >= 2)
  for (const [role, quota] of Object.entries(MATRIX_QUOTAS)) {
    const roleCandidates = byRole[role] ?? [];
    let filled = selected.filter(s => s.primitive.role === role).length;
    for (const c of roleCandidates) {
      if (filled >= quota) break;
      if (usedIds.has(c.primitive.id)) continue;
      if (c.compoundingScore >= SELECTION_THRESHOLD && c.signalHits >= 2) {
        selected.push(c);
        usedIds.add(c.primitive.id);
        filled++;
      }
    }
  }

  // Phase 2: Backfill under-filled roles with relaxed requirements
  // First pass: relax to signalHits >= 1
  // Second pass: accept any candidate (signalHits >= 0)
  for (const minHits of [1, 0]) {
    for (const [role, quota] of Object.entries(MATRIX_QUOTAS)) {
      const currentCount = selected.filter(s => s.primitive.role === role).length;
      if (currentCount >= quota) continue;

      const roleCandidates = byRole[role] ?? [];
      let needed = quota - currentCount;
      for (const c of roleCandidates) {
        if (needed <= 0) break;
        if (usedIds.has(c.primitive.id)) continue;
        if (c.signalHits >= minHits) {
          selected.push(c);
          usedIds.add(c.primitive.id);
          needed--;
        }
      }
    }
  }

  // Sort final selection by compounding score descending for consistent output
  selected.sort((a, b) => b.compoundingScore - a.compoundingScore);

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
  verticalAffinity?: string,
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

  // ── ECOSYSTEM DETECTION ─────────────────────────────────────────────
  const ecosystem = detectEcosystem(codeContent);

  // ── SEMANTIC DRIFT DETECTION ───────────────────────────────────────
  const driftDetections = detectDrift(codeContent, ecosystem);

  // ── INTERFACE CONTRACT & ENVIRONMENT PROFILE ───────────────────────
  const contract = extractContract(codeContent);
  const environmentProfile = profileEnvironment(codeContent, ecosystem);

  // Build intent-confirmed primitive set from structural analysis
  const intentPrimitives = new Set<string>();
  for (const match of structuralMatches) {
    if (match.intentHits > 0) {
      for (const prim of match.primitives) {
        intentPrimitives.add(prim.toUpperCase());
      }
    }
  }

  // Score all candidates with mode-aware dual-matrix weighting + structural boosts + vertical affinity
  const scored = pool.map(tagged =>
    scoreCandidate(tagged, lowerCode, codeTokens, signalDocFreq, poolSize, mode, structuralBoosts, verticalAffinity)
  );

  // Select the optimal 40 primitives — MATRIX-ENFORCED: 12/12/8/8
  const selected = selectOptimalPrimitives(scored, verticalAffinity);

  // ── CHAIN SEQUENCING ──────────────────────────────────────────────────
  // Order the 40 selected primitives into a deterministic execution chain.
  // Every vertical uses the same chain spine — the only differentiator is
  // WHICH capabilities fill each slot. Collision scores cascade downward
  // so earlier primitives narrow the behavioral space for later ones.
  const chained = sequenceChain(selected);

  // Rebalance weights so selected primitives sum to 1.0
  const totalScore = chained.reduce((sum, c) => sum + c.compoundingScore, 0);
  const fullSurface: VerticalPrimitive[] = chained.map(c => ({
    ...c.primitive,
    weight: totalScore > 0
      ? Math.round((c.compoundingScore / totalScore) * 10000) / 10000
      : Math.round((1.0 / chained.length) * 10000) / 10000,
    inherited: false,
  }));

  // Source distribution
  const sourceDistribution: Record<string, number> = {};
  const roleDistribution: Record<string, number> = {};
  for (const s of chained) {
    sourceDistribution[s.sourceVertical] = (sourceDistribution[s.sourceVertical] ?? 0) + 1;
    roleDistribution[s.primitive.role] = (roleDistribution[s.primitive.role] ?? 0) + 1;
  }

  // ── CONFIDENCE BANDING ─────────────────────────────────────────────
  const confidenceBands = bandResults(chained, structuralBoosts, intentPrimitives);
  const bandDistribution = getBandDistribution(confidenceBands);

  // ── 4-AXIS COMPATIBILITY SCORING ───────────────────────────────────
  const compatibilityReports = batchCompatibility(
    chained.map(c => ({ name: c.primitive.name, signalScore: c.affinityScore })),
    contract,
    environmentProfile,
    structuralMatches,
  );

  // ── MERGE SIMULATION ──────────────────────────────────────────────
  const selectedSet = new Set(chained.map(c => c.primitive.name.toUpperCase()));
  const mergeReport = runMergeSimulation(compatibilityReports, structuralMatches, selectedSet);

  // ── ECOSYSTEM REGISTRY SUGGESTIONS ─────────────────────────────────
  const allGaps = compatibilityReports.flatMap(r => r.closedGaps);
  const uniqueGaps = [...new Set(allGaps)];
  const registrySuggestions = suggestForGaps(uniqueGaps, ecosystem);

  // ── FEEDBACK LOOP — teach the scanner from HIGH/MEDIUM matches ─────
  for (const banded of confidenceBands) {
    if (banded.band === 'high' || banded.band === 'medium') {
      const matchTerms = structuralMatches
        .filter(m => m.primitives.includes(banded.primitive))
        .flatMap(m => m.primitives);
      if (matchTerms.length > 0) {
        const extraction = extractContext(codeContent, banded.primitive, matchTerms[0], matchTerms);
        recordConfirmedMatch(extraction);
      }
    }
  }

  return {
    selectedPrimitives: chained,
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
    ecosystem,
    driftDetections,
    contract,
    environmentProfile,
    compatibilityReports,
    mergeReport,
    registrySuggestions,
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

// Re-export Ascension subsystem types for consumer convenience
export type { AscensionMode } from '../ascension/ascension-weights';
export {
  getAscensionRankings,
  getTopByDimension,
  getAllAscensionWeights,
} from '../ascension/ascension-weights';

export type { StructuralMatch, PresenceState } from '../ascension/structural-signatures';
export { getArchetypes, getArchetypeCount } from '../ascension/structural-signatures';

export type { BandedResult, ConfidenceBand } from '../ascension/confidence-banding';
export { filterByBand, getBandDistribution as getBandDist } from '../ascension/confidence-banding';
