/**
 * Marketplace Bundles & Stacks Configuration
 * Volume packs and developer outcome recipes with 20-30% discounts
 */

import type { Template } from '@/data/templates';

// ============================================
// RARITY IMAGES - Static imagery by tier
// ============================================
export const RARITY_IMAGES = {
  common: '/src/assets/marketplace/rarity-common.jpg',
  uncommon: '/src/assets/marketplace/rarity-uncommon.jpg',
  rare: '/src/assets/marketplace/rarity-rare.jpg',
  epic: '/src/assets/marketplace/rarity-epic.jpg',
  legendary: '/src/assets/marketplace/rarity-legendary.jpg',
  mythic: '/src/assets/marketplace/rarity-mythic.jpg',
} as const;

// Map difficulty to rarity for image selection
export function getRarityImage(difficulty: string): string {
  switch (difficulty) {
    case 'beginner': return RARITY_IMAGES.common;
    case 'intermediate': return RARITY_IMAGES.uncommon;
    case 'advanced': return RARITY_IMAGES.rare;
    case 'premium': return RARITY_IMAGES.epic;
    case 'elite': return RARITY_IMAGES.legendary;
    case 'pro': return RARITY_IMAGES.mythic;
    default: return RARITY_IMAGES.common;
  }
}

// ============================================
// CAPABILITY TAGS - Key features displayed on cards
// ============================================
export const CAPABILITY_TAGS = {
  // Memory & Persistence
  'persistent-memory': { label: 'Persistent Memory', icon: 'brain', color: 'violet' },
  'session-recall': { label: 'Session Recall', icon: 'database', color: 'blue' },
  'cross-session': { label: 'Cross-Session', icon: 'link', color: 'cyan' },
  
  // Drift Prevention (Core USP)
  'drift-prevention': { label: 'Drift Prevention', icon: 'anchor', color: 'rose' },
  'self-healing': { label: 'Self-Healing', icon: 'heart', color: 'emerald' },
  'behavioral-lock': { label: 'Behavioral Lock', icon: 'lock', color: 'amber' },
  
  // Security
  'jailbreak-defense': { label: 'Jailbreak Defense', icon: 'shield', color: 'red' },
  'prompt-injection': { label: 'Injection Guard', icon: 'shield-alert', color: 'orange' },
  'pii-filter': { label: 'PII Filter', icon: 'eye-off', color: 'slate' },
  
  // Learning
  'continuous-learning': { label: 'Continuous Learning', icon: 'trending-up', color: 'green' },
  'dream-cycles': { label: 'Dream Cycles', icon: 'moon', color: 'purple' },
  'self-improvement': { label: 'Self-Improvement', icon: 'sparkles', color: 'pink' },
  
  // Integration
  'multi-provider': { label: 'Multi-Provider', icon: 'network', color: 'teal' },
  'byok-ready': { label: 'BYOK Ready', icon: 'key', color: 'yellow' },
  'sdk-integration': { label: 'SDK Ready', icon: 'code', color: 'indigo' },
} as const;

export type CapabilityTag = keyof typeof CAPABILITY_TAGS;

// ============================================
// TEMPLATE STACKS - Developer Outcome Recipes
// ============================================
export interface TemplateStack {
  id: string;
  name: string;
  description: string;
  outcome: string; // What the developer achieves
  templateIds: string[];
  modules: string[];
  discount: number; // 0.20 = 20% off
  price_id?: string;
  product_id?: string;
}

export const TEMPLATE_STACKS: TemplateStack[] = [
  {
    id: 'stack-chatbot-complete',
    name: 'Production Chatbot Stack',
    description: 'Everything needed to ship a production chatbot that never drifts.',
    outcome: 'Deploy a self-healing AI chatbot with persistent memory in 2 hours',
    templateIds: [
      'self-healing-chatbot',
      'memory-persistence-core',
      'context-continuity-engine',
      'cognitive-firewall',
    ],
    modules: ['brain', 'decode', 'defense'],
    discount: 0.25,
    product_id: 'prod_TrTXD7AJqm3FHZ',
    price_id: 'price_1StkaXQ7FtTiAL4a58DIgguO',
  },
  {
    id: 'stack-support-agent',
    name: 'Customer Support Stack',
    description: 'Complete customer support agent with resolution learning and escalation.',
    outcome: 'Launch AI support that remembers every customer and learns from every ticket',
    templateIds: [
      'support-memory-agent',
      'behavioral-anchor-system',
      'goal-persistence-module',
      'observability-dashboard',
    ],
    modules: ['brain', 'decode', 'vision'],
    discount: 0.25,
    product_id: 'prod_TrTXdxrGQFR9dX',
    price_id: 'price_1StkaZQ7FtTiAL4a6bayDLa9',
  },
  {
    id: 'stack-learning-platform',
    name: 'AI Learning Platform Stack',
    description: 'Build AI that learns and improves autonomously through dream cycles.',
    outcome: 'Ship an AI that gets better overnight without manual retraining',
    templateIds: [
      'autonomous-improvement-loop',
      'learning-consolidation-engine',
      'knowledge-graph-builder',
      'drift-prevention-engine',
    ],
    modules: ['brain', 'dream'],
    discount: 0.30,
    product_id: 'prod_TrTX07cvn2Cja9',
    price_id: 'price_1StkaaQ7FtTiAL4a7cOKlhD1',
  },
  {
    id: 'stack-secure-enterprise',
    name: 'Enterprise Security Stack',
    description: 'Maximum security for enterprise AI deployments.',
    outcome: 'Deploy AI with military-grade prompt security and identity protection',
    templateIds: [
      'cognitive-firewall',
      'personality-guard-system',
      'behavioral-anchor-system',
      'observability-dashboard',
    ],
    modules: ['defense', 'brain', 'vision'],
    discount: 0.25,
    product_id: 'prod_TrTXGcYdqrJmeO',
    price_id: 'price_1StkacQ7FtTiAL4a3D3NMPo6',
  },
];

