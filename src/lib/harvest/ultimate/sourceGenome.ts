/**
 * HARVEST Ultimate — Source Genome Registry
 * DNA-profiles every data source with reliability, freshness, schema stability, cost.
 * Auto-ranks and retires degraded sources.
 */

export interface SourceGenome {
  id: string;
  url: string;
  label: string;
  reliability: number;      // 0–1 EMA
  freshness: number;         // 0–1 EMA
  schemaStability: number;   // 0–1 EMA
  costPerRecord: number;     // estimated cost in millicents
  totalFetches: number;
  totalFailures: number;
  lastFetchedAt: number;
  retired: boolean;
  retiredReason?: string;
  tags: string[];
  createdAt: number;
}

export interface SourceGenomeStats {
  total: number;
  active: number;
  retired: number;
  avgReliability: number;
  avgFreshness: number;
}

const EMA_ALPHA = 0.15;
const RETIREMENT_THRESHOLD = 0.2; // reliability below this → retire
const MAX_GENOMES = 2000;

const genomes = new Map<string, SourceGenome>();

function ema(prev: number, sample: number): number {
  return prev * (1 - EMA_ALPHA) + sample * EMA_ALPHA;
}

export function registerSourceGenome(
  url: string,
  label: string,
  tags: string[] = []
): SourceGenome {
  const id = `sg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const genome: SourceGenome = {
    id, url, label, reliability: 0.8, freshness: 0.8, schemaStability: 1.0,
    costPerRecord: 0, totalFetches: 0, totalFailures: 0,
    lastFetchedAt: 0, retired: false, tags, createdAt: Date.now(),
  };
  if (genomes.size >= MAX_GENOMES) {
    // Evict oldest retired, then oldest active
    const oldest = [...genomes.values()]
      .filter(g => g.retired)
      .sort((a, b) => a.createdAt - b.createdAt)[0];
    if (oldest) genomes.delete(oldest.id);
    else {
      const oldestActive = [...genomes.values()].sort((a, b) => a.createdAt - b.createdAt)[0];
      if (oldestActive) genomes.delete(oldestActive.id);
    }
  }
  genomes.set(id, genome);
  return genome;
}

export function recordFetchOutcome(
  genomeId: string,
  success: boolean,
  recordCount: number = 0,
  durationMs: number = 0,
  schemaChanged: boolean = false
): void {
  const g = genomes.get(genomeId);
  if (!g || g.retired) return;

  g.totalFetches++;
  if (!success) g.totalFailures++;

  g.reliability = ema(g.reliability, success ? 1 : 0);
  g.freshness = ema(g.freshness, Math.min(1, 1000 / Math.max(durationMs, 1)));
  g.schemaStability = ema(g.schemaStability, schemaChanged ? 0 : 1);
  if (recordCount > 0) {
    g.costPerRecord = ema(g.costPerRecord, durationMs / recordCount);
  }
  g.lastFetchedAt = Date.now();

  // Auto-retire degraded sources
  if (g.reliability < RETIREMENT_THRESHOLD && g.totalFetches >= 10) {
    g.retired = true;
    g.retiredReason = `Reliability dropped to ${(g.reliability * 100).toFixed(1)}%`;
  }
}

export function getSourceGenome(id: string): SourceGenome | undefined {
  return genomes.get(id);
}

export function rankGenomes(): SourceGenome[] {
  return [...genomes.values()]
    .filter(g => !g.retired)
    .sort((a, b) => {
      const scoreA = a.reliability * 0.5 + a.freshness * 0.3 + a.schemaStability * 0.2;
      const scoreB = b.reliability * 0.5 + b.freshness * 0.3 + b.schemaStability * 0.2;
      return scoreB - scoreA;
    });
}

export function getGenomeStats(): SourceGenomeStats {
  const all = [...genomes.values()];
  const active = all.filter(g => !g.retired);
  return {
    total: all.length,
    active: active.length,
    retired: all.length - active.length,
    avgReliability: active.length > 0 ? active.reduce((s, g) => s + g.reliability, 0) / active.length : 0,
    avgFreshness: active.length > 0 ? active.reduce((s, g) => s + g.freshness, 0) / active.length : 0,
  };
}

export function resetGenomeState(): void { genomes.clear(); }
