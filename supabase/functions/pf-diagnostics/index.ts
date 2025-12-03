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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: isAdmin } = await supabase.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'admin' 
    });
    if (!isAdmin) throw new Error('Admin access required');

    const { website_ids, report_type = 'full' } = await req.json();

    // Fetch websites
    const { data: websites } = await supabase
      .from('customer_websites')
      .select('*')
      .in('id', website_ids);

    if (!websites || websites.length === 0) {
      throw new Error('No websites found');
    }

    const reports = [];

    for (const website of websites) {
      const checks = [];

      // API Key check
      checks.push({
        check: 'API Key Status',
        status: website.api_key ? 'passed' : 'failed',
        details: website.api_key ? 'API key configured' : 'No API key found'
      });

      // Website accessibility check
      const isAccessible = website.status === 'active';
      checks.push({
        check: 'Website Accessibility',
        status: isAccessible ? 'passed' : 'warning',
        details: isAccessible ? 'Website is active' : 'Website is not active'
      });

      // Bot protection check
      checks.push({
        check: 'Bot Protection',
        status: website.protection_enabled ? 'passed' : 'warning',
        details: website.protection_enabled ? 'Protection enabled' : 'Protection disabled'
      });

      const overall_status = checks.some(c => c.status === 'failed') ? 'critical' :
                            checks.some(c => c.status === 'warning') ? 'warning' : 'healthy';

      // Store report
      const { data: report } = await supabase
        .from('diagnostic_reports')
        .insert({
          website_id: website.id,
          report_type,
          checks,
          overall_status,
          created_by: user.id
        })
        .select()
        .single();

      reports.push(report);
    }

    console.log('Diagnostics complete:', { count: reports.length });

    return new Response(JSON.stringify({ 
      success: true,
      reports
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in diagnostics:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
