/**
 * Executor Immune Pilot — Pilot Executor List & Registration
 * 
 * The 5 INCLUSIVE-touching executors selected for the pilot:
 * 1. adaptive-ui (INCLUSIVE primary)
 * 2. cognitive-load-optimization (INCLUSIVE primary)
 * 3. comprehensive-accessibility-audit (INCLUSIVE primary)
 * 4. personalized-accessibility-engine (INCLUSIVE primary)
 * 5. inclusive-content (INCLUSIVE validator)
 */

import type { SynergyExecutor } from '@/lib/capabilities/synergies/types';
import { wrapExecutor } from './wrapExecutor';

/**
 * The 5 pilot executor IDs — INCLUSIVE module surface only
 */
export const PILOT_EXECUTORS = [
  'adaptive-ui',
  'cognitive-load-optimization',
  'comprehensive-accessibility-audit',
  'personalized-accessibility-engine',
  'inclusive-content',
] as const;

export type PilotExecutorId = typeof PILOT_EXECUTORS[number];

/** Check if an executor is in the pilot set */
export function isPilotExecutor(id: string): id is PilotExecutorId {
  return (PILOT_EXECUTORS as readonly string[]).includes(id);
}

/** Wrapped executor cache for probe access */
const wrappedCache = new Map<string, SynergyExecutor>();

/**
 * Intercept registration: if executor is a pilot, wrap it with immune layer.
 * This returns a new registerFn that transparently wraps pilot executors.
 */
export function createImmuneAwareRegister(
  originalRegisterFn: (id: string, executor: SynergyExecutor) => void,
): (id: string, executor: SynergyExecutor) => void {
  return (id: string, executor: SynergyExecutor) => {
    if (isPilotExecutor(id)) {
      const wrapped = wrapExecutor(executor, id, {
        module: 'INCLUSIVE',
        scope: id,
      });
      wrappedCache.set(id, wrapped);
      originalRegisterFn(id, wrapped);
    } else {
      originalRegisterFn(id, executor);
    }
  };
}

/** Get a wrapped executor by name (for probeMini) */
export function getWrappedExecutor(id: string): SynergyExecutor | undefined {
  return wrappedCache.get(id);
}
