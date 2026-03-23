/**
 * CORTEX — Load Shedding Engine
 * Predictive task dropping when cascade risk exceeds threshold.
 * Critical tasks are NEVER shed.
 */

export type TaskPriority = 'critical' | 'high' | 'normal' | 'low' | 'background';

export interface SheddableTask {
  id: string;
  priority: TaskPriority;
  estimatedCostMs: number;
  nodeId: string;
  isIdempotent: boolean;
}

export interface SheddingDecision {
  totalTasks: number;
  shedCount: number;
  keptCount: number;
  shedTasks: string[];
  keptTasks: string[];
  pressureLevel: PressureLevel;
  reason: string;
}

export type PressureLevel = 'nominal' | 'elevated' | 'high' | 'critical';

const PRIORITY_ORDER: TaskPriority[] = ['background', 'low', 'normal', 'high', 'critical'];

function getPressureLevel(riskScore: number): PressureLevel {
  if (riskScore >= 90) return 'critical';
  if (riskScore >= 75) return 'high';
  if (riskScore >= 50) return 'elevated';
  return 'nominal';
}

function getShedPercentage(level: PressureLevel): number {
  switch (level) {
    case 'critical': return 0.7;  // shed 70% of non-critical
    case 'high': return 0.4;
    case 'elevated': return 0.15;
    case 'nominal': return 0;
  }
}

export function decideShedding(
  tasks: SheddableTask[],
  currentRiskScore: number
): SheddingDecision {
  const pressure = getPressureLevel(currentRiskScore);
  const shedPct = getShedPercentage(pressure);

  if (shedPct === 0) {
    return {
      totalTasks: tasks.length,
      shedCount: 0,
      keptCount: tasks.length,
      shedTasks: [],
      keptTasks: tasks.map(t => t.id),
      pressureLevel: pressure,
      reason: 'No shedding needed — system nominal',
    };
  }

  // Sort by priority (lowest first = shed first), then by cost (highest first)
  const sorted = [...tasks].sort((a, b) => {
    const pa = PRIORITY_ORDER.indexOf(a.priority);
    const pb = PRIORITY_ORDER.indexOf(b.priority);
    if (pa !== pb) return pa - pb;
    return b.estimatedCostMs - a.estimatedCostMs;
  });

  const nonCritical = sorted.filter(t => t.priority !== 'critical');
  const critical = sorted.filter(t => t.priority === 'critical');
  const shedTarget = Math.ceil(nonCritical.length * shedPct);

  const shedTasks = nonCritical.slice(0, shedTarget).map(t => t.id);
  const keptNonCritical = nonCritical.slice(shedTarget).map(t => t.id);
  const keptTasks = [...critical.map(t => t.id), ...keptNonCritical];

  return {
    totalTasks: tasks.length,
    shedCount: shedTasks.length,
    keptCount: keptTasks.length,
    shedTasks,
    keptTasks,
    pressureLevel: pressure,
    reason: `Shedding ${shedTasks.length}/${tasks.length} tasks at ${pressure} pressure (risk: ${currentRiskScore})`,
  };
}

/** Requeue shed tasks that are idempotent for later execution */
export function requeueShedTasks(
  tasks: SheddableTask[],
  shedIds: Set<string>
): SheddableTask[] {
  return tasks
    .filter(t => shedIds.has(t.id) && t.isIdempotent)
    .map(t => ({ ...t, priority: 'low' as TaskPriority }));
}
