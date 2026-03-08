/**
 * SYSTEM Performance Profiler v9.1.0 ARCHITECT
 * Deep performance analysis and optimization recommendations
 */
 
 export type ProfileCategory = 'render' | 'network' | 'memory' | 'cpu' | 'storage';
 export type ProfileSeverity = 'info' | 'warning' | 'critical';
 
 export interface PerformanceIssue {
   id: string;
   category: ProfileCategory;
   severity: ProfileSeverity;
   title: string;
   description: string;
   impact_score: number;
   recommendations: string[];
   detected_at: string;
   context: Record<string, unknown>;
 }
 
 export interface ProfileResult {
   duration_ms: number;
   issues: PerformanceIssue[];
   metrics: {
     render_time_ms: number;
     dom_nodes: number;
     memory_used_mb: number;
     network_requests: number;
     storage_used_mb: number;
   };
   score: number;
   grade: 'A' | 'B' | 'C' | 'D' | 'F';
 }
 
 export interface ProfilerConfig {
   render_time_threshold_ms: number;
   dom_node_threshold: number;
   memory_threshold_mb: number;
   request_threshold: number;
 }
 
 // Configuration
 let config: ProfilerConfig = {
   render_time_threshold_ms: 100,
   dom_node_threshold: 1500,
   memory_threshold_mb: 100,
   request_threshold: 50,
 };
 
 // Historical profiles
 const profileHistory: ProfileResult[] = [];
 
 /**
  * Generate issue ID
  */
 function generateIssueId(): string {
   return `issue_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
 }
 
 /**
  * Run comprehensive performance profile
  */
 export async function runProfile(): Promise<ProfileResult> {
   const startTime = performance.now();
   const issues: PerformanceIssue[] = [];
 
   // Collect metrics
   const metrics = {
     render_time_ms: 0,
     dom_nodes: 0,
     memory_used_mb: 0,
     network_requests: 0,
     storage_used_mb: 0,
   };
 
   // DOM analysis
   if (typeof document !== 'undefined') {
     const allElements = document.querySelectorAll('*');
     metrics.dom_nodes = allElements.length;
 
     if (metrics.dom_nodes > config.dom_node_threshold) {
       issues.push({
         id: generateIssueId(),
         category: 'render',
         severity: metrics.dom_nodes > config.dom_node_threshold * 2 ? 'critical' : 'warning',
         title: 'Excessive DOM nodes',
         description: `${metrics.dom_nodes} DOM nodes detected (threshold: ${config.dom_node_threshold})`,
         impact_score: Math.min(1, metrics.dom_nodes / (config.dom_node_threshold * 3)),
         recommendations: [
           'Implement virtualization for long lists',
           'Use React.memo for pure components',
           'Lazy load off-screen content',
         ],
         detected_at: new Date().toISOString(),
         context: { dom_nodes: metrics.dom_nodes, threshold: config.dom_node_threshold },
       });
     }
   }
 
   // Memory analysis (Chrome-only non-standard API)
   const perfWithMemory = performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } };
   if (typeof performance !== 'undefined' && perfWithMemory.memory) {
     const memory = perfWithMemory.memory;
     metrics.memory_used_mb = Math.round(memory.usedJSHeapSize / 1024 / 1024);
 
     if (metrics.memory_used_mb > config.memory_threshold_mb) {
       issues.push({
         id: generateIssueId(),
         category: 'memory',
         severity: metrics.memory_used_mb > config.memory_threshold_mb * 1.5 ? 'critical' : 'warning',
         title: 'High memory usage',
         description: `${metrics.memory_used_mb}MB used (threshold: ${config.memory_threshold_mb}MB)`,
         impact_score: Math.min(1, metrics.memory_used_mb / (config.memory_threshold_mb * 2)),
         recommendations: [
           'Clear unused caches',
           'Dispose of unused subscriptions',
           'Check for memory leaks in useEffect cleanup',
         ],
         detected_at: new Date().toISOString(),
         context: { memory_mb: metrics.memory_used_mb, threshold: config.memory_threshold_mb },
       });
     }
   }
 
   // Storage analysis
   if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
     try {
       const estimate = await navigator.storage.estimate();
       metrics.storage_used_mb = Math.round((estimate.usage ?? 0) / 1024 / 1024);
     } catch {
       metrics.storage_used_mb = 0;
     }
   }
 
   // Performance entry analysis
   if (typeof performance !== 'undefined') {
     const paintEntries = performance.getEntriesByType('paint');
     const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
     if (fcpEntry) {
       metrics.render_time_ms = Math.round(fcpEntry.startTime);
 
       if (metrics.render_time_ms > config.render_time_threshold_ms) {
         issues.push({
           id: generateIssueId(),
           category: 'render',
           severity: metrics.render_time_ms > config.render_time_threshold_ms * 3 ? 'critical' : 'warning',
           title: 'Slow initial render',
           description: `FCP at ${metrics.render_time_ms}ms (threshold: ${config.render_time_threshold_ms}ms)`,
           impact_score: Math.min(1, metrics.render_time_ms / (config.render_time_threshold_ms * 5)),
           recommendations: [
             'Code split large bundles',
             'Defer non-critical scripts',
             'Optimize critical rendering path',
           ],
           detected_at: new Date().toISOString(),
           context: { fcp_ms: metrics.render_time_ms, threshold: config.render_time_threshold_ms },
         });
       }
     }
 
     // Network requests
     const resourceEntries = performance.getEntriesByType('resource');
     metrics.network_requests = resourceEntries.length;
 
     if (metrics.network_requests > config.request_threshold) {
       issues.push({
         id: generateIssueId(),
         category: 'network',
         severity: 'warning',
         title: 'Many network requests',
         description: `${metrics.network_requests} requests detected (threshold: ${config.request_threshold})`,
         impact_score: Math.min(1, metrics.network_requests / (config.request_threshold * 2)),
         recommendations: [
           'Bundle small assets',
           'Use HTTP/2 multiplexing',
           'Implement request batching',
         ],
         detected_at: new Date().toISOString(),
         context: { requests: metrics.network_requests, threshold: config.request_threshold },
       });
     }
   }
 
   // Calculate overall score
   const totalImpact = issues.reduce((sum, i) => sum + i.impact_score, 0);
   const score = Math.max(0, 100 - totalImpact * 25);
 
   // Determine grade
   let grade: ProfileResult['grade'] = 'A';
   if (score < 60) grade = 'F';
   else if (score < 70) grade = 'D';
   else if (score < 80) grade = 'C';
   else if (score < 90) grade = 'B';
 
   const result: ProfileResult = {
     duration_ms: Math.round(performance.now() - startTime),
     issues,
     metrics,
     score: Math.round(score),
     grade,
   };
 
  // Store in history (batch splice instead of per-entry shift)
  profileHistory.push(result);
  if (profileHistory.length > 100) {
    profileHistory.splice(0, profileHistory.length - 50);
  }
 
   return result;
 }
 
 /**
  * Get profile history
  */
 export function getProfileHistory(limit?: number): ProfileResult[] {
   const count = limit ?? profileHistory.length;
   return profileHistory.slice(-count);
 }
 
 /**
  * Get performance trend
  */
 export function getPerformanceTrend(): {
   avg_score: number;
   trend: 'improving' | 'stable' | 'degrading';
   issue_frequency: Record<ProfileCategory, number>;
 } {
   if (profileHistory.length < 2) {
     return { avg_score: 100, trend: 'stable', issue_frequency: { render: 0, network: 0, memory: 0, cpu: 0, storage: 0 } };
   }
 
   const recent = profileHistory.slice(-10);
   const avgScore = recent.reduce((s, p) => s + p.score, 0) / recent.length;
 
   // Compare first half to second half
   const midpoint = Math.floor(recent.length / 2);
   const firstHalf = recent.slice(0, midpoint);
   const secondHalf = recent.slice(midpoint);
   const firstAvg = firstHalf.reduce((s, p) => s + p.score, 0) / firstHalf.length;
   const secondAvg = secondHalf.reduce((s, p) => s + p.score, 0) / secondHalf.length;
 
   let trend: 'improving' | 'stable' | 'degrading' = 'stable';
   if (secondAvg > firstAvg + 5) trend = 'improving';
   else if (secondAvg < firstAvg - 5) trend = 'degrading';
 
   // Count issues by category
   const issueFrequency: Record<ProfileCategory, number> = { render: 0, network: 0, memory: 0, cpu: 0, storage: 0 };
   recent.forEach(p => p.issues.forEach(i => issueFrequency[i.category]++));
 
   return {
     avg_score: Math.round(avgScore),
     trend,
     issue_frequency: issueFrequency,
   };
 }
 
 /**
  * Update profiler configuration
  */
 export function updateProfilerConfig(updates: Partial<ProfilerConfig>): ProfilerConfig {
   config = { ...config, ...updates };
   return { ...config };
 }
 
 /**
  * Get profiler configuration
  */
 export function getProfilerConfig(): ProfilerConfig {
   return { ...config };
 }
 
 /**
  * Clear profile history
  */
 export function clearProfileHistory(): void {
   profileHistory.length = 0;
 }