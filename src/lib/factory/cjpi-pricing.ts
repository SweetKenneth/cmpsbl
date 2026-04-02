/**
 * CJPI Pricing Engine — Graduated pricing for Showroom discoveries
 * Tiers: Raw (<68, free), Mint (68-79), Prime (80-89), Relic (90-93), Mythic (94-99), Apex (100)
 */

export type CJPITier = 'Raw' | 'Mint' | 'Prime' | 'Relic' | 'Mythic' | 'Apex';

export interface CJPIPricing {
  tier: CJPITier;
  score: number;
  ratePerPoint: number; // dollars
  totalPriceCents: number;
  displayPrice: string;
  isApex: boolean;
  isFree: boolean;
}

export interface TierConfig {
  name: CJPITier;
  minScore: number;
  maxScore: number;
  ratePerPoint: number;
  color: string;
  description: string;
}

export const CJPI_TIERS: TierConfig[] = [
  { name: 'Raw', minScore: 0, maxScore: 67, ratePerPoint: 0, color: 'muted-foreground', description: 'Junkyard — free, unlimited copies, no certificate' },
  { name: 'Mint', minScore: 68, maxScore: 79, ratePerPoint: 1.00, color: 'emerald-400', description: 'Production-ready. Solid foundation.' },
  { name: 'Prime', minScore: 80, maxScore: 89, ratePerPoint: 1.25, color: 'sky-400', description: 'High quality. Reliable architecture.' },
  { name: 'Relic', minScore: 90, maxScore: 93, ratePerPoint: 1.50, color: 'amber-400', description: 'Exceptional. Rare composition.' },
  { name: 'Mythic', minScore: 94, maxScore: 99, ratePerPoint: 2.00, color: 'purple-400', description: 'Near-perfect. Extraordinary collision result.' },
  { name: 'Apex', minScore: 100, maxScore: 100, ratePerPoint: 0, color: 'primary', description: 'The First Compiler. $1,952. Perfect 100.' },
];

const APEX_PRICE_CENTS = 195200; // $1,952.00

/**
 * Calculate price for a given CJPI score.
 */
export function calculateCJPIPrice(score: number): CJPIPricing {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score * 10) / 10));

  // Apex — fixed price
  if (clampedScore >= 100) {
    return {
      tier: 'Apex',
      score: 100,
      ratePerPoint: 0,
      totalPriceCents: APEX_PRICE_CENTS,
      displayPrice: '$1,952',
      isApex: true,
      isFree: false,
    };
  }

  // Raw — free
  if (clampedScore < 68) {
    return {
      tier: 'Raw',
      score: clampedScore,
      ratePerPoint: 0,
      totalPriceCents: 0,
      displayPrice: 'Free',
      isApex: false,
      isFree: true,
    };
  }

  // Find tier
  const tier = CJPI_TIERS.find(t => clampedScore >= t.minScore && clampedScore <= t.maxScore);
  if (!tier) {
    // Fallback to Raw
    return {
      tier: 'Raw',
      score: clampedScore,
      ratePerPoint: 0,
      totalPriceCents: 0,
      displayPrice: 'Free',
      isApex: false,
      isFree: true,
    };
  }

  const totalDollars = clampedScore * tier.ratePerPoint;
  const totalCents = Math.round(totalDollars * 100);

  return {
    tier: tier.name,
    score: clampedScore,
    ratePerPoint: tier.ratePerPoint,
    totalPriceCents: totalCents,
    displayPrice: `$${totalDollars.toFixed(0)}`,
    isApex: false,
    isFree: false,
  };
}

/**
 * Get the tier for a given score.
 */
export function getTierForScore(score: number): TierConfig {
  const s = Math.round(score * 10) / 10;
  return CJPI_TIERS.find(t => s >= t.minScore && s <= t.maxScore) ?? CJPI_TIERS[0];
}

/**
 * Format a price range for a tier.
 */
export function getTierPriceRange(tier: CJPITier): string {
  const config = CJPI_TIERS.find(t => t.name === tier);
  if (!config) return '—';
  if (tier === 'Raw') return 'Free';
  if (tier === 'Apex') return '$1,952';
  const low = config.minScore * config.ratePerPoint;
  const high = config.maxScore * config.ratePerPoint;
  return `$${low.toFixed(0)}–$${high.toFixed(0)}`;
}
