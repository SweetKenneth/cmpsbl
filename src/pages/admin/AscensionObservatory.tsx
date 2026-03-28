/**
 * Ascension Observatory — Admin Dashboard
 * Observe, enable, disable, rollback, and test all 5 ascended capabilities.
 */
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ShieldCheck, ShieldAlert, ShieldOff,
  Activity, ToggleLeft, ToggleRight, RotateCcw,
  Zap, Eye, AlertTriangle, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, Play, Clock, Hash,
  Lock, Unlock, Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  getObservatoryState,
  enableCapability,
  disableCapability,
  enableAll,
  disableAll,
  rollbackCapability,
  rollbackAll,
  resetCircuit,
  executeGoverned,
  getObservatoryAudit,
  verifyObservatoryIntegrity,
  PACK_META,
} from '@/core/ascension';
import type { CapabilityGovernance, ObservatoryAuditEntry } from '@/core/ascension';
import type { CapabilityMeta } from '@/core/ascension';

// ═══ Tier Colors ═════════════════════════════════════════════════════════

const TIER_STYLES: Record<string, string> = {
  apex: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  mythic: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  relic: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  prime: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  mint: 'bg-muted text-muted-foreground border-border',
};

// ═══ Capability Card ═════════════════════════════════════════════════════

interface CapCardProps {
  gov: CapabilityGovernance & { meta: CapabilityMeta };
  onToggle: (id: string) => void;
  onRollback: (id: string) => void;
  onResetCircuit: (id: string) => void;
  onTest: (id: string) => void;
}

