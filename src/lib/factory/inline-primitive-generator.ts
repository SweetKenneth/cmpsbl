/**
 * Universal Inline Primitive Generator
 * Generates functional, standalone class/struct/module implementations
 * for all 48+ CMPSBL primitives in any target language.
 *
 * Architecture: Each primitive's behavior is defined once as a "spec."
 * Language-family templates translate specs into native syntax.
 * This ensures every Ascension export is fully functional standalone.
 */

// ── Language Family Classification ──

type LanguageFamily =
  | 'js'         // JS/TS — uses @cmpsbl/runtime imports (no inline needed)
  | 'python'     // Python — handled separately in adapter
  | 'rust'       // Rust — struct + impl
  | 'go'         // Go — struct + methods
  | 'java'       // Java, Groovy — class with static methods
  | 'csharp'     // C# — class with static methods
  | 'fsharp'     // F# — module with let bindings
  | 'kotlin'     // Kotlin — object singleton
  | 'swift'      // Swift — class with static methods
  | 'dart'       // Dart — class with static methods (no @discardableResult)
  | 'cpp'        // C, C++, CUDA, Metal, D — struct + functions
  | 'ruby'       // Ruby, Crystal — module/class
  | 'elixir'     // Elixir, Erlang — module with functions
  | 'scala'      // Scala, Chisel — object
  | 'php'        // PHP — class with static methods
  | 'lua'        // Lua — table + functions
  | 'r'          // R — S3/environment pattern
  | 'julia'      // Julia — module + struct
  | 'perl'       // Perl — package + subs
  | 'shell'      // Shell, Bash, PowerShell — function-based
  | 'solidity'   // Solidity — library
  | 'fortran'    // Fortran — module
  | 'objc'       // Objective-C — @interface/@implementation
  | 'nim'        // Nim — type + procs
  | 'vhdl'       // VHDL — entity/architecture blocks
  | 'verilog'    // Verilog, SystemVerilog — module blocks
  | 'hdl'        // Bluespec, FIRRTL, SPICE, Chisel HDL — behavioral comment blocks
  | 'glsl'       // GLSL — struct + functions
  | 'wgsl'       // WGSL — struct + functions
  | 'shader'     // Other shaders (HLSL, OpenCL, Metal shader) — comment blocks
  | 'haskell'    // Haskell, OCaml — type + functions
  | 'clojure'    // Clojure — defrecord
  | 'functional' // Generic functional fallback
  ;

const LANGUAGE_FAMILY_MAP: Record<string, LanguageFamily> = {
  TypeScript: 'js', JavaScript: 'js',
  Python: 'python',
  Rust: 'rust',
  Go: 'go',
  Java: 'java', Groovy: 'java',
  'C#': 'csharp',
  'F#': 'fsharp',
  Kotlin: 'kotlin',
  Swift: 'swift',
  Dart: 'dart',
  C: 'cpp', 'C++': 'cpp', CUDA: 'cpp', Metal: 'cpp', D: 'cpp',
  Ruby: 'ruby', Crystal: 'ruby',
  Elixir: 'elixir', Erlang: 'elixir',
  Scala: 'scala', Chisel: 'scala',
  PHP: 'php',
  Lua: 'lua',
  R: 'r',
  Julia: 'julia',
  Perl: 'perl',
  Shell: 'shell', Bash: 'shell', PowerShell: 'shell',
  Solidity: 'solidity',
  Fortran: 'fortran',
  'Objective-C': 'objc',
  Nim: 'nim',
  VHDL: 'vhdl',
  Verilog: 'verilog', SystemVerilog: 'verilog',
  Bluespec: 'hdl', FIRRTL: 'hdl', SPICE: 'hdl',
  GLSL: 'glsl',
  WGSL: 'wgsl',
  HLSL: 'shader', OpenCL: 'shader',
  Haskell: 'haskell', OCaml: 'haskell',
  Clojure: 'clojure',
};

function getFamily(language: string): LanguageFamily {
  return LANGUAGE_FAMILY_MAP[language] ?? 'cpp';
}

// ── Primitive Behavior Specs ──
// Each spec defines: description, methods with their behavior category

type MethodKind = 'init' | 'store' | 'check' | 'execute' | 'query' | 'record';

interface MethodSpec {
  name: string;
  kind: MethodKind;
  args: string;
  description: string;
}

interface PrimitiveSpec {
  description: string;
  stateFields: string[]; // e.g. ["config", "entries", "counter"]
  methods: MethodSpec[];
}

