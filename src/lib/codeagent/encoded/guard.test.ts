/**
 * Encoded Guard Tests
 * Validates guardrail enforcement for Lov-baseline implementation
 */

import { describe, it, expect } from 'vitest';
import { 
  runEncodedGuard, 
  classifyChange, 
  extractAnchors, 
  detectNarrative,
  computeDiffStats,
} from './index';

describe('Encoded Guardrails', () => {
  describe('extractAnchors', () => {
    it('extracts named exports', () => {
      const code = `
        export function handleRequest() {}
        export const CONFIG = {};
        export class MyService {}
      `;
      const anchors = extractAnchors(code);
      expect(anchors.exports).toContain('handleRequest');
      expect(anchors.exports).toContain('CONFIG');
      expect(anchors.exports).toContain('MyService');
    });

    it('detects default exports', () => {
      const code = `export default function main() {}`;
      const anchors = extractAnchors(code);
      expect(anchors.hasDefaultExport).toBe(true);
    });

    it('detects Deno.serve entrypoint', () => {
      const code = `Deno.serve(async (req) => { return new Response("ok"); });`;
      const anchors = extractAnchors(code);
      expect(anchors.entrypoints).toContain('Deno.serve');
    });

    it('detects handler functions', () => {
      const code = `async function handleRequest(req: Request) {}`;
      const anchors = extractAnchors(code);
      expect(anchors.handlers).toContain('handleRequest');
    });
  });

  describe('detectNarrative', () => {
    it('detects narrative patterns', () => {
      const code = `console.log("Sorry, I'm recovering from a glitch in my neural network");`;
      const result = detectNarrative(code);
      expect(result.detected).toBe(true);
    });

    it('passes clean code', () => {
      const code = `export function processData(input: string) { return input.trim(); }`;
      const result = detectNarrative(code);
      expect(result.detected).toBe(false);
    });
  });

  describe('computeDiffStats', () => {
    it('computes correct stats for additions', () => {
      const before = 'line1\nline2';
      const after = 'line1\nline2\nline3';
      const stats = computeDiffStats(before, after);
      expect(stats.added).toBe(1);
      expect(stats.removed).toBe(0);
      expect(stats.changed).toBe(0);
    });

    it('computes correct stats for removals', () => {
      const before = 'line1\nline2\nline3';
      const after = 'line1\nline2';
      const stats = computeDiffStats(before, after);
      expect(stats.removed).toBe(1);
    });
  });

  describe('classifyChange', () => {
    it('classifies additive changes', () => {
      const before = 'export function a() {}';
      const after = 'export function a() {}\nexport function b() {}';
      const anchorsBefore = extractAnchors(before);
      const anchorsAfter = extractAnchors(after);
      const result = classifyChange(before, after, anchorsBefore, anchorsAfter);
      expect(result).toBe('additive');
    });

    it('classifies comment-only changes', () => {
      const before = 'export function a() {}';
      const after = '// Added comment\nexport function a() {}';
      const anchorsBefore = extractAnchors(before);
      const anchorsAfter = extractAnchors(after);
      const result = classifyChange(before, after, anchorsBefore, anchorsAfter);
      expect(result).toBe('comment_only');
    });

    it('classifies destructive changes when exports are removed', () => {
      const before = 'export function a() {}\nexport function b() {}';
      const after = 'export function a() {}';
      const anchorsBefore = extractAnchors(before);
      const anchorsAfter = extractAnchors(after);
      const result = classifyChange(before, after, anchorsBefore, anchorsAfter);
      expect(result).toBe('destructive');
    });
  });

  describe('runEncodedGuard', () => {
    it('blocks destructive changes without approval', () => {
      const before = 'export function a() {}\nexport function b() {}';
      const after = 'export function a() {}';
      const result = runEncodedGuard(before, after, false);
      expect(result.ok).toBe(false);
      expect(result.changeClass).toBe('destructive');
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('allows destructive changes with approval', () => {
      const before = 'export function a() {}\nexport function b() {}';
      const after = 'export function a() {}';
      const result = runEncodedGuard(before, after, true);
      expect(result.ok).toBe(true);
    });

    it('blocks narrative code regardless of approval', () => {
      const before = 'export function a() {}';
      const after = 'export function a() { console.log("Sorry, I am an AI"); }';
      const result = runEncodedGuard(before, after, true);
      expect(result.ok).toBe(false);
      expect(result.reasons.some(r => r.includes('Narrative'))).toBe(true);
    });

    it('allows additive changes without approval', () => {
      const before = 'export function a() {}';
      const after = 'export function a() {}\nexport function b() {}';
      const result = runEncodedGuard(before, after, false);
      expect(result.ok).toBe(true);
      expect(result.changeClass).toBe('additive');
    });

    it('tracks anchors preservation', () => {
      const before = 'export function handleRequest() {}';
      const after = 'export function handleRequest() { return "ok"; }';
      const result = runEncodedGuard(before, after, false);
      expect(result.anchorsPreserved).toBe(true);
      expect(result.anchorsBefore.exports).toContain('handleRequest');
      expect(result.anchorsAfter.exports).toContain('handleRequest');
    });
  });
});
