/**
 * CMPSBL AGENCY™ — Vertical Crown Jewel Registry
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 80 Architectural Crown Jewels: 5 per each of the 16 agency primitives.
 * Classification: Architecture (permanently black-boxed).
 * All CJPI ≥ 92 — governor-curated, S-Tier.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { STierEntry } from './types';

/* ─── Helper ─── */
function cj(
  rank: number, id: string, name: string, cjpi: number,
  module: string, description: string, sig: string,
): STierEntry {
  return {
    rank, id, name, cjpi, module,
    type: 'Architecture',
    description,
    dependencyFootprint: [],
    exportMode: 'PureStandalone',
    signatureHash: sig,
    version: '1.0.0',
    approved: true,
    generatedAt: '2026-04-04T00:00:00.000Z',
    hasCode: true,
  };
}

/* ═══════════════════════════════════════════════
   ENGINES (8 × 5 = 40 Crown Jewels)
   ═══════════════════════════════════════════════ */

// ── MANDATE ──
const MANDATE_JEWELS: STierEntry[] = [
  cj(500, 'S-MAND01', 'Recursive Mission Decomposition Matrix', 97, 'MANDATE',
    'Hierarchical objective decomposition engine that recursively breaks complex goals into atomic executable sub-tasks with dependency-aware DAG ordering and parallel execution lanes.',
    'ag-m01'),
  cj(501, 'S-MAND02', 'Adaptive Priority Rebalancer', 96, 'MANDATE',
    'Real-time priority scoring engine that rebalances task queues based on deadline proximity, dependency completion, resource availability, and user urgency signals.',
    'ag-m02'),
  cj(502, 'S-MAND03', 'Autonomous Replanning Engine', 95, 'MANDATE',
    'Self-correcting planner that detects plan failures and automatically reconstructs execution paths without human intervention using constraint satisfaction techniques.',
    'ag-m03'),
  cj(503, 'S-MAND04', 'Milestone Convergence Tracker', 94, 'MANDATE',
    'Tracks objective completion convergence across parallel workstreams with statistical confidence intervals and early warning for trajectory deviations.',
    'ag-m04'),
  cj(504, 'S-MAND05', 'Objective Alignment Verifier', 93, 'MANDATE',
    'Validates that sub-task outputs collectively satisfy the original user objective using semantic similarity scoring and requirement traceability matrices.',
    'ag-m05'),
];

// ── DELEGATE ──
const DELEGATE_JEWELS: STierEntry[] = [
  cj(505, 'S-DELE01', 'Competency-Weighted Task Router', 97, 'DELEGATE',
    'Matches incoming tasks to agents using a multi-dimensional competency matrix that weights historical success rate, skill relevance, current load, and latency requirements.',
    'ag-d01'),
  cj(506, 'S-DELE02', 'Dynamic Load Balancer', 95, 'DELEGATE',
    'Real-time workload distribution engine using exponential moving average load metrics with overflow routing and automatic scale-out recommendations.',
    'ag-d02'),
  cj(507, 'S-DELE03', 'Escalation Cascade Router', 94, 'DELEGATE',
    'Multi-tier escalation pipeline that routes failed or stalled tasks through progressively more capable agents with automatic context enrichment at each tier.',
    'ag-d03'),
  cj(508, 'S-DELE04', 'Parallel Dispatch Orchestrator', 93, 'DELEGATE',
    'Identifies independent sub-tasks within a mission and dispatches them to multiple agents simultaneously, merging results with conflict resolution.',
    'ag-d04'),
  cj(509, 'S-DELE05', 'Bottleneck Prediction Engine', 92, 'DELEGATE',
    'Proactively identifies workflow bottlenecks before they occur using queueing theory models and recommends preemptive task redistribution.',
    'ag-d05'),
];

