/**
 * Sector Kill Switch
 * Instant sector-wide isolation
 * 
 * Allows instant isolation of an entire sector (e.g., all OCG nodes)
 * without touching individual breakers. Useful for emergency containment.
 */

import type { MatrixSector } from '@/lib/core/matrixNodeRegistry';
import { getNodesBySector } from '@/lib/core/matrixNodeRegistry';
import { emit } from '../events';

export interface KillSwitchState {
  sector: MatrixSector;
  killed: boolean;
  killedAt: string | null;
  killedBy: string;
  reason: string;
  affectedNodes: string[];
}

const killStates = new Map<MatrixSector, KillSwitchState>();
const ALL_SECTORS: MatrixSector[] = ['core', 'system', 'ccr', 'ocg', 'execution', 'field', 'plane', 'shell', 'esz', 'epz', 'emz', 'csz'] as MatrixSector[];

function initState(sector: MatrixSector): KillSwitchState {
  return {
    sector,
    killed: false,
    killedAt: null,
    killedBy: '',
    reason: '',
    affectedNodes: getNodesBySector(sector).map(n => n.id),
  };
}

export function killSector(sector: MatrixSector, reason: string, by = 'governor'): KillSwitchState {
  const state = killStates.get(sector) || initState(sector);
  state.killed = true;
  state.killedAt = new Date().toISOString();
  state.killedBy = by;
  state.reason = reason;
  killStates.set(sector, state);

  emit({
    module: 'system',
    event_type: 'sector_killed',
    outcome: 'succeeded',
    data: { sector, reason, by, affectedNodes: state.affectedNodes },
  });

  console.warn(`[kill-switch] SECTOR ${sector.toUpperCase()} KILLED — ${reason}`);
  return state;
}

export function reviveSector(sector: MatrixSector, by = 'governor'): KillSwitchState {
  const state = killStates.get(sector) || initState(sector);
  state.killed = false;
  killStates.set(sector, state);

  emit({
    module: 'system',
    event_type: 'sector_revived',
    outcome: 'succeeded',
    data: { sector, by },
  });

  console.log(`[kill-switch] Sector ${sector.toUpperCase()} revived by ${by}`);
  return state;
}

export function isSectorKilled(sector: MatrixSector): boolean {
  return killStates.get(sector)?.killed ?? false;
}

export function isNodeKilled(nodeId: string): boolean {
  for (const [, state] of killStates) {
    if (state.killed && state.affectedNodes.includes(nodeId)) return true;
  }
  return false;
}

export function getAllKillStates(): KillSwitchState[] {
  return ALL_SECTORS.map(s => killStates.get(s) || initState(s));
}

export function getKilledSectors(): MatrixSector[] {
  return ALL_SECTORS.filter(s => killStates.get(s)?.killed);
}

export function killAllNonEssential(reason: string, by = 'auto'): KillSwitchState[] {
  const nonEssential = ['execution', 'field', 'esz', 'epz', 'emz', 'csz'] as MatrixSector[];
  return nonEssential.map(s => killSector(s, reason, by));
}

export function reviveAll(by = 'governor'): void {
  ALL_SECTORS.forEach(s => reviveSector(s, by));
}
