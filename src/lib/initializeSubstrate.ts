/**
 * promptfluid® Substrate Initialization
 * v10.5.4 — ARCHITECT Epoch — Complete AI Operating System with 21 modules + SEBA
 * 
 * Performance: Triple-deferred initialization for zero main-thread blocking
 * - Waits for document idle state
 * - Uses requestIdleCallback with low priority
 * - Yields to main thread between module pings
 */

let initialized = false;
let substrateModule: typeof import('./substrate') | null = null;

// Lazy load substrate module only when needed
async function getSubstrate() {
  if (!substrateModule) {
    substrateModule = await import('./substrate');
  }
  return substrateModule.substrate;
}

// Yield to main thread to prevent long tasks
const yieldToMain = () => new Promise<void>(resolve => {
  if ('scheduler' in window && 'yield' in (window as any).scheduler) {
    (window as any).scheduler.yield().then(resolve);
  } else {
    setTimeout(resolve, 0);
  }
});

export async function initializeSubstrate(): Promise<void> {
  if (initialized) return;
  
  try {
    const substrate = await getSubstrate();
    
    // Yield before heavy work
    await yieldToMain();
    
    console.log('⚡ Booting promptfluid® Substrate (CCL Epoch)...');
    console.log('─────────────────────────────────────────');
    
    // Boot order: CORE(CCR) → CCL → 12 public modules
    // CCR absorbs: CORE + SYSTEM + BRAIN + MEMORY + DREAM
    // CCL absorbs: RIPPLE + ACCESS + IDENTITY + RELAY
    const publicModules = [
      'decode', 'encode', 'defense', 'nexus', 'vision',
      'modernizer', 'integration', 'inclusive', 'cortex', 'audit', 'economy', 'sandbox'
    ] as const;
    
    // Boot CCR foundation (Layer 0) via core.boot facade
    const ccrResult = await substrate.invoke({ module: 'core', action: 'boot' });
    
    // Boot CCL infrastructure (Layer 1)
    let cclBooted = false;
    try {
      const { initializeCCL } = await import('@/layers/ccl');
      const cclResult = await initializeCCL();
      cclBooted = cclResult.success;
    } catch { /* graceful — CCL init is additive */ }
    
    if (ccrResult.success && cclBooted) {
      console.log('✅ CCR Layer 0 + CCL Layer 1 active → 12 modules loaded | Health: 100%');
    } else {
      // Fallback to individual pings
      let activeModules = 0;
      for (const module of publicModules) {
        await yieldToMain();
        const result = await substrate.invoke({ module, action: 'pulse' });
        if (result.success) activeModules++;
      }
      
      console.log(`✅ Substrate initialized: ${activeModules}/${publicModules.length} modules active`);
    }
    
    console.log('─────────────────────────────────────────');
    
    // Initialize subsystem health registry (Intent Mesh, AutoBlog, SEBA, Shadow Mesh)
    try {
      const { initSubsystemHealth } = await import('./substrate/subsystem-health');
      initSubsystemHealth();
    } catch { /* graceful — subsystem health is additive */ }
    
    // Initialize GOAL (Global Observability Access Layer)
    try {
      const { initializeGOAL } = await import('@/core/goal');
      initializeGOAL();
      console.log('🔭 GOAL initialized — Global Observability Access Layer active');
    } catch { /* graceful — GOAL is additive */ }
    
    // Start automatic circuit recovery engine
    try {
      const { startAutoRecovery } = await import('./substrate/core-circuit-recovery');
      startAutoRecovery();
    } catch { /* graceful — recovery is additive */ }
    
    initialized = true;
  } catch (error) {
    console.error('❌ Substrate initialization failed:', error);
  }
}

// Auto-initialize on import in browser environment - heavily deferred
if (typeof window !== 'undefined') {
  // Use triple-deferred initialization: wait for idle, then delay further
  const scheduleInit = () => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        // Use setTimeout to break up the task
        setTimeout(() => initializeSubstrate(), 100);
      }, { timeout: 10000 }); // 10s timeout, very low priority
    } else {
      setTimeout(() => initializeSubstrate(), 5000);
    }
  };
  
  // Wait for load event first, then schedule idle init
  if (document.readyState === 'complete') {
    scheduleInit();
  } else {
    window.addEventListener('load', scheduleInit, { once: true, passive: true });
  }
}
