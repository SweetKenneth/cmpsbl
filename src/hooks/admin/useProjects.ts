import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Project {
  id: string;
  name: string;
  status: string;
  last_activity: string;
  health_score: number;
}

export function useProjects() {
  return useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      // Get Brain events to derive project activity
      const { data: events } = await supabase
        .from('brain_events')
        .select('module, event_type, outcome, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      // Map modules to projects
      const modules = [
        { id: 'vision', name: 'PromptFluid Vision', module: 'vision' },
        { id: 'defense', name: 'Defense Shield', module: 'defense' },
        { id: 'clarity', name: 'Clarity Scanner', module: 'clarity' },
        { id: 'studio', name: 'Studio Builder', module: 'studio' },
        { id: 'nexus', name: 'Nexus Gateway', module: 'nexus' },
        { id: 'brain', name: 'Brain Core', module: 'brain' },
      ];

      const projects: Project[] = modules.map(proj => {
        const projectEvents = events?.filter(e => e.module === proj.module) || [];
        const lastEvent = projectEvents[0];
        const successRate = projectEvents.length > 0
          ? (projectEvents.filter(e => e.outcome === 'success').length / projectEvents.length) * 100
          : 100;

        return {
          id: proj.id,
          name: proj.name,
          status: projectEvents.length > 0 ? 'active' : 'idle',
          last_activity: lastEvent?.created_at || new Date().toISOString(),
          health_score: Math.round(successRate),
        };
      });

      return {
        projects,
        stats: {
          active: projects.filter(p => p.status === 'active').length,
          total_events: events?.length || 0,
          avg_health: Math.round(projects.reduce((acc, p) => acc + p.health_score, 0) / projects.length),
        },
      };
    },
    refetchInterval: 30000,
  });
}