// ============================================
// BUNDLES - Volume Packs with Discounts
// ============================================
export interface Bundle {
  id: string;
  name: string;
  description: string;
  templateIds: string[];
  originalPrice: number; // cents
  bundlePrice: number; // cents with discount
  savings: number; // cents saved
  savingsPercent: number;
  price_id?: string;
  product_id?: string;
}

export const BUNDLES: Bundle[] = [
  {
    id: 'bundle-drift-essentials',
    name: 'Drift Prevention Essentials',
    description: 'The 5 core templates every AI application needs to prevent behavioral drift.',
    templateIds: [
      'drift-prevention-engine',
      'memory-persistence-core',
      'behavioral-anchor-system',
      'context-continuity-engine',
      'observability-dashboard',
    ],
    originalPrice: 163600,
    bundlePrice: 114520,
    savings: 49080,
    savingsPercent: 30,
    product_id: 'prod_TrTXtPZf5SteaR',
    price_id: 'price_1StkaTQ7FtTiAL4a9XCkEqzj',
  },
  {
    id: 'bundle-business-complete',
    name: 'Business AI Complete',
    description: 'All 10 business application templates for customer-facing AI.',
    templateIds: [
      'smart-recommendation-engine',
      'support-memory-agent',
      'fitness-coach-brain',
      'wellness-companion-engine',
      'financial-advisor-brain',
      'hr-intelligence-agent',
      'it-helpdesk-brain',
      'travel-planner-engine',
      'music-discovery-brain',
      'real-estate-agent-brain',
    ],
    originalPrice: 377400,
    bundlePrice: 264180,
    savings: 113220,
    savingsPercent: 30,
    product_id: 'prod_TrTX2F02kWos5n',
    price_id: 'price_1StkaUQ7FtTiAL4aLihyQYfX',
  },
  {
    id: 'bundle-starter-pack',
    name: 'Starter Pack (5 Templates)',
    description: 'Perfect for new developers. 5 beginner-friendly templates.',
    templateIds: [
      'chatbot',
      'knowledge-base',
      'dream-feeder',
      'ai-router',
      'observability',
    ],
    originalPrice: 13500,
    bundlePrice: 9450,
    savings: 4050,
    savingsPercent: 30,
    product_id: 'prod_TrTX9L8eDWh0Vk',
    price_id: 'price_1StkaWQ7FtTiAL4auVElR0PM',
  },
];

// ============================================
// AGENCY PACKS - Commercial Licensing
// ============================================
export interface AgencyPack {
  id: string;
  name: string;
  description: string;
  entitlements: string[];
  monthlyPrice: number; // cents
  annualPrice: number; // cents (25% off)
  templateCount: number;
  price_id_monthly?: string;
  price_id_annual?: string;
  product_id?: string;
}

export const AGENCY_PACKS: AgencyPack[] = [
  {
    id: 'agency-starter',
    name: 'Agency Starter',
    description: 'For small agencies deploying AI for up to 5 clients.',
    entitlements: [
      'Commercial usage rights',
      'Up to 5 client deployments',
      '6-month updates',
      'Email support',
    ],
    templateCount: 10,
    monthlyPrice: 19900,
    annualPrice: 179100,
    price_id_monthly: 'price_1StkahQ7FtTiAL4a9vwzcf52',
    price_id_annual: 'price_1StkaiQ7FtTiAL4aHljLC4VK',
    product_id: 'prod_TrTXujuZzhJkqG',
  },
  {
    id: 'agency-professional',
    name: 'Agency Professional',
    description: 'For growing agencies with up to 25 client deployments.',
    entitlements: [
      'Commercial usage rights',
      'Up to 25 client deployments',
      '12-month updates',
      'Priority support',
      'Optional rebranding',
    ],
    templateCount: 30,
    monthlyPrice: 49900,
    annualPrice: 449100,
    price_id_monthly: 'price_1StkakQ7FtTiAL4aSD0KP9Qh',
    price_id_annual: 'price_1StkalQ7FtTiAL4a7u9C048C',
    product_id: 'prod_TrTXmiUiQFerTZ',
  },
  {
    id: 'agency-enterprise',
    name: 'Agency Enterprise',
    description: 'Unlimited client deployments with full commercial rights.',
    entitlements: [
      'Commercial usage rights',
      'Unlimited client deployments',
      '24-month updates',
      'Dedicated support',
      'Full rebranding rights',
      'Source code access',
    ],
    templateCount: -1,
    monthlyPrice: 149900,
    annualPrice: 1349100,
    price_id_monthly: 'price_1StkanQ7FtTiAL4afkVK2zDQ',
    price_id_annual: 'price_1StkaoQ7FtTiAL4asIfm4Af0',
    product_id: 'prod_TrTXLKscsgEYvO',
  },
];

