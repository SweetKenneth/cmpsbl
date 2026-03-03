/**
 * Shield Ports — Barrel Export
 * Security features ported from aetherion-shield
 * 7 capabilities for DEFENSE, SITE-GUARD, IMMUNITY, VISION, NERVE
 */

// 1. Device Fingerprinting
export { DeviceFingerprint, type FingerprintData } from './device-fingerprint';

// 2. Behavioral Tracker
export { BehavioralTracker, type BehavioralData } from './behavioral-tracker';

// 3. Bot Detection Client
export {
  detectBot,
  gatherDetectionData,
  trackBehavior,
  type DetectionPayload,
  type DetectionResult,
} from './bot-detection-client';

// 4. Auto-Shutdown Monitor
export {
  useAutoShutdownMonitor,
  checkShutdownStatus,
  type ShutdownEvent,
} from './auto-shutdown-monitor';

// 5. Performance Monitor
export { performanceMonitor } from './performance-monitor';

// 6. Protection Client (hardened: configurable weights, entropy confidence, hash-only transit)
export {
  ProtectionClient,
  type ProtectionConfig,
  type ProtectionResult,
  type ScoreWeights,
} from './protection-client';

// 7. Consent-Gated Tracking
export {
  hasTrackingConsent,
  grantTrackingConsent,
  revokeTrackingConsent,
  initConsentTracking,
  stopConsentTracking,
  clearConsentTrackingData,
  getConsentTrackingData,
} from './consent-tracking';
