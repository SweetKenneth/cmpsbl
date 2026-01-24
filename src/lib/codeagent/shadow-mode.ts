/**
 * CodeAgent Shadow Mode — Simulated Code Generation for UI Testing
 * v1.0.0 — Provides mock responses when edge functions are unavailable
 * 
 * This allows the CodeAgent UI to function fully without backend dependencies
 */

// ═══════════════════════════════════════════════════════════════
// MOCK CODE TEMPLATES
// ═══════════════════════════════════════════════════════════════

const CODE_TEMPLATES: Record<string, string> = {
  edge_function: `// Substrate Edge Function Template
// Module: {{module}}
// Generated: {{timestamp}}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();
    
    // {{description}}
    const result = await processAction(action, payload);
    
    return new Response(JSON.stringify({
      success: true,
      data: result,
      module: '{{module}}',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function processAction(action: string, payload: unknown) {
  // Implementation: {{description}}
  console.log(\`Processing \${action}\`, payload);
  return { processed: true, action };
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
    }
  },
  
  features: {
    autoRecovery: true,
    telemetry: true,
    debugMode: false
  }
} as const;

export type {{module}}ConfigType = typeof {{module}}Config;`,

  prompt_refinement: `// Substrate Prompt Template
// Module: {{module}}
// Generated: {{timestamp}}

export const {{module}}Prompts = {
  systemPrompt: \`You are a specialized {{module}} agent within the Cognitive Substrate.
Your role: {{description}}

Guidelines:
- Be precise and deterministic
- Log all actions for auditability
- Respect rate limits and quotas
- Fail gracefully with helpful errors
\`,

  taskPrompt: (context: Record<string, unknown>) => \`
Execute the following task within {{module}} domain:

Context: \${JSON.stringify(context, null, 2)}

Remember to:
1. Validate inputs before processing
2. Return structured JSON responses
3. Include confidence scores when applicable
\`,

  errorPrompt: (error: string) => \`
An error occurred: \${error}

Analyze and suggest recovery actions.
\`
} as const;`,

  rls_policy: `-- Substrate RLS Policy
-- Module: {{module}}
-- Generated: {{timestamp}}
-- Description: {{description}}

-- Enable RLS on the target table
ALTER TABLE public.{{module}}_data ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "{{module}}_user_access" ON public.{{module}}_data
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Operators can access all data (read-only)
CREATE POLICY "{{module}}_operator_read" ON public.{{module}}_data
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'operator'
    )
  );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_{{module}}_user_id 
  ON public.{{module}}_data(user_id);`,

  rate_limit: `// Substrate Rate Limiter
// Module: {{module}}
// Generated: {{timestamp}}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipOnError: boolean;
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function createRateLimiter(config: RateLimitConfig) {
  const { maxRequests, windowMs, skipOnError } = config;
  
  return {
    // {{description}}
    check: (key: string): { allowed: boolean; remaining: number; resetAt: Date } => {
      const now = Date.now();
      const record = rateLimitStore.get(key);
      
      if (!record || now >= record.resetAt) {
        rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: maxRequests - 1, resetAt: new Date(now + windowMs) };
      }
      
      if (record.count >= maxRequests) {
        return { allowed: false, remaining: 0, resetAt: new Date(record.resetAt) };
      }
      
      record.count++;
      return { allowed: true, remaining: maxRequests - record.count, resetAt: new Date(record.resetAt) };
    },
    
    reset: (key: string) => {
      rateLimitStore.delete(key);
    }
  };
}

// Default rate limiter for {{module}}
export const {{module}}RateLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 60000,
  skipOnError: false
});`
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
  if (!shadowState.patterns.includes(request.changeType)) {
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
