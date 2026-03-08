/**
 * CMPSBL® SYSTEM — Predictive Healing
 * Proactive healing based on health trends and anomaly detection
 */

import { supabase } from '@/integrations/supabase/client';
import { SubstrateModule } from '@/lib/substrate';

interface BrainEventData { health_score?: number; [key: string]: unknown }

export interface HealthTrend {
  module: SubstrateModule;
  currentHealth: number;
  trend: 'improving' | 'stable' | 'degrading' | 'critical';
  trendSlope: number;
  predictedHealth: number;
  timeToIssue: number | null; // Minutes until predicted issue
  recommendation: string;
}

export interface HealingAction {
  id: string;
  module: SubstrateModule;
  type: 'preventive' | 'reactive' | 'scheduled';
  action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledFor: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}

export interface PredictiveAnalysis {
  overallHealth: number;
  trends: HealthTrend[];
  predictedIssues: Array<{
    module: SubstrateModule;
    issue: string;
    probability: number;
    eta: number;
  }>;
  recommendedActions: HealingAction[];
}

const MODULES: SubstrateModule[] = [
  'core', 'decode', 'encode', 'vision', 'cortex', 'nexus',
  'economy', 'sandbox', 'inclusive', 'integration',
  'defense', 'immunity', 'evolution', 'intent', 'governance',
  'brain', 'system', 'memory', 'dream',
  'ripple', 'access', 'identity', 'relay', 'audit',
];

/**
 * Get historical health data for trend analysis
 */
async function getHealthHistory(
  module: SubstrateModule,
  hours: number = 24
): Promise<Array<{ timestamp: string; health: number }>> {
  try {
    const since = new Date(Date.now() - hours * 3600000).toISOString();
    
    const { data } = await supabase
      .from('brain_events')
      .select('created_at, data')
      .eq('module', module)
      .gte('created_at', since)
      .order('created_at', { ascending: true });
    
    if (!data) return [];
    
    return data
      .filter(e => (e.data as BrainEventData)?.health_score !== undefined)
      .map(e => ({
        timestamp: e.created_at,
        health: (e.data as BrainEventData).health_score!,
      }));
  } catch (error) {
    return [];
  }
}

/**
 * Calculate linear regression for trend analysis
 */
function calculateTrendSlope(points: Array<{ timestamp: string; health: number }>): number {
  if (points.length < 2) return 0;
  
  const n = points.length;
  const times = points.map((p, i) => i);
  const healths = points.map(p => p.health);
  
  const sumX = times.reduce((a, b) => a + b, 0);
  const sumY = healths.reduce((a, b) => a + b, 0);
  const sumXY = times.reduce((sum, x, i) => sum + x * healths[i], 0);
  const sumXX = times.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  return isNaN(slope) ? 0 : slope;
}

/**
 * Analyze health trends for a module
 */
async function analyzeModuleTrend(module: SubstrateModule): Promise<HealthTrend> {
  const history = await getHealthHistory(module, 24);
  
  // Get current health from recent events instead of core_state
  const { data: recentEvents } = await supabase
    .from('brain_events')
    .select('data')
    .eq('module', module)
    .order('created_at', { ascending: false })
    .limit(1);
  
  const currentHealth = (recentEvents?.[0]?.data as BrainEventData)?.health_score ?? 100;
  
  if (history.length < 3) {
    return {
      module,
      currentHealth,
      trend: 'stable',
      trendSlope: 0,
      predictedHealth: currentHealth,
      timeToIssue: null,
      recommendation: 'Insufficient data for trend analysis',
    };
  }
  
  const slope = calculateTrendSlope(history);
  
  // Predict health in 6 hours
  const predictedHealth = Math.max(0, Math.min(100, currentHealth + slope * 6));
  
  // Determine trend category
  let trend: HealthTrend['trend'];
  if (slope > 0.5) trend = 'improving';
  else if (slope < -2) trend = 'critical';
  else if (slope < -0.5) trend = 'degrading';
  else trend = 'stable';
  
  // Calculate time to issue (health < 50)
  let timeToIssue: number | null = null;
  if (slope < 0 && currentHealth > 50) {
    timeToIssue = Math.ceil((currentHealth - 50) / Math.abs(slope) * 10); // in minutes
  }
  
  // Generate recommendation
  let recommendation: string;
  switch (trend) {
    case 'critical':
      recommendation = `Immediate attention required. Health dropping rapidly.`;
      break;
    case 'degrading':
      recommendation = `Schedule preventive healing. Trend indicates potential issues.`;
      break;
    case 'improving':
      recommendation = `Health recovering. Continue monitoring.`;
      break;
    default:
      recommendation = `Module stable. No action needed.`;
  }
  
  return {
    module,
    currentHealth,
    trend,
    trendSlope: slope,
    predictedHealth,
    timeToIssue,
    recommendation,
  };
}

/**
 * Run full predictive analysis across all modules.
 * Batches in groups of 6 to avoid DB connection storms.
 */
