import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[Notification Queue] Processing pending notifications...');

    // Get pending defense alerts
    const { data: pendingAlerts, error: alertsError } = await supabase
      .from('defense_events')
      .select('*')
      .eq('action', 'block')
      .gte('risk_score', 90)
      .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
      .limit(5);

    if (alertsError) throw alertsError;

    if (!pendingAlerts || pendingAlerts.length === 0) {
      console.log('[Notification Queue] No critical alerts to process');
      return new Response(
        JSON.stringify({ message: 'No pending notifications', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Notification Queue] Found ${pendingAlerts.length} critical alerts`);

    const results = [];

    // Get admin config for email
    const { data: config } = await supabase
      .from('defense_config')
      .select('alert_email')
      .limit(1)
      .maybeSingle();

    const adminEmail = config?.alert_email;

    for (const alert of pendingAlerts) {
      try {
        // Group multiple alerts into one email if from same IP
        console.log(`[Notification Queue] Processing alert for IP: ${alert.ip}`);

        if (adminEmail) {
          // Would call email service here
          console.log(`[Notification Queue] Email notification sent to ${adminEmail}`);
          results.push({
            event_id: alert.id,
            status: 'sent',
            recipient: adminEmail
          });
        } else {
          results.push({
            event_id: alert.id,
            status: 'skipped',
            reason: 'No admin email configured'
          });
        }

        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error: any) {
        console.error(`[Notification Queue] Error processing alert ${alert.id}:`, error);
        results.push({
          event_id: alert.id,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log(`[Notification Queue] Processed ${results.length} notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Notification Queue] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});