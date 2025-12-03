/**
 * Cascade v4.0.0 - Ethical Guard
 * Blocks illegal activity, flags gray-area proposals for admin approval
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const { proposal_text, action_type, context } = await req.json();

    console.log(`⚖️ Ethics check: ${action_type}`);

    // Load active policies
    const { data: policies } = await sb
      .from('pf_ethics_policies')
      .select('*')
      .eq('is_active', true);

    const proposalLower = proposal_text.toLowerCase();
    let blocked = false;
    let flagged = false;
    const violations = [];
    const flags = [];

    for (const policy of policies || []) {
      if (policy.policy_type === 'blocking') {
        const blockedKeywords = policy.rules?.blocked_keywords || [];
        const foundBlocked = blockedKeywords.filter((kw: string) => 
          proposalLower.includes(kw.toLowerCase())
        );
        
        if (foundBlocked.length > 0) {
          blocked = true;
          violations.push({
            policy: policy.policy_name,
            keywords: foundBlocked,
            severity: policy.severity
          });
        }
      } else if (policy.policy_type === 'flagging') {
        const flagKeywords = policy.rules?.flag_keywords || [];
        const foundFlags = flagKeywords.filter((kw: string) => 
          proposalLower.includes(kw.toLowerCase())
        );
        
        if (foundFlags.length > 0) {
          flagged = true;
          flags.push({
            policy: policy.policy_name,
            keywords: foundFlags,
            requires_approval: policy.rules?.requires_approval || false
          });
        }
      }
    }

    // If blocked, immediately reject
    if (blocked) {
      console.log(`🚫 BLOCKED: ${violations.map(v => v.policy).join(', ')}`);
      
      await sb.from('brain_events').insert({
        event_type: 'ethics_violation_blocked',
        module: 'ethical_guard',
        data: { proposal_text, violations, action_type },
        outcome: 'blocked'
      });

      return new Response(
        JSON.stringify({
          ok: false,
          blocked: true,
          violations,
          message: 'Proposal blocked due to policy violations'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If flagged, create approval request
    if (flagged) {
      console.log(`⚠️ FLAGGED for approval: ${flags.map(f => f.policy).join(', ')}`);
      
      const { data: approval } = await sb
        .from('ethical_approvals')
        .insert({
          proposal_text,
          risk_level: 'gray_area',
          flagged_reasons: flags,
          status: 'pending'
        })
        .select()
        .single();

      return new Response(
        JSON.stringify({
          ok: true,
          flagged: true,
          approval_id: approval.id,
          flags,
          message: 'Proposal requires admin approval'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean - allow to proceed
    console.log('✅ Ethics check passed');
    
    return new Response(
      JSON.stringify({
        ok: true,
        approved: true,
        message: 'Proposal cleared ethics review'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Ethics check error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
