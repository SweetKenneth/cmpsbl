/**
 * CMPSBL® Agency Vertical Substrate
 * 
 * Subdomain: agency.cmpsbl.com
 * 
 * The Agency Vertical is purpose-built for autonomous AI agent teams.
 * Every primitive maps to a core competency that agents need to complete
 * user missions with minimal direction — research, collaboration,
 * communication, self-healing, and governed autonomy.
 * 
 * Hot-swapped Engines (8):
 *   MANDATE   — Mission decomposition and autonomous task planning
 *   DELEGATE  — Skill-based task routing and workload distribution
 *   RECON     — Deep research, web crawling, and knowledge synthesis
 *   UPLINK    — Inter-agent communication bus and knowledge sharing
 *   SCRIBE    — Writing, drafting, and content generation engine
 *   INCENTIVE — Reward programs, reinforcement loops, and skill progression
 *   REASON    — Chain-of-thought reasoning and decision-making engine
 *   TOOLKIT   — Tool use orchestration and API integration layer
 * 
 * Hot-swapped Agents (8):
 *   OPERATOR  — Autonomous mission executor with minimal direction
 *   OVERSEER  — Agent health monitor, self-healing, and graceful degradation
 *   LIAISON   — Teamwork coordination and conflict resolution
 *   SCHOLAR   — Continuous skill acquisition and knowledge distillation
 *   ENVOY    — User-facing communication and progress reporting
 *   WARDEN    — Governance enforcement and safety boundary agent
 *   ROGUE     — Creative problem-solving and unconventional approach agent
 *   ANCHOR    — Context persistence and long-term memory agent
 * 
 * © CMPSBL® — All rights reserved.
 */

import type { VerticalPrimitive, VerticalSubstrateConfig } from '../vertical-substrate';
import { getSpinePrimitives, assembleVerticalPrimitives } from '../vertical-substrate';
import { AGENCY_CROWN_JEWELS, getAgencyJewelsByPrimitive, getAgencyJewelSummary } from '@/crownjewels/agency-vertical-registry';
import type { STierEntry } from '@/crownjewels/types';

/* ─── Agency Engines ─── */

