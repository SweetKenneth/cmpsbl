import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Lightbulb } from "lucide-react";

interface ReflectionEntry {
  id: string;
  content: string;
  reflection_type: string;
  insights: any;
  created_at: string;
}

export default function ReflectionFeed() {
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReflections();
    const interval = setInterval(fetchReflections, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchReflections = async () => {
    try {
      const { data, error } = await supabase
        .from('brain_reflection_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setReflections(data || []);
    } catch (err) {
      console.error('Failed to fetch reflections:', err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Brain Reflection Feed
        </CardTitle>
        <CardDescription>
          Self-evaluation and meta-learning insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-muted-foreground">Loading reflections...</div>
        ) : reflections.length === 0 ? (
          <div className="text-muted-foreground">No reflections yet</div>
        ) : (
        <div className="space-y-3">
            {reflections.map((reflection) => (
              <div
                key={reflection.id}
                className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">{reflection.reflection_type || 'General'}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(reflection.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-2">
                  {reflection.content}
                </p>

                {reflection.insights && (
                  <div className="flex items-start gap-2 mt-2 p-2 rounded bg-primary/5 border border-primary/10">
                    <TrendingUp className="w-3 h-3 text-primary mt-0.5" />
                    <span className="text-xs text-muted-foreground">
                      Insights: {JSON.stringify(reflection.insights).substring(0, 100)}...
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
