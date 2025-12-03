import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UpdateRuleSchema = z.object({
  rule_id: z.string().uuid(),
  threshold: z.number().min(0).max(100).optional(),
  is_active: z.boolean().optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    });

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role for operations
    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (req.method === "GET") {
      // Get defense configuration
      const { data: rules, error } = await supabaseClient
        .from("defense_rules")
        .select("*")
        .order("priority", { ascending: false });

      if (error) {
        console.error("Config fetch error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch config" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const config = {
        rules: rules || [],
        system_status: "operational",
        last_sync: new Date().toISOString(),
        version: "1.0.0",
      };

      return new Response(
        JSON.stringify(config),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (req.method === "POST" || req.method === "PUT") {
      // Verify admin role for updates
      const { data: isAdmin } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update defense configuration - validate input
      const body = await req.json();
      const validationResult = UpdateRuleSchema.safeParse(body);
      
      if (!validationResult.success) {
        return new Response(
          JSON.stringify({ error: 'Invalid input', details: validationResult.error.errors }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { rule_id, threshold, is_active } = validationResult.data;

      const updates: any = {};
      if (threshold !== undefined) updates.threshold = threshold;
      if (is_active !== undefined) updates.is_active = is_active;

      const { data, error } = await supabaseClient
        .from("defense_rules")
        .update(updates)
        .eq("id", rule_id)
        .select()
        .single();

      if (error) {
        console.error("Config update error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update config" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Defense rule updated: ${rule_id}`);

      return new Response(
        JSON.stringify({ success: true, rule: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Defense config error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
