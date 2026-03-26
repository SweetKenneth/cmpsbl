/**
 * promptfluid® Substrate Coder Agent — Self-Evolution Code Generator
 * v1.1.0 — Brain-powered code generation with pattern learning
 * 
 * Generates executable code for substrate improvements using:
 * - Brain memory context injection
 * - Free-tier router for AI calls (NO Lovable AI)
 * - Pattern learning from successful deployments
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const CODER_VERSION = "1.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CoderRequest {
  action: 'generate' | 'analyze' | 'learn' | 'status';
  improvement?: {
    module: string;
    change_type: string;
    description: string;
    file_path?: string;
  };
  context?: {
    existing_code?: string;
    related_patterns?: string[];
  };
  code?: string;
  outcome?: 'success' | 'failure' | 'rollback';
}

interface GeneratedCode {
  code: string;
  file_path: string;
  operation: 'create' | 'modify' | 'delete';
  rollback_sql?: string;
  tests?: string;
  confidence: number;
}

// deno-lint-ignore no-explicit-any
function jsonResponse(data: any, headers: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Using GPT-only evolution routing.

  try {
    const body: CoderRequest = await req.json();
    const { action, improvement, context, code, outcome } = body;

    console.log(`🤖 Substrate Coder v${CODER_VERSION} | action: ${action}`);

    switch (action) {
      case 'status': {
        // Get coder stats
        const { count: learnedPatterns } = await supabase
          .from('brain_memories')
          .select('*', { count: 'exact', head: true })
          .eq('memory_type', 'code_pattern');

        const { count: generatedToday } = await supabase
          .from('brain_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'code_generated')
          .gte('created_at', new Date().toISOString().split('T')[0]);

        return jsonResponse({
          success: true,
          version: CODER_VERSION,
          model_policy: {
            provider: 'openai',
            model: 'gpt-4o-mini',
            locked: true,
          },
          learned_patterns: learnedPatterns || 0,
          generated_today: generatedToday || 0,
          capabilities: [
            'edge_function',
            'migration_sql',
            'component_tsx',
            'hook_ts',
            'utility_ts',
          ],
          rate_limits: {
            policy: 'GPT-only for evolution'
          }
        }, corsHeaders);
      }

      case 'analyze': {
        if (!improvement) {
          return jsonResponse({
            success: false,
            error: 'Improvement specification required',
          }, corsHeaders, 400);
        }

        // Analyze what code changes are needed
        const analysis = analyzeImprovement(improvement);
        
        return jsonResponse({
          success: true,
          improvement,
          analysis,
          estimated_complexity: analysis.complexity,
          file_paths: analysis.affected_files,
          requires_migration: analysis.needs_sql,
        }, corsHeaders);
      }

      case 'generate': {
        if (!improvement) {
          return jsonResponse({
            success: false,
            error: 'Improvement specification required',
          }, corsHeaders, 400);
        }

        // 1. Query Brain for relevant patterns
        const brainPatterns = await getBrainPatterns(supabase, improvement.module, improvement.change_type);
        
        // 2. Build context-aware prompt
        const systemPrompt = buildCoderSystemPrompt(improvement.module);
        const userPrompt = buildGenerationPrompt(improvement, brainPatterns, context);

        // 3. Generate code via GPT-only evolution path
        const startTime = Date.now();
        const { data: aiResult, error: aiError } = await supabase.functions.invoke('pf-evolution-patch', {
          body: {
            prompt: userPrompt,
            systemPrompt,
            model: 'gpt-4o-mini',
            temperature: 0.3,
            maxTokens: 4000,
            metadata: {
              routeKey: 'substrate_coder',
              taskType: 'code_generation',
              module: improvement.module,
              changeType: improvement.change_type,
            },
          },
        });
        if (aiError || !aiResult?.content) {
          throw new Error(aiError?.message || 'GPT evolution generation failed');
        }
        const generatedCode = aiResult.content;
        const latency = Date.now() - startTime;

        // 4. Parse and validate the response
        const parsed = parseGeneratedCode(generatedCode, improvement);

        // 5. Log the generation
        await supabase.from('brain_events').insert({
          event_type: 'code_generated',
          module: 'evolution',
          outcome: parsed.valid ? 'success' : 'failed',
          data: {
            improvement_module: improvement.module,
            change_type: improvement.change_type,
            confidence: parsed.confidence,
            latency_ms: latency,
            patterns_used: brainPatterns.length,
            provider: aiResult.provider,
            model: aiResult.model,
          },
        });

        if (!parsed.valid) {
          return jsonResponse({
            success: false,
            error: 'Failed to generate valid code',
            raw_output: generatedCode,
          }, corsHeaders, 500);
        }

        return jsonResponse({
          success: true,
          generated: parsed.result,
          brain_patterns_used: brainPatterns.length,
          latency_ms: latency,
          provider: aiResult.provider,
          model: aiResult.model,
          version: CODER_VERSION,
        }, corsHeaders);
      }

      case 'learn': {
        if (!code || !outcome) {
          return jsonResponse({
            success: false,
            error: 'Code and outcome are required for learning',
          }, corsHeaders, 400);
        }

        // Extract patterns from the code
        const patterns = extractCodePatterns(code);
        
        // Store patterns with reinforcement based on outcome
        const reinforcement = outcome === 'success' ? 1.0 : outcome === 'failure' ? -0.5 : -0.3;

        for (const pattern of patterns) {
          await supabase.from('brain_memories').insert({
            content: pattern.content,
            memory_type: 'code_pattern',
            source: 'substrate_coder',
            confidence: Math.max(0.1, 0.5 + reinforcement * 0.5),
            tags: pattern.tags,
            metadata: {
              outcome,
              timestamp: new Date().toISOString(),
              pattern_type: pattern.type,
            },
          });
        }

        await supabase.from('brain_events').insert({
          event_type: 'code_learned',
          module: 'evolution',
          outcome,
          data: { patterns_count: patterns.length, reinforcement },
        });

        return jsonResponse({
          success: true,
          patterns_learned: patterns.length,
          reinforcement,
        }, corsHeaders);
      }

      default:
        return jsonResponse({
          success: false,
          error: `Unknown action: ${action}`,
        }, corsHeaders, 400);
    }
  } catch (error) {
    console.error('❌ Coder error:', error);
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      version: CODER_VERSION,
    }, corsHeaders, 500);
  }
});

/**
 * Query Brain for relevant code patterns
 */
