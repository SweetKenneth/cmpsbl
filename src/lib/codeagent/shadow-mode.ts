/**
 * CodeAgent Shadow Mode — Simulated Code Generation for UI Testing
 * Provides mock responses when edge functions are unavailable
 * 
 * This allows the CodeAgent UI to function fully without backend dependencies
 */

// ═══════════════════════════════════════════════════════════════
// EXTENSIVE CODE TEMPLATES — Matching Real Substrate Patterns
// ═══════════════════════════════════════════════════════════════

const CODE_TEMPLATES: Record<string, string> = {
  edge_function: `// Substrate Edge Function Template
// Module: {{module}}
// Generated: {{timestamp}}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, payload } = await req.json(); if (typeof action !== 'string' || !payload || typeof payload !== 'object') throw new Error('Invalid input');
    
    // {{description}}
    const result = await processAction(action, payload, supabaseClient);
    
    // Log success to brain_events
    await supabaseClient.from('brain_events').insert({
      module: '{{module}}',
      event_type: action,
      outcome: 'success',
      data: { latency_ms: Date.now() }
    });
    
    return new Response(JSON.stringify({
      success: true,
      data: result,
      module: '{{module}}',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[{{module}}] Error:', error.message);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      module: '{{module}}'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function processAction(
  action: string, 
  payload: unknown, 
  supabase: ReturnType<typeof createClient>
) {
  // Implementation: {{description}}
  console.log(\`[{{module}}] Processing \${action}\`, payload);
  
  switch (action) {
    case 'status':
      return { status: 'operational', module: '{{module}}' };
    case 'process':
      return { processed: true, action };
    default:
      throw new Error(\`Unknown action: \${action}\`);
  }
}`,

  config_update: `// Substrate Configuration Update
// Module: {{module}}
// Generated: {{timestamp}}

export const {{module}}Config = {
  version: '1.0.0',
  enabled: true,
  
  // {{description}}
  settings: {
    maxRetries: 3,
    timeout: 30000,
    rateLimit: {
      requests: 100,
      window: '1m'
    },
    circuitBreaker: {
      failureThreshold: 3,
      recoveryTimeout: 60000,
      halfOpenRequests: 1
    }
  },
  
  features: {
    autoRecovery: true,
    telemetry: true,
    debugMode: import.meta.env.DEV,
    caching: {
      enabled: true,
      ttl: 300000 // 5 minutes
    }
  },
  
  endpoints: {
    primary: '/api/{{module}}',
    health: '/api/{{module}}/health',
    metrics: '/api/{{module}}/metrics'
  }
} as const;

export type {{module}}ConfigType = typeof {{module}}Config;

// Validation
export function validate{{module}}Config(config: Partial<{{module}}ConfigType>): boolean {
  if (!config.settings?.maxRetries || config.settings.maxRetries < 1) return false;
  if (!config.settings?.timeout || config.settings.timeout < 1000) return false;
  return true;
}`,

  prompt_refinement: `// Substrate Prompt Template
// Module: {{module}}
// Generated: {{timestamp}}

export const {{module}}Prompts = {
  systemPrompt: \`You are a specialized {{module}} agent within the Cognitive Substrate.
Your role: {{description}}

Core Principles:
- Be precise, deterministic, and predictable
- Log all actions for auditability and learning
- Respect rate limits, quotas, and resource constraints
- Fail gracefully with helpful, actionable errors
- Learn from outcomes to improve future responses

Context Awareness:
- You have access to brain memories and learned patterns
- You can query the knowledge bank for relevant skills
- You should consider past successes and failures
\`,

  taskPrompt: (context: Record<string, unknown>) => \`
Execute the following task within {{module}} domain:

Context:
\${JSON.stringify(context, null, 2)}

Instructions:
1. Validate all inputs before processing
2. Return structured JSON responses
3. Include confidence scores when applicable
4. Log key decisions and their rationale
5. Handle edge cases gracefully
\`,

  errorPrompt: (error: string, context?: Record<string, unknown>) => \`
An error occurred during {{module}} execution:
Error: \${error}
Context: \${context ? JSON.stringify(context, null, 2) : 'None provided'}

Analyze and suggest:
1. Root cause of the error
2. Immediate recovery actions
3. Preventive measures for future
4. Whether escalation is needed
\`,

  learningPrompt: (outcome: 'success' | 'partial' | 'failure', data: Record<string, unknown>) => \`
Record learning from {{module}} task:
Outcome: \${outcome}
Data: \${JSON.stringify(data, null, 2)}

Extract:
1. What worked well
2. What could be improved
3. New patterns to remember
4. Updates to confidence scores
\`
} as const;`,

  rls_policy: `-- Substrate RLS Policy
-- Module: {{module}}
-- Generated: {{timestamp}}
-- Description: {{description}}

-- Enable RLS on the target table
ALTER TABLE public.{{module}}_data ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "{{module}}_user_select" ON public.{{module}}_data
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "{{module}}_user_insert" ON public.{{module}}_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "{{module}}_user_update" ON public.{{module}}_data
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "{{module}}_user_delete" ON public.{{module}}_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Operators can read all data
CREATE POLICY "{{module}}_operator_read" ON public.{{module}}_data
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'operator'
    )
  );

-- Policy: Service role has full access (for edge functions)
CREATE POLICY "{{module}}_service_role" ON public.{{module}}_data
  FOR ALL
  USING (auth.role() = 'service_role');

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_{{module}}_user_id 
  ON public.{{module}}_data(user_id);

CREATE INDEX IF NOT EXISTS idx_{{module}}_created_at 
  ON public.{{module}}_data(created_at DESC);`,

  rate_limit: `// Substrate Rate Limiter
// Module: {{module}}
// Generated: {{timestamp}}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipOnError: boolean;
  keyGenerator?: (req: unknown) => string;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
  blocked: boolean;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function createRateLimiter(config: RateLimitConfig) {
  const { maxRequests, windowMs, skipOnError } = config;
  
  return {
    // {{description}}
    check: (key: string): { allowed: boolean; remaining: number; resetAt: Date; retryAfter?: number } => {
      const now = Date.now();
      const record = rateLimitStore.get(key);
      
      // New or expired window
      if (!record || now >= record.resetAt) {
        rateLimitStore.set(key, { count: 1, resetAt: now + windowMs, blocked: false });
        return { allowed: true, remaining: maxRequests - 1, resetAt: new Date(now + windowMs) };
      }
      
      // Check if blocked
      if (record.count >= maxRequests) {
        const retryAfter = Math.ceil((record.resetAt - now) / 1000);
        return { allowed: false, remaining: 0, resetAt: new Date(record.resetAt), retryAfter };
      }
      
      // Increment and allow
      record.count++;
      return { allowed: true, remaining: maxRequests - record.count, resetAt: new Date(record.resetAt) };
    },
    
    reset: (key: string) => {
      rateLimitStore.delete(key);
    },
    
    getStats: () => ({
      activeKeys: rateLimitStore.size,
      config: { maxRequests, windowMs }
    })
  };
}

// Default rate limiter for {{module}}
export const {{module}}RateLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 60000,
  skipOnError: false
});`,

  // NEW TEMPLATES
  
  react_component: `// Substrate React Component
// Module: {{module}}
// Generated: {{timestamp}}

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface {{module}}Props {
  enabled?: boolean;
  className?: string;
  onComplete?: (result: unknown) => void;
}

export function {{module}}Component({ enabled = true, className, onComplete }: {{module}}Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  // {{description}}
  const handleAction = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Implement action logic here
      const result = await new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
      setData(result);
      onComplete?.(result);
      toast.success('Action completed successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error('Action failed', { description: message });
    } finally {
      setLoading(false);
    }
  }, [onComplete]);

  if (!enabled) {
    return (
      <Card className={cn("border-dashed border-muted", className)}>
        <CardContent className="py-8 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{{module}} is disabled</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {{module}}
          <Badge variant="outline" className="text-xs">v1.0.0</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAction} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Execute
            </>
          )}
        </Button>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}`,

  react_hook: `// Substrate React Hook
// Module: {{module}}
// Generated: {{timestamp}}

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Use{{module}}Options {
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

interface {{module}}State {
  isLoading: boolean;
  isError: boolean;
  data: unknown;
  error: Error | null;
}

// {{description}}
export function use{{module}}(options: Use{{module}}Options = {}) {
  const { enabled = true, refetchInterval, onSuccess, onError } = options;
  const queryClient = useQueryClient();

  // Query for fetching data
  const query = useQuery({
    queryKey: ['{{module}}'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('{{module}}_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
    enabled,
    refetchInterval,
  });

  // Mutation for creating/updating
  const mutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('{{module}}_data')
        .upsert(payload)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['{{module}}'] });
      onSuccess?.(data);
      toast.success('{{module}} updated successfully');
    },
    onError: (error) => {
      onError?.(error);
      toast.error('Failed to update {{module}}', { description: error.message });
    },
  });

  return {
    ...query,
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isMutating: mutation.isPending,
    refetch: query.refetch,
  };
}`,

  api_client: `// Substrate API Client
// Module: {{module}}
// Generated: {{timestamp}}

import { supabase } from '@/integrations/supabase/client';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    latency_ms: number;
    cached: boolean;
  };
}

interface {{module}}ApiOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

// {{description}}
export class {{module}}Api {
  private baseOptions: {{module}}ApiOptions;
  
  constructor(options: {{module}}ApiOptions = {}) {
    this.baseOptions = {
      timeout: options.timeout ?? 30000,
      retries: options.retries ?? 3,
      cache: options.cache ?? true,
    };
  }

  async invoke<T>(action: string, payload?: unknown): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < (this.baseOptions.retries ?? 1); attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke('pf-{{module}}', {
          body: { action, payload },
        });
        
        if (error) throw error;
        
        return {
          success: true,
          data: data as T,
          metadata: {
            latency_ms: Date.now() - startTime,
            cached: false,
          },
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(\`[{{module}}Api] Attempt \${attempt + 1} failed:\`, lastError.message);
        
        // Exponential backoff
        if (attempt < (this.baseOptions.retries ?? 1) - 1) {
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    return {
      success: false,
      error: lastError?.message ?? 'All retries exhausted',
    };
  }

  async status(): Promise<ApiResponse<{ version: string; healthy: boolean }>> {
    return this.invoke('status');
  }
}

export const {{module}}Client = new {{module}}Api();`,

  database_migration: `-- Substrate Database Migration
-- Module: {{module}}
-- Generated: {{timestamp}}
-- Description: {{description}}

-- Create the main table
CREATE TABLE IF NOT EXISTS public.{{module}}_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core fields
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'failed')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.{{module}}_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "{{module}}_select_own" ON public.{{module}}_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "{{module}}_insert_own" ON public.{{module}}_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "{{module}}_update_own" ON public.{{module}}_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "{{module}}_delete_own" ON public.{{module}}_data
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_{{module}}_user_id ON public.{{module}}_data(user_id);
CREATE INDEX idx_{{module}}_status ON public.{{module}}_data(status);
CREATE INDEX idx_{{module}}_created_at ON public.{{module}}_data(created_at DESC);
CREATE INDEX idx_{{module}}_tags ON public.{{module}}_data USING GIN(tags);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_{{module}}_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER {{module}}_updated_at
  BEFORE UPDATE ON public.{{module}}_data
  FOR EACH ROW
  EXECUTE FUNCTION update_{{module}}_updated_at();`,

  test_suite: `// Substrate Test Suite
// Module: {{module}}
// Generated: {{timestamp}}

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// {{description}}

describe('{{module}} Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      // Test implementation
      expect(true).toBe(true);
    });

    it('should handle custom config', () => {
      // Test implementation
      expect(true).toBe(true);
    });
  });

  describe('core functionality', () => {
    it('should process valid input', async () => {
      const input = { data: 'test' };
      // const result = await process{{module}}(input);
      // expect(result.success).toBe(true);
      expect(true).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      const invalidInput = null;
      // await expect(process{{module}}(invalidInput)).rejects.toThrow();
      expect(true).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should retry on transient failures', async () => {
      // Test retry logic
      expect(true).toBe(true);
    });

    it('should respect rate limits', async () => {
      // Test rate limiting
      expect(true).toBe(true);
    });
  });

  describe('integration', () => {
    it('should integrate with brain module', async () => {
      // Test brain integration
      expect(true).toBe(true);
    });
  });
});`,

  utility_function: `// Substrate Utility Functions
// Module: {{module}}
// Generated: {{timestamp}}

// {{description}}

/**
 * Safely parse JSON with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(
        (result[key] as Record<string, unknown>) || {},
        source[key] as Record<string, unknown>
      ) as T[Extract<keyof T, string>];
    } else {
      result[key] = source[key] as T[Extract<keyof T, string>];
    }
  }
  
  return result;
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError ?? new Error('All retries exhausted');
}

/**
 * Create a debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let value = bytes;
  
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  
  return \`\${value.toFixed(1)} \${units[unitIndex]}\`;
}

/**
 * Generate a unique ID
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return prefix ? \`\${prefix}_\${timestamp}\${randomPart}\` : \`\${timestamp}\${randomPart}\`;
}`,

  type_definitions: `// Substrate Type Definitions
// Module: {{module}}
// Generated: {{timestamp}}

// {{description}}

// ═══════════════════════════════════════════════════════════════
// BASE TYPES
// ═══════════════════════════════════════════════════════════════

export interface {{module}}Base {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface {{module}}Config {
  enabled: boolean;
  version: string;
  settings: {{module}}Settings;
}

export interface {{module}}Settings {
  timeout: number;
  retries: number;
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
}

// ═══════════════════════════════════════════════════════════════
// REQUEST/RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

export interface {{module}}Request {
  action: string;
  payload?: unknown;
  options?: {
    timeout?: number;
    priority?: 'low' | 'medium' | 'high';
  };
}

export interface {{module}}Response<T = unknown> {
  success: boolean;
  data?: T;
  error?: {{module}}Error;
  metadata?: {
    latencyMs: number;
    cached: boolean;
    provider?: string;
  };
}

export interface {{module}}Error {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  recoverable: boolean;
}

// ═══════════════════════════════════════════════════════════════
// STATUS TYPES
// ═══════════════════════════════════════════════════════════════

export type {{module}}Status = 'idle' | 'loading' | 'success' | 'error';

export interface {{module}}Health {
  status: 'healthy' | 'degraded' | 'down';
  score: number;
  lastCheck: Date;
  issues: string[];
}

// ═══════════════════════════════════════════════════════════════
// EVENT TYPES
// ═══════════════════════════════════════════════════════════════

export interface {{module}}Event {
  type: string;
  timestamp: Date;
  module: '{{module}}';
  data: unknown;
  outcome?: 'success' | 'failure' | 'partial';
}

export type {{module}}EventHandler = (event: {{module}}Event) => void | Promise<void>;`
};

