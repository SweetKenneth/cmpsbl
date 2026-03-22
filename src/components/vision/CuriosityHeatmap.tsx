import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, TrendingDown } from "lucide-react";

interface CuriosityTopic {
  id: string;
  query: string;
  curiosity_score: number;
  domain: string;
  explored: boolean;
  metadata: any;
  created_at: string;
}

export default function CuriosityHeatmap() {
  const [topics, setTopics] = useState<CuriosityTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('brain_curiosity_log')
        .select('*')
        .order('curiosity_score', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTopics(data || []);
    } catch (err) {
      console.error('Failed to fetch curiosity topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-neon-green';
    if (score >= 0.4) return 'text-neon-amber';
    return 'text-destructive';
  };

  const getScoreIcon = (score: number) => {
    return score >= 0.5 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Curiosity Heatmap
        </CardTitle>
        <CardDescription>
          Top topics ranked by novelty and usefulness
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-muted-foreground">Loading curiosity data...</div>
        ) : topics.length === 0 ? (
          <div className="text-muted-foreground">No curiosity data yet</div>
        ) : (
          <div className="space-y-3">
            {topics.map((topic, index) => (
              <div
                key={topic.id}
                className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono text-muted-foreground">
                      #{index + 1}
                    </span>
                    <h4 className="text-sm font-medium truncate">
                      {topic.query}
                    </h4>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {topic.domain || 'general'}
                    </Badge>
                    {topic.explored && (
                      <Badge variant="outline" className="text-xs bg-primary/10">
                        Explored
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1 ml-4">
                  <div className={`flex items-center gap-1 font-bold ${getScoreColor(topic.curiosity_score)}`}>
                    {getScoreIcon(topic.curiosity_score)}
                    <span>{(topic.curiosity_score * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