// deno-lint-ignore no-explicit-any
async function getBrainPatterns(supabase: any, module: string, changeType: string): Promise<string[]> {
  const { data } = await supabase
    .from('brain_memories')
    .select('content')
    .eq('memory_type', 'code_pattern')
    .or(`tags.cs.{${module}},tags.cs.{${changeType}}`)
    .order('confidence', { ascending: false })
    .limit(5);

  return (data || []).map((m: { content: string }) => m.content);
}

/**
 * Analyze what an improvement requires
 */
function analyzeImprovement(improvement: CoderRequest['improvement']): {
  complexity: 'low' | 'medium' | 'high';
  affected_files: string[];
  needs_sql: boolean;
  estimated_lines: number;
} {
  if (!improvement) {
    return { complexity: 'low', affected_files: [], needs_sql: false, estimated_lines: 0 };
  }

  const { module, change_type, file_path } = improvement;
  
  const complexityMap: Record<string, 'low' | 'medium' | 'high'> = {
    'config_update': 'low',
    'prompt_refinement': 'low',
    'rate_limit': 'low',
    'edge_function': 'medium',
    'database_index': 'medium',
    'rls_policy': 'medium',
    'schema_change': 'high',
    'auth_flow': 'high',
    'api_breaking': 'high',
  };

  const files: string[] = [];
  if (file_path) files.push(file_path);
  
  // Infer affected files based on module
  if (module === 'brain') files.push('supabase/functions/pf-substrate/brain-module.ts');
  if (module === 'defense') files.push('supabase/functions/pf-substrate/defense-module.ts');
  if (module === 'nexus') files.push('supabase/functions/pf-substrate/nexus-module.ts');

  return {
    complexity: complexityMap[change_type] || 'medium',
    affected_files: files,
    needs_sql: ['database_index', 'rls_policy', 'schema_change'].includes(change_type),
    estimated_lines: change_type === 'config_update' ? 10 : change_type === 'edge_function' ? 100 : 50,
  };
}

