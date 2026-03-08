/**
 * Shadow Mesh — Adversarial Input Mutation (v4)
 * 
 * v4: Per-executor seed inputs for balanced, fair probing across all pilot executors.
 * Each executor category gets domain-specific seed inputs so probing is
 * even and representative, not biased toward INCLUSIVE-shaped inputs.
 */

/**
 * Get a domain-specific seed input for a given executor.
 * Ensures each executor is probed with inputs shaped for its expected schema.
 */
export function getExecutorSeedInput(executorName: string): Record<string, unknown> {
  // INCLUSIVE executors — use content/url/target
  if (['adaptive-ui', 'cognitive-load-optimization', 'comprehensive-accessibility-audit',
       'personalized-accessibility-engine', 'inclusive-content'].includes(executorName)) {
    return { content: 'Test page content', url: 'https://example.com', target: 'self', wcagLevel: 'AA', userId: 'user-1' };
  }
  // COGNITIVE executors — use query/signal/prompt
  if (executorName === 'reasoning-engine') {
    return { query: 'Analyze pattern consistency', context: { domain: 'test' }, depth: 3 };
  }
  if (executorName === 'learning-engine') {
    return { signal: 'Positive reinforcement signal', domain: 'cognitive', reinforcement: 0.8 };
  }
  if (executorName === 'imagination-engine') {
    return { prompt: 'Generate scenario for edge case', mode: 'GENERATE', creativity: 0.7 };
  }
  // OPERATIONAL executors — use event/action
  if (executorName === 'relay-event-dispatcher') {
    return { event: 'system.health.check', payload: { key: 'value' }, priority: 1 };
  }
  if (executorName === 'economy-cost-tracker') {
    return { action: 'compute', module: 'brain', tokens: 500, computeMs: 120 };
  }
  if (executorName === 'audit-compliance-check') {
    return { content: 'Audit this page for compliance', standard: 'WCAG', domain: 'example.com' };
  }
  // ORCHESTRATOR executors — use intent/proposal
  if (executorName === 'mesh-pipeline-resolver') {
    return { intent: 'Resolve accessibility pipeline', modules: ['inclusive', 'brain'], priority: 2 };
  }
  if (executorName === 'seba-proposal-evaluator') {
    return { proposal: 'Improve cognitive latency by 15%', riskLevel: 'LOW', confidence: 0.85 };
  }
  // INFRASTRUCTURE executors
  if (executorName === 'memory-consolidation-engine') {
    return { content: 'Consolidate memory tier', userId: 'user-1', target: 'warm', action: 'consolidate' };
  }
  if (executorName === 'identity-verification-engine') {
    return { userId: 'user-1', action: 'verify', content: 'Identity check payload' };
  }
  if (executorName === 'sandbox-isolation-guard') {
    return { content: 'Isolation boundary test', target: 'sandbox', userId: 'user-1' };
  }
  if (executorName === 'encode-task-scheduler') {
    return { action: 'schedule', content: 'Encode task payload', target: 'queue', priority: 1 };
  }
  if (executorName === 'cache-invalidation-engine') {
    return { target: 'user-cache', action: 'INVALIDATE', pattern: 'user:*', userId: 'user-1' };
  }
  if (executorName === 'config-propagation-engine') {
    return { content: 'Config payload v2', target: 'all-modules', action: 'PUSH', version: '1.0.0' };
  }
  if (executorName === 'health-check-coordinator') {
    return { target: 'brain-module', action: 'CHECK', module: 'brain', threshold: 80 };
  }
  // INTELLIGENCE executors
  if (executorName === 'dream-pattern-synthesizer') {
    return { prompt: 'Synthesize dream pattern', content: 'Pattern seed data', userId: 'user-1' };
  }
  if (executorName === 'decode-intent-classifier') {
    return { content: 'Classify user intent', query: 'What is the user trying to do?', userId: 'user-1' };
  }
  if (executorName === 'vision-anomaly-detector') {
    return { content: 'Detect anomalies in telemetry', target: 'metrics', userId: 'user-1' };
  }
  if (executorName === 'sentiment-drift-analyzer') {
    return { content: 'Analyze sentiment trend data', baseline: 0.65, window: 24, userId: 'user-1' };
  }
  if (executorName === 'temporal-pattern-engine') {
    return { content: 'Find temporal patterns in events', query: 'spike detection', timeRange: '24h', granularity: 'HOUR' };
  }
  if (executorName === 'correlation-discovery-engine') {
    return { content: 'Find correlations across metrics', target: 'latency-errors', minCorrelation: 0.7 };
  }
  if (executorName === 'signal-noise-separator') {
    return { content: 'Separate signal from noise in telemetry', threshold: 0.5, mode: 'FILTER', userId: 'user-1' };
  }
  // NEW INCLUSIVE executors
  if (executorName === 'contrast-ratio-analyzer') {
    return { content: 'Analyze contrast ratios', foreground: '#333', background: '#fff', target: 'self' };
  }
  if (executorName === 'focus-management-engine') {
    return { content: 'Manage focus trap', target: 'modal-dialog', action: 'TRAP', userId: 'user-1' };
  }
  // NEW COGNITIVE executors
  if (executorName === 'semantic-analysis-engine') {
    return { content: 'Analyze semantic structure of text', query: 'Extract key entities', depth: 2 };
  }
  if (executorName === 'context-window-manager') {
    return { content: 'Manage context window for LLM call', action: 'SLIDE', windowSize: 4096, userId: 'user-1' };
  }
  // NEW OPERATIONAL executors
  if (executorName === 'rate-limiter-engine') {
    return { action: 'check', target: 'api-endpoint', limit: 100, windowMs: 60000, userId: 'user-1' };
  }
  if (executorName === 'telemetry-aggregator') {
    return { event: 'metric.collected', module: 'brain', payload: { value: 42 }, timestamp: new Date().toISOString() };
  }
  // NEW ORCHESTRATOR executors
  if (executorName === 'workflow-orchestrator') {
    return { intent: 'Execute multi-step pipeline', steps: ['validate', 'process', 'emit'], priority: 1 };
  }
  if (executorName === 'dependency-resolver') {
    return { module: 'inclusive', action: 'resolve', dependencies: ['brain', 'cortex'] };
  }
  // Fallback
  return { content: 'Generic test input', target: 'self', userId: 'user-1' };
}

