/**
 * CMPSBL® MEMORY — Episodic Memory Timeline
 * Links related memories into chronological "episodes" — sequences of
 * events rather than isolated facts.
 *
 * Episodes represent narrative threads: a problem → investigation →
 * solution → validation chain, or an architecture change lifecycle.
 *
 * Enables: "Tell me the story of how we solved X"
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Episode {
  id: string;
  title: string;
  theme: string;
  memoryIds: string[];     // ordered chronologically
  startTime: number;
  endTime: number;
  duration: number;        // ms
  phase: EpisodePhase;
  significance: number;    // 0-1
  summary?: string;
}

export type EpisodePhase = 'forming' | 'active' | 'concluded' | 'archived';

export interface EpisodeMemory {
  memoryId: string;
  content: string;
  context: string;
  timestamp: number;
  role: 'trigger' | 'development' | 'climax' | 'resolution' | 'epilogue';
}

export interface EpisodeQuery {
  theme?: string;
  minSignificance?: number;
  phase?: EpisodePhase;
  limit?: number;
  afterTime?: number;
  beforeTime?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_EPISODES = 500;
const EPISODE_GAP_THRESHOLD = 1800000; // 30 min gap = new episode
const MAX_EPISODE_MEMORIES = 50;

let episodeCounter = 0;

class EpisodicTimelineEngine {
  private episodes = new Map<string, Episode>();
  private memoryToEpisode = new Map<string, string>(); // memoryId → episodeId
  private activeEpisode: string | null = null;

  /**
   * Add a memory event to the timeline. Automatically groups into episodes
   * based on temporal proximity and thematic continuity.
   */
  addEvent(memory: EpisodeMemory): Episode {
    const now = memory.timestamp || Date.now();

    // Try to extend the active episode
    if (this.activeEpisode) {
      const active = this.episodes.get(this.activeEpisode);
      if (active && active.phase === 'forming' || active?.phase === 'active') {
        const gap = now - active!.endTime;
        if (gap < EPISODE_GAP_THRESHOLD && active!.memoryIds.length < MAX_EPISODE_MEMORIES) {
          // Extend existing episode
          active!.memoryIds.push(memory.memoryId);
          active!.endTime = now;
          active!.duration = now - active!.startTime;
          active!.phase = 'active';
          this.memoryToEpisode.set(memory.memoryId, this.activeEpisode!);
          return active!;
        } else {
          // Conclude old episode
          this.concludeEpisode(this.activeEpisode);
        }
      }
    }

    // Start a new episode
    const id = `episode-${++episodeCounter}`;
    const episode: Episode = {
      id,
      title: `Episode from ${memory.context}`,
      theme: memory.context,
      memoryIds: [memory.memoryId],
      startTime: now,
      endTime: now,
      duration: 0,
      phase: 'forming',
      significance: 0.5,
    };

    this.episodes.set(id, episode);
    this.memoryToEpisode.set(memory.memoryId, id);
    this.activeEpisode = id;
    this.enforceCapacity();
    return episode;
  }

  /**
   * Conclude an episode — marks it as complete and generates summary.
   */
  concludeEpisode(episodeId: string): boolean {
    const episode = this.episodes.get(episodeId);
    if (!episode) return false;

    episode.phase = 'concluded';
    episode.significance = Math.min(1, episode.memoryIds.length / 10 + episode.duration / 3600000);

    if (this.activeEpisode === episodeId) this.activeEpisode = null;
    return true;
  }

  /**
   * Get the episode containing a specific memory.
   */
  getEpisodeForMemory(memoryId: string): Episode | undefined {
    const episodeId = this.memoryToEpisode.get(memoryId);
    return episodeId ? this.episodes.get(episodeId) : undefined;
  }

  /**
   * Query episodes by criteria.
   */
  query(options: EpisodeQuery = {}): Episode[] {
    let results = [...this.episodes.values()];

    if (options.theme) {
      results = results.filter(e => e.theme === options.theme);
    }
    if (options.phase) {
      results = results.filter(e => e.phase === options.phase);
    }
    if (options.minSignificance !== undefined) {
      results = results.filter(e => e.significance >= options.minSignificance!);
    }
    if (options.afterTime) {
      results = results.filter(e => e.startTime >= options.afterTime!);
    }
    if (options.beforeTime) {
      results = results.filter(e => e.endTime <= options.beforeTime!);
    }

    results.sort((a, b) => b.startTime - a.startTime);
    return results.slice(0, options.limit || 20);
  }

  /**
   * Get the current active episode.
   */
  getActiveEpisode(): Episode | null {
    if (!this.activeEpisode) return null;
    return this.episodes.get(this.activeEpisode) || null;
  }

  /**
   * Get episode narrative — ordered memory IDs with role assignments.
   */
  getNarrative(episodeId: string): Array<{ memoryId: string; role: EpisodeMemory['role']; position: number }> {
    const episode = this.episodes.get(episodeId);
    if (!episode) return [];

    const total = episode.memoryIds.length;
    return episode.memoryIds.map((memoryId, i) => {
      let role: EpisodeMemory['role'];
      if (i === 0) role = 'trigger';
      else if (i === total - 1 && episode.phase === 'concluded') role = 'resolution';
      else if (i > total * 0.6) role = 'climax';
      else if (i > total * 0.8) role = 'epilogue';
      else role = 'development';

      return { memoryId, role, position: i / Math.max(1, total - 1) };
    });
  }

  /**
   * Merge two related episodes into one.
   */
  mergeEpisodes(episodeAId: string, episodeBId: string): Episode | null {
    const a = this.episodes.get(episodeAId);
    const b = this.episodes.get(episodeBId);
    if (!a || !b) return null;

    // Merge into the earlier episode
    const [earlier, later] = a.startTime <= b.startTime ? [a, b] : [b, a];
    earlier.memoryIds.push(...later.memoryIds);
    earlier.endTime = Math.max(earlier.endTime, later.endTime);
    earlier.duration = earlier.endTime - earlier.startTime;
    earlier.significance = Math.min(1, earlier.significance + later.significance * 0.5);

    // Update memory index
    for (const memId of later.memoryIds) {
      this.memoryToEpisode.set(memId, earlier.id);
    }

    this.episodes.delete(later.id);
    return earlier;
  }

  getStats() {
    const all = [...this.episodes.values()];
    return {
      totalEpisodes: all.length,
      activeEpisodes: all.filter(e => e.phase === 'forming' || e.phase === 'active').length,
      concludedEpisodes: all.filter(e => e.phase === 'concluded').length,
      avgMemoriesPerEpisode: all.length > 0
        ? all.reduce((s, e) => s + e.memoryIds.length, 0) / all.length : 0,
      avgSignificance: all.length > 0
        ? all.reduce((s, e) => s + e.significance, 0) / all.length : 0,
      longestEpisode: all.reduce((max, e) => e.memoryIds.length > max ? e.memoryIds.length : max, 0),
    };
  }

  private enforceCapacity(): void {
    if (this.episodes.size <= MAX_EPISODES) return;
    // Archive oldest concluded episodes
    const archived = [...this.episodes.entries()]
      .filter(([, e]) => e.phase === 'concluded')
      .sort((a, b) => a[1].startTime - b[1].startTime);
    const excess = this.episodes.size - MAX_EPISODES;
    for (let i = 0; i < Math.min(excess, archived.length); i++) {
      const [id, episode] = archived[i];
      for (const memId of episode.memoryIds) this.memoryToEpisode.delete(memId);
      this.episodes.delete(id);
    }
  }

  clear(): void {
    this.episodes.clear();
    this.memoryToEpisode.clear();
    this.activeEpisode = null;
    episodeCounter = 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let _engine: EpisodicTimelineEngine | null = null;

export function getEpisodicTimeline(): EpisodicTimelineEngine {
  if (!_engine) _engine = new EpisodicTimelineEngine();
  return _engine;
}

export function resetEpisodicTimeline(): void {
  _engine = null;
}
