import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Trash2, Webhook, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WebhookConfig {
  id: string;
  webhook_url: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

const availableEvents = [
  { id: 'scan.completed', label: 'Scan Completed' },
  { id: 'scan.failed', label: 'Scan Failed' },
  { id: 'issue.detected', label: 'Issue Detected' },
  { id: 'issue.fixed', label: 'Issue Fixed' },
  { id: 'site.created', label: 'Site Created' },
];

export default function ClarityWebhooks() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('pf_clarity_webhooks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading webhooks',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createWebhook = async () => {
    if (!newUrl.trim() || selectedEvents.length === 0) {
      toast({
        title: 'Invalid configuration',
        description: 'Please enter a webhook URL and select at least one event',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const secret = `whsec_${crypto.randomUUID().replace(/-/g, '')}`;
      
      // Hash the secret before storing (SHA-256)
      const encoder = new TextEncoder();
      const data = encoder.encode(secret);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const secretHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { error } = await supabase
        .from('pf_clarity_webhooks')
        .insert({
          user_id: user.id,
          webhook_url: newUrl,
          events: selectedEvents,
          secret_hash: secretHash,
        });

      if (error) throw error;

      toast({
        title: 'Webhook created',
        description: 'Your webhook has been configured successfully',
      });

      setNewUrl('');
      setSelectedEvents([]);
      loadWebhooks();
    } catch (error: any) {
      toast({
        title: 'Error creating webhook',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pf_clarity_webhooks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Webhook deleted',
        description: 'The webhook has been removed',
      });

      loadWebhooks();
    } catch (error: any) {
      toast({
        title: 'Error deleting webhook',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/clarity/dashboard')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Webhook className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Webhooks</h1>
            <p className="text-muted-foreground">Configure event notifications for your integrations</p>
          </div>
        </div>

        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Create New Webhook</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://your-domain.com/webhook"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-3 block">Events to Subscribe</Label>
              <div className="space-y-2">
                {availableEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-2">
                    <Checkbox
                      id={event.id}
                      checked={selectedEvents.includes(event.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEvents([...selectedEvents, event.id]);
                        } else {
                          setSelectedEvents(selectedEvents.filter((e) => e !== event.id));
                        }
                      }}
                    />
                    <Label htmlFor={event.id} className="cursor-pointer">
                      {event.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={createWebhook} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Webhook
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Webhooks</h3>
          {webhooks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No webhooks configured yet. Create one to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <Card key={webhook.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-sm font-mono">{webhook.webhook_url}</code>
                        <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                          {webhook.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(webhook.created_at).toLocaleDateString()}
                        {webhook.last_triggered_at &&
                          ` · Last triggered ${new Date(webhook.last_triggered_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteWebhook(webhook.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