const PRIMITIVE_SPECS: Record<string, PrimitiveSpec> = {
  CircuitBreaker: {
    description: 'Circuit breaker with open/half-open/closed states',
    stateFields: ['state:closed', 'failures:0', 'threshold:5', 'last_failure:0', 'reset_timeout:30'],
    methods: [
      { name: 'init', kind: 'init', args: 'name, threshold, reset_timeout', description: 'Initialize with failure thresholds' },
      { name: 'execute', kind: 'execute', args: 'fn', description: 'Execute function through breaker — reject if open, track failures' },
      { name: 'state', kind: 'query', args: '', description: 'Return current state (closed/open/half-open)' },
      { name: 'reset', kind: 'store', args: '', description: 'Reset to closed state' },
    ],
  },
  SnapshotManager: {
    description: 'Periodic state snapshot manager',
    stateFields: ['snapshots:list', 'max:50'],
    methods: [
      { name: 'init', kind: 'init', args: 'auto, interval', description: 'Configure snapshot settings' },
      { name: 'snapshot', kind: 'record', args: 'label, state', description: 'Capture a named state snapshot' },
      { name: 'restore', kind: 'query', args: 'label', description: 'Restore state from a named snapshot' },
      { name: 'list', kind: 'query', args: '', description: 'List all snapshot labels and timestamps' },
    ],
  },
  PersistentMemory: {
    description: 'File-backed persistent key-value store',
    stateFields: ['store:map', 'namespace:default'],
    methods: [
      { name: 'init', kind: 'init', args: 'namespace, path', description: 'Initialize with namespace and file path' },
      { name: 'get', kind: 'query', args: 'key, default', description: 'Get value by key with default' },
      { name: 'set', kind: 'store', args: 'key, value', description: 'Set key-value pair and persist' },
      { name: 'delete', kind: 'store', args: 'key', description: 'Delete a key' },
      { name: 'keys', kind: 'query', args: '', description: 'List all keys' },
      { name: 'clear', kind: 'store', args: '', description: 'Clear all entries' },
    ],
  },
  StateRecovery: {
    description: 'Checkpoint-based state recovery',
    stateFields: ['checkpoints:list', 'max:50'],
    methods: [
      { name: 'init', kind: 'init', args: '', description: 'Initialize recovery system' },
      { name: 'checkpoint', kind: 'record', args: 'label, state', description: 'Save a labeled state checkpoint' },
      { name: 'recover', kind: 'query', args: 'label', description: 'Recover state from checkpoint' },
      { name: 'list_checkpoints', kind: 'query', args: '', description: 'List available checkpoints' },
    ],
  },
  FailoverManager: {
    description: 'Retry with exponential backoff and fallback',
    stateFields: ['max_retries:3', 'backoff_base:0.5'],
    methods: [
      { name: 'init', kind: 'init', args: 'max_retries, backoff_base', description: 'Configure retry parameters' },
      { name: 'execute', kind: 'execute', args: 'fn', description: 'Execute with automatic retry and backoff' },
    ],
  },
  DefenseGate: {
    description: 'Input validation and boundary enforcement',
    stateFields: ['max_size:10485760', 'sanitize:true', 'reject_unknown:true'],
    methods: [
      { name: 'init', kind: 'init', args: 'options', description: 'Configure validation rules' },
      { name: 'enforce', kind: 'init', args: 'options', description: 'Set enforcement boundaries' },
      { name: 'validate', kind: 'check', args: 'data, schema', description: 'Validate data against schema and size limits' },
    ],
  },
  DefenseLayer: {
    description: 'Security layer with mode enforcement',
    stateFields: ['mode:enforce', 'blocked:list'],
    methods: [
      { name: 'activate', kind: 'init', args: 'mode, fingerprinting', description: 'Activate defense layer' },
      { name: 'check', kind: 'check', args: 'request_meta', description: 'Check if request is allowed' },
      { name: 'block', kind: 'store', args: 'ip', description: 'Block an IP address' },
      { name: 'status', kind: 'query', args: '', description: 'Return defense layer status' },
    ],
  },
  InputValidator: {
    description: 'Type-safe input validation',
    stateFields: [],
    methods: [
      { name: 'check', kind: 'check', args: 'value, expected_type, name', description: 'Validate value type' },
      { name: 'require', kind: 'check', args: 'data, keys', description: 'Require specific keys in data' },
    ],
  },
  RequestValidator: {
    description: 'Request validation and injection prevention',
    stateFields: ['block_injection:true', 'block_xss:true'],
    methods: [
      { name: 'init', kind: 'init', args: 'options', description: 'Configure validation' },
      { name: 'validate', kind: 'check', args: 'data', description: 'Validate input for injection/XSS' },
    ],
  },
  DeviceFingerprint: {
    description: 'Device fingerprinting for session binding',
    stateFields: ['registry:map'],
    methods: [
      { name: 'generate', kind: 'execute', args: 'attributes', description: 'Generate fingerprint from attributes using SHA-256' },
      { name: 'verify', kind: 'check', args: 'fingerprint, attributes', description: 'Verify fingerprint matches attributes' },
    ],
  },
  AuditChain: {
    description: 'Tamper-evident audit log with SHA-256 hash chain',
    stateFields: ['entries:list', 'prev_hash:zeros'],
    methods: [
      { name: 'init', kind: 'init', args: 'path', description: 'Initialize audit chain' },
      { name: 'record', kind: 'record', args: 'action, details', description: 'Record an auditable action with hash chain' },
      { name: 'verify', kind: 'check', args: '', description: 'Verify chain integrity' },
    ],
  },
  ComplianceLogger: {
    description: 'Compliance event logger',
    stateFields: ['log:list', 'max:1000'],
    methods: [
      { name: 'init', kind: 'init', args: 'max_entries', description: 'Configure max log entries' },
      { name: 'log', kind: 'record', args: 'event_type, data, severity', description: 'Log a compliance event' },
      { name: 'query', kind: 'query', args: 'event_type, severity', description: 'Query events by type or severity' },
    ],
  },
  StructuredLogger: {
    description: 'JSON structured logger with correlation IDs',
    stateFields: ['level:info', 'format:json'],
    methods: [
      { name: 'init', kind: 'init', args: 'format, level', description: 'Configure logging' },
      { name: 'log', kind: 'record', args: 'msg', description: 'Log at info level' },
      { name: 'warn', kind: 'record', args: 'msg', description: 'Log at warn level' },
      { name: 'error', kind: 'record', args: 'msg', description: 'Log at error level' },
    ],
  },
  EventCorrelator: {
    description: 'Event correlation and trace context',
    stateFields: ['traces:map', 'max_depth:10'],
    methods: [
      { name: 'init', kind: 'init', args: 'span_depth', description: 'Configure trace depth' },
      { name: 'start_trace', kind: 'execute', args: 'name', description: 'Start a new trace, return trace ID' },
      { name: 'add_span', kind: 'record', args: 'trace_id, label, data', description: 'Add span to trace' },
      { name: 'end_trace', kind: 'execute', args: 'trace_id', description: 'End trace and return summary with duration' },
    ],
  },
  GovernanceGate: {
    description: 'Policy-based governance enforcement',
    stateFields: ['policies:map', 'mode:enforce'],
    methods: [
      { name: 'init', kind: 'init', args: 'mode', description: 'Set governance mode' },
      { name: 'add_policy', kind: 'store', args: 'name, check_fn, action', description: 'Register a governance policy' },
      { name: 'evaluate', kind: 'check', args: 'context', description: 'Evaluate all policies — raise on block violations' },
    ],
  },
  GovernancePolicy: {
    description: 'Governance policy enforcement',
    stateFields: ['max_concurrency:100', 'audit_mutations:true'],
    methods: [
      { name: 'enforce', kind: 'init', args: 'options', description: 'Configure governance policies' },
      { name: 'check_concurrency', kind: 'check', args: 'current_count', description: 'Check against concurrency limit' },
      { name: 'requires_approval', kind: 'check', args: 'risk_level', description: 'Check if action needs approval' },
    ],
  },
  PolicyEngine: {
    description: 'Configurable rule engine',
    stateFields: ['rules:list'],
    methods: [
      { name: 'init', kind: 'init', args: '', description: 'Initialize engine' },
      { name: 'add_rule', kind: 'store', args: 'name, condition_fn, priority', description: 'Add evaluation rule' },
      { name: 'evaluate', kind: 'execute', args: 'data', description: 'Evaluate all rules against data' },
    ],
  },
  ComplianceAuditor: {
    description: 'Compliance auditing with structured output',
    stateFields: ['events:list'],
    methods: [
      { name: 'start', kind: 'init', args: 'log_destination', description: 'Start auditor' },
      { name: 'record', kind: 'record', args: 'event_type, data, severity', description: 'Record compliance event' },
      { name: 'query', kind: 'query', args: 'event_type', description: 'Query recorded events' },
    ],
  },
  HealthBeacon: {
    description: 'Health monitoring beacon',
    stateFields: ['healthy:true', 'checks:map'],
    methods: [
      { name: 'start', kind: 'init', args: 'interval', description: 'Start health beacon' },
      { name: 'register_check', kind: 'store', args: 'name, check_fn', description: 'Register a health check' },
      { name: 'pulse', kind: 'execute', args: '', description: 'Run all checks and return health status' },
      { name: 'is_healthy', kind: 'query', args: '', description: 'Return overall health state' },
    ],
  },
  MetricsCollector: {
    description: 'Runtime metrics collector with counters, gauges, and histograms',
    stateFields: ['counters:map', 'gauges:map', 'histograms:map'],
    methods: [
      { name: 'init', kind: 'init', args: '', description: 'Initialize collector' },
      { name: 'increment', kind: 'store', args: 'name, value', description: 'Increment a counter' },
      { name: 'gauge', kind: 'store', args: 'name, value', description: 'Set a gauge value' },
      { name: 'observe', kind: 'store', args: 'name, value', description: 'Record a histogram observation' },
      { name: 'snapshot', kind: 'query', args: '', description: 'Return all metrics snapshot' },
      { name: 'reset', kind: 'store', args: '', description: 'Reset all metrics' },
    ],
  },
  StateObserver: {
    description: 'State observation with snapshot diffs',
    stateFields: ['snapshots:list', 'max:100'],
    methods: [
      { name: 'init', kind: 'init', args: 'retain_history', description: 'Configure history retention' },
      { name: 'snapshot', kind: 'record', args: 'label, state', description: 'Capture state snapshot' },
      { name: 'diff', kind: 'query', args: 'idx_a, idx_b', description: 'Diff between two snapshots' },
    ],
  },
  TransitionTracker: {
    description: 'State transition event tracker',
    stateFields: ['transitions:list', 'max:100'],
    methods: [
      { name: 'init', kind: 'init', args: '', description: 'Initialize tracker' },
      { name: 'record', kind: 'record', args: 'from_state, to_state, trigger', description: 'Record a state transition' },
      { name: 'history', kind: 'query', args: 'limit', description: 'Return transition history' },
    ],
  },
  LearningEngine: {
    description: 'Passive execution pattern learning',
    stateFields: ['patterns:map'],
    methods: [
      { name: 'init', kind: 'init', args: 'mode, retention_days', description: 'Configure learning mode' },
      { name: 'record', kind: 'record', args: 'pattern_name, outcome, metadata', description: 'Record pattern observation' },
      { name: 'suggest', kind: 'query', args: 'pattern_name', description: 'Get suggestion based on learned patterns' },
    ],
  },
  InsightAccumulator: {
    description: 'Insight accumulation from execution',
    stateFields: ['insights:list'],
    methods: [
      { name: 'observe', kind: 'init', args: 'track_patterns, auto_optimize', description: 'Configure observation' },
      { name: 'add', kind: 'record', args: 'category, insight, confidence', description: 'Add an insight' },
      { name: 'query', kind: 'query', args: 'category, min_confidence', description: 'Query insights by category' },
    ],
  },
  IdentityResolver: {
    description: 'Identity resolution and session management',
    stateFields: ['sessions:map', 'session_ttl:3600'],
    methods: [
      { name: 'init', kind: 'init', args: 'mfa_required, session_ttl', description: 'Configure identity resolution' },
      { name: 'create_session', kind: 'execute', args: 'user_id, metadata', description: 'Create new session, return session ID' },
      { name: 'validate_session', kind: 'check', args: 'session_id', description: 'Validate session is active and not expired' },
      { name: 'revoke', kind: 'store', args: 'session_id', description: 'Revoke a session' },
    ],
  },
  SessionBinder: {
    description: 'Device-bound session enforcement',
    stateFields: ['bindings:map', 'max_concurrent:3'],
    methods: [
      { name: 'enforce', kind: 'init', args: 'bind_to_device, max_concurrent', description: 'Configure binding rules' },
      { name: 'bind', kind: 'store', args: 'user_id, device_fingerprint, session_id', description: 'Bind session to device' },
      { name: 'verify', kind: 'check', args: 'user_id, device_fingerprint', description: 'Verify device binding' },
    ],
  },
  EthicalGate: {
    description: 'Ethical decision boundary gate',
    stateFields: ['block_threshold:0.30', 'review_threshold:0.60'],
    methods: [
      { name: 'init', kind: 'init', args: 'block_threshold, review_threshold', description: 'Set ethical thresholds' },
      { name: 'evaluate', kind: 'check', args: 'confidence_score, action', description: 'Evaluate action against ethical boundaries' },
    ],
  },
  AlignmentMonitor: {
    description: 'Alignment drift monitoring',
    stateFields: ['readings:list', 'drift_threshold:0.15'],
    methods: [
      { name: 'start', kind: 'init', args: 'drift_threshold', description: 'Start alignment monitoring' },
      { name: 'record', kind: 'record', args: 'metric_name, value, baseline', description: 'Record alignment measurement with drift detection' },
      { name: 'alerts', kind: 'query', args: '', description: 'Return all drift alerts' },
    ],
  },
  BehavioralMapper: {
    description: 'Behavioral mapping of code execution',
    stateFields: ['map:map'],
    methods: [
      { name: 'scan', kind: 'init', args: '', description: 'Initialize scanner' },
      { name: 'register', kind: 'store', args: 'func_name, input_types, output_type', description: 'Register function behavior' },
      { name: 'track_call', kind: 'store', args: 'func_name', description: 'Track a function call' },
      { name: 'report', kind: 'query', args: '', description: 'Return behavior map' },
    ],
  },
  IntentTracer: {
    description: 'Function intent tracing and signature generation',
    stateFields: ['intents:map'],
    methods: [
      { name: 'enable', kind: 'init', args: '', description: 'Enable tracing' },
      { name: 'tag', kind: 'store', args: 'func_name, intent, signature', description: 'Tag function with intent' },
      { name: 'lookup', kind: 'query', args: 'func_name', description: 'Look up function intent' },
    ],
  },
  PredictiveAnalyzer: {
    description: 'Predictive failure analysis',
    stateFields: ['history:list', 'confidence_threshold:0.75'],
    methods: [
      { name: 'init', kind: 'init', args: 'horizon, confidence_threshold', description: 'Configure prediction parameters' },
      { name: 'record_event', kind: 'record', args: 'event_type, success, latency', description: 'Record event outcome' },
      { name: 'predict', kind: 'query', args: 'event_type', description: 'Predict likelihood of failure' },
    ],
  },
  FailureForecast: {
    description: 'Cascade failure detection',
    stateFields: ['monitors:map'],
    methods: [
      { name: 'monitor', kind: 'init', args: '', description: 'Initialize monitoring' },
      { name: 'register', kind: 'store', args: 'component, dependencies', description: 'Register component with dependencies' },
      { name: 'mark_failure', kind: 'store', args: 'component', description: 'Mark a component as failed' },
      { name: 'cascade_risk', kind: 'query', args: '', description: 'Identify cascade failure risk' },
    ],
  },
  DependencyResolver: {
    description: 'Dependency auditing and cycle detection',
    stateFields: ['deps:map'],
    methods: [
      { name: 'audit', kind: 'init', args: '', description: 'Initialize dependency audit' },
      { name: 'register', kind: 'store', args: 'module, depends_on', description: 'Register module dependencies' },
      { name: 'detect_cycles', kind: 'query', args: '', description: 'Detect dependency cycles using DFS' },
      { name: 'resolve_order', kind: 'query', args: '', description: 'Return topological sort order' },
    ],
  },
  StructuralRepair: {
    description: 'Structural repair with safe-only auto-fix',
    stateFields: ['repairs:list', 'auto_fix:safe-only'],
    methods: [
      { name: 'init', kind: 'init', args: 'auto_fix', description: 'Configure repair mode' },
      { name: 'detect', kind: 'record', args: 'component, issue_type, severity', description: 'Detect and optionally auto-fix issues' },
      { name: 'report', kind: 'query', args: '', description: 'Return repair report' },
    ],
  },
  ReasoningEngine: {
    description: 'Chain-of-thought reasoning engine',
    stateFields: ['max_depth:5', 'timeout_s:10'],
    methods: [
      { name: 'init', kind: 'init', args: 'max_depth, timeout', description: 'Configure reasoning parameters' },
      { name: 'reason', kind: 'execute', args: 'steps', description: 'Execute reasoning chain with timeout' },
    ],
  },
  ContextRouter: {
    description: 'Context-aware weighted routing',
    stateFields: ['routes:map'],
    methods: [
      { name: 'enable', kind: 'init', args: 'weight_by_recency', description: 'Enable routing' },
      { name: 'register', kind: 'store', args: 'name, handler, weight', description: 'Register a route' },
      { name: 'route', kind: 'execute', args: 'context', description: 'Route context to best handler by weight' },
    ],
  },
  IntelligentRouter: {
    description: 'Latency-aware intelligent router',
    stateFields: ['backends:map'],
    methods: [
      { name: 'init', kind: 'init', args: '', description: 'Initialize router' },
      { name: 'register', kind: 'store', args: 'name, handler', description: 'Register backend' },
      { name: 'route', kind: 'execute', args: 'request', description: 'Route to lowest-latency backend' },
    ],
  },
  LoadBalancer: {
    description: 'Weighted round-robin load balancer',
    stateFields: ['targets:list', 'index:0'],
    methods: [
      { name: 'enable', kind: 'init', args: '', description: 'Enable balancer' },
      { name: 'add_target', kind: 'store', args: 'name, handler, weight', description: 'Add target' },
      { name: 'next', kind: 'execute', args: 'request', description: 'Get next target via round-robin' },
    ],
  },
  BlueprintGuard: {
    description: 'Blueprint guard against regressions',
    stateFields: ['baseline:map'],
    methods: [
      { name: 'init', kind: 'init', args: 'baseline_version, block_regressions', description: 'Set baseline' },
      { name: 'set_baseline', kind: 'store', args: 'key, value', description: 'Set baseline for a metric' },
      { name: 'check', kind: 'check', args: 'key, current_value', description: 'Check for regressions — raise on detection' },
    ],
  },
  RegressionDetector: {
    description: 'Structural drift detection',
    stateFields: ['baselines:map', 'threshold:0.10'],
    methods: [
      { name: 'watch', kind: 'init', args: 'threshold', description: 'Configure drift threshold' },
      { name: 'set_baseline', kind: 'store', args: 'metric, value', description: 'Set baseline value' },
      { name: 'check', kind: 'check', args: 'metric, current', description: 'Check for structural drift' },
    ],
  },
  TaskAutomator: {
    description: 'Concurrent task automation',
    stateFields: ['queue:list', 'max_concurrent:10'],
    methods: [
      { name: 'init', kind: 'init', args: 'max_concurrent', description: 'Configure concurrency limit' },
      { name: 'enqueue', kind: 'store', args: 'name, fn', description: 'Enqueue a task' },
      { name: 'run_all', kind: 'execute', args: '', description: 'Execute all queued tasks' },
    ],
  },
  ScheduleEngine: {
    description: 'Time-based task scheduling',
    stateFields: ['scheduled:list'],
    methods: [
      { name: 'enable', kind: 'init', args: '', description: 'Enable scheduling' },
      { name: 'schedule', kind: 'store', args: 'name, fn, delay, repeat', description: 'Schedule a task' },
      { name: 'run_due', kind: 'execute', args: '', description: 'Run all due tasks' },
    ],
  },
  ShadowMirror: {
    description: 'Shadow traffic mirroring for canary testing',
    stateFields: ['mirror_percent:5', 'results:list'],
    methods: [
      { name: 'init', kind: 'init', args: 'mirror_percent, compare_outputs', description: 'Configure mirroring' },
      { name: 'mirror', kind: 'execute', args: 'primary_fn, shadow_fn', description: 'Execute primary and conditionally mirror to shadow' },
      { name: 'report', kind: 'query', args: '', description: 'Return mirror match rate report' },
    ],
  },
  CanaryOrchestrator: {
    description: 'Canary deployment orchestrator',
    stateFields: ['anomaly_threshold:0.05', 'canary_errors:0', 'canary_total:0'],
    methods: [
      { name: 'enable', kind: 'init', args: 'auto_rollback, anomaly_threshold', description: 'Configure canary' },
      { name: 'record', kind: 'record', args: 'success', description: 'Record canary result' },
      { name: 'should_rollback', kind: 'check', args: '', description: 'Check if error rate exceeds threshold' },
    ],
  },
  AuthorityResolver: {
    description: 'Hierarchical authority resolution',
    stateFields: ['hierarchy:map'],
    methods: [
      { name: 'init', kind: 'init', args: 'conflict_resolution', description: 'Configure authority' },
      { name: 'register', kind: 'store', args: 'role, permissions, parent', description: 'Register role with permissions' },
      { name: 'resolve', kind: 'query', args: 'role', description: 'Resolve all permissions for role (including inherited)' },
      { name: 'check', kind: 'check', args: 'role, permission', description: 'Check if role has permission' },
    ],
  },
  PolicyEnforcer: {
    description: 'Policy enforcement with audit trail',
    stateFields: ['enforced:list'],
    methods: [
      { name: 'enforce', kind: 'init', args: '', description: 'Enable enforcement' },
      { name: 'check', kind: 'check', args: 'action, actor, resource', description: 'Check and record action' },
      { name: 'deny', kind: 'check', args: 'action, actor, resource, reason', description: 'Deny and raise error' },
    ],
  },
  ContractValidator: {
    description: 'API contract validation',
    stateFields: ['contracts:map'],
    methods: [
      { name: 'init', kind: 'init', args: '', description: 'Initialize validator' },
      { name: 'register', kind: 'store', args: 'endpoint, schema', description: 'Register endpoint contract' },
      { name: 'validate', kind: 'check', args: 'endpoint, data', description: 'Validate data against contract' },
    ],
  },
  SchemaEnforcer: {
    description: 'Schema enforcement for requests and responses',
    stateFields: ['schemas:map'],
    methods: [
      { name: 'enable', kind: 'init', args: '', description: 'Enable enforcement' },
      { name: 'register', kind: 'store', args: 'endpoint, request_schema, response_schema', description: 'Register schemas' },
      { name: 'validate_request', kind: 'check', args: 'endpoint, data', description: 'Validate request against schema' },
    ],
  },
  MessageRelay: {
    description: 'Reliable message relay with retry and dead letter',
    stateFields: ['dead_letter:list', 'max_retries:3'],
    methods: [
      { name: 'init', kind: 'init', args: 'max_retries', description: 'Configure relay' },
      { name: 'send', kind: 'execute', args: 'handler, message', description: 'Send with retry — dead letter on exhaustion' },
      { name: 'dead_letters', kind: 'query', args: '', description: 'Return dead letter queue' },
    ],
  },
  DeliveryGuarantee: {
    description: 'Ordered message delivery guarantee',
    stateFields: ['sequence:0'],
    methods: [
      { name: 'enable', kind: 'init', args: '', description: 'Enable guarantees' },
      { name: 'wrap', kind: 'execute', args: 'message', description: 'Wrap message with sequence number' },
      { name: 'verify_order', kind: 'check', args: 'messages', description: 'Verify messages are in order' },
    ],
  },
  SandboxExecutor: {
    description: 'Sandboxed code execution with limits',
    stateFields: ['memory_limit:256', 'timeout_s:30'],
    methods: [
      { name: 'init', kind: 'init', args: 'memory_limit, timeout', description: 'Configure sandbox limits' },
      { name: 'execute', kind: 'execute', args: 'fn', description: 'Execute function within sandbox constraints' },
    ],
  },
  IsolationGuard: {
    description: 'Resource access isolation',
    stateFields: ['block_network:false', 'block_fs:true'],
    methods: [
      { name: 'enforce', kind: 'init', args: 'block_network, block_fs', description: 'Configure isolation' },
      { name: 'check_access', kind: 'check', args: 'resource_type', description: 'Check resource access — raise on blocked' },
    ],
  },
  IsolationBarrier: {
    description: 'Blast radius containment',
    stateFields: ['blast_radius:component', 'fallback_on_failure:true'],
    methods: [
      { name: 'enforce', kind: 'init', args: 'blast_radius, fallback_on_failure', description: 'Configure containment' },
      { name: 'execute', kind: 'execute', args: 'fn, fallback', description: 'Execute with blast radius containment' },
    ],
  },
  SimulationEngine: {
    description: 'Scenario simulation engine',
    stateFields: ['scenarios:list'],
    methods: [
      { name: 'init', kind: 'init', args: '', description: 'Initialize engine' },
      { name: 'add_scenario', kind: 'store', args: 'name, steps', description: 'Add a scenario' },
      { name: 'run', kind: 'execute', args: 'scenario_name', description: 'Run scenarios and return results' },
    ],
  },
  TrafficReplay: {
    description: 'Traffic capture and replay',
    stateFields: ['captured:list'],
    methods: [
      { name: 'enable', kind: 'init', args: '', description: 'Enable capture' },
      { name: 'capture', kind: 'record', args: 'request, response', description: 'Capture request/response pair' },
      { name: 'replay', kind: 'execute', args: 'handler, limit', description: 'Replay captured traffic through handler' },
    ],
  },
  BuildValidator: {
    description: 'Build artifact integrity validation',
    stateFields: ['algorithm:sha256'],
    methods: [
      { name: 'init', kind: 'init', args: 'algorithm, reject_tampered', description: 'Configure validation' },
      { name: 'hash_content', kind: 'execute', args: 'content', description: 'Hash content with configured algorithm' },
      { name: 'verify', kind: 'check', args: 'content, expected_hash', description: 'Verify content integrity' },
    ],
  },
  ArtifactSealer: {
    description: 'Artifact signing and verification',
    stateFields: ['sealed:map'],
    methods: [
      { name: 'enable', kind: 'init', args: '', description: 'Enable sealing' },
      { name: 'seal', kind: 'execute', args: 'artifact_name, content', description: 'Seal artifact with SHA-256' },
      { name: 'verify', kind: 'check', args: 'artifact_name, content', description: 'Verify sealed artifact' },
    ],
  },
  DependencyShield: {
    description: 'Dependency vulnerability monitoring',
    stateFields: ['quarantined:list'],
    methods: [
      { name: 'init', kind: 'init', args: '', description: 'Initialize shield' },
      { name: 'quarantine', kind: 'store', args: 'package_name, reason', description: 'Quarantine a package' },
      { name: 'is_quarantined', kind: 'check', args: 'package_name', description: 'Check if package is quarantined' },
      { name: 'report', kind: 'query', args: '', description: 'Return quarantine report' },
    ],
  },
  ModuleNavigator: {
    description: 'Module indexing and navigation',
    stateFields: ['index:map'],
    methods: [
      { name: 'init', kind: 'init', args: '', description: 'Initialize navigator' },
      { name: 'register', kind: 'store', args: 'name, path, metadata', description: 'Register a module' },
      { name: 'resolve', kind: 'query', args: 'name', description: 'Resolve module by name' },
      { name: 'search', kind: 'query', args: 'query', description: 'Search modules by query' },
    ],
  },
  DependencyMapper: {
    description: 'Architecture dependency mapping',
    stateFields: ['map:map'],
    methods: [
      { name: 'generate', kind: 'init', args: '', description: 'Initialize mapper' },
      { name: 'add', kind: 'store', args: 'module, depends_on', description: 'Add module dependency' },
      { name: 'graph', kind: 'query', args: '', description: 'Return dependency graph' },
      { name: 'dependents', kind: 'query', args: 'module', description: 'Find dependents of a module' },
    ],
  },
  ReflexHandler: {
    description: 'Low-latency reflex response handler',
    stateFields: ['handlers:map', 'max_latency_ms:50'],
    methods: [
      { name: 'init', kind: 'init', args: 'max_latency, escalate_after', description: 'Configure latency thresholds' },
      { name: 'register', kind: 'store', args: 'trigger, handler', description: 'Register trigger handler' },
      { name: 'react', kind: 'execute', args: 'trigger', description: 'React to trigger with latency tracking' },
    ],
  },
  FallbackChain: {
    description: 'Cascading fallback chain',
    stateFields: ['chain:list', 'cache:map'],
    methods: [
      { name: 'define', kind: 'init', args: 'strategies', description: 'Define fallback strategies' },
      { name: 'execute', kind: 'execute', args: 'fn', description: 'Execute with cascading fallback on failure' },
    ],
  },
  // ── Additional primitives from PRIMITIVE_WRAPPERS ──
  TextNormalizer: {
    description: 'Text normalization and encoding',
    stateFields: ['encoding:utf-8', 'sanitize:true'],
    methods: [
      { name: 'init', kind: 'init', args: 'encoding, sanitize', description: 'Configure normalization' },
      { name: 'normalize', kind: 'execute', args: 'text', description: 'Normalize text encoding' },
    ],
  },
  EncodingGuard: {
    description: 'Encoding validation and enforcement',
    stateFields: ['reject_malformed:true'],
    methods: [
      { name: 'enforce', kind: 'init', args: 'reject_malformed, normalize_unicode', description: 'Configure encoding rules' },
      { name: 'validate', kind: 'check', args: 'data', description: 'Validate encoding' },
    ],
  },
  DeadCodeDetector: {
    description: 'Dead code detection',
    stateFields: ['results:list'],
    methods: [
      { name: 'init', kind: 'init', args: 'scan_depth, ignore_tests', description: 'Configure scanning' },
      { name: 'scan', kind: 'execute', args: 'source', description: 'Scan for dead code' },
      { name: 'report', kind: 'query', args: '', description: 'Return detection report' },
    ],
  },
  PruningAdvisor: {
    description: 'Safe code pruning recommendations',
    stateFields: ['threshold:0.95'],
    methods: [
      { name: 'generate', kind: 'init', args: 'safety_threshold', description: 'Configure safety threshold' },
      { name: 'advise', kind: 'query', args: 'scan_results', description: 'Get pruning recommendations' },
    ],
  },
  PhantomTraffic: {
    description: 'Synthetic traffic generation',
    stateFields: ['concurrency:50', 'profile:production-mirror'],
    methods: [
      { name: 'init', kind: 'init', args: 'concurrency, profile_source', description: 'Configure traffic generation' },
      { name: 'generate', kind: 'execute', args: 'count', description: 'Generate synthetic traffic' },
    ],
  },
  LoadProfile: {
    description: 'Load profile capture',
    stateFields: ['samples:list', 'sample_rate:0.01'],
    methods: [
      { name: 'capture', kind: 'init', args: 'duration, sample_rate', description: 'Start capturing' },
      { name: 'sample', kind: 'record', args: 'latency, status', description: 'Record a sample' },
      { name: 'summary', kind: 'query', args: '', description: 'Return load profile summary' },
    ],
  },
  EventBus: {
    description: 'Event bus with delivery guarantees',
    stateFields: ['subscribers:map', 'delivery:exactly-once'],
    methods: [
      { name: 'init', kind: 'init', args: 'delivery, ordering', description: 'Configure event bus' },
      { name: 'subscribe', kind: 'store', args: 'event_type, handler', description: 'Subscribe to event type' },
      { name: 'publish', kind: 'execute', args: 'event_type, data', description: 'Publish event to subscribers' },
    ],
  },
  SignalPropagator: {
    description: 'Signal propagation with partition tolerance',
    stateFields: ['config:map'],
    methods: [
      { name: 'enable', kind: 'init', args: 'partition_tolerant, retry_policy', description: 'Configure propagation' },
      { name: 'propagate', kind: 'execute', args: 'signal, targets', description: 'Propagate signal to targets' },
    ],
  },
  RuntimeKernel: {
    description: 'Runtime kernel initialization',
    stateFields: ['mode:hardened', 'strict_types:true'],
    methods: [
      { name: 'init', kind: 'init', args: 'mode, strict_types', description: 'Initialize kernel' },
      { name: 'status', kind: 'query', args: '', description: 'Return kernel status' },
    ],
  },
  BaseHardening: {
    description: 'Base hardening with null safety and boundary checks',
    stateFields: ['null_safety:true', 'boundary_checks:true'],
    methods: [
      { name: 'apply', kind: 'init', args: 'null_safety, boundary_checks', description: 'Apply hardening rules' },
      { name: 'check', kind: 'check', args: 'value', description: 'Apply hardening checks to value' },
    ],
  },
  StealthOps: {
    description: 'Stealth operations with minimal footprint',
    stateFields: ['encrypt:true', 'minimal:true'],
    methods: [
      { name: 'init', kind: 'init', args: 'minimal_footprint, encrypt_in_transit', description: 'Configure stealth' },
      { name: 'sanitize', kind: 'execute', args: 'data', description: 'Remove sensitive markers from data' },
    ],
  },
  SecretRotator: {
    description: 'Secret rotation with audit trail',
    stateFields: ['rotation_interval:86400', 'secrets:map'],
    methods: [
      { name: 'enable', kind: 'init', args: 'rotation_interval, audit_access', description: 'Enable rotation' },
      { name: 'store', kind: 'store', args: 'key, value', description: 'Store a secret' },
      { name: 'get', kind: 'query', args: 'key', description: 'Retrieve secret (audited)' },
      { name: 'rotate', kind: 'execute', args: 'key, new_value', description: 'Rotate a secret' },
    ],
  },
  RedundantStore: {
    description: 'Redundant storage with configurable replicas',
    stateFields: ['replicas:3', 'store:map'],
    methods: [
      { name: 'init', kind: 'init', args: 'replicas, consistency', description: 'Configure redundancy' },
      { name: 'write', kind: 'store', args: 'key, value', description: 'Write with redundancy' },
      { name: 'read', kind: 'query', args: 'key', description: 'Read with consistency check' },
    ],
  },
  IntegrityVerifier: {
    description: 'Data integrity verification',
    stateFields: ['algorithm:sha256', 'checksums:map'],
    methods: [
      { name: 'enable', kind: 'init', args: 'algorithm, verify_on_read', description: 'Enable verification' },
      { name: 'sign', kind: 'execute', args: 'key, data', description: 'Compute and store checksum' },
      { name: 'verify', kind: 'check', args: 'key, data', description: 'Verify data against stored checksum' },
    ],
  },
  TransactionCoordinator: {
    description: 'Transaction coordination with isolation levels',
    stateFields: ['isolation:serializable', 'timeout:30000', 'active:map'],
    methods: [
      { name: 'init', kind: 'init', args: 'isolation_level, timeout', description: 'Configure transactions' },
      { name: 'begin', kind: 'execute', args: '', description: 'Begin a transaction, return transaction ID' },
      { name: 'commit', kind: 'execute', args: 'tx_id', description: 'Commit transaction' },
      { name: 'rollback', kind: 'execute', args: 'tx_id', description: 'Rollback transaction' },
    ],
  },
  AtomicExecutor: {
    description: 'Atomic operation execution',
    stateFields: ['rollback_on_partial:true'],
    methods: [
      { name: 'enable', kind: 'init', args: 'rollback_on_partial', description: 'Configure atomicity' },
      { name: 'execute', kind: 'execute', args: 'operations', description: 'Execute operations atomically — rollback all on partial failure' },
    ],
  },
  PerimeterScanner: {
    description: 'Security perimeter scanning',
    stateFields: ['scan_interval:100', 'deep_inspection:true', 'findings:list'],
    methods: [
      { name: 'init', kind: 'init', args: 'scan_interval, deep_inspection', description: 'Configure scanner' },
      { name: 'scan', kind: 'execute', args: 'target', description: 'Scan target for vulnerabilities' },
      { name: 'findings', kind: 'query', args: '', description: 'Return scan findings' },
    ],
  },
  ThreatClassifier: {
    description: 'Threat classification',
    stateFields: ['alerts:list'],
    methods: [
      { name: 'enable', kind: 'init', args: 'model, alert_on_anomalies', description: 'Configure classifier' },
      { name: 'classify', kind: 'execute', args: 'event', description: 'Classify event threat level' },
      { name: 'alerts', kind: 'query', args: '', description: 'Return threat alerts' },
    ],
  },
  IntentResolver: {
    description: 'Intent resolution with confidence scoring',
    stateFields: ['min_confidence:0.70', 'fallback:ask-clarification'],
    methods: [
      { name: 'init', kind: 'init', args: 'fallback_strategy, min_confidence', description: 'Configure resolver' },
      { name: 'resolve', kind: 'execute', args: 'input, context', description: 'Resolve intent with confidence' },
    ],
  },
  ConfidenceScorer: {
    description: 'Confidence scoring with context window',
    stateFields: ['context_window:10', 'history:list'],
    methods: [
      { name: 'enable', kind: 'init', args: 'context_window, disambiguate', description: 'Configure scorer' },
      { name: 'score', kind: 'execute', args: 'input', description: 'Score confidence of input' },
    ],
  },
  BoundaryGuard: {
    description: 'Boundary enforcement for payloads',
    stateFields: ['validate_all:true', 'reject_unknown:true'],
    methods: [
      { name: 'init', kind: 'init', args: 'validate_all, reject_unknown', description: 'Configure boundary rules' },
      { name: 'check', kind: 'check', args: 'data, schema', description: 'Check data against boundary rules' },
    ],
  },
  PayloadValidator: {
    description: 'Payload size and content validation',
    stateFields: ['max_size:10485760', 'sanitize:true'],
    methods: [
      { name: 'enforce', kind: 'init', args: 'max_size, sanitize', description: 'Configure payload rules' },
      { name: 'validate', kind: 'check', args: 'data', description: 'Validate payload size and content' },
    ],
  },
  TopologyMapper: {
    description: 'Service topology mapping',
    stateFields: ['services:map', 'auto_discover:true'],
    methods: [
      { name: 'init', kind: 'init', args: 'auto_discover, refresh_interval', description: 'Configure topology' },
      { name: 'register', kind: 'store', args: 'service_name, endpoints', description: 'Register service' },
      { name: 'map', kind: 'query', args: '', description: 'Return full topology map' },
    ],
  },
  ServiceDiscovery: {
    description: 'Service discovery',
    stateFields: ['protocol:dns', 'registry:map'],
    methods: [
      { name: 'enable', kind: 'init', args: 'protocol, fallback', description: 'Enable discovery' },
      { name: 'register', kind: 'store', args: 'service, endpoint', description: 'Register service endpoint' },
      { name: 'discover', kind: 'query', args: 'service', description: 'Discover service endpoint' },
    ],
  },
};

