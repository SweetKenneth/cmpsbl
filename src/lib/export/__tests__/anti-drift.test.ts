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
  it('software-synthesizer should not contain CJPI weights', async () => {
    const mod = await import('../software-synthesizer');
    // Generate a sample bridge
    const ctx = {
      name: 'TestPipeline', description: 'test', category: 'cognitive',
      moduleChain: ['BRAIN', 'MEMORY'], entryCapability: 'analyze',
      exitCapability: 'persist', errorStrategy: 'retry', maxExecutionMs: 5000, cjpi: 85,
    };
    
    const rustCode = mod.synthesizeRust(ctx);
    const javaCode = mod.synthesizeJava(ctx);
    const phpCode = mod.synthesizePHP(ctx);
    
    for (const code of [rustCode, javaCode, phpCode]) {
      for (const pattern of CANONICAL_ONLY_PATTERNS) {
        expect(code).not.toMatch(pattern);
      }
      // Must identify as bridge
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
  });

  it('bridge-adapter exports shared utilities', async () => {
    const adapter = await import('../bridge-adapter');
    expect(adapter.moduleOps).toBeDefined();
    expect(adapter.generateBridgeHeader).toBeDefined();
    expect(adapter.buildStageTable).toBeDefined();
    expect(adapter.classifyBridge).toBeDefined();
    
    expect(adapter.classifyBridge('typescript', 'substrate')).toBe('network');
    expect(adapter.classifyBridge('php', 'portable')).toBe('hybrid');
    expect(adapter.classifyBridge('rust', 'sealed')).toBe('offline-fallback');
  });
});
