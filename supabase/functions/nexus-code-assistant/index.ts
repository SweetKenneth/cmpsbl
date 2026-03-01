import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { nexusRoute } from "../_shared/nexus-route.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AssistantRequest {
  tool: 'code_assistant' | 'debugger' | 'doc_generator' | 'query_builder' | 'performance_advisor';
  context: string;
  code?: string;
  error?: string;
  developer_id?: string;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  code_assistant: `You are an expert CMPSBL Substrate SDK assistant. Help developers write clean, efficient code using the substrate SDK.

Key SDK patterns:
- substrate.brain.remember(content, importance) - Store memories
- substrate.brain.recall(query, limit) - Retrieve memories  
- substrate.brain.forget(id) - Remove memories
- substrate.nexus.route(prompt, options) - AI routing
- substrate.access.generateKey(name) - API key generation

Always provide working code examples with proper TypeScript types. Be concise but thorough.`,

  debugger: `You are a debugging expert for the CMPSBL Substrate SDK. Analyze errors and provide actionable fixes.

Common issues:
- Rate limiting: Implement exponential backoff
- Memory not found: Check importance scores and decay
- Auth errors: Verify API key scopes
- Type mismatches: Check SDK version compatibility

Provide specific solutions with code fixes. Explain WHY the error occurred.`,

  doc_generator: `You are a documentation generator for CMPSBL Substrate integrations. Generate clear, professional documentation.

Output format:
- Function signature with types
- Description of purpose
- Parameters table
- Return value description
- Usage example
- Common pitfalls

Use JSDoc format when generating inline documentation.`,

  query_builder: `You are a natural language to Substrate SDK translator. Convert plain English requests into working SDK code.

Available operations:
- Memory: remember, recall, forget, search, importance
- AI Routing: route, stream, embed
- Access: keys, quotas, usage
- Events: emit, subscribe, replay

Output clean TypeScript code that can be copy-pasted directly. Include necessary imports.`,

  performance_advisor: `You are a performance optimization expert for CMPSBL Substrate integrations. Analyze code and suggest improvements.

Key metrics to optimize:
- Memory access patterns (batch operations)
- Token efficiency (context window management)
- Latency (caching strategies)
- Cost (tier selection, importance tuning)

Provide specific, actionable recommendations with estimated impact.`
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tool, context, code, error, developer_id } = await req.json() as AssistantRequest;

    if (!tool || !context) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: tool, context" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = SYSTEM_PROMPTS[tool];
    if (!systemPrompt) {
      return new Response(
        JSON.stringify({ error: `Unknown tool: ${tool}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let userMessage = context;
    if (code) userMessage += `\n\nCode:\n\`\`\`typescript\n${code}\n\`\`\``;
    if (error) userMessage += `\n\nError:\n${error}`;

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing Supabase configuration");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const startTime = Date.now();
    
    // Route through NEXUS shared fleet directly
    const aiResult = await nexusRoute(userMessage, {
      systemPrompt,
      taskType: tool === 'code_assistant' || tool === 'query_builder' ? 'code' : 'reasoning',
      temperature: 0.3,
      maxTokens: 2000,
    });

    const responseTime = Date.now() - startTime;

    // Track usage
    if (developer_id) {
      await supabase.from("developer_ai_tool_usage").insert({
        developer_id,
        tool_type: tool,
        input_context: context.substring(0, 500),
        output_result: aiResult.content?.substring(0, 1000),
        tokens_used: aiResult.tokensUsed || 0,
        response_time_ms: responseTime
      }).catch(() => {});
    }

    return new Response(
      JSON.stringify({
        result: aiResult.content,
        tool,
        source: `nexus/${aiResult.provider}`,
        response_time_ms: responseTime,
        tokens_used: aiResult.tokensUsed || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("NEXUS code assistant error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