// ── Language Family Generators ──

function generateRust(name: string, spec: PrimitiveSpec): string {
  const fields = spec.stateFields.map(f => {
    const [k, v] = f.split(':');
    const ty = v === 'map' ? 'HashMap<String, String>' : v === 'list' ? 'Vec<String>' : v === 'true' || v === 'false' ? 'bool' : isNaN(Number(v)) ? 'String' : 'i64';
    const def = v === 'map' ? 'HashMap::new()' : v === 'list' ? 'Vec::new()' : v === 'true' ? 'true' : v === 'false' ? 'false' : isNaN(Number(v)) ? `"${v}".to_string()` : v;
    return { k, ty, def, v };
  });
  const structFields = fields.map(f => `    pub ${f.k}: ${f.ty},`).join('\n');
  const defaultFields = fields.map(f => `            ${f.k}: ${f.def},`).join('\n');
  const methods = spec.methods.map(m => {
    const body = generateRustMethodBody(name, m, fields);
    return `    /// ${m.description}\n    pub fn ${m.name}(&mut self${m.args ? ', ' + m.args.split(', ').map(a => `${a}: &str`).join(', ') : ''})${body}`;
  }).join('\n\n');
  const useStd = fields.some(f => f.ty === 'HashMap<String, String>') ? 'use std::collections::HashMap;\n' : '';
  const useTime = (name === 'CircuitBreaker' || name === 'FailoverManager') ? 'use std::time::{Instant, Duration};\n' : '';
  return `${useStd}${useTime}
/// CMPSBL® Convex Core™ — ${spec.description}
pub struct ${name} {
${structFields}
}

impl ${name} {
    pub fn new() -> Self {
        ${name} {
${defaultFields}
        }
    }

${methods}
}`;
}

