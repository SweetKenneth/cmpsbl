/**
 * Lex Registry Lookup — Public API (Read-Only Microservice)
 * GET /lex-registry-lookup?hash={package-hash}
 * GET /lex-registry-lookup?name={package-name}
 * 
 * FIX #1: Uses ANON key (RLS public SELECT), not service_role
 * FIX #2: Name lookup returns array (non-authoritative) vs hash returns single (authoritative)
 * FIX #3: In-memory rate limiting (60 req/min per IP)
 * 
 * U.S. Patent App. No. 64/031,637
 * © CMPSBL® — All rights reserved.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

/* ── Rate limiter (in-memory, per-isolate) ── */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= RATE_LIMIT;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  /* ── Rate limit check ── */
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("cf-connecting-ip")
    || "unknown";

  if (!checkRateLimit(clientIp)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Max 60 requests per minute." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } }
    );
  }

  const url = new URL(req.url);
  const hash = url.searchParams.get("hash")?.trim().toLowerCase();
  const name = url.searchParams.get("name")?.trim();

  if (!hash && !name) {
    return new Response(
      JSON.stringify({ error: "Provide ?hash= or ?name= query parameter" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Validate hash format if provided
  if (hash && !/^[a-f0-9]{64}$/.test(hash)) {
    return new Response(
      JSON.stringify({ error: "hash must be a valid SHA-256 hex string (64 chars)" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Validate name length
  if (name && (name.length < 1 || name.length > 255)) {
    return new Response(
      JSON.stringify({ error: "name must be 1-255 characters" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // FIX #1: Use ANON key — RLS public SELECT policy handles access
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  // Use public view (excludes registrant_email, accessible to anon)
  const viewName = "lex_registry_public";
  const selectCols = "package_name, package_hash, status, registrant_org, registered_at";

  // FIX #2: Hash = authoritative (single), Name = convenience (array)
  if (hash) {
    const { data, error } = await supabase
      .from(viewName)
      .select(selectCols)
      .eq("package_hash", hash)
      .maybeSingle();

    if (error) {
      return new Response(
        JSON.stringify({ error: "Registry lookup failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ status: "unregistered", package_name: null, package_hash: hash, registered_at: null }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        status: data.status,
        package_name: data.package_name,
        package_hash: data.package_hash,
        registrant_org: data.registrant_org,
        registered_at: data.registered_at,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Name lookup — non-authoritative, returns matches array
  const { data, error } = await supabase
    .from("lex_registry")
    .select(selectCols)
    .eq("package_name", name!)
    .limit(10);

  if (error) {
    return new Response(
      JSON.stringify({ error: "Registry lookup failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!data || data.length === 0) {
    return new Response(
      JSON.stringify({ status: "unregistered", package_name: name, matches: [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (data.length === 1) {
    return new Response(
      JSON.stringify({
        status: data[0].status,
        package_name: data[0].package_name,
        package_hash: data[0].package_hash,
        registrant_org: data[0].registrant_org,
        registered_at: data[0].registered_at,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Multiple matches — ambiguous
  return new Response(
    JSON.stringify({
      status: "ambiguous",
      package_name: name,
      matches: data.map((d) => ({
        status: d.status,
        package_hash: d.package_hash,
        registrant_org: d.registrant_org,
        registered_at: d.registered_at,
      })),
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
