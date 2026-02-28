/**
 * INTEL Panel — Founder-Only Control Plane Dashboard
 * 
 * Calm, card-based comprehension of the entire CMPSBL substrate.
 * Light-mode aligned, print-friendly, investor-grade.
 */

import { useIntelPanel } from '@/hooks/admin/useIntelPanel';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Shield, Activity, Brain, Zap, AlertTriangle, CheckCircle,
  Copy, ChevronDown, FileText, Lock, Unlock, TrendingUp,
  Loader2, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import type { IntelCard, TopicMasteryHighlight } from '@/lib/control-plane/types';

// ═══════════════════════════════════════════════════════════════════════════════
// SEVERITY STYLING
// ═══════════════════════════════════════════════════════════════════════════════

const severityStyles: Record<string, string> = {
  critical: 'border-l-red-500 bg-red-50/50',
  warn: 'border-l-amber-500 bg-amber-50/30',
  info: 'border-l-blue-500 bg-blue-50/20',
};

const severityIcons: Record<string, typeof AlertTriangle> = {
  critical: AlertTriangle,
  warn: Activity,
  info: CheckCircle,
};

const severityBadgeVariant: Record<string, 'destructive' | 'secondary' | 'outline'> = {
  critical: 'destructive',
  warn: 'secondary',
  info: 'outline',
};

// ═══════════════════════════════════════════════════════════════════════════════
// INTEL CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function IntelCardView({ card }: { card: IntelCard }) {
  const Icon = severityIcons[card.severity] ?? CheckCircle;
  
  return (
    <Card className={`border-l-4 ${severityStyles[card.severity] ?? ''} print:break-inside-avoid`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold leading-tight">{card.headline}</CardTitle>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Badge variant={severityBadgeVariant[card.severity]}>{card.severity}</Badge>
            {card.occurrence_count > 1 && (
              <Badge variant="outline" className="text-xs">×{card.occurrence_count}</Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{card.source} · {card.category}</p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>
          <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide">What changed</p>
          <p>{card.what_changed}</p>
        </div>
        <div>
          <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Why it matters</p>
          <p>{card.why_it_matters}</p>
        </div>
        <div>
          <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Next step</p>
          <p>{card.suggested_next_step}</p>
        </div>
        
        {Object.keys(card.details_json).length > 0 && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className="w-3 h-3" /> Details
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="mt-2 p-2 rounded bg-muted/50 text-xs overflow-auto max-h-40 font-mono">
                {JSON.stringify(card.details_json, null, 2)}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MASTERY ITEM
// ═══════════════════════════════════════════════════════════════════════════════

function MasteryItem({ item }: { item: TopicMasteryHighlight }) {
  const statusColors: Record<string, string> = {
    mastered: 'text-green-700 bg-green-50',
    progressing: 'text-blue-700 bg-blue-50',
    stale: 'text-amber-700 bg-amber-50',
    new: 'text-gray-600 bg-gray-50',
  };
  
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-mono text-muted-foreground w-16 flex-shrink-0">{item.node}</span>
        <span className="text-sm truncate">{item.topic_title}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${Math.round(item.mastery_score * 100)}%` }}
          />
        </div>
        <Badge variant="outline" className={`text-xs ${statusColors[item.status] ?? ''}`}>
          {item.status}
        </Badge>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PANEL
// ═══════════════════════════════════════════════════════════════════════════════

export default function IntelPanel() {
  const { data, isLoading, refetch, isRefetching } = useIntelPanel();
  
  const handleCopyReport = () => {
    if (!data?.exportReport) return;
    navigator.clipboard.writeText(JSON.stringify(data.exportReport, null, 2));
    toast.success('Report copied to clipboard');
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground text-sm">Running maintenance battery…</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  if (!data) {
    return (
      <AdminLayout>
        <div className="text-center py-20 text-muted-foreground">
          <p>INTEL data unavailable. Try refreshing.</p>
        </div>
      </AdminLayout>
    );
  }
  
  const { summary, criticals, cards, engineerStats, findings, proposals, topicMastery, crownJewels } = data;
  
  return (
    <AdminLayout>
      <div className="space-y-6 print:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">INTEL Panel</h1>
            <p className="text-sm text-muted-foreground">Control Plane · Founder-Only</p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyReport}>
              <Copy className="w-4 h-4 mr-1.5" />
              Copy JSON Report
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <FileText className="w-4 h-4 mr-1.5" />
              Print
            </Button>
          </div>
        </div>
        
        {/* Executive Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryTile label="Total Signals" value={summary.total_signals} icon={Activity} />
          <SummaryTile label="Critical" value={summary.critical_count} icon={AlertTriangle} accent={summary.critical_count > 0 ? 'red' : undefined} />
          <SummaryTile label="Warnings" value={summary.warn_count} icon={Shield} accent={summary.warn_count > 0 ? 'amber' : undefined} />
          <SummaryTile label="Active Findings" value={engineerStats.active_findings} icon={Zap} />
        </div>
        
        {/* Critical Issues */}
        {criticals.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Critical Issues
            </h2>
            <div className="space-y-3">
              {criticals.map(card => <IntelCardView key={card.id} card={card} />)}
            </div>
          </section>
        )}
        
        {/* Recent Signals */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Recent Signals</h2>
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-3">
              {cards.filter(c => c.severity !== 'critical').slice(0, 20).map(card => (
                <IntelCardView key={card.id} card={card} />
              ))}
              {cards.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">No signals collected yet. Run a maintenance battery to populate.</p>
              )}
            </div>
          </ScrollArea>
        </section>
        
        <Separator />
        
        {/* ENGINEER Proposals */}
        {proposals.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              ENGINEER Proposals
            </h2>
            <div className="space-y-2">
              {proposals.map(p => (
                <Card key={p.id} className="border-l-4 border-l-primary/40">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{p.title}</CardTitle>
                      <Badge variant="outline">{p.status}</Badge>
                    </div>
                    <CardDescription className="text-xs">{p.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    <span className="font-medium">Risk:</span> {p.risk_level} · <span className="font-medium">Rollback:</span> {p.rollback_plan}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
        
        {/* CLM Topic Mastery */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Topic Mastery
          </h2>
          <Card>
            <CardContent className="pt-4 divide-y divide-border">
              {topicMastery.slice(0, 20).map((item, i) => (
                <MasteryItem key={i} item={item} />
              ))}
              {topicMastery.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">Topic pipeline not yet initialized.</p>
              )}
            </CardContent>
          </Card>
        </section>
        
        {/* Crown Jewels Status */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Crown Jewels & Packs
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryTile label="Released" value={crownJewels.released} icon={Unlock} accent="green" />
            <SummaryTile label="Reserved" value={crownJewels.gatekept} icon={Lock} />
            <SummaryTile label="Total Packs" value={crownJewels.packCount} icon={FileText} />
            <SummaryTile label="Pack Components" value={crownJewels.totalPackComponents} icon={Zap} />
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY TILE
// ═══════════════════════════════════════════════════════════════════════════════

function SummaryTile({ label, value, icon: Icon, accent }: {
  label: string;
  value: number;
  icon: typeof Activity;
  accent?: 'red' | 'amber' | 'green';
}) {
  const accentClass = accent === 'red' ? 'text-red-600' : accent === 'amber' ? 'text-amber-600' : accent === 'green' ? 'text-green-600' : 'text-foreground';
  
  return (
    <Card className="print:break-inside-avoid">
      <CardContent className="pt-4 pb-3 flex items-center gap-3">
        <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <div>
          <p className={`text-xl font-bold ${accentClass}`}>{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