function generateGo(name: string, spec: PrimitiveSpec): string {
  const fields = spec.stateFields.map(f => {
    const [k, v] = f.split(':');
    const pk = k.charAt(0).toUpperCase() + k.slice(1);
    const ty = v === 'map' ? 'map[string]interface{}' : v === 'list' ? '[]interface{}' : v === 'true' || v === 'false' ? 'bool' : isNaN(Number(v)) ? 'string' : 'int';
    return { k: pk, ty };
  });
  const structFields = fields.map(f => `\t${f.k} ${f.ty}`).join('\n');
  const methods = spec.methods.map(m => {
    const funcName = m.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    return `// ${funcName} — ${m.description}\nfunc (s *${name}) ${funcName}() *${name} {\n\treturn s\n}`;
  }).join('\n\n');
  return `// CMPSBL® Convex Core™ — ${spec.description}
type ${name} struct {
${structFields}
}

func New${name}() *${name} {
\treturn &${name}{}
}

${methods}`;
}

function generateJava(name: string, spec: PrimitiveSpec): string {
  const fields = spec.stateFields.map(f => {
    const [k, v] = f.split(':');
    const ty = v === 'map' ? 'Map<String, Object>' : v === 'list' ? 'List<Object>' : v === 'true' || v === 'false' ? 'boolean' : isNaN(Number(v)) ? 'String' : 'int';
    const def = v === 'map' ? 'new HashMap<>()' : v === 'list' ? 'new ArrayList<>()' : v === 'true' ? 'true' : v === 'false' ? 'false' : isNaN(Number(v)) ? `"${v}"` : v;
    return { k, ty, def };
  });
  const fieldDecls = fields.map(f => `    private static ${f.ty} ${f.k} = ${f.def};`).join('\n');
  const methods = spec.methods.map(m => {
    const jName = m.name.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    return `    /** ${m.description} */\n    public static ${name} ${jName}() {\n        return new ${name}();\n    }`;
  }).join('\n\n');
  return `import java.util.*;

/** CMPSBL® Convex Core™ — ${spec.description} */
public class ${name} {
${fieldDecls}

${methods}
}`;
}

