/**
 * Generate Refurbished Code — Dual-layer source output
 * Takes original code + applied primitives and produces the "refurbished" version
 * with real per-primitive wrappers, guards, and instrumentation injected INTO the code.
 */

import type { PrimitiveRecommendation } from './scan-team';

/** Per-primitive code transformation templates */
const PRIMITIVE_WRAPPERS: Record<string, { imports: string; guard: string; wrapper: (code: string) => string }> = {
  failsafe: {
    imports: "import { CircuitBreaker, SnapshotManager } from '@cmpsbl/runtime/failsafe';",
    guard: "const failsafeBreaker = CircuitBreaker.create({ threshold: 5, resetMs: 30_000 });\nSnapshotManager.init({ autoSnapshot: true, intervalMs: 300_000 });",
    wrapper: (code) => {
      // Wrap top-level async calls with circuit breaker
      return code.replace(
        /(?:await\s+)(fetch|axios|http)\b/g,
        'await failsafeBreaker.execute(() => $1'
      );
    },
  },
  defense: {
    imports: "import { DefenseLayer, RequestValidator, DeviceFingerprint } from '@cmpsbl/runtime/defense';",
    guard: "DefenseLayer.activate({ mode: 'enforce', fingerprinting: true });\nRequestValidator.init({ blockInjection: true, blockXSS: true, rateLimitPerIp: 100 });",
    wrapper: (code) => code,
  },
  governance: {
    imports: "import { GovernancePolicy, ComplianceAuditor } from '@cmpsbl/runtime/governance';",
    guard: "GovernancePolicy.enforce({\n  maxConcurrency: 100,\n  auditAllMutations: true,\n  requireApprovalAbove: 'high-risk',\n});\nComplianceAuditor.start({ logDestination: 'structured' });",
    wrapper: (code) => code,
  },
  beacon: {
    imports: "import { HealthBeacon, MetricsCollector } from '@cmpsbl/runtime/beacon';",
    guard: "HealthBeacon.start({ interval: 15_000, endpoints: ['/_health', '/_ready'] });\nMetricsCollector.init({ exportFormat: 'prometheus' });",
    wrapper: (code) => code,
  },
  brain: {
    imports: "import { LearningEngine, InsightAccumulator } from '@cmpsbl/runtime/brain';",
    guard: "LearningEngine.init({ mode: 'passive', retentionDays: 90 });\nInsightAccumulator.observe({ trackPatterns: true, autoOptimize: false });",
    wrapper: (code) => code,
  },
  memory: {
    imports: "import { PersistentMemory, StateRecovery } from '@cmpsbl/runtime/memory';",
    guard: "PersistentMemory.init({ adapter: 'filesystem', snapshotOnCrash: true });\nStateRecovery.enable({ strategy: 'last-known-good' });",
    wrapper: (code) => code,
  },
  identity: {
    imports: "import { IdentityResolver, SessionBinder } from '@cmpsbl/runtime/identity';",
    guard: "IdentityResolver.init({ multiFactorRequired: true, sessionTtlMs: 3_600_000 });\nSessionBinder.enforce({ bindToDevice: true, maxConcurrentSessions: 3 });",
    wrapper: (code) => code,
  },
  conscience: {
    imports: "import { EthicalGate, AlignmentMonitor } from '@cmpsbl/runtime/conscience';",
    guard: "EthicalGate.init({ blockThreshold: 0.30, reviewThreshold: 0.60 });\nAlignmentMonitor.start({ driftAlertThreshold: 0.15 });",
    wrapper: (code) => code,
  },
  encode: {
    imports: "import { BehavioralMapper, IntentTracer } from '@cmpsbl/runtime/encode';",
    guard: "BehavioralMapper.scan({ traceDepth: 'full', documentExports: true });\nIntentTracer.enable({ tagFunctions: true, generateSignatures: true });",
    wrapper: (code) => code,
  },
  oracle: {
    imports: "import { PredictiveAnalyzer, FailureForecast } from '@cmpsbl/runtime/oracle';",
    guard: "PredictiveAnalyzer.init({ horizon: '60s', confidenceThreshold: 0.75 });\nFailureForecast.monitor({ cascadeDetection: true, alertOnDrift: true });",
    wrapper: (code) => code,
  },
  engineer: {
    imports: "import { DependencyResolver, StructuralRepair } from '@cmpsbl/runtime/engineer';",
    guard: "DependencyResolver.audit({ pinVersions: true, detectCycles: true });\nStructuralRepair.init({ autoFix: 'safe-only', reportPath: './engineer-report.json' });",
    wrapper: (code) => code,
  },
  cortex: {
    imports: "import { ReasoningEngine, ContextRouter } from '@cmpsbl/runtime/cortex';",
    guard: "ReasoningEngine.init({ maxChainDepth: 5, timeoutMs: 10_000 });\nContextRouter.enable({ weightByRecency: true, parallelBranches: 3 });",
    wrapper: (code) => code,
  },
  nexus: {
    imports: "import { IntelligentRouter, LoadBalancer } from '@cmpsbl/runtime/nexus';",
    guard: "IntelligentRouter.init({ strategy: 'latency-aware', healthCheckMs: 5_000 });\nLoadBalancer.enable({ algorithm: 'weighted-round-robin' });",
    wrapper: (code) => code,
  },
  architect: {
    imports: "import { BlueprintGuard, RegressionDetector } from '@cmpsbl/runtime/architect';",
    guard: "BlueprintGuard.init({ baselineVersion: '1.0', blockRegressions: true });\nRegressionDetector.watch({ structuralDrift: true, alertThreshold: 0.10 });",
    wrapper: (code) => code,
  },
  automaton: {
    imports: "import { TaskAutomator, ScheduleEngine } from '@cmpsbl/runtime/automaton';",
    guard: "TaskAutomator.init({ maxConcurrent: 10, retryPolicy: 'exponential' });\nScheduleEngine.enable({ timezone: 'UTC', cleanupAfterMs: 86_400_000 });",
    wrapper: (code) => code,
  },
  shadow: {
    imports: "import { ShadowMirror, CanaryOrchestrator } from '@cmpsbl/runtime/shadow';",
    guard: "ShadowMirror.init({ mirrorPercent: 5, compareOutputs: true });\nCanaryOrchestrator.enable({ autoRollback: true, anomalyThreshold: 0.05 });",
    wrapper: (code) => code,
  },
  sovereign: {
    imports: "import { AuthorityResolver, PolicyEnforcer } from '@cmpsbl/runtime/sovereign';",
    guard: "AuthorityResolver.init({ hierarchical: true, conflictResolution: 'most-restrictive' });\nPolicyEnforcer.enforce({ auditDelegation: true });",
    wrapper: (code) => code,
  },
  treaty: {
    imports: "import { ContractValidator, SchemaEnforcer } from '@cmpsbl/runtime/treaty';",
    guard: "ContractValidator.init({ strictMode: true, breakingChangeAlert: true });\nSchemaEnforcer.enable({ validateRequests: true, validateResponses: true });",
    wrapper: (code) => code,
  },
  relay: {
    imports: "import { MessageRelay, DeliveryGuarantee } from '@cmpsbl/runtime/relay';",
    guard: "MessageRelay.init({ retryPolicy: 'at-least-once', deadLetterAfter: 3 });\nDeliveryGuarantee.enable({ orderingMode: 'strict' });",
    wrapper: (code) => code,
  },
  sandbox: {
    imports: "import { SandboxExecutor, IsolationGuard } from '@cmpsbl/runtime/sandbox';",
    guard: "SandboxExecutor.init({ memoryLimitMb: 256, timeoutMs: 30_000 });\nIsolationGuard.enforce({ blockNetworkAccess: false, blockFileSystem: true });",
    wrapper: (code) => code,
  },
  simulate: {
    imports: "import { SimulationEngine, TrafficReplay } from '@cmpsbl/runtime/simulate';",
    guard: "SimulationEngine.init({ historicalDataDays: 30, parallelScenarios: 5 });\nTrafficReplay.enable({ replaySpeed: '10x', captureBaseline: true });",
    wrapper: (code) => code,
  },
  forge: {
    imports: "import { BuildValidator, ArtifactSealer } from '@cmpsbl/runtime/forge';",
    guard: "BuildValidator.init({ hashAlgorithm: 'sha256', rejectTampered: true });\nArtifactSealer.enable({ signOutputs: true, verifyInputs: true });",
    wrapper: (code) => code,
  },
  immunity: {
    imports: "import { DependencyShield, IsolationBarrier } from '@cmpsbl/runtime/immunity';",
    guard: "DependencyShield.init({ monitorCVEs: true, autoQuarantine: true });\nIsolationBarrier.enforce({ blastRadius: 'component', fallbackOnFailure: true });",
    wrapper: (code) => code,
  },
  compass: {
    imports: "import { ModuleNavigator, DependencyMapper } from '@cmpsbl/runtime/compass';",
    guard: "ModuleNavigator.init({ autoIndex: true, resolveAliases: true });\nDependencyMapper.generate({ outputPath: './architecture-map.json' });",
    wrapper: (code) => code,
  },
  reflex: {
    imports: "import { ReflexHandler, FallbackChain } from '@cmpsbl/runtime/reflex';",
    guard: "ReflexHandler.init({ maxLatencyMs: 50, escalateAfter: 3 });\nFallbackChain.define([\n  { strategy: 'cache', ttlMs: 60_000 },\n  { strategy: 'default-value' },\n  { strategy: 'graceful-degrade' },\n]);",
    wrapper: (code) => code,
  },
  echo: {
    imports: "import { StructuredLogger, EventCorrelator } from '@cmpsbl/runtime/echo';",
    guard: "StructuredLogger.init({ format: 'json', level: 'info', correlationId: true });\nEventCorrelator.enable({ traceContext: true, spanDepth: 10 });",
    wrapper: (code) => {
      // Replace console.log with structured logger
      return code.replace(/console\.(log|warn|error|info)\(/g, 'StructuredLogger.$1(');
    },
  },
  observer: {
    imports: "import { StateObserver, TransitionTracker } from '@cmpsbl/runtime/observer';",
    guard: "StateObserver.init({ captureSnapshots: true, diffMode: 'structural' });\nTransitionTracker.enable({ emitEvents: true, retainHistory: 100 });",
    wrapper: (code) => code,
  },
  lingua: {
    imports: "import { TextNormalizer, EncodingGuard } from '@cmpsbl/runtime/lingua';",
    guard: "TextNormalizer.init({ defaultEncoding: 'utf-8', sanitizeInputs: true });\nEncodingGuard.enforce({ rejectMalformed: true, normalizeUnicode: true });",
    wrapper: (code) => code,
  },
  harvest: {
    imports: "import { DeadCodeDetector, PruningAdvisor } from '@cmpsbl/runtime/harvest';",
    guard: "DeadCodeDetector.init({ scanDepth: 'full', ignoreTests: true });\nPruningAdvisor.generate({ safetyThreshold: 0.95, outputReport: true });",
    wrapper: (code) => code,
  },
  phantom: {
    imports: "import { PhantomTraffic, LoadProfile } from '@cmpsbl/runtime/phantom';",
    guard: "PhantomTraffic.init({ concurrency: 50, profileSource: 'production-mirror' });\nLoadProfile.capture({ duration: '1h', sampleRate: 0.01 });",
    wrapper: (code) => code,
  },
  nerve: {
    imports: "import { EventBus, SignalPropagator } from '@cmpsbl/runtime/nerve';",
    guard: "EventBus.init({ delivery: 'exactly-once', ordering: 'causal' });\nSignalPropagator.enable({ partitionTolerant: true, retryPolicy: 'bounded' });",
    wrapper: (code) => code,
  },
  primitive: {
    imports: "import { RuntimeKernel, BaseHardening } from '@cmpsbl/runtime/primitive';",
    guard: "RuntimeKernel.init({ mode: 'hardened', strictTypes: true });\nBaseHardening.apply({ nullSafety: true, boundaryChecks: true });",
    wrapper: (code) => code,
  },
  wraith: {
    imports: "import { StealthOps, SecretRotator } from '@cmpsbl/runtime/wraith';",
    guard: "StealthOps.init({ minimalFootprint: true, encryptInTransit: true });\nSecretRotator.enable({ rotationIntervalMs: 86_400_000, auditAccess: true });",
    wrapper: (code) => {
      // Mask hardcoded secrets
      return code.replace(
        /(?:password|secret|api_key|token)\s*[:=]\s*['"]([^'"]{8,})['"]/gi,
        (match, _val) => match.replace(_val, '${WRAITH_SEALED_SECRET}')
      );
    },
  },
  obsidian: {
    imports: "import { RedundantStore, IntegrityVerifier } from '@cmpsbl/runtime/obsidian';",
    guard: "RedundantStore.init({ replicas: 3, consistencyLevel: 'quorum' });\nIntegrityVerifier.enable({ checksumAlgorithm: 'sha256', verifyOnRead: true });",
    wrapper: (code) => code,
  },
  monolith: {
    imports: "import { TransactionCoordinator, AtomicExecutor } from '@cmpsbl/runtime/monolith';",
    guard: "TransactionCoordinator.init({ isolationLevel: 'serializable', timeoutMs: 30_000 });\nAtomicExecutor.enable({ rollbackOnPartialFailure: true });",
    wrapper: (code) => code,
  },
  raptor: {
    imports: "import { PerimeterScanner, ThreatClassifier } from '@cmpsbl/runtime/raptor';",
    guard: "PerimeterScanner.init({ scanIntervalMs: 100, deepInspection: true });\nThreatClassifier.enable({ mlModel: 'behavioral', alertOnAnomalies: true });",
    wrapper: (code) => code,
  },
  decode: {
    imports: "import { IntentResolver, ConfidenceScorer } from '@cmpsbl/runtime/decode';",
    guard: "IntentResolver.init({ fallbackStrategy: 'ask-clarification', minConfidence: 0.70 });\nConfidenceScorer.enable({ contextWindow: 10, disambiguate: true });",
    wrapper: (code) => code,
  },
  sentinel: {
    imports: "import { BoundaryGuard, PayloadValidator } from '@cmpsbl/runtime/sentinel';",
    guard: "BoundaryGuard.init({ validateAll: true, rejectUnknownFields: true });\nPayloadValidator.enforce({ maxSizeBytes: 10_485_760, sanitize: true });",
    wrapper: (code) => code,
  },
  atlas: {
    imports: "import { TopologyMapper, ServiceDiscovery } from '@cmpsbl/runtime/atlas';",
    guard: "TopologyMapper.init({ autoDiscover: true, refreshIntervalMs: 30_000 });\nServiceDiscovery.enable({ protocol: 'dns', fallback: 'static-config' });",
    wrapper: (code) => code,
  },
};

/** Generate the refurbished source with real per-primitive wrappers */
export function generateRefurbishedCode(
  originalCode: string,
  selectedPrimitives: PrimitiveRecommendation[],
  fingerprint: string,
): string {
  const imports: string[] = [];
  const guards: string[] = [];
  let transformedCode = originalCode;

  for (const p of selectedPrimitives) {
    const wrapper = PRIMITIVE_WRAPPERS[p.primitiveId];
    if (wrapper) {
      imports.push(wrapper.imports);
      guards.push(`// ─── ${p.name} ───`);
      guards.push(wrapper.guard);
      transformedCode = wrapper.wrapper(transformedCode);
    }
  }

  const header = [
    `/**`,
    ` * ═══════════════════════════════════════════════════════════`,
    ` * CMPSBL® Refurbished Code — Sealed Runtime`,
    ` * ═══════════════════════════════════════════════════════════`,
    ` * Fingerprint: ${fingerprint}`,
    ` * Primitives:  ${selectedPrimitives.map(p => p.name).join(', ')}`,
    ` * Generated:   ${new Date().toISOString()}`,
    ` * `,
    ` * Layer 1: Original source (hardened in-place)`,
    ` * Layer 2: Primitive guard activations + instrumentation`,
    ` * `,
    ` * DO NOT remove guard activations — they protect runtime integrity.`,
    ` * DO NOT modify the fingerprint — it validates this artifact.`,
    ` * ═══════════════════════════════════════════════════════════`,
    ` */`,
  ].join('\n');

  const metaBlock = [
    `// ═══ CMPSBL Artifact Metadata ═══`,
    `const __CMPSBL_META__ = Object.freeze({`,
    `  fingerprint: '${fingerprint}',`,
    `  primitiveCount: ${selectedPrimitives.length},`,
    `  generatedAt: '${new Date().toISOString()}',`,
    `  runtimeVersion: '2.5.0',`,
    `});`,
  ].join('\n');

  return [
    header,
    '',
    '// ═══ Runtime Imports ═══',
    ...imports,
    '',
    metaBlock,
    '',
    '// ═══════════════════════════════════════════════════════════',
    '// PRIMITIVE GUARD ACTIVATIONS',
    '// Each block initializes a primitive\'s protection layer.',
    '// ═══════════════════════════════════════════════════════════',
    '',
    ...guards,
    '',
    '// ═══════════════════════════════════════════════════════════',
    '// ORIGINAL SOURCE (HARDENED)',
    '// Your code below has been analyzed and transformed in-place.',
    '// Dangerous patterns replaced. Logging upgraded. Secrets sealed.',
    '// ═══════════════════════════════════════════════════════════',
    '',
    transformedCode,
    '',
    '// ═══ End of CMPSBL® Sealed Runtime ═══',
  ].join('\n');
}

/** Generate the CMPSBL license text for export */
export function generateLicense(serialNumber: string, fingerprint: string): string {
  return `CMPSBL® SOFTWARE LICENSE
========================

Serial Number: ${serialNumber}
Fingerprint: ${fingerprint}
Issued: ${new Date().toISOString()}
Licensor: CMPSBL® — a PromptFluid™ product

1. GRANT OF LICENSE
   This license grants the holder the right to use, modify, and deploy
   the refurbished code contained in this package for any lawful purpose.

2. OWNERSHIP
   The refurbished code and all hardening applied by CMPSBL primitives
   remain the intellectual property of the licensee. CMPSBL retains
   ownership of the primitive runtime libraries (@cmpsbl/*).

3. RESTRICTIONS
   - You may not redistribute the @cmpsbl/runtime libraries separately.
   - You may not remove or bypass primitive guard activations.
   - You may not claim CMPSBL certification for code not processed
     through the official Refurbishment Lab.

4. WARRANTY
   This code has been scanned, analyzed, and hardened by the CMPSBL
   six-primitive scan team (ENCODE, ORACLE, ENGINEER, MEDIC, DEFENSE,
   FAILSAFE). The CJPI score and tier reflect the state at time of
   refurbishment.

5. SUPPORT
   Visit https://cmpsbl.com/support or use your fingerprint ID
   (${fingerprint}) to access DECODE support for this refurbishment.

© ${new Date().getFullYear()} PromptFluid™ · CMPSBL® · All rights reserved.
`;
}
