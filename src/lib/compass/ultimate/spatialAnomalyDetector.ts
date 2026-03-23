/**
 * COMPASS Ultimate — System 17: Spatial Anomaly Detector
 * 
 * Z-score deviation from expected spatial distributions. Detects
 * density hotspots, cold zones, and distribution shifts.
 * 
 * @module compass/ultimate/spatialAnomalyDetector
 */

// ── Types ────────────────────────────────────────────────────────

export type SpatialAnomalyType = 'density_spike' | 'cold_zone' | 'distribution_shift' | 'outlier_position';
export type SpatialAnomalySeverity = 'info' | 'warning' | 'critical';

export interface SpatialAnomaly {
  id: string;
  type: SpatialAnomalyType;
  severity: SpatialAnomalySeverity;
  lat: number;
  lon: number;
  zScore: number;
  expectedDensity: number;
  observedDensity: number;
  description: string;
  detectedAt: number;
}

export interface DensityCell {
  gridX: number;
  gridY: number;
  count: number;
  // Welford's running stats
  mean: number;
  m2: number;
  n: number;
}

export interface SpatialAnomalyStats {
  totalAnomalies: number;
  criticalAnomalies: number;
  warningAnomalies: number;
  densityCellsTracked: number;
  avgZScore: number;
}

// ── State ────────────────────────────────────────────────────────

const densityGrid: Map<string, DensityCell> = new Map();
const anomalies: SpatialAnomaly[] = [];
const MAX_ANOMALIES = 500;
const GRID_RESOLUTION = 50; // cells per degree
const Z_WARNING = 2.0;
const Z_CRITICAL = 3.0;

// ── Core API ────────────────────────────────────────────────────

/** Record a spatial observation */
export function recordSpatialObservation(lat: number, lon: number): SpatialAnomaly | null {
  const gx = Math.floor(lat * GRID_RESOLUTION);
  const gy = Math.floor(lon * GRID_RESOLUTION);
  const key = `${gx}:${gy}`;

  if (!densityGrid.has(key)) {
    densityGrid.set(key, { gridX: gx, gridY: gy, count: 0, mean: 0, m2: 0, n: 0 });
  }

  const cell = densityGrid.get(key)!;
  cell.count++;

  // Update Welford's for this cell's density over time
  cell.n++;
  const delta = cell.count - cell.mean;
  cell.mean += delta / cell.n;
  const delta2 = cell.count - cell.mean;
  cell.m2 += delta * delta2;

  // Check for anomaly (after enough observations)
  if (cell.n > 10) {
    const stdDev = Math.sqrt(cell.m2 / (cell.n - 1));
    if (stdDev > 0) {
      const zScore = Math.abs(cell.count - cell.mean) / stdDev;

      if (zScore >= Z_WARNING) {
        const isSpike = cell.count > cell.mean;
        const anomaly: SpatialAnomaly = {
          id: `sa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: isSpike ? 'density_spike' : 'cold_zone',
          severity: zScore >= Z_CRITICAL ? 'critical' : 'warning',
          lat: gx / GRID_RESOLUTION,
          lon: gy / GRID_RESOLUTION,
          zScore: Math.round(zScore * 100) / 100,
          expectedDensity: Math.round(cell.mean * 100) / 100,
          observedDensity: cell.count,
          description: isSpike
            ? `Density spike: ${cell.count} observations vs expected ${cell.mean.toFixed(1)} (Z=${zScore.toFixed(2)})`
            : `Cold zone: ${cell.count} observations vs expected ${cell.mean.toFixed(1)} (Z=${zScore.toFixed(2)})`,
          detectedAt: Date.now(),
        };

        anomalies.push(anomaly);
        if (anomalies.length > MAX_ANOMALIES) anomalies.splice(0, anomalies.length - MAX_ANOMALIES);
        return anomaly;
      }
    }
  }

  return null;
}

/** Detect outlier positions relative to a centroid */
export function detectOutlierPositions(
  points: Array<{ lat: number; lon: number }>,
  zThreshold: number = 2.5,
): SpatialAnomaly[] {
  if (points.length < 5) return [];

  // Compute centroid
  const centLat = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const centLon = points.reduce((s, p) => s + p.lon, 0) / points.length;

  // Compute distances from centroid
  const distances = points.map(p => Math.sqrt((p.lat - centLat) ** 2 + (p.lon - centLon) ** 2));
  const mean = distances.reduce((s, d) => s + d, 0) / distances.length;
  const variance = distances.reduce((s, d) => s + (d - mean) ** 2, 0) / distances.length;
  const stdDev = Math.sqrt(variance);

  const outliers: SpatialAnomaly[] = [];
  if (stdDev === 0) return outliers;

  for (let i = 0; i < points.length; i++) {
    const z = Math.abs(distances[i] - mean) / stdDev;
    if (z >= zThreshold) {
      const anomaly: SpatialAnomaly = {
        id: `sa-outlier-${Date.now()}-${i}`,
        type: 'outlier_position',
        severity: z >= Z_CRITICAL ? 'critical' : 'warning',
        lat: points[i].lat,
        lon: points[i].lon,
        zScore: Math.round(z * 100) / 100,
        expectedDensity: Math.round(mean * 1e6) / 1e6,
        observedDensity: Math.round(distances[i] * 1e6) / 1e6,
        description: `Outlier position: distance ${distances[i].toFixed(4)} from centroid vs mean ${mean.toFixed(4)} (Z=${z.toFixed(2)})`,
        detectedAt: Date.now(),
      };
      outliers.push(anomaly);
      anomalies.push(anomaly);
    }
  }

  if (anomalies.length > MAX_ANOMALIES) anomalies.splice(0, anomalies.length - MAX_ANOMALIES);
  return outliers;
}

// ── Query ────────────────────────────────────────────────────────

export function getSpatialAnomalies(since?: number): SpatialAnomaly[] {
  if (since) return anomalies.filter(a => a.detectedAt >= since);
  return [...anomalies];
}

export function getSpatialAnomalyStats(): SpatialAnomalyStats {
  return {
    totalAnomalies: anomalies.length,
    criticalAnomalies: anomalies.filter(a => a.severity === 'critical').length,
    warningAnomalies: anomalies.filter(a => a.severity === 'warning').length,
    densityCellsTracked: densityGrid.size,
    avgZScore: anomalies.length > 0
      ? Math.round(anomalies.reduce((s, a) => s + a.zScore, 0) / anomalies.length * 100) / 100
      : 0,
  };
}

export function resetSpatialAnomalyDetector(): void {
  densityGrid.clear();
  anomalies.length = 0;
}