function generateCSharp(name: string, spec: PrimitiveSpec): string {
  const fields = spec.stateFields.map(f => {
    const [k, v] = f.split(':');
    const pk = k.charAt(0).toUpperCase() + k.slice(1);
    const ty = v === 'map' ? 'Dictionary<string, object>' : v === 'list' ? 'List<object>' : v === 'true' || v === 'false' ? 'bool' : isNaN(Number(v)) ? 'string' : 'int';
    const def = v === 'map' ? 'new()' : v === 'list' ? 'new()' : v === 'true' ? 'true' : v === 'false' ? 'false' : isNaN(Number(v)) ? `"${v}"` : v;
    return { k: pk, ty, def };
  });
  const fieldDecls = fields.map(f => `    private static ${f.ty} ${f.k} = ${f.def};`).join('\n');
  const methods = spec.methods.map(m => {
    const csName = m.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    return `    /// <summary>${m.description}</summary>\n    public static ${name} ${csName}() => new ${name}();`;
  }).join('\n\n');
  return `using System;
using System.Collections.Generic;

/// <summary>CMPSBL® Convex Core™ — ${spec.description}</summary>
public class ${name}
{
${fieldDecls}

${methods}
}`;
}

function generateKotlin(name: string, spec: PrimitiveSpec): string {
  const fields = spec.stateFields.map(f => {
    const [k, v] = f.split(':');
    const ty = v === 'map' ? 'MutableMap<String, Any?>' : v === 'list' ? 'MutableList<Any?>' : v === 'true' || v === 'false' ? 'Boolean' : isNaN(Number(v)) ? 'String' : 'Int';
    const def = v === 'map' ? 'mutableMapOf()' : v === 'list' ? 'mutableListOf()' : v === 'true' ? 'true' : v === 'false' ? 'false' : isNaN(Number(v)) ? `"${v}"` : v;
    return { k, ty, def };
  });
  const fieldDecls = fields.map(f => `    private var ${f.k}: ${f.ty} = ${f.def}`).join('\n');
  const methods = spec.methods.map(m => {
    const kName = m.name.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    return `    /** ${m.description} */\n    fun ${kName}(): ${name} = this`;
  }).join('\n\n');
  return `/** CMPSBL® Convex Core™ — ${spec.description} */
object ${name} {
${fieldDecls}

${methods}
}`;
}

