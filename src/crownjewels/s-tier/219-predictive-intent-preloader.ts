/**
 * S-Tier 219 — Predictive Intent Pre-Loader
 * ID: S-INT04 | CJPI: 91 | Module: INTENT
 */
export class PredictiveIntentPreLoader {
  private sequences: string[][] = [];
  private preloaded: Map<string, unknown> = new Map();

  recordSequence(intents: string[]): void {
    this.sequences.push(intents);
    if (this.sequences.length > 200) this.sequences.shift();
  }

  predictNext(currentIntent: string): string[] {
    const followers = new Map<string, number>();
    for (const seq of this.sequences) {
      const idx = seq.indexOf(currentIntent);
      if (idx >= 0 && idx < seq.length - 1) {
        const next = seq[idx + 1];
        followers.set(next, (followers.get(next) ?? 0) + 1);
      }
    }
    return [...followers.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
  }

  preload(intent: string, resource: unknown): void { this.preloaded.set(intent, resource); }
  getPreloaded(intent: string): unknown | undefined { return this.preloaded.get(intent); }
}
