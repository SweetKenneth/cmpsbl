/**
 * COMPASS Ultimate — Exploration Frontier
 * Tracks which areas of capability space have been explored vs. unexplored.
 * Guides discovery toward high-potential uncharted territory.
 */

export interface FrontierCell {
  id: string;
  domain: string;
  capability: string;
  explored: boolean;
  explorationDepth: number;  // 0–1 how thoroughly explored
  potentialScore: number;    // 0–1 estimated value of exploring
  lastExploredAt: number;
  explorationCount: number;
}

export interface FrontierRecommendation {
  cellId: string;
  domain: string;
  capability: string;
  priority: number;    // higher = explore first
  reason: string;
}

export interface FrontierStats {
  totalCells: number;
  exploredCells: number;
  unexploredCells: number;
  coverageRate: number;
  avgDepth: number;
  topUnexploredDomains: string[];
}

const MAX_CELLS = 2000;
const DECAY_RATE = 0.001; // exploration depth decays over time
const cells = new Map<string, FrontierCell>();

export function registerFrontierCell(domain: string, capability: string, potentialScore: number = 0.5): FrontierCell {
  const key = `${domain}:${capability}`;
  if (cells.has(key)) return cells.get(key)!;

  const cell: FrontierCell = {
    id: key, domain, capability,
    explored: false, explorationDepth: 0,
    potentialScore, lastExploredAt: 0, explorationCount: 0,
  };

  if (cells.size >= MAX_CELLS) {
    // Evict least potential unexplored
    let min: FrontierCell | null = null;
    for (const c of cells.values()) {
      if (!c.explored && (!min || c.potentialScore < min.potentialScore)) min = c;
    }
    if (min) cells.delete(min.id);
    else {
      const oldest = [...cells.values()].sort((a, b) => a.lastExploredAt - b.lastExploredAt)[0];
      if (oldest) cells.delete(oldest.id);
    }
  }

  cells.set(key, cell);
  return cell;
}

export function markExplored(domain: string, capability: string, depth: number = 0.5): void {
  const key = `${domain}:${capability}`;
  const cell = cells.get(key);
  if (!cell) return;

  cell.explored = true;
  cell.explorationDepth = Math.min(1, Math.max(cell.explorationDepth, depth));
  cell.lastExploredAt = Date.now();
  cell.explorationCount++;
}

export function getRecommendations(limit: number = 10): FrontierRecommendation[] {
  const now = Date.now();
  const recs: FrontierRecommendation[] = [];

  for (const cell of cells.values()) {
    // Apply time decay to exploration depth
    if (cell.explored && cell.lastExploredAt > 0) {
      const elapsed = (now - cell.lastExploredAt) / 3_600_000; // hours
      const decayed = Math.max(0, cell.explorationDepth - elapsed * DECAY_RATE);
      // Don't modify cell directly, just use for scoring
      const effectiveDepth = decayed;
      const priority = cell.potentialScore * (1 - effectiveDepth);

      if (priority > 0.2) {
        recs.push({
          cellId: cell.id, domain: cell.domain, capability: cell.capability,
          priority,
          reason: effectiveDepth < 0.1 ? 'Unexplored high-potential area' : 'Exploration depth has decayed',
        });
      }
    } else if (!cell.explored) {
      recs.push({
        cellId: cell.id, domain: cell.domain, capability: cell.capability,
        priority: cell.potentialScore,
        reason: 'Never explored',
      });
    }
  }

  recs.sort((a, b) => b.priority - a.priority);
  return recs.slice(0, limit);
}

export function getFrontierStats(): FrontierStats {
  const all = [...cells.values()];
  const explored = all.filter(c => c.explored);
  const unexplored = all.filter(c => !c.explored);

  // Top unexplored domains
  const domainCounts = new Map<string, number>();
  for (const c of unexplored) {
    domainCounts.set(c.domain, (domainCounts.get(c.domain) ?? 0) + 1);
  }
  const topDomains = [...domainCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([d]) => d);

  return {
    totalCells: all.length,
    exploredCells: explored.length,
    unexploredCells: unexplored.length,
    coverageRate: all.length > 0 ? explored.length / all.length : 0,
    avgDepth: explored.length > 0 ? explored.reduce((s, c) => s + c.explorationDepth, 0) / explored.length : 0,
    topUnexploredDomains: topDomains,
  };
}

export function resetFrontierState(): void { cells.clear(); }
