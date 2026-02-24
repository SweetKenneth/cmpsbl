/**
 * VISION Module Enhancements — SPARTA Epoch
 * PredictiveSLA, AnomalyForecaster, PerformanceInsight, CapacityPlanner
 */

// ═══════════════════════════════════════════════════════════════════════════════
// PREDICTIVE SLA — Linear regression for breach forecasting
// ═══════════════════════════════════════════════════════════════════════════════

interface SLAMetric {
  name: string;
  target: number;
  currentValue: number;
  history: Array<{ timestamp: number; value: number }>;
  unit: string;
}

interface SLAPrediction {
  metric: string;
  predictedBreach: boolean;
  timeToBreachMinutes: number;
  confidence: number;
  trend: 'improving' | 'stable' | 'degrading';
  recommendedAction: string;
}

export class PredictiveSLA {
  private metrics: Map<string, SLAMetric> = new Map();
  private predictionHorizon: number = 60; // minutes

  /** Register an SLA metric */
  registerMetric(name: string, target: number, unit: string): void {
    this.metrics.set(name, {
      name,
      target,
      currentValue: target,
      history: [],
      unit,
    });
  }

  /** Record a metric value */
  recordValue(name: string, value: number): void {
    const metric = this.metrics.get(name);
    if (!metric) return;

    metric.currentValue = value;
    metric.history.push({ timestamp: Date.now(), value });

    // Keep last 1000 data points
    if (metric.history.length > 1000) {
      metric.history.shift();
    }
  }

  /** Predict SLA breaches using linear regression */
  predict(name: string): SLAPrediction | null {
    const metric = this.metrics.get(name);
    if (!metric || metric.history.length < 10) return null;

    // Linear regression on recent data
    const recentData = metric.history.slice(-100);
    const { slope, intercept } = this.linearRegression(recentData);

    // Predict future value
    const futureTimestamp = Date.now() + (this.predictionHorizon * 60000);
    const predictedValue = slope * futureTimestamp + intercept;

    // Calculate time to breach (if degrading)
    let timeToBreachMinutes = Infinity;
    if (slope > 0) { // Value increasing (degrading for response time SLAs)
      timeToBreachMinutes = (metric.target - metric.currentValue) / slope / 60000;
    }

    // Determine trend
    let trend: SLAPrediction['trend'] = 'stable';
    if (Math.abs(slope) > 0.0001) {
      trend = slope > 0 ? 'degrading' : 'improving';
    }

    // Calculate confidence based on R²
    const rSquared = this.calculateRSquared(recentData, slope, intercept);

    return {
      metric: name,
      predictedBreach: predictedValue > metric.target,
      timeToBreachMinutes: Math.max(0, timeToBreachMinutes),
      confidence: rSquared,
      trend,
      recommendedAction: this.getRecommendation(trend, timeToBreachMinutes),
    };
  }

  private linearRegression(data: Array<{ timestamp: number; value: number }>): { slope: number; intercept: number } {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (const point of data) {
      sumX += point.timestamp;
      sumY += point.value;
      sumXY += point.timestamp * point.value;
      sumXX += point.timestamp * point.timestamp;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope: isNaN(slope) ? 0 : slope, intercept: isNaN(intercept) ? 0 : intercept };
  }

  private calculateRSquared(data: Array<{ timestamp: number; value: number }>, slope: number, intercept: number): number {
    if (data.length === 0) return 0;

    const meanY = data.reduce((a, b) => a + b.value, 0) / data.length;
    let ssTotal = 0, ssResidual = 0;

    for (const point of data) {
      const predicted = slope * point.timestamp + intercept;
      ssTotal += Math.pow(point.value - meanY, 2);
      ssResidual += Math.pow(point.value - predicted, 2);
    }

    return ssTotal === 0 ? 0 : Math.max(0, 1 - (ssResidual / ssTotal));
  }

