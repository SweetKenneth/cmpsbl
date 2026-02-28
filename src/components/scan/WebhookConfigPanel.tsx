/**
 * Webhook Configuration Panel — Item #12
 * UI for managing scan webhooks
 */

import { useState, useEffect } from 'react';
import { Plus, Trash2, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserWebhooks, registerWebhook, type WebhookConfig } from '@/lib/scan/scan-webhooks';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function WebhookConfigPanel() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getUserWebhooks().then(w => {
      setWebhooks(w);
      setLoading(false);
    });
  }, []);

  const handleAdd = async () => {
    if (!newUrl.trim()) return;
    try {
      new URL(newUrl); // validate
    } catch {
      toast.error('Invalid URL');
      return;
    }
    setSaving(true);
    const id = await registerWebhook({ url: newUrl.trim() });
    if (id) {
      setWebhooks(prev => [...prev, { id, url: newUrl.trim(), events: ['scan.completed'], is_active: true }]);
      setNewUrl('');
      toast.success('Webhook registered');
    } else {
      toast.error('Failed to register webhook');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('scan_webhooks').update({ is_active: false }).eq('id', id);
    setWebhooks(prev => prev.filter(w => w.id !== id));
    toast.success('Webhook removed');
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm p-4">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading webhooks...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Globe className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Scan Webhooks</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Receive POST notifications when scans complete. Payload includes domain, score, and findings.
      </p>

      {/* Existing webhooks */}
      <div className="space-y-2">
        {webhooks.map(w => (
          <div key={w.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
            <code className="flex-1 text-xs text-foreground truncate">{w.url}</code>
            <span className="text-xs text-muted-foreground">{w.events.join(', ')}</span>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id)} className="h-8 w-8">
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
        {webhooks.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No webhooks configured yet.</p>
        )}
      </div>

      {/* Add new */}
      <div className="flex gap-2">
        <input
          type="url"
          value={newUrl}
          onChange={e => setNewUrl(e.target.value)}
          placeholder="https://your-server.com/webhook"
          className="flex-1 px-3 py-2 text-sm bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={saving} size="sm" className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add
        </Button>
      </div>
    </div>
  );
}
