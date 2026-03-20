/**
 * CMPSBL® Ascension Pipeline — E2E Test Suite
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Full pipeline coverage: extract → quality → dedup → inject → effect → delta
 *
 * © CMPSBL® — All rights reserved.
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ── Core pipeline modules ──
import { extractPrimitives } from '../primitive-extractor';
import { runQualityGate, scorePrimitive, DEFAULT_QUALITY_CONFIG } from '../quality-gate';
import { deduplicatePrimitives } from '../deduplication';
import { postProcessPrimitives, normalizeName } from '../language-postprocessor';
import { captureSnapshot, compareDelta, buildDeltaReport } from '../delta-measurement';

// ── Effect injection v2 ──
import {
  detectPrimaryUnit,
  effectWrapper,
  autoMapModuleName,
  generateDefaultChain,
  ensureChain,
  applyEffectInjection,
  enrichExtractionWithEffects,
  generateEffectSummary,
} from '../effect-injection';

// ── Execution binding ──
import {
  resolveExecutionStrategy,
  buildExecutableUnit,
  bindAndExecute,
} from '../execution-binding';

// ── Chain injection ──
import {
  buildNodeEffect,
  injectNodeIntoChain,
  registerNodeEffect,
  getNodeEffect,
  clearNodeEffects,
  getRegisteredNodeCount,
} from '../chain-injection';

// ── Primitive registry & learning ──
import { registerPrimitive, clearPrimitives, getPrimitive, getPrimitiveCount } from '../primitive-registry';
import { registerDefaults } from '../primitive-defaults';
import { recordPrimitiveOutcome, isPrimitiveReliable, clearLearningState, getPrimitiveLearningStats } from '../primitive-learning';
import { governorInjectPrimitive, governorDisablePrimitive, governorRemovePrimitive, governorGetPrimitiveSummary } from '../primitive-governor';

// ── Types ──
import type { ExtractedPrimitive, AscensionNode, ExtractionResult, ExtractionStats, QualitySummary } from '../types';
import { buildAscensionModuleName, isAscensionModule, generateCorrelationId, migrateMetadata, ASCENSION_PREFIX } from '../types';
import type { PipelineContext } from '@/lib/export/module-effects';

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function makePrimitive(overrides: Partial<ExtractedPrimitive> = {}): ExtractedPrimitive {
  return {
    id: `prim_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`,
    name: 'TestHandler',
    canonicalName: 'test_handler',
    category: 'execution',
    inputs: ['data'],
    outputs: ['result'],
    confidence: 0.85,
    qualityScore: 0.7,
    sourceSnippet: 'function TestHandler(data) { return process(data); }',
    language: 'typescript',
    extractionMethod: 'function',
    extractionTrust: 'high',
    keywords: ['process', 'return'],
    complexity: 3,
    ...overrides,
  };
}

function makeNode(overrides: Partial<AscensionNode> = {}): AscensionNode {
  return {
    id: 'node-test-1',
    name: 'TestNode',
    source: 'test.ts',
    primitives: [makePrimitive()],
    status: 'active',
    mode: 'persistent',
    runLimit: null,
    totalRuns: 0,
    surface: { nodeName: 'TEST_NODE', capabilities: ['exec'], sector: 'compute', domain: 'test' },
    language: 'typescript',
    performance: { avgCjpi: 72, bestCjpi: 85, chainsParticipated: 3, lastUsed: null },
    extractionStats: null,
    qualitySummary: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'u1',
    schemaVersion: 2,
    ...overrides,
  };
}

function makeCtx(overrides: Partial<PipelineContext> = {}): PipelineContext {
  return {
    data: { input: 'test-payload' },
    confidence: 0.9,
    annotations: {},
    transformationNotes: [],
    stageIndex: 0,
    trace: [],
    recoveries: [],
    originalInput: { input: 'test-payload' },
    chainId: 'test-chain-1',
    chainModules: ['CORE', 'BRAIN'],
    ...overrides,
  } as PipelineContext;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — EXTRACTION PIPELINE
// ═══════════════════════════════════════════════════════════════════════════════

describe('E2E: Extraction Pipeline', () => {
  it('extracts primitives from TypeScript source', () => {
    const result = extractPrimitives([{
      name: 'analyzer.ts',
      content: `
        export function analyzeData(input: string[]): number {
          return input.length * 2;
        }
        export class DataProcessor {
          transform(data: Record<string, unknown>) {
            return { ...data, processed: true };
          }
        }
        const validateInput = (x: unknown): boolean => typeof x === 'string';
      `,
      language: 'typescript',
    }]);

    expect(result.primitives.length).toBeGreaterThanOrEqual(2);
    expect(result.quality.accepted.length).toBeGreaterThan(0);
    expect(result.correlationId).toMatch(/^asc_/);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('extracts primitives from PHP source', () => {
    const result = extractPrimitives([{
      name: 'TradeMatcher.php',
      content: `<?php
        class TradeMatcher {
          public function matchTrades(array $orders): array {
            return array_filter($orders, fn($o) => $o['active']);
          }
          private function calculateSpread(float $bid, float $ask): float {
            return $ask - $bid;
          }
        }
      `,
      language: 'php',
    }]);

    expect(result.primitives.length).toBeGreaterThanOrEqual(1);
    const names = result.primitives.map(p => p.name);
    expect(names.some(n => n === 'TradeMatcher' || n === 'matchTrades' || n === 'calculateSpread')).toBe(true);
  });

  it('extracts primitives from Rust source', () => {
    const result = extractPrimitives([{
      name: 'engine.rs',
      content: `
        pub struct MatchEngine {
          orders: Vec<Order>,
        }
        pub fn process_order(order: &Order) -> Result<Trade, Error> {
          Ok(Trade::new())
        }
        pub trait OrderBook {
          fn add_order(&mut self, order: Order);
        }
      `,
      language: 'rust',
    }]);

    expect(result.primitives.length).toBeGreaterThanOrEqual(1);
  });

  it('extracts primitives from Verilog (HDL)', () => {
    const result = extractPrimitives([{
      name: 'alu.v',
      content: `
        module arithmetic_logic_unit(
          input [7:0] a_in,
          input [7:0] b_in,
          input [1:0] op_sel,
          output reg [7:0] result_out
        );
          task compute_add;
            begin
              result_out = a_in + b_in;
            end
          endtask
        endmodule
      `,
      language: 'verilog',
    }]);

    expect(result.primitives.length).toBeGreaterThanOrEqual(1);
    expect(result.primitives.some(p => p.extractionMethod === 'module')).toBe(true);
  });

  it('extracts from Python source', () => {
    const result = extractPrimitives([{
      name: 'ml_pipeline.py',
      content: `
class FeatureExtractor:
    def extract_features(self, data: list) -> dict:
        return {"features": len(data)}

def train_model(features: dict, labels: list) -> object:
    return {"weights": [0.5] * len(labels)}

def predict_outcome(model, sample):
    return model.get("weights", [0])[0] * sample
      `,
      language: 'python',
    }]);

    expect(result.primitives.length).toBeGreaterThanOrEqual(2);
  });

  it('handles empty input gracefully', () => {
    const result = extractPrimitives([]);
    expect(result.primitives).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('handles malformed file content', () => {
    const result = extractPrimitives([
      { name: 'empty.ts', content: '', language: 'typescript' },
      { name: 'tiny.ts', content: 'x', language: 'typescript' },
    ]);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — QUALITY GATE
// ═══════════════════════════════════════════════════════════════════════════════

describe('E2E: Quality Gate', () => {
  it('accepts high-quality primitives', () => {
    const prim = makePrimitive({
      name: 'calculateRiskScore',
      confidence: 0.9,
      complexity: 5,
      keywords: ['calculate', 'risk', 'score', 'evaluate'],
      inputs: ['portfolio', 'weights'],
    });
    const score = scorePrimitive(prim);
    expect(score).toBeGreaterThan(DEFAULT_QUALITY_CONFIG.minQualityScore);
  });

  it('rejects boilerplate with insufficient signals', () => {
    const prim = makePrimitive({
      name: 'ngOnInit',
      confidence: 0.5,
      complexity: 1,
      keywords: [],
      inputs: [],
    });
    const report = runQualityGate([prim]);
    expect(report.rejected.length).toBe(1);
    expect(report.accepted.length).toBe(0);
  });

  it('respects maxPrimitivesPerNode cap', () => {
    const prims = Array.from({ length: 100 }, (_, i) =>
      makePrimitive({ id: `p${i}`, name: `handler_${i}_compute`, confidence: 0.8, complexity: 4, keywords: ['compute'] })
    );
    const report = runQualityGate(prims, { ...DEFAULT_QUALITY_CONFIG, maxPrimitivesPerNode: 10 });
    expect(report.accepted.length).toBeLessThanOrEqual(10);
    expect(report.rejected.some(r => r.reason.includes('max primitives'))).toBe(true);
  });

  it('summary aggregation is accurate', () => {
    const prims = [
      makePrimitive({ name: 'analyzeData', category: 'analysis', confidence: 0.9, complexity: 5, keywords: ['analyze'] }),
      makePrimitive({ name: 'transformOutput', category: 'transformation', confidence: 0.85, complexity: 3, keywords: ['transform'] }),
    ];
    const report = runQualityGate(prims);
    expect(report.summary.totalExtracted).toBe(2);
    expect(report.summary.totalAccepted + report.summary.totalRejected).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — DEDUPLICATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('E2E: Deduplication', () => {
  it('merges exact canonical name matches', () => {
    const prims = [
      makePrimitive({ name: 'processOrder', canonicalName: 'process_order', qualityScore: 0.8 }),
      makePrimitive({ name: 'process_order', canonicalName: 'process_order', qualityScore: 0.6 }),
    ];
    const result = deduplicatePrimitives(prims);
    expect(result.canonical.length).toBe(1);
    expect(result.mergedCount).toBe(1);
  });

  it('does not merge semantically different primitives', () => {
    const prims = [
      makePrimitive({ name: 'analyzeRisk', canonicalName: 'analyze_risk', category: 'analysis' }),
      makePrimitive({ name: 'sendEmail', canonicalName: 'send_email', category: 'communication' }),
    ];
    const result = deduplicatePrimitives(prims);
    expect(result.canonical.length).toBe(2);
    expect(result.mergedCount).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — LANGUAGE POST-PROCESSING
// ═══════════════════════════════════════════════════════════════════════════════

describe('E2E: Language Post-Processing', () => {
  it('normalizes names consistently', () => {
    expect(normalizeName('calculateRiskScore')).toBe('calculate_risk_score');
    expect(normalizeName('__init__')).toBe('init');
    expect(normalizeName('HTTPResponseHandler')).toBe('http_response_handler');
  });

  it('downgrades trust for Python dunder methods', () => {
    const prims = [makePrimitive({ name: '__init__', language: 'python' })];
    const processed = postProcessPrimitives(prims, 'module.py');
    expect(processed[0].extractionTrust).toBe('heuristic');
    expect(processed[0].confidence).toBeLessThan(0.85);
  });

  it('downgrades trust for test file primitives', () => {
    const prims = [makePrimitive({ name: 'analyzeData' })];
    const processed = postProcessPrimitives(prims, 'analyzer.test.ts');
    expect(processed[0].extractionTrust).toBe('heuristic');
  });

  it('upgrades trust for high-signal named functions', () => {
    const prims = [makePrimitive({ 
      name: 'calculatePortfolioRisk',
      inputs: ['portfolio', 'weights'],
      category: 'analysis',
    })];
    const processed = postProcessPrimitives(prims, 'risk.ts');
    expect(processed[0].extractionTrust).toBe('high');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — CANONICAL NAMING & TYPES
// ═══════════════════════════════════════════════════════════════════════════════

describe('E2E: Canonical Naming', () => {
  it('builds collision-safe module names', () => {
    const name = buildAscensionModuleName('TradeMatcher');
    expect(name).toBe(`${ASCENSION_PREFIX}_TRADEMATCHER`);
    expect(isAscensionModule(name)).toBe(true);
  });

  it('guards against reserved name collisions', () => {
    const name = buildAscensionModuleName('CORE');
    expect(name).toBe(`${ASCENSION_PREFIX}_X_CORE`);
    expect(isAscensionModule(name)).toBe(true);
  });

  it('generates unique correlation IDs', () => {
    const a = generateCorrelationId();
    const b = generateCorrelationId();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^asc_/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — METADATA MIGRATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('E2E: Metadata Migration', () => {
  it('migrates v1 flat metadata to v2 structured', () => {
    const v1 = {
      schema_version: 1,
      node_name: 'TestNode',
      language: 'typescript',
      source_files: [{ name: 'test.ts', content: 'code', language: 'typescript' }],
      primitives: [makePrimitive()],
    };
    const v2 = migrateMetadata(v1);
    expect(v2.schema_version).toBe(2);
    expect(v2.identity.node_name).toBe('TestNode');
    expect(v2.extraction.primitives.length).toBe(1);
    expect(v2.provenance.upload_file_names).toContain('test.ts');
  });

  it('is idempotent on v2 data', () => {
    const v2 = migrateMetadata({
      schema_version: 2,
      identity: { node_name: 'X', language: 'ts', source_files: [], derived_surface: null },
      extraction: { primitives: [], stats: null, quality_summary: null, warnings: [], last_extraction_at: null, extraction_count: 0 },
      lifecycle: { node_status: 'active', node_mode: 'persistent', run_limit: null, total_runs: 0, promoted_at: null, archived_at: null },
      performance: { avg_cjpi: 0, best_cjpi: 0, chains_participated: 0, last_used: null, delta_history: [] },
      learning: { brain_events_sent: 0, last_learning_event: null, primitive_success_map: {} },
      provenance: { ingested_at: '', correlation_id: '', upload_file_names: [], total_source_bytes: 0 },
    });
    expect(v2.identity.node_name).toBe('X');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — EFFECT INJECTION v2
// ═══════════════════════════════════════════════════════════════════════════════

describe('E2E: Effect Injection v2', () => {
  beforeEach(() => { clearPrimitives(); clearNodeEffects(); });

  it('detects primary unit with correct priority ordering', () => {
    const prims = [
      makePrimitive({ name: 'helperFunc', extractionMethod: 'function', confidence: 0.7 }),
      makePrimitive({ name: 'TradeMatcher', extractionMethod: 'class', confidence: 0.9 }),
    ];
    // Should pick class matching filename over generic function
    const unit = detectPrimaryUnit(prims, 'TradeMatcher.php', 'php');
    expect(unit!.name).toBe('TradeMatcher');
  });

  it('autoMapModuleName converts filename to uppercase', () => {
    expect(autoMapModuleName('TradeMatcher.php')).toBe('TRADEMATCHER');
    expect(autoMapModuleName('my_analysis_tool.py')).toBe('MY_ANALYSIS_TOOL');
    expect(autoMapModuleName('')).toBe('UPLOADED');
  });

  it('generateDefaultChain places primary first', () => {
    const chain = generateDefaultChain('MY_MODULE');
    expect(chain[0]).toBe('MY_MODULE');
    expect(chain.length).toBe(5);
    expect(chain).toContain('BRAIN');
  });

  it('ensureChain prepends module to existing chain', () => {
    const node = makeNode();
    const chain = ensureChain(['CORE', 'BRAIN'], node);
    expect(isAscensionModule(chain[0])).toBe(true);
  });

  it('ensureChain generates default chain when none exists', () => {
    const node = makeNode();
    const chain = ensureChain(null, node);
    expect(chain.length).toBeGreaterThanOrEqual(2);
    expect(isAscensionModule(chain[0])).toBe(true);
  });

  it('applyEffectInjection adds effect record + annotations + trace + summary + score', () => {
    const node = makeNode();
    const ctx = makeCtx();
    const result = applyEffectInjection(ctx, node);

    // Effect record exists
    const effectKey = Object.keys(result.data).find(k => k.startsWith('_effect_Ψ'));
    expect(effectKey).toBeTruthy();
    const effect = result.data[effectKey!] as Record<string, unknown>;
    expect(typeof effect.executed).toBe('boolean');
    expect(typeof effect.degraded).toBe('boolean');
    expect(effect.execution_strategy).toBeDefined();

    // Summary exists
    const summaryKey = Object.keys(result.data).find(k => k.startsWith('_effect_summary_'));
    expect(summaryKey).toBeTruthy();
    const summary = result.data[summaryKey!] as Record<string, unknown>;
    expect(['executed', 'fallback', 'degraded']).toContain(summary.status);

    // Score exists
    const scoreKey = Object.keys(result.data).find(k => k.startsWith('_effect_score_'));
    expect(scoreKey).toBeTruthy();
    const score = result.data[scoreKey!] as number;
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);

    // Annotations
    expect(result.annotations[`effect.${node.id}.primary`]).toBeDefined();
    expect(result.annotations[`effect.${node.id}.strategy`]).toBeDefined();
    expect(typeof result.annotations[`effect.${node.id}.executed`]).toBe('boolean');
    expect(typeof result.annotations[`effect.${node.id}.score`]).toBe('number');

    // Trace entry
    expect(result.trace.length).toBeGreaterThan(0);
    const traceEntry = result.trace[result.trace.length - 1];
    expect(traceEntry.effect).toContain('effect-injection-v2');

    // Transformation note
    expect(result.transformationNotes.some(n => n.startsWith('[EFFECT]'))).toBe(true);
  });

  it('applyEffectInjection handles no-primitives node as honest fallback', () => {
    const node = makeNode({ primitives: [] });
    const ctx = makeCtx();
    const result = applyEffectInjection(ctx, node);

    const effectKey = Object.keys(result.data).find(k => k.startsWith('_effect_Ψ'));
    const effect = result.data[effectKey!] as Record<string, unknown>;
    expect(effect.executed).toBe(false);
    expect(effect.execution_strategy).toBe('fallback');
    expect(effect.degraded).toBe(false);
  });

  it('demo mode produces concise transformation notes', () => {
    const node = makeNode();
    const ctx = makeCtx();
    ctx.annotations['demo'] = true;
    const result = applyEffectInjection(ctx, node);

    const demoNotes = result.transformationNotes.filter(n => n.startsWith('[EFFECT]'));
    expect(demoNotes.length).toBe(1);
    // Demo notes should be short and readable
    expect(demoNotes[0].length).toBeLessThan(100);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §8 — EFFECT SUMMARY GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('E2E: Effect Summary (Visibility Patch)', () => {
  beforeEach(() => clearPrimitives());

  it('generates executed summary for healthy binding', () => {
    registerPrimitive({ id: 'p-test', name: 'testFunc', source: 'native', handler: () => ({ ok: true }) });
    const unit = buildExecutableUnit(
      { name: 'testFunc', category: 'execution', confidence: 0.9, complexity: 3, extractionMethod: 'function' },
      'typescript'
    );
    const binding = bindAndExecute(unit, { test: 1 });
    const summary = generateEffectSummary(binding, 'Ψ₄₁_TESTFUNC');

    expect(summary.status).toBe('executed');
    expect(summary.badge).toBe('✅ Healthy');
    expect(summary.score).toBe(1); // 0.6 + 0.4
    expect(summary.shortSummary).toContain('executed via local');
    expect(summary.uiContract.module).toBe('Ψ₄₁_TESTFUNC');
  });

  it('generates fallback summary for unsupported language', () => {
    const unit = buildExecutableUnit(
      { name: 'fortranProc', category: 'computation', confidence: 0.7, complexity: 2, extractionMethod: 'function' },
      'fortran'
    );
    const binding = bindAndExecute(unit, {});
    const summary = generateEffectSummary(binding, 'Ψ₄₁_FORTRANPROC');

    // Fortran has no local handler or bridge — will be fallback or degraded
    expect(['fallback', 'degraded']).toContain(summary.status);
    expect(summary.score).toBeLessThanOrEqual(0.4);
  });

  it('generates degraded summary when handler fails', () => {
    registerPrimitive({ id: 'p-fail', name: 'failFunc', source: 'native', handler: () => { throw new Error('boom'); } });
    const unit = buildExecutableUnit(
      { name: 'failFunc', category: 'execution', confidence: 0.8, complexity: 2, extractionMethod: 'function' },
      'typescript'
    );
    const binding = bindAndExecute(unit, {});
    const summary = generateEffectSummary(binding, 'Ψ₄₁_FAILFUNC');

    expect(summary.status).toBe('degraded');
    expect(summary.badge).toBe('⚠️ Degraded');
    expect(summary.score).toBe(0); // 0 + 0
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §9 — EXECUTION BINDING v2 (expanded)
// ═══════════════════════════════════════════════════════════════════════════════

describe('E2E: Execution Binding', () => {
  beforeEach(() => clearPrimitives());

  it('local strategy — no double fallback overwrite', () => {
    registerPrimitive({ id: 'p-real', name: 'realHandler', source: 'native', handler: (x) => ({ ...(x as object), real: true }) });
    const unit = buildExecutableUnit(
      { name: 'realHandler', category: 'execution', confidence: 0.9, complexity: 3, extractionMethod: 'function' },
      'typescript'
    );
    const result = bindAndExecute(unit, { payload: 'data' });

    expect(result.executed).toBe(true);
    expect(result.degraded).toBe(false);
    expect(result.strategy).toBe('local');
    // Raw result should have our processed data, NOT the input passthrough
    expect((result.rawResult as Record<string, unknown>).real).toBe(true);
  });

  it('fallback strategy — unsupported language degrades or falls back honestly', () => {
    const unit = buildExecutableUnit(
      { name: 'VhdlModule', category: 'computation', confidence: 0.8, complexity: 5, extractionMethod: 'module' },
      'vhdl'
    );
    const result = bindAndExecute(unit, { test: 1 });

    // VHDL has no handler — will resolve to fallback or local-degraded depending on strategy
    expect(result.executed).toBe(false);
    expect(result.signals.length).toBeGreaterThan(0);
  });

  it('degraded local — handler throws, degrades truthfully', () => {
    registerPrimitive({ id: 'p-throw', name: 'throwHandler', source: 'native', handler: () => { throw new Error('crash'); } });
    const unit = buildExecutableUnit(
      { name: 'throwHandler', category: 'execution', confidence: 0.8, complexity: 3, extractionMethod: 'function' },
      'typescript'
    );
    const result = bindAndExecute(unit, { safe: true });

    // Handler throws internally in executor — caught and returned as fallback signal
    expect(result.executed).toBe(false);
    expect(result.degraded).toBe(true);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('intelligence metrics are populated', () => {
    const result = bindAndExecute(
      buildExecutableUnit({ name: 'metricsTest', category: 'analysis', confidence: 0.7, complexity: 2, extractionMethod: 'function' }, 'fortran'),
      { a: 1, b: 2 }
    );
    expect(result.intelligence.input_size).toBeGreaterThan(0);
    expect(result.intelligence.output_size).toBeGreaterThan(0);
    expect(result.intelligence.execution_density).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §10 — CHAIN INJECTION
// ═══════════════════════════════════════════════════════════════════════════════

describe('E2E: Chain Injection', () => {
  beforeEach(() => { clearPrimitives(); clearNodeEffects(); });

  it('registerNodeEffect creates valid module effect', () => {
    const node = makeNode();
    const result = registerNodeEffect(node);
    expect(result.success).toBe(true);
    expect(result.effectRegistered).toBe(true);
    expect(result.primitivesInjected).toBeGreaterThan(0);
    expect(getRegisteredNodeCount()).toBe(1);
  });

  it('getNodeEffect retrieves registered effect', () => {
    const node = makeNode();
    registerNodeEffect(node);
    const moduleName = buildAscensionModuleName('TEST_NODE');
    const effect = getNodeEffect(moduleName);
    expect(effect).toBeDefined();
    expect(effect!.module).toBe(moduleName);
  });

  it('injectNodeIntoChain adds module at correct position', () => {
    const node = makeNode();
    const { chain, injectedAt } = injectNodeIntoChain(['CORE', 'BRAIN', 'ORACLE'], node);
    expect(chain.length).toBe(4);
    expect(chain.some(m => isAscensionModule(m))).toBe(true);
    expect(injectedAt).toBeGreaterThanOrEqual(0);
  });

  it('injectNodeIntoChain does not duplicate module', () => {
    const node = makeNode();
    const moduleName = buildAscensionModuleName('TEST_NODE');
    const { chain } = injectNodeIntoChain([moduleName, 'CORE'], node);
    const count = chain.filter(m => m === moduleName).length;
    expect(count).toBe(1);
  });

  it('clearNodeEffects resets registry', () => {
    registerNodeEffect(makeNode());
    expect(getRegisteredNodeCount()).toBe(1);
    clearNodeEffects();
    expect(getRegisteredNodeCount()).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §11 — DELTA MEASUREMENT
// ═══════════════════════════════════════════════════════════════════════════════

describe('E2E: Delta Measurement', () => {
  it('captures accurate snapshots', () => {
    const ctx = makeCtx({ confidence: 0.85 });
    const snap = captureSnapshot(ctx, 42.5);
    expect(snap.confidence).toBe(0.85);
    expect(snap.durationMs).toBe(42.5);
    expect(snap.chainModules).toEqual(['CORE', 'BRAIN']);
  });

  it('compareDelta detects positive impact', () => {
    const baseline = captureSnapshot(makeCtx(), 10);
    const injectedCtx = makeCtx({ confidence: 0.95 });
    injectedCtx.data = { ...injectedCtx.data, newKey: 'added', anotherKey: 'enrichment' };
    const injected = captureSnapshot(injectedCtx, 12);
    const delta = compareDelta(baseline, injected, 3);

    expect(delta.outputKeysAdded.length).toBeGreaterThan(0);
    expect(delta.confidenceDelta).toBeGreaterThan(0);
    expect(delta.verdict).toBe('positive');
    expect(delta.impactScore).toBeGreaterThan(0);
  });

  it('compareDelta detects negative impact', () => {
    const baseline = captureSnapshot(makeCtx({ confidence: 0.9 }), 10);
    const injectedCtx = makeCtx({ confidence: 0.5 });
    const injected = captureSnapshot(injectedCtx, 50);
    const delta = compareDelta(baseline, injected, 0);

    expect(delta.confidenceDelta).toBeLessThan(0);
    expect(delta.verdict).toBe('negative');
  });

  it('buildDeltaReport creates complete report', () => {
    const node = makeNode();
    const baseline = captureSnapshot(makeCtx(), 10);
    const injected = captureSnapshot(makeCtx(), 12);
    const report = buildDeltaReport(node, baseline, injected, 2);

    expect(report.id).toMatch(/^asc_/);
    expect(report.nodeId).toBe(node.id);
    expect(report.deltas).toBeDefined();
    expect(report.timestamp).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §12 — PRIMITIVE REGISTRY + DEFAULTS + LEARNING + GOVERNOR
// ═══════════════════════════════════════════════════════════════════════════════

describe('E2E: Primitive Registry & Lifecycle', () => {
  beforeEach(() => { clearPrimitives(); clearLearningState(); });

  it('registerDefaults populates native primitives', () => {
    registerDefaults();
    expect(getPrimitiveCount()).toBeGreaterThanOrEqual(5);
    expect(getPrimitive('identity')).not.toBeNull();
    expect(getPrimitive('resolveArbitrageSpread')).not.toBeNull();
  });

  it('recordPrimitiveOutcome updates success rate via EMA', () => {
    registerPrimitive({ id: 'p-ema', name: 'emaTest', source: 'native' });
    recordPrimitiveOutcome('emaTest', true);
    recordPrimitiveOutcome('emaTest', true);
    recordPrimitiveOutcome('emaTest', false);
    const stats = getPrimitiveLearningStats('emaTest');
    expect(stats!.totalExecutions).toBe(3);
    expect(stats!.successes).toBe(2);
    expect(stats!.failures).toBe(1);
  });

  it('isPrimitiveReliable requires MIN_SAMPLES and >= 60% success', () => {
    registerPrimitive({ id: 'p-reliable', name: 'reliableTest', source: 'native' });
    recordPrimitiveOutcome('reliableTest', true);
    recordPrimitiveOutcome('reliableTest', true);
    expect(isPrimitiveReliable('reliableTest')).toBe(false); // Only 2 samples
    recordPrimitiveOutcome('reliableTest', true);
    expect(isPrimitiveReliable('reliableTest')).toBe(true); // 3 samples, 100%
  });

  it('governor can inject, disable, and remove primitives', () => {
    const success = governorInjectPrimitive({
      id: 'gov-1',
      name: 'governorPrim',
      category: 'analysis',
      handler: () => ({ injected: true }),
    });
    expect(success).toBe(true);
    expect(getPrimitive('governorPrim')).not.toBeNull();

    governorDisablePrimitive('governorPrim');
    expect(getPrimitive('governorPrim')!.handler).toBeUndefined();

    governorRemovePrimitive('governorPrim');
    expect(getPrimitive('governorPrim')).toBeNull();
  });

  it('governorGetPrimitiveSummary returns structured data', () => {
    registerDefaults();
    const summary = governorGetPrimitiveSummary();
    expect(summary.length).toBeGreaterThanOrEqual(5);
    expect(summary[0].name).toBeTruthy();
    expect(summary[0].source).toBe('native');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §13 — ENRICHMENT + FULL PIPELINE INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('E2E: Full Pipeline Integration', () => {
  beforeEach(() => { clearPrimitives(); clearNodeEffects(); clearLearningState(); });

  it('enrichExtractionWithEffects attaches v2 metadata', () => {
    const extraction = extractPrimitives([{
      name: 'handler.ts',
      content: `
        export function processOrder(order: { id: string, amount: number }) {
          return { ...order, processed: true, timestamp: Date.now() };
        }
        export class OrderValidator {
          validate(order: unknown): boolean { return !!order; }
        }
      `,
      language: 'typescript',
    }]);

    const enriched = enrichExtractionWithEffects(extraction, 'handler.ts', 'typescript');
    expect(enriched.effectMeta.injectionVersion).toBe(2);
    expect(enriched.effectMeta.effectReady).toBe(true);
    expect(enriched.effectMeta.primaryUnit).not.toBeNull();
    expect(enriched.effectMeta.resolvedStrategy).toBeDefined();
    expect(enriched.effectMeta.defaultChain.length).toBeGreaterThan(0);
  });

  it('full extract → inject → effect → delta pipeline', () => {
    // 1. Extract
    const extraction = extractPrimitives([{
      name: 'analyzer.ts',
      content: `
        export function analyzeMarketData(data: number[], window: number): { trend: string; avg: number } {
          const avg = data.reduce((s, v) => s + v, 0) / data.length;
          return { trend: avg > 50 ? 'bullish' : 'bearish', avg };
        }
      `,
      language: 'typescript',
    }]);
    expect(extraction.primitives.length).toBeGreaterThan(0);

    // 2. Build node
    const node = makeNode({
      primitives: extraction.primitives,
      language: 'typescript',
      extractionStats: extraction.stats,
      qualitySummary: extraction.quality.summary,
    });

    // 3. Register effect
    const regResult = registerNodeEffect(node);
    expect(regResult.success).toBe(true);

    // 4. Capture baseline
    const baselineCtx = makeCtx();
    const baseline = captureSnapshot(baselineCtx, 5);

    // 5. Apply effect injection
    const injectedCtx = makeCtx();
    const afterInjection = applyEffectInjection(injectedCtx, node);
    const injected = captureSnapshot(afterInjection, 15);

    // 6. Measure delta
    const delta = buildDeltaReport(node, baseline, injected, extraction.primitives.length);
    expect(delta.deltas.outputKeysAdded.length).toBeGreaterThan(0);
    expect(delta.deltas.primitivesContributed).toBe(extraction.primitives.length);

    // 7. Verify trace integrity
    expect(afterInjection.trace.length).toBeGreaterThan(0);
    const effectTrace = afterInjection.trace.find(t => t.effect.includes('effect-injection-v2'));
    expect(effectTrace).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §14 — TRUTHFULNESS ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════════════════

describe('E2E: Truthfulness Rules', () => {
  beforeEach(() => clearPrimitives());

  it('local success with real handler = executed:true, degraded:false', () => {
    registerPrimitive({ id: 'p-truth-real', name: 'truthReal', source: 'native', handler: () => ({ verified: true }) });
    const unit = buildExecutableUnit({ name: 'truthReal', category: 'execution', confidence: 0.9, complexity: 2, extractionMethod: 'function' }, 'typescript');
    const result = bindAndExecute(unit, {});
    expect(result.executed).toBe(true);
    expect(result.degraded).toBe(false);
  });

  it('pure fallback = executed:false, degraded:false', () => {
    const unit = buildExecutableUnit({ name: 'unknownLang', category: 'execution', confidence: 0.7, complexity: 2, extractionMethod: 'function' }, 'brainfuck');
    const result = bindAndExecute(unit, {});
    expect(result.executed).toBe(false);
    expect(result.degraded).toBe(false);
  });

  it('handler failure = executed:false, degraded:true', () => {
    registerPrimitive({ id: 'p-truth-fail', name: 'truthFail', source: 'native', handler: () => { throw new Error('fail'); } });
    const unit = buildExecutableUnit({ name: 'truthFail', category: 'execution', confidence: 0.8, complexity: 2, extractionMethod: 'function' }, 'typescript');
    const result = bindAndExecute(unit, {});
    expect(result.executed).toBe(false);
    expect(result.degraded).toBe(true);
  });

  it('internal fallback from executor = executed:false, degraded:true', () => {
    // No handler registered → executor returns fallback signal
    const unit = buildExecutableUnit({ name: 'noRegistration', category: 'execution', confidence: 0.8, complexity: 2, extractionMethod: 'function' }, 'typescript');
    const result = bindAndExecute(unit, {});
    expect(result.executed).toBe(false);
    expect(result.degraded).toBe(true);
  });
});
