/**
 * NEXUS Budget Governance Engine
 * Real-time cost tracking and enforcement
 */
 
 import { supabase } from '@/integrations/supabase/client';
 
 // Budget configuration
 export interface BudgetConfig {
   daily_limit_cents: number;
   monthly_limit_cents: number;
   alert_threshold_percent: number;
   hard_stop_enabled: boolean;
   rollover_enabled: boolean;
   category_limits: Record<string, number>;
 }
 
 export interface BudgetStatus {
   daily_spent_cents: number;
   daily_remaining_cents: number;
   daily_percent_used: number;
   monthly_spent_cents: number;
   monthly_remaining_cents: number;
   monthly_percent_used: number;
   is_throttled: boolean;
   throttle_reason?: string;
   alerts: BudgetAlert[];
 }
 
 export interface BudgetAlert {
   type: 'warning' | 'critical' | 'exceeded';
   message: string;
   threshold_percent: number;
   triggered_at: string;
 }
 
 // Default budget configuration
 const DEFAULT_BUDGET: BudgetConfig = {
   daily_limit_cents: 1000, // $10/day
   monthly_limit_cents: 20000, // $200/month
   alert_threshold_percent: 80,
   hard_stop_enabled: true,
   rollover_enabled: false,
   category_limits: {
     text: 500,
     code: 300,
     image: 200,
     research: 100,
   },
 };
 
// In-memory budget tracking (bounded — prune old entries)
let budgetConfig = { ...DEFAULT_BUDGET };
const MAX_SPENDING_ENTRIES = 60;
const dailySpending = new Map<string, number>();
const monthlySpending = new Map<string, number>();
const alerts: BudgetAlert[] = [];
 
 /**
  * Get current budget status
  */
 export async function getBudgetStatus(): Promise<BudgetStatus> {
   const today = new Date().toISOString().split('T')[0];
   const month = today.substring(0, 7);
   
   // Fetch actual spending from database
   const { data: dailyData } = await supabase
     .from('ai_usage_log')
     .select('cost')
     .gte('created_at', `${today}T00:00:00Z`);
   
   const { data: monthlyData } = await supabase
     .from('ai_usage_log')
     .select('cost')
     .gte('created_at', `${month}-01T00:00:00Z`);
   
   const dailySpent = (dailyData || []).reduce((sum, d) => sum + (d.cost || 0) * 100, 0);
   const monthlySpent = (monthlyData || []).reduce((sum, d) => sum + (d.cost || 0) * 100, 0);
   
   const dailyRemaining = Math.max(0, budgetConfig.daily_limit_cents - dailySpent);
   const monthlyRemaining = Math.max(0, budgetConfig.monthly_limit_cents - monthlySpent);
   
   const dailyPercent = (dailySpent / budgetConfig.daily_limit_cents) * 100;
   const monthlyPercent = (monthlySpent / budgetConfig.monthly_limit_cents) * 100;
   
   // Check for throttling
   let isThrottled = false;
   let throttleReason: string | undefined;
   
   if (budgetConfig.hard_stop_enabled) {
     if (dailySpent >= budgetConfig.daily_limit_cents) {
       isThrottled = true;
       throttleReason = 'Daily budget exhausted';
     } else if (monthlySpent >= budgetConfig.monthly_limit_cents) {
       isThrottled = true;
       throttleReason = 'Monthly budget exhausted';
     }
   }
   
   // Generate alerts
   const currentAlerts: BudgetAlert[] = [];
   
   if (dailyPercent >= 100) {
     currentAlerts.push({
       type: 'exceeded',
       message: 'Daily budget exceeded',
       threshold_percent: 100,
       triggered_at: new Date().toISOString(),
     });
   } else if (dailyPercent >= budgetConfig.alert_threshold_percent) {
     currentAlerts.push({
       type: dailyPercent >= 95 ? 'critical' : 'warning',
       message: `Daily budget at ${dailyPercent.toFixed(0)}%`,
       threshold_percent: dailyPercent,
       triggered_at: new Date().toISOString(),
     });
   }
   
   return {
     daily_spent_cents: Math.round(dailySpent),
     daily_remaining_cents: Math.round(dailyRemaining),
     daily_percent_used: Math.round(dailyPercent * 10) / 10,
     monthly_spent_cents: Math.round(monthlySpent),
     monthly_remaining_cents: Math.round(monthlyRemaining),
     monthly_percent_used: Math.round(monthlyPercent * 10) / 10,
     is_throttled: isThrottled,
     throttle_reason: throttleReason,
     alerts: currentAlerts,
   };
 }
 
 /**
  * Check if a request is allowed within budget
  */
  export async function canSpend(estimatedCostCents: number, category?: string): Promise<{
   allowed: boolean;
   reason?: string;
   remaining_daily: number;
   remaining_category?: number;
 }> {
   // Use in-memory tracker for fast pre-flight checks (avoid DB round-trip per request)
   const today = new Date().toISOString().split('T')[0];
   const month = today.substring(0, 7);
   const dailySpent = dailySpending.get(today) || 0;
   const monthlySpent = monthlySpending.get(month) || 0;
   const dailyRemaining = Math.max(0, budgetConfig.daily_limit_cents - dailySpent);
   const monthlyRemaining = Math.max(0, budgetConfig.monthly_limit_cents - monthlySpent);
   
   // Check hard stop
   if (budgetConfig.hard_stop_enabled) {
     if (dailySpent >= budgetConfig.daily_limit_cents) {
       return { allowed: false, reason: 'Daily budget exhausted', remaining_daily: 0 };
     }
     if (monthlySpent >= budgetConfig.monthly_limit_cents) {
       return { allowed: false, reason: 'Monthly budget exhausted', remaining_daily: dailyRemaining };
     }
   }
   
   // Check if this spend would exceed daily limit
   if (estimatedCostCents > dailyRemaining) {
     return {
       allowed: false,
       reason: `Insufficient daily budget (need ${estimatedCostCents}¢, have ${dailyRemaining}¢)`,
       remaining_daily: dailyRemaining,
     };
   }
   
   // Check category limit
   if (category && budgetConfig.category_limits[category]) {
     const categoryLimit = budgetConfig.category_limits[category];
     const categoryKey = `${new Date().toISOString().split('T')[0]}_${category}`;
     const categorySpent = dailySpending.get(categoryKey) || 0;
     const categoryRemaining = categoryLimit - categorySpent;
     
     if (estimatedCostCents > categoryRemaining) {
       return {
         allowed: false,
         reason: `Category ${category} budget exhausted`,
         remaining_daily: status.daily_remaining_cents,
         remaining_category: categoryRemaining,
       };
     }
   }
   
   return {
     allowed: true,
     remaining_daily: status.daily_remaining_cents - estimatedCostCents,
   };
 }
 
 /**
  * Record a spend
  */
