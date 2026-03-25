/**
 * ACCESS Identity & Billing Tab — API Keys, Usage, Quotas
 * Identity and entitlement management
 */

import { Key, Plus, Copy, Trash2, BarChart3, CreditCard, Users, Activity, Eye, EyeOff } from 'lucide-react';
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

interface ApiKey {
  id: string;
  developer_id: string;
  key_prefix: string;
  name: string | null;
  scopes: string[] | null;
  rate_limit_per_minute: number | null;
  rate_limit_per_day: number | null;
  is_active: boolean | null;
  last_used_at: string | null;
  created_at: string | null;
}

interface UsageRecord {
  id: string;
  module: string;
  action: string;
  tokens_used: number | null;
  cost_millicents: number | null;
  created_at: string | null;
}

interface Subscription {
  id: string;
  developer_id: string;
  tier: string | null;
  status: string | null;
  monthly_quota: number | null;
}

export function AccessIdentityTab({ enabled }: { enabled: boolean }) {
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState('');
  const [showKey, setShowKey] = useState<string | null>(null);

  // Fetch API keys
  const { data: keys } = useQuery({
    queryKey: ['access-api-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_api_keys')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ApiKey[];
    },
  });

  // Fetch usage
  const { data: usage } = useQuery({
    queryKey: ['access-usage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_usage')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as UsageRecord[];
    },
    refetchInterval: 10000,
  });

  // Fetch subscriptions
  const { data: subscriptions } = useQuery({
    queryKey: ['access-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_subscriptions')
        .select('*')
        .limit(10);
      if (error) throw error;
      return data as Subscription[];
    },
  });

  // Create API key (simplified - in real implementation, would call edge function)
  const createKey = useMutation({
    mutationFn: async (name: string) => {
      // Generate a random key prefix for demo
      const prefix = `pf_${Math.random().toString(36).slice(2, 10)}`;
      const { error } = await supabase.from('access_api_keys').insert({
        developer_id: crypto.randomUUID(),
        key_hash: crypto.randomUUID(),
        key_prefix: prefix,
        name,
        scopes: ['*'],
        is_active: true,
      });
      if (error) throw error;
      return prefix;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-api-keys'] });
      setNewKeyName('');
      toast.success('API key created');
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });

  // Revoke key
  const revokeKey = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('access_api_keys')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-api-keys'] });
      toast.success('API key revoked');
    },
  });

  // Calculate usage stats
  const totalTokens = usage?.reduce((sum, u) => sum + (u.tokens_used || 0), 0) || 0;
  const totalCost = usage?.reduce((sum, u) => sum + (u.cost_millicents || 0), 0) || 0;
  const activeKeys = keys?.filter(k => k.is_active).length || 0;

  return (
    <main className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon-amber/20 border border-neon-amber/40 flex items-center justify-center">
            <Key className="w-5 h-5 text-neon-amber" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">ACCESS Identity & Billing</h2>
            <p className="text-xs text-muted-foreground font-mono">
              api keys • usage metering • quotas
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-neon-amber/20 bg-muted/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neon-amber/20 flex items-center justify-center">
                <Key className="w-4 h-4 text-neon-amber" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeKeys}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Active Keys</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-neon-cyan/20 bg-muted/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-neon-cyan" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalTokens.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Tokens Used</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-neon-green/20 bg-muted/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neon-green/20 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-neon-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">${(totalCost / 100000).toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Cost (USD)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-neon-purple/20 bg-muted/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neon-purple/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-neon-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{subscriptions?.length || 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* API Keys */}
        <Card className="border-neon-amber/20 bg-muted/50 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Key className="w-4 h-4 text-neon-amber" />
              API Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enabled && (
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Key name"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="h-8 text-xs bg-muted/50"
                />
                <Button
                  size="sm"
                  className="h-8 gap-2"
                  onClick={() => newKeyName && createKey.mutate(newKeyName)}
                  disabled={createKey.isPending || !newKeyName}
                >
                  <Plus className="w-3 h-3" /> Create
                </Button>
              </div>
            )}
            
            <ScrollArea className="h-[250px]">
              <div className="space-y-2">
                {keys?.map((key) => (
                  <div
                    key={key.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                      key.is_active ? "bg-muted/50" : "bg-muted/30 opacity-50"
                    )}
                  >
                    <Key className={cn("w-4 h-4", key.is_active ? "text-neon-amber" : "text-muted-foreground")} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs text-foreground">{key.name || 'Unnamed'}</span>
                        {!key.is_active && <Badge variant="secondary" className="text-[9px]">Revoked</Badge>}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <code className="font-mono text-[10px] text-muted-foreground">
                          {showKey === key.id ? `${key.key_prefix}...` : `${key.key_prefix.slice(0, 8)}...`}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4"
                          onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                        >
                          {showKey === key.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4"
                          onClick={() => {
                            navigator.clipboard.writeText(key.key_prefix);
                            toast.success('Copied prefix');
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    {enabled && key.is_active && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => revokeKey.mutate(key.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Usage Log */}
        <Card className="border-neon-amber/20 bg-muted/50 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-neon-amber" />
              Recent Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {usage?.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 text-xs">
                    <Activity className="w-3 h-3 text-neon-cyan shrink-0" />
                    <span className="font-mono text-muted-foreground">{u.module}</span>
                    <span className="text-foreground">{u.action}</span>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{u.tokens_used || 0} tokens</span>
                      <span className="text-[10px] text-neon-green">${((u.cost_millicents || 0) / 100000).toFixed(4)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
