/**
 * CMPSBL® Ascension Subsystem Tests
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Comprehensive test coverage for the Ascension pipeline:
 *   - Primitive extraction
 *   - Quality gate
 *   - Language post-processing
 *   - Deduplication
 *   - Delta measurement
 *   - Naming conventions
 *   - Metadata migration
 *
 * © CMPSBL® — All rights reserved.
 */

import { describe, it, expect } from 'vitest';
import { extractPrimitives, buildPrimitiveHandler } from '@/lib/ascension/primitive-extractor';
import { scorePrimitive, runQualityGate, DEFAULT_QUALITY_CONFIG } from '@/lib/ascension/quality-gate';
import { postProcessPrimitives, normalizeName } from '@/lib/ascension/language-postprocessor';
import { deduplicatePrimitives } from '@/lib/ascension/deduplication';
import { captureSnapshot, compareDelta, buildDeltaReport } from '@/lib/ascension/delta-measurement';
import {
  buildAscensionModuleName,
  isAscensionModule,
  migrateMetadata,
  generateCorrelationId,
  ASCENSION_SCHEMA_VERSION,
  type ExtractedPrimitive,
  type PipelineContext,
  type AscensionNode,
} from '@/lib/ascension/types';

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function makePrimitive(overrides: Partial<ExtractedPrimitive> = {}): ExtractedPrimitive {
  return {
    id: 'test-id',
    name: 'calculateRisk',
    canonicalName: 'calculate_risk',
    category: 'analysis',
    inputs: ['price', 'volume'],
    outputs: ['result'],
    confidence: 0.8,
    qualityScore: 0.6,
    sourceSnippet: 'function calculateRisk(price, volume) { if (price > 0) { return price * volume; } }',
    language: 'TypeScript',
    extractionMethod: 'function',
    extractionTrust: 'high',
    keywords: ['calculate', 'if', 'return'],
    complexity: 3,
    ...overrides,
  };
}