function CapabilityCard({ gov, onToggle, onRollback, onResetCircuit, onTest }: CapCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { meta } = gov;
  const tierStyle = TIER_STYLES[meta.tier] || TIER_STYLES.mint;

  const statusIcon = gov.circuitOpen
    ? <ShieldAlert className="w-5 h-5 text-destructive" />
    : gov.enabled
    ? <ShieldCheck className="w-5 h-5 text-emerald-400" />
    : <ShieldOff className="w-5 h-5 text-muted-foreground" />;

  const statusLabel = gov.circuitOpen ? 'CIRCUIT OPEN' : gov.enabled ? 'ACTIVE' : 'DISABLED';
  const statusColor = gov.circuitOpen ? 'text-destructive' : gov.enabled ? 'text-emerald-400' : 'text-muted-foreground';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <div className="mt-0.5">{statusIcon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground text-sm truncate">{meta.displayName}</h3>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${tierStyle}`}>
              {meta.tier.toUpperCase()} {meta.cjpi}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{meta.protects}</p>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
            <span className={statusColor}>{statusLabel}</span>
            <span>·</span>
            <span>{gov.totalExecutions} runs</span>
            {gov.totalErrors > 0 && (
              <>
                <span>·</span>
                <span className="text-destructive">{gov.totalErrors} errors</span>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => onToggle(meta.id)}
            title={gov.enabled ? 'Disable' : 'Enable'}
          >
            {gov.enabled
              ? <ToggleRight className="w-4 h-4 text-emerald-400" />
              : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => onTest(meta.id)}
            title="Test run"
            disabled={!gov.enabled}
          >
            <Play className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Expanded Detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <Separator />
              <p className="text-xs text-muted-foreground">{meta.description}</p>

              {/* Chain visualization */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Primitive Chain
                </span>
                <div className="flex flex-wrap gap-1">
                  {meta.chain.map((p, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Hash className="w-3 h-3" />
                  <span className="font-mono">{meta.fingerprint}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{gov.lastExecution ? new Date(gov.lastExecution).toLocaleTimeString() : 'Never'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {gov.circuitOpen && (
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onResetCircuit(meta.id)}>
                    <Zap className="w-3 h-3 mr-1" /> Reset Circuit
                  </Button>
                )}
                <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => onRollback(meta.id)}>
                  <RotateCcw className="w-3 h-3 mr-1" /> Rollback
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══ Audit Log ═══════════════════════════════════════════════════════════

function AuditLog({ entries }: { entries: ObservatoryAuditEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-4">No audit entries yet</p>;
  }
  return (
    <ScrollArea className="h-[240px]">
      <div className="space-y-1 pr-2">
        {entries.map(e => (
          <div key={e.id} className="flex items-center gap-2 text-[11px] py-1 px-2 rounded hover:bg-muted/50">
            {e.success
              ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              : <XCircle className="w-3 h-3 text-destructive shrink-0" />}
            <span className="font-mono text-muted-foreground w-16 shrink-0">{e.capabilityId}</span>
            <span className="text-foreground">{e.action}</span>
            {e.durationMs !== undefined && (
              <span className="text-muted-foreground ml-auto">{e.durationMs.toFixed(1)}ms</span>
            )}
            <span className="text-muted-foreground/50 font-mono text-[9px]">{e.integrityHash.slice(0, 6)}</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// ═══ Main Dashboard ══════════════════════════════════════════════════════

const AscensionObservatory = () => {
  const [state, setState] = useState(getObservatoryState());
  const [audit, setAudit] = useState<ObservatoryAuditEntry[]>([]);
  const [integrity, setIntegrity] = useState<{ valid: boolean; entries: number } | null>(null);

  const refresh = useCallback(() => {
    setState(getObservatoryState());
    setAudit(getObservatoryAudit(50));
    setIntegrity(verifyObservatoryIntegrity());
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleToggle = (id: string) => {
    const cap = state.capabilities.find(c => c.capabilityId === id);
    if (!cap) return;
    if (cap.enabled) {
      disableCapability(id);
      toast.info(`${cap.meta.displayName} disabled`);
    } else {
      enableCapability(id);
      toast.success(`${cap.meta.displayName} enabled`);
    }
    refresh();
  };

  const handleRollback = (id: string) => {
    rollbackCapability(id);
    toast.warning('Capability rolled back');
    refresh();
  };

  const handleResetCircuit = (id: string) => {
    resetCircuit(id);
    toast.info('Circuit breaker reset');
    refresh();
  };

  const handleTest = (id: string) => {
    const result = executeGoverned(id, { _test: true, timestamp: Date.now(), sample: 'Hello <script>alert(1)</script>' });
    if (result.status === 'ok') {
      const threats = (result.output._enriched as Record<string, any>)?._defense?.threats ?? 0;
      toast.success(`Test passed — ${result.output._pipeline.durationMs.toFixed(1)}ms, ${threats} threats detected`);
    } else {
      toast.error(`Test: ${result.status} — ${result.reason}`);
    }
    refresh();
  };

  const activeCount = state.capabilities.filter(c => c.enabled).length;
  const circuitOpenCount = state.capabilities.filter(c => c.circuitOpen).length;
  const totalRuns = state.capabilities.reduce((sum, c) => sum + c.totalExecutions, 0);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Ascension Observatory</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Pack: {PACK_META.name} · {PACK_META.totalCapabilities} capabilities · Avg CJPI {PACK_META.averageCjpi}
        </p>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Active', value: `${activeCount}/5`, icon: Radio, color: activeCount > 0 ? 'text-emerald-400' : 'text-muted-foreground' },
          { label: 'Circuits', value: circuitOpenCount > 0 ? `${circuitOpenCount} OPEN` : 'OK', icon: Zap, color: circuitOpenCount > 0 ? 'text-destructive' : 'text-emerald-400' },
          { label: 'Total Runs', value: String(totalRuns), icon: Activity, color: 'text-primary' },
          { label: 'Integrity', value: integrity?.valid ? 'VALID' : 'UNKNOWN', icon: Lock, color: integrity?.valid ? 'text-emerald-400' : 'text-muted-foreground' },
        ].map((stat, i) => (
          <Card key={i} className="bg-card/60 backdrop-blur-sm border-border">
            <CardContent className="p-3 text-center">
              <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
              <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Global Controls */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { enableAll(); refresh(); toast.success('All capabilities enabled'); }}>
          <Unlock className="w-3 h-3 mr-1" /> Enable All
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { disableAll(); refresh(); toast.info('All capabilities disabled'); }}>
          <Lock className="w-3 h-3 mr-1" /> Disable All
        </Button>
        <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => { rollbackAll(); refresh(); toast.warning('Global rollback executed'); }}>
          <RotateCcw className="w-3 h-3 mr-1" /> Rollback All
        </Button>
      </div>

      {/* Capability Cards */}
      <div className="space-y-3">
        {state.capabilities.map(gov => (
          <CapabilityCard
            key={gov.capabilityId}
            gov={gov}
            onToggle={handleToggle}
            onRollback={handleRollback}
            onResetCircuit={handleResetCircuit}
            onTest={handleTest}
          />
        ))}
      </div>

      {/* Audit Trail */}
      <Card className="bg-card/60 backdrop-blur-sm border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Audit Trail
            {integrity && (
              <Badge variant="outline" className={`text-[10px] ml-auto ${integrity.valid ? 'text-emerald-400 border-emerald-500/40' : 'text-destructive border-destructive/40'}`}>
                {integrity.entries} entries · {integrity.valid ? 'Chain Valid' : 'Chain Broken'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLog entries={audit} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AscensionObservatory;
