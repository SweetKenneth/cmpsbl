import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, CheckCircle, XCircle } from "lucide-react";

interface LearningEvent {
  id: string;
  provider: string;
  model: string;
  category: string;
  success: boolean;
  tokens_used: number;
  response_time_ms: number;
  created_at: string;
}

export default function RecentLearningEvents() {
  const [events, setEvents] = useState<LearningEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_usage_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Failed to fetch learning events:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Recent Learning Events
        </CardTitle>
        <CardDescription>
          Live AI usage and learning activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-muted-foreground">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">
            No learning events yet. System will log activity as it learns.
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {event.success ? (
                      <CheckCircle className="w-4 h-4 text-neon-green" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="text-sm font-medium">
                      {event.provider || 'unknown'}
                    </span>
                    {event.model && (
                      <Badge variant="outline" className="text-xs">
                        {event.model}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {event.category && (
                      <span className="bg-primary/10 px-2 py-0.5 rounded">
                        {event.category}
                      </span>
                    )}
                    {event.tokens_used && (
                      <span>{event.tokens_used} tokens</span>
                    )}
                    {event.response_time_ms && (
                      <span>{event.response_time_ms}ms</span>
                    )}
                  </div>
                </div>
                
                <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                  {new Date(event.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
