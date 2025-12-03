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

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, issue_id, scan_id } = await req.json();

    switch (action) {
      case 'generate_fix': {
        const { data: issue } = await supabase
          .from('pf_clarity_issues')
          .select(`
            *,
            pf_clarity_scans!inner(
              site_id,
              pf_clarity_sites!inner(user_id)
            )
          `)
          .eq('id', issue_id)
          .single();

        if (!issue || issue.pf_clarity_scans?.pf_clarity_sites?.user_id !== user.id) {
          return new Response(JSON.stringify({ error: 'Issue not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const fix = generateFix(issue);

        const { data: suggestion } = await supabase
          .from('pf_clarity_fix_suggestions')
          .insert({
            issue_id: issue.id,
            fix_type: fix.fix_type,
            suggested_code: fix.suggested_code,
            explanation: fix.explanation,
            confidence_score: fix.confidence_score,
            auto_applicable: fix.auto_applicable,
          })
          .select()
          .single();

        return new Response(JSON.stringify({
          success: true,
          suggestion,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'generate_scan_fixes': {
        const { data: scan } = await supabase
          .from('pf_clarity_scans')
          .select('*, pf_clarity_sites(user_id)')
          .eq('id', scan_id)
          .single();

        if (!scan || scan.pf_clarity_sites?.user_id !== user.id) {
          return new Response(JSON.stringify({ error: 'Scan not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: issues } = await supabase
          .from('pf_clarity_issues')
          .select('*')
          .eq('scan_id', scan_id);

        const suggestions = [];
        for (const issue of issues || []) {
          const fix = generateFix(issue);
          suggestions.push({
            issue_id: issue.id,
            ...fix,
          });
        }

        await supabase.from('pf_clarity_fix_suggestions').insert(suggestions);

        return new Response(JSON.stringify({
          success: true,
          generated: suggestions.length,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'apply_fix': {
        const { suggestion_id } = await req.json();

        const { error } = await supabase
          .from('pf_clarity_fix_suggestions')
          .update({
            applied: true,
            applied_at: new Date().toISOString(),
            applied_by: user.id,
          })
          .eq('id', suggestion_id);

        if (error) throw error;

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
    console.error('Fix generator error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFix(issue: any): any {
  const fixes: Record<string, any> = {
    missing_alt_text: {
      fix_type: 'code',
      suggested_code: `<img src="${issue.element_selector || 'image.jpg'}" alt="Descriptive text about the image">`,
      explanation: 'Add descriptive alt text that conveys the purpose and content of the image. Be specific and concise.',
      confidence_score: 95,
      auto_applicable: true,
    },
    empty_link_text: {
      fix_type: 'content',
      suggested_code: `<a href="${issue.element_selector || '#'}">Descriptive link text</a>`,
      explanation: 'Replace generic link text like "click here" with descriptive text that explains the link destination.',
      confidence_score: 90,
      auto_applicable: false,
    },
    missing_form_labels: {
      fix_type: 'code',
      suggested_code: `<label for="input-id">Label Text</label>\n<input id="input-id" type="text" name="field">`,
      explanation: 'Add a label element associated with the input field using the for/id attributes.',
      confidence_score: 95,
      auto_applicable: true,
    },
    insufficient_contrast: {
      fix_type: 'style',
      suggested_code: `/* Adjust colors to meet WCAG AA contrast ratio of 4.5:1 */\ncolor: #000000;\nbackground-color: #FFFFFF;`,
      explanation: 'Increase contrast between text and background colors to meet WCAG standards. Use darker text or lighter background.',
      confidence_score: 85,
      auto_applicable: false,
    },
    missing_heading_structure: {
      fix_type: 'structure',
      suggested_code: `<h1>Main Page Title</h1>\n<h2>Section Title</h2>\n<h3>Subsection Title</h3>`,
      explanation: 'Establish proper heading hierarchy starting with h1 and progressing sequentially without skipping levels.',
      confidence_score: 80,
      auto_applicable: false,
    },
    missing_aria_labels: {
      fix_type: 'code',
      suggested_code: `<button aria-label="Descriptive action">Icon</button>`,
      explanation: 'Add aria-label to provide accessible names for interactive elements that lack visible text.',
      confidence_score: 90,
      auto_applicable: true,
    },
    keyboard_navigation: {
      fix_type: 'code',
      suggested_code: `<div tabindex="0" role="button" onKeyPress={(e) => e.key === 'Enter' && handleClick()}>`,
      explanation: 'Add keyboard support with tabindex and key event handlers for interactive custom elements.',
      confidence_score: 75,
      auto_applicable: false,
    },
  };

  return fixes[issue.issue_type] || {
    fix_type: 'content',
    suggested_code: null,
    explanation: 'Manual review and correction recommended for this issue type.',
    confidence_score: 50,
    auto_applicable: false,
  };
}
