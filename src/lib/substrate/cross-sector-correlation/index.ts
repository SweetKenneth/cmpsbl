/**
 * Cross-Sector Health Correlation Engine
 * Detect cascade patterns across sectors
 * 
 * Monitors health changes across sectors to detect patterns like
 * "OCG degradation always precedes CCR failures" and preemptively isolate upstream.
 */

import type { MatrixSector } from '@/lib/core/matrixNodeRegistry';
import { emit } from '../events';

export interface SectorHealthSnapshot {
  sector: MatrixSector;
  health: number;
  timestamp: number;
}

export interface CascadePattern {
  id: string;
  sourceSector: MatrixSector;
  targetSector: MatrixSector;
  confidence: number;
  occurrences: number;
  avgLeadTimeMs: number;
  lastDetected: number;
  description: string;
}

export interface CorrelationAlert {
  id: string;
  pattern: CascadePattern;
  currentSourceHealth: number;
  predictedTargetImpact: number;
  recommendation: string;
  createdAt: number;
  acknowledged: boolean;
}

const healthHistory: SectorHealthSnapshot[] = [];
const MAX_HISTORY = 720;
const patterns: CascadePattern[] = [];
const alerts: CorrelationAlert[] = [];

// Sector dependency chains — field-based topology
const SECTOR_DEPENDENCIES: Record<MatrixSector, MatrixSector[]> = {
  core: [],
  system: ['core'],
  ccr: ['core', 'system'],
  ocg: ['core'],
  execution: ['ccr', 'ocg'],
  esz: ['core', 'execution'],
  epz: ['core', 'execution'],
  emz: ['core', 'execution'],
  field: ['execution', 'ccr'],
  plane: ['core'],
  shell: ['core'],
};

export function recordSectorHealth(sector: MatrixSector, health: number): void {
  healthHistory.push({ sector, health, timestamp: Date.now() });
  if (healthHistory.length > MAX_HISTORY * 5) {
    healthHistory.splice(0, healthHistory.length - MAX_HISTORY);
  }
}

export function detectCascadePatterns(): CascadePattern[] {
  const detectedPatterns: CascadePattern[] = [];
  const sectors: MatrixSector[] = ['core', 'system', 'ccr', 'ocg', 'execution', 'field', 'plane', 'shell'];
  const windowMs = 300_000;

  for (const source of sectors) {
    for (const target of sectors) {
      if (source === target) continue;

      const sourceDrops = findHealthDrops(source);
      const targetDrops = findHealthDrops(target);

      let correlations = 0;
      let totalLeadTime = 0;

      for (const sd of sourceDrops) {
        const following = targetDrops.find(
          td => td.timestamp > sd.timestamp && td.timestamp - sd.timestamp < windowMs
        );
        if (following) {
          correlations++;
          totalLeadTime += following.timestamp - sd.timestamp;
        }
      }

      if (correlations >= 2) {
        const confidence = Math.min(0.95, correlations / Math.max(sourceDrops.length, 1));
        detectedPatterns.push({
          id: `cascade-${source}-${target}`,
          sourceSector: source,
          targetSector: target,
          confidence,
          occurrences: correlations,
          avgLeadTimeMs: Math.round(totalLeadTime / correlations),
          lastDetected: Date.now(),
          description: `${source.toUpperCase()} degradation precedes ${target.toUpperCase()} failures (${correlations} occurrences, avg lead: ${Math.round(totalLeadTime / correlations / 1000)}s)`,
        });
      }
    }
  }

  for (const dp of detectedPatterns) {
    const existing = patterns.findIndex(p => p.id === dp.id);
    if (existing >= 0) patterns[existing] = dp;
    else patterns.push(dp);
  }

  return detectedPatterns;
}

function findHealthDrops(sector: MatrixSector): { timestamp: number; drop: number }[] {
  const drops: { timestamp: number; drop: number }[] = [];
  const sectorHistory = healthHistory.filter(h => h.sector === sector);

  for (let i = 1; i < sectorHistory.length; i++) {
    const drop = sectorHistory[i - 1].health - sectorHistory[i].health;
    if (drop >= 10) {
      drops.push({ timestamp: sectorHistory[i].timestamp, drop });
    }
  }

  return drops;
}

export function checkForPreemptiveAction(sectorHealthMap: Record<MatrixSector, number>): CorrelationAlert[] {
  const newAlerts: CorrelationAlert[] = [];

  for (const pattern of patterns) {
    if (pattern.confidence < 0.5) continue;

    const sourceHealth = sectorHealthMap[pattern.sourceSector] ?? 100;
    if (sourceHealth < 70) {
      const alert: CorrelationAlert = {
        id: `alert-${Date.now()}-${pattern.id}`,
        pattern,
        currentSourceHealth: sourceHealth,
        predictedTargetImpact: Math.round(pattern.confidence * (100 - sourceHealth)),
        recommendation: `Preemptively isolate ${pattern.targetSector.toUpperCase()} — ${pattern.sourceSector.toUpperCase()} degradation detected (pattern confidence: ${Math.round(pattern.confidence * 100)}%)`,
        createdAt: Date.now(),
        acknowledged: false,
      };

      newAlerts.push(alert);
      alerts.push(alert);

      emit({
        module: 'system',
        event_type: 'cascade_alert',
        outcome: 'succeeded',
        data: { source: pattern.sourceSector, target: pattern.targetSector, confidence: pattern.confidence },
      });
    }
  }

  return newAlerts;
}

export function acknowledgeAlert(alertId: string): void {
  const alert = alerts.find(a => a.id === alertId);
  if (alert) alert.acknowledged = true;
}

export function getPatterns(): CascadePattern[] {
  return [...patterns];
}

export function getAlerts(unacknowledgedOnly = false): CorrelationAlert[] {
  return unacknowledgedOnly ? alerts.filter(a => !a.acknowledged) : [...alerts];
}

export function getCorrelationSummary() {
  return {
    patternsDetected: patterns.length,
    highConfidence: patterns.filter(p => p.confidence >= 0.7).length,
    activeAlerts: alerts.filter(a => !a.acknowledged).length,
    totalAlerts: alerts.length,
    sectorDependencies: SECTOR_DEPENDENCIES,
  };
}
