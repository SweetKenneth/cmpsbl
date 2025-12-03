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
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No auth header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decode JWT to extract user id (verify_jwt=true already validated it)
    const token = authHeader.replace('Bearer ', '');
    let userId = '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub as string;
    } catch (_e) {
      // ignore
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Service role client (bypasses RLS for server-side operations)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin role using SECURITY DEFINER function
    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc('has_role', {
      _user_id: userId,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      console.error('Role verification error:', roleError);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { site_name, site_url } = await req.json();

    if (!site_name || !site_url) {
      return new Response(
        JSON.stringify({ error: 'site_name and site_url are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }


    // Generate API key using database function
    const { data: keyData, error: keyError } = await supabaseAdmin
      .rpc('generate_pfdef_api_key');

    if (keyError || !keyData) {
      console.error('Key generation error:', keyError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate API key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = keyData as string;

    // Prepare payload for insert (only valid columns)
    const newWebsite = {
      created_by: userId,
      website_name: site_name,
      website_url: site_url,
      api_key: apiKey,
      status: 'active',
      protection_enabled: true,
    };

    console.log('📝 Inserting customer_websites payload:', newWebsite);

    // Insert website with unlimited tier
    const { error: insertError } = await supabaseAdmin
      .from('customer_websites')
      .insert([newWebsite]);

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create website record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Generated unlimited admin key for ${site_name}`);

    return new Response(
      JSON.stringify({
        success: true,
        api_key: apiKey,
        site_name,
        status: 'active',
        unlimited: true,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
