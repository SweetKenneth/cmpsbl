/**
 * Brain System Initialization Utility
 * Initializes the Neural Substrate Layer on app boot
 * 
 * Performance: Uses requestIdleCallback, no external API calls
 */

let initializationAttempted = false;

export async function initializeBrainSystem() {
  if (initializationAttempted) return;
  initializationAttempted = true;

  try {
    console.log('🧠 Initializing CMPSBL® BRAIN...');
    
    // Initialize the neural substrate layer (in-memory, no API calls)
    const { initializeNeuralSubstrate } = await import('@/lib/substrate/neural');
    await initializeNeuralSubstrate();
    
    console.log('✅ Brain initialized successfully');
  } catch (err) {
    console.error('❌ Brain initialization failed:', err);
  }
}
