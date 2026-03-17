/**
 * Agency Mint — Type Definitions
 * Types for agency creation, templates, and purchases
 * Expanded with 20 specializations and 8 skill dimensions
 */

// ============================================================================
// EXPANDED SKILL DIMENSIONS (8 skills)
// ============================================================================
export const SKILL_DIMENSIONS = [
  { id: 'research', name: 'Research', description: 'Information gathering, discovery, investigation', icon: 'Search' },
  { id: 'analysis', name: 'Analysis', description: 'Data processing, pattern recognition, insights', icon: 'BarChart3' },
  { id: 'execution', name: 'Execution', description: 'Task completion, implementation, delivery', icon: 'Play' },
  { id: 'creativity', name: 'Creativity', description: 'Ideation, innovation, novel solutions', icon: 'Lightbulb' },
  { id: 'communication', name: 'Communication', description: 'Writing, presenting, explaining', icon: 'MessageSquare' },
  { id: 'strategy', name: 'Strategy', description: 'Planning, decision-making, long-term thinking', icon: 'Target' },
  { id: 'technical', name: 'Technical', description: 'Engineering, coding, system design', icon: 'Code' },
  { id: 'coordination', name: 'Coordination', description: 'Team sync, workflow management, delegation', icon: 'Network' },
] as const;

export type SkillDimension = typeof SKILL_DIMENSIONS[number]['id'];

export type SkillWeights = {
  [K in SkillDimension]: number;
};

// Default skill weights for new agents
export const DEFAULT_SKILL_WEIGHTS: SkillWeights = {
  research: 0.5,
  analysis: 0.5,
  execution: 0.5,
  creativity: 0.5,
  communication: 0.5,
  strategy: 0.5,
  technical: 0.5,
  coordination: 0.5,
};

// ============================================================================
// EXPANDED SPECIALIZATIONS (20 agent types)
// ============================================================================
export const SPECIALIZATIONS = [
  // Leadership
  { id: 'Hybrid', name: 'Hybrid+', description: 'Versatile leader with cross-domain capabilities', color: 'fuchsia', isLeader: true, defaultSkills: { research: 0.7, analysis: 0.7, execution: 0.7, creativity: 0.6, communication: 0.8, strategy: 0.9, technical: 0.5, coordination: 0.9 } },
  
  // Core Operations
  { id: 'OPS', name: 'Operations', description: 'Workflow automation, process optimization', color: 'emerald', defaultSkills: { research: 0.4, analysis: 0.6, execution: 0.9, creativity: 0.3, communication: 0.5, strategy: 0.6, technical: 0.7, coordination: 0.8 } },
  { id: 'Coding', name: 'Engineer', description: 'Software development, debugging, architecture', color: 'amber', defaultSkills: { research: 0.6, analysis: 0.7, execution: 0.9, creativity: 0.5, communication: 0.4, strategy: 0.5, technical: 0.95, coordination: 0.3 } },
  { id: 'Analyst', name: 'Analyst', description: 'Data analysis, insights, reporting', color: 'cyan', defaultSkills: { research: 0.8, analysis: 0.95, execution: 0.6, creativity: 0.4, communication: 0.6, strategy: 0.7, technical: 0.6, coordination: 0.4 } },
  
  // Creative & Content
  { id: 'Writing', name: 'Writer', description: 'Content creation, copywriting, documentation', color: 'violet', defaultSkills: { research: 0.6, analysis: 0.5, execution: 0.7, creativity: 0.9, communication: 0.95, strategy: 0.4, technical: 0.2, coordination: 0.3 } },
  { id: 'Dreamer', name: 'Innovator', description: 'Creative ideation, brainstorming, exploration', color: 'pink', defaultSkills: { research: 0.7, analysis: 0.4, execution: 0.3, creativity: 0.95, communication: 0.6, strategy: 0.7, technical: 0.3, coordination: 0.4 } },
  { id: 'Designer', name: 'Designer', description: 'Visual design, UX, brand identity', color: 'rose', defaultSkills: { research: 0.5, analysis: 0.5, execution: 0.7, creativity: 0.9, communication: 0.7, strategy: 0.5, technical: 0.6, coordination: 0.4 } },
  
  // Research & Intelligence
  { id: 'Research', name: 'Researcher', description: 'Deep research, competitive intel, discovery', color: 'blue', defaultSkills: { research: 0.95, analysis: 0.8, execution: 0.5, creativity: 0.5, communication: 0.6, strategy: 0.6, technical: 0.4, coordination: 0.3 } },
  { id: 'Intel', name: 'Intelligence', description: 'Market intelligence, trend analysis, forecasting', color: 'indigo', defaultSkills: { research: 0.9, analysis: 0.85, execution: 0.4, creativity: 0.4, communication: 0.5, strategy: 0.8, technical: 0.3, coordination: 0.4 } },
  
  // Security & Defense
  { id: 'Defense', name: 'Security', description: 'Threat detection, risk analysis, protection', color: 'red', defaultSkills: { research: 0.7, analysis: 0.85, execution: 0.7, creativity: 0.3, communication: 0.4, strategy: 0.8, technical: 0.8, coordination: 0.5 } },
  { id: 'Audit', name: 'Auditor', description: 'Compliance, quality assurance, verification', color: 'slate', defaultSkills: { research: 0.7, analysis: 0.9, execution: 0.6, creativity: 0.2, communication: 0.6, strategy: 0.5, technical: 0.5, coordination: 0.4 } },
  
  // Business & Finance
  { id: 'Finance', name: 'Finance', description: 'Financial analysis, budgeting, forecasting', color: 'green', defaultSkills: { research: 0.6, analysis: 0.9, execution: 0.6, creativity: 0.3, communication: 0.5, strategy: 0.8, technical: 0.5, coordination: 0.4 } },
  { id: 'Sales', name: 'Sales', description: 'Lead generation, outreach, deal closing', color: 'yellow', defaultSkills: { research: 0.5, analysis: 0.5, execution: 0.8, creativity: 0.6, communication: 0.9, strategy: 0.7, technical: 0.2, coordination: 0.6 } },
  { id: 'Legal', name: 'Legal', description: 'Contract review, compliance, policy', color: 'stone', defaultSkills: { research: 0.8, analysis: 0.85, execution: 0.5, creativity: 0.2, communication: 0.7, strategy: 0.7, technical: 0.3, coordination: 0.4 } },
  
  // Marketing & Growth
  { id: 'Marketing', name: 'Marketing', description: 'Growth, campaigns, brand strategy', color: 'orange', defaultSkills: { research: 0.6, analysis: 0.6, execution: 0.7, creativity: 0.8, communication: 0.85, strategy: 0.8, technical: 0.4, coordination: 0.5 } },
  { id: 'Growth', name: 'Growth', description: 'User acquisition, retention, optimization', color: 'lime', defaultSkills: { research: 0.6, analysis: 0.8, execution: 0.8, creativity: 0.6, communication: 0.5, strategy: 0.85, technical: 0.5, coordination: 0.5 } },
  { id: 'SEO', name: 'SEO', description: 'Search optimization, content strategy, rankings', color: 'teal', defaultSkills: { research: 0.7, analysis: 0.75, execution: 0.7, creativity: 0.5, communication: 0.6, strategy: 0.7, technical: 0.6, coordination: 0.3 } },
  
  // Customer-Facing
  { id: 'Support', name: 'Support', description: 'Customer support, documentation, FAQs', color: 'sky', defaultSkills: { research: 0.5, analysis: 0.5, execution: 0.8, creativity: 0.3, communication: 0.9, strategy: 0.3, technical: 0.4, coordination: 0.6 } },
  { id: 'Success', name: 'Success', description: 'Customer success, onboarding, retention', color: 'purple', defaultSkills: { research: 0.5, analysis: 0.6, execution: 0.7, creativity: 0.4, communication: 0.85, strategy: 0.6, technical: 0.3, coordination: 0.7 } },
  
  // Data & ML
  { id: 'Data', name: 'Data Scientist', description: 'ML models, data pipelines, predictions', color: 'fuchsia', defaultSkills: { research: 0.8, analysis: 0.95, execution: 0.6, creativity: 0.5, communication: 0.4, strategy: 0.5, technical: 0.9, coordination: 0.3 } },
] as const;

