/**
 * Agent Forge — User-facing custom agent creation
 * Tier-gated slots, globally unique naming, one active at a time
 */
import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { useAuth } from '@/contexts/AuthContext';
import { useForgeAgents } from '@/hooks/useForgeAgents';
import { useUserLimits } from '@/hooks/useUserLimits';
import { validateAgentName, validateAgencyName, formatAgentName } from '@/lib/forge/name-validator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Hammer, Zap, ZapOff, Trash2, Plus, Shield, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const SPECIALIZATIONS = [
  'Defender', 'Coordinator', 'Optimizer', 'Analyst',
  'Researcher', 'Monitor', 'Auditor', 'Custom',
] as const;

export default function AgentForgePage() {
  const { user } = useAuth();
  const limits = useUserLimits();
  const forge = useForgeAgents();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Create form state
  const [agentName, setAgentName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [specialization, setSpecialization] = useState<string>('Custom');
  const [nameError, setNameError] = useState<string>();
  const [agencyError, setAgencyError] = useState<string>();

  const handleAgentNameChange = useCallback((val: string) => {
    const upper = val.toUpperCase().replace(/[^A-Z0-9\-]/g, '');
    setAgentName(upper);
    const result = validateAgentName(upper);
    setNameError(result.valid ? undefined : result.error);
  }, []);

  const handleAgencyNameChange = useCallback((val: string) => {
    setAgencyName(val);
    if (val.trim()) {
      const result = validateAgencyName(val);
      setAgencyError(result.valid ? undefined : result.error);
    } else {
      setAgencyError(undefined);
    }
  }, []);

  const handleCreate = useCallback(() => {
    if (nameError || agencyError) return;
    const nameResult = validateAgentName(agentName);
    if (!nameResult.valid) { setNameError(nameResult.error); return; }

    forge.createAgent.mutate({
      agent_name: agentName,
      agency_name: agencyName.trim() || undefined,
      specialization,
    }, {
      onSuccess: () => {
        setCreateOpen(false);
        setAgentName('');
        setAgencyName('');
        setSpecialization('Custom');
      },
    });
  }, [agentName, agencyName, specialization, nameError, agencyError, forge.createAgent]);

  const slotPercent = forge.slotsTotal > 0 ? (forge.slotsUsed / forge.slotsTotal) * 100 : 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <PublicNav />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <Hammer className="w-12 h-12 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold mb-3">Agent Forge</h1>
          <p className="text-muted-foreground mb-6">Create custom named agents. Activate them in the CLI. Ascend them through the 40-Primitive collision matrix.</p>
          <Link to="/login">
            <Button size="lg">Sign In to Forge</Button>
          </Link>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Agent Forge — CMPSBL"
        description="Create custom named agents with globally unique identities. Forge, activate, and ascend."
        type="website"
      />
      <PublicNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Hammer className="w-6 h-6 text-primary" />
              Agent Forge
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create custom agents with unique names. One active at a time.
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            disabled={forge.slotsRemaining <= 0}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Forge Agent
          </Button>
        </div>

        {/* Slot usage */}
        <Card className="p-4 mb-6 bg-card/50 border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Forge Slots
            </span>
            <span className="text-sm font-mono">
              {forge.slotsUsed} / {forge.slotsTotal === Infinity ? '∞' : forge.slotsTotal}
            </span>
          </div>
          <Progress value={slotPercent} className="h-2" />
          {forge.slotsRemaining <= 0 && (
            <p className="text-xs text-destructive mt-2">
              All slots used. Upgrade your tier or decommission an agent.
            </p>
          )}
        </Card>

        {/* Feature gates */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Card className={`p-3 text-center border-border/50 ${limits.forgeSignalAccess ? 'bg-primary/5 border-primary/20' : 'bg-muted/20'}`}>
            <Shield className={`w-4 h-4 mx-auto mb-1 ${limits.forgeSignalAccess ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-[10px] font-mono uppercase">Signal Forge</p>
            {!limits.forgeSignalAccess && <Lock className="w-3 h-3 mx-auto mt-1 text-muted-foreground" />}
          </Card>
          <Card className={`p-3 text-center border-border/50 ${limits.forgeSkillInjection ? 'bg-primary/5 border-primary/20' : 'bg-muted/20'}`}>
            <Zap className={`w-4 h-4 mx-auto mb-1 ${limits.forgeSkillInjection ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-[10px] font-mono uppercase">Skill Injection</p>
            {!limits.forgeSkillInjection && <Lock className="w-3 h-3 mx-auto mt-1 text-muted-foreground" />}
          </Card>
          <Card className={`p-3 text-center border-border/50 ${limits.forgeAscensionAccess ? 'bg-primary/5 border-primary/20' : 'bg-muted/20'}`}>
            <Hammer className={`w-4 h-4 mx-auto mb-1 ${limits.forgeAscensionAccess ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-[10px] font-mono uppercase">Ascension</p>
            {!limits.forgeAscensionAccess && <Lock className="w-3 h-3 mx-auto mt-1 text-muted-foreground" />}
          </Card>
        </div>

        {/* Agent list */}
        {forge.agents.isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading forge...</div>
        ) : !forge.agents.data?.length ? (
          <div className="text-center py-16">
            <Hammer className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No agents forged yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Create your first custom agent — name it, specialize it, activate it.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {forge.agents.data.map((agent) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`p-4 border-border/50 transition-all ${agent.is_active ? 'border-primary/40 bg-primary/5' : 'bg-card/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${agent.is_active ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm tracking-wider">
                            {formatAgentName(agent.agent_name)}
                          </span>
                          {agent.is_active && (
                            <Badge variant="default" className="text-[9px] px-1.5 py-0">ACTIVE</Badge>
                          )}
                          {agent.agency_name && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/20">
                              {agent.agency_name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {agent.specialization || 'Custom'} · Stage {agent.ascension_stage}/8
                          {agent.cjpi_score != null && ` · CJPI ${agent.cjpi_score}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {agent.is_active ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => forge.deactivateAgent.mutate(agent.id)}
                          className="h-7 text-xs gap-1"
                        >
                          <ZapOff className="w-3 h-3" /> Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => forge.activateAgent.mutate(agent.id)}
                          className="h-7 text-xs gap-1"
                        >
                          <Zap className="w-3 h-3" /> Activate
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(agent.id)}
                        className="h-7 w-7 p-0 text-destructive/60 hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* CLI hint */}
                  {agent.is_active && (
                    <div className="mt-3 p-2 bg-muted/30 rounded text-[11px] font-mono text-muted-foreground border border-border/30">
                      <span className="text-primary/70">$</span> cmpsbl forge status {formatAgentName(agent.agent_name)}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hammer className="w-5 h-5 text-primary" />
              Forge New Agent
            </DialogTitle>
            <DialogDescription>
              Name your agent (3-8 chars, globally unique). This name becomes your CLI identifier.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Agent name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Agent Name *
              </label>
              <Input
                value={agentName}
                onChange={(e) => handleAgentNameChange(e.target.value)}
                placeholder="e.g. VIPER"
                className="font-mono uppercase bg-background/50 border-primary/20 focus:border-primary/50 tracking-wider"
                maxLength={8}
              />
              {nameError && <p className="text-xs text-destructive">{nameError}</p>}
              <p className="text-[10px] text-muted-foreground">
                3-8 chars · Letters, numbers, hyphens · Globally unique · Cannot be changed
              </p>
            </div>

            {/* Agency name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Agency Name <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <Input
                value={agencyName}
                onChange={(e) => handleAgencyNameChange(e.target.value)}
                placeholder="e.g. The Syndicate"
                className="font-mono bg-background/50 border-primary/20 focus:border-primary/50"
                maxLength={16}
              />
              {agencyError && <p className="text-xs text-destructive">{agencyError}</p>}
              <p className="text-[10px] text-muted-foreground">
                3-16 chars · Group your agents under one banner · Globally unique
              </p>
            </div>

            {/* Specialization */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Specialization
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SPECIALIZATIONS.map((spec) => (
                  <Button
                    key={spec}
                    type="button"
                    size="sm"
                    variant={specialization === spec ? 'default' : 'outline'}
                    onClick={() => setSpecialization(spec)}
                    className="h-7 text-xs"
                  >
                    {spec}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={forge.createAgent.isPending || !!nameError || !agentName}
              className="gap-1.5"
            >
              <Hammer className="w-4 h-4" />
              {forge.createAgent.isPending ? 'Forging...' : 'Forge Agent'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decommission Agent?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes this agent and frees the name for others to claim.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) forge.deleteAgent.mutate(deleteTarget);
                setDeleteTarget(null);
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Decommission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EnhancedFooter />
    </div>
  );
}
