/**
 * CMPSBL® DREAM Scheduler
 * Schedule dream cycles during low-activity periods
 */

import { supabase } from '@/integrations/supabase/client';

export interface DreamSchedule {
  id: string;
  scheduledFor: string;
  type: 'consolidation' | 'mutation' | 'reflection' | 'synthesis';
  priority: number;
  status: 'pending' | 'running' | 'completed' | 'skipped';
  systemLoadThreshold: number;
}

export interface SystemLoadMetrics {
  activeRequests: number;
  avgResponseTime: number;
  memoryPressure: number;
  cpuLoad: number;
  isLowActivity: boolean;
}

/**
 * Get current system load metrics
 */
export async function getSystemLoad(): Promise<SystemLoadMetrics> {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    
    // Parallel fetch all 3 queries
    const [requestResult, usageResult, hotResult] = await Promise.all([
      supabase
        .from('brain_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneHourAgo.toISOString()),
      supabase
        .from('ai_usage_log')
        .select('response_time_ms')
        .gte('created_at', oneHourAgo.toISOString())
        .limit(100),
      supabase
        .from('brain_memory_hot')
        .select('*', { count: 'exact', head: true }),
    ]);
    
    const requestCount = requestResult.count || 0;
    
    const usageData = usageResult.data;
    const avgResponseTime = usageData?.length
      ? usageData.reduce((sum, u) => sum + (u.response_time_ms || 0), 0) / usageData.length
      : 0;
    
    const memoryPressure = Math.min(100, (hotResult.count || 0) / 50);
    
    // Calculate if it's low activity period
    const hourOfDay = now.getHours();
    const isNightTime = hourOfDay >= 2 && hourOfDay <= 6;
    const isLowRequests = requestCount < 10;
    
    return {
      activeRequests: requestCount,
      avgResponseTime,
      memoryPressure,
      cpuLoad: avgResponseTime / 10,
      isLowActivity: isNightTime || isLowRequests,
    };
  } catch (error) {
    console.error('Error getting system load:', error);
    return {
      activeRequests: 0,
      avgResponseTime: 0,
      memoryPressure: 0,
      cpuLoad: 0,
      isLowActivity: true,
    };
  }
}

/**
 * Calculate optimal dream window based on historical patterns
 */
export async function findOptimalDreamWindow(): Promise<{
  startHour: number;
  endHour: number;
  confidence: number;
  reason: string;
}> {
  try {
    const { data: events } = await supabase
      .from('brain_events')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 3600000).toISOString())
      .limit(1000);
    
    if (!events || events.length < 100) {
      // Default to night hours if insufficient data
      return {
        startHour: 2,
        endHour: 6,
        confidence: 0.5,
        reason: 'Insufficient data, using default night window',
      };
    }
    
    // Count events per hour
    const hourCounts: number[] = new Array(24).fill(0);
    events.forEach(e => {
      const hour = new Date(e.created_at).getHours();
      hourCounts[hour]++;
    });
    
    // Find the 4-hour window with lowest activity
    let minSum = Infinity;
    let bestStart = 2;
    
    for (let start = 0; start < 24; start++) {
      let sum = 0;
      for (let i = 0; i < 4; i++) {
        sum += hourCounts[(start + i) % 24];
      }
      if (sum < minSum) {
        minSum = sum;
        bestStart = start;
      }
    }
    
    const avgActivity = events.length / 24;
    const windowActivity = minSum / 4;
    const confidence = Math.min(0.95, Math.max(0.3, 1 - windowActivity / avgActivity));
    
    return {
      startHour: bestStart,
      endHour: (bestStart + 4) % 24,
      confidence,
      reason: `${(100 * (1 - windowActivity / avgActivity)).toFixed(0)}% less activity than average`,
    };
  } catch (error) {
    console.error('Error finding optimal window:', error);
    return {
      startHour: 2,
      endHour: 6,
      confidence: 0.5,
      reason: 'Error analyzing patterns, using default',
    };
  }
}

/**
 * Schedule a dream cycle
 */
