 /**
  * INTEGRATION Health Aggregator v9.1.0 ARCHITECT
  * Cross-integration health monitoring and aggregation
  */
 
 export type IntegrationHealth = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
 
 export interface IntegrationHealthStatus {
   adapter_id: string;
   adapter_name: string;
   health: IntegrationHealth;
   latency_ms: number;
   success_rate: number;
   last_check_at: string;
   consecutive_failures: number;
   last_error?: string;
   metadata: Record<string, unknown>;
 }
 
 export interface HealthCheckResult {
   adapter_id: string;
   success: boolean;
   latency_ms: number;
   error?: string;
   checked_at: string;
 }
 
 export interface AggregatedHealth {
   timestamp: string;
   overall_health: IntegrationHealth;
   health_score: number;
   total_integrations: number;
   healthy_count: number;
   degraded_count: number;
   unhealthy_count: number;
   unknown_count: number;
   avg_latency_ms: number;
   avg_success_rate: number;
   issues: Array<{ adapter_id: string; issue: string; severity: 'low' | 'medium' | 'high' }>;
 }
 
 export interface HealthAggregatorConfig {
   check_interval_ms: number;
   latency_threshold_ms: number;
   success_rate_threshold: number;
   consecutive_failure_threshold: number;
 }
 
 // Configuration
 let config: HealthAggregatorConfig = {
   check_interval_ms: 60000, // 1 minute
   latency_threshold_ms: 2000,
   success_rate_threshold: 0.95,
   consecutive_failure_threshold: 3,
 };
 
 // Health status per integration
 const healthStatuses = new Map<string, IntegrationHealthStatus>();
 
 // Check history for trend analysis
 const checkHistory = new Map<string, HealthCheckResult[]>();
 
 /**
  * Record a health check result
  */
 export function recordHealthCheck(result: HealthCheckResult): IntegrationHealthStatus {
   // Get or create history
   if (!checkHistory.has(result.adapter_id)) {
     checkHistory.set(result.adapter_id, []);
   }
   const history = checkHistory.get(result.adapter_id)!;
   history.push(result);
 
   // Keep last 100 checks
   if (history.length > 100) {
     history.shift();
   }
 
   // Calculate metrics
   const recentChecks = history.slice(-20);
   const successCount = recentChecks.filter(c => c.success).length;
   const successRate = successCount / recentChecks.length;
   const avgLatency = recentChecks.reduce((s, c) => s + c.latency_ms, 0) / recentChecks.length;
 
   // Count consecutive failures
   let consecutiveFailures = 0;
   for (let i = history.length - 1; i >= 0; i--) {
     if (!history[i].success) consecutiveFailures++;
     else break;
   }
 
   // Determine health status
   let health: IntegrationHealth = 'healthy';
   if (consecutiveFailures >= config.consecutive_failure_threshold) {
     health = 'unhealthy';
   } else if (successRate < config.success_rate_threshold || avgLatency > config.latency_threshold_ms) {
     health = 'degraded';
   }
 
   // Get existing or create new status
   const existing = healthStatuses.get(result.adapter_id);
   const status: IntegrationHealthStatus = {
     adapter_id: result.adapter_id,
     adapter_name: existing?.adapter_name ?? result.adapter_id,
     health,
     latency_ms: Math.round(avgLatency),
     success_rate: successRate,
     last_check_at: result.checked_at,
     consecutive_failures: consecutiveFailures,
     last_error: result.error,
     metadata: existing?.metadata ?? {},
   };
 
   healthStatuses.set(result.adapter_id, status);
   return status;
 }
 
 /**
  * Register an integration for monitoring
  */
 export function registerIntegration(
   adapterId: string,
   adapterName: string,
   metadata?: Record<string, unknown>
 ): IntegrationHealthStatus {
   const status: IntegrationHealthStatus = {
     adapter_id: adapterId,
     adapter_name: adapterName,
     health: 'unknown',
     latency_ms: 0,
     success_rate: 1,
     last_check_at: new Date().toISOString(),
     consecutive_failures: 0,
     metadata: metadata ?? {},
   };
 
   healthStatuses.set(adapterId, status);
   return status;
 }
 
 /**
  * Get health status for an integration
  */
 export function getIntegrationHealth(adapterId: string): IntegrationHealthStatus | undefined {
   return healthStatuses.get(adapterId);
 }
 
 /**
  * Get all integration health statuses
  */
 export function getAllHealthStatuses(): IntegrationHealthStatus[] {
   return Array.from(healthStatuses.values());
 }
 
 /**
  * Get aggregated health across all integrations
  */
 export function getAggregatedHealth(): AggregatedHealth {
   const statuses = Array.from(healthStatuses.values());
   const issues: AggregatedHealth['issues'] = [];
 
   let healthyCount = 0;
   let degradedCount = 0;
   let unhealthyCount = 0;
   let unknownCount = 0;
   let totalLatency = 0;
   let totalSuccessRate = 0;
 
   for (const status of statuses) {
     switch (status.health) {
       case 'healthy': healthyCount++; break;
       case 'degraded': 
         degradedCount++; 
         issues.push({
           adapter_id: status.adapter_id,
           issue: `Degraded performance: ${status.latency_ms}ms latency, ${(status.success_rate * 100).toFixed(0)}% success`,
           severity: 'medium',
         });
         break;
       case 'unhealthy': 
         unhealthyCount++; 
         issues.push({
           adapter_id: status.adapter_id,
           issue: status.last_error ?? `${status.consecutive_failures} consecutive failures`,
           severity: 'high',
         });
         break;
       case 'unknown': unknownCount++; break;
     }
 
     totalLatency += status.latency_ms;
     totalSuccessRate += status.success_rate;
   }
 
   // Calculate overall health
   let overallHealth: IntegrationHealth = 'healthy';
   if (unhealthyCount > 0 || (statuses.length > 0 && unhealthyCount / statuses.length > 0.2)) {
     overallHealth = 'unhealthy';
   } else if (degradedCount > 0 || unknownCount > statuses.length / 2) {
     overallHealth = 'degraded';
   }
 
   // Calculate health score
   const healthScore = statuses.length > 0
     ? Math.round((healthyCount * 100 + degradedCount * 50) / statuses.length)
     : 100;
 
   return {
     timestamp: new Date().toISOString(),
     overall_health: overallHealth,
     health_score: healthScore,
     total_integrations: statuses.length,
     healthy_count: healthyCount,
     degraded_count: degradedCount,
     unhealthy_count: unhealthyCount,
     unknown_count: unknownCount,
     avg_latency_ms: statuses.length > 0 ? Math.round(totalLatency / statuses.length) : 0,
     avg_success_rate: statuses.length > 0 ? totalSuccessRate / statuses.length : 1,
     issues,
   };
 }
 
 /**
  * Get health trend for an integration
  */
 export function getHealthTrend(adapterId: string, samples?: number): {
   latency_trend: 'improving' | 'stable' | 'degrading';
   success_trend: 'improving' | 'stable' | 'degrading';
   recent_checks: HealthCheckResult[];
 } {
   const history = checkHistory.get(adapterId) ?? [];
   const count = samples ?? 20;
   const recentChecks = history.slice(-count);
 
   if (recentChecks.length < 4) {
     return { latency_trend: 'stable', success_trend: 'stable', recent_checks: recentChecks };
   }
 
   const mid = Math.floor(recentChecks.length / 2);
   const firstHalf = recentChecks.slice(0, mid);
   const secondHalf = recentChecks.slice(mid);
 
   // Latency trend
   const firstLatency = firstHalf.reduce((s, c) => s + c.latency_ms, 0) / firstHalf.length;
   const secondLatency = secondHalf.reduce((s, c) => s + c.latency_ms, 0) / secondHalf.length;
   let latencyTrend: 'improving' | 'stable' | 'degrading' = 'stable';
   if (secondLatency < firstLatency * 0.8) latencyTrend = 'improving';
   else if (secondLatency > firstLatency * 1.2) latencyTrend = 'degrading';
 
   // Success trend
   const firstSuccess = firstHalf.filter(c => c.success).length / firstHalf.length;
   const secondSuccess = secondHalf.filter(c => c.success).length / secondHalf.length;
   let successTrend: 'improving' | 'stable' | 'degrading' = 'stable';
   if (secondSuccess > firstSuccess + 0.1) successTrend = 'improving';
   else if (secondSuccess < firstSuccess - 0.1) successTrend = 'degrading';
 
   return { latency_trend: latencyTrend, success_trend: successTrend, recent_checks: recentChecks };
 }
 
 /**
  * Update aggregator configuration
  */
 export function updateAggregatorConfig(updates: Partial<HealthAggregatorConfig>): HealthAggregatorConfig {
   config = { ...config, ...updates };
   return { ...config };
 }
 
 /**
  * Get aggregator configuration
  */
 export function getAggregatorConfig(): HealthAggregatorConfig {
   return { ...config };
 }
 
 /**
  * Clear all health data
  */
 export function clearHealthData(): void {
   healthStatuses.clear();
   checkHistory.clear();
 }
 
 /**
  * Remove integration from monitoring
  */
 export function unregisterIntegration(adapterId: string): boolean {
   const removed = healthStatuses.delete(adapterId);
   checkHistory.delete(adapterId);
   return removed;
 }