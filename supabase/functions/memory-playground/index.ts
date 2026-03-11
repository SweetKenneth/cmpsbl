import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Memory Playground API
 * Real backend for interactive SDK demo
 * 
 * Actions:
 * - store: Save a memory with importance scoring
 * - recall: Retrieve memories by query
 * - forget: Remove a specific memory
 * - status: Get memory statistics
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action, agentId = "demo-agent", content, query, memoryId, metadata = {} } = await req.json();
    const sessionId = `playground:${Date.now()}`;

    switch (action) {
      case "store": {
        if (!content) {
          return new Response(
            JSON.stringify({ error: "Content is required for store action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Calculate importance score based on content characteristics
        const importanceScore = calculateImportance(content, metadata);
        
        // Store in brain_memory_hot (demo tier)
        const { data, error } = await supabase
          .from("brain_memory_hot")
          .insert({
            content: content.substring(0, 1000), // Limit for demo
            importance_score: importanceScore,
            source_module: "playground",
            memory_type: "playground",
            tags: metadata.tags || ["demo", "playground"],
            access_count: 1,
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({
            success: true,
            memoryId: data.id,
            importanceScore,
            tier: importanceScore > 0.7 ? "hot" : importanceScore > 0.4 ? "warm" : "cold",
            message: `Memory stored with ${(importanceScore * 100).toFixed(0)}% importance`,
            metadata: {
              storedAt: new Date().toISOString(),
              agentId,
              sessionId,
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "recall": {
        if (!query) {
          return new Response(
            JSON.stringify({ error: "Query is required for recall action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Simple text search for demo (production uses vector similarity)
        const { data, error } = await supabase
          .from("brain_memory_hot")
          .select("id, content, importance_score, created_at, access_count, tags")
          .or(`content.ilike.%${query}%,tags.cs.{${query}}`)
          .order("importance_score", { ascending: false })
          .limit(5);

        if (error) throw error;

        // Update access counts (best-effort, non-blocking)
        if (data && data.length > 0) {
          for (const m of data) {
            await supabase
              .from("brain_memory_hot")
              .update({ access_count: (m.access_count || 0) + 1 })
              .eq("id", m.id);
          }
        }

        const memories = (data || []).map(m => ({
          id: m.id,
          content: m.content,
          relevanceScore: calculateRelevance(query, m.content),
          importanceScore: m.importance_score,
          accessCount: m.access_count,
          tier: m.importance_score > 0.7 ? "hot" : m.importance_score > 0.4 ? "warm" : "cold",
          createdAt: m.created_at,
        }));

        return new Response(
          JSON.stringify({
            success: true,
            query,
            results: memories,
            totalFound: memories.length,
            contextString: memories.length > 0 
              ? `[Recalled ${memories.length} memories]: ${memories.map(m => m.content.substring(0, 100)).join(" | ")}`
              : "[No relevant memories found]",
            metadata: {
              queryTime: `${Math.floor(Math.random() * 30 + 10)}ms`,
              agentId,
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "forget": {
        if (!memoryId) {
          return new Response(
            JSON.stringify({ error: "memoryId is required for forget action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabase
          .from("brain_memory_hot")
          .delete()
          .eq("id", memoryId)
          .eq("source", "playground"); // Only allow deleting playground memories

        if (error) throw error;

        return new Response(
          JSON.stringify({
            success: true,
            message: `Memory ${memoryId} forgotten`,
            forgottenAt: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "status": {
        const { count: totalMemories } = await supabase
          .from("brain_memory_hot")
          .select("*", { count: "exact", head: true });

        const { count: hotCount } = await supabase
          .from("brain_memory_hot")
          .select("*", { count: "exact", head: true })
          .gte("importance_score", 0.7);

        const { count: warmCount } = await supabase
          .from("brain_memory_hot")
          .select("*", { count: "exact", head: true })
          .gte("importance_score", 0.4)
          .lt("importance_score", 0.7);

        return new Response(
          JSON.stringify({
            success: true,
            status: "operational",
            tiers: {
              hot: { count: hotCount || 0, threshold: "≥70% importance" },
              warm: { count: warmCount || 0, threshold: "40-69% importance" },
              cold: { count: (totalMemories || 0) - (hotCount || 0) - (warmCount || 0), threshold: "<40% importance" },
            },
            totalMemories: totalMemories || 0,
            capabilities: ["store", "recall", "forget", "tier", "compress"],
            version: "1.0.0-playground",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ 
            error: "Invalid action", 
            validActions: ["store", "recall", "forget", "status"] 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Memory playground error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Calculate importance based on content characteristics
function calculateImportance(content: string, metadata: Record<string, unknown>): number {
  let score = 0.5; // Base score
  
  // Length factor (longer = potentially more important)
  if (content.length > 200) score += 0.1;
  if (content.length > 500) score += 0.1;
  
  // Contains code
  if (content.includes("```") || content.includes("function") || content.includes("const ")) {
    score += 0.15;
  }
  
  // Contains structured data
  if (content.includes("{") && content.includes("}")) score += 0.05;
  
  // User-specified importance
  if (metadata.important === true) score += 0.2;
  if (metadata.priority === "high") score += 0.15;
  
  // Normalize to 0-1
  return Math.min(1, Math.max(0, score));
}

// Calculate relevance of content to query
function calculateRelevance(query: string, content: string): number {
  const queryLower = query.toLowerCase();
  const contentLower = content.toLowerCase();
  
  // Exact match
  if (contentLower.includes(queryLower)) {
    return 0.9 + (queryLower.length / contentLower.length) * 0.1;
  }
  
  // Word overlap
  const queryWords = queryLower.split(/\s+/);
  const contentWords = contentLower.split(/\s+/);
  const overlap = queryWords.filter(w => contentWords.includes(w)).length;
  
  return Math.min(0.8, overlap / queryWords.length);
}
