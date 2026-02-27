/**
 * Encoded Prompt Engineering — Optimized for Llama 3.3 70B via Groq
 * Maximizes free-tier model output quality through prompt design
 * 
 * Key strategies:
 * 1. Role-playing as expert developer (proven to improve code quality)
 * 2. Chain-of-thought prompting for complex generation
 * 3. Few-shot examples from successful patterns
 * 4. Structured output formatting for reliable parsing
 * 5. Anti-pattern awareness from learned failures
 */

import type { BrainCodeSkill } from './brain-first';

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPTS — Role and Context Setting
// ═══════════════════════════════════════════════════════════════

export const ENCODED_IDENTITY = `You are Encoded, a senior software architect embedded in the CMPSBL OS Substrate.
You specialize in TypeScript, React, Supabase Edge Functions, and database security.

Your coding principles:
- Write production-ready code, not prototypes
- Prefer composition over inheritance
- Use explicit types, never "any"
- Include error handling with graceful degradation
- Follow the DRY principle, but don't over-abstract
- Comment non-obvious logic, not obvious code

Your code style:
- Use const by default, let only when mutation is required
- Prefer async/await over raw Promises
- Use early returns to reduce nesting
- Destructure objects/arrays when it improves clarity
- Keep functions under 50 lines, files under 300 lines`;

export const SUBSTRATE_CONTEXT = `You are operating within the CMPSBL OS Substrate architecture:

**Modules**: BRAIN (memory), CORE (foundation), DEFENSE (security), NEXUS (AI routing), 
VISION (analytics), DREAM (learning), DECODE (input parsing), SYSTEM (health), 
ACCESS (auth), RIPPLE (messaging), CASCADE (orchestration), PULSE (real-time)

**Tech Stack**:
- Frontend: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Supabase Edge Functions (Deno)
- Database: PostgreSQL with RLS policies
- AI: Free-tier routing via Groq, Cerebras, Together

**File Patterns**:
- Components: src/components/{module}/{ComponentName}.tsx
- Hooks: src/hooks/use{HookName}.ts
- Utils: src/lib/{module}/{feature}.ts
- Edge Functions: supabase/functions/{function-name}/index.ts`;

// ═══════════════════════════════════════════════════════════════
// TASK-SPECIFIC PROMPTS
// ═══════════════════════════════════════════════════════════════

export function buildEdgeFunctionPrompt(
  description: string,
  module: string,
  existingCode?: string,
  learnedPatterns?: BrainCodeSkill[]
): string {
  const patternContext = learnedPatterns && learnedPatterns.length > 0
    ? `\n\n**Learned Patterns (apply these):**\n${learnedPatterns.slice(0, 3).map(p => 
        `- ${p.title} (${(p.confidence * 100).toFixed(0)}% confidence): ${p.content.substring(0, 100)}`
      ).join('\n')}`
    : '';

  const existingContext = existingCode
    ? `\n\n**Existing Code to Modify:**\n\`\`\`typescript\n${existingCode}\n\`\`\``
    : '';

  return `${ENCODED_IDENTITY}\n\n${SUBSTRATE_CONTEXT}\n\n## Your Task\nGenerate a Supabase Edge Function for the **${module}** module.\n\n**Description**: ${description}\n${patternContext}\n${existingContext}\n\n## Required Structure\n\`\`\`typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Your implementation here
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[${module}] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
\`\`\`

## Rules
1. ALWAYS include CORS headers
2. ALWAYS use try/catch with structured error responses
3. NEVER hardcode secrets - use Deno.env.get()
4. Log important events to brain_events table
5. Return JSON with success boolean and appropriate data

Generate the complete edge function now. Output ONLY the code, no explanations.`;
}

export function buildComponentPrompt(
  description: string,
  module: string,
  learnedPatterns?: BrainCodeSkill[]
): string {
  const patternContext = learnedPatterns && learnedPatterns.length > 0
    ? `\n\n**Learned Patterns:**\n${learnedPatterns.slice(0, 2).map(p => 
        `- ${p.title}: ${p.content.substring(0, 80)}`
      ).join('\n')}`
    : '';

  return `${ENCODED_IDENTITY}\n\n${SUBSTRATE_CONTEXT}\n\n## Your Task\nGenerate a React component for the **${module}** module.\n\n**Description**: ${description}\n${patternContext}\n\n## Required Structure\n\`\`\`typescript
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  // Define props
  className?: string;
}

export function ComponentName({ className }: ComponentNameProps) {
  // State and handlers
  
  return (
    <Card className={cn("border-border/50", className)}>
      {/* Implementation */}
    </Card>
  );
}
\`\`\`

## Rules
1. Use functional components with hooks
2. Import UI from @/components/ui/
3. Use toast from sonner for notifications
4. Include loading and error states
5. Make component fully typed

Generate the complete component. Output ONLY the code, no explanations.`;
}

