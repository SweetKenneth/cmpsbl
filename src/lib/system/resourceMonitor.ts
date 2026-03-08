/**
 * SYSTEM Resource Monitor
 * Real-time resource tracking and alerts
 */
 
 // Resource metrics
 export interface ResourceMetrics {
   timestamp: string;
   memory: MemoryMetrics;
   performance: PerformanceMetrics;
   network: NetworkMetrics;
   storage: StorageMetrics;
 }
 
 export interface MemoryMetrics {
   used_mb: number;
   total_mb: number;
   percent_used: number;
   heap_size_mb?: number;
 }
 
 export interface PerformanceMetrics {
   fps: number;
   dom_nodes: number;
   js_heap_size_mb?: number;
   event_listeners: number;
 }
 
 export interface NetworkMetrics {
   requests_per_minute: number;
   avg_latency_ms: number;
   failed_requests: number;
   bandwidth_kb: number;
 }
 
 export interface StorageMetrics {
   local_storage_kb: number;
   session_storage_kb: number;
   indexed_db_mb?: number;
   cache_size_mb?: number;
 }
 
 export interface ResourceAlert {
   type: 'memory' | 'performance' | 'network' | 'storage';
   severity: 'warning' | 'critical';
   message: string;
   value: number;
   threshold: number;
   triggered_at: string;
 }
 
 // Thresholds
 const THRESHOLDS = {
   memory_warning_percent: 70,
   memory_critical_percent: 90,
   fps_warning: 30,
   fps_critical: 15,
   dom_nodes_warning: 1500,
   dom_nodes_critical: 3000,
   latency_warning_ms: 500,
   latency_critical_ms: 2000,
   storage_warning_mb: 4,
   storage_critical_mb: 8,
 };
 
 // Metrics history
 const metricsHistory: ResourceMetrics[] = [];
 const MAX_HISTORY = 60; // Keep 60 samples
 
 // Network request tracking
 let requestCount = 0;
 let totalLatency = 0;
 let failedRequests = 0;
 let lastMinuteStart = Date.now();
 
 /**
  * Collect current resource metrics
  */
 export function collectMetrics(): ResourceMetrics {
   const metrics: ResourceMetrics = {
     timestamp: new Date().toISOString(),
     memory: getMemoryMetrics(),
     performance: getPerformanceMetrics(),
     network: getNetworkMetrics(),
     storage: getStorageMetrics(),
   };
   
   // Add to history — splice instead of shift() for O(1) amortized
   metricsHistory.push(metrics);
   if (metricsHistory.length > MAX_HISTORY * 2) {
     metricsHistory.splice(0, metricsHistory.length - MAX_HISTORY);
   }
   
   return metrics;
 }
 
 /**
  * Get memory metrics
  */
 function getMemoryMetrics(): MemoryMetrics {
   if (typeof performance !== 'undefined' && 'memory' in performance) {
     const memory = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
     const usedMb = memory.usedJSHeapSize / (1024 * 1024);
     const totalMb = memory.totalJSHeapSize / (1024 * 1024);
     
     return {
       used_mb: Math.round(usedMb * 10) / 10,
       total_mb: Math.round(totalMb * 10) / 10,
       percent_used: Math.round((usedMb / totalMb) * 100),
       heap_size_mb: Math.round(usedMb * 10) / 10,
     };
   }
   
   // Fallback estimate
   return {
     used_mb: 50,
     total_mb: 512,
     percent_used: 10,
   };
 }
 
 /**
  * Get performance metrics
  */
 function getPerformanceMetrics(): PerformanceMetrics {
   let fps = 60; // Default
   let domNodes = 0;
   let eventListeners = 0;
   
   if (typeof document !== 'undefined') {
     domNodes = document.querySelectorAll('*').length;
     
     // Estimate event listeners (rough)
     const elements = document.querySelectorAll('*');
     eventListeners = elements.length; // Rough estimate
   }
   
   return {
     fps,
     dom_nodes: domNodes,
     event_listeners: eventListeners,
   };
 }
 
 /**
  * Get network metrics
  */
 function getNetworkMetrics(): NetworkMetrics {
   const now = Date.now();
   const elapsed = (now - lastMinuteStart) / 1000;
   
   // Reset counter every minute
   if (elapsed >= 60) {
     lastMinuteStart = now;
     requestCount = 0;
     totalLatency = 0;
     failedRequests = 0;
   }
   
   return {
     requests_per_minute: Math.round(requestCount * (60 / Math.max(1, elapsed))),
     avg_latency_ms: requestCount > 0 ? Math.round(totalLatency / requestCount) : 0,
     failed_requests: failedRequests,
     bandwidth_kb: 0, // Would need performance observer
   };
 }
 
 /**
  * Get storage metrics
  */
 function getStorageMetrics(): StorageMetrics {
   let localStorageKb = 0;
   let sessionStorageKb = 0;
   
   if (typeof localStorage !== 'undefined') {
     try {
       for (const key of Object.keys(localStorage)) {
         localStorageKb += (localStorage.getItem(key)?.length || 0) / 1024;
       }
     } catch {
       // Storage access denied
     }
   }
   
   if (typeof sessionStorage !== 'undefined') {
     try {
       for (const key of Object.keys(sessionStorage)) {
         sessionStorageKb += (sessionStorage.getItem(key)?.length || 0) / 1024;
       }
     } catch {
       // Storage access denied
     }
   }
   
   return {
     local_storage_kb: Math.round(localStorageKb * 10) / 10,
     session_storage_kb: Math.round(sessionStorageKb * 10) / 10,
   };
 }
 
 /**
  * Record a network request
  */
 export function recordRequest(latencyMs: number, success: boolean): void {
   requestCount++;
   totalLatency += latencyMs;
   if (!success) failedRequests++;
 }
 
 /**
  * Check for resource alerts
  */
 export function checkAlerts(): ResourceAlert[] {
   const metrics = collectMetrics();
   const alerts: ResourceAlert[] = [];
   
   // Memory alerts
   if (metrics.memory.percent_used >= THRESHOLDS.memory_critical_percent) {
     alerts.push({
       type: 'memory',
       severity: 'critical',
       message: `Memory usage critical: ${metrics.memory.percent_used}%`,
       value: metrics.memory.percent_used,
       threshold: THRESHOLDS.memory_critical_percent,
       triggered_at: metrics.timestamp,
     });
   } else if (metrics.memory.percent_used >= THRESHOLDS.memory_warning_percent) {
     alerts.push({
       type: 'memory',
       severity: 'warning',
       message: `Memory usage high: ${metrics.memory.percent_used}%`,
       value: metrics.memory.percent_used,
       threshold: THRESHOLDS.memory_warning_percent,
       triggered_at: metrics.timestamp,
     });
   }
   
   // DOM node alerts
   if (metrics.performance.dom_nodes >= THRESHOLDS.dom_nodes_critical) {
     alerts.push({
       type: 'performance',
       severity: 'critical',
       message: `Excessive DOM nodes: ${metrics.performance.dom_nodes}`,
       value: metrics.performance.dom_nodes,
       threshold: THRESHOLDS.dom_nodes_critical,
       triggered_at: metrics.timestamp,
     });
   } else if (metrics.performance.dom_nodes >= THRESHOLDS.dom_nodes_warning) {
     alerts.push({
       type: 'performance',
       severity: 'warning',
       message: `High DOM node count: ${metrics.performance.dom_nodes}`,
       value: metrics.performance.dom_nodes,
       threshold: THRESHOLDS.dom_nodes_warning,
       triggered_at: metrics.timestamp,
     });
   }
   
   // Latency alerts
   if (metrics.network.avg_latency_ms >= THRESHOLDS.latency_critical_ms) {
     alerts.push({
       type: 'network',
       severity: 'critical',
       message: `Network latency critical: ${metrics.network.avg_latency_ms}ms`,
       value: metrics.network.avg_latency_ms,
       threshold: THRESHOLDS.latency_critical_ms,
       triggered_at: metrics.timestamp,
     });
   } else if (metrics.network.avg_latency_ms >= THRESHOLDS.latency_warning_ms) {
     alerts.push({
       type: 'network',
       severity: 'warning',
       message: `Network latency high: ${metrics.network.avg_latency_ms}ms`,
       value: metrics.network.avg_latency_ms,
       threshold: THRESHOLDS.latency_warning_ms,
       triggered_at: metrics.timestamp,
     });
   }
   
   return alerts;
 }
 
 /**
  * Get metrics history
  */
 export function getMetricsHistory(count?: number): ResourceMetrics[] {
   return metricsHistory.slice(-(count || MAX_HISTORY));
 }
 
 /**
  * Get aggregated metrics summary
  */
 export function getMetricsSummary(): {
   avg_memory_percent: number;
   avg_fps: number;
   avg_latency_ms: number;
   peak_dom_nodes: number;
   total_requests: number;
   error_rate_percent: number;
 } {
   if (metricsHistory.length === 0) {
     return {
       avg_memory_percent: 0,
       avg_fps: 60,
       avg_latency_ms: 0,
       peak_dom_nodes: 0,
       total_requests: 0,
       error_rate_percent: 0,
     };
   }
   
   let totalMemory = 0;
   let totalFps = 0;
   let totalLatency = 0;
   let peakDomNodes = 0;
   let totalReqs = 0;
   let totalErrors = 0;
   
   for (const m of metricsHistory) {
     totalMemory += m.memory.percent_used;
     totalFps += m.performance.fps;
     totalLatency += m.network.avg_latency_ms;
     peakDomNodes = Math.max(peakDomNodes, m.performance.dom_nodes);
     totalReqs += m.network.requests_per_minute;
     totalErrors += m.network.failed_requests;
   }
   
   const count = metricsHistory.length;
   
   return {
     avg_memory_percent: Math.round(totalMemory / count),
     avg_fps: Math.round(totalFps / count),
     avg_latency_ms: Math.round(totalLatency / count),
     peak_dom_nodes: peakDomNodes,
     total_requests: totalReqs,
     error_rate_percent: totalReqs > 0 ? Math.round((totalErrors / totalReqs) * 100) : 0,
   };
 }