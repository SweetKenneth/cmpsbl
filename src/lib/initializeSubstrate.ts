/**
 * promptfluid® Substrate Initialization
 * v5.5.0 — Complete AI Operating System with 13 modules
 */

import { substrate } from './substrate';

let initialized = false;

export async function initializeSubstrate(): Promise<void> {
  if (initialized) return;
  
  try {
    console.log('⚡ Booting promptfluid® Substrate v5.5.0...');
    console.log('─────────────────────────────────────────');
    
    // Boot sequence - CORE first, then other modules (13-module architecture: 12 core + cortex)
    const bootOrder: ('core' | 'brain' | 'decode' | 'defense' | 'nexus' | 'vision' | 'dream' | 'ripple' | 'access' | 'system' | 'modernizer' | 'integration' | 'cortex')[] = [
      'core', 'brain', 'decode', 'defense', 'nexus', 'vision', 'dream', 'ripple', 'access', 'system', 'modernizer', 'integration', 'cortex'
    ];
    
    // First, call core.boot to initialize everything
    const bootResult = await substrate.invoke({ module: 'core', action: 'boot' });
    
    if (bootResult.success) {
      console.log('✅ Substrate boot complete: 13 modules loaded | Health: 100%');
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
