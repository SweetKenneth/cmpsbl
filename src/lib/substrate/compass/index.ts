/**
 * COMPASS Node — Expansion Perception Zone (EPZ)
 * Spatial-temporal reasoning, route optimization, time-series forecasting.
 *
 * Re-exports core compass-module and adds CLM + hardening layers.
 */

export {
  initCompass,
  calculateDistance,
  optimizeRoute,
  forecastTimeSeries,
  detectPatterns,
  getCompassState,
  getCompassHealth,
  getCompassResilience,
  getCompassEngine,
  getCompassHardening,
  upgradeCompassEngine,
  type GeoPoint,
  type GeoRegion,
  type Route,
  type TimeSeriesForecast,
  type TemporalPattern,
  type CompassModuleState,
} from '../compass-module';

export { compassCLM, runCompassCLMCycle, type CompassCLMInsight, type CompassCLMReport } from './clm';
export { compassHardeningReport, validateCompassInput, COMPASS_LIMITS } from './hardening';
