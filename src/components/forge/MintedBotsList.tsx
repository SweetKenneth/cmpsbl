/**
 * Minted Bots List Component
 * Display and manage previously minted bots
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Bot, Download, RotateCw, Cpu, Database, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

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
  created_at: string;
  updated_at: string;
}

export function MintedBotsList() {
  const [exportingId, setExportingId] = useState<string | null>(null);

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
      const { data, error } = await supabase.functions.invoke('pf-forge-mint', {
        body: {
          bot_name: bot.name,
          bot_type: bot.type,
          memory_mode: bot.memory_mode,
          provider_stack: bot.providers,
          capabilities: bot.capabilities,
          delivery_format: 'Download',
        },
      });

      if (error) throw error;

      if (data?.data?.artifacts) {
        const content = Object.entries(data.data.artifacts)
          .map(([filename, code]) => `// ===== ${filename} =====\n\n${code}\n`)
          .join('\n\n');

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${bot.slug}-cognitive-bot.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Bot package exported');
      }
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export bot');
    } finally {
      setExportingId(null);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Research': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'Analyst': return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'Planner': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'Strategist': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'Hybrid': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30';
      default: return 'bg-muted';
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
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!bots || bots.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Bot className="w-10 h-10 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-1">No Bots Minted</h3>
          <p className="text-sm text-muted-foreground">
            Create your first cognitive bot using the Build tab.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Your Bots</h3>
          <p className="text-sm text-muted-foreground">{bots.length} bot{bots.length !== 1 ? 's' : ''} minted</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-2">
          <RotateCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {bots.map(bot => (
            <Card key={bot.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium truncate">{bot.name}</h4>
                      <Badge className={getTypeColor(bot.type)}>{bot.type}</Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="text-xs gap-1">
                        {getMemoryIcon(bot.memory_mode)}
                        {bot.memory_mode}
                      </Badge>
                      {Array.isArray(bot.providers) && bot.providers.slice(0, 3).map((p, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {String(p)}
                        </Badge>
                      ))}
                      {Array.isArray(bot.providers) && bot.providers.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{bot.providers.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Created {formatDistanceToNow(new Date(bot.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(bot)}
                    disabled={exportingId === bot.id}
                    className="gap-2 shrink-0"
                  >
                    {exportingId === bot.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