// ── RECONN ──
const RECONN_JEWELS: STierEntry[] = [
  cj(510, 'S-RECO01', 'Multi-Source Knowledge Synthesizer', 97, 'RECONN',
    'Aggregates information from heterogeneous sources (web, APIs, documents, databases) into unified knowledge graphs with source reliability weighting and conflict resolution.',
    'ag-r01'),
  cj(511, 'S-RECO02', 'Deep Web Crawler with Citation Chain', 96, 'RECONN',
    'Recursive web crawling engine that follows citation chains, extracts structured data, verifies source authority, and builds provenance-tracked research dossiers.',
    'ag-r02'),
  cj(512, 'S-RECO03', 'Source Verification Engine', 95, 'RECONN',
    'Cross-references claims against multiple authoritative sources with temporal freshness scoring, bias detection, and credibility classification.',
    'ag-r03'),
  cj(513, 'S-RECO04', 'Competitive Intelligence Harvester', 94, 'RECONN',
    'Systematic market and competitor analysis engine that monitors public signals, extracts patterns, and produces structured intelligence briefs.',
    'ag-r04'),
  cj(514, 'S-RECO05', 'Research Summarization Pipeline', 93, 'RECONN',
    'Multi-stage summarization pipeline that distills lengthy research into hierarchical abstracts with key finding extraction and relevance scoring.',
    'ag-r05'),
];

// ── UPLINK ──
const UPLINK_JEWELS: STierEntry[] = [
  cj(515, 'S-UPLI01', 'Structured Context Handoff Protocol', 97, 'UPLINK',
    'Zero-loss context transfer protocol between agents with semantic compression, priority tagging, and guaranteed delivery with acknowledgment receipts.',
    'ag-u01'),
  cj(516, 'S-UPLI02', 'Knowledge Broadcast Network', 95, 'UPLINK',
    'Pub-sub knowledge distribution system where agent discoveries are instantly broadcast to relevant team members based on topic subscriptions and expertise matching.',
    'ag-u02'),
  cj(517, 'S-UPLI03', 'Collaborative Reasoning Bus', 94, 'UPLINK',
    'Shared reasoning workspace where multiple agents contribute partial solutions, debate approaches, and converge on optimal strategies through structured dialogue.',
    'ag-u03'),
  cj(518, 'S-UPLI04', 'Shared Memory Synchronizer', 93, 'UPLINK',
    'CRDT-based shared memory layer ensuring eventual consistency across distributed agent memories with conflict-free merge operations.',
    'ag-u04'),
  cj(519, 'S-UPLI05', 'Event Propagation Fabric', 92, 'UPLINK',
    'High-throughput event bus propagating state changes, completions, and alerts across the agent fleet with configurable filtering and priority lanes.',
    'ag-u05'),
];

// ── SCRIBE ──
const SCRIBE_JEWELS: STierEntry[] = [
  cj(520, 'S-SCRI01', 'Professional Drafting Engine', 97, 'SCRIBE',
    'Context-aware professional writing engine producing reports, proposals, documentation, and correspondence calibrated to audience expertise and organizational style guides.',
    'ag-s01'),
  cj(521, 'S-SCRI02', 'Tone Calibration Matrix', 95, 'SCRIBE',
    'Dynamic tone adjustment system that modulates formality, urgency, empathy, and authority based on recipient analysis and communication context.',
    'ag-s02'),
  cj(522, 'S-SCRI03', 'Multi-Format Output Renderer', 94, 'SCRIBE',
    'Renders content into multiple output formats (markdown, HTML, PDF, email, social post) with format-specific optimization and accessibility compliance.',
    'ag-s03'),
  cj(523, 'S-SCRI04', 'Style Adaptation Engine', 93, 'SCRIBE',
    'Learns and replicates organizational writing styles from example documents, maintaining brand voice consistency across all agent-produced content.',
    'ag-s04'),
  cj(524, 'S-SCRI05', 'Content Structuring Architect', 92, 'SCRIBE',
    'Automatically structures long-form content with optimal heading hierarchies, paragraph flow, transition logic, and reader engagement patterns.',
    'ag-s05'),
];

