/**
 * CMPSBL AGENCY™ — A-Tier Crown Jewel Vault
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 80 A-Tier Crown Jewels: 5 per each of the 16 agency primitives.
 * CJPI range: 85–91. Governor-curated, Architecture-class.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { STierEntry } from '../types';

function cj(
  rank: number, id: string, name: string, cjpi: number,
  module: string, description: string, sig: string,
): STierEntry {
  return {
    rank, id, name, cjpi, module,
    type: 'Architecture',
    cluster: 'A-Tier',
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
   ENGINES (8 × 5 = 40 A-Tier Crown Jewels)
   ═══════════════════════════════════════════════ */

// ── MANDATE ──
const MANDATE: STierEntry[] = [
  cj(5001, 'A-MAN01', 'Constraint Satisfaction Planner', 91, 'MANDATE', 'Solves multi-constraint mission planning using arc consistency and backtracking with intelligent variable ordering.', 'ag-mn01'),
  cj(5002, 'A-MAN02', 'Deadline Feasibility Analyzer', 90, 'MANDATE', 'Evaluates deadline feasibility using critical path analysis with probabilistic task duration estimation.', 'ag-mn02'),
  cj(5003, 'A-MAN03', 'Objective Conflict Resolver', 89, 'MANDATE', 'Resolves conflicting objectives using Pareto optimization with configurable trade-off preferences.', 'ag-mn03'),
  cj(5004, 'A-MAN04', 'Mission Abort Criteria Engine', 88, 'MANDATE', 'Defines and monitors mission abort conditions with safe-state transition planning and rollback coordination.', 'ag-mn04'),
  cj(5005, 'A-MAN05', 'Resource Allocation Optimizer', 86, 'MANDATE', 'Optimizes resource allocation across parallel missions using mixed-integer programming with preemption.', 'ag-mn05'),
];

// ── DELEGATE ──
const DELEGATE: STierEntry[] = [
  cj(5006, 'A-DEL01', 'Skill Gap Analyzer', 91, 'DELEGATE', 'Identifies skill gaps in the agent pool relative to incoming task requirements and recommends training targets.', 'ag-dl01'),
  cj(5007, 'A-DEL02', 'Delegation Chain Optimizer', 90, 'DELEGATE', 'Optimizes multi-hop delegation chains to minimize latency and maximize task completion probability.', 'ag-dl02'),
  cj(5008, 'A-DEL03', 'Workload Fairness Balancer', 89, 'DELEGATE', 'Ensures equitable workload distribution across agents using max-min fairness with priority adjustments.', 'ag-dl03'),
  cj(5009, 'A-DEL04', 'Capability Matching Engine', 88, 'DELEGATE', 'Matches task requirements to agent capabilities using semantic similarity with hard constraint enforcement.', 'ag-dl04'),
  cj(5010, 'A-DEL05', 'Escalation Path Router', 86, 'DELEGATE', 'Routes failed or stalled tasks through escalation hierarchies with context-preserving handoff protocols.', 'ag-dl05'),
];

// ── RECONN ──
const RECONN: STierEntry[] = [
  cj(5011, 'A-RCN01', 'Multi-Source Intelligence Fuser', 91, 'RECONN', 'Fuses intelligence from web scraping, APIs, and databases using credibility-weighted evidence aggregation.', 'ag-rc01'),
  cj(5012, 'A-RCN02', 'Competitive Intelligence Tracker', 90, 'RECONN', 'Monitors competitor activities and market shifts with automated alert generation and trend analysis.', 'ag-rc02'),
  cj(5013, 'A-RCN03', 'Information Freshness Scorer', 89, 'RECONN', 'Scores information recency and relevance decay using domain-specific half-life models.', 'ag-rc03'),
  cj(5014, 'A-RCN04', 'Source Reliability Calibrator', 88, 'RECONN', 'Calibrates information source reliability from historical accuracy tracking and cross-validation.', 'ag-rc04'),
  cj(5015, 'A-RCN05', 'Research Gap Identifier', 86, 'RECONN', 'Identifies gaps in collected intelligence and generates targeted research queries to fill them.', 'ag-rc05'),
];

