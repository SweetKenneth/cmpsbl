/**
 * S-Tier 114 — Recursive Self-Optimization Core
 * ID: S-CJ72 | CJPI: 88 | Module: CORTEX
 * 
 * Self-optimizing execution core with recursive performance improvement.
 */

export interface OptimizationMetric {
  name: string;
  current: number;
  target: number;
  weight: number;
  direction: 'minimize' | 'maximize';
}

export interface OptimizationCycle {
  id: string;
  iteration: number;
  metrics: OptimizationMetric[];
  adjustments: Adjustment[];
  fitnessScore: number;
  timestamp: string;
}

export interface Adjustment {
  parameter: string;
  previousValue: number;
  newValue: number;
  expectedImpact: number;
}

export class RecursiveSelfOptimizer {
  private history: OptimizationCycle[] = [];
  private parameters: Map<string, number> = new Map();
  private learningRate = 0.1;
  private iteration = 0;

  setParameter(name: string, value: number): void {
    this.parameters.set(name, value);
  }

  optimize(metrics: OptimizationMetric[]): OptimizationCycle {
    this.iteration++;
    const adjustments: Adjustment[] = [];

    for (const metric of metrics) {
      const paramName = `param_${metric.name}`;
      const current = this.parameters.get(paramName) ?? 1.0;

      const gap = metric.direction === 'maximize'
        ? metric.target - metric.current
        : metric.current - metric.target;

      const normalizedGap = gap / Math.max(Math.abs(metric.target), 1);
      const adjustment = normalizedGap * this.learningRate * metric.weight;
      const newValue = current + adjustment;

      this.parameters.set(paramName, newValue);
      adjustments.push({
        parameter: paramName,
        previousValue: current,
        newValue,
        expectedImpact: adjustment,
      });
    }

    // Fitness = weighted average of how close to targets
    const fitnessScore = metrics.reduce((score, m) => {
      const ratio = m.direction === 'maximize'
        ? Math.min(m.current / Math.max(m.target, 0.001), 1)
        : Math.min(m.target / Math.max(m.current, 0.001), 1);
      return score + ratio * m.weight;
    }, 0) / metrics.reduce((s, m) => s + m.weight, 0);

    // Adaptive learning rate
    if (this.history.length > 1) {
      const prev = this.history[this.history.length - 1];
      if (fitnessScore > prev.fitnessScore) {
        this.learningRate = Math.min(0.5, this.learningRate * 1.05);
      } else {
        this.learningRate = Math.max(0.001, this.learningRate * 0.8);
      }
    }

    const cycle: OptimizationCycle = {
      id: crypto.randomUUID(),
      iteration: this.iteration,
      metrics: [...metrics],
      adjustments,
      fitnessScore,
      timestamp: new Date().toISOString(),
    };

    this.history.push(cycle);
    return cycle;
  }

  getConvergenceRate(): number {
    if (this.history.length < 2) return 0;
    const recent = this.history.slice(-5);
    const improvements = recent.slice(1).map((c, i) => c.fitnessScore - recent[i].fitnessScore);
    return improvements.reduce((s, i) => s + i, 0) / improvements.length;
  }

  getHistory(): OptimizationCycle[] { return [...this.history]; }
  getLearningRate(): number { return this.learningRate; }
}
