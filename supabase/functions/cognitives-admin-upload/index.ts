/**
 * Cognitives Admin Upload — Upload/replace cognitive ZIP artifacts
 * Requires authenticated admin user.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_SKUS: Record<string, string> = {
  research: "cmpsbl-research-cognitive.zip",
  coding: "cmpsbl-coding-agent.zip",
  analyst: "cmpsbl-analyst.zip",
  ops: "cmpsbl-ops.zip",
  writer: "cmpsbl-writer.zip",
  hybrid: "cmpsbl-hybrid.zip",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseAnon.auth.getUser(token);
    if (authError || !userData.user) throw new Error("Invalid auth token");

    // Admin role check
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      throw new Error("Admin access required");
    }

    if (req.method === "GET") {
      // List current files in bucket
      const { data: files, error: listError } = await supabaseAdmin.storage
        .from("cognitives_zips")
        .list("", { limit: 100 });

      if (listError) throw listError;

      const inventory: Record<string, { exists: boolean; size?: number; updatedAt?: string }> = {};
      for (const [sku, filename] of Object.entries(VALID_SKUS)) {
        const file = files?.find((f) => f.name === filename);
        inventory[sku] = file
          ? { exists: true, size: file.metadata?.size || 0, updatedAt: file.updated_at }
          : { exists: false };
      }

      return new Response(JSON.stringify({ ok: true, inventory }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const contentType = req.headers.get("content-type") || "";

      if (!contentType.includes("multipart/form-data")) {
        throw new Error("Expected multipart/form-data");
      }

      const formData = await req.formData();
      const sku = formData.get("sku") as string;
      const file = formData.get("file") as File;

      if (!sku || !VALID_SKUS[sku]) {
        throw new Error("Invalid SKU: " + sku);
      }

      if (!file || !(file instanceof File)) {
        throw new Error("No file provided");
      }

      if (!file.name.endsWith(".zip")) {
        throw new Error("Only ZIP files are allowed");
      }

      const filename = VALID_SKUS[sku];

      // Delete existing file first (upsert)
      await supabaseAdmin.storage.from("cognitives_zips").remove([filename]);

      // Upload new file
      const arrayBuffer = await file.arrayBuffer();
      const { error: uploadError } = await supabaseAdmin.storage
        .from("cognitives_zips")
        .upload(filename, arrayBuffer, {
          contentType: "application/zip",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Upload failed: " + uploadError.message);
      }

      console.log(`Admin ${userData.user.email} uploaded ${filename} for SKU ${sku}`);

      return new Response(
        JSON.stringify({ ok: true, sku, filename, size: file.size }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Method not allowed");
  } catch (error) {
    console.error("Cognitives admin upload error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
