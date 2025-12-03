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
    const { url, theme, improve_content = true } = await req.json();
    console.log('Orchestrator received:', { url, theme, improve_content });
    
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('User authenticated:', user.id);

    // Check quota
    const { data: quotaOk } = await supabase.rpc('check_modernizer_quota', { 
      p_user_id: user.id 
    });

    if (!quotaOk) {
      return new Response(JSON.stringify({ 
        error: 'Monthly quota exceeded',
        upgrade_required: true 
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Creating job...');
    
    // Create job
    const { data: job, error: jobError } = await supabase
      .from('modernizer_jobs')
      .insert({
        user_id: user.id,
        source_url: url,
        selected_theme: theme || 'modern',
        improve_content,
        job_status: 'pending'
      })
      .select()
      .single();

    if (jobError) {
      console.error('Job creation error:', jobError);
      throw jobError;
    }

    console.log('Job created:', job.id);

    // Trigger extraction (async fire-and-forget with Brain learning)
    const pipeline = async () => {
      try {
        console.log('Starting extraction...');
        const extractRes = await fetch(`${supabaseUrl}/functions/v1/pf-modernizer-extract`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ job_id: job.id })
        });
        
        if (!extractRes.ok) {
          throw new Error(`Extract failed: ${await extractRes.text()}`);
        }
        
        console.log('Extraction complete, starting rebuild...');
        const rebuildRes = await fetch(`${supabaseUrl}/functions/v1/pf-modernizer-rebuild`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ job_id: job.id })
        });
        
        if (!rebuildRes.ok) {
          throw new Error(`Rebuild failed: ${await rebuildRes.text()}`);
        }
        
        console.log('Rebuild complete, scoring...');
        await fetch(`${supabaseUrl}/functions/v1/pf-modernizer-score`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ job_id: job.id })
        });

        // Brain Learning (non-blocking, fire-and-forget)
        console.log('Triggering Brain learning...');
        fetch(`${supabaseUrl}/functions/v1/pf-modernizer-brain-learn`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ job_id: job.id })
        }).catch(e => console.error('Brain learning failed (non-critical):', e));
        
        console.log('Pipeline complete!');
      } catch (err) {
        console.error('Pipeline error:', err);
        await supabase
          .from('modernizer_jobs')
          .update({ 
            job_status: 'failed',
            error_message: err.message 
          })
          .eq('id', job.id);
      }
    };
    
    // Start pipeline asynchronously
    pipeline();

    return new Response(JSON.stringify({ 
      success: true,
      job_id: job.id,
      message: 'Modernization started'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Orchestrator error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
