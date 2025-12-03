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

    console.log('Running cold migration job at:', new Date().toISOString());

    const inactiveDays = 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

    // Find stale memories
    const { data: staleMemories, error: fetchError } = await supabase
      .from('brain_memory_hot')
      .select('*')
      .lt('last_used', cutoffDate.toISOString())
      .order('last_used', { ascending: true })
      .limit(1000);

    if (fetchError) throw fetchError;

    const stats = {
      checked: staleMemories?.length || 0,
      migrated: 0,
      errors: 0,
    };

    console.log(`Found ${stats.checked} stale memories`);

    if (staleMemories && staleMemories.length > 0) {
      // Migrate each memory
      for (const memory of staleMemories) {
        try {
          // Insert into cold
          const { error: insertError } = await supabase
            .from('brain_memory_cold')
            .insert({
              summary: memory.content,
              source_refs: [memory.id],
              embedding: memory.embedding ? memory.embedding.slice(0, 512) : null,
              compression_level: memory.context === 'code' ? 0 : 5,
              tags: {
                ...memory.tags,
                context: memory.context,
                archived: true,
                migrated_at: new Date().toISOString(),
              },
            });

          if (!insertError) {
            // Delete from hot
            await supabase
              .from('brain_memory_hot')
              .delete()
              .eq('id', memory.id);

            stats.migrated++;
          } else {
            console.error('Insert error:', insertError);
            stats.errors++;
          }
        } catch (err) {
          console.error('Migration error for memory:', err);
          stats.errors++;
        }
      }
    }

    // Log event
    await supabase.from('brain_events').insert({
      module: 'brain',
      event_type: 'cold_migration',
      data: stats,
      outcome: stats.errors === 0 ? 'success' : 'partial',
    });

    console.log('Migration complete:', stats);

    return new Response(JSON.stringify({
      success: true,
      ...stats,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Cold migration error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
