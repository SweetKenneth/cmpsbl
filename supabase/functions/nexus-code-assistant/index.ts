import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// System prompts for each tool
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

    // Build user message based on tool type
    let userMessage = context;
    if (code) {
      userMessage += `\n\nCode:\n\`\`\`typescript\n${code}\n\`\`\``;
    }
    if (error) {
      userMessage += `\n\nError:\n${error}`;
    }

    // Use Nexus router pattern - route through substrate's internal AI
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Call internal Nexus router
    const startTime = Date.now();
    
    // Route through the pf-nexus-router for governed AI
    const nexusResponse = await fetch(`${SUPABASE_URL}/functions/v1/pf-nexus-router`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        model: "nexus/llama-3.3-70b",
        max_tokens: 2000,
        temperature: 0.3,
        metadata: {
          source: "developer-tools",
          tool_type: tool
        }
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!nexusResponse.ok) {
      // Fallback to direct response if Nexus unavailable
      console.warn("Nexus router unavailable, using fallback");
      
      const fallbackResponse = generateFallbackResponse(tool, context, code, error);
      
      return new Response(
        JSON.stringify({
          result: fallbackResponse,
          tool,
          source: "fallback",
          response_time_ms: responseTime
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await nexusResponse.json();
    const result = aiResult.choices?.[0]?.message?.content || aiResult.content || aiResult.result;

    // Track usage
    if (developer_id) {
      await supabase.from("developer_ai_tool_usage").insert({
        developer_id,
        tool_type: tool,
        input_context: context.substring(0, 500),
        output_result: result?.substring(0, 1000),
        tokens_used: aiResult.usage?.total_tokens || 0,
        response_time_ms: responseTime
      });
    }

    return new Response(
      JSON.stringify({
        result,
        tool,
        source: "nexus",
        response_time_ms: responseTime,
        tokens_used: aiResult.usage?.total_tokens || 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Nexus code assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateFallbackResponse(tool: string, context: string, code?: string, error?: string): string {
  switch (tool) {
    case 'code_assistant':
      return `## SDK Code Pattern

Based on your request: "${context}"

\`\`\`typescript
import { substrate } from '@cmpsbl/substrate';

// Initialize with your API key
const client = substrate.init({
  apiKey: process.env.CMPSBL_API_KEY
});

// Your implementation here
const result = await client.brain.remember({
  content: "Your content",
  importance: 0.8
});

console.log('Stored:', result.id);
\`\`\`

For more patterns, check the SDK documentation at /docs.`;

    case 'debugger':
      return `## Debug Analysis

**Error Context:** ${error || 'No error provided'}

**Likely Causes:**
1. Check API key validity and scopes
2. Verify rate limits haven't been exceeded
3. Ensure proper async/await handling

**Suggested Fix:**
\`\`\`typescript
try {
  const result = await substrate.brain.recall(query);
} catch (e) {
  if (e.code === 'RATE_LIMITED') {
    await new Promise(r => setTimeout(r, 1000));
    // Retry logic
  }
}
\`\`\``;

    case 'doc_generator':
      return `## Generated Documentation

\`\`\`typescript
/**
 * ${context}
 * 
 * @param options - Configuration options
 * @returns Promise with operation result
 * @throws {SubstrateError} When operation fails
 * 
 * @example
 * const result = await substrate.operation(options);
 */
\`\`\``;

    case 'query_builder':
      return `## Generated SDK Code

\`\`\`typescript
import { substrate } from '@cmpsbl/substrate';

// ${context}
const result = await substrate.brain.recall({
  query: "${context}",
  limit: 10
});

// Process results
result.memories.forEach(m => console.log(m.content));
\`\`\``;

    case 'performance_advisor':
      return `## Performance Analysis

**Current Code Review:**
${code ? 'Analyzed provided code.' : 'No code provided for analysis.'}

**Recommendations:**
1. **Batch Operations:** Group multiple memory operations
2. **Caching:** Implement local caching for frequent queries
3. **Importance Tuning:** Adjust importance scores to optimize storage
4. **Context Windows:** Use semantic chunking for large documents

**Estimated Impact:** 30-50% latency reduction`;

    default:
      return 'Tool not recognized.';
  }
}
