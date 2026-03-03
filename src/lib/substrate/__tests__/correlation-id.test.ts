/**
 * Correlation ID System — Unit Tests
 * Validates trace propagation, span lifecycle, and memory bounds
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateCorrelationId,
  createContext,
  forkContext,
  startSpan,
  endSpan,
  getTrace,
  extractHeaders,
  getActiveContexts,
  getAllSpans,
  cleanupContexts,
} from '../correlation-id/index';

describe('Correlation ID System', () => {
  beforeEach(() => {
    cleanupContexts(0); // clear all
  });

  describe('ID generation', () => {
    it('produces unique IDs', () => {
      const ids = new Set(Array.from({ length: 200 }, () => generateCorrelationId()));
      expect(ids.size).toBe(200);
    });

    it('follows expected format', () => {
      const id = generateCorrelationId();
      expect(id).toMatch(/^cid-/);
    });
  });

  describe('Context lifecycle', () => {
    it('creates root context', () => {
      const ctx = createContext('TEST', 'unit-test');
      expect(ctx.correlationId).toBeTruthy();
      expect(ctx.parentId).toBeNull();
      expect(ctx.rootId).toBe(ctx.correlationId);
      expect(ctx.moduleId).toBe('TEST');
    });

    it('forks child context with parent linkage', () => {
      const root = createContext('PARENT', 'root-op');
      const child = forkContext(root, 'CHILD', 'child-op');
      expect(child.parentId).toBe(root.correlationId);
      expect(child.rootId).toBe(root.rootId);
      expect(child.moduleId).toBe('CHILD');
    });

    it('inherits metadata on fork', () => {
      const root = createContext('PARENT', 'op', { tenant: 'acme' });
      const child = forkContext(root, 'CHILD', 'child-op');
      expect(child.metadata.tenant).toBe('acme');
    });
  });

  describe('Span tracking', () => {
    it('creates and completes spans', () => {
      const ctx = createContext('MOD', 'op');
      const span = startSpan(ctx, 'db-query');
      expect(span.status).toBe('active');
      expect(span.durationMs).toBeNull();

      endSpan(span);
      expect(span.status).toBe('completed');
      expect(span.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('marks failed spans', () => {
      const ctx = createContext('MOD', 'op');
      const span = startSpan(ctx);
      endSpan(span, 'failed');
      expect(span.status).toBe('failed');
    });
  });

  describe('Trace retrieval', () => {
    it('returns spans for a root correlation', () => {
      const ctx = createContext('MOD', 'flow');
      startSpan(ctx, 'step-1');
      startSpan(ctx, 'step-2');
      const trace = getTrace(ctx.rootId);
      expect(trace.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Header extraction', () => {
    it('extracts propagation headers', () => {
      const ctx = createContext('MOD', 'op');
      const headers = extractHeaders(ctx);
      expect(headers['x-correlation-id']).toBe(ctx.correlationId);
      expect(headers['x-root-id']).toBe(ctx.rootId);
      expect(headers['x-module-id']).toBe('MOD');
    });
  });

  describe('Memory bounding', () => {
    it('caps spans at MAX_SPANS with eviction', () => {
      const ctx = createContext('MOD', 'stress');
      // Push well over the cap
      for (let i = 0; i < 5100; i++) {
        startSpan(ctx, `op-${i}`);
      }
      const all = getAllSpans();
      expect(all.length).toBeLessThanOrEqual(5000);
    });

    it('cleanupContexts removes stale entries', () => {
      createContext('OLD', 'stale');
      const removed = cleanupContexts(0); // 0ms = everything is stale
      expect(removed).toBeGreaterThan(0);
      expect(getActiveContexts().length).toBe(0);
    });
  });
});