// ── UPLINK ──
const UPLINK: STierEntry[] = [
  cj(5016, 'A-UPL01', 'API Schema Auto-Discoverer', 91, 'UPLINK', 'Automatically discovers and maps API schemas from documentation, OpenAPI specs, and runtime introspection.', 'ag-up01'),
  cj(5017, 'A-UPL02', 'Rate Limit Coordinator', 90, 'UPLINK', 'Coordinates API rate limit consumption across multiple agents to prevent global limit exhaustion.', 'ag-up02'),
  cj(5018, 'A-UPL03', 'Authentication Token Manager', 89, 'UPLINK', 'Manages OAuth tokens, API keys, and session credentials with automatic refresh and rotation.', 'ag-up03'),
  cj(5019, 'A-UPL04', 'API Response Cache Manager', 88, 'UPLINK', 'Implements intelligent API response caching with TTL management and cache invalidation signals.', 'ag-up04'),
  cj(5020, 'A-UPL05', 'Webhook Subscription Manager', 86, 'UPLINK', 'Manages webhook subscriptions across external services with delivery verification and retry handling.', 'ag-up05'),
];

// ── SCRIBE ──
const SCRIBE: STierEntry[] = [
  cj(5021, 'A-SCR01', 'Structured Report Composer', 91, 'SCRIBE', 'Composes structured reports from raw agent outputs with configurable templates and audience adaptation.', 'ag-sc01'),
  cj(5022, 'A-SCR02', 'Meeting Minutes Synthesizer', 90, 'SCRIBE', 'Synthesizes action items and decisions from meeting transcripts with responsibility assignment tracking.', 'ag-sc02'),
  cj(5023, 'A-SCR03', 'Multi-Format Export Engine', 89, 'SCRIBE', 'Exports deliverables in multiple formats (PDF, DOCX, Markdown, HTML) with consistent styling.', 'ag-sc03'),
  cj(5024, 'A-SCR04', 'Version History Tracker', 88, 'SCRIBE', 'Maintains version history of all generated documents with diff visualization and rollback capability.', 'ag-sc04'),
  cj(5025, 'A-SCR05', 'Citation Formatter', 86, 'SCRIBE', 'Formats citations and references in multiple academic styles (APA, MLA, Chicago) with source verification.', 'ag-sc05'),
];

// ── INCENTIVE ──
const INCENTIVE: STierEntry[] = [
  cj(5026, 'A-INC01', 'Performance Reward Calculator', 91, 'INCENTIVE', 'Calculates agent performance rewards using multi-objective scoring with diminishing returns modeling.', 'ag-ic01'),
  cj(5027, 'A-INC02', 'Cooperative Behavior Reinforcer', 90, 'INCENTIVE', 'Reinforces cooperative multi-agent behaviors using team-based reward shaping and social welfare functions.', 'ag-ic02'),
  cj(5028, 'A-INC03', 'Learning Velocity Tracker', 89, 'INCENTIVE', 'Tracks agent learning velocity and adjusts difficulty curves to maintain optimal challenge levels.', 'ag-ic03'),
  cj(5029, 'A-INC04', 'Cost-Benefit Decision Gate', 88, 'INCENTIVE', 'Gates agent actions through cost-benefit analysis ensuring positive expected value before execution.', 'ag-ic04'),
  cj(5030, 'A-INC05', 'Exploration-Exploitation Balancer', 86, 'INCENTIVE', 'Balances exploration of new approaches versus exploitation of known-good strategies using UCB algorithms.', 'ag-ic05'),
];

