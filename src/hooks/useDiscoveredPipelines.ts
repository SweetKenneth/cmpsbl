/**
 * Hook: useDiscoveredPipelines
 * Fetches the top discovered pipeline compositions from the database.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DiscoveredPipelineRow {
  id: string;
  name: string;
  codename: string;
  description: string;
  category: string;
  pipeline_score: number;
  capability_chain: { vaultId: string; name: string; cjpi: number; nodes: string[] }[];
  node_chain: string[];
  stage_count: number;
  estimated_value_usd: number;
  discovery_method: string;
  synergy_rating: number;
  cross_sector_count: number;
  unique_nodes: number;
  tier: string;
  curated: boolean;
  rank: number;
  created_at: string;
}

export function useDiscoveredPipelines(limit = 100) {
  return useQuery({
    queryKey: ['discovered-pipelines', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discovered_pipelines')
        .select('*')
        .order('rank', { ascending: true })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as DiscoveredPipelineRow[];
    },
  });
}

export function useCuratedPipelines() {
  return useQuery({
    queryKey: ['discovered-pipelines-curated'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discovered_pipelines')
        .select('*')
        .eq('curated', true)
        .order('rank', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as DiscoveredPipelineRow[];
    },
  });
}
