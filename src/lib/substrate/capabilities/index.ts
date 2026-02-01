/**
 * Cross-Module Capability Registry
 * v6.9.0 — Synergy-Powered Substrate Capabilities
 * 
 * Implements the top 10 emergent capabilities from module intersections.
 */

import { engineBus } from '../engine-bus';

// ============================================================================
// TYPES
// ============================================================================

export type CapabilityId = 
  | 'predictive_issue_prevention'
  | 'adaptive_learning_personalization'
  | 'intelligent_task_delegation'
  | 'realtime_security_hardening'
  | 'context_aware_memory_recall'
  | 'autonomous_documentation'
  | 'cross_domain_insight_synthesis'
  | 'graceful_degradation_chain'
  | 'intent_amplification'
  | 'evolution_confidence_scoring'
  // Archived function integrations
  | 'hypothesis_validation'
  | 'systems_causal_analysis'
  | 'autonomous_quality_review'
  | 'pattern_fusion_synthesis'
  | 'behavioral_drift_detection'
  | 'resilience_orchestration'
  | 'temporal_memory_scoring'
  | 'ethical_guardrails'
  | 'continuous_improvement_engine'
  | 'active_learning_triggers';

export type ModuleLayer = 'Kernel' | 'Cognitive' | 'Operational' | 'Admin' | 'Orchestrator';

export interface CapabilityDefinition {
  id: CapabilityId;
  name: string;
  description: string;
  modules: string[];
  layer: ModuleLayer;
  userBenefit: string;
  status: 'active' | 'pending' | 'experimental';
  emergentFrom: string; // SEP pipeline reference
}

export interface CapabilityExecutionResult {
  capabilityId: CapabilityId;
  success: boolean;
  data?: unknown;
  error?: string;
  duration: number;
  modulesInvoked: string[];
}

export interface CapabilityState {
  enabled: boolean;
  lastExecuted?: Date;
  executionCount: number;
  successRate: number;
}

// ============================================================================
// CAPABILITY REGISTRY
// ============================================================================