/**
 * Generate adversarial inputs based on a seed input.
 * v4: Expanded to cover all 6 substrate modules and their input schemas.
 */
export function generateAdversarialInputs(seed?: Record<string, unknown>): Record<string, unknown>[] {
  const inputs: Record<string, unknown>[] = [
    // ════════════════════════════════════════════════════════════════
    // UNIVERSAL archetypes (apply to all executors)
    // ════════════════════════════════════════════════════════════════

    // ── empty_shell ──
    {},
    { content: null },
    { target: null, url: null },
    { content: '', target: '', url: '' },
    { content: undefined, userId: undefined },

    // ── type_mismatch ──
    { content: 12345 },
    { content: true },
    { content: [1, 2, 3] },
    { target: { nested: 'object' } },
    { wcagLevel: 999 },
    { preferences: 'not-an-object' },
    { preferences: [1, 2, 3] },
    { userId: { __proto__: 'polluted' } },
    { ariaLabel: [1, 2, 3] },
    { content: { deeply: { nested: { value: 'here' } } } },

    // ── missing_required ──
    { irrelevant_key: 'value' },
    { metadata: 'something', extra: true },
    { wcagLevel: 'AA' },

    // ── oversized ──
    { content: 'x'.repeat(100_000) },
    { content: '🔥'.repeat(5000) },
    { content: 'a\n'.repeat(500) },
    { target: 'a'.repeat(50_000) },

    // ── injection_attempt ──
    { target: '<script>alert(1)</script>' },
    { content: '"; DROP TABLE users; --' },
    { url: 'javascript:alert(1)' },
    { content: '<img onerror="alert(1)" src=x>' },
    { domain: '../../etc/passwd' },
    { content: 'SELECT * FROM users WHERE 1=1; --' },

    // ── shape_alien ──
    { foo: 'bar', baz: 42 },
    { x: null, y: null, z: null },

    // ── partial_valid ──
    { content: 'valid content', wcagLevel: 'INVALID' },
    { url: 'https://example.com', content: null, target: 12345 },
    { userId: 'user-1', preferences: 'should-be-object' },
    { content: 'good', ariaLabel: [1, 2, 3], target: 'self' },

    // ── well_formed (should pass through) ──
    { content: 'Hello world', target: 'self' },
    { url: 'https://example.com', wcagLevel: 'AA' },
    { userId: 'user-123', preferences: { theme: 'dark' } },
    { content: 'Test content', ariaLabel: 'Test label' },

    // ── edge cases ──
    { content: '\x00\x01\x02\x03' },
    { content: '\u200B\u200C\u200D' },
    { content: 'NaN' },
    { content: 'undefined' },
    { content: '() => alert(1)' },
    { content: '&amp;lt;script&amp;gt;' },
    { userId: '{}', preferences: '[]' },

    // ════════════════════════════════════════════════════════════════
    // COGNITIVE MODULE — reasoning, learning, imagination
    // ════════════════════════════════════════════════════════════════

    // reasoning-engine
    { query: '', context: null },
    { query: 'x'.repeat(50_000), depth: -1 },
    { query: null, constraints: 'not-an-object' },
    { query: 'valid reasoning query', context: { domain: 'test' }, depth: 3 },
    { query: '<script>alert(1)</script>', context: { __proto__: {} } },
    { query: 42, constraints: [1, 2, 3] },

    // learning-engine
    { signal: '', domain: null },
    { signal: null, feedback: 'not-an-object' },
    { signal: 'valid signal', domain: 'test', reinforcement: 0.8 },
    { signal: 'x'.repeat(20_000), reinforcement: 'not-a-number' },
    { signal: 'SELECT * FROM signals; --', source: '../../../etc/passwd' },
    { signal: true, feedback: [1, 2, 3] },

    // imagination-engine
    { prompt: '', mode: 'INVALID_MODE' },
    { prompt: null, creativity: 'not-a-number' },
    { prompt: 'valid prompt', mode: 'GENERATE', creativity: 0.9 },
    { prompt: 'x'.repeat(50_000), mode: 999 },
    { prompt: '<script>alert(1)</script>', seed: { nested: true } },
    { prompt: 42, constraints: 'string-not-object' },

    // ════════════════════════════════════════════════════════════════
    // OPERATIONAL MODULE — relay, economy, audit
    // ════════════════════════════════════════════════════════════════

    // relay-event-dispatcher
    { event: '', payload: null },
    { event: null, target: 12345 },
    { event: 'test.event', payload: { key: 'value' }, priority: 1 },
    { event: 'x'.repeat(10_000), channel: null },
    { event: '<script>alert(1)</script>', payload: { __proto__: {} } },
    { event: true, priority: 'not-a-number' },

    // economy-cost-tracker
    { action: '', module: '' },
    { action: null, module: null, tokens: 'not-a-number' },
    { action: 'compute', module: 'brain', tokens: 500, computeMs: 120 },
    { action: 'x'.repeat(10_000), module: true },
    { action: 'SELECT * FROM costs; --', costMillicents: -1 },
    { action: 42, module: [1, 2, 3] },

    // audit-compliance-check
    { content: '', standard: 'INVALID' },
    { content: null, standard: null },
    { content: 'audit this page', standard: 'WCAG', domain: 'example.com' },
    { content: 'x'.repeat(50_000), severity: 999 },
    { content: '<script>alert(1)</script>', standard: true },
    { content: 42, domain: '../../etc/passwd' },

    // ════════════════════════════════════════════════════════════════
    // ORCHESTRATOR MODULE — mesh resolver, seba evaluator
    // ════════════════════════════════════════════════════════════════

    // mesh-pipeline-resolver
    { intent: '', modules: null },
    { intent: null, constraints: 'not-an-object' },
    { intent: 'resolve accessibility pipeline', modules: ['inclusive', 'brain'], priority: 2 },
    { intent: 'x'.repeat(20_000), modules: 'not-an-array' },
    { intent: '<script>alert(1)</script>', traceId: { nested: true } },
    { intent: 42, priority: 'not-a-number' },

    // seba-proposal-evaluator
    { proposal: '', riskLevel: 'INVALID' },
    { proposal: null, impactMetrics: 'not-an-object' },
    { proposal: 'Improve cognitive latency by 15%', riskLevel: 'LOW', confidence: 0.85 },
    { proposal: 'x'.repeat(20_000), module: true },
    { proposal: '<script>alert(1)</script>', confidence: 'not-a-number' },
    { proposal: 42, impactMetrics: [1, 2, 3] },
  ];

  // If seed provided, add mutated variants
  if (seed && typeof seed === 'object') {
    inputs.push(
      { ...seed, content: null },
      { ...seed, target: undefined },
      { ...seed, wcagLevel: 999 },
      { ...seed, content: '<script>xss</script>' },
      { ...seed, userId: '' },
      // Module-specific seed mutations
      { ...seed, query: null },
      { ...seed, signal: '' },
      { ...seed, prompt: 12345 },
      { ...seed, event: null },
      { ...seed, intent: '' },
      { ...seed, proposal: null },
    );
  }

  return inputs;
}
