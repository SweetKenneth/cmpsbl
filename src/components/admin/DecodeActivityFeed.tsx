import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Brain, Zap, Shield, Eye } from 'lucide-react';
import { format } from 'date-fns';
import type { Json } from '@/integrations/supabase/types';

interface BrainEvent {
  id: string;
  event_type: string;
  module: string;
  outcome: string | null;
  created_at: string;
  data: Json | null;
}

export function DecodeActivityFeed() {
  const [events, setEvents] = useState<BrainEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('brain_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
    
    // Real-time subscription
    const channel = supabase
      .channel('brain-events-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'brain_events' },
        (payload) => {
          setEvents(prev => [payload.new as BrainEvent, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getModuleIcon = (module: string) => {
    switch (module.toLowerCase()) {
      case 'defense': return <Shield className="w-4 h-4 text-destructive" />;
      case 'vision': return <Eye className="w-4 h-4 text-neon-blue" />;
      case 'brain': return <Brain className="w-4 h-4 text-neon-purple" />;
      case 'decode': return <Zap className="w-4 h-4 text-neon-cyan" />;
      default: return <Zap className="w-4 h-4 text-neon-amber" />;
    }
  };

  const getOutcomeBadge = (outcome: string | null) => {
    if (!outcome) return <Badge variant="secondary">Pending</Badge>;
    if (outcome === 'success') return <Badge className="bg-neon-green/20 text-neon-green">Success</Badge>;
    if (outcome === 'failed') return <Badge className="bg-destructive/20 text-destructive">Failed</Badge>;
    return <Badge variant="secondary">{outcome}</Badge>;
  };

  return (
    <Card className="glass-card border border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Decode Activity Feed
            </CardTitle>
            <CardDescription>
              Real-time system events
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEvents}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No events recorded yet.
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors border border-border/30"
              >
                <div className="flex items-center gap-3">
                  {getModuleIcon(event.module)}
                  <div>
                    <span className="font-medium text-sm">{event.event_type}</span>
                    <p className="text-xs text-muted-foreground">{event.module}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getOutcomeBadge(event.outcome)}
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(event.created_at), 'HH:mm:ss')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