export type Specialization = typeof SPECIALIZATIONS[number]['id'];

// ============================================================================
// MEMORY MODES
// ============================================================================
export const DREAM_POOL_MODES = [
  { id: 'local_only', name: 'Local Only', description: 'Each agent maintains private memory' },
  { id: 'local_shared', name: 'Local + Shared', description: 'Private memory with shared dream pool access' },
  { id: 'read_only_shared', name: 'Read-Only Shared', description: 'Can read shared pool but not contribute' },
  { id: 'full_mesh', name: 'Full Mesh', description: 'Complete memory sharing across all agents' },
] as const;

export type DreamPoolMode = typeof DREAM_POOL_MODES[number]['id'];

// ============================================================================
// AGENCY MEMBER TYPE
// ============================================================================
export interface AgencyMember {
  id?: string;
  role: 'leader' | 'specialist';
  specialization: Specialization;
  skillWeights: SkillWeights;
  cognitiveId?: string;
}

// Helper to get default skills for a specialization
export function getDefaultSkillsForSpec(specId: Specialization): SkillWeights {
  const spec = SPECIALIZATIONS.find(s => s.id === specId);
  if (spec && 'defaultSkills' in spec) {
    return spec.defaultSkills as SkillWeights;
  }
  return { ...DEFAULT_SKILL_WEIGHTS };
}

export interface AgencyTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  basePriceCents: number;
  defaultMembers: AgencyMember[];
  dreamPoolMode: DreamPoolMode;
  isFeatured: boolean;
}

export interface Agency {
  id: string;
  ownerId?: string;
  name: string;
  description?: string;
  templateId?: string;
  leaderId?: string;
  dreamPoolMode: DreamPoolMode;
  cohesionRating: number;
  status: 'draft' | 'purchased' | 'deployed' | 'archived';
  deploymentType: 'standalone' | 'embedded' | 'hosted';
  deploymentDomain?: string;
  businessProfile: {
    companyName?: string;
    domain?: string;
    category?: string;
    goals?: string[];
  };
  members: AgencyMember[];
  createdAt: string;
  updatedAt: string;
}

export interface AgencyPurchase {
  id: string;
  userId?: string;
  agencyId?: string;
  stripeSessionId?: string;
  stripeCustomerId?: string;
  basePriceCents: number;
  additionalCognitives: number;
  additionalPriceCents: number;
  totalPriceCents: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  purchaseEmail?: string;
  onboardingToken?: string;
  onboardingCompleted: boolean;
  createdAt: string;
}

// Pricing constants
export const AGENCY_BASE_PRICE = 39500; // $395.00
export const COGNITIVE_PRICE = 9500; // $95.00
export const STRIPE_AGENCY_PRICE_ID = 'price_1SrpC5Q7FtTiAL4ayLRZwAYW';
export const STRIPE_COGNITIVE_PRICE_ID = 'price_1SrpCGQ7FtTiAL4ateTDVJ51';

export function calculateTotalPrice(additionalCognitives: number): number {
  return AGENCY_BASE_PRICE + (additionalCognitives * COGNITIVE_PRICE);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
