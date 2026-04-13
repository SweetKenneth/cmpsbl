/**
 * Lex Registry Register — Authenticated Package Registration
 * POST /lex-registry-register
 * Body: { package_name, package_hash, status?, org?, metadata? }
 * 
 * FIX #3: Rate limiting (5 req/min per user)
 * FIX #4: Metadata sanitization (size cap, key whitelist, depth limit)
 * 
 * U.S. Patent App. No. 64/031,637
 * © CMPSBL® — All rights reserved.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

/* ── Rate limiter (in-memory, per-isolate) ── */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= RATE_LIMIT;
}

/* ── Metadata sanitization ── */
const METADATA_MAX_SIZE = 5000;
const METADATA_ALLOWED_KEYS = new Set([
  "registrant_email", "version", "description", "repository",
  "homepage", "license", "keywords", "scope", "registry",
]);

function sanitizeMetadata(raw: unknown): Record<string, string | string[]> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};

  const serialized = JSON.stringify(raw);
  if (serialized.length > METADATA_MAX_SIZE) return {};

  const result: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!METADATA_ALLOWED_KEYS.has(key)) continue;
    if (typeof value === "string") {
      result[key] = value.slice(0, 500);
    } else if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
      result[key] = value.slice(0, 20).map((v: string) => v.slice(0, 100));
    }
    // Skip non-string, non-string-array values (no nested objects)
  }
  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Validate JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Authentication required" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: "Invalid authentication token" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  /* ── Rate limit check (per user) ── */
  if (!checkRateLimit(user.id)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Max 5 registrations per minute." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } }
    );
  }

  // Parse and validate body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const packageName = typeof body.package_name === "string" ? body.package_name.trim() : "";
  const packageHash = typeof body.package_hash === "string" ? body.package_hash.trim() : "";
  const status = body.status === "licensed" ? "licensed" : "protected";
  const org = typeof body.org === "string" ? body.org.trim().slice(0, 255) : null;

  // FIX #4: Sanitized metadata — whitelisted keys, flat structure, size capped
  const metadata = sanitizeMetadata(body.metadata);

  if (!packageName || packageName.length > 255) {
    return new Response(
      JSON.stringify({ error: "package_name is required (max 255 chars)" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Validate package name format (alphanumeric, dashes, dots, slashes for scoped packages)
  if (!/^[@a-zA-Z0-9][\w./-]{0,254}$/.test(packageName)) {
    return new Response(
      JSON.stringify({ error: "Invalid package name format" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!packageHash || !/^[a-f0-9]{64}$/i.test(packageHash)) {
    return new Response(
      JSON.stringify({ error: "package_hash must be a valid SHA-256 hex string (64 chars)" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Insert registration (audit event auto-created by trigger)
  const { data, error } = await supabase
    .from("lex_registry")
    .insert({
      package_name: packageName,
      package_hash: packageHash.toLowerCase(),
      status,
      registrant_email: user.email ?? "",
      registrant_org: org,
      registrant_user_id: user.id,
      metadata,
    })
    .select("id, package_name, package_hash, status, registered_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return new Response(
        JSON.stringify({ error: "This package hash is already registered" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: "Registration failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      registration: data,
    }),
    { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
