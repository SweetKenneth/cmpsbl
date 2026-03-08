 /**
  * Render Loop Guard
  * v1.0.0 — Dev-only utility to detect excessive re-renders
  * 
  * Warns when components re-render excessively, helping identify
  * infinite loops or performance issues without crashing the app.
  */
 
 const renderCounts = new Map<string, { count: number; lastReset: number }>();
 const MAX_TRACKED_COMPONENTS = 200;
 const THRESHOLD = 50; // Warn after this many renders
 const RESET_INTERVAL_MS = 5000; // Reset counter every 5 seconds
 
 /**
  * Track component renders and warn if excessive
  * Use in development only - stripped in production builds
  */
 export function useRenderGuard(componentName: string): void {
   if (import.meta.env.PROD) return;
   
   const now = Date.now();
   const entry = renderCounts.get(componentName);
   
   if (!entry || now - entry.lastReset > RESET_INTERVAL_MS) {
     renderCounts.set(componentName, { count: 1, lastReset: now });
     return;
   }
   
   entry.count++;
   
   if (entry.count === THRESHOLD) {
     console.warn(
       `[RenderGuard] ⚠️ ${componentName} rendered ${THRESHOLD} times in ${RESET_INTERVAL_MS / 1000}s. ` +
       `This may indicate a render loop. Check useEffect dependencies and state updates.`
     );
   } else if (entry.count === THRESHOLD * 2) {
     console.error(
       `[RenderGuard] 🚨 ${componentName} rendered ${THRESHOLD * 2} times! ` +
       `Likely infinite render loop detected. Investigate immediately.`
     );
   }
 }
 
 /**
  * Reset all render counters (useful for route changes)
  */
 export function resetRenderGuards(): void {
   renderCounts.clear();
 }
 
 /**
  * Get current render stats for debugging
  */
 export function getRenderStats(): Record<string, number> {
   const stats: Record<string, number> = {};
   for (const [name, entry] of renderCounts.entries()) {
     stats[name] = entry.count;
   }
   return stats;
 }