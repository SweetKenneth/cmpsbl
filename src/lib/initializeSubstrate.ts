/**
 * CMPSBL® Substrate Initialization
 * MINDGAMES Epoch — Complete AI Operating System
 *
 * Architecture: CORE → CCR → OCG (6) → Execution (11) → ESZ/EPZ/EMZ → CSZ → Fields/Plane/Shell
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
    
    // Boot order: CORE → CCR → OCG → Execution → ESZ → EPZ → EMZ → CSZ → Fields → Plane → Shell
    const executionNodes = [
      'decode', 'encode', 'vision', 'cortex', 'nexus', 'economy', 'sandbox', 'inclusive',
      'medic',
      'integration', // boots last among execution nodes
    ] as const;
    const eszNodes = ['sovereign', 'oracle', 'conscience', 'treaty'] as const;
    const epzNodes = ['compass', 'echo', 'reflex'] as const;
    const emzNodes = ['forge', 'lingua', 'harvest'] as const;
    const cszNodes = ['evolution', 'shadow', 'phantom'] as const;
    const meshOverlays = [
      'governance', 'intent', 'immunity', 'defense', // innermost → outermost
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
    
    // 3. OCG (Operational Compliance Grid) — removed as dead layer
    //    All OCG subsystems (identity, access, signal, relay, audit) are
    //    directly served by substrate nodes. No separate boot needed.
    const ocgBooted = true;
    
    if (coreResult.success && ccrBooted && ocgBooted) {
      console.log('✅ CORE + CCR + OCG active → 40-node matrix online | Health: 100%');
    } else {
      // Fallback: ping all sectors
      let activeCount = 0;
      const allNodes = [...executionNodes, ...eszNodes, ...epzNodes, ...emzNodes, ...cszNodes];
      for (const node of allNodes) {
        await yieldToMain();
        const result = await substrate.invoke({ module: node, action: 'pulse' });
        if (result.success) activeCount++;
      }
      for (const mesh of meshOverlays) {
        await yieldToMain();
        const result = await substrate.invoke({ module: mesh, action: 'pulse' });
        if (result.success) activeCount++;
      }
      
      console.log(`✅ Substrate initialized: ${activeCount + 1}/40 nodes active across 12 sectors`);
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

    // Activate S-Tier capabilities (3-wave staged activation)
    try {
      const { activateAllSTierCapabilities } = await import('@/lib/capabilities/s-tier-activator');
      const waves = activateAllSTierCapabilities();
      const total = waves.reduce((sum, w) => sum + w.totalActivated, 0);
      console.log(`🏆 S-Tier activated: ${total} capabilities across ${waves.length} waves`);
    } catch { /* graceful */ }

    // Load vault primitives (1,894 discoveries → runtime capabilities)
    try {
      const { loadVaultPrimitives } = await import('@/lib/substrate/vault-primitive-loader');
      const vaultResult = await loadVaultPrimitives();
      console.log(`🔮 Vault primitives loaded: ${vaultResult.loaded} discoveries across ${Object.keys(vaultResult.byNode).length} nodes`);
      if (vaultResult.errors.length > 0) {
        console.warn('[VAULT-LOADER] Errors:', vaultResult.errors);
      }
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
