/**
 * WebhooksTab — Manage webhook subscriptions for substrate events
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Webhook, Plus, Trash2, RefreshCw, CheckCircle, XCircle,
  Clock, Loader2, Send, AlertTriangle, Shield, Copy
} from 'lucide-react';

const EVENT_TYPES = [
  { value: 'memory.chain.discovered', label: 'Memory Chain Discovered', color: 'text-cyan-400' },
  { value: 'dream.cycle.completed', label: 'Dream Cycle Completed', color: 'text-violet-400' },
  { value: 'defense.alert', label: 'Defense Alert', color: 'text-red-400' },
  { value: 'brain.learning.complete', label: 'Brain Learning Complete', color: 'text-emerald-400' },
  { value: 'nexus.provider.degraded', label: 'Nexus Provider Degraded', color: 'text-amber-400' },
  { value: 'system.health.changed', label: 'System Health Changed', color: 'text-blue-400' },
  { value: 'pipeline.crystallized', label: 'Pipeline Crystallized', color: 'text-pink-400' },
  { value: 'audit.completed', label: 'Audit Completed', color: 'text-orange-400' },
] as const;

interface Subscription {
  id: string;
  name: string;
  url: string;
  secret: string;
  event_types: string[];
  is_active: boolean;
  failure_count: number;
  last_triggered_at: string | null;
  created_at: string;
}

interface DeliveryLog {
  id: string;
  event_type: string;
  success: boolean;
  response_status: number;
  latency_ms: number;
  delivered_at: string;
}

export function WebhooksTab() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isTesting, setIsTesting] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [subsRes, logsRes] = await Promise.all([
        supabase
          .from('webhook_subscriptions')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('webhook_delivery_log')
          .select('id, event_type, success, response_status, latency_ms, delivered_at')
          .order('delivered_at', { ascending: false })
          .limit(50),
      ]);

      setSubscriptions((subsRes.data as Subscription[]) || []);
      setDeliveryLogs((logsRes.data as DeliveryLog[]) || []);
    } catch (err) {
      console.error('Failed to fetch webhook data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const generateSecret = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return 'whsec_' + Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const createSubscription = async () => {
    if (!newName.trim() || !newUrl.trim() || selectedEvents.length === 0) {
      toast.error('Name, URL, and at least one event type are required');
      return;
    }

    try {
      new URL(newUrl);
    } catch {
      toast.error('Invalid URL format');
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be signed in to create webhooks');
        return;
      }

      const secret = generateSecret();
      const { error } = await supabase.from('webhook_subscriptions').insert({
        user_id: user.id,
        name: newName.trim(),
        url: newUrl.trim(),
        secret,
        event_types: selectedEvents,
        is_active: true,
      });

      if (error) throw error;

      toast.success('Webhook created! Save your signing secret.');
      setNewName('');
      setNewUrl('');
      setSelectedEvents([]);
      setShowCreate(false);
      fetchData();
    } catch (err: any) {
      toast.error(`Failed to create webhook: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleSubscription = async (id: string, isActive: boolean) => {
    await supabase.from('webhook_subscriptions').update({
      is_active: !isActive,
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    fetchData();
  };

  const deleteSubscription = async (id: string) => {
    if (!confirm('Delete this webhook subscription?')) return;
    await supabase.from('webhook_subscriptions').delete().eq('id', id);
    toast.success('Webhook deleted');
    fetchData();
  };

  const testWebhook = async (sub: Subscription) => {
    setIsTesting(sub.id);
    try {
      const { data, error } = await supabase.functions.invoke('pf-webhook-dispatch', {
        body: {
          event: sub.event_types[0] || 'system.health.changed',
          data: { test: true, message: 'CMPSBL webhook test ping', timestamp: new Date().toISOString() },
        },
      });

      if (error) throw error;

      if (data?.delivered > 0) {
        toast.success('Test webhook delivered successfully');
      } else {
        toast.error('Webhook test sent but delivery failed');
      }
      fetchData();
    } catch (err: any) {
      toast.error(`Test failed: ${err.message}`);
    } finally {
      setIsTesting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const successRate = deliveryLogs.length > 0
    ? Math.round((deliveryLogs.filter(l => l.success).length / deliveryLogs.length) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
            <Webhook className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Webhooks</h2>
            <p className="text-xs text-muted-foreground">
              Subscribe to real-time substrate events
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={() => setShowCreate(!showCreate)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Webhook
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-muted/20 border-border/30">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold">{subscriptions.length}</div>
            <div className="text-[10px] text-muted-foreground">Subscriptions</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/20 border-border/30">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold">{deliveryLogs.length}</div>
            <div className="text-[10px] text-muted-foreground">Deliveries</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/20 border-border/30">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">{successRate}%</div>
            <div className="text-[10px] text-muted-foreground">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Create Webhook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Name</label>
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g., Production Alerts"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Endpoint URL</label>
              <Input
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="https://your-server.com/webhooks/cmpsbl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Events</label>
              <div className="flex flex-wrap gap-2">
                {EVENT_TYPES.map(evt => {
                  const isSelected = selectedEvents.includes(evt.value);
                  return (
                    <Badge
                      key={evt.value}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer text-[10px]"
                      onClick={() => {
                        setSelectedEvents(prev =>
                          isSelected
                            ? prev.filter(e => e !== evt.value)
                            : [...prev, evt.value]
                        );
                      }}
                    >
                      {evt.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createSubscription} disabled={isCreating} className="gap-2 flex-1">
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscriptions List */}
      <div className="space-y-3">
        {subscriptions.length === 0 ? (
          <Card className="border-dashed border-border/50">
            <CardContent className="p-8 text-center text-muted-foreground text-sm">
              No webhook subscriptions yet. Create one to start receiving substrate events.
            </CardContent>
          </Card>
        ) : (
          subscriptions.map(sub => (
            <Card key={sub.id} className={`border-border/50 ${!sub.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{sub.name}</h4>
                      {sub.failure_count >= 5 && (
                        <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate">{sub.url}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={sub.is_active}
                      onCheckedChange={() => toggleSubscription(sub.id, sub.is_active)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {sub.event_types.map(evt => (
                    <Badge key={evt} variant="outline" className="text-[9px] h-5">
                      {evt}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    {sub.last_triggered_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last: {new Date(sub.last_triggered_at).toLocaleDateString()}
                      </span>
                    )}
                    {sub.failure_count > 0 && (
                      <span className="text-amber-400">{sub.failure_count} failures</span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={() => testWebhook(sub)}
                      disabled={isTesting === sub.id}
                    >
                      {isTesting === sub.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      Test
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive"
                      onClick={() => deleteSubscription(sub.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Recent Deliveries */}
      {deliveryLogs.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              Recent Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-1.5">
                {deliveryLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-2 rounded bg-muted/20 text-xs">
                    <div className="flex items-center gap-2">
                      {log.success ? (
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3 h-3 text-destructive" />
                      )}
                      <Badge variant="outline" className="text-[9px] h-4">{log.event_type}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>{log.response_status || '—'}</span>
                      <span className="font-mono">{log.latency_ms}ms</span>
                      <span>{new Date(log.delivered_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
