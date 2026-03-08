 /**
  * CORE Health Aggregator
  * v7.5.0 — System-wide health monitoring and alerting
  */
 
import { SUBSTRATE_MODULES, type SubstrateModuleName } from './index';
import { clampNumber } from '@/lib/system/hardening';

 // Health metric
 export interface HealthMetric {
   module: SubstrateModuleName;
   health: number;
   status: 'healthy' | 'degraded' | 'critical' | 'offline';
   latency: number;
   errorRate: number;
   lastCheck: string;
   details?: Record<string, unknown>;
 }
 
 // System health summary
 export interface HealthSummary {
   overallHealth: number;
   status: 'healthy' | 'degraded' | 'critical';
   modulesOnline: number;
   modulesDegraded: number;
   modulesCritical: number;
   modulesOffline: number;
   alerts: HealthAlert[];
   lastUpdate: string;
 }
 
 // Health alert
 export interface HealthAlert {
   id: string;
   module: SubstrateModuleName;
   severity: 'info' | 'warning' | 'error' | 'critical';
   message: string;
   timestamp: string;
   acknowledged: boolean;
 }
 
 // Health check configuration
 export interface HealthCheckConfig {
   intervalMs: number;
   timeoutMs: number;
   degradedThreshold: number;
   criticalThreshold: number;
   alertOnDegradation: boolean;
 }
 
 // In-memory health state
 const healthMetrics = new Map<SubstrateModuleName, HealthMetric>();
 const healthAlerts: HealthAlert[] = [];
 let healthCheckInterval: ReturnType<typeof setInterval> | null = null;
 
 // Default configuration
 let config: HealthCheckConfig = {
   intervalMs: 30000,
   timeoutMs: 5000,
   degradedThreshold: 70,
   criticalThreshold: 40,
   alertOnDegradation: true,
 };
 
 /**
  * Initialize health monitoring for a module
  */
 export function initModuleHealth(module: SubstrateModuleName): void {
   healthMetrics.set(module, {
     module,
     health: 100,
     status: 'healthy',
     latency: 0,
     errorRate: 0,
     lastCheck: new Date().toISOString(),
   });
 }
 
 /**
  * Update module health metrics
  */
