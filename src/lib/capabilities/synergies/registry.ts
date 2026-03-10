/**
 * Synergy Registry
 * Cross-Module Pipeline Registration (200 Pipelines)
 * 
 * Defines all available synergies that combine 2+ modules
 * Includes 32 S-tier premium pipelines + 27 discovery + 53 infrastructure-era = 200 total
 */

import type { SynergyDefinition, SynergyExecutor, SynergyRegistry } from './types';
import { STIER_SYNERGY_DEFINITIONS } from './stier/definitions';
import { INFRASTRUCTURE_SYNERGY_DEFINITIONS } from './infrastructure-pipelines';

const registry: SynergyRegistry = {
  synergies: new Map(),
  executors: new Map(),
};

/**
 * All 300 cross-module synergies
 * Each combines 2-5 modules for enhanced capability within the substrate architecture
 */
export const SYNERGY_DEFINITIONS: SynergyDefinition[] = [
  // === INTELLIGENCE SYNERGIES ===
  {
    id: 'smart-recall',
    name: 'Smart Recall',
    description: 'BRAIN memory lookup enhanced by DECODE context understanding and DREAM pattern matching',
    category: 'intelligence',
    modules: [
      { name: 'BRAIN', role: 'primary', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'DREAM', role: 'enhancer', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 150,
    minModulesRequired: 2,
  },
  {
    id: 'predictive-issue-prevention',
    name: 'Predictive Issue Prevention',
    description: 'VISION metrics analyzed by BRAIN learning to trigger MODERNIZER pre-emptive fixes',
    category: 'intelligence',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'EVOLUTION', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 500,
    minModulesRequired: 3,
  },
  {
    id: 'context-aware-generation',
    name: 'Context-Aware Generation',
    description: 'NEXUS generation informed by BRAIN memory and DECODE intent parsing',
    category: 'intelligence',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'enhancer', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 800,
    minModulesRequired: 2,
  },
  {
    id: 'cross-domain-synthesis',
    name: 'Cross-Domain Synthesis',
    description: 'DREAM pattern discovery combined with NEXUS reasoning and BRAIN consolidation',
    category: 'intelligence',
    modules: [
      { name: 'DREAM', role: 'primary', required: true },
      { name: 'NEXUS', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 600,
    minModulesRequired: 3,
  },

  // === OPTIMIZATION SYNERGIES ===
  {
    id: 'adaptive-routing',
    name: 'Adaptive Routing',
    description: 'NEXUS provider selection optimized by VISION latency metrics and CORTEX cost analysis',
    category: 'optimization',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 100,
    minModulesRequired: 2,
  },
  {
    id: 'intelligent-caching',
    name: 'Intelligent Caching',
    description: 'SYSTEM cache decisions driven by BRAIN access patterns and VISION hit rates',
    category: 'optimization',
    modules: [
      { name: 'SYSTEM', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 50,
    minModulesRequired: 2,
  },
  {
    id: 'batch-optimization',
    name: 'Batch Optimization',
    description: 'RIPPLE event batching tuned by VISION throughput metrics and CORTEX scheduling',
    category: 'optimization',
    modules: [
      { name: 'RIPPLE', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'enhancer', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 80,
    minModulesRequired: 2,
  },

  // === RESILIENCE SYNERGIES ===
  {
    id: 'graceful-degradation',
    name: 'Graceful Degradation',
    description: 'CORE fallback chain with DEFENSE circuit breakers and VISION health monitoring',
    category: 'resilience',
    modules: [
      { name: 'CORE', role: 'primary', required: true },
      { name: 'DEFENSE', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 30,
    minModulesRequired: 3,
  },
  {
    id: 'self-healing',
    name: 'Self-Healing',
    description: 'SYSTEM diagnostics trigger MODERNIZER auto-fixes validated by VISION regression checks',
    category: 'resilience',
    modules: [
      { name: 'SYSTEM', role: 'primary', required: true },
      { name: 'EVOLUTION', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 1000,
    minModulesRequired: 3,
  },
  {
    id: 'distributed-trace-recovery',
    name: 'Distributed Trace Recovery',
    description: 'RIPPLE event replay guided by VISION trace analysis and BRAIN failure patterns',
    category: 'resilience',
    modules: [
      { name: 'RIPPLE', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: false },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 300,
    minModulesRequired: 2,
  },

  // === SECURITY SYNERGIES ===
  {
    id: 'threat-learning',
    name: 'Threat Learning',
    description: 'DEFENSE events feed BRAIN pattern recognition for VISION anomaly detection',
    category: 'security',
    modules: [
      { name: 'DEFENSE', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 200,
    minModulesRequired: 3,
  },
  {
    id: 'access-pattern-hardening',
    name: 'Access Pattern Hardening',
    description: 'ACCESS usage analyzed by BRAIN to inform DEFENSE rate limits and SYSTEM quotas',
    category: 'security',
    modules: [
      { name: 'ACCESS', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'DEFENSE', role: 'validator', required: true },
      { name: 'SYSTEM', role: 'fallback', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 150,
    minModulesRequired: 3,
  },

  // === ACCESSIBILITY SYNERGIES ===
  {
    id: 'inclusive-content',
    name: 'Inclusive Content',
    description: 'NEXUS generation filtered by INCLUSIVE compliance and DECODE clarity scoring',
    category: 'accessibility',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'INCLUSIVE', role: 'validator', required: true },
      { name: 'DECODE', role: 'enhancer', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 400,
    minModulesRequired: 2,
  },
  {
    id: 'adaptive-ui',
    name: 'Adaptive UI',
    description: 'INCLUSIVE scan informs MODERNIZER fixes and DECODE personalization',
    category: 'accessibility',
    modules: [
      { name: 'INCLUSIVE', role: 'primary', required: true },
      { name: 'EVOLUTION', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'enhancer', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 350,
    minModulesRequired: 2,
  },

  // === AUTOMATION SYNERGIES ===
  {
    id: 'evolution-confidence',
    name: 'Evolution Confidence',
    description: 'CORTEX proposals scored by BRAIN learning history and MODERNIZER impact analysis',
    category: 'automation',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'EVOLUTION', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 700,
    minModulesRequired: 3,
  },
  {
    id: 'autonomous-documentation',
    name: 'Autonomous Documentation',
    description: 'MODERNIZER code analysis combined with DECODE explanation and SYSTEM versioning',
    category: 'automation',
    modules: [
      { name: 'EVOLUTION', role: 'primary', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'SYSTEM', role: 'validator', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 450,
    minModulesRequired: 2,
  },
  {
    id: 'intent-amplification',
    name: 'Intent Amplification',
    description: 'DECODE intent parsing amplified by RIPPLE event context and INCLUSIVE clarity',
    category: 'automation',
    modules: [
      { name: 'DECODE', role: 'primary', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'INCLUSIVE', role: 'validator', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 200,
    minModulesRequired: 2,
  },

  // === ADDITIONAL INTELLIGENCE SYNERGIES ===
  {
    id: 'learning-acceleration',
    name: 'Learning Acceleration',
    description: 'BRAIN learning enhanced by DREAM pattern synthesis and CORTEX prioritization',
    category: 'intelligence',
    modules: [
      { name: 'BRAIN', role: 'primary', required: true },
      { name: 'DREAM', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 350,
    minModulesRequired: 2,
  },
  {
    id: 'cognitive-fusion',
    name: 'Cognitive Fusion',
    description: 'NEXUS multi-provider reasoning fused with BRAIN memory and VISION performance data',
    category: 'intelligence',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 600,
    minModulesRequired: 3,
  },

  // === ADDITIONAL OPTIMIZATION SYNERGIES ===
  {
    id: 'resource-balancing',
    name: 'Resource Balancing',
    description: 'CORTEX orchestration tuned by VISION metrics and SYSTEM quota management',
    category: 'optimization',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'SYSTEM', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 120,
    minModulesRequired: 3,
  },
  {
    id: 'latency-prediction',
    name: 'Latency Prediction',
    description: 'VISION historical latency analyzed by BRAIN patterns to predict NEXUS route timing',
    category: 'optimization',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'NEXUS', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 80,
    minModulesRequired: 3,
  },

  // === ADDITIONAL RESILIENCE SYNERGIES ===
  {
    id: 'cascade-prevention',
    name: 'Cascade Prevention',
    description: 'DEFENSE circuit breakers coordinated with RIPPLE event isolation and CORE fallbacks',
    category: 'resilience',
    modules: [
      { name: 'DEFENSE', role: 'primary', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'CORE', role: 'fallback', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 50,
    minModulesRequired: 3,
  },
  {
    id: 'memory-persistence',
    name: 'Memory Persistence',
    description: 'BRAIN consolidation backed by SYSTEM storage and VISION integrity checks',
    category: 'resilience',
    modules: [
      { name: 'BRAIN', role: 'primary', required: true },
      { name: 'SYSTEM', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 200,
    minModulesRequired: 2,
  },

  // === ADDITIONAL SECURITY SYNERGIES ===
  {
    id: 'anomaly-correlation',
    name: 'Anomaly Correlation',
    description: 'VISION anomaly detection correlated with DEFENSE threat intel and BRAIN patterns',
    category: 'security',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'DEFENSE', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 180,
    minModulesRequired: 3,
  },

  // === INTEGRATION & EXTERNAL SYNERGIES ===
  {
    id: 'external-api-intelligence',
    name: 'External API Intelligence',
    description: 'INTEGRATION adapter health monitored by VISION metrics and BRAIN pattern learning',
    category: 'optimization',
    modules: [
      { name: 'INTEGRATION', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 200,
    minModulesRequired: 3,
  },
  {
    id: 'webhook-orchestration',
    name: 'Webhook Orchestration',
    description: 'INTEGRATION webhooks coordinated by RIPPLE event routing and CORTEX scheduling',
    category: 'orchestration',
    modules: [
      { name: 'INTEGRATION', role: 'primary', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 120,
    minModulesRequired: 3,
  },
  {
    id: 'adapter-failover',
    name: 'Adapter Failover',
    description: 'INTEGRATION adapter failures handled by DEFENSE circuit breakers and NEXUS fallback routing',
    category: 'resilience',
    modules: [
      { name: 'INTEGRATION', role: 'primary', required: true },
      { name: 'DEFENSE', role: 'enhancer', required: true },
      { name: 'NEXUS', role: 'fallback', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 80,
    minModulesRequired: 3,
  },

  // === ACCESS & ENTITLEMENT SYNERGIES ===
  {
    id: 'entitlement-aware-routing',
    name: 'Entitlement-Aware Routing',
    description: 'ACCESS entitlements inform NEXUS model selection and CORTEX cost governance',
    category: 'optimization',
    modules: [
      { name: 'ACCESS', role: 'primary', required: true },
      { name: 'NEXUS', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 60,
    minModulesRequired: 3,
  },
  {
    id: 'quota-prediction',
    name: 'Quota Prediction',
    description: 'ACCESS usage patterns analyzed by BRAIN to predict VISION quota exhaustion warnings',
    category: 'intelligence',
    modules: [
      { name: 'ACCESS', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 100,
    minModulesRequired: 3,
  },
  {
    id: 'developer-experience-optimization',
    name: 'Developer Experience Optimization',
    description: 'ACCESS API patterns inform DECODE intent parsing and INCLUSIVE developer-friendly outputs',
    category: 'accessibility',
    modules: [
      { name: 'ACCESS', role: 'primary', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'INCLUSIVE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 150,
    minModulesRequired: 3,
  },

  // === SEBA AUTONOMOUS SYNERGIES ===
  {
    id: 'autonomous-evolution',
    name: 'Autonomous Evolution',
    description: 'CORTEX evolution proposals enhanced by BRAIN learning history and MODERNIZER impact simulation',
    category: 'orchestration',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'EVOLUTION', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 800,
    minModulesRequired: 4,
  },
  {
    id: 'cognitive-curriculum',
    name: 'Cognitive Curriculum',
    description: 'DREAM learning goals informed by BRAIN knowledge gaps and CORTEX priority scheduling',
    category: 'intelligence',
    modules: [
      { name: 'DREAM', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 400,
    minModulesRequired: 3,
  },
  {
    id: 'bounded-autonomy-guard',
    name: 'Bounded Autonomy Guard',
    description: 'CORTEX autonomous actions gated by DEFENSE safety checks and VISION impact monitoring',
    category: 'security',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'DEFENSE', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 150,
    minModulesRequired: 3,
  },

  // === FULL-STACK COGNITIVE SYNERGIES ===
  {
    id: 'end-to-end-reasoning',
    name: 'End-to-End Reasoning',
    description: 'DECODE intent through NEXUS reasoning through BRAIN memory through CORTEX decision',
    category: 'intelligence',
    modules: [
      { name: 'DECODE', role: 'primary', required: true },
      { name: 'NEXUS', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 900,
    minModulesRequired: 4,
  },

  // === v7.1.0 NEW HIGH-VALUE SYNERGIES ===
  
  // Predictive Intelligence
  {
    id: 'contextual-preload',
    name: 'Contextual Preload',
    description: 'BRAIN predicts upcoming needs based on RIPPLE event patterns and DECODE session analysis',
    category: 'optimization',
    modules: [
      { name: 'BRAIN', role: 'primary', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 120,
    minModulesRequired: 3,
  },
  {
    id: 'semantic-deduplication',
    name: 'Semantic Deduplication',
    description: 'BRAIN memory consolidation guided by DECODE semantic similarity and DREAM pattern matching',
    category: 'optimization',
    modules: [
      { name: 'BRAIN', role: 'primary', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'DREAM', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 250,
    minModulesRequired: 3,
  },
  
  // Advanced Security
  {
    id: 'behavioral-fingerprinting',
    name: 'Behavioral Fingerprinting',
    description: 'ACCESS usage patterns analyzed by BRAIN to create DEFENSE behavioral baselines',
    category: 'security',
    modules: [
      { name: 'ACCESS', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'DEFENSE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 180,
    minModulesRequired: 3,
  },
  {
    id: 'zero-trust-validation',
    name: 'Zero-Trust Validation',
    description: 'CORTEX policy enforcement enhanced by DEFENSE continuous verification and VISION audit logging',
    category: 'security',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'DEFENSE', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 100,
    minModulesRequired: 3,
  },
  
  // Intelligent Orchestration
  {
    id: 'workflow-synthesis',
    name: 'Workflow Synthesis',
    description: 'CORTEX workflow generation informed by BRAIN learned patterns and DECODE user intent',
    category: 'orchestration',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 450,
    minModulesRequired: 3,
  },
  {
    id: 'multi-agent-coordination',
    name: 'Multi-Agent Coordination',
    description: 'CORTEX agent orchestration with RIPPLE message routing and VISION task monitoring',
    category: 'orchestration',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 350,
    minModulesRequired: 3,
  },
  
  // Enhanced Accessibility
  {
    id: 'cognitive-load-optimization',
    name: 'Cognitive Load Optimization',
    description: 'INCLUSIVE complexity analysis combined with DECODE simplification and BRAIN personalization',
    category: 'accessibility',
    modules: [
      { name: 'INCLUSIVE', role: 'primary', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 200,
    minModulesRequired: 3,
  },
  {
    id: 'multimodal-adaptation',
    name: 'Multimodal Adaptation',
    description: 'NEXUS content generation adapted by INCLUSIVE guidelines and VISION usage analytics',
    category: 'accessibility',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'INCLUSIVE', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 500,
    minModulesRequired: 3,
  },
  
  // Deep Learning Integration
  {
    id: 'knowledge-distillation',
    name: 'Knowledge Distillation',
    description: 'DREAM pattern extraction distilled into BRAIN permanent memory with CORTEX governance',
    category: 'intelligence',
    modules: [
      { name: 'DREAM', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 600,
    minModulesRequired: 3,
  },
  {
    id: 'hypothesis-testing',
    name: 'Hypothesis Testing',
    description: 'NEXUS generates hypotheses validated by BRAIN historical data and VISION A/B metrics',
    category: 'intelligence',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 700,
    minModulesRequired: 3,
  },
  
  // === v7.2.0 NEXT-GEN SYNERGIES ===
  
  // Predictive Operations
  {
    id: 'capacity-forecasting',
    name: 'Capacity Forecasting',
    description: 'VISION usage trends combined with BRAIN seasonality patterns to predict SYSTEM capacity needs',
    category: 'optimization',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'SYSTEM', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 200,
    minModulesRequired: 3,
  },
  {
    id: 'cost-optimization-engine',
    name: 'Cost Optimization Engine',
    description: 'ACCESS billing analysis with NEXUS provider costing and CORTEX budget governance',
    category: 'optimization',
    modules: [
      { name: 'ACCESS', role: 'primary', required: true },
      { name: 'NEXUS', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 150,
    minModulesRequired: 3,
  },
  
  // Advanced Intelligence
  {
    id: 'causal-inference',
    name: 'Causal Inference',
    description: 'BRAIN correlation analysis enhanced by VISION metrics and DREAM causal graph synthesis',
    category: 'intelligence',
    modules: [
      { name: 'BRAIN', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'DREAM', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 450,
    minModulesRequired: 3,
  },
  {
    id: 'emergent-pattern-detection',
    name: 'Emergent Pattern Detection',
    description: 'DREAM novel pattern discovery validated by BRAIN historical comparison and NEXUS interpretation',
    category: 'intelligence',
    modules: [
      { name: 'DREAM', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'NEXUS', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 550,
    minModulesRequired: 3,
  },
  
  // Proactive Security
  {
    id: 'threat-prediction',
    name: 'Threat Prediction',
    description: 'DEFENSE threat intelligence combined with BRAIN attack patterns and VISION anomaly baselines',
    category: 'security',
    modules: [
      { name: 'DEFENSE', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 220,
    minModulesRequired: 3,
  },
  {
    id: 'compliance-automation',
    name: 'Compliance Automation',
    description: 'CORTEX policy engine with INCLUSIVE accessibility checks and VISION audit trail',
    category: 'security',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'INCLUSIVE', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 180,
    minModulesRequired: 3,
  },
  
  // Enhanced Resilience
  {
    id: 'predictive-healing',
    name: 'Predictive Healing',
    description: 'BRAIN failure pattern prediction triggers MODERNIZER proactive fixes before issues occur',
    category: 'resilience',
    modules: [
      { name: 'BRAIN', role: 'primary', required: true },
      { name: 'EVOLUTION', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 380,
    minModulesRequired: 3,
  },
  {
    id: 'chaos-resilience',
    name: 'Chaos Resilience',
    description: 'DEFENSE controlled chaos testing with CORE recovery validation and VISION impact analysis',
    category: 'resilience',
    modules: [
      { name: 'DEFENSE', role: 'primary', required: true },
      { name: 'CORE', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 500,
    minModulesRequired: 3,
  },
  
  // Enterprise Orchestration
  {
    id: 'sla-guardian',
    name: 'SLA Guardian',
    description: 'VISION SLA monitoring with CORTEX priority management and DEFENSE throttle activation',
    category: 'orchestration',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'CORTEX', role: 'enhancer', required: true },
      { name: 'DEFENSE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 100,
    minModulesRequired: 3,
  },
  {
    id: 'resource-contention-resolver',
    name: 'Resource Contention Resolver',
    description: 'RIPPLE event prioritization with CORTEX scheduling and SYSTEM resource allocation',
    category: 'orchestration',
    modules: [
      { name: 'RIPPLE', role: 'primary', required: true },
      { name: 'CORTEX', role: 'enhancer', required: true },
      { name: 'SYSTEM', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 80,
    minModulesRequired: 3,
  },
  
  // === v7.3.0 ADVANCED COGNITIVE SYNERGIES ===
  
  // Deep Intelligence Pipeline
  {
    id: 'recursive-self-improvement',
    name: 'Recursive Self-Improvement',
    description: 'CORTEX analyzes its own decisions using BRAIN history and DREAM meta-patterns to improve future reasoning',
    category: 'intelligence',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'DREAM', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 650,
    minModulesRequired: 3,
  },
  {
    id: 'temporal-reasoning',
    name: 'Temporal Reasoning',
    description: 'BRAIN temporal memory combined with VISION historical metrics and NEXUS causal analysis',
    category: 'intelligence',
    modules: [
      { name: 'BRAIN', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'NEXUS', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 400,
    minModulesRequired: 3,
  },
  {
    id: 'counterfactual-analysis',
    name: 'Counterfactual Analysis',
    description: 'DREAM generates alternative scenarios validated by BRAIN outcomes and CORTEX decision trees',
    category: 'intelligence',
    modules: [
      { name: 'DREAM', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 520,
    minModulesRequired: 3,
  },
  {
    id: 'semantic-bridge',
    name: 'Semantic Bridge',
    description: 'DECODE translates between domain contexts using BRAIN terminology mapping and NEXUS explanation',
    category: 'intelligence',
    modules: [
      { name: 'DECODE', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'NEXUS', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 280,
    minModulesRequired: 3,
  },
  
  // Advanced Automation
  {
    id: 'goal-decomposition',
    name: 'Goal Decomposition',
    description: 'CORTEX breaks complex goals into sub-tasks using DECODE intent parsing and BRAIN pattern matching',
    category: 'automation',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 350,
    minModulesRequired: 3,
  },
  {
    id: 'autonomous-repair',
    name: 'Autonomous Repair',
    description: 'MODERNIZER auto-patches issues detected by VISION with CORTEX approval and DEFENSE safety validation',
    category: 'automation',
    modules: [
      { name: 'EVOLUTION', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'enhancer', required: true },
      { name: 'DEFENSE', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 800,
    minModulesRequired: 4,
  },
  {
    id: 'proactive-scaling',
    name: 'Proactive Scaling',
    description: 'VISION load prediction triggers SYSTEM capacity adjustment orchestrated by CORTEX',
    category: 'automation',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'SYSTEM', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 200,
    minModulesRequired: 3,
  },
  
  // Multi-Modal Intelligence
  {
    id: 'cross-modal-synthesis',
    name: 'Cross-Modal Synthesis',
    description: 'NEXUS combines outputs from multiple models with BRAIN context and DECODE semantic alignment',
    category: 'intelligence',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 700,
    minModulesRequired: 3,
  },
  {
    id: 'consensus-reasoning',
    name: 'Consensus Reasoning',
    description: 'NEXUS queries multiple providers and CORTEX aggregates consensus with BRAIN confidence weighting',
    category: 'intelligence',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'CORTEX', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 900,
    minModulesRequired: 3,
  },
  
  // Advanced Security
  {
    id: 'attack-surface-mapping',
    name: 'Attack Surface Mapping',
    description: 'DEFENSE scans exposed endpoints with INTEGRATION adapter audit and VISION threat visualization',
    category: 'security',
    modules: [
      { name: 'DEFENSE', role: 'primary', required: true },
      { name: 'INTEGRATION', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 300,
    minModulesRequired: 3,
  },
  {
    id: 'privilege-escalation-detection',
    name: 'Privilege Escalation Detection',
    description: 'ACCESS monitors permission changes with BRAIN historical comparison and DEFENSE anomaly detection',
    category: 'security',
    modules: [
      { name: 'ACCESS', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'DEFENSE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 150,
    minModulesRequired: 3,
  },
  {
    id: 'data-exfiltration-guard',
    name: 'Data Exfiltration Guard',
    description: 'DEFENSE monitors data flows with VISION pattern analysis and RIPPLE event correlation',
    category: 'security',
    modules: [
      { name: 'DEFENSE', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'RIPPLE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 120,
    minModulesRequired: 3,
  },
  
  // Enhanced Optimization
  {
    id: 'token-budget-optimizer',
    name: 'Token Budget Optimizer',
    description: 'NEXUS prompt compression with DECODE semantic preservation and ACCESS quota management',
    category: 'optimization',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'ACCESS', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 180,
    minModulesRequired: 3,
  },
  {
    id: 'response-quality-calibration',
    name: 'Response Quality Calibration',
    description: 'NEXUS output refinement using BRAIN feedback patterns and VISION quality metrics',
    category: 'optimization',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 250,
    minModulesRequired: 3,
  },
  {
    id: 'cache-coherence',
    name: 'Cache Coherence',
    description: 'SYSTEM cache synchronization with BRAIN memory consistency and RIPPLE invalidation propagation',
    category: 'optimization',
    modules: [
      { name: 'SYSTEM', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'RIPPLE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 60,
    minModulesRequired: 3,
  },
  
  // Advanced Resilience
  {
    id: 'blast-radius-containment',
    name: 'Blast Radius Containment',
    description: 'DEFENSE isolates failing components with RIPPLE event quarantine and CORE fallback activation',
    category: 'resilience',
    modules: [
      { name: 'DEFENSE', role: 'primary', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'CORE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 40,
    minModulesRequired: 3,
  },
  {
    id: 'state-checkpoint-recovery',
    name: 'State Checkpoint Recovery',
    description: 'BRAIN saves cognitive state with SYSTEM persistence and CORTEX rollback orchestration',
    category: 'resilience',
    modules: [
      { name: 'BRAIN', role: 'primary', required: true },
      { name: 'SYSTEM', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 300,
    minModulesRequired: 3,
  },
  {
    id: 'dependency-health-cascade',
    name: 'Dependency Health Cascade',
    description: 'VISION monitors dependency graph with INTEGRATION adapter health and DEFENSE circuit management',
    category: 'resilience',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'INTEGRATION', role: 'enhancer', required: true },
      { name: 'DEFENSE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 180,
    minModulesRequired: 3,
  },
  
  // Enterprise Orchestration
  {
    id: 'cross-team-coordination',
    name: 'Cross-Team Coordination',
    description: 'CORTEX orchestrates multi-team workflows with RIPPLE event routing and VISION progress tracking',
    category: 'orchestration',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 250,
    minModulesRequired: 3,
  },
  {
    id: 'pipeline-orchestration',
    name: 'Pipeline Orchestration',
    description: 'CORTEX chains cognitive operations with RIPPLE async execution and BRAIN context preservation',
    category: 'orchestration',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 350,
    minModulesRequired: 3,
  },
  
  // Accessibility Excellence
  {
    id: 'universal-design-synthesis',
    name: 'Universal Design Synthesis',
    description: 'INCLUSIVE generates accessible patterns with NEXUS content adaptation and DECODE clarity validation',
    category: 'accessibility',
    modules: [
      { name: 'INCLUSIVE', role: 'primary', required: true },
      { name: 'NEXUS', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 320,
    minModulesRequired: 3,
  },
  {
    id: 'adaptive-personalization',
    name: 'Adaptive Personalization',
    description: 'BRAIN user preference learning with INCLUSIVE accessibility needs and DECODE communication style',
    category: 'accessibility',
    modules: [
      { name: 'BRAIN', role: 'primary', required: true },
      { name: 'INCLUSIVE', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 220,
    minModulesRequired: 3,
  },
  
  // === v7.4.0 ENTERPRISE COGNITIVE SYNERGIES (22 NEW - 3+ MODULES EACH) ===
  
  // Deep Multi-Module Intelligence
  {
    id: 'holistic-system-insight',
    name: 'Holistic System Insight',
    description: 'VISION monitors all modules while BRAIN correlates patterns, CORTEX reasons about state, and DREAM synthesizes emergent insights',
    category: 'intelligence',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'enhancer', required: true },
      { name: 'DREAM', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 850,
    minModulesRequired: 4,
  },
  {
    id: 'meta-cognitive-reflection',
    name: 'Meta-Cognitive Reflection',
    description: 'CORTEX analyzes reasoning quality using BRAIN learning history, DECODE explanation generation, and VISION performance data',
    category: 'intelligence',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 600,
    minModulesRequired: 4,
  },
  {
    id: 'neural-symbolic-fusion',
    name: 'Neural-Symbolic Fusion',
    description: 'NEXUS neural generation combined with CORTEX symbolic rules, BRAIN pattern memory, and DECODE interpretation',
    category: 'intelligence',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'CORTEX', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 750,
    minModulesRequired: 4,
  },
  {
    id: 'cognitive-load-balancer',
    name: 'Cognitive Load Balancer',
    description: 'SYSTEM distributes cognitive tasks using CORTEX priority, VISION load metrics, and RIPPLE event queuing',
    category: 'optimization',
    modules: [
      { name: 'SYSTEM', role: 'primary', required: true },
      { name: 'CORTEX', role: 'enhancer', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'RIPPLE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 150,
    minModulesRequired: 4,
  },
  {
    id: 'intent-evolution-chain',
    name: 'Intent Evolution Chain',
    description: 'DECODE tracks intent evolution through sessions using BRAIN memory, RIPPLE event history, and CORTEX pattern analysis',
    category: 'intelligence',
    modules: [
      { name: 'DECODE', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 400,
    minModulesRequired: 4,
  },
  
  // Enterprise Security Suite
  {
    id: 'zero-day-defense',
    name: 'Zero-Day Defense',
    description: 'DEFENSE monitors unknown patterns using BRAIN anomaly learning, VISION behavioral baselines, and CORTEX threat reasoning',
    category: 'security',
    modules: [
      { name: 'DEFENSE', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 350,
    minModulesRequired: 4,
  },
  {
    id: 'comprehensive-audit-trail',
    name: 'Comprehensive Audit Trail',
    description: 'VISION logs all actions with RIPPLE event correlation, ACCESS entitlement context, and DEFENSE compliance tagging',
    category: 'security',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'ACCESS', role: 'enhancer', required: true },
      { name: 'DEFENSE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 200,
    minModulesRequired: 4,
  },
  {
    id: 'adaptive-threat-response',
    name: 'Adaptive Threat Response',
    description: 'DEFENSE responds to threats using BRAIN learned responses, CORE fallback activation, and CORTEX escalation decisions',
    category: 'security',
    modules: [
      { name: 'DEFENSE', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'CORE', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 280,
    minModulesRequired: 4,
  },
  
  // Enterprise Resilience
  {
    id: 'distributed-recovery-orchestration',
    name: 'Distributed Recovery Orchestration',
    description: 'CORE orchestrates recovery across modules using RIPPLE event replay, BRAIN state restoration, and VISION health validation',
    category: 'resilience',
    modules: [
      { name: 'CORE', role: 'primary', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 550,
    minModulesRequired: 4,
  },
  {
    id: 'intelligent-failover-chain',
    name: 'Intelligent Failover Chain',
    description: 'NEXUS failover enhanced by BRAIN provider history, VISION latency prediction, and DEFENSE circuit status',
    category: 'resilience',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'DEFENSE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 180,
    minModulesRequired: 4,
  },
  {
    id: 'cognitive-state-preservation',
    name: 'Cognitive State Preservation',
    description: 'BRAIN preserves cognitive state with SYSTEM persistence, CORTEX priority tagging, and RIPPLE event journaling',
    category: 'resilience',
    modules: [
      { name: 'BRAIN', role: 'primary', required: true },
      { name: 'SYSTEM', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'enhancer', required: true },
      { name: 'RIPPLE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 320,
    minModulesRequired: 4,
  },
  
  // Enterprise Orchestration
  {
    id: 'full-stack-evolution',
    name: 'Full-Stack Evolution',
    description: 'CORTEX proposes changes validated by MODERNIZER impact, BRAIN history, VISION metrics, and DEFENSE safety checks',
    category: 'orchestration',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'EVOLUTION', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'DEFENSE', role: 'validator', required: true },
    ],
    risk: 'high',
    reversible: true,
    estimatedMs: 1200,
    minModulesRequired: 5,
  },
  {
    id: 'multi-modal-task-routing',
    name: 'Multi-Modal Task Routing',
    description: 'CORTEX routes tasks based on DECODE complexity analysis, BRAIN competency matching, and VISION resource availability',
    category: 'orchestration',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 250,
    minModulesRequired: 4,
  },
  {
    id: 'adaptive-workflow-engine',
    name: 'Adaptive Workflow Engine',
    description: 'CORTEX adjusts workflows dynamically using VISION metrics, BRAIN learned patterns, and RIPPLE event triggers',
    category: 'orchestration',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'RIPPLE', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 400,
    minModulesRequired: 4,
  },
  
  // Enterprise Optimization
  {
    id: 'predictive-resource-allocation',
    name: 'Predictive Resource Allocation',
    description: 'SYSTEM allocates resources using BRAIN demand prediction, VISION usage trends, and CORTEX scheduling optimization',
    category: 'optimization',
    modules: [
      { name: 'SYSTEM', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 200,
    minModulesRequired: 4,
  },
  {
    id: 'intelligent-batch-processing',
    name: 'Intelligent Batch Processing',
    description: 'RIPPLE batches events using BRAIN optimal grouping, CORTEX priority ordering, and VISION throughput optimization',
    category: 'optimization',
    modules: [
      { name: 'RIPPLE', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 120,
    minModulesRequired: 4,
  },
  {
    id: 'cost-aware-routing',
    name: 'Cost-Aware Routing',
    description: 'NEXUS selects providers using ACCESS budget constraints, VISION cost history, and CORTEX value optimization',
    category: 'optimization',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'ACCESS', role: 'enhancer', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 100,
    minModulesRequired: 4,
  },
  
  // Enterprise Accessibility
  {
    id: 'comprehensive-accessibility-audit',
    name: 'Comprehensive Accessibility Audit',
    description: 'INCLUSIVE performs deep audit with VISION metrics tracking, DECODE readability scoring, and MODERNIZER auto-fix suggestions',
    category: 'accessibility',
    modules: [
      { name: 'INCLUSIVE', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'EVOLUTION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 450,
    minModulesRequired: 4,
  },
  {
    id: 'adaptive-content-transformation',
    name: 'Adaptive Content Transformation',
    description: 'NEXUS transforms content using INCLUSIVE guidelines, BRAIN user preferences, and DECODE semantic preservation',
    category: 'accessibility',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'INCLUSIVE', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 500,
    minModulesRequired: 4,
  },
  
  // Enterprise Automation
  {
    id: 'self-documenting-evolution',
    name: 'Self-Documenting Evolution',
    description: 'MODERNIZER tracks changes with DECODE explanation generation, BRAIN historical context, and SYSTEM version management',
    category: 'automation',
    modules: [
      { name: 'EVOLUTION', role: 'primary', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'SYSTEM', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 380,
    minModulesRequired: 4,
  },
  {
    id: 'intelligent-deprecation-manager',
    name: 'Intelligent Deprecation Manager',
    description: 'CORTEX identifies deprecated features using VISION usage analytics, BRAIN impact analysis, and MODERNIZER migration planning',
    category: 'automation',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'EVOLUTION', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 420,
    minModulesRequired: 4,
  },
  {
    id: 'autonomous-optimization-loop',
    name: 'Autonomous Optimization Loop',
    description: 'CORTEX identifies bottlenecks using VISION metrics, BRAIN patterns, and MODERNIZER applies automated improvements',
    category: 'automation',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'EVOLUTION', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 650,
    minModulesRequired: 4,
  },
  
  // === v7.5.2 DISCOVERED SYNERGIES (15 NEW) ===
  // Module intersections previously unexplored
  
  // INTEGRATION × COGNITIVE (underutilized intersection)
  {
    id: 'external-data-enrichment',
    name: 'External Data Enrichment',
    description: 'INTEGRATION fetches external data enhanced by BRAIN semantic indexing, DECODE entity extraction, and NEXUS summarization',
    category: 'intelligence',
    modules: [
      { name: 'INTEGRATION', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'NEXUS', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 450,
    minModulesRequired: 4,
  },
  {
    id: 'api-intelligence-layer',
    name: 'API Intelligence Layer',
    description: 'INTEGRATION API responses transformed by BRAIN context, CORTEX decision logic, and VISION quality scoring',
    category: 'intelligence',
    modules: [
      { name: 'INTEGRATION', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 380,
    minModulesRequired: 4,
  },
  
  // DREAM × DEFENSE (creative security - novel intersection)
  {
    id: 'creative-threat-modeling',
    name: 'Creative Threat Modeling',
    description: 'DREAM imagines novel attack vectors validated by DEFENSE threat intelligence and BRAIN historical patterns',
    category: 'security',
    modules: [
      { name: 'DREAM', role: 'primary', required: true },
      { name: 'DEFENSE', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 550,
    minModulesRequired: 3,
  },
  
  // RIPPLE × INCLUSIVE (accessibility events)
  {
    id: 'accessibility-event-stream',
    name: 'Accessibility Event Stream',
    description: 'RIPPLE captures accessibility events with INCLUSIVE compliance scoring and VISION analytics aggregation',
    category: 'accessibility',
    modules: [
      { name: 'RIPPLE', role: 'primary', required: true },
      { name: 'INCLUSIVE', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 180,
    minModulesRequired: 3,
  },
  
  // CORE × DREAM (configuration learning)
  {
    id: 'config-optimization-learning',
    name: 'Config Optimization Learning',
    description: 'CORE configuration tuned by DREAM pattern discovery, BRAIN performance history, and VISION metrics',
    category: 'optimization',
    modules: [
      { name: 'CORE', role: 'primary', required: true },
      { name: 'DREAM', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 400,
    minModulesRequired: 4,
  },
  
  // ACCESS × DREAM (entitlement evolution)
  {
    id: 'entitlement-evolution',
    name: 'Entitlement Evolution',
    description: 'ACCESS entitlements optimized by DREAM usage pattern synthesis and CORTEX governance validation',
    category: 'automation',
    modules: [
      { name: 'ACCESS', role: 'primary', required: true },
      { name: 'DREAM', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 320,
    minModulesRequired: 3,
  },
  
  // MODERNIZER × VISION (proactive maintenance)
  {
    id: 'proactive-maintenance-engine',
    name: 'Proactive Maintenance Engine',
    description: 'MODERNIZER predicts maintenance needs from VISION degradation patterns and BRAIN failure history',
    category: 'resilience',
    modules: [
      { name: 'MODERNIZER', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 480,
    minModulesRequired: 3,
  },
  
  // SYSTEM × DREAM (resource imagination)
  {
    id: 'resource-demand-imagination',
    name: 'Resource Demand Imagination',
    description: 'SYSTEM capacity planning enhanced by DREAM demand scenario synthesis and CORTEX priority scheduling',
    category: 'optimization',
    modules: [
      { name: 'SYSTEM', role: 'primary', required: true },
      { name: 'DREAM', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 350,
    minModulesRequired: 3,
  },
  
  // NEXUS × INCLUSIVE (accessible AI responses)
  {
    id: 'accessible-ai-generation',
    name: 'Accessible AI Generation',
    description: 'NEXUS AI responses automatically adapted by INCLUSIVE readability standards and DECODE clarity scoring',
    category: 'accessibility',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'INCLUSIVE', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 420,
    minModulesRequired: 3,
  },
  
  // DEFENSE × MODERNIZER (security evolution)
  {
    id: 'security-posture-evolution',
    name: 'Security Posture Evolution',
    description: 'DEFENSE policies evolved by MODERNIZER analysis, BRAIN threat patterns, and CORTEX governance approval',
    category: 'security',
    modules: [
      { name: 'DEFENSE', role: 'primary', required: true },
      { name: 'MODERNIZER', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 580,
    minModulesRequired: 4,
  },
  
  // RIPPLE × DECODE (event semantics)
  {
    id: 'semantic-event-enrichment',
    name: 'Semantic Event Enrichment',
    description: 'RIPPLE events enriched with DECODE semantic parsing, BRAIN contextual memory, and VISION correlation',
    category: 'intelligence',
    modules: [
      { name: 'RIPPLE', role: 'primary', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 280,
    minModulesRequired: 4,
  },
  
  // CORE × INTEGRATION (config synchronization)
  {
    id: 'distributed-config-sync',
    name: 'Distributed Config Sync',
    description: 'CORE config synchronized across INTEGRATION adapters with RIPPLE event propagation and DEFENSE validation',
    category: 'orchestration',
    modules: [
      { name: 'CORE', role: 'primary', required: true },
      { name: 'INTEGRATION', role: 'enhancer', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'DEFENSE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 200,
    minModulesRequired: 4,
  },
  
  // VISION × MODERNIZER × DREAM (predictive evolution)
  {
    id: 'predictive-evolution-engine',
    name: 'Predictive Evolution Engine',
    description: 'VISION detects degradation trends while DREAM synthesizes solutions and MODERNIZER proposes targeted fixes',
    category: 'automation',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'DREAM', role: 'enhancer', required: true },
      { name: 'MODERNIZER', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 620,
    minModulesRequired: 3,
  },
  
  // ACCESS × INTEGRATION × DEFENSE (API security)
  {
    id: 'api-entitlement-fortress',
    name: 'API Entitlement Fortress',
    description: 'ACCESS controls API access via INTEGRATION adapters with DEFENSE threat prevention and VISION audit logging',
    category: 'security',
    modules: [
      { name: 'ACCESS', role: 'primary', required: true },
      { name: 'INTEGRATION', role: 'enhancer', required: true },
      { name: 'DEFENSE', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 250,
    minModulesRequired: 4,
  },
  
  // BRAIN × INCLUSIVE × VISION (cognitive accessibility)
  {
    id: 'cognitive-accessibility-profiler',
    name: 'Cognitive Accessibility Profiler',
    description: 'BRAIN learns user accessibility needs via INCLUSIVE profiling with VISION preference tracking and DECODE adaptation',
    category: 'accessibility',
    modules: [
      { name: 'BRAIN', role: 'primary', required: true },
      { name: 'INCLUSIVE', role: 'enhancer', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 340,
    minModulesRequired: 4,
  },
  
  // === v7.5.3 DISCOVERED SYNERGIES (12 NEW) ===
  // Deep cross-layer intelligence intersections
  
  // CORTEX × DREAM × BRAIN × NEXUS (Meta-Learning Orchestration)
  {
    id: 'meta-learning-orchestrator',
    name: 'Meta-Learning Orchestrator',
    description: 'CORTEX coordinates meta-learning across DREAM imagination, BRAIN consolidation, and NEXUS model selection',
    category: 'intelligence',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'DREAM', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'NEXUS', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 720,
    minModulesRequired: 4,
  },
  
  // DECODE × DREAM × INCLUSIVE (Intent Accessibility Synthesis)
  {
    id: 'intent-accessibility-synthesis',
    name: 'Intent Accessibility Synthesis',
    description: 'DECODE parses complex intents while DREAM synthesizes accessible alternatives validated by INCLUSIVE compliance',
    category: 'accessibility',
    modules: [
      { name: 'DECODE', role: 'primary', required: true },
      { name: 'DREAM', role: 'enhancer', required: true },
      { name: 'INCLUSIVE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 380,
    minModulesRequired: 3,
  },
  
  // VISION × DEFENSE × RIPPLE × BRAIN (Threat Intelligence Mesh)
  {
    id: 'threat-intelligence-mesh',
    name: 'Threat Intelligence Mesh',
    description: 'VISION detects anomalies distributed via RIPPLE to DEFENSE response with BRAIN pattern memory',
    category: 'security',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'DEFENSE', role: 'enhancer', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 290,
    minModulesRequired: 4,
  },
  
  // SYSTEM × CORTEX × VISION × ACCESS (Resource Governance Engine)
  {
    id: 'resource-governance-engine',
    name: 'Resource Governance Engine',
    description: 'SYSTEM resources governed by CORTEX policy, ACCESS entitlements, and VISION utilization metrics',
    category: 'orchestration',
    modules: [
      { name: 'SYSTEM', role: 'primary', required: true },
      { name: 'CORTEX', role: 'enhancer', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'ACCESS', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 450,
    minModulesRequired: 4,
  },
  
  // NEXUS × BRAIN × DECODE × VISION (Reasoning Quality Amplifier)
  {
    id: 'reasoning-quality-amplifier',
    name: 'Reasoning Quality Amplifier',
    description: 'NEXUS reasoning enhanced by BRAIN context, DECODE intent clarity, and VISION quality scoring',
    category: 'intelligence',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 540,
    minModulesRequired: 4,
  },
  
  // MODERNIZER × BRAIN × DEFENSE × CORTEX (Secure Evolution Pipeline)
  {
    id: 'secure-evolution-pipeline',
    name: 'Secure Evolution Pipeline',
    description: 'MODERNIZER evolution proposals vetted by DEFENSE security analysis, BRAIN history, and CORTEX approval',
    category: 'automation',
    modules: [
      { name: 'MODERNIZER', role: 'primary', required: true },
      { name: 'DEFENSE', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 680,
    minModulesRequired: 4,
  },
  
  // INTEGRATION × RIPPLE × VISION × DEFENSE (External API Guardian)
  {
    id: 'external-api-guardian',
    name: 'External API Guardian',
    description: 'INTEGRATION APIs monitored by VISION health, RIPPLE event tracking, and DEFENSE threat prevention',
    category: 'security',
    modules: [
      { name: 'INTEGRATION', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'DEFENSE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 320,
    minModulesRequired: 4,
  },
  
  // DREAM × DECODE × NEXUS × CORTEX (Creative Problem Solver)
  {
    id: 'creative-problem-solver',
    name: 'Creative Problem Solver',
    description: 'DREAM generates novel solutions from DECODE problem parsing, NEXUS reasoning, and CORTEX feasibility check',
    category: 'intelligence',
    modules: [
      { name: 'DREAM', role: 'primary', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'NEXUS', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 620,
    minModulesRequired: 4,
  },
  
  // ACCESS × BRAIN × VISION × SYSTEM (Usage Pattern Intelligence)
  {
    id: 'usage-pattern-intelligence',
    name: 'Usage Pattern Intelligence',
    description: 'ACCESS usage analyzed by BRAIN pattern learning, VISION trend detection, and SYSTEM capacity planning',
    category: 'optimization',
    modules: [
      { name: 'ACCESS', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'SYSTEM', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 280,
    minModulesRequired: 4,
  },
  
  // INCLUSIVE × BRAIN × NEXUS × DECODE (Personalized Accessibility Engine)
  {
    id: 'personalized-accessibility-engine',
    name: 'Personalized Accessibility Engine',
    description: 'INCLUSIVE adapts based on BRAIN learned preferences, NEXUS content transformation, and DECODE clarity',
    category: 'accessibility',
    modules: [
      { name: 'INCLUSIVE', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'NEXUS', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 440,
    minModulesRequired: 4,
  },
  
  // CORE × VISION × MODERNIZER × BRAIN (Adaptive Configuration Intelligence)
  {
    id: 'adaptive-configuration-intelligence',
    name: 'Adaptive Configuration Intelligence',
    description: 'CORE config optimized by VISION metrics, MODERNIZER recommendations, and BRAIN performance history',
    category: 'optimization',
    modules: [
      { name: 'CORE', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'MODERNIZER', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 390,
    minModulesRequired: 4,
  },
  
  // RIPPLE × CORTEX × BRAIN × VISION (Event-Driven Orchestration Intelligence)
  {
    id: 'event-driven-orchestration',
    name: 'Event-Driven Orchestration Intelligence',
    description: 'RIPPLE events orchestrated by CORTEX decisions informed by BRAIN context and VISION patterns',
    category: 'orchestration',
    modules: [
      { name: 'RIPPLE', role: 'primary', required: true },
      { name: 'CORTEX', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 260,
    minModulesRequired: 4,
  },
  
  // Add S-tier synergies
  ...STIER_SYNERGY_DEFINITIONS,
  // Add Infrastructure-era pipelines (v9.0.0)
  ...INFRASTRUCTURE_SYNERGY_DEFINITIONS,
];

/**
 * Initialize the synergy registry with all definitions
 */
export function initSynergyRegistry(): void {
  for (const def of SYNERGY_DEFINITIONS) {
    registry.synergies.set(def.id, def);
  }
}

/**
 * Register a synergy executor
 */
export function registerSynergyExecutor(
  synergyId: string,
  executor: SynergyExecutor
): void {
  if (!registry.synergies.has(synergyId)) {
    throw new Error(`Synergy '${synergyId}' not found in registry`);
  }
  registry.executors.set(synergyId, executor);
}

/**
 * Force-register an executor even if no synergy definition exists.
 * Used by shadow mesh stubs for executors that span modules
 * without formal synergy definitions.
 * NOTE: Stubs are already immune-wrapped before calling this —
 * this function intentionally does NOT re-wrap to avoid double wrapping.
 */
export function forceRegisterExecutor(
  synergyId: string,
  executor: SynergyExecutor
): void {
  registry.executors.set(synergyId, executor);
}

/**
 * Get a synergy definition by ID
 */
export function getSynergy(id: string): SynergyDefinition | undefined {
  return registry.synergies.get(id);
}

/**
 * Get a synergy executor by ID
 */
export function getSynergyExecutor(id: string): SynergyExecutor | undefined {
  return registry.executors.get(id);
}

/**
 * List all synergies, optionally filtered by category
 */
export function listSynergies(category?: string): SynergyDefinition[] {
  const all = Array.from(registry.synergies.values());
  if (category) {
    return all.filter(s => s.category === category);
  }
  return all;
}

/**
 * Get synergies that use a specific module
 */
export function getSynergiesByModule(moduleName: string): SynergyDefinition[] {
  return Array.from(registry.synergies.values()).filter(s =>
    s.modules.some(m => m.name.toUpperCase() === moduleName.toUpperCase())
  );
}

/**
 * Get synergy categories with counts
 */
export function getSynergyCategories(): { category: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const s of registry.synergies.values()) {
    counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([category, count]) => ({ category, count }));
}

/**
 * List all registered executor IDs (for dynamic discovery by shadow probes)
 */
export function listRegisteredExecutorIds(): string[] {
  return Array.from(registry.executors.keys());
}

// Auto-initialize on module load
initSynergyRegistry();
