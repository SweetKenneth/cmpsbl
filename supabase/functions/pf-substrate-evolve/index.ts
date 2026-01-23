/**
 * promptfluid® Substrate Evolution Orchestrator — Living Substrate Loop
 * v1.0.0 — Autonomous self-improvement cycle
 * 
 * Orchestrates the full evolution cycle:
 * SCAN → GENERATE → SANDBOX → APPLY → LEARN
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EVOLVE_VERSION = "1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EvolveRequest {
  action: 'cycle' | 'status' | 'history' | 'config' | 'pause' | 'resume';
  scope?: 'brain' | 'defense' | 'nexus' | 'vision' | 'dream' | 'system' | 'all';
  max_improvements?: number;
  dry_run?: boolean;
}

interface EvolutionCycle {
  cycle_id: string;
  started_at: string;
  completed_at?: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  phases: {
    scan: { status: string; improvements_found: number };
    generate: { status: string; code_generated: number };
    sandbox: { status: string; tests_passed: number; tests_failed: number };
    apply: { status: string; changes_applied: number };
    learn: { status: string; patterns_learned: number };
  };
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
    const body: EvolveRequest = await req.json();
    const { action, scope = 'all', max_improvements = 3, dry_run = false } = body;

    console.log(`🧬 Evolution Orchestrator v${EVOLVE_VERSION} | action: ${action}`);

    switch (action) {
      case 'status': {
        // Get evolution system status
        const { data: config } = await supabase
          .from('core_settings')
          .select('*')
          .eq('key', 'evolution_enabled')
          .single();

        const { data: lastCycle } = await supabase
          .from('brain_events')
          .select('*')
          .eq('event_type', 'evolution_cycle')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const { count: cyclesTotal } = await supabase
          .from('brain_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'evolution_cycle');

        const { count: cyclesToday } = await supabase
          .from('brain_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'evolution_cycle')
          .gte('created_at', new Date().toISOString().split('T')[0]);

        return jsonResponse({
          success: true,
          version: EVOLVE_VERSION,
          enabled: config?.value === 'true',
          last_cycle: lastCycle?.created_at,
          cycles_total: cyclesTotal || 0,
          cycles_today: cyclesToday || 0,
          max_per_day: 5,
          health_threshold: 90,
          components: {
            scanner: 'pf-substrate-upgrade',
            coder: 'pf-substrate-coder',
            sandbox: 'pf-substrate-sandbox',
            deployer: 'pf-substrate-upgrade',
          },
        }, corsHeaders);
      }

      case 'history': {
        const { data: cycles } = await supabase
          .from('brain_events')
          .select('*')
          .eq('event_type', 'evolution_cycle')
          .order('created_at', { ascending: false })
          .limit(20);

        return jsonResponse({
          success: true,
          cycles: (cycles || []).map(c => ({
            id: c.id,
            timestamp: c.created_at,
            outcome: c.outcome,
            data: c.data,
          })),
        }, corsHeaders);
      }

      case 'config': {
        const { data: settings } = await supabase
          .from('core_settings')
          .select('*')
          .like('key', 'evolution_%');

        const config: Record<string, unknown> = {};
        (settings || []).forEach((s: { key: string; value: string }) => {
          config[s.key] = s.value;
        });

        return jsonResponse({
          success: true,
          config: {
            enabled: config.evolution_enabled === 'true',
            max_cycles_per_day: parseInt(String(config.evolution_max_per_day || '5')),
            health_threshold: parseInt(String(config.evolution_health_threshold || '90')),
            auto_apply_level: config.evolution_auto_apply || 'shadow_only',
            cooldown_hours: parseInt(String(config.evolution_cooldown_hours || '2')),
          },
        }, corsHeaders);
      }

      case 'pause': {
        await supabase.from('core_settings').upsert({
          key: 'evolution_enabled',
          value: 'false',
        }, { onConflict: 'key' });

        await supabase.from('brain_events').insert({
          event_type: 'evolution_paused',
          module: 'evolution',
          outcome: 'success',
        });

        return jsonResponse({
          success: true,
          message: 'Evolution paused',
        }, corsHeaders);
      }

      case 'resume': {
        await supabase.from('core_settings').upsert({
          key: 'evolution_enabled',
          value: 'true',
        }, { onConflict: 'key' });

        await supabase.from('brain_events').insert({
          event_type: 'evolution_resumed',
          module: 'evolution',
          outcome: 'success',
        });

        return jsonResponse({
          success: true,
          message: 'Evolution resumed',
        }, corsHeaders);
      }

      case 'cycle': {
        const cycleId = `evo_${Date.now().toString(36)}`;
        const startTime = Date.now();

        const cycle: EvolutionCycle = {
          cycle_id: cycleId,
          started_at: new Date().toISOString(),
          status: 'running',
          phases: {
            scan: { status: 'pending', improvements_found: 0 },
            generate: { status: 'pending', code_generated: 0 },
            sandbox: { status: 'pending', tests_passed: 0, tests_failed: 0 },
            apply: { status: 'pending', changes_applied: 0 },
            learn: { status: 'pending', patterns_learned: 0 },
          },
        };

        console.log(`🔄 Starting evolution cycle ${cycleId}`);

        try {
          // ═══ PHASE 1: SCAN ═══
          cycle.phases.scan.status = 'running';
          
          const { data: scanResult, error: scanError } = await supabase.functions.invoke('pf-substrate-upgrade', {
            body: { action: 'propose', scope, max_changes: max_improvements },
          });

          if (scanError || !scanResult?.success) {
            cycle.phases.scan.status = 'failed';
            throw new Error(scanResult?.error_message || scanError?.message || 'Scan failed');
          }

          const improvements = scanResult.plan?.diff_summaries || [];
          cycle.phases.scan.improvements_found = improvements.length;
          cycle.phases.scan.status = 'completed';

          if (improvements.length === 0) {
            cycle.status = 'completed';
            cycle.completed_at = new Date().toISOString();

            await supabase.from('brain_events').insert({
              event_type: 'evolution_cycle',
              module: 'evolution',
              outcome: 'no_improvements',
              data: { cycle_id: cycleId, phases: cycle.phases },
            });

            return jsonResponse({
              success: true,
              cycle,
              message: 'No improvements found - system is optimal',
            }, corsHeaders);
          }

          // ═══ PHASE 2: GENERATE ═══
          cycle.phases.generate.status = 'running';
          const generatedCode: Array<{ improvement: unknown; code: unknown }> = [];

          for (const improvement of improvements.slice(0, max_improvements)) {
            try {
              const { data: codeResult } = await supabase.functions.invoke('pf-substrate-coder', {
                body: { action: 'generate', improvement },
              });

              if (codeResult?.success && codeResult.generated) {
                generatedCode.push({
                  improvement,
                  code: codeResult.generated,
                });
              }
            } catch (genError) {
              console.warn(`Code generation failed for improvement:`, genError);
            }
          }

          cycle.phases.generate.code_generated = generatedCode.length;
          cycle.phases.generate.status = generatedCode.length > 0 ? 'completed' : 'failed';

          if (generatedCode.length === 0) {
            throw new Error('No code could be generated for any improvement');
          }

          // ═══ PHASE 3: SANDBOX ═══
          cycle.phases.sandbox.status = 'running';
          let testsPassed = 0;
          let testsFailed = 0;

          for (const { code } of generatedCode) {
            try {
              // deno-lint-ignore no-explicit-any
              const { data: sandboxResult } = await supabase.functions.invoke('pf-substrate-sandbox', {
                body: { 
                  action: 'execute', 
                  // deno-lint-ignore no-explicit-any
                  code: (code as any).code,
                  language: 'typescript',
                },
              });

              if (sandboxResult?.success) {
                testsPassed++;
              } else {
                testsFailed++;
              }
            } catch {
              testsFailed++;
            }
          }

          cycle.phases.sandbox.tests_passed = testsPassed;
          cycle.phases.sandbox.tests_failed = testsFailed;
          cycle.phases.sandbox.status = testsPassed > 0 ? 'completed' : 'failed';

          // ═══ PHASE 4: APPLY (if not dry run) ═══
          if (dry_run) {
            cycle.phases.apply.status = 'skipped';
            cycle.phases.apply.changes_applied = 0;
          } else if (testsPassed > 0 && scanResult.plan?.plan_id) {
            cycle.phases.apply.status = 'running';

            try {
              const { data: applyResult } = await supabase.functions.invoke('pf-substrate-upgrade', {
                body: { action: 'apply_shadow', plan_id: scanResult.plan.plan_id },
              });

              if (applyResult?.success) {
                cycle.phases.apply.changes_applied = applyResult.improvements_applied || 0;
                cycle.phases.apply.status = 'completed';
              } else {
                cycle.phases.apply.status = 'failed';
              }
            } catch {
              cycle.phases.apply.status = 'failed';
            }
          } else {
            cycle.phases.apply.status = 'skipped';
          }

          // ═══ PHASE 5: LEARN ═══
          cycle.phases.learn.status = 'running';
          let patternsLearned = 0;

          for (const { code } of generatedCode) {
            try {
              const { data: learnResult } = await supabase.functions.invoke('pf-substrate-coder', {
                body: {
                  action: 'learn',
                  // deno-lint-ignore no-explicit-any
                  code: (code as any).code,
                  outcome: testsPassed > 0 ? 'success' : 'failure',
                },
              });

              if (learnResult?.success) {
                patternsLearned += learnResult.patterns_learned || 0;
              }
            } catch {
              // Learning failure is non-fatal
            }
          }

          cycle.phases.learn.patterns_learned = patternsLearned;
          cycle.phases.learn.status = 'completed';

          // ═══ COMPLETE CYCLE ═══
          cycle.status = 'completed';
          cycle.completed_at = new Date().toISOString();
          const totalTime = Date.now() - startTime;

          await supabase.from('brain_events').insert({
            event_type: 'evolution_cycle',
            module: 'evolution',
            outcome: 'success',
            data: {
              cycle_id: cycleId,
              phases: cycle.phases,
              duration_ms: totalTime,
              dry_run,
            },
          });

          return jsonResponse({
            success: true,
            cycle,
            duration_ms: totalTime,
            message: dry_run 
              ? `Dry run completed: ${improvements.length} improvements found, ${testsPassed} validated`
              : `Evolution cycle completed: ${cycle.phases.apply.changes_applied} changes applied`,
          }, corsHeaders);

        } catch (cycleError) {
          cycle.status = 'failed';
          cycle.completed_at = new Date().toISOString();

          await supabase.from('brain_events').insert({
            event_type: 'evolution_cycle',
            module: 'evolution',
            outcome: 'failed',
            data: {
              cycle_id: cycleId,
              phases: cycle.phases,
              error: cycleError instanceof Error ? cycleError.message : 'Unknown error',
            },
          });

          return jsonResponse({
            success: false,
            cycle,
            error: cycleError instanceof Error ? cycleError.message : 'Evolution cycle failed',
          }, corsHeaders, 500);
        }
      }

      default:
        return jsonResponse({
          success: false,
          error: `Unknown action: ${action}`,
        }, corsHeaders, 400);
    }
  } catch (error) {
    console.error('❌ Evolution error:', error);
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      version: EVOLVE_VERSION,
    }, corsHeaders, 500);
  }
});
