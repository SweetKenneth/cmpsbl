/**
 * Minds Intelligence Layer — Proficiency-Gated Capabilities
 * GATED: proficiency_gating = DISABLED
 * Infrastructure built. Enforcement disabled. Activatable via flag.
 */

import { getEffectiveStatus } from './featureFlags';

export type ProficiencyTier = 'novice' | 'intermediate' | 'specialist' | 'expert' | 'master';

export interface GatedCapability {
  id: string;
  name: string;
  description: string;
  /** Minimum tier required */
  requiredTier: ProficiencyTier;
  /** Which Mind SKUs can unlock this */
  applicableMinds: string[] | '*';
}

export interface ProficiencyProfile {
  mindSku: string;
  currentTier: ProficiencyTier;
  competencyScore: number; // 0-100
  totalTasks: number;
  successRate: number; // 0-1
  specializations: string[];
}

/** Tier thresholds (competency score) */
const TIER_THRESHOLDS: Record<ProficiencyTier, number> = {
  novice: 0,
  intermediate: 25,
  specialist: 50,
  expert: 75,
  master: 90,
};

/** Tier ordering for comparison */
const TIER_ORDER: ProficiencyTier[] = ['novice', 'intermediate', 'specialist', 'expert', 'master'];

/** Registered gated capabilities */
const GATED_CAPABILITIES: GatedCapability[] = [
  {
    id: 'advanced_research',
    name: 'Advanced Research Pipeline',
    description: 'Multi-source deep research with citation chains',
    requiredTier: 'specialist',
    applicableMinds: ['research', 'analyst'],
  },
  {
    id: 'autonomous_scheduling',
    name: 'Autonomous Task Scheduling',
    description: 'Self-initiated task scheduling without user prompt',
    requiredTier: 'expert',
    applicableMinds: ['ops', 'support'],
  },
  {
    id: 'creative_synthesis',
    name: 'Creative Synthesis Mode',
    description: 'Cross-domain creative combination of concepts',
    requiredTier: 'expert',
    applicableMinds: ['writer', 'marketing', 'product'],
  },
  {
    id: 'predictive_analysis',
    name: 'Predictive Analysis',
    description: 'Trend-based outcome prediction with confidence intervals',
    requiredTier: 'specialist',
    applicableMinds: ['analyst', 'finance', 'sales'],
  },
  {
    id: 'multi_step_reasoning',
    name: 'Multi-Step Reasoning Chains',
    description: 'Complex reasoning chains exceeding 5 steps',
    requiredTier: 'intermediate',
    applicableMinds: '*',
  },
  {
    id: 'code_generation',
    name: 'Production Code Generation',
    description: 'Generate deployment-ready code with tests',
    requiredTier: 'specialist',
    applicableMinds: ['coding', 'data-engineer'],
  },
  {
    id: 'contract_analysis',
    name: 'Full Contract Analysis',
    description: 'Multi-clause contract review with risk scoring',
    requiredTier: 'specialist',
    applicableMinds: ['legal'],
  },
  {
    id: 'threat_modeling',
    name: 'Advanced Threat Modeling',
    description: 'Full STRIDE/DREAD analysis with attack trees',
    requiredTier: 'expert',
    applicableMinds: ['security'],
  },
];

/** Per-Mind proficiency profiles */
const profiles = new Map<string, ProficiencyProfile>();

/** Determine tier from competency score */
export function scoreToProficiency(score: number): ProficiencyTier {
  if (score >= TIER_THRESHOLDS.master) return 'master';
  if (score >= TIER_THRESHOLDS.expert) return 'expert';
  if (score >= TIER_THRESHOLDS.specialist) return 'specialist';
  if (score >= TIER_THRESHOLDS.intermediate) return 'intermediate';
  return 'novice';
}

/** Compare tier levels */
function tierMeetsMinimum(current: ProficiencyTier, required: ProficiencyTier): boolean {
  return TIER_ORDER.indexOf(current) >= TIER_ORDER.indexOf(required);
}

/** Get or create proficiency profile */
export function getProfile(mindSku: string): ProficiencyProfile {
  let profile = profiles.get(mindSku);
  if (!profile) {
    profile = {
      mindSku,
      currentTier: 'novice',
      competencyScore: 0,
      totalTasks: 0,
      successRate: 0,
      specializations: [],
    };
    profiles.set(mindSku, profile);
  }
  return profile;
}

/** Check if a Mind can access a gated capability */
export function canAccessCapability(mindSku: string, capabilityId: string): {
  allowed: boolean;
  reason?: string;
  currentTier: ProficiencyTier;
  requiredTier?: ProficiencyTier;
} {
  // If proficiency gating is DISABLED, allow everything
  if (getEffectiveStatus('proficiency_gating') !== 'ACTIVE') {
    return { allowed: true, currentTier: 'master' };
  }

  const capability = GATED_CAPABILITIES.find(c => c.id === capabilityId);
  if (!capability) {
    return { allowed: true, currentTier: 'novice', reason: 'Capability not registered' };
  }

  // Check Mind applicability
  if (capability.applicableMinds !== '*' && !capability.applicableMinds.includes(mindSku)) {
    return {
      allowed: false,
      reason: `Capability "${capability.name}" not available for this Mind`,
      currentTier: 'novice',
      requiredTier: capability.requiredTier,
    };
  }

  const profile = getProfile(mindSku);
  const allowed = tierMeetsMinimum(profile.currentTier, capability.requiredTier);

  return {
    allowed,
    currentTier: profile.currentTier,
    requiredTier: capability.requiredTier,
    reason: allowed ? undefined : `Requires ${capability.requiredTier} tier (current: ${profile.currentTier})`,
  };
}

/** Update proficiency from task outcome */
export function recordTaskOutcome(
  mindSku: string,
  success: boolean,
  qualityScore?: number
): ProficiencyProfile {
  const profile = getProfile(mindSku);
  profile.totalTasks++;
  profile.successRate = (
    (profile.successRate * (profile.totalTasks - 1)) + (success ? 1 : 0)
  ) / profile.totalTasks;

  // Update competency score
  const delta = success ? (qualityScore ? qualityScore / 100 * 2 : 1) : -0.5;
  profile.competencyScore = Math.max(0, Math.min(100, profile.competencyScore + delta));
  profile.currentTier = scoreToProficiency(profile.competencyScore);

  return profile;
}

/** Get all capabilities for a Mind with access status */
export function getCapabilitiesForMind(mindSku: string): Array<GatedCapability & { accessible: boolean }> {
  return GATED_CAPABILITIES
    .filter(c => c.applicableMinds === '*' || c.applicableMinds.includes(mindSku))
    .map(c => ({
      ...c,
      accessible: canAccessCapability(mindSku, c.id).allowed,
    }));
}

/** Get all registered gated capabilities */
export function getAllGatedCapabilities(): GatedCapability[] {
  return [...GATED_CAPABILITIES];
}
