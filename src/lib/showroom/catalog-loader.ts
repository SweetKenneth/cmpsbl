/**
 * Showroom Catalog Loader
 * Pulls real discoveries from the Memory Stream (discoveries table).
 * Maps to solution-forward showroom items with pain categories.
 * No Crown Jewel registry data — those are protected IP.
 */

import { supabase } from '@/integrations/supabase/client';

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

/** Discovery category → pain-point mapping */
const CATEGORY_TO_PAIN: Record<string, [PainPointId, string]> = {
  security: ['security', 'Security & Compliance'],
  compliance: ['security', 'Security & Compliance'],
  governance: ['governance', 'Policy & Governance'],
  ethics: ['governance', 'Policy & Governance'],
  contracts: ['governance', 'Policy & Governance'],
  cognitive: ['intelligence', 'Decision Making'],
  prediction: ['intelligence', 'Decision Making'],
  simulation: ['intelligence', 'Decision Making'],
  learning: ['intelligence', 'Decision Making'],
  observability: ['observability', 'Monitoring & Visibility'],
  edge: ['observability', 'Monitoring & Visibility'],
  evolution: ['resilience', 'Reliability & Recovery'],
  orchestration: ['resilience', 'Reliability & Recovery'],
  synthesis: ['optimization', 'Performance'],
  integration: ['optimization', 'Performance'],
  acquisition: ['optimization', 'Performance'],
  routing: ['optimization', 'Performance'],
  localization: ['optimization', 'Performance'],
  privacy: ['security', 'Security & Compliance'],
};

const DEFAULT_PAIN: [PainPointId, string] = ['optimization', 'Performance'];

interface DiscoveryRow {
  id: string;
  name: string;
  cjpi: number;
  category: string;
  tier: string;
  module_chain: string[];
  description: string;
}

function mapRowToItem(row: DiscoveryRow): ShowroomItem {
  const [painId, painLabel] = CATEGORY_TO_PAIN[row.category] ?? DEFAULT_PAIN;
  return {
    id: row.id,
    name: row.name,
    score: row.cjpi,
    chain: (row.module_chain || []).slice(0, 5),
    category: painId,
    solutionDesc: row.description || `${row.name} — a ${row.category} discovery from the Memory Stream.`,
    painLabel,
    painId,
  };
}

/** Fetch top 50 Memory Stream discoveries (CJPI 68–100) */
export async function fetchShowroomCatalog(limit = 50): Promise<ShowroomItem[]> {
  const { data, error } = await supabase
    .from('discoveries')
    .select('id, name, cjpi, category, tier, module_chain, description')
    .gte('cjpi', 68)
    .order('cjpi', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[Showroom] Failed to load catalog:', error.message);
    return [];
  }

  return ((data || []) as unknown as DiscoveryRow[]).map(mapRowToItem);
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
