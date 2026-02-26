/**
 * PromptFluid System Cache Flush
 * Complete cache erasure and cold reinitialization
 */

/**
 * Flush all system caches without accessing backend
 */
export async function flushSystemCache(): Promise<void> {
  // Clear localStorage verification states — both legacy plain and obfuscated
  const { secureRemove } = await import('@/lib/system/secureStorage');

  const keysToRemove = [
    'nexus_metrics',
    'system_verification_state',
    'deployment_metadata',
    'validation_logs',
    'brain_cache',
    'defense_cache',
    'vision_cache',
    'inclusive_cache',
    'cascade_cache',
    'pf_system_state',
    'pf_health_check',
    'pf_last_sync',
  ];

  keysToRemove.forEach(key => {
    try {
      secureRemove(key); // Removes both _s_ prefixed and legacy plain keys
    } catch {
      // Storage unavailable — tolerate
    }
  });

  // Clear all pf_* prefixed items (legacy plain keys)
  try {
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('pf_') || key.startsWith('nexus_') || key.startsWith('brain_') || key.startsWith('_s_')) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // Storage unavailable — tolerate
  }

  // Clear session storage
  try {
    sessionStorage.clear();
  } catch {
    // Session storage unavailable — tolerate
  }
}

/**
 * Cold reinitialization using environment variables only
 */
export async function coldReinitialize(): Promise<void> {
  const { secureSet } = await import('@/lib/system/secureStorage');
  const initTimestamp = Date.now();
  
  try {
    secureSet('pf_init_timestamp', initTimestamp);
    secureSet('pf_cache_flushed', true);
  } catch {
    // Storage unavailable — tolerate
  }
}

/**
 * Complete flush and reinit sequence
 */
export async function executeFullFlush(): Promise<{ success: boolean; timestamp: number }> {
  await flushSystemCache();
  await coldReinitialize();
  
  return {
    success: true,
    timestamp: Date.now(),
  };
}
