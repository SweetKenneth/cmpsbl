/**
 * DEFENSE — S-Tier Primitives + Enterprise Virus Protection + Ultimate Form
 * Honeypots, injection shields, anomaly detection, containment, threat anticipation,
 * payload scanning, injection detection, behavioral threat engine,
 * threat correlation, adaptive learning, geo-fencing, encrypted inspection,
 * canary tokens, incident playbooks, threat intel sync, zero-trust mesh,
 * posture dashboard, lockdown mode
 */

export * from '@/crownjewels/s-tier/077-honeypot-intelligence';
export * from '@/crownjewels/s-tier/088-behavioral-anomaly-detector';
export * from '@/crownjewels/s-tier/090-input-sanitization-gateway';
export * from '@/crownjewels/s-tier/100-prompt-injection-shield';
export * from '@/crownjewels/s-tier/111-honeypot-intelligence-advanced';
export * from '@/crownjewels/s-tier/123-intelligence-containment';
export * from '@/crownjewels/s-tier/124-emergent-threat-anticipator';
export * from '@/crownjewels/s-tier/174-adversarial-simulation';
export * from '@/crownjewels/s-tier/072-zero-trust-verification';
export * from '@/crownjewels/s-tier/167-cascade-prevention';

// Enterprise Virus Protection Suite (namespaced to avoid collisions)
export * as VirusProtection from './defense/virus-protection';

// DEFENSE Orchestrator — active runtime enforcement wrapper
export * as DefenseOrchestrator from './defense/defense-orchestrator';

// DEFENSE Event Bus — UI-safe alert stream
export * as DefenseEvents from './defense/defense-events';

// ═══════════════════════════════════════════════════════════════════════════════
// ULTIMATE FORM — 10 new subsystems
// ═══════════════════════════════════════════════════════════════════════════════

// Threat Correlation Engine — cross-engine kill-chain detection
export * as ThreatCorrelation from './defense/threat-correlation';

// Adaptive Threat Learning — feedback-driven threshold tuning
export * as AdaptiveLearning from './defense/adaptive-learning';

// Geo-Fencing & Jurisdiction Enforcement
export * as GeoFence from './defense/geo-fence';

// Encrypted/Compressed Payload Inspection
export * as EncryptedInspection from './defense/encrypted-inspection';

// Canary Token System — data-level decoys
export * as CanaryTokens from './defense/canary-tokens';

// Automated Incident Response Playbooks
export * as IncidentPlaybooks from './defense/incident-playbooks';

// Threat Intelligence Sync — IOC registry & CVE tracking
export * as ThreatIntelSync from './defense/threat-intel-sync';

// mTLS Zero-Trust Mesh Authentication
export * as ZeroTrustMesh from './defense/zero-trust-mesh';

// Security Posture Dashboard Engine
export * as DefensePosture from './defense/defense-posture';

// Kill Switch / Lockdown Mode
export * as LockdownMode from './defense/lockdown-mode';
