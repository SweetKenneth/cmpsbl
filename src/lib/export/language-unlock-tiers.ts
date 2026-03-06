/**
 * Language Unlock Tiers
 * Artifact score determines which export languages are available.
 * Hardware/HDL targets require score >= 94 (Mythic+).
 */

import type { ExportLanguage } from './universal-adapter';

export interface LanguageUnlockTier {
  id: string;
  label: string;
  minScore: number;
  languages: ExportLanguage[];
  description: string;
}

export const LANGUAGE_UNLOCK_TIERS: LanguageUnlockTier[] = [
  {
    id: 'raw',
    label: 'Raw',
    minScore: 0,
    languages: ['typescript'],
    description: 'Raw tier baseline — TypeScript export is always available (0+)',
  },
  {
    id: 'mint',
    label: 'Mint',
    minScore: 68,
    languages: ['php', 'ruby', 'lua', 'dart', 'swift', 'kotlin'],
    description: 'Foundation languages — unlocked at Mint tier (68+)',
  },
  {
    id: 'prime',
    label: 'Prime',
    minScore: 80,
    languages: ['typescript', 'python', 'go', 'java', 'csharp'],
    description: 'Production languages — unlocked at Prime tier (80+)',
  },
  {
    id: 'relic',
    label: 'Relic',
    minScore: 90,
    languages: ['rust', 'c', 'cpp', 'zig', 'scala', 'haskell', 'elixir'],
    description: 'Systems & advanced languages — unlocked at Relic tier (90+)',
  },
  {
    id: 'silicon',
    label: 'Silicon',
    minScore: 94,
    languages: ['verilog', 'vhdl', 'systemverilog', 'chisel', 'amaranth', 'spice', 'systemc'],
    description: 'Hardware / HDL targets — Mythic+ only (94+)',
  },
];

/**
 * Get all languages unlocked for a given artifact score
 */
export function getUnlockedLanguages(score: number): ExportLanguage[] {
  const unlocked = new Set<ExportLanguage>();
  for (const tier of LANGUAGE_UNLOCK_TIERS) {
    if (score >= tier.minScore) {
      tier.languages.forEach((language) => unlocked.add(language));
    }
  }
  return Array.from(unlocked);
}

/**
 * Check if a specific language is unlocked for a score
 */
export function isLanguageUnlocked(language: ExportLanguage, score: number): boolean {
  for (const tier of LANGUAGE_UNLOCK_TIERS) {
    if (tier.languages.includes(language)) {
      return score >= tier.minScore;
    }
  }
  return false;
}

/**
 * Get the unlock tier info for a language
 */
export function getLanguageTier(language: ExportLanguage): LanguageUnlockTier | null {
  return LANGUAGE_UNLOCK_TIERS.find(t => t.languages.includes(language)) ?? null;
}

/**
 * Get unlock tiers with locked/unlocked status for a given score
 */
export function getUnlockStatus(score: number): (LanguageUnlockTier & { unlocked: boolean })[] {
  return LANGUAGE_UNLOCK_TIERS.map(tier => ({
    ...tier,
    unlocked: score >= tier.minScore,
  }));
}
