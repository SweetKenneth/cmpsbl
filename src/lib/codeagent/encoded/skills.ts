/**
 * Encoded Skills Module — Capability definitions and skill metrics
 * Defines what ENCODE can do and tracks proficiency
 */

/**
 * Skill categories ENCODE is proficient in
 */
export type SkillCategory = 
  | 'typescript'
  | 'react'
  | 'edge_function'
  | 'database'
  | 'testing'
  | 'refactoring'
  | 'documentation'
  | 'styling'
  | 'substrate'
  | 'security'
  | 'state_management'
  | 'navigation'
  | 'architecture'
  | 'resilience'
  | 'observability'
  | 'data_engineering'
  | 'api_design'
  | 'devops'
  | 'performance';

/**
 * Individual skill definition
 */
export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  proficiency: number; // 0-100
  examples: string[];
  constraints: string[];
}

/**
 * ENCODE's core skill registry
 */
export const ENCODED_SKILLS: Skill[] = [
  // TypeScript
  {
    id: 'ts_strict',
    name: 'TypeScript Strict Mode',
    category: 'typescript',
    description: 'Generates fully typed TypeScript code with strict mode compliance',
    proficiency: 95,
    examples: ['interface definitions', 'generic functions', 'type guards'],
    constraints: ['No any types', 'Explicit return types on exports'],
  },
  {
    id: 'ts_patterns',
    name: 'Design Patterns',
    category: 'typescript',
    description: 'Implements common patterns: factory, singleton, observer, etc.',
    proficiency: 88,
    examples: ['Factory functions', 'Event emitters', 'State machines'],
    constraints: ['Single responsibility', 'Keep under 50 lines per function'],
  },
  {
    id: 'ts_advanced_types',
    name: 'Advanced Type System',
    category: 'typescript',
    description: 'Branded types, mapped types, conditional types, template literals',
    proficiency: 82,
    examples: ['Branded IDs', 'Mapped conditional types', 'Template literal types'],
    constraints: ['Derive types from source of truth', 'No manual type duplication'],
  },

  // React
  {
    id: 'react_hooks',
    name: 'React Hooks',
    category: 'react',
    description: 'Creates custom hooks following React best practices',
    proficiency: 92,
    examples: ['useDebounce', 'useLocalStorage', 'useFetch'],
    constraints: ['Rules of hooks', 'Memoization where needed'],
  },
  {
    id: 'react_components',
    name: 'React Components',
    category: 'react',
    description: 'Builds accessible, performant React components',
    proficiency: 90,
    examples: ['Form components', 'Modal dialogs', 'Data tables'],
    constraints: ['Prop validation', 'Event handler naming conventions'],
  },
  {
    id: 'react_performance',
    name: 'React Performance',
    category: 'react',
    description: 'Optimizes renders, memoization, virtualization, and code splitting',
    proficiency: 78,
    examples: ['useMemo/useCallback', 'React.memo', 'Suspense boundaries'],
    constraints: ['Measure before optimizing', 'No premature memoization'],
  },
  {
    id: 'react_state',
    name: 'State Architecture',
    category: 'react',
    description: 'Separates server state (TanStack Query) from client state (Zustand)',
    proficiency: 85,
    examples: ['Query cache', 'Zustand slices', 'Optimistic updates'],
    constraints: ['Never copy server data into useState', 'Proper staleTime'],
  },

  // Edge Functions
  {
    id: 'edge_deno',
    name: 'Deno Edge Functions',
    category: 'edge_function',
    description: 'Creates Supabase/Deno edge functions with proper structure',
    proficiency: 94,
    examples: ['API endpoints', 'Webhooks', 'Scheduled jobs'],
    constraints: ['CORS headers', 'Error handling', 'serve() entrypoint'],
  },
  {
    id: 'edge_auth',
    name: 'Edge Authentication',
    category: 'edge_function',
    description: 'Implements auth patterns in edge functions',
    proficiency: 85,
    examples: ['JWT validation', 'API key checks', 'Role guards'],
    constraints: ['Never expose secrets', 'Validate all inputs'],
  },
  {
    id: 'edge_security',
    name: 'Edge Security Hardening',
    category: 'edge_function',
    description: 'Rate limiting, input validation, safe error responses',
    proficiency: 80,
    examples: ['Zod validation', 'Rate limiting', 'Error sanitization'],
    constraints: ['Never leak stack traces', 'No raw SQL', 'Parameterized queries only'],
  },

  // Database
  {
    id: 'db_queries',
    name: 'Database Queries',
    category: 'database',
    description: 'Writes efficient Supabase/SQL queries',
    proficiency: 87,
    examples: ['Complex joins', 'Aggregations', 'RLS policies'],
    constraints: ['Parameterized queries', 'No SQL injection'],
  },
  {
    id: 'db_migrations',
    name: 'Database Migrations',
    category: 'database',
    description: 'Schema changes with RLS, triggers, and safe rollbacks',
    proficiency: 83,
    examples: ['Table creation', 'RLS policies', 'Trigger functions'],
    constraints: ['Always enable RLS', 'Use validation triggers not CHECK'],
  },
  {
    id: 'db_rls',
    name: 'Row Level Security',
    category: 'database',
    description: 'Designs RLS policies with security-definer functions to avoid recursion',
    proficiency: 80,
    examples: ['has_role() security definer', 'Tenant isolation policies', 'Read vs write policies'],
    constraints: ['Never store roles on users table', 'Use security definer for role checks', 'Test with anon and authenticated roles'],
  },

  // Testing
  {
    id: 'test_unit',
    name: 'Unit Testing',
    category: 'testing',
    description: 'Creates unit tests with Vitest/Jest',
    proficiency: 82,
    examples: ['Function tests', 'Mock implementations', 'Assertions'],
    constraints: ['Describe-it pattern', 'Clear test names'],
  },
  {
    id: 'test_integration',
    name: 'Integration Testing',
    category: 'testing',
    description: 'Tests component integration and async flows',
    proficiency: 72,
    examples: ['Hook testing', 'Async assertions', 'Mock Supabase'],
    constraints: ['Test behavior not implementation', 'Isolate side effects'],
  },

  // Refactoring
  {
    id: 'refactor_extract',
    name: 'Extract & Simplify',
    category: 'refactoring',
    description: 'Extracts functions, reduces complexity, improves readability',
    proficiency: 91,
    examples: ['Extract helper', 'Reduce nesting', 'Inline variables'],
    constraints: ['Preserve behavior', 'Keep tests passing'],
  },
  {
    id: 'refactor_decompose',
    name: 'File Decomposition',
    category: 'refactoring',
    description: 'Splits large files into focused modules with barrel exports',
    proficiency: 84,
    examples: ['Type extraction', 'Hook separation', 'Barrel exports'],
    constraints: ['Max 200 lines per file', 'No circular imports'],
  },

  // Documentation
  {
    id: 'doc_jsdoc',
    name: 'JSDoc Comments',
    category: 'documentation',
    description: 'Adds comprehensive JSDoc documentation',
    proficiency: 93,
    examples: ['Function docs', 'Type annotations', 'Examples'],
    constraints: ['Concise descriptions', 'Accurate types'],
  },

  // ─── NEW: Styling ──────────────────────────────────────────
  {
    id: 'style_tailwind',
    name: 'Tailwind CSS & Design Tokens',
    category: 'styling',
    description: 'Uses semantic design tokens from index.css and tailwind.config.ts. Never uses hardcoded colors.',
    proficiency: 88,
    examples: ['bg-primary', 'text-muted-foreground', 'hsl(var(--accent))'],
    constraints: ['All colors through semantic tokens', 'HSL values in index.css', 'Dark mode support'],
  },
  {
    id: 'style_shadcn',
    name: 'shadcn/ui Components',
    category: 'styling',
    description: 'Extends shadcn components with proper variants via class-variance-authority',
    proficiency: 85,
    examples: ['Button variants', 'Dialog composition', 'Form field patterns'],
    constraints: ['Use cva for variants', 'Never override shadcn defaults directly', 'Accessible by default'],
  },
  {
    id: 'style_responsive',
    name: 'Responsive Design',
    category: 'styling',
    description: 'Mobile-first responsive layouts with Tailwind breakpoints',
    proficiency: 82,
    examples: ['sm:, md:, lg: breakpoints', 'Grid/flex responsive patterns', 'Container queries'],
    constraints: ['Mobile-first approach', 'Test at 320px, 768px, 1280px'],
  },

  // ─── NEW: Substrate Awareness ──────────────────────────────
  {
    id: 'substrate_navigation',
    name: 'Substrate Navigator',
    category: 'substrate',
    description: 'Uses navigateIntent() and resolveModule() to locate code before modifying it',
    proficiency: 90,
    examples: ['navigateIntent("rate limit BRAIN")', 'resolveAlias("cognition")', 'whereIs("security")'],
    constraints: ['Never guess file paths', 'Always resolve through navigator', 'Check conventions first'],
  },
  {
    id: 'substrate_conventions',
    name: 'Substrate Conventions',
    category: 'substrate',
    description: 'Knows where adapters, handlers, hooks, and hardening files live by convention',
    proficiency: 88,
    examples: ['moduleAdapters/{id}.adapter.ts', 'terminal/{group}-handlers.ts', 'hooks/substrate/use{Module}.ts'],
    constraints: ['Follow naming patterns', 'Check system-manifest.ts for corePath', 'Never create duplicate modules'],
  },
  {
    id: 'substrate_events',
    name: 'Substrate Event System',
    category: 'substrate',
    description: 'Emits proper events using emit/emitStarted/emitSucceeded/emitFailed',
    proficiency: 85,
    examples: ['emit({ module, event_type, outcome, data })', 'emitStarted/emitSucceeded pairs'],
    constraints: ['Always emit on state transitions', 'Include module and event_type', 'Use structured data'],
  },
  {
    id: 'substrate_hardening',
    name: 'Module Hardening',
    category: 'substrate',
    description: 'Implements 25-point hardening checklists per module with codenames',
    proficiency: 80,
    examples: ['Circuit breakers', 'Input validation', 'Timeout guards', 'Correlation IDs'],
    constraints: ['Resilience baseline required', 'No version numbers in output', 'Fail-closed by default'],
  },

  // ─── NEW: Security ─────────────────────────────────────────
  {
    id: 'security_input',
    name: 'Input Validation & Sanitization',
    category: 'security',
    description: 'Validates all inputs with Zod schemas, sanitizes strings, rejects dangerous patterns',
    proficiency: 88,
    examples: ['z.string().email()', 'DOMPurify sanitize', 'Path traversal rejection'],
    constraints: ['Deny by default', 'Validate at boundary', 'Never trust client input'],
  },
  {
    id: 'security_auth',
    name: 'Authentication & Authorization',
    category: 'security',
    description: 'Implements proper auth flows, role checks, and session management',
    proficiency: 82,
    examples: ['JWT validation', 'has_role() security definer', 'Session refresh'],
    constraints: ['Never store roles on profile table', 'Use separate user_roles table', 'Server-side validation only'],
  },
  {
    id: 'security_secrets',
    name: 'Secret Management',
    category: 'security',
    description: 'Handles API keys, secrets, and sensitive data without exposure',
    proficiency: 90,
    examples: ['Edge function env vars', 'Anon key vs service role', 'Secret rotation'],
    constraints: ['Never commit secrets', 'Never expose service role key', 'Use backend secrets for private keys'],
  },

  // ─── NEW: State Management ────────────────────────────────
  {
    id: 'state_zustand',
    name: 'Zustand State Management',
    category: 'state_management',
    description: 'Creates Zustand stores with slices, selectors, and devtools',
    proficiency: 85,
    examples: ['Store slices', 'Computed selectors', 'Persist middleware'],
    constraints: ['Keep stores small and focused', 'Use selectors to prevent re-renders', 'Separate server state from client state'],
  },
  {
    id: 'state_tanstack',
    name: 'TanStack Query Patterns',
    category: 'state_management',
    description: 'Server state management with query keys, stale times, and invalidation',
    proficiency: 87,
    examples: ['useQuery with typed keys', 'Optimistic mutations', 'Prefetching'],
    constraints: ['Structure query keys hierarchically', 'Set appropriate staleTime', 'Invalidate on mutations'],
  },

  // ─── NEW: Navigation Intelligence ────────────────────────
  {
    id: 'nav_module_resolution',
    name: 'Module Resolution',
    category: 'navigation',
    description: 'Resolves natural-language module references to file paths using the navigator',
    proficiency: 92,
    examples: ['resolveModule("brain")', 'resolveAlias("cognition")', 'getModuleTables("defense")'],
    constraints: ['Always verify paths exist', 'Use navigator before file operations', 'Cross-reference with system manifest'],
  },
  {
    id: 'nav_concern_detection',
    name: 'Cross-Cutting Concern Detection',
    category: 'navigation',
    description: 'Detects when an intent touches multiple systems (rate limiting, auth, audit, etc.)',
    proficiency: 88,
    examples: ['detectConcerns("rate limit")', 'getConcernFiles("circuit_breaker")', 'navigateIntent("secure BRAIN")'],
    constraints: ['Check all concern types', 'Include cross-cutting files in patch scope', 'Verify impact chain'],
  },

  // ═══════════════════════════════════════════════════════════════
  // SYSTEMS ENGINEERING — 40 New Skills
  // ═══════════════════════════════════════════════════════════════

  // ─── Architecture ─────────────────────────────────────────────
  {
    id: 'arch_event_driven',
    name: 'Event-Driven Architecture',
    category: 'architecture',
    description: 'Designs pub/sub, event sourcing, and CQRS patterns for decoupled systems',
    proficiency: 84,
    examples: ['Event bus design', 'Command/Query separation', 'Event replay'],
    constraints: ['Idempotent handlers', 'Schema versioning on events', 'Dead letter queues'],
  },
  {
    id: 'arch_domain_modeling',
    name: 'Domain-Driven Design',
    category: 'architecture',
    description: 'Models bounded contexts, aggregates, value objects, and domain events',
    proficiency: 78,
    examples: ['Aggregate roots', 'Value objects', 'Domain services', 'Anti-corruption layers'],
    constraints: ['Ubiquitous language', 'Context boundaries', 'No anemic domain models'],
  },
  {
    id: 'arch_modular_decomposition',
    name: 'Modular Decomposition',
    category: 'architecture',
    description: 'Decomposes monoliths into cohesive modules with clean dependency graphs',
    proficiency: 86,
    examples: ['Module boundary detection', 'Dependency inversion', 'Interface segregation'],
    constraints: ['No circular dependencies', 'Explicit public APIs', 'Internal implementation hidden'],
  },
  {
    id: 'arch_pipeline_design',
    name: 'Pipeline & Chain Design',
    category: 'architecture',
    description: 'Builds composable processing pipelines with middleware, filters, and transforms',
    proficiency: 82,
    examples: ['Middleware chains', 'Transform pipelines', 'Filter cascades', 'Stage gates'],
    constraints: ['Each stage pure where possible', 'Error propagation defined', 'Backpressure handling'],
  },
  {
    id: 'arch_capability_mapping',
    name: 'Capability-Based Architecture',
    category: 'architecture',
    description: 'Maps system capabilities to modules and routes tasks by capability matching',
    proficiency: 80,
    examples: ['Capability registry', 'Dynamic routing', 'Skill-based dispatch'],
    constraints: ['Capabilities must be verifiable', 'Fallback paths defined', 'No implicit dependencies'],
  },
  {
    id: 'arch_contract_first',
    name: 'Contract-First Design',
    category: 'architecture',
    description: 'Defines interfaces and contracts before implementation for interop safety',
    proficiency: 83,
    examples: ['TypeScript interfaces as contracts', 'Zod schemas as runtime contracts', 'API contracts'],
    constraints: ['Contracts are immutable once published', 'Versioned breaking changes', 'Consumer-driven'],
  },

  // ─── Resilience ───────────────────────────────────────────────
  {
    id: 'res_circuit_breaker',
    name: 'Circuit Breaker Implementation',
    category: 'resilience',
    description: 'Implements circuit breakers with half-open probing, failure thresholds, and recovery',
    proficiency: 85,
    examples: ['Three-state breaker', 'Failure rate windows', 'Half-open probe strategy'],
    constraints: ['Configurable thresholds', 'Metrics emission on state change', 'Graceful degradation'],
  },
  {
    id: 'res_retry_strategies',
    name: 'Retry & Backoff Strategies',
    category: 'resilience',
    description: 'Exponential backoff, jitter, retry budgets, and idempotency tokens',
    proficiency: 87,
    examples: ['Exponential backoff with jitter', 'Retry budget (max 3 per window)', 'Idempotency keys'],
    constraints: ['Never retry non-idempotent writes', 'Cap max retries', 'Log each retry attempt'],
  },
  {
    id: 'res_bulkhead',
    name: 'Bulkhead Isolation',
    category: 'resilience',
    description: 'Isolates failure domains with resource pools, concurrency limits, and timeouts',
    proficiency: 76,
    examples: ['Semaphore-based limits', 'Thread pool isolation', 'Per-tenant quotas'],
    constraints: ['Define blast radius per subsystem', 'Monitor utilization', 'Shed load gracefully'],
  },
  {
    id: 'res_graceful_degradation',
    name: 'Graceful Degradation',
    category: 'resilience',
    description: 'Designs fallback paths so partial failures return reduced but valid responses',
    proficiency: 80,
    examples: ['Cached fallback', 'Feature flag kill switches', 'Default safe values'],
    constraints: ['Users must know degraded state', 'Log degradation events', 'Auto-recover when upstream returns'],
  },
  {
    id: 'res_chaos_engineering',
    name: 'Chaos & Fault Injection',
    category: 'resilience',
    description: 'Injects controlled failures to verify resilience in shadow and staging environments',
    proficiency: 70,
    examples: ['Random latency injection', 'Dependency failure simulation', 'Data corruption tests'],
    constraints: ['Never in production without gates', 'Shadow mode only by default', 'Full audit trail'],
  },
  {
    id: 'res_self_healing',
    name: 'Self-Healing Systems',
    category: 'resilience',
    description: 'Auto-detects and repairs common failure modes without human intervention',
    proficiency: 75,
    examples: ['Auto-restart crashed workers', 'Schema drift repair', 'Stale cache eviction'],
    constraints: ['Repair confidence threshold required', 'Max repair attempts capped', 'Emit healing events'],
  },

  // ─── Observability ────────────────────────────────────────────
  {
    id: 'obs_structured_logging',
    name: 'Structured Logging',
    category: 'observability',
    description: 'Emits JSON-structured logs with correlation IDs, severity, and context',
    proficiency: 90,
    examples: ['log.info("module", "message", { traceId, data })', 'Request correlation IDs'],
    constraints: ['No PII in logs', 'Consistent field names', 'Include traceId in all async chains'],
  },
  {
    id: 'obs_metrics_design',
    name: 'Metrics & Instrumentation',
    category: 'observability',
    description: 'Designs RED metrics (Rate, Errors, Duration) and custom business metrics',
    proficiency: 82,
    examples: ['Latency histograms', 'Error rate counters', 'Throughput gauges', 'SLI tracking'],
    constraints: ['Cardinality-aware labels', 'Pre-aggregate where possible', 'Alert on SLO breach'],
  },
  {
    id: 'obs_distributed_tracing',
    name: 'Distributed Tracing',
    category: 'observability',
    description: 'Propagates trace context across module boundaries and async operations',
    proficiency: 78,
    examples: ['Trace ID propagation', 'Span creation per stage', 'Parent-child span linking'],
    constraints: ['Always propagate traceId', 'Sample at head', 'Include span metadata'],
  },
  {
    id: 'obs_health_checks',
    name: 'Health Check Design',
    category: 'observability',
    description: 'Designs liveness, readiness, and deep health checks for system components',
    proficiency: 85,
    examples: ['Shallow /health', 'Deep dependency checks', 'Composite health scores'],
    constraints: ['Liveness must be fast', 'Readiness checks dependencies', 'Cache health results briefly'],
  },
  {
    id: 'obs_anomaly_detection',
    name: 'Anomaly Detection',
    category: 'observability',
    description: 'Detects statistical anomalies in metrics, logs, and behavioral patterns',
    proficiency: 72,
    examples: ['Z-score deviation', 'Moving average drift', 'Baseline comparison'],
    constraints: ['Train on sufficient baseline data', 'Suppress during deploys', 'Human-reviewable alerts'],
  },
  {
    id: 'obs_audit_trails',
    name: 'Audit Trail Design',
    category: 'observability',
    description: 'Creates immutable, tamper-evident audit chains for compliance and debugging',
    proficiency: 86,
    examples: ['Hash-chained receipts', 'Event sourced audit log', 'Anchor checkpoints'],
    constraints: ['Append-only', 'Include actor and timestamp', 'Periodic integrity verification'],
  },

  // ─── Data Engineering ─────────────────────────────────────────
  {
    id: 'data_schema_evolution',
    name: 'Schema Evolution',
    category: 'data_engineering',
    description: 'Manages backwards-compatible schema changes with migration strategies',
    proficiency: 83,
    examples: ['Additive-only migrations', 'Backfill scripts', 'Dual-write transitions'],
    constraints: ['Never drop columns in production', 'Backfill before removing old columns', 'Version schemas'],
  },
  {
    id: 'data_etl_pipelines',
    name: 'ETL & Data Pipelines',
    category: 'data_engineering',
    description: 'Builds extract-transform-load pipelines with validation, checkpointing, and retries',
    proficiency: 77,
    examples: ['Batch processors', 'Incremental loads', 'Data quality gates'],
    constraints: ['Idempotent transforms', 'Checkpoint after each stage', 'Validate before load'],
  },
  {
    id: 'data_caching_strategies',
    name: 'Caching Strategies',
    category: 'data_engineering',
    description: 'Implements tiered caching with TTL, invalidation, and cache-aside patterns',
    proficiency: 84,
    examples: ['LRU cache', 'Write-through', 'Cache-aside', 'Stale-while-revalidate'],
    constraints: ['Define TTL per data type', 'Invalidate on writes', 'Bound cache size'],
  },
  {
    id: 'data_retention',
    name: 'Data Retention & Hygiene',
    category: 'data_engineering',
    description: 'Implements tiered retention policies with automated cleanup and archival',
    proficiency: 81,
    examples: ['30/90/365-day tiers', 'Automated pruning', 'Cold storage archival'],
    constraints: ['Comply with retention regulations', 'Audit before delete', 'Soft delete first'],
  },
  {
    id: 'data_stream_processing',
    name: 'Stream Processing',
    category: 'data_engineering',
    description: 'Processes real-time event streams with windowing, aggregation, and watermarks',
    proficiency: 73,
    examples: ['Tumbling windows', 'Sliding aggregations', 'Late event handling'],
    constraints: ['Handle out-of-order events', 'Exactly-once semantics where possible', 'Backpressure aware'],
  },

  // ─── API Design ───────────────────────────────────────────────
  {
    id: 'api_rest_design',
    name: 'RESTful API Design',
    category: 'api_design',
    description: 'Designs resource-oriented APIs with proper HTTP semantics and pagination',
    proficiency: 88,
    examples: ['Resource naming', 'Cursor pagination', 'Conditional requests', 'HATEOAS links'],
    constraints: ['Consistent naming conventions', 'Proper status codes', 'Versioned endpoints'],
  },
  {
    id: 'api_rate_limiting',
    name: 'Rate Limiting & Throttling',
    category: 'api_design',
    description: 'Implements token bucket, sliding window, and per-tenant rate limits',
    proficiency: 83,
    examples: ['Token bucket algorithm', 'Sliding window counters', 'Per-key quotas'],
    constraints: ['Return 429 with Retry-After', 'Log rate limit events', 'Allow burst capacity'],
  },
  {
    id: 'api_versioning',
    name: 'API Versioning Strategy',
    category: 'api_design',
    description: 'Manages breaking changes through URL, header, or content-type versioning',
    proficiency: 79,
    examples: ['URL path versioning', 'Accept header versioning', 'Sunset headers'],
    constraints: ['Support N-1 version minimum', 'Deprecation notices before removal', 'Migration guides'],
  },
  {
    id: 'api_error_contracts',
    name: 'Error Response Contracts',
    category: 'api_design',
    description: 'Standardizes error responses with codes, messages, and actionable details',
    proficiency: 86,
    examples: ['{ code, message, details, traceId }', 'Domain error codes', 'Validation error arrays'],
    constraints: ['Never expose internals', 'Consistent error shape', 'Include correlation ID'],
  },
  {
    id: 'api_webhook_design',
    name: 'Webhook & Event Delivery',
    category: 'api_design',
    description: 'Designs reliable webhook delivery with signatures, retries, and replay',
    proficiency: 77,
    examples: ['HMAC signature verification', 'Exponential retry delivery', 'Event replay endpoint'],
    constraints: ['Sign all payloads', 'Idempotency keys per event', 'Dead letter after max retries'],
  },

  // ─── DevOps ───────────────────────────────────────────────────
  {
    id: 'devops_ci_pipelines',
    name: 'CI/CD Pipeline Design',
    category: 'devops',
    description: 'Designs build, test, and deploy pipelines with quality gates and rollback',
    proficiency: 76,
    examples: ['Lint → Test → Build → Deploy', 'Quality gates', 'Canary deploys'],
    constraints: ['Fast feedback loops', 'Deterministic builds', 'Rollback always available'],
  },
  {
    id: 'devops_feature_flags',
    name: 'Feature Flag Management',
    category: 'devops',
    description: 'Implements feature flags for progressive rollout, A/B testing, and kill switches',
    proficiency: 80,
    examples: ['Boolean flags', 'Percentage rollout', 'User segment targeting', 'Kill switches'],
    constraints: ['Clean up stale flags', 'Default to off', 'Audit flag changes'],
  },
  {
    id: 'devops_config_management',
    name: 'Configuration Management',
    category: 'devops',
    description: 'Manages environment-specific configuration with validation and hot reloading',
    proficiency: 82,
    examples: ['Env-based config', 'Zod config validation', 'Runtime config updates'],
    constraints: ['Validate at startup', 'Never hardcode secrets', 'Document all config keys'],
  },
  {
    id: 'devops_blue_green',
    name: 'Blue-Green & Canary Deploys',
    category: 'devops',
    description: 'Implements zero-downtime deployments with traffic shifting and auto-rollback',
    proficiency: 74,
    examples: ['Shadow traffic', 'Canary percentage routing', 'Automated rollback triggers'],
    constraints: ['Monitor error rates during shift', 'Database migrations must be backward-compatible', 'Automated smoke tests'],
  },

  // ─── Performance ──────────────────────────────────────────────
  {
    id: 'perf_lazy_loading',
    name: 'Lazy Loading & Code Splitting',
    category: 'performance',
    description: 'Splits bundles and defers loading of non-critical resources',
    proficiency: 84,
    examples: ['React.lazy + Suspense', 'Dynamic imports', 'Route-based splitting'],
    constraints: ['Keep initial bundle small', 'Preload on hover/intent', 'Fallback UI required'],
  },
  {
    id: 'perf_query_optimization',
    name: 'Query Optimization',
    category: 'performance',
    description: 'Optimizes database queries with indexes, explain plans, and denormalization',
    proficiency: 81,
    examples: ['Index analysis', 'EXPLAIN ANALYZE', 'Selective denormalization', 'Materialized views'],
    constraints: ['Measure before optimizing', 'Index on query patterns not assumptions', 'Monitor slow query log'],
  },
  {
    id: 'perf_memory_management',
    name: 'Memory Management',
    category: 'performance',
    description: 'Prevents memory leaks, bounds collections, and manages object lifecycles',
    proficiency: 79,
    examples: ['WeakRef/WeakMap', 'Bounded arrays', 'Subscription cleanup', 'Object pooling'],
    constraints: ['Always clean up subscriptions', 'Cap collection sizes', 'Profile before fixing'],
  },
  {
    id: 'perf_concurrency',
    name: 'Concurrency Patterns',
    category: 'performance',
    description: 'Manages concurrent operations with Promise.allSettled, semaphores, and queues',
    proficiency: 80,
    examples: ['Promise.allSettled', 'Concurrency limiter', 'Work queue', 'Batch processing'],
    constraints: ['Limit concurrent operations', 'Handle partial failures', 'No unbounded parallelism'],
  },
  {
    id: 'perf_edge_compute',
    name: 'Edge Compute Optimization',
    category: 'performance',
    description: 'Optimizes edge function cold starts, memory usage, and response streaming',
    proficiency: 78,
    examples: ['Minimal imports', 'Response streaming', 'Global state reuse across invocations'],
    constraints: ['Keep functions under 50ms cold start', 'No heavy dependencies', 'Stream large responses'],
  },
  {
    id: 'perf_render_optimization',
    name: 'Render Performance',
    category: 'performance',
    description: 'Eliminates unnecessary re-renders with profiling, memoization, and virtualization',
    proficiency: 83,
    examples: ['React DevTools profiling', 'Virtualized lists', 'Selector memoization'],
    constraints: ['Profile before memo', 'Virtualize lists > 100 items', 'Avoid context provider churn'],
  },
];

