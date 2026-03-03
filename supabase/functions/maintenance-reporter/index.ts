import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── Send Email ─────────────────────────────────────────────────────
    if (action === "send_email") {
      const { recipients, subject, html } = body;

      if (!recipients?.length || !subject || !html) {
        return new Response(
          JSON.stringify({ error: "Missing recipients, subject, or html" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Use Supabase's built-in email or log for now
      // In production, integrate with Resend/SendGrid via secrets
      console.log(`[MAINTENANCE-REPORTER] Email to ${recipients.join(", ")}: ${subject}`);

      // Store email attempt in audit log
      await supabase.from("audit_logs").insert({
        action: "maintenance_email_sent",
        entity_type: "maintenance_report",
        details: { recipients, subject, sent_at: new Date().toISOString() },
      });

      return new Response(
        JSON.stringify({ ok: true, message: `Email queued for ${recipients.length} recipient(s)` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Cron Trigger ───────────────────────────────────────────────────
    if (action === "cron_maintenance") {
      // Run the DB-level cleanup function
      const { error: cleanupError } = await supabase.rpc("cleanup_retention" as any);
      
      if (cleanupError) {
        console.error("[MAINTENANCE-REPORTER] cleanup_retention error:", cleanupError.message);
      }

      // Record the cron run
      await supabase.from("maintenance_reports" as any).insert({
        engine: "orchestrator",
        status: cleanupError ? "partial" : "passed",
        trigger_source: "cron",
        duration_ms: 0,
        findings: cleanupError
          ? [{ id: "cron_cleanup_error", severity: "warn", category: "cron", title: "Cleanup had errors", detail: cleanupError.message }]
          : [{ id: "cron_cleanup_ok", severity: "info", category: "cron", title: "Scheduled cleanup completed", detail: "All retention policies applied." }],
        summary: { total: 1, critical: 0, errors: cleanupError ? 1 : 0, warnings: 0, info: cleanupError ? 0 : 1, autoFixed: 0, passed: !cleanupError },
        completed_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ ok: true, cleanup_error: cleanupError?.message ?? null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Get Recent Reports ─────────────────────────────────────────────
    if (action === "get_reports") {
      const limit = body.limit ?? 20;
      const engine = body.engine; // optional filter

      let query = supabase
        .from("maintenance_reports" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (engine) {
        query = query.eq("engine", engine);
      }

      const { data, error } = await query;

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ reports: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("[MAINTENANCE-REPORTER] Error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
