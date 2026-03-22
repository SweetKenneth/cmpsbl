/**
 * Minted Bots List Component
 * Display and manage previously minted bots with neon aesthetics
 * Mobile-first responsive design
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { 
  Loader2, Bot, Download, RotateCw, Cpu, Database, Zap, 
  Play, ArrowUpCircle, Package, ChevronRight, Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';
import { BotVersionBadge } from './BotVersionBadge';
import { VersionBumpDialog } from './VersionBumpDialog';
import { BotRuntimeDialog } from './BotRuntimeDialog';
import { createExportBundle, downloadBundle } from '@/services/botExporter';
import { cn } from '@/lib/utils';

interface BotRow {
  id: string;
  name: string;
  type: string;
  memory_mode: string;
  providers: Json;
  capabilities: Json;
  delivery_format: string;
  slug: string | null;
  export_path: string | null;
  current_version: string | null;
  created_at: string;
  updated_at: string;
}

export function MintedBotsList() {
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [bumpBot, setBumpBot] = useState<BotRow | null>(null);
  const [runBot, setRunBot] = useState<BotRow | null>(null);

  const { data: bots, isLoading, refetch } = useQuery({
    queryKey: ['minted-bots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BotRow[];
    },
  });

  const handleExport = async (bot: BotRow) => {
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
      toast.success('Bot package exported');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export bot');
    } finally {
      setExportingId(null);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Research': return 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50';
      case 'Analyst': return 'bg-neon-magenta/20 text-neon-magenta border-neon-magenta/50';
      case 'Planner': return 'bg-neon-green/20 text-neon-green border-neon-green/50';
      case 'Strategist': return 'bg-neon-amber/20 text-neon-amber border-neon-amber/50';
      case 'Hybrid': return 'bg-neon-purple/20 text-neon-purple border-neon-purple/50';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getMemoryIcon = (mode: string) => {
    switch (mode) {
      case 'Stateless': return <Zap className="w-3 h-3" />;
      case 'Episodic': return <Cpu className="w-3 h-3" />;
      case 'Persistent': return <Database className="w-3 h-3" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="relative">
            <Loader2 className="w-8 h-8 animate-spin text-neon-cyan mx-auto" />
            <div className="absolute inset-0 w-8 h-8 mx-auto rounded-full bg-neon-cyan/30 blur-xl animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground font-mono">loading bots...</p>
        </div>
      </div>
    );
  }

  if (!bots || bots.length === 0) {
    return (
      <div className="rounded-xl border-dashed border border-white/10 bg-white/5 backdrop-blur-xl p-12 text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <Bot className="w-16 h-16 text-muted-foreground/30" />
          <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 rounded-full blur-xl" />
        </div>
        <h3 className="text-lg font-medium mb-1 text-foreground">No Bots Minted</h3>
        <p className="text-sm text-muted-foreground">
          Create your first cognitive bot using the Build tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neon-cyan" />
            Your Bots
          </h3>
          <p className="text-sm text-muted-foreground font-mono">
            {bots.length} bot{bots.length !== 1 ? 's' : ''} minted
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()} 
          className="gap-2 border-border/50 hover:border-neon-cyan/50 hover:bg-neon-cyan/10"
        >
          <RotateCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Bot List */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-3 pr-2">
          {bots.map(bot => (
            <div 
              key={bot.id} 
              className={cn(
                "group rounded-xl border bg-white/5 dark:bg-white/[0.03] backdrop-blur-xl transition-all duration-300",
                "border-white/10 hover:border-neon-cyan/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]"
              )}
            >
              <div className="p-4">
                {/* Mobile-first: Stack on mobile, row on larger screens */}
                <div className="flex flex-col gap-4">
                  {/* Top Row: Name, Type, Version */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Name with version */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-foreground break-words">
                          {bot.name}
                        </h4>
                        <Badge className={cn("shrink-0", getTypeColor(bot.type))}>
                          {bot.type}
                        </Badge>
                        <BotVersionBadge 
                          version={bot.current_version || '1.0.0'} 
                          hasUpdate={false}
                        />
                      </div>
                      
                      {/* Memory Mode & Providers */}
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          variant="outline" 
                          className="text-xs gap-1 border-border/50 bg-black/20"
                        >
                          {getMemoryIcon(bot.memory_mode)}
                          <span className="truncate">{bot.memory_mode}</span>
                        </Badge>
                        {Array.isArray(bot.providers) && bot.providers.slice(0, 2).map((p, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary" 
                            className="text-xs bg-muted/30 border border-border/30"
                          >
                            {String(p)}
                          </Badge>
                        ))}
                        {Array.isArray(bot.providers) && bot.providers.length > 2 && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-muted/30 border border-border/30"
                          >
                            +{bot.providers.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Row: Timestamp & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground font-mono">
                      Created {formatDistanceToNow(new Date(bot.created_at), { addSuffix: true })}
                    </p>
                    
                    {/* Action Buttons - responsive grid on mobile */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRunBot(bot)}
                        className="gap-1.5 text-xs h-8 hover:bg-neon-green/10 hover:text-neon-green"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Run</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBumpBot(bot)}
                        className="gap-1.5 text-xs h-8 hover:bg-neon-magenta/10 hover:text-neon-magenta"
                      >
                        <ArrowUpCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Bump</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(bot)}
                        disabled={exportingId === bot.id}
                        className="gap-1.5 text-xs h-8 border-neon-cyan/30 hover:bg-neon-cyan/10 hover:border-neon-cyan/50"
                      >
                        {exportingId === bot.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Package className="w-3.5 h-3.5" />
                        )}
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Dialogs */}
      {bumpBot && (
        <VersionBumpDialog
          open={!!bumpBot}
          onOpenChange={() => setBumpBot(null)}
          currentVersion={bumpBot.current_version || '1.0.0'}
          botName={bumpBot.name}
          onBump={async (type, changelog) => {
            const { error } = await supabase.functions.invoke('pf-forge-mint', {
              body: { action: 'bump_version', bot_id: bumpBot.id, bump_type: type, changelog },
            });
            if (error) throw error;
            refetch();
            toast.success('Version bumped');
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
