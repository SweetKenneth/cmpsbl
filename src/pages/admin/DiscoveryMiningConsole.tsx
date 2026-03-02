/**
 * Admin → Discovery Mining Console
 * Mobile-first, no truncation, full audit trail.
 */
import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useDiscoveryReactor } from '@/hooks/admin/useDiscoveryReactor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import {
  Zap, Play, History, FlaskConical, Target, TrendingUp,
  Shield, Brain, Cpu, Eye, Scale, GitBranch, Loader2,
  Download, Star, ChevronDown, ChevronUp, Plus, Copy, Check,
} from 'lucide-react';
import type { ReactorRunResult, ReactorCandidate } from '@/lib/discovery/reactor';

const TIER_COLORS: Record<string, string> = {
  'cmpsbl-only': 'bg-red-500/20 text-red-400 border-red-500/30',
  'enterprise': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'architect': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'creator': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const CATEGORY_ICONS: Record<string, typeof Brain> = {
  cognitive: Brain, evolution: TrendingUp, security: Shield,
  routing: GitBranch, learning: FlaskConical, orchestration: Cpu,
  observability: Eye, governance: Scale, integration: Zap,
};

function TierBadge({ tier }: { tier: string | null }) {
  if (!tier) return <Badge variant="outline" className="text-xs">Untiered</Badge>;
  return (
    <Badge className={`text-xs border ${TIER_COLORS[tier] || ''}`}>
      {tier.toUpperCase()}
    </Badge>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const Icon = CATEGORY_ICONS[category] || Zap;
  return (
    <Badge variant="outline" className="text-xs gap-1">
      <Icon className="w-3 h-3" />
      {category}
    </Badge>
  );
}

function RunSummaryCard({ result }: { result: ReactorRunResult }) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2 flex-wrap">
          <Target className="w-5 h-5 text-primary shrink-0" />
          Latest Run Summary
          {result.dryRun && <Badge variant="outline" className="text-xs">DRY RUN</Badge>}
        </CardTitle>
        <CardDescription>{result.durationMs}ms • {new Date().toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-xl sm:text-2xl font-bold text-foreground">{result.totalCandidates}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Candidates</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-xl sm:text-2xl font-bold text-primary">{result.acceptedCount}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Accepted (80+)</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-xl sm:text-2xl font-bold text-foreground">{result.topFind?.cjpi ?? '—'}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Top CJPI</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-xl sm:text-2xl font-bold text-foreground">{Object.keys(result.byCategory).length}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Categories</div>
          </div>
        </div>

        {result.topFind && (
          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="text-xs text-muted-foreground mb-1">🏆 Top Discovery</div>
            <div className="font-semibold text-foreground break-words">{result.topFind.name}</div>
            <div className="text-sm text-primary font-mono">{result.topFind.cjpi} CJPI</div>
          </div>
        )}

        {/* Distribution */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">By Category</div>
            <div className="space-y-1">
              {Object.entries(result.byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between text-xs py-0.5">
                  <CategoryBadge category={cat} />
                  <span className="font-mono text-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">By Tier</div>
            <div className="space-y-1">
              {Object.entries(result.byTier).sort((a, b) => b[1] - a[1]).map(([tier, count]) => (
                <div key={tier} className="flex items-center justify-between text-xs py-0.5">
                  <TierBadge tier={tier} />
                  <span className="font-mono text-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Discovery Card (mobile-first, no truncation) ─────────────────

function DiscoveryCard({
  d, index, onMark
}: {
  d: ReactorCandidate; index: number; onMark: (id: string, val: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-border/50">
      <CardContent className="p-3 sm:p-4">
        {/* Top badges */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="font-mono text-xs text-muted-foreground font-bold">#{index + 1}</span>
          <span className={`font-mono font-bold text-sm ${d.cjpi >= 95 ? 'text-red-400' : d.cjpi >= 85 ? 'text-blue-400' : 'text-emerald-400'}`}>
            {d.cjpi}
          </span>
          <TierBadge tier={d.tier} />
          <CategoryBadge category={d.category} />
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto" onClick={() => onMark(d.id, true)}>
            <Star className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Name — never truncated */}
        <h4 className="font-semibold text-sm text-foreground mb-1 break-words">{d.name}</h4>

        {/* Description — never truncated */}
        <p className="text-xs text-muted-foreground mb-2 break-words">{d.description}</p>

        {/* Module chain */}
        <div className="flex gap-1 flex-wrap mb-2">
          {d.moduleChain.map(m => (
            <Badge key={m} variant="outline" className="text-[10px] px-1.5 py-0">{m}</Badge>
          ))}
        </div>

        {/* Expand */}
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="gap-1 text-xs p-0 h-auto">
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Less' : 'More'}
        </Button>

        {expanded && (
          <div className="mt-2 pt-2 border-t border-border/50 text-xs space-y-1">
            <div><span className="text-muted-foreground">ID:</span> <code className="font-mono text-[10px]">{d.id}</code></div>
            <div><span className="text-muted-foreground">Synergy Multiplier:</span> {d.synergyMultiplier?.toFixed(2) ?? 'N/A'}</div>
            <div><span className="text-muted-foreground">Entry:</span> {d.entryCapability}</div>
            <div><span className="text-muted-foreground">Exit:</span> {d.exitCapability}</div>
            <div><span className="text-muted-foreground">Error Strategy:</span> {d.errorStrategy}</div>
            {d.rationale && <div><span className="text-muted-foreground">Rationale:</span> {d.rationale}</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DiscoveryList({ discoveries, onMarkCandidate }: { discoveries: ReactorCandidate[]; onMarkCandidate: (id: string, val: boolean) => void }) {
  const [filter, setFilter] = useState<string>('all');
  const filtered = filter === 'all' ? discoveries : discoveries.filter(d => d.category === filter);
  const categories = Array.from(new Set(discoveries.map(d => d.category))).sort();

  return (
    <div className="space-y-3">
      {/* Filter chips — scrollable */}
      <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
        <div className="flex gap-1.5 min-w-max pb-1">
          <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs shrink-0" onClick={() => setFilter('all')}>
            All ({discoveries.length})
          </Button>
          {categories.map(cat => (
            <Button key={cat} variant={filter === cat ? 'default' : 'outline'} size="sm" className="text-xs shrink-0" onClick={() => setFilter(cat)}>
              {cat} ({discoveries.filter(d => d.category === cat).length})
            </Button>
          ))}
        </div>
      </div>

      {/* Card list */}
      <div className="space-y-2">
        {filtered.map((d, i) => (
          <DiscoveryCard key={d.id} d={d} index={i} onMark={onMarkCandidate} />
        ))}
      </div>
    </div>
  );
}

// ─── Run History Cards (mobile) ─────────────────────────────────────

function RunHistoryList({ runs, loading }: { runs: any[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (runs.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No runs recorded yet</p>;
  }

  return (
    <div className="space-y-2">
      {runs.map(run => (
        <Card key={run.id} className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-mono text-muted-foreground">
                {new Date(run.started_at).toLocaleDateString()}
              </span>
              <Badge variant={run.status === 'completed' ? 'default' : 'destructive'} className="text-xs">
                {run.status}
              </Badge>
              {run.dry_run && <Badge variant="outline" className="text-[10px]">Dry</Badge>}
              {run.exploratory_mode && <Badge variant="outline" className="text-[10px]">Exp</Badge>}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">Candidates:</span> <span className="font-mono">{run.total_candidates}</span></div>
              <div><span className="text-muted-foreground">Accepted:</span> <span className="font-mono text-primary">{run.accepted_count}</span></div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Top Find:</span>{' '}
                <span className="break-words">{run.top_find_name ?? '—'}</span>
                {run.top_find_cjpi && <span className="font-mono font-bold ml-1">({run.top_find_cjpi})</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Template Composer ──────────────────────────────────────────────

const AVAILABLE_MODULES = [
  'BRAIN', 'MEMORY', 'CORTEX', 'DREAM', 'NEXUS', 'DECODE',
  'DEFENSE', 'ACCESS', 'VISION', 'ANALYTICS', 'GOVERNANCE',
  'SYSTEM', 'EVOLUTION', 'INTEGRATION', 'NERVE', 'INCLUSIVE',
  'MODERNIZER', 'MEDIC', 'RIPPLE', 'AUDIT', 'IDENTITY',
];

const AVAILABLE_CATEGORIES = [
  'cognitive', 'evolution', 'security', 'routing', 'learning',
  'orchestration', 'integration', 'observability', 'governance',
];

const ERROR_STRATEGIES_LIST = ['retry', 'skip', 'abort', 'rollback', 'fallback'];

interface TemplateFormState {
  namePattern: string;
  descriptionPattern: string;
  category: string;
  modulePattern: string[];
  entryPattern: string;
  exitPattern: string;
  errorStrategy: string;
  maxExecutionMs: number;
  strategicLeverage: number;
  recursionPotential: number;
  crossNodeImpact: number;
  composability: number;
  governanceInfluence: number;
  moatSensitivity: number;
  rationale: string;
}

const DEFAULT_FORM: TemplateFormState = {
  namePattern: '',
  descriptionPattern: '',
  category: 'cognitive',
  modulePattern: [],
  entryPattern: '',
  exitPattern: '',
  errorStrategy: 'fallback',
  maxExecutionMs: 5000,
  strategicLeverage: 85,
  recursionPotential: 80,
  crossNodeImpact: 80,
  composability: 80,
  governanceInfluence: 65,
  moatSensitivity: 85,
  rationale: '',
};

function computePreviewCJPI(form: TemplateFormState): number {
  const b = {
    strategicLeverage: form.strategicLeverage,
    recursionPotential: form.recursionPotential,
    crossNodeImpact: form.crossNodeImpact,
    composability: form.composability,
    governanceInfluence: form.governanceInfluence,
    moatSensitivity: form.moatSensitivity,
  };
  const raw = b.strategicLeverage * 0.30 + b.recursionPotential * 0.20 +
    b.crossNodeImpact * 0.15 + b.composability * 0.15 +
    b.governanceInfluence * 0.10 + b.moatSensitivity * 0.10;
  const unique = new Set(form.modulePattern).size;
  const mult = unique >= 4 ? 1.15 : unique >= 3 ? 1.08 : 1.0;
  return Math.round(Math.min(100, raw * mult) * 10) / 10;
}

function generateTemplateCode(form: TemplateFormState): string {
  return `  { namePattern: '${form.namePattern}', descriptionPattern: '${form.descriptionPattern.replace(/'/g, "\\'")}', category: '${form.category}', modulePattern: [${form.modulePattern.map(m => `'${m}'`).join(', ')}], entryPattern: '${form.entryPattern}', exitPattern: '${form.exitPattern}', errorStrategy: '${form.errorStrategy}', maxExecutionMs: ${form.maxExecutionMs}, baseBreakdown: { strategicLeverage: ${form.strategicLeverage}, recursionPotential: ${form.recursionPotential}, crossNodeImpact: ${form.crossNodeImpact}, composability: ${form.composability}, governanceInfluence: ${form.governanceInfluence}, moatSensitivity: ${form.moatSensitivity} }, discoveredBy: 'reactor', rationale: '${form.rationale.replace(/'/g, "\\'")}' },`;
}

function TemplateComposer() {
  const [form, setForm] = useState<TemplateFormState>({ ...DEFAULT_FORM });
  const [copied, setCopied] = useState(false);

  const update = useCallback(<K extends keyof TemplateFormState>(key: K, val: TemplateFormState[K]) => {
    setForm(prev => ({ ...prev, [key]: val }));
  }, []);

  const toggleModule = (mod: string) => {
    setForm(prev => ({
      ...prev,
      modulePattern: prev.modulePattern.includes(mod)
        ? prev.modulePattern.filter(m => m !== mod)
        : [...prev.modulePattern, mod],
    }));
  };

  const previewCjpi = computePreviewCJPI(form);
  const code = generateTemplateCode(form);
  const isValid = form.namePattern && form.descriptionPattern && form.modulePattern.length >= 2 && form.entryPattern && form.exitPattern && form.rationale;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Template code copied! Paste it into SYNTHESIS_TEMPLATES in reactor.ts');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_FORM });
    toast.info('Form reset');
  };

  const ScoreSlider = ({ label, field, value }: { label: string; field: keyof TemplateFormState; value: number }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-bold text-foreground">{value}</span>
      </div>
      <Slider
        value={[value]}
        min={0} max={100} step={1}
        onValueChange={([v]) => update(field, v as any)}
        className="w-full"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Identity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Template Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Pipeline Name</Label>
            <Input placeholder="e.g. Recursive Thought Evaluator" value={form.namePattern} onChange={e => update('namePattern', e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea placeholder="What this pipeline does..." value={form.descriptionPattern} onChange={e => update('descriptionPattern', e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={v => update('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AVAILABLE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Error Strategy</Label>
              <Select value={form.errorStrategy} onValueChange={v => update('errorStrategy', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ERROR_STRATEGIES_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Chain */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Module Chain</CardTitle>
          <CardDescription className="text-xs">Select 2–5 modules (order matters)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_MODULES.map(mod => (
              <Badge
                key={mod}
                variant={form.modulePattern.includes(mod) ? 'default' : 'outline'}
                className="cursor-pointer text-xs select-none"
                onClick={() => toggleModule(mod)}
              >
                {mod}
              </Badge>
            ))}
          </div>
          {form.modulePattern.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              Chain: {form.modulePattern.join(' → ')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Capabilities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Capabilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Entry Capability</Label>
              <Input placeholder="e.g. thought-evaluator" value={form.entryPattern} onChange={e => update('entryPattern', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Exit Capability</Label>
              <Input placeholder="e.g. evaluation-complete" value={form.exitPattern} onChange={e => update('exitPattern', e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Max Execution (ms)</Label>
            <Input type="number" value={form.maxExecutionMs} onChange={e => update('maxExecutionMs', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="text-xs">Rationale</Label>
            <Textarea placeholder="Why this pipeline is strategically valuable..." value={form.rationale} onChange={e => update('rationale', e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* CJPI Scoring */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            CJPI Scoring
            <span className={`font-mono text-lg ${previewCjpi >= 90 ? 'text-red-400' : previewCjpi >= 80 ? 'text-blue-400' : 'text-amber-400'}`}>
              {previewCjpi}
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            {previewCjpi >= 90 ? '🔥 S-Tier — Auto-promotes to vault' : previewCjpi >= 80 ? '✅ Accepted — Meets threshold' : '⚠️ Below 80 — Will be filtered out'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ScoreSlider label="Strategic Leverage (30%)" field="strategicLeverage" value={form.strategicLeverage} />
          <ScoreSlider label="Recursion Potential (20%)" field="recursionPotential" value={form.recursionPotential} />
          <ScoreSlider label="Cross-Node Impact (15%)" field="crossNodeImpact" value={form.crossNodeImpact} />
          <ScoreSlider label="Composability (15%)" field="composability" value={form.composability} />
          <ScoreSlider label="Governance Influence (10%)" field="governanceInfluence" value={form.governanceInfluence} />
          <ScoreSlider label="Moat Sensitivity (10%)" field="moatSensitivity" value={form.moatSensitivity} />
        </CardContent>
      </Card>

      {/* Generated Code Output */}
      <Card className={isValid ? 'border-primary/30' : 'border-destructive/30'}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Generated Template Code</CardTitle>
          <CardDescription className="text-xs">
            Copy and paste into <code className="font-mono text-primary">SYNTHESIS_TEMPLATES</code> in <code className="font-mono text-primary">reactor.ts</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32 rounded-lg border bg-muted/50 p-3">
            <pre className="text-[10px] sm:text-xs font-mono text-foreground whitespace-pre-wrap break-all">{code}</pre>
          </ScrollArea>
          <div className="flex gap-2 mt-3">
            <Button onClick={handleCopy} disabled={!isValid} className="gap-1.5 flex-1 sm:flex-none">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
            <Button variant="outline" onClick={handleReset} className="flex-1 sm:flex-none">
              Reset
            </Button>
          </div>
          {!isValid && (
            <p className="text-xs text-destructive mt-2">
              Fill in all required fields: name, description, 2+ modules, entry/exit capabilities, and rationale.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Console ──────────────────────────────────────────────────

export default function DiscoveryMiningConsole() {
  const {
    isRunning, latestResult, runs, loading,
    fetchRuns, executeRun, markEngineCandidate,
  } = useDiscoveryReactor();

  const [dryRun, setDryRun] = useState(true);
  const [exploratoryMode, setExploratoryMode] = useState(false);

  useEffect(() => { fetchRuns(); }, [fetchRuns]);

  const handleRun = () => {
    executeRun({ dryRun, exploratoryMode, scoringVersion: '1.0' });
  };

  const exportJson = () => {
    if (!latestResult?.discoveries.length) return;
    const blob = new Blob([JSON.stringify(latestResult.discoveries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discoveries-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header — stacks on mobile */}
        <div className="space-y-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
              Discovery Mining Console
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Capability Synthesis Reactor — one-click auto-discovery of Crown Jewel pipelines
            </p>
          </div>

          {/* Controls — full width on mobile */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch id="dry-run" checked={dryRun} onCheckedChange={setDryRun} />
              <Label htmlFor="dry-run" className="text-xs sm:text-sm">Dry Run</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="exploratory" checked={exploratoryMode} onCheckedChange={setExploratoryMode} />
              <Label htmlFor="exploratory" className="text-xs sm:text-sm">Exploratory</Label>
            </div>
            <Button onClick={handleRun} disabled={isRunning} className="gap-2 ml-auto sm:ml-0">
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run Discovery
            </Button>
          </div>
        </div>

        <Tabs defaultValue="results" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="results" className="gap-1 flex-1 sm:flex-none"><Target className="w-4 h-4" /> Results</TabsTrigger>
            <TabsTrigger value="templates" className="gap-1 flex-1 sm:flex-none"><Plus className="w-4 h-4" /> Templates</TabsTrigger>
            <TabsTrigger value="history" className="gap-1 flex-1 sm:flex-none"><History className="w-4 h-4" /> History</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            {latestResult ? (
              <>
                <RunSummaryCard result={latestResult} />

                {latestResult.discoveries.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <CardTitle className="text-base sm:text-lg">Discovered Pipelines</CardTitle>
                          <CardDescription>{latestResult.discoveries.length} pipelines ranked by CJPI</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={exportJson} className="gap-1 self-start">
                          <Download className="w-3 h-3" /> Export JSON
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <DiscoveryList
                        discoveries={latestResult.discoveries}
                        onMarkCandidate={markEngineCandidate}
                      />
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Zap className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-muted-foreground">No discoveries yet</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">
                    Click "Run Discovery" to start the Capability Synthesis Reactor
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <TemplateComposer />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Discovery Run History</CardTitle>
                <CardDescription>Last 20 discovery runs with receipts</CardDescription>
              </CardHeader>
              <CardContent>
                <RunHistoryList runs={runs} loading={loading} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
