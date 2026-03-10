/**
 * S-Tier 063 — Immune Memory Persistence
 * CJPI: 93 | Node: IMMUNITY | ID: S-IMM03
 *
 * Persists threat signatures so the immune system remembers past attacks.
 * Analogous to biological immune memory — faster response on re-encounter.
 */

export interface ThreatSignature {
  id: string;
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  firstSeen: number;
  lastSeen: number;
  encounterCount: number;
  neutralized: boolean;
  antibodyId?: string;
}

const immuneMemory = new Map<string, ThreatSignature>();

export function recordThreat(pattern: string, severity: ThreatSignature['severity']): ThreatSignature {
  const existing = immuneMemory.get(pattern);
  if (existing) {
    existing.lastSeen = Date.now();
    existing.encounterCount++;
    if (severity === 'critical' || (severity === 'high' && existing.severity !== 'critical')) {
      existing.severity = severity;
    }
    return existing;
  }
  const sig: ThreatSignature = {
    id: `threat-${immuneMemory.size + 1}-${Date.now().toString(36)}`,
    pattern, severity,
    firstSeen: Date.now(), lastSeen: Date.now(),
    encounterCount: 1, neutralized: false,
  };
  immuneMemory.set(pattern, sig);
  return sig;
}

export function markNeutralized(pattern: string, antibodyId: string): boolean {
  const sig = immuneMemory.get(pattern);
  if (!sig) return false;
  sig.neutralized = true;
  sig.antibodyId = antibodyId;
  return true;
}

export function isKnownThreat(pattern: string): ThreatSignature | null {
  return immuneMemory.get(pattern) ?? null;
}

export function getActiveThreats(): ThreatSignature[] {
  return [...immuneMemory.values()].filter(t => !t.neutralized);
}

export function getAllSignatures(): ThreatSignature[] {
  return [...immuneMemory.values()];
}

export function getMemoryStats() {
  const all = [...immuneMemory.values()];
  return {
    total: all.length,
    active: all.filter(t => !t.neutralized).length,
    neutralized: all.filter(t => t.neutralized).length,
    critical: all.filter(t => t.severity === 'critical').length,
  };
}
