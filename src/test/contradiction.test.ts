/**
 * Contradiction Detector — Unit Tests
 * FIX #19: Tests for enhanced contradiction detection
 */

import { describe, it, expect } from 'vitest';
import { detectContradiction, applyContradictionPenalty } from '@/lib/memory/contradiction';

describe('Contradiction Detector', () => {
  it('should detect negation-based contradictions', () => {
    const result = detectContradiction(
      'the system is active and running',
      'the system is not active anymore',
      0.9
    );
    expect(result.contradicted).toBe(true);
    expect(result.confidence_drop).toBeGreaterThan(0);
  });

  it('should detect antonym-based contradictions', () => {
    const result = detectContradiction(
      'the feature is enabled for users',
      'the feature is disabled for users',
      0.8
    );
    expect(result.contradicted).toBe(true);
    expect(result.reason).toContain('antonym');
  });

  it('should not flag unrelated statements', () => {
    const result = detectContradiction(
      'the server runs on port 3000',
      'the database uses PostgreSQL',
      0.9
    );
    expect(result.contradicted).toBe(false);
  });

  it('should detect numeric conflicts with shared context', () => {
    const result = detectContradiction(
      'the server runs on port 3000',
      'the server runs on port 8080',
      0.85
    );
    expect(result.contradicted).toBe(true);
    expect(result.reason).toContain('numeric');
  });

  it('should cap confidence drop at 50%', () => {
    const result = detectContradiction(
      'feature is enabled and active and valid and available',
      'feature is not enabled not active not valid not available',
      1.0
    );
    expect(result.confidence_drop).toBeLessThanOrEqual(0.5);
  });

  it('should apply penalty correctly', () => {
    const after = applyContradictionPenalty(0.8, 0.3);
    expect(after).toBeCloseTo(0.5);
  });

  it('should never go below zero', () => {
    const after = applyContradictionPenalty(0.1, 0.5);
    expect(after).toBe(0);
  });
});
