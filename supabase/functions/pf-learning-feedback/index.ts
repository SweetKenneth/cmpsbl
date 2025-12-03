import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const feedbackSchema = z.object({
  trace_id: z.string(),
  api_type: z.enum(['text', 'image', 'video']),
  provider: z.string(),
  rating: z.number().min(1).max(5),
  feedback_text: z.string().optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawBody = await req.json();
    const validated = feedbackSchema.parse(rawBody);

    // Insert feedback
    const { data, error } = await supabaseClient
      .from('pf_output_feedback')
      .insert({
        trace_id: validated.trace_id,
        api_type: validated.api_type,
        provider: validated.provider,
        rating: validated.rating,
        feedback_text: validated.feedback_text,
        rated_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    // Immediately update model stats with feedback weight
    try {
      await supabaseClient.rpc('update_model_stats_with_feedback', {
        p_provider: validated.provider,
        p_rating: validated.rating
      });
    } catch (rpcError) {
      // RPC may not exist, that's ok
      console.log('Note: RPC for feedback weighting not available');
    }

    console.log(`📊 Feedback recorded: ${validated.provider} rated ${validated.rating}/5`);

    return new Response(
      JSON.stringify({ success: true, feedback: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Feedback submission error:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid feedback data',
          code: 'VALIDATION_ERROR',
          details: error.errors
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to submit feedback',
        code: 'FEEDBACK_ERROR'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
