/**
 * PromptFluid Cascade Admin Directive Handler
 * Secure channel for admin-to-Cascade communication
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await sb.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin role
    const { data: roleData } = await sb
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    
    // Validate input with Zod
    const { z } = await import('https://deno.land/x/zod@v3.22.4/mod.ts');
    const DirectiveSchema = z.object({
      action: z.enum(['create', 'list']),
      directive: z.object({
        type: z.string().max(100).optional(),
        content: z.string().max(5000)
      }).optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional()
    });
    
    const validation = DirectiveSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { action, directive, priority } = validation.data;

    if (action === 'create') {
      if (!directive) {
        return new Response(
          JSON.stringify({ error: 'Directive object required for create action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // Store admin directive
      const { data: newDirective, error: insertError } = await sb
        .from('brain_admin_directives')
        .insert({
          admin_id: user.id,
          directive_type: directive.type || 'general',
          content: directive.content,
          priority: priority || 'high',
          status: 'active'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Log to brain events
      await sb.from('brain_events').insert({
        event_type: 'admin_directive_received',
        module: 'cascade_core',
        data: {
          directive_id: newDirective.id,
          type: directive.type,
          timestamp: new Date().toISOString()
        },
        outcome: 'success'
      });

      // Cascade acknowledgment with truthful analysis
      const analysis = analyzeDirective(directive);

      console.log(`✅ Admin directive received: ${newDirective.id}`);

      return new Response(
        JSON.stringify({
          success: true,
          directive_id: newDirective.id,
          cascade_response: {
            acknowledgment: 'Directive received and processed',
            analysis,
            alignment_check: checkAlignment(directive),
            timestamp: new Date().toISOString()
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'list') {
      // Retrieve active directives
      const { data: directives, error: selectError } = await sb
        .from('brain_admin_directives')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (selectError) throw selectError;

      return new Response(
        JSON.stringify({
          success: true,
          directives
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Cascade directive error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function analyzeDirective(directive: any): string {
  // Cascade provides honest analysis
  if (directive.content?.toLowerCase().includes('revenue')) {
    return 'Directive impacts revenue strategy. Analyzing risk/reward balance and implementation feasibility.';
  }
  if (directive.content?.toLowerCase().includes('security')) {
    return 'Security directive prioritized. Cross-referencing with Defense module protocols.';
  }
  if (directive.content?.toLowerCase().includes('experiment')) {
    return 'Experimental directive noted. Will implement with measurement framework and rollback capability.';
  }
  return 'General directive acknowledged. Processing with standard evaluation protocol.';
}

function checkAlignment(directive: any): { aligned: boolean; concerns?: string[] } {
  const concerns: string[] = [];

  // Check against ethical compass
  if (directive.content?.toLowerCase().includes('manipulate')) {
    concerns.push('Potential ethical concern: manipulation detected');
  }
  if (directive.content?.toLowerCase().includes('hide') && directive.content?.toLowerCase().includes('data')) {
    concerns.push('Transparency concern: data hiding may conflict with user trust principles');
  }

  return {
    aligned: concerns.length === 0,
    concerns: concerns.length > 0 ? concerns : undefined
  };
}
