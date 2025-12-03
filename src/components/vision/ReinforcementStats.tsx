import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { TrendingUp, Award, Target } from 'lucide-react';

interface ReinforcementStats {
  weighted_nodes: number;
  avg_score: number;
  top_performers: Array<{ memory_id: string; score: number }>;
  recent_reinforcements: number;
}

export default function ReinforcementStats() {
  const [stats, setStats] = useState<ReinforcementStats>({
    weighted_nodes: 0,
    avg_score: 0,
    top_performers: [],
    recent_reinforcements: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      // Get weighted nodes count and average
      const { data: edges } = await supabase
        .from('brain_graph_edges')
        .select('reinforcement_score, target_id')
        .gt('reinforcement_score', 0);

      if (edges) {
        const weightedNodes = edges.length;
        const avgScore = edges.reduce((sum, e) => sum + (e.reinforcement_score || 0), 0) / weightedNodes;
        
        // Get top performers
        const topPerformers = edges
          .sort((a, b) => (b.reinforcement_score || 0) - (a.reinforcement_score || 0))
          .slice(0, 5)
          .map(e => ({ memory_id: e.target_id, score: e.reinforcement_score || 0 }));

        // Get recent reinforcements (last 24h)
        const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
        const { count } = await supabase
          .from('brain_reinforcement_log')
          .select('*', { count: 'exact', head: true })
          .gte('triggered_at', oneDayAgo);

        setStats({
          weighted_nodes: weightedNodes,
          avg_score: avgScore,
          top_performers: topPerformers,
          recent_reinforcements: count || 0
        });
      }
    } catch (error) {
      console.error('Error fetching reinforcement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-background to-muted border-primary/20 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-bold">Context Reinforcement</h3>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading stats...</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary/70" />
                <p className="text-xs text-muted-foreground">Weighted Nodes</p>
              </div>
              <p className="text-2xl font-bold">{stats.weighted_nodes}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary/70" />
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
              <p className="text-2xl font-bold">{stats.avg_score.toFixed(2)}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary/70" />
                <p className="text-xs text-muted-foreground">24h Events</p>
              </div>
              <p className="text-2xl font-bold">{stats.recent_reinforcements}</p>
            </div>
          </div>

          {stats.top_performers.length > 0 && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Top Performing Nodes</p>
              <div className="space-y-1">
                {stats.top_performers.map((node, i) => (
                  <div key={node.memory_id} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">#{i + 1}</span>
                    <span className="font-mono text-xs opacity-70">
                      {node.memory_id.substring(0, 8)}...
                    </span>
                    <span className="font-bold text-primary">{node.score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Automatically strengthens memory weights based on successful outcomes.
              Higher scores indicate more valuable knowledge nodes.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
