/**
 * RIPPLE Message Bus Tab — Queues, Pub/Sub, Events
 * Event-driven communication layer
 */

import { Radio, Send, Inbox, Bell, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RippleJob {
  id: string;
  queue_name: string;
  payload: Record<string, unknown> | null;
  status: string;
  priority: number;
  attempts: number;
  created_at: string;
}

interface RippleTopic {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface RippleEvent {
  id: string;
  topic: string;
  event_type: string;
  payload: Record<string, unknown> | null;
  publisher_module: string | null;
  created_at: string;
}

export function RippleMessageBusTab({ enabled }: { enabled: boolean }) {
  const queryClient = useQueryClient();
  const [newTopic, setNewTopic] = useState('');
  const [publishTopic, setPublishTopic] = useState('');
  const [publishEvent, setPublishEvent] = useState('');

  // Fetch queued jobs
  const { data: jobs } = useQuery({
    queryKey: ['ripple-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ripple_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data as RippleJob[];
    },
    refetchInterval: 5000,
  });

  // Fetch topics
  const { data: topics } = useQuery({
    queryKey: ['ripple-topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ripple_topics')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as RippleTopic[];
    },
  });

  // Fetch recent events
  const { data: events } = useQuery({
    queryKey: ['ripple-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ripple_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as RippleEvent[];
    },
    refetchInterval: 3000,
  });

  // Create topic
  const createTopic = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from('ripple_topics').insert({ name });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ripple-topics'] });
      setNewTopic('');
      toast.success('Topic created');
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });

  // Publish event
  const publish = useMutation({
    mutationFn: async ({ topic, event }: { topic: string; event: string }) => {
      const { error } = await supabase.from('ripple_events').insert({
        topic,
        event_type: event,
        publisher_module: 'manual',
        payload: {},
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ripple-events'] });
      setPublishTopic('');
      setPublishEvent('');
      toast.success('Event published');
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-3 h-3 text-neon-green" />;
      case 'failed': case 'dead': return <XCircle className="w-3 h-3 text-destructive" />;
      case 'processing': return <RefreshCw className="w-3 h-3 text-neon-cyan animate-spin" />;
      default: return <Clock className="w-3 h-3 text-neon-amber" />;
    }
  };

  const queueStats = {
    pending: jobs?.filter(j => j.status === 'pending').length || 0,
    processing: jobs?.filter(j => j.status === 'processing').length || 0,
    completed: jobs?.filter(j => j.status === 'completed').length || 0,
    failed: jobs?.filter(j => ['failed', 'dead'].includes(j.status)).length || 0,
  };

  return (
    <main className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center">
            <Radio className="w-5 h-5 text-neon-cyan" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">RIPPLE Message Bus</h2>
            <p className="text-xs text-muted-foreground font-mono">
              async queues • pub/sub • event sourcing
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline" className="text-[10px] border-neon-amber/40 text-neon-amber bg-neon-amber/10">
            {queueStats.pending} pending
          </Badge>
          <Badge variant="outline" className="text-[10px] border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10">
            {queueStats.processing} active
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Queue View */}
        <Card className="lg:col-span-2 border-neon-cyan/20 bg-white/5 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Inbox className="w-4 h-4 text-neon-cyan" />
              Job Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              {jobs && jobs.length > 0 ? (
                <div className="space-y-2">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      {statusIcon(job.status)}
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-xs text-foreground">{job.queue_name}</span>
                        <div className="text-[10px] text-muted-foreground/70">
                          Attempt {job.attempts} • P{job.priority}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] shrink-0">
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground/70 text-sm italic">
                  Queue empty
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Topics & Publish */}
        <div className="space-y-4">
          <Card className="border-neon-cyan/20 bg-white/5 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bell className="w-4 h-4 text-neon-cyan" />
                Topics ({topics?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[120px] mb-3">
                <div className="space-y-1">
                  {topics?.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 p-2 rounded bg-white/5 text-xs">
                      <Radio className="w-3 h-3 text-neon-cyan" />
                      <span className="font-mono">{t.name}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {enabled && (
                <div className="flex gap-2">
                  <Input
                    placeholder="topic.name"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="h-8 text-xs font-mono bg-white/5"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3"
                    onClick={() => newTopic && createTopic.mutate(newTopic)}
                    disabled={createTopic.isPending || !newTopic}
                  >
                    +
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {enabled && (
            <Card className="border-neon-cyan/20 bg-white/5 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Send className="w-4 h-4 text-neon-cyan" />
                  Publish Event
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  placeholder="topic"
                  value={publishTopic}
                  onChange={(e) => setPublishTopic(e.target.value)}
                  className="h-8 text-xs font-mono bg-white/5"
                />
                <Input
                  placeholder="event_type"
                  value={publishEvent}
                  onChange={(e) => setPublishEvent(e.target.value)}
                  className="h-8 text-xs font-mono bg-white/5"
                />
                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => publish.mutate({ topic: publishTopic, event: publishEvent })}
                  disabled={publish.isPending || !publishTopic || !publishEvent}
                >
                  <Send className="w-3 h-3" /> Publish
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Events */}
      <Card className="border-neon-cyan/20 bg-white/5 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[150px]">
            <div className="space-y-2">
              {events?.map((e) => (
                <div key={e.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 text-xs">
                  <Radio className="w-3 h-3 text-neon-cyan shrink-0" />
                  <span className="font-mono text-muted-foreground">{e.topic}</span>
                  <span className="text-foreground">{e.event_type}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground/70">
                    {new Date(e.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </main>
  );
}
