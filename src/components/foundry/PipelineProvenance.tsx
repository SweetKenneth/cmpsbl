/**
 * PipelineProvenance — Visual lineage surface for crystallized memories.
 * Mobile: uses bottom Drawer with scrollable content; export opens in a second Drawer.
 * Desktop: uses centered modal overlay.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Diamond, ArrowRight, Download, Clock, Fingerprint, CheckCircle, Copy, Code2 } from 'lucide-react';
import { ArtifactExportPanel } from './ArtifactExportPanel';
import { getPipelineLineage } from '@/substrate/memory-lineage';
import {
  generatePipelineFingerprint,
  truncateFingerprint,
  moduleChainToSteps,
  type PipelineStep,
} from '@/substrate/pipeline-fingerprint';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { toast } from 'sonner';

interface Props {
  pipeline: {
    name: string;
    score: number;
    systemChain: string[];
    pipelineSteps?: PipelineStep[];
    fingerprint?: string;
    discoveryCount?: number;
    firstDiscoveredAt?: string;
    lastDiscoveredAt?: string;
  } | null;
  onClose: () => void;
  subscriptionTier?: string;
}

function tierColor(score: number): string {
  if (score === 100) return 'text-primary';
  if (score >= 94) return 'text-purple-400';
  if (score >= 90) return 'text-amber-400';
  if (score >= 80) return 'text-sky-400';
  return 'text-emerald-400';
}

function tierGlow(score: number): string {
  if (score >= 94) return 'shadow-[0_0_20px_hsl(var(--primary)/0.3)]';
  if (score >= 90) return 'shadow-[0_0_16px_rgba(168,85,247,0.2)]';
  if (score >= 80) return 'shadow-[0_0_12px_rgba(245,158,11,0.15)]';
  return '';
}

/* ── Shared provenance body ── */
function ProvenanceBody({
  pipeline,
  subscriptionTier,
  cjpi,
  steps,
  modules,
  fingerprint,
  timestamp,
  discoveryCount,
  onOpenExport,
  onClose,
  isMobile,
}: {
  pipeline: NonNullable<Props['pipeline']>;
  cjpi: number;
  steps: PipelineStep[];
  modules: string[];
  fingerprint: string | undefined;
  timestamp: string;
  discoveryCount: number;
  onOpenExport: () => void;
  onClose: () => void;
  isMobile: boolean;
  subscriptionTier?: string;
}) {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);
  const { copy, copied } = useCopyToClipboard();

  const handleVerify = async () => {
    if (!fingerprint) return;
    setVerifying(true);
    try {
      const recomputed = await generatePipelineFingerprint({ steps });
      setVerified(recomputed === fingerprint);
      if (recomputed === fingerprint) {
        toast.success('Artifact verified — structural fingerprint matches');
      } else {
        toast.error('Fingerprint mismatch — artifact may have been modified');
      }
    } catch {
      setVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleCopyFingerprint = () => {
    if (fingerprint) {
      copy(fingerprint);
      toast.success('Fingerprint copied');
    }
  };

  const exportProvenance = () => {
    const data = {
      pipeline: pipeline.name,
      cjpi,
      pipelineSteps: steps,
      modules,
      fingerprint: fingerprint || 'untracked',
      crystallizedAt: timestamp,
      discoveryCount,
      firstDiscoveredAt: pipeline.firstDiscoveredAt || timestamp,
      lastDiscoveredAt: pipeline.lastDiscoveredAt || timestamp,
      substrate_version: 'SPARTA',
      epoch: 'SPARTA',
      source: 'CMPSBL Memory Stream',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `provenance-${pipeline.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Diamond className={`w-4 h-4 ${tierColor(cjpi)}`} />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
            Memory Provenance
          </span>
        </div>
        {!isMobile && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted/30 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Memory name + score */}
      <div className="px-5 pb-4">
        <h3 className="text-lg font-mono font-black text-foreground leading-tight">
          {pipeline.name}
        </h3>
        <div className="flex items-center gap-3 mt-2">
          <span className={`text-3xl font-mono font-black ${tierColor(cjpi)}`}>
            {cjpi}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            CJPI
          </span>
          {discoveryCount > 1 && (
            <span className="text-[10px] font-mono text-muted-foreground/60 ml-auto">
              Discovered {discoveryCount}× globally
            </span>
          )}
        </div>
      </div>

      {/* Fingerprint */}
      {fingerprint && (
        <div className="px-5 pb-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground mb-2">
            Structural Fingerprint
          </div>
          <div className="flex items-center gap-2">
            <Fingerprint className="w-3.5 h-3.5 text-primary/60 shrink-0" />
            <code className="text-xs font-mono text-foreground/80 truncate">
              {truncateFingerprint(fingerprint)}
            </code>
            <button
              onClick={handleCopyFingerprint}
              className="p-1 rounded hover:bg-muted/30 transition-colors text-muted-foreground hover:text-foreground shrink-0"
              title="Copy full fingerprint"
            >
              {copied ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="text-[9px] font-mono text-muted-foreground/40 mt-1">
            Identity derived from architecture only (steps + epoch)
          </div>
          {verified !== null && (
            <div className={`text-[9px] font-mono mt-1 ${verified ? 'text-emerald-400' : 'text-destructive'}`}>
              {verified ? '✓ Verified — structural fingerprint matches' : '✗ Mismatch detected'}
            </div>
          )}
        </div>
      )}

      {/* Pipeline steps (capability-level) */}
      <div className="px-5 pb-4">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground mb-3">
          Pipeline Architecture
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {steps.map((step, i) => (
            <span key={`${step.module}-${step.capability}-${i}`} className="flex items-center gap-1.5">
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-xs font-mono font-bold px-2.5 py-1 rounded border border-primary/20 bg-primary/5 text-foreground"
              >
                <span className="text-primary/80">{step.module.toUpperCase()}</span>
                <span className="text-muted-foreground/60">.{step.capability}</span>
              </motion.span>
              {i < steps.length - 1 && (
                <ArrowRight className="w-3 h-3 text-muted-foreground/40" />
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Timestamp */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60 font-mono">
          <Clock className="w-3 h-3" />
          Crystallized {new Date(timestamp).toLocaleString()}
        </div>
        {pipeline.lastDiscoveredAt && pipeline.lastDiscoveredAt !== timestamp && (
          <div className="text-[9px] text-muted-foreground/40 font-mono mt-1 ml-5">
            Last seen {new Date(pipeline.lastDiscoveredAt).toLocaleString()}
          </div>
        )}
      </div>

      {/* On mobile: button to open export drawer. On desktop: inline export panel. */}
      {isMobile ? (
        <div className="px-5 pb-4">
          <button
            onClick={onOpenExport}
            className="w-full flex items-center justify-center gap-2 text-sm font-mono px-4 py-3 rounded-lg border border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10 transition-colors"
          >
            <Code2 className="w-4 h-4" />
            View Export Languages
          </button>
        </div>
      ) : (
        <ArtifactExportPanel
          artifact={{
            name: pipeline.name,
            score: cjpi,
            systemChain: modules,
            category: null,
            fingerprint,
          }}
          subscriptionTier={subscriptionTier}
        />
      )}

      {/* Actions */}
      <div className="border-t border-border/20 px-5 py-3 flex items-center justify-end gap-2">
        {fingerprint && (
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded border border-border/20 hover:border-border/40 disabled:opacity-50"
          >
            <CheckCircle className="w-3 h-3" />
            {verifying ? 'Verifying…' : 'Verify Artifact'}
          </button>
        )}
        <button
          onClick={exportProvenance}
          className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded border border-border/20 hover:border-border/40"
        >
          <Download className="w-3 h-3" />
          Export Provenance
        </button>
      </div>
    </>
  );
}

/* ── Main component ── */
export function PipelineProvenance({ pipeline, onClose, subscriptionTier }: Props) {
  const isMobile = useIsMobile();
  const [exportOpen, setExportOpen] = useState(false);

  if (!pipeline) return null;

  const lineageRecords = getPipelineLineage(100);
  const lineage = lineageRecords.find(r => r.pipelineName === pipeline.name);

  const steps: PipelineStep[] = pipeline.pipelineSteps
    ?? moduleChainToSteps(lineage?.modules ?? pipeline.systemChain ?? []);
  const modules = lineage?.modules ?? pipeline.systemChain ?? [];
  const cjpi = lineage?.cjpi ?? pipeline.score;
  const timestamp = lineage?.crystallizedAt ?? pipeline.firstDiscoveredAt ?? new Date().toISOString();
  const fingerprint = pipeline.fingerprint;
  const discoveryCount = pipeline.discoveryCount ?? 1;

  const sharedProps = {
    pipeline,
    cjpi,
    steps,
    modules,
    fingerprint,
    timestamp,
    discoveryCount,
    onOpenExport: () => setExportOpen(true),
    onClose,
    isMobile,
    subscriptionTier,
  };

  /* ── Mobile: two Drawers ── */
  if (isMobile) {
    return (
      <>
        {/* Drawer 1: Provenance */}
        <Drawer open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
          <DrawerContent className="z-[100000] bg-card border-border/30 max-h-[85dvh]">
            <div className="overflow-y-auto max-h-[calc(85dvh-2rem)] pb-[env(safe-area-inset-bottom)]">
              <ProvenanceBody {...sharedProps} />
            </div>
          </DrawerContent>
        </Drawer>

        {/* Drawer 2: Export languages */}
        <Drawer open={exportOpen} onOpenChange={setExportOpen}>
          <DrawerContent className="z-[100001] bg-card border-border/30 max-h-[85dvh]">
            <div className="overflow-y-auto max-h-[calc(85dvh-2rem)] pb-[env(safe-area-inset-bottom)]">
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2">
                  <Code2 className={`w-4 h-4 ${tierColor(cjpi)}`} />
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
                    Export — {pipeline.name}
                  </span>
                </div>
              </div>
              <ArtifactExportPanel
                artifact={{
                  name: pipeline.name,
                  score: cjpi,
                  systemChain: modules,
                  category: null,
                  fingerprint,
                }}
                subscriptionTier={subscriptionTier}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  /* ── Desktop: single centered modal ── */
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-card border border-border/30 rounded-xl ${tierGlow(cjpi)}`}
        >
          <ProvenanceBody {...sharedProps} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