function makePipelineContext(overrides: Partial<PipelineContext> = {}): PipelineContext {
  return {
    data: {},
    trace: [],
    annotations: {},
    recoveries: [],
    confidence: 0.75,
    transformationNotes: [],
    originalInput: {},
    chainId: 'test-chain',
    chainModules: ['CORE', 'BRAIN'],
    stageIndex: 0,
    ...overrides,
  } as PipelineContext;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — PRIMITIVE EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Primitive Extraction', () => {
  it('extracts TypeScript functions', () => {
    const result = extractPrimitives([{
      name: 'test.ts',
      content: `
        export function calculateRisk(price: number, volume: number): number {
          if (price > 100) return price * volume * 0.05;
          return price * volume * 0.1;
        }
        
        export async function fetchMarketData(symbol: string) {
          const response = await fetch(\`/api/\${symbol}\`);
          return response.json();
        }
      `,
      language: 'TypeScript',
    }]);

    expect(result.primitives.length).toBeGreaterThanOrEqual(1);
    expect(result.stats.languagesDetected).toContain('TypeScript');
    expect(result.durationMs).toBeGreaterThan(0);
    expect(result.correlationId).toBeTruthy();
  });

  it('extracts Python functions and classes', () => {
    const result = extractPrimitives([{
      name: 'model.py',
      content: `
class RiskAnalyzer:
    def calculate_exposure(self, portfolio, threshold=0.05):
        total = sum(p.value for p in portfolio)
        if total > threshold:
            return self.apply_hedge(total)
        return total

    def apply_hedge(self, amount):
        return amount * 0.95
      `,
      language: 'Python',
    }]);

    expect(result.primitives.length).toBeGreaterThanOrEqual(1);
    expect(result.stats.languagesDetected).toContain('Python');
  });

  it('handles empty file gracefully', () => {
    const result = extractPrimitives([{
      name: 'empty.ts', content: '', language: 'TypeScript',
    }]);

    expect(result.primitives).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('handles no files gracefully', () => {
    const result = extractPrimitives([]);
    expect(result.primitives).toHaveLength(0);
    expect(result.warnings).toContain('No files provided');
  });

  it('handles malformed content without crashing', () => {
    const result = extractPrimitives([{
      name: 'bad.ts',
      content: '{{{{{{{}}}}}}}))))((((((',
      language: 'TypeScript',
    }]);

    expect(result).toBeDefined();
    expect(result.primitives).toBeDefined();
  });

  it('extracts Rust functions', () => {
    const result = extractPrimitives([{
      name: 'lib.rs',
      content: `
pub fn validate_transaction(tx: &Transaction, threshold: f64) -> Result<bool, Error> {
    if tx.amount > threshold {
        return Err(Error::ThresholdExceeded);
    }
    Ok(true)
}
      `,
      language: 'Rust',
    }]);

    expect(result.primitives.length).toBeGreaterThanOrEqual(1);
  });

  it('extracts HDL modules', () => {
    const result = extractPrimitives([{
      name: 'counter.v',
      content: `
module counter_module(
    input wire clk,
    input wire reset,
    output reg [7:0] count
);
    always @(posedge clk or posedge reset) begin
        if (reset)
            count <= 8'b0;
        else
            count <= count + 1;
    end
endmodule
      `,
      language: 'Verilog',
    }]);

    expect(result.primitives.length).toBeGreaterThanOrEqual(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — QUALITY GATE
// ═══════════════════════════════════════════════════════════════════════════════

describe('Quality Gate', () => {
  it('scores primitives with weighted factors', () => {
    const high = makePrimitive({ name: 'calculatePortfolioRisk', confidence: 0.9, complexity: 5, keywords: ['calculate', 'if', 'return', 'for'] });
    const low = makePrimitive({ name: 'foo', confidence: 0.5, complexity: 1, keywords: [] });

    const highScore = scorePrimitive(high);
    const lowScore = scorePrimitive(low);

    expect(highScore).toBeGreaterThan(lowScore);
    expect(highScore).toBeGreaterThan(0.5);
    expect(lowScore).toBeLessThan(0.5);
  });

  it('rejects below-threshold primitives', () => {
    const primitives = [
      makePrimitive({ name: 'analyzeMarketTrend', confidence: 0.9, complexity: 6 }),
      makePrimitive({ name: 'foo', confidence: 0.3, complexity: 1, keywords: [], category: 'unknown' }),
    ];

    const report = runQualityGate(primitives);

    expect(report.accepted.length).toBeGreaterThanOrEqual(1);
    expect(report.rejected.length).toBeGreaterThanOrEqual(1);
    expect(report.summary.totalExtracted).toBe(2);
  });

  it('caps at maxPrimitivesPerNode', () => {
    const primitives = Array.from({ length: 100 }, (_, i) =>
      makePrimitive({ id: `p-${i}`, name: `calculate_metric_${i}`, confidence: 0.8 })
    );

    const report = runQualityGate(primitives, { ...DEFAULT_QUALITY_CONFIG, maxPrimitivesPerNode: 10 });

    expect(report.accepted.length).toBeLessThanOrEqual(10);
  });

  it('returns quality summary', () => {
    const report = runQualityGate([makePrimitive()]);

    expect(report.summary).toBeDefined();
    expect(report.summary.totalExtracted).toBe(1);
    expect(report.summary.avgQualityScore).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — LANGUAGE POST-PROCESSING
// ═══════════════════════════════════════════════════════════════════════════════

describe('Language Post-Processing', () => {
  it('normalizes names consistently', () => {
    expect(normalizeName('calculateRisk')).toBe('calculate_risk');
    expect(normalizeName('calc_risk')).toBe('calc_risk');
    expect(normalizeName('HTTPSConnection')).toBe('https_connection');
    expect(normalizeName('__init__')).toBe('init');
  });

  it('classifies extraction trust levels', () => {
    const highTrust = makePrimitive({ name: 'validateTransaction', inputs: ['tx'], category: 'validation' });
    const result = postProcessPrimitives([highTrust]);
    expect(result[0].extractionTrust).toBe('high');
  });

  it('downgrades boilerplate names', () => {
    const boilerplate = makePrimitive({ name: '__init__', language: 'Python' });
    const result = postProcessPrimitives([boilerplate]);
    expect(result[0].extractionTrust).toBe('heuristic');
    expect(result[0].confidence).toBeLessThan(boilerplate.confidence);
  });

  it('downgrades test file primitives', () => {
    const normal = makePrimitive({ name: 'analyzeData' });
    const result = postProcessPrimitives([normal], 'test_analyzer.spec.ts');
    expect(result[0].extractionTrust).toBe('heuristic');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — DEDUPLICATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Deduplication', () => {
  it('merges exact canonical name matches', () => {
    const primitives = [
      makePrimitive({ id: '1', name: 'calculateRisk', canonicalName: 'calculate_risk', qualityScore: 0.8 }),
      makePrimitive({ id: '2', name: 'calculate_risk', canonicalName: 'calculate_risk', qualityScore: 0.7 }),
    ];

    const result = deduplicatePrimitives(primitives);

    expect(result.canonical).toHaveLength(1);
    expect(result.mergedCount).toBe(1);
    expect(result.canonical[0].qualityScore).toBe(0.8); // keeps best
    expect(result.canonical[0].aliases?.length).toBeGreaterThan(0);
  });

  it('does not over-merge different categories', () => {
    const primitives = [
      makePrimitive({ id: '1', name: 'validateRisk', canonicalName: 'validate_risk', category: 'validation' }),
      makePrimitive({ id: '2', name: 'calculateRisk', canonicalName: 'calculate_risk', category: 'analysis' }),
    ];

    const result = deduplicatePrimitives(primitives);
    expect(result.canonical.length).toBe(2);
    expect(result.mergedCount).toBe(0);
  });

  it('handles empty input', () => {
    const result = deduplicatePrimitives([]);
    expect(result.canonical).toHaveLength(0);
    expect(result.mergedCount).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — DELTA MEASUREMENT
// ═══════════════════════════════════════════════════════════════════════════════

describe('Delta Measurement', () => {
  it('captures pipeline context snapshot', () => {
    const ctx = makePipelineContext({
      data: { foo: 1, bar: 2 },
      annotations: { test: true },
      confidence: 0.85,
    });

    const snapshot = captureSnapshot(ctx, 50);

    expect(snapshot.outputKeys).toEqual(['bar', 'foo']);
    expect(snapshot.confidence).toBe(0.85);
    expect(snapshot.durationMs).toBe(50);
  });

  it('computes positive delta for enrichment', () => {
    const baseline = { chainModules: ['CORE'], outputKeys: ['a', 'b'], annotationCount: 1, confidence: 0.7, durationMs: 50, recoveryCount: 0, transformationNotes: [] };
    const injected = { chainModules: ['CORE', 'Ψ₄₁_TEST'], outputKeys: ['a', 'b', 'c', 'd'], annotationCount: 3, confidence: 0.8, durationMs: 55, recoveryCount: 0, transformationNotes: [] };

    const delta = compareDelta(baseline, injected, 5);

    expect(delta.outputKeysAdded).toEqual(['c', 'd']);
    expect(delta.confidenceDelta).toBeGreaterThan(0);
    expect(delta.verdict).toBe('positive');
    expect(delta.impactScore).toBeGreaterThan(0);
  });

  it('detects negative delta for degradation', () => {
    const baseline = { chainModules: ['CORE'], outputKeys: ['a', 'b', 'c'], annotationCount: 2, confidence: 0.9, durationMs: 50, recoveryCount: 0, transformationNotes: [] };
    const injected = { chainModules: ['CORE', 'Ψ₄₁_TEST'], outputKeys: ['a'], annotationCount: 2, confidence: 0.5, durationMs: 200, recoveryCount: 2, transformationNotes: [] };

    const delta = compareDelta(baseline, injected, 1);

    expect(delta.confidenceDelta).toBeLessThan(0);
    expect(delta.verdict).toBe('negative');
    expect(delta.impactScore).toBeLessThan(0);
  });

  it('builds complete delta report', () => {
    const node = { id: 'n1', name: 'TEST', primitives: [] } as unknown as AscensionNode;
    const baseline = { chainModules: [], outputKeys: [], annotationCount: 0, confidence: 0.5, durationMs: 10, recoveryCount: 0, transformationNotes: [] };
    const injected = { ...baseline, outputKeys: ['x'], confidence: 0.6 };

    const report = buildDeltaReport(node, baseline, injected, 3);

    expect(report.nodeId).toBe('n1');
    expect(report.deltas).toBeDefined();
    expect(report.timestamp).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — NAMING + COLLISION SAFETY
// ═══════════════════════════════════════════════════════════════════════════════

describe('Ascension Naming', () => {
  it('builds collision-safe module names', () => {
    const name = buildAscensionModuleName('TRADER');
    expect(name).toBe('Ψ₄₁_TRADER');
    expect(isAscensionModule(name)).toBe(true);
  });

  it('prevents collision with canonical modules', () => {
    const name = buildAscensionModuleName('CORE');
    expect(name).toBe('Ψ₄₁_X_CORE');
    expect(name).not.toBe('Ψ₄₁_CORE');
  });

  it('sanitizes special characters', () => {
    const name = buildAscensionModuleName('my-trader.v2!');
    expect(name).toMatch(/^Ψ₄₁_[A-Z0-9_]+$/);
  });

  it('handles empty name', () => {
    const name = buildAscensionModuleName('');
    expect(name).toBe('Ψ₄₁_UNNAMED');
  });

  it('detects ascension modules', () => {
    expect(isAscensionModule('Ψ₄₁_TRADER')).toBe(true);
    expect(isAscensionModule('CORE')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — METADATA MIGRATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Metadata Migration', () => {
  it('migrates v1 flat metadata to v2 structured', () => {
    const v1 = {
      node_name: 'TRADER',
      language: 'PHP',
      source_files: [{ name: 'Trader.php', content: '<?php class Trader {}', language: 'PHP' }],
      primitives: [makePrimitive()],
      node_status: 'candidate',
      node_mode: 'temporary',
      run_limit: 5,
      total_runs: 2,
    };

    const migrated = migrateMetadata(v1);

    expect(migrated.schema_version).toBe(ASCENSION_SCHEMA_VERSION);
    expect(migrated.identity.node_name).toBe('TRADER');
    expect(migrated.identity.language).toBe('PHP');
    expect(migrated.extraction.primitives).toHaveLength(1);
    expect(migrated.lifecycle.node_status).toBe('candidate');
    expect(migrated.lifecycle.run_limit).toBe(5);
    expect(migrated.provenance.correlation_id).toBeTruthy();
  });

  it('is idempotent on already-migrated data', () => {
    const v1 = { language: 'Rust', source_files: [] };
    const first = migrateMetadata(v1);
    const second = migrateMetadata(first as unknown as Record<string, unknown>);

    expect(second.schema_version).toBe(ASCENSION_SCHEMA_VERSION);
    expect(second.identity.language).toBe('Rust');
  });

  it('handles empty metadata gracefully', () => {
    const migrated = migrateMetadata({});
    expect(migrated.schema_version).toBe(ASCENSION_SCHEMA_VERSION);
    expect(migrated.identity.language).toBe('Unknown');
    expect(migrated.extraction.primitives).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §8 — CORRELATION IDs
// ═══════════════════════════════════════════════════════════════════════════════

describe('Correlation IDs', () => {
  it('generates unique IDs', () => {
    const a = generateCorrelationId();
    const b = generateCorrelationId();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^asc_/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §9 — PRIMITIVE HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

describe('Primitive Handler', () => {
  it('produces traceable output keyed by category', () => {
    const prim = makePrimitive({ category: 'analysis', canonicalName: 'calculate_risk' });
    const handler = buildPrimitiveHandler(prim);
    const result = handler({ existing: true });

    expect(result.existing).toBe(true);
    expect(result._analysis_calculate_risk).toBeDefined();
    const entry = result._analysis_calculate_risk as Record<string, unknown>;
    expect(entry.executed).toBe(true);
    expect(entry.category).toBe('analysis');
    expect(entry.timestamp).toBeGreaterThan(0);
  });

  it('preserves existing context', () => {
    const prim = makePrimitive();
    const handler = buildPrimitiveHandler(prim);
    const result = handler({ keep: 'me', count: 42 });

    expect(result.keep).toBe('me');
    expect(result.count).toBe(42);
  });
});
