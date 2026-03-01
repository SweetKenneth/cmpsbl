/**
 * CMPSBL® Substrate Initialization
 * CONTRACT Epoch — Complete AI Operating System
 *
 * Architecture: CORE → CCR → OCG → 9 Modules (INTEGRATION boots last) ← 5 Mesh Overlays (DEFENSE outermost)
 *
 * Performance: Triple-deferred initialization for zero main-thread blocking
 */

let initialized = false;
let substrateModule: typeof import('./substrate') | null = null;

async function getSubstrate() {
  if (!substrateModule) {
    substrateModule = await import('./substrate');
  }
  return substrateModule.substrate;
}

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
    
    await yieldToMain();
    
    console.log('⚡ Booting CMPSBL® Substrate...');
    console.log('─────────────────────────────────────────');
    
    // Boot order: CORE → CCR → CCL → Modules → INTEGRATION (last) → Mesh Overlays activate
    const publicModules = [
      'decode', 'encode', 'vision', 'cortex', 'nexus', 'economy', 'sandbox', 'inclusive',
      'medic', 'nerve', // promoted from phantom → canonical (Wave 5)
      'integration', // boots last among modules
    ] as const;
    const meshOverlays = [
      'governance', 'intent', 'evolution', 'immunity', 'defense', // innermost → outermost
    ] as const;
    
    // 1. Boot CORE (standalone kernel)
    const coreResult = await substrate.invoke({ module: 'core', action: 'boot' });
    
    // 2. Boot CCR (Layer 0)
    let ccrBooted = false;
    try {
      const { boot } = await import('@/lib/substrate/ccr');
      const ccrResult = await boot();
      ccrBooted = ccrResult.success;
    } catch { /* graceful */ }
    
    // 3. Boot OCG (Layer 1 — Operational Compliance Grid)
    let ocgBooted = false;
    try {
      const { initializeOCG } = await import('@/layers/ccl');
      const ocgResult = await initializeOCG();
      ocgBooted = ocgResult.success;
    } catch { /* graceful */ }
    
    if (coreResult.success && ccrBooted && ocgBooted) {
      console.log('✅ CORE + CCR Layer 0 + OCG Layer 1 active → 12 entities + 5 mesh overlays | Health: 100%');
    } else {
      // Fallback: ping individual modules
      let activeCount = 0;
      for (const module of publicModules) {
        await yieldToMain();
        const result = await substrate.invoke({ module, action: 'pulse' });
        if (result.success) activeCount++;
      }
      // Activate mesh overlays
      for (const mesh of meshOverlays) {
        await yieldToMain();
        const result = await substrate.invoke({ module: mesh, action: 'pulse' });
        if (result.success) activeCount++;
      }
      
      console.log(`✅ Substrate initialized: ${activeCount + 1}/12 entities + mesh overlays active`);
    }
    
    console.log('─────────────────────────────────────────');
    
    // Initialize subsystem health registry
    try {
      const { initSubsystemHealth } = await import('./substrate/subsystem-health');
      initSubsystemHealth();
    } catch { /* graceful */ }
    
    // Initialize GOAL
    try {
      const { initializeGOAL } = await import('@/core/goal');
      initializeGOAL();
      console.log('🔭 GOAL initialized — Global Observability Access Layer active');
    } catch { /* graceful */ }
    
    // Start automatic circuit recovery engine
    try {
      const { startAutoRecovery } = await import('./substrate/core-circuit-recovery');
      startAutoRecovery();
    } catch { /* graceful */ }
    
    // Rehydrate persistent control plane state (revision-aware)
    try {
      const { rehydrateControlPlane } = await import('@/lib/control-plane/rehydrate');
      const rehydResult = await rehydrateControlPlane();
      if (!rehydResult.skipped) {
        console.log(`💾 Control Plane rehydrated in ${rehydResult.durationMs}ms (rev=${rehydResult.revisionId ?? 'baseline'})`);
      }
    } catch { /* graceful */ }

    // Start leader-gated persistence scheduler
    try {
      const { startPersistenceScheduler } = await import('@/lib/control-plane/persistence-scheduler');
      await startPersistenceScheduler();
    } catch { /* graceful */ }

    // Register shutdown hook: flush + release lease
    try {
      const { registerShutdownHook } = await import('./substrate/graceful-shutdown');
      const { flushAll } = await import('@/lib/control-plane/persistence');
      const { stopPersistenceScheduler } = await import('@/lib/control-plane/persistence-scheduler');
      registerShutdownHook('control-plane-persistence', async () => {
        await flushAll();
        await stopPersistenceScheduler();
      }, 1); // Highest priority (runs first)
    } catch { /* graceful */ }
    
    initialized = true;
  } catch (error) {
    console.error('❌ Substrate initialization failed:', error);
  }
}

// Auto-initialize on import in browser environment - heavily deferred
if (typeof window !== 'undefined') {
  const scheduleInit = () => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        setTimeout(() => initializeSubstrate(), 100);
      }, { timeout: 10000 });
    } else {
      setTimeout(() => initializeSubstrate(), 5000);
    }
  };
  
  if (document.readyState === 'complete') {
    scheduleInit();
  } else {
    window.addEventListener('load', scheduleInit, { once: true, passive: true });
  }
}
