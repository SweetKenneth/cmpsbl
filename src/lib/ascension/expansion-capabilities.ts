/**
 * CMPSBL® Expansion Capabilities Bridge
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Converts vertical expansion primitives and Universal primitives
 * into SubstrateCapability entries for the capability-affinity system.
 *
 * This ensures the Ascension engine can select from ALL 120 primitives
 * in the ecosystem — not just the original 40.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { SubstrateCapability } from './capability-affinity';
import type { VerticalPrimitive } from '../factory/vertical-substrate';
import { getCyberSecurityEngines, getCyberSecurityAgents } from '../factory/verticals/cybersecurity';
import { getRoboticsEngines, getRoboticsAgents } from '../factory/verticals/robotics';
import { getQuantumEngines, getQuantumAgents } from '../factory/verticals/quantum';
import { getLLMEngines, getLLMAgents } from '../factory/verticals/llm';
import { getAgencyEngines, getAgencyAgents } from '../factory/verticals/agency';
import {
  ULTIMATE_ALL_ENGINES,
  ULTIMATE_ALL_AGENTS,
} from '../factory/verticals/ultimate';

/**
 * Deterministic vertical bonus (+10 to +25) seeded from primitive ID.
 * Ensures vertical expansion primitives compete fairly with core
 * capabilities during Ultimate mode scoring.
 */
function verticalBonus(primitiveId: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < primitiveId.length; i++) {
    h ^= primitiveId.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return 10 + ((h >>> 0) % 16); // 10–25 range
}

/**
 * Convert a VerticalPrimitive into SubstrateCapability entries.
 * Each primitive generates one headline capability with a vertical
 * bonus applied to baseWeight so expansion primitives compete
 * fairly in the Ultimate 120-candidate pool.
 */
function primitiveToCapabilities(
  p: VerticalPrimitive,
  vertical: string,
): SubstrateCapability[] {
  const style = p.classification === 'active' ? 'action'
    : p.classification === 'passive' ? 'passive'
    : 'universal';

  // Base weight from primitive weight + vertical specialization bonus
  const base = Math.round(p.weight * 2500);
  const bonus = verticalBonus(p.id);

  return [{
    id: `${vertical}-${p.id}`.toLowerCase(),
    primitive: p.name,
    name: `${p.name} — ${vertical.charAt(0).toUpperCase() + vertical.slice(1)} Expansion`,
    description: p.description,
    styles: [style, 'universal'],
    baseWeight: Math.min(96, base + bonus), // Capped at 96 to not exceed core DEFENSE ceiling
    investorValue: `${vertical} vertical intelligence — ${p.capabilities.length} specialized capabilities.`,
  }];
}

/**
 * Build all expansion capabilities from every vertical.
 * Returns ~120 SubstrateCapability entries (one per expansion primitive).
 */
export function buildExpansionCapabilities(): SubstrateCapability[] {
  const caps: SubstrateCapability[] = [];

  const verticals: [string, VerticalPrimitive[]][] = [
    ['cyber', [...getCyberSecurityEngines(), ...getCyberSecurityAgents()]],
    ['robotics', [...getRoboticsEngines(), ...getRoboticsAgents()]],
    ['quantum', [...getQuantumEngines(), ...getQuantumAgents()]],
    ['llm', [...getLLMEngines(), ...getLLMAgents()]],
    ['agency', [...getAgencyEngines(), ...getAgencyAgents()]],
    ['ultimate', [...ULTIMATE_ALL_ENGINES, ...ULTIMATE_ALL_AGENTS]],
  ];

  for (const [vertical, primitives] of verticals) {
    for (const p of primitives) {
      caps.push(...primitiveToCapabilities(p, vertical));
    }
  }

  return caps;
}

/** Cached expansion capabilities */
let _cached: SubstrateCapability[] | null = null;

/**
 * Get all expansion capabilities (cached).
 * Use this in the Ascension pipeline when running Ultimate mode.
 */
export function getExpansionCapabilities(): SubstrateCapability[] {
  if (!_cached) _cached = buildExpansionCapabilities();
  return _cached;
}

/** Reset cache (for testing) */
export function resetExpansionCapabilities(): void {
  _cached = null;
}