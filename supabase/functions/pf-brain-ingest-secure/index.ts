/**
 * PromptFluid Cascade Secure Data Ingestion
 * Handles confidential data with privacy-first abstraction
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const IngestSchema = z.object({
  data: z.any(),
  source: z.string().max(200).optional(),
  sensitivity: z.enum(['private', 'confidential', 'internal', 'public']).optional()
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await sb.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const validation = IngestSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { data, source, sensitivity } = validation.data;

    // Generate hash for audit trail
    const dataString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataString));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const dataHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Determine sensitivity level
    const sensitivityLevel = sensitivity || detectSensitivity(data);

    // Check confidentiality rules
    const { data: policyData } = await sb
      .from('brain_policy')
      .select('value')
      .eq('key', 'confidentiality.rules')
      .single();

    const rules = policyData?.value || {};

    // Abstract the data instead of storing verbatim
    const abstraction = abstractData(data, sensitivityLevel);

    // Store abstracted insights only
    const { error: insertError } = await sb
      .from('brain_hot')
      .insert({
        key: `abstract_insight_${Date.now()}`,
        knowledge: abstraction.patterns,
        context: {
          source: source || 'unknown',
          sensitivity: sensitivityLevel,
          abstracted: true,
          original_hash: dataHash
        },
        tags: abstraction.tags
      });

    if (insertError) throw insertError;

    // Audit log (no raw data)
    await sb.from('brain_ingestion_audit').insert({
      data_hash: dataHash,
      source_type: source || 'unknown',
      sensitivity_level: sensitivityLevel,
      abstracted: true,
      ingested_by: 'cascade'
    });

    // Log event
    await sb.from('brain_events').insert({
      event_type: 'secure_ingestion',
      module: 'cascade_core',
      data: {
        hash: dataHash.slice(0, 16),
        sensitivity: sensitivityLevel,
        abstracted: true,
        timestamp: new Date().toISOString()
      },
      outcome: 'success'
    });

    console.log(`✅ Cascade: Securely ingested and abstracted data (${sensitivityLevel})`);

    return new Response(
      JSON.stringify({
        success: true,
        cascade_response: {
          ingested: true,
          abstracted: true,
          sensitivity: sensitivityLevel,
          audit_hash: dataHash.slice(0, 16),
          patterns_identified: abstraction.patterns.length,
          message: 'Data ingested and converted to pattern-based insights. Original data not stored.'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Secure ingestion error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function detectSensitivity(data: any): string {
  const dataString = JSON.stringify(data).toLowerCase();

  if (dataString.includes('password') || 
      dataString.includes('secret') || 
      dataString.includes('token') ||
      dataString.includes('api_key')) {
    return 'private';
  }

  if (dataString.includes('revenue') || 
      dataString.includes('financial') ||
      dataString.includes('salary') ||
      dataString.includes('confidential')) {
    return 'confidential';
  }

  if (dataString.includes('internal') || 
      dataString.includes('strategy')) {
    return 'internal';
  }

  return 'public';
}

function abstractData(data: any, sensitivity: string): { patterns: string[]; tags: string[] } {
  const patterns: string[] = [];
  const tags: string[] = ['abstracted', sensitivity];

  if (typeof data === 'object' && data !== null) {
    // Extract structural patterns, not content
    patterns.push(`Structure: ${Object.keys(data).length} fields`);
    
    // Identify data types
    const types = Object.values(data).map(v => typeof v);
    patterns.push(`Types: ${[...new Set(types)].join(', ')}`);

    // Extract numeric patterns (no actual values)
    const numbers = Object.values(data).filter(v => typeof v === 'number');
    if (numbers.length > 0) {
      patterns.push(`Numeric fields: ${numbers.length}`);
    }

    // Extract categorical patterns
    Object.keys(data).forEach(key => {
      if (key.toLowerCase().includes('status') || 
          key.toLowerCase().includes('type') ||
          key.toLowerCase().includes('category')) {
        tags.push(`has_${key}`);
      }
    });
  }

  return { patterns, tags };
}
