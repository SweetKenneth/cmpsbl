import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, GitBranch } from "lucide-react";

interface GraphEdge {
  id: string;
  source_id: string;
  target_id: string;
  relation: string;
  weight: number;
}

interface GraphStats {
  total_edges: number;
  relations: Record<string, number>;
  avg_weight: number;
}

export default function MemoryGraph() {
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [stats, setStats] = useState<GraphStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGraphData();
    const interval = setInterval(fetchGraphData, 120000); // Update every 2 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchGraphData = async () => {
    try {
      const { data: edgesData, error } = await supabase
        .from('brain_graph_edges')
        .select('*')
        .order('weight', { ascending: false })
        .limit(100);

      if (error) throw error;

      setEdges(edgesData || []);

      // Calculate stats
      if (edgesData && edgesData.length > 0) {
        const relations: Record<string, number> = {};
        let totalWeight = 0;

        edgesData.forEach(edge => {
          relations[edge.relation] = (relations[edge.relation] || 0) + 1;
          totalWeight += edge.weight;
        });

        setStats({
          total_edges: edgesData.length,
          relations,
          avg_weight: totalWeight / edgesData.length
        });
      }
    } catch (err) {
      console.error('Failed to fetch graph data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRelationColor = (relation: string) => {
    const colors: Record<string, string> = {
      'reflects_on': '#10b981',
      'shares_topic': '#3b82f6',
      'explores': '#8b5cf6',
      'related_to': '#f59e0b'
    };
    return colors[relation] || '#6b7280';
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="w-5 h-5 text-primary" />
          Memory Relationship Graph
        </CardTitle>
        <CardDescription>
          Knowledge network visualization and statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-muted-foreground">Loading graph data...</div>
        ) : !stats || edges.length === 0 ? (
          <div className="text-muted-foreground">No graph data yet</div>
        ) : (
          <div className="space-y-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">Total Edges</div>
                <div className="text-2xl font-bold">{stats.total_edges}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground mb-1">Avg Weight</div>
                <div className="text-2xl font-bold">{stats.avg_weight.toFixed(2)}</div>
              </div>
            </div>

            {/* Relationship Types */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Relationship Types</h4>
              {Object.entries(stats.relations).map(([relation, count]) => (
                <div key={relation} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" style={{ color: getRelationColor(relation) }} />
                    <span className="text-sm">{relation.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              ))}
            </div>

            {/* Simple SVG Visualization */}
            <div className="mt-4 p-4 rounded-lg bg-muted/20 border border-border">
              <svg width="100%" height="300" viewBox="0 0 400 300">
                {edges.slice(0, 50).map((edge, i) => {
                  // Create a simple radial layout
                  const angle1 = (i * 2 * Math.PI) / 50;
                  const angle2 = ((i + 1) * 2 * Math.PI) / 50;
                  const radius = 120;
                  const centerX = 200;
                  const centerY = 150;

                  const x1 = centerX + radius * Math.cos(angle1);
                  const y1 = centerY + radius * Math.sin(angle1);
                  const x2 = centerX + radius * Math.cos(angle2);
                  const y2 = centerY + radius * Math.sin(angle2);

                  return (
                    <line
                      key={edge.id}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={getRelationColor(edge.relation)}
                      strokeWidth={edge.weight * 2}
                      strokeOpacity={0.4}
                    />
                  );
                })}
              </svg>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Radial visualization of top 50 connections
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Graph shows how memories, reflections, and curiosity topics interconnect through shared concepts.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
