/**
 * Showroom Catalog Loader
 * Loads 50 real discoveries from the S-Tier Crown Jewel vault registry.
 * Maps vault entries to solution-forward showroom items with pain categories.
 */

import registryData from '@/crownjewels/s-tier.registry.json';
import type { STierEntry } from '@/crownjewels/types';

export type PainPointId = 'security' | 'governance' | 'intelligence' | 'observability' | 'resilience' | 'optimization';

export interface ShowroomItem {
  id: string;
  name: string;
  score: number;
  chain: string[];
  category: string;
  solutionDesc: string;
  painLabel: string;
  painId: PainPointId;
}

/** Module → pain-point mapping */
const MODULE_TO_PAIN: Record<string, [PainPointId, string]> = {
  DEFENSE: ['security', 'Security & Compliance'],
  SENTINEL: ['security', 'Security & Compliance'],
  IDENTITY: ['security', 'Security & Compliance'],
  PHANTOM: ['security', 'Security & Compliance'],
  IMMUNITY: ['security', 'Security & Compliance'],
  GOVERNANCE: ['governance', 'Policy & Governance'],
  AUDIT: ['governance', 'Policy & Governance'],
  WITNESS: ['governance', 'Policy & Governance'],
  SOVEREIGN: ['governance', 'Policy & Governance'],
  INCLUSIVE: ['governance', 'Policy & Governance'],
  CONSCIENCE: ['governance', 'Policy & Governance'],
  BRAIN: ['intelligence', 'Decision Making'],
  ORACLE: ['intelligence', 'Decision Making'],
  CORTEX: ['intelligence', 'Decision Making'],
  DREAM: ['intelligence', 'Decision Making'],
  INTENT: ['intelligence', 'Decision Making'],
  DECODE: ['intelligence', 'Decision Making'],
  ANALYTICS: ['observability', 'Monitoring & Visibility'],
  VISION: ['observability', 'Monitoring & Visibility'],
  ECHO: ['observability', 'Monitoring & Visibility'],
  OBSERVABILITY: ['observability', 'Monitoring & Visibility'],
  MEDIC: ['resilience', 'Reliability & Recovery'],
  NERVE: ['resilience', 'Reliability & Recovery'],
  SYSTEM: ['resilience', 'Reliability & Recovery'],
  CORE: ['resilience', 'Reliability & Recovery'],
  RIPPLE: ['resilience', 'Reliability & Recovery'],
  MEMORY: ['resilience', 'Reliability & Recovery'],
  MESH: ['resilience', 'Reliability & Recovery'],
  EVOLUTION: ['optimization', 'Performance'],
  ECONOMY: ['optimization', 'Performance'],
  HARMONY: ['optimization', 'Performance'],
  NEXUS: ['optimization', 'Performance'],
  INTEGRATION: ['optimization', 'Performance'],
  ENCODE: ['optimization', 'Performance'],
  FORGE: ['optimization', 'Performance'],
  HARVEST: ['optimization', 'Performance'],
};

const DEFAULT_PAIN: [PainPointId, string] = ['optimization', 'Performance'];
const CATALOG_SIZE = 50;

function mapEntryToItem(entry: STierEntry): ShowroomItem {
  const primaryModule = entry.module.split('×')[0];
  const [painId, painLabel] = MODULE_TO_PAIN[primaryModule] ?? DEFAULT_PAIN;
  const chain = entry.dependencyFootprint.length > 0
    ? entry.dependencyFootprint.slice(0, 5)
    : [primaryModule];

  return {
    id: entry.id,
    name: entry.name,
    score: entry.cjpi,
    chain,
    category: painId,
    solutionDesc: entry.description,
    painLabel,
    painId,
  };
}

/** Load the top 50 items (CJPI 68–100) from the vault, sorted by score descending. */
export function loadShowroomCatalog(): ShowroomItem[] {
  const entries = (registryData as { entries: STierEntry[] }).entries ?? [];
  return entries
    .filter((e) => e.cjpi >= 68 && e.cjpi <= 100)
    .sort((a, b) => b.cjpi - a.cjpi)
    .slice(0, CATALOG_SIZE)
    .map(mapEntryToItem);
}

/** Graduated CJPI pricing formula */
export function getShowroomPrice(score: number): number {
  if (score === 100) return 1952;
  if (score >= 94) return score * 2;
  if (score >= 90) return Math.round(score * 1.5);
  if (score >= 80) return Math.round(score * 1.25);
  if (score >= 68) return score;
  return 0;
}

export function getShowroomPriceDisplay(score: number): string {
  const price = getShowroomPrice(score);
  if (price === 0) return 'Free';
  return `$${price.toLocaleString()}`;
}
