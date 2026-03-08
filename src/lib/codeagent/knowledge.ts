/**
 * CodeAgent Knowledge System
 * Knowledge graph, bank, boundaries, and confidence assessment
 */

export interface KnowledgeEntry {
  id: string;
  category: 'pattern' | 'boundary' | 'skill' | 'heuristic' | 'error';
  title: string;
  content: string;
  confidence: number;
  useCount: number;
  successRate: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ActionAssessment {
  canProceed: boolean;
  confidenceLevel: 'high' | 'medium' | 'low' | 'unknown';
  requiresApproval: boolean;
  warnings: string[];
  suggestions: string[];
  relatedKnowledge: KnowledgeEntry[];
  rollbackAvailable: boolean;
}

export interface CodeAgentBoundaries {
  maxFileSize: number;          // Max lines of code to generate
  allowedModules: string[];     // Modules agent can modify
  forbiddenPatterns: string[];  // Patterns agent must never generate
  requiredPatterns: string[];   // Patterns that must be included
  complexityThreshold: number;  // Max complexity before requiring approval
}

// ═══════════════════════════════════════════════════════════════
// AGENT BOUNDARIES — Defines what the CodeAgent can/cannot do
// ═══════════════════════════════════════════════════════════════

export const CODEAGENT_BOUNDARIES: CodeAgentBoundaries = {
  maxFileSize: 300,
  allowedModules: [
    'brain',
    'defense', 
    'nexus',
    'vision',
    'dream',
    'system',
    'decode',
    'access',
    'ripple',
    'cascade',
    'pulse'
  ],
  forbiddenPatterns: [
    'eval(',
    'new Function(',
    'dangerouslySetInnerHTML',
    // Note: SUPABASE_SERVICE_ROLE_KEY is allowed via Deno.env.get() in edge functions
    // Only block hardcoded key values, not references to env vars
    'process.exit',
    'child_process',
    'fs.rmSync',
    'DROP TABLE',
    'TRUNCATE',
  ],
  /** Regex patterns for more complex forbidden checks */
  forbiddenRegexPatterns: [
    /DELETE\s+FROM\s+\S+\s+WHERE\s+1\s*=\s*1/i,
  ] as readonly RegExp[],
  requiredPatterns: [
    'corsHeaders',  // Edge functions need CORS
    'try {',        // Error handling required
    'catch',
  ],
  complexityThreshold: 50  // Lines requiring approval for complex changes
};

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE BANK — Pre-loaded coding skills and patterns
// ═══════════════════════════════════════════════════════════════

export const CORE_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'k_edge_function_structure',
    category: 'pattern',
    title: 'Edge Function Structure',
    content: `Edge functions use Deno and must:
1. Import serve from "https://deno.land/std@0.168.0/http/server.ts"
2. Define corsHeaders object
3. Handle OPTIONS requests for CORS
4. Use try/catch with proper error responses
5. Return Response objects with JSON and cors headers`,
    confidence: 0.95,
    useCount: 0,
    successRate: 0.92,
    tags: ['edge_function', 'deno', 'structure'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'k_supabase_client',
    category: 'pattern',
    title: 'Supabase Client Usage',
    content: `Client-side: import { supabase } from "@/integrations/supabase/client"
Edge functions: import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
Always use SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in edge functions.
Never import from src/integrations in edge functions.`,
    confidence: 0.98,
    useCount: 0,
    successRate: 0.95,
    tags: ['supabase', 'client', 'imports'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'k_rls_policies',
    category: 'pattern',
    title: 'RLS Policy Patterns',
    content: `RLS policies must use auth.uid() for user-scoped data.
Common patterns:
- SELECT: USING (auth.uid() = user_id)
- INSERT: WITH CHECK (auth.uid() = user_id)
- UPDATE: USING (auth.uid() = user_id)
- DELETE: USING (auth.uid() = user_id)
Always include rollback SQL for policy changes.`,
    confidence: 0.90,
    useCount: 0,
    successRate: 0.88,
    tags: ['rls', 'security', 'database'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'k_free_tier_router',
    category: 'skill',
    title: 'Free-Tier Router Usage',
    content: `Use callFreeTierAI for all AI calls in edge functions.
Import: import { callFreeTierAI } from "../_shared/free-tier-router.ts"
Options: { systemPrompt, temperature, maxTokens, priority }
Priority options: 'speed' | 'reliability' | 'cost'
Returns: { content, model, provider, healthScore, latencyMs }`,
    confidence: 0.95,
    useCount: 0,
    successRate: 0.90,
    tags: ['ai', 'router', 'free-tier'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'k_error_handling',
    category: 'pattern',
    title: 'Error Handling Pattern',
    content: `Always wrap main logic in try/catch.
Return structured error response:
return new Response(JSON.stringify({
  success: false,
  error: error instanceof Error ? error.message : 'Unknown error'
}), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });`,
    confidence: 0.92,
    useCount: 0,
    successRate: 0.94,
    tags: ['error', 'handling', 'response'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'b_no_direct_auth_users',
    category: 'boundary',
    title: 'Never Reference auth.users Directly',
    content: `NEVER create foreign keys to auth.users table.
Instead, create a profiles table in public schema.
Use user_id UUID NOT NULL (without FK constraint) for user references.
The auth schema is managed by Supabase and should not be modified.`,
    confidence: 0.99,
    useCount: 0,
    successRate: 1.0,
    tags: ['auth', 'boundary', 'database'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'b_no_secrets_in_code',
    category: 'boundary',
    title: 'Never Hardcode Secrets',
    content: `NEVER hardcode API keys or secrets in code.
Use Deno.env.get('SECRET_NAME') in edge functions.
Use import.meta.env.VITE_* for client-side public vars only.
Private keys must be stored in Supabase secrets.`,
    confidence: 0.99,
    useCount: 0,
    successRate: 1.0,
    tags: ['security', 'secrets', 'boundary'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'b_read_before_write',
    category: 'boundary',
    title: 'Always Read Before Write',
    content: `NEVER modify a file without first reading its current content.
Check if file exists and understand its structure.
Preserve existing functionality when modifying.
Use line-replace for small changes, full write only for new files.`,
    confidence: 0.98,
    useCount: 0,
    successRate: 0.95,
    tags: ['workflow', 'safety', 'boundary'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'h_complexity_check',
    category: 'heuristic',
    title: 'Complexity Assessment',
    content: `Low complexity (auto-proceed): config changes, simple functions <30 lines
Medium complexity (advise): new edge functions, component modifications
High complexity (require approval): schema changes, auth flows, breaking changes
Always assess complexity before generating code.`,
    confidence: 0.85,
    useCount: 0,
    successRate: 0.80,
    tags: ['complexity', 'heuristic', 'workflow'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// ═══════════════════════════════════════════════════════════════
// ASSESSMENT FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function assessAction(
  action: string,
  module: string,
  changeType: string,
  knowledge: KnowledgeEntry[]
): ActionAssessment {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  const relatedKnowledge: KnowledgeEntry[] = [];
  
  // Check module is allowed
  if (!CODEAGENT_BOUNDARIES.allowedModules.includes(module)) {
    warnings.push(`Module '${module}' is not in allowed list`);
  }
  
  // Find related knowledge
  const allKnowledge = [...CORE_KNOWLEDGE, ...knowledge];
  for (const k of allKnowledge) {
    const actionLower = action.toLowerCase();
    const matches = k.tags.some(tag => 
      actionLower.includes(tag) || 
      module.includes(tag) || 
      changeType.includes(tag)
    );
    if (matches) {
      relatedKnowledge.push(k);
    }
  }
  
  // Calculate confidence based on related knowledge
  const avgConfidence = relatedKnowledge.length > 0
    ? relatedKnowledge.reduce((sum, k) => sum + k.confidence, 0) / relatedKnowledge.length
    : 0;
  
  // Determine confidence level
  let confidenceLevel: ActionAssessment['confidenceLevel'];
  if (avgConfidence >= 0.85) {
    confidenceLevel = 'high';
  } else if (avgConfidence >= 0.6) {
    confidenceLevel = 'medium';
  } else if (avgConfidence >= 0.3) {
    confidenceLevel = 'low';
  } else {
    confidenceLevel = 'unknown';
  }
  
  // Check complexity for approval requirement
  const complexChangeTypes = ['schema_change', 'auth_flow', 'api_breaking', 'rls_policy'];
  const requiresApproval = complexChangeTypes.includes(changeType) || 
                          confidenceLevel === 'low' || 
                          confidenceLevel === 'unknown';
  
  // Add suggestions based on findings
  if (confidenceLevel === 'unknown') {
    suggestions.push('No matching patterns found in knowledge base. Consider manual implementation.');
  }
  if (changeType.includes('schema')) {
    suggestions.push('Include rollback SQL for all schema changes');
  }
  if (module === 'defense') {
    suggestions.push('Ensure security patterns are validated before deployment');
  }
  
  // Check if rollback is available
  const rollbackAvailable = changeType.includes('database') || 
                           changeType.includes('schema') || 
                           changeType.includes('rls');
  
  return {
    canProceed: warnings.length === 0 && confidenceLevel !== 'unknown',
    confidenceLevel,
    requiresApproval,
    warnings,
    suggestions,
    relatedKnowledge,
    rollbackAvailable
  };
}

export function checkForbiddenPatterns(code: string): { safe: boolean; violations: string[] } {
  const violations: string[] = [];
  
  for (const pattern of CODEAGENT_BOUNDARIES.forbiddenPatterns) {
    // Skip env.get patterns - those are safe references
    if (pattern === 'SUPABASE_SERVICE_ROLE_KEY') {
      // Only flag if it's a hardcoded key, not Deno.env.get() usage
      if (code.includes(pattern) && !code.includes(`Deno.env.get('${pattern}')`)) {
        violations.push(`Forbidden pattern detected: ${pattern} (use Deno.env.get instead)`);
      }
    } else if (code.includes(pattern)) {
      violations.push(`Forbidden pattern detected: ${pattern}`);
    }
  }
  
  return {
    safe: violations.length === 0,
    violations
  };
}

export function checkRequiredPatterns(code: string, isEdgeFunction: boolean): { complete: boolean; missing: string[] } {
  if (!isEdgeFunction) {
    return { complete: true, missing: [] };
  }
  
  const missing: string[] = [];
  
  for (const pattern of CODEAGENT_BOUNDARIES.requiredPatterns) {
    if (!code.includes(pattern)) {
      missing.push(`Required pattern missing: ${pattern}`);
    }
  }
  
  return {
    complete: missing.length === 0,
    missing
  };
}

export function getRelevantKnowledge(tags: string[]): KnowledgeEntry[] {
  return CORE_KNOWLEDGE.filter(k => 
    k.tags.some(tag => tags.includes(tag))
  );
}
