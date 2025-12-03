/**
 * Cascade v4.0.0 - Synthetic Collaboration Message Bus
 * Inter-module communication system
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_MODULES = ['brain', 'vision', 'nexus', 'defense', 'studio', 'ripple', 'access'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const { action, from_module, to_module, payload } = await req.json();

    if (action === 'send') {
      // Send message
      if (!VALID_MODULES.includes(from_module) || !VALID_MODULES.includes(to_module)) {
        return new Response(
          JSON.stringify({ error: 'Invalid module name' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: message, error } = await sb
        .from('module_messages')
        .insert({
          from_module,
          to_module,
          payload_json: payload,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`📬 Message sent: ${from_module} → ${to_module}`);

      return new Response(
        JSON.stringify({ ok: true, message_id: message.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'receive') {
      // Poll for messages
      const module = req.headers.get('x-module-name') || from_module;

      const { data: messages } = await sb
        .from('module_messages')
        .select('*')
        .eq('to_module', module)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(10);

      return new Response(
        JSON.stringify({ ok: true, messages: messages || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'acknowledge') {
      // Mark message as processed
      const { message_id, response } = payload;

      await sb
        .from('module_messages')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString(),
          response_json: response
        })
        .eq('id', message_id);

      console.log(`✅ Message ${message_id} acknowledged`);

      return new Response(
        JSON.stringify({ ok: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Module messaging error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