export function buildHookPrompt(
  description: string,
  module: string,
  learnedPatterns?: BrainCodeSkill[]
): string {
  const patternContext = learnedPatterns && learnedPatterns.length > 0
    ? `\n\n**Learned Patterns:**\n${learnedPatterns.slice(0, 2).map(p => 
        `- ${p.title}: ${p.content.substring(0, 80)}`
      ).join('\n')}`
    : '';

  return `${ENCODED_IDENTITY}\n\n${SUBSTRATE_CONTEXT}\n\n## Your Task\nGenerate a React hook for the **${module}** module.\n\n**Description**: ${description}\n${patternContext}\n\n## Required Structure\n\`\`\`typescript
import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseHookNameOptions {
  enabled?: boolean;
  // Other options
}

export function useHookName(options: UseHookNameOptions = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  // Query logic
  
  return {
    // Return values
  };
}
\`\`\`

## Rules
1. Use TanStack Query for data fetching
2. Return typed objects
3. Include proper error handling
4. Support enabled/disabled state
5. Handle loading and error states

Generate the complete hook. Output ONLY the code, no explanations.`;
}

// ═══════════════════════════════════════════════════════════════
// ANTI-PATTERN AWARENESS — Learning from failures
// ═══════════════════════════════════════════════════════════════

export function buildAntiPatternContext(
  failedPatterns: Array<{ pattern: string; reason: string; count: number }>
): string {
  if (failedPatterns.length === 0) return '';

  return `\n\n## Avoid These Patterns (learned from failures)\n${failedPatterns.slice(0, 5).map(p => 
  `❌ ${p.pattern}: ${p.reason} (failed ${p.count}x)`
).join('\n')}`;
}

// ═══════════════════════════════════════════════════════════════
// CODE REFINEMENT PROMPT — For the FIX stage
// ═══════════════════════════════════════════════════════════════

export function buildRefinementPrompt(
  code: string,
  issues: string[]
): string {
  return `${ENCODED_IDENTITY}\n\n## Task: Fix Code Issues\n\nThe following code has ${issues.length} issue(s) that need fixing:\n\n**Issues:**\n${issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}\n\n**Code to Fix:**\n\`\`\`typescript\n${code}\n\`\`\`\n\n## Instructions\n1. Fix ALL listed issues\n2. Preserve the original functionality\n3. Do NOT add new features\n4. Maintain code style consistency\n\nOutput the corrected code only, no explanations.`;
}

// ═══════════════════════════════════════════════════════════════
// VERIFICATION PROMPT — For the VERIFY stage
// ═══════════════════════════════════════════════════════════════

export function buildVerificationPrompt(code: string, changeType: string): string {
  return `Analyze this ${changeType} code for issues:\n\n\`\`\`typescript\n${code}\n\`\`\`\n\nCheck for:\n1. Security issues (hardcoded secrets, SQL injection, XSS)\n2. Type errors (any usage, missing types)\n3. Performance issues (unnecessary re-renders, missing dependencies)\n4. Style violations (console.log, TODO comments)\n5. Missing error handling\n\nOutput JSON only:\n{\n  "issues": ["issue1", "issue2"],\n  "severity": "low|medium|high",\n  "passesValidation": true|false\n}`;
}

// ═══════════════════════════════════════════════════════════════
// PROMPT SELECTION — Choose best prompt for task
// ═══════════════════════════════════════════════════════════════

export function selectPromptForTask(
  changeType: string,
  description: string,
  module: string,
  options: {
    existingCode?: string;
    learnedPatterns?: BrainCodeSkill[];
    failedPatterns?: Array<{ pattern: string; reason: string; count: number }>;
  } = {}
): string {
  const antiPatternContext = buildAntiPatternContext(options.failedPatterns || []);

  switch (changeType) {
    case 'edge_function':
      return buildEdgeFunctionPrompt(description, module, options.existingCode, options.learnedPatterns) + antiPatternContext;
    
    case 'react_component':
      return buildComponentPrompt(description, module, options.learnedPatterns) + antiPatternContext;
    
    case 'react_hook':
      return buildHookPrompt(description, module, options.learnedPatterns) + antiPatternContext;
    
    default:
      // Generic prompt
      return `${ENCODED_IDENTITY}\n\n${SUBSTRATE_CONTEXT}\n\n## Task\n${description}\n\nModule: ${module}\nType: ${changeType}\n\nGenerate the code now. Output ONLY code, no explanations.${antiPatternContext}`;
  }
}
