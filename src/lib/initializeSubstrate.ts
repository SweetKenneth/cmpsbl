/**
 * promptfluid® Substrate Initialization
 * v2026.01 — Auto-initializes substrate modules on app load
 */

import { substrate } from './substrate';

let initialized = false;

export async function initializeSubstrate(): Promise<void> {
  if (initialized) return;
  
  try {
    console.log('⚡ Initializing promptfluid® substrate v2026.01...');
    
    // Ping each module to wake them up
    const modules: ('brain' | 'decode' | 'defense' | 'nexus' | 'vision')[] = ['brain', 'decode', 'defense', 'nexus', 'vision'];
    
    const results = await Promise.allSettled(
      modules.map(module => 
        substrate.invoke({ module, action: 'status' })
      )
    );
    
    const activeModules = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value.success)
      .length;
    
    console.log(`✅ Substrate initialized: ${activeModules}/${modules.length} modules active`);
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
