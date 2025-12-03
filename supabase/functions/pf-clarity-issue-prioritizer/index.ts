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

    const { action, scan_id, issue_id } = await req.json();

    switch (action) {
      case 'prioritize_scan': {
        // Get all issues for scan
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

        if (!issues || issues.length === 0) {
          return new Response(JSON.stringify({ success: true, prioritized: 0 }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // AI prioritization logic
        const priorities = issues.map((issue, index) => {
          const priority = calculatePriority(issue);
          return {
            issue_id: issue.id,
            ...priority,
            recommended_order: index + 1,
          };
        });

        // Sort by priority score
        priorities.sort((a, b) => b.ai_priority_score - a.ai_priority_score);
        priorities.forEach((p, idx) => p.recommended_order = idx + 1);

        // Store priorities
        await supabase.from('pf_clarity_issue_priority').delete().eq('issue_id', issues.map(i => i.id));
        await supabase.from('pf_clarity_issue_priority').insert(priorities);

        return new Response(JSON.stringify({
          success: true,
          prioritized: priorities.length,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_priority': {
        const { data: priority } = await supabase
          .from('pf_clarity_issue_priority')
          .select('*')
          .eq('issue_id', issue_id)
          .single();

        return new Response(JSON.stringify({
          success: true,
          priority,
        }), {
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
    console.error('Issue prioritizer error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculatePriority(issue: any): any {
  // AI-powered prioritization algorithm
  let score = 0;
  let complexity = 'medium';
  let estimatedTime = 30;
  let businessImpact = '';

  // Severity weight
  if (issue.severity === 'critical') {
    score += 40;
    businessImpact = 'High - Blocks users from accessing content';
  } else if (issue.severity === 'warning') {
    score += 25;
    businessImpact = 'Medium - Reduces usability for some users';
  } else {
    score += 10;
    businessImpact = 'Low - Minor accessibility improvement';
  }

  // Issue type complexity
  const complexIssues = ['keyboard_navigation', 'aria_structure', 'form_validation'];
  const easyIssues = ['alt_text', 'link_text', 'heading_structure'];

  if (complexIssues.some(t => issue.issue_type.includes(t))) {
    complexity = 'hard';
    estimatedTime = 60;
    score += 10; // Less urgent due to complexity
  } else if (easyIssues.some(t => issue.issue_type.includes(t))) {
    complexity = 'easy';
    estimatedTime = 15;
    score += 30; // Quick wins
  }

  // WCAG level impact
  if (issue.wcag_criteria?.includes('A')) {
    score += 20; // Level A is critical
  }

  // Element impact (forms and navigation are high priority)
  if (issue.element_selector?.includes('form') || issue.element_selector?.includes('nav')) {
    score += 15;
  }

  const reasoning = `Priority based on ${issue.severity} severity, ${complexity} fix complexity, and ${businessImpact.toLowerCase()}`;

  return {
    ai_priority_score: Math.min(score, 100),
    business_impact: businessImpact,
    fix_complexity: complexity,
    estimated_time_minutes: estimatedTime,
    reasoning,
  };
}
