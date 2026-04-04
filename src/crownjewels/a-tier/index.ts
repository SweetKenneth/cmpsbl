/**
 * Crown Jewel A-Tier Vault — Central Registry
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 400 A-Tier Crown Jewels: 5 per primitive × 16 primitives × 5 verticals.
 * CJPI range: 85–91 — high-value architectural capabilities.
 * Governor-curated. Black-boxed. Architecture-class.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { STierEntry } from '../types';
import { CYBER_ATIER_JEWELS } from './cyber-atier';
import { ROBOTICS_ATIER_JEWELS } from './robotics-atier';
import { QUANTUM_ATIER_JEWELS } from './quantum-atier';
import { LLM_ATIER_JEWELS } from './llm-atier';
import { AGENCY_ATIER_JEWELS } from './agency-atier';

export type ATierEntry = STierEntry;

export interface ATierVault {
  version: string;
  tier: 'A';
  totalArtifacts: number;
  verticals: string[];
  entries: ATierEntry[];
}

/** Complete A-Tier vault across all verticals */
export function getATierVault(): ATierVault {
  const entries = [
    ...CYBER_ATIER_JEWELS,
    ...ROBOTICS_ATIER_JEWELS,
    ...QUANTUM_ATIER_JEWELS,
    ...LLM_ATIER_JEWELS,
    ...AGENCY_ATIER_JEWELS,
  ];
  return {
    version: '1.0.0',
    tier: 'A',
    totalArtifacts: entries.length,
    verticals: ['cyber', 'robotics', 'quantum', 'llm', 'agency'],
    entries,
  };
}

/** A-Tier jewels for a specific vertical */
export function getATierByVertical(vertical: string): ATierEntry[] {
  switch (vertical) {
    case 'cyber': return [...CYBER_ATIER_JEWELS];
    case 'robotics': return [...ROBOTICS_ATIER_JEWELS];
    case 'quantum': return [...QUANTUM_ATIER_JEWELS];
    case 'llm': return [...LLM_ATIER_JEWELS];
    case 'agency': return [...AGENCY_ATIER_JEWELS];
    default: return [];
  }
}

/** A-Tier jewels for a specific primitive across all verticals */
export function getATierByPrimitive(primitiveId: string): ATierEntry[] {
  return getATierVault().entries.filter(e => e.module === primitiveId);
}

/** Summary stats for A-Tier vault */
export function getATierSummary(): {
  total: number;
  byVertical: Record<string, number>;
  avgCjpi: number;
} {
  const vault = getATierVault();
  const byVertical: Record<string, number> = {
    cyber: CYBER_ATIER_JEWELS.length,
    robotics: ROBOTICS_ATIER_JEWELS.length,
    quantum: QUANTUM_ATIER_JEWELS.length,
    llm: LLM_ATIER_JEWELS.length,
    agency: AGENCY_ATIER_JEWELS.length,
  };
  const avgCjpi = vault.entries.reduce((s, e) => s + e.cjpi, 0) / vault.entries.length;
  return { total: vault.totalArtifacts, byVertical, avgCjpi };
}

export { CYBER_ATIER_JEWELS } from './cyber-atier';
export { ROBOTICS_ATIER_JEWELS } from './robotics-atier';
export { QUANTUM_ATIER_JEWELS } from './quantum-atier';
export { LLM_ATIER_JEWELS } from './llm-atier';
export { AGENCY_ATIER_JEWELS } from './agency-atier';
