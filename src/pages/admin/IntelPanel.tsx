/**
 * Evolution Control Plane — Portable, OS-grade admin surface.
 * 
 * Sections:
 *   1. System Integrity (Structural + Production Audit + Compliance)
 *   2. Bounded Action Plan (max 5 proposals)
 *   3. Governance Receipts (receipt_id, diff_hash, verification_hash, snapshot_id)
 *   4. Install Mode (endpoint /evolution/export)
 * 
 * Light theme only. No substrate-specific branding.
 * External-AI execution barrier enforced.
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
  Copy, ChevronDown, FileText, TrendingUp,
  Loader2, RefreshCw, Download, ExternalLink, MoreHorizontal,
  Sparkles, Terminal, Hash,
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
  critical: 'border-l-destructive bg-red-50/50',
  warn: 'border-l-neon-amber bg-amber-50/30',
  info: 'border-l-neon-blue bg-blue-50/20',
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
    <Card className={`border-l-4 ${severityStyles[card.severity] ?? ''} print:break-inside-avoid hover:shadow-sm transition-all duration-300`}>
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
// MASTERY ITEM
// ═══════════════════════════════════════════════════════════════════════════════

function MasteryItem({ item }: { item: TopicMasteryHighlight }) {
  const statusColors: Record<string, string> = {
    mastered: 'text-neon-green bg-green-50',
    progressing: 'text-neon-blue bg-blue-50',
    stale: 'text-neon-amber bg-amber-50',
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
// PROPOSAL EXPORT CARD
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
    <Card className="border-l-4 border-l-primary/40 hover:shadow-sm transition-all duration-300">
      <CardHeader className="p-3 sm:p-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
          <CardTitle className="text-xs sm:text-sm">{proposal.title}</CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px] sm:text-xs">{proposal.status}</Badge>
            <Badge variant="outline" className="text-[10px] sm:text-xs">risk: {proposal.risk_level}</Badge>
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
// GOVERNANCE RECEIPTS SECTION
// ═══════════════════════════════════════════════════════════════════════════════

function GovernanceReceipts({ governance }: { governance: UnifiedProposal['governance'] }) {
  return (
    <Card className="border-l-4 border-l-primary/30 hover:shadow-sm transition-all duration-300">
      <CardHeader className="p-3 sm:p-4 pb-2">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm">Governance Receipts</CardTitle>
        </div>
        <CardDescription className="text-[10px] sm:text-xs">Cryptographic lifecycle chain for this proposal run</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: 'Snapshot ID', value: governance.snapshot_id },
            { label: 'Receipt ID', value: governance.receipt_id },
            { label: 'Verification Hash', value: governance.verification_hash },
            { label: 'Diff Hash', value: governance.diff_hash },
            { label: 'SEBA Lineage', value: governance.seba_stamp.lineage_id },
            { label: 'SEBA Signature', value: governance.seba_stamp.signature },
          ].map(({ label, value }) => (
            <div key={label} className="bg-muted/40 rounded p-2 space-y-0.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
              <p className="text-xs font-mono truncate" title={value}>{value}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Discipline: {governance.seba_stamp.discipline} · Stage: {governance.seba_stamp.stage}
        </p>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSTALL MODE SECTION
// ═══════════════════════════════════════════════════════════════════════════════

function InstallModeSection() {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'bxodolqqczjuahwdrswy';
  const exportEndpoint = `https://${projectId}.supabase.co/functions/v1/evolution-control`;
  
  return (
    <Card className="border-l-4 border-l-muted-foreground/30">
      <CardHeader className="p-3 sm:p-4 pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <CardTitle className="text-sm">Install Mode</CardTitle>
          <Badge variant="outline" className="text-[10px]">API</Badge>
        </div>
        <CardDescription className="text-[10px] sm:text-xs">Runtime endpoints for external agent consumption</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
        <div className="space-y-2">
          <div className="bg-muted/40 rounded p-2">
            <p className="text-[10px] text-muted-foreground uppercase font-medium mb-1">Export Proposal</p>
            <code className="text-xs font-mono block break-all">POST {exportEndpoint}?action=export</code>
            <p className="text-[10px] text-muted-foreground mt-1">Returns stamped unified proposal JSON. Requires API key.</p>
          </div>
          <div className="bg-muted/40 rounded p-2">
            <p className="text-[10px] text-muted-foreground uppercase font-medium mb-1">Record Applied</p>
            <code className="text-xs font-mono block break-all">POST {exportEndpoint}?action=applied</code>
            <p className="text-[10px] text-muted-foreground mt-1">Records external application. Body: proposal_id, receipt_id, verification_hash.</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 text-xs"
          onClick={() => {
            navigator.clipboard.writeText(exportEndpoint);
            toast.success('Endpoint copied');
          }}
        >
          <Copy className="w-3 h-3 mr-1" /> Copy Endpoint
        </Button>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PANEL — Evolution Control Plane
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
      console.warn('[EVO-CP] Export errors:', errors);
    }
  };

  const handleGenerateProposal = async () => {
    setIsGenerating(true);
    try {
      await refetch();
      const proposal = await generateUnifiedProposal();
      setUnifiedProposal(proposal);
      navigator.clipboard.writeText(JSON.stringify(proposal, null, 2));
      toast.success(`v3.3 proposal generated — ${proposal.action_plan.length} bounded steps from ${proposal.metadata.sources.length} sources. Copied to clipboard.`);
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
    a.download = `evolution-proposal-v3.3-${new Date().toISOString().slice(0, 10)}.json`;
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
          <p>Data unavailable. Try refreshing.</p>
        </div>
      </AdminLayout>
    );
  }
  
  const { summary, criticals, cards, engineerStats, findings, proposals, topicMastery } = data;
  
  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 print:space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Evolution Control Plane</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Bounded Proposals · Execution: <span className="font-mono font-semibold">{executionMode.mode}</span> · Schema v3.3
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
              Copy Report
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportAll}>
              <Download className="w-4 h-4 mr-1.5" />
              Export All
            </Button>
          </div>

          {/* Mobile actions */}
          <div className="flex md:hidden items-center gap-2 print:hidden">
            <Button size="sm" className="h-8" onClick={handleGenerateProposal} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span className="ml-1.5">Propose</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={() => refetch()} disabled={isRefetching} aria-label="Refresh">
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8" aria-label="More actions">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyReport}>
                  <Copy className="w-4 h-4 mr-2" /> Copy Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportAll}>
                  <Download className="w-4 h-4 mr-2" /> Export All
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
                  Internal mutation authority revoked. Proposals export-only. Max 5 per run.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Unified Proposal Output */}
        {unifiedProposal && (
          <>
            <Card className="border-l-4 border-l-primary bg-primary/5 print:break-inside-avoid">
              <CardHeader className="p-3 sm:p-4 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    <CardTitle className="text-sm sm:text-base">Bounded Proposal v3.3</CardTitle>
                    <Badge variant="outline" className="text-[10px] sm:text-xs">
                      {unifiedProposal.action_plan.length}/5 steps
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
                {/* Section 1: System Integrity */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-muted/50 rounded p-2">
                    <p className={`text-lg font-bold ${unifiedProposal.structural_health.overall_verdict === 'PASS' ? 'text-neon-green' : 'text-destructive'}`}>
                      {unifiedProposal.structural_health.overall_verdict}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Structure</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <p className={`text-lg font-bold ${unifiedProposal.production_audit.passed ? 'text-neon-green' : 'text-destructive'}`}>
                      {unifiedProposal.production_audit.passed ? 'PASS' : 'FAIL'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Prod Audit</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <p className="text-lg font-bold text-foreground">{unifiedProposal.audit_health.compliance_score}%</p>
                    <p className="text-[10px] text-muted-foreground">Compliance</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <p className="text-lg font-bold text-foreground">{unifiedProposal.ratio.debt_pct}/{unifiedProposal.ratio.evolution_pct}</p>
                    <p className="text-[10px] text-muted-foreground">Debt/Evo %</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-muted/50 rounded p-2">
                    <p className="text-lg font-bold text-destructive">{unifiedProposal.technical_debt.critical.length}</p>
                    <p className="text-[10px] text-muted-foreground">Critical Debt</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <p className={`text-lg font-bold ${unifiedProposal.accessibility.score >= 80 ? 'text-neon-green' : unifiedProposal.accessibility.score >= 50 ? 'text-neon-amber' : 'text-destructive'}`}>
                      {unifiedProposal.accessibility.score}/100
                    </p>
                    <p className="text-[10px] text-muted-foreground">INCLUSIVE</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <p className={`text-lg font-bold ${unifiedProposal.security_posture.threat_level === 'low' ? 'text-neon-green' : unifiedProposal.security_posture.threat_level === 'medium' ? 'text-neon-amber' : 'text-destructive'}`}>
                      {unifiedProposal.security_posture.threat_level.toUpperCase()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">DEFENSE</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <p className="text-lg font-bold text-foreground">{unifiedProposal.metadata.sources.length}</p>
                    <p className="text-[10px] text-muted-foreground">Audit Sources</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-muted/50 rounded p-2">
                    <p className={`text-lg font-bold ${unifiedProposal.evolution_scan.scan_completed ? 'text-neon-green' : 'text-destructive'}`}>
                      {unifiedProposal.evolution_scan.scan_completed ? 'OK' : 'FAIL'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">EVOLUTION</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <p className="text-lg font-bold text-foreground">{unifiedProposal.evolution_scan.modules_active}</p>
                    <p className="text-[10px] text-muted-foreground">Active Modules</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <p className="text-lg font-bold text-foreground">{unifiedProposal.evolution_scan.edge_risk_flags}</p>
                    <p className="text-[10px] text-muted-foreground">Edge Risks</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <p className="text-lg font-bold text-foreground">{unifiedProposal.evolution_scan.health_overall}</p>
                    <p className="text-[10px] text-muted-foreground">Health Score</p>
                  </div>
                </div>

                {/* Section 2: Bounded Action Plan */}
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-foreground hover:text-primary transition-colors w-full">
                    <ChevronDown className="w-3.5 h-3.5" /> Bounded Action Plan ({unifiedProposal.action_plan.length}/{unifiedProposal.metadata.discipline.max_proposals} max)
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

                {/* Section 3: Governance Receipts (inline) */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-1 text-xs font-semibold text-foreground hover:text-primary transition-colors">
                    <ChevronDown className="w-3.5 h-3.5" /> Governance Receipts
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {[
                        ['Snapshot', unifiedProposal.governance.snapshot_id],
                        ['Receipt', unifiedProposal.governance.receipt_id],
                        ['Verify Hash', unifiedProposal.governance.verification_hash],
                        ['Diff Hash', unifiedProposal.governance.diff_hash],
                        ['SEBA Lineage', unifiedProposal.governance.seba_stamp.lineage_id],
                        ['SEBA Sig', unifiedProposal.governance.seba_stamp.signature],
                      ].map(([label, val]) => (
                        <div key={label} className="bg-muted/30 rounded px-2 py-1.5">
                          <p className="text-[10px] text-muted-foreground">{label}</p>
                          <p className="font-mono text-[10px] truncate" title={val}>{val}</p>
                        </div>
                      ))}
                    </div>
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
                  ⚠️ Human-in-the-loop: Review each step before giving to your coding agent. Rollback via snapshot {unifiedProposal.governance.snapshot_id}.
                </p>
              </CardContent>
            </Card>

            {/* Standalone Governance Receipts card */}
            <GovernanceReceipts governance={unifiedProposal.governance} />
          </>
        )}

        {/* Section 1: System Integrity Summary */}
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
        
        {/* Evolution Proposals — Export Only */}
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
                <p className="text-xs sm:text-sm text-muted-foreground py-4 text-center">Topic system not yet initialized.</p>
              )}
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Section 4: Install Mode */}
        <InstallModeSection />
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
  const accentClass = accent === 'red' ? 'text-destructive' : accent === 'amber' ? 'text-neon-amber' : accent === 'green' ? 'text-neon-green' : 'text-foreground';
  
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
