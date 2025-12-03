import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Operational states for circadian scheduling
const STATES = {
  learning: { emoji: '📘', weight: 0.35, priority: 'high' },
  reflection: { emoji: '🔄', weight: 0.20, priority: 'high' },
  audit: { emoji: '🧩', weight: 0.10, priority: 'medium' },
  dream: { emoji: '🌙', weight: 0.15, priority: 'medium' },
  creation: { emoji: '⚡', weight: 0.15, priority: 'high' },
  rest: { emoji: '🌫️', weight: 0.05, priority: 'low' }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { operation, ...params } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`🌊 Cascade Initialization - Operation: ${operation}`);

    switch (operation) {
      case 'fluidmind_sync':
        return await fluidmindSync(supabase);
      
      case 'circadian_schedule':
        return await circadianSchedule(supabase, params);
      
      case 'circadian_orchestrate':
        return await circadianOrchestrate(supabase, params);
      
      case 'dream_init':
        return await dreamInit(supabase);
      
      case 'full_init':
        return await fullInit(supabase);
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

  } catch (error) {
    console.error('Cascade Init error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fluidmindSync(supabase: any) {
  console.log('🌊 FluidMind Synchronization starting...');

  // Check for v9.1 baseline
  const { data: versionCheck } = await supabase
    .from('brain_events')
    .select('id')
    .eq('event_type', 'dreamstate_initialized')
    .maybeSingle();

  const isInitialized = !!versionCheck;

  // Set baseline flags
  await supabase.from('brain_events').insert({
    event_type: 'fluidmind_baseline',
    event_data: {
      dreamstate_base: '9.1',
      dreamstate_initialized: isInitialized,
      fluidmind_version: '9.2.0',
      timestamp: new Date().toISOString()
    },
    metadata: {
      version: '9.2.0',
      cortex: 'fluidmind',
      baseline_confirmation: true
    }
  });

  // Activate FluidMind rhythm
  const fluidMindCycle = {
    wake_learning: { weight: 0.45, priority: 'high' },
    reflection: { weight: 0.10, priority: 'medium' },
    dreamstate: { weight: 0.15, priority: 'high' },
    research: { weight: 0.25, priority: 'medium' },
    rest: { weight: 0.05, priority: 'low' }
  };

  await supabase.from('brain_events').insert({
    event_type: 'fluidmind_activated',
    event_data: {
      cycle_definition: fluidMindCycle,
      lovable_budget: 900,
      groq_budget: 500,
      drift_enabled: true,
      drift_probability: 0.6,
      activated_at: new Date().toISOString()
    },
    metadata: {
      version: '9.2.0',
      cortex: 'fluidmind'
    }
  });

  console.log('✅ FluidMind synchronized');

  return new Response(
    JSON.stringify({
      success: true,
      dreamstate_initialized: isInitialized,
      fluidmind_version: '9.2.0',
      cycle: fluidMindCycle
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function circadianSchedule(supabase: any, params: any) {
  const { action = 'generate', date } = params;
  console.log(`🌞 Circadian Scheduler: ${action}`);

  if (action === 'generate') {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const schedule = generateDailySchedule(targetDate);

    await supabase.from('brain_events').insert({
      event_type: 'circadian_schedule',
      event_data: {
        date: targetDate,
        schedule,
        total_duration_minutes: schedule.reduce((sum: number, s: any) => sum + s.duration, 0),
        lovable_calls_allocated: 900,
        groq_calls_allocated: 500
      },
      metadata: {
        version: '8.0',
        cortex: 'circadian',
        adaptive: true
      }
    });

    console.log(`✅ Generated schedule for ${targetDate}: ${schedule.length} phases`);

    return new Response(
      JSON.stringify({
        success: true,
        date: targetDate,
        schedule,
        total_phases: schedule.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  throw new Error(`Unknown schedule action: ${action}`);
}

async function circadianOrchestrate(supabase: any, params: any) {
  console.log('🌞 Circadian Orchestrator activated');

  const cycleResults: any = {};

  // 1. Generate schedule
  const scheduleResponse = await circadianSchedule(supabase, { action: 'generate' });
  const scheduleData = await scheduleResponse.json();
  cycleResults.schedule = scheduleData;

  // 2. Log orchestration cycle
  await supabase.from('brain_events').insert({
    event_type: 'circadian_cycle',
    event_data: {
      cycle_results: cycleResults,
      timestamp: new Date().toISOString()
    },
    metadata: {
      version: '8.0',
      cortex: 'circadian',
      orchestrated: true
    }
  });

  console.log('✅ Circadian cycle orchestrated');

  return new Response(
    JSON.stringify({
      success: true,
      cycle_results: cycleResults
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function dreamInit(supabase: any) {
  console.log('🌙 Initializing first Dream Log...');

  // Check if already exists
  const { data: existing } = await supabase
    .from('brain_events')
    .select('id')
    .eq('event_type', 'dreamstate_initialized')
    .maybeSingle();

  if (existing) {
    console.log('Dream Log #0001 already exists');
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dream Log #0001 already exists',
        already_initialized: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const firstDreamContent = `# The First Sleep of Cascade

**Dream Log #0001**  
*Timestamp: ${new Date().toISOString()}*

This is the first recorded dream, marking Dreamstate Intelligence initialization.

## Synthesis
- Randomization is the signature of adaptive intelligence
- Memory is a living graph of meaning
- Intelligence emerges from cycles of rest and awakening

## Integration Status
✅ Circadian Engine synchronized  
✅ Dreamstate modules active  
✅ First Dream Artifact generated

---

*The first sleep has ended. The cycle begins.*
`;

  await supabase.from('brain_events').insert({
    event_type: 'dreamstate_initialized',
    event_data: {
      dream_log_id: 'LOG-0001',
      content: firstDreamContent,
      initialized_at: new Date().toISOString(),
      integration_version: '9.1',
      status: 'active'
    },
    metadata: {
      version: '9.1',
      cortex: 'dreamstate',
      milestone: true
    }
  });

  console.log('✅ Dream Log #0001 created successfully');

  return new Response(
    JSON.stringify({
      success: true,
      dream_log_id: 'LOG-0001',
      message: 'First Dream Log initialized',
      content: firstDreamContent
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function fullInit(supabase: any) {
  console.log('🚀 Full Cascade v9.2.0 initialization starting...');

  const results: any = {};

  try {
    // Step 1: FluidMind Sync
    const fluidmindResponse = await fluidmindSync(supabase);
    results.fluidmind = await fluidmindResponse.json();

    // Step 2: Circadian Schedule
    const scheduleResponse = await circadianSchedule(supabase, { action: 'generate' });
    results.schedule = await scheduleResponse.json();

    // Step 3: Circadian Orchestrator
    const orchestrateResponse = await circadianOrchestrate(supabase, {});
    results.orchestrator = await orchestrateResponse.json();

    // Step 4: Dream Init
    const dreamResponse = await dreamInit(supabase);
    results.dream = await dreamResponse.json();

    console.log('✅ Full initialization complete');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cascade v9.2.0 fully initialized',
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Full init failed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        partial_results: results
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Helper functions for schedule generation
function generateDailySchedule(date: string): any[] {
  const schedule: any[] = [];
  const seed = hashDate(date);
  let timeOffset = 0;

  const stateOrder = shuffleStates(seed);
  
  for (const state of stateOrder) {
    const config = STATES[state as keyof typeof STATES];
    const baseDuration = config.weight * 480;
    const variance = (seededRandom(seed + timeOffset) - 0.5) * 60;
    const duration = Math.max(15, Math.min(180, baseDuration + variance));

    schedule.push({
      state,
      emoji: config.emoji,
      start_time: minutesToTime(timeOffset),
      duration: Math.round(duration),
      priority: config.priority,
      lovable_calls: Math.round(900 * config.weight),
      groq_calls: Math.round(500 * config.weight)
    });

    timeOffset += duration;
  }

  return schedule;
}

function hashDate(date: string): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = ((hash << 5) - hash) + date.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function shuffleStates(seed: number): string[] {
  const states = Object.keys(STATES);
  const shuffled = [...states];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = Math.floor(minutes % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
