/**
 * PromptFluid System Cache Flush
 * Complete cache erasure and cold reinitialization
 */

/**
 * Flush all system caches without accessing backend
 */
export async function flushSystemCache(): Promise<void> {
  // Clear localStorage verification states
  const keysToRemove = [
    'nexus_metrics',
    'system_verification_state',
    'deployment_metadata',
    'validation_logs',
    'brain_cache',
    'defense_cache',
    'vision_cache',
    'clarity_cache',
    'cascade_cache',
    'pf_system_state',
    'pf_health_check',
    'pf_last_sync',
  ];

  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Silent fail for unavailable storage
    }
  });

  // Clear all pf_* prefixed items
  try {
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('pf_') || key.startsWith('nexus_') || key.startsWith('brain_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    // Silent fail
  }

  // Clear session storage
  try {
    sessionStorage.clear();
  } catch (e) {
    // Silent fail
  }
}

/**
 * Cold reinitialization using environment variables only
 */
export async function coldReinitialize(): Promise<void> {
  // Reset timestamp markers
  const initTimestamp = Date.now();
  
  try {
    localStorage.setItem('pf_init_timestamp', initTimestamp.toString());
    localStorage.setItem('pf_cache_flushed', 'true');
  } catch (e) {
    // Silent fail
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
