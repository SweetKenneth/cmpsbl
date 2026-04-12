/**
 * CMPSBL® Capability Affinity System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Classifies uploaded software into archetypes, then selects
 * capabilities from a style-filtered, CJPI-weighted pool.
 *
 * Archetype detection → Style filtering → Weighted random selection
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — ARCHETYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type SoftwareArchetype = 'active' | 'passive' | 'hybrid';

export type CapabilityStyle = 'action' | 'passive' | 'universal';

export interface ArchetypeSignal {
  keyword: string;
  weight: number;
  archetype: SoftwareArchetype;
}

/**
 * Signals used to classify uploaded code into an archetype.
 * Each keyword carries a weighted vote toward an archetype.
 */
const ARCHETYPE_SIGNALS: ArchetypeSignal[] = [
  // Active signals — agents, bots, workers, scrapers
  { keyword: 'agent', weight: 3, archetype: 'active' },
  { keyword: 'bot', weight: 3, archetype: 'active' },
  { keyword: 'worker', weight: 2, archetype: 'active' },
  { keyword: 'scraper', weight: 2, archetype: 'active' },
  { keyword: 'crawler', weight: 2, archetype: 'active' },
  { keyword: 'cron', weight: 2, archetype: 'active' },
  { keyword: 'daemon', weight: 2, archetype: 'active' },
  { keyword: 'scheduler', weight: 2, archetype: 'active' },
  { keyword: 'polling', weight: 1.5, archetype: 'active' },
  { keyword: 'setInterval', weight: 1.5, archetype: 'active' },
  { keyword: 'while(true)', weight: 2, archetype: 'active' },
  { keyword: 'for(;;)', weight: 2, archetype: 'active' },
  { keyword: 'async function', weight: 1, archetype: 'active' },
  { keyword: 'await', weight: 0.5, archetype: 'active' },
  { keyword: 'fetch(', weight: 1, archetype: 'active' },
  { keyword: 'callLLM', weight: 2, archetype: 'active' },
  { keyword: 'openai', weight: 1.5, archetype: 'active' },
  { keyword: 'anthropic', weight: 1.5, archetype: 'active' },
  { keyword: 'research', weight: 1, archetype: 'active' },
  { keyword: 'execute', weight: 1, archetype: 'active' },
  { keyword: 'process(', weight: 1, archetype: 'active' },

  // Passive signals — UIs, auth screens, dashboards, static apps
  { keyword: 'render', weight: 2, archetype: 'passive' },
  { keyword: 'component', weight: 2, archetype: 'passive' },
  { keyword: 'useState', weight: 2, archetype: 'passive' },
  { keyword: 'useEffect', weight: 1.5, archetype: 'passive' },
  { keyword: 'onClick', weight: 1.5, archetype: 'passive' },
  { keyword: 'className', weight: 1, archetype: 'passive' },
  { keyword: '<form', weight: 2, archetype: 'passive' },
  { keyword: '<input', weight: 1.5, archetype: 'passive' },
  { keyword: '<button', weight: 1, archetype: 'passive' },
  { keyword: 'login', weight: 1.5, archetype: 'passive' },
  { keyword: 'auth', weight: 1.5, archetype: 'passive' },
  { keyword: 'dashboard', weight: 1.5, archetype: 'passive' },
  { keyword: 'template', weight: 1, archetype: 'passive' },
  { keyword: 'style', weight: 0.5, archetype: 'passive' },
  { keyword: 'css', weight: 0.5, archetype: 'passive' },
  { keyword: 'html', weight: 1, archetype: 'passive' },

  // Hybrid signals — APIs, middleware, pipelines
  { keyword: 'middleware', weight: 2, archetype: 'hybrid' },
  { keyword: 'router', weight: 1.5, archetype: 'hybrid' },
  { keyword: 'express', weight: 2, archetype: 'hybrid' },
  { keyword: 'fastify', weight: 2, archetype: 'hybrid' },
  { keyword: 'app.get', weight: 1.5, archetype: 'hybrid' },
  { keyword: 'app.post', weight: 1.5, archetype: 'hybrid' },
  { keyword: 'pipeline', weight: 2, archetype: 'hybrid' },
  { keyword: 'transform', weight: 1, archetype: 'hybrid' },
  { keyword: 'stream', weight: 1.5, archetype: 'hybrid' },
  { keyword: 'req, res', weight: 2, archetype: 'hybrid' },
  { keyword: 'endpoint', weight: 1.5, archetype: 'hybrid' },
  { keyword: 'handler', weight: 1, archetype: 'hybrid' },
];


// ═══════════════════════════════════════════════════════════════════════════════
// §2 — SUBSTRATE CAPABILITIES WITH STYLE TAGS
// ═══════════════════════════════════════════════════════════════════════════════

export interface SubstrateCapability {
  id: string;
  primitive: string;
  name: string;
  description: string;
  /** Which archetype styles this capability is compatible with */
  styles: CapabilityStyle[];
  /** Base CJPI affinity weight (higher = more likely to be selected) */
  baseWeight: number;
  /** What this capability adds, phrased for investors */
  investorValue: string;
}