export const CAPABILITY_REGISTRY: Record<CapabilityId, CapabilityDefinition> = {
  predictive_issue_prevention: {
    id: 'predictive_issue_prevention',
    name: 'Predictive Issue Prevention',
    description: 'Detects patterns before failures occur and auto-suggests fixes',
    modules: ['VISION', 'BRAIN', 'MODERNIZER'],
    layer: 'Operational',
    userBenefit: 'Proactive problem detection before user impact',
    status: 'active',
    emergentFrom: 'SEP-002',
  },
  adaptive_learning_personalization: {
    id: 'adaptive_learning_personalization',
    name: 'Adaptive Learning Personalization',
    description: 'Learns each user interaction style, adapts responses and accessibility',
    modules: ['BRAIN', 'DECODE', 'INCLUSIVE'],
    layer: 'Cognitive',
    userBenefit: 'Personalized experience that improves over time',
    status: 'active',
    emergentFrom: 'SEP-003',
  },
  intelligent_task_delegation: {
    id: 'intelligent_task_delegation',
    name: 'Intelligent Task Delegation',
    description: 'Routes complex tasks to optimal AI models based on context',
    modules: ['CORTEX', 'NEXUS', 'DECODE'],
    layer: 'Orchestrator',
    userBenefit: 'Optimal AI selection for every task type',
    status: 'active',
    emergentFrom: 'SEP-001',
  },
  realtime_security_hardening: {
    id: 'realtime_security_hardening',
    name: 'Real-time Security Hardening',
    description: 'Continuous threat surface monitoring with auto-remediation',
    modules: ['DEFENSE', 'VISION', 'SYSTEM'],
    layer: 'Operational',
    userBenefit: 'Always-on security without manual intervention',
    status: 'active',
    emergentFrom: 'SEP-005',
  },
  context_aware_memory_recall: {
    id: 'context_aware_memory_recall',
    name: 'Context-Aware Memory Recall',
    description: 'Surfaces relevant memories contextually during conversations',
    modules: ['BRAIN', 'DREAM', 'DECODE'],
    layer: 'Cognitive',
    userBenefit: 'Intelligent context that feels natural',
    status: 'active',
    emergentFrom: 'SEP-001',
  },
  autonomous_documentation: {
    id: 'autonomous_documentation',
    name: 'Autonomous Documentation',
    description: 'Self-documents changes as they happen, keeps docs synced',
    modules: ['MODERNIZER', 'DECODE', 'SYSTEM'],
    layer: 'Admin',
    userBenefit: 'Documentation that writes itself',
    status: 'active',
    emergentFrom: 'SEP-001',
  },
  cross_domain_insight_synthesis: {
    id: 'cross_domain_insight_synthesis',
    name: 'Cross-Domain Insight Synthesis',
    description: 'Connects disparate knowledge domains to generate novel insights',
    modules: ['DREAM', 'NEXUS', 'BRAIN'],
    layer: 'Cognitive',
    userBenefit: 'Novel ideas from unexpected connections',
    status: 'active',
    emergentFrom: 'SEP-001',
  },
  graceful_degradation_chain: {
    id: 'graceful_degradation_chain',
    name: 'Graceful Degradation Chain',
    description: 'Seamless fallback when services fail, maintains user experience',
    modules: ['CORE', 'DEFENSE', 'VISION'],
    layer: 'Kernel',
    userBenefit: 'Reliable experience even during issues',
    status: 'active',
    emergentFrom: 'SEP-002',
  },
  intent_amplification: {
    id: 'intent_amplification',
    name: 'Intent Amplification',
    description: 'Transforms vague user intent into precise, accessible actions',
    modules: ['DECODE', 'RIPPLE', 'INCLUSIVE'],
    layer: 'Cognitive',
    userBenefit: 'Natural language becomes precise commands',
    status: 'active',
    emergentFrom: 'SEP-003',
  },
  evolution_confidence_scoring: {
    id: 'evolution_confidence_scoring',
    name: 'Evolution Confidence Scoring',
    description: 'Quantifies risk/reward of proposed changes before execution',
    modules: ['MODERNIZER', 'BRAIN', 'CORTEX'],
    layer: 'Orchestrator',
    userBenefit: 'Safe evolution with transparent risk assessment',
    status: 'active',
    emergentFrom: 'SEP-001',
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ARCHIVED EDGE FUNCTION INTEGRATIONS (Top 10)
  // ═══════════════════════════════════════════════════════════════════════════
  
  hypothesis_validation: {
    id: 'hypothesis_validation',
    name: 'Hypothesis Validation',
    description: 'Validates hunches with IF-THEN scenarios before costly execution',
    modules: ['BRAIN', 'MODERNIZER'],
    layer: 'Cognitive',
    userBenefit: 'Test assumptions before committing resources',
    status: 'active',
    emergentFrom: 'pf-brain-hypothesis-test',
  },
  systems_causal_analysis: {
    id: 'systems_causal_analysis',
    name: 'Systems Causal Analysis',
    description: 'Multi-factor dependency mapping with root cause identification',
    modules: ['BRAIN', 'CORTEX'],
    layer: 'Cognitive',
    userBenefit: 'Understand why things break, not just what',
    status: 'active',
    emergentFrom: 'pf-brain-systems-reasoning',
  },
  autonomous_quality_review: {
    id: 'autonomous_quality_review',
    name: 'Autonomous Quality Review',
    description: 'Self-evaluates outputs on clarity, accuracy, aesthetics, completeness',
    modules: ['MODERNIZER', 'CORTEX'],
    layer: 'Orchestrator',
    userBenefit: 'Auto-polished outputs without manual review',
    status: 'active',
    emergentFrom: 'pf-brain-self-critique',
  },
  pattern_fusion_synthesis: {
    id: 'pattern_fusion_synthesis',
    name: 'Pattern Fusion Synthesis',
    description: 'Merges insights from unrelated domains to solve problems',
    modules: ['DREAM', 'BRAIN'],
    layer: 'Cognitive',
    userBenefit: 'Creative solutions from unexpected combinations',
    status: 'active',
    emergentFrom: 'pf-brain-pattern-fusion',
  },
  behavioral_drift_detection: {
    id: 'behavioral_drift_detection',
    name: 'Behavioral Drift Detection',
    description: 'Statistical anomaly detection for novel attack patterns',
    modules: ['DEFENSE', 'VISION'],
    layer: 'Operational',
    userBenefit: 'Catch threats traditional rules miss',
    status: 'active',
    emergentFrom: 'pf-defense-anomaly-detection',
  },
  resilience_orchestration: {
    id: 'resilience_orchestration',
    name: 'Resilience Orchestration',
    description: 'Detects failures and applies automatic fixes with high confidence',
    modules: ['CORE', 'SYSTEM'],
    layer: 'Kernel',
    userBenefit: 'Self-healing infrastructure',
    status: 'active',
    emergentFrom: 'pf-resilience-monitor',
  },
  temporal_memory_scoring: {
    id: 'temporal_memory_scoring',
    name: 'Temporal Memory Scoring',
    description: 'Time-weighted freshness scoring for memory relevance',
    modules: ['BRAIN', 'DECODE'],
    layer: 'Cognitive',
    userBenefit: 'Right memories surface at the right time',
    status: 'active',
    emergentFrom: 'pf-brain-temporal-score',
  },
  ethical_guardrails: {
    id: 'ethical_guardrails',
    name: 'Ethical Guardrails',
    description: 'Evaluates actions for legal, reputational, and ethical risks',
    modules: ['CORTEX', 'DECODE'],
    layer: 'Orchestrator',
    userBenefit: 'Safe outputs with compliance built-in',
    status: 'active',
    emergentFrom: 'pf-brain-ethical-boundary',
  },
  continuous_improvement_engine: {
    id: 'continuous_improvement_engine',
    name: 'Continuous Improvement Engine',
    description: 'Generates substrate upgrade proposals during idle time',
    modules: ['MODERNIZER', 'DREAM'],
    layer: 'Admin',
    userBenefit: 'System that improves itself 24/7',
    status: 'active',
    emergentFrom: 'pf-cascade-improvement-engine',
  },
  active_learning_triggers: {
    id: 'active_learning_triggers',
    name: 'Active Learning Triggers',
    description: 'Identifies knowledge gaps and queues them for exploration',
    modules: ['BRAIN', 'DREAM'],
    layer: 'Cognitive',
    userBenefit: 'Curiosity-driven continuous learning',
    status: 'active',
    emergentFrom: 'pf-brain-curiosity-reflect',
  },
};

// ============================================================================
// CAPABILITY ENGINE
// ============================================================================

class CapabilityEngine {
  private state: Map<CapabilityId, CapabilityState> = new Map();
  
  constructor() {
    // Initialize all capabilities as enabled
    Object.keys(CAPABILITY_REGISTRY).forEach(id => {
      this.state.set(id as CapabilityId, {
        enabled: true,
        executionCount: 0,
        successRate: 1.0,
      });
    });
  }
  
  /**
   * Get all registered capabilities
   */
  list(): CapabilityDefinition[] {
    return Object.values(CAPABILITY_REGISTRY);
  }
  
  /**
   * Get a specific capability definition
   */
  get(id: CapabilityId): CapabilityDefinition | undefined {
    return CAPABILITY_REGISTRY[id];
  }
  
  /**
   * Get capability state
   */
  getState(id: CapabilityId): CapabilityState | undefined {
    return this.state.get(id);
  }
  
  /**
   * Enable/disable a capability
   */
  setEnabled(id: CapabilityId, enabled: boolean): void {
    const state = this.state.get(id);
    if (state) {
      state.enabled = enabled;
      // Log capability state change
      console.debug(`[Capability] ${id} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }
  
  /**
   * Execute a capability
   */
  async execute(id: CapabilityId, context: Record<string, unknown> = {}): Promise<CapabilityExecutionResult> {
    const startTime = Date.now();
    const capability = CAPABILITY_REGISTRY[id];
    const state = this.state.get(id);
    
    if (!capability) {
      return {
        capabilityId: id,
        success: false,
        error: `Capability ${id} not found`,
        duration: Date.now() - startTime,
        modulesInvoked: [],
      };
    }
    
    if (!state?.enabled) {
      return {
        capabilityId: id,
        success: false,
        error: `Capability ${id} is disabled`,
        duration: Date.now() - startTime,
        modulesInvoked: [],
      };
    }
    
    try {
      // Dispatch to each module in the capability chain
      const results = await Promise.all(
        capability.modules.map(module => 
          engineBus.dispatch(module.toLowerCase() as Parameters<typeof engineBus.dispatch>[0], {
            action: `capability:${id}`,
            payload: context,
          })
        )
      );
      
      // Update state
      state.executionCount++;
      state.lastExecuted = new Date();
      state.successRate = (state.successRate * (state.executionCount - 1) + 1) / state.executionCount;
      
      // Log successful execution
      console.debug(`[Capability] ${id} executed successfully in ${Date.now() - startTime}ms`);
      
      return {
        capabilityId: id,
        success: true,
        data: results,
        duration: Date.now() - startTime,
        modulesInvoked: capability.modules,
      };
    } catch (error) {
      // Update state on failure
      if (state) {
        state.executionCount++;
        state.lastExecuted = new Date();
        state.successRate = (state.successRate * (state.executionCount - 1)) / state.executionCount;
      }
      
      // Log execution failure
      console.error(`[Capability] ${id} execution failed:`, error);
      
      return {
        capabilityId: id,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        modulesInvoked: capability.modules,
      };
    }
  }
  
  /**
   * Get capabilities by module
   */
  getByModule(module: string): CapabilityDefinition[] {
    return Object.values(CAPABILITY_REGISTRY).filter(cap => 
      cap.modules.includes(module.toUpperCase())
    );
  }
  
  /**
   * Get capabilities by layer
   */
  getByLayer(layer: ModuleLayer): CapabilityDefinition[] {
    return Object.values(CAPABILITY_REGISTRY).filter(cap => cap.layer === layer);
  }
  
  /**
   * Get active capabilities count
   */
  getActiveCount(): number {
    return Array.from(this.state.values()).filter(s => s.enabled).length;
  }
  
  /**
   * Get summary statistics
   */
  getSummary(): {
    total: number;
    active: number;
    byLayer: Record<ModuleLayer, number>;
    totalExecutions: number;
  } {
    const byLayer: Record<ModuleLayer, number> = {
      Kernel: 0,
      Cognitive: 0,
      Operational: 0,
      Admin: 0,
      Orchestrator: 0,
    };
    
    Object.values(CAPABILITY_REGISTRY).forEach(cap => {
      byLayer[cap.layer]++;
    });
    
    const totalExecutions = Array.from(this.state.values())
      .reduce((sum, s) => sum + s.executionCount, 0);
    
    return {
      total: Object.keys(CAPABILITY_REGISTRY).length,
      active: this.getActiveCount(),
      byLayer,
      totalExecutions,
    };
  }
}

// Singleton instance
export const capabilityEngine = new CapabilityEngine();

// Export for client usage
export class CapabilityEngineClient {
  list = () => capabilityEngine.list();
  get = (id: CapabilityId) => capabilityEngine.get(id);
  getState = (id: CapabilityId) => capabilityEngine.getState(id);
  setEnabled = (id: CapabilityId, enabled: boolean) => capabilityEngine.setEnabled(id, enabled);
  execute = (id: CapabilityId, context?: Record<string, unknown>) => capabilityEngine.execute(id, context);
  getByModule = (module: string) => capabilityEngine.getByModule(module);
  getByLayer = (layer: ModuleLayer) => capabilityEngine.getByLayer(layer);
  getSummary = () => capabilityEngine.getSummary();
}

export default capabilityEngine;
