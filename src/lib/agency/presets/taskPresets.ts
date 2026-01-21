/**
 * Task Presets
 * Pre-configured high-value task templates
 */

import { supabase } from '@/integrations/supabase/client';
import type { SkillLevel } from '../economy/types';
import type { ActionType } from '@/lib/execution/actionGrammar';

export interface TaskPreset {
  id: string;
  name: string;
  description: string;
  category: PresetCategory;
  estimated_value_cents: number;
  estimated_cost_cents: number;
  estimated_time_minutes: number;
  skill_required: SkillLevel;
  uses_execution_layer: boolean;
  action_sequence: PresetAction[];
  output_format: 'markdown' | 'json' | 'pdf' | 'csv';
  integrations_used: string[];
  tags: string[];
  is_active: boolean;
}

export type PresetCategory =
  | 'competitive'
  | 'seo'
  | 'research'
  | 'content'
  | 'advertising'
  | 'marketing'
  | 'operations'
  | 'compliance';

export interface PresetAction {
  action: ActionType;
  target: string;
  params: Record<string, unknown>;
  fallback?: PresetAction;
}

/**
 * Get all available task presets
 */
export async function getTaskPresets(): Promise<TaskPreset[]> {
  const { data, error } = await supabase
    .from('task_presets')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true });

  if (error) {
    console.error('Failed to fetch task presets:', error);
    return [];
  }

  return (data || []).map(preset => ({
    ...preset,
    category: preset.category as PresetCategory,
    skill_required: (preset.skill_required as SkillLevel) || 'novice',
    action_sequence: (preset.action_sequence as unknown as PresetAction[]) || [],
    output_format: (preset.output_format || 'markdown') as 'markdown' | 'json' | 'pdf' | 'csv',
  })) as unknown as TaskPreset[];
}

/**
 * Get presets by category
 */
export async function getPresetsByCategory(category: PresetCategory): Promise<TaskPreset[]> {
  const { data, error } = await supabase
    .from('task_presets')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to fetch presets by category:', error);
    return [];
  }

  return (data || []) as unknown as TaskPreset[];
}

/**
 * Get a single preset by ID
 */
export async function getPresetById(presetId: string): Promise<TaskPreset | null> {
  const { data, error } = await supabase
    .from('task_presets')
    .select('*')
    .eq('id', presetId)
    .single();

  if (error) {
    console.error('Failed to fetch preset:', error);
    return null;
  }

  return data as unknown as TaskPreset;
}

/**
 * Get category info
 */
export function getCategoryInfo(category: PresetCategory): {
  label: string;
  icon: string;
  color: string;
  description: string;
} {
  const info: Record<PresetCategory, { label: string; icon: string; color: string; description: string }> = {
    competitive: {
      label: 'Competitive Intelligence',
      icon: '🎯',
      color: 'text-red-500',
      description: 'Competitor analysis and market positioning',
    },
    seo: {
      label: 'SEO & Search',
      icon: '🔍',
      color: 'text-green-500',
      description: 'Search optimization and ranking analysis',
    },
    research: {
      label: 'Research & Analysis',
      icon: '📊',
      color: 'text-blue-500',
      description: 'Market research and data analysis',
    },
    content: {
      label: 'Content Strategy',
      icon: '✍️',
      color: 'text-purple-500',
      description: 'Content planning and creation',
    },
    advertising: {
      label: 'Advertising',
      icon: '📣',
      color: 'text-orange-500',
      description: 'Paid media and keyword research',
    },
    marketing: {
      label: 'Marketing',
      icon: '📈',
      color: 'text-pink-500',
      description: 'Marketing campaigns and influencer outreach',
    },
    operations: {
      label: 'Operations',
      icon: '⚙️',
      color: 'text-gray-500',
      description: 'Vendor and procurement research',
    },
    compliance: {
      label: 'Compliance',
      icon: '📋',
      color: 'text-amber-500',
      description: 'Regulatory and legal research',
    },
  };

  return info[category];
}

/**
 * Check if agent has required skill for preset
 */
export function canAgentExecutePreset(
  agentSkillLevel: SkillLevel,
  requiredSkillLevel: SkillLevel
): boolean {
  const skillOrder: SkillLevel[] = ['novice', 'intermediate', 'specialist', 'expert', 'strategist'];
  return skillOrder.indexOf(agentSkillLevel) >= skillOrder.indexOf(requiredSkillLevel);
}

/**
 * Build execution plan from preset
 */
export function buildPresetExecutionPlan(preset: TaskPreset, inputs: Record<string, unknown>): {
  actions: PresetAction[];
  estimated_time_ms: number;
  integrations: string[];
} {
  // Replace placeholders in action targets with inputs
  const processedActions = preset.action_sequence.map(action => ({
    ...action,
    target: Object.entries(inputs).reduce(
      (target, [key, value]) => target.replace(`{{${key}}}`, String(value)),
      action.target
    ),
    params: Object.fromEntries(
      Object.entries(action.params).map(([key, val]) => [
        key,
        typeof val === 'string'
          ? Object.entries(inputs).reduce(
              (v, [inputKey, inputVal]) => v.replace(`{{${inputKey}}}`, String(inputVal)),
              val
            )
          : val,
      ])
    ),
  }));

  return {
    actions: processedActions,
    estimated_time_ms: preset.estimated_time_minutes * 60 * 1000,
    integrations: preset.integrations_used,
  };
}