// ── INCENTIVE ──
const INCENTIVE_JEWELS: STierEntry[] = [
  cj(525, 'S-INCE01', 'Skill Progression Ladder', 96, 'INCENTIVE',
    'Six-tier skill progression system tracking agent competency from Novice to Master with automated assessment gates and curriculum recommendations.',
    'ag-i01'),
  cj(526, 'S-INCE02', 'Reward Signal Designer', 95, 'INCENTIVE',
    'Configurable reward function builder that translates user-defined success criteria into measurable reinforcement signals for agent behavior optimization.',
    'ag-i02'),
  cj(527, 'S-INCE03', 'Achievement Milestone Engine', 94, 'INCENTIVE',
    'Gamified achievement system that recognizes agent accomplishments, tracks streaks, and provides visible progress indicators for team morale.',
    'ag-i03'),
  cj(528, 'S-INCE04', 'Performance Leaderboard Aggregator', 93, 'INCENTIVE',
    'Fleet-wide performance ranking system with multi-dimensional scoring (speed, quality, creativity, reliability) and historical trend analysis.',
    'ag-i04'),
  cj(529, 'S-INCE05', 'Feedback Loop Optimizer', 92, 'INCENTIVE',
    'Closed-loop feedback system that measures the impact of reward adjustments on agent behavior and automatically tunes incentive parameters.',
    'ag-i05'),
];

// ── REASON ──
const REASON_JEWELS: STierEntry[] = [
  cj(530, 'S-REAS01', 'Chain-of-Thought Validator', 97, 'REASON',
    'Validates multi-step reasoning chains for logical consistency, identifies gaps in inference, and produces confidence-weighted reasoning traces.',
    'ag-re01'),
  cj(531, 'S-REAS02', 'Fallacy Detection Engine', 96, 'REASON',
    'Pattern matcher for 30+ logical fallacy types including circular reasoning, false dichotomies, and appeal to authority with explanation generation.',
    'ag-re02'),
  cj(532, 'S-REAS03', 'Multi-Criteria Decision Analyzer', 95, 'REASON',
    'Structured decision framework using weighted criteria matrices, sensitivity analysis, and Pareto-optimal solution identification.',
    'ag-re03'),
  cj(533, 'S-REAS04', 'Hypothesis Testing Framework', 94, 'REASON',
    'Scientific method implementation for agent reasoning — generates hypotheses, designs tests, evaluates evidence, and updates beliefs using Bayesian inference.',
    'ag-re04'),
  cj(534, 'S-REAS05', 'Counterfactual Reasoning Engine', 93, 'REASON',
    'Explores alternative decision paths and their projected outcomes to evaluate strategy robustness and identify hidden risks.',
    'ag-re05'),
];

// ── TOOLKIT ──
const TOOLKIT_JEWELS: STierEntry[] = [
  cj(535, 'S-TOOL01', 'API Orchestration Layer', 97, 'TOOLKIT',
    'Multi-step API workflow engine that chains tool calls with data transformation, error handling, and retry logic for complex integrations.',
    'ag-t01'),
  cj(536, 'S-TOOL02', 'Function Call Validator', 96, 'TOOLKIT',
    'Schema-aware parameter validation engine that prevents malformed tool calls, infers missing parameters, and provides corrective suggestions.',
    'ag-t02'),
  cj(537, 'S-TOOL03', 'Tool Chain Composer', 95, 'TOOLKIT',
    'Automatically composes multi-tool pipelines from high-level intent descriptions, resolving data flow dependencies and format conversions.',
    'ag-t03'),
  cj(538, 'S-TOOL04', 'Output Parser with Error Recovery', 94, 'TOOLKIT',
    'Robust output parsing engine that handles malformed tool responses, extracts partial data, and triggers retries with modified parameters.',
    'ag-t04'),
  cj(539, 'S-TOOL05', 'Tool Discovery Scanner', 93, 'TOOLKIT',
    'Runtime tool capability scanner that indexes available APIs, matches them to task requirements, and recommends optimal tool selections.',
    'ag-t05'),
];

