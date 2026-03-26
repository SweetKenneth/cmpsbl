/**
 * AIPatchQueue — GPT-generated patch review interface for the Evolution Control Center
 * Governor reviews diffs, AI reasoning, and approves/rejects patches
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain, CheckCircle, XCircle, Play, Eye,
  FileCode, AlertTriangle, Sparkles, Clock,
  ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  generateAIPatch, storePatch, listPatches, updatePatchStatus,
  type PatchCandidate, type GeneratedPatch
} from '@/lib/evolve/ai-patch-generator';
import { cn } from '@/lib/utils';

// ── Demo Candidates ────────────────────────────────────────

const DEMO_CANDIDATES: PatchCandidate[] = [
  {
    id: 'cand-001',
    category: 'optimize',
    title: 'Reduce re-renders in Mesh Communications feed',
    description: 'The MeshComms component re-renders on every telemetry tick. Memoize filtered results and use useMemo for derived data.',
    targetModule: 'CORTEX',
    targetFiles: ['src/components/mesh/MeshCommsFeed.tsx'],
    severity: 0.6,
    confidence: 0.85,
    sourceScanner: 'CDM',
  },
  {
    id: 'cand-002',
    category: 'security',
    title: 'Sanitize user input in DECODE chat resolver',
    description: 'Chat input passed to resolver without sanitization. Add XSS protection and input length validation.',
    targetModule: 'DECODE',
    targetFiles: ['src/lib/substrate/decode-module/resolvers.ts'],
    severity: 0.9,
    confidence: 0.92,
    sourceScanner: 'Scanner',
  },
  {
    id: 'cand-003',
    category: 'refactor',
    title: 'Extract shared telemetry hook pattern',
    description: 'Multiple hooks duplicate the same polling + debug-mode check pattern. Extract to useTelemetryQuery.',
    targetModule: 'CORE',
    targetFiles: ['src/lib/substrate/hooks.ts'],
    severity: 0.4,
    confidence: 0.78,
    sourceScanner: 'CLM',
  },
];

// ── Status Badge ───────────────────────────────────────────

function StatusBadge({ status }: { status: GeneratedPatch['status'] }) {
  const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'Pending Review', variant: 'outline' },
    approved: { label: 'Approved', variant: 'default' },
    rejected: { label: 'Rejected', variant: 'destructive' },
    shadow_running: { label: 'Shadow Running', variant: 'secondary' },
    promoted: { label: 'Promoted', variant: 'default' },
    rolled_back: { label: 'Rolled Back', variant: 'destructive' },
  };
  const c = config[status] || config.pending;
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

// ── Risk Badge ─────────────────────────────────────────────

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    low: 'text-emerald-400 bg-emerald-400/10',
    medium: 'text-amber-400 bg-amber-400/10',
    high: 'text-red-400 bg-red-400/10',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-mono', colors[level] || colors.medium)}>
      {level} risk
    </span>
  );
}

// ── Patch Card ─────────────────────────────────────────────

function PatchCard({ patch, onAction }: { patch: GeneratedPatch; onAction: (id: string, action: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-border/30 bg-card/60">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px]">{patch.category}</Badge>
              <StatusBadge status={patch.status} />
              <RiskBadge level={patch.estimatedImpact.riskLevel} />
            </div>
            <CardTitle className="text-sm">{patch.title}</CardTitle>
              <p className="text-xs text-muted-foreground font-mono">
                {patch.model} • {patch.tokensUsed} tokens{typeof patch.estimatedCostUsd === 'number' ? ` • $${patch.estimatedCostUsd.toFixed(4)}` : ''} • {patch.changes.length} file(s)
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-4">
          {/* AI Reasoning */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Brain className="w-3 h-3" /> AI Reasoning
            </div>
            <p className="text-xs text-foreground/80 bg-muted/30 rounded-lg p-3 font-mono">
              {patch.reasoning}
            </p>
          </div>

          {/* Changes */}
          {patch.changes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <FileCode className="w-3 h-3" /> Changes
              </div>
              {patch.changes.map((change, i) => (
                <div key={i} className="bg-muted/20 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="text-[9px]">{change.operation}</Badge>
                    <span className="font-mono text-foreground/70">{change.filePath}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{change.explanation}</p>
                  {change.diff && (
                    <pre className="text-[10px] font-mono bg-background/50 rounded p-2 overflow-x-auto max-h-48 text-foreground/60">
                      {change.diff}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Impact */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/20 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground">Health Δ</p>
              <p className={cn("text-sm font-mono font-bold",
                patch.estimatedImpact.healthDelta > 0 ? "text-emerald-400" : "text-muted-foreground"
              )}>
                {patch.estimatedImpact.healthDelta > 0 ? '+' : ''}{patch.estimatedImpact.healthDelta}
              </p>
            </div>
            <div className="bg-muted/20 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground">Debt Δ</p>
              <p className={cn("text-sm font-mono font-bold",
                patch.estimatedImpact.debtReduction > 0 ? "text-emerald-400" : "text-muted-foreground"
              )}>
                -{patch.estimatedImpact.debtReduction}
              </p>
            </div>
            <div className="bg-muted/20 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground">Confidence</p>
              <p className="text-sm font-mono font-bold text-foreground">{(patch.confidence * 100).toFixed(0)}%</p>
            </div>
          </div>

          {/* Actions */}
          {patch.status === 'pending' && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onAction(patch.patchId, 'approve')} className="flex-1">
                <CheckCircle className="w-3 h-3 mr-1" /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => onAction(patch.patchId, 'shadow')}>
                <Play className="w-3 h-3 mr-1" /> Shadow Run
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onAction(patch.patchId, 'reject')}>
                <XCircle className="w-3 h-3 mr-1" /> Reject
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ── Main Component ─────────────────────────────────────────

export function AIPatchQueue() {
  const [patches, setPatches] = useState<GeneratedPatch[]>(() => listPatches());
  const [generating, setGenerating] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string>(DEMO_CANDIDATES[0].id);

  const refreshPatches = useCallback(() => setPatches(listPatches()), []);

  const handleGenerate = async () => {
    const candidate = DEMO_CANDIDATES.find(c => c.id === selectedCandidate);
    if (!candidate) return;

    setGenerating(true);
    toast.info(`Generating patch via GPT for: ${candidate.title}`);

    try {
      const patch = await generateAIPatch(candidate);
      storePatch(patch);
      refreshPatches();

      if (patch.status === 'rejected') {
        toast.error(`Patch generation failed: ${patch.reasoning}`);
      } else {
        toast.success(`Patch generated: ${patch.changes.length} change(s), ${(patch.confidence * 100).toFixed(0)}% confidence`);
      }
    } catch (err) {
      toast.error('Patch generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleAction = (patchId: string, action: string) => {
    const statusMap: Record<string, GeneratedPatch['status']> = {
      approve: 'approved',
      reject: 'rejected',
      shadow: 'shadow_running',
    };
    const newStatus = statusMap[action];
    if (!newStatus) return;

    updatePatchStatus(patchId, newStatus);
    refreshPatches();
    toast.success(`Patch ${action}ed`);
  };

  return (
    <div className="space-y-4">
      {/* Generation Panel */}
      <Card className="border-border/30 bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Patch Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Select a discovery candidate to generate a GPT-backed code patch for evolution review.
          </p>

          <div className="space-y-2">
            {DEMO_CANDIDATES.map(c => (
              <label
                key={c.id}
                className={cn(
                  "flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors",
                  selectedCandidate === c.id
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/20 hover:border-border/40"
                )}
              >
                <input
                  type="radio"
                  name="candidate"
                  value={c.id}
                  checked={selectedCandidate === c.id}
                  onChange={() => setSelectedCandidate(c.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[9px]">{c.category}</Badge>
                    <span className="text-xs font-medium truncate">{c.title}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{c.description}</p>
                  <p className="text-[9px] text-muted-foreground/60 font-mono mt-0.5">
                    {c.sourceScanner} • {c.targetModule} • severity {(c.severity * 100).toFixed(0)}%
                  </p>
                </div>
              </label>
            ))}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full"
            size="sm"
          >
            {generating ? (
              <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating via NEXUS...</>
            ) : (
              <><Brain className="w-3 h-3 mr-1" /> Generate AI Patch</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Patch Queue */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Patch Queue
            {patches.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">{patches.length}</Badge>
            )}
          </h3>
        </div>

        {patches.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            <Brain className="w-6 h-6 mx-auto mb-2 opacity-30" />
            No patches generated yet. Select a candidate above and generate.
          </div>
        ) : (
          patches.map(p => (
            <PatchCard key={p.patchId} patch={p} onAction={handleAction} />
          ))
        )}
      </div>
    </div>
  );
}