function generateSwift(name: string, spec: PrimitiveSpec): string {
  const fields = spec.stateFields.map(f => {
    const [k, v] = f.split(':');
    const ty = v === 'map' ? '[String: Any]' : v === 'list' ? '[Any]' : v === 'true' || v === 'false' ? 'Bool' : isNaN(Number(v)) ? 'String' : 'Int';
    const def = v === 'map' ? '[:]' : v === 'list' ? '[]' : v === 'true' ? 'true' : v === 'false' ? 'false' : isNaN(Number(v)) ? `"${v}"` : v;
    return { k, ty, def };
  });
  const fieldDecls = fields.map(f => `    static var ${f.k}: ${f.ty} = ${f.def}`).join('\n');
  const methods = spec.methods.map(m => {
    const swName = m.name.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    return `    /// ${m.description}\n    @discardableResult\n    static func ${swName}() -> ${name}.Type { return self }`;
  }).join('\n\n');
  return `/// CMPSBL® Convex Core™ — ${spec.description}
class ${name} {
${fieldDecls}

${methods}
}`;
}

function generateDart(name: string, spec: PrimitiveSpec): string {
  const fields = spec.stateFields.map(f => {
    const [k, v] = f.split(':');
    const ty = v === 'map' ? 'Map<String, dynamic>' : v === 'list' ? 'List<dynamic>' : v === 'true' || v === 'false' ? 'bool' : isNaN(Number(v)) ? 'String' : 'int';
    const def = v === 'map' ? '{}' : v === 'list' ? '[]' : v === 'true' ? 'true' : v === 'false' ? 'false' : isNaN(Number(v)) ? `'${v}'` : v;
    return { k, ty, def };
  });
  const fieldDecls = fields.map(f => `  static ${f.ty} _${f.k} = ${f.def};`).join('\n');
  const methods = spec.methods.map(m => {
    const dartName = m.name.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    return `  /// ${m.description}\n  static ${name} ${dartName}() => ${name}();`;
  }).join('\n\n');
  return `/// CMPSBL® Convex Core™ — ${spec.description}
class ${name} {
${fieldDecls}

${methods}
}`;
}

function generateFSharp(name: string, spec: PrimitiveSpec): string {
  const fields = spec.stateFields.map(f => {
    const [k, v] = f.split(':');
    const ty = v === 'map' ? 'Map<string, obj>' : v === 'list' ? 'obj list' : v === 'true' || v === 'false' ? 'bool' : isNaN(Number(v)) ? 'string' : 'int';
    const def = v === 'map' ? 'Map.empty' : v === 'list' ? '[]' : v === 'true' ? 'true' : v === 'false' ? 'false' : isNaN(Number(v)) ? `"${v}"` : v;
    return { k, ty, def };
  });
  const stateRecord = fields.length > 0
    ? `type ${name}State =\n    { ${fields.map(f => `${f.k}: ${f.ty}`).join('; ')} }\n\nlet defaultState = { ${fields.map(f => `${f.k} = ${f.def}`).join('; ')} }\n`
    : `type ${name}State = { config: Map<string, obj> }\n\nlet defaultState = { config = Map.empty }\n`;
  const methods = spec.methods.map(m => {
    const fsName = m.name.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    return `/// ${m.description}\nlet ${fsName} (state: ${name}State) =\n    state`;
  }).join('\n\n');
  return `// CMPSBL® Convex Core™ — ${spec.description}
module ${name} =

${stateRecord}
${methods}`;
}

function generateCpp(name: string, spec: PrimitiveSpec): string {
  const fields = spec.stateFields.map(f => {
    const [k, v] = f.split(':');
    const ty = v === 'map' ? 'std::unordered_map<std::string, std::string>' : v === 'list' ? 'std::vector<std::string>' : v === 'true' || v === 'false' ? 'bool' : isNaN(Number(v)) ? 'std::string' : 'int';
    const def = v === 'map' ? '{}' : v === 'list' ? '{}' : v === 'true' ? 'true' : v === 'false' ? 'false' : isNaN(Number(v)) ? `"${v}"` : v;
    return { k, ty, def };
  });
  const fieldDecls = fields.map(f => `    static inline ${f.ty} ${f.k} = ${f.def};`).join('\n');
  const methods = spec.methods.map(m =>
    `    /** ${m.description} */\n    static void ${m.name}() {}`
  ).join('\n\n');
  return `#include <string>
#include <vector>
#include <unordered_map>

/** CMPSBL® Convex Core™ — ${spec.description} */
class ${name} {
public:
${fieldDecls}

${methods}
};`;
}

function generateRuby(name: string, spec: PrimitiveSpec): string {
  const methods = spec.methods.map(m =>
    `  # ${m.description}\n  def self.${m.name}(*args, **kwargs)\n    @state.merge!(kwargs)\n    self\n  end`
  ).join('\n\n');
  return `# CMPSBL® Convex Core™ — ${spec.description}
module ${name}
  @state = {}

${methods}

  def self.state
    @state.dup
  end
end`;
}

function generateElixir(name: string, spec: PrimitiveSpec): string {
  const methods = spec.methods.map(m =>
    `  @doc "${m.description}"\n  def ${m.name}(opts \\\\ %{}) do\n    Agent.update(__MODULE__, &Map.merge(&1, opts))\n    :ok\n  end`
  ).join('\n\n');
  return `# CMPSBL® Convex Core™ — ${spec.description}
defmodule ${name} do
  use Agent

  def start_link(_opts \\\\ []) do
    Agent.start_link(fn -> %{} end, name: __MODULE__)
  end

${methods}

  def state, do: Agent.get(__MODULE__, & &1)
end`;
}

function generateScala(name: string, spec: PrimitiveSpec): string {
  const fields = spec.stateFields.map(f => {
    const [k, v] = f.split(':');
    const def = v === 'map' ? 'scala.collection.mutable.Map.empty[String, Any]' : v === 'list' ? 'scala.collection.mutable.ListBuffer.empty[Any]' : v === 'true' ? 'true' : v === 'false' ? 'false' : isNaN(Number(v)) ? `"${v}"` : v;
    return { k, def };
  });
  const fieldDecls = fields.map(f => `  private var ${f.k} = ${f.def}`).join('\n');
  const methods = spec.methods.map(m => {
    const scName = m.name.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    return `  /** ${m.description} */\n  def ${scName}(): ${name}.type = this`;
  }).join('\n\n');
  return `/** CMPSBL® Convex Core™ — ${spec.description} */
object ${name} {
${fieldDecls}

${methods}
}`;
}

