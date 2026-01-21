/**
 * pf-agency-local-dream v1.0.0
 * 
 * Local Dream Cycle - Agency-specific learning
 * Runs nightly at 03:00 user-local time
 * 
 * Reads: task logs, errors, artifacts, feedback, telemetry
 * Writes: local templates, scaffolds, heuristics, skill weights
 * Guarantees: No cross-agency data leakage
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
    const { agencyId, force = false } = await req.json();

    if (!agencyId) {
      throw new Error("agency_id is required");
    }

    console.log(`🌙 Starting local dream cycle for agency ${agencyId}`);

    // Create dream cycle log
    const { data: cycleLog } = await supabase
      .from('dream_cycle_logs')
      .insert({
        agency_id: agencyId,
        cycle_type: 'local',
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    const cycleId = cycleLog?.id;

    // Gather local learning data (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // 1. Get completed tasks with outputs
    const { data: completedTasks } = await supabase
      .from('agency_tasks')
      .select('id, task_type, input_data, output_data, metadata, completed_at')
      .eq('agency_id', agencyId)
      .eq('status', 'completed')
      .gte('completed_at', twentyFourHoursAgo)
      .order('completed_at', { ascending: false })
      .limit(50);

    // 2. Get failed tasks for error learning
    const { data: failedTasks } = await supabase
      .from('agency_tasks')
      .select('id, task_type, input_data, error_message, metadata')
      .eq('agency_id', agencyId)
      .eq('status', 'failed')
      .gte('created_at', twentyFourHoursAgo)
      .limit(20);

    // 3. Get telemetry data
    const { data: telemetry } = await supabase
      .from('agency_agent_telemetry')
      .select('*')
      .eq('agency_id', agencyId)
      .gte('period_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('period_date', { ascending: false });

    // 4. Get artifacts for quality analysis
    const { data: artifacts } = await supabase
      .from('agency_task_artifacts')
      .select('id, artifact_type, file_name, metadata, download_count')
      .eq('agency_id', agencyId)
      .gte('created_at', twentyFourHoursAgo)
      .limit(30);

    // 5. Get dream pool entries
    const { data: dreamPool } = await supabase
      .from('agency_dream_pool')
      .select('dream_content, dream_type, sentiment_score, tags')
      .eq('agency_id', agencyId)
      .gte('created_at', twentyFourHoursAgo);

    // Analyze patterns and generate improvements
    const improvements = await analyzeAndGenerateImprovements(supabase, {
      agencyId,
      completedTasks: completedTasks || [],
      failedTasks: failedTasks || [],
      telemetry: telemetry || [],
      artifacts: artifacts || [],
      dreamPool: dreamPool || [],
    });

    // Store improvements in agency_dream_memory
    let improvementsGenerated = 0;
    let templatesCreated = 0;
    let heuristicsLearned = 0;

    for (const improvement of improvements) {
      await supabase.from('agency_dream_memory').insert({
        agency_id: agencyId,
        layer: 'local',
        improvement_type: improvement.type,
        category: improvement.category,
        title: improvement.title,
        payload: improvement.payload,
        evidence_refs: improvement.evidenceRefs,
        confidence: improvement.confidence,
      });

      improvementsGenerated++;
      if (improvement.type === 'template') templatesCreated++;
      if (improvement.type === 'heuristic') heuristicsLearned++;
    }

    // Update skill weights based on telemetry
    await updateSkillWeights(supabase, agencyId, telemetry || []);

    // Record learning metrics
    await supabase.rpc('upsert_dream_learning_metrics', {
      p_agency_id: agencyId,
      p_skill_improvement: improvements.filter(i => i.type === 'skill').length * 0.1,
      p_template_diff: templatesCreated * 0.15,
      p_artifact_quality: artifacts?.length ? 0.1 : 0,
      p_success_rate_delta: calculateSuccessRateDelta(completedTasks || [], failedTasks || []),
      p_token_efficiency_delta: 0,
    });

    // Complete the cycle log
    await supabase
      .from('dream_cycle_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        improvements_generated: improvementsGenerated,
        templates_created: templatesCreated,
        heuristics_learned: heuristicsLearned,
        artifacts_processed: artifacts?.length || 0,
        metadata: {
          tasks_analyzed: (completedTasks?.length || 0) + (failedTasks?.length || 0),
          telemetry_days: telemetry?.length || 0,
        },
      })
      .eq('id', cycleId);

    console.log(`✅ Local dream cycle complete: ${improvementsGenerated} improvements, ${templatesCreated} templates`);

    return new Response(JSON.stringify({
      success: true,
      cycleId,
      improvementsGenerated,
      templatesCreated,
      heuristicsLearned,
      artifactsProcessed: artifacts?.length || 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Local dream cycle error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Analyze patterns and generate improvements
async function analyzeAndGenerateImprovements(
  supabase: any,
  data: {
    agencyId: string;
    completedTasks: any[];
    failedTasks: any[];
    telemetry: any[];
    artifacts: any[];
    dreamPool: any[];
  }
) {
  const improvements: Array<{
    type: string;
    category: string;
    title: string;
    payload: any;
    evidenceRefs: string[];
    confidence: number;
  }> = [];

  // 1. Identify successful task patterns → Templates
  const taskTypeSuccess: Record<string, { count: number; insights: string[] }> = {};
  
  for (const task of data.completedTasks) {
    const type = task.task_type;
    if (!taskTypeSuccess[type]) {
      taskTypeSuccess[type] = { count: 0, insights: [] };
    }
    taskTypeSuccess[type].count++;
    
    const insights = task.output_data?.insights || [];
    taskTypeSuccess[type].insights.push(...insights.slice(0, 2));
  }

  // Generate templates for frequently successful task types
  for (const [taskType, stats] of Object.entries(taskTypeSuccess)) {
    if (stats.count >= 3) {
      improvements.push({
        type: 'template',
        category: taskType,
        title: `Optimized ${taskType} workflow`,
        payload: {
          task_type: taskType,
          success_count: stats.count,
          common_insights: [...new Set(stats.insights)].slice(0, 5),
          recommended_approach: `Based on ${stats.count} successful executions`,
        },
        evidenceRefs: data.completedTasks.filter(t => t.task_type === taskType).map(t => t.id),
        confidence: Math.min(0.9, 0.5 + stats.count * 0.1),
      });
    }
  }

  // 2. Learn from failures → Heuristics
  const errorPatterns: Record<string, number> = {};
  
  for (const task of data.failedTasks) {
    const errorMsg = task.error_message || 'unknown';
    const pattern = errorMsg.slice(0, 50);
    errorPatterns[pattern] = (errorPatterns[pattern] || 0) + 1;
  }

  for (const [pattern, count] of Object.entries(errorPatterns)) {
    if (count >= 2) {
      improvements.push({
        type: 'heuristic',
        category: 'error_avoidance',
        title: `Avoid: ${pattern.slice(0, 30)}...`,
        payload: {
          error_pattern: pattern,
          occurrence_count: count,
          avoidance_strategy: 'Pre-validate inputs and add fallback handling',
        },
        evidenceRefs: data.failedTasks.filter(t => t.error_message?.includes(pattern.slice(0, 20))).map(t => t.id),
        confidence: Math.min(0.8, 0.4 + count * 0.15),
      });
    }
  }

  // 3. Telemetry-based skill evolution
  if (data.telemetry.length > 0) {
    const latestTelemetry = data.telemetry[0];
    const skillUsage = latestTelemetry.skill_usage || {};
    
    for (const [skill, usage] of Object.entries(skillUsage as Record<string, number>)) {
      if (usage > 5) {
        improvements.push({
          type: 'skill',
          category: 'skill_mastery',
          title: `${skill} proficiency increase`,
          payload: {
            skill_name: skill,
            usage_count: usage,
            mastery_level: Math.min(1, usage / 20),
          },
          evidenceRefs: [],
          confidence: Math.min(0.85, 0.5 + usage * 0.05),
        });
      }
    }
  }

  // 4. Dream pool synthesis → Strategies
  const dreamThemes: Record<string, number> = {};
  
  for (const dream of data.dreamPool) {
    for (const tag of (dream.tags || [])) {
      dreamThemes[tag] = (dreamThemes[tag] || 0) + 1;
    }
  }

  for (const [theme, count] of Object.entries(dreamThemes)) {
    if (count >= 3) {
      improvements.push({
        type: 'strategy',
        category: theme,
        title: `${theme} focus strategy`,
        payload: {
          theme,
          occurrence_count: count,
          priority_boost: 1 + count * 0.1,
        },
        evidenceRefs: [],
        confidence: Math.min(0.75, 0.4 + count * 0.1),
      });
    }
  }

  return improvements;
}

// Update skill weights based on telemetry
async function updateSkillWeights(supabase: any, agencyId: string, telemetry: any[]) {
  if (telemetry.length === 0) return;

  const { data: members } = await supabase
    .from('agency_members')
    .select('id, skill_weights')
    .eq('agency_id', agencyId);

  if (!members) return;

  // Aggregate skill usage across telemetry
  const aggregatedSkills: Record<string, number> = {};
  
  for (const t of telemetry) {
    const usage = t.skill_usage || {};
    for (const [skill, count] of Object.entries(usage as Record<string, number>)) {
      aggregatedSkills[skill] = (aggregatedSkills[skill] || 0) + count;
    }
  }

  // Normalize and update
  const totalUsage = Object.values(aggregatedSkills).reduce((a, b) => a + b, 0) || 1;
  
  for (const member of members) {
    const currentWeights = member.skill_weights || {};
    const updatedWeights = { ...currentWeights };
    
    for (const [skill, count] of Object.entries(aggregatedSkills)) {
      const newWeight = count / totalUsage;
      updatedWeights[skill] = (currentWeights[skill] || 0.5) * 0.7 + newWeight * 0.3; // Exponential smoothing
    }

    await supabase
      .from('agency_members')
      .update({ skill_weights: updatedWeights })
      .eq('id', member.id);
  }
}

// Calculate success rate delta
function calculateSuccessRateDelta(completed: any[], failed: any[]): number {
  const total = completed.length + failed.length;
  if (total === 0) return 0;
  return (completed.length / total) - 0.5; // Delta from 50% baseline
}
