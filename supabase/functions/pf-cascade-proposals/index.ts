import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { createSafeErrorResponse, createValidationErrorResponse } from '../_shared/security-utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const updateProposalSchema = z.object({
  proposal_id: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  reviewer: z.string().min(1).max(200)
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

    if (req.method === 'GET') {
      // List proposals with filters
      const url = new URL(req.url);
      const status = url.searchParams.get('status');
      const targetSystem = url.searchParams.get('target_system');

      let query = supabaseClient
        .from('evolution_proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }
      if (targetSystem) {
        query = query.eq('target_system', targetSystem);
      }

      const { data, error } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, proposals: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'PATCH') {
      // Update proposal status (admin only)
      const rawBody = await req.json();
      
      // Validate input
      const validationResult = updateProposalSchema.safeParse(rawBody);
      if (!validationResult.success) {
        return createValidationErrorResponse(corsHeaders, 'Invalid request data');
      }

      const { proposal_id, action, reviewer } = validationResult.data;

      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      const { data, error } = await supabaseClient
        .from('evolution_proposals')
        .update({
          status: newStatus,
          reviewer,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', proposal_id)
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Proposal ${proposal_id} ${newStatus} by ${reviewer}`);

      // Log the review decision
      await supabaseClient.from('brain_events').insert({
        module: 'cascade',
        event_type: 'proposal_reviewed',
        data: {
          proposal_id,
          action,
          reviewer,
          target_system: data.target_system
        },
        outcome: 'success'
      });

      return new Response(
        JSON.stringify({ success: true, proposal: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Method not allowed');

  } catch (error) {
    console.error('❌ Proposals error:', error);
    return createSafeErrorResponse(error, corsHeaders, 'Failed to process proposal request');
  }
});