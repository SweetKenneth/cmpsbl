/**
 * CMPSBL® The Foundry (Model 24)
 * 
 * Fully autonomous catalog generation.
 * Memory Stream discovers. Ascension packages. Catalog grows 24/7.
 * No human intervention required.
 * 
 * The Foundry is the substrate running at full autonomy —
 * every 8 hours, new discoveries are scored, priced, and listed.
 */

export type FoundryCycleStatus = 'idle' | 'discovering' | 'scoring' | 'packaging' | 'listing' | 'complete' | 'error';

export interface FoundryCycle {
  id: string;
  cycleNumber: number;
  status: FoundryCycleStatus;
  startedAt: string;
  completedAt?: string;
  discoveriesFound: number;
  discoveriesScored: number;
  discoveriesListed: number;
  discoveriesJunked: number;
  apexFound: number;
  totalValueCents: number;
  errors: string[];
}

export interface FoundryStats {
  totalCycles: number;
  totalDiscoveries: number;
  totalListed: number;
  totalJunked: number;
  totalApex: number;
  totalValueCents: number;
  avgDiscoveriesPerCycle: number;
  lastCycleAt?: string;
  nextCycleAt?: string;
  uptimeHours: number;
}

/** Foundry cycle interval — 8 hours in milliseconds */
export const CYCLE_INTERVAL_MS = 8 * 60 * 60 * 1000;

/** Quality threshold for Showroom listing */
const SHOWROOM_THRESHOLD = 68;

/**
 * Determine where a discovery should be routed based on CJPI score
 */
export function routeDiscovery(cjpiScore: number): 'vault' | 'showroom' | 'junkyard' {
  if (cjpiScore === 100) return 'vault';
  if (cjpiScore >= SHOWROOM_THRESHOLD) return 'showroom';
  return 'junkyard';
}

/**
 * Calculate next cycle start time
 */
export function getNextCycleTime(lastCycleStart: Date): Date {
  return new Date(lastCycleStart.getTime() + CYCLE_INTERVAL_MS);
}

/**
 * Calculate time remaining until next cycle
 */
export function getTimeUntilNextCycle(nextCycleAt: Date): {
  hours: number;
  minutes: number;
  isOverdue: boolean;
} {
  const now = Date.now();
  const diff = nextCycleAt.getTime() - now;

  if (diff <= 0) {
    return { hours: 0, minutes: 0, isOverdue: true };
  }

  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

  return { hours, minutes, isOverdue: false };
}

/**
 * Summarize foundry stats from cycle history
 */
export function summarizeFoundry(cycles: FoundryCycle[]): FoundryStats {
  const completedCycles = cycles.filter(c => c.status === 'complete');

  const totalDiscoveries = completedCycles.reduce((s, c) => s + c.discoveriesFound, 0);
  const totalListed = completedCycles.reduce((s, c) => s + c.discoveriesListed, 0);
  const totalJunked = completedCycles.reduce((s, c) => s + c.discoveriesJunked, 0);
  const totalApex = completedCycles.reduce((s, c) => s + c.apexFound, 0);
  const totalValueCents = completedCycles.reduce((s, c) => s + c.totalValueCents, 0);

  const sorted = [...completedCycles].sort((a, b) =>
    new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  const lastCycleAt = sorted[0]?.completedAt;
  const nextCycleAt = sorted[0]
    ? getNextCycleTime(new Date(sorted[0].startedAt)).toISOString()
    : undefined;

  return {
    totalCycles: completedCycles.length,
    totalDiscoveries,
    totalListed,
    totalJunked,
    totalApex,
    totalValueCents,
    avgDiscoveriesPerCycle: completedCycles.length > 0
      ? Math.round(totalDiscoveries / completedCycles.length)
      : 0,
    lastCycleAt,
    nextCycleAt,
    uptimeHours: completedCycles.length * 8,
  };
}
