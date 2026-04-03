/**
 * Pipeline Fingerprint Tests — SHADOW coverage
 * Tests determinism, uniqueness, error handling, async rejection, and edge cases.
 * This file signs every Certificate of Discovery — highest test priority.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateStructuralFingerprint,
  generatePipelineFingerprint,
  buildFingerprintPayload,
  moduleChainToSteps,
  stepsToModuleChain,
  truncateFingerprint,
  formatPipelineSteps,
  FingerprintError,
} from '@/substrate/pipeline-fingerprint';
import type {
  PipelineStep,
  StructuralFingerprintInput,
  PipelineFingerprintInput,
} from '@/substrate/pipeline-fingerprint';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — Determinism: identical inputs → identical fingerprints
// ═══════════════════════════════════════════════════════════════════════════════

describe('Fingerprint Determinism', () => {
  const STEPS: PipelineStep[] = [
    { module: 'FAILSAFE', capability: 'circuit_breaker' },
    { module: 'BEACON', capability: 'health_signal' },
    { module: 'DEFENSE', capability: 'perimeter' },
  ];

  it('produces identical fingerprints for identical inputs', async () => {
    const fp1 = await generateStructuralFingerprint({ steps: STEPS });
    const fp2 = await generateStructuralFingerprint({ steps: STEPS });
    expect(fp1).toBe(fp2);
  });

  it('produces identical fingerprints regardless of module casing', async () => {
    const lower: PipelineStep[] = [
      { module: 'failsafe', capability: 'circuit_breaker' },
      { module: 'beacon', capability: 'health_signal' },
    ];
    const upper: PipelineStep[] = [
      { module: 'FAILSAFE', capability: 'circuit_breaker' },
      { module: 'BEACON', capability: 'health_signal' },
    ];
    const fp1 = await generateStructuralFingerprint({ steps: lower });
    const fp2 = await generateStructuralFingerprint({ steps: upper });
    expect(fp1).toBe(fp2);
  });

  it('produces a valid 64-character hex SHA-256 string', async () => {
    const fp = await generateStructuralFingerprint({ steps: STEPS });
    expect(fp).toMatch(/^[0-9a-f]{64}$/);
  });

  it('produces identical payload strings for identical inputs', () => {
    const p1 = buildFingerprintPayload({ steps: STEPS });
    const p2 = buildFingerprintPayload({ steps: STEPS });
    expect(p1).toBe(p2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — Uniqueness: different inputs → different fingerprints
// ═══════════════════════════════════════════════════════════════════════════════

describe('Fingerprint Uniqueness', () => {
  it('produces different fingerprints for different step modules', async () => {
    const fp1 = await generateStructuralFingerprint({
      steps: [{ module: 'FAILSAFE', capability: 'guard' }],
    });
    const fp2 = await generateStructuralFingerprint({
      steps: [{ module: 'BEACON', capability: 'guard' }],
    });
    expect(fp1).not.toBe(fp2);
  });

  it('produces different fingerprints for different capabilities', async () => {
    const fp1 = await generateStructuralFingerprint({
      steps: [{ module: 'FAILSAFE', capability: 'circuit_breaker' }],
    });
    const fp2 = await generateStructuralFingerprint({
      steps: [{ module: 'FAILSAFE', capability: 'health_signal' }],
    });
    expect(fp1).not.toBe(fp2);
  });

  it('produces different fingerprints for different step order', async () => {
    const fp1 = await generateStructuralFingerprint({
      steps: [
        { module: 'FAILSAFE', capability: 'guard' },
        { module: 'BEACON', capability: 'health' },
      ],
    });
    const fp2 = await generateStructuralFingerprint({
      steps: [
        { module: 'BEACON', capability: 'health' },
        { module: 'FAILSAFE', capability: 'guard' },
      ],
    });
    expect(fp1).not.toBe(fp2);
  });

  it('produces different fingerprints when params differ', async () => {
    const fp1 = await generateStructuralFingerprint({
      steps: [{ module: 'FAILSAFE', capability: 'guard', params: { threshold: 5 } }],
    });
    const fp2 = await generateStructuralFingerprint({
      steps: [{ module: 'FAILSAFE', capability: 'guard', params: { threshold: 10 } }],
    });
    expect(fp1).not.toBe(fp2);
  });

  it('ignores empty params (treated same as no params)', async () => {
    const fp1 = await generateStructuralFingerprint({
      steps: [{ module: 'FAILSAFE', capability: 'guard' }],
    });
    const fp2 = await generateStructuralFingerprint({
      steps: [{ module: 'FAILSAFE', capability: 'guard', params: {} }],
    });
    expect(fp1).toBe(fp2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — Error Handling (FAILSAFE hardening)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Fingerprint Error Handling', () => {
  it('throws FingerprintError for empty steps array', async () => {
    await expect(generateStructuralFingerprint({ steps: [] }))
      .rejects.toThrow(FingerprintError);
    await expect(generateStructuralFingerprint({ steps: [] }))
      .rejects.toThrow('empty');
  });

  it('throws FingerprintError for step with missing module', async () => {
    const badSteps = [{ module: '', capability: 'guard' }] as PipelineStep[];
    await expect(generateStructuralFingerprint({ steps: badSteps }))
      .rejects.toThrow(FingerprintError);
  });

  it('throws FingerprintError for step with missing capability', async () => {
    const badSteps = [{ module: 'FAILSAFE', capability: '' }] as PipelineStep[];
    await expect(generateStructuralFingerprint({ steps: badSteps }))
      .rejects.toThrow(FingerprintError);
  });

  it('FingerprintError includes diagnostic code and context', async () => {
    try {
      await generateStructuralFingerprint({ steps: [] });
    } catch (err) {
      expect(err).toBeInstanceOf(FingerprintError);
      const fpErr = err as FingerprintError;
      expect(fpErr.code).toBe('FP_EMPTY_STEPS');
      expect(fpErr.context).toHaveProperty('stepsLength', 0);
    }
  });

  it('throws on invalid moduleChain input', () => {
    expect(() => moduleChainToSteps(null as unknown as string[]))
      .toThrow(FingerprintError);
  });

  it('throws on invalid stepsToModuleChain input', () => {
    expect(() => stepsToModuleChain(null as unknown as PipelineStep[]))
      .toThrow(FingerprintError);
  });

  it('buildFingerprintPayload throws on empty steps', () => {
    expect(() => buildFingerprintPayload({ steps: [] }))
      .toThrow(FingerprintError);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — Async Rejection Handling (BEACON hardening)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Async Rejection Handling', () => {
  it('propagates SHA-256 failures as FingerprintError (not silent)', async () => {
    // Temporarily break crypto.subtle
    const originalSubtle = globalThis.crypto?.subtle;
    if (originalSubtle) {
      const mockDigest = vi.fn().mockRejectedValue(new Error('crypto unavailable'));
      Object.defineProperty(globalThis.crypto, 'subtle', {
        value: { ...originalSubtle, digest: mockDigest },
        configurable: true,
      });

      try {
        await expect(
          generateStructuralFingerprint({
            steps: [{ module: 'TEST', capability: 'hash_fail' }],
          })
        ).rejects.toThrow(FingerprintError);
      } finally {
        Object.defineProperty(globalThis.crypto, 'subtle', {
          value: originalSubtle,
          configurable: true,
        });
      }
    }
  });

  it('async fingerprint errors contain diagnostic context', async () => {
    const originalSubtle = globalThis.crypto?.subtle;
    if (originalSubtle) {
      const mockDigest = vi.fn().mockRejectedValue(new Error('simulated WASM OOM'));
      Object.defineProperty(globalThis.crypto, 'subtle', {
        value: { ...originalSubtle, digest: mockDigest },
        configurable: true,
      });

      try {
        await generateStructuralFingerprint({
          steps: [{ module: 'TEST', capability: 'oom' }],
        });
      } catch (err) {
        expect(err).toBeInstanceOf(FingerprintError);
        expect((err as FingerprintError).code).toBe('FP_SHA256_FAILED');
        expect((err as FingerprintError).context).toHaveProperty('error');
      } finally {
        Object.defineProperty(globalThis.crypto, 'subtle', {
          value: originalSubtle,
          configurable: true,
        });
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — Legacy Input Compat
// ═══════════════════════════════════════════════════════════════════════════════

describe('Legacy Input Compatibility', () => {
  const legacyInput: PipelineFingerprintInput = {
    name: 'test-pipeline',
    moduleChain: ['FAILSAFE', 'BEACON', 'DEFENSE'],
    cjpi: 100,
    category: 'security',
  };

  it('generates fingerprint from legacy moduleChain input', async () => {
    const fp = await generatePipelineFingerprint(legacyInput);
    expect(fp).toMatch(/^[0-9a-f]{64}$/);
  });

  it('CJPI/name/category do NOT affect fingerprint', async () => {
    const variant: PipelineFingerprintInput = {
      name: 'completely-different-name',
      moduleChain: ['FAILSAFE', 'BEACON', 'DEFENSE'],
      cjpi: 1,
      category: 'totally-different',
    };
    const fp1 = await generatePipelineFingerprint(legacyInput);
    const fp2 = await generatePipelineFingerprint(variant);
    expect(fp1).toBe(fp2);
  });

  it('legacy path produces same fingerprint as equivalent structural input', async () => {
    const structuralInput: StructuralFingerprintInput = {
      steps: [
        { module: 'FAILSAFE', capability: 'unknown' },
        { module: 'BEACON', capability: 'unknown' },
        { module: 'DEFENSE', capability: 'unknown' },
      ],
    };
    const fp1 = await generatePipelineFingerprint(legacyInput);
    const fp2 = await generateStructuralFingerprint(structuralInput);
    expect(fp1).toBe(fp2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — Conversion Utilities
// ═══════════════════════════════════════════════════════════════════════════════

describe('Conversion Utilities', () => {
  it('moduleChainToSteps normalizes to uppercase', () => {
    const steps = moduleChainToSteps(['failsafe', 'beacon']);
    expect(steps[0].module).toBe('FAILSAFE');
    expect(steps[1].module).toBe('BEACON');
    expect(steps[0].capability).toBe('unknown');
  });

  it('stepsToModuleChain preserves order and normalizes case', () => {
    const chain = stepsToModuleChain([
      { module: 'defense', capability: 'guard' },
      { module: 'BEACON', capability: 'health' },
    ]);
    expect(chain).toEqual(['DEFENSE', 'BEACON']);
  });

  it('roundtrip: moduleChain → steps → moduleChain preserves identity', () => {
    const original = ['FAILSAFE', 'BEACON', 'DEFENSE'];
    const steps = moduleChainToSteps(original);
    const result = stepsToModuleChain(steps);
    expect(result).toEqual(original);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — Display Utilities
// ═══════════════════════════════════════════════════════════════════════════════

describe('Display Utilities', () => {
  it('truncateFingerprint returns first 12 uppercase chars + ellipsis', () => {
    const fp = 'abcdef123456789000000000000000000000000000000000000000000000abcd';
    expect(truncateFingerprint(fp)).toBe('ABCDEF123456…');
  });

  it('truncateFingerprint returns full string if <= 12 chars', () => {
    expect(truncateFingerprint('abc')).toBe('abc');
    expect(truncateFingerprint('')).toBe('');
  });

  it('truncateFingerprint handles null/undefined gracefully', () => {
    expect(truncateFingerprint(null as unknown as string)).toBe('');
    expect(truncateFingerprint(undefined as unknown as string)).toBe('');
  });

  it('formatPipelineSteps joins with arrow notation', () => {
    const steps: PipelineStep[] = [
      { module: 'failsafe', capability: 'guard' },
      { module: 'beacon', capability: 'health' },
    ];
    expect(formatPipelineSteps(steps)).toBe('FAILSAFE.guard → BEACON.health');
  });

  it('formatPipelineSteps returns empty string for empty/invalid input', () => {
    expect(formatPipelineSteps([])).toBe('');
    expect(formatPipelineSteps(null as unknown as PipelineStep[])).toBe('');
  });
});