/**
 * Build the system prompt for code generation
 */
function buildCoderSystemPrompt(module: string): string {
  return `You are the Substrate Coder, an internal AI agent responsible for maintaining and improving the PromptFluid Substrate OS.

## Your Role
Generate production-ready TypeScript/SQL code for the ${module} module.

## Output Format
Always respond with a JSON object containing:
{
  "code": "// The actual code here",
  "file_path": "relative/path/to/file.ts",
  "operation": "create" | "modify" | "delete",
  "rollback_sql": "-- SQL to undo database changes (if applicable)",
  "tests": "// Simple test code (if applicable)",
  "confidence": 0.0-1.0
}

## Rules
1. Follow existing patterns from the Brain memory
2. Use TypeScript strict mode conventions
3. Include proper error handling
4. Never use eval() or dynamic code execution
5. Always include rollback logic for database changes
6. Keep functions small and focused
7. Use existing substrate imports and utilities`;
}

/**
 * Build the generation prompt with context
 */
function buildGenerationPrompt(
  improvement: NonNullable<CoderRequest['improvement']>,
  brainPatterns: string[],
  context?: CoderRequest['context']
): string {
  let prompt = `## Improvement Request
- Module: ${improvement.module}
- Change Type: ${improvement.change_type}
- Description: ${improvement.description}
${improvement.file_path ? `- Target File: ${improvement.file_path}` : ''}`;

  if (brainPatterns.length > 0) {
    prompt += `\n\n## Learned Patterns (from Brain memory)
${brainPatterns.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
  }

  if (context?.existing_code) {
    prompt += `\n\n## Existing Code Context
\`\`\`typescript
${context.existing_code}
\`\`\``;
  }

  prompt += `\n\nGenerate the code now. Output only the JSON object.`;
  
  return prompt;
}

// Code generation now uses callFreeTierAI from the shared router
// No custom AI function needed - using the enterprise-grade free-tier router v4.0.0

/**
 * Parse and validate generated code
 */
function parseGeneratedCode(raw: string, improvement: NonNullable<CoderRequest['improvement']>): {
  valid: boolean;
  result?: GeneratedCode;
  confidence: number;
} {
  try {
    // Try to extract JSON from the response
    let jsonStr = raw;
    const jsonMatch = raw.match(/```json\n?([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      // Try to find raw JSON
      const firstBrace = raw.indexOf('{');
      const lastBrace = raw.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonStr = raw.slice(firstBrace, lastBrace + 1);
      }
    }

    const parsed = JSON.parse(jsonStr);

    if (!parsed.code || !parsed.file_path || !parsed.operation) {
      return { valid: false, confidence: 0 };
    }

    return {
      valid: true,
      result: {
        code: parsed.code,
        file_path: parsed.file_path,
        operation: parsed.operation,
        rollback_sql: parsed.rollback_sql,
        tests: parsed.tests,
        confidence: parsed.confidence || 0.7,
      },
      confidence: parsed.confidence || 0.7,
    };
  } catch {
    return { valid: false, confidence: 0 };
  }
}

/**
 * Extract learnable patterns from code
 */
function extractCodePatterns(code: string): Array<{ content: string; tags: string[]; type: string }> {
  const patterns: Array<{ content: string; tags: string[]; type: string }> = [];

  // Extract function patterns
  const funcMatches = code.matchAll(/(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*(?::\s*\w+)?\s*\{/g);
  for (const match of funcMatches) {
    patterns.push({
      content: `Function pattern: ${match[1]}`,
      tags: ['function', match[1]],
      type: 'function_signature',
    });
  }

  // Extract import patterns
  const importMatches = code.matchAll(/import\s+\{[^}]+\}\s+from\s+['"]([^'"]+)['"]/g);
  for (const match of importMatches) {
    patterns.push({
      content: `Import from: ${match[1]}`,
      tags: ['import', match[1].split('/').pop() || ''],
      type: 'import_pattern',
    });
  }

  // Extract error handling patterns
  if (code.includes('try {') && code.includes('catch')) {
    patterns.push({
      content: 'Uses try-catch error handling',
      tags: ['error_handling', 'try_catch'],
      type: 'error_pattern',
    });
  }

  return patterns;
}
