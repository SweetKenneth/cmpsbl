/**
 * MERCHANT™ — Cross-Substrate Marketplace Curator Agent
 * 
 * The MERCHANT agent autonomously travels between all substrates and verticals,
 * scanning S-Tier vaults, A-Tier vaults, and Memory Stream discoveries to curate
 * the best software into a unified marketplace at marketplace.cmpsbl.com.
 * 
 * Scan cadence: every 8 hours (aligned with Memory Stream cycles)
 * Pricing: delegated to ECONOMY engine copy — $10–$50 range, high-volume strategy
 */

export type SourceSubstrate = 'primary' | 'cyber' | 'robotics' | 'quantum' | 'llm' | 'agency';
export type SourceVault = 's-tier' | 'a-tier' | 'discovery' | 'memory-chain';
export type ListingCategory = 
  | 'meta-engine' | 'meta-agent' | 'memory-chain' | 'security-module'
  | 'robotics-controller' | 'quantum-optimizer' | 'llm-toolkit' | 'agency-workflow'
  | 'governance-tool' | 'integration-bridge' | 'analytics-engine' | 'defense-layer';

export interface MarketplaceItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  painPoints: string[];
  features: string[];
  sourceSubstrate: SourceSubstrate;
  sourceVault: SourceVault;
  sourceId: string;
  category: ListingCategory;
  cjpiScore: number;
  tier: 'Mint' | 'Prime' | 'Relic' | 'Mythic' | 'Apex';
  priceCents: number;
  originalValueCents: number;
  primitiveChain: string[];
  downloads: number;
  rating: number;
  isFeatured: boolean;
  isNew: boolean;
  addedAt: string;
  lastVerifiedAt: string;
  version: string;
  tags: string[];
}

export interface MerchantScanResult {
  id: string;
  substrate: SourceSubstrate;
  vault: SourceVault;
  itemsScanned: number;
  itemsQualified: number;
  itemsAdded: number;
  itemsRetired: number;
  scanDurationMs: number;
  timestamp: string;
}

export interface MerchantInventory {
  totalItems: number;
  bySubstrate: Record<SourceSubstrate, number>;
  byCategory: Record<string, number>;
  byTier: Record<string, number>;
  lastScanAt: string;
  nextScanAt: string;
  averagePriceCents: number;
  totalValueCents: number;
}

/** MERCHANT qualification criteria — only the best make the marketplace */
const QUALIFICATION_THRESHOLDS = {
  minCjpi: 75,
  minPrimitiveChainLength: 2,
  maxItemsPerSubstrate: 50,
  maxTotalInventory: 300,
  retirementAgeDays: 90,
} as const;

/** ECONOMY-aligned pricing for high-volume, low-cost strategy ($10–$50) */
export function calculateMarketplacePrice(cjpiScore: number, primitiveChainLength: number): number {
  // Base: $10 floor, $50 ceiling
  const baseRateCents = 1000; // $10.00
  const ceilingCents = 5000;  // $50.00

  // Score-based scaling: 75–100 maps to $10–$50
  const normalizedScore = Math.max(0, Math.min(1, (cjpiScore - 75) / 25));
  const scorePremium = normalizedScore * (ceilingCents - baseRateCents);
  
  // Chain complexity bonus: +$2 per primitive beyond 2
  const chainBonus = Math.max(0, primitiveChainLength - 2) * 200;
  
  const rawPrice = baseRateCents + scorePremium + chainBonus;
  
  // Round to nearest $1
  return Math.min(ceilingCents, Math.round(rawPrice / 100) * 100);
}

/** Generate a human-readable slug from a title */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

/** Determine if an item qualifies for the marketplace */
export function qualifiesForMarketplace(
  cjpiScore: number,
  primitiveChainLength: number,
  sourceVault: SourceVault
): boolean {
  if (cjpiScore < QUALIFICATION_THRESHOLDS.minCjpi) return false;
  if (primitiveChainLength < QUALIFICATION_THRESHOLDS.minPrimitiveChainLength) return false;
  
  // S-Tier always qualifies if CJPI is met
  if (sourceVault === 's-tier') return true;
  
  // A-Tier needs slightly higher bar
  if (sourceVault === 'a-tier' && cjpiScore < 80) return false;
  
  // Discoveries need strong score
  if (sourceVault === 'discovery' && cjpiScore < 82) return false;
  
  return true;
}

/** Map CJPI score to marketplace tier label */
export function getMarketplaceTier(cjpiScore: number): MarketplaceItem['tier'] {
  if (cjpiScore >= 100) return 'Apex';
  if (cjpiScore >= 94) return 'Mythic';
  if (cjpiScore >= 90) return 'Relic';
  if (cjpiScore >= 80) return 'Prime';
  return 'Mint';
}

/** Category-to-icon mapping for UI */
export const CATEGORY_META: Record<ListingCategory, { label: string; emoji: string; color: string }> = {
  'meta-engine': { label: 'Meta Engine', emoji: '⚙️', color: 'primary' },
  'meta-agent': { label: 'Meta Agent', emoji: '🤖', color: 'neon-purple' },
  'memory-chain': { label: 'Memory Chain', emoji: '🧠', color: 'neon-cyan' },
  'security-module': { label: 'Security Module', emoji: '🛡️', color: 'neon-magenta' },
  'robotics-controller': { label: 'Robotics Controller', emoji: '🦾', color: 'neon-green' },
  'quantum-optimizer': { label: 'Quantum Optimizer', emoji: '⚛️', color: 'neon-purple' },
  'llm-toolkit': { label: 'LLM Toolkit', emoji: '💬', color: 'neon-cyan' },
  'agency-workflow': { label: 'Agency Workflow', emoji: '📋', color: 'neon-amber' },
  'governance-tool': { label: 'Governance Tool', emoji: '⚖️', color: 'primary' },
  'integration-bridge': { label: 'Integration Bridge', emoji: '🔗', color: 'neon-green' },
  'analytics-engine': { label: 'Analytics Engine', emoji: '📊', color: 'neon-blue' },
  'defense-layer': { label: 'Defense Layer', emoji: '🔒', color: 'neon-magenta' },
};

/** All substrates the MERCHANT scans */
export const SCANNABLE_SUBSTRATES: SourceSubstrate[] = [
  'primary', 'cyber', 'robotics', 'quantum', 'llm', 'agency'
];

/** Substrate display metadata */
export const SUBSTRATE_META: Record<SourceSubstrate, { label: string; color: string }> = {
  primary: { label: 'CMPSBL Core', color: 'primary' },
  cyber: { label: 'CMPSBL CYBER', color: 'neon-magenta' },
  robotics: { label: 'CMPSBL ROBOTICS', color: 'neon-green' },
  quantum: { label: 'CMPSBL QUANTUM', color: 'neon-purple' },
  llm: { label: 'CMPSBL LLM', color: 'neon-cyan' },
  agency: { label: 'CMPSBL AGENCY', color: 'neon-amber' },
};
