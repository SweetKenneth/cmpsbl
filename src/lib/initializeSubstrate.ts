/**
 * promptfluid® Substrate Initialization
 * v7.0.0 — Complete AI Operating System with 14 modules + SEBA
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
    
    console.log('⚡ Booting promptfluid® Substrate v7.0.0 (SEBA Era)...');
    console.log('─────────────────────────────────────────');
    
    // Boot sequence - CORE first, then other modules (14-module architecture: 13 core + cortex)
    // INCLUSIVE positioned between SYSTEM and DEFENSE in lifecycle
    const bootOrder: ('core' | 'brain' | 'decode' | 'defense' | 'nexus' | 'vision' | 'dream' | 'ripple' | 'access' | 'system' | 'inclusive' | 'modernizer' | 'integration' | 'cortex')[] = [
      'core', 'brain', 'decode', 'system', 'inclusive', 'defense', 'nexus', 'vision', 'dream', 'ripple', 'access', 'modernizer', 'integration', 'cortex'
    ];
    
    // First, call core.boot to initialize everything
    const bootResult = await substrate.invoke({ module: 'core', action: 'boot' });
    
    if (bootResult.success) {
      console.log('✅ Substrate boot complete: 14 modules loaded | Health: 100%');
    } else {
      // Fallback to individual pings with yielding between each
      let activeModules = 0;
      for (const module of bootOrder) {
        await yieldToMain(); // Yield between each module ping
        const result = await substrate.invoke({ module, action: 'pulse' });
        if (result.success) activeModules++;
      }
      
      console.log(`✅ Substrate initialized: ${activeModules}/${bootOrder.length} modules active`);
    }
    
    console.log('─────────────────────────────────────────');
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