export const SUBSTRATE_CAPABILITIES: SubstrateCapability[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ACTION-ONLY — Agents, bots, workers, scrapers
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'dream-states', primitive: 'DREAM', name: 'Autonomous Learning Cycles', description: 'Agent enters background DREAM states to consolidate learnings, discover optimization patterns, and self-improve between active sessions.', styles: ['action'], baseWeight: 92, investorValue: 'Agent improves autonomously — no human retraining required.' },
  { id: 'dream-replay', primitive: 'DREAM', name: 'Experience Replay Engine', description: 'Replays past execution traces during idle periods to extract missed patterns and reinforce successful strategies.', styles: ['action'], baseWeight: 85, investorValue: 'Learns from its own history — compounds intelligence over time.' },
  { id: 'dream-counterfactual', primitive: 'DREAM', name: 'Counterfactual Simulation', description: 'Generates "what if" scenarios from past decisions to evaluate alternative strategies without real-world cost.', styles: ['action'], baseWeight: 80, investorValue: 'Tests thousands of strategies offline before committing resources.' },
  { id: 'dream-consolidation', primitive: 'DREAM', name: 'Knowledge Consolidation Engine', description: 'Merges fragmented observations into unified mental models during idle cycles, reducing retrieval latency by 60%.', styles: ['action'], baseWeight: 78, investorValue: 'Agent builds coherent understanding — not just scattered facts.' },
  { id: 'nexus-routing', primitive: 'NEXUS', name: 'Model-Agnostic AI Routing', description: 'Routes each AI call to the optimal provider based on task type, latency, and cost. Automatic fallback across 12+ providers.', styles: ['action'], baseWeight: 95, investorValue: 'Zero vendor lock-in. Automatic cost optimization across all AI providers.' },
  { id: 'nexus-consensus', primitive: 'NEXUS', name: 'Multi-Model Consensus', description: 'Runs the same query across N providers and uses weighted voting to produce higher-confidence answers.', styles: ['action'], baseWeight: 88, investorValue: 'Higher accuracy than any single model — provably better outputs.' },
  { id: 'nexus-cost-ledger', primitive: 'NEXUS', name: 'AI Cost Ledger & Budget Gates', description: 'Real-time cost tracking per query with daily and hourly budget gates that prevent overspend.', styles: ['action'], baseWeight: 90, investorValue: 'AI spend is capped and tracked to the cent — no surprise bills.' },
  { id: 'nexus-provider-health', primitive: 'NEXUS', name: 'Provider Health Monitor', description: 'Continuously probes provider latency, error rates, and capacity to route away from degraded endpoints before failures occur.', styles: ['action'], baseWeight: 83, investorValue: 'Zero downtime from provider outages — automatic rerouting in milliseconds.' },
  { id: 'memory-persistence', primitive: 'MEMORY', name: 'Persistent Semantic Memory', description: 'Agent remembers past interactions, research, and decisions across sessions with TTL-controlled retention.', styles: ['action'], baseWeight: 90, investorValue: 'Eliminates redundant API calls. Up to 90% cost reduction on repeated work.' },
  { id: 'memory-associative', primitive: 'MEMORY', name: 'Associative Recall Network', description: 'Hebbian-style associative memory that strengthens connections between frequently co-activated concepts.', styles: ['action'], baseWeight: 82, investorValue: 'Agent builds intuition — recalls related concepts without explicit search.' },
  { id: 'memory-forgetting', primitive: 'MEMORY', name: 'Governed Forgetting Policy', description: 'Automatically expires low-value memories while preserving high-CJPI insights. Prevents unbounded memory growth.', styles: ['action'], baseWeight: 76, investorValue: 'Memory stays lean and relevant — no storage bloat, no stale data.' },
  { id: 'memory-episodic', primitive: 'MEMORY', name: 'Episodic Memory Indexing', description: 'Indexes complete interaction episodes with temporal markers, enabling precise recall of past decisions and their outcomes.', styles: ['action'], baseWeight: 79, investorValue: 'Agent recalls exact situations — learns from specific past experiences.' },
  { id: 'echo-amplification', primitive: 'ECHO', name: 'Signal Pattern Amplification', description: 'Detects recurring patterns in agent behavior and amplifies successful strategies while dampening failure patterns.', styles: ['action'], baseWeight: 78, investorValue: 'Agent gets measurably better over time through pattern recognition.' },
  { id: 'echo-cross-node', primitive: 'ECHO', name: 'Cross-Node Signal Correlation', description: 'Detects hidden relationships between signals across different primitives that no single node could find alone.', styles: ['action'], baseWeight: 74, investorValue: 'Discovers emergent behaviors — the whole is greater than the parts.' },
  { id: 'echo-resonance', primitive: 'ECHO', name: 'Feedback Resonance Tuning', description: 'Auto-tunes feedback loop gain to prevent runaway amplification while maximizing signal extraction from weak patterns.', styles: ['action'], baseWeight: 72, investorValue: 'Self-calibrating feedback loops — stable learning without manual tuning.' },
  { id: 'oracle-prediction', primitive: 'ORACLE', name: 'Predictive Task Planning', description: 'Bayesian prediction network anticipates likely next tasks and pre-fetches resources, reducing latency by 40-60%.', styles: ['action'], baseWeight: 82, investorValue: 'Agents anticipate what is needed next — faster response, lower cost.' },
  { id: 'oracle-scenario', primitive: 'ORACLE', name: 'Monte Carlo Scenario Simulation', description: 'Runs thousands of probabilistic simulations to evaluate strategy outcomes before committing resources.', styles: ['action'], baseWeight: 79, investorValue: 'Data-driven decision making — reduces risk on high-stakes actions.' },
  { id: 'oracle-anomaly', primitive: 'ORACLE', name: 'Anomaly Prediction & Early Warning', description: 'Detects statistical anomalies in operational data and issues alerts before failures materialize.', styles: ['action'], baseWeight: 77, investorValue: 'Prevents outages by catching problems before they happen.' },
  { id: 'oracle-causal', primitive: 'ORACLE', name: 'Causal Inference Engine', description: 'Distinguishes correlation from causation in agent telemetry to identify root causes, not just symptoms.', styles: ['action'], baseWeight: 75, investorValue: 'Fixes root causes — not symptoms. Reduces repeat incidents by 80%.' },
  { id: 'cortex-orchestration', primitive: 'CORTEX', name: 'Multi-Step Task Orchestration', description: 'DAG-based execution engine decomposes complex goals into parallel sub-tasks with dependency resolution.', styles: ['action'], baseWeight: 88, investorValue: 'Complex workflows execute in parallel — 3-5x faster than sequential.' },
  { id: 'cortex-resource', primitive: 'CORTEX', name: 'Dynamic Resource Allocation', description: 'Allocates compute, memory, and API quotas across concurrent tasks based on priority and deadline constraints.', styles: ['action'], baseWeight: 83, investorValue: 'Optimal resource usage — no waste, no contention, no bottlenecks.' },
  { id: 'cortex-planning', primitive: 'CORTEX', name: 'Hierarchical Goal Decomposition', description: 'Breaks high-level objectives into executable sub-goals with automatic progress tracking and re-planning on failure.', styles: ['action'], baseWeight: 81, investorValue: 'Complex goals handled automatically — agent plans like a senior engineer.' },
  { id: 'harvest-data', primitive: 'HARVEST', name: 'Autonomous Data Ingestion', description: 'Thermal-aware crawler swarm discovers and ingests relevant data sources with DNA-profiling for quality.', styles: ['action'], baseWeight: 75, investorValue: 'Agent builds its own knowledge base from the live web.' },
  { id: 'harvest-quality', primitive: 'HARVEST', name: 'Data Quality Scoring', description: 'Every ingested data source receives a quality DNA profile — freshness, authority, completeness, bias detection.', styles: ['action'], baseWeight: 73, investorValue: 'Only high-quality data enters the pipeline — garbage in, garbage blocked.' },
  { id: 'harvest-dedup', primitive: 'HARVEST', name: 'Semantic Deduplication', description: 'Detects semantically equivalent data across sources using embedding similarity, preventing knowledge base bloat.', styles: ['action'], baseWeight: 70, investorValue: 'Clean knowledge base — no duplicate information clouding decisions.' },
  { id: 'brain-reasoning', primitive: 'BRAIN', name: 'Causal Reasoning Engine', description: 'Multi-turn reasoning graph tracks causal chains to understand why outcomes occurred, not just what happened.', styles: ['action'], baseWeight: 91, investorValue: 'Agent understands cause and effect — makes better decisions over time.' },
  { id: 'brain-context', primitive: 'BRAIN', name: 'Context Window Manager', description: 'Token-budget-aware context prioritization ensures the most relevant information fits within model limits.', styles: ['action'], baseWeight: 86, investorValue: 'No context overflow — the right information always reaches the model.' },
  { id: 'brain-metacognition', primitive: 'BRAIN', name: 'Metacognitive Self-Assessment', description: 'Agent evaluates its own confidence levels and escalates to human review when uncertainty exceeds thresholds.', styles: ['action'], baseWeight: 84, investorValue: 'Knows when it does not know — prevents costly false-confidence errors.' },
  { id: 'brain-chain-of-thought', primitive: 'BRAIN', name: 'Structured Chain-of-Thought', description: 'Enforces structured reasoning chains with intermediate verification steps, catching logical errors before final output.', styles: ['action'], baseWeight: 80, investorValue: 'Transparent reasoning — every conclusion is auditable and explainable.' },
  { id: 'phantom-stealth', primitive: 'PHANTOM', name: 'Stealth Operation Mode', description: 'Executes sensitive operations with minimal footprint — no external logging, encrypted in-memory state, ephemeral traces.', styles: ['action'], baseWeight: 70, investorValue: 'Handles sensitive data with zero data leakage risk.' },
  { id: 'phantom-deception', primitive: 'PHANTOM', name: 'Honeypot Trap Detection', description: 'Identifies adversarial honeypot endpoints and poisoned data sources before the agent interacts with them.', styles: ['action'], baseWeight: 68, investorValue: 'Agent cannot be tricked by adversarial data sources.' },
  { id: 'phantom-fingerprint', primitive: 'PHANTOM', name: 'Request Fingerprint Masking', description: 'Randomizes request signatures, timing patterns, and metadata to prevent behavioral fingerprinting by adversaries.', styles: ['action'], baseWeight: 66, investorValue: 'Agent operations cannot be profiled or predicted by competitors.' },
  { id: 'lingua-translation', primitive: 'LINGUA', name: 'Real-Time Multilingual Processing', description: 'Processes inputs in 40+ languages with automatic detection, translation, and culturally-aware response generation.', styles: ['action'], baseWeight: 76, investorValue: 'One agent serves global markets — no per-language deployment needed.' },
  { id: 'lingua-code-polyglot', primitive: 'LINGUA', name: 'Code Language Translation', description: 'Translates code semantics across programming languages while preserving algorithmic intent and idiomatic patterns.', styles: ['action'], baseWeight: 73, investorValue: 'One codebase intelligence works across all programming languages.' },
  { id: 'nerve-signal', primitive: 'NERVE', name: 'Priority Signal Routing', description: 'Routes internal signals by urgency — critical alerts bypass queue, low-priority tasks batch efficiently.', styles: ['action'], baseWeight: 72, investorValue: 'Critical events never wait in line — instant response when it matters.' },
  { id: 'nerve-backpressure', primitive: 'NERVE', name: 'Adaptive Backpressure Control', description: 'Detects overload conditions and applies graduated backpressure to prevent cascade failures across the signal graph.', styles: ['action'], baseWeight: 69, investorValue: 'System stays stable under load — never overwhelmed by burst traffic.' },
  { id: 'compass-intent', primitive: 'COMPASS', name: 'Intent Disambiguation Engine', description: 'Resolves ambiguous user intents through multi-strategy classification with confidence scoring.', styles: ['action'], baseWeight: 81, investorValue: 'Understands what users actually mean — fewer clarification loops.' },
  { id: 'compass-goal-alignment', primitive: 'COMPASS', name: 'Goal Alignment Validator', description: 'Continuously validates that agent actions align with stated objectives, flagging drift before it compounds.', styles: ['action'], baseWeight: 77, investorValue: 'Agent stays on target — catches goal drift before resources are wasted.' },
  { id: 'sandbox-isolation', primitive: 'SANDBOX', name: 'Sandboxed Code Execution', description: 'Executes untrusted code in isolated environments with resource limits, network restrictions, and automatic cleanup.', styles: ['action'], baseWeight: 79, investorValue: 'Runs third-party code safely — zero risk to host environment.' },
  { id: 'sandbox-artifact', primitive: 'SANDBOX', name: 'Artifact Generation Sandbox', description: 'Isolated environment for generating files, images, and documents with output validation and size limits.', styles: ['action'], baseWeight: 74, investorValue: 'Safe artifact generation — outputs verified before delivery.' },
  { id: 'ripple-propagation', primitive: 'RIPPLE', name: 'Change Impact Propagation', description: 'Traces the downstream impact of any change across the dependency graph before it executes.', styles: ['action'], baseWeight: 71, investorValue: 'See the blast radius of every change before it happens.' },
  { id: 'ripple-dependency', primitive: 'RIPPLE', name: 'Dependency Chain Analysis', description: 'Maps transitive dependency chains to identify fragile paths, single points of failure, and upgrade risks.', styles: ['action'], baseWeight: 68, investorValue: 'No hidden dependencies — every risk surface is visible.' },

  // ═══════════════════════════════════════════════════════════════════════════
  // PASSIVE-ONLY — UIs, dashboards, auth screens, static apps
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'identity-binding', primitive: 'IDENTITY', name: 'Session Identity Binding', description: 'Binds authenticated sessions with fingerprinting, device attestation, and behavioral biometrics.', styles: ['passive'], baseWeight: 88, investorValue: 'Enterprise-grade auth hardening with zero additional code.' },
  { id: 'identity-mfa', primitive: 'IDENTITY', name: 'Adaptive Multi-Factor Auth', description: 'Risk-scored MFA that escalates verification requirements based on behavioral anomalies and device trust.', styles: ['passive'], baseWeight: 84, investorValue: 'Smart MFA — only challenges users when risk is detected.' },
  { id: 'identity-sso', primitive: 'IDENTITY', name: 'Enterprise SSO Bridge', description: 'Pre-built SAML/OIDC connectors for enterprise identity providers with just-in-time user provisioning.', styles: ['passive'], baseWeight: 82, investorValue: 'Enterprise sales close faster — SSO is table stakes.' },
  { id: 'identity-passkey', primitive: 'IDENTITY', name: 'Passkey & WebAuthn Integration', description: 'FIDO2-compliant passwordless authentication with biometric verification and hardware key support.', styles: ['passive'], baseWeight: 79, investorValue: 'Passwordless auth — higher security, better conversion rates.' },
  { id: 'vision-accessibility', primitive: 'VISION', name: 'Accessibility Compliance Scanner', description: 'Continuous WCAG 2.1 AA scanning with auto-fix suggestions for color contrast, focus traps, and ARIA labels.', styles: ['passive'], baseWeight: 80, investorValue: 'Automatic ADA compliance — avoids lawsuits ($50K+ per violation).' },
  { id: 'vision-performance', primitive: 'VISION', name: 'Visual Performance Profiler', description: 'Monitors Core Web Vitals in real-time with automatic lazy-loading injection and render optimization.', styles: ['passive'], baseWeight: 77, investorValue: 'Faster pages = higher conversion. Automatic performance optimization.' },
  { id: 'vision-responsive', primitive: 'VISION', name: 'Responsive Breakpoint Validator', description: 'Tests every component across 8 viewport sizes and flags layout breaks, overflow, and touch-target violations.', styles: ['passive'], baseWeight: 74, investorValue: 'Every screen size works perfectly — no manual QA needed.' },
  { id: 'vision-heatmap', primitive: 'VISION', name: 'Interaction Heatmap Engine', description: 'Tracks click, scroll, and hover patterns to surface dead zones and high-engagement areas without third-party tools.', styles: ['passive'], baseWeight: 71, investorValue: 'Know exactly where users engage — data-driven UI optimization.' },
  { id: 'inclusive-i18n', primitive: 'INCLUSIVE', name: 'Inclusive Internationalization', description: 'RTL layout support, cultural sensitivity checks, and automated translation pipeline for 40+ locales.', styles: ['passive'], baseWeight: 72, investorValue: 'Instant global market access without localization teams.' },
  { id: 'inclusive-contrast', primitive: 'INCLUSIVE', name: 'High Contrast & Dyslexia Mode', description: 'Automatic alternative rendering modes for users with visual impairments, color blindness, and dyslexia.', styles: ['passive'], baseWeight: 69, investorValue: 'Serves 15% more users — accessibility is a market advantage.' },
  { id: 'inclusive-screen-reader', primitive: 'INCLUSIVE', name: 'Screen Reader Optimization', description: 'Automatic ARIA landmark injection, live region management, and semantic heading hierarchy enforcement.', styles: ['passive'], baseWeight: 67, investorValue: 'Full screen reader compatibility — no manual ARIA markup needed.' },
  { id: 'relay-realtime', primitive: 'RELAY', name: 'Real-Time State Sync', description: 'WebSocket-backed state synchronization across browser tabs, devices, and server with conflict resolution.', styles: ['passive'], baseWeight: 85, investorValue: 'Multi-device, real-time experience with zero custom infrastructure.' },
  { id: 'relay-offline', primitive: 'RELAY', name: 'Offline-First Data Layer', description: 'Service Worker cache with background sync — app works fully offline and reconciles on reconnection.', styles: ['passive'], baseWeight: 80, investorValue: 'App works without internet — critical for field workers and travel.' },
  { id: 'relay-optimistic', primitive: 'RELAY', name: 'Optimistic Update Pipeline', description: 'Instant UI updates with background server reconciliation and automatic conflict resolution on failure.', styles: ['passive'], baseWeight: 76, investorValue: 'UI feels instant — updates appear before the server confirms.' },
  { id: 'integration-bridge', primitive: 'INTEGRATION', name: 'External Service Bridge', description: 'Pre-built connectors for 50+ SaaS services with OAuth flow management and webhook orchestration.', styles: ['passive'], baseWeight: 78, investorValue: 'Plugs into existing business tools without custom integration work.' },
  { id: 'integration-embed', primitive: 'INTEGRATION', name: 'Embeddable Widget Export', description: 'Generates iframe-embeddable and Web Component versions of any UI for third-party site integration.', styles: ['passive'], baseWeight: 73, investorValue: 'Your UI lives inside partner sites — distribution without app stores.' },
  { id: 'atlas-mapping', primitive: 'ATLAS', name: 'Component Dependency Atlas', description: 'Live dependency map of every component, prop, and state flow — detects orphaned code and circular dependencies.', styles: ['passive'], baseWeight: 71, investorValue: 'Developers understand the full system — onboarding drops from weeks to days.' },
  { id: 'atlas-complexity', primitive: 'ATLAS', name: 'Complexity Hotspot Detection', description: 'Identifies components with excessive coupling, deep prop drilling, and high cyclomatic complexity for refactoring.', styles: ['passive'], baseWeight: 68, investorValue: 'Tech debt surfaced automatically — fix the worst spots first.' },
  { id: 'medic-healthcheck', primitive: 'MEDIC', name: 'Runtime Health Diagnostics', description: 'Continuous health checks on memory usage, render performance, and error rates with automatic degradation alerts.', styles: ['passive'], baseWeight: 75, investorValue: 'Know when your app is sick before users notice.' },
  { id: 'medic-memory-leak', primitive: 'MEDIC', name: 'Memory Leak Detection', description: 'Tracks heap growth patterns and detached DOM nodes to identify memory leaks before they cause crashes.', styles: ['passive'], baseWeight: 72, investorValue: 'No more tab crashes — memory leaks caught and reported automatically.' },
  { id: 'system-telemetry', primitive: 'SYSTEM', name: 'Structured Telemetry Pipeline', description: 'Automatic instrumentation of user flows, error boundaries, and performance metrics with zero-config dashboards.', styles: ['passive'], baseWeight: 79, investorValue: 'Full observability from day one — no instrumentation work required.' },
  { id: 'system-feature-flags', primitive: 'SYSTEM', name: 'Feature Flag Management', description: 'Runtime feature toggles with percentage rollouts, user targeting, and automatic kill-switches on error spike.', styles: ['passive'], baseWeight: 76, investorValue: 'Ship features safely — instant rollback without redeployment.' },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIVERSAL — Compatible with all archetypes
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'defense-scoring', primitive: 'DEFENSE', name: 'Threat Detection & Rate Limiting', description: 'O(1) trie-based threat scoring on every request. Prompt injection, abuse patterns, and DDoS protection.', styles: ['action', 'passive', 'universal'], baseWeight: 96, investorValue: 'Enterprise security layer. Every input scored before execution.' },
  { id: 'defense-injection', primitive: 'DEFENSE', name: 'Injection Attack Prevention', description: 'SQL, XSS, SSRF, and prompt injection detection with automatic sanitization and alert escalation.', styles: ['action', 'passive', 'universal'], baseWeight: 94, investorValue: 'Blocks the OWASP Top 10 — structural security, not afterthought patches.' },
  { id: 'defense-anomaly', primitive: 'DEFENSE', name: 'Behavioral Anomaly Detection', description: 'Machine-learned baseline of normal usage patterns. Flags deviations that indicate compromise or abuse.', styles: ['action', 'passive', 'universal'], baseWeight: 87, investorValue: 'Catches novel attacks that signature-based systems miss.' },
  { id: 'governance-policy', primitive: 'GOVERNANCE', name: 'Policy & Cost Governance', description: 'Enforces per-operation cost budgets, content policies, and compliance rules before any action executes.', styles: ['action', 'passive', 'universal'], baseWeight: 93, investorValue: 'Structural cost control and compliance — not just prompt instructions.' },
  { id: 'governance-consent', primitive: 'GOVERNANCE', name: 'Data Consent Management', description: 'GDPR/CCPA-compliant consent tracking with automatic data retention policies and right-to-deletion support.', styles: ['action', 'passive', 'universal'], baseWeight: 85, investorValue: 'Privacy compliance built-in — avoids 4% of revenue GDPR fines.' },
  { id: 'governance-content', primitive: 'GOVERNANCE', name: 'Content Safety Policy Engine', description: 'Configurable content policies that block harmful, biased, or prohibited outputs before they reach users.', styles: ['action', 'passive', 'universal'], baseWeight: 89, investorValue: 'Brand safety guaranteed — no harmful AI outputs reach production.' },
  { id: 'audit-chain', primitive: 'AUDIT', name: 'Hash-Chained Audit Trail', description: 'Every operation logged in a tamper-proof, hash-chained audit ledger with cryptographic integrity verification.', styles: ['action', 'passive', 'universal'], baseWeight: 91, investorValue: 'Enterprise compliance ready. SOC 2, HIPAA audit requirements met.' },
  { id: 'audit-forensic', primitive: 'AUDIT', name: 'Forensic Event Reconstruction', description: 'Replays any historical event sequence with full context — who did what, when, and what state the system was in.', styles: ['action', 'passive', 'universal'], baseWeight: 83, investorValue: 'Complete incident investigation in minutes, not days.' },
  { id: 'audit-compliance', primitive: 'AUDIT', name: 'Automated Compliance Reporting', description: 'Generates SOC 2, HIPAA, and ISO 27001 evidence reports automatically from the audit chain.', styles: ['action', 'passive', 'universal'], baseWeight: 81, investorValue: 'Compliance audits become push-button — saves $100K+ in annual prep.' },
  { id: 'immunity-healing', primitive: 'IMMUNITY', name: 'Self-Healing Error Recovery', description: 'Autonomous repair cycles detect degradation, isolate failures, and apply governed patches in shadow mode.', styles: ['action', 'passive', 'universal'], baseWeight: 86, investorValue: 'Software that fixes itself. 99.99% uptime without on-call engineers.' },
  { id: 'immunity-vaccination', primitive: 'IMMUNITY', name: 'Pattern Vaccination Registry', description: 'Records every failure pattern and inoculates the system against recurrence — same bug never hits twice.', styles: ['action', 'passive', 'universal'], baseWeight: 82, investorValue: 'Every failure makes the system stronger — anti-fragile by design.' },
  { id: 'immunity-quarantine', primitive: 'IMMUNITY', name: 'Fault Quarantine & Isolation', description: 'Instantly isolates failing components to prevent cascade failures while maintaining service on healthy paths.', styles: ['action', 'passive', 'universal'], baseWeight: 80, investorValue: 'One bug never takes down the whole system — blast radius contained.' },
  { id: 'reflex-recovery', primitive: 'REFLEX', name: 'Instant Failure Response', description: 'Sub-millisecond circuit breakers, automatic retry with exponential backoff, and graceful degradation paths.', styles: ['action', 'passive', 'universal'], baseWeight: 84, investorValue: 'Never crashes. Degrades gracefully under any failure condition.' },
  { id: 'reflex-fallback', primitive: 'REFLEX', name: 'Cascading Fallback Chains', description: 'Multi-tier fallback strategies — cached response, degraded mode, static page — ensuring users always see something.', styles: ['action', 'passive', 'universal'], baseWeight: 78, investorValue: 'Users never see a blank page — always a graceful fallback.' },
  { id: 'evolution-mutation', primitive: 'EVOLUTION', name: 'Governed Self-Improvement', description: 'AI-proposed code mutations validated through a 7-gate SEBA pipeline before promotion to production.', styles: ['action', 'passive', 'universal'], baseWeight: 80, investorValue: 'Software evolves itself — safely, with human approval gates.' },
  { id: 'evolution-techdebt', primitive: 'EVOLUTION', name: 'Technical Debt Detection', description: 'SEBA pipeline identifies code smells, outdated patterns, and architectural drift with ~85% accuracy.', styles: ['action', 'passive', 'universal'], baseWeight: 77, investorValue: 'Tech debt found and fixed continuously — not during painful rewrites.' },
  { id: 'evolution-rollback', primitive: 'EVOLUTION', name: 'Hash-Chained Rollback Ledger', description: 'Every mutation is recorded in a cryptographic ledger. Any change can be rolled back to any previous state instantly.', styles: ['action', 'passive', 'universal'], baseWeight: 79, investorValue: 'Fearless deployments — any change is instantly reversible.' },
  { id: 'shadow-testing', primitive: 'SHADOW', name: 'Shadow Environment A/B Testing', description: 'Runs mutations in an isolated parallel environment, comparing behavior against production before promotion.', styles: ['action', 'passive', 'universal'], baseWeight: 83, investorValue: 'Every change is tested against real traffic before going live.' },
  { id: 'shadow-replay', primitive: 'SHADOW', name: 'Production Traffic Replay', description: 'Replays real production traffic through candidate changes to validate behavior at scale before deployment.', styles: ['action', 'passive', 'universal'], baseWeight: 78, investorValue: 'Test with real data patterns — not synthetic test cases.' },
  { id: 'treaty-contract', primitive: 'TREATY', name: 'Inter-Service Contract Enforcement', description: 'Enforces typed contracts between services with automatic versioning and backward compatibility checks.', styles: ['action', 'passive', 'universal'], baseWeight: 76, investorValue: 'APIs never break — contracts enforced at the boundary.' },
  { id: 'treaty-sla', primitive: 'TREATY', name: 'SLA Monitoring & Enforcement', description: 'Tracks latency, uptime, and throughput SLAs with automatic alerting when commitments are at risk.', styles: ['action', 'passive', 'universal'], baseWeight: 74, investorValue: 'SLA violations caught before they breach — protects customer trust.' },
  { id: 'sovereign-encryption', primitive: 'SOVEREIGN', name: 'Data Sovereignty & Encryption', description: 'AES-256 encryption at rest and in transit with configurable data residency rules for regional compliance.', styles: ['action', 'passive', 'universal'], baseWeight: 88, investorValue: 'Enterprise data security — meets government-grade requirements.' },
  { id: 'sovereign-isolation', primitive: 'SOVEREIGN', name: 'Tenant Data Isolation', description: 'Cryptographic tenant isolation ensures one customer can never access another customer data — even in shared infra.', styles: ['action', 'passive', 'universal'], baseWeight: 85, investorValue: 'Multi-tenant safety — critical for B2B SaaS.' },
  { id: 'core-lifecycle', primitive: 'CORE', name: 'Lifecycle State Machine', description: 'Deterministic state management with validated transitions, preventing invalid states and race conditions.', styles: ['action', 'passive', 'universal'], baseWeight: 81, investorValue: 'No impossible states — the system cannot enter invalid configurations.' },
  { id: 'access-rbac', primitive: 'ACCESS', name: 'Role-Based Access Control', description: 'Fine-grained RBAC with attribute-based policies, resource-level permissions, and dynamic role escalation.', styles: ['action', 'passive', 'universal'], baseWeight: 87, investorValue: 'Enterprise authorization model — every action permission-checked.' },
  { id: 'access-api-key', primitive: 'ACCESS', name: 'API Key Lifecycle Management', description: 'Scoped API keys with automatic rotation, rate limiting, usage tracking, and instant revocation.', styles: ['action', 'passive', 'universal'], baseWeight: 82, investorValue: 'Developer-friendly API access with enterprise security controls.' },
  { id: 'conscience-ethics', primitive: 'CONSCIENCE', name: 'Ethical Decision Framework', description: 'Evaluates actions against configurable ethical guidelines — bias detection, fairness scoring, and harm prevention.', styles: ['action', 'passive', 'universal'], baseWeight: 75, investorValue: 'Responsible AI by design — not a PR statement, a runtime check.' },
  { id: 'forge-packaging', primitive: 'FORGE', name: 'Standalone Package Export', description: 'Exports the enhanced software as a deployable package with convex-core, documentation, and test harness.', styles: ['action', 'passive', 'universal'], baseWeight: 89, investorValue: 'Runs independently — no platform dependency. Full portability guarantee.' },
  { id: 'forge-hardening', primitive: 'FORGE', name: 'Production Hardening Suite', description: 'FNV-1a hash chain sealing, generation budgets, import allowlist enforcement, and path traversal prevention.', styles: ['action', 'passive', 'universal'], baseWeight: 86, investorValue: 'Hardened against supply chain attacks and code injection.' },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPANDED ASCENSION CAPABILITIES — Data, ML, DevOps, API, Performance
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Data Pipeline & ETL ──
  { id: 'harvest-schema-inference', primitive: 'HARVEST', name: 'Schema Inference Engine', description: 'Automatically infers data schemas from sample payloads with type narrowing and nullable detection.', styles: ['action', 'universal'], baseWeight: 74, investorValue: 'No manual schema definitions — types inferred from real data.' },
  { id: 'harvest-lineage', primitive: 'HARVEST', name: 'Data Lineage Tracker', description: 'Traces data provenance from source to consumer — every transformation, join, and aggregation is recorded.', styles: ['action', 'universal'], baseWeight: 76, investorValue: 'Full data traceability — know exactly where every value came from.' },
  { id: 'harvest-freshness', primitive: 'HARVEST', name: 'Staleness Detection Gate', description: 'Monitors data freshness with configurable TTL alerts — blocks stale data from entering decision pipelines.', styles: ['action'], baseWeight: 71, investorValue: 'Never make decisions on stale data — freshness is enforced structurally.' },
  { id: 'harvest-sampling', primitive: 'HARVEST', name: 'Stratified Data Sampling', description: 'Intelligent sampling for large datasets — preserves statistical distributions while reducing processing volume by 90%.', styles: ['action'], baseWeight: 68, investorValue: 'Process 10x less data with the same statistical accuracy.' },

  // ── ML/AI Model Governance ──
  { id: 'brain-model-drift', primitive: 'BRAIN', name: 'Model Drift Detection', description: 'Monitors input/output distributions to detect when ML models degrade — KL divergence and PSI scoring.', styles: ['action', 'universal'], baseWeight: 83, investorValue: 'Models never silently degrade — drift caught before user impact.' },
  { id: 'brain-prompt-shield', primitive: 'BRAIN', name: 'Prompt Injection Firewall', description: 'Multi-layer prompt injection detection — canary tokens, instruction boundary analysis, and semantic intent verification.', styles: ['action', 'universal'], baseWeight: 90, investorValue: 'LLM-powered apps protected from the #1 AI security vulnerability.' },
  { id: 'brain-hallucination-check', primitive: 'BRAIN', name: 'Hallucination Detection Gate', description: 'Cross-references LLM outputs against grounding sources — flags unverifiable claims before they reach users.', styles: ['action'], baseWeight: 87, investorValue: 'AI outputs you can trust — hallucinations caught at the boundary.' },
  { id: 'brain-token-budget', primitive: 'BRAIN', name: 'Token Budget Optimizer', description: 'Dynamic context compression that preserves semantic density while fitting within token limits — 40% cost reduction.', styles: ['action'], baseWeight: 82, investorValue: 'Same quality AI outputs at 40% lower cost — automatic optimization.' },
  { id: 'brain-embedding-cache', primitive: 'BRAIN', name: 'Embedding Cache Layer', description: 'Caches frequently accessed embeddings with LRU eviction — eliminates redundant embedding API calls.', styles: ['action'], baseWeight: 75, investorValue: 'Embedding costs drop 80% — cache hit rates exceed 90% for common queries.' },

  // ── Infrastructure & DevOps ──
  { id: 'failsafe-canary', primitive: 'FAILSAFE', name: 'Canary Deployment Gate', description: 'Routes 1% of traffic to new versions with automatic rollback on error rate spike — safe deployments by default.', styles: ['action', 'passive', 'universal'], baseWeight: 84, investorValue: 'Zero-risk deployments — bad versions never reach 99% of users.' },
  { id: 'failsafe-chaos', primitive: 'FAILSAFE', name: 'Chaos Engineering Probes', description: 'Controlled failure injection — random latency, partial outages, resource exhaustion — to validate resilience claims.', styles: ['action', 'universal'], baseWeight: 78, investorValue: 'Know your system survives failures — tested, not assumed.' },
  { id: 'failsafe-dependency-health', primitive: 'FAILSAFE', name: 'Dependency Health Monitor', description: 'Continuous health probing of every external dependency with automatic circuit-opening on degradation.', styles: ['action', 'passive', 'universal'], baseWeight: 80, investorValue: 'Third-party outages never cascade into your system.' },
  { id: 'failsafe-graceful-shutdown', primitive: 'FAILSAFE', name: 'Graceful Shutdown Orchestrator', description: 'Coordinates drain sequences — stops accepting new work, completes in-flight operations, then exits cleanly.', styles: ['action', 'universal'], baseWeight: 76, investorValue: 'Zero dropped requests during deployments — every operation completes.' },
  { id: 'beacon-resource-profiler', primitive: 'BEACON', name: 'Resource Utilization Profiler', description: 'Tracks CPU, memory, file descriptors, and connection pools per function — identifies resource hogs.', styles: ['action', 'passive', 'universal'], baseWeight: 77, investorValue: 'Know exactly which functions consume the most resources.' },
  { id: 'beacon-distributed-trace', primitive: 'BEACON', name: 'Distributed Trace Correlation', description: 'Propagates trace IDs across service boundaries with automatic span creation and parent-child linking.', styles: ['action', 'universal'], baseWeight: 81, investorValue: 'Trace any request across 50 microservices in one view.' },
  { id: 'beacon-error-budget', primitive: 'BEACON', name: 'Error Budget Tracking', description: 'SRE-style error budget tracking — alerts when remaining budget drops below threshold, blocks risky deploys.', styles: ['action', 'passive', 'universal'], baseWeight: 79, investorValue: 'Data-driven reliability — deploy only when error budget allows.' },

  // ── API Lifecycle ──
  { id: 'treaty-versioning', primitive: 'TREATY', name: 'Semantic API Versioning', description: 'Automatic breaking change detection with semver-compliant version bumps and migration guide generation.', styles: ['action', 'passive', 'universal'], baseWeight: 73, investorValue: 'API consumers never surprised by breaking changes.' },
  { id: 'treaty-rate-shaping', primitive: 'TREATY', name: 'Adaptive Rate Shaping', description: 'Dynamic rate limits that adjust based on client tier, time of day, and system load — fair sharing under pressure.', styles: ['action', 'universal'], baseWeight: 75, investorValue: 'Premium clients get priority — free tier automatically throttled under load.' },
  { id: 'treaty-deprecation', primitive: 'TREATY', name: 'Deprecation Lifecycle Manager', description: 'Tracks API deprecation timelines with automatic client notification and usage migration analytics.', styles: ['action', 'passive', 'universal'], baseWeight: 70, investorValue: 'Sunset old APIs cleanly — know exactly who still uses deprecated endpoints.' },
  { id: 'treaty-schema-validation', primitive: 'TREATY', name: 'Request/Response Schema Validation', description: 'JSON Schema validation at every API boundary with detailed error messages and automatic documentation sync.', styles: ['action', 'passive', 'universal'], baseWeight: 77, investorValue: 'Malformed requests caught at the door — no invalid data reaches business logic.' },

  // ── Security Deep-Dive ──
  { id: 'defense-supply-chain', primitive: 'DEFENSE', name: 'Supply Chain Audit', description: 'Scans dependency trees for known CVEs, typosquatting, and maintainer trust scores with automatic pinning.', styles: ['action', 'passive', 'universal'], baseWeight: 91, investorValue: 'Catch compromised dependencies before they ship — SolarWinds prevention.' },
  { id: 'defense-secret-scanner', primitive: 'DEFENSE', name: 'Secret & Credential Scanner', description: 'Detects hardcoded API keys, tokens, passwords, and connection strings with entropy-based analysis.', styles: ['action', 'passive', 'universal'], baseWeight: 93, investorValue: 'No secrets in source code — catches what developers miss in code review.' },
  { id: 'defense-cors-hardening', primitive: 'DEFENSE', name: 'CORS & Header Hardening', description: 'Enforces strict CORS policies, security headers (CSP, HSTS, X-Frame), and cookie attributes automatically.', styles: ['passive', 'universal'], baseWeight: 85, investorValue: 'Browser security headers perfect on every response — no manual configuration.' },
  { id: 'defense-csrf-protection', primitive: 'DEFENSE', name: 'CSRF Token Management', description: 'Automatic CSRF token generation, rotation, and validation on state-mutating endpoints.', styles: ['passive', 'universal'], baseWeight: 82, investorValue: 'Cross-site request forgery eliminated — structural protection.' },
  { id: 'sovereign-key-rotation', primitive: 'SOVEREIGN', name: 'Automatic Key Rotation', description: 'Rotates encryption keys, API keys, and certificates on schedule with zero-downtime dual-key periods.', styles: ['action', 'passive', 'universal'], baseWeight: 84, investorValue: 'Keys never go stale — rotation is automatic and invisible.' },
  { id: 'sovereign-data-classification', primitive: 'SOVEREIGN', name: 'Data Classification Engine', description: 'Automatically classifies data fields as PII, PHI, PCI, or public based on content analysis and naming conventions.', styles: ['action', 'passive', 'universal'], baseWeight: 81, investorValue: 'Know exactly where sensitive data lives — compliance starts with classification.' },

  // ── Performance & Optimization ──
  { id: 'reflex-adaptive-caching', primitive: 'REFLEX', name: 'Adaptive Cache Strategy', description: 'Self-tuning cache layers that adjust TTL, eviction policy, and storage tier based on access patterns.', styles: ['action', 'passive', 'universal'], baseWeight: 80, investorValue: 'Cache hit rates above 95% — automatic optimization without manual tuning.' },
  { id: 'reflex-connection-pooling', primitive: 'REFLEX', name: 'Connection Pool Manager', description: 'Dynamic connection pool sizing with health checks, stale connection pruning, and per-tenant isolation.', styles: ['action', 'universal'], baseWeight: 76, investorValue: 'Database connections never exhausted — pools scale with demand.' },
  { id: 'reflex-batch-optimizer', primitive: 'REFLEX', name: 'Request Batching Optimizer', description: 'Automatically batches compatible requests into bulk operations — reduces I/O overhead by 70%.', styles: ['action', 'universal'], baseWeight: 74, investorValue: '70% fewer database round-trips — automatic batching of compatible queries.' },
  { id: 'cortex-priority-queue', primitive: 'CORTEX', name: 'Priority-Aware Task Queue', description: 'Multi-priority task queue with deadline-aware scheduling, starvation prevention, and fair-share allocation.', styles: ['action', 'universal'], baseWeight: 79, investorValue: 'Critical tasks always run first — lower priority work never starves.' },
  { id: 'cortex-work-stealing', primitive: 'CORTEX', name: 'Work-Stealing Scheduler', description: 'Idle workers steal tasks from overloaded queues — maximizes throughput with zero wasted compute.', styles: ['action'], baseWeight: 77, investorValue: 'Every CPU cycle utilized — no idle workers while others are overloaded.' },

  // ── Testing & Quality ──
  { id: 'shadow-fuzz-testing', primitive: 'SHADOW', name: 'Automated Fuzz Testing', description: 'Generates malformed, boundary, and random inputs to discover edge cases and crash conditions.', styles: ['action', 'passive', 'universal'], baseWeight: 79, investorValue: 'Find bugs before attackers do — automated fuzzing on every function.' },
  { id: 'shadow-contract-testing', primitive: 'SHADOW', name: 'Consumer-Driven Contract Tests', description: 'Auto-generates contract tests from real API usage — validates providers never break consumer expectations.', styles: ['action', 'passive', 'universal'], baseWeight: 76, investorValue: 'API integrations never break silently — contracts verified continuously.' },
  { id: 'shadow-snapshot-diff', primitive: 'SHADOW', name: 'Output Snapshot Diffing', description: 'Captures function output snapshots and flags semantic differences between versions.', styles: ['action', 'passive', 'universal'], baseWeight: 73, investorValue: 'Behavioral regressions caught instantly — every output change is visible.' },

  // ── Compliance & Regulatory ──
  { id: 'governance-data-retention', primitive: 'GOVERNANCE', name: 'Data Retention Policy Engine', description: 'Enforces configurable retention periods with automatic deletion, archival, and compliance certification.', styles: ['action', 'passive', 'universal'], baseWeight: 80, investorValue: 'GDPR right-to-erasure compliant by default — no manual data cleanup.' },
  { id: 'governance-change-approval', primitive: 'GOVERNANCE', name: 'Change Approval Workflow', description: 'Enforces multi-party approval on sensitive operations — no single person can execute high-risk changes.', styles: ['action', 'passive', 'universal'], baseWeight: 82, investorValue: 'Four-eyes principle enforced structurally — not by policy documents.' },
  { id: 'audit-data-access-log', primitive: 'AUDIT', name: 'Data Access Logging', description: 'Records every data read with accessor identity, query context, and result set size — full access accountability.', styles: ['action', 'passive', 'universal'], baseWeight: 79, investorValue: 'Know exactly who accessed what data, when, and why — full accountability.' },
  { id: 'audit-change-diff', primitive: 'AUDIT', name: 'Change Diff Ledger', description: 'Records precise before/after diffs for every state mutation with cryptographic chaining.', styles: ['action', 'passive', 'universal'], baseWeight: 77, investorValue: 'Every change is diffable and reversible — complete mutation history.' },
  { id: 'conscience-bias-detection', primitive: 'CONSCIENCE', name: 'Algorithmic Bias Scanner', description: 'Detects statistical bias across protected classes in model outputs — disparate impact analysis in real-time.', styles: ['action', 'universal'], baseWeight: 78, investorValue: 'Prove your AI is fair — bias detected and reported before deployment.' },
  { id: 'conscience-explainability', primitive: 'CONSCIENCE', name: 'Decision Explainability Layer', description: 'Generates human-readable explanations for every automated decision with confidence breakdowns.', styles: ['action', 'universal'], baseWeight: 76, investorValue: 'Every AI decision is explainable — regulatory requirement met automatically.' },

  // ── Communication & Events ──
  { id: 'nerve-dead-letter', primitive: 'NERVE', name: 'Dead Letter Queue Handler', description: 'Captures failed message deliveries with retry scheduling, poison message detection, and alerting.', styles: ['action', 'universal'], baseWeight: 73, investorValue: 'No messages lost — every failed delivery is captured and retried.' },
  { id: 'nerve-event-sourcing', primitive: 'NERVE', name: 'Event Sourcing Backbone', description: 'Stores every state change as an immutable event — enables time-travel debugging and complete state reconstruction.', styles: ['action', 'universal'], baseWeight: 78, investorValue: 'Rebuild any historical state — complete system time travel.' },
  { id: 'relay-conflict-resolution', primitive: 'RELAY', name: 'CRDT Conflict Resolution', description: 'Conflict-free replicated data types for multi-writer scenarios — automatic merge without data loss.', styles: ['passive', 'universal'], baseWeight: 74, investorValue: 'Multiple users edit simultaneously — no conflicts, no data loss.' },

  // ── Identity & Auth Deep ──
  { id: 'identity-session-binding', primitive: 'IDENTITY', name: 'Device-Bound Session Tokens', description: 'Sessions cryptographically bound to device fingerprints — stolen tokens are useless on other devices.', styles: ['passive', 'universal'], baseWeight: 80, investorValue: 'Token theft neutralized — sessions are device-specific.' },
  { id: 'identity-brute-force', primitive: 'IDENTITY', name: 'Brute Force Protection', description: 'Progressive lockout with CAPTCHA escalation, IP reputation scoring, and geographic anomaly detection.', styles: ['passive', 'universal'], baseWeight: 83, investorValue: 'Account takeover prevention — automatic escalation on suspicious login patterns.' },
  { id: 'access-permission-boundary', primitive: 'ACCESS', name: 'Permission Boundary Enforcement', description: 'Maximum permission boundaries that cap escalation — even admin roles cannot exceed defined ceilings.', styles: ['action', 'passive', 'universal'], baseWeight: 85, investorValue: 'Privilege escalation structurally impossible — ceiling enforced at boundary.' },
];