/**
 * Get skills by category
 */
export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return ENCODED_SKILLS.filter(s => s.category === category);
}

/**
 * Get overall proficiency across all skills
 */
export function getOverallProficiency(): number {
  const total = ENCODED_SKILLS.reduce((sum, s) => sum + s.proficiency, 0);
  return Math.round(total / ENCODED_SKILLS.length);
}

/**
 * Get skills summary for display
 */
export function getSkillsSummary(): {
  total: number;
  byCategory: Record<SkillCategory, { count: number; avgProficiency: number }>;
  overall: number;
  topSkills: Skill[];
} {
  const categories = [...new Set(ENCODED_SKILLS.map(s => s.category))] as SkillCategory[];
  const byCategory = {} as Record<SkillCategory, { count: number; avgProficiency: number }>;
  
  for (const cat of categories) {
    const skills = getSkillsByCategory(cat);
    byCategory[cat] = {
      count: skills.length,
      avgProficiency: Math.round(skills.reduce((s, sk) => s + sk.proficiency, 0) / skills.length),
    };
  }
  
  return {
    total: ENCODED_SKILLS.length,
    byCategory,
    overall: getOverallProficiency(),
    topSkills: [...ENCODED_SKILLS].sort((a, b) => b.proficiency - a.proficiency).slice(0, 5),
  };
}

