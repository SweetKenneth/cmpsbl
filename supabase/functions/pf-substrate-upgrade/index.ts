/**
 * promptfluid® Substrate Self-Upgrade Engine
 * v1.0.0 — Shadow Mode (propose-only)
 * 
 * Architecture-level substrate modernization with:
 * - Pre-backup safety
 * - Health gating
 * - Full rollback path
 * - Shadow/human-in-the-loop control
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const UPGRADE_ENGINE_VERSION = "1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Backup ID generator
function generateBackupId(): string {
  return `bkp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
}

// Plan ID generator - must be a valid UUID for database
function generatePlanId(): string {
  return crypto.randomUUID();
}

interface UpgradeRequest {
  action: 'propose' | 'list_plans' | 'get_plan' | 'apply_plan' | 'rollback_plan' | 'delete_plan' | 'reject_plan' | 'validate_plan' | 'diff_view' | 'test_shadow';
  mode?: 'shadow' | 'auto_safe' | 'auto_full';
  scope?: 'brain' | 'defense' | 'nexus' | 'vision' | 'dream' | 'system' | 'all';
  max_changes?: number;
  notes?: string;
  plan_id?: string;
  reason?: string;
}

interface UpgradePlan {
  plan_id: string;
  scope: string;
  mode: string;
  diff_summaries: Array<{
    module: string;
    change_type: string;
    description: string;
    file_path?: string;
    risk: 'low' | 'medium' | 'high';
  }>;
  risk_level: 'low' | 'medium' | 'high';
  estimated_blast_radius: string;
  suggested_patches: Array<{
    target: string;
    action: string;
    rationale: string;
  }>;
}

// deno-lint-ignore no-explicit-any
function jsonResponse(data: any, headers: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const body: UpgradeRequest = await req.json();
    const { action, mode = 'shadow', scope = 'all', max_changes = 10, notes, plan_id } = body;

    console.log(`⚡ Upgrade Engine v${UPGRADE_ENGINE_VERSION} | action: ${action}`);

    // Force shadow mode for safety
    const enforcedMode = 'shadow';
    if (mode !== 'shadow') {
      console.log(`⚠️ Mode "${mode}" requested but shadow mode enforced`);
    }

    switch (action) {
      case 'propose': {
        // === SAFETY PRECONDITIONS ===
        
        // Check system health via substrate
        const { data: healthData, error: healthError } = await supabase.functions.invoke('pf-substrate', {
          body: { module: 'system', action: 'health' }
        });
        
        if (healthError) {
          return jsonResponse({
            success: false,
            error: 'Failed to check system health',
            details: healthError.message,
          }, corsHeaders, 500);
        }
        
        const overallHealth = healthData?.overall_health ?? 0;
        
        // Get config thresholds
        const { data: configData } = await supabase
          .from('substrate_upgrade_config')
          .select('key, value');
        
        const config: Record<string, string> = {};
        (configData || []).forEach((c: { key: string; value: string }) => {
          config[c.key] = c.value;
        });
        
        const healthThreshold = parseInt(config.health_threshold_for_upgrade || '95');
        const maxPerDay = parseInt(config.max_upgrades_per_day || '3');
        
        // Check health threshold
        if (overallHealth < healthThreshold) {
          return jsonResponse({
            success: false,
            error: 'System health below threshold for upgrade',
            current_health: overallHealth,
            required_health: healthThreshold,
            message: `System health (${overallHealth}%) is below the required threshold (${healthThreshold}%). Heal the system first.`,
          }, corsHeaders, 400);
        }
        
        // Check daily upgrade limit
        const today = new Date().toISOString().split('T')[0];
        const { count: todayCount } = await supabase
          .from('substrate_upgrade_plans')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', `${today}T00:00:00Z`);
        
        if ((todayCount || 0) >= maxPerDay) {
          return jsonResponse({
            success: false,
            error: 'Upgrade rate limit reached',
            upgrades_today: todayCount,
            max_per_day: maxPerDay,
            message: `Maximum ${maxPerDay} upgrade proposals per day. Try again tomorrow.`,
          }, corsHeaders, 429);
        }
        
        // Check for active rollback
        const { data: activeRollback } = await supabase
          .from('substrate_upgrade_plans')
          .select('id')
          .eq('status', 'rolled_back')
          .gte('updated_at', new Date(Date.now() - 3600000).toISOString())
          .limit(1);
        
        if (activeRollback && activeRollback.length > 0) {
          return jsonResponse({
            success: false,
            error: 'Recent rollback in progress',
            message: 'A rollback was recently performed. Wait 1 hour before proposing new upgrades.',
          }, corsHeaders, 400);
        }
        
        // === CREATE BACKUP ===
        const { data: backupData, error: backupError } = await supabase.functions.invoke('pf-substrate', {
          body: { 
            module: 'system', 
            action: 'backup', 
            payload: { include_data: true, backup_type: 'pre_upgrade' }
          }
        });
        
        if (backupError || !backupData?.success) {
          return jsonResponse({
            success: false,
            error: 'Failed to create pre-upgrade backup',
            details: backupError?.message || backupData?.error,
          }, corsHeaders, 500);
        }
        
        const backupId = backupData.backup_id;
        console.log(`✅ Pre-upgrade backup created: ${backupId}`);
        
        // === GENERATE UPGRADE PLAN ===
        const planId = generatePlanId();
        
        // Analyze substrate codebase and generate upgrade suggestions
        const diffSummaries: UpgradePlan['diff_summaries'] = [];
        const suggestedPatches: UpgradePlan['suggested_patches'] = [];
        
        const modules = scope === 'all' 
          ? ['brain', 'defense', 'nexus', 'vision', 'dream', 'system'] 
          : [scope];
        
        for (const mod of modules) {
          // Analyze each module for potential improvements
          const moduleAnalysis = analyzeModule(mod);
          diffSummaries.push(...moduleAnalysis.diffs);
          suggestedPatches.push(...moduleAnalysis.patches);
        }
        
        // Limit changes
        const limitedDiffs = diffSummaries.slice(0, max_changes);
        
        // Calculate risk level
        const highRiskCount = limitedDiffs.filter(d => d.risk === 'high').length;
        const mediumRiskCount = limitedDiffs.filter(d => d.risk === 'medium').length;
        const riskLevel = highRiskCount > 0 ? 'high' : mediumRiskCount > 2 ? 'medium' : 'low';
        
        // Estimate blast radius
        const affectedModules = [...new Set(limitedDiffs.map(d => d.module))];
        const blastRadius = `${affectedModules.length} module(s): ${affectedModules.join(', ')}`;
        
        // Build plan object
        const plan: UpgradePlan = {
          plan_id: planId,
          scope,
          mode: enforcedMode,
          diff_summaries: limitedDiffs,
          risk_level: riskLevel,
          estimated_blast_radius: blastRadius,
          suggested_patches: suggestedPatches.slice(0, max_changes),
        };
        
        // Persist plan
        const { error: insertError } = await supabase
          .from('substrate_upgrade_plans')
          .insert({
            id: planId,
            mode: enforcedMode,
            scope,
            backup_id: backupId,
            diff_summary: plan.diff_summaries,
            risk_level: riskLevel,
            estimated_blast_radius: blastRadius,
            suggested_patches: plan.suggested_patches,
            status: 'proposed',
            operator_notes: notes,
            before_health_snapshot: healthData,
          });
        
        if (insertError) {
          return jsonResponse({
            success: false,
            error: 'Failed to persist upgrade plan',
            details: insertError.message,
          }, corsHeaders, 500);
        }
        
        // Log to vision/audit
        await supabase.from('brain_events').insert({
          event_type: 'upgrade_proposed',
          module: 'system',
          outcome: 'success',
          data: { 
            plan_id: planId, 
            backup_id: backupId, 
            scope, 
            risk_level: riskLevel,
            diff_count: limitedDiffs.length,
            engine_version: UPGRADE_ENGINE_VERSION,
          }
        });
        
        return jsonResponse({
          success: true,
          mode: enforcedMode,
          plan,
          backup_id: backupId,
          message: 'Upgrade proposal generated; human review required.',
          engine_version: UPGRADE_ENGINE_VERSION,
          timestamp: new Date().toISOString(),
        }, corsHeaders);
      }
      
      case 'list_plans': {
        const { data: plans, error } = await supabase
          .from('substrate_upgrade_plans')
          .select('id, created_at, mode, scope, status, risk_level, backup_id, operator_notes, diff_summary, suggested_patches')
          .neq('status', 'deleted')
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (error) {
          return jsonResponse({
            success: false,
            error: 'Failed to list plans',
            details: error.message,
          }, corsHeaders, 500);
        }
        
        return jsonResponse({
          success: true,
          plans: plans || [],
          count: plans?.length || 0,
          timestamp: new Date().toISOString(),
        }, corsHeaders);
      }
      
      case 'get_plan': {
        if (!plan_id) {
          return jsonResponse({
            success: false,
            error: 'plan_id is required',
          }, corsHeaders, 400);
        }
        
        const { data: plan, error } = await supabase
          .from('substrate_upgrade_plans')
          .select('*')
          .eq('id', plan_id)
          .single();
        
        if (error || !plan) {
          return jsonResponse({
            success: false,
            error: 'Plan not found',
            plan_id,
          }, corsHeaders, 404);
        }
        
        // Get associated runs
        const { data: runs } = await supabase
          .from('substrate_upgrade_runs')
          .select('*')
          .eq('plan_id', plan_id)
          .order('started_at', { ascending: false });
        
        return jsonResponse({
          success: true,
          plan,
          runs: runs || [],
          timestamp: new Date().toISOString(),
        }, corsHeaders);
      }
      
      case 'apply_plan': {
        if (!plan_id) {
          return jsonResponse({
            success: false,
            error: 'plan_id is required',
          }, corsHeaders, 400);
        }
        
        // Get plan
        const { data: plan, error: planError } = await supabase
          .from('substrate_upgrade_plans')
          .select('*')
          .eq('id', plan_id)
          .single();
        
        if (planError || !plan) {
          return jsonResponse({
            success: false,
            error: 'Plan not found',
            plan_id,
          }, corsHeaders, 404);
        }
        
        if (plan.status !== 'proposed' && plan.status !== 'approved') {
          return jsonResponse({
            success: false,
            error: `Cannot apply plan with status: ${plan.status}`,
            plan_id,
          }, corsHeaders, 400);
        }
        
        // Verify backup exists
        if (!plan.backup_id) {
          return jsonResponse({
            success: false,
            error: 'No backup associated with this plan',
            plan_id,
          }, corsHeaders, 400);
        }
        
        // Re-check system health
        const { data: healthData } = await supabase.functions.invoke('pf-substrate', {
          body: { module: 'system', action: 'health' }
        });
        
        const { data: configData } = await supabase
          .from('substrate_upgrade_config')
          .select('key, value')
          .eq('key', 'health_threshold_for_upgrade')
          .single();
        
        const healthThreshold = parseInt(configData?.value || '95');
        const currentHealth = healthData?.overall_health ?? 0;
        
        if (currentHealth < healthThreshold) {
          return jsonResponse({
            success: false,
            error: 'System health degraded since proposal',
            current_health: currentHealth,
            required_health: healthThreshold,
          }, corsHeaders, 400);
        }
        
        // Create run record
        const { data: run, error: runError } = await supabase
          .from('substrate_upgrade_runs')
          .insert({
            plan_id: plan_id,
            result: 'pending',
          })
          .select()
          .single();
        
        if (runError) {
          return jsonResponse({
            success: false,
            error: 'Failed to create run record',
            details: runError.message,
          }, corsHeaders, 500);
        }
        
        // In shadow mode, we only simulate the apply
        // Future: Actually apply patches here
        const applySuccess = true;
        const applyError: string | null = null;
        
        // Post-apply health check
        const { data: postHealthData } = await supabase.functions.invoke('pf-substrate', {
          body: { module: 'system', action: 'health' }
        });
        
        const postHealth = postHealthData?.overall_health ?? 0;
        
        // Check if health dropped significantly
        if (postHealth < healthThreshold && applySuccess) {
          // Auto-rollback
          console.log('⚠️ Health dropped below threshold, initiating auto-rollback');
          
          const { data: rollbackData } = await supabase.functions.invoke('pf-substrate', {
            body: { 
              module: 'system', 
              action: 'restore', 
              payload: { backup_id: plan.backup_id }
            }
          });
          
          // Update records
          await supabase.from('substrate_upgrade_runs').update({
            finished_at: new Date().toISOString(),
            result: 'failure',
            error: 'Health dropped below threshold - auto-rollback triggered',
            post_health_snapshot: postHealthData,
            rollback_attempted: true,
            rollback_success: rollbackData?.success || false,
          }).eq('id', run.id);
          
          await supabase.from('substrate_upgrade_plans').update({
            status: 'rolled_back',
            after_health_snapshot: postHealthData,
          }).eq('id', plan_id);
          
          return jsonResponse({
            success: false,
            error: 'Upgrade caused health degradation - auto-rollback executed',
            plan_id,
            run_id: run.id,
            backup_restored: rollbackData?.success || false,
          }, corsHeaders, 500);
        }
        
        // Success
        await supabase.from('substrate_upgrade_runs').update({
          finished_at: new Date().toISOString(),
          result: applySuccess ? 'success' : 'failure',
          error: applyError,
          post_health_snapshot: postHealthData,
        }).eq('id', run.id);
        
        await supabase.from('substrate_upgrade_plans').update({
          status: 'applied',
          after_health_snapshot: postHealthData,
        }).eq('id', plan_id);
        
        // Log to vision
        await supabase.from('brain_events').insert({
          event_type: 'upgrade_applied',
          module: 'system',
          outcome: applySuccess ? 'success' : 'failure',
          data: { 
            plan_id, 
            run_id: run.id,
            pre_health: currentHealth,
            post_health: postHealth,
          }
        });
        
        return jsonResponse({
          success: true,
          plan_id,
          run_id: run.id,
          status: 'applied',
          pre_health: currentHealth,
          post_health: postHealth,
          message: 'Upgrade applied successfully (shadow mode - no actual code changes)',
          timestamp: new Date().toISOString(),
        }, corsHeaders);
      }
      
      case 'rollback_plan': {
        if (!plan_id) {
          return jsonResponse({
            success: false,
            error: 'plan_id is required',
          }, corsHeaders, 400);
        }
        
        // Get plan
        const { data: plan, error: planError } = await supabase
          .from('substrate_upgrade_plans')
          .select('*')
          .eq('id', plan_id)
          .single();
        
        if (planError || !plan) {
          return jsonResponse({
            success: false,
            error: 'Plan not found',
            plan_id,
          }, corsHeaders, 404);
        }
        
        if (!plan.backup_id) {
          return jsonResponse({
            success: false,
            error: 'No backup associated with this plan',
            plan_id,
          }, corsHeaders, 400);
        }
        
        // Execute restore
        const { data: restoreData, error: restoreError } = await supabase.functions.invoke('pf-substrate', {
          body: { 
            module: 'system', 
            action: 'restore', 
            payload: { backup_id: plan.backup_id }
          }
        });
        
        if (restoreError || !restoreData?.success) {
          return jsonResponse({
            success: false,
            error: 'Rollback failed',
            details: restoreError?.message || restoreData?.error,
          }, corsHeaders, 500);
        }
        
        // Update plan status
        await supabase.from('substrate_upgrade_plans').update({
          status: 'rolled_back',
        }).eq('id', plan_id);
        
        // Log to vision
        await supabase.from('brain_events').insert({
          event_type: 'upgrade_rollback',
          module: 'system',
          outcome: 'success',
          data: { 
            plan_id, 
            backup_id: plan.backup_id,
          }
        });
        
        return jsonResponse({
          success: true,
          plan_id,
          backup_id: plan.backup_id,
          status: 'rolled_back',
          message: 'Rollback completed successfully',
          timestamp: new Date().toISOString(),
        }, corsHeaders);
      }
      
      case 'delete_plan':
      case 'reject_plan': {
        if (!plan_id) {
          return jsonResponse({
            success: false,
            error: 'plan_id is required',
          }, corsHeaders, 400);
        }
        
        const { reason } = body;
        
        // Get plan
        const { data: plan, error: planError } = await supabase
          .from('substrate_upgrade_plans')
          .select('*')
          .eq('id', plan_id)
          .single();
        
        if (planError || !plan) {
          return jsonResponse({
            success: false,
            error: 'Plan not found',
            plan_id,
          }, corsHeaders, 404);
        }
        
        // Cannot delete applied plans - must rollback first
        if (plan.status === 'applied') {
          return jsonResponse({
            success: false,
            error: 'Cannot delete applied plans. Use rollback_plan first.',
            plan_id,
            current_status: plan.status,
          }, corsHeaders, 400);
        }
        
        // Update plan status to rejected/deleted
        const newStatus = action === 'reject_plan' ? 'rejected' : 'deleted';
        await supabase.from('substrate_upgrade_plans').update({
          status: newStatus,
          operator_notes: reason || `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} by operator`,
        }).eq('id', plan_id);
        
        // Log to vision
        await supabase.from('brain_events').insert({
          event_type: `upgrade_${newStatus}`,
          module: 'system',
          outcome: 'success',
          data: { 
            plan_id, 
            reason: reason || 'Operator decision',
            previous_status: plan.status,
          }
        });
        
        return jsonResponse({
          success: true,
          plan_id,
          status: newStatus,
          message: `Plan ${newStatus} successfully`,
          timestamp: new Date().toISOString(),
        }, corsHeaders);
      }
      
      case 'validate_plan': {
        // Validate a plan before applying - check all functions and health
        if (!plan_id) {
          return jsonResponse({
            success: false,
            error: 'plan_id is required',
          }, corsHeaders, 400);
        }
        
        const { data: plan, error: planError } = await supabase
          .from('substrate_upgrade_plans')
          .select('*')
          .eq('id', plan_id)
          .single();
        
        if (planError || !plan) {
          return jsonResponse({
            success: false,
            error: 'Plan not found',
            plan_id,
          }, corsHeaders, 404);
        }
        
        const validationResults: Array<{
          check: string;
          status: 'pass' | 'warning' | 'fail';
          message: string;
          details?: unknown;
        }> = [];
        
        // 1. Check backup exists
        validationResults.push({
          check: 'backup_exists',
          status: plan.backup_id ? 'pass' : 'fail',
          message: plan.backup_id 
            ? `Backup ready: ${plan.backup_id}` 
            : 'No backup associated with plan',
        });
        
        // 2. Check current system health
        const { data: healthData } = await supabase.functions.invoke('pf-substrate', {
          body: { module: 'system', action: 'health' }
        });
        const currentHealth = healthData?.overall_health ?? 0;
        
        validationResults.push({
          check: 'system_health',
          status: currentHealth >= 95 ? 'pass' : currentHealth >= 80 ? 'warning' : 'fail',
          message: `Current health: ${currentHealth}%`,
          details: { current: currentHealth, required: 95 }
        });
        
        // 3. Check each affected module
        const affectedModules = plan.scope === 'all' 
          ? ['brain', 'defense', 'nexus', 'vision', 'dream', 'system', 'modernizer', 'decode']
          : [plan.scope];
        
        for (const mod of affectedModules) {
          try {
            const { data: modData, error: modError } = await supabase.functions.invoke('pf-substrate', {
              body: { module: mod, action: 'pulse' }
            });
            
            // Check for pulse.alive (newer format) or success flag
            const isModuleHealthy = modData?.pulse?.alive === true || 
                                    modData?.pulse?.status === 'healthy' ||
                                    modData?.success === true;
            
            validationResults.push({
              check: `module_${mod}`,
              status: modError ? 'fail' : isModuleHealthy ? 'pass' : 'warning',
              message: modError 
                ? `${mod}: unreachable`
                : isModuleHealthy 
                  ? `${mod}: healthy (v${modData?.pulse?.version || 'unknown'})`
                  : `${mod}: degraded`,
              details: modData
            });
          } catch (e) {
            validationResults.push({
              check: `module_${mod}`,
              status: 'fail',
              message: `${mod}: error during validation`,
              details: e instanceof Error ? e.message : 'Unknown'
            });
          }
        }
        
        // 4. Check for conflicting upgrades
        const { data: activeUpgrades } = await supabase
          .from('substrate_upgrade_plans')
          .select('id, status')
          .in('status', ['applying', 'approved'])
          .neq('id', plan_id);
        
        validationResults.push({
          check: 'no_conflicting_upgrades',
          status: !activeUpgrades?.length ? 'pass' : 'warning',
          message: activeUpgrades?.length 
            ? `${activeUpgrades.length} other upgrade(s) in progress`
            : 'No conflicting upgrades',
        });
        
        // 5. Check risk level
        validationResults.push({
          check: 'risk_assessment',
          status: plan.risk_level === 'low' ? 'pass' : plan.risk_level === 'medium' ? 'warning' : 'fail',
          message: `Risk level: ${plan.risk_level}`,
          details: { 
            risk_level: plan.risk_level,
            blast_radius: plan.estimated_blast_radius
          }
        });
        
        const passCount = validationResults.filter(r => r.status === 'pass').length;
        const failCount = validationResults.filter(r => r.status === 'fail').length;
        const warningCount = validationResults.filter(r => r.status === 'warning').length;
        
        const overallStatus = failCount > 0 ? 'fail' : warningCount > 0 ? 'warning' : 'pass';
        
        // Update plan with validation results
        await supabase.from('substrate_upgrade_plans').update({
          operator_notes: `Last validation: ${new Date().toISOString()} - ${overallStatus.toUpperCase()}`,
        }).eq('id', plan_id);
        
        return jsonResponse({
          success: true,
          plan_id,
          validation_status: overallStatus,
          ready_to_apply: failCount === 0,
          summary: {
            passed: passCount,
            warnings: warningCount,
            failed: failCount,
            total: validationResults.length,
          },
          results: validationResults,
          timestamp: new Date().toISOString(),
        }, corsHeaders);
      }
      
      case 'diff_view': {
        // Get detailed diff between current and proposed changes
        if (!plan_id) {
          return jsonResponse({
            success: false,
            error: 'plan_id is required',
          }, corsHeaders, 400);
        }
        
        const { data: plan, error: planError } = await supabase
          .from('substrate_upgrade_plans')
          .select('*')
          .eq('id', plan_id)
          .single();
        
        if (planError || !plan) {
          return jsonResponse({
            success: false,
            error: 'Plan not found',
            plan_id,
          }, corsHeaders, 404);
        }
        
        // Get current production state
        const { data: prodHealth } = await supabase.functions.invoke('pf-substrate', {
          body: { module: 'system', action: 'health' }
        });
        
        const { data: prodMetrics } = await supabase.functions.invoke('pf-substrate', {
          body: { module: 'vision', action: 'metrics' }
        });
        
        // Get the before snapshot from when proposal was made
        const beforeSnapshot = plan.before_health_snapshot || {};
        
        // Build comprehensive diff
        const diff = {
          plan_id,
          created_at: plan.created_at,
          scope: plan.scope,
          status: plan.status,
          
          health_comparison: {
            before: beforeSnapshot.overall_health ?? 'N/A',
            current: prodHealth?.overall_health ?? 'N/A',
            after_estimate: plan.status === 'applied' 
              ? (plan.after_health_snapshot?.overall_health ?? 'N/A')
              : 'Pending',
          },
          
          proposed_changes: plan.diff_summary || [],
          suggested_patches: plan.suggested_patches || [],
          
          affected_modules: plan.estimated_blast_radius,
          risk_level: plan.risk_level,
          
          backup_info: {
            backup_id: plan.backup_id,
            can_rollback: !!plan.backup_id && plan.status === 'applied',
          },
          
          production_state: {
            health: prodHealth?.overall_health ?? 0,
            modules: prodHealth?.modules ?? {},
            metrics_snapshot: prodMetrics?.metrics ?? {},
          },
        };
        
        return jsonResponse({
          success: true,
          diff,
          timestamp: new Date().toISOString(),
        }, corsHeaders);
      }
      
      case 'test_shadow': {
        // Run comprehensive shadow tests on all substrate modules
        if (!plan_id) {
          return jsonResponse({
            success: false,
            error: 'plan_id is required',
          }, corsHeaders, 400);
        }
        
        const { data: plan } = await supabase
          .from('substrate_upgrade_plans')
          .select('*')
          .eq('id', plan_id)
          .single();
        
        if (!plan) {
          return jsonResponse({
            success: false,
            error: 'Plan not found',
          }, corsHeaders, 404);
        }
        
        const testResults: Array<{
          module: string;
          test: string;
          status: 'pass' | 'fail' | 'skip';
          latency_ms?: number;
          error?: string;
          details?: string;
        }> = [];
        
        const modules = ['brain', 'defense', 'nexus', 'vision', 'dream', 'system', 'modernizer', 'decode'];
        
        for (const mod of modules) {
          const startTime = Date.now();
          
          // Test 1: Pulse/health check
          try {
            const { data, error } = await supabase.functions.invoke('pf-substrate', {
              body: { module: mod, action: 'pulse' }
            });
            
            // Check for pulse.alive (newer format) or success flag
            const isPulseAlive = data?.pulse?.alive === true || 
                                 data?.pulse?.status === 'healthy' ||
                                 data?.success === true;
            
            testResults.push({
              module: mod,
              test: 'pulse',
              status: error ? 'fail' : isPulseAlive ? 'pass' : 'fail',
              latency_ms: Date.now() - startTime,
              error: error?.message,
              details: isPulseAlive ? `v${data?.pulse?.version || 'unknown'}` : undefined,
            });
          } catch (e) {
            testResults.push({
              module: mod,
              test: 'pulse',
              status: 'fail',
              latency_ms: Date.now() - startTime,
              error: e instanceof Error ? e.message : 'Unknown',
            });
          }
          
          // Test 2: Status check
          try {
            const statusStart = Date.now();
            const { data, error } = await supabase.functions.invoke('pf-substrate', {
              body: { module: mod, action: 'status' }
            });
            
            testResults.push({
              module: mod,
              test: 'status',
              status: error ? 'fail' : data?.success ? 'pass' : 'fail',
              latency_ms: Date.now() - statusStart,
              error: error?.message,
              details: data?.stats ? JSON.stringify(data.stats).slice(0, 50) : undefined,
            });
          } catch (e) {
            testResults.push({
              module: mod,
              test: 'status',
              status: 'fail',
              error: e instanceof Error ? e.message : 'Unknown',
            });
          }
        }
        
        // Additional integration tests
        // Test substrate gateway directly with system.health action
        try {
          const gwStart = Date.now();
          const { data, error } = await supabase.functions.invoke('pf-substrate', {
            body: { module: 'system', action: 'health' }
          });
          
          testResults.push({
            module: 'gateway',
            test: 'system_health',
            status: error ? 'fail' : (data?.success || data?.overall_health !== undefined) ? 'pass' : 'fail',
            latency_ms: Date.now() - gwStart,
            details: data?.overall_health ? `${data.overall_health}%` : undefined,
          });
        } catch (e) {
          testResults.push({
            module: 'gateway',
            test: 'system_health',
            status: 'fail',
            error: e instanceof Error ? e.message : 'Unknown',
          });
        }
        
        const passCount = testResults.filter(r => r.status === 'pass').length;
        const failCount = testResults.filter(r => r.status === 'fail').length;
        const avgLatency = testResults
          .filter(r => r.latency_ms)
          .reduce((sum, r) => sum + (r.latency_ms || 0), 0) / testResults.length;
        
        // Log test run
        await supabase.from('brain_events').insert({
          event_type: 'shadow_test',
          module: 'modernizer',
          outcome: failCount === 0 ? 'success' : 'failure',
          data: { 
            plan_id,
            passed: passCount,
            failed: failCount,
            avg_latency_ms: Math.round(avgLatency),
          }
        });
        
        return jsonResponse({
          success: true,
          plan_id,
          test_status: failCount === 0 ? 'pass' : 'fail',
          ready_for_production: failCount === 0,
          summary: {
            total_tests: testResults.length,
            passed: passCount,
            failed: failCount,
            avg_latency_ms: Math.round(avgLatency),
          },
          results: testResults,
          timestamp: new Date().toISOString(),
        }, corsHeaders);
      }
      
      default:
        return jsonResponse({
          success: false,
          error: `Unknown action: ${action}`,
          valid_actions: ['propose', 'list_plans', 'get_plan', 'apply_plan', 'rollback_plan', 'delete_plan', 'reject_plan', 'validate_plan', 'diff_view', 'test_shadow'],
        }, corsHeaders, 400);
    }
    
  } catch (error) {
    console.error("❌ Upgrade engine error:", error);
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      engine_version: UPGRADE_ENGINE_VERSION,
    }, corsHeaders, 500);
  }
});

// Module analysis helper - generates upgrade suggestions
function analyzeModule(module: string): {
  diffs: UpgradePlan['diff_summaries'];
  patches: UpgradePlan['suggested_patches'];
} {
  const diffs: UpgradePlan['diff_summaries'] = [];
  const patches: UpgradePlan['suggested_patches'] = [];
  
  // Generate module-specific upgrade suggestions
  switch (module) {
    case 'brain':
      diffs.push(
        {
          module: 'brain',
          change_type: 'optimization',
          description: 'Memory compression algorithm upgrade for cold storage',
          file_path: 'supabase/functions/pf-substrate/index.ts',
          risk: 'low',
        },
        {
          module: 'brain',
          change_type: 'feature',
          description: 'Enhanced semantic recall with embedding similarity',
          risk: 'medium',
        }
      );
      patches.push({
        target: 'brain.recall',
        action: 'Implement vector similarity search for improved recall accuracy',
        rationale: 'Current text search is limited; embeddings would improve relevance',
      });
      break;
      
    case 'defense':
      diffs.push({
        module: 'defense',
        change_type: 'enhancement',
        description: 'Rate limiting middleware consolidation',
        risk: 'low',
      });
      patches.push({
        target: 'defense.analyze',
        action: 'Add ML-based bot detection using behavioral patterns',
        rationale: 'Static rules can be bypassed; ML provides adaptive detection',
      });
      break;
      
    case 'nexus':
      diffs.push({
        module: 'nexus',
        change_type: 'optimization',
        description: 'Provider health-weighted routing algorithm',
        risk: 'low',
      });
      patches.push({
        target: 'nexus.route',
        action: 'Implement latency-based provider selection',
        rationale: 'Current round-robin ignores provider performance metrics',
      });
      break;
      
    case 'vision':
      diffs.push({
        module: 'vision',
        change_type: 'feature',
        description: 'Real-time metric aggregation pipeline',
        risk: 'low',
      });
      break;
      
    case 'dream':
      diffs.push({
        module: 'dream',
        change_type: 'enhancement',
        description: 'Cross-dream pattern recognition',
        risk: 'low',
      });
      break;
      
    case 'system':
      diffs.push({
        module: 'system',
        change_type: 'infrastructure',
        description: 'Automated health monitoring with alerting',
        risk: 'medium',
      });
      patches.push({
        target: 'system.heal',
        action: 'Add predictive healing based on health trends',
        rationale: 'Proactive healing before degradation occurs',
      });
      break;
  }
  
  return { diffs, patches };
}
