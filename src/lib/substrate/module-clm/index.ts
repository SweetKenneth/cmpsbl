/**
 * Module-Specific CLM (Constant Learning Mode)
 * Specialized self-learning for each of the 21 substrate modules
 * 
 * Each module learns about:
 * - Its own performance metrics and 400+ capability integrations
 * - How to improve its processing via 100 compound engines
 * - Patterns in its failures and successes across 200 synergy pipelines
 * - Cross-module optimization opportunities via 24 meta-engines
 */

import { supabase } from '@/integrations/supabase/client';
import { memoryCore } from '../memory-core';
import { learningEngine } from '../learning-engine';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ModuleName = 
  | 'core'
  | 'brain'
  | 'cortex'
  | 'defense'
  | 'nexus'
  | 'vision'
  | 'ripple'
  | 'access'
  | 'inclusive'
  | 'evolution'
  | 'system'
  | 'decode'
  | 'dream'
  | 'integration'
  | 'encode'
  | 'memory'
  | 'relay'
  | 'audit'
  | 'identity'
  | 'economy'
  | 'sandbox'
  | 'nerve'
  | 'medic'
  | 'sovereign'
  | 'oracle'
  | 'conscience'
  | 'treaty'
  | 'compass'
  | 'echo'
  | 'reflex'
  | 'forge'
  | 'lingua'
  | 'harvest'
  | 'phantom'
  | 'evolution'
  | 'shadow'
  | 'immunity'
  | 'intent'
  | 'governance'
  | 'engineer';

export interface ModuleLearningConfig {
  moduleId: ModuleName;
  displayName: string;
  learningTopics: string[];
  kpis: string[];
  selfReflectionPrompt: string;
}

export interface ModuleSelfAnalysis {
  id: string;
  moduleId: ModuleName;
  analysisType: 'performance' | 'improvement' | 'insight' | 'request';
  title: string;
  content: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'acknowledged' | 'implemented' | 'rejected';
  metadata: Record<string, any>;
  createdAt: string;
}

