/**
 * COMPASS Hardening — Security & input validation for the spatial-temporal node.
 * Enforces coordinate bounds, waypoint limits, data point caps, and horizon constraints.
 */

import { getCompassHealth, getCompassHardening } from '../compass-module';

export const COMPASS_LIMITS = {
  LAT_MIN: -90,
  LAT_MAX: 90,
  LNG_MIN: -180,
  LNG_MAX: 180,
  ALTITUDE_MIN: -500,
  ALTITUDE_MAX: 100_000, // meters
  MAX_WAYPOINTS: 500,
  MIN_WAYPOINTS: 2,
  MAX_DATA_POINTS: 10_000,
  MIN_DATA_POINTS: 2,
  MAX_HORIZON_STEPS: 1_000,
  MIN_HORIZON_STEPS: 1,
  MAX_METRIC_NAME_LENGTH: 256,
  MAX_REGION_NAME_LENGTH: 256,
  MAX_ROUTES: 200,
  MAX_FORECASTS: 100,
} as const;

export interface CompassValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateCompassInput(params: {
  waypoints?: { lat: number; lng: number; altitude?: number }[];
  dataPoints?: { timestamp: number; value: number }[];
  horizonSteps?: number;
  metric?: string;
}): CompassValidationResult {
  const errors: string[] = [];

  if (params.waypoints !== undefined) {
    if (params.waypoints.length < COMPASS_LIMITS.MIN_WAYPOINTS) {
      errors.push(`At least ${COMPASS_LIMITS.MIN_WAYPOINTS} waypoints required`);
    } else if (params.waypoints.length > COMPASS_LIMITS.MAX_WAYPOINTS) {
      errors.push(`Too many waypoints (max ${COMPASS_LIMITS.MAX_WAYPOINTS})`);
    }
    for (let i = 0; i < Math.min(params.waypoints.length, 10); i++) {
      const wp = params.waypoints[i];
      if (wp.lat < COMPASS_LIMITS.LAT_MIN || wp.lat > COMPASS_LIMITS.LAT_MAX) {
        errors.push(`Waypoint ${i}: latitude ${wp.lat} out of bounds [${COMPASS_LIMITS.LAT_MIN}, ${COMPASS_LIMITS.LAT_MAX}]`);
        break;
      }
      if (wp.lng < COMPASS_LIMITS.LNG_MIN || wp.lng > COMPASS_LIMITS.LNG_MAX) {
        errors.push(`Waypoint ${i}: longitude ${wp.lng} out of bounds [${COMPASS_LIMITS.LNG_MIN}, ${COMPASS_LIMITS.LNG_MAX}]`);
        break;
      }
      if (wp.altitude !== undefined && (wp.altitude < COMPASS_LIMITS.ALTITUDE_MIN || wp.altitude > COMPASS_LIMITS.ALTITUDE_MAX)) {
        errors.push(`Waypoint ${i}: altitude out of bounds`);
        break;
      }
    }
  }

  if (params.dataPoints !== undefined) {
    if (params.dataPoints.length < COMPASS_LIMITS.MIN_DATA_POINTS) {
      errors.push(`At least ${COMPASS_LIMITS.MIN_DATA_POINTS} data points required`);
    } else if (params.dataPoints.length > COMPASS_LIMITS.MAX_DATA_POINTS) {
      errors.push(`Too many data points (max ${COMPASS_LIMITS.MAX_DATA_POINTS.toLocaleString()})`);
    }
    // Check for non-finite values
    const badPoint = params.dataPoints.find(d => !isFinite(d.value) || !isFinite(d.timestamp));
    if (badPoint) {
      errors.push('Data points must contain finite numeric values');
    }
  }

  if (params.horizonSteps !== undefined) {
    if (params.horizonSteps < COMPASS_LIMITS.MIN_HORIZON_STEPS || params.horizonSteps > COMPASS_LIMITS.MAX_HORIZON_STEPS) {
      errors.push(`Horizon steps must be between ${COMPASS_LIMITS.MIN_HORIZON_STEPS} and ${COMPASS_LIMITS.MAX_HORIZON_STEPS}`);
    }
  }

  if (params.metric !== undefined) {
    if (!params.metric || params.metric.trim().length === 0) {
      errors.push('Metric name is required');
    } else if (params.metric.length > COMPASS_LIMITS.MAX_METRIC_NAME_LENGTH) {
      errors.push(`Metric name exceeds ${COMPASS_LIMITS.MAX_METRIC_NAME_LENGTH} chars`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function compassHardeningReport() {
  const health = getCompassHealth();
  const hardening = getCompassHardening();

  return {
    node: 'COMPASS',
    version: '1.0.0',
    health,
    hardening,
    limits: COMPASS_LIMITS,
    status: health >= 70 ? 'healthy' : health >= 40 ? 'degraded' : 'critical',
  };
}
