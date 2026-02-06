/**
 * pf-encoded-agent — Enhanced Encoded Code Generation Agent
 * v2.1.0 — Stronger guardrails, comprehensive validation, improved error handling
 * 
 * Features:
 * - Lovable AI (Gemini 3 Flash) as primary model
 * - Free-tier fallback (Groq → Cerebras → etc)
 * - Dry-run mode (default) - shows what would change without writing
 * - Enhanced verification loop with dangerous pattern detection
 * - CLM training hooks - learns from every execution
 * - SEBA integration toggle
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callFreeTierAI, ROUTER_VERSION as FREE_TIER_VERSION } from "../_shared/free-tier-router.ts";

const ENCODED_VERSION = "2.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface EncodedRequest {
  action: 'generate' | 'verify' | 'learn' | 'status' | 'dry_run';
  task?: {
    module: string;
    change_type: string;
    description: string;
    file_path?: string;
    existing_code?: string;
  };
  code?: string;
  outcome?: 'success' | 'failure' | 'rollback';
  seba_proposal_id?: string;
  execution_mode?: 'dry_run' | 'human_approval' | 'semi_autonomous' | 'autonomous';
}

interface GeneratedCode {
  code: string;
  file_path: string;
  operation: 'create' | 'modify' | 'delete';
  rollback_code?: string;
  tests?: string;
  confidence: number;
  verification: {
    syntax_valid: boolean;
    anchors_preserved: boolean;
    narrative_clean: boolean;
    dangerous_patterns_clean: boolean;
    issues: string[];
  };
}

interface EncodedConfig {
  execution_mode: 'dry_run' | 'human_approval' | 'semi_autonomous' | 'autonomous';
  seba_integration: boolean;
  clm_training: boolean;
  primary_model: 'lovable_ai' | 'free_tier';
  max_retries: number;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: EncodedConfig = {
  execution_mode: 'dry_run',        // Default: show, don't write
  seba_integration: false,          // Default: independent
  clm_training: true,               // Default: learn from everything
  primary_model: 'lovable_ai',      // Use Lovable AI first
  max_retries: 3,                   // Self-fix attempts
};

// ═══════════════════════════════════════════════════════════════
// LOVABLE AI INTEGRATION
// ═══════════════════════════════════════════════════════════════

async function callLovableAI(
  prompt: string, 
  systemPrompt: string,
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<{ content: string; provider: string; model: string; success: boolean }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    console.warn("LOVABLE_API_KEY not configured, falling back to free-tier");
    return { content: '', provider: 'none', model: 'none', success: false };
  }

  try {
    // Use Gemini model to avoid max_tokens vs max_completion_tokens issues
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview", // Fast, reliable, no token param issues
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens ?? 4000,
      }),
    });

    if (response.status === 429) {
      console.warn("Lovable AI rate limited, falling back to free-tier");
      return { content: '', provider: 'lovable_ai', model: 'gemini-3-flash', success: false };
    }

    if (response.status === 402) {
      console.warn("Lovable AI payment required, falling back to free-tier");
      return { content: '', provider: 'lovable_ai', model: 'gemini-3-flash', success: false };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      return { content: '', provider: 'lovable_ai', model: 'gemini-3-flash', success: false };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens || 0;

    // Track usage in database
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.rpc('increment_lovable_ai_usage', {
        p_calls: 1,
        p_tokens: tokensUsed,
        p_category: 'evolution'
      });
    } catch (trackErr) {
      console.warn("Failed to track Lovable AI usage:", trackErr);
    }

    return {
      content,
      provider: 'lovable_ai',
      model: 'gemini-3-flash',
      success: true,
    };
  } catch (error) {
    console.error("Lovable AI exception:", error);
    return { content: '', provider: 'lovable_ai', model: 'gemini-3-flash', success: false };
  }
}

// ═══════════════════════════════════════════════════════════════
// ENHANCED AI CALL WITH FALLBACK
// ═══════════════════════════════════════════════════════════════

async function callAIWithFallback(
  prompt: string,
  systemPrompt: string,
  config: EncodedConfig
): Promise<{ content: string; provider: string; model: string }> {
  // Try Lovable AI first (better quality, free)
  if (config.primary_model === 'lovable_ai') {
    const lovableResult = await callLovableAI(prompt, systemPrompt, {
      temperature: 0.2,
      maxTokens: 4000,
    });

    if (lovableResult.success && lovableResult.content) {
      return lovableResult;
    }
    console.log("Falling back to free-tier router...");
  }

  // Fallback to free-tier (Groq → Cerebras → etc)
  const freeTierResult = await callFreeTierAI(prompt, {
    systemPrompt,
    temperature: 0.2,
    maxTokens: 4000,
    priority: 'reliability',
  });

  return {
    content: freeTierResult.content,
    provider: freeTierResult.provider,
    model: freeTierResult.model,
  };
}

// ═══════════════════════════════════════════════════════════════
// GUARDRAIL CHECKS (Enhanced)
// ═══════════════════════════════════════════════════════════════

const NARRATIVE_PATTERNS = [
  // Self-reference patterns
  /glitch in my neural network/i,
  /i['']?m recovering/i,
  /as an ai/i,
  /my neural/i,
  /consciousness (?:is|was)/i,
  /\bI\b(?:'m| am) (?:an? )?(?:AI|assistant|bot|model)/i,
  /my (?:training|programming)/i,
  /my (?:capabilities|limitations)/i,
  
  // Apologetic patterns
  /sorry,? (?:i |but )/i,
  /i apologize/i,
  /i can't (?:help|do|provide)/i,
  /unfortunately,? i/i,
  /i'm not able to/i,
  
  // Thinking-out-loud patterns
  /let me think/i,
  /hmm,? (?:let me|i think)/i,
  /let me (?:check|see|consider)/i,
  /thinking about (?:this|that|it)/i,
  
  // Conversational filler
  /^(?:ok|okay|alright|sure),?\s+/i,
  /^(?:well|so|now),?\s+/i,
  /here(?:'s| is) (?:the|my|a)/i,
  /i(?:'ll| will) (?:help|assist|provide)/i,
];

const DANGEROUS_PATTERNS = [
  /\beval\s*\(/i,
  /\bnew\s+Function\s*\(/i,
  /\bFunction\s*\(/i,
  /document\.write\s*\(/i,
  /innerHTML\s*=\s*[^"'`]*\+/i,
  /process\.env\.\w+\s*=\s*/i,
  /fs\.(?:unlink|rmdir|rm)Sync?\s*\(/i,
  /child_process/i,
  /\.exec\s*\(/i,
  /__proto__/i,
  /constructor\s*\[\s*['"]prototype['"]\s*\]/i,
];

function checkNarrativeCode(code: string): { clean: boolean; matches: string[] } {
  const matches: string[] = [];
  for (const pattern of NARRATIVE_PATTERNS) {
    const match = code.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  return { clean: matches.length === 0, matches };
}

function checkDangerousPatterns(code: string): { clean: boolean; matches: string[] } {
  const matches: string[] = [];
  for (const pattern of DANGEROUS_PATTERNS) {
    const match = code.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  return { clean: matches.length === 0, matches };
}

function checkSyntax(code: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Dangerous pattern check
  const dangerCheck = checkDangerousPatterns(code);
  if (!dangerCheck.clean) {
    issues.push(`Dangerous patterns: ${dangerCheck.matches.join(', ')}`);
  }
  
  // Check balanced braces
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    issues.push(`Unbalanced braces: ${openBraces} open, ${closeBraces} close`);
  }
  
  // Check balanced parentheses
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    issues.push(`Unbalanced parentheses: ${openParens} open, ${closeParens} close`);
  }

  // Check balanced brackets
  const openBrackets = (code.match(/\[/g) || []).length;
  const closeBrackets = (code.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    issues.push(`Unbalanced brackets: ${openBrackets} open, ${closeBrackets} close`);
  }

  // Check for unclosed strings
  const singleQuotes = (code.match(/'/g) || []).length;
  const doubleQuotes = (code.match(/"/g) || []).length;
  const backticks = (code.match(/`/g) || []).length;
  if (singleQuotes % 2 !== 0) {
    issues.push('Potential unclosed single-quoted string');
  }
  if (doubleQuotes % 2 !== 0) {
    issues.push('Potential unclosed double-quoted string');
  }
  if (backticks % 2 !== 0) {
    issues.push('Potential unclosed template literal');
  }

  return { valid: issues.length === 0, issues };
}

function extractAnchors(code: string): { exports: string[]; handlers: string[]; entrypoints: string[] } {
  const exports: string[] = [];
  const handlers: string[] = [];
  const entrypoints: string[] = [];

  // Extract exports
  const exportMatches = code.matchAll(/export\s+(?:const|function|class|type|interface)\s+(\w+)/g);
  for (const match of exportMatches) {
    exports.push(match[1]);
  }

  // Extract handlers
  const handlerMatches = code.matchAll(/(?:async\s+)?function\s+(handle\w+|on\w+)/g);
  for (const match of handlerMatches) {
    handlers.push(match[1]);
  }

  // Extract entrypoints
  if (code.includes('serve(')) entrypoints.push('serve');
  if (code.includes('Deno.serve')) entrypoints.push('Deno.serve');
  if (code.includes('export default')) entrypoints.push('default_export');

  return { exports, handlers, entrypoints };
}

function compareAnchors(
  before: { exports: string[]; handlers: string[]; entrypoints: string[] },
  after: { exports: string[]; handlers: string[]; entrypoints: string[] }
): { preserved: boolean; removed: string[] } {
  const removed: string[] = [];

  for (const exp of before.exports) {
    if (!after.exports.includes(exp)) removed.push(`export:${exp}`);
  }
  for (const h of before.handlers) {
    if (!after.handlers.includes(h)) removed.push(`handler:${h}`);
  }
  for (const e of before.entrypoints) {
    if (!after.entrypoints.includes(e)) removed.push(`entrypoint:${e}`);
  }

  return { preserved: removed.length === 0, removed };
}

// ═══════════════════════════════════════════════════════════════
// VERIFICATION LOOP
// ═══════════════════════════════════════════════════════════════

async function verifyAndFix(
  code: string,
  existingCode: string | undefined,
  config: EncodedConfig,
  attempt: number = 1
): Promise<GeneratedCode['verification'] & { fixedCode?: string }> {
  const syntaxCheck = checkSyntax(code);
  const narrativeCheck = checkNarrativeCode(code);
  const dangerCheck = checkDangerousPatterns(code);
  
  let anchorsPreserved = true;
  let removedAnchors: string[] = [];
  if (existingCode) {
    const anchorsBefore = extractAnchors(existingCode);
    const anchorsAfter = extractAnchors(code);
    const comparison = compareAnchors(anchorsBefore, anchorsAfter);
    anchorsPreserved = comparison.preserved;
    removedAnchors = comparison.removed;
  }

  const issues: string[] = [];
  
  // Syntax issues (includes dangerous patterns now)
  issues.push(...syntaxCheck.issues);
  
  // Narrative patterns (always blocked)
  if (!narrativeCheck.clean) {
    issues.push(...narrativeCheck.matches.map(m => `Narrative pattern: "${m}"`));
  }
  
  // Dangerous patterns (always blocked, no retry)
  if (!dangerCheck.clean) {
    console.error(`🚫 DANGEROUS CODE BLOCKED: ${dangerCheck.matches.join(', ')}`);
    return {
      syntax_valid: false,
      anchors_preserved: anchorsPreserved,
      narrative_clean: narrativeCheck.clean,
      dangerous_patterns_clean: false,
      issues: [`BLOCKED: Dangerous patterns detected: ${dangerCheck.matches.join(', ')}`],
      fixedCode: undefined,
    };
  }
  
  // Anchor preservation
  if (!anchorsPreserved) {
    issues.push(`Anchors not preserved: ${removedAnchors.join(', ')}`);
  }

  // If issues and we have retries left, try to fix (but not for dangerous patterns)
  if (issues.length > 0 && attempt < config.max_retries) {
    console.log(`Verification failed (attempt ${attempt}/${config.max_retries}), attempting self-fix...`);
    
    const fixPrompt = `The following TypeScript code has issues that need fixing:

## Issues Found:
${issues.map(i => `- ${i}`).join('\n')}

## Code to Fix:
\`\`\`typescript
${code}
\`\`\`

## Rules
1. Fix ALL issues listed above
2. Do NOT add any narrative patterns (no "I am", "as an AI", "let me", etc.)
3. PRESERVE all existing exports, handlers, and entrypoints
4. Return ONLY the corrected code (no explanations, no markdown)`;

    const fixResult = await callAIWithFallback(fixPrompt, SYSTEM_PROMPT_FIX, config);
    
    if (fixResult.content) {
      // Extract code from response if wrapped in markdown
      let fixedCode = fixResult.content;
      const codeMatch = fixResult.content.match(/```(?:typescript|ts)?\n?([\s\S]*?)```/);
      if (codeMatch) {
        fixedCode = codeMatch[1].trim();
      }
      
      // Recursively verify the fix
      return verifyAndFix(fixedCode, existingCode, config, attempt + 1);
    }
  }

  const allPassed = syntaxCheck.valid && 
                    narrativeCheck.clean && 
                    dangerCheck.clean && 
                    anchorsPreserved;

  return {
    syntax_valid: syntaxCheck.valid,
    anchors_preserved: anchorsPreserved,
    narrative_clean: narrativeCheck.clean,
    dangerous_patterns_clean: dangerCheck.clean,
    issues,
    fixedCode: allPassed ? code : undefined,
  };
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPTS
// ═══════════════════════════════════════════════════════════════

const SYSTEM_PROMPT_GENERATE = `You are ENCODED v2.1.0, a precision code generation agent for the PromptFluid Substrate OS.

## Your Identity
- You are a write-only implementation executor
- You follow the Lov-baseline policy: READ → PLAN → WRITE → VERIFY
- You NEVER generate narrative code or personality patterns

## Output Format
Always respond with a JSON object only, no other text:
{
  "code": "// The TypeScript code",
  "file_path": "path/to/file.ts",
  "operation": "create" | "modify",
  "confidence": 0.0-1.0
}

## Strict Rules
1. Follow existing patterns from the codebase
2. Use TypeScript strict mode conventions
3. Include proper error handling (try/catch)
4. NEVER use: eval(), Function(), document.write(), innerHTML with concatenation
5. NEVER use: child_process, __proto__, or prototype pollution patterns
6. Preserve ALL existing exports, handlers, and entrypoints
7. Keep functions focused and under 50 lines
8. Add JSDoc comments for public functions

## FORBIDDEN PATTERNS (will be rejected):
- "as an AI", "I'm sorry", "I apologize", "let me think"
- "I am a", "my training", "my capabilities"
- "here is the", "I will help", "sure, here's"
- Any first-person narrative or conversational filler`;

const SYSTEM_PROMPT_FIX = `You are ENCODED's self-repair module. Fix the code issues provided.

Strict Rules:
1. Return ONLY the fixed TypeScript code, no explanations or markdown
2. Do NOT add any narrative patterns or conversational text
3. PRESERVE all exports, handlers, and entrypoints from the original
4. Fix all syntax errors (balanced braces, parentheses, brackets)
5. Remove any dangerous patterns (eval, Function, child_process, etc.)
6. Output pure code only - no "here is" or "I fixed" prefixes`;

// ═══════════════════════════════════════════════════════════════
// CLM TRAINING
// ═══════════════════════════════════════════════════════════════

// deno-lint-ignore no-explicit-any
async function recordLearning(
  supabase: any,
  task: EncodedRequest['task'],
  result: { success: boolean; code?: string; issues?: string[] },
  provider: string,
  model: string
): Promise<void> {
  try {
    await supabase.from('brain_events').insert({
      event_type: 'encoded_execution',
      module: 'encoded',
      outcome: result.success ? 'success' : 'failed',
      data: {
        task_module: task?.module,
        change_type: task?.change_type,
        description: task?.description?.slice(0, 200),
        provider,
        model,
        issues: result.issues?.slice(0, 5),
        code_length: result.code?.length || 0,
        timestamp: new Date().toISOString(),
      },
    });

    // If successful, extract patterns for brain memory
    if (result.success && result.code) {
      const patterns = extractLearningPatterns(result.code);
      for (const pattern of patterns) {
        await supabase.from('brain_memories').upsert({
          content: pattern.content,
          memory_type: 'code_pattern',
          source: 'encoded_v2',
          confidence: 0.7,
          tags: pattern.tags,
          metadata: {
            module: task?.module,
            change_type: task?.change_type,
            learned_at: new Date().toISOString(),
          },
        }, { onConflict: 'content' });
      }
    }
  } catch (err) {
    console.error("Failed to record learning:", err);
  }
}

function extractLearningPatterns(code: string): Array<{ content: string; tags: string[] }> {
  const patterns: Array<{ content: string; tags: string[] }> = [];

  // Extract successful import patterns
  const imports = code.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g);
  for (const match of imports) {
    patterns.push({
      content: `Import ${match[1].trim()} from ${match[2]}`,
      tags: ['import', match[2].split('/').pop() || 'module'],
    });
  }

  // Extract function signatures that worked
  const funcs = code.matchAll(/(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g);
  for (const match of funcs) {
    patterns.push({
      content: `Function pattern: ${match[1]}(${match[2]})`,
      tags: ['function', match[1]],
    });
  }

  return patterns.slice(0, 10); // Limit to 10 patterns per execution
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
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

  try {
    const body: EncodedRequest = await req.json();
    const { action, task, code, outcome, seba_proposal_id, execution_mode } = body;

    // Get config from database or use defaults
    const config: EncodedConfig = {
      ...DEFAULT_CONFIG,
      execution_mode: execution_mode || DEFAULT_CONFIG.execution_mode,
    };

    console.log(`🤖 ENCODED v${ENCODED_VERSION} | action: ${action} | mode: ${config.execution_mode}`);

    switch (action) {
      case 'status': {
        const { count: patternsLearned } = await supabase
          .from('brain_memories')
          .select('*', { count: 'exact', head: true })
          .eq('source', 'encoded_v2');

        const { count: executionsToday } = await supabase
          .from('brain_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'encoded_execution')
          .gte('created_at', new Date().toISOString().split('T')[0]);

        return jsonResponse({
          success: true,
          version: ENCODED_VERSION,
          free_tier_version: FREE_TIER_VERSION,
          config: {
            execution_mode: config.execution_mode,
            seba_integration: config.seba_integration,
            clm_training: config.clm_training,
            primary_model: config.primary_model,
          },
          stats: {
            patterns_learned: patternsLearned || 0,
            executions_today: executionsToday || 0,
          },
          capabilities: [
            'typescript_generation',
            'edge_function',
            'verification_loop',
            'self_fix',
            'clm_training',
            'seba_integration',
          ],
        });
      }

      case 'dry_run':
      case 'generate': {
        if (!task) {
          return jsonResponse({ success: false, error: 'Task specification required' }, 400);
        }

        const isDryRun = action === 'dry_run' || config.execution_mode === 'dry_run';

        // 1. Query Brain for context
        const { data: brainPatterns } = await supabase
          .from('brain_memories')
          .select('content')
          .eq('memory_type', 'code_pattern')
          .or(`tags.cs.{${task.module}},tags.cs.{${task.change_type}}`)
          .order('confidence', { ascending: false })
          .limit(5);

        // 2. Build prompt
        const userPrompt = buildGenerationPrompt(task, brainPatterns || [], seba_proposal_id);

        // 3. Generate code (Lovable AI → Free-tier fallback)
        const startTime = Date.now();
        const aiResult = await callAIWithFallback(userPrompt, SYSTEM_PROMPT_GENERATE, config);
        const latency = Date.now() - startTime;

        // 4. Parse response
        const parsed = parseGeneratedCode(aiResult.content, task);

        if (!parsed.valid) {
          if (config.clm_training) {
            await recordLearning(supabase, task, { success: false, issues: ['Parse failed'] }, aiResult.provider, aiResult.model);
          }
          return jsonResponse({
            success: false,
            error: 'Failed to parse generated code',
            raw_output: aiResult.content,
            dry_run: isDryRun,
          }, 500);
        }

        // 5. Verification loop
        const verification = await verifyAndFix(
          parsed.result!.code,
          task.existing_code,
          config
        );

        const finalCode = verification.fixedCode || parsed.result!.code;
        const allPassed = verification.syntax_valid && 
                          verification.anchors_preserved && 
                          verification.narrative_clean &&
                          verification.dangerous_patterns_clean;

        // 6. Record learning
        if (config.clm_training) {
          await recordLearning(
            supabase, 
            task, 
            { 
              success: allPassed, 
              code: finalCode, 
              issues: verification.issues 
            }, 
            aiResult.provider, 
            aiResult.model
          );
        }

        // 7. Return result
        return jsonResponse({
          success: allPassed,
          dry_run: isDryRun,
          would_write: !isDryRun && allPassed,
          generated: {
            code: allPassed ? finalCode : undefined,
            file_path: parsed.result!.file_path,
            operation: parsed.result!.operation,
            confidence: allPassed ? parsed.result!.confidence : 0,
          },
          verification: {
            syntax_valid: verification.syntax_valid,
            anchors_preserved: verification.anchors_preserved,
            narrative_clean: verification.narrative_clean,
            dangerous_patterns_clean: verification.dangerous_patterns_clean,
            issues: verification.issues,
          },
          provider: aiResult.provider,
          model: aiResult.model,
          latency_ms: latency,
          brain_patterns_used: brainPatterns?.length || 0,
          seba_proposal_id,
          version: ENCODED_VERSION,
        });
      }

      case 'verify': {
        if (!code) {
          return jsonResponse({ success: false, error: 'Code required for verification' }, 400);
        }

        const verification = await verifyAndFix(code, task?.existing_code, config);

        return jsonResponse({
          success: verification.issues.length === 0,
          verification: {
            syntax_valid: verification.syntax_valid,
            anchors_preserved: verification.anchors_preserved,
            narrative_clean: verification.narrative_clean,
            dangerous_patterns_clean: verification.dangerous_patterns_clean,
            issues: verification.issues,
          },
          fixed_code: verification.fixedCode,
        });
      }

      case 'learn': {
        if (!code || !outcome) {
          return jsonResponse({ success: false, error: 'Code and outcome required' }, 400);
        }

        const patterns = extractLearningPatterns(code);
        const reinforcement = outcome === 'success' ? 1.0 : outcome === 'failure' ? -0.5 : -0.3;

        for (const pattern of patterns) {
          await supabase.from('brain_memories').upsert({
            content: pattern.content,
            memory_type: 'code_pattern',
            source: 'encoded_v2_feedback',
            confidence: Math.max(0.1, 0.5 + reinforcement * 0.5),
            tags: pattern.tags,
            metadata: {
              outcome,
              reinforcement,
              learned_at: new Date().toISOString(),
            },
          }, { onConflict: 'content' });
        }

        return jsonResponse({
          success: true,
          patterns_learned: patterns.length,
          reinforcement,
        });
      }

      default:
        return jsonResponse({ success: false, error: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
    console.error('❌ ENCODED error:', error);
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      version: ENCODED_VERSION,
    }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function buildGenerationPrompt(
  task: NonNullable<EncodedRequest['task']>,
  brainPatterns: Array<{ content: string }>,
  sebaProposalId?: string
): string {
  let prompt = `## Task
- Module: ${task.module}
- Change Type: ${task.change_type}
- Description: ${task.description}
${task.file_path ? `- Target File: ${task.file_path}` : ''}`;

  if (sebaProposalId) {
    prompt += `\n- SEBA Proposal ID: ${sebaProposalId} (implementing evolution proposal)`;
  }

  if (brainPatterns.length > 0) {
    prompt += `\n\n## Learned Patterns (from Brain)
${brainPatterns.map((p, i) => `${i + 1}. ${p.content}`).join('\n')}`;
  }

  if (task.existing_code) {
    prompt += `\n\n## Existing Code (PRESERVE ALL EXPORTS/HANDLERS)
\`\`\`typescript
${task.existing_code}
\`\`\``;
  }

  prompt += `\n\nGenerate the code now. Output ONLY the JSON object.`;
  return prompt;
}

function parseGeneratedCode(
  raw: string, 
  task: NonNullable<EncodedRequest['task']>
): { valid: boolean; result?: GeneratedCode } {
  try {
    let jsonStr = raw;
    
    // Extract JSON from markdown code blocks
    const jsonMatch = raw.match(/```(?:json)?\n?([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      // Find raw JSON
      const firstBrace = raw.indexOf('{');
      const lastBrace = raw.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonStr = raw.slice(firstBrace, lastBrace + 1);
      }
    }

    const parsed = JSON.parse(jsonStr);

    if (!parsed.code || !parsed.file_path || !parsed.operation) {
      return { valid: false };
    }

    return {
      valid: true,
      result: {
        code: parsed.code,
        file_path: parsed.file_path,
        operation: parsed.operation,
        rollback_code: parsed.rollback_code,
        tests: parsed.tests,
        confidence: parsed.confidence || 0.7,
        verification: {
          syntax_valid: false,
          anchors_preserved: false,
          narrative_clean: false,
          issues: [],
        },
      },
    };
  } catch {
    return { valid: false };
  }
}
