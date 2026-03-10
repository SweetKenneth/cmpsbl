/**
 * S-Tier 224 — Event Storm Dampener | S-RPL03 | CJPI: 90 | RIPPLE
 */
export class EventStormDampener {
  private windows: Map<string, { count: number; firstSeen: number }> = new Map();
  private threshold = 100;
  private windowMs = 5000;
  shouldThrottle(eventType: string): boolean {
    const now = Date.now();
    const w = this.windows.get(eventType);
    if (!w || now - w.firstSeen > this.windowMs) { this.windows.set(eventType, { count: 1, firstSeen: now }); return false; }
    w.count++;
    return w.count > this.threshold;
  }
  setThreshold(threshold: number, windowMs: number): void { this.threshold = threshold; this.windowMs = windowMs; }
}
