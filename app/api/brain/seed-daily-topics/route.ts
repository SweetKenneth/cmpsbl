import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const topics = [
  // ENGINEERING (Code)
  ["engineering", "React patterns: hooks, suspense, RSC"],
  ["engineering", "Next.js edge functions & caching"],
  ["engineering", "Supabase RLS patterns & row security gotchas"],
  ["engineering", "TypeScript typesafety: zod + tRPC-like shapes"],
  ["engineering", "API cost-guard middleware & retries"],
  ["engineering", "Queue semantics: idempotency keys & dedupe"],
  ["engineering", "Unit/e2e test scaffolds for edge functions"],
  ["engineering", "Prompt-to-code templates for Studio"],
  
  // AI SYSTEMS
  ["ai-systems", "Routing: model selection heuristics & cost curves"],
  ["ai-systems", "Prompt fusion & instruction hierarchy"],
  ["ai-systems", "Reflection & self-critique loops"],
  ["ai-systems", "Embeddings & vector search tradeoffs"],
  ["ai-systems", "Grounded research patterns with citations"],
  ["ai-systems", "Knowledge graph extraction (triples)"],
  
  // DEFENSE
  ["defense", "Behavioral bot signals & thresholds"],
  ["defense", "Browser fingerprint anti-evasion tactics"],
  ["defense", "Rate limiting designs without UX pain"],
  ["defense", "Challenge flows: slider, puzzle, proof-of-human"],
  
  // UX / PRODUCT
  ["ux", "Motion micro-interactions that convert"],
  ["ux", "Empty states, skeletons, and progressive disclosure"],
  ["ux", "AI UX: showing confidence, sources, and costs"],
  
  // ECON / PRICING
  ["economics", "Freemium → Pro ladders for WP plugins"],
  ["economics", "MRR compounding & churn levers"],
  ["economics", "Usage-based pricing with soft caps"],
  
  // MARKETING
  ["marketing", "SEO topical authority for AI + security"],
  ["marketing", "WP directory listing optimization"],
  ["marketing", "Founders-led content loop templates"],
  
  // OPS
  ["ops", "Runbooks for outages & degraded providers"],
  ["ops", "Secrets rotation & audit trails"],
  ["ops", "Cost dashboards & anomaly alerts"],
  
  // STRATEGY
  ["strategy", "Partner distribution in WP ecosystem"],
  ["strategy", "Feature moat vs. speed moat tradeoffs"],
  ["strategy", "Roadmap: Defense → Studio → Marketplace"],
  
  // CREATIVE GEN
  ["creative", "Image gen pipelines & brand style locks"],
  ["creative", "Video gen: Luma/Runway workflows"],
  
  // SALES
  ["sales", "Enterprise security questionnaires playbook"],
  ["sales", "Proof packs for CTO buyers"],
  
  // SUPPORT
  ["support", "Triage trees & auto-fix suggestions"],
  ["support", "Telemetry to GitHub issues bridge"],
  
  // META-LEARNING
  ["meta", "Error taxonomy & self-healing patterns"],
  ["meta", "FreedomScore calibration & drift control"],
];

export async function POST(_req: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { ok: false, error: "Supabase configuration missing" },
        { status: 500 }
      );
    }

    const sb = createClient(supabaseUrl, supabaseKey);

    // Seed daily topics
    const topicsPayload = topics.map(([bucket, topic]) => ({
      bucket,
      topic,
      cadence: "daily",
    }));

    const { error: topicsError } = await sb
      .from("daily_topics")
      .upsert(topicsPayload, { onConflict: "bucket,topic" });

    if (topicsError) {
      console.error("Failed to seed topics:", topicsError);
      return NextResponse.json(
        { ok: false, error: topicsError.message },
        { status: 400 }
      );
    }

    // Create initial system queries
    const systemQueries = topicsPayload.map((t) => ({
      source: "system",
      topic: t.topic,
      query: `Research and learn: ${t.topic}. Return concise facts, examples, citations.`,
      weight: 1.0,
      status: "queued",
      scheduled_for: new Date().toISOString(),
    }));

    const { error: queriesError } = await sb
      .from("learning_queries")
      .insert(systemQueries);

    if (queriesError) {
      console.error("Failed to seed queries:", queriesError);
      return NextResponse.json(
        { ok: false, error: queriesError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      seeded: topicsPayload.length,
      topics_created: topicsPayload.length,
      queries_queued: systemQueries.length,
    });
  } catch (error) {
    console.error("Seed topics error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