/* ═══════════════════════════════════════════════
   AGENTS (8 × 5 = 40 Crown Jewels)
   ═══════════════════════════════════════════════ */

// ── OPERATOR ──
const OPERATOR_JEWELS: STierEntry[] = [
  cj(540, 'S-OPER01', 'Zero-Direction Mission Executor', 97, 'OPERATOR',
    'Autonomous execution engine capable of completing complex missions from a single objective statement without intermediate human guidance.',
    'ag-o01'),
  cj(541, 'S-OPER02', 'Adaptive Strategy Pivot Engine', 96, 'OPERATOR',
    'Real-time strategy adaptation when initial approaches fail, using outcome analysis and alternative path generation without user intervention.',
    'ag-o02'),
  cj(542, 'S-OPER03', 'Progress Self-Monitor', 95, 'OPERATOR',
    'Continuous self-assessment engine tracking task completion percentage, quality metrics, and deadline adherence with autonomous course correction.',
    'ag-o03'),
  cj(543, 'S-OPER04', 'Error Recovery Orchestrator', 94, 'OPERATOR',
    'Multi-strategy error recovery with retry policies, fallback approaches, and graceful degradation when primary methods are unavailable.',
    'ag-o04'),
  cj(544, 'S-OPER05', 'Resource Optimization Planner', 93, 'OPERATOR',
    'Minimizes compute, time, and API call expenditure while maintaining output quality through intelligent caching and batch processing.',
    'ag-o05'),
];

// ── OVERSEER ──
const OVERSEER_JEWELS: STierEntry[] = [
  cj(545, 'S-SNTL01', 'Fleet Health Pulse Monitor', 97, 'OVERSEER',
    'Continuous health monitoring across all active agents with EMA-smoothed metrics, anomaly detection, and predictive failure alerts.',
    'ag-sn01'),
  cj(546, 'S-SNTL02', 'Self-Healing Protocol Engine', 96, 'OVERSEER',
    'Autonomous repair protocols for degraded agents including state reconstruction, memory recovery, and capability reinitialization.',
    'ag-sn02'),
  cj(547, 'S-SNTL03', 'Graceful Degradation Controller', 95, 'OVERSEER',
    'Staged capability reduction during system stress with priority-based feature shedding and guaranteed core functionality preservation.',
    'ag-sn03'),
  cj(548, 'S-SNTL04', 'Circuit Breaker Mesh', 94, 'OVERSEER',
    'Fleet-wide circuit breaker network preventing cascade failures with configurable trip thresholds, half-open testing, and recovery tracking.',
    'ag-sn04'),
  cj(549, 'S-SNTL05', 'Failure Prediction Model', 93, 'OVERSEER',
    'Predictive failure analysis using historical telemetry patterns, resource utilization trends, and environmental signal correlation.',
    'ag-sn05'),
];

// ── LIAISON ──
const LIAISON_JEWELS: STierEntry[] = [
  cj(550, 'S-DIPL01', 'Conflict Resolution Protocol', 96, 'LIAISON',
    'Structured conflict resolution when agents produce contradictory results, using evidence weighting, confidence scoring, and consensus voting.',
    'ag-dp01'),
  cj(551, 'S-DIPL02', 'Consensus Building Engine', 95, 'LIAISON',
    'Multi-round consensus protocol for distributed agent decisions with weighted voting, minority report preservation, and deadlock breaking.',
    'ag-dp02'),
  cj(552, 'S-DIPL03', 'Team Formation Optimizer', 94, 'LIAISON',
    'Dynamic team assembly engine that composes optimal agent groups for specific mission types based on skill complementarity and collaboration history.',
    'ag-dp03'),
  cj(553, 'S-DIPL04', 'Role Negotiation Framework', 93, 'LIAISON',
    'Agent role assignment through structured negotiation where agents bid on tasks based on self-assessed competency and workload capacity.',
    'ag-dp04'),
  cj(554, 'S-DIPL05', 'Collaborative Decision Protocol', 92, 'LIAISON',
    'Formal decision-making framework for group choices with structured argumentation, devil\'s advocate injection, and decision audit trails.',
    'ag-dp05'),
];

