/**
 * PromptFluid Defense Connection Test
 * Tests connection to protected site APIs
 */

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate input with Zod
    const { z } = await import('https://deno.land/x/zod@v3.22.4/mod.ts');
    const ConnectionTestSchema = z.object({
      site_id: z.string().uuid(),
      timeout_ms: z.number().int().min(1000).max(30000).optional().default(5000)
    });
    
    const body = await req.json();
    const validation = ConnectionTestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { site_id, timeout_ms } = validation.data;

    console.log('🔌 Testing connection for site:', site_id);

    const { data: site, error: siteError } = await supabaseClient
      .from('pf_protected_sites')
      .select('*')
      .eq('id', site_id)
      .single();

    if (siteError) throw siteError;

    // Update status to testing
    await supabaseClient
      .from('pf_protected_sites')
      .update({ connection_status: 'testing' })
      .eq('id', site_id);

    const testResult: any = {
      api_key_valid: site.api_key && site.api_key.startsWith('pf_'),
      url_valid: site.url && (site.url.startsWith('http://') || site.url.startsWith('https://')),
      timestamp: new Date().toISOString()
    };

    // Test actual connection
    try {
      const response = await fetch(`${site.url}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${site.api_key}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(timeout_ms)
      });

      testResult.connection_successful = response.ok;
      testResult.status_code = response.status;
      testResult.response_time = Date.now();
    } catch (error) {
      testResult.connection_successful = false;
      testResult.error = error instanceof Error ? error.message : 'Connection failed';
    }

    const isSuccess = testResult.api_key_valid && testResult.url_valid && testResult.connection_successful;

    // Update test results
    await supabaseClient
      .from('pf_protected_sites')
      .update({
        connection_status: isSuccess ? 'connected' : 'failed',
        connection_test_result: testResult,
        last_connection_test: new Date().toISOString()
      })
      .eq('id', site_id);

    return new Response(
      JSON.stringify({
        success: isSuccess,
        message: isSuccess 
          ? 'Connection test successful' 
          : 'Connection test failed',
        result: testResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Connection test error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
