/**
 * PipelineProvenance — Visual lineage surface for crystallized pipelines.
 * Shows module ancestry, CJPI score, discovery timestamp, and export capability.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Diamond, ArrowRight, Download, Clock } from 'lucide-react';
import { getPipelineLineage, type PipelineLineageRecord } from '@/substrate/memory-lineage';

interface Props {
  /** The pipeline to show provenance for — or null to close */
  pipeline: {
    name: string;
    score: number;
    systemChain: string[];
  } | null;
  onClose: () => void;
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

export function PipelineProvenance({ pipeline, onClose }: Props) {
  if (!pipeline) return null;

  // Look up lineage from registry
  const lineageRecords = getPipelineLineage(100);
  const lineage = lineageRecords.find(r => r.pipelineName === pipeline.name);

  const modules = lineage?.modules ?? pipeline.systemChain ?? [];
  const cjpi = lineage?.cjpi ?? pipeline.score;
  const timestamp = lineage?.crystallizedAt ?? new Date().toISOString();

  const exportProvenance = () => {
    const data = {
      pipeline: pipeline.name,
      cjpi,
      modules,
      crystallizedAt: timestamp,
      lineageId: lineage?.id ?? 'untracked',
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
          className={`relative w-full max-w-lg bg-card border border-border/30 rounded-xl overflow-hidden ${tierGlow(cjpi)}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <Diamond className={`w-4 h-4 ${tierColor(cjpi)}`} />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
                Pipeline Provenance
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-muted/30 transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Pipeline name + score */}
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
            </div>
          </div>

          {/* Module lineage chain */}
          <div className="px-5 pb-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground mb-3">
              Module Lineage
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {modules.map((mod, i) => (
                <span key={mod} className="flex items-center gap-1.5">
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-xs font-mono font-bold px-2.5 py-1 rounded border border-primary/20 bg-primary/5 text-foreground"
                  >
                    {mod}
                  </motion.span>
                  {i < modules.length - 1 && (
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
          </div>

          {/* Actions */}
          <div className="border-t border-border/20 px-5 py-3 flex items-center justify-end gap-2">
            <button
              onClick={exportProvenance}
              className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded border border-border/20 hover:border-border/40"
            >
              <Download className="w-3 h-3" />
              Export Provenance
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
