/**
 * Engine Subscription Pricing Configuration
 * Unified tier naming (Free/Creator/Architect/Enterprise)
 * 
 * Free: 30 engines + 1 meta-engine
 * Creator: All 80 engines + 8 meta-engines
 * Architect: All 80 engines + 18 meta-engines
 * Enterprise: All 80 engines + all 26 meta-engines
 * 
 * Self-improvement/evolution engines are INTERNAL (not purchasable)
 */

import type { EngineId } from '@/lib/substrate/engines/types';
import type { MetaEngineId } from '@/lib/substrate/engines/meta/types';

// ============================================================================
// SUBSCRIPTION PLANS
// ============================================================================

export type SubscriptionPlan = 'free' | 'creator' | 'architect' | 'enterprise';

export interface PlanDefinition {
  id: SubscriptionPlan;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  executionsPerMonth: number;
  includesMetaEngines: boolean;
  engineTiers: EngineVisibility[];
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Core engine access with 1 meta-engine',
    features: [
      '30 core engines',
      '1 meta-engine (Cognitive Mesh)',
      '100 executions/month',
      'Community support',
      'Basic analytics',
    ],
    executionsPerMonth: 100,
    includesMetaEngines: true,
    engineTiers: ['free'],
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    monthlyPrice: 9,
    yearlyPrice: 108,
    description: 'Everything in Free, plus all 80 engines + 8 meta-engines',
    features: [
      'Everything in Free, plus:',
      'All 80 engines (up from 30)',
      '8 meta-engines (up from 1)',
      '2,000 executions/month',
      'Priority queue',
      'Email support',
      'Advanced analytics',
    ],
    executionsPerMonth: 2000,
    includesMetaEngines: true,
    engineTiers: ['free', 'standard'],
  },
  architect: {
    id: 'architect',
    name: 'Architect',
    monthlyPrice: 19,
    yearlyPrice: 228,
    description: 'Everything in Creator, plus 18 meta-engines',
    features: [
      'Everything in Creator, plus:',
      'All 80 engines + 18 meta-engines (up from 8)',
      '10,000 executions/month',
      'Priority execution',
      'Slack support',
      'Custom dashboards',
      'Team seats (3)',
    ],
    executionsPerMonth: 10000,
    includesMetaEngines: true,
    engineTiers: ['free', 'standard', 'advanced', 'meta'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 99,
    yearlyPrice: 1188,
    description: 'Everything in Architect, plus all 26 meta-engines',
    features: [
      'Everything in Architect, plus:',
      'All 80 engines + all 26 meta-engines (up from 18)',
      'Custom execution limits',
      'SLA guarantee (99.9%)',
      'Dedicated support',
      'Custom integrations',
      'Unlimited team seats',
      'On-prem option',
    ],
    executionsPerMonth: -1,
    includesMetaEngines: true,
    engineTiers: ['free', 'standard', 'advanced', 'meta', 'enterprise'],
  },
};

// Legacy aliases for backward compatibility
export type { SubscriptionPlan as LegacyPlan };

// ============================================================================
// ENGINE VISIBILITY & MONETIZATION
// ============================================================================

export type EngineVisibility = 'free' | 'standard' | 'advanced' | 'meta' | 'internal' | 'enterprise';

export interface EngineMonetization {
  visibility: EngineVisibility;
  requiredPlan: SubscriptionPlan;
  isInternal: boolean;
}

// Internal engines (self-improvement) - showcased but not sold
const INTERNAL_ENGINE_IDS: string[] = [
  'evolution_engine',
  'modernization_engine',
  'metacognition_engine',
  'self_healing_engine',
  'self_documentation_engine',
  'governor_engine',   // Platform governance — internal only
  'immune_engine',     // ENCODE immune system — internal only
];

// Internal meta-engines
const INTERNAL_META_ENGINE_IDS: string[] = [
  'autonomous_operator',
  'self_governance',
  'world_first_cognitive',
  'world_first_operational',
  'world_first_intelligence',
  'world_first_governance',
  'immune_autonomy_mesh',      // ENCODE immune mesh — internal only
  'memory_intelligence_fabric', // Deep memory fabric — internal showcase
];

// Free tier engines (33 core engines — generous foundation + 3 newly freed)
const FREE_ENGINE_IDS: string[] = [
  'memory_engine',
  'context_engine',
  'event_engine',
  'learning_engine',
  'resilience_engine',
  'optimization_engine',
  'orchestration_engine',
  'scheduling_engine',
  'adaptation_engine',
  'insight_engine',
  'prediction_engine',
  'compliance_engine',
  'quality_engine',
  'audit_engine',
  'defense_engine',
  'trust_engine',
  'broadcast_engine',
  'routing_engine',
  'transformation_engine',
  'monitoring_engine',
  'capacity_engine',
  'accessibility_engine',
  'personalization_engine',
  'graph_engine',
  'imagination_engine',
  'innovation_engine',
  'dream_engine',
  'intent_engine',
  'pipeline_engine',
  'coordination_engine',
  'salience_engine',   // Unified salience — free to drive adoption
  // ─── 3 newly freed engines (lowest complexity, highest adoption value) ───
  'notification_engine',  // Basic notifications — free to drive engagement
  'logging_engine',       // Observability basics — free foundation
  'tagging_engine',       // Content classification — free utility
];
const FREE_META_ENGINE_IDS: string[] = [
  'cognitive_mesh',
];