export async function runPredictiveAnalysis(): Promise<PredictiveAnalysis> {
  const BATCH_SIZE = 6;
  const trends: HealthTrend[] = [];
  for (let i = 0; i < MODULES.length; i += BATCH_SIZE) {
    const batch = MODULES.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(analyzeModuleTrend));
    trends.push(...results);
  }
  
  const overallHealth = trends.reduce((sum, t) => sum + t.currentHealth, 0) / trends.length;
  
  // Identify predicted issues
  const predictedIssues = trends
    .filter(t => t.trend === 'degrading' || t.trend === 'critical')
    .map(t => ({
      module: t.module,
      issue: t.trend === 'critical' ? 'Rapid health degradation' : 'Gradual health decline',
      probability: t.trend === 'critical' ? 0.85 : 0.6,
      eta: t.timeToIssue || 60,
    }));
  
  // Generate recommended actions
  const recommendedActions: HealingAction[] = [];
  
  for (const trend of trends) {
    if (trend.trend === 'critical') {
      recommendedActions.push({
        id: `heal-${trend.module}-${Date.now()}`,
        module: trend.module,
        type: 'reactive',
        action: 'immediate_heal',
        priority: 'critical',
        scheduledFor: new Date().toISOString(),
        status: 'pending',
      });
    } else if (trend.trend === 'degrading' && trend.timeToIssue && trend.timeToIssue < 120) {
      recommendedActions.push({
        id: `heal-${trend.module}-${Date.now()}`,
        module: trend.module,
        type: 'preventive',
        action: 'scheduled_heal',
        priority: 'high',
        scheduledFor: new Date(Date.now() + 30 * 60000).toISOString(),
        status: 'pending',
      });
    }
  }
  
  return {
    overallHealth,
    trends,
    predictedIssues,
    recommendedActions,
  };
}

/**
 * Schedule preventive healing based on predictions
 */
export async function schedulePreventiveHealing(
  module: SubstrateModule,
  delayMinutes: number = 30
): Promise<HealingAction | null> {
  try {
    const action: HealingAction = {
      id: `preventive-${module}-${Date.now()}`,
      module,
      type: 'preventive',
      action: 'heal',
      priority: 'medium',
      scheduledFor: new Date(Date.now() + delayMinutes * 60000).toISOString(),
      status: 'pending',
    };
    
    // Queue the healing action
    await supabase.from('brain_actions_queue').insert([{
      action_type: 'preventive_heal',
      payload: action as unknown as import('@/integrations/supabase/types').Json,
      priority: 5,
      scheduled_at: action.scheduledFor,
      status: 'pending',
    }]);
    
    return action;
  } catch (error) {
    console.error('Error scheduling preventive healing:', error);
    return null;
  }
}

/**
 * Execute pending healing actions
 */
export async function executePendingHealing(): Promise<{
  executed: number;
  failed: number;
  results: Array<{ module: string; success: boolean }>;
}> {
  const results: Array<{ module: string; success: boolean }> = [];
  let executed = 0;
  let failed = 0;
  
  try {
    const { data: pendingActions } = await supabase
      .from('brain_actions_queue')
      .select('*')
      .eq('action_type', 'preventive_heal')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .limit(5);
    
    if (!pendingActions) return { executed: 0, failed: 0, results: [] };
    
    for (const action of pendingActions) {
      const payload = action.payload as unknown as HealingAction;
      
      try {
        // Execute healing via substrate
        const { error } = await supabase.functions.invoke('pf-substrate', {
          body: {
            module: 'system',
            action: 'heal',
            payload: { target: payload.module },
          },
        });
        
        if (error) throw error;
        
        await supabase
          .from('brain_actions_queue')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', action.id);
        
        executed++;
        results.push({ module: payload.module, success: true });
        
      } catch (error) {
        // Increment retry count; mark failed after 3 attempts
        const retries = ((action as any).retry_count ?? 0) + 1;
        await supabase
          .from('brain_actions_queue')
          .update({
            status: retries >= 3 ? 'failed' : 'pending',
            retry_count: retries,
          })
          .eq('id', action.id);
        
        failed++;
        results.push({ module: payload.module, success: false });
      }
    }
  } catch (error) {
    console.error('Error executing pending healing:', error);
  }
  
  return { executed, failed, results };
}

/**
 * Get predictive healing status
 */
export async function getPredictiveHealingStatus(): Promise<{
  enabled: boolean;
  lastAnalysis: string | null;
  pendingActions: number;
  completedToday: number;
  healthForecast: { module: string; predicted: number }[];
}> {
  try {
    const [analysis, pending, completed] = await Promise.all([
      runPredictiveAnalysis(),
      supabase
        .from('brain_actions_queue')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'preventive_heal')
        .eq('status', 'pending'),
      supabase
        .from('brain_actions_queue')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'preventive_heal')
        .eq('status', 'completed')
        .gte('completed_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    ]);
    
    return {
      enabled: true,
      lastAnalysis: new Date().toISOString(),
      pendingActions: (pending as { count: number | null }).count || 0,
      completedToday: (completed as { count: number | null }).count || 0,
      healthForecast: analysis.trends.map(t => ({
        module: t.module,
        predicted: t.predictedHealth,
      })),
    };
  } catch (error) {
    console.error('Error getting healing status:', error);
    return {
      enabled: false,
      lastAnalysis: null,
      pendingActions: 0,
      completedToday: 0,
      healthForecast: [],
    };
  }
}