// ── REASON ──
const REASON: STierEntry[] = [
  cj(5031, 'A-RSN01', 'Chain-of-Thought Orchestrator', 91, 'REASON', 'Orchestrates multi-step reasoning chains with intermediate verification and branch-and-bound pruning.', 'ag-rs01'),
  cj(5032, 'A-RSN02', 'Hypothesis Generation Engine', 90, 'REASON', 'Generates competing hypotheses for ambiguous situations using abductive reasoning frameworks.', 'ag-rs02'),
  cj(5033, 'A-RSN03', 'Evidence Weighting Arbitrator', 89, 'REASON', 'Weighs conflicting evidence using Bayesian updating with prior calibration and likelihood estimation.', 'ag-rs03'),
  cj(5034, 'A-RSN04', 'Decision Tree Pruner', 88, 'REASON', 'Prunes decision trees by eliminating dominated options and collapsing equivalent branches for faster decisions.', 'ag-rs04'),
  cj(5035, 'A-RSN05', 'Assumption Validation Engine', 86, 'REASON', 'Explicitly identifies and validates hidden assumptions in agent reasoning chains before conclusion.', 'ag-rs05'),
];

// ── TOOLKIT ──
const TOOLKIT: STierEntry[] = [
  cj(5036, 'A-TLK01', 'Tool Selection Optimizer', 91, 'TOOLKIT', 'Selects optimal tools for tasks using capability matching with cost and latency awareness.', 'ag-tk01'),
  cj(5037, 'A-TLK02', 'Tool Composition Engine', 90, 'TOOLKIT', 'Composes multi-tool workflows by chaining tool outputs to inputs with type compatibility validation.', 'ag-tk02'),
  cj(5038, 'A-TLK03', 'Sandbox Execution Governor', 89, 'TOOLKIT', 'Governs tool execution in sandboxed environments with resource limits and output validation.', 'ag-tk03'),
  cj(5039, 'A-TLK04', 'Tool Feedback Loop Manager', 88, 'TOOLKIT', 'Manages feedback loops between tool outputs and agent decision-making for iterative refinement.', 'ag-tk04'),
  cj(5040, 'A-TLK05', 'Dynamic Tool Registration', 86, 'TOOLKIT', 'Registers new tools at runtime with automatic capability indexing and permission configuration.', 'ag-tk05'),
];

/* ═══════════════════════════════════════════════
   AGENTS (8 × 5 = 40 A-Tier Crown Jewels)
   ═══════════════════════════════════════════════ */

// ── OPERATOR ──
const OPERATOR: STierEntry[] = [
  cj(5041, 'A-OPR01', 'Autonomous Workflow Executor', 91, 'OPERATOR', 'Executes complex multi-step workflows with checkpoint-based recovery and partial completion tracking.', 'ag-op01'),
  cj(5042, 'A-OPR02', 'Error Recovery Strategist', 90, 'OPERATOR', 'Generates error recovery strategies from failure context using pattern matching against historical resolutions.', 'ag-op02'),
  cj(5043, 'A-OPR03', 'Progress Reporting Engine', 89, 'OPERATOR', 'Generates human-readable progress reports with ETA estimation and blocker identification.', 'ag-op03'),
  cj(5044, 'A-OPR04', 'Context Preservation Manager', 88, 'OPERATOR', 'Preserves operational context across agent restarts and handoffs using serializable state snapshots.', 'ag-op04'),
  cj(5045, 'A-OPR05', 'Parallel Execution Coordinator', 86, 'OPERATOR', 'Coordinates parallel task execution with dependency-aware scheduling and result aggregation.', 'ag-op05'),
];

// ── SENTINEL ──
const SENTINEL_A: STierEntry[] = [
  cj(5046, 'A-SNT01', 'Agent Behavior Anomaly Detector', 91, 'SENTINEL', 'Detects anomalous agent behaviors that deviate from expected operational patterns using statistical profiling.', 'ag-sn01'),
  cj(5047, 'A-SNT02', 'Resource Abuse Prevention Engine', 90, 'SENTINEL', 'Prevents resource abuse by monitoring agent consumption patterns and enforcing usage quotas.', 'ag-sn02'),
  cj(5048, 'A-SNT03', 'Hallucination Guard for Agents', 89, 'SENTINEL', 'Validates agent claims and assertions against factual sources before they propagate to outputs.', 'ag-sn03'),
  cj(5049, 'A-SNT04', 'Permission Boundary Enforcer', 88, 'SENTINEL', 'Enforces strict permission boundaries preventing agents from accessing unauthorized data or tools.', 'ag-sn04'),
  cj(5050, 'A-SNT05', 'Watchdog Timer Controller', 86, 'SENTINEL', 'Monitors agent execution timeouts and triggers safe termination for runaway processes.', 'ag-sn05'),
];

