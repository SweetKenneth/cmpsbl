/**
 * Forge Catalog — Bot Catalog View
 * Operator-only catalog for browsing and managing cognitive bots
 */

import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Grid, List, Search, Filter } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { OSHeader } from '@/components/substrate-os/OSHeader';
import { BotCatalogCard } from '@/components/forge/BotCatalogCard';
import { VersionBumpDialog } from '@/components/forge/VersionBumpDialog';
import { BotRuntimeDialog } from '@/components/forge/BotRuntimeDialog';
import { createExportBundle, downloadBundle } from '@/services/botExporter';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

interface BotWithVersion {
  id: string;
  name: string;
  slug: string;
  type: string;
  memory_mode: string;
  providers: Json;
  capabilities: Json;
  current_version: string;
  created_at: string;
}

export default function ForgeCatalog() {
  const { user, loading: authLoading } = useAuth();
  const { role, isOperator, loading: roleLoading } = useUserRole();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [bumpBot, setBumpBot] = useState<BotWithVersion | null>(null);
  const [runBot, setRunBot] = useState<BotWithVersion | null>(null);

  const { data: bots, isLoading } = useQuery({
    queryKey: ['catalog-bots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bots')
        .select('id, name, slug, type, memory_mode, providers, capabilities, current_version, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BotWithVersion[];
    },
  });

  const bumpVersionMutation = useMutation({
    mutationFn: async ({ botId, bumpType, changelog }: { botId: string; bumpType: string; changelog: string }) => {
      const { data, error } = await supabase.functions.invoke('pf-forge-mint', {
        body: { action: 'bump_version', bot_id: botId, bump_type: bumpType, changelog },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-bots'] });
      toast.success('Version bumped successfully');
    },
    onError: () => toast.error('Failed to bump version'),
  });

  const handleExport = async (bot: BotWithVersion) => {
    setExportingId(bot.id);
    try {
      const bundle = await createExportBundle({
        id: bot.id,
        name: bot.name,
        slug: bot.slug || bot.name.toLowerCase().replace(/\s+/g, '-'),
        type: bot.type,
        version: bot.current_version || '1.0.0',
        memoryMode: bot.memory_mode,
        providers: Array.isArray(bot.providers) ? bot.providers.map(String) : [],
        capabilities: Array.isArray(bot.capabilities) ? bot.capabilities.map(String) : [],
      });
      downloadBundle(bundle);
      toast.success('Export bundle downloaded');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExportingId(null);
    }
  };

  const filteredBots = bots?.filter(bot => 
    bot.name.toLowerCase().includes(search.toLowerCase()) ||
    bot.type.toLowerCase().includes(search.toLowerCase())
  );

  if (!authLoading && !user) return <Navigate to="/auth" replace />;
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!isOperator) return <Navigate to="/forge" replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Bot Catalog — promptfluid®" description="Browse and manage cognitive bots" />
      <OSHeader userEmail={user?.email} role={role} />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Bot Catalog</h1>
            <p className="text-sm text-muted-foreground">{bots?.length || 0} bots available</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search bots..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
              <Grid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : !filteredBots?.length ? (
          <Card className="border-dashed"><CardContent className="py-12 text-center text-muted-foreground">No bots found</CardContent></Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {filteredBots.map(bot => (
              <BotCatalogCard
                key={bot.id}
                id={bot.id}
                name={bot.name}
                slug={bot.slug || ''}
                type={bot.type}
                version={bot.current_version || '1.0.0'}
                memoryMode={bot.memory_mode}
                providers={Array.isArray(bot.providers) ? bot.providers.map(String) : []}
                capabilities={Array.isArray(bot.capabilities) ? bot.capabilities.map(String) : []}
                createdAt={bot.created_at}
                isOperator={isOperator}
                onExport={() => handleExport(bot)}
                onBumpVersion={() => setBumpBot(bot)}
                onRun={() => setRunBot(bot)}
                exporting={exportingId === bot.id}
              />
            ))}
          </div>
        )}
      </main>

      {bumpBot && (
        <VersionBumpDialog
          open={!!bumpBot}
          onOpenChange={() => setBumpBot(null)}
          currentVersion={bumpBot.current_version || '1.0.0'}
          botName={bumpBot.name}
          onBump={async (type, changelog) => {
            await bumpVersionMutation.mutateAsync({ botId: bumpBot.id, bumpType: type, changelog });
          }}
        />
      )}

      {runBot && (
        <BotRuntimeDialog
          open={!!runBot}
          onOpenChange={() => setRunBot(null)}
          botId={runBot.id}
          botName={runBot.name}
          botVersion={runBot.current_version || '1.0.0'}
        />
      )}
    </div>
  );
}