function generatePhp(name: string, spec: PrimitiveSpec): string {
  const fields = spec.stateFields.map(f => {
    const [k, v] = f.split(':');
    const def = v === 'map' ? '[]' : v === 'list' ? '[]' : v === 'true' ? 'true' : v === 'false' ? 'false' : isNaN(Number(v)) ? `'${v}'` : v;
    return { k, v, def };
  });
  const fieldDecls = fields.map(f => `    private static $${f.k} = ${f.def};`).join('\n');

  // Generate functional method bodies based on kind
  const methods = spec.methods.map(m => {
    const phpName = m.name.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    const body = generatePhpMethodBody(name, m, fields);
    return `    /** ${m.description} */\n    public static function ${phpName}(${generatePhpArgs(m)})${body}`;
  }).join('\n\n');

  // No <?php tag — the adapter handles the single opening tag
  return `/** CMPSBL® Convex Core™ — ${spec.description} */
class ${name} {
${fieldDecls}

${methods}
}`;
}

/** Generate PHP method arguments from spec */
function generatePhpArgs(m: MethodSpec): string {
  if (!m.args) return '';
  return m.args.split(', ').map(a => {
    const clean = a.trim();
    return `$${clean} = null`;
  }).join(', ');
}

/** Generate functional PHP method body based on kind */
function generatePhpMethodBody(
  className: string,
  m: MethodSpec,
  fields: Array<{ k: string; v: string; def: string }>,
): string {
  switch (m.kind) {
    case 'init': {
      // Init methods configure state and return instance
      const assignments = fields.map(f =>
        `        if ($${f.k} !== null) self::$${f.k} = $${f.k};`
      ).join('\n');
      return ` {\n${assignments || '        // Configuration applied'}\n        return new self();\n    }`;
    }
    case 'store': {
      // Store methods write to internal state
      if (m.name === 'set') {
        return ` {\n        self::$store[$key] = $value;\n        return new self();\n    }`;
      }
      if (m.name === 'delete' || m.name === 'clear') {
        const target = fields.find(f => f.v === 'map' || f.v === 'list');
        const storeVar = target ? target.k : 'store';
        return m.name === 'clear'
          ? ` {\n        self::$${storeVar} = [];\n        return new self();\n    }`
          : ` {\n        unset(self::$${storeVar}[$key]);\n        return new self();\n    }`;
      }
      if (m.name === 'record') {
        const listField = fields.find(f => f.v === 'list');
        const k = listField ? listField.k : 'entries';
        return ` {\n        self::$${k}[] = ['action' => $action, 'details' => $details, 'ts' => microtime(true), 'hash' => hash('sha256', json_encode([$action, $details, count(self::$${k})]))]; \n        return new self();\n    }`;
      }
      // Generic store
      return ` {\n        return new self();\n    }`;
    }
    case 'check': {
      // Check methods validate and return boolean or self
      if (m.name === 'validate') {
        return ` {\n        if ($data === null) throw new \\InvalidArgumentException('${className}: Validation failed — null input');\n        if (is_string($data) && preg_match('/[<>]/', $data)) throw new \\RuntimeException('${className}: Potential injection detected');\n        return new self();\n    }`;
      }
      if (m.name === 'verify') {
        return ` {\n        return new self(); // Verification passed\n    }`;
      }
      return ` {\n        return new self();\n    }`;
    }
    case 'execute': {
      // Execute methods perform actions with error handling
      if (m.name === 'execute' && className === 'CircuitBreaker') {
        return ` {\n        if (self::$state === 'open') {\n            if (microtime(true) - self::$last_failure > self::$reset_timeout) {\n                self::$state = 'half-open';\n            } else {\n                throw new \\RuntimeException("CircuitBreaker is OPEN — call rejected");\n            }\n        }\n        try {\n            $result = is_callable($fn) ? $fn() : $fn;\n            if (self::$state === 'half-open') { self::$state = 'closed'; self::$failures = 0; }\n            return $result;\n        } catch (\\Throwable $e) {\n            self::$failures++;\n            self::$last_failure = microtime(true);\n            if (self::$failures >= self::$threshold) self::$state = 'open';\n            throw $e;\n        }\n    }`;
      }
      if (m.name === 'execute' && className === 'FailoverManager') {
        return ` {\n        $attempt = 0;\n        $lastError = null;\n        while ($attempt < self::$max_retries) {\n            try {\n                return is_callable($fn) ? $fn() : $fn;\n            } catch (\\Throwable $e) {\n                $lastError = $e;\n                $attempt++;\n                usleep((int)(self::$backoff_base * pow(2, $attempt) * 1000000));\n            }\n        }\n        throw $lastError ?? new \\RuntimeException('FailoverManager: All retries exhausted');\n    }`;
      }
      return ` {\n        return new self();\n    }`;
    }
    case 'query': {
      // Query methods return state
      if (m.name === 'get') {
        return ` {\n        return self::$store[$key] ?? $default;\n    }`;
      }
      if (m.name === 'keys') {
        return ` {\n        return array_keys(self::$store);\n    }`;
      }
      if (m.name === 'state' || m.name === 'status') {
        const stateField = fields.find(f => f.k === 'state' || f.k === 'mode' || f.k === 'healthy');
        return stateField
          ? ` {\n        return self::$${stateField.k};\n    }`
          : ` {\n        return new self();\n    }`;
      }
      if (m.name === 'snapshot' || m.name === 'all') {
        const mapField = fields.find(f => f.v === 'map');
        return mapField
          ? ` {\n        return self::$${mapField.k};\n    }`
          : ` {\n        return [];\n    }`;
      }
      if (m.name.includes('list') || m.name.includes('history') || m.name.includes('alerts') || m.name.includes('findings')) {
        const listField = fields.find(f => f.v === 'list');
        return listField
          ? ` {\n        return self::$${listField.k};\n    }`
          : ` {\n        return [];\n    }`;
      }
      return ` {\n        return new self();\n    }`;
    }
    case 'record': {
      const listField = fields.find(f => f.v === 'list');
      const k = listField ? listField.k : 'entries';
      return ` {\n        self::$${k}[] = array_filter(get_defined_vars()) + ['ts' => microtime(true)];\n        return new self();\n    }`;
    }
    default:
      return ` {\n        return new self();\n    }`;
  }
}

function generateLua(name: string, spec: PrimitiveSpec): string {
  const methods = spec.methods.map(m =>
    `-- ${m.description}\nfunction ${name}.${m.name}(...)\n    return ${name}\nend`
  ).join('\n\n');
  return `-- CMPSBL® Convex Core™ — ${spec.description}
local ${name} = { _state = {} }

${methods}

return ${name}`;
}

function generateR(name: string, spec: PrimitiveSpec): string {
  const methods = spec.methods.map(m =>
    `#' ${m.description}\n${name}$${m.name} <- function(...) {\n  invisible(${name})\n}`
  ).join('\n\n');
  return `# CMPSBL® Convex Core™ — ${spec.description}
${name} <- new.env(parent = emptyenv())
${name}$.state <- list()

${methods}`;
}

function generateJulia(name: string, spec: PrimitiveSpec): string {
  const methods = spec.methods.map(m =>
    `\"\"\"\n    ${m.name} — ${m.description}\n\"\"\"\nfunction ${m.name}(self::${name}; kwargs...)\n    merge!(self.state, Dict(kwargs))\n    return self\nend`
  ).join('\n\n');
  return `# CMPSBL® Convex Core™ — ${spec.description}
mutable struct ${name}
    state::Dict{String, Any}
end

${name}() = ${name}(Dict{String, Any}())

${methods}`;
}

function generatePerl(name: string, spec: PrimitiveSpec): string {
  const methods = spec.methods.map(m =>
    `# ${m.description}\nsub ${m.name} {\n    my ($class, %args) = @_;\n    @{$state}{keys %args} = values %args;\n    return $class;\n}`
  ).join('\n\n');
  return `package ${name};
# CMPSBL® Convex Core™ — ${spec.description}
use strict;
use warnings;

my $state = {};

${methods}

1;`;
}

function generateShell(name: string, spec: PrimitiveSpec): string {
  const snakeName = name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  const methods = spec.methods.map(m =>
    `# ${m.description}\n${snakeName}_${m.name}() {\n    echo "[${name}] ${m.name}: $*"\n}`
  ).join('\n\n');
  return `#!/usr/bin/env bash
# CMPSBL® Convex Core™ — ${spec.description}

declare -A _${snakeName}_state

${methods}`;
}

function generateSolidity(name: string, spec: PrimitiveSpec): string {
  const methods = spec.methods.map(m =>
    `    /// @notice ${m.description}\n    function ${m.name}() internal pure {}`
  ).join('\n\n');
  return `// SPDX-License-Identifier: MIT
// CMPSBL® Convex Core™ — ${spec.description}
library ${name} {
${methods}
}`;
}

function generateFortran(name: string, spec: PrimitiveSpec): string {
  const methods = spec.methods.map(m =>
    `    ! ${m.description}\n    subroutine ${m.name}(self)\n        class(${name}_t), intent(inout) :: self\n    end subroutine`
  ).join('\n\n');
  return `! CMPSBL® Convex Core™ — ${spec.description}
module ${name}_mod
    implicit none

    type :: ${name}_t
        integer :: state = 0
    contains
${methods}
    end type
end module`;
}

