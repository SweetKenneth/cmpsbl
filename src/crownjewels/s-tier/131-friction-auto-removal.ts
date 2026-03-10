/**
 * S-Tier 131 — Friction Auto-Removal Engine
 * ID: S-CJ89 | CJPI: 87 | Module: DECODE×CORTEX
 * 
 * Automatically identifies and removes UX friction points.
 */

export interface FrictionSignal {
  id: string;
  path: string;
  type: 'abandon' | 'retry' | 'error' | 'delay' | 'confusion';
  severity: number; // 0-1
  userCount: number;
  timestamp: string;
}

export interface FrictionPoint {
  id: string;
  path: string;
  signals: string[];
  aggregateSeverity: number;
  occurrences: number;
  suggestedFix: string;
  autoRemovable: boolean;
  status: 'detected' | 'fixing' | 'resolved' | 'ignored';
}

export class FrictionAutoRemovalEngine {
  private signals: FrictionSignal[] = [];
  private frictionPoints: Map<string, FrictionPoint> = new Map();

  reportFriction(signal: FrictionSignal): FrictionPoint {
    this.signals.push(signal);

    const existing = this.frictionPoints.get(signal.path);
    if (existing) {
      existing.signals.push(signal.id);
      existing.occurrences += signal.userCount;
      existing.aggregateSeverity = Math.min(1, existing.aggregateSeverity + signal.severity * 0.1);
      return existing;
    }

    const point: FrictionPoint = {
      id: crypto.randomUUID(),
      path: signal.path,
      signals: [signal.id],
      aggregateSeverity: signal.severity,
      occurrences: signal.userCount,
      suggestedFix: this.suggestFix(signal),
      autoRemovable: signal.type === 'delay' || signal.type === 'retry',
      status: 'detected',
    };
    this.frictionPoints.set(signal.path, point);
    return point;
  }

  private suggestFix(signal: FrictionSignal): string {
    switch (signal.type) {
      case 'abandon': return 'Simplify flow or add progress indicators';
      case 'retry': return 'Add better error recovery or auto-retry';
      case 'error': return 'Improve error handling and user guidance';
      case 'delay': return 'Add loading states or optimize response time';
      case 'confusion': return 'Improve labels, tooltips, or onboarding';
      default: return 'Investigate user flow';
    }
  }

  getTopFrictionPoints(limit = 10): FrictionPoint[] {
    return [...this.frictionPoints.values()]
      .filter(p => p.status !== 'resolved' && p.status !== 'ignored')
      .sort((a, b) => b.aggregateSeverity * b.occurrences - a.aggregateSeverity * a.occurrences)
      .slice(0, limit);
  }

  resolve(path: string): boolean {
    const point = this.frictionPoints.get(path);
    if (!point) return false;
    point.status = 'resolved';
    return true;
  }
}
