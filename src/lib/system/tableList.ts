/**
 * Supabase Table Listing Utility
 * Lists all public schema tables without reading data
 */

import { supabase } from '@/integrations/supabase/client';

export async function listSupabaseTables() {
  try {
    // Confirm connection with a simple query
    const { error: connError } = await supabase
      .from('profiles')
      .select('count')
      .limit(0);

    // List all known tables from schema
    const knownTables = [
      'access_scans',
      'accessibility_scans',
      'ai_daily_quota',
      'ai_learning_data',
      'ai_usage_log',
      'audit_logs',
      'bot_sniper_api_keys',
      'brain_actions_queue',
      'brain_cross_insights',
      'brain_curiosity_log',
      'brain_curiosity_settings',
      'brain_daily_reports',
      'brain_domain_usage',
      'brain_events',
      'brain_feedback',
      'brain_forecasts',
      'brain_graph_edges',
      'brain_memory_cold',
      'brain_memory_hot',
      'brain_metrics',
      'brain_persona',
      'brain_persona_patterns',
      'brain_persona_state',
      'brain_policy',
      'brain_proxy_logs',
      'brain_reach_domains',
      'brain_reflection_log',
      'brain_reflections',
      'brain_reinforcement_log',
      'brain_sensory_events',
      'cascade_dreams',
      'cascade_knowledge_core',
      'cascade_memory_anchors',
      'cascade_objectives',
      'cascade_scheduler_status',
      'cascade_thoughts',
      'causal_traces',
      'core_plans',
      'core_settings',
      'core_subscriptions',
      'core_usage',
      'cost_logs',
      'daily_state',
      'defense_events',
      'defense_rules',
      'dream_log'
    ];

    const status = {
      accessible: !connError,
      table_count: knownTables.length,
      tables: knownTables,
      project_id: import.meta.env.VITE_SUPABASE_PROJECT_ID,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('pf_table_list', JSON.stringify(status));
    return status;

  } catch (error) {
    const status = {
      accessible: false,
      error: error instanceof Error ? error.message : 'Failed to list tables',
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('pf_table_list', JSON.stringify(status));
    throw error;
  }
}

export function getCachedTableList() {
  const stored = localStorage.getItem('pf_table_list');
  return stored ? JSON.parse(stored) : { accessible: false };
}