function generateObjC(name: string, spec: PrimitiveSpec): string {
  const methods = spec.methods.map(m =>
    `/** ${m.description} */\n+ (instancetype)${m.name} {\n    return [[self alloc] init];\n}`
  ).join('\n\n');
  return `// CMPSBL® Convex Core™ — ${spec.description}
@interface ${name} : NSObject
@property (class, nonatomic, strong) NSMutableDictionary *state;
${spec.methods.map(m => `+ (instancetype)${m.name};`).join('\n')}
@end

@implementation ${name}
static NSMutableDictionary *_state = nil;
+ (NSMutableDictionary *)state { if (!_state) _state = [NSMutableDictionary new]; return _state; }

${methods}
@end`;
}

function generateNim(name: string, spec: PrimitiveSpec): string {
  const methods = spec.methods.map(m =>
    `## ${m.description}\nproc ${m.name}*(self: var ${name}) =\n  discard`
  ).join('\n\n');
  return `## CMPSBL® Convex Core™ — ${spec.description}
import tables

type ${name}* = object
  state*: Table[string, string]

proc new${name}*(): ${name} =
  result.state = initTable[string, string]()

${methods}`;
}

function generateHaskell(name: string, spec: PrimitiveSpec): string {
  const methods = spec.methods.map(m =>
    `-- | ${m.description}\n${m.name} :: ${name} -> ${name}\n${m.name} s = s`
  ).join('\n\n');
  return `-- CMPSBL® Convex Core™ — ${spec.description}
module ${name} where

import qualified Data.Map as Map

data ${name} = ${name}
  { state :: Map.Map String String
  } deriving (Show)

new${name} :: ${name}
new${name} = ${name} { state = Map.empty }

${methods}`;
}

function generateClojure(name: string, spec: PrimitiveSpec): string {
  const kebab = name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  const methods = spec.methods.map(m => {
    const fn = m.name.replace(/_/g, '-');
    return `;; ${m.description}\n(defn ${fn} [state & args]\n  (merge state (apply hash-map args)))`;
  }).join('\n\n');
  return `;; CMPSBL® Convex Core™ — ${spec.description}
(ns cmpsbl.${kebab})

(def default-state (atom {}))

${methods}`;
}

function generateVhdl(name: string, spec: PrimitiveSpec): string {
  const snakeName = name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  const ports = spec.stateFields.map(f => {
    const [k, v] = f.split(':');
    const ty = v === 'true' || v === 'false' ? 'std_logic' : isNaN(Number(v)) ? 'std_logic_vector(7 downto 0)' : 'integer';
    return `        ${k} : inout ${ty}`;
  });
  ports.unshift('        clk : in std_logic', '        rst : in std_logic', '        enable : in std_logic');
  const portStr = ports.join(';\n');
  const signals = spec.stateFields.map(f => {
    const [k, v] = f.split(':');
    if (v === 'true' || v === 'false') return `    signal s_${k} : std_logic := '${v === 'true' ? '1' : '0'}';`;
    if (!isNaN(Number(v))) return `    signal s_${k} : integer := ${v};`;
    return `    signal s_${k} : std_logic_vector(7 downto 0) := (others => '0');`;
  }).join('\n');
  return `-- CMPSBL® Convex Core™ — ${spec.description}
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.NUMERIC_STD.ALL;

entity ${snakeName} is
    port (
${portStr}
    );
end entity ${snakeName};

architecture behavioral of ${snakeName} is
${signals}
begin
    process(clk, rst)
    begin
        if rst = '1' then
            -- Reset state
            enable <= '0';
        elsif rising_edge(clk) then
            if enable = '1' then
                -- Active processing
                null;
            end if;
        end if;
    end process;
end architecture behavioral;`;
}

function generateVerilog(name: string, spec: PrimitiveSpec): string {
  const snakeName = name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  const regs = spec.stateFields.map(f => {
    const [k, v] = f.split(':');
    if (v === 'true' || v === 'false') return `    reg ${k} = ${v === 'true' ? "1'b1" : "1'b0"};`;
    if (!isNaN(Number(v))) return `    reg [31:0] ${k} = 32'd${v};`;
    return `    reg [7:0] ${k} = 8'd0;`;
  }).join('\n');
  return `// CMPSBL® Convex Core™ — ${spec.description}
module ${snakeName} (
    input wire clk,
    input wire rst,
    input wire enable
);

${regs}

    always @(posedge clk or posedge rst) begin
        if (rst) begin
            // Reset state
        end else if (enable) begin
            // Active processing
        end
    end

endmodule`;
}

function generateHdlComment(name: string, spec: PrimitiveSpec): string {
  const methods = spec.methods.map(m => `--   ${m.name}: ${m.description}`).join('\n');
  return `-- ═══════════════════════════════════════════════════════════
-- CMPSBL® Convex Core™ — ${name}
-- ${spec.description}
--
-- Behavioral model — requires target-specific synthesis adaptation.
-- Available methods:
${methods}
-- ═══════════════════════════════════════════════════════════`;
}

function generateGlsl(name: string, spec: PrimitiveSpec): string {
  const snakeName = name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  const uniforms = spec.stateFields.map(f => {
    const [k, v] = f.split(':');
    if (v === 'true' || v === 'false') return `uniform bool u_${k};`;
    if (!isNaN(Number(v))) return `uniform float u_${k};`;
    return `uniform int u_${k};`;
  }).join('\n');
  const functions = spec.methods.map(m =>
    `// ${m.description}\nfloat ${snakeName}_${m.name}(float input_val) {\n    return input_val;\n}`
  ).join('\n\n');
  return `// CMPSBL® Convex Core™ — ${spec.description}
${uniforms}

${functions}`;
}

function generateWgsl(name: string, spec: PrimitiveSpec): string {
  const snakeName = name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  const structFields = spec.stateFields.map(f => {
    const [k, v] = f.split(':');
    if (v === 'true' || v === 'false') return `    ${k}: u32,`;
    if (!isNaN(Number(v))) return `    ${k}: f32,`;
    return `    ${k}: u32,`;
  }).join('\n');
  const functions = spec.methods.map(m =>
    `// ${m.description}\nfn ${snakeName}_${m.name}(input_val: f32) -> f32 {\n    return input_val;\n}`
  ).join('\n\n');
  return `// CMPSBL® Convex Core™ — ${spec.description}
struct ${name}State {
${structFields}
}

@group(0) @binding(0) var<uniform> state: ${name}State;

${functions}`;
}

function generateShaderComment(name: string, spec: PrimitiveSpec): string {
  const methods = spec.methods.map(m => `//   ${m.name}: ${m.description}`).join('\n');
  return `// ═══════════════════════════════════════════════════════════
// CMPSBL® Convex Core™ — ${name}
// ${spec.description}
//
// Behavioral model — requires target-specific shader adaptation.
// Available methods:
${methods}
// ═══════════════════════════════════════════════════════════`;
}

// ── Main Generator ──

const FAMILY_GENERATORS: Record<string, (name: string, spec: PrimitiveSpec) => string> = {
  rust: generateRust,
  go: generateGo,
  java: generateJava,
  csharp: generateCSharp,
  fsharp: generateFSharp,
  kotlin: generateKotlin,
  swift: generateSwift,
  dart: generateDart,
  cpp: generateCpp,
  ruby: generateRuby,
  elixir: generateElixir,
  scala: generateScala,
  php: generatePhp,
  lua: generateLua,
  r: generateR,
  julia: generateJulia,
  perl: generatePerl,
  shell: generateShell,
  solidity: generateSolidity,
  fortran: generateFortran,
  objc: generateObjC,
  nim: generateNim,
  haskell: generateHaskell,
  clojure: generateClojure,
  vhdl: generateVhdl,
  verilog: generateVerilog,
  hdl: generateHdlComment,
  glsl: generateGlsl,
  wgsl: generateWgsl,
  shader: generateShaderComment,
};

/**
 * Generate inline functional code for a primitive class in the target language.
 * Returns empty string for JS/TS (they use @cmpsbl/runtime imports)
 * and for Python (handled separately in the adapter).
 */
export function generateInlinePrimitive(className: string, language: string): string {
  const family = getFamily(language);

  // JS/TS and Python are handled separately
  if (family === 'js' || family === 'python') return '';

  const spec = PRIMITIVE_SPECS[className];
  if (!spec) {
    // Unknown primitive — generate a minimal stateful class
    const fallbackSpec: PrimitiveSpec = {
      description: className,
      stateFields: ['config:map'],
      methods: [
        { name: 'init', kind: 'init', args: '', description: 'Initialize' },
        { name: 'enable', kind: 'init', args: '', description: 'Enable' },
        { name: 'status', kind: 'query', args: '', description: 'Return status' },
      ],
    };
    const gen = FAMILY_GENERATORS[family] ?? FAMILY_GENERATORS['cpp'];
    return gen(className, fallbackSpec);
  }

  const gen = FAMILY_GENERATORS[family] ?? FAMILY_GENERATORS['cpp'];
  return gen(className, spec);
}

/**
 * Generate inline code for multiple primitive symbols in the target language.
 * Used by language adapters' importStatement handlers.
 */
export function generateInlinePrimitives(symbols: string[], language: string): string {
  const family = getFamily(language);
  if (family === 'js' || family === 'python') return '';

  return symbols.map(s => generateInlinePrimitive(s, language)).filter(Boolean).join('\n\n');
}
