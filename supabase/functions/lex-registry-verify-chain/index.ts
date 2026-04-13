/**
 * Lex Registry — Audit Chain Verification Endpoint
 * U.S. Patent App. No. 64/031,637
 *
 * Verifies the integrity of the tamper-evident audit chain for a registry entry.
 * Returns whether the chain is intact, where it broke, and the expected terminal hash.
 *
 * © CMPSBL® — All rights reserved.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AuditEvent {
  id: string;
  registry_id: string;
  event_type: string;
  previous_hash: string | null;
  hash_anchor: string | null;
  event_data: Record<string, unknown>;
  created_at: string;
}

interface VerificationResult {
  registry_id: string;
  chain_intact: boolean;
  total_events: number;
  verified_events: number;
  first_break_at: number | null;
  first_break_event_id: string | null;
  expected_hash: string | null;
  actual_hash: string | null;
  terminal_hash: string | null;
}

async function computeHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const registryId = url.searchParams.get("registry_id");

    if (!registryId) {
      return new Response(
        JSON.stringify({ error: "registry_id parameter required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(registryId)) {
      return new Response(
        JSON.stringify({ error: "Invalid registry_id format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, anonKey);

    // Fetch all events for this registry entry, ordered by creation
    const { data: events, error } = await supabase
      .from("lex_registry_events")
      .select("id, registry_id, event_type, previous_hash, hash_anchor, event_data, created_at")
      .eq("registry_id", registryId)
      .order("created_at", { ascending: true });

    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch audit events" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({
          registry_id: registryId,
          chain_intact: true,
          total_events: 0,
          verified_events: 0,
          first_break_at: null,
          first_break_event_id: null,
          expected_hash: null,
          actual_hash: null,
          terminal_hash: null,
        } satisfies VerificationResult),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Verify the chain
    let chainIntact = true;
    let firstBreakAt: number | null = null;
    let firstBreakEventId: string | null = null;
    let expectedHash: string | null = null;
    let actualHash: string | null = null;
    let verifiedCount = 0;

    for (let i = 0; i < events.length; i++) {
      const event = events[i] as AuditEvent;

      // First event should have null previous_hash
      if (i === 0) {
        if (event.previous_hash !== null) {
          chainIntact = false;
          firstBreakAt = 0;
          firstBreakEventId = event.id;
          expectedHash = null;
          actualHash = event.previous_hash;
          break;
        }
      } else {
        // Subsequent events: previous_hash should match prior event's hash_anchor
        const priorEvent = events[i - 1] as AuditEvent;
        if (event.previous_hash !== priorEvent.hash_anchor) {
          chainIntact = false;
          firstBreakAt = i;
          firstBreakEventId = event.id;
          expectedHash = priorEvent.hash_anchor;
          actualHash = event.previous_hash;
          break;
        }
      }

      // Verify the hash_anchor is correct (recompute from event data + previous_hash)
      if (event.hash_anchor) {
        const hashInput = JSON.stringify(event.event_data ?? {}) + (event.previous_hash ?? "");
        const recomputed = await computeHash(hashInput);

        if (recomputed !== event.hash_anchor) {
          chainIntact = false;
          firstBreakAt = i;
          firstBreakEventId = event.id;
          expectedHash = recomputed;
          actualHash = event.hash_anchor;
          break;
        }
      }

      verifiedCount++;
    }

    const terminalEvent = events[events.length - 1] as AuditEvent;

    const result: VerificationResult = {
      registry_id: registryId,
      chain_intact: chainIntact,
      total_events: events.length,
      verified_events: verifiedCount,
      first_break_at: firstBreakAt,
      first_break_event_id: firstBreakEventId,
      expected_hash: expectedHash,
      actual_hash: actualHash,
      terminal_hash: terminalEvent.hash_anchor,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
