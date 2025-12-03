import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ProvisionSchema = z.object({
  email: z.string().email().max(255),
  website_url: z.string().url().max(500),
  website_name: z.string().max(200).optional(),
  tier: z.enum(['lite', 'pro', 'enterprise']).default('lite'),
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

    // Authenticate user and verify admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Validate input
    const body = await req.json();
    const validationResult = ProvisionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validationResult.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, website_url, website_name, tier } = validationResult.data;

    // Use service role for operations
    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log(`Auto-provisioning Defense for ${email} at ${website_url}`);

    // Generate API key
    const { data: apiKeyData } = await supabaseClient.rpc('generate_pfdef_api_key');
    const apiKey = apiKeyData;

    // Create customer website entry
    const { data: website, error: websiteError } = await supabaseClient
      .from('customer_websites')
      .insert({
        website_name: website_name || new URL(website_url).hostname,
        website_url: website_url,
        api_key: apiKey,
        contact_email: email,
        tier: tier,
        status: 'active',
        auto_provisioned: true
      })
      .select()
      .single();

    if (websiteError) {
      console.error("Website creation error:", websiteError);
      throw websiteError;
    }

    console.log(`API key generated for ${email} - Free tier activated`);

    return new Response(
      JSON.stringify({
        success: true,
        api_key: apiKey,
        website_id: website.id,
        message: "Free protection activated! Upgrade anytime for Pro features."
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Auto-provision error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