// ── SCHOLAR ──
const SCHOLAR_JEWELS: STierEntry[] = [
  cj(555, 'S-SCHL01', 'Skill Acquisition Engine', 97, 'SCHOLAR',
    'Automated skill learning pipeline that extracts transferable patterns from completed tasks and integrates them into the agent\'s capability model.',
    'ag-sc01'),
  cj(556, 'S-SCHL02', 'Knowledge Distillation Pipeline', 96, 'SCHOLAR',
    'Compresses complex domain knowledge into actionable heuristics optimized for fast recall and application in time-constrained scenarios.',
    'ag-sc02'),
  cj(557, 'S-SCHL03', 'Curriculum Generator', 95, 'SCHOLAR',
    'Dynamically generates personalized learning curricula based on skill gaps, mission requirements, and peer performance benchmarks.',
    'ag-sc03'),
  cj(558, 'S-SCHL04', 'Competency Assessment Matrix', 94, 'SCHOLAR',
    'Multi-dimensional competency evaluation using practical task performance, knowledge tests, and peer review with calibrated scoring rubrics.',
    'ag-sc04'),
  cj(559, 'S-SCHL05', 'Pattern Learning Accelerator', 93, 'SCHOLAR',
    'Few-shot learning engine that rapidly generalizes from limited examples, identifying transferable patterns across domains.',
    'ag-sc05'),
];

// ── HERALD ──
const ENVOY_JEWELS: STierEntry[] = [
  cj(560, 'S-ENVY01', 'Adaptive Progress Reporter', 96, 'ENVOY',
    'Context-aware progress reporting that adjusts detail level, technical depth, and update frequency based on user preferences and urgency.',
    'ag-h01'),
  cj(561, 'S-ENVY02', 'Technical Result Translator', 95, 'ENVOY',
    'Translates complex technical outputs into clear, audience-appropriate summaries with optional deep-dive sections for technical stakeholders.',
    'ag-h02'),
  cj(562, 'S-ENVY03', 'Expectation Alignment Engine', 94, 'ENVOY',
    'Proactively manages user expectations by communicating capability boundaries, estimated completion times, and potential limitations.',
    'ag-h03'),
  cj(563, 'S-ENVY04', 'Notification Priority Router', 93, 'ENVOY',
    'Intelligent notification system that filters, prioritizes, and batches updates to minimize user interruption while ensuring critical alerts surface.',
    'ag-h04'),
  cj(564, 'S-ENVY05', 'Status Dashboard Composer', 92, 'ENVOY',
    'Real-time status visualization generator producing summary dashboards of agent fleet activity, mission progress, and system health.',
    'ag-h05'),
];

// ── WARDEN ──
const WARDEN_JEWELS: STierEntry[] = [
  cj(565, 'S-WARD01', 'Safety Boundary Enforcer', 97, 'WARDEN',
    'Hard-gated safety boundary system preventing agents from exceeding authorized scope, accessing restricted resources, or executing prohibited actions.',
    'ag-w01'),
  cj(566, 'S-WARD02', 'Permission Validation Layer', 96, 'WARDEN',
    'Fine-grained permission checker that validates every agent action against user-defined access policies and role-based authorization matrices.',
    'ag-w02'),
  cj(567, 'S-WARD03', 'Action Audit Trail', 95, 'WARDEN',
    'Immutable audit log of all agent actions with full context capture, enabling post-hoc review, compliance reporting, and forensic analysis.',
    'ag-w03'),
  cj(568, 'S-WARD04', 'Ethical Constraint Enforcer', 94, 'WARDEN',
    'Ethical guardrail system that intercepts actions violating configured ethical boundaries with explanation generation and alternative suggestions.',
    'ag-w04'),
  cj(569, 'S-WARD05', 'Scope Containment Shield', 93, 'WARDEN',
    'Dynamic scope boundary enforcement that prevents mission creep, unauthorized capability expansion, and resource usage beyond allocation.',
    'ag-w05'),
];

