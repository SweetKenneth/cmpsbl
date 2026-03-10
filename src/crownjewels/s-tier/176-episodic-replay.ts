/**
 * S-Tier 176 — Episodic Replay
 * ID: S-CJ134 | CJPI: 85 | Module: BRAIN
 * Replays episodic memories for reinforcement and learning.
 */

export interface Episode {
  id: string;
  context: string;
  actions: string[];
  outcome: 'positive' | 'negative' | 'neutral';
  reward: number;
  replayCount: number;
  lastReplayed?: string;
  recordedAt: string;
}

export class EpisodicReplay {
  private episodes: Episode[] = [];
  private maxEpisodes = 500;

  record(context: string, actions: string[], outcome: 'positive' | 'negative' | 'neutral', reward: number): Episode {
    const ep: Episode = {
      id: crypto.randomUUID(), context, actions, outcome, reward,
      replayCount: 0, recordedAt: new Date().toISOString(),
    };
    this.episodes.push(ep);
    if (this.episodes.length > this.maxEpisodes) {
      this.episodes.sort((a, b) => Math.abs(b.reward) - Math.abs(a.reward));
      this.episodes = this.episodes.slice(0, this.maxEpisodes);
    }
    return ep;
  }

  replay(count: number = 5): Episode[] {
    // Prioritize high-reward and rarely-replayed episodes
    const sorted = [...this.episodes].sort((a, b) => {
      const scoreA = Math.abs(a.reward) / (a.replayCount + 1);
      const scoreB = Math.abs(b.reward) / (b.replayCount + 1);
      return scoreB - scoreA;
    });
    const selected = sorted.slice(0, count);
    for (const ep of selected) {
      ep.replayCount++;
      ep.lastReplayed = new Date().toISOString();
    }
    return selected;
  }

  getPositivePatterns(): string[][] {
    return this.episodes.filter(e => e.outcome === 'positive' && e.reward > 0.5).map(e => e.actions);
  }
}
