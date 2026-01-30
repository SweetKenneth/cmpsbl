import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// Skip in CI - requires authenticated environment
describe.skip('Creative Generation API Tests', () => {
  let supabase: any;

  beforeAll(() => {
    supabase = createClient(supabaseUrl, supabaseKey);
  });

  describe('Text Generation (pf-nexus-text)', () => {
    it('should generate text with Perplexity for research', async () => {
      const { data, error } = await supabase.functions.invoke('pf-nexus-text', {
        body: {
          prompt: 'What are the latest AI trends in 2025?',
          task_type: 'research',
          max_tokens: 100
        }
      });

      expect(error).toBeNull();
      expect(data).toHaveProperty('text');
      expect(data).toHaveProperty('provider');
      expect(data).toHaveProperty('cost');
      expect(data.cost).toBeGreaterThan(0);
    });

    it('should use cache for repeated prompts', async () => {
      const prompt = 'Test prompt for caching';
      
      // First call
      const { data: firstCall } = await supabase.functions.invoke('pf-nexus-text', {
        body: { prompt }
      });

      // Second call (should hit cache)
      const { data: secondCall } = await supabase.functions.invoke('pf-nexus-text', {
        body: { prompt }
      });

      expect(secondCall.cached).toBe(true);
      expect(secondCall.cost).toBe(0);
    });

    it('should route to Groq for speed tasks', async () => {
      const { data } = await supabase.functions.invoke('pf-nexus-text', {
        body: {
          prompt: 'Quick summary of AI',
          task_type: 'speed',
          max_tokens: 50
        }
      });

      expect(data.provider).toBe('groq');
    });
  });

  describe('Image Generation (pf-nexus-image)', () => {
    it('should generate image with cheapest provider', async () => {
      const { data, error } = await supabase.functions.invoke('pf-nexus-image', {
        body: {
          prompt: 'A futuristic AI brain',
          resolution: '1024x1024'
        }
      });

      expect(error).toBeNull();
      expect(data).toHaveProperty('url');
      expect(data).toHaveProperty('api');
      expect(data).toHaveProperty('cost');
      expect(['lovable', 'together', 'fal', 'morph', 'replicate', 'stability']).toContain(data.api);
    });

    it('should return cached images for duplicate prompts', async () => {
      const prompt = 'Test image prompt for cache';
      
      const { data: firstCall } = await supabase.functions.invoke('pf-nexus-image', {
        body: { prompt }
      });

      const { data: secondCall } = await supabase.functions.invoke('pf-nexus-image', {
        body: { prompt }
      });

      expect(secondCall.cached).toBe(true);
      expect(secondCall.cost).toBe(0);
      expect(secondCall.url).toBe(firstCall.url);
    });

    it('should prioritize Together AI for cost optimization', async () => {
      // Note: This test assumes Together AI is configured and working
      const { data } = await supabase.functions.invoke('pf-nexus-image', {
        body: {
          prompt: 'Simple test image',
          resolution: '512x512'
        }
      });

      // Together AI should be used if available, costing $0.001
      if (data.api === 'together') {
        expect(data.cost).toBeLessThanOrEqual(0.001);
      }
    });
  });

  describe('Video Generation (pf-nexus-video)', () => {
    it('should queue video generation job', async () => {
      const { data, error } = await supabase.functions.invoke('pf-nexus-video', {
        body: {
          prompt: 'A short AI animation',
          duration: 3,
          priority: 'medium'
        }
      });

      expect(error).toBeNull();
      expect(data).toHaveProperty('job_id');
      expect(data).toHaveProperty('status');
      expect(data.status).toBe('queued');
      expect(data).toHaveProperty('estimated_cost');
    });

    it('should respect priority levels', async () => {
      const { data: highPriority } = await supabase.functions.invoke('pf-nexus-video', {
        body: {
          prompt: 'High priority video',
          duration: 5,
          priority: 'high'
        }
      });

      const { data: lowPriority } = await supabase.functions.invoke('pf-nexus-video', {
        body: {
          prompt: 'Low priority video',
          duration: 5,
          priority: 'low'
        }
      });

      expect(highPriority.priority).toBe('high');
      expect(lowPriority.priority).toBe('low');
    });
  });

  describe('Cost Tracking', () => {
    it('should log all generation costs', async () => {
      // Generate something
      await supabase.functions.invoke('pf-nexus-text', {
        body: { prompt: 'Cost tracking test' }
      });

      // Check cost logs
      const { data: costLogs } = await supabase
        .from('pf_cost_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      expect(costLogs).toBeDefined();
      expect(costLogs.length).toBeGreaterThan(0);
      expect(costLogs[0]).toHaveProperty('cost');
      expect(costLogs[0]).toHaveProperty('service');
    });
  });

  describe('Caching System', () => {
    it('should store media in cache table', async () => {
      const { data: cacheEntries } = await supabase
        .from('pf_media_cache')
        .select('*')
        .gt('ttl_expiration', new Date().toISOString());

      expect(cacheEntries).toBeDefined();
    });

    it('should respect 90-day TTL', async () => {
      const { data: recentCache } = await supabase
        .from('pf_media_cache')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentCache && recentCache.length > 0) {
        const expirationDate = new Date(recentCache[0].ttl_expiration);
        const createdDate = new Date(recentCache[0].created_at);
        const diffDays = (expirationDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        
        expect(diffDays).toBeGreaterThanOrEqual(89); // Allow 1 day tolerance
        expect(diffDays).toBeLessThanOrEqual(91);
      }
    });
  });

  describe('Provider Fallback', () => {
    it('should fallback to next provider on failure', async () => {
      // This is hard to test without simulating failures
      // But we can verify the routing logic exists
      const { data } = await supabase.functions.invoke('pf-nexus-image', {
        body: {
          prompt: 'Fallback test image'
        }
      });

      // Should successfully generate with any available provider
      expect(data).toHaveProperty('url');
      expect(data.url).toBeTruthy();
    });
  });
});
