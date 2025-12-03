import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createSafeErrorResponse, createValidationErrorResponse } from "../_shared/security-utils.ts";

const BehavioralAnalysisSchema = z.object({
  session_id: z.string().min(1).max(200),
  fingerprint_hash: z.string().optional(),
  mouse_movements: z.number().int().min(0).max(10000),
  keyboard_events: z.number().int().min(0).max(10000),
  scroll_events: z.number().int().min(0).max(10000).optional().default(0),
  click_events: z.number().int().min(0).max(10000),
  time_on_page: z.number().int().min(0).max(3600000) // Max 1 hour
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const validationResult = BehavioralAnalysisSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createValidationErrorResponse(corsHeaders, 'Invalid behavioral analysis data');
    }

    const { 
      session_id,
      fingerprint_hash,
      mouse_movements,
      keyboard_events,
      scroll_events,
      click_events,
      time_on_page
    } = validationResult.data;

    // Use service client for database operations
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Rate limiting: max 10 submissions per session
    const { count } = await serviceClient
      .from('behavioral_analysis_logs')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session_id);

    if (count && count >= 10) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded for this session' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze behavioral patterns
    let overall_score = 0;
    const suspicious_patterns = [];

    // Mouse movement analysis
    if (mouse_movements < 5) {
      overall_score += 30;
      suspicious_patterns.push('Minimal mouse movement detected');
    } else if (mouse_movements > 100) {
      overall_score -= 10;
    }

    // Keyboard analysis
    if (keyboard_events === 0) {
      overall_score += 20;
      suspicious_patterns.push('No keyboard activity');
    }

    // Time analysis
    if (time_on_page < 2000) {
      overall_score += 25;
      suspicious_patterns.push('Unusually fast interaction');
    }

    // Click pattern analysis
    if (click_events > 20) {
      overall_score += 15;
      suspicious_patterns.push('Excessive clicking detected');
    }

    // Determine risk level
    const risk_level = overall_score >= 60 ? 'bot' : overall_score >= 30 ? 'suspicious' : 'human';

    // Store analysis (using service client)
    const { data } = await serviceClient.from('behavioral_analysis_logs').insert({
      session_id,
      fingerprint_hash,
      mouse_movements,
      keyboard_events,
      scroll_events,
      click_events,
      time_on_page,
      overall_score,
      risk_level,
      suspicious_patterns
    }).select().single();

    console.log('Behavioral analysis complete:', { session_id, overall_score, risk_level });

    return new Response(JSON.stringify({ 
      analysis_id: data.id,
      overall_score,
      risk_level,
      suspicious_patterns
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return createSafeErrorResponse(error, corsHeaders, 'Behavioral analysis failed');
  }
});
