/**
 * Evolution Control — Backend endpoints for installable runtime usage.
 * 
 * POST ?action=export  → Returns stamped unified proposal JSON
 * POST ?action=applied → Records external application (no internal execution)
 * 
 * Respects external-ai execution barrier at all times.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function generateHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub;

    // ═══════════════════════════════════════════════════════════
    // ACTION: export — Generate and return a stamped proposal
    // ═══════════════════════════════════════════════════════════
    if (action === 'export') {
      const now = new Date().toISOString();
      const snapshot_id = `snap_${Date.now().toString(36)}`;
      const receipt_id = `rcpt_${Date.now().toString(36)}`;
      const verification_hash = generateHash(`verify_${snapshot_id}_${now}`);
      const diff_hash = generateHash(`diff_${snapshot_id}_${now}`);
      const lineage_id = `seba_${snapshot_id}_${Date.now().toString(36)}`;
      const signature = generateHash(`${lineage_id}:${receipt_id}:${verification_hash}:${diff_hash}`);

      const exportPayload = {
        schema_version: '3.3',
        generated_at: now,
        system_id: 'cmpsbl-substrate',
        proposal_type: 'unified-evolution',
        execution_mode: 'external-ai',
        exported_by: userId,
        governance: {
          receipt_id,
          verification_hash,
          diff_hash,
          snapshot_id,
          seba_stamp: {
            lineage_id,
            signature,
            stage: 'pre-export',
            discipline: 'bounded-compounding',
          },
        },
        discipline: {
          bounded: true,
          max_proposals: 5,
          external_execution: true,
        },
        instructions: 'Generate proposal from the Evolution Control Plane UI and paste the full JSON here. This endpoint confirms export provenance.',
      };

      return new Response(JSON.stringify(exportPayload), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════════════════════
    // ACTION: applied — Record external application
    // ═══════════════════════════════════════════════════════════
    if (action === 'applied') {
      const body = await req.json();
      const { proposal_id, receipt_id, verification_hash } = body;

      if (!proposal_id || !receipt_id || !verification_hash) {
        return new Response(JSON.stringify({
          error: 'Missing required fields: proposal_id, receipt_id, verification_hash',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Record the application — NO internal code execution
      const appliedRecord = {
        proposal_id,
        receipt_id,
        verification_hash,
        applied_by: 'external-ai',
        applied_at: new Date().toISOString(),
        user_id: userId,
        status: 'externally_applied',
        execution_mode: 'external-ai',
        internal_mutation: false,
      };

      // Log to audit_logs
      await supabase.from('audit_logs').insert({
        action: 'evolution.externally_applied',
        entity_type: 'evolution_proposal',
        entity_id: proposal_id,
        performed_by: userId,
        details: appliedRecord,
      });

      return new Response(JSON.stringify({
        success: true,
        status: 'externally_applied',
        record: appliedRecord,
        note: 'No internal code was executed. This is a record-only operation.',
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      error: 'Unknown action. Use ?action=export or ?action=applied',
      available_actions: ['export', 'applied'],
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error', detail: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
