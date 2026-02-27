import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Project {
  id: string;
  name: string;
  status: string;
  last_activity: string;
  health_score: number;
  description: string;
  events_count: number;
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

      // Map modules to projects with descriptions
      const modules = [
        { id: 'vision', name: 'CMPSBL VISION', module: 'vision', description: 'AI monitoring & learning dashboard' },
        { id: 'defense', name: 'Defense Shield', module: 'defense', description: 'Threat detection & bot prevention' },
        { id: 'clarity', name: 'Clarity Scanner', module: 'clarity', description: 'WCAG accessibility compliance' },
        { id: 'studio', name: 'Studio Builder', module: 'studio', description: 'AI-powered site generation' },
        { id: 'nexus', name: 'Nexus Gateway', module: 'nexus', description: 'API routing & orchestration' },
        { id: 'brain', name: 'Brain Core', module: 'brain', description: 'Continuous learning engine' },
      ];

      const projects: Project[] = modules.map(proj => {
        const projectEvents = events?.filter(e => e.module === proj.module) || [];
        const lastEvent = projectEvents[0];
        const successRate = projectEvents.length > 0
          ? (projectEvents.filter(e => e.outcome === 'success' || e.outcome === 'completed').length / projectEvents.length) * 100
          : 100;

        return {
          id: proj.id,
          name: proj.name,
          description: proj.description,
          status: projectEvents.length > 0 ? 'active' : 'idle',
          last_activity: lastEvent?.created_at || new Date().toISOString(),
          health_score: Math.round(successRate),
          events_count: projectEvents.length,
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
