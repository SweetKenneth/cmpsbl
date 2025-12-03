import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { topic, query, weight = 1.5, created_by } = await req.json();

    if (!topic || !query) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: topic, query" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { ok: false, error: "Supabase configuration missing" },
        { status: 500 }
      );
    }

    const sb = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await sb
      .from("learning_queries")
      .insert({
        source: "user",
        topic,
        query,
        weight: Math.max(1.5, weight), // Ensure user queries have weight >= 1.5
        status: "queued",
        created_by,
        scheduled_for: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      console.error("Failed to queue user query:", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      id: data.id,
      queued_at: data.scheduled_for,
      weight: data.weight,
    });
  } catch (error) {
    console.error("Queue user query error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
