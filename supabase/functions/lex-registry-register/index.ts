/**
 * Lex Registry Register — Authenticated Package Registration
 * POST /lex-registry-register
 * Body: { package_name, package_hash, status?, org?, metadata? }
 * 
 * Registers a package on the Lex Blacklist (free) or requests Whitelist (licensed).
 * Requires authentication.
 * 
 * U.S. Patent App. No. 64/031,637
 * © CMPSBL® — All rights reserved.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

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
  const metadata = typeof body.metadata === "object" && body.metadata !== null ? body.metadata : {};

  if (!packageName || packageName.length > 255) {
    return new Response(
      JSON.stringify({ error: "package_name is required (max 255 chars)" }),
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
      JSON.stringify({ error: "Registration failed", detail: error.message }),
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