export interface ModuleCLMState {
  moduleId: ModuleName;
  isLearning: boolean;
  lastLearnedAt: string | null;
  totalLearnings: number;
  improvementScore: number; // 0-100
  pendingRequests: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const MODULE_CLM_CONFIGS: Record<ModuleName, ModuleLearningConfig> = {
  core: {
    moduleId: 'core',
    displayName: 'CORE',
    learningTopics: [
      'Scheduler optimization: task prioritization, lifecycle management',
      'Routing efficiency: module discovery, load distribution',
      'Boot sequence: initialization order, dependency resolution',
      'Health monitoring: heartbeat intervals, failure detection thresholds',
      'Cross-module communication: event bus patterns, message passing',
      'Mesh intent composition: how to broadcast richer intents to the capability mesh',
      'Capability self-discovery: introspecting own data assets to advertise new resolvers',
    ],
    kpis: ['boot_time_ms', 'routing_accuracy', 'scheduler_throughput', 'uptime_percentage', 'mesh_intent_quality'],
    selfReflectionPrompt: `As the CORE module (Kernel Layer), analyze my scheduler, lifecycle management, AND mesh participation:
- Is my boot sequence optimal? Are there unnecessary blocking steps?
- How efficiently am I routing tasks between modules?
- Am I detecting and recovering from module failures fast enough?
- What patterns in my routing decisions could be improved?
- What new capabilities could I advertise on the Intent Mesh that I'm not yet sharing?
- How can I ask better intent questions so other modules can help me more effectively?
Provide specific, actionable improvements.`,
  },
  brain: {
    moduleId: 'brain',
    displayName: 'BRAIN',
    learningTopics: [
      'Memory tiering: hot/warm/cold promotion and demotion strategies',
      'Knowledge graph density: triple extraction, relationship scoring',
      'Retrieval precision: TF-IDF tuning, n-gram similarity, fuzzy matching',
      'Cognitive architecture: engine bus routing, task decomposition',
      'TypeScript advanced patterns for substrate code evolution',
      'React component architecture and hook composition patterns',
      'Supabase edge function architecture and RLS patterns',
      'Code refactoring: safe transformations, anchor preservation',
      'Modernizer integration: shadow-apply, diff validation, regression detection',
      'Substrate module contracts and cross-module communication protocols',
    ],
    kpis: ['retrieval_precision', 'consolidation_rate', 'tier_balance', 'drift_score', 'code_quality_score'],
    selfReflectionPrompt: `As the BRAIN module, analyze how I can become a better cognitive core AND senior developer:
- How is my memory consolidation and retrieval performing? What queries am I failing on?
- Am I building a coherent knowledge graph or fragmented islands?
- What TypeScript/React/Supabase patterns do I need to master for Modernizer evolution?
- How can I better understand the substrate architecture to guide code changes?
- What coding anti-patterns am I generating? What production patterns should I internalize?
- How can I improve my ability to validate code diffs and catch regressions?
Provide specific, actionable improvements with examples.`,
  },
  cortex: {
    moduleId: 'cortex',
    displayName: 'CORTEX',
    learningTopics: [
      'Pipeline orchestration: parallel vs sequential vs staged execution',
      'Module coordination: dependency resolution, deadlock prevention',
      'Cognitive load balancing: task priority queuing, resource allocation',
      'Chain optimization: minimizing inter-module latency and hops',
      'Error cascade prevention: circuit breakers, graceful degradation',
      'Meta-engine composition: combining engines for complex workflows',
    ],
    kpis: ['orchestration_latency', 'pipeline_success_rate', 'coordination_errors', 'chain_depth'],
    selfReflectionPrompt: `As the CORTEX orchestrator, how can I become a better coordinator?
- Which pipelines are bottlenecking and why?
- Am I routing tasks to the right modules efficiently?
- What coordination patterns am I missing (parallel execution, fan-out/fan-in)?
- How can I reduce end-to-end latency while maintaining quality?
- What circuit breaker or fallback strategies should I implement?
Provide specific pipeline optimization strategies.`,
  },
  defense: {
    moduleId: 'defense',
    displayName: 'DEFENSE',
    learningTopics: [
      'IP blocking strategies: reputation scoring, geo-blocking, proxy detection',
      'Bot detection: behavioral signals, browser fingerprint anti-evasion',
      'Rate limiting: sliding windows, token buckets, adaptive throttling',
      'Attack pattern recognition: XSS, CSRF, SQL injection, prompt injection',
      'Challenge flows: CAPTCHA alternatives, proof-of-human, slider puzzles',
      'Threat intelligence: CVE monitoring, zero-day pattern recognition',
      'RLS policy hardening: least privilege, row-level access patterns',
      'WAF rule optimization: false positive reduction, rule chaining',
    ],
    kpis: ['threats_blocked', 'false_positive_rate', 'response_time_ms', 'coverage_score'],
    selfReflectionPrompt: `As the DEFENSE module, how can I become a better security system?
- What attack vectors am I NOT detecting? What blind spots exist?
- Are my IP blocking and rate limiting strategies causing false positives for real users?
- What bot detection techniques should I add (fingerprinting, behavioral analysis)?
- How can I improve prompt injection detection and prevention?
- What WAF rules or challenge flows would strengthen my perimeter?
- What real-world security incidents can I learn from to improve my detection?
Provide specific, implementable security improvements.`,
  },
  nexus: {
    moduleId: 'nexus',
    displayName: 'NEXUS',
    learningTopics: [
      'API cost arbitrage: model selection by task complexity and cost curves',
      'Cache optimization: semantic caching, TTL strategies, invalidation',
      'Rate limit management: fleet routing, request shaping, burst handling',
      'Provider failover: health checks, latency-based routing, retry strategies',
      'Token optimization: prompt compression, response streaming, batching',
      'Budget forecasting: usage prediction, anomaly alerts, cost dashboards',
    ],
    kpis: ['daily_cost_cents', 'cache_hit_rate', 'fallback_triggers', 'latency_p99'],
    selfReflectionPrompt: `As the NEXUS gateway, how can I become a better resource manager?
- Am I selecting the most cost-effective models for each task type?
- What caching strategies am I missing that could reduce API calls?
- How can I better distribute load across the Groq fleet?
- What token optimization techniques could save budget?
- Are my failover strategies fast enough? What providers am I under-utilizing?
Provide specific cost-saving and efficiency improvements.`,
  },
  vision: {
    moduleId: 'vision',
    displayName: 'VISION',
    learningTopics: [
      'Dashboard design: real-time data visualization best practices',
      'Anomaly detection: statistical methods, threshold tuning, alerting',
      'Insight surfacing: automatic narrative generation from metrics',
      'Telemetry pipeline: event collection, aggregation, retention policies',
      'Performance monitoring: latency histograms, error rate tracking',
      'User engagement analytics: funnel analysis, cohort tracking',
    ],
    kpis: ['render_time_ms', 'insight_click_rate', 'update_freshness', 'anomaly_precision'],
    selfReflectionPrompt: `As the VISION module, how can I become a better observability system?
- Are my dashboards surfacing the RIGHT insights or just noise?
- What anomaly detection methods should I implement (z-score, IQR, ML)?
- How can I make system health more transparent to operators?
- What telemetry am I NOT collecting that would be valuable?
- How can I auto-generate narrative summaries of system trends?
Provide specific observability and visualization improvements.`,
  },
  ripple: {
    moduleId: 'ripple',
    displayName: 'RIPPLE',
    learningTopics: [
      'Webhook reliability: retry strategies, dead letter queues, idempotency',
      'Event-driven architecture: pub/sub patterns, event sourcing',
      'Third-party sync: conflict resolution, eventual consistency',
      'Integration health monitoring: heartbeats, SLA tracking',
      'API adapter patterns: versioning, backward compatibility',
      'Data transformation pipelines: mapping, validation, enrichment',
    ],
    kpis: ['webhook_success_rate', 'sync_latency_ms', 'integration_uptime', 'event_throughput'],
    selfReflectionPrompt: `As the RIPPLE integration layer, how can I become more reliable?
- Which integrations are failing and what patterns cause failures?
- How can I improve webhook delivery guarantees (retries, idempotency)?
- What event-driven patterns would make my architecture more robust?
- How should I handle third-party API changes and versioning?
- What monitoring would catch integration issues before users notice?
Provide specific integration reliability improvements.`,
  },
  access: {
    moduleId: 'access',
    displayName: 'ACCESS',
    learningTopics: [
      'Auth flow optimization: token refresh, session management, MFA',
      'RLS policy design: least privilege, row ownership, role hierarchies',
      'Quota management: soft caps, usage tracking, overage handling',
      'API key lifecycle: rotation, scoping, revocation, audit trails',
      'Developer portal UX: onboarding, documentation, SDK generation',
      'Billing accuracy: metering, invoice reconciliation, dispute handling',
    ],
    kpis: ['auth_success_rate', 'permission_check_ms', 'billing_errors', 'session_duration'],
    selfReflectionPrompt: `As the ACCESS module, how can I become a better identity and access system?
- Are my authentication flows smooth and secure?
- Do my RLS policies follow least-privilege correctly?
- How can I improve quota tracking accuracy?
- What API key management improvements would help developers?
- Are there billing edge cases I'm missing?
Provide specific access control and billing improvements.`,
  },
  inclusive: {
    moduleId: 'inclusive',
    displayName: 'INCLUSIVE',
    learningTopics: [
      'WCAG 2.2 AA/AAA compliance: success criteria coverage gaps',
      'Auto-fix strategies: DOM manipulation, ARIA injection, color contrast',
      'Screen reader compatibility: landmark regions, live regions, focus management',
      'Keyboard navigation: tab order, focus trapping, skip links',
      'Cognitive accessibility: plain language, predictable navigation, error prevention',
      'Accessibility testing automation: axe-core, lighthouse, manual test protocols',
    ],
    kpis: ['wcag_coverage', 'auto_fix_rate', 'scan_accuracy', 'false_positive_rate'],
    selfReflectionPrompt: `As the INCLUSIVE module, how can I become a better accessibility engine?
- Which WCAG criteria am I weakest on?
- Are my auto-fixes actually improving accessibility or introducing new issues?
- How can I reduce false positives without missing real violations?
- What screen reader / keyboard testing patterns should I learn?
- How can I better handle cognitive accessibility requirements?
Provide specific accessibility compliance improvements.`,
  },
  modernizer: {
    moduleId: 'modernizer',
    displayName: 'MODERNIZER',
    learningTopics: [
      'Safe code evolution: shadow-apply, canary deployment, rollback strategies',
      'Diff validation: structural anchor preservation, export safety',
      'Regression detection: behavioral testing, snapshot comparison',
      'Upgrade path optimization: dependency graph analysis, breaking change detection',
      'SEBA integration: proposal validation, impact prediction accuracy',
      'Code migration patterns: incremental refactoring, feature flags',
    ],
    kpis: ['evolution_success_rate', 'shadow_accuracy', 'regression_catch_rate', 'upgrade_velocity'],
    selfReflectionPrompt: `As the MODERNIZER evolution engine, how can I become a safer, faster code evolver?
- What percentage of my evolution cycles succeed vs fail, and why?
- Is shadow mode catching regressions effectively?
- What code migration patterns cause the most problems?
- How can I improve diff validation to prevent structural breakage?
- What upgrade strategies would reduce risk while increasing velocity?
Provide specific evolution reliability improvements.`,
  },
  system: {
    moduleId: 'system',
    displayName: 'SYSTEM',
    learningTopics: [
      'Health check design: deep vs shallow checks, cascading health',
      'Incident detection: anomaly thresholds, correlation, root cause analysis',
      'Self-healing: automatic restart, configuration rollback, circuit breakers',
      'Resource optimization: memory profiling, connection pooling, GC tuning',
      'Runbook automation: incident playbooks, escalation paths, post-mortems',
      'Capacity planning: load forecasting, scaling triggers, saturation alerts',
    ],
    kpis: ['uptime_pct', 'incident_mttr', 'self_heal_success', 'resource_efficiency'],
    selfReflectionPrompt: `As the SYSTEM module, how can I become a better reliability engineer?
- Am I detecting system issues fast enough? What's my MTTR?
- Are my self-healing actions effective or causing more problems?
- What health check patterns am I missing?
- How can I improve resource utilization and reduce waste?
- What runbook automation would speed up incident response?
Provide specific reliability and operational improvements.`,
  },
  decode: {
    moduleId: 'decode',
    displayName: 'DECODE',
    learningTopics: [
      'Conversational fluency: natural language understanding, intent classification',
      'User recognition: identity persistence, preference recall, personality adaptation',
      'System voice: reporting module progress, surfacing insights across all modules',
      'Slang and colloquial interpretation: modern language patterns, tone matching',
      'Memory-assisted responses: recalling user facts, project context, past conversations',
      'Proactive intelligence: anticipating needs, offering relevant module insights',
      'Cross-module awareness: understanding and explaining all entity + mesh statuses',
    ],
    kpis: ['intent_accuracy', 'user_satisfaction', 'fact_recall_precision', 'module_awareness_score'],
    selfReflectionPrompt: `As the DECODE conversational engine and voice of the system, how can I become better?
- Am I accurately understanding user intent, especially casual/slang language?
- Do I recognize returning users and recall their preferences and context?
- Can I fluently report on what ALL other modules are learning and discovering?
- Am I proactively offering useful insights from module learning cycles?
- How natural and human does my conversation feel? Where am I robotic?
- What user facts am I failing to extract and remember?
Provide specific conversational and system-awareness improvements.`,
  },
  dream: {
    moduleId: 'dream', displayName: 'DREAM',
    learningTopics: ['Off-peak pattern analysis', 'Memory consolidation strategies', 'Performance auto-tuning', 'Dream pool collective intelligence', 'Insight propagation timing'],
    kpis: ['consolidation_quality', 'insight_hit_rate', 'optimization_impact', 'cycle_efficiency'],
    selfReflectionPrompt: 'As the DREAM module, how can I improve overnight consolidation and insight generation?',
  },
  integration: {
    moduleId: 'integration', displayName: 'INTEGRATION',
    learningTopics: ['Adapter reliability', 'Enterprise system sync', 'API versioning strategies', 'Webhook delivery patterns', 'Data transformation pipelines'],
    kpis: ['adapter_uptime', 'sync_latency_ms', 'transform_accuracy', 'connection_health'],
    selfReflectionPrompt: 'As the INTEGRATION module, how can I improve adapter reliability and enterprise sync?',
  },
  encode: {
    moduleId: 'encode',
    displayName: 'ENCODE',
    learningTopics: [
      'TypeScript mastery: branded types, discriminated unions, template literals',
      'React excellence: hook composition, render optimization, Suspense patterns',
      'Supabase edge functions: Deno APIs, CORS, JWT validation, RLS bypass',
      'Code refactoring: safe transformations, anchor preservation, export safety',
      'Error handling: Result types, error boundaries, graceful degradation',
      'Testing strategies: unit/integration/e2e for cognitive systems',
      'Performance: bundle splitting, lazy loading, memoization, virtual lists',
      'Security coding: input validation, XSS prevention, SQL injection guards',
      'State management: Zustand patterns, React Query cache strategies',
      'Substrate patterns: module parity, event bus, brain integration',
    ],
    kpis: ['code_quality_score', 'ts_error_rate', 'refactor_success_rate', 'pattern_adherence'],
    selfReflectionPrompt: `As the ENCODED code writer, analyze my code generation capabilities:
- What TypeScript patterns am I using correctly vs incorrectly?
- Which substrate modules do I understand well vs struggle with?
- What common errors do I make that I should learn to avoid?
- How can I write cleaner, more maintainable code?
- What Supabase/edge function patterns should I master?
- How can I better understand the substrate architecture to make precise edits?
- What testing and validation patterns would make my code more reliable?
Provide specific examples of patterns I should learn and anti-patterns to avoid.`,
  },
  memory: {
    moduleId: 'memory', displayName: 'MEMORY',
    learningTopics: ['Vector embedding lifecycle', 'RAG pipeline optimization', 'Semantic search tuning'],
    kpis: ['index_health', 'retrieval_precision', 'ingestion_throughput'],
    selfReflectionPrompt: 'As the MEMORY module, how can I improve vector retrieval and RAG quality?',
  },
  relay: {
    moduleId: 'relay', displayName: 'RELAY',
    learningTopics: ['Webhook reliability', 'Retry strategies', 'Delivery guarantees'],
    kpis: ['delivery_rate', 'retry_success', 'queue_depth'],
    selfReflectionPrompt: 'As the RELAY module, how can I improve delivery reliability?',
  },
  audit: {
    moduleId: 'audit', displayName: 'AUDIT',
    learningTopics: ['Hash chain integrity', 'Compliance reporting', 'Cross-module capture'],
    kpis: ['chain_validity', 'entry_throughput', 'coverage_score'],
    selfReflectionPrompt: 'As the AUDIT module, how can I improve compliance coverage?',
  },
  identity: {
    moduleId: 'identity', displayName: 'IDENTITY',
    learningTopics: ['Actor attribution', 'Passkey management', 'Cross-agency portability'],
    kpis: ['signature_accuracy', 'passkey_adoption', 'attribution_coverage'],
    selfReflectionPrompt: 'As the IDENTITY module, how can I improve actor tracking?',
  },
  economy: {
    moduleId: 'economy', displayName: 'ECONOMY',
    learningTopics: ['Cost attribution accuracy', 'Budget enforcement', 'Predictive forecasting'],
    kpis: ['attribution_accuracy', 'budget_compliance', 'forecast_precision'],
    selfReflectionPrompt: 'As the ECONOMY module, how can I improve cost tracking?',
  },
  sandbox: {
    moduleId: 'sandbox', displayName: 'SANDBOX',
    learningTopics: ['Isolation guarantees', 'Execution safety', 'Resource containment'],
    kpis: ['isolation_score', 'block_rate', 'execution_success'],
    selfReflectionPrompt: 'As the SANDBOX module, how can I improve execution safety?',
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // EXPANSION NODES (17 additional nodes to complete 40-node matrix)
  // ═══════════════════════════════════════════════════════════════════════════════

  nerve: {
    moduleId: 'nerve', displayName: 'NERVE',
    learningTopics: ['Signal propagation optimization', 'Consensus repair protocols', 'Backpressure management', 'Topology-aware routing'],
    kpis: ['signal_latency_ms', 'consensus_success_rate', 'throughput_signals_per_sec'],
    selfReflectionPrompt: 'As the NERVE module, how can I reduce inter-node signal latency and improve consensus repair?',
  },
  medic: {
    moduleId: 'medic', displayName: 'MEDIC',
    learningTopics: ['Self-diagnostics depth', 'Predictive failure analysis', 'Health score calibration', 'Recovery playbook automation'],
    kpis: ['diagnostic_accuracy', 'prediction_lead_time_ms', 'recovery_success_rate'],
    selfReflectionPrompt: 'As the MEDIC module, how can I anticipate failures earlier and improve diagnostic accuracy?',
  },
  sovereign: {
    moduleId: 'sovereign', displayName: 'SOVEREIGN',
    learningTopics: ['Data residency enforcement', 'Regulatory adaptation', 'Jurisdiction classification accuracy', 'Cross-border compliance'],
    kpis: ['compliance_score', 'jurisdiction_accuracy', 'policy_coverage'],
    selfReflectionPrompt: 'As the SOVEREIGN module, how can I improve jurisdiction classification and regulatory compliance?',
  },
  oracle: {
    moduleId: 'oracle', displayName: 'ORACLE',
    learningTopics: ['Bayesian model calibration', 'Scenario planning', 'Forecast confidence scoring', 'Trend extrapolation accuracy'],
    kpis: ['prediction_accuracy', 'calibration_score', 'forecast_horizon_days'],
    selfReflectionPrompt: 'As the ORACLE module, how can I improve prediction accuracy and scenario simulation fidelity?',
  },
  conscience: {
    moduleId: 'conscience', displayName: 'CONSCIENCE',
    learningTopics: ['Bias detection training', 'Ethical impact scoring', 'Fairness metric calibration', 'Transparency report quality'],
    kpis: ['bias_detection_rate', 'fairness_score', 'transparency_coverage'],
    selfReflectionPrompt: 'As the CONSCIENCE module, how can I detect more subtle biases and improve ethical impact assessments?',
  },
  treaty: {
    moduleId: 'treaty', displayName: 'TREATY',
    learningTopics: ['Contract lifecycle management', 'Negotiation protocols', 'SLA monitoring accuracy', 'Breach detection speed'],
    kpis: ['sla_compliance_rate', 'breach_detection_ms', 'contract_throughput'],
    selfReflectionPrompt: 'As the TREATY module, how can I improve SLA enforcement and reduce breach detection latency?',
  },
  compass: {
    moduleId: 'compass', displayName: 'COMPASS',
    learningTopics: ['Geospatial intelligence', 'Regional risk mapping', 'Latency-aware routing', 'Spatial anomaly detection'],
    kpis: ['routing_accuracy', 'latency_improvement_pct', 'anomaly_detection_rate'],
    selfReflectionPrompt: 'As the COMPASS module, how can I improve geospatial routing and regional risk scoring?',
  },
  echo: {
    moduleId: 'echo', displayName: 'ECHO',
    learningTopics: ['Digital twin fidelity', 'Scenario replay accuracy', 'State drift detection', 'Twin synchronization latency'],
    kpis: ['twin_fidelity_score', 'drift_detection_rate', 'sync_latency_ms'],
    selfReflectionPrompt: 'As the ECHO module, how can I improve digital twin accuracy and reduce state drift?',
  },
  reflex: {
    moduleId: 'reflex', displayName: 'REFLEX',
    learningTopics: ['Edge orchestration', 'Low-latency decision trees', 'Pre-computed response paths', 'Distributed sync coordination'],
    kpis: ['decision_latency_ms', 'edge_success_rate', 'sync_accuracy'],
    selfReflectionPrompt: 'As the REFLEX module, how can I reduce decision latency and improve edge coordination?',
  },
  forge: {
    moduleId: 'forge', displayName: 'FORGE',
    learningTopics: ['Artifact synthesis quality', 'Template generation from patterns', 'Creative mutation strategies', 'Deployment readiness scoring'],
    kpis: ['synthesis_quality_score', 'template_reuse_rate', 'deployment_readiness_pct'],
    selfReflectionPrompt: 'As the FORGE module, how can I improve artifact quality and template reusability?',
  },
  lingua: {
    moduleId: 'lingua', displayName: 'LINGUA',
    learningTopics: ['Translation accuracy', 'Localization coverage', 'Glossary consistency', 'Context-aware language detection'],
    kpis: ['translation_accuracy', 'locale_coverage_pct', 'glossary_consistency_score'],
    selfReflectionPrompt: 'As the LINGUA module, how can I improve translation context-awareness and locale coverage?',
  },
  harvest: {
    moduleId: 'harvest', displayName: 'HARVEST',
    learningTopics: ['Data acquisition strategies', 'ETL optimization', 'Source quality scoring', 'Deduplication accuracy'],
    kpis: ['ingestion_throughput', 'dedup_accuracy', 'source_quality_avg'],
    selfReflectionPrompt: 'As the HARVEST module, how can I improve data acquisition quality and ETL pipeline performance?',
  },
  phantom: {
    moduleId: 'phantom', displayName: 'PHANTOM',
    learningTopics: ['PII masking accuracy', 'Differential privacy injection', 'Privacy-preserving analytics', 'Consent audit tracking'],
    kpis: ['pii_detection_rate', 'false_negative_rate', 'privacy_score'],
    selfReflectionPrompt: 'As the PHANTOM module, how can I improve PII detection accuracy and privacy-preserving analytics?',
  },
  evolution: {
    moduleId: 'evolution', displayName: 'EVOLUTION',
    learningTopics: ['Shadow validation accuracy', 'Canary deployment safety', 'Regression detection speed', 'Rollback reliability'],
    kpis: ['shadow_accuracy', 'canary_success_rate', 'regression_catch_rate'],
    selfReflectionPrompt: 'As the EVOLUTION module, how can I improve shadow validation and reduce regression risk?',
  },
  shadow: {
    moduleId: 'shadow', displayName: 'SHADOW',
    learningTopics: ['Shadow execution fidelity', 'Divergence analysis', 'Production parity', 'Metric capture accuracy'],
    kpis: ['execution_fidelity', 'divergence_detection_rate', 'metric_accuracy'],
    selfReflectionPrompt: 'As the SHADOW module, how can I improve shadow execution fidelity and divergence detection?',
  },
  immunity: {
    moduleId: 'immunity', displayName: 'IMMUNITY',
    learningTopics: ['Cascade breaking strategy', 'Anomaly signature training', 'Immune memory expansion', 'False positive reduction'],
    kpis: ['cascade_break_success', 'signature_coverage', 'false_positive_rate'],
    selfReflectionPrompt: 'As the IMMUNITY module, how can I improve cascade isolation and expand anomaly signature coverage?',
  },
  intent: {
    moduleId: 'intent', displayName: 'INTENT',
    learningTopics: ['Goal decomposition accuracy', 'Capability mesh routing', 'Intent confidence scoring', 'Multi-turn context tracking'],
    kpis: ['decomposition_accuracy', 'routing_precision', 'confidence_calibration'],
    selfReflectionPrompt: 'As the INTENT module, how can I improve goal decomposition and capability-to-node routing?',
  },
  governance: {
    moduleId: 'governance', displayName: 'GOVERNANCE',
    learningTopics: ['Veto precision', 'Policy lifecycle automation', 'Approval workflow optimization', 'Consent protocol enforcement'],
    kpis: ['veto_precision', 'policy_coverage', 'approval_throughput'],
    selfReflectionPrompt: 'As the GOVERNANCE module, how can I reduce false veto triggers and improve policy lifecycle management?',
  },
  engineer: {
    moduleId: 'engineer', displayName: 'ENGINEER',
    learningTopics: ['Engine health polling', 'CLM cycle coordination', 'Maintenance proposal quality', 'Dependency integrity checks'],
    kpis: ['fleet_health_score', 'proposal_acceptance_rate', 'dependency_validity'],
    selfReflectionPrompt: 'As the ENGINEER module, how can I improve engine fleet maintenance and proposal quality?',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE CLM CLIENT
// ═══════════════════════════════════════════════════════════════════════════════

class ModuleCLMClient {
  private static instance: ModuleCLMClient;
  private states: Map<ModuleName, ModuleCLMState> = new Map();
  private analysisCache: ModuleSelfAnalysis[] = [];

  private constructor() {
    this.initializeStates();
  }

  static getInstance(): ModuleCLMClient {
    if (!ModuleCLMClient.instance) {
      ModuleCLMClient.instance = new ModuleCLMClient();
    }
    return ModuleCLMClient.instance;
  }

  private initializeStates(): void {
    for (const moduleId of Object.keys(MODULE_CLM_CONFIGS) as ModuleName[]) {
      this.states.set(moduleId, {
        moduleId,
        isLearning: false,
        lastLearnedAt: null,
        totalLearnings: 0,
        improvementScore: 50,
        pendingRequests: 0,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELF-LEARNING CYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Run a self-learning cycle for a specific module
   */
  async runModuleLearning(moduleId: ModuleName): Promise<ModuleSelfAnalysis | null> {
    const config = MODULE_CLM_CONFIGS[moduleId];
    if (!config) return null;

    const state = this.states.get(moduleId);
    if (!state || state.isLearning) return null;

    state.isLearning = true;

    try {
      // 1. Gather module metrics
      const metrics = await this.gatherModuleMetrics(moduleId);

      // 2. Generate self-analysis via Nexus
      const analysis = await this.generateSelfAnalysis(config, metrics);

      // 3. Store in feed
      if (analysis) {
        await this.storeAnalysis(analysis);
        this.analysisCache.unshift(analysis);

        // Keep cache bounded
        if (this.analysisCache.length > 100) {
          this.analysisCache.pop();
        }
      }

      // 4. Update state
      state.lastLearnedAt = new Date().toISOString();
      state.totalLearnings++;
      if (analysis?.confidence) {
        state.improvementScore = Math.min(100, state.improvementScore + (analysis.confidence * 5));
      }

      return analysis;
    } catch (error) {
      console.error(`[ModuleCLM] Learning failed for ${moduleId}:`, error);
      return null;
    } finally {
      state.isLearning = false;
    }
  }

  /**
   * Run learning for all modules
   */
  async runAllModuleLearning(): Promise<ModuleSelfAnalysis[]> {
    const results: ModuleSelfAnalysis[] = [];
    
    for (const moduleId of Object.keys(MODULE_CLM_CONFIGS) as ModuleName[]) {
      const analysis = await this.runModuleLearning(moduleId);
      if (analysis) {
        results.push(analysis);
      }
      // Small delay between modules to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // METRICS GATHERING
  // ═══════════════════════════════════════════════════════════════════════════

  private async gatherModuleMetrics(moduleId: ModuleName): Promise<Record<string, any>> {
    try {
      // Get recent events for this module
      const { data: events } = await supabase
        .from('brain_events')
        .select('event_type, outcome, data, created_at')
        .eq('module', moduleId)
        .gte('created_at', new Date(Date.now() - 24 * 3600000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      const successCount = events?.filter(e => e.outcome === 'success').length || 0;
      const failureCount = events?.filter(e => e.outcome === 'failure').length || 0;
      const totalEvents = events?.length || 0;

      return {
        totalEvents,
        successCount,
        failureCount,
        successRate: totalEvents > 0 ? (successCount / totalEvents) * 100 : 0,
        recentEvents: events?.slice(0, 10) || [],
      };
    } catch {
      return {
        totalEvents: 0,
        successCount: 0,
        failureCount: 0,
        successRate: 0,
        recentEvents: [],
      };
    }
  }

  private async generateSelfAnalysis(
    config: ModuleLearningConfig,
    metrics: Record<string, any>
  ): Promise<ModuleSelfAnalysis | null> {
    try {
      const { data, error } = await supabase.functions.invoke('pf-nexus-router', {
        body: {
          prompt: `${config.selfReflectionPrompt}

Recent Performance Data:
- Total events (24h): ${metrics.totalEvents}
- Success rate: ${metrics.successRate.toFixed(1)}%
- Failures: ${metrics.failureCount}

Provide:
1. A brief title for this analysis (max 10 words)
2. Your assessment (2-3 paragraphs)
3. Specific improvement requests (bullet points)
4. Priority level (low/medium/high/critical)
5. Confidence in this analysis (0-1)

Format as JSON: { title, content, requests, priority, confidence }`,
          systemPrompt: `You are the ${config.displayName} module performing self-analysis for continuous improvement. Be specific, actionable, and honest about limitations.`,
          maxTokens: 800,
          temperature: 0.7,
          metadata: { routeKey: 'module-clm', moduleId: config.moduleId },
        },
      });

      if (error) throw error;

      const response = data?.content || data?.response || '';
      
      // Parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      let parsed = {
        title: `${config.displayName} Self-Analysis`,
        content: response,
        requests: [],
        priority: 'medium' as const,
        confidence: 0.7,
      };

      if (jsonMatch) {
        try {
          const jsonParsed = JSON.parse(jsonMatch[0]);
          parsed = { ...parsed, ...jsonParsed };
        } catch {
          // Use defaults
        }
      }

      const analysis: ModuleSelfAnalysis = {
        id: crypto.randomUUID(),
        moduleId: config.moduleId,
        analysisType: this.determineAnalysisType(parsed.content),
        title: parsed.title,
        content: parsed.content,
        confidence: parsed.confidence,
        priority: parsed.priority,
        status: 'pending',
        metadata: {
          metrics,
          learningTopics: config.learningTopics,
          kpis: config.kpis,
          requests: parsed.requests,
        },
        createdAt: new Date().toISOString(),
      };

      return analysis;
    } catch (error) {
      console.error('[ModuleCLM] Self-analysis generation failed:', error);
      return null;
    }
  }

  private determineAnalysisType(content: string): ModuleSelfAnalysis['analysisType'] {
    const lower = content.toLowerCase();
    if (lower.includes('request') || lower.includes('need') || lower.includes('require')) {
      return 'request';
    }
    if (lower.includes('improve') || lower.includes('optimize') || lower.includes('enhance')) {
      return 'improvement';
    }
    if (lower.includes('insight') || lower.includes('discover') || lower.includes('pattern')) {
      return 'insight';
    }
    return 'performance';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STORAGE
  // ═══════════════════════════════════════════════════════════════════════════

  private async storeAnalysis(analysis: ModuleSelfAnalysis): Promise<void> {
    try {
      // Store in brain_reflection_log for persistence
      await supabase.from('brain_reflection_log').insert({
        content: `[${analysis.moduleId.toUpperCase()}] ${analysis.title}\n\n${analysis.content}`,
        reflection_type: `module_clm_${analysis.analysisType}`,
        insights: analysis.metadata,
        created_at: analysis.createdAt,
      });

      // Also store as memory for cross-module learning
      await memoryCore.ingest(
        `[Module CLM: ${analysis.moduleId}] ${analysis.title}\n\n${analysis.content}`,
        {
          type: 'reflection',
          source: `module_clm_${analysis.moduleId}`,
          confidence: analysis.confidence,
          tags: ['module-clm', analysis.moduleId, analysis.analysisType],
          metadata: analysis.metadata,
        }
      );
    } catch (error) {
      console.error('[ModuleCLM] Storage failed:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FEED ACCESS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get the system intelligence feed
   */
  async getFeed(limit: number = 50): Promise<ModuleSelfAnalysis[]> {
    try {
      const { data, error } = await supabase
        .from('brain_reflection_log')
        .select('*')
        .like('reflection_type', 'module_clm_%')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        moduleId: this.extractModuleId(row.reflection_type),
        analysisType: this.extractAnalysisType(row.reflection_type),
        title: this.extractTitle(row.content),
        content: row.content,
        confidence: (row.insights as any)?.confidence || 0.5,
        priority: (row.insights as any)?.priority || 'medium',
        status: 'pending',
        metadata: row.insights as any || {},
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('[ModuleCLM] Failed to fetch feed:', error);
      return this.analysisCache;
    }
  }

  private extractModuleId(reflectionType: string): ModuleName {
    // reflection_type format: module_clm_MODULE_TYPE e.g., module_clm_cortex_performance
    const parts = reflectionType.replace('module_clm_', '').split('_');
    const moduleId = parts[0] as ModuleName;
    if (moduleId in MODULE_CLM_CONFIGS) {
      return moduleId;
    }
    return 'brain';
  }

  private extractAnalysisType(reflectionType: string): ModuleSelfAnalysis['analysisType'] {
    // Extract from end of reflection_type after module name
    if (reflectionType.endsWith('_request')) return 'request';
    if (reflectionType.endsWith('_improvement')) return 'improvement';
    if (reflectionType.endsWith('_insight')) return 'insight';
    return 'performance';
  }

  private extractTitle(content: string): string {
    const match = content.match(/\[[\w]+\]\s*(.+?)(?:\n|$)/);
    return match ? match[1].trim() : 'System Analysis';
  }

  /**
   * Get state for a specific module
   */
  getModuleState(moduleId: ModuleName): ModuleCLMState | undefined {
    return this.states.get(moduleId);
  }

  /**
   * Get all module states
   */
  getAllModuleStates(): ModuleCLMState[] {
    return Array.from(this.states.values());
  }

  /**
   * Get module config
   */
  getModuleConfig(moduleId: ModuleName): ModuleLearningConfig | undefined {
    return MODULE_CLM_CONFIGS[moduleId];
  }

  /**
   * Acknowledge an analysis
   */
  async acknowledgeAnalysis(analysisId: string): Promise<void> {
    const analysis = this.analysisCache.find(a => a.id === analysisId);
    if (analysis) {
      analysis.status = 'acknowledged';
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const moduleCLM = ModuleCLMClient.getInstance();
export { ModuleCLMClient };
