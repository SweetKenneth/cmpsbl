/**
 * Lex Registry Lookup — Public API
 * GET /lex-registry-lookup?hash={package-hash}
 * GET /lex-registry-lookup?name={package-name}
 * 
 * Returns: { status: 'protected' | 'licensed' | 'unregistered', registered_at, package_name }
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

  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const url = new URL(req.url);
  const hash = url.searchParams.get("hash");
  const name = url.searchParams.get("name");

  if (!hash && !name) {
    return new Response(
      JSON.stringify({ error: "Provide ?hash= or ?name= query parameter" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let query = supabase
    .from("lex_registry")
    .select("package_name, package_hash, status, registrant_org, registered_at, metadata");

  if (hash) {
    query = query.eq("package_hash", hash);
  } else if (name) {
    query = query.eq("package_name", name);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    return new Response(
      JSON.stringify({ error: "Registry lookup failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!data) {
    return new Response(
      JSON.stringify({
        status: "unregistered",
        package_name: null,
        package_hash: hash || null,
        registered_at: null,
      }),
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
});
