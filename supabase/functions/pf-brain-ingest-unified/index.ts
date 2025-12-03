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
    // Service role authentication - only internal systems can call this
    const authHeader = req.headers.get('Authorization');
    const providedKey = authHeader?.replace('Bearer ', '');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (providedKey !== SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Service role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { source = 'sensory', data: inputData, params = {} } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      SUPABASE_SERVICE_ROLE_KEY ?? ''
    );

    const result: any = {
      source,
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    switch (source) {
      case 'secure':
        try {
          const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader! } } }
          );

          const { data: { user } } = await supabaseClient.auth.getUser();
          if (!user) throw new Error('Authentication required');

          const { data, error } = await supabase
            .from('brain_secure_ingestion')
            .insert({
              user_id: user.id,
              content: inputData.content,
              content_type: inputData.content_type || 'text',
              metadata: { ...params, ingested_via: 'secure' }
            })
            .select();

          if (error) throw error;
          result.ingested = data[0];
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'sensory':
        try {
          const { data, error } = await supabase
            .from('brain_sensory_data')
            .insert({
              sensor_type: inputData.sensor_type || 'text',
              raw_data: inputData.raw_data,
              processed: false,
              metadata: { ...params, ingested_via: 'sensory' }
            })
            .select();

          if (error) throw error;
          result.ingested = data[0];
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'global':
        try {
          const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader! } } }
          );

          const { data: { user } } = await supabaseClient.auth.getUser();
          if (!user) throw new Error('Authentication required');

          const { data, error } = await supabase
            .from('brain_global_context')
            .insert({
              context_type: inputData.context_type || 'general',
              content: inputData.content,
              relevance_score: inputData.relevance_score || 0.5,
              metadata: { ...params, ingested_via: 'global', submitted_by: user.id }
            })
            .select();

          if (error) throw error;
          result.ingested = data[0];
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'feedback':
        try {
          const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader! } } }
          );

          const { data: { user } } = await supabaseClient.auth.getUser();
          if (!user) throw new Error('Authentication required');

          const { data, error } = await supabase
            .from('brain_feedback_ingestion')
            .insert({
              feedback_type: inputData.feedback_type || 'general',
              content: inputData.content,
              rating: inputData.rating,
              metadata: { ...params, ingested_via: 'feedback', user_id: user.id }
            })
            .select();

          if (error) throw error;
          result.ingested = data[0];
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      default:
        result.status = 'error';
        result.message = `Unknown ingest source: ${source}`;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Ingest unified error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
