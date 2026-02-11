import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const topics = [
  // BRAIN — Architecture & Coding Mastery (HIGHEST PRIORITY)
  ["brain", "Substrate architecture: module contracts, event bus, parity"],
  ["brain", "TypeScript advanced: branded types, discriminated unions, generics"],
  ["brain", "React patterns: hooks, suspense, RSC, render optimization"],
  ["brain", "Supabase edge functions: Deno, CORS, JWT, RLS patterns"],
  ["brain", "Memory systems: tiering, retrieval, knowledge graphs"],
  ["brain", "Code evolution: shadow-apply, diff validation, regression detection"],
  ["brain", "Refactoring: safe transformations, anchor preservation"],

  // ENCODED — Code-Writing Excellence (HIGHEST PRIORITY)
  ["encoded", "Clean code: SOLID, function composition, naming conventions"],
  ["encoded", "Error handling: Result types, boundaries, graceful degradation"],
  ["encoded", "Testing strategies: unit/integration/e2e for cognitive systems"],
  ["encoded", "State management: Zustand, React Query cache patterns"],
  ["encoded", "Performance: bundle splitting, lazy loading, memoization"],
  ["encoded", "Security coding: input validation, XSS, injection prevention"],

  // DEFENSE — Security Expertise
  ["defense", "Threat detection: IP blocking, bot signals, fingerprinting"],
  ["defense", "Attack vectors: XSS, CSRF, SQL injection, prompt injection"],
  ["defense", "Rate limiting: sliding windows, token buckets, adaptive throttling"],
  ["defense", "Challenge flows: CAPTCHA alternatives, proof-of-human"],

  // NEXUS — API Cost & Routing
  ["nexus", "Cost arbitrage: model selection by task complexity"],
  ["nexus", "Cache optimization: semantic caching, TTL, invalidation"],
  ["nexus", "Fleet routing: Groq distribution, burst handling"],

  // SYSTEM — Reliability
  ["system", "Self-healing: automatic restart, config rollback, circuit breakers"],
  ["system", "Incident detection: anomaly thresholds, root cause analysis"],

  // VISION — Observability
  ["vision", "Anomaly detection: statistical methods, threshold tuning"],
  ["vision", "Dashboard design: insight surfacing, narrative generation"],

  // ACCESS — Identity & Auth
  ["access", "RLS policy design: least privilege, role hierarchies"],
  ["access", "API key lifecycle: rotation, scoping, audit trails"],

  // INCLUSIVE — Accessibility
  ["inclusive", "WCAG 2.2 compliance: success criteria coverage gaps"],
  ["inclusive", "Auto-fix strategies: ARIA injection, focus management"],

  // CORTEX — Orchestration
  ["cortex", "Pipeline optimization: parallel execution, fan-out/fan-in"],
  ["cortex", "Error cascade prevention: circuit breakers, degradation"],

  // RIPPLE — Integration
  ["ripple", "Webhook reliability: retries, dead letter queues, idempotency"],
  ["ripple", "Event-driven architecture: pub/sub, event sourcing"],

  // DECODE — Conversational Intelligence & System Voice
  ["decode", "Conversational fluency: intent classification, slang handling"],
  ["decode", "System voice: reporting module progress and discoveries"],
  ["decode", "User recognition: identity persistence, preference recall"],

  // MODERNIZER — Safe Evolution
  ["modernizer", "Shadow-apply: canary deployment, rollback strategies"],
  ["modernizer", "Regression detection: behavioral testing, snapshot comparison"],

  // AUTOBLOG — Content Quality
  ["autoblog", "Technical writing: clarity, SEO, fact verification"],
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
