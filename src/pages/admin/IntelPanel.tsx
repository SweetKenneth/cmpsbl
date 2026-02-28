/**
 * INTEL Panel — Founder-Only Control Plane Dashboard
 * 
 * Calm, card-based comprehension of the entire CMPSBL substrate.
 * Light-mode aligned, print-friendly, investor-grade.
 * Mobile-first responsive design.
 * 
 * v13: Evolution proposals are export-only. No internal apply controls.
 */

import { useState } from 'react';
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
  Loader2, RefreshCw, Download, ExternalLink, MoreHorizontal,
  Sparkles,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { IntelCard, TopicMasteryHighlight, EngineerProposal } from '@/lib/control-plane/types';
import { generateEvolutionReport, generateAllExportableReports, type EvolutionProposalReport } from '@/lib/evolve/proposal-report';
import { getExecutionModeConfig } from '@/lib/evolve/execution-mode';
import { generateUnifiedProposal, type UnifiedProposal } from '@/lib/control-plane/intel/proposal-generator';

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
// INTEL CARD COMPONENT — Mobile-first
// ═══════════════════════════════════════════════════════════════════════════════

function IntelCardView({ card }: { card: IntelCard }) {
  const Icon = severityIcons[card.severity] ?? CheckCircle;
  
  return (
    <Card className={`border-l-4 ${severityStyles[card.severity] ?? ''} print:break-inside-avoid`}>
      <CardHeader className="p-3 sm:p-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
            <CardTitle className="text-xs sm:text-sm font-semibold leading-tight line-clamp-2">{card.headline}</CardTitle>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-6 sm:ml-0">
            <Badge variant={severityBadgeVariant[card.severity]} className="text-[10px] sm:text-xs">{card.severity}</Badge>
            {card.occurrence_count > 1 && (
              <Badge variant="outline" className="text-[10px] sm:text-xs">×{card.occurrence_count}</Badge>
            )}
          </div>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground ml-6 sm:ml-0">{card.source} · {card.category}</p>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 space-y-2 text-xs sm:text-sm">
        <div>
          <p className="font-medium text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">What changed</p>
          <p>{card.what_changed}</p>
        </div>
        <div>
          <p className="font-medium text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Why it matters</p>
          <p>{card.why_it_matters}</p>
        </div>
        <div>
          <p className="font-medium text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Next step</p>
          <p>{card.suggested_next_step}</p>
        </div>
        
        {Object.keys(card.details_json).length > 0 && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className="w-3 h-3" /> Details
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="mt-2 p-2 rounded bg-muted/50 text-[10px] sm:text-xs overflow-auto max-h-40 font-mono">
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
// MASTERY ITEM — Mobile-first
// ═══════════════════════════════════════════════════════════════════════════════

function MasteryItem({ item }: { item: TopicMasteryHighlight }) {
  const statusColors: Record<string, string> = {
    mastered: 'text-green-700 bg-green-50',
    progressing: 'text-blue-700 bg-blue-50',
    stale: 'text-amber-700 bg-amber-50',
    new: 'text-gray-600 bg-gray-50',
  };
  
  return (
    <div className="flex items-center justify-between py-1.5 gap-2">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <span className="text-[10px] sm:text-xs font-mono text-muted-foreground w-12 sm:w-16 flex-shrink-0 truncate">{item.node}</span>
        <span className="text-xs sm:text-sm truncate">{item.topic_title}</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <div className="w-10 sm:w-16 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${Math.round(item.mastery_score * 100)}%` }}
          />
        </div>
        <Badge variant="outline" className={`text-[10px] sm:text-xs ${statusColors[item.status] ?? ''}`}>
          {item.status}
        </Badge>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROPOSAL EXPORT CARD — Mobile-first
// ═══════════════════════════════════════════════════════════════════════════════

function ProposalExportCard({ proposal }: { proposal: EngineerProposal }) {
  const [exportedReport, setExportedReport] = useState<EvolutionProposalReport | null>(null);

  const handleExport = () => {
    const result = generateEvolutionReport(proposal.id);
    if (result.success && result.report) {
      setExportedReport(result.report);
      navigator.clipboard.writeText(JSON.stringify(result.report, null, 2));
      toast.success('Proposal report copied to clipboard');
    } else {
      toast.error(result.error || 'Export failed');
    }
  };

  const handleDownload = () => {
    if (!exportedReport) return;
    const blob = new Blob([JSON.stringify(exportedReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evolution-proposal-${proposal.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isExportable = proposal.status === 'draft' || proposal.status === 'reviewed';

  return (
    <Card className="border-l-4 border-l-primary/40">
      <CardHeader className="p-3 sm:p-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
          <CardTitle className="text-xs sm:text-sm">{proposal.title}</CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px] sm:text-xs">{proposal.status}</Badge>
            <Badge variant="outline" className="text-[10px] sm:text-xs">
              risk: {proposal.risk_level}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-[10px] sm:text-xs">{proposal.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 space-y-2">
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          <span className="font-medium">Scope:</span> {proposal.scope} · <span className="font-medium">Rollback:</span> {proposal.rollback_plan}
        </p>
        
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {isExportable && (
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleExport}>
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Export to AI
            </Button>
          )}
          {exportedReport && (
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleDownload}>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download .json
            </Button>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground italic">
          Execution handled externally.
        </p>

        {exportedReport && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className="w-3 h-3" /> Exported Report JSON
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="mt-2 p-2 rounded bg-muted/50 text-[10px] overflow-auto max-h-60 font-mono">
                {JSON.stringify(exportedReport, null, 2)}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PANEL — Mobile-first
// ═══════════════════════════════════════════════════════════════════════════════

export default function IntelPanel() {
  const { data, isLoading, refetch, isRefetching } = useIntelPanel();
  const executionMode = getExecutionModeConfig();
  const [unifiedProposal, setUnifiedProposal] = useState<UnifiedProposal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleCopyReport = () => {
    if (!data?.exportReport) return;
    navigator.clipboard.writeText(JSON.stringify(data.exportReport, null, 2));
    toast.success('Report copied to clipboard');
  };

  const handleExportAll = () => {
    const { reports, errors } = generateAllExportableReports();
    if (reports.length > 0) {
      const blob = new Blob([JSON.stringify(reports, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evolution-proposals-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${reports.length} proposal(s)`);
    } else {
      toast.info('No exportable proposals found');
    }
    if (errors.length > 0) {
      console.warn('[INTEL] Export errors:', errors);
    }
  };

  const handleGenerateProposal = async () => {
    setIsGenerating(true);
    try {
      // Run maintenance battery first to get fresh data
      await refetch();
      const proposal = await generateUnifiedProposal();
      setUnifiedProposal(proposal);
      navigator.clipboard.writeText(JSON.stringify(proposal, null, 2));
      toast.success(`Proposal generated — ${proposal.action_plan.length} action steps from ${proposal.metadata.sources.length} sources. Copied to clipboard.`);
    } catch (err) {
      toast.error('Failed to generate proposal');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadProposal = () => {
    if (!unifiedProposal) return;
    const blob = new Blob([JSON.stringify(unifiedProposal, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unified-proposal-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Proposal downloaded');
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
      <div className="space-y-4 sm:space-y-6 print:space-y-4">
        {/* Header — stacks on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">INTEL Panel</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Control Plane · Founder-Only · Execution: <span className="font-mono font-semibold">{executionMode.mode}</span>
            </p>
          </div>
          
          {/* Desktop actions */}
           <div className="hidden md:flex items-center gap-2 print:hidden">
            <Button onClick={handleGenerateProposal} disabled={isGenerating} size="sm">
              {isGenerating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
              Generate Proposal
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw className={`w-4 h-4 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyReport}>
              <Copy className="w-4 h-4 mr-1.5" />
              Copy JSON Report
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportAll}>
              <Download className="w-4 h-4 mr-1.5" />
              Export All Proposals
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <FileText className="w-4 h-4 mr-1.5" />
              Print
            </Button>
          </div>

          {/* Mobile actions — compact dropdown */}
          <div className="flex md:hidden items-center gap-2 print:hidden">
            <Button size="sm" className="h-8" onClick={handleGenerateProposal} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span className="ml-1.5">Propose</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyReport}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy JSON Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportAll}>
                  <Download className="w-4 h-4 mr-2" />
                  Export All Proposals
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.print()}>
                  <FileText className="w-4 h-4 mr-2" />
                  Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Execution Mode Banner */}
        {executionMode.mode === 'external-ai' && (
          <Card className="border-l-4 border-l-primary bg-primary/5 print:break-inside-avoid">
            <CardContent className="p-3 sm:pt-4 sm:pb-3 sm:px-4 flex items-start sm:items-center gap-2 sm:gap-3">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-foreground">External AI Execution Mode Active</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Internal mutation authority is revoked. Proposals must be exported and executed externally.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Unified Proposal Output */}
        {unifiedProposal && (
          <Card className="border-l-4 border-l-primary bg-primary/5 print:break-inside-avoid">
            <CardHeader className="p-3 sm:p-4 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  <CardTitle className="text-sm sm:text-base">Unified Proposal</CardTitle>
                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                    {unifiedProposal.action_plan.length} steps
                  </Badge>
                  <Badge variant={unifiedProposal.guardrails.estimated_risk === 'high' ? 'destructive' : 'secondary'} className="text-[10px] sm:text-xs">
                    risk: {unifiedProposal.guardrails.estimated_risk}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(unifiedProposal, null, 2));
                    toast.success('Copied to clipboard');
                  }}>
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleDownloadProposal}>
                    <Download className="w-3 h-3 mr-1" /> Download
                  </Button>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{unifiedProposal.executive_summary}</p>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-lg font-bold text-destructive">{unifiedProposal.technical_debt.critical.length}</p>
                  <p className="text-[10px] text-muted-foreground">Critical Debt</p>
                </div>
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-lg font-bold text-foreground">{unifiedProposal.evolution_opportunities.total}</p>
                  <p className="text-[10px] text-muted-foreground">Evolutions</p>
                </div>
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-lg font-bold text-foreground">{unifiedProposal.diligence.passed}/{unifiedProposal.diligence.total}</p>
                  <p className="text-[10px] text-muted-foreground">Diligence</p>
                </div>
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-lg font-bold text-foreground">{unifiedProposal.audit_health.compliance_score}%</p>
                  <p className="text-[10px] text-muted-foreground">Audit Score</p>
                </div>
              </div>

              {/* Action Plan */}
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-foreground hover:text-primary transition-colors w-full">
                  <ChevronDown className="w-3.5 h-3.5" /> Action Plan ({unifiedProposal.action_plan.length} steps)
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  {unifiedProposal.action_plan.map((step) => (
                    <div key={step.order} className="border rounded p-2 sm:p-3 space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-mono bg-muted rounded px-1.5 py-0.5 flex-shrink-0">#{step.order}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-medium">{step.title}</span>
                            <Badge variant={step.risk === 'high' ? 'destructive' : step.risk === 'medium' ? 'secondary' : 'outline'} className="text-[10px]">
                              {step.risk}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">{step.category}</Badge>
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{step.description}</p>
                          <ul className="mt-1 space-y-0.5">
                            {step.instructions.map((inst, i) => (
                              <li key={i} className="text-[10px] sm:text-xs text-muted-foreground flex items-start gap-1">
                                <span className="text-primary mt-0.5">→</span> {inst}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Raw JSON */}
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronDown className="w-3 h-3" /> Full JSON (paste to your agent)
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <pre className="mt-2 p-2 rounded bg-muted/50 text-[10px] overflow-auto max-h-60 font-mono">
                    {JSON.stringify(unifiedProposal, null, 2)}
                  </pre>
                </CollapsibleContent>
              </Collapsible>

              <p className="text-[10px] text-muted-foreground italic">
                ⚠️ Human-in-the-loop: Review each step before giving to your coding agent. Rollback instructions included.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Executive Summary — 2-col on mobile, 4-col on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <SummaryTile label="Total Signals" value={summary.total_signals} icon={Activity} />
          <SummaryTile label="Critical" value={summary.critical_count} icon={AlertTriangle} accent={summary.critical_count > 0 ? 'red' : undefined} />
          <SummaryTile label="Warnings" value={summary.warn_count} icon={Shield} accent={summary.warn_count > 0 ? 'amber' : undefined} />
          <SummaryTile label="Active Findings" value={engineerStats.active_findings} icon={Zap} />
        </div>
        
        {/* Critical Issues */}
        {criticals.length > 0 && (
          <section>
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
              Critical Issues
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {criticals.map(card => <IntelCardView key={card.id} card={card} />)}
            </div>
          </section>
        )}
        
        {/* Recent Signals */}
        <section>
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-foreground">Recent Signals</h2>
          <ScrollArea className="max-h-[400px] sm:max-h-[500px]">
            <div className="space-y-2 sm:space-y-3">
              {cards.filter(c => c.severity !== 'critical').slice(0, 20).map(card => (
                <IntelCardView key={card.id} card={card} />
              ))}
              {cards.length === 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground py-8 text-center">No signals collected yet. Run a maintenance battery to populate.</p>
              )}
            </div>
          </ScrollArea>
        </section>
        
        <Separator />
        
        {/* ENGINEER Proposals — Export Only */}
        <section>
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-foreground flex items-center gap-2 flex-wrap">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Evolution Proposals
            <Badge variant="outline" className="text-[10px] sm:text-xs">export-only</Badge>
          </h2>
          {proposals.length > 0 ? (
            <div className="space-y-2">
              {proposals.map(p => (
                <ProposalExportCard key={p.id} proposal={p} />
              ))}
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-muted-foreground py-4 text-center">No pending proposals.</p>
          )}
        </section>
        
        {/* CLM Topic Mastery */}
        <section>
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-foreground flex items-center gap-2">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Topic Mastery
          </h2>
          <Card>
            <CardContent className="p-3 sm:pt-4 sm:px-4 divide-y divide-border">
              {topicMastery.slice(0, 20).map((item, i) => (
                <MasteryItem key={i} item={item} />
              ))}
              {topicMastery.length === 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground py-4 text-center">Topic pipeline not yet initialized.</p>
              )}
            </CardContent>
          </Card>
        </section>
        
        {/* Crown Jewels Status */}
        <section>
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Crown Jewels & Packs
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
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
// SUMMARY TILE — Mobile-first compact
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
      <CardContent className="p-3 sm:pt-4 sm:pb-3 sm:px-4 flex items-center gap-2 sm:gap-3">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
        <div className="min-w-0">
          <p className={`text-lg sm:text-xl font-bold ${accentClass}`}>{value}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
