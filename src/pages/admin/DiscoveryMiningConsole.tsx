/**
 * Admin → Discovery Mining Console
 * One-click Capability Synthesis Reactor with full audit trail.
 */
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useDiscoveryReactor } from '@/hooks/admin/useDiscoveryReactor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Zap, Play, History, FlaskConical, Target, TrendingUp,
  Shield, Brain, Cpu, Eye, Scale, GitBranch, Loader2,
  Download, Star,
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
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Latest Run Summary
          {result.dryRun && <Badge variant="outline" className="text-xs">DRY RUN</Badge>}
        </CardTitle>
        <CardDescription>{result.durationMs}ms • {new Date().toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-foreground">{result.totalCandidates}</div>
            <div className="text-xs text-muted-foreground">Candidates</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">{result.acceptedCount}</div>
            <div className="text-xs text-muted-foreground">Accepted (80+)</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-foreground">{result.topFind?.cjpi ?? '—'}</div>
            <div className="text-xs text-muted-foreground">Top CJPI</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-foreground">{Object.keys(result.byCategory).length}</div>
            <div className="text-xs text-muted-foreground">Categories</div>
          </div>
        </div>

        {result.topFind && (
          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="text-xs text-muted-foreground mb-1">🏆 Top Discovery</div>
            <div className="font-semibold text-foreground">{result.topFind.name}</div>
            <div className="text-sm text-primary font-mono">{result.topFind.cjpi} CJPI</div>
          </div>
        )}

        {/* Distribution */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">By Category</div>
            {Object.entries(result.byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between text-xs py-0.5">
                <CategoryBadge category={cat} />
                <span className="font-mono text-foreground">{count}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">By Tier</div>
            {Object.entries(result.byTier).sort((a, b) => b[1] - a[1]).map(([tier, count]) => (
              <div key={tier} className="flex items-center justify-between text-xs py-0.5">
                <TierBadge tier={tier} />
                <span className="font-mono text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DiscoveryTable({ discoveries, onMarkCandidate }: { discoveries: ReactorCandidate[]; onMarkCandidate: (id: string, val: boolean) => void }) {
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? discoveries : discoveries.filter(d => d.category === filter);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>All</Button>
        {Array.from(new Set(discoveries.map(d => d.category))).sort().map(cat => (
          <Button key={cat} variant={filter === cat ? 'default' : 'outline'} size="sm" onClick={() => setFilter(cat)}>
            {cat}
          </Button>
        ))}
      </div>
      <ScrollArea className="h-[500px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>CJPI</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Modules</TableHead>
              <TableHead className="w-8">⭐</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((d, i) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium text-sm">{d.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">{d.description}</TableCell>
                <TableCell>
                  <span className={`font-mono font-bold text-sm ${d.cjpi >= 95 ? 'text-red-400' : d.cjpi >= 85 ? 'text-blue-400' : 'text-emerald-400'}`}>
                    {d.cjpi}
                  </span>
                </TableCell>
                <TableCell><TierBadge tier={d.tier} /></TableCell>
                <TableCell><CategoryBadge category={d.category} /></TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {d.moduleChain.map(m => (
                      <Badge key={m} variant="outline" className="text-[10px] px-1 py-0">{m}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onMarkCandidate(d.id, true)}>
                    <Star className="w-3 h-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Discovery Mining Console
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Capability Synthesis Reactor — one-click auto-discovery of Crown Jewel pipelines
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch id="dry-run" checked={dryRun} onCheckedChange={setDryRun} />
              <Label htmlFor="dry-run" className="text-sm">Dry Run</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="exploratory" checked={exploratoryMode} onCheckedChange={setExploratoryMode} />
              <Label htmlFor="exploratory" className="text-sm">Exploratory</Label>
            </div>
            <Button onClick={handleRun} disabled={isRunning} className="gap-2">
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run Discovery
            </Button>
          </div>
        </div>

        <Tabs defaultValue="results" className="w-full">
          <TabsList>
            <TabsTrigger value="results" className="gap-1"><Target className="w-4 h-4" /> Results</TabsTrigger>
            <TabsTrigger value="history" className="gap-1"><History className="w-4 h-4" /> History</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            {latestResult ? (
              <>
                <RunSummaryCard result={latestResult} />

                {latestResult.discoveries.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Discovered Pipelines</CardTitle>
                        <CardDescription>{latestResult.discoveries.length} pipelines ranked by CJPI</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={exportJson} className="gap-1">
                        <Download className="w-3 h-3" /> Export JSON
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <DiscoveryTable
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
                  <h3 className="text-lg font-medium text-muted-foreground">No discoveries yet</h3>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Click "Run Discovery" to start the Capability Synthesis Reactor
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Discovery Run History</CardTitle>
                <CardDescription>Last 20 discovery runs with receipts</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : runs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No runs recorded yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Candidates</TableHead>
                        <TableHead>Accepted</TableHead>
                        <TableHead>Top Find</TableHead>
                        <TableHead>CJPI</TableHead>
                        <TableHead>Mode</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {runs.map(run => (
                        <TableRow key={run.id}>
                          <TableCell className="text-xs font-mono">
                            {new Date(run.started_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={run.status === 'completed' ? 'default' : 'destructive'} className="text-xs">
                              {run.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">{run.total_candidates}</TableCell>
                          <TableCell className="font-mono text-primary">{run.accepted_count}</TableCell>
                          <TableCell className="text-sm truncate max-w-[200px]">{run.top_find_name ?? '—'}</TableCell>
                          <TableCell className="font-mono font-bold">{run.top_find_cjpi ?? '—'}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {run.dry_run && <Badge variant="outline" className="text-[10px]">Dry</Badge>}
                              {run.exploratory_mode && <Badge variant="outline" className="text-[10px]">Exp</Badge>}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
