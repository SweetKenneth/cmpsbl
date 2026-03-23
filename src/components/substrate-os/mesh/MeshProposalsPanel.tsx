/**
 * Mesh Module Proposals Panel
 * Displays self-discovered capability proposals for approval/rejection
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Lightbulb, CheckCircle, XCircle, RefreshCw, Brain,
  Sparkles, GitBranch, Eye, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  runAllModuleDiscovery,
  persistProposals,
  approveProposal,
  rejectProposal,
  getModuleDiscoveryStates,
  type ModuleProposal,
  type ModuleDiscoveryState,
} from '@/lib/substrate/intent-mesh/module-discovery';
import { supabase } from '@/integrations/supabase/client';

const METHOD_COLORS: Record<string, string> = {
  introspection: 'text-neon-amber bg-neon-amber/10 border-neon-amber/30',
  gap_response: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30',
  affinity_bridge: 'text-neon-magenta bg-neon-magenta/10 border-neon-magenta/30',
  intent_learning: 'text-neon-green bg-neon-green/10 border-neon-green/30',
};

const METHOD_ICONS: Record<string, React.ReactNode> = {
  introspection: <Eye className="w-3 h-3" />,
  gap_response: <AlertTriangle className="w-3 h-3" />,
  affinity_bridge: <GitBranch className="w-3 h-3" />,
  intent_learning: <Brain className="w-3 h-3" />,
};

export function MeshProposalsPanel({ onPipelineChange }: { onPipelineChange?: () => void }) {
  const [proposals, setProposals] = useState<ModuleProposal[]>([]);
  const [moduleStates, setModuleStates] = useState<ModuleDiscoveryState[]>([]);
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadProposals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('mesh_capability_recommendations')
        .select('*')
        .in('status', ['proposed', 'pending'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setProposals(data.map((r: any) => ({
          id: r.id,
          module: r.target_module || 'UNKNOWN',
          proposedResolverId: r.proposed_resolver_id || r.id,
          description: r.proposed_description || '',
          domains: r.proposed_domains || [],
          accepts: r.proposed_accepts || [],
          produces: r.proposed_produces || [],
          reasoning: r.reasoning || '',
          discoveryMethod: 'introspection',
          confidenceScore: r.confidence_score || 0.5,
          status: r.status || 'proposed',
          createdAt: r.created_at,
        })));
      }

      const states = await getModuleDiscoveryStates();
      setModuleStates(states);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProposals(); }, [loadProposals]);

  const handleDiscover = async () => {
    setDiscovering(true);
    try {
      const result = await runAllModuleDiscovery();
      const allProposals = result.moduleResults.flatMap(r => r.proposals);
      const persisted = await persistProposals(allProposals.slice(0, 20));
      toast.success(`Discovery complete: ${result.totalProposals} proposals from ${result.moduleResults.length} modules, ${persisted} saved`);
      await loadProposals();
    } catch {
      toast.error('Discovery cycle failed');
    } finally {
      setDiscovering(false);
    }
  };

  const handleApprove = async (proposal: ModuleProposal) => {
    setProcessingId(proposal.id);
    try {
      const success = await approveProposal(proposal.id);
      if (success) {
        toast.success(`✅ Crystallized: ${proposal.proposedResolverId} → saved as permanent memory chain`);
        setProposals(prev => prev.filter(p => p.id !== proposal.id));
        // Notify parent to refresh memory chains list
        onPipelineChange?.();
      } else {
        toast.error('Proposal not found or already processed');
      }
      await loadProposals();
    } catch {
      toast.error('Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (proposal: ModuleProposal) => {
    setProcessingId(proposal.id);
    try {
      const success = await rejectProposal(proposal.id);
      if (success) {
        toast.info(`Rejected: ${proposal.proposedResolverId}`);
        setProposals(prev => prev.filter(p => p.id !== proposal.id));
      }
      await loadProposals();
    } catch {
      toast.error('Rejection failed');
    } finally {
      setProcessingId(null);
    }
  };

  const topModules = moduleStates
    .sort((a, b) => b.discoveryScore - a.discoveryScore)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Discovery Action */}
      <Card className="border border-neon-magenta/20 bg-neon-magenta/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-neon-magenta" />
              <div>
                <p className="text-sm font-medium">Module Self-Discovery</p>
                <p className="text-xs text-muted-foreground">
                  All entities introspect their data assets and propose new capabilities
                </p>
              </div>
            </div>
            <Button size="sm" onClick={handleDiscover} disabled={discovering} className="gap-2">
              {discovering ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Lightbulb className="h-3 w-3" />}
              Run Discovery
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Module Discovery Health */}
      {topModules.length > 0 && (
        <Card className="border border-border/30 bg-muted/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-neon-magenta" />
              Module Discovery Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {topModules.map(ms => (
                <div key={ms.module} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/20">
                  <Badge variant="outline" className="text-[10px] font-bold min-w-[60px] justify-center">{ms.module}</Badge>
                  <div className="flex-1">
                    <Progress value={ms.discoveryScore} className="h-1.5" />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{ms.discoveryScore}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proposals Queue */}
      <Card className="border border-border/30 bg-muted/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-neon-amber" />
            Pending Proposals
            <Badge variant="secondary" className="text-[10px]">{proposals.length}</Badge>
            <Button variant="ghost" size="sm" className="ml-auto h-6 w-6 p-0" onClick={loadProposals} disabled={loading}>
              <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[450px]">
            <AnimatePresence mode="popLayout">
              {proposals.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No pending proposals. Run module discovery to generate new capability recommendations.
                </p>
              ) : (
                <div className="space-y-3">
                  {proposals.map(proposal => (
                    <motion.div
                      key={proposal.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-4 rounded-lg bg-muted/20 border border-border/20 hover:border-neon-magenta/30 transition-colors space-y-3"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px] font-bold">{proposal.module}</Badge>
                            <span className="text-xs font-mono font-medium truncate">{proposal.proposedResolverId}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{proposal.description}</p>
                        </div>
                        <Badge className={cn('text-[9px] border flex items-center gap-1', METHOD_COLORS[proposal.discoveryMethod] || 'text-muted-foreground')}>
                          {METHOD_ICONS[proposal.discoveryMethod]}
                          {proposal.discoveryMethod.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      {/* Details */}
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                        <span>Confidence: <strong className={proposal.confidenceScore >= 0.7 ? 'text-neon-green' : proposal.confidenceScore >= 0.5 ? 'text-neon-amber' : 'text-destructive'}>{(proposal.confidenceScore * 100).toFixed(0)}%</strong></span>
                        <span>Domains: {proposal.domains.join(', ')}</span>
                      </div>

                      {/* Reasoning */}
                      <p className="text-[11px] text-muted-foreground/80 italic border-l-2 border-neon-magenta/30 pl-3">{proposal.reasoning}</p>

                      {/* Schema */}
                      <div className="flex items-center gap-4 text-[10px]">
                        <div>
                          <span className="text-muted-foreground">Accepts: </span>
                          {proposal.accepts.slice(0, 4).map(a => (
                            <Badge key={a} variant="secondary" className="text-[9px] mr-1">{a}</Badge>
                          ))}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Produces: </span>
                          {proposal.produces.slice(0, 4).map(p => (
                            <Badge key={p} variant="secondary" className="text-[9px] mr-1">{p}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-neon-green border-neon-green/30 hover:bg-neon-green/10"
                          onClick={() => handleApprove(proposal)}
                          disabled={processingId === proposal.id}
                        >
                          {processingId === proposal.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => handleReject(proposal)}
                          disabled={processingId === proposal.id}
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
