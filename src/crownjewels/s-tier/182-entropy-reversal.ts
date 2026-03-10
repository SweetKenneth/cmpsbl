/**
 * S-Tier 182 — Entropy Reversal
 * ID: S-CJ140 | CJPI: 85 | Module: SYSTEM
 * Reverses system entropy through automated cleanup and optimization.
 */

export interface EntropySource {
  id: string;
  name: string;
  category: 'orphaned_data' | 'stale_config' | 'unused_resource' | 'fragmented_state';
  entropyScore: number;
  cleanupAction: string;
  estimatedGain: number;
}

export class EntropyReversal {
  private sources: EntropySource[] = [];
  private cleanedUp: Set<string> = new Set();

  scan(sources: EntropySource[]): void {
    this.sources = sources;
  }

  prioritize(): EntropySource[] {
    return this.sources
      .filter(s => !this.cleanedUp.has(s.id))
      .sort((a, b) => (b.entropyScore * b.estimatedGain) - (a.entropyScore * a.estimatedGain));
  }

  cleanup(sourceId: string): boolean {
    const source = this.sources.find(s => s.id === sourceId);
    if (!source || this.cleanedUp.has(sourceId)) return false;
    this.cleanedUp.add(sourceId);
    return true;
  }

  getEntropyScore(): number {
    const uncleaned = this.sources.filter(s => !this.cleanedUp.has(s.id));
    if (this.sources.length === 0) return 0;
    return uncleaned.reduce((s, u) => s + u.entropyScore, 0) / this.sources.length;
  }

  getCleanupReport(): { cleaned: number; remaining: number; totalGain: number } {
    const cleaned = this.sources.filter(s => this.cleanedUp.has(s.id));
    return {
      cleaned: cleaned.length,
      remaining: this.sources.length - cleaned.length,
      totalGain: cleaned.reduce((s, c) => s + c.estimatedGain, 0),
    };
  }
}
