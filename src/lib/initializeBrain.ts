/**
 * Brain System Initialization Utility
 * Auto-initializes the Brain on app load
 */

import { supabase } from '@/integrations/supabase/client';

let initializationAttempted = false;

export async function initializeBrainSystem() {
  // Only attempt once per session
  if (initializationAttempted) return;
  initializationAttempted = true;

  // Defer initialization to avoid blocking critical render path
  const deferredInit = async () => {
    try {
      console.log('🧠 Initializing PromptFluid Brain...');
      
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
  };

  // Use requestIdleCallback to defer until browser is idle, with setTimeout fallback
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => deferredInit(), { timeout: 2000 });
  } else {
    setTimeout(() => deferredInit(), 100);
  }
}
