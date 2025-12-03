/**
 * PromptFluid Brain Test & Activation Cycle
 * Tests all Brain functions and activates learning processes
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

    console.log('🧠 Starting Brain Test & Activation Cycle...');

    const results: any = {
      timestamp: new Date().toISOString(),
      tests: [],
      activation_status: {}
    };

    // Test 1: Check Cascade persona
    console.log('Test 1: Cascade Persona');
    try {
      const { data: persona, error: personaError } = await sb
        .from('brain_persona')
        .select('id, role, communication_style')
        .limit(1)
        .maybeSingle();

      results.tests.push({
        name: 'Cascade Persona',
        status: personaError ? 'failed' : (persona ? 'passed' : 'failed'),
        data: persona ? { role: persona.role, style: persona.communication_style } : null,
        error: personaError?.message || (!persona ? 'Persona not found' : undefined)
      });
    } catch (e) {
      results.tests.push({
        name: 'Cascade Persona',
        status: 'failed',
        error: e.message
      });
    }

    // Test 2: Check Brain Policy
    console.log('Test 2: Brain Policy');
    try {
      const { data: policies, error: policyError } = await sb
        .from('brain_policy')
        .select('id, boundaries, ethical_compass')
        .limit(5);

      results.tests.push({
        name: 'Brain Policy',
        status: policyError ? 'failed' : 'passed',
        count: policies?.length || 0,
        error: policyError?.message
      });
    } catch (e) {
      results.tests.push({
        name: 'Brain Policy',
        status: 'failed',
        error: e.message
      });
    }

    // Test 3: Check Brain Memory Hot
    console.log('Test 3: Brain Memory Hot');
    try {
      const { data: hotMemory, error: hotError } = await sb
        .from('brain_memory_hot')
        .select('id, content, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      results.tests.push({
        name: 'Brain Memory Hot',
        status: hotError ? 'failed' : 'passed',
        count: hotMemory?.length || 0,
        error: hotError?.message
      });
    } catch (e) {
      results.tests.push({
        name: 'Brain Memory Hot',
        status: 'failed',
        error: e.message
      });
    }

    // Test 4: Check Actions Queue
    console.log('Test 4: Actions Queue');
    try {
      const { data: actions, error: actionsError } = await sb
        .from('brain_actions_queue')
        .select('id, action_type, status')
        .order('created_at', { ascending: false })
        .limit(5);

      results.tests.push({
        name: 'Actions Queue',
        status: actionsError ? 'failed' : 'passed',
        count: actions?.length || 0,
        error: actionsError?.message
      });
    } catch (e) {
      results.tests.push({
        name: 'Actions Queue',
        status: 'failed',
        error: e.message
      });
    }

    // Test 5: Check Brain Events
    console.log('Test 5: Brain Events');
    try {
      const { data: events, error: eventsError } = await sb
        .from('brain_events')
        .select('id, event_type, module')
        .order('created_at', { ascending: false })
        .limit(5);

      results.tests.push({
        name: 'Brain Events',
        status: eventsError ? 'failed' : 'passed',
        count: events?.length || 0,
        error: eventsError?.message
      });
    } catch (e) {
      results.tests.push({
        name: 'Brain Events',
        status: 'failed',
        error: e.message
      });
    }

    // Test 6: Insert Test Event
    console.log('Test 6: Test Event');
    try {
      const { error: insertError } = await sb
        .from('brain_events')
        .insert({
          event_type: 'brain_activation_test',
          module: 'cascade_core',
          data: {
            test_run: true,
            timestamp: new Date().toISOString()
          },
          outcome: 'success'
        });

      results.tests.push({
        name: 'Test Event Insert',
        status: insertError ? 'failed' : 'passed',
        error: insertError?.message
      });
    } catch (e) {
      results.tests.push({
        name: 'Test Event Insert',
        status: 'failed',
        error: e.message
      });
    }

    // Activation Status Summary
    const passedTests = results.tests.filter((t: any) => t.status === 'passed').length;
    const totalTests = results.tests.length;
    const cascadeActive = results.tests.find((t: any) => t.name === 'Cascade Persona')?.status === 'passed';
    
    results.activation_status = {
      overall_status: passedTests === totalTests ? 'fully_operational' : 'partial',
      tests_passed: passedTests,
      tests_total: totalTests,
      success_rate: ((passedTests / totalTests) * 100).toFixed(1) + '%',
      cascade_active: cascadeActive,
      brain_learning: passedTests >= 4,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Brain Test Cycle Complete: ${results.activation_status.success_rate} success rate`);

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('❌ Brain test cycle error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
