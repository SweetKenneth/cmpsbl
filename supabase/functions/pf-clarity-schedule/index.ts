import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, schedule } = await req.json();

    if (action === "create") {
      const { site_url, frequency } = schedule;
      
      // Calculate next scan time based on frequency
      const now = new Date();
      let next_scan_at = new Date(now);
      
      switch (frequency) {
        case "daily":
          next_scan_at.setDate(now.getDate() + 1);
          break;
        case "weekly":
          next_scan_at.setDate(now.getDate() + 7);
          break;
        case "monthly":
          next_scan_at.setMonth(now.getMonth() + 1);
          break;
      }

      const { data, error } = await supabase
        .from("pf_clarity_schedules")
        .insert({
          site_url,
          user_id: user.id,
          frequency,
          next_scan_at: next_scan_at.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, schedule: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list") {
      const { data, error } = await supabase
        .from("pf_clarity_schedules")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ schedules: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update") {
      const { id, active, frequency } = schedule;
      
      const updateData: any = {};
      if (active !== undefined) updateData.active = active;
      if (frequency) {
        updateData.frequency = frequency;
        // Recalculate next scan time
        const now = new Date();
        let next_scan_at = new Date(now);
        
        switch (frequency) {
          case "daily":
            next_scan_at.setDate(now.getDate() + 1);
            break;
          case "weekly":
            next_scan_at.setDate(now.getDate() + 7);
            break;
          case "monthly":
            next_scan_at.setMonth(now.getMonth() + 1);
            break;
        }
        updateData.next_scan_at = next_scan_at.toISOString();
      }

      const { data, error } = await supabase
        .from("pf_clarity_schedules")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, schedule: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const { id } = schedule;

      const { error } = await supabase
        .from("pf_clarity_schedules")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Schedule error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
