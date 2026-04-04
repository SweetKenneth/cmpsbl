/**
 * S-Tier 218 — Autoimmune Prevention Governor
 * ID: S-IMM04 | CJPI: 91 | Module: IMMUNITY
 *
 * Prevents false-positive threat blocking via adaptive sensitivity tuning,
 * whitelist management, false-positive pattern learning, and cooldown periods.
 */

export interface FalsePositiveRecord {
  targetId: string;
  timestamp: number;
  threatScore: number;
  context: string;
}

export interface BlockDecision {
  shouldBlock: boolean;
  threatScore: number;
  sensitivity: number;
  reason: string;
  whitelisted: boolean;
}

export class AutoimmunePreventionGovernor {
  private falsePositives: FalsePositiveRecord[] = [];
  private sensitivityThreshold: number = 0.5;
  private whitelist: Set<string> = new Set();
  private cooldowns: Map<string, number> = new Map(); // targetId → cooldown until timestamp
  private blockLog: { targetId: string; blocked: boolean; timestamp: number }[] = [];
  private readonly maxBuffer: number;
  private readonly sensitivityMin: number;
  private readonly sensitivityMax: number;

  constructor(initialSensitivity: number = 0.5, maxBuffer: number = 500) {
    this.sensitivityThreshold = initialSensitivity;
    this.maxBuffer = maxBuffer;
    this.sensitivityMin = 0.2;
    this.sensitivityMax = 0.95;
  }

  recordFalsePositive(targetId: string, threatScore: number = 0, context: string = ''): void {
    this.falsePositives.push({ targetId, timestamp: Date.now(), threatScore, context });
    if (this.falsePositives.length > this.maxBuffer) this.falsePositives.shift();
    this.adjustSensitivity();
  }

  private adjustSensitivity(): void {
    const now = Date.now();
    const recentWindow = 300000; // 5 minutes
    const recentFPs = this.falsePositives.filter(fp => now - fp.timestamp < recentWindow);
    const recentRate = recentFPs.length;

    if (recentRate > 10) {
      // Too many false positives — reduce sensitivity (allow more through)
      this.sensitivityThreshold = Math.min(this.sensitivityMax, this.sensitivityThreshold + 0.05);
    } else if (recentRate < 2 && this.sensitivityThreshold > this.sensitivityMin + 0.1) {
      // Few false positives — can tighten sensitivity
      this.sensitivityThreshold = Math.max(this.sensitivityMin, this.sensitivityThreshold - 0.02);
    }

    // Learn patterns: if a targetId has 3+ FPs, auto-whitelist
    const targetCounts = new Map<string, number>();
    for (const fp of recentFPs) {
      targetCounts.set(fp.targetId, (targetCounts.get(fp.targetId) ?? 0) + 1);
    }
    for (const [targetId, count] of targetCounts) {
      if (count >= 3) this.whitelist.add(targetId);
    }
  }

  shouldBlock(targetId: string, threatScore: number): BlockDecision {
    const now = Date.now();

    // Check whitelist
    if (this.whitelist.has(targetId)) {
      this.blockLog.push({ targetId, blocked: false, timestamp: now });
      return { shouldBlock: false, threatScore, sensitivity: this.sensitivityThreshold, reason: 'Whitelisted', whitelisted: true };
    }

    // Check cooldown
    const cooldownUntil = this.cooldowns.get(targetId);
    if (cooldownUntil && now < cooldownUntil) {
      this.blockLog.push({ targetId, blocked: false, timestamp: now });
      return { shouldBlock: false, threatScore, sensitivity: this.sensitivityThreshold, reason: 'In cooldown period', whitelisted: false };
    }

    const blocked = threatScore > this.sensitivityThreshold;
    this.blockLog.push({ targetId, blocked, timestamp: now });
    if (this.blockLog.length > 1000) this.blockLog.shift();

    return {
      shouldBlock: blocked,
      threatScore,
      sensitivity: this.sensitivityThreshold,
      reason: blocked ? `Threat score ${threatScore.toFixed(2)} exceeds threshold ${this.sensitivityThreshold.toFixed(2)}` : 'Below threshold',
      whitelisted: false,
    };
  }

  addWhitelist(targetId: string): void { this.whitelist.add(targetId); }
  removeWhitelist(targetId: string): boolean { return this.whitelist.delete(targetId); }

  setCooldown(targetId: string, durationMs: number): void {
    this.cooldowns.set(targetId, Date.now() + durationMs);
  }

  getSensitivity(): number { return this.sensitivityThreshold; }
  setSensitivity(value: number): void { this.sensitivityThreshold = Math.min(this.sensitivityMax, Math.max(this.sensitivityMin, value)); }

  getStats(): { sensitivity: number; falsePositives: number; whitelistSize: number; blockRate: number; recentBlocks: number } {
    const recent = this.blockLog.filter(l => Date.now() - l.timestamp < 300000);
    const blockRate = recent.length > 0 ? recent.filter(l => l.blocked).length / recent.length : 0;
    return {
      sensitivity: this.sensitivityThreshold,
      falsePositives: this.falsePositives.length,
      whitelistSize: this.whitelist.size,
      blockRate,
      recentBlocks: recent.filter(l => l.blocked).length,
    };
  }

  reset(): void {
    this.falsePositives = [];
    this.sensitivityThreshold = 0.5;
    this.whitelist.clear();
    this.cooldowns.clear();
    this.blockLog = [];
  }
}
