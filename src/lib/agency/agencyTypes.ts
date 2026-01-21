/**
 * Agency Mint — Type Definitions
 * Types for agency creation, templates, and purchases
 */

export const SPECIALIZATIONS = [
  { id: 'Hybrid', name: 'Hybrid+', description: 'Versatile leader with cross-domain capabilities', color: 'fuchsia', isLeader: true },
  { id: 'Writing', name: 'Writing', description: 'Content creation, copywriting, documentation', color: 'violet' },
  { id: 'Analyst', name: 'Analyst', description: 'Data analysis, insights, reporting', color: 'cyan' },
  { id: 'OPS', name: 'OPS', description: 'Operations, automation, workflows', color: 'emerald' },
  { id: 'Coding', name: 'Coding', description: 'Software development, debugging, architecture', color: 'amber' },
  { id: 'Defense', name: 'Defense', description: 'Security, threat detection, risk analysis', color: 'red' },
  { id: 'Dreamer', name: 'Dreamer', description: 'Creative ideation, innovation, exploration', color: 'pink' },
  { id: 'Finance', name: 'Finance', description: 'Financial analysis, budgeting, forecasting', color: 'green' },
  { id: 'Research', name: 'Research', description: 'Deep research, competitive intel, discovery', color: 'blue' },
  { id: 'Marketing', name: 'Marketing', description: 'Growth, campaigns, brand strategy', color: 'orange' },
  { id: 'Support', name: 'Support', description: 'Customer support, documentation, FAQs', color: 'teal' },
] as const;

export type Specialization = typeof SPECIALIZATIONS[number]['id'];

export const DREAM_POOL_MODES = [
  { id: 'local_only', name: 'Local Only', description: 'Each cognitive maintains private memory' },
  { id: 'local_shared', name: 'Local + Shared', description: 'Private memory with shared dream pool access' },
  { id: 'read_only_shared', name: 'Read-Only Shared', description: 'Can read shared pool but not contribute' },
  { id: 'full_mesh', name: 'Full Mesh', description: 'Complete memory sharing across all cognitives' },
] as const;

export type DreamPoolMode = typeof DREAM_POOL_MODES[number]['id'];

export interface AgencyMember {
  id?: string;
  role: 'leader' | 'specialist';
  specialization: Specialization;
  skillWeights: {
    research: number;
    analysis: number;
    execution: number;
  };
  cognitiveId?: string;
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