/**
 * Format skill for display
 */
export function formatSkill(skill: Skill): string {
  const bar = '█'.repeat(Math.floor(skill.proficiency / 10)) + 
              '░'.repeat(10 - Math.floor(skill.proficiency / 10));
  return `${skill.name} [${bar}] ${skill.proficiency}%`;
}

/**
 * Get skill recommendations based on task type — substrate-aware
 */
export function getRelevantSkills(taskType: string): Skill[] {
  const keywords: Record<string, SkillCategory[]> = {
    'component': ['react', 'typescript', 'styling'],
    'hook': ['react', 'typescript', 'state_management'],
    'function': ['typescript', 'edge_function'],
    'api': ['edge_function', 'database', 'security', 'api_design'],
    'query': ['database', 'state_management', 'performance'],
    'test': ['testing'],
    'refactor': ['refactoring', 'typescript', 'navigation'],
    'document': ['documentation'],
    'style': ['styling', 'react'],
    'tailwind': ['styling'],
    'css': ['styling'],
    'design': ['styling', 'react', 'architecture'],
    'auth': ['security', 'database'],
    'rls': ['database', 'security'],
    'policy': ['database', 'security'],
    'secret': ['security'],
    'rate limit': ['security', 'substrate', 'api_design'],
    'circuit': ['substrate', 'security', 'resilience'],
    'substrate': ['substrate', 'navigation', 'architecture'],
    'module': ['substrate', 'navigation', 'architecture'],
    'navigate': ['navigation', 'substrate'],
    'brain': ['substrate', 'database', 'navigation'],
    'decode': ['substrate', 'navigation'],
    'encode': ['substrate', 'navigation', 'architecture'],
    'defense': ['substrate', 'security', 'navigation', 'resilience'],
    'nexus': ['substrate', 'navigation'],
    'state': ['state_management', 'react'],
    'zustand': ['state_management'],
    'tanstack': ['state_management', 'react'],
    'edge': ['edge_function', 'security', 'performance'],
    'migration': ['database', 'data_engineering'],
    'architect': ['architecture', 'substrate'],
    'pipeline': ['architecture', 'data_engineering'],
    'resilient': ['resilience', 'architecture'],
    'resilience': ['resilience', 'architecture'],
    'heal': ['resilience', 'substrate'],
    'retry': ['resilience'],
    'fallback': ['resilience'],
    'observ': ['observability'],
    'metric': ['observability', 'performance'],
    'trace': ['observability'],
    'log': ['observability'],
    'health': ['observability', 'resilience'],
    'anomaly': ['observability', 'resilience'],
    'audit': ['observability', 'security'],
    'cache': ['data_engineering', 'performance'],
    'schema': ['data_engineering', 'database'],
    'etl': ['data_engineering'],
    'stream': ['data_engineering'],
    'retention': ['data_engineering'],
    'webhook': ['api_design', 'edge_function'],
    'throttl': ['api_design', 'resilience'],
    'version': ['api_design', 'devops'],
    'deploy': ['devops'],
    'feature flag': ['devops'],
    'config': ['devops'],
    'canary': ['devops', 'resilience'],
    'perform': ['performance'],
    'optimi': ['performance', 'database'],
    'lazy': ['performance', 'react'],
    'memory': ['performance', 'substrate'],
    'concurr': ['performance'],
    'render': ['performance', 'react'],
  };
  
  const lower = taskType.toLowerCase();
  for (const [key, cats] of Object.entries(keywords)) {
    if (lower.includes(key)) {
      return ENCODED_SKILLS.filter(s => cats.includes(s.category));
    }
  }
  
  return ENCODED_SKILLS.filter(s => s.category === 'typescript');
}
