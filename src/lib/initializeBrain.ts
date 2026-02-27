/**
 * Brain System Initialization Utility
 * Auto-initializes the Brain on app load
 * 
 * Performance: Lazy-loads supabase, uses requestIdleCallback
 */

let initializationAttempted = false;
let supabaseClient: typeof import('@/integrations/supabase/client') | null = null;

// Lazy load supabase only when needed
async function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = await import('@/integrations/supabase/client');
  }
  return supabaseClient.supabase;
}

export async function initializeBrainSystem() {
  // Only attempt once per session
  if (initializationAttempted) return;
  initializationAttempted = true;

  try {
    console.log('🧠 Initializing CMPSBL® BRAIN...');
    
    const supabase = await getSupabase();
    const { data, error } = await supabase.functions.invoke('pf-brain-initialize');
    
    if (error) {
      console.error('❌ Brain initialization error:', error);
      return;
    }
    
    if (data?.success) {
      console.log('✅ Brain initialized successfully:', data.status);
    }
  } catch (err) {
    console.error('❌ Brain initialization failed:', err);
  }
}
