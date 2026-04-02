/**
 * CMPSBL® Incubator (Model 18)
 * 
 * Monday: prototype. Wednesday: launch-ready product. 48 hours.
 * No equity surrendered. Premium membership add-on.
 */

export type IncubatorPhase = 'intake' | 'diagnostic' | 'restoration' | 'hardening' | 'packaging' | 'delivery';

export interface IncubatorProject {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  sourceLanguage: string;
  targetLanguages: string[];
  currentPhase: IncubatorPhase;
  phaseProgress: number;
  startedAt: string;
  estimatedDeliveryAt: string;
  deliveredAt?: string;
  primitivesApplied: string[];
  cjpiScore?: number;
  metadata?: Record<string, unknown>;
}

/** Incubator SLA — 48 hours in milliseconds */
export const INCUBATOR_SLA_MS = 48 * 60 * 60 * 1000;

/** Phase sequence and estimated durations */
const PHASE_DURATIONS: Record<IncubatorPhase, number> = {
  intake: 1,
  diagnostic: 4,
  restoration: 20,
  hardening: 12,
  packaging: 8,
  delivery: 3,
};

/**
 * Get total estimated hours for the incubator pipeline
 */
export function getTotalEstimatedHours(): number {
  return Object.values(PHASE_DURATIONS).reduce((a, b) => a + b, 0);
}

/**
 * Calculate estimated delivery time from start
 */
export function getEstimatedDelivery(startDate: Date): Date {
  return new Date(startDate.getTime() + INCUBATOR_SLA_MS);
}

/**
 * Get overall progress percentage across all phases
 */
export function getOverallProgress(currentPhase: IncubatorPhase, phaseProgress: number): number {
  const phases: IncubatorPhase[] = ['intake', 'diagnostic', 'restoration', 'hardening', 'packaging', 'delivery'];
  const currentIndex = phases.indexOf(currentPhase);
  const totalPhases = phases.length;

  const completedPhases = currentIndex;
  const currentContribution = phaseProgress / 100;

  return Math.round(((completedPhases + currentContribution) / totalPhases) * 100);
}

/**
 * Check if project is within SLA
 */
export function isWithinSLA(startedAt: Date, now: Date = new Date()): boolean {
  return (now.getTime() - startedAt.getTime()) <= INCUBATOR_SLA_MS;
}