// ============================================
// STUDIO LICENSING - High ACV
// ============================================
export interface StudioLicense {
  id: string;
  name: string;
  description: string;
  includes: string[];
  monthlyPrice: number;
  annualPrice: number;
  price_id_monthly?: string;
  price_id_annual?: string;
}

export const STUDIO_LICENSES: StudioLicense[] = [
  {
    id: 'studio-professional',
    name: 'Studio Professional',
    description: 'World Engine primitives with NPC memory and dream cycles.',
    includes: [
      'World Engine Core',
      'NPC Memory System',
      'Dream Cycles',
      'Persistent World State',
      'Physics Integration',
      'BYOK Routing',
    ],
    monthlyPrice: 99900,
    annualPrice: 899100,
    price_id_monthly: 'price_1StkatQ7FtTiAL4aWqQYzs6O',
    price_id_annual: 'price_1StkauQ7FtTiAL4awoJFZ0Ct',
  },
  {
    id: 'studio-enterprise',
    name: 'Studio Enterprise',
    description: 'Complete World Engine with multi-agent coordination and white-label.',
    includes: [
      'Everything in Professional',
      'Multi-Agent Coordination',
      'Entity Systems',
      'White-Label Rights',
      'Custom Integration Support',
      'SLA Guarantee',
    ],
    monthlyPrice: 249900,
    annualPrice: 2249100,
    price_id_monthly: 'price_1StkawQ7FtTiAL4aM4CPyVFd',
    price_id_annual: 'price_1StkaxQ7FtTiAL4aXeYaVfcx',
  },
];

// ============================================
// RIGHTS MATRIX
// ============================================
export interface RightsEntry {
  personal: boolean;
  commercial: boolean;
  internal: boolean;
  clientDistribution: boolean;
  rebrand: boolean;
  deployment: 'single' | 'multi' | 'unlimited';
  byok: boolean;
  updates: string; // e.g., "6 months", "12 months", "lifetime"
  support: 'community' | 'email' | 'priority' | 'dedicated';
}

export const RIGHTS_MATRIX: Record<string, RightsEntry> = {
  template: {
    personal: true,
    commercial: false,
    internal: true,
    clientDistribution: false,
    rebrand: false,
    deployment: 'single',
    byok: true,
    updates: '6 months',
    support: 'community',
  },
  bundle: {
    personal: true,
    commercial: false,
    internal: true,
    clientDistribution: false,
    rebrand: false,
    deployment: 'single',
    byok: true,
    updates: '12 months',
    support: 'email',
  },
  agency_starter: {
    personal: true,
    commercial: true,
    internal: true,
    clientDistribution: true,
    rebrand: false,
    deployment: 'multi',
    byok: true,
    updates: '6 months',
    support: 'email',
  },
  agency_professional: {
    personal: true,
    commercial: true,
    internal: true,
    clientDistribution: true,
    rebrand: true,
    deployment: 'multi',
    byok: true,
    updates: '12 months',
    support: 'priority',
  },
  agency_enterprise: {
    personal: true,
    commercial: true,
    internal: true,
    clientDistribution: true,
    rebrand: true,
    deployment: 'unlimited',
    byok: true,
    updates: '24 months',
    support: 'dedicated',
  },
  studio: {
    personal: true,
    commercial: true,
    internal: true,
    clientDistribution: true,
    rebrand: true,
    deployment: 'unlimited',
    byok: true,
    updates: 'lifetime',
    support: 'dedicated',
  },
  os_license: {
    personal: true,
    commercial: true,
    internal: true,
    clientDistribution: true,
    rebrand: true,
    deployment: 'single',
    byok: true,
    updates: 'lifetime',
    support: 'priority',
  },
};

// ============================================
// PRICING HELPERS
// ============================================
export function calculateStackPrice(stack: TemplateStack, templatePrices: Record<string, number>): {
  original: number;
  discounted: number;
  savings: number;
} {
  const original = stack.templateIds.reduce((sum, id) => sum + (templatePrices[id] || 0), 0);
  const discounted = Math.round(original * (1 - stack.discount));
  return {
    original,
    discounted,
    savings: original - discounted,
  };
}

export function formatAnnualSavings(monthly: number, annual: number): string {
  const monthlyCost = monthly * 12;
  const savings = monthlyCost - annual;
  const percent = Math.round((savings / monthlyCost) * 100);
  return `Save ${percent}% annually ($${(savings / 100).toFixed(0)}/year)`;
}