  private getRecommendation(trend: string, timeToBreachMinutes: number): string {
    if (trend === 'improving') return 'No action needed - metrics improving';
    if (timeToBreachMinutes < 15) return 'URGENT: Scale resources immediately';
    if (timeToBreachMinutes < 30) return 'Scale resources proactively';
    if (timeToBreachMinutes < 60) return 'Monitor closely, prepare scaling';
    return 'Continue monitoring';
  }

  /** Get all predictions */
  getAllPredictions(): SLAPrediction[] {
    const predictions: SLAPrediction[] = [];
    for (const name of this.metrics.keys()) {
      const prediction = this.predict(name);
      if (prediction) predictions.push(prediction);
    }
    return predictions.sort((a, b) => a.timeToBreachMinutes - b.timeToBreachMinutes);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANOMALY FORECASTER — Statistical anomaly detection with prediction
// ═══════════════════════════════════════════════════════════════════════════════

interface AnomalyResult {
  metric: string;
  isAnomaly: boolean;
  zScore: number;
  expectedRange: { min: number; max: number };
  actualValue: number;
  severity: 'none' | 'minor' | 'moderate' | 'severe';
}

interface ForecastResult {
  metric: string;
  predictedAnomaly: boolean;
  probability: number;
  expectedTime: number;
  basis: string;
}

export class AnomalyForecaster {
  private data: Map<string, number[]> = new Map();
  private anomalies: Map<string, Array<{ timestamp: number; zScore: number }>> = new Map();
  private thresholds = { minor: 2, moderate: 2.5, severe: 3 };

  /** Record metric value and check for anomaly */
  record(metric: string, value: number): AnomalyResult {
    let values = this.data.get(metric);
    if (!values) {
      values = [];
      this.data.set(metric, values);
    }

    values.push(value);
    if (values.length > 500) values.shift();

    // Need at least 30 data points for meaningful statistics
    if (values.length < 30) {
      return {
        metric,
        isAnomaly: false,
        zScore: 0,
        expectedRange: { min: value * 0.8, max: value * 1.2 },
        actualValue: value,
        severity: 'none',
      };
    }

    // Calculate statistics
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
    const zScore = stdDev === 0 ? 0 : (value - mean) / stdDev;
    const absZ = Math.abs(zScore);

    // Determine severity
    let severity: AnomalyResult['severity'] = 'none';
    if (absZ >= this.thresholds.severe) severity = 'severe';
    else if (absZ >= this.thresholds.moderate) severity = 'moderate';
    else if (absZ >= this.thresholds.minor) severity = 'minor';

    const isAnomaly = severity !== 'none';

    // Track anomalies for forecasting
    if (isAnomaly) {
      let anomalyHistory = this.anomalies.get(metric);
      if (!anomalyHistory) {
        anomalyHistory = [];
        this.anomalies.set(metric, anomalyHistory);
      }
      anomalyHistory.push({ timestamp: Date.now(), zScore });
      if (anomalyHistory.length > 100) anomalyHistory.shift();
    }

    return {
      metric,
      isAnomaly,
      zScore,
      expectedRange: { min: mean - 2 * stdDev, max: mean + 2 * stdDev },
      actualValue: value,
      severity,
    };
  }

  /** Forecast future anomalies based on patterns */
  forecast(metric: string): ForecastResult {
    const anomalyHistory = this.anomalies.get(metric) || [];
    
    if (anomalyHistory.length < 3) {
      return {
        metric,
        predictedAnomaly: false,
        probability: 0.1,
        expectedTime: Infinity,
        basis: 'Insufficient history',
      };
    }

    // Calculate average time between anomalies
    const intervals: number[] = [];
    for (let i = 1; i < anomalyHistory.length; i++) {
      intervals.push(anomalyHistory[i].timestamp - anomalyHistory[i - 1].timestamp);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // Time since last anomaly
    const timeSinceLast = Date.now() - anomalyHistory[anomalyHistory.length - 1].timestamp;
    const expectedTimeToNext = Math.max(0, avgInterval - timeSinceLast);

    // Probability increases as we approach expected time
    const probability = Math.min(0.95, timeSinceLast / avgInterval);

    return {
      metric,
      predictedAnomaly: probability > 0.7,
      probability,
      expectedTime: expectedTimeToNext,
      basis: `Based on ${anomalyHistory.length} historical anomalies`,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE INSIGHT — Automated performance analysis
// ═══════════════════════════════════════════════════════════════════════════════

interface PerformanceMetrics {
  p50: number;
  p90: number;
  p99: number;
  mean: number;
  max: number;
  min: number;
}

interface PerformanceInsightResult {
  component: string;
  metrics: PerformanceMetrics;
  bottleneck: boolean;
  insight: string;
  suggestions: string[];
}

export class PerformanceInsight {
  private measurements: Map<string, number[]> = new Map();

  /** Record a performance measurement */
  record(component: string, durationMs: number): void {
    let values = this.measurements.get(component);
    if (!values) {
      values = [];
      this.measurements.set(component, values);
    }

    values.push(durationMs);
    if (values.length > 1000) values.shift();
  }

  /** Analyze performance for a component */
  analyze(component: string): PerformanceInsightResult | null {
    const values = this.measurements.get(component);
    if (!values || values.length < 10) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const metrics: PerformanceMetrics = {
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p90: sorted[Math.floor(sorted.length * 0.9)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      mean: values.reduce((a, b) => a + b, 0) / values.length,
      max: Math.max(...values),
      min: Math.min(...values),
    };

    // Detect bottleneck (p99 is 3x+ of p50)
    const bottleneck = metrics.p99 > metrics.p50 * 3;

    // Generate insights
    const { insight, suggestions } = this.generateInsights(component, metrics, bottleneck);

    return {
      component,
      metrics,
      bottleneck,
      insight,
      suggestions,
    };
  }

  private generateInsights(component: string, metrics: PerformanceMetrics, bottleneck: boolean): { insight: string; suggestions: string[] } {
    const suggestions: string[] = [];
    let insight: string;

    if (bottleneck) {
      insight = `High latency variance detected (p99: ${metrics.p99.toFixed(0)}ms vs p50: ${metrics.p50.toFixed(0)}ms)`;
      suggestions.push('Investigate tail latency causes');
      suggestions.push('Consider implementing request timeouts');
      suggestions.push('Review for slow database queries');
    } else if (metrics.p50 > 500) {
      insight = `Overall slow performance (median: ${metrics.p50.toFixed(0)}ms)`;
      suggestions.push('Profile critical path');
      suggestions.push('Consider caching');
      suggestions.push('Optimize database queries');
    } else if (metrics.p90 > 1000) {
      insight = `Occasional slowdowns (p90: ${metrics.p90.toFixed(0)}ms)`;
      suggestions.push('Review resource contention');
      suggestions.push('Check for memory pressure');
    } else {
      insight = `Performance is healthy (median: ${metrics.p50.toFixed(0)}ms)`;
    }

    return { insight, suggestions };
  }

  /** Get all components ranked by performance */
  getRankings(): Array<{ component: string; p50: number; health: 'good' | 'fair' | 'poor' }> {
    const rankings: Array<{ component: string; p50: number; health: 'good' | 'fair' | 'poor' }> = [];

    for (const component of this.measurements.keys()) {
      const result = this.analyze(component);
      if (result) {
        let health: 'good' | 'fair' | 'poor' = 'good';
        if (result.metrics.p50 > 500 || result.bottleneck) health = 'poor';
        else if (result.metrics.p50 > 200) health = 'fair';

        rankings.push({ component, p50: result.metrics.p50, health });
      }
    }

    return rankings.sort((a, b) => b.p50 - a.p50);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAPACITY PLANNER — Resource capacity forecasting
// ═══════════════════════════════════════════════════════════════════════════════

interface ResourceUsage {
  resource: string;
  current: number;
  capacity: number;
  history: Array<{ timestamp: number; usage: number }>;
}

interface CapacityPlan {
  resource: string;
  currentUtilization: number;
  predictedUtilization: number;
  daysToCapacity: number;
  recommendation: string;
  scalingNeeded: boolean;
  suggestedCapacity: number;
}

export class CapacityPlanner {
  private resources: Map<string, ResourceUsage> = new Map();

  /** Register a resource for tracking */
  registerResource(name: string, capacity: number): void {
    this.resources.set(name, {
      resource: name,
      current: 0,
      capacity,
      history: [],
    });
  }

  /** Record resource usage */
  recordUsage(name: string, usage: number): void {
    const resource = this.resources.get(name);
    if (!resource) return;

    resource.current = usage;
    resource.history.push({ timestamp: Date.now(), usage });

    if (resource.history.length > 1000) {
      resource.history.shift();
    }
  }

  /** Generate capacity plan for a resource */
  plan(name: string): CapacityPlan | null {
    const resource = this.resources.get(name);
    if (!resource || resource.history.length < 30) return null;

    const currentUtilization = resource.current / resource.capacity;

    // Calculate growth rate (usage per day)
    const dayMs = 86400000;
    const recentData = resource.history.slice(-100);
    
    let growthRate = 0;
    if (recentData.length >= 2) {
      const first = recentData[0];
      const last = recentData[recentData.length - 1];
      const timeDiff = last.timestamp - first.timestamp;
      const usageDiff = last.usage - first.usage;
      growthRate = timeDiff > 0 ? (usageDiff / timeDiff) * dayMs : 0;
    }

    // Calculate days to capacity
    const remainingCapacity = resource.capacity - resource.current;
    const daysToCapacity = growthRate > 0 ? remainingCapacity / growthRate : Infinity;

    // Predict utilization in 30 days
    const predictedUsage = resource.current + (growthRate * 30);
    const predictedUtilization = Math.min(1, predictedUsage / resource.capacity);

    // Determine if scaling is needed
    const scalingNeeded = daysToCapacity < 60 || currentUtilization > 0.75;

    // Suggest new capacity (2x current peak with 30% buffer)
    const peakUsage = Math.max(...resource.history.map(h => h.usage));
    const suggestedCapacity = scalingNeeded ? Math.ceil(peakUsage * 2 * 1.3) : resource.capacity;

    return {
      resource: name,
      currentUtilization,
      predictedUtilization,
      daysToCapacity: Math.max(0, daysToCapacity),
      recommendation: this.getRecommendation(currentUtilization, daysToCapacity),
      scalingNeeded,
      suggestedCapacity,
    };
  }

  private getRecommendation(utilization: number, daysToCapacity: number): string {
    if (utilization > 0.9) return 'CRITICAL: Scale immediately';
    if (utilization > 0.8 || daysToCapacity < 14) return 'HIGH: Plan scaling within 2 weeks';
    if (utilization > 0.7 || daysToCapacity < 30) return 'MEDIUM: Schedule capacity review';
    if (daysToCapacity < 60) return 'LOW: Monitor growth trends';
    return 'OK: Capacity is adequate';
  }

  /** Get all capacity plans */
  getAllPlans(): CapacityPlan[] {
    const plans: CapacityPlan[] = [];
    for (const name of this.resources.keys()) {
      const plan = this.plan(name);
      if (plan) plans.push(plan);
    }
    return plans.sort((a, b) => a.daysToCapacity - b.daysToCapacity);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const visionEnhancements = {
  PredictiveSLA,
  AnomalyForecaster,
  PerformanceInsight,
  CapacityPlanner,
};

export type {
  SLAMetric,
  SLAPrediction,
  AnomalyResult,
  ForecastResult,
  PerformanceMetrics,
  PerformanceInsightResult,
  ResourceUsage,
  CapacityPlan,
};
