import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { createSafeErrorResponse, createValidationErrorResponse } from '../_shared/security-utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const applySchema = z.object({
  proposal_id: z.string().uuid(),
  action: z.enum(['apply', 'rollback']),
  applied_by: z.string().min(1).max(200)
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

    // Authentication check - require admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user has admin role
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roles) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate input
    const rawBody = await req.json();
    const validationResult = applySchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      return createValidationErrorResponse(corsHeaders, 'Invalid request data');
    }

    const { proposal_id, action, applied_by } = validationResult.data;

    // Fetch the proposal
    const { data: proposal, error: propError } = await supabaseClient
      .from('evolution_proposals')
      .select('*')
      .eq('id', proposal_id)
      .single();

    if (propError) throw propError;

    if (action === 'apply' && proposal.status !== 'approved') {
      throw new Error('Can only apply approved proposals');
    }

    // Get current config (simulated - in production, fetch from target system)
    const prevConfig = {
      system: proposal.target_system,
      timestamp: new Date().toISOString(),
      config: { /* current system config would be fetched here */ }
    };

    const newConfig = {
      ...prevConfig,
      config: proposal.suggested_change
    };

    // Record the update in audit trail
    const { data: update, error: updateError } = await supabaseClient
      .from('system_updates')
      .insert({
        proposal_id,
        target_system: proposal.target_system,
        action,
        new_config: newConfig,
        prev_config: prevConfig,
        applied_by
      })
      .select()
      .single();

    if (updateError) throw updateError;

    // Update proposal status
    const { error: statusError } = await supabaseClient
      .from('evolution_proposals')
      .update({
        status: action === 'apply' ? 'applied' : 'rolled_back'
      })
      .eq('id', proposal_id);

    if (statusError) throw statusError;

    console.log(`✅ Proposal ${proposal_id} ${action}ed by ${applied_by}`);

    // Log the action
    await supabaseClient.from('brain_events').insert({
      module: 'cascade',
      event_type: `proposal_${action}ed`,
      data: {
        proposal_id,
        target_system: proposal.target_system,
        applied_by,
        update_id: update.id
      },
      outcome: 'success'
    });

    // In production, this would call the target system's config endpoint
    // For now, we just return the audit trail entry

    return new Response(
      JSON.stringify({
        success: true,
        message: `Proposal ${action}ed successfully`,
        update,
        note: 'In production, target system config would be updated here'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Apply error:', error);
    return createSafeErrorResponse(error, corsHeaders, 'Failed to apply proposal');
  }
});