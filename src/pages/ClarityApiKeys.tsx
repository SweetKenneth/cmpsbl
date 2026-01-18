import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Copy, Trash2, Key, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKey {
  id: string;
  key_name: string;
  api_key_hash: string;
  last_used_at?: string | null;
  rate_limit_per_hour?: number;
  is_active?: boolean;
  created_at: string;
  user_id: string;
  metadata?: any;
}

export default function ClarityApiKeys() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('pf_clarity_api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKeys(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading API keys',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: 'Key name required',
        description: 'Please enter a name for your API key',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Use server-side key generation for security
      const { data, error } = await supabase.rpc('generate_clarity_api_key', {
        p_user_id: user.id,
        p_key_name: newKeyName,
        p_rate_limit: 1000
      });

      if (error) throw error;

      // The server returns the plaintext key only once
      const keyData = data as { api_key: string; key_id: string; key_prefix: string; key_name: string };
      setNewKey(keyData.api_key);
      setNewKeyName('');
      loadApiKeys();

      toast({
        title: 'API key created',
        description: 'Save this key securely - you won\'t see it again',
      });
    } catch (error: any) {
      toast({
        title: 'Error creating API key',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pf_clarity_api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'API key deleted',
        description: 'The API key has been removed',
      });

      loadApiKeys();
    } catch (error: any) {
      toast({
        title: 'Error deleting API key',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'API key copied to clipboard',
    });
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
          <Key className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">API Keys</h1>
            <p className="text-muted-foreground">Manage API keys for programmatic access</p>
          </div>
        </div>

        {newKey && (
          <Card className="p-6 mb-8 bg-primary/5 border-primary">
            <h3 className="text-lg font-semibold mb-2">Your New API Key</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Save this key securely. You won't be able to see it again.
            </p>
            <div className="flex items-center gap-2">
              <Input value={newKey} readOnly className="font-mono text-sm" />
              <Button onClick={() => copyToClipboard(newKey)} variant="outline">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={() => setNewKey(null)}
              variant="ghost"
              size="sm"
              className="mt-4"
            >
              Close
            </Button>
          </Card>
        )}

        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Create New API Key</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Production API Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createApiKey()}
              />
            </div>
            <Button onClick={createApiKey} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Key
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your API Keys</h3>
          {keys.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No API keys yet. Create one to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {keys.map((key) => (
                <Card key={key.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{key.key_name}</h4>
                        <Badge variant={key.is_active ? 'default' : 'secondary'}>
                          {key.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(key.created_at).toLocaleDateString()}
                        {key.last_used_at && ` · Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Rate limit: {key.rate_limit_per_hour} requests/hour
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteApiKey(key.id)}
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

        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">API Documentation</h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Authentication</h4>
              <p className="text-muted-foreground">Include your API key in the request header:</p>
              <code className="block bg-muted p-2 rounded mt-2">
                x-api-key: clarity_your_api_key_here
              </code>
            </div>
            <div>
              <h4 className="font-medium mb-2">Base URL</h4>
              <code className="block bg-muted p-2 rounded">
                POST /functions/v1/pf-clarity-api
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Full endpoint URL provided with API key.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Endpoints</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• GET /sites - List all sites</li>
                <li>• POST /sites - Create new site</li>
                <li>• GET /scans - List all scans</li>
                <li>• GET /issues?scan_id=xxx - List issues for a scan</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
