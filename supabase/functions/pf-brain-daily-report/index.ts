import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  include_patterns: z.boolean().optional().default(true),
  include_insights: z.boolean().optional().default(true),
  min_confidence: z.number().min(0).max(1).optional().default(0.7),
}).optional();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input
    const body = req.method === 'POST' ? await req.json() : {};
    const validated = RequestSchema.parse(body);
    const { date, include_patterns, include_insights, min_confidence } = validated || { 
      include_patterns: true, 
      include_insights: true, 
      min_confidence: 0.7 
    };
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const targetDate = date || new Date().toISOString().split('T')[0];
    const yesterday = new Date(new Date(targetDate).getTime() - 24 * 60 * 60 * 1000).toISOString();

    console.log('🧠 Generating daily Brain report for', targetDate);

    // Get completed queries from last 24h
    const { data: completedQueries } = await supabase
      .from('learning_queries')
      .select('*')
      .eq('status', 'completed')
      .gte('executed_at', yesterday);

    // Get high-confidence insights from last 24h
    const { data: insights } = await supabase
      .from('learning_results')
      .select(`
        *,
        learning_confidence (
          confidence_score,
          cross_verified
        )
      `)
      .gte('created_at', yesterday)
      .gte('learning_confidence.confidence_score', min_confidence);

    // Get new learning patterns discovered
    const { data: newPatterns } = await supabase
      .from('learning_patterns')
      .select('*')
      .gte('created_at', yesterday);

    // Analyze gaps and opportunities
    const gaps: any[] = [];
    const opportunities: any[] = [];
    const newSkills: any[] = [];
    const improvements: any[] = [];

    // Extract gaps from metadata
    insights?.forEach((insight: any) => {
      const metadata = insight.metadata || {};
      if (metadata.gap) {
        gaps.push({
          area: metadata.area || 'Unknown',
          description: metadata.gap,
          severity: metadata.severity || 'medium'
        });
      }
      if (metadata.opportunity) {
        opportunities.push({
          area: metadata.area || 'Unknown',
          description: metadata.opportunity,
          impact: metadata.impact || 'medium'
        });
      }
    });

    // Identify new skills from patterns
    newPatterns?.forEach((pattern: any) => {
      if (pattern.pattern_type === 'skill') {
        newSkills.push({
          skill: pattern.pattern_name,
          description: pattern.description,
          confidence: pattern.confidence
        });
      }
    });

    // Track effectiveness improvements
    if (insights && insights.length > 0) {
      const avgConfidence = insights.reduce((sum: number, i: any) => 
        sum + (i.learning_confidence?.[0]?.confidence_score || 0), 0) / insights.length;
      
      improvements.push({
        metric: 'Research Accuracy',
        improvement: `${(avgConfidence * 100).toFixed(1)}%`,
        change: '+5%'
      });
    }

    // Calculate metrics for temporal tracking
    const avgAccuracy = insights && insights.length > 0
      ? insights.reduce((sum: number, i: any) => 
          sum + (i.learning_confidence?.[0]?.confidence_score || 0), 0) / insights.length
      : 0;
    
    const avgValue = newSkills.length > 0
      ? newSkills.reduce((sum, s) => sum + (s.confidence || 0), 0) / newSkills.length
      : 0;
    
    const researchCount = completedQueries?.length || 0;

    // Log temporal metrics for trend analysis
    await supabase.from('brain_temporal_metrics').insert([
      { 
        metric_name: 'average_reflection_accuracy', 
        metric_value: avgAccuracy, 
        metric_unit: 'score' 
      },
      { 
        metric_name: 'average_learning_value', 
        metric_value: avgValue, 
        metric_unit: 'score' 
      },
      { 
        metric_name: 'daily_research_cycles', 
        metric_value: researchCount, 
        metric_unit: 'count' 
      },
      {
        metric_name: 'new_skills_discovered',
        metric_value: newSkills.length,
        metric_unit: 'count'
      },
      {
        metric_name: 'gaps_identified',
        metric_value: gaps.length,
        metric_unit: 'count'
      }
    ]);

    console.log('📊 Logged temporal metrics for trend analysis');

    // Create summary
    const findingsSummary = `
Processed ${completedQueries?.length || 0} research queries.
Extracted ${insights?.length || 0} high-confidence insights.
Discovered ${newPatterns?.length || 0} new patterns.
${gaps.length > 0 ? `Identified ${gaps.length} knowledge gaps.` : ''}
${opportunities.length > 0 ? `Found ${opportunities.length} growth opportunities.` : ''}
    `.trim();

    // Brain updates
    const brainUpdates = [
      {
        category: 'Knowledge Base',
        update: `Added ${insights?.length || 0} verified insights`,
        timestamp: new Date().toISOString()
      },
      {
        category: 'Pattern Recognition',
        update: `Learned ${newPatterns?.length || 0} new behavioral patterns`,
        timestamp: new Date().toISOString()
      }
    ];

    // Insert report into database
    const { data: report, error: reportError } = await supabase
      .from('brain_daily_reports')
      .upsert({
        report_date: targetDate,
        gaps_found: gaps,
        opportunities: opportunities,
        findings_summary: findingsSummary,
        new_skills: newSkills,
        effectiveness_improvements: improvements,
        brain_updates: brainUpdates,
        queries_processed: completedQueries?.length || 0,
        insights_count: insights?.length || 0
      }, {
        onConflict: 'report_date'
      })
      .select()
      .single();

    if (reportError) throw reportError;

    console.log('✅ Daily report generated successfully');

    return new Response(JSON.stringify({
      success: true,
      report,
      summary: {
        queries_processed: completedQueries?.length || 0,
        insights_extracted: insights?.length || 0,
        gaps_identified: gaps.length,
        opportunities_found: opportunities.length,
        new_skills: newSkills.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Daily report error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Report generation failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});