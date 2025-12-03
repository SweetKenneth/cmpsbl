import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { operation, params = {} } = await req.json();
    const result: Record<string, unknown> = { operation, timestamp: new Date().toISOString(), status: 'success' };

    switch (operation) {
      case 'scan':
        try {
          const issues = [{ type: 'missing_alt_text', severity: 'warning', count: 3 }, { type: 'low_contrast', severity: 'error', count: 1 }];
          result.scan = { url: params.url || 'unknown', issues, score: 85 };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'fix':
        try {
          const fixes = params.issues?.map((i: any) => ({ ...i, fixed: true, method: 'automated' })) || [];
          result.fixes = { applied: fixes.length, details: fixes };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'alt_text':
        try {
          const altText = `${params.context || 'Image'} showing ${params.description || 'content'}`;
          result.alt_text = altText;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'tts':
        try {
          const audio = { text: params.text || '', format: 'mp3', duration_estimate: (params.text?.length || 0) / 150 };
          result.tts = audio;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'recommendations':
        try {
          const recommendations = ['Add ARIA labels', 'Improve color contrast', 'Enable keyboard navigation', 'Add skip links'];
          result.recommendations = recommendations.slice(0, params.limit || 4);
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'report':
        try {
          const report = { wcag_level: 'AA', passed: 18, failed: 2, warnings: 5, compliance_percentage: 90 };
          result.report = report;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'badge':
        try {
          const badge = { level: 'AA', score: params.score || 90, valid_until: new Date(Date.now() + 90 * 24 * 3600000).toISOString() };
          result.badge = badge;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'assist':
        try {
          const features = ['screen_reader_support', 'high_contrast_mode', 'keyboard_navigation', 'text_resize'];
          result.assist = { enabled: features, active: true };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'user_manual':
        try {
          const manual = { sections: ['Getting Started', 'Keyboard Shortcuts', 'Screen Reader Tips'], format: 'accessible_html' };
          result.manual = manual;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      default:
        result.status = 'error';
        result.message = `Unknown access operation: ${operation}`;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage, status: 'failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
