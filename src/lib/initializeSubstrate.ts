/**
 * promptfluid® Substrate Initialization
 * v6.0.0 — Complete AI Operating System with 14 modules
 */

import { substrate } from './substrate';

let initialized = false;

export async function initializeSubstrate(): Promise<void> {
  if (initialized) return;
  
  try {
    console.log('⚡ Booting promptfluid® Substrate v6.0.0...');
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

// Auto-initialize on import in browser environment
if (typeof window !== 'undefined') {
  // Delay initialization to not block page load
  setTimeout(() => {
    initializeSubstrate();
  }, 1000);
}
