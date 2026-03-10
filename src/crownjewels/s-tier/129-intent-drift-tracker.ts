/**
 * S-Tier 129 — Intent Drift Tracker
 * ID: S-CJ87 | CJPI: 87 | Module: DECODE
 * 
 * Tracks and alerts on intent classification drift over time.
 */

export interface IntentSnapshot {
  timestamp: string;
  distribution: Record<string, number>; // intent → frequency
  totalClassifications: number;
}

export interface DriftAlert {
  id: string;
  intent: string;
  baselineFrequency: number;
  currentFrequency: number;
  driftMagnitude: number;
  direction: 'increase' | 'decrease';
  severity: 'low' | 'medium' | 'high';
  detectedAt: string;
}

export class IntentDriftTracker {
  private snapshots: IntentSnapshot[] = [];
  private baseline: Record<string, number> | null = null;
  private alerts: DriftAlert[] = [];
  private driftThreshold = 0.15;

  setBaseline(distribution: Record<string, number>): void {
    const total = Object.values(distribution).reduce((s, v) => s + v, 0);
    this.baseline = {};
    for (const [k, v] of Object.entries(distribution)) {
      this.baseline[k] = v / total;
    }
  }

  recordSnapshot(snapshot: IntentSnapshot): DriftAlert[] {
    this.snapshots.push(snapshot);
    if (this.snapshots.length > 100) this.snapshots = this.snapshots.slice(-100);

    if (!this.baseline) {
      if (this.snapshots.length >= 5) {
        // Auto-generate baseline from first 5 snapshots
        const combined: Record<string, number> = {};
        for (const s of this.snapshots.slice(0, 5)) {
          for (const [k, v] of Object.entries(s.distribution)) {
            combined[k] = (combined[k] || 0) + v;
          }
        }
        this.setBaseline(combined);
      }
      return [];
    }

    const total = snapshot.totalClassifications || Object.values(snapshot.distribution).reduce((s, v) => s + v, 0);
    const newAlerts: DriftAlert[] = [];

    for (const [intent, count] of Object.entries(snapshot.distribution)) {
      const currentFreq = count / total;
      const baselineFreq = this.baseline[intent] || 0;
      const drift = Math.abs(currentFreq - baselineFreq);

      if (drift > this.driftThreshold) {
        const alert: DriftAlert = {
          id: crypto.randomUUID(),
          intent,
          baselineFrequency: baselineFreq,
          currentFrequency: currentFreq,
          driftMagnitude: drift,
          direction: currentFreq > baselineFreq ? 'increase' : 'decrease',
          severity: drift > 0.4 ? 'high' : drift > 0.25 ? 'medium' : 'low',
          detectedAt: new Date().toISOString(),
        };
        newAlerts.push(alert);
        this.alerts.push(alert);
      }
    }

    return newAlerts;
  }

  getAlerts(): DriftAlert[] { return [...this.alerts]; }
  getSnapshots(): IntentSnapshot[] { return [...this.snapshots]; }
}
