/**
 * S-Tier 111 — Honeypot Intelligence (Advanced)
 * ID: S-92 | CJPI: 88 | Module: DEFENSE
 * 
 * Advanced honeypot with adaptive deception and threat intelligence extraction.
 */

export interface HoneypotTrap {
  id: string;
  type: 'endpoint' | 'credential' | 'file' | 'service';
  decoyData: unknown;
  attractiveness: number; // 0-1
  isTriggered: boolean;
  triggers: TrapTrigger[];
}

export interface TrapTrigger {
  timestamp: string;
  sourceIP: string;
  method: string;
  payload: unknown;
  fingerprintHash: string;
}

export interface ThreatIntel {
  attackerFingerprint: string;
  tactics: string[];
  firstSeen: string;
  lastSeen: string;
  triggerCount: number;
  riskScore: number;
}

export class HoneypotIntelligenceAdvanced {
  private traps: Map<string, HoneypotTrap> = new Map();
  private intel: Map<string, ThreatIntel> = new Map();

  deployTrap(trap: Omit<HoneypotTrap, 'isTriggered' | 'triggers'>): void {
    this.traps.set(trap.id, { ...trap, isTriggered: false, triggers: [] });
  }

  triggerTrap(trapId: string, source: Omit<TrapTrigger, 'timestamp'>): ThreatIntel | null {
    const trap = this.traps.get(trapId);
    if (!trap) return null;

    const trigger: TrapTrigger = { ...source, timestamp: new Date().toISOString() };
    trap.isTriggered = true;
    trap.triggers.push(trigger);

    // Update threat intelligence
    const existing = this.intel.get(source.fingerprintHash);
    if (existing) {
      existing.lastSeen = trigger.timestamp;
      existing.triggerCount++;
      existing.riskScore = Math.min(1, existing.riskScore + 0.1);
      if (!existing.tactics.includes(source.method)) existing.tactics.push(source.method);
      return existing;
    }

    const newIntel: ThreatIntel = {
      attackerFingerprint: source.fingerprintHash,
      tactics: [source.method],
      firstSeen: trigger.timestamp,
      lastSeen: trigger.timestamp,
      triggerCount: 1,
      riskScore: 0.5,
    };
    this.intel.set(source.fingerprintHash, newIntel);
    return newIntel;
  }

  getTriggeredTraps(): HoneypotTrap[] {
    return [...this.traps.values()].filter(t => t.isTriggered);
  }

  getThreatIntel(): ThreatIntel[] {
    return [...this.intel.values()].sort((a, b) => b.riskScore - a.riskScore);
  }

  adaptDecoy(trapId: string, newDecoy: unknown): void {
    const trap = this.traps.get(trapId);
    if (trap) {
      trap.decoyData = newDecoy;
      trap.attractiveness = Math.min(1, trap.attractiveness + 0.05);
    }
  }
}