// ═══════════════════════════════════════════════════════════════════════════════
// §3 — ARCHETYPE DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

export interface ArchetypeDetectionResult {
  archetype: SoftwareArchetype;
  confidence: number;
  scores: Record<SoftwareArchetype, number>;
  signals: { keyword: string; archetype: SoftwareArchetype; weight: number }[];
  label: string;
}

/**
 * Classifies source code into a software archetype via weighted keyword voting.
 */
export function detectArchetype(sourceCode: string): ArchetypeDetectionResult {
  const lower = sourceCode.toLowerCase();
  const scores: Record<SoftwareArchetype, number> = { active: 0, passive: 0, hybrid: 0 };
  const matchedSignals: ArchetypeDetectionResult['signals'] = [];

  for (const signal of ARCHETYPE_SIGNALS) {
    if (lower.includes(signal.keyword.toLowerCase())) {
      scores[signal.archetype] += signal.weight;
      matchedSignals.push(signal);
    }
  }

  const total = scores.active + scores.passive + scores.hybrid;
  if (total === 0) {
    return {
      archetype: 'hybrid',
      confidence: 0.5,
      scores,
      signals: [],
      label: 'Unknown (defaulting to Hybrid)',
    };
  }

  // Winner-take-all with confidence
  const entries = Object.entries(scores) as [SoftwareArchetype, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const [winner, winnerScore] = entries[0];
  const confidence = winnerScore / total;

  const labels: Record<SoftwareArchetype, string> = {
    active: 'Active Agent / Bot / Worker',
    passive: 'UI / Dashboard / Static App',
    hybrid: 'API / Middleware / Pipeline',
  };

  return {
    archetype: winner,
    confidence: Math.round(confidence * 100) / 100,
    scores,
    signals: matchedSignals,
    label: labels[winner],
  };
}


// ═══════════════════════════════════════════════════════════════════════════════
// §4 — CAPABILITY POOL FILTERING + WEIGHTED SELECTION
// ═══════════════════════════════════════════════════════════════════════════════

export interface AffinitySelection {
  selected: SubstrateCapability[];
  pool: SubstrateCapability[];
  excluded: SubstrateCapability[];
  archetype: ArchetypeDetectionResult;
}

/**
 * Filters the capability pool by archetype compatibility,
 * then selects `count` capabilities using CJPI-weighted random sampling.
 */
export function selectCapabilities(
  archetype: SoftwareArchetype,
  count: number = 6,
  seed?: number
): AffinitySelection {
  const detection = { archetype } as ArchetypeDetectionResult;

  // Filter: keep capabilities whose styles include the archetype or 'universal'
  const styleMap: Record<SoftwareArchetype, CapabilityStyle[]> = {
    active: ['action', 'universal'],
    passive: ['passive', 'universal'],
    hybrid: ['action', 'passive', 'universal'],
  };
  const allowedStyles = styleMap[archetype];

  const pool: SubstrateCapability[] = [];
  const excluded: SubstrateCapability[] = [];

  for (const cap of SUBSTRATE_CAPABILITIES) {
    const hasMatch = cap.styles.some(s => allowedStyles.includes(s));
    if (hasMatch) {
      pool.push(cap);
    } else {
      excluded.push(cap);
    }
  }

  // Weighted random selection from pool
  const selected = weightedSample(pool, Math.min(count, pool.length), seed);

  return { selected, pool, excluded, archetype: detection };
}

/**
 * Full pipeline: detect archetype from source → filter pool → select capabilities
 */
export function classifyAndSelect(
  sourceCode: string,
  count: number = 6,
  seed?: number
): AffinitySelection {
  const detection = detectArchetype(sourceCode);
  const result = selectCapabilities(detection.archetype, count, seed);
  return { ...result, archetype: detection };
}


// ═══════════════════════════════════════════════════════════════════════════════
// §5 — WEIGHTED SAMPLING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Weighted random sampling without replacement.
 * Higher baseWeight = higher probability of selection.
 */
function weightedSample(
  items: SubstrateCapability[],
  count: number,
  seed?: number
): SubstrateCapability[] {
  if (items.length <= count) return [...items];

  // Seeded PRNG for reproducibility in demos
  let rng = seed !== undefined ? seededRandom(seed) : Math.random;
  const remaining = [...items];
  const selected: SubstrateCapability[] = [];

  for (let i = 0; i < count; i++) {
    const totalWeight = remaining.reduce((sum, c) => sum + c.baseWeight, 0);
    let roll = rng() * totalWeight;

    for (let j = 0; j < remaining.length; j++) {
      roll -= remaining[j].baseWeight;
      if (roll <= 0) {
        selected.push(remaining[j]);
        remaining.splice(j, 1);
        break;
      }
    }
  }

  return selected;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}
