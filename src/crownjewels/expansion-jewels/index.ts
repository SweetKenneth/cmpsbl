/**
 * CMPSBL® — Expansion S-Tier Jewels Index
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Central registration point for ALL vertical Crown Jewel registries.
 * Surfaces total counts and unified access across the ecosystem.
 *
 * © CMPSBL® — All rights reserved.
 */

import { CYBER_CROWN_JEWELS } from '../cyber-vertical-registry';
import { ROBOTICS_CROWN_JEWELS } from '../robotics-vertical-registry';
import { LLM_CROWN_JEWELS } from '../llm-vertical-registry';
import { AGENCY_CROWN_JEWELS } from '../agency-vertical-registry';
import { MEDIA_CROWN_JEWELS } from '../media-vertical-registry';
import { QUANTUM_CROWN_JEWELS } from '../quantum-vertical-registry';
import { ULTIMATE_CROWN_JEWELS } from '../ultimate-vertical-registry';
import { FINTECH_CROWN_JEWELS } from '../fintech-vertical-registry';
import type { STierEntry } from '../types';

export interface VerticalRegistrySummary {
  vertical: string;
  totalJewels: number;
  primitives: number;
  avgCjpi: number;
  topJewel: { name: string; cjpi: number; primitive: string };
}

const REGISTRIES: Record<string, STierEntry[]> = {
  cyber: CYBER_CROWN_JEWELS,
  robotics: ROBOTICS_CROWN_JEWELS,
  llm: LLM_CROWN_JEWELS,
  agency: AGENCY_CROWN_JEWELS,
  media: MEDIA_CROWN_JEWELS,
  quantum: QUANTUM_CROWN_JEWELS,
  ultimate: ULTIMATE_CROWN_JEWELS,
  fintech: FINTECH_CROWN_JEWELS,
};

/** Get all S-Tier jewels for a specific vertical */
export function getVerticalJewels(vertical: string): STierEntry[] {
  return REGISTRIES[vertical] ?? [];
}

/** Get all S-Tier jewels across the entire ecosystem */
export function getAllVerticalJewels(): STierEntry[] {
  return Object.values(REGISTRIES).flat();
}

/** Get total S-Tier count across all verticals */
export function getTotalSTierCount(): number {
  return Object.values(REGISTRIES).reduce((sum, r) => sum + r.length, 0);
}

/** Get summary for each vertical registry */
export function getVerticalRegistrySummaries(): VerticalRegistrySummary[] {
  return Object.entries(REGISTRIES).map(([vertical, jewels]) => {
    const primitives = new Set(jewels.map(j => j.module));
    const top = jewels.reduce((a, b) => a.cjpi > b.cjpi ? a : b);
    return {
      vertical,
      totalJewels: jewels.length,
      primitives: primitives.size,
      avgCjpi: Math.round(jewels.reduce((s, j) => s + j.cjpi, 0) / jewels.length * 10) / 10,
      topJewel: { name: top.name, cjpi: top.cjpi, primitive: top.module },
    };
  });
}

/** Find jewels by primitive across all verticals */
export function findJewelsByPrimitive(primitiveId: string): STierEntry[] {
  const upper = primitiveId.toUpperCase();
  return getAllVerticalJewels().filter(j => j.module.toUpperCase() === upper);
}

/** Get the list of registered verticals */
export function getRegisteredVerticals(): string[] {
  return Object.keys(REGISTRIES);
}