export function recordSpend(costCents: number, category?: string): void {
  const today = new Date().toISOString().split('T')[0];
  const month = today.substring(0, 7);
  
  // Update daily tracking
  const currentDaily = dailySpending.get(today) || 0;
  dailySpending.set(today, currentDaily + costCents);
  
  // Update monthly tracking
  const currentMonthly = monthlySpending.get(month) || 0;
  monthlySpending.set(month, currentMonthly + costCents);
  
  // Update category tracking
  if (category) {
    const categoryKey = `${today}_${category}`;
    const currentCategory = dailySpending.get(categoryKey) || 0;
    dailySpending.set(categoryKey, currentCategory + costCents);
  }

  // Prune old entries to prevent unbounded growth
  pruneMap(dailySpending, MAX_SPENDING_ENTRIES);
  pruneMap(monthlySpending, MAX_SPENDING_ENTRIES);
}

function pruneMap(map: Map<string, number>, maxEntries: number): void {
  if (map.size <= maxEntries) return;
  const sorted = [...map.keys()].sort();
  const toRemove = sorted.slice(0, map.size - maxEntries);
  toRemove.forEach(k => map.delete(k));
}
 
 /**
  * Update budget configuration
  */
 export function updateBudgetConfig(updates: Partial<BudgetConfig>): BudgetConfig {
   budgetConfig = { ...budgetConfig, ...updates };
   return budgetConfig;
 }
 
 /**
  * Get current budget configuration
  */
 export function getBudgetConfig(): BudgetConfig {
   return { ...budgetConfig };
 }
 
 /**
  * Reset daily spending (for testing or admin override)
  */
 export function resetDailySpending(): void {
   const today = new Date().toISOString().split('T')[0];
   
   // Clear all entries for today
   for (const key of dailySpending.keys()) {
     if (key.startsWith(today)) {
       dailySpending.delete(key);
     }
   }
 }