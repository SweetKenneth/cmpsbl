/**
 * Atlas Autonomy Panel
 * v7.0.0 — CLM + SEBA unified control for 24/7 autonomous operation
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Brain, Zap, Play, Pause, CheckCircle2, XCircle,
  AlertTriangle, Clock, RefreshCw, ChevronRight, Shield,
  Sparkles, Radio, CircleDot, Eye, Settings2, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useSEBA } from '@/hooks/useSEBA';
import { useModuleCLM } from '@/lib/substrate/module-clm/useModuleCLM';
import { cn } from '@/lib/utils';
import type { SEBAMode } from '@/lib/substrate/seba';

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
  const [processingProposal, setProcessingProposal] = useState<string | null>(null);

  // Check system active state
  useEffect(() => {
    const isActive = seba.isEnabled && seba.mode !== 'off';
    setSystemActive(isActive);
  }, [seba.isEnabled, seba.mode]);

  // Load pending proposals
  const loadProposals = useCallback(async () => {
    try {
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
    } catch (err) {
      console.error('Failed to load proposals:', err);
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
      toast.success('Autonomous operation activated', { 
        description: 'SEBA advisory mode + CLM 24/7 enabled' 
      });
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

  const handleProposalAction = async (proposalId: string, action: 'approve' | 'reject' | 'execute') => {
    setProcessingProposal(proposalId);
    try {
      let result;
      if (action === 'approve') {
        result = await seba.approve(proposalId);
      } else if (action === 'reject') {
        result = await seba.reject(proposalId);
      } else {
        result = await seba.execute(proposalId);
      }
      
      if (result.success) {
        toast.success(`Proposal ${proposalId.slice(0, 8)} ${action}d`);
        loadProposals();
      } else {
        toast.error(result.message || `Failed to ${action} proposal`);
      }
    } finally {
      setProcessingProposal(null);
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
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-transparent overflow-hidden">
        <CardHeader className="pb-4 relative">
          {/* Background pulse for active state */}
          {systemActive && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          )}
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className={cn(
                "relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                systemActive 
                  ? "bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border-2 border-emerald-500/50" 
                  : "bg-muted/50 border-2 border-border"
              )}>
                <Radio className={cn(
                  "w-7 h-7 transition-colors",
                  systemActive ? "text-emerald-400" : "text-muted-foreground"
                )} />
                {systemActive && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-emerald-400/50"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Zap className="w-2.5 h-2.5 text-white" />
                    </motion.div>
                  </>
                )}
              </div>
              <div>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <span>Autonomous Operation</span>
                  {systemActive ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse">
                      <motion.span 
                        className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      LIVE 24/7
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      STANDBY
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1.5 font-mono">
                  {systemActive 
                    ? `SEBA ${seba.mode} • CLM active • ${seba.state?.pending_proposals || 0} pending proposals`
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
                  className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
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
                  "min-w-[160px] h-11 transition-all font-semibold",
                  systemActive 
                    ? "border-red-500/40 text-red-400 hover:bg-red-500/10" 
                    : "bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-lg shadow-emerald-500/20"
                )}
              >
                {activating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
                    Activate System
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
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              SEBA Agent
              <Badge variant="outline" className="ml-auto text-[10px] uppercase font-mono">
                {seba.mode}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Phase', value: seba.phase, capitalize: true },
                { label: 'Cycles', value: seba.state?.total_cycles || 0 },
                { label: 'Success', value: seba.state?.successful_cycles || 0, color: 'text-emerald-400' },
                { label: 'Health', value: `${seba.state?.agent_health || 100}%` },
              ].map(stat => (
                <div key={stat.label} className="p-3 rounded-xl bg-background/50 border border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase font-mono">{stat.label}</p>
                  <p className={cn(
                    "text-lg font-bold",
                    stat.capitalize && "capitalize",
                    stat.color
                  )}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              {[
                { label: 'Pending', value: seba.state?.pending_proposals || 0 },
                { label: 'Approved', value: seba.state?.approved_proposals || 0, color: 'text-emerald-400' },
                { label: 'Rejected', value: seba.state?.rejected_proposals || 0, color: 'text-red-400' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.label} Proposals</span>
                  <span className={cn("font-bold font-mono", item.color)}>{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CLM Status */}
        <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Brain className="w-4 h-4 text-cyan-400" />
              </div>
              CLM Status
              <Badge className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                24/7
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-background/50 border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase font-mono">Modules</p>
                <p className="text-lg font-bold">{clm.moduleStates.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-background/50 border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase font-mono">Feed Items</p>
                <p className="text-lg font-bold">{clm.feed.length}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase font-mono mb-2">Learning Modules</p>
              <div className="flex flex-wrap gap-1.5">
                {clm.moduleStates.slice(0, 8).map(mod => (
                  <Badge 
                    key={mod.moduleId} 
                    variant="outline" 
                    className={cn(
                      "text-[9px] font-mono",
                      mod.isLearning ? "border-cyan-500/50 text-cyan-400 bg-cyan-500/10" : ""
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
              className="w-full border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
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
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Settings2 className="w-4 h-4 text-amber-400" />
              </div>
              SEBA Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(['off', 'observe', 'advisory', 'governed'] as SEBAMode[]).map(mode => (
              <motion.button
                key={mode}
                onClick={() => seba.setMode(mode)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                  seba.mode === mode 
                    ? "border-primary bg-primary/10 shadow-sm shadow-primary/20" 
                    : "border-border/50 hover:border-border hover:bg-muted/30"
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <motion.div 
                  className={cn(
                    "w-3 h-3 rounded-full transition-colors",
                    seba.mode === mode ? "bg-primary" : "bg-muted"
                  )}
                  animate={seba.mode === mode ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
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
                  <Badge className="text-[9px] bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                    RECOMMENDED
                  </Badge>
                )}
              </motion.button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Pending Proposals */}
      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              Pending Proposals
              {pendingProposals.length > 0 && (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse">
                  {pendingProposals.length} awaiting
                </Badge>
              )}
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={loadProposals} className="h-8">
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[320px]">
            <AnimatePresence mode="popLayout">
              {pendingProposals.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-muted-foreground"
                >
                  <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 opacity-40" />
                  </div>
                  <p className="text-sm font-medium">No pending proposals</p>
                  <p className="text-xs mt-1 text-center max-w-xs">
                    SEBA will generate proposals when improvements are detected
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {pendingProposals.map((proposal, i) => {
                    const isProcessing = processingProposal === proposal.id;
                    
                    return (
                      <motion.div
                        key={proposal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                          "p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-all",
                          isProcessing && "opacity-60"
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("text-[10px] uppercase", riskColor(proposal.risk_level))}>
                              {proposal.risk_level}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {proposal.category}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {Math.round(proposal.confidence_score * 100)}% conf
                          </span>
                        </div>
                        
                        <h4 className="text-sm font-medium mb-1">{proposal.title}</h4>
                        <p className="text-[10px] text-muted-foreground font-mono mb-4">
                          ID: {proposal.short_id} • {new Date(proposal.created_at).toLocaleString()}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                            onClick={() => handleProposalAction(proposal.id, 'approve')}
                            disabled={isProcessing}
                          >
                            {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
                            onClick={() => handleProposalAction(proposal.id, 'execute')}
                            disabled={isProcessing}
                          >
                            {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 mr-1" />}
                            Execute
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 border-red-500/40 text-red-400 hover:bg-red-500/10"
                            onClick={() => handleProposalAction(proposal.id, 'reject')}
                            disabled={isProcessing}
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      {clm.feed.length > 0 && (
        <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-indigo-400" />
              </div>
              CLM Learning Feed
              <Badge variant="outline" className="ml-auto text-[10px] font-mono">
                {clm.feed.length} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {clm.feed.slice(0, 10).map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-background/30"
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      item.priority === 'high' ? "bg-red-400" :
                      item.priority === 'medium' ? "bg-amber-400" : "bg-emerald-400"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{item.moduleId}</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-mono shrink-0">
                      {Math.round(item.confidence * 100)}%
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
