/**
 * Engine Subscription Pricing Configuration
 * v8.1.0 — Canonical pricing tiers for Engines + Meta-Engines
 * 
 * Self-improvement/evolution engines are INTERNAL (not purchasable)
 */

import type { EngineId } from '@/lib/substrate/engines/types';
import type { MetaEngineId } from '@/lib/substrate/engines/meta/types';

// ============================================================================
// SUBSCRIPTION PLANS
// ============================================================================

export type SubscriptionPlan = 'starter' | 'builder' | 'pro' | 'enterprise';

export interface PlanDefinition {
  id: SubscriptionPlan;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number; // ~2 months free
  description: string;
  features: string[];
  executionsPerMonth: number;
  includesMetaEngines: boolean;
  engineTiers: EngineVisibility[];
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, PlanDefinition> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Free tier with core engine access',
    features: [
      'Core engines included',
      '100 executions/month',
      'Community support',
      'Basic analytics',
    ],
    executionsPerMonth: 100,
    includesMetaEngines: false,
    engineTiers: ['free'],
  },
  builder: {
    id: 'builder',
    name: 'Builder',
    monthlyPrice: 49,
    yearlyPrice: 490, // ~2 months free
    description: 'Full engine access for developers',
    features: [
      'All standard engines',
      '2,000 executions/month',
      'Priority queue',
      'Email support',
      'Advanced analytics',
    ],
    executionsPerMonth: 2000,
    includesMetaEngines: false,
    engineTiers: ['free', 'standard'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 149,
    yearlyPrice: 1490, // ~2 months free
    description: 'Meta-engines for advanced orchestration',
    features: [
      'All engines + meta-engines',
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
    monthlyPrice: 499,
    yearlyPrice: 4990,
    description: 'Custom limits + SLA + dedicated support',
    features: [
      'Unlimited engines',
      'Custom execution limits',
      'SLA guarantee (99.9%)',
      'Dedicated support',
      'Custom integrations',
      'Unlimited team seats',
      'On-prem option',
    ],
    executionsPerMonth: -1, // Unlimited
    includesMetaEngines: true,
    engineTiers: ['free', 'standard', 'advanced', 'meta', 'enterprise'],
  },
};

// ============================================================================
// ENGINE VISIBILITY & MONETIZATION
// ============================================================================

export type EngineVisibility = 'free' | 'standard' | 'advanced' | 'meta' | 'internal' | 'enterprise';

export interface EngineMonetization {
  visibility: EngineVisibility;
  requiredPlan: SubscriptionPlan;
  isInternal: boolean; // True = shown as platform capability, not purchasable
}

// Internal engines (self-improvement) - showcased but not sold
const INTERNAL_ENGINE_IDS: string[] = [
  'evolution_engine',
  'modernization_engine',
  'metacognition_engine',
  'self_healing_engine',
  'self_documentation_engine',
];

// Internal meta-engines
const INTERNAL_META_ENGINE_IDS: string[] = [
  'autonomous_operator', // Contains evolution_engine
  'self_governance',     // Contains self_healing and self_documentation
  'world_first_cognitive',
  'world_first_operational',
  'world_first_intelligence',
  'world_first_governance',
];

// Free tier engines
const FREE_ENGINE_IDS: string[] = [
  'memory_engine',
  'context_engine',
  'event_engine',
];

// Advanced tier engines
const ADVANCED_ENGINE_IDS: string[] = [
  'reasoning_engine',
  'foresight_engine',
  'synthesis_engine',
  'graph_engine',
  'threat_engine',
  'attack_surface_engine',
];

/**
 * Get monetization config for an engine
 */
export function getEngineMonetization(engineId: EngineId | string): EngineMonetization {
  // Internal engines - showcased but not sold
  if (INTERNAL_ENGINE_IDS.includes(engineId)) {
    return { visibility: 'internal', requiredPlan: 'enterprise', isInternal: true };
  }
  
  // Free tier
  if (FREE_ENGINE_IDS.includes(engineId)) {
    return { visibility: 'free', requiredPlan: 'starter', isInternal: false };
  }
  
  // Advanced tier
  if (ADVANCED_ENGINE_IDS.includes(engineId)) {
    return { visibility: 'advanced', requiredPlan: 'pro', isInternal: false };
  }
  
  // Enhancement engines (v8.1.0) - Enterprise only
  if (engineId.includes('enhancement') || engineId.includes('world_first')) {
    return { visibility: 'enterprise', requiredPlan: 'enterprise', isInternal: false };
  }
  
  // Default to standard tier
  return { visibility: 'standard', requiredPlan: 'builder', isInternal: false };
}

/**
 * Get monetization config for a meta-engine
 */
export function getMetaEngineMonetization(metaEngineId: MetaEngineId | string): EngineMonetization {
  // Internal meta-engines
  if (INTERNAL_META_ENGINE_IDS.includes(metaEngineId)) {
    return { visibility: 'internal', requiredPlan: 'enterprise', isInternal: true };
  }
  
  // All other meta-engines require Pro
  return { visibility: 'meta', requiredPlan: 'pro', isInternal: false };
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
    label: 'Builder', 
    color: 'text-cyan-400', 
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    priceLabel: '$49/mo',
  },
  advanced: { 
    label: 'Pro', 
    color: 'text-amber-400', 
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    priceLabel: '$149/mo',
  },
  meta: { 
    label: 'Pro', 
    color: 'text-primary', 
    badge: 'bg-primary/10 text-primary border-primary/30',
    priceLabel: '$149/mo',
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