// ═══════════════════════════════════════════════════════════════
// SHADOW MODE STATE
// ═══════════════════════════════════════════════════════════════

interface ShadowState {
  enabled: boolean;
  generatedCount: number;
  patterns: string[];
  lastGeneration: Date | null;
  simulatedLatency: number;
}

const shadowState: ShadowState = {
  enabled: true, // Always enabled since edge functions aren't available
  generatedCount: 0,
  patterns: [],
  lastGeneration: null,
  simulatedLatency: 800, // Simulate realistic latency
};

// ═══════════════════════════════════════════════════════════════
// SHADOW MODE API
// ═══════════════════════════════════════════════════════════════

export function isShadowModeActive(): boolean {
  return shadowState.enabled;
}

export function getShadowModeStatus(): {
  active: boolean;
  generated: number;
  patterns: number;
  lastGeneration: string | null;
} {
  return {
    active: shadowState.enabled,
    generated: shadowState.generatedCount,
    patterns: shadowState.patterns.length,
    lastGeneration: shadowState.lastGeneration?.toISOString() || null,
  };
}

export interface ShadowGenerationRequest {
  module: string;
  changeType: string;
  description: string;
  filePath?: string;
}

export interface ShadowGenerationResult {
  success: boolean;
  code: string;
  filePath: string;
  operation: 'create' | 'modify';
  confidence: number;
  provider: string;
  model: string;
  latencyMs: number;
  validation: {
    safe: boolean;
    issues: string[];
  };
  shadowMode: true;
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate code in shadow mode (simulated)
 */
export async function shadowGenerate(
  request: ShadowGenerationRequest
): Promise<ShadowGenerationResult> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, shadowState.simulatedLatency));
  
  const template = CODE_TEMPLATES[request.changeType] || CODE_TEMPLATES.edge_function;
  
  const code = fillTemplate(template, {
    module: capitalize(request.module),
    description: request.description,
    timestamp: new Date().toISOString(),
  });
  
  // Determine file path based on change type
  let filePath = request.filePath;
  if (!filePath) {
    switch (request.changeType) {
      case 'edge_function':
        filePath = `supabase/functions/pf-${request.module}/index.ts`;
        break;
      case 'config_update':
        filePath = `src/config/${request.module}.config.ts`;
        break;
      case 'prompt_refinement':
        filePath = `src/prompts/${request.module}.prompts.ts`;
        break;
      case 'rls_policy':
        filePath = `supabase/migrations/shadow_${Date.now()}_${request.module}_rls.sql`;
        break;
      case 'rate_limit':
        filePath = `src/lib/${request.module}/rate-limiter.ts`;
        break;
      default:
        filePath = `src/lib/${request.module}/improvement.ts`;
    }
  }
  
  // Update shadow state
  shadowState.generatedCount++;
  shadowState.lastGeneration = new Date();
  if (!shadowState.patterns.includes(request.changeType) && shadowState.patterns.length < 50) {
    shadowState.patterns.push(request.changeType);
  }
  
  // Simulate validation (always passes in shadow mode with minor warnings)
  const validation = {
    safe: true,
    issues: [
      'Shadow mode: Code not verified against live services',
      'Review before deploying to production',
    ],
  };
  
  return {
    success: true,
    code,
    filePath,
    operation: 'create',
    confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
    provider: 'shadow-mode',
    model: 'template-v1',
    latencyMs: shadowState.simulatedLatency + Math.random() * 200,
    validation,
    shadowMode: true,
  };
}

