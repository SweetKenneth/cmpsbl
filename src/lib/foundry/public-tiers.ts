/**
 * Public Memory Stream Tier Mapping
 * Display-layer only. Internal scoring unchanged.
 * Quality floor: 68. No pipelines below this are ever shown or stored.
 */

export const QUALITY_FLOOR = 68;

export type PublicTier = 'Mint' | 'Prime' | 'Relic' | 'Mythic' | 'Apex';

export interface PublicTierConfig {
  id: PublicTier;
  min: number;
  max: number;
  color: string;
  accent: string;
  description: string;
}

export const PUBLIC_TIERS: PublicTierConfig[] = [
  { id: 'Mint',   min: 68, max: 79, color: 'hsl(160, 60%, 50%)',  accent: 'text-emerald-400', description: 'Solid discovery — production-viable' },
  { id: 'Prime',  min: 80, max: 89, color: 'hsl(200, 80%, 60%)',  accent: 'text-sky-400',     description: 'High-quality pipeline' },
  { id: 'Relic',  min: 90, max: 93, color: 'hsl(45, 95%, 55%)',   accent: 'text-amber-400',   description: 'Rare find — exceptional capability' },
  { id: 'Mythic', min: 94, max: 99, color: 'hsl(280, 80%, 65%)',  accent: 'text-purple-400',  description: 'Near-perfect synthesis — silicon-eligible' },
  { id: 'Apex',   min: 100, max: 100, color: 'hsl(var(--primary))', accent: 'text-primary',   description: 'Perfect score — crown achievement' },
];

/**
 * Map internal score to public tier label
 */
export function scoreToPublicTier(score: number): PublicTier | null {
  if (score < QUALITY_FLOOR) return null;
  if (score === 100) return 'Apex';
  if (score >= 94) return 'Mythic';
  if (score >= 90) return 'Relic';
  if (score >= 80) return 'Prime';
  return 'Mint';
}

/**
 * Get tier config by public tier name
 */
export function getTierConfig(tier: PublicTier): PublicTierConfig {
  return PUBLIC_TIERS.find(t => t.id === tier) ?? PUBLIC_TIERS[0];
}

/**
 * Compute halved valuation for display
 * 100 score → $1,000,000 displayed
 * Formula: (score / 100) * 2,000,000 * 0.5
 */
export function computeDisplayValuation(score: number): number {
  const internalValuation = (score / 100) * 2_000_000;
  return Math.round(internalValuation * 0.5);
}

/**
 * Format display valuation as currency string
 */
export function formatValuation(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

/**
 * Get tier badge styles for UI
 */
export function getTierBadgeClass(tier: PublicTier): string {
  const map: Record<PublicTier, string> = {
    Mint:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Prime:  'bg-sky-500/10 text-sky-400 border-sky-500/30',
    Relic:  'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Mythic: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    Apex:   'bg-primary/10 text-primary border-primary/30',
  };
  return map[tier];
}
