import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateTraceId,
  generateSpanId,
  createTraceContext,
  getContext,
  updateContext,
  endContext,
  cleanupOldTraces,
  withTrace,
  extractTraceId,
  getActiveTraceCount,
} from '../trace';

describe('Trace System', () => {
  beforeEach(() => {
    // Clean all traces between tests
    let count = 1;
    while (count > 0) count = cleanupOldTraces(0);
  });

  describe('generateTraceId', () => {
    it('produces valid UUID v4 format', () => {
      const id = generateTraceId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('produces unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, generateTraceId));
      expect(ids.size).toBe(100);
    });
  });

  describe('generateSpanId', () => {
    it('produces hex string', () => {
      const span = generateSpanId();
      expect(span).toMatch(/^[0-9a-f]+$/);
      expect(span.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe('createTraceContext / getContext', () => {
    it('creates and retrieves a trace context', () => {
      const ctx = createTraceContext('NEXUS', 'route');
      expect(ctx.module).toBe('NEXUS');
      expect(ctx.action).toBe('route');
      expect(ctx.trace_id).toBeDefined();
      expect(ctx.span_id).toBeDefined();
      expect(getContext(ctx.trace_id)).toEqual(ctx);
    });

    it('uses parent trace ID when provided', () => {
      const parent = createTraceContext('CORE', 'boot');
      const child = createTraceContext('BRAIN', 'recall', parent.trace_id);
      expect(child.trace_id).toBe(parent.trace_id);
      expect(child.parent_span_id).toBe(parent.span_id);
    });
  });

  describe('updateContext', () => {
    it('updates existing context fields', () => {
      const ctx = createTraceContext('TEST', 'action');
      updateContext(ctx.trace_id, { action: 'updated' });
      expect(getContext(ctx.trace_id)?.action).toBe('updated');
    });

    it('ignores updates to non-existent traces', () => {
      updateContext('non-existent-id', { action: 'noop' });
      expect(getContext('non-existent-id')).toBeUndefined();
    });
  });

  describe('endContext', () => {
    it('removes trace and returns it', () => {
      const ctx = createTraceContext('TEST', 'end');
      const ended = endContext(ctx.trace_id);
      expect(ended).toEqual(ctx);
      expect(getContext(ctx.trace_id)).toBeUndefined();
    });

    it('returns undefined for unknown trace', () => {
      expect(endContext('unknown')).toBeUndefined();
    });
  });

  describe('cleanupOldTraces', () => {
    it('cleans traces older than maxAgeMs', () => {
      createTraceContext('OLD', 'test');
      // With maxAge=0, all traces are "old"
      const cleaned = cleanupOldTraces(0);
      expect(cleaned).toBeGreaterThanOrEqual(1);
    });

    it('does not clean fresh traces', () => {
      createTraceContext('FRESH', 'test');
      const cleaned = cleanupOldTraces(60000);
      expect(cleaned).toBe(0);
    });
  });

  describe('withTrace', () => {
    it('creates context, runs fn, then cleans up', async () => {
      let capturedId = '';
      const result = await withTrace('MOD', 'act', async (ctx) => {
        capturedId = ctx.trace_id;
        expect(getContext(ctx.trace_id)).toBeDefined();
        return 42;
      });
      expect(result).toBe(42);
      expect(getContext(capturedId)).toBeUndefined();
    });

    it('cleans up even on error', async () => {
      let capturedId = '';
      await expect(
        withTrace('MOD', 'fail', async (ctx) => {
          capturedId = ctx.trace_id;
          throw new Error('boom');
        })
      ).rejects.toThrow('boom');
      expect(getContext(capturedId)).toBeUndefined();
    });
  });

  describe('extractTraceId', () => {
    it('extracts UUID string', () => {
      const uuid = generateTraceId();
      expect(extractTraceId(uuid)).toBe(uuid);
    });

    it('extracts pf- prefixed string', () => {
      expect(extractTraceId('pf-abc123')).toBe('pf-abc123');
    });

    it('extracts from object with trace_id', () => {
      const uuid = generateTraceId();
      expect(extractTraceId({ trace_id: uuid })).toBe(uuid);
    });

    it('extracts from object with traceId', () => {
      expect(extractTraceId({ traceId: 'pf-test' })).toBe('pf-test');
    });

    it('returns undefined for non-matching input', () => {
      expect(extractTraceId(42)).toBeUndefined();
      expect(extractTraceId(null)).toBeUndefined();
      expect(extractTraceId('random')).toBeUndefined();
    });
  });

  describe('getActiveTraceCount', () => {
    it('reflects active traces', () => {
      const before = getActiveTraceCount();
      const ctx = createTraceContext('COUNT', 'test');
      expect(getActiveTraceCount()).toBe(before + 1);
      endContext(ctx.trace_id);
      expect(getActiveTraceCount()).toBe(before);
    });
  });
});
