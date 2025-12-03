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
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate input with Zod
    const { z } = await import('https://deno.land/x/zod@v3.22.4/mod.ts');
    const ReflectionSchema = z.object({
      lookback_days: z.number().int().min(1).max(7).optional().default(1),
      memory_limit: z.number().int().min(10).max(500).optional().default(100)
    });
    
    const body = req.method === 'POST' ? await req.json() : {};
    const validation = ReflectionSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { lookback_days, memory_limit } = validation.data;

    console.log('Running nightly reflection job at:', new Date().toISOString());

    const today = new Date().toISOString().split('T')[0];

    // Check if reflection exists
    const { data: existing } = await supabase
      .from('brain_reflections')
      .select('id')
      .eq('reflection_date', today)
      .single();

    if (existing) {
      return new Response(JSON.stringify({
        message: 'Reflection already exists for today',
        date: today,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get top accessed memories from lookback period
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - lookback_days);

    const { data: memories, error: memError } = await supabase
      .from('brain_memory_hot')
      .select('*')
      .gte('last_used', cutoff.toISOString())
      .order('last_used', { ascending: false })
      .limit(memory_limit);

    if (memError) throw memError;

    if (!memories || memories.length === 0) {
      return new Response(JSON.stringify({
        message: 'No memories to reflect on',
        date: today,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Analyze patterns
    const contextCounts: Record<string, number> = {};
    const lessons: any[] = [];

    for (const memory of memories) {
      const context = memory.context || 'unknown';
      contextCounts[context] = (contextCounts[context] || 0) + 1;

      if (memory.context === 'code' && memory.relevance > 0.9) {
        lessons.push({
          pattern: `Code: ${memory.content.substring(0, 100)}...`,
          frequency: 1,
          impact: 'high',
          lesson: true,
        });
      }
    }

    // Build summary
    const summary = `
Daily Reflection - ${today}

Analyzed ${memories.length} memories.

Context Distribution:
${Object.entries(contextCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([ctx, count]) => `- ${ctx}: ${count}`)
  .join('\n')}

Lessons: ${lessons.length} code patterns identified
    `.trim();

    // Store reflection
    const { error: insertError } = await supabase
      .from('brain_reflections')
      .insert({
        reflection_date: today,
        summary,
        lessons: lessons.slice(0, 5),
      });

    if (insertError) throw insertError;

    // Log event
    await supabase.from('brain_events').insert({
      module: 'brain',
      event_type: 'daily_reflection',
      data: {
        date: today,
        memories_analyzed: memories.length,
        lessons_identified: lessons.length,
      },
      outcome: 'completed',
    });

    console.log('Reflection generated successfully');

    return new Response(JSON.stringify({
      success: true,
      date: today,
      memories_analyzed: memories.length,
      lessons: lessons.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Reflection error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
