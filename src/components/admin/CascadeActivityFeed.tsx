import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

type ThoughtStatus = 'sent' | 'pending' | 'failed';

interface CascadeThought {
  id: string;
  content: string | null;
  thought_type: string | null;
  model: string | null;
  created_at: string;
  metadata: Record<string, any> | null;
}

export function CascadeActivityFeed() {
  const [thoughts, setThoughts] = useState<CascadeThought[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThoughts = async () => {
    setLoading(false);
    // Cascade tables not configured
  };

  useEffect(() => {
    fetchThoughts();
  }, []);

  const getTypeBadge = (type: string | null) => {
    if (!type) return <Badge variant="secondary">Unknown</Badge>;
    if (type === 'reflection') return <Badge className="bg-green-500">✅ Reflection</Badge>;
    if (type === 'insight') return <Badge className="bg-blue-500">💡 Insight</Badge>;
    if (type === 'analysis') return <Badge className="bg-purple-500">🔍 Analysis</Badge>;
    return <Badge variant="secondary">{type}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>🧠 Cascade Activity Feed</CardTitle>
            <CardDescription>
              Real-time autonomous thought dispatch monitoring
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchThoughts}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://supabase.com/dashboard/project/hxgbibtkftocyrnuzxwd/editor', '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && thoughts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading...
          </div>
        ) : thoughts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No thoughts yet. Waiting for first dispatch cycle...
          </div>
        ) : (
          <div className="space-y-3">
            {thoughts.map((thought) => (
              <div
                key={thought.id}
                className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">
                      {thought.content?.substring(0, 100) || 'No content'}...
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{format(new Date(thought.created_at), 'MMM dd, HH:mm')}</span>
                      {thought.model && <span>• {thought.model}</span>}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getTypeBadge(thought.thought_type)}
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
