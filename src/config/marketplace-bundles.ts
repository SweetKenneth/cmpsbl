/**
 * Marketplace Bundles & Stacks Configuration v8.0.0
 * SYNERGY+ Epoch Market-aligned pricing based on competitor research (Feb 2026)
 * Volume packs and developer outcome recipes with 25-35% discounts
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
// Market-aligned: $99-$199 (25-30% savings)
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
  amount: number; // cents
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
    product_id: 'prod_Ttq6PKOU7i4KMZ',
    price_id: 'price_1Sw2QJQ7FtTiAL4auhBYAzPh',
    amount: 19900, // $199
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
    product_id: 'prod_Ttq6wdKtmktTsc',
    price_id: 'price_1Sw2QKQ7FtTiAL4as7CuLl18',
    amount: 24900, // $249
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
    product_id: 'prod_Ttq6CdIUcR3uFd',
    price_id: 'price_1Sw2QLQ7FtTiAL4aGNjU3YJo',
    amount: 29900, // $299
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
    product_id: 'prod_Ttq6nE3M9yNU4T',
    price_id: 'price_1Sw2QMQ7FtTiAL4alJ9foP7i',
    amount: 24900, // $249
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
    bundlePrice: 14900,
    savings: 49080,
    savingsPercent: 30,
    product_id: 'prod_Ttq6C6Pc3UzhG5',
    price_id: 'price_1Sw2QPQ7FtTiAL4aWWORd7Io',
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
    bundlePrice: 19900,
    savings: 113220,
    savingsPercent: 35,
    product_id: 'prod_Ttq6Ma0M8K5WNo',
    price_id: 'price_1Sw2QQQ7FtTiAL4aNxLFgCml',
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
    bundlePrice: 4900,
    savings: 4050,
    savingsPercent: 30,
    product_id: 'prod_Ttq6mgRnIQyRYl',
    price_id: 'price_1Sw2QOQ7FtTiAL4aqecnRxZd',
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
    monthlyPrice: 4900,
    annualPrice: 44100,
    price_id_monthly: 'price_1Sw2Q7Q7FtTiAL4aTGbRQ4qK',
    price_id_annual: 'price_1Sw2Q8Q7FtTiAL4aPbvZisJt',
    product_id: 'prod_Ttq68OvKqqvwoJ',
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
    monthlyPrice: 9900,
    annualPrice: 89100,
    price_id_monthly: 'price_1Sw2Q9Q7FtTiAL4aKCjc8YGQ',
    price_id_annual: 'price_1Sw2QBQ7FtTiAL4aepXD5inO',
    product_id: 'prod_Ttq6uM4C1vQY9m',
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
    monthlyPrice: 24900,
    annualPrice: 224100,
    price_id_monthly: 'price_1Sw2QCQ7FtTiAL4a3ptFf575',
    price_id_annual: 'price_1Sw2QDQ7FtTiAL4a3iszdoU2',
    product_id: 'prod_Ttq6hskYfgXBLC',
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
    monthlyPrice: 19900,
    annualPrice: 179100,
    price_id_monthly: 'price_1StkasQ7FtTiAL4azXr89vH5',
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
    monthlyPrice: 49900,
    annualPrice: 449100,
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
