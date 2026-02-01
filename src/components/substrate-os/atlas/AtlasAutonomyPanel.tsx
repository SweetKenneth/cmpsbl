/**
 * Atlas Autonomy Panel
 * v7.0.0 — CLM + SEBA unified control for 24/7 autonomous operation
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Brain, Zap, Play, Pause, CheckCircle2, XCircle,
  AlertTriangle, Clock, RefreshCw, ChevronRight, Shield,
  Sparkles, Radio, CircleDot, Eye, Settings2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useSEBA } from '@/hooks/useSEBA';
import { useModuleCLM } from '@/lib/substrate/module-clm/useModuleCLM';
import { cn } from '@/lib/utils';
import type { SEBAMode, ImprovementProposal } from '@/lib/substrate/seba';

interface PendingProposal {
  id: string;
  short_id: string;
  title: string;
  category: string;
  risk_level: string;
  confidence_score: number;
  created_at: string;
  requires_human_approval: boolean;
}

export function AtlasAutonomyPanel() {
  const seba = useSEBA();
  const clm = useModuleCLM(true);
  
  const [pendingProposals, setPendingProposals] = useState<PendingProposal[]>([]);
  const [systemActive, setSystemActive] = useState(false);
  const [activating, setActivating] = useState(false);

  // Check system active state
  useEffect(() => {
    const isActive = seba.isEnabled && seba.mode !== 'off';
    setSystemActive(isActive);
  }, [seba.isEnabled, seba.mode]);

  // Load pending proposals
  const loadProposals = useCallback(async () => {
    const result = await seba.review();
    if (result.success && result.data) {
      const data = result.data as { proposals: any[] };
      if (data.proposals) {
        setPendingProposals(data.proposals.map((p: any) => ({
          id: p.id,
          short_id: p.data?.proposal_id || p.id.slice(0, 8),
          title: p.data?.title || 'Improvement Proposal',
          category: p.data?.category || 'general',
          risk_level: p.data?.risk_level || 'low',
          confidence_score: p.data?.confidence || 0.7,
          created_at: p.created_at,
          requires_human_approval: true,
        })));
      }
    }
  }, [seba]);

  useEffect(() => {
    loadProposals();
    const interval = setInterval(loadProposals, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [loadProposals]);

  // Activate full 24/7 autonomous operation
  const activateSystem = async () => {
    setActivating(true);
    try {
      // 1. Enable SEBA
      await seba.enable();
      
      // 2. Set to advisory mode (requires approval)
      await seba.setMode('advisory');
      
      // 3. Run initial CLM cycle
      await clm.runAllLearning();
      
      // 4. Run initial SEBA cycle
      await seba.runCycle();
      
      setSystemActive(true);
      toast.success('Autonomous operation activated — SEBA advisory mode + CLM 24/7');
    } catch (err) {
      toast.error('Failed to activate system');
    } finally {
      setActivating(false);
    }
  };

  const deactivateSystem = async () => {
    await seba.disable();
    setSystemActive(false);
    toast.info('Autonomous operation paused');
  };

  const approveProposal = async (proposalId: string) => {
    const result = await seba.approve(proposalId);
    if (result.success) {
      toast.success(`Proposal ${proposalId.slice(0, 8)} approved`);
      loadProposals();
    } else {
      toast.error(result.message);
    }
  };

  const rejectProposal = async (proposalId: string) => {
    const result = await seba.reject(proposalId);
    if (result.success) {
      toast.success(`Proposal ${proposalId.slice(0, 8)} rejected`);
      loadProposals();
    } else {
      toast.error(result.message);
    }
  };

  const executeProposal = async (proposalId: string) => {
    const result = await seba.execute(proposalId);
    if (result.success) {
      toast.success(`Proposal ${proposalId.slice(0, 8)} executed`);
      loadProposals();
    } else {
      toast.error(result.message);
    }
  };

  const runManualCycle = async () => {
    toast.info('Running SEBA cycle...');
    const result = await seba.runCycle();
    if (result.success) {
      toast.success(`Cycle complete: ${result.evolutions_applied} evolutions`);
      loadProposals();
    } else {
      toast.error(result.error || 'Cycle failed');
    }
  };

  const riskColor = (risk: string) => {
    switch (risk) {
      case 'minimal': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
      case 'low': return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40';
      case 'medium': return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/40';
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/40';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Master Control */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500",
                systemActive 
                  ? "bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border border-emerald-500/50" 
                  : "bg-muted/50 border border-border"
              )}>
                <Radio className={cn(
                  "w-6 h-6 transition-colors",
                  systemActive ? "text-emerald-400" : "text-muted-foreground"
                )} />
                {systemActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-emerald-400/50"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span>Autonomous Operation</span>
                  {systemActive ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                      LIVE 24/7
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      STANDBY
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {systemActive 
                    ? `SEBA ${seba.mode} mode • CLM active • ${seba.state?.pending_proposals || 0} pending`
                    : 'Activate to enable autonomous learning and evolution'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {systemActive && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={runManualCycle}
                  disabled={seba.isCycleRunning}
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", seba.isCycleRunning && "animate-spin")} />
                  Run Cycle
                </Button>
              )}
              <Button
                size="lg"
                variant={systemActive ? "outline" : "default"}
                onClick={systemActive ? deactivateSystem : activateSystem}
                disabled={activating}
                className={cn(
                  "min-w-[140px] transition-all",
                  systemActive 
                    ? "border-red-500/40 text-red-400 hover:bg-red-500/10" 
                    : "bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500"
                )}
              >
                {activating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Activating...
                  </>
                ) : systemActive ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* SEBA Status */}
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              SEBA Agent
              <Badge variant="outline" className="ml-auto text-[10px]">
                {seba.mode}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <p className="text-xs text-muted-foreground">Phase</p>
                <p className="text-lg font-bold capitalize">{seba.phase}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <p className="text-xs text-muted-foreground">Cycles</p>
                <p className="text-lg font-bold">{seba.state?.total_cycles || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <p className="text-xs text-muted-foreground">Success</p>
                <p className="text-lg font-bold text-emerald-400">{seba.state?.successful_cycles || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <p className="text-xs text-muted-foreground">Health</p>
                <p className="text-lg font-bold">{seba.state?.agent_health || 100}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Pending Proposals</span>
                <span className="font-bold">{seba.state?.pending_proposals || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Approved</span>
                <span className="font-bold text-emerald-400">{seba.state?.approved_proposals || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Rejected</span>
                <span className="font-bold text-red-400">{seba.state?.rejected_proposals || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CLM Status */}
        <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              CLM Status
              <Badge variant="outline" className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                24/7
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <p className="text-xs text-muted-foreground">Modules</p>
                <p className="text-lg font-bold">{clm.moduleStates.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <p className="text-xs text-muted-foreground">Feed Items</p>
                <p className="text-lg font-bold">{clm.feed.length}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-2">Learning Modules</p>
              <div className="flex flex-wrap gap-1.5">
                {clm.moduleStates.slice(0, 8).map(mod => (
                  <Badge 
                    key={mod.moduleId} 
                    variant="outline" 
                    className={cn(
                      "text-[9px]",
                      mod.isLearning ? "border-cyan-500/50 text-cyan-400" : ""
                    )}
                  >
                    {mod.moduleId.toUpperCase()}
                    {mod.isLearning && <CircleDot className="w-2 h-2 ml-1 animate-pulse" />}
                  </Badge>
                ))}
              </div>
            </div>

            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={clm.runAllLearning}
              disabled={clm.loading}
            >
              <RefreshCw className={cn("w-3 h-3 mr-2", clm.loading && "animate-spin")} />
              Run All Learning
            </Button>
          </CardContent>
        </Card>

        {/* Mode Configuration */}
        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-amber-400" />
              SEBA Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {(['off', 'observe', 'advisory', 'governed'] as SEBAMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => seba.setMode(mode)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                    seba.mode === mode 
                      ? "border-primary bg-primary/10" 
                      : "border-border/50 hover:border-border hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    seba.mode === mode ? "bg-primary" : "bg-muted"
                  )} />
                  <div className="flex-1">
                    <p className="text-sm font-medium capitalize">{mode}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {mode === 'off' && 'SEBA disabled'}
                      {mode === 'observe' && 'Watch only, no proposals'}
                      {mode === 'advisory' && 'Proposes, requires approval'}
                      {mode === 'governed' && 'Auto-execute if safe'}
                    </p>
                  </div>
                  {mode === 'advisory' && (
                    <Badge className="text-[9px] bg-emerald-500/20 text-emerald-400">
                      RECOMMENDED
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Proposals */}
      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Pending Proposals
              {pendingProposals.length > 0 && (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40">
                  {pendingProposals.length} awaiting
                </Badge>
              )}
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={loadProposals}>
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <AnimatePresence mode="popLayout">
              {pendingProposals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10 mb-3 opacity-40" />
                  <p className="text-sm">No pending proposals</p>
                  <p className="text-xs mt-1">SEBA will generate proposals when improvements are detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingProposals.map((proposal, i) => (
                    <motion.div
                      key={proposal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">
                              {proposal.short_id}
                            </Badge>
                            <Badge className={cn("text-[10px]", riskColor(proposal.risk_level))}>
                              {proposal.risk_level}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm">{proposal.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {proposal.category} • {Math.round(proposal.confidence_score * 100)}% confidence
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(proposal.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                          onClick={() => approveProposal(proposal.id)}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                          onClick={() => executeProposal(proposal.id)}
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Execute
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => rejectProposal(proposal.id)}
                        >
                          <XCircle className="w-3 h-3" />
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

      {/* Recent CLM Insights */}
      <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" />
            Recent CLM Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {clm.feed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Brain className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">Waiting for learning cycles...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {clm.feed.slice(0, 10).map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border/30 bg-background/30"
                  >
                    <Badge variant="outline" className="text-[9px] shrink-0">
                      {item.moduleId.toUpperCase()}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{item.content.slice(0, 100)}...</p>
                    </div>
                    <div className="shrink-0">
                      <Badge className={cn(
                        "text-[9px]",
                        item.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                        item.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                        item.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {item.priority}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