/**
 * Simulate code validation in shadow mode
 */
export async function shadowValidate(code: string): Promise<{
  valid: boolean;
  issues: string[];
  complexity: 'low' | 'medium' | 'high';
  metrics: {
    lines: number;
    functions: number;
    imports: number;
    async_ops: number;
  };
}> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const lines = code.split('\n').length;
  const functions = (code.match(/function\s+\w+/g) || []).length + 
                   (code.match(/=>\s*{/g) || []).length;
  const imports = (code.match(/import\s+/g) || []).length;
  const asyncOps = (code.match(/async\s+/g) || []).length + 
                   (code.match(/await\s+/g) || []).length;
  
  const complexity = lines > 100 ? 'high' : lines > 50 ? 'medium' : 'low';
  
  return {
    valid: true,
    issues: [],
    complexity,
    metrics: {
      lines,
      functions,
      imports,
      async_ops: asyncOps,
    },
  };
}

/**
 * Simulate sandbox execution in shadow mode
 */
export async function shadowExecute(code: string): Promise<{
  success: boolean;
  output: string;
  analysis: {
    complexity: string;
    safe: boolean;
    recommendations: string[];
  };
}> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    output: `[Shadow Mode] Code analysis complete:\n` +
            `- ${code.split('\n').length} lines analyzed\n` +
            `- No syntax errors detected\n` +
            `- Ready for review`,
    analysis: {
      complexity: 'medium',
      safe: true,
      recommendations: [
        'Add unit tests before deployment',
        'Review error handling paths',
        'Consider adding telemetry hooks',
      ],
    },
  };
}

/**
 * Get simulated coder status
 */
export function getShadowCoderStatus() {
  return {
    success: true,
    version: '1.1.0-shadow',
    free_tier_router: 'active (simulated)',
    learned_patterns: shadowState.patterns.length + 12, // Base patterns + learned
    generated_today: shadowState.generatedCount,
    rate_limits: {
      groq: '0/30 used',
      cerebras: '0/50 used',
      together: '0/25 used',
    },
  };
}

/**
 * Get simulated sandbox status
 */
export function getShadowSandboxStatus() {
  return {
    success: true,
    version: '1.0.0-shadow',
    mode: 'validation',
    capabilities: ['syntax_check', 'complexity_analysis', 'pattern_detection'],
    status: 'ready',
  };
}
