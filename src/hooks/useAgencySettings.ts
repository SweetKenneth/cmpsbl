/**
 * useAgencySettings — Hook for managing agency settings
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AgencySettings, PresetCommand } from '@/lib/agency/agencyTasks';
import { DEFAULT_PRESET_COMMANDS } from '@/lib/agency/agencyTasks';
import type { Json } from '@/integrations/supabase/types';

interface UseAgencySettingsReturn {
  settings: AgencySettings | null;
  isLoading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<AgencySettings>) => Promise<boolean>;
  updateLeaderName: (name: string) => Promise<boolean>;
  addPresetCommand: (preset: PresetCommand) => Promise<boolean>;
  removePresetCommand: (presetId: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

// Helper to safely parse preset commands from JSON
function parsePresetCommands(data: Json | null): PresetCommand[] {
  if (!data || !Array.isArray(data)) return DEFAULT_PRESET_COMMANDS;
  return data as unknown as PresetCommand[];
}

// Helper to safely parse settings from DB row
function parseSettings(row: any): AgencySettings {
  return {
    id: row.id,
    agency_id: row.agency_id,
    leader_name: row.leader_name || 'Team Lead',
    auto_research_enabled: row.auto_research_enabled ?? true,
    shared_learning_enabled: row.shared_learning_enabled ?? true,
    default_research_domains: Array.isArray(row.default_research_domains) 
      ? row.default_research_domains 
      : ['perplexity.ai', 'github.com'],
    preset_commands: parsePresetCommands(row.preset_commands),
    notification_preferences: row.notification_preferences || {},
    theme_settings: row.theme_settings || {},
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function useAgencySettings(agencyId: string): UseAgencySettingsReturn {
  const [settings, setSettings] = useState<AgencySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch or create settings
  const fetchSettings = useCallback(async () => {
    if (!agencyId) return;

    try {
      // Try to fetch existing settings
      const { data, error: fetchError } = await supabase
        .from('agency_settings')
        .select('*')
        .eq('agency_id', agencyId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        setSettings(parseSettings(data));
      } else {
        // Create default settings if none exist
        const defaultPresets = DEFAULT_PRESET_COMMANDS as unknown as Json;
        const { data: newSettings, error: insertError } = await supabase
          .from('agency_settings')
          .insert({
            agency_id: agencyId,
            leader_name: 'Team Lead',
            auto_research_enabled: true,
            shared_learning_enabled: true,
            default_research_domains: ['perplexity.ai', 'github.com', 'stackoverflow.com'] as unknown as Json,
            preset_commands: defaultPresets,
            notification_preferences: {} as Json,
            theme_settings: {} as Json,
          })
          .select()
          .single();

        if (insertError) {
          // Settings might already exist (race condition), try fetching again
          const { data: existingSettings } = await supabase
            .from('agency_settings')
            .select('*')
            .eq('agency_id', agencyId)
            .single();
          
          if (existingSettings) {
            setSettings(parseSettings(existingSettings));
          }
        } else if (newSettings) {
          setSettings(parseSettings(newSettings));
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, [agencyId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<AgencySettings>): Promise<boolean> => {
    if (!settings) return false;

    try {
      // Convert arrays to Json type for Supabase
      const dbUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      
      if (updates.leader_name !== undefined) dbUpdates.leader_name = updates.leader_name;
      if (updates.auto_research_enabled !== undefined) dbUpdates.auto_research_enabled = updates.auto_research_enabled;
      if (updates.shared_learning_enabled !== undefined) dbUpdates.shared_learning_enabled = updates.shared_learning_enabled;
      if (updates.default_research_domains !== undefined) dbUpdates.default_research_domains = updates.default_research_domains;
      if (updates.preset_commands !== undefined) dbUpdates.preset_commands = updates.preset_commands;
      if (updates.notification_preferences !== undefined) dbUpdates.notification_preferences = updates.notification_preferences;
      if (updates.theme_settings !== undefined) dbUpdates.theme_settings = updates.theme_settings;

      const { error: updateError } = await supabase
        .from('agency_settings')
        .update(dbUpdates)
        .eq('agency_id', agencyId);

      if (updateError) throw updateError;

      setSettings(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Settings saved');
      return true;
    } catch (err) {
      console.error('Error updating settings:', err);
      toast.error('Failed to save settings');
      return false;
    }
  }, [agencyId, settings]);

  // Update leader name
  const updateLeaderName = useCallback(async (name: string): Promise<boolean> => {
    return updateSettings({ leader_name: name });
  }, [updateSettings]);

  // Add preset command
  const addPresetCommand = useCallback(async (preset: PresetCommand): Promise<boolean> => {
    if (!settings) return false;
    
    const currentPresets = Array.isArray(settings.preset_commands) 
      ? settings.preset_commands 
      : [];
    
    return updateSettings({
      preset_commands: [...currentPresets, preset],
    });
  }, [settings, updateSettings]);

  // Remove preset command
  const removePresetCommand = useCallback(async (presetId: string): Promise<boolean> => {
    if (!settings) return false;
    
    const currentPresets = Array.isArray(settings.preset_commands) 
      ? settings.preset_commands 
      : [];
    
    return updateSettings({
      preset_commands: currentPresets.filter(p => p.id !== presetId),
    });
  }, [settings, updateSettings]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    updateLeaderName,
    addPresetCommand,
    removePresetCommand,
    refetch: fetchSettings,
  };
}
