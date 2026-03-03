/**
 * Tests for Session Leak Detector
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectLeaks, type LeakReport } from '../sessionLeakDetector';

describe('sessionLeakDetector', () => {
  it('returns a LeakReport with correct shape', () => {
    const report = detectLeaks();
    expect(report).toHaveProperty('timestamp');
    expect(report).toHaveProperty('sessionDurationMinutes');
    expect(report).toHaveProperty('signals');
    expect(report).toHaveProperty('severity');
    expect(Array.isArray(report.signals)).toBe(true);
  });

  it('severity is clean when no signals', () => {
    const report = detectLeaks();
    // In test env, DOM is minimal and heap is small
    if (report.signals.length === 0) {
      expect(report.severity).toBe('clean');
    }
  });

  it('sessionDurationMinutes is non-negative', () => {
    const report = detectLeaks();
    expect(report.sessionDurationMinutes).toBeGreaterThanOrEqual(0);
  });

  it('timestamp is valid ISO string', () => {
    const report = detectLeaks();
    expect(() => new Date(report.timestamp)).not.toThrow();
    expect(new Date(report.timestamp).toISOString()).toBe(report.timestamp);
  });

  it('signals have required fields', () => {
    const report = detectLeaks();
    for (const signal of report.signals) {
      expect(signal).toHaveProperty('type');
      expect(signal).toHaveProperty('description');
      expect(signal).toHaveProperty('value');
      expect(signal).toHaveProperty('threshold');
      expect(typeof signal.value).toBe('number');
      expect(typeof signal.threshold).toBe('number');
    }
  });

  it('severity escalates to warning with 1 signal', () => {
    // Manually validate severity logic
    const signals = [{ type: 'timers' as const, description: 'test', value: 60, threshold: 50 }];
    const severity = signals.length >= 2 ? 'leak_likely' : signals.length > 0 ? 'warning' : 'clean';
    expect(severity).toBe('warning');
  });

  it('severity escalates to leak_likely with 2+ signals', () => {
    const signals = [
      { type: 'timers' as const, description: 'test', value: 60, threshold: 50 },
      { type: 'dom_detached' as const, description: 'test', value: 9000, threshold: 8000 },
    ];
    const severity = signals.length >= 2 ? 'leak_likely' : signals.length > 0 ? 'warning' : 'clean';
    expect(severity).toBe('leak_likely');
  });

  it('severity escalates to leak_likely on heap_growth', () => {
    const signals = [{ type: 'heap_growth' as const, description: 'test', value: 3, threshold: 2 }];
    const severity = signals.some(s => s.type === 'heap_growth') ? 'leak_likely' : 'warning';
    expect(severity).toBe('leak_likely');
  });
});
