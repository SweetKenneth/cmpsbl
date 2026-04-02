/**
 * Showroom Catalog — Static inventory of 100 scored discoveries.
 * CJPI 68–100. No database calls. No Crown Jewel registry data.
 * Priced per graduated CJPI economy.
 */

export type PainPointId = 'security' | 'governance' | 'intelligence' | 'observability' | 'resilience' | 'optimization';

export interface ShowroomItem {
  id: string;
  name: string;
  score: number;
  chain: string[];
  category: string;
  solutionDesc: string;
  painLabel: string;
  painId: PainPointId;
}

/** Graduated CJPI pricing formula */
export function getShowroomPrice(score: number): number {
  if (score === 100) return 1952;
  if (score >= 94) return score * 2;
  if (score >= 90) return Math.round(score * 1.5);
  if (score >= 80) return Math.round(score * 1.25);
  if (score >= 68) return score;
  return 0;
}

export function getShowroomPriceDisplay(score: number): string {
  const price = getShowroomPrice(score);
  if (price === 0) return 'Free';
  return `$${price.toLocaleString()}`;
}

// ═══ Static catalog — 100 discoveries spanning CJPI 68–100 ═══

const PAIN_MAP: Record<PainPointId, string> = {
  security: 'Security & Compliance',
  governance: 'Policy & Governance',
  intelligence: 'Decision Making',
  observability: 'Monitoring & Visibility',
  resilience: 'Reliability & Recovery',
  optimization: 'Performance',
};

function item(id: string, name: string, score: number, painId: PainPointId, desc: string, chain: string[]): ShowroomItem {
  return { id, name, score, chain, category: painId, solutionDesc: desc, painLabel: PAIN_MAP[painId], painId };
}

