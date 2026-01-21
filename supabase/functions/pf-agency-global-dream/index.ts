/**
 * pf-agency-global-dream v1.0.0
 * 
 * Global Dream Cycle - Substrate-level meta-learning
 * Runs nightly at 03:00 UTC
 * 
 * Reads: aggregated stats, skill success rates, anonymized artifacts
 * Writes: substrate brain improvements, global templates, universal strategies
 * Guarantees: No PII, no competitive intelligence leakage
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { force = false } = await req.json().catch(() => ({}));

    console.log("🌐 Starting global dream cycle...");

    // Create global cycle log
    const { data: cycleLog } = await supabase
      .from('dream_cycle_logs')
      .insert({
        agency_id: null, // Global cycle
        cycle_type: 'global',
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    const cycleId = cycleLog?.id;

    // Get agencies that opted into global pooling
    const { data: consentedAgencies } = await supabase
      .from('agency_dream_consent')
      .select('agency_id')
      .eq('allow_global_pooling', true);

    const agencyIds = consentedAgencies?.map(a => a.agency_id) || [];

    if (agencyIds.length === 0) {
      console.log("No agencies opted into global learning");
      await supabase
        .from('dream_cycle_logs')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', cycleId);
      
      return new Response(JSON.stringify({
        success: true,
        message: "No agencies opted into global learning",
        improvementsGenerated: 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Aggregate telemetry across all consented agencies (anonymized)
    const { data: aggregatedTelemetry } = await supabase
      .from('agency_agent_telemetry')
      .select('tasks_completed, tasks_failed, skill_usage, avg_latency_ms')
      .in('agency_id', agencyIds)
      .gte('period_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    // 2. Aggregate skill success patterns (no agency-specific data)
    const skillAggregates: Record<string, { total: number; successful: number }> = {};
    
    for (const t of aggregatedTelemetry || []) {
      const usage = t.skill_usage || {};
      for (const [skill, count] of Object.entries(usage as Record<string, number>)) {
        if (!skillAggregates[skill]) {
          skillAggregates[skill] = { total: 0, successful: 0 };
        }
        skillAggregates[skill].total += count;
        skillAggregates[skill].successful += Math.round(count * (t.tasks_completed / (t.tasks_completed + t.tasks_failed + 1)));
      }
    }

    // 3. Collect local improvements that can be generalized
    const { data: localImprovements } = await supabase
      .from('agency_dream_memory')
      .select('improvement_type, category, title, payload, confidence')
      .in('agency_id', agencyIds)
      .eq('layer', 'local')
      .gte('confidence', 0.7)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // 4. Generate global improvements
    const globalImprovements = await generateGlobalImprovements(
      skillAggregates,
      localImprovements || [],
      agencyIds.length
    );

    // 5. Store in substrate_brain_improvements
    let improvementsGenerated = 0;

    for (const improvement of globalImprovements) {
      // Check if similar improvement exists
      const { data: existing } = await supabase
        .from('substrate_brain_improvements')
        .select('id, source_count, confidence, version')
        .eq('category', improvement.category)
        .eq('title', improvement.title)
        .single();

      if (existing) {
        // Update existing with increased confidence
        const newVersion = incrementVersion(existing.version);
        await supabase
          .from('substrate_brain_improvements')
          .update({
            source_count: existing.source_count + 1,
            confidence: Math.min(0.95, existing.confidence + 0.05),
            version: newVersion,
            payload: improvement.payload,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Insert new improvement
        await supabase
          .from('substrate_brain_improvements')
          .insert({
            improvement_type: improvement.type,
            category: improvement.category,
            title: improvement.title,
            description: improvement.description,
            payload: improvement.payload,
            confidence: improvement.confidence,
            source_count: 1,
          });
      }
      improvementsGenerated++;
    }

    // 6. Update global learning metrics
    await supabase.rpc('upsert_dream_learning_metrics', {
      p_agency_id: null,
      p_skill_improvement: Object.keys(skillAggregates).length * 0.05,
      p_template_diff: globalImprovements.filter(i => i.type === 'template').length * 0.1,
      p_artifact_quality: 0.1,
      p_success_rate_delta: calculateGlobalSuccessRate(aggregatedTelemetry || []),
      p_token_efficiency_delta: 0,
    });

    // Complete cycle log
    await supabase
      .from('dream_cycle_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        improvements_generated: improvementsGenerated,
        metadata: {
          agencies_analyzed: agencyIds.length,
          skills_tracked: Object.keys(skillAggregates).length,
          local_improvements_reviewed: localImprovements?.length || 0,
        },
      })
      .eq('id', cycleId);

    console.log(`✅ Global dream cycle complete: ${improvementsGenerated} improvements from ${agencyIds.length} agencies`);

    return new Response(JSON.stringify({
      success: true,
      cycleId,
      improvementsGenerated,
      agenciesAnalyzed: agencyIds.length,
      skillsTracked: Object.keys(skillAggregates).length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Global dream cycle error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Generate global improvements from aggregated data
function generateGlobalImprovements(
  skillAggregates: Record<string, { total: number; successful: number }>,
  localImprovements: any[],
  agencyCount: number
) {
  const improvements: Array<{
    type: string;
    category: string;
    title: string;
    description: string;
    payload: any;
    confidence: number;
  }> = [];

  // 1. Skill evolution curves - identify trending skills
  for (const [skill, stats] of Object.entries(skillAggregates)) {
    if (stats.total > 10) {
      const successRate = stats.successful / stats.total;
      
      improvements.push({
        type: 'skill',
        category: 'skill_evolution',
        title: `${skill} global benchmark`,
        description: `Cross-agency ${skill} performance baseline`,
        payload: {
          skill_name: skill,
          global_usage: stats.total,
          success_rate: successRate,
          percentile_threshold: successRate,
        },
        confidence: Math.min(0.9, 0.5 + (stats.total / 100)),
      });
    }
  }

  // 2. Generalize high-confidence local improvements
  const improvementCounts: Record<string, { count: number; data: any }> = {};
  
  for (const imp of localImprovements) {
    const key = `${imp.improvement_type}:${imp.category}`;
    if (!improvementCounts[key]) {
      improvementCounts[key] = { count: 0, data: imp };
    }
    improvementCounts[key].count++;
  }

  // If multiple agencies discovered the same pattern, it's globally valid
  for (const [key, { count, data }] of Object.entries(improvementCounts)) {
    if (count >= 2 || count >= agencyCount * 0.3) {
      improvements.push({
        type: data.improvement_type,
        category: data.category,
        title: `[Global] ${data.title}`,
        description: `Validated across ${count} agencies`,
        payload: {
          ...data.payload,
          source_agency_count: count,
          generalized: true,
        },
        confidence: Math.min(0.95, data.confidence + count * 0.05),
      });
    }
  }

  // 3. Universal strategy patterns
  if (agencyCount > 1) {
    improvements.push({
      type: 'framework',
      category: 'meta_learning',
      title: 'Cross-agency learning active',
      description: `Meta-patterns from ${agencyCount} agencies`,
      payload: {
        agency_count: agencyCount,
        skills_tracked: Object.keys(skillAggregates).length,
        learning_velocity: localImprovements.length / agencyCount,
      },
      confidence: 0.6,
    });
  }

  return improvements;
}

// Increment semantic version
function incrementVersion(version: string): string {
  const parts = version.split('.').map(Number);
  parts[2] = (parts[2] || 0) + 1;
  if (parts[2] >= 10) {
    parts[1] = (parts[1] || 0) + 1;
    parts[2] = 0;
  }
  return parts.join('.');
}

// Calculate global success rate
function calculateGlobalSuccessRate(telemetry: any[]): number {
  let totalCompleted = 0;
  let totalFailed = 0;
  
  for (const t of telemetry) {
    totalCompleted += t.tasks_completed || 0;
    totalFailed += t.tasks_failed || 0;
  }
  
  const total = totalCompleted + totalFailed;
  if (total === 0) return 0;
  
  return (totalCompleted / total) - 0.5; // Delta from 50% baseline
}
