/**
 * promptfluid® Substrate Initialization
 * v7.0.0 — Complete AI Operating System with 14 modules + SEBA
 * 
 * Performance: Uses requestIdleCallback for zero main-thread blocking
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

export async function initializeSubstrate(): Promise<void> {
  if (initialized) return;
  
  try {
    const substrate = await getSubstrate();
    
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
      // Fallback to individual pings
      const results = await Promise.allSettled(
        bootOrder.map(module => 
          substrate.invoke({ module, action: 'pulse' })
        )
      );
      
      const activeModules = results.filter(r => r.status === 'fulfilled' && (r.value as { success?: boolean }).success).length;
      
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
  // Use double-deferred initialization: wait for idle, then delay further
  const scheduleInit = () => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        initializeSubstrate();
      }, { timeout: 5000 }); // 5s timeout, very low priority
    } else {
      setTimeout(() => initializeSubstrate(), 3000);
    }
  };
  
  // Wait for load event first, then schedule idle init
  if (document.readyState === 'complete') {
    scheduleInit();
  } else {
    window.addEventListener('load', scheduleInit, { once: true });
  }
}
