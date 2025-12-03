import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    const { action, key_name, api_key } = await req.json();

    console.log(`🔑 Core Keys: ${action}`);

    switch (action) {
      case 'generate': {
        const newKey = `pf_${crypto.randomUUID().replace(/-/g, '')}`;

        // Hash the API key using SHA-256
        const encoder = new TextEncoder();
        const data = encoder.encode(newKey);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Store hashed key in learning_logs for reference
        await supabaseClient.from('learning_logs').insert({
          event_type: 'api_key_generated',
          project_id: 'core',
          payload: {
            key_name,
            key_hash_preview: keyHash.slice(0, 16),
            generated_at: new Date().toISOString(),
          },
          success: true,
        });

        return new Response(
          JSON.stringify({ 
            success: true, 
            api_key: newKey, 
            key_name,
            warning: 'Save this key securely - it cannot be retrieved again'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'validate': {
        if (!api_key?.startsWith('pf_') || api_key.length < 20) {
          return new Response(
            JSON.stringify({ success: true, valid: false }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Hash the provided key and check against stored hash
        const encoder = new TextEncoder();
        const data = encoder.encode(api_key);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Query learning_logs for matching hash
        const { data: logs } = await supabaseClient
          .from('learning_logs')
          .select('*')
          .eq('event_type', 'api_key_generated')
          .like('payload->key_hash_preview', `${keyHash.slice(0, 16)}%`)
          .limit(1);

        const isValid = logs && logs.length > 0;

        return new Response(
          JSON.stringify({ success: true, valid: isValid }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('❌ Core keys error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