export async function scheduleDreamCycle(
  type: DreamSchedule['type'],
  options?: {
    delayMinutes?: number;
    priority?: number;
    loadThreshold?: number;
  }
): Promise<DreamSchedule | null> {
  try {
    const { delayMinutes = 0, priority = 5, loadThreshold = 30 } = options || {};
    
    const scheduledFor = new Date(Date.now() + delayMinutes * 60000);
    
    const schedule: Omit<DreamSchedule, 'id'> = {
      scheduledFor: scheduledFor.toISOString(),
      type,
      priority,
      status: 'pending',
      systemLoadThreshold: loadThreshold,
    };
    
    // Store in brain_actions_queue
    const { data, error } = await supabase
      .from('brain_actions_queue')
      .insert({
        action_type: `dream_${type}`,
        payload: schedule as any,
        priority,
        scheduled_at: scheduledFor.toISOString(),
        status: 'pending',
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      ...schedule,
    };
  } catch (error) {
    console.error('Error scheduling dream:', error);
    return null;
  }
}

/**
 * Check if conditions are right for dreaming
 */
export async function shouldDreamNow(): Promise<{
  should: boolean;
  reason: string;
  metrics: SystemLoadMetrics;
}> {
  const metrics = await getSystemLoad();
  
  if (!metrics.isLowActivity) {
    return {
      should: false,
      reason: 'System is under active load',
      metrics,
    };
  }
  
  if (metrics.memoryPressure > 80) {
    return {
      should: true,
      reason: 'High memory pressure - consolidation needed',
      metrics,
    };
  }
  
  if (metrics.activeRequests < 5 && metrics.avgResponseTime < 100) {
    return {
      should: true,
      reason: 'System is idle and responsive',
      metrics,
    };
  }
  
  return {
    should: metrics.isLowActivity,
    reason: metrics.isLowActivity ? 'Low activity period detected' : 'Normal activity',
    metrics,
  };
}

/**
 * Execute pending dream cycles
 */
export async function executePendingDreams(): Promise<{
  executed: number;
  skipped: number;
  results: Array<{ type: string; success: boolean; duration: number }>;
}> {
  const results: Array<{ type: string; success: boolean; duration: number }> = [];
  let executed = 0;
  let skipped = 0;
  
  try {
    // Check if we should dream now
    const { should, reason } = await shouldDreamNow();
    
    if (!should) {
      console.log(`Dream execution skipped: ${reason}`);
      return { executed: 0, skipped: 0, results: [] };
    }
    
    // Get pending dream actions
    const { data: pendingDreams } = await supabase
      .from('brain_actions_queue')
      .select('*')
      .like('action_type', 'dream_%')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('priority', { ascending: false })
      .limit(5);
    
    if (!pendingDreams || pendingDreams.length === 0) {
      return { executed: 0, skipped: 0, results: [] };
    }
    
    for (const dream of pendingDreams) {
      const startTime = Date.now();
      
      try {
        // Mark as running
        await supabase
          .from('brain_actions_queue')
          .update({ status: 'processing' })
          .eq('id', dream.id);
        
        // Execute the dream based on type
        const dreamType = dream.action_type.replace('dream_', '');
        
        // Trigger the dream via substrate
        const { error } = await supabase.functions.invoke('pf-substrate', {
          body: { module: 'dream', action: dreamType },
        });
        
        if (error) throw error;
        
        // Mark as completed
        await supabase
          .from('brain_actions_queue')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', dream.id);
        
        executed++;
        results.push({
          type: dreamType,
          success: true,
          duration: Date.now() - startTime,
        });
        
      } catch (error) {
        console.error(`Dream execution error:`, error);
        
        // Increment retry count; fail permanently after 3 retries
        const retryCount = ((dream.payload as any)?.retry_count ?? 0) + 1;
        const newStatus = retryCount >= 3 ? 'failed' : 'pending';
        
        await supabase
          .from('brain_actions_queue')
          .update({ 
            status: newStatus,
            payload: { ...(dream.payload as any), retry_count: retryCount },
          })
          .eq('id', dream.id);
        
        skipped++;
        results.push({
          type: dream.action_type,
          success: false,
          duration: Date.now() - startTime,
        });
      }
    }
    
  } catch (error) {
    console.error('Error executing pending dreams:', error);
  }
  
  return { executed, skipped, results };
}

/**
 * Get dream schedule status
 */
export async function getDreamScheduleStatus(): Promise<{
  pending: number;
  completed: number;
  nextScheduled: string | null;
  optimalWindow: { start: number; end: number };
}> {
  try {
    // Parallelize all 4 queries
    const [pendingResult, completedResult, window, nextDreamResult] = await Promise.all([
      supabase
        .from('brain_actions_queue')
        .select('*', { count: 'exact', head: true })
        .like('action_type', 'dream_%')
        .eq('status', 'pending'),
      supabase
        .from('brain_actions_queue')
        .select('*', { count: 'exact', head: true })
        .like('action_type', 'dream_%')
        .eq('status', 'completed'),
      findOptimalDreamWindow(),
      supabase
        .from('brain_actions_queue')
        .select('scheduled_at')
        .like('action_type', 'dream_%')
        .eq('status', 'pending')
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .single(),
    ]);
    
    return {
      pending: pendingResult.count || 0,
      completed: completedResult.count || 0,
      nextScheduled: nextDreamResult.data?.scheduled_at || null,
      optimalWindow: { start: window.startHour, end: window.endHour },
    };
  } catch (error) {
    console.error('Error getting dream status:', error);
    return {
      pending: 0,
      completed: 0,
      nextScheduled: null,
      optimalWindow: { start: 2, end: 6 },
    };
  }
}
