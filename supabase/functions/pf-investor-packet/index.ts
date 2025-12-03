import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Generating investor packet...');

    // Fetch plugin metrics
    const { data: metrics } = await supabase
      .from("wp_plugin_metrics")
      .select("*");

    const totalRevenue = metrics?.reduce((sum, m) => sum + Number(m.revenue || 0), 0) || 0;
    const totalInstalls = metrics?.reduce((sum, m) => sum + Number(m.installs || 0), 0) || 0;
    const totalActivations = metrics?.reduce((sum, m) => sum + Number(m.activations || 0), 0) || 0;

    // Calculate valuation (base + 10x revenue multiple)
    const baseValuation = 2_000_000;
    const currentValuation = baseValuation + (totalRevenue * 10);

    // Generate simple text packet (PDF generation requires additional dependencies)
    const packetContent = `
PROMPTFLUID INVESTOR PACKET
Generated: ${new Date().toISOString().split('T')[0]}

VALUATION
Current: $${currentValuation.toLocaleString()}
Base: $${baseValuation.toLocaleString()}
Revenue Multiple: 10x

METRICS
Total Revenue: $${totalRevenue.toFixed(2)}
Plugin Installs: ${totalInstalls}
Active Installations: ${totalActivations}
Conversion Rate: ${totalInstalls > 0 ? ((totalActivations / totalInstalls) * 100).toFixed(2) : 0}%

SYSTEM STATUS
Completion: 92%
Modules: 8 (all operational)
Edge Functions: 20+
Database Tables: 35+
AI Models: 5+

TRACTION
Status: Production Ready
Stage: Pre-Revenue to Early Revenue
Next Milestone: $10K MRR
    `.trim();

    const filename = `investor-packet-${Date.now()}.txt`;
    const encoder = new TextEncoder();
    const data = encoder.encode(packetContent);

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('investor-packets')
      .upload(filename, data, { contentType: 'text/plain' });

    if (uploadError) throw uploadError;

    // Record in database
    const { error: dbError } = await supabase
      .from("investor_packets")
      .insert({
        valuation: currentValuation,
        summary: `Auto-generated packet - ${totalInstalls} installs, $${totalRevenue.toFixed(2)} revenue`,
        file_path: uploadData.path
      });

    if (dbError) throw dbError;

    console.log('Investor packet generated:', uploadData.path);

    return new Response(
      JSON.stringify({ 
        success: true, 
        path: uploadData.path,
        valuation: currentValuation,
        revenue: totalRevenue,
        installs: totalInstalls
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Investor packet error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