export const SHOWROOM_CATALOG: ShowroomItem[] = [
  // ═══ APEX (100) ═══
  item('apex-1', 'SOVEREIGN Runtime Shield', 100, 'security', 'Full-spectrum runtime protection with zero-latency threat interception. The only discovery to achieve a perfect CJPI score.', ['DEFENSE', 'SHADOW', 'AUDIT', 'BEACON', 'FAILSAFE']),
  item('apex-2', 'OMNISCIENT State Orchestrator', 100, 'resilience', 'Total state awareness across distributed substrates. Predicts and prevents cascade failures before they propagate.', ['CORTEX', 'NEXUS', 'BEACON', 'FAILSAFE', 'EVOLUTION']),
  item('apex-3', 'GENESIS Pipeline Compiler', 100, 'optimization', 'Self-optimizing pipeline generation that compiles cognitive workflows into near-hardware execution paths.', ['ARCHITECT', 'CORTEX', 'AUTOMATON', 'NEXUS', 'FORGE']),

  // ═══ MYTHIC (94–99) ═══
  item('myth-1', 'Recursive Threat Anticipator', 99, 'security', 'Predicts attack vectors by simulating adversarial cognitive patterns across 12 defensive layers.', ['DEFENSE', 'SHADOW', 'CORTEX', 'AUDIT']),
  item('myth-2', 'Cognitive Drift Compensator', 98, 'intelligence', 'Detects and corrects semantic drift in real-time decision streams. Self-calibrating confidence intervals.', ['CORTEX', 'NEXUS', 'BEACON', 'EVOLUTION']),
  item('myth-3', 'Zero-Copy State Migrator', 97, 'resilience', 'Migrates live cognitive state between substrates with zero data duplication and sub-millisecond cutover.', ['FAILSAFE', 'ARCHITECT', 'NEXUS', 'CORTEX']),
  item('myth-4', 'Adaptive Governance Mesh', 96, 'governance', 'Self-adjusting policy enforcement that learns organizational compliance patterns and pre-validates decisions.', ['GOVERNANCE', 'AUDIT', 'CORTEX', 'DEFENSE']),
  item('myth-5', 'Predictive Latency Eliminator', 96, 'optimization', 'Pre-computes execution paths based on usage patterns. Eliminates 94% of cold-start latency across all engines.', ['NEXUS', 'CORTEX', 'AUTOMATON', 'BEACON']),
  item('myth-6', 'Full-Spectrum Observability Lens', 95, 'observability', 'Unified telemetry collector that correlates signals across all 40 Primitives into a single diagnostic stream.', ['BEACON', 'AUDIT', 'SHADOW', 'CORTEX']),
  item('myth-7', 'Autonomous Contract Validator', 95, 'governance', 'Validates API contracts, SLAs, and compliance requirements autonomously using formal verification methods.', ['GOVERNANCE', 'AUDIT', 'DEFENSE', 'SHADOW']),
  item('myth-8', 'Neural Pathway Optimizer', 94, 'optimization', 'Rewires cognitive routing paths dynamically based on observed bottleneck topology across engine clusters.', ['NEXUS', 'ARCHITECT', 'CORTEX', 'BEACON']),
  item('myth-9', 'Cascade Failure Immunizer', 94, 'resilience', 'Injects circuit-breaking antibodies at every dependency junction. Prevents cascade propagation in under 2ms.', ['FAILSAFE', 'DEFENSE', 'BEACON', 'EVOLUTION']),
  item('myth-10', 'Adversarial Input Neutralizer', 94, 'security', 'Sanitizes and neutralizes adversarial inputs using multi-layer cognitive analysis before they reach any engine.', ['DEFENSE', 'SHADOW', 'CORTEX', 'AUDIT']),

  // ═══ RELIC (90–93) ═══
  item('relic-1', 'Multi-Provider Routing Matrix', 93, 'optimization', 'Intelligent request distribution across providers with cost-aware load balancing and failover.', ['NEXUS', 'BEACON', 'FAILSAFE']),
  item('relic-2', 'Temporal Anomaly Detector', 93, 'observability', 'Identifies time-series anomalies in system behavior using sub-threshold signal analysis.', ['BEACON', 'CORTEX', 'SHADOW']),
  item('relic-3', 'Immutable Audit Trail Generator', 92, 'governance', 'Produces tamper-proof audit chains with cryptographic verification for every cognitive operation.', ['AUDIT', 'GOVERNANCE', 'DEFENSE']),
  item('relic-4', 'Speculative Execution Guard', 92, 'security', 'Prevents side-channel leakage by sandboxing speculative cognitive paths and comparing outputs.', ['DEFENSE', 'SHADOW', 'CORTEX']),
  item('relic-5', 'Self-Healing Connection Pool', 91, 'resilience', 'Detects degraded connections, evicts them, and pre-warms replacements before demand spikes.', ['FAILSAFE', 'BEACON', 'EVOLUTION']),
  item('relic-6', 'Contextual Priority Scheduler', 91, 'optimization', 'Assigns execution priority based on real-time context, urgency signals, and resource availability.', ['AUTOMATON', 'NEXUS', 'CORTEX']),
  item('relic-7', 'Compliance Drift Monitor', 91, 'governance', 'Tracks policy adherence over time and alerts when organizational behavior drifts from compliance baselines.', ['GOVERNANCE', 'AUDIT', 'BEACON']),
  item('relic-8', 'Cognitive Load Balancer', 90, 'optimization', 'Distributes reasoning workload across available engines based on specialization affinity and current capacity.', ['NEXUS', 'CORTEX', 'AUTOMATON']),
  item('relic-9', 'Encrypted State Checkpoint', 90, 'security', 'Creates encrypted point-in-time snapshots of cognitive state for secure rollback and forensic analysis.', ['DEFENSE', 'FAILSAFE', 'AUDIT']),
  item('relic-10', 'Distributed Consensus Engine', 90, 'resilience', 'Achieves agreement across distributed substrate instances using lightweight Byzantine fault tolerance.', ['FAILSAFE', 'NEXUS', 'GOVERNANCE']),
  item('relic-11', 'Semantic Search Accelerator', 90, 'intelligence', 'High-speed semantic matching across Memory Stream with sub-10ms retrieval on million-entry indexes.', ['CORTEX', 'NEXUS', 'FORGE']),
  item('relic-12', 'Telemetry Compression Pipeline', 90, 'observability', 'Compresses observability data 40:1 while preserving anomaly detection sensitivity across all signal types.', ['BEACON', 'CORTEX', 'AUTOMATON']),

  // ═══ PRIME (80–89) ═══
  item('prime-1', 'Intelligent Cache Warmer', 89, 'optimization', 'Predicts upcoming data access patterns and pre-loads caches based on historical cognitive workflows.', ['CORTEX', 'NEXUS', 'AUTOMATON']),
  item('prime-2', 'Policy Violation Predictor', 89, 'governance', 'Forecasts potential policy violations before they occur using behavioral pattern analysis.', ['GOVERNANCE', 'CORTEX', 'AUDIT']),
  item('prime-3', 'Threat Surface Mapper', 88, 'security', 'Continuously maps the attack surface across all exposed interfaces and scores vulnerability severity.', ['DEFENSE', 'SHADOW', 'BEACON']),
  item('prime-4', 'Recovery Time Optimizer', 88, 'resilience', 'Reduces mean time to recovery by pre-computing rollback strategies and warm-starting failover paths.', ['FAILSAFE', 'BEACON', 'EVOLUTION']),
  item('prime-5', 'Decision Confidence Scorer', 87, 'intelligence', 'Assigns calibrated confidence scores to every decision output with explainable reasoning chains.', ['CORTEX', 'AUDIT', 'NEXUS']),
  item('prime-6', 'Real-Time Health Dashboard', 87, 'observability', 'Live operational health visualization with drill-down diagnostics for every Primitive.', ['BEACON', 'AUDIT', 'SHADOW']),
  item('prime-7', 'Dependency Cycle Breaker', 86, 'resilience', 'Identifies and resolves circular dependency chains that would otherwise cause deadlocks in substrate operations.', ['FAILSAFE', 'ARCHITECT', 'BEACON']),
  item('prime-8', 'Token Budget Controller', 86, 'optimization', 'Manages AI token consumption across providers with per-request budgets and overflow protection.', ['NEXUS', 'GOVERNANCE', 'AUTOMATON']),
  item('prime-9', 'Schema Evolution Manager', 85, 'governance', 'Handles backward-compatible schema migrations across cognitive data stores without downtime.', ['GOVERNANCE', 'EVOLUTION', 'AUDIT']),
  item('prime-10', 'Noise-Canceling Signal Filter', 85, 'observability', 'Removes false-positive alerts from telemetry streams using cognitive noise profiling.', ['BEACON', 'CORTEX', 'SHADOW']),
  item('prime-11', 'Input Sanitization Pipeline', 84, 'security', 'Multi-stage input cleaning that neutralizes injection attacks across all cognitive entry points.', ['DEFENSE', 'SHADOW', 'AUDIT']),
  item('prime-12', 'Reasoning Chain Tracer', 84, 'intelligence', 'Records and visualizes complete reasoning chains for any cognitive decision with step-by-step replay.', ['CORTEX', 'AUDIT', 'BEACON']),
  item('prime-13', 'Graceful Degradation Controller', 83, 'resilience', 'Progressively reduces functionality under resource pressure while maintaining critical-path operations.', ['FAILSAFE', 'BEACON', 'GOVERNANCE']),
  item('prime-14', 'Batch Processing Optimizer', 83, 'optimization', 'Groups compatible operations into efficient batches reducing total execution time by up to 60%.', ['AUTOMATON', 'NEXUS', 'CORTEX']),
  item('prime-15', 'Access Control Reconciler', 82, 'security', 'Continuously validates that runtime access permissions match declared policy configurations.', ['DEFENSE', 'GOVERNANCE', 'AUDIT']),
  item('prime-16', 'Cognitive Replay Engine', 82, 'intelligence', 'Replays past cognitive sessions for debugging, training, and regression testing of decision logic.', ['CORTEX', 'SHADOW', 'AUDIT']),
  item('prime-17', 'Structured Log Enricher', 81, 'observability', 'Adds semantic context, trace IDs, and causal links to raw log entries across all substrate components.', ['BEACON', 'AUDIT', 'CORTEX']),
  item('prime-18', 'Rate Limit Harmonizer', 81, 'governance', 'Coordinates rate limits across multiple providers to maximize throughput without triggering throttling.', ['GOVERNANCE', 'NEXUS', 'AUTOMATON']),
  item('prime-19', 'Memory Compaction Engine', 80, 'optimization', 'Compacts Memory Stream entries to reduce storage footprint while preserving semantic fidelity.', ['CORTEX', 'EVOLUTION', 'FORGE']),
  item('prime-20', 'Incident Correlation Engine', 80, 'observability', 'Links related incidents across time and subsystem boundaries to identify root cause patterns.', ['BEACON', 'CORTEX', 'AUDIT']),
  item('prime-21', 'Secret Rotation Scheduler', 80, 'security', 'Automates credential rotation with zero-downtime key transitions across all connected services.', ['DEFENSE', 'GOVERNANCE', 'AUTOMATON']),
  item('prime-22', 'Failover Rehearsal Simulator', 80, 'resilience', 'Runs non-destructive failover simulations to verify recovery procedures work before they are needed.', ['FAILSAFE', 'SHADOW', 'BEACON']),

  // ═══ MINT (68–79) ═══
  item('mint-1', 'Basic Request Validator', 79, 'security', 'Validates incoming request structure against defined schemas before processing begins.', ['DEFENSE', 'SHADOW']),
  item('mint-2', 'Simple Retry Handler', 79, 'resilience', 'Exponential backoff retry logic with configurable maximum attempts and jitter.', ['FAILSAFE', 'BEACON']),
  item('mint-3', 'Metric Aggregation Collector', 78, 'observability', 'Collects and aggregates basic system metrics into time-bucketed summaries.', ['BEACON', 'AUTOMATON']),
  item('mint-4', 'Configuration Linter', 78, 'governance', 'Validates configuration files against best-practice rules and flags common mistakes.', ['GOVERNANCE', 'AUDIT']),
  item('mint-5', 'Query Cost Estimator', 77, 'optimization', 'Estimates computational cost of queries before execution to prevent resource abuse.', ['NEXUS', 'CORTEX']),
  item('mint-6', 'Simple Decision Logger', 77, 'intelligence', 'Records decision inputs and outputs with timestamps for basic audit trails.', ['CORTEX', 'AUDIT']),
  item('mint-7', 'Timeout Enforcer', 76, 'resilience', 'Applies configurable timeouts to all external calls with clean cancellation semantics.', ['FAILSAFE', 'AUTOMATON']),
  item('mint-8', 'IP Allowlist Guard', 76, 'security', 'Restricts access to configured IP ranges with support for CIDR notation and dynamic updates.', ['DEFENSE', 'GOVERNANCE']),
  item('mint-9', 'Heartbeat Emitter', 75, 'observability', 'Sends regular health heartbeats with basic system status for uptime monitoring.', ['BEACON']),
  item('mint-10', 'Environment Config Loader', 75, 'governance', 'Loads and validates environment-specific configurations with type-safe defaults.', ['GOVERNANCE', 'AUTOMATON']),
  item('mint-11', 'Response Time Tracker', 74, 'optimization', 'Measures and records response times for all operations with percentile calculations.', ['BEACON', 'NEXUS']),
  item('mint-12', 'Error Rate Calculator', 74, 'observability', 'Computes rolling error rates across configurable windows for SLO monitoring.', ['BEACON', 'AUDIT']),
  item('mint-13', 'Input Length Limiter', 73, 'security', 'Enforces maximum input lengths across all text fields to prevent buffer-related issues.', ['DEFENSE']),
  item('mint-14', 'Simple Queue Worker', 73, 'optimization', 'Basic FIFO queue processor with dead-letter handling for failed items.', ['AUTOMATON', 'FAILSAFE']),
  item('mint-15', 'Version Tag Manager', 72, 'governance', 'Manages semantic version tags across artifact deployments with rollback support.', ['GOVERNANCE', 'EVOLUTION']),
  item('mint-16', 'Basic Anomaly Flagger', 72, 'intelligence', 'Flags values that deviate beyond configurable standard deviation thresholds.', ['CORTEX', 'BEACON']),
  item('mint-17', 'Connection Health Checker', 71, 'resilience', 'Periodic health checks on database and service connections with auto-reconnection.', ['FAILSAFE', 'BEACON']),
  item('mint-18', 'Request Deduplicator', 71, 'optimization', 'Prevents duplicate request processing using short-lived idempotency keys.', ['AUTOMATON', 'DEFENSE']),
  item('mint-19', 'Basic Auth Token Validator', 70, 'security', 'Validates JWT structure and expiration without full cryptographic verification.', ['DEFENSE']),
  item('mint-20', 'Log Level Router', 70, 'observability', 'Routes log entries to appropriate sinks based on severity level and source.', ['BEACON', 'AUTOMATON']),
  item('mint-21', 'Static Rule Enforcer', 69, 'governance', 'Applies hardcoded business rules to data mutations before persistence.', ['GOVERNANCE']),
  item('mint-22', 'Payload Size Guard', 69, 'optimization', 'Rejects oversized request payloads before they consume processing resources.', ['DEFENSE', 'AUTOMATON']),
  item('mint-23', 'Uptime Counter', 68, 'observability', 'Tracks cumulative uptime duration with basic availability percentage calculations.', ['BEACON']),
  item('mint-24', 'Cold Start Detector', 68, 'optimization', 'Identifies cold-start events in serverless functions and logs initialization timing.', ['BEACON', 'NEXUS']),
  item('mint-25', 'Naive Confidence Scorer', 68, 'intelligence', 'Assigns basic confidence scores using simple heuristic rules on output quality.', ['CORTEX']),
  item('mint-26', 'Basic Circuit Breaker', 68, 'resilience', 'Standard open/half-open/closed circuit breaker with configurable failure thresholds.', ['FAILSAFE']),
];
