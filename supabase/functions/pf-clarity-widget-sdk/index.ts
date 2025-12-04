import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, widget_key, analytics_data } = await req.json();

    switch (action) {
      case 'get_widget_config': {
        const { data: widget } = await supabase
          .from('pf_clarity_widgets')
          .select('*')
          .eq('widget_key', widget_key)
          .eq('is_active', true)
          .single();

        if (!widget) {
          return new Response(JSON.stringify({ error: 'Widget not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({
          success: true,
          config: widget,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'track_analytics': {
        const { data: widget } = await supabase
          .from('pf_clarity_widgets')
          .select('id')
          .eq('widget_key', widget_key)
          .single();

        if (!widget) {
          return new Response(JSON.stringify({ error: 'Widget not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        await supabase
          .from('pf_clarity_widget_analytics')
          .upsert({
            widget_id: widget.id,
            date: new Date().toISOString().split('T')[0],
            total_activations: analytics_data.activations || 0,
            tts_uses: analytics_data.tts || 0,
            contrast_toggles: analytics_data.contrast || 0,
            font_size_changes: analytics_data.font_size || 0,
            keyboard_nav_uses: analytics_data.keyboard || 0,
            unique_users: analytics_data.unique_users || 0,
          }, {
            onConflict: 'widget_id,date',
            ignoreDuplicates: false,
          });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Widget SDK error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
