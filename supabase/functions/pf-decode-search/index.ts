import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * DECODE Brand Monitor — 3x daily ego/brand search
 * Searches DuckDuckGo for 6 monitored topics, stores new results
 */

const MONITORED_TOPICS = [
  "Kenneth E. Sweet Jr.",
  "CMPSBL",
  "XCTBL",
  "PromptFluid",
  "LNCHBL",
  "EVLVBL",
];

async function searchWeb(query: string): Promise<Array<{ title: string; url: string; snippet: string }>> {
  try {
    // Use Google Gemini with grounded search (skip Firecrawl — 402)

    // Fallback: Use Google Gemini with grounding/search
    const googleKey = Deno.env.get("GOOGLE_AI_STUDIO_KEY");
    if (googleKey) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${googleKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Search the web for recent news, articles, or mentions about "${query}". Return ONLY a JSON array of objects with fields: title, url, snippet. Return up to 5 results. If nothing found, return an empty array []. Only return the JSON, nothing else.` }] }],
            generationConfig: { temperature: 0.1 },
            tools: [{ googleSearch: {} }],
          }),
        }
      );
      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        
        // Also check grounding metadata for search results
        const groundingMeta = geminiData.candidates?.[0]?.groundingMetadata;
        const groundingChunks = groundingMeta?.groundingChunks || [];
        const searchResults: Array<{ title: string; url: string; snippet: string }> = [];
        
        // Extract from grounding chunks (actual search results)
        for (const chunk of groundingChunks) {
          if (chunk.web?.uri) {
            searchResults.push({
              title: chunk.web.title || "Untitled",
              url: chunk.web.uri,
              snippet: "",
            });
          }
        }
        
        // Also try to parse LLM response as JSON
        if (searchResults.length === 0) {
          try {
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              for (const item of parsed) {
                if (item.url && item.title) {
                  searchResults.push({ title: item.title, url: item.url, snippet: item.snippet || "" });
                }
              }
            }
          } catch { /* ignore parse errors */ }
        }
        
        console.log(`  → Gemini grounded search: ${searchResults.length} results for "${query}"`);
        return searchResults.slice(0, 5);
      }
    }

    console.warn(`  → No search provider available for "${query}"`);
    return [];
  } catch (err) {
    console.error(`Search error for "${query}":`, err);
    return [];
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("🔍 DECODE Brand Monitor — starting search cycle (Gemini grounded)");

    // Check if we already ran today (max 3x/day)
    const today = new Date().toISOString().split("T")[0];
    const { count: todayCount } = await supabase
      .from("decode_search_results")
      .select("id", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00Z`);

    if ((todayCount || 0) > 90) {
      console.log("⚠️ Daily search limit reached (3 runs). Skipping.");
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "daily_limit" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allResults: Array<{ topic: string; title: string; url: string; snippet: string }> = [];

    for (const topic of MONITORED_TOPICS) {
      console.log(`  🔎 Searching: "${topic}"`);
      const results = await searchWeb(topic);

      for (const r of results) {
        // Check for duplicates (same URL already stored)
        const { count: existing } = await supabase
          .from("decode_search_results")
          .select("id", { count: "exact", head: true })
          .eq("source_url", r.url)
          .eq("topic", topic);

        if (!existing || existing === 0) {
          allResults.push({ topic, ...r });
        }
      }

      // Rate limit between searches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Insert new results
    if (allResults.length > 0) {
      const rows = allResults.map(r => ({
        topic: r.topic,
        query: r.topic,
        source_url: r.url,
        title: r.title,
        snippet: r.snippet,
        relevance_score: 0.7,
        is_new: true,
        search_provider: "gemini_grounded",
      }));

      const { error } = await supabase.from("decode_search_results").insert(rows);
      if (error) console.error("Insert error:", error);
    }

    // Log brain event
    await supabase.from("brain_events").insert({
      module: "decode",
      event_type: "brand_monitor_search",
      outcome: "success",
      data: {
        topics_searched: MONITORED_TOPICS.length,
        new_results: allResults.length,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`✅ DECODE search complete: ${allResults.length} new results across ${MONITORED_TOPICS.length} topics`);

    return new Response(
      JSON.stringify({
        success: true,
        topics_searched: MONITORED_TOPICS.length,
        new_results: allResults.length,
        results: allResults,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("DECODE search error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
