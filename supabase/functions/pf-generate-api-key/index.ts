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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) throw new Error('Unauthorized');

    const { data: isAdmin } = await supabase.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'admin' 
    });
    
    if (!isAdmin) throw new Error('Admin access required');

    const body = await req.json();
    
    // Validate input with Zod
    const { z } = await import('https://deno.land/x/zod@v3.22.4/mod.ts');
    const ApiKeySchema = z.object({
      website_name: z.string().min(1).max(200),
      website_url: z.string().url().max(500)
    });
    
    const validation = ApiKeySchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { website_name, website_url } = validation.data;

    if (!website_name || !website_url) {
      throw new Error('Missing required fields');
    }

    const { data: apiKeyData } = await supabase.rpc('generate_website_api_key');
    const apiKey = apiKeyData;

    const { data: website, error } = await supabase
      .from('customer_websites')
      .insert({
        admin_user_id: user.id,
        website_name,
        website_url,
        api_key: apiKey,
        status: 'active',
        bot_protection_enabled: true,
      })
      .select()
      .single();

    if (error) throw error;

    // Avoid logging full API keys
    console.log('Generated API key for:', website_name, '(ending with ****' + apiKey.slice(-4) + ')');

    return new Response(JSON.stringify({
      success: true,
      website,
      api_key: apiKey,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error generating API key:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