// ── ROGUE ──
const ROGUE_JEWELS: STierEntry[] = [
  cj(570, 'S-ROGU01', 'Lateral Thinking Generator', 96, 'ROGUE',
    'Explores unconventional solution paths by deliberately violating default assumptions and re-framing problems from novel perspectives.',
    'ag-rg01'),
  cj(571, 'S-ROGU02', 'Creative Synthesis Engine', 95, 'ROGUE',
    'Combines concepts from unrelated domains to produce novel approaches when conventional methods are exhausted or suboptimal.',
    'ag-rg02'),
  cj(572, 'S-ROGU03', 'Divergent Exploration Scout', 94, 'ROGUE',
    'Parallel exploration agent that simultaneously investigates multiple unconventional solution paths with rapid feasibility filtering.',
    'ag-rg03'),
  cj(573, 'S-ROGU04', 'Novel Strategy Synthesizer', 93, 'ROGUE',
    'Generates novel task execution strategies by remixing successful patterns from historically dissimilar mission types.',
    'ag-rg04'),
  cj(574, 'S-ROGU05', 'Assumption Challenger', 92, 'ROGUE',
    'Systematically identifies and challenges implicit assumptions in the current plan, surfacing hidden risks and alternative framings.',
    'ag-rg05'),
];

// ── ANCHOR ──
const ANCHOR_JEWELS: STierEntry[] = [
  cj(575, 'S-ANCH01', 'Session Continuity Engine', 97, 'ANCHOR',
    'Maintains full mission context across session boundaries with intelligent compression, priority-based retention, and seamless resumption.',
    'ag-a01'),
  cj(576, 'S-ANCH02', 'Long-Term Knowledge Index', 96, 'ANCHOR',
    'Persistent knowledge base with semantic indexing, temporal decay management, and relevance-ranked retrieval for multi-session workflows.',
    'ag-a02'),
  cj(577, 'S-ANCH03', 'Context Preservation Shield', 95, 'ANCHOR',
    'Protects critical context from being lost during agent restarts, scaling events, or memory pressure with tiered retention policies.',
    'ag-a03'),
  cj(578, 'S-ANCH04', 'Recall Optimization Engine', 94, 'ANCHOR',
    'Spaced repetition and importance-weighted recall system ensuring the most relevant past experiences surface when needed.',
    'ag-a04'),
  cj(579, 'S-ANCH05', 'Cross-Session Pattern Tracker', 93, 'ANCHOR',
    'Identifies recurring patterns across multiple sessions and missions, building user preference models and workflow templates.',
    'ag-a05'),
];

/* ═══════════════════════════════════════════════
   ASSEMBLED REGISTRY
   ═══════════════════════════════════════════════ */

export const AGENCY_CROWN_JEWELS: STierEntry[] = [
  ...MANDATE_JEWELS,
  ...DELEGATE_JEWELS,
  ...RECONN_JEWELS,
  ...UPLINK_JEWELS,
  ...SCRIBE_JEWELS,
  ...INCENTIVE_JEWELS,
  ...REASON_JEWELS,
  ...TOOLKIT_JEWELS,
  ...OPERATOR_JEWELS,
  ...OVERSEER_JEWELS,
  ...LIAISON_JEWELS,
  ...SCHOLAR_JEWELS,
  ...ENVOY_JEWELS,
  ...WARDEN_JEWELS,
  ...ROGUE_JEWELS,
  ...ANCHOR_JEWELS,
];

/* ─── Query Helpers ─── */

export function getAgencyJewelsByPrimitive(primitiveId: string): STierEntry[] {
  return AGENCY_CROWN_JEWELS.filter(j => j.module === primitiveId);
}

export function getAgencyJewelSummary(): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const j of AGENCY_CROWN_JEWELS) {
    summary[j.module] = (summary[j.module] ?? 0) + 1;
  }
  return summary;
}
