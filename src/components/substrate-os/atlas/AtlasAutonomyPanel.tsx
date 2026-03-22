/**
 * Atlas Autonomy Panel
 * CLM + SEBA unified control with Nexus fleet usage tracking
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
import { ProposalStore } from '@/lib/substrate/seba/proposal-store';
import { cn } from '@/lib/utils';
import type { SEBAMode } from '@/lib/substrate/seba';
import { CloudAIUsageCard } from './NexusUsageCard';

interface ProposedAction {
  type: string;
  target: string;
  current?: unknown;
  proposed?: unknown;
  reversible?: boolean;
  risk_factor?: number;
}

interface PendingProposal {
  id: string;
  short_id: string;
  title: string;
  summary: string;
  category: string;
  risk_level: string;
  confidence_score: number;
  created_at: string;
  requires_human_approval: boolean;
  // Code visibility fields
  proposed_actions: ProposedAction[];
  rollback_strategy?: string;
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

  // Load pending proposals from actual database with full code visibility
  const loadProposals = useCallback(async () => {
    try {
      // Fetch directly from ProposalStore for real persistence
      const stored = await ProposalStore.getPending();
      setPendingProposals(stored.map((p) => {
        const suggestedChange = p.suggested_change as Record<string, any> || {};
        const expectedImpact = p.expected_impact as Record<string, any> || {};
        const diffs = p.diffs as Record<string, any> || {};
        
        return {
          id: p.id,
          short_id: diffs.proposal_short_id || p.id.slice(0, 8),
          title: p.title,
          summary: p.summary || '',
          category: suggestedChange.category || 'general',
          risk_level: expectedImpact.risk_level || 'low',
          confidence_score: p.confidence,
          created_at: p.created_at,
          requires_human_approval: expectedImpact.requires_human_approval ?? true,
          // Code visibility: what EXACTLY will change
          proposed_actions: (suggestedChange.actions || []) as ProposedAction[],
          rollback_strategy: suggestedChange.rollback_strategy || 'Restore previous config',
        };
      }));
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
        // Update proposal status in database
        await ProposalStore.updateStatus(proposalId, 'approved', 'ATLAS_USER');
        result = await seba.approve(proposalId);
      } else if (action === 'reject') {
        // Update proposal status in database
        await ProposalStore.updateStatus(proposalId, 'rejected', 'ATLAS_USER');
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
      case 'minimal': return 'text-neon-green bg-neon-green/20 border-neon-green/40';
      case 'low': return 'text-neon-cyan bg-neon-cyan/20 border-neon-cyan/40';
      case 'medium': return 'text-neon-amber bg-neon-amber/20 border-neon-amber/40';
      case 'high': return 'text-neon-amber bg-neon-amber/20 border-neon-amber/40';
      case 'critical': return 'text-destructive bg-destructive/20 border-destructive/40';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Master Control - Hero Panel */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="relative border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-background to-neon-cyan/5 overflow-hidden shadow-xl shadow-primary/5">
          {/* Animated background mesh */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(188_98%_46%/0.1),transparent_50%)]" />
            {systemActive && (
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, hsl(142 76% 46% / 0.08), transparent 40%)',
                }}
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.02, 1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </div>
          
          <CardHeader className="pb-5 relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-5">
                {/* Status Orb */}
                <div className={cn(
                  "relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-700",
                  systemActive 
                    ? "bg-gradient-to-br from-neon-green/30 via-neon-cyan/20 to-neon-green/30 border-2 border-neon-green/60 shadow-lg shadow-neon-green/30" 
                    : "bg-gradient-to-br from-muted/40 to-muted/20 border-2 border-border/60"
                )}>
                  <Radio className={cn(
                    "w-8 h-8 transition-all duration-500",
                    systemActive ? "text-neon-green drop-shadow-[0_0_8px_hsl(142_76%_46%/0.8)]" : "text-muted-foreground"
                  )} />
                  {systemActive && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-neon-green/40"
                        animate={{ scale: [1, 1.4, 1.4], opacity: [0.6, 0, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-2xl border border-neon-cyan/30"
                        animate={{ scale: [1, 1.25, 1.25], opacity: [0.4, 0, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                      />
                      <motion.div
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center shadow-lg shadow-neon-green/50"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Zap className="w-3 h-3 text-white" />
                      </motion.div>
                    </>
                  )}
                </div>
                
                <div>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Autonomous Operation</span>
                    {systemActive ? (
                      <Badge className="bg-neon-green/25 text-neon-green border border-neon-green/50 shadow-sm shadow-neon-green/30">
                        <motion.span 
                          className="w-2 h-2 rounded-full bg-neon-green mr-2"
                          animate={{ opacity: [1, 0.4, 1], scale: [1, 0.9, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        LIVE 24/7
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground/80 border-border/60">
                        <span className="w-2 h-2 rounded-full bg-muted mr-2" />
                        STANDBY
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2 font-mono tracking-tight">
                    {systemActive 
                      ? `SEBA ${seba.mode.toUpperCase()} • CLM active • ${seba.state?.pending_proposals || 0} pending`
                      : 'Activate to enable autonomous learning and evolution'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {systemActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={runManualCycle}
                      disabled={seba.isCycleRunning}
                      className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/15 hover:border-neon-cyan/70 transition-all"
                    >
                      <RefreshCw className={cn("w-4 h-4 mr-2", seba.isCycleRunning && "animate-spin")} />
                      Run Cycle
                    </Button>
                  </motion.div>
                )}
                <Button
                  size="lg"
                  variant={systemActive ? "outline" : "default"}
                  onClick={systemActive ? deactivateSystem : activateSystem}
                  disabled={activating}
                  className={cn(
                    "min-w-[170px] h-12 transition-all font-semibold text-base",
                    systemActive 
                      ? "border-destructive/50 text-destructive hover:bg-destructive/15 hover:border-destructive/70" 
                      : "bg-gradient-to-r from-neon-green via-neon-green to-neon-cyan hover:from-neon-green hover:via-neon-green hover:to-neon-cyan shadow-xl shadow-neon-green/30 border-0"
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
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* SEBA Status */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full border-neon-purple/30 bg-gradient-to-br from-neon-purple/10 via-background to-transparent shadow-lg shadow-neon-purple/5 hover:shadow-neon-purple/10 transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-purple/30 to-neon-purple/20 flex items-center justify-center border border-neon-purple/30 shadow-sm shadow-neon-purple/20">
                  <Sparkles className="w-4 h-4 text-neon-purple" />
                </div>
                <span className="text-foreground/90">SEBA Agent</span>
                <Badge variant="outline" className="ml-auto text-[10px] uppercase font-mono border-neon-purple/40 text-neon-purple">
                  {seba.mode}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Phase', value: seba.phase, capitalize: true },
                  { label: 'Cycles', value: seba.state?.total_cycles || 0 },
                  { label: 'Success', value: seba.state?.successful_cycles || 0, color: 'text-neon-green' },
                  { label: 'Health', value: `${seba.state?.agent_health || 100}%`, color: 'text-neon-cyan' },
                ].map(stat => (
                  <div key={stat.label} className="p-3 rounded-xl bg-gradient-to-br from-background/80 to-background/40 border border-border/40 hover:border-neon-purple/30 transition-colors">
                    <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">{stat.label}</p>
                    <p className={cn(
                      "text-lg font-bold mt-0.5",
                      stat.capitalize && "capitalize",
                      stat.color || "text-foreground/90"
                    )}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 pt-2 border-t border-border/30">
                {[
                  { label: 'Pending', value: seba.state?.pending_proposals || 0, color: 'text-neon-amber' },
                  { label: 'Approved', value: seba.state?.approved_proposals || 0, color: 'text-neon-green' },
                  { label: 'Rejected', value: seba.state?.rejected_proposals || 0, color: 'text-destructive' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.label} Proposals</span>
                    <span className={cn("font-bold font-mono", item.color)}>{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CLM Status */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="h-full border-neon-cyan/30 bg-gradient-to-br from-neon-cyan/10 via-background to-transparent shadow-lg shadow-neon-cyan/5 hover:shadow-neon-cyan/10 transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-cyan/30 to-neon-cyan/20 flex items-center justify-center border border-neon-cyan/30 shadow-sm shadow-neon-cyan/20">
                  <Brain className="w-4 h-4 text-neon-cyan" />
                </div>
                <span className="text-foreground/90">CLM Status</span>
                <Badge className="ml-auto text-[10px] bg-neon-green/25 text-neon-green border border-neon-green/40">
                  24/7
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-gradient-to-br from-background/80 to-background/40 border border-border/40 hover:border-neon-cyan/30 transition-colors">
                  <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">Modules</p>
                  <p className="text-lg font-bold text-foreground/90 mt-0.5">{clm.moduleStates.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-background/80 to-background/40 border border-border/40 hover:border-neon-cyan/30 transition-colors">
                  <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">Feed Items</p>
                  <p className="text-lg font-bold text-foreground/90 mt-0.5">{clm.feed.length}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/30">
                <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">Learning Modules</p>
                <div className="flex flex-wrap gap-1.5">
                  {clm.moduleStates.slice(0, 8).map(mod => (
                    <Badge 
                      key={mod.moduleId} 
                      variant="outline" 
                      className={cn(
                        "text-[9px] font-mono transition-all",
                        mod.isLearning 
                          ? "border-neon-cyan/60 text-neon-cyan bg-neon-cyan/15 shadow-sm shadow-neon-cyan/20" 
                          : "border-border/50 text-muted-foreground"
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
                className="w-full border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/15 hover:border-neon-cyan/70 transition-all"
                onClick={clm.runAllLearning}
                disabled={clm.loading}
              >
                <RefreshCw className={cn("w-3 h-3 mr-2", clm.loading && "animate-spin")} />
                Run All Learning
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mode Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full border-neon-amber/30 bg-gradient-to-br from-neon-amber/10 via-background to-transparent shadow-lg shadow-neon-amber/5 hover:shadow-neon-amber/10 transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-amber/30 to-neon-amber/20 flex items-center justify-center border border-neon-amber/30 shadow-sm shadow-neon-amber/20">
                  <Settings2 className="w-4 h-4 text-neon-amber" />
                </div>
                <span className="text-foreground/90">SEBA Mode</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {(['off', 'observe', 'advisory', 'governed'] as SEBAMode[]).map((mode, i) => (
                <motion.button
                  key={mode}
                  onClick={() => seba.setMode(mode)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left group",
                    seba.mode === mode 
                      ? "border-primary/60 bg-gradient-to-r from-primary/15 to-primary/5 shadow-md shadow-primary/10" 
                      : "border-border/40 hover:border-border/70 hover:bg-muted/20"
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div 
                    className={cn(
                      "w-3.5 h-3.5 rounded-full transition-all",
                      seba.mode === mode 
                        ? "bg-gradient-to-br from-primary to-primary/70 shadow-sm shadow-primary/50" 
                        : "bg-muted group-hover:bg-muted-foreground/30"
                    )}
                    animate={seba.mode === mode ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize text-foreground/90">{mode}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {mode === 'off' && 'SEBA disabled'}
                      {mode === 'observe' && 'Watch only, no proposals'}
                      {mode === 'advisory' && 'Proposes, requires approval'}
                      {mode === 'governed' && 'Auto-execute if safe'}
                    </p>
                  </div>
                  {mode === 'advisory' && (
                    <Badge className="text-[9px] bg-neon-green/25 text-neon-green border border-neon-green/40 shrink-0">
                      RECOMMENDED
                    </Badge>
                  )}
                </motion.button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Cloud AI Usage Card */}
        <CloudAIUsageCard />
      </div>

      {/* Pending Proposals */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="border-neon-green/30 bg-gradient-to-br from-neon-green/10 via-background to-transparent shadow-lg shadow-neon-green/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-green/30 to-neon-green/20 flex items-center justify-center border border-neon-green/30 shadow-sm shadow-neon-green/20">
                  <Shield className="w-4 h-4 text-neon-green" />
                </div>
                <span className="text-foreground/90">Pending Proposals</span>
                {pendingProposals.length > 0 && (
                  <Badge className="bg-neon-amber/25 text-neon-amber border border-neon-amber/50 shadow-sm">
                    <motion.span 
                      className="w-1.5 h-1.5 rounded-full bg-neon-amber mr-1.5"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    {pendingProposals.length} awaiting
                  </Badge>
                )}
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={loadProposals} className="h-8 text-muted-foreground hover:text-foreground">
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[340px]">
              <AnimatePresence mode="popLayout">
                {pendingProposals.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-muted-foreground"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center mb-5 border border-border/30">
                      <CheckCircle2 className="w-10 h-10 opacity-30" />
                    </div>
                    <p className="text-sm font-medium text-foreground/60">No pending proposals</p>
                    <p className="text-xs mt-2 text-center max-w-[280px] text-muted-foreground/70">
                      SEBA will generate proposals when improvements are detected
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {pendingProposals.map((proposal, i) => {
                      const isProcessing = processingProposal === proposal.id;
                      
                      return (
                        <motion.div
                          key={proposal.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -30, scale: 0.95 }}
                          transition={{ delay: i * 0.05 }}
                          className={cn(
                            "p-4 rounded-xl border border-border/40 bg-gradient-to-br from-background/80 to-background/40 hover:border-neon-green/30 hover:shadow-md transition-all",
                            isProcessing && "opacity-50 pointer-events-none"
                          )}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn("text-[10px] uppercase font-semibold", riskColor(proposal.risk_level))}>
                                {proposal.risk_level}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] font-mono border-border/50 text-muted-foreground">
                                {proposal.category}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] border-neon-amber/40 text-neon-amber">
                                REQUIRES APPROVAL
                              </Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded-full">
                              {Math.round(proposal.confidence_score * 100)}% conf
                            </span>
                          </div>
                          
                          <h4 className="text-sm font-medium mb-1.5 text-foreground/90">{proposal.title}</h4>
                          <p className="text-[10px] text-muted-foreground font-mono mb-3">
                            ID: {proposal.short_id} • {new Date(proposal.created_at).toLocaleString()}
                          </p>
                          
                          {/* Summary / Rationale */}
                          {proposal.summary && (
                            <div className="mb-3 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{proposal.summary}</p>
                            </div>
                          )}
                          
                          {/* CODE VISIBILITY: Show exactly what will change */}
                          {proposal.proposed_actions.length > 0 && (
                            <div className="mb-3 space-y-2">
                              <p className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider flex items-center gap-1.5">
                                <Eye className="w-3 h-3" />
                                Proposed Changes ({proposal.proposed_actions.length})
                              </p>
                              <div className="space-y-1.5 p-2.5 rounded-lg bg-black/30 border border-border/30 font-mono text-[10px]">
                                {proposal.proposed_actions.map((action, actionIdx) => (
                                  <div key={actionIdx} className="flex items-start gap-2">
                                    <span className="text-neon-cyan shrink-0">[{action.type}]</span>
                                    <div className="flex-1 min-w-0">
                                      <span className="text-neon-amber">{action.target}</span>
                                      {action.current !== undefined && (
                                        <div className="text-destructive mt-0.5">
                                          - {typeof action.current === 'object' ? JSON.stringify(action.current) : String(action.current)}
                                        </div>
                                      )}
                                      {action.proposed !== undefined && (
                                        <div className="text-neon-green">
                                          + {typeof action.proposed === 'object' ? JSON.stringify(action.proposed) : String(action.proposed)}
                                        </div>
                                      )}
                                      {action.reversible !== undefined && (
                                        <span className={cn(
                                          "text-[9px] px-1.5 py-0.5 rounded ml-1",
                                          action.reversible ? "bg-neon-green/20 text-neon-green" : "bg-neon-amber/20 text-neon-amber"
                                        )}>
                                          {action.reversible ? 'reversible' : 'NOT reversible'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {proposal.rollback_strategy && (
                                <p className="text-[9px] text-muted-foreground">
                                  <strong>Rollback:</strong> {proposal.rollback_strategy}
                                </p>
                              )}
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-9 border-neon-green/50 text-neon-green hover:bg-neon-green/15 hover:border-neon-green/70 transition-all"
                              onClick={() => handleProposalAction(proposal.id, 'approve')}
                              disabled={isProcessing}
                            >
                              {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-9 border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/15 hover:border-neon-cyan/70 transition-all"
                              onClick={() => handleProposalAction(proposal.id, 'execute')}
                              disabled={isProcessing}
                            >
                              {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3.5 h-3.5 mr-1.5" />}
                              Execute
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 w-9 p-0 border-destructive/50 text-destructive hover:bg-destructive/15 hover:border-destructive/70 transition-all"
                              onClick={() => handleProposalAction(proposal.id, 'reject')}
                              disabled={isProcessing}
                            >
                              <XCircle className="w-3.5 h-3.5" />
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
      </motion.div>

      {/* Activity Feed */}
      {clm.feed.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-background to-transparent shadow-lg shadow-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/30 to-primary/20 flex items-center justify-center border border-primary/30 shadow-sm shadow-primary/20">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground/90">CLM Learning Feed</span>
                <Badge variant="outline" className="ml-auto text-[10px] font-mono border-primary/40 text-primary">
                  {clm.feed.length} items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[220px]">
                <div className="space-y-2">
                  {clm.feed.slice(0, 10).map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-border/30 bg-gradient-to-r from-background/60 to-transparent hover:border-primary/30 transition-all"
                    >
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full shadow-sm",
                        item.priority === 'high' ? "bg-destructive shadow-destructive/40" :
                        item.priority === 'medium' ? "bg-neon-amber shadow-neon-amber/40" : "bg-neon-green shadow-neon-green/40"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-foreground/90">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{item.moduleId}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-mono shrink-0 border-border/50 text-muted-foreground">
                        {Math.round(item.confidence * 100)}%
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
