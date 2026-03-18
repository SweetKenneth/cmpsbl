/**
 * CMPSBL® Anti-Drift Architecture Tests
 * Validates: one canonical runtime, all others are bridges.
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
    const ctx = {
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
      const code = gen(ctx);
      expect(code).toContain('bridge');
      expect(code).not.toContain('Fully synthesized pipeline');
      expect(code).not.toContain('Full Synthesizer');
    }
  });

  it('canonical-runtime-contract exports required types', async () => {
    const contract = await import('../canonical-runtime-contract');
    expect(contract.CANONICAL_RUNTIME_VERSION).toBeDefined();
    expect(contract.CANONICAL_ENDPOINT).toBeDefined();
    expect(contract.CANONICAL_ONLY_CONCERNS).toBeDefined();
    expect(contract.BRIDGE_ALLOWED_CONCERNS).toBeDefined();
    expect(contract.computeCapabilityHash).toBeDefined();
    expect(contract.buildIntegrityPayload).toBeDefined();
    expect(contract.validateIntegrityPayload).toBeDefined();
  });

  it('bridge-adapter exports shared utilities', async () => {
    const adapter = await import('../bridge-adapter');
    expect(adapter.moduleOps).toBeDefined();
    expect(adapter.generateBridgeHeader).toBeDefined();
    expect(adapter.buildStageTable).toBeDefined();
    expect(adapter.classifyBridge).toBeDefined();
    expect(adapter.buildOutboundIntegrity).toBeDefined();
    expect(adapter.generateIntegritySnippet).toBeDefined();
    
    expect(adapter.classifyBridge('typescript', 'substrate')).toBe('network');
    expect(adapter.classifyBridge('php', 'portable')).toBe('hybrid');
    expect(adapter.classifyBridge('rust', 'sealed')).toBe('offline-fallback');
  });

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

  it('integrity validation accepts matching payloads', async () => {
    const { buildIntegrityPayload, validateIntegrityPayload } = await import('../canonical-runtime-contract');
    const payload = buildIntegrityPayload('Test', ['BRAIN'], 'cognitive', 85, 'hybrid', 'hybrid');
    const result = validateIntegrityPayload(payload, 'Test', ['BRAIN'], 'cognitive');
    expect(result.validated).toBe(true);
    expect(result.validationErrors).toHaveLength(0);
  });

  it('integrity validation rejects hash mismatch', async () => {
    const { buildIntegrityPayload, validateIntegrityPayload } = await import('../canonical-runtime-contract');
    const payload = buildIntegrityPayload('Test', ['BRAIN'], 'cognitive', 85, 'hybrid', 'hybrid');
    // Validate against different capability identity → hash mismatch
    const result = validateIntegrityPayload(payload, 'Tampered', ['CORTEX'], 'security');
    expect(result.validated).toBe(false);
    expect(result.validationErrors.length).toBeGreaterThan(0);
    expect(result.validationErrors[0]).toContain('hash mismatch');
  });

  it('bridge manifest includes integrity contract', async () => {
    const { generateBridgeManifest } = await import('../bridge-adapter');
    const manifest = JSON.parse(generateBridgeManifest(ctx, 'php', 'hybrid'));
    expect(manifest.integrityContract).toBeDefined();
    expect(manifest.integrityContract.canonicalVersion).toBeDefined();
    expect(manifest.integrityContract.capabilityHash).toBeDefined();
    expect(manifest.integrityContract.expectedCJPI).toBe(85);
    expect(manifest.integrityContract.bridgeType).toBe('hybrid');
    expect(manifest.capabilityHash).toBe(manifest.integrityContract.capabilityHash);
  });

  it('result shape includes integrity fields', async () => {
    const { getResultShape } = await import('../bridge-adapter');
    const shape = getResultShape();
    expect(shape).toContain('validated: boolean');
    expect(shape).toContain('validationErrors: string[]');
    expect(shape).toContain('degraded: boolean | undefined');
  });
});