const AGENCY_ENGINES: VerticalPrimitive[] = [
  {
    id: 'MANDATE',
    name: 'MANDATE',
    role: 'engine',
    description: 'Mission decomposition and autonomous task planning engine. Breaks complex user objectives into executable sub-tasks with dependency graphs, priority scoring, and deadline-aware scheduling.',
    inherited: false,
    replaces: 'CORTEX',
    capabilities: [
      'mission_decomposition',
      'task_dependency_graphing',
      'priority_scoring',
      'deadline_scheduling',
      'objective_alignment',
      'milestone_tracking',
      'autonomous_replanning',
    ],
    weight: 0.035,
    classification: 'active',
  },
  {
    id: 'DELEGATE',
    name: 'DELEGATE',
    role: 'engine',
    description: 'Skill-based task routing and workload distribution engine. Matches tasks to the most competent agent based on skill matrices, current load, and historical success rates.',
    inherited: false,
    replaces: 'ARCHITECT',
    capabilities: [
      'skill_based_routing',
      'workload_balancing',
      'competency_matching',
      'escalation_routing',
      'parallel_dispatch',
      'bottleneck_detection',
    ],
    weight: 0.030,
    classification: 'active',
  },
  {
    id: 'RECONN',
    name: 'RECONN',
    role: 'engine',
    description: 'Deep research engine for web crawling, knowledge synthesis, source verification, and multi-domain information gathering with citation tracking.',
    inherited: false,
    capabilities: [
      'web_crawling',
      'knowledge_synthesis',
      'source_verification',
      'citation_tracking',
      'multi_source_aggregation',
      'research_summarization',
      'competitive_intelligence',
    ],
    weight: 0.030,
    classification: 'active',
  },
  {
    id: 'UPLINK',
    name: 'UPLINK',
    role: 'engine',
    description: 'Inter-agent communication bus enabling structured knowledge sharing, context handoffs, and collaborative reasoning across the agent fleet.',
    inherited: false,
    capabilities: [
      'inter_agent_messaging',
      'context_handoff',
      'knowledge_broadcast',
      'collaborative_reasoning',
      'shared_memory_sync',
      'event_propagation',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'SCRIBE',
    name: 'SCRIBE',
    role: 'engine',
    description: 'Writing and content generation engine optimized for professional drafting, editing, tone calibration, and multi-format output production.',
    inherited: false,
    capabilities: [
      'professional_drafting',
      'tone_calibration',
      'multi_format_output',
      'grammar_enforcement',
      'style_adaptation',
      'content_structuring',
      'plagiarism_avoidance',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'INCENTIVE',
    name: 'INCENTIVE',
    role: 'engine',
    description: 'Reward and reinforcement engine implementing skill progression tracking, performance-based incentives, and gamified learning loops for agent improvement.',
    inherited: false,
    capabilities: [
      'reward_distribution',
      'skill_progression_tracking',
      'performance_incentives',
      'gamified_learning',
      'achievement_milestones',
      'feedback_loops',
    ],
    weight: 0.020,
    classification: 'active',
  },
  {
    id: 'REASON',
    name: 'REASON',
    role: 'engine',
    description: 'Chain-of-thought reasoning and structured decision-making engine. Validates logic chains, detects fallacies, and produces explainable decision trails.',
    inherited: false,
    capabilities: [
      'chain_of_thought',
      'logical_validation',
      'fallacy_detection',
      'decision_trails',
      'hypothesis_testing',
      'multi_criteria_analysis',
      'counterfactual_reasoning',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'TOOLKIT',
    name: 'TOOLKIT',
    role: 'engine',
    description: 'Tool use orchestration engine managing API integrations, function calling, parameter validation, and multi-step tool chains for complex workflows.',
    inherited: false,
    capabilities: [
      'api_orchestration',
      'function_calling',
      'parameter_validation',
      'tool_chain_execution',
      'output_parsing',
      'retry_with_backoff',
      'tool_discovery',
    ],
    weight: 0.025,
    classification: 'active',
  },
];

/* ─── Agency Agents ─── */

const AGENCY_AGENTS: VerticalPrimitive[] = [
  {
    id: 'OPERATOR',
    name: 'OPERATOR',
    role: 'agent',
    description: 'Autonomous mission executor capable of completing complex objectives with minimal human direction. Self-monitors progress and adapts strategy in real-time.',
    inherited: false,
    capabilities: [
      'autonomous_execution',
      'progress_self_monitoring',
      'strategy_adaptation',
      'error_recovery',
      'resource_optimization',
    ],
    weight: 0.030,
    classification: 'active',
  },
  {
    id: 'OVERSEER',
    name: 'OVERSEER',
    role: 'agent',
    description: 'Agent health monitor implementing self-healing protocols, graceful degradation, circuit breakers, and fleet-wide resilience orchestration.',
    inherited: false,
    capabilities: [
      'health_monitoring',
      'self_healing',
      'graceful_degradation',
      'circuit_breaking',
      'fleet_resilience',
      'failure_prediction',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'LIAISON',
    name: 'LIAISON',
    role: 'agent',
    description: 'Teamwork coordination agent handling conflict resolution between agents, consensus building, and collaborative decision protocols.',
    inherited: false,
    capabilities: [
      'conflict_resolution',
      'consensus_building',
      'collaborative_decisions',
      'role_negotiation',
      'team_formation',
    ],
    weight: 0.020,
    classification: 'active',
  },
  {
    id: 'SCHOLAR',
    name: 'SCHOLAR',
    role: 'agent',
    description: 'Continuous skill acquisition agent that distills knowledge from completed tasks, learns new communication patterns, and builds expertise over time.',
    inherited: false,
    capabilities: [
      'skill_acquisition',
      'knowledge_distillation',
      'pattern_learning',
      'expertise_building',
      'curriculum_generation',
      'competency_assessment',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'ENVOY',
    name: 'ENVOY',
    role: 'agent',
    description: 'User-facing communication agent that provides clear progress reports, translates technical results, and manages expectation alignment.',
    inherited: false,
    capabilities: [
      'progress_reporting',
      'result_translation',
      'expectation_management',
      'notification_delivery',
      'status_summarization',
    ],
    weight: 0.020,
    classification: 'passive',
  },
  {
    id: 'WARDEN',
    name: 'WARDEN',
    role: 'agent',
    description: 'Governance enforcement agent ensuring agents operate within safety boundaries, ethical constraints, and user-defined permissions.',
    inherited: false,
    capabilities: [
      'boundary_enforcement',
      'permission_validation',
      'ethical_constraints',
      'action_auditing',
      'scope_containment',
    ],
    weight: 0.020,
    classification: 'active',
  },
  {
    id: 'ROGUE',
    name: 'ROGUE',
    role: 'agent',
    description: 'Creative problem-solving agent that explores unconventional approaches, lateral thinking paths, and novel solution strategies when standard methods stall.',
    inherited: false,
    capabilities: [
      'lateral_thinking',
      'unconventional_approaches',
      'novel_strategies',
      'creative_synthesis',
      'divergent_exploration',
    ],
    weight: 0.015,
    classification: 'hybrid',
  },
  {
    id: 'ANCHOR',
    name: 'ANCHOR',
    role: 'agent',
    description: 'Context persistence agent maintaining long-term memory across sessions, preserving critical context, and ensuring continuity in multi-session workflows.',
    inherited: false,
    capabilities: [
      'session_continuity',
      'context_preservation',
      'long_term_memory',
      'knowledge_indexing',
      'recall_optimization',
    ],
    weight: 0.020,
    classification: 'passive',
  },
];

/* ─── Assembled Agency Substrate ─── */

export function getAgencyPrimitives(): VerticalPrimitive[] {
  return assembleVerticalPrimitives(AGENCY_ENGINES, AGENCY_AGENTS);
}

export function getAgencyEngines(): VerticalPrimitive[] {
  return [...AGENCY_ENGINES];
}

export function getAgencyAgents(): VerticalPrimitive[] {
  return [...AGENCY_AGENTS];
}

/**
 * Full Agency vertical substrate configuration
 */
export function getAgencySubstrate(): VerticalSubstrateConfig {
  return {
    verticalId: 'agency-v1',
    name: 'CMPSBL AGENCY™',
    tagline: 'Governed Autonomous Agent Infrastructure — Agents That Learn, Collaborate, and Ship',
    domain: 'agency',
    subdomain: 'agency',
    url: 'https://agency.cmpsbl.com',
    status: 'active',
    version: '1.0.0',
    primitives: getAgencyPrimitives(),
    clmCurriculum: {
      cyclesPerDay: 2400,
      curriculum: [
        'autonomous_task_execution_patterns',
        'inter_agent_communication_protocols',
        'research_synthesis_techniques',
        'tool_use_best_practices',
        'writing_quality_optimization',
        'reasoning_chain_integrity',
        'reward_signal_design',
        'graceful_degradation_strategies',
        'conflict_resolution_heuristics',
        'skill_transfer_learning',
        'context_preservation_methods',
        'creative_problem_solving_patterns',
      ],
      priorityPrimitives: ['MANDATE', 'OPERATOR', 'SENTINEL', 'SCHOLAR'],
      batchSize: 6,
    },
    memoryStreamConfig: {
      cycleIntervalHours: 2,
      scannerFocus: [
        'agent_framework_best_practices',
        'tool_calling_patterns_evolution',
        'multi_agent_coordination_research',
        'reinforcement_learning_techniques',
        'autonomous_workflow_architectures',
        'communication_protocol_advances',
        'skill_curriculum_methodologies',
        'governance_and_safety_standards',
      ],
      contributesToGlobal: true,
      retentionDays: 365,
    },
    ascensionConfig: {
      maxCapabilities: 20,
      enhancementArchetypes: [
        'Autonomous Mission Executor',
        'Multi-Agent Collaboration Layer',
        'Self-Healing Agent Fleet',
        'Skill Progression Framework',
        'Research & Synthesis Pipeline',
        'Tool Use Orchestration Chain',
        'Governed Autonomy Boundary',
        'Communication Excellence Layer',
        'Creative Problem-Solving Engine',
        'Context Persistence Fabric',
      ],
      cjpiWeights: {
        security: 0.20,
        performance: 0.30,
        reliability: 0.30,
        maintainability: 0.20,
      },
      collisionPriority: ['MANDATE', 'OPERATOR', 'DELEGATE', 'SENTINEL', 'TOOLKIT'],
    },
    theme: {
      primaryHue: 35,
      icon: 'Users',
      gradientAngle: 135,
      darkAccent: '35 90% 55%',
      lightAccent: '35 80% 45%',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get all capabilities across the Agency vertical
 */
export function getAllAgencyCapabilities(): string[] {
  const primitives = getAgencyPrimitives();
  const capabilities = new Set<string>();
  for (const p of primitives) {
    for (const cap of p.capabilities) {
      capabilities.add(cap);
    }
  }
  return Array.from(capabilities).sort();
}

/* ═══════════════════════════════════════════════
   Crown Jewel Integration — S-Tier Registry Surface
   ═══════════════════════════════════════════════ */

/** All 80 architectural Crown Jewels for the AGENCY™ vertical */
export function getAgencyCrownJewels(): STierEntry[] {
  return [...AGENCY_CROWN_JEWELS];
}

/** Crown Jewels for a specific agency primitive */
export function getAgencyPrimitiveCrownJewels(primitiveId: string): STierEntry[] {
  return getAgencyJewelsByPrimitive(primitiveId);
}

/** Crown Jewel summary per primitive (for dashboard) */
export function getAgencyCrownJewelSummary() {
  return getAgencyJewelSummary();
}

/** Total Crown Jewel count for the vertical */
export function getAgencyCrownJewelCount(): number {
  return AGENCY_CROWN_JEWELS.length;
}

/** All Crown Jewel capability IDs as active capabilities */
export function getAgencyCrownJewelCapabilities(): string[] {
  return AGENCY_CROWN_JEWELS.map(j =>
    j.id.toLowerCase().replace(/^s-/, 'cj_')
  );
}
