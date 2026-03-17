/**
 * CMPSBL® Governor Node Dashboard
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Admin-only interface for managing all ingested Ascension Nodes (Node 41+).
 *
 * Features:
 *   - View all Node 41+ entries with status/mode
 *   - Inspect primitives extracted from each node
 *   - See usage history + performance metrics
 *   - Promote node → persistent
 *   - Set node → temporary (N runs limit)
 *   - Delete node completely
 *   - Re-run extraction
 *
 * NOT user-facing. Governor control surface only.
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listNodes,
  getNode,
  updateNode,
  deleteNode,
  extractAndAttachPrimitives,
  recordExtractionLearning,
  recordLifecycleEvent,
  logStatusChange,
  logDeletion,
  logExtraction,
  getAuditTrail,
  type AscensionNode,
  type NodeStatus,
  type NodeMode,
  type AuditEvent,
} from '@/lib/ascension';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Search, Trash2, ArrowUpCircle, ArrowDownCircle,
  RefreshCw, Cpu, Zap, Clock, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════════
// STATUS BADGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const STATUS_CONFIG: Record<NodeStatus, { label: string; className: string }> = {
  candidate: { label: 'Candidate', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  archived: { label: 'Archived', className: 'bg-muted text-muted-foreground border-border/50' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const MODE_CONFIG: Record<NodeMode, { label: string; icon: typeof Clock }> = {
  temporary: { label: 'Temporary', icon: Clock },
  persistent: { label: 'Persistent', icon: Zap },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function GovernorNodeDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<NodeStatus | 'all'>('all');
  const [selectedNode, setSelectedNode] = useState<AscensionNode | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  // ── Fetch nodes ──
  const { data: nodesData, isLoading } = useQuery({
    queryKey: ['governor-nodes', user?.id, search, statusFilter],
    queryFn: async () => {
      if (!user?.id) return { nodes: [], total: 0 };
      return listNodes(user.id, {
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 100,
      });
    },
    enabled: !!user?.id,
    refetchInterval: 30_000,
  });

  const nodes = nodesData?.nodes || [];

  // ── Mutations ──
  const promoteMutation = useMutation({
    mutationFn: async (nodeId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const node = await getNode(nodeId, user.id);
      if (!node) throw new Error('Node not found');
      const updated = await updateNode(nodeId, user.id, { status: 'active', mode: 'persistent' });
      logStatusChange(nodeId, node.status, 'active', user.id);
      recordLifecycleEvent(updated, 'node_promotion').catch(() => {});
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governor-nodes'] });
      toast({ title: 'Node promoted', description: 'Node is now persistent and active' });
    },
    onError: (e) => toast({ title: 'Promotion failed', description: String(e), variant: 'destructive' }),
  });

  const archiveMutation = useMutation({
    mutationFn: async (nodeId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const node = await getNode(nodeId, user.id);
      if (!node) throw new Error('Node not found');
      const updated = await updateNode(nodeId, user.id, { status: 'archived' });
      logStatusChange(nodeId, node.status, 'archived', user.id);
      recordLifecycleEvent(updated, 'node_archival').catch(() => {});
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governor-nodes'] });
      toast({ title: 'Node archived' });
    },
    onError: (e) => toast({ title: 'Archive failed', description: String(e), variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ nodeId, nodeName }: { nodeId: string; nodeName: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      await deleteNode(nodeId, user.id);
      logDeletion(nodeId, nodeName, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governor-nodes'] });
      setDetailOpen(false);
      setSelectedNode(null);
      toast({ title: 'Node deleted permanently' });
    },
    onError: (e) => toast({ title: 'Delete failed', description: String(e), variant: 'destructive' }),
  });

  const reExtractMutation = useMutation({
    mutationFn: async (nodeId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const result = await extractAndAttachPrimitives(nodeId, user.id);
      logExtraction(nodeId, result.primitives.length, result.durationMs, user.id);
      const node = await getNode(nodeId, user.id);
      if (node) recordExtractionLearning(node, result).catch(() => {});
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['governor-nodes'] });
      toast({ title: 'Re-extraction complete', description: `${result.primitives.length} primitives extracted in ${result.durationMs.toFixed(0)}ms` });
    },
    onError: (e) => toast({ title: 'Extraction failed', description: String(e), variant: 'destructive' }),
  });

  // ── Open detail panel ──
  const openDetail = useCallback(async (node: AscensionNode) => {
    setSelectedNode(node);
    setDetailOpen(true);
    const trail = await getAuditTrail({ nodeId: node.id, limit: 20 });
    setAuditEvents(trail);
  }, []);

  // ── Stats ──
  const activeCount = nodes.filter(n => n.status === 'active').length;
  const candidateCount = nodes.filter(n => n.status === 'candidate').length;
  const totalPrimitives = nodes.reduce((s, n) => s + n.primitives.length, 0);

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Cpu className="w-6 h-6 text-primary" />
              Ascension Nodes
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Governor control surface for Node 41+ lifecycle management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs font-mono">
              {nodes.length} nodes
            </Badge>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
              {activeCount} active
            </Badge>
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
              {candidateCount} candidates
            </Badge>
            <Badge variant="outline" className="text-xs font-mono">
              {totalPrimitives} primitives
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as NodeStatus | 'all')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="candidate">Candidate</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Node Table */}
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/50">
                <TableHead className="font-semibold">Node</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Mode</TableHead>
                <TableHead className="font-semibold">Language</TableHead>
                <TableHead className="font-semibold text-right">Primitives</TableHead>
                <TableHead className="font-semibold text-right">Runs</TableHead>
                <TableHead className="font-semibold text-right">Avg CJPI</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : nodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No ascension nodes found
                  </TableCell>
                </TableRow>
              ) : (
                nodes.map((node) => {
                  const statusCfg = STATUS_CONFIG[node.status];
                  const ModIcon = MODE_CONFIG[node.mode]?.icon || Clock;

                  return (
                    <TableRow
                      key={node.id}
                      className="hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/30"
                      onClick={() => openDetail(node)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-mono">Ψ₄₁</span>
                          <span>{node.surface?.nodeName || node.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-xs', statusCfg.className)}>
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ModIcon className="w-3 h-3" />
                          {MODE_CONFIG[node.mode]?.label || node.mode}
                          {node.runLimit !== null && (
                            <span className="ml-1 font-mono">({node.runLimit} left)</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{node.language}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{node.primitives.length}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{node.totalRuns}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {node.performance.avgCjpi > 0 ? node.performance.avgCjpi.toFixed(1) : '—'}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          {node.status === 'candidate' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700"
                              onClick={() => promoteMutation.mutate(node.id)}
                              disabled={promoteMutation.isPending}
                              title="Promote to active"
                            >
                              <ArrowUpCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {node.status === 'active' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700"
                              onClick={() => archiveMutation.mutate(node.id)}
                              disabled={archiveMutation.isPending}
                              title="Archive"
                            >
                              <ArrowDownCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => reExtractMutation.mutate(node.id)}
                            disabled={reExtractMutation.isPending}
                            title="Re-extract primitives"
                          >
                            <RefreshCw className={cn("w-4 h-4", reExtractMutation.isPending && "animate-spin")} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive"
                            onClick={() => deleteMutation.mutate({ nodeId: node.id, nodeName: node.name })}
                            disabled={deleteMutation.isPending}
                            title="Delete permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            {selectedNode && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">Ψ₄₁</span>
                    {selectedNode.surface?.nodeName || selectedNode.name}
                    <Badge className={cn('text-xs ml-2', STATUS_CONFIG[selectedNode.status].className)}>
                      {STATUS_CONFIG[selectedNode.status].label}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    {selectedNode.language} · {selectedNode.primitives.length} primitives · {selectedNode.totalRuns} runs
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  {/* Surface Info */}
                  {selectedNode.surface && (
                    <div className="rounded-lg border border-border/50 p-3 space-y-2">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground">Capability Surface</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedNode.surface.capabilities.map((cap) => (
                          <Badge key={cap} variant="outline" className="text-xs font-mono">{cap}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Sector: <span className="font-mono">{selectedNode.surface.sector}</span> ·
                        Domain: <span className="font-mono">{selectedNode.surface.domain}</span>
                      </p>
                    </div>
                  )}

                  {/* Performance */}
                  <div className="rounded-lg border border-border/50 p-3">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Performance</h4>
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div>
                        <p className="text-lg font-bold text-foreground">{selectedNode.performance.avgCjpi.toFixed(1)}</p>
                        <p className="text-[10px] text-muted-foreground">Avg CJPI</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">{selectedNode.performance.bestCjpi}</p>
                        <p className="text-[10px] text-muted-foreground">Best CJPI</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">{selectedNode.performance.chainsParticipated}</p>
                        <p className="text-[10px] text-muted-foreground">Chains</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">{selectedNode.totalRuns}</p>
                        <p className="text-[10px] text-muted-foreground">Total Runs</p>
                      </div>
                    </div>
                  </div>

                  {/* Primitives */}
                  <div className="rounded-lg border border-border/50 p-3">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                      Primitives ({selectedNode.primitives.length})
                    </h4>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {selectedNode.primitives.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No primitives extracted yet</p>
                      ) : (
                        selectedNode.primitives.slice(0, 30).map((p) => (
                          <div key={p.id} className="flex items-center justify-between text-xs py-1 border-b border-border/20 last:border-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium text-foreground">{p.name}</span>
                              <Badge variant="outline" className="text-[10px]">{p.category}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span>{(p.confidence * 100).toFixed(0)}%</span>
                              <span>C{p.complexity}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Audit Trail */}
                  <div className="rounded-lg border border-border/50 p-3">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Audit Trail</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {auditEvents.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No audit events</p>
                      ) : (
                        auditEvents.map((evt, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/20 last:border-0">
                            <span className="font-mono text-muted-foreground">{evt.type}</span>
                            <span className="text-muted-foreground">
                              {new Date(evt.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => reExtractMutation.mutate(selectedNode.id)}
                      disabled={reExtractMutation.isPending}
                    >
                      <RefreshCw className={cn("w-4 h-4 mr-1", reExtractMutation.isPending && "animate-spin")} />
                      Re-Extract
                    </Button>
                    {selectedNode.status !== 'active' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          promoteMutation.mutate(selectedNode.id);
                          setDetailOpen(false);
                        }}
                        disabled={promoteMutation.isPending}
                      >
                        <ArrowUpCircle className="w-4 h-4 mr-1" />
                        Promote
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate({ nodeId: selectedNode.id, nodeName: selectedNode.name })}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
