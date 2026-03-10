/**
 * S-Tier 218 — Autoimmune Prevention Governor
 * ID: S-IMM04 | CJPI: 91 | Module: IMMUNITY
 */
export class AutoimmunePreventionGovernor {
  private falsePositives: { targetId: string; timestamp: number }[] = [];
  private sensitivityThreshold = 0.5;

  recordFalsePositive(targetId: string): void {
    this.falsePositives.push({ targetId, timestamp: Date.now() });
    if (this.falsePositives.length > 100) this.falsePositives.shift();
    this.adjustSensitivity();
  }

  private adjustSensitivity(): void {
    const recentRate = this.falsePositives.filter(fp => Date.now() - fp.timestamp < 300000).length;
    if (recentRate > 10) this.sensitivityThreshold = Math.min(0.9, this.sensitivityThreshold + 0.05);
  }

  shouldBlock(threatScore: number): boolean { return threatScore > this.sensitivityThreshold; }
  getSensitivity(): number { return this.sensitivityThreshold; }
}