// Advanced tier engines (require Architect)
const ADVANCED_ENGINE_IDS: string[] = [
  'reasoning_engine',
  'foresight_engine',
  'synthesis_engine',
  'threat_engine',
  'attack_surface_engine',
  'emotion_engine',
  'multimodal_engine',
  'budget_engine',
  'quota_engine',
  'entitlement_engine',
  'delegation_engine',
  'temporal_engine',    // Time-series reasoning — Architect tier
];

/**
 * Get monetization config for an engine
 */
export function getEngineMonetization(engineId: EngineId | string): EngineMonetization {
  if (INTERNAL_ENGINE_IDS.includes(engineId)) {
    return { visibility: 'internal', requiredPlan: 'enterprise', isInternal: true };
  }
  if (FREE_ENGINE_IDS.includes(engineId)) {
    return { visibility: 'free', requiredPlan: 'free', isInternal: false };
  }
  if (ADVANCED_ENGINE_IDS.includes(engineId)) {
    return { visibility: 'advanced', requiredPlan: 'architect', isInternal: false };
  }
  if (engineId.includes('enhancement') || engineId.includes('world_first')) {
    return { visibility: 'enterprise', requiredPlan: 'enterprise', isInternal: false };
  }
  // Default to standard tier (Creator)
  return { visibility: 'standard', requiredPlan: 'creator', isInternal: false };
}

/**
 * Get monetization config for a meta-engine
 */
export function getMetaEngineMonetization(metaEngineId: MetaEngineId | string): EngineMonetization {
  if (INTERNAL_META_ENGINE_IDS.includes(metaEngineId)) {
    return { visibility: 'internal', requiredPlan: 'enterprise', isInternal: true };
  }
  if (FREE_META_ENGINE_IDS.includes(metaEngineId)) {
    return { visibility: 'free', requiredPlan: 'free', isInternal: false };
  }
  // All other meta-engines require Architect
  return { visibility: 'meta', requiredPlan: 'architect', isInternal: false };
}

// ============================================================================
// TIER DISPLAY CONFIG
// ============================================================================

export const TIER_DISPLAY: Record<EngineVisibility, { 
  label: string; 
  color: string; 
  badge: string;
  priceLabel: string;
}> = {
  free: { 
    label: 'Free', 
    color: 'text-emerald-400', 
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    priceLabel: 'Included',
  },
  standard: { 
    label: 'Creator', 
    color: 'text-cyan-400', 
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    priceLabel: '$29/mo',
  },
  advanced: { 
    label: 'Architect', 
    color: 'text-amber-400', 
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    priceLabel: '$79/mo',
  },
  meta: { 
    label: 'Architect', 
    color: 'text-primary', 
    badge: 'bg-primary/10 text-primary border-primary/30',
    priceLabel: '$79/mo',
  },
  internal: { 
    label: 'Platform', 
    color: 'text-violet-400', 
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    priceLabel: 'Internal',
  },
  enterprise: { 
    label: 'Enterprise', 
    color: 'text-rose-400', 
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    priceLabel: 'Custom',
  },
};

// ============================================================================
// CATEGORY CONFIG
// ============================================================================

export const ENGINE_CATEGORY_CONFIG: Record<string, { 
  icon: string; 
  color: string;
  label: string;
}> = {
  cognitive: { icon: 'Brain', color: 'text-violet-400', label: 'Cognitive' },
  operational: { icon: 'Zap', color: 'text-cyan-400', label: 'Operational' },
  intelligence: { icon: 'Sparkles', color: 'text-amber-400', label: 'Intelligence' },
  governance: { icon: 'Shield', color: 'text-emerald-400', label: 'Governance' },
  security: { icon: 'Lock', color: 'text-red-400', label: 'Security' },
  evolution: { icon: 'RefreshCw', color: 'text-purple-400', label: 'Evolution' },
  communication: { icon: 'Radio', color: 'text-blue-400', label: 'Communication' },
  integration: { icon: 'Plug', color: 'text-teal-400', label: 'Integration' },
  analytics: { icon: 'BarChart', color: 'text-orange-400', label: 'Analytics' },
  experience: { icon: 'Heart', color: 'text-pink-400', label: 'Experience' },
  knowledge: { icon: 'BookOpen', color: 'text-indigo-400', label: 'Knowledge' },
  autonomy: { icon: 'Bot', color: 'text-lime-400', label: 'Autonomy' },
  creativity: { icon: 'Palette', color: 'text-fuchsia-400', label: 'Creativity' },
  perception: { icon: 'Eye', color: 'text-sky-400', label: 'Perception' },
  resource: { icon: 'Wallet', color: 'text-yellow-400', label: 'Resource' },
  workflow: { icon: 'GitBranch', color: 'text-slate-400', label: 'Workflow' },
  enhancement: { icon: 'Rocket', color: 'text-rose-400', label: 'Enhancement' },
};
