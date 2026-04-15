/**
 * V2 Results Step — Display results + export
 * Uses V2 categories and orchestrator snapshots.
 */

import { useState, useEffect, useMemo } from 'react';
import { Trophy, Download, RotateCcw, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { completeRun, getSnapshot } from '@/lib/ascension-v2';
import { getChainState, getChainIntegrityHash } from '@/lib/ascension-v2/audit-chain';
import { generateCapabilityPackZip, type CapabilityForExport } from '@/lib/proprietary-evolution/zip-generator';

interface Props {
  stats: { discovered: number; ascended: number; topScore: number };
  onReset: () => void;
}

interface AscendedItem {
  name: string;
  score: number;
  tier: string;
  description: string;
}

export function V2ResultsStep({ stats, onReset }: Props) {
  const [items, setItems] = useState<AscendedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [integrityHash, setIntegrityHash] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Mark run complete in orchestrator
    completeRun();

    // Get integrity hash
    getChainIntegrityHash().then(setIntegrityHash);

    if (!user) return;
    (async () => {
      // Fetch ascended capabilities from v2 category
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('artifact_registry')
        .select('name, metadata, tier, description')
        .eq('user_id', user.id)
        .eq('category', 'proprietary-ascended-v2')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data && data.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setItems(data.map((d: any) => ({
          name: d.name?.replace(/_/g, ' ') || 'Capability',
          score: Number(d.metadata?.cjpi_score || 0),
          tier: d.tier || 'mint',
          description: d.description || '',
        })));
      } else {
        // Fallback: use discovery data if ascended category empty
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: discData } = await (supabase as any)
          .from('artifact_registry')
          .select('name, metadata, tier, description')
          .eq('user_id', user.id)
          .eq('category', 'proprietary-discovery-v2')
          .order('created_at', { ascending: false })
          .limit(50);

        if (discData) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setItems(discData.map((d: any) => ({
            name: d.name?.replace(/_/g, ' ') || 'Capability',
            score: Number(d.metadata?.cjpi_score || 0),
            tier: d.tier || 'mint',
            description: d.description || '',
          })));
        }
      }

      setLoading(false);
    })();
  }, [user]);

  const avgScore = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.round(items.reduce((sum, i) => sum + i.score, 0) / items.length);
  }, [items]);

  const scoreColor = (s: number) =>
    s >= 85 ? 'text-amber-500' : s >= 60 ? 'text-primary' : 'text-muted-foreground';

  const handleExport = async () => {
    if (!user || items.length === 0) return;
    setExporting(true);

    try {
      const caps: CapabilityForExport[] = items.map((item, i) => ({
        id: `asc_v2_${i}_${Date.now().toString(36)}`,
        name: item.name.replace(/\s+/g, '_'),
        tier: item.tier,
        cjpiScore: item.score,
        description: item.description,
        chain: [],
        fingerprint: `fp_${item.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now().toString(36)}`,
        moatSignature: `moat_${Date.now().toString(36)}`,
        capabilityType: 'ascended',
      }));

      await generateCapabilityPackZip({
        targetLanguage: 'typescript',
        capabilities: caps,
        candidateName: 'ascension_v2_export',
        userSourceFiles: [],
        sourceLanguage: 'typescript',
      });

      toast({ title: 'Export complete', description: `${items.length} capabilities exported.` });
    } catch (err) {
      toast({ title: 'Export failed', description: String(err), variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const snapshot = getSnapshot();
  const chain = getChainState();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Trophy className="w-10 h-10 mx-auto text-primary" />
        <h2 className="text-xl font-bold text-foreground">Your Results</h2>
        <p className="text-muted-foreground text-sm">
          {items.length > 0
            ? `${items.length} capabilities discovered and locked`
            : 'No strong matches found — try richer source code'}
        </p>
      </div>

      {/* Summary stats */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/30 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{items.length}</p>
            <p className="text-[10px] text-muted-foreground">Capabilities</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{avgScore}</p>
            <p className="text-[10px] text-muted-foreground">Avg Score</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.topScore}</p>
            <p className="text-[10px] text-muted-foreground">Top Score</p>
          </div>
        </div>
      )}

      {/* Capability list */}
      {items.length > 0 && (
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/20 transition-colors">
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                )}
              </div>
              <span className={cn('text-sm font-mono font-bold', scoreColor(item.score))}>
                {item.score}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Audit chain integrity badge */}
      <div className="bg-muted/20 rounded-xl p-3 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground">
            Audit Chain: {chain.length} entries · {chain.verified ? 'Verified ✓' : 'Broken ✗'}
          </p>
          {integrityHash && (
            <p className="text-[10px] text-muted-foreground font-mono truncate">
              SHA-256: {integrityHash.slice(0, 24)}…
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {items.length > 0 && (
          <Button onClick={handleExport} disabled={exporting} className="w-full h-11 rounded-xl">
            {exporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {exporting ? 'Generating…' : 'Download All Capabilities'}
          </Button>
        )}

        <Button variant="ghost" onClick={onReset} className="w-full">
          <RotateCcw className="w-3 h-3 mr-1" />
          Start Over with New Code
        </Button>
      </div>
    </div>
  );
}
