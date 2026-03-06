/**
 * Memory Client — E2E Unit Tests
 * Validates store, recall, fact extraction, context building, and salience gating.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Track what gets stored
const insertedRows: any[] = [];
const invokedFunctions: any[] = [];

vi.mock('@/integrations/supabase/client', () => {
  const mockChain = () => {
    const chain: any = {
      select: () => chain,
      insert: (row: any) => {
        if (row) insertedRows.push(row);
        return Promise.resolve({ data: null, error: null });
      },
      update: () => chain,
      delete: () => chain,
      upsert: () => chain,
      eq: () => chain,
      neq: () => chain,
      lte: () => chain,
      gte: () => chain,
      order: () => chain,
      limit: () => Promise.resolve({ data: [], count: 0, error: null }),
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
    };
    return chain;
  };

  return {
    supabase: {
      from: () => mockChain(),
      functions: {
        invoke: (fn: string, opts: any) => {
          invokedFunctions.push({ fn, body: opts?.body });
          return Promise.resolve({ data: { memories: [] }, error: null });
        },
      },
      rpc: () => Promise.resolve({ data: null, error: null }),
    },
  };
});

import { MemoryClient } from '@/lib/memory/client';

describe('MemoryClient', () => {
  let client: MemoryClient;

  beforeEach(() => {
    insertedRows.length = 0;
    invokedFunctions.length = 0;
    client = new MemoryClient('test-agent', 'project');
    client.setUserId('user-123');
  });

  describe('Fact Extraction', () => {
    it('should extract "my X is Y" facts', () => {
      // Access private method via prototype
      const extractFacts = (client as any).extractFacts.bind(client);
      const facts = extractFacts('my name is Alice.');
      expect(facts.length).toBeGreaterThan(0);
      expect(facts[0].toLowerCase()).toContain('name');
    });

    it('should extract "I am" facts', () => {
      const extractFacts = (client as any).extractFacts.bind(client);
      const facts = extractFacts("I'm a software engineer.");
      expect(facts.length).toBeGreaterThan(0);
    });

    it('should extract preference facts', () => {
      const extractFacts = (client as any).extractFacts.bind(client);
      const facts = extractFacts('I prefer dark mode.');
      expect(facts.length).toBeGreaterThan(0);
    });

    it('should return empty for no-fact text', () => {
      const extractFacts = (client as any).extractFacts.bind(client);
      const facts = extractFacts('Hello there.');
      expect(facts.length).toBe(0);
    });

    it('should deduplicate identical facts', () => {
      const extractFacts = (client as any).extractFacts.bind(client);
      const facts = extractFacts('my dog is Max. my dog is Max.');
      // Set dedup should produce unique entries
      const unique = new Set(facts);
      expect(unique.size).toBe(facts.length);
    });
  });

  describe('Salience Estimation', () => {
    it('should give high salience to user facts', () => {
      const estimate = (client as any).estimateLocalSalience.bind(client);
      const score = estimate('my favorite color is blue', 'user_fact');
      expect(score).toBeGreaterThanOrEqual(0.7);
    });

    it('should give low salience to very short text', () => {
      const estimate = (client as any).estimateLocalSalience.bind(client);
      const score = estimate('hi', 'general');
      expect(score).toBeLessThan(0.5);
    });

    it('should clamp between 0 and 1', () => {
      const estimate = (client as any).estimateLocalSalience.bind(client);
      const score = estimate('a'.repeat(200), 'identity');
      expect(score).toBeLessThanOrEqual(1);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Context String Builder', () => {
    it('should return empty string for no memories', () => {
      expect(client.buildContextString([])).toBe('');
    });

    it('should build formatted context', () => {
      const memories = [
        { id: '1', content: 'User prefers dark mode', timestamp: new Date().toISOString(), relevance: 0.9, tier: 'hot' as const, memory_type: 'user_fact' },
        { id: '2', content: 'User is a developer', timestamp: new Date().toISOString(), relevance: 0.8, tier: 'warm' as const, memory_type: 'user_fact' },
      ];
      const context = client.buildContextString(memories);
      expect(context).toContain('Relevant context from memory');
      expect(context).toContain('dark mode');
      expect(context).toContain('developer');
    });

    it('should limit to 5 memories max', () => {
      const memories = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        content: `Memory ${i}`,
        timestamp: new Date().toISOString(),
        relevance: 1 - i * 0.05,
        tier: 'hot' as const,
      }));
      const context = client.buildContextString(memories);
      const lines = context.split('\n').filter(l => l.startsWith('-'));
      expect(lines.length).toBeLessThanOrEqual(5);
    });

    it('should sort by relevance descending', () => {
      const memories = [
        { id: '1', content: 'Low', timestamp: new Date().toISOString(), relevance: 0.1 },
        { id: '2', content: 'High', timestamp: new Date().toISOString(), relevance: 0.9 },
      ];
      const context = client.buildContextString(memories);
      const highIdx = context.indexOf('High');
      const lowIdx = context.indexOf('Low');
      expect(highIdx).toBeLessThan(lowIdx);
    });
  });

  describe('Store', () => {
    it('should store without throwing', async () => {
      await expect(client.store('Remember this fact')).resolves.not.toThrow();
    });

    it('should invoke substrate for high-salience facts', async () => {
      await client.store('my name is Alice.');
      // user_facts get 0.95 salience → should invoke pf-substrate
      const substrateCall = invokedFunctions.find(f => f.fn === 'pf-substrate');
      expect(substrateCall).toBeDefined();
    });
  });

  describe('Recall', () => {
    it('should return empty result gracefully on no data', async () => {
      const result = await client.recall('what is my name?');
      expect(result.memories).toBeInstanceOf(Array);
      expect(result.confidence).toBeDefined();
      expect(result.tiers_searched).toBeInstanceOf(Array);
    });
  });

  describe('Workload Storage', () => {
    it('should store workload without throwing', async () => {
      await expect(client.storeWorkload('Completed 5 tasks')).resolves.not.toThrow();
    });
  });

  describe('Provenance Builder', () => {
    it('should build valid provenance', () => {
      const build = (client as any).buildProvenance.bind(client);
      const prov = build('test_source');
      expect(prov.source).toBe('test_source');
      expect(prov.ingested_at).toBeTruthy();
      expect(prov.recall_count).toBe(0);
      expect(prov.lineage).toBeInstanceOf(Array);
      expect(prov.lineage.length).toBe(1);
    });
  });
});