export function updateModuleHealth(
  module: SubstrateModuleName,
  metrics: Partial<Omit<HealthMetric, 'module'>>
): HealthMetric {
  // Input validation — reject unknown modules
  if (!SUBSTRATE_MODULES.includes(module)) {
    console.warn(`[HealthAggregator] Unknown module: ${module}`);
    return {
      module,
      health: 0,
      status: 'offline',
      latency: 0,
      errorRate: 0,
      lastCheck: new Date().toISOString(),
    };
  }

  const current = healthMetrics.get(module) || {
    module,
    health: 100,
    status: 'healthy' as const,
    latency: 0,
    errorRate: 0,
    lastCheck: new Date().toISOString(),
  };
  
  // Clamp health to [0, 100], latency to [0, 60000], errorRate to [0, 1]
  const health = clampNumber(metrics.health ?? current.health, 0, 100, current.health);
  const latency = clampNumber(metrics.latency ?? current.latency, 0, 60_000, current.latency);
  const errorRate = clampNumber(metrics.errorRate ?? current.errorRate, 0, 1, current.errorRate);
  let status: HealthMetric['status'] = 'healthy';
   
   if (health <= 0) {
     status = 'offline';
   } else if (health < config.criticalThreshold) {
     status = 'critical';
   } else if (health < config.degradedThreshold) {
     status = 'degraded';
   }
   
  const updated: HealthMetric = {
    ...current,
    ...metrics,
    // Re-apply clamped values AFTER spread to prevent raw metrics overriding clamped bounds
    health,
    latency,
    errorRate,
    status,
    lastCheck: new Date().toISOString(),
  };
   
   healthMetrics.set(module, updated);
   
   // Check for status change alerts
   if (config.alertOnDegradation && current.status !== status) {
     if (status === 'degraded' || status === 'critical' || status === 'offline') {
       createAlert(module, 
         status === 'critical' || status === 'offline' ? 'critical' : 'warning',
         `Module ${module} status changed to ${status}`
       );
     }
   }
   
   return updated;
 }
 
 /**
  * Get health metrics for a module
  */
 export function getModuleHealth(module: SubstrateModuleName): HealthMetric | null {
   return healthMetrics.get(module) || null;
 }
 
 /**
  * Get all module health metrics
  */
 export function getAllModuleHealth(): HealthMetric[] {
   return Array.from(healthMetrics.values());
 }
 
 /**
  * Get system health summary
  */
 export function getHealthSummary(): HealthSummary {
   const metrics = getAllModuleHealth();
   
   let modulesOnline = 0;
   let modulesDegraded = 0;
   let modulesCritical = 0;
   let modulesOffline = 0;
   let totalHealth = 0;
   
   for (const metric of metrics) {
     totalHealth += metric.health;
     switch (metric.status) {
       case 'healthy': modulesOnline++; break;
       case 'degraded': modulesDegraded++; break;
       case 'critical': modulesCritical++; break;
       case 'offline': modulesOffline++; break;
     }
   }
   
   const overallHealth = metrics.length > 0 ? totalHealth / metrics.length : 0;
   
   let status: HealthSummary['status'] = 'healthy';
   if (modulesCritical > 0 || modulesOffline > 0) {
     status = 'critical';
   } else if (modulesDegraded > 0) {
     status = 'degraded';
   }
   
   return {
     overallHealth,
     status,
     modulesOnline,
     modulesDegraded,
     modulesCritical,
     modulesOffline,
     alerts: healthAlerts.filter(a => !a.acknowledged),
     lastUpdate: new Date().toISOString(),
   };
 }
 
 /**
  * Create a health alert
  */
 function createAlert(
   module: SubstrateModuleName,
   severity: HealthAlert['severity'],
   message: string
 ): HealthAlert {
   const alert: HealthAlert = {
     id: `alert_${Date.now()}_${module}`,
     module,
     severity,
     message,
     timestamp: new Date().toISOString(),
     acknowledged: false,
   };
   
  healthAlerts.push(alert);
    
    // Cap alert history to prevent unbounded growth (keep newest 200)
    if (healthAlerts.length > 200) {
      healthAlerts.splice(0, healthAlerts.length - 200);
    }
   
   return alert;
 }
 
 /**
  * Acknowledge an alert
  */
 export function acknowledgeAlert(alertId: string): boolean {
   const alert = healthAlerts.find(a => a.id === alertId);
   if (alert) {
     alert.acknowledged = true;
     return true;
   }
   return false;
 }
 
 /**
  * Get health alerts
  */
 export function getHealthAlerts(options?: {
   module?: SubstrateModuleName;
   severity?: HealthAlert['severity'];
   unacknowledgedOnly?: boolean;
 }): HealthAlert[] {
   let alerts = [...healthAlerts];
   
   if (options?.module) {
     alerts = alerts.filter(a => a.module === options.module);
   }
   if (options?.severity) {
     alerts = alerts.filter(a => a.severity === options.severity);
   }
   if (options?.unacknowledgedOnly) {
     alerts = alerts.filter(a => !a.acknowledged);
   }
   
   return alerts.sort((a, b) => 
     new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
   );
 }
 
 /**
  * Start automatic health monitoring
  */
 export function startHealthMonitoring(): void {
   if (healthCheckInterval) return;
   
   // Initialize all modules
   SUBSTRATE_MODULES.forEach(initModuleHealth);
   
    healthCheckInterval = setInterval(() => {
      // Simulate health checks with mean-reverting random walk
      // Prevents unbounded drift toward 0 or 100 that causes spurious alerts
      for (const module of SUBSTRATE_MODULES) {
        const current = healthMetrics.get(module);
        if (current) {
          const meanReversion = (100 - current.health) * 0.02; // Pull toward 100
          const noise = (Math.random() - 0.5) * 5;
          const newHealth = Math.max(0, Math.min(100, current.health + meanReversion + noise));
          updateModuleHealth(module, { health: newHealth });
        }
      }
    }, config.intervalMs);
 }
 
 /**
  * Stop health monitoring
  */
 export function stopHealthMonitoring(): void {
   if (healthCheckInterval) {
     clearInterval(healthCheckInterval);
     healthCheckInterval = null;
   }
 }
 
 /**
  * Configure health monitoring
  */
 export function configureHealthMonitoring(updates: Partial<HealthCheckConfig>): HealthCheckConfig {
   config = { ...config, ...updates };
   return config;
 }
 
 /**
  * Get health monitoring configuration
  */
 export function getHealthConfig(): HealthCheckConfig {
   return { ...config };
 }