/**
 * Marketplace Rarity System Configuration
 * Unified rarity tiers, pricing bands, and Generator loot tables
 */

// Import rarity images
import rarityCommon from '@/assets/marketplace/rarity-common.jpg';
import rarityUncommon from '@/assets/marketplace/rarity-uncommon.jpg';
import rarityRare from '@/assets/marketplace/rarity-rare.jpg';
import rarityEpic from '@/assets/marketplace/rarity-epic.jpg';
import rarityLegendary from '@/assets/marketplace/rarity-legendary.jpg';
import rarityMythic from '@/assets/marketplace/rarity-mythic.jpg';

// ============================================
// RARITY CONFIGURATION
// ============================================
export interface RarityConfig {
  id: string;
  label: string;
  difficulty: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  image: string;
  priceRange: { min: number; max: number }; // cents
  dropChance: number; // 0-1 for Generator
  avgValue: number; // cents - expected value
}

export const RARITY_TIERS: RarityConfig[] = [
  {
    id: 'common',
    label: 'Common',
    difficulty: 'beginner',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/15',
    borderColor: 'border-slate-500/30',
    glowColor: 'shadow-slate-500/20',
    image: rarityCommon,
    priceRange: { min: 2700, max: 2700 },
    dropChance: 0.40,
    avgValue: 2700,
  },
  {
    id: 'uncommon',
    label: 'Uncommon',
    difficulty: 'intermediate',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/30',
    glowColor: 'shadow-emerald-500/20',
    image: rarityUncommon,
    priceRange: { min: 8700, max: 8700 },
    dropChance: 0.25,
    avgValue: 8700,
  },
  {
    id: 'rare',
    label: 'Rare',
    difficulty: 'advanced',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/20',
    image: rarityRare,
    priceRange: { min: 14700, max: 14700 },
    dropChance: 0.18,
    avgValue: 14700,
  },
  {
    id: 'epic',
    label: 'Epic',
    difficulty: 'premium',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/15',
    borderColor: 'border-purple-500/30',
    glowColor: 'shadow-purple-500/20',
    image: rarityEpic,
    priceRange: { min: 29900, max: 34900 },
    dropChance: 0.10,
    avgValue: 32400,
  },
  {
    id: 'legendary',
    label: 'Legendary',
    difficulty: 'elite',
    color: 'text-amber-400',
    bgColor: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/40',
    glowColor: 'shadow-amber-500/30',
    image: rarityLegendary,
    priceRange: { min: 39900, max: 44900 },
    dropChance: 0.05,
    avgValue: 42400,
  },
  {
    id: 'mythic',
    label: 'Mythic',
    difficulty: 'pro',
    color: 'text-rose-400',
    bgColor: 'bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-cyan-500/20',
    borderColor: 'border-rose-500/50',
    glowColor: 'shadow-rose-500/40',
    image: rarityMythic,
    priceRange: { min: 49900, max: 49900 },
    dropChance: 0.02,
    avgValue: 49900,
  },
];

// Get rarity config by ID
export function getRarityById(rarityId: string): RarityConfig | undefined {
  return RARITY_TIERS.find(r => r.id === rarityId);
}

// Get rarity config by difficulty
export function getRarityByDifficulty(difficulty: string): RarityConfig {
  const rarity = RARITY_TIERS.find(r => r.difficulty === difficulty);
  return rarity || RARITY_TIERS[0];
}

// Get rarity image by difficulty
export function getRarityImageByDifficulty(difficulty: string): string {
  return getRarityByDifficulty(difficulty).image;
}

// ============================================
// GENERATOR PRICING & LOOT TABLE
// ============================================

// Generator is priced at the expected value of Rare drops
// This ensures Generator never underprices Rare/Epic/Legendary/Mythic
export const GENERATOR_PRICE = 8700; // $87 (Rare tier floor)

// Expected Value Calculation:
// Common (40%): $27.00 × 0.40 = $10.80
// Uncommon (25%): $87.00 × 0.25 = $21.75
// Rare (18%): $147.00 × 0.18 = $26.46
// Epic (10%): $324.00 × 0.10 = $32.40
// Legendary (5%): $424.00 × 0.05 = $21.20
// Mythic (2%): $499.00 × 0.02 = $9.98
// Expected Value: $122.59

export const GENERATOR_EXPECTED_VALUE = 12259; // $122.59

export const GENERATOR_CONFIG = {
  price: GENERATOR_PRICE,
  expectedValue: GENERATOR_EXPECTED_VALUE,
  minValue: 2700,
  maxValue: 49900,
  totalCombinations: 82944, // 9 categories × 6 difficulties × 6 rarities × 256 feature combos
};

// Roll for rarity in Generator (weighted random)
export function rollGeneratorRarity(): RarityConfig {
  const roll = Math.random();
  let cumulative = 0;
  
  for (const tier of RARITY_TIERS) {
    cumulative += tier.dropChance;
    if (roll < cumulative) {
      return tier;
    }
  }
  
  return RARITY_TIERS[0]; // fallback to Common
}

// ============================================
// VALUE DISPLAY HELPERS
// ============================================

export function formatValueRange(): string {
  const min = GENERATOR_CONFIG.minValue / 100;
  const max = GENERATOR_CONFIG.maxValue / 100;
  return `$${min}-$${max}`;
}

export function formatExpectedValue(): string {
  return `$${(GENERATOR_EXPECTED_VALUE / 100).toFixed(0)}`;
}

export function formatDiscountFromExpected(price: number): string {
  const discount = ((GENERATOR_EXPECTED_VALUE - price) / GENERATOR_EXPECTED_VALUE) * 100;
  return `${Math.round(discount)}% Discount`;
}

// Get value multiplier for generator purchase
export function getGeneratorValueMultiplier(): string {
  const multiplier = GENERATOR_EXPECTED_VALUE / GENERATOR_PRICE;
  return `${multiplier.toFixed(1)}x`;
}
