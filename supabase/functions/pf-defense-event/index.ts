import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema to prevent injection and DoS attacks
const defenseEventSchema = z.object({
  ip: z.string().max(45).regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i, "Invalid IP format"),
  user_agent: z.string().max(500),
  endpoint: z.string().max(200),
  risk_score: z.number().min(0).max(100),
  action: z.enum(['allow', 'challenge', 'block', 'monitor']),
  reason: z.string().max(500),
  metadata: z.record(z.any()).optional().default({}),
  session_id: z.string().max(100).optional(),
  fingerprint_hash: z.string().max(64).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request - defense events should only be logged by authenticated systems
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! }
        }
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validatedBody = defenseEventSchema.parse(rawBody);

    const {
      ip,
      user_agent,
      endpoint,
      risk_score,
      action,
      reason,
      metadata,
      session_id,
      fingerprint_hash,
    } = validatedBody;

    // Insert defense event
    const { data: event, error: eventError } = await supabaseClient
      .from("defense_events")
      .insert({
        ip,
        user_agent,
        endpoint,
        risk_score,
        action,
        reason,
        metadata: metadata || {},
        session_id,
        fingerprint_hash,
      })
      .select()
      .single();

    if (eventError) {
      console.error("Event insert error:", eventError);
      return new Response(
        JSON.stringify({ error: "Failed to log event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update IP reputation
    const { error: repError } = await supabaseClient.rpc("update_ip_reputation", {
      p_ip: ip,
      p_action: action,
      p_risk_score: risk_score,
    });

    if (repError) {
      console.error("Reputation update error:", repError);
    }

    console.log(`Defense event logged: ${action} ${ip} (score: ${risk_score})`);

    return new Response(
      JSON.stringify({
        success: true,
        event_id: event.id,
        action: event.action,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Sanitize error messages to prevent information leakage
    console.error("[INTERNAL] Defense event error:", error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid input data",
          code: "VALIDATION_ERROR"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: "An error occurred processing the defense event",
        code: "INTERNAL_ERROR"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
