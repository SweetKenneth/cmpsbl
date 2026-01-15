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

    const { data: isAdmin } = await supabase.rpc('has_role_text', { 
      _user_id: user.id, 
      _role: 'admin' 
    });
    if (!isAdmin) throw new Error('Admin access required');

    const { operation, tenant_id, data } = await req.json();

    switch (operation) {
      case 'suspend':
        await supabase.from('tenants').update({ 
          status: 'suspended',
          metadata: { suspended_at: new Date().toISOString(), suspended_by: user.id }
        }).eq('id', tenant_id);
        break;

      case 'activate':
        await supabase.from('tenants').update({ 
          status: 'active',
          metadata: { activated_at: new Date().toISOString(), activated_by: user.id }
        }).eq('id', tenant_id);
        break;

      case 'update_subscription':
        await supabase.from('tenants').update({
          subscription_tier: data.tier,
          monthly_fee: data.fee,
          subscription_expires_at: data.expires_at,
        }).eq('id', tenant_id);
        break;

      case 'generate_api_key':
        const keyPrefix = `sk_${Math.random().toString(36).substring(2, 10)}`;
        const keyHash = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(keyPrefix + Math.random())
        ).then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));

        await supabase.from('tenant_api_keys').insert({
          tenant_id,
          key_hash: keyHash,
          key_prefix: keyPrefix,
          name: data.name || 'API Key',
          permissions: data.permissions || { bot_control: true, view_logs: true },
        });
        break;

      default:
        throw new Error('Invalid operation');
    }

    console.log('Admin control operation:', { operation, tenant_id });

    return new Response(
      JSON.stringify({ success: true, operation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in admin control:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
