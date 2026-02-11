/**
 * CMPSBL® Patch Dispatch Edge Function
 * 
 * Server-side dispatch that sends authenticated patches to LNCHBL.
 * Uses CMPSBL_PATCH_SECRET from environment for Bearer auth.
 * 
 * @version 8.5.0
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LNCHBL_PATCH_ENDPOINT =
  'https://tasrehugmgipjfusfzof.supabase.co/functions/v1/lnchbl-patch-receive';

const PROTECTED_FIELDS = [
  'distribution_id', 'identity', 'canon_authority',
  'federation_enabled', 'self_evolution', 'self_improvement',
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    const patchSecret = Deno.env.get('CMPSBL_PATCH_SECRET');

    // Dual auth: accept either the patch secret OR a valid admin JWT
    let authorized = false;

    // Mode 1: Patch secret (machine-to-machine / governor bypass)
    if (patchSecret && token === patchSecret) {
      authorized = true;
    }

    // Mode 2: User JWT with admin role
    if (!authorized) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      if (!roles || roles.length === 0) {
        return new Response(JSON.stringify({ error: 'Admin access required' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      authorized = true;
    }

    // Parse and validate payload
    const payload = await req.json();
    const errors: string[] = [];

    if (payload.target_distribution !== 'LNCHBL') {
      errors.push('target_distribution must be LNCHBL');
    }

    // Block pf-* function references
    if (payload.edge_function_code?.length) {
      for (const fn of payload.edge_function_code) {
        if (fn.function_name?.startsWith('pf-')) {
          errors.push(`Cannot patch internal function: ${fn.function_name}`);
        }
      }
    }

    // Block protected config overrides
    if (payload.config_overrides) {
      for (const key of Object.keys(payload.config_overrides)) {
        if (PROTECTED_FIELDS.includes(key)) {
          errors.push(`Cannot override protected field: ${key}`);
        }
      }
    }

    if (errors.length > 0) {
      return new Response(JSON.stringify({ error: 'Validation failed', validation_errors: errors }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the shared secret
    const patchSecret = Deno.env.get('CMPSBL_PATCH_SECRET');
    if (!patchSecret) {
      return new Response(JSON.stringify({ error: 'Patch secret not configured' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Dispatch to LNCHBL
    const response = await fetch(LNCHBL_PATCH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${patchSecret}`,
        'X-Distribution-ID': 'CMPSBL',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return new Response(JSON.stringify({
        error: result.error || `LNCHBL returned ${response.status}`,
        lnchbl_status: response.status,
      }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      patch_id: result.patch_id,
      patch_version: payload.patch_version,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
