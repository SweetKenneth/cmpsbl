/**
 * Encoded Configuration Manager
 * Runtime configuration with Atlas integration
 * Routes through Nexus fleet — zero paid AI dependencies
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  type EncodedConfig, 
  type ExecutionMode, 
  type PrimaryModel,
  DEFAULT_ENCODED_CONFIG 
} from './policy';

// In-memory cache
let cachedConfig: EncodedConfig | null = null;
let lastFetch: number = 0;
const CACHE_TTL_MS = 60_000; // 1 minute

/**
 * Get the current Encoded configuration
 * Reads from Atlas capabilities table with caching
 */
export async function getEncodedConfig(): Promise<EncodedConfig> {
  const now = Date.now();
  
  // Return cached if fresh
  if (cachedConfig && (now - lastFetch) < CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    const { data } = await supabase
      .from('atlas_capabilities')
      .select('metadata')
      .eq('key', 'encoded_config')
      .single();

    if (data?.metadata) {
      const meta = data.metadata as Record<string, unknown>;
      // Migrate old cloud_ai values to nexus_fleet
      let primaryModel = (meta.primary_model as PrimaryModel) || DEFAULT_ENCODED_CONFIG.primaryModel;
      if (primaryModel === 'cloud_ai' as any) primaryModel = 'nexus_fleet';
      
      cachedConfig = {
        executionMode: (meta.execution_mode as ExecutionMode) || DEFAULT_ENCODED_CONFIG.executionMode,
        sebaIntegration: Boolean(meta.seba_integration ?? DEFAULT_ENCODED_CONFIG.sebaIntegration),
        clmTraining: Boolean(meta.clm_training ?? DEFAULT_ENCODED_CONFIG.clmTraining),
        primaryModel,
        maxRetries: Number(meta.max_retries) || DEFAULT_ENCODED_CONFIG.maxRetries,
      };
    } else {
      cachedConfig = { ...DEFAULT_ENCODED_CONFIG };
    }
    
    lastFetch = now;
    return cachedConfig;
  } catch (err) {
    console.error('Failed to fetch Encoded config:', err);
    return { ...DEFAULT_ENCODED_CONFIG };
  }
}

/**
 * Update Encoded configuration
 * Persists to Atlas capabilities table
 */
export async function updateEncodedConfig(
  updates: Partial<EncodedConfig>
): Promise<{ success: boolean; error?: string }> {
  try {
    const current = await getEncodedConfig();
    const newConfig = { ...current, ...updates };
    
    const metadata = {
      execution_mode: newConfig.executionMode,
      seba_integration: newConfig.sebaIntegration,
      clm_training: newConfig.clmTraining,
      primary_model: newConfig.primaryModel,
      max_retries: newConfig.maxRetries,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('atlas_capabilities')
      .upsert({
        key: 'encoded_config',
        description: 'Encoded configuration — Nexus fleet routing',
        enabled: true,
        metadata,
      }, { onConflict: 'key' });

    if (error) {
      return { success: false, error: error.message };
    }

    // Update cache
    cachedConfig = newConfig;
    lastFetch = Date.now();

    return { success: true };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

/**
 * Reset configuration to defaults
 */
export async function resetEncodedConfig(): Promise<{ success: boolean }> {
  return updateEncodedConfig(DEFAULT_ENCODED_CONFIG);
}

/**
 * Check if SEBA integration is enabled
 */
export async function isSebaIntegrationEnabled(): Promise<boolean> {
  const config = await getEncodedConfig();
  return config.sebaIntegration;
}

/**
 * Check if Encoded is in dry-run mode
 */
export async function isDryRunMode(): Promise<boolean> {
  const config = await getEncodedConfig();
  return config.executionMode === 'dry_run';
}

/**
 * Get execution mode label for display
 */
export function getExecutionModeLabel(mode: ExecutionMode): string {
  switch (mode) {
    case 'dry_run':
      return 'Dry Run (Preview Only)';
    case 'human_approval':
      return 'Human Approval Required';
    case 'semi_autonomous':
      return 'Semi-Autonomous (Low-risk auto)';
    case 'autonomous':
      return 'Fully Autonomous';
  }
}

/**
 * Get model label for display
 */
export function getPrimaryModelLabel(model: PrimaryModel): string {
  switch (model) {
    case 'nexus_fleet':
      return 'Nexus Fleet (Groq → Cerebras → DeepSeek)';
    case 'free_tier':
      return 'Free Tier (Groq/Cerebras)';
  }
}
