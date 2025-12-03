import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('🜂 Generating daily seed and schedule...');

    // Generate random seed
    const seed = Date.now() ^ Math.floor(Math.random() * 999999);
    const startHour = Math.floor(Math.random() * 6); // 0-5
    const dreamHour = (startHour + Math.floor(Math.random() * 8) + 10) % 24; // 10-17 hours after start

    // Build randomized schedule
    const schedule = [];
    let hour = startHour;
    const BLOCKS = ['analysis', 'training', 'maintenance', 'exploration']
      .sort(() => Math.random() - 0.5);

    for (const block of BLOCKS) {
      const len = Math.floor(Math.random() * 3) + 3; // 3-5 hours
      schedule.push({ task: block, start: `${hour}:00`, duration: len });
      hour += len;
      if (hour >= startHour + 18) break;
    }

    // Add dream block
    schedule.push({ task: 'dream', start: `${dreamHour}:00`, duration: 2 });

    // Store in database
    const dateKey = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('daily_state')
      .upsert({
        date_key: dateKey,
        day_seed: seed,
        schedule_json: schedule
      }, { onConflict: 'date_key' })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Daily seed generated:', {
      date: dateKey,
      seed,
      scheduleBlocks: schedule.length
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          date: dateKey,
          seed,
          schedule
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Daily seed generation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