// ── DIPLOMAT ──
const DIPLOMAT: STierEntry[] = [
  cj(5051, 'A-DIP01', 'Inter-Agent Protocol Negotiator', 91, 'DIPLOMAT', 'Negotiates communication protocols and data formats between heterogeneous agent implementations.', 'ag-dp01'),
  cj(5052, 'A-DIP02', 'Conflict Resolution Mediator', 90, 'DIPLOMAT', 'Mediates conflicts between agents with competing objectives using Nash bargaining solutions.', 'ag-dp02'),
  cj(5053, 'A-DIP03', 'Consensus Building Engine', 89, 'DIPLOMAT', 'Builds consensus among agent groups using voting mechanisms and preference aggregation.', 'ag-dp03'),
  cj(5054, 'A-DIP04', 'Cross-Team Communication Bridge', 88, 'DIPLOMAT', 'Translates communication between agent teams with different domain vocabularies and abstractions.', 'ag-dp04'),
  cj(5055, 'A-DIP05', 'Alliance Formation Strategist', 86, 'DIPLOMAT', 'Identifies beneficial agent alliances for complex tasks using cooperative game theory analysis.', 'ag-dp05'),
];

// ── SCHOLAR ──
const SCHOLAR: STierEntry[] = [
  cj(5056, 'A-SCH01', 'Literature Review Automator', 91, 'SCHOLAR', 'Automates systematic literature reviews with paper discovery, relevance scoring, and synthesis generation.', 'ag-sh01'),
  cj(5057, 'A-SCH02', 'Knowledge Graph Builder', 90, 'SCHOLAR', 'Constructs domain knowledge graphs from unstructured text with entity extraction and relation mapping.', 'ag-sh02'),
  cj(5058, 'A-SCH03', 'Research Methodology Advisor', 89, 'SCHOLAR', 'Recommends appropriate research methodologies based on question type and available data characteristics.', 'ag-sh03'),
  cj(5059, 'A-SCH04', 'Statistical Analysis Planner', 88, 'SCHOLAR', 'Plans statistical analyses by matching research questions to appropriate tests with assumption checking.', 'ag-sh04'),
  cj(5060, 'A-SCH05', 'Insight Extraction Engine', 86, 'SCHOLAR', 'Extracts actionable insights from research findings with confidence scoring and practical recommendations.', 'ag-sh05'),
];

// ── ENVOY ──
const ENVOY: STierEntry[] = [
  cj(5061, 'A-ENV01', 'Stakeholder Communication Adapter', 91, 'ENVOY', 'Adapts agent communications to stakeholder technical levels and communication preferences.', 'ag-en01'),
  cj(5062, 'A-ENV02', 'Status Update Composer', 90, 'ENVOY', 'Composes context-appropriate status updates at configurable detail levels for different audiences.', 'ag-en02'),
  cj(5063, 'A-ENV03', 'Feedback Collection Orchestrator', 89, 'ENVOY', 'Orchestrates structured feedback collection from users with sentiment analysis and action item extraction.', 'ag-en03'),
  cj(5064, 'A-ENV04', 'Notification Priority Router', 88, 'ENVOY', 'Routes notifications based on urgency, recipient preferences, and channel availability.', 'ag-en04'),
  cj(5065, 'A-ENV05', 'External Integration Ambassador', 86, 'ENVOY', 'Manages agent presence and communication through external platforms (Slack, email, webhooks).', 'ag-en05'),
];

