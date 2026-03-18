/**
 * CMPSBL® Anti-Drift Architecture Tests
 * Validates: one canonical runtime, all others are bridges.
 * Covers: integrity contract, health scoring, mode switching, degraded semantics.
 */
import { describe, it, expect } from 'vitest';

// These patterns MUST NOT appear in generated bridge code
const CANONICAL_ONLY_PATTERNS = [
  /CJPI_WEIGHTS\s*[:=]\s*\{/,           // CJPI weight object literals
  /strategicLeverage:\s*0\.\d/,          // Raw CJPI weight values
  /recursionPotential:\s*0\.\d/,
  /TIER_THRESHOLDS\s*[:=]\s*\{/,         // Tier threshold objects
  /min:\s*\d+,\s*max:\s*\d+/,            // Tier min/max ranges
  /class\s+Saga\s*[<{]/,                 // Saga class definition
  /createDependencyGraph\s*\(/,          // Dep graph factory
  /createPipelineComposer\s*\(/,         // Pipeline composer factory
  /createStateMachine\s*[<(]/,           // FSM factory
  /Fully synthesized pipeline/,          // Old full-runtime language
];

describe('Anti-Drift: Canonical Runtime Architecture', () => {
  const ctx = {
    name: 'TestPipeline', description: 'test', category: 'cognitive',
    moduleChain: ['BRAIN', 'MEMORY'], entryCapability: 'analyze',
    exitCapability: 'persist', errorStrategy: 'retry', maxExecutionMs: 5000, cjpi: 85,
  };

  // ── §1 — Bridge code purity ──

  it('software-synthesizer bridges should not contain canonical-only patterns', async () => {
    const mod = await import('../software-synthesizer');
    const rustCode = mod.synthesizeRust(ctx);
    const javaCode = mod.synthesizeJava(ctx);
    const phpCode = mod.synthesizePHP(ctx);
    
    for (const code of [rustCode, javaCode, phpCode]) {
      for (const pattern of CANONICAL_ONLY_PATTERNS) {
        expect(code).not.toMatch(pattern);
      }
      expect(code.toLowerCase()).toContain('bridge');
    }
  });

  it('Python and Go bridges should not contain canonical-only patterns', async () => {
    const mod = await import('../logic-synthesizer');
    const pyCode = mod.synthesizePython(ctx);
    const goCode = mod.synthesizeGo(ctx);
    
    for (const code of [pyCode, goCode]) {
      for (const pattern of CANONICAL_ONLY_PATTERNS) {
        expect(code).not.toMatch(pattern);
      }
      expect(code.toLowerCase()).toContain('bridge');
    }
  });

  it('generated bridges should include bridge_type metadata', async () => {
    const mod = await import('../software-synthesizer');
    const bridgeCtx = {
      name: 'TestPipeline', description: 'test', category: 'cognitive',
      moduleChain: ['BRAIN'], entryCapability: 'a', exitCapability: 'b',
      errorStrategy: 'retry', maxExecutionMs: 5000, cjpi: 85,
    };
    
    const languages = [
      mod.synthesizeRust, mod.synthesizeJava, mod.synthesizeCSharp,
      mod.synthesizeRuby, mod.synthesizePHP, mod.synthesizeSwift,
      mod.synthesizeKotlin, mod.synthesizeElixir, mod.synthesizeLua,
      mod.synthesizeC, mod.synthesizeCpp, mod.synthesizeDart,
      mod.synthesizeZig, mod.synthesizeScala, mod.synthesizeHaskell,
    ];
    
    for (const gen of languages) {
      const code = gen(bridgeCtx);
      expect(code.toLowerCase()).toContain('bridge');
      expect(code).not.toContain('Fully synthesized pipeline');
      expect(code).not.toContain('Full Synthesizer');
    }
  });

  // ── §2 — Contract exports ──

  it('canonical-runtime-contract exports all required types and functions', async () => {
    const contract = await import('../canonical-runtime-contract');
    // Constants
    expect(contract.CANONICAL_RUNTIME_VERSION).toBeDefined();
    expect(contract.CANONICAL_ENDPOINT).toBeDefined();
    expect(contract.CANONICAL_ONLY_CONCERNS).toBeDefined();
    expect(contract.BRIDGE_ALLOWED_CONCERNS).toBeDefined();
    expect(contract.NETWORK_MODE_THRESHOLD).toBeDefined();
    expect(contract.HYBRID_MODE_THRESHOLD).toBeDefined();
    expect(contract.OFFLINE_MODE_THRESHOLD).toBeDefined();
    expect(contract.VALIDATION_FAILURE_WEIGHT).toBeDefined();
    expect(contract.MAX_TELEMETRY_BUFFER).toBeDefined();
    expect(contract.MAX_MODE_TRANSITIONS).toBeDefined();
    expect(contract.LATENCY_TIMEOUT_THRESHOLD).toBeDefined();
    // Functions
    expect(contract.computeCapabilityHash).toBeDefined();
    expect(contract.computeModuleChainHash).toBeDefined();
    expect(contract.generateExecutionId).toBeDefined();
    expect(contract.buildIntegrityPayload).toBeDefined();
    expect(contract.validateIntegrityPayload).toBeDefined();
    expect(contract.buildNormalizedEnvelope).toBeDefined();
  });

  it('bridge-adapter exports shared utilities and health tracker', async () => {
    const adapter = await import('../bridge-adapter');
    expect(adapter.moduleOps).toBeDefined();
    expect(adapter.generateBridgeHeader).toBeDefined();
    expect(adapter.buildStageTable).toBeDefined();
    expect(adapter.classifyBridge).toBeDefined();
    expect(adapter.buildOutboundIntegrity).toBeDefined();
    expect(adapter.generateIntegritySnippet).toBeDefined();
    expect(adapter.generateDegradedResultShape).toBeDefined();
    expect(adapter.RuntimeHealthTracker).toBeDefined();
    expect(adapter.normalizeLegacyResult).toBeDefined();
    
    expect(adapter.classifyBridge('typescript', 'substrate')).toBe('network');
    expect(adapter.classifyBridge('php', 'portable')).toBe('hybrid');
    expect(adapter.classifyBridge('rust', 'sealed')).toBe('offline-fallback');
  });

  // ── §3 — Hashing: deterministic and stable ──

  it('capability hash is deterministic and stable', async () => {
    const { computeCapabilityHash } = await import('../canonical-runtime-contract');
    const h1 = computeCapabilityHash('TestPipeline', ['BRAIN', 'MEMORY'], 'cognitive');
    const h2 = computeCapabilityHash('TestPipeline', ['BRAIN', 'MEMORY'], 'cognitive');
    expect(h1).toBe(h2);
    expect(h1.length).toBe(8);
    // Different input → different hash
    const h3 = computeCapabilityHash('OtherPipeline', ['BRAIN'], 'cognitive');
    expect(h3).not.toBe(h1);
  });

  it('module chain hash is independent of capability hash', async () => {
    const { computeCapabilityHash, computeModuleChainHash } = await import('../canonical-runtime-contract');
    const capHash = computeCapabilityHash('Test', ['BRAIN', 'MEMORY'], 'cognitive');
    const chainHash = computeModuleChainHash(['BRAIN', 'MEMORY']);
    expect(capHash).not.toBe(chainHash);
    // Chain hash is deterministic
    expect(computeModuleChainHash(['BRAIN', 'MEMORY'])).toBe(chainHash);
    // Different chain → different hash
    expect(computeModuleChainHash(['CORTEX'])).not.toBe(chainHash);
  });

  it('execution ID is unique per call', async () => {
    const { generateExecutionId } = await import('../canonical-runtime-contract');
    const id1 = generateExecutionId();
    const id2 = generateExecutionId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^exec_/);
  });

  // ── §4 — Integrity validation ──

  it('integrity validation accepts matching payloads', async () => {
    const { buildIntegrityPayload, validateIntegrityPayload } = await import('../canonical-runtime-contract');
    const payload = buildIntegrityPayload('Test', ['BRAIN'], 'cognitive', 85, 'hybrid', 'hybrid');
    const result = validateIntegrityPayload(payload, 'Test', ['BRAIN'], 'cognitive');
    expect(result.validated).toBe(true);
    expect(result.validationErrors).toHaveLength(0);
    expect(result.executionId).toMatch(/^exec_/);
    expect(result.recomputedCapabilityHash).toBe(payload.capabilityHash);
    expect(result.recomputedModuleChainHash).toBe(payload.moduleChainHash);
  });

  it('integrity validation rejects capability hash mismatch', async () => {
    const { buildIntegrityPayload, validateIntegrityPayload } = await import('../canonical-runtime-contract');
    const payload = buildIntegrityPayload('Test', ['BRAIN'], 'cognitive', 85, 'hybrid', 'hybrid');
    const result = validateIntegrityPayload(payload, 'Tampered', ['CORTEX'], 'security');
    expect(result.validated).toBe(false);
    expect(result.validationErrors.length).toBeGreaterThan(0);
    expect(result.validationErrors.some(e => e.includes('hash mismatch'))).toBe(true);
  });

  it('integrity validation rejects module chain tampering independently', async () => {
    const { computeCapabilityHash, computeModuleChainHash, validateIntegrityPayload } = await import('../canonical-runtime-contract');
    // Forge a payload with correct capability hash but wrong module chain hash
    const payload = {
      canonicalVersion: (await import('../canonical-runtime-contract')).CANONICAL_RUNTIME_VERSION,
      bridgeType: 'hybrid' as const,
      runtimeType: 'portable' as const,
      executionMode: 'hybrid' as const,
      capabilityHash: computeCapabilityHash('Test', ['BRAIN'], 'cognitive'),
      moduleChainHash: computeModuleChainHash(['CORTEX', 'DEFENSE']), // tampered
      expectedCJPI: 85,
    };
    const result = validateIntegrityPayload(payload, 'Test', ['BRAIN'], 'cognitive');
    expect(result.validated).toBe(false);
    expect(result.validationErrors.some(e => e.includes('Module chain hash mismatch'))).toBe(true);
  });

  it('integrity validation warns on minor version mismatch', async () => {
    const { computeCapabilityHash, computeModuleChainHash, CANONICAL_RUNTIME_VERSION, validateIntegrityPayload: validateFn } = await import('../canonical-runtime-contract');
    const [major, minor] = CANONICAL_RUNTIME_VERSION.split('.');
    const minorBumped = `${major}.${parseInt(minor) - 1}.0`;
    const payload = {
      canonicalVersion: minorBumped,
      bridgeType: 'hybrid' as const,
      runtimeType: 'portable' as const,
      executionMode: 'hybrid' as const,
      capabilityHash: computeCapabilityHash('Test', ['BRAIN'], 'cognitive'),
      moduleChainHash: computeModuleChainHash(['BRAIN']),
      expectedCJPI: 85,
    };
    const result = validateFn(payload, 'Test', ['BRAIN'], 'cognitive');
    // Minor mismatch → warning, not error
    expect(result.validated).toBe(true);
    expect(result.validationWarnings.length).toBeGreaterThan(0);
    expect(result.validationWarnings[0]).toContain('Minor version mismatch');
  });

  // ── §5 — Bridge manifest integrity ──

  it('bridge manifest includes full integrity contract with moduleChainHash', async () => {
    const { generateBridgeManifest } = await import('../bridge-adapter');
    const manifest = JSON.parse(generateBridgeManifest(ctx, 'php', 'hybrid'));
    expect(manifest.integrityContract).toBeDefined();
    expect(manifest.integrityContract.canonicalVersion).toBeDefined();
    expect(manifest.integrityContract.capabilityHash).toBeDefined();
    expect(manifest.integrityContract.moduleChainHash).toBeDefined();
    expect(manifest.integrityContract.expectedCJPI).toBe(85);
    expect(manifest.integrityContract.bridgeType).toBe('hybrid');
    expect(manifest.capabilityHash).toBe(manifest.integrityContract.capabilityHash);
    expect(manifest.moduleChainHash).toBe(manifest.integrityContract.moduleChainHash);
  });

  it('result shape includes all integrity and health fields', async () => {
    const { getResultShape } = await import('../bridge-adapter');
    const shape = getResultShape();
    expect(shape).toContain('validated: boolean');
    expect(shape).toContain('validationErrors: string[]');
    expect(shape).toContain('validationWarnings: string[]');
    expect(shape).toContain('degraded: boolean');
    expect(shape).toContain('degradedReasons: string[]');
    expect(shape).toContain('executionId: string');
    expect(shape).toContain('envelope: ExecutionEnvelopeMetadata');
  });

  // ── §6 — Health scoring ──

  it('health tracker starts at neutral score', async () => {
    const { RuntimeHealthTracker } = await import('../bridge-adapter');
    const tracker = new RuntimeHealthTracker();
    expect(tracker.getHealthScore()).toBe(50);
    expect(tracker.getRuntimeMode()).toBe('hybrid');
  });

  it('health score improves with consecutive successes', async () => {
    const { RuntimeHealthTracker } = await import('../bridge-adapter');
    const tracker = new RuntimeHealthTracker();
    for (let i = 0; i < 10; i++) tracker.recordRemoteSuccess(100);
    expect(tracker.getHealthScore()).toBeGreaterThan(70);
  });

  it('health score degrades with failures', async () => {
    const { RuntimeHealthTracker } = await import('../bridge-adapter');
    const tracker = new RuntimeHealthTracker();
    for (let i = 0; i < 3; i++) tracker.recordRemoteSuccess(100);
    const scoreBefore = tracker.getHealthScore();
    for (let i = 0; i < 3; i++) tracker.recordRemoteFailure();
    expect(tracker.getHealthScore()).toBeLessThan(scoreBefore);
  });

  it('validation failures degrade score more than transport failures', async () => {
    const { RuntimeHealthTracker } = await import('../bridge-adapter');
    const t1 = new RuntimeHealthTracker();
    const t2 = new RuntimeHealthTracker();
    // Give both a baseline
    for (let i = 0; i < 5; i++) { t1.recordRemoteSuccess(100); t2.recordRemoteSuccess(100); }
    // t1 gets transport failure, t2 gets validation failure
    t1.recordRemoteFailure();
    t2.recordValidationFailure();
    expect(t2.getHealthScore()).toBeLessThanOrEqual(t1.getHealthScore());
  });

  // ── §7 — Automatic mode switching ──

  it('promotes to network after consecutive successes', async () => {
    const { RuntimeHealthTracker } = await import('../bridge-adapter');
    const { NETWORK_MODE_THRESHOLD } = await import('../canonical-runtime-contract');
    const tracker = new RuntimeHealthTracker();
    expect(tracker.getRuntimeMode()).toBe('hybrid');
    for (let i = 0; i < NETWORK_MODE_THRESHOLD; i++) tracker.recordRemoteSuccess(100);
    expect(tracker.getRuntimeMode()).toBe('network');
  });

  it('demotes to offline after consecutive failures', async () => {
    const { RuntimeHealthTracker, OFFLINE_MODE_THRESHOLD } = await import('../bridge-adapter');
    const tracker = new RuntimeHealthTracker();
    for (let i = 0; i < OFFLINE_MODE_THRESHOLD; i++) tracker.recordRemoteFailure();
    expect(tracker.getRuntimeMode()).toBe('offline');
  });

  it('demotes from network to hybrid on single failure', async () => {
    const { RuntimeHealthTracker, NETWORK_MODE_THRESHOLD } = await import('../bridge-adapter');
    const tracker = new RuntimeHealthTracker();
    for (let i = 0; i < NETWORK_MODE_THRESHOLD; i++) tracker.recordRemoteSuccess(100);
    expect(tracker.getRuntimeMode()).toBe('network');
    tracker.recordRemoteFailure();
    expect(tracker.getRuntimeMode()).toBe('hybrid');
  });

  it('validation failure demotes faster than transport', async () => {
    const { RuntimeHealthTracker } = await import('../bridge-adapter');
    const tracker = new RuntimeHealthTracker();
    // Single validation failure should push consecutive failures by VALIDATION_FAILURE_WEIGHT
    tracker.recordValidationFailure();
    // With weight=2, one validation failure = 2 consecutive failures
    const snap = tracker.getHealthSnapshot();
    expect(snap.consecutiveFailures).toBe(2);
  });

  it('mode transitions are recorded and inspectable', async () => {
    const { RuntimeHealthTracker, NETWORK_MODE_THRESHOLD, OFFLINE_MODE_THRESHOLD } = await import('../bridge-adapter');
    const tracker = new RuntimeHealthTracker();
    for (let i = 0; i < NETWORK_MODE_THRESHOLD; i++) tracker.recordRemoteSuccess(100);
    for (let i = 0; i < OFFLINE_MODE_THRESHOLD; i++) tracker.recordRemoteFailure();
    const snap = tracker.getHealthSnapshot();
    expect(snap.modeTransitions.length).toBeGreaterThanOrEqual(2);
    expect(snap.modeTransitions[0].from).toBe('hybrid');
    expect(snap.modeTransitions[0].to).toBe('network');
  });

  it('forceMode overrides automatic switching', async () => {
    const { RuntimeHealthTracker } = await import('../bridge-adapter');
    const tracker = new RuntimeHealthTracker();
    tracker.forceMode('offline');
    expect(tracker.getRuntimeMode()).toBe('offline');
    expect(tracker.getHealthSnapshot().modeForced).toBe(true);
    // Clear force
    tracker.forceMode(null);
    expect(tracker.getHealthSnapshot().modeForced).toBe(false);
  });

  it('resetHealthState clears everything', async () => {
    const { RuntimeHealthTracker, NETWORK_MODE_THRESHOLD } = await import('../bridge-adapter');
    const tracker = new RuntimeHealthTracker();
    for (let i = 0; i < NETWORK_MODE_THRESHOLD; i++) tracker.recordRemoteSuccess(100);
    tracker.resetHealthState();
    expect(tracker.getHealthScore()).toBe(50);
    expect(tracker.getRuntimeMode()).toBe('hybrid');
    expect(tracker.getHealthSnapshot().modeTransitions).toHaveLength(0);
  });

  // ── §8 — Degraded result shape ──

  it('degraded result shape includes trust and fallback reason', async () => {
    const { generateDegradedResultShape } = await import('../bridge-adapter');
    const shape = generateDegradedResultShape();
    expect(shape.some(s => s.includes('trustLevel'))).toBe(true);
    expect(shape.some(s => s.includes('fallbackReason'))).toBe(true);
    expect(shape.some(s => s.includes('degradedReasons'))).toBe(true);
  });

  // ── §9 — Backward compatibility ──

  it('normalizeLegacyResult fills missing integrity fields with warnings', async () => {
    const { normalizeLegacyResult } = await import('../bridge-adapter');
    const legacy = { success: true, data: { key: 'value' }, confidence: 0.9 };
    const normalized = normalizeLegacyResult(legacy);
    expect(normalized.validated).toBe(false);
    expect(normalized.degraded).toBe(false);
    expect(normalized.executionId).toMatch(/^exec_/);
    expect((normalized.validationWarnings as string[]).length).toBeGreaterThan(0);
    expect((normalized.degradedReasons as string[])[0]).toContain('Legacy');
  });

  // ── §10 — Envelope construction ──

  it('normalized envelope wraps result with full metadata', async () => {
    const { buildIntegrityPayload, validateIntegrityPayload, buildNormalizedEnvelope } = await import('../canonical-runtime-contract');
    const payload = buildIntegrityPayload('Test', ['BRAIN'], 'cognitive', 85, 'hybrid', 'hybrid');
    const validation = validateIntegrityPayload(payload, 'Test', ['BRAIN'], 'cognitive');
    const envelope = buildNormalizedEnvelope({ output: 'test' }, validation, 'hybrid', 42);
    expect(envelope.executionId).toMatch(/^exec_/);
    expect(envelope.validation.validated).toBe(true);
    expect(envelope.degraded).toBe(false);
    expect(envelope.totalDurationMs).toBe(42);
    expect(envelope.canonicalVersion).toBeDefined();
    expect(envelope.capabilityHash).toBe(payload.capabilityHash);
  });
});
