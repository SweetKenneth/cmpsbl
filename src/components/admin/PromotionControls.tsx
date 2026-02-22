/**
 * Promotion Controls Panel — Run promotion, view recent promotions, audit trail
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rocket, RotateCcw, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { runPromotion, getPromotionReceipts } from '@/lib/substrate/promotion-pipeline';
import type { ProductionPromotion, PromotionResult, DiffSummary } from '@/lib/substrate/promotion-pipeline/types';
import { toast } from 'sonner';

interface PromotionControlsProps {
  promotions: ProductionPromotion[];
  onPromotionComplete?: (result: PromotionResult) => void;
  onRefresh?: () => void;
}

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  success: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Success' },
  failed: { icon: XCircle, color: 'text-red-400', label: 'Failed' },
  rolled_back: { icon: RotateCcw, color: 'text-amber-400', label: 'Rolled Back' },
  pending: { icon: Clock, color: 'text-blue-400', label: 'Pending' },
  canary: { icon: AlertTriangle, color: 'text-amber-400', label: 'Canary' },
};

export function PromotionControls({ promotions, onPromotionComplete, onRefresh }: PromotionControlsProps) {
  const [promoting, setPromoting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<Record<string, any[]>>({});

  const handlePromote = async () => {
    setPromoting(true);
    try {
      const shadowRunId = `shadow_${Date.now()}`;
      const result = await runPromotion(shadowRunId);
      
      if (result.success) {
        toast.success('Promotion successful — upgrade verified');
      } else {
        toast.error(`Promotion blocked: ${result.failure_reason}`);
      }
      
      onPromotionComplete?.(result);
      onRefresh?.();
    } catch (err: any) {
      toast.error('Promotion failed: ' + err.message);
    } finally {
      setPromoting(false);
    }
  };

  const toggleReceipts = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!receipts[id]) {
      const r = await getPromotionReceipts(id);
      setReceipts(prev => ({ ...prev, [id]: r }));
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Rocket className="w-4 h-4 text-primary" />
            Production Promotion
          </CardTitle>
          <Button
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handlePromote}
            disabled={promoting}
          >
            <Rocket className="w-3.5 h-3.5" />
            {promoting ? 'Promoting...' : 'Run Governed Promote'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {promotions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No promotions yet. Run a governed promotion to see audit history.
          </p>
        )}

        <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
          {promotions.map((p) => {
            const cfg = statusConfig[p.status] ?? statusConfig.pending;
            const Icon = cfg.icon;
            const isExpanded = expandedId === p.id;
            
            return (
              <motion.div key={p.id} layout>
                <button
                  className="w-full text-left p-3 rounded-lg border border-border/30 hover:border-border/60 bg-card/50 transition-colors"
                  onClick={() => toggleReceipts(p.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                      <span className="text-xs font-medium">{cfg.label}</span>
                      <Badge variant="outline" className="text-[9px] font-mono">{p.id.slice(0, 8)}</Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(p.created_at).toLocaleString()}
                    </span>
                  </div>
                  {p.failure_reason && (
                    <p className="text-[10px] text-red-400 mt-1 truncate">{p.failure_reason}</p>
                  )}
                </button>

                {isExpanded && receipts[p.id] && (
                  <motion.div
                    className="ml-4 mt-1 space-y-1"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    {receipts[p.id].map((r: any) => (
                      <div key={r.id} className="p-2 rounded border border-border/20 text-[10px] flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px]">{r.stage}</Badge>
                        <span className={r.outcome === 'passed' || r.outcome === 'success' ? 'text-emerald-400' : r.outcome === 'blocked' || r.outcome === 'failed' ? 'text-red-400' : 'text-muted-foreground'}>
                          {r.outcome}
                        </span>
                        <span className="text-muted-foreground ml-auto">{new Date(r.created_at).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