// ── WARDEN ──
const WARDEN: STierEntry[] = [
  cj(5066, 'A-WRD01', 'Agent Lifecycle Governor', 91, 'WARDEN', 'Governs agent lifecycle states (spawn, activate, suspend, terminate) with resource cleanup guarantees.', 'ag-wd01'),
  cj(5067, 'A-WRD02', 'Memory Leak Prevention Engine', 90, 'WARDEN', 'Monitors agent memory consumption patterns and triggers garbage collection before resource exhaustion.', 'ag-wd02'),
  cj(5068, 'A-WRD03', 'Configuration Drift Detector', 89, 'WARDEN', 'Detects configuration drift from baseline agent settings and alerts on unauthorized modifications.', 'ag-wd03'),
  cj(5069, 'A-WRD04', 'Health Check Orchestrator', 88, 'WARDEN', 'Orchestrates deep health checks across agent subsystems with dependency-aware failure propagation analysis.', 'ag-wd04'),
  cj(5070, 'A-WRD05', 'Rolling Update Controller', 86, 'WARDEN', 'Manages rolling agent updates with canary deployments and automatic rollback on degradation.', 'ag-wd05'),
];

// ── ROGUE ──
const ROGUE: STierEntry[] = [
  cj(5071, 'A-ROG01', 'Unconventional Strategy Generator', 91, 'ROGUE', 'Generates unconventional problem-solving strategies by inverting assumptions and exploring contrarian approaches.', 'ag-rg01'),
  cj(5072, 'A-ROG02', 'Lateral Thinking Catalyst', 90, 'ROGUE', 'Triggers lateral thinking by introducing random concept associations and cross-domain analogies.', 'ag-rg02'),
  cj(5073, 'A-ROG03', 'Devil Advocate Engine', 89, 'ROGUE', 'Systematically challenges consensus positions by generating strongest possible counterarguments.', 'ag-rg03'),
  cj(5074, 'A-ROG04', 'Risk Appetite Calibrator', 88, 'ROGUE', 'Calibrates risk tolerance for creative exploration while maintaining safety guardrails.', 'ag-rg04'),
  cj(5075, 'A-ROG05', 'Serendipity Generator', 86, 'ROGUE', 'Creates conditions for serendipitous discoveries by connecting unrelated data points and patterns.', 'ag-rg05'),
];

// ── ANCHOR ──
const ANCHOR: STierEntry[] = [
  cj(5076, 'A-ANC01', 'State Persistence Manager', 91, 'ANCHOR', 'Manages durable agent state persistence with conflict-free replicated data types for consistency.', 'ag-an01'),
  cj(5077, 'A-ANC02', 'Checkpoint Snapshot Engine', 90, 'ANCHOR', 'Creates point-in-time agent state snapshots with delta compression for storage efficiency.', 'ag-an02'),
  cj(5078, 'A-ANC03', 'Session Recovery Orchestrator', 89, 'ANCHOR', 'Recovers interrupted agent sessions from checkpoints with context reconstruction and task resumption.', 'ag-an03'),
  cj(5079, 'A-ANC04', 'Knowledge Retention Optimizer', 88, 'ANCHOR', 'Optimizes long-term knowledge retention using spaced repetition and importance-weighted memory consolidation.', 'ag-an04'),
  cj(5080, 'A-ANC05', 'Cross-Session Learning Accumulator', 86, 'ANCHOR', 'Accumulates learning across sessions with deduplication and contradiction resolution for persistent improvement.', 'ag-an05'),
];

export const AGENCY_ATIER_JEWELS: STierEntry[] = [
  ...MANDATE, ...DELEGATE, ...RECONN, ...UPLINK,
  ...SCRIBE, ...INCENTIVE, ...REASON, ...TOOLKIT,
  ...OPERATOR, ...SENTINEL_A, ...DIPLOMAT, ...SCHOLAR,
  ...ENVOY, ...WARDEN, ...ROGUE, ...ANCHOR,
];
