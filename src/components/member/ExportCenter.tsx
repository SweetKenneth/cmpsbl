/**
 * Export Center — Pre-built export formats for pipeline artifacts (Studio+)
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Download, FileJson, FileText, FileSpreadsheet, FileCode,
  Package, CheckCircle2, Clock, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: string;
  icon: React.ElementType;
  minTier: string;
  fields: string[];
}

const EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: 'json-full', name: 'Full JSON Export', description: 'Complete pipeline data with metadata, dependencies, and execution traces',
    format: 'JSON', icon: FileJson, minTier: 'studio',
    fields: ['Pipeline definition', 'Execution traces', 'Dependencies', 'Metadata', 'CJPI scores'],
  },
  {
    id: 'csv-metrics', name: 'Metrics CSV', description: 'Tabular export of performance metrics, usage stats, and cost data',
    format: 'CSV', icon: FileSpreadsheet, minTier: 'studio',
    fields: ['Daily metrics', 'Cost attribution', 'Token usage', 'Latency data'],
  },
  {
    id: 'pdf-report', name: 'Audit Report', description: 'Formatted compliance report with execution chain and governance data',
    format: 'PDF', icon: FileText, minTier: 'architect',
    fields: ['Governance audit', 'Execution chain', 'Compliance status', 'Risk assessment'],
  },
  {
    id: 'ts-runtime', name: 'Runtime Bundle', description: 'TypeScript runtime package ready for deployment in external environments',
    format: 'TS', icon: FileCode, minTier: 'architect',
    fields: ['Mini-runtime', 'Bridge adapter', 'Type definitions', 'Test harness'],
  },
  {
    id: 'pack-artifact', name: 'Artifact Pack', description: 'Complete artifact pack with pipeline, documentation, and license',
    format: 'ZIP', icon: Package, minTier: 'architect',
    fields: ['Pipeline code', 'Documentation', 'License', 'Build config', 'Testbench'],
  },
];

const TIER_PRIORITY: Record<string, number> = {
  free: 0, builder: 0, creator: 1, studio: 2, architect: 3, governor: 5,
};

export function ExportCenter({ tier }: { tier: string }) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (template: ExportTemplate) => {
    if ((TIER_PRIORITY[tier] ?? 0) < (TIER_PRIORITY[template.minTier] ?? 0)) {
      toast.error(`${template.name} requires ${template.minTier} tier or above`);
      return;
    }
    setExporting(template.id);
    // Simulate export generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success(`${template.name} generated`, { description: `${template.format} file ready for download` });
    setExporting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Download className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold">Export Center</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Pre-built export templates for your pipeline artifacts and system data.
      </p>

      <div className="space-y-3">
        {EXPORT_TEMPLATES.map((tmpl, i) => {
          const locked = (TIER_PRIORITY[tier] ?? 0) < (TIER_PRIORITY[tmpl.minTier] ?? 0);
          const isExporting = exporting === tmpl.id;

          return (
            <motion.div
              key={tmpl.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "rounded-xl border bg-card/50 p-4 transition-all",
                locked ? "border-border/30 opacity-60" : "border-border/40 hover:border-primary/20"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                    locked ? "bg-muted/30 border-border/30" : "bg-primary/10 border-primary/20"
                  )}>
                    <tmpl.icon className={cn("w-5 h-5", locked ? "text-muted-foreground" : "text-primary")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold">{tmpl.name}</h3>
                      <Badge variant="outline" className="text-[9px] px-1.5">{tmpl.format}</Badge>
                      {locked && <Badge variant="secondary" className="text-[9px] px-1.5 capitalize">{tmpl.minTier}+</Badge>}
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">{tmpl.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tmpl.fields.map(f => (
                        <span key={f} className="text-[9px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground border border-border/20">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={locked ? "ghost" : "default"}
                  className="h-9 gap-1.5 text-xs shrink-0"
                  disabled={locked || isExporting}
                  onClick={() => handleExport(tmpl)}
                >
                  {isExporting ? (
                    <><Clock className="w-3 h-3 animate-spin" /> Generating...</>
                  ) : locked ? (
                    <>Locked</>
                  ) : (
                    <><Download className="w-3 h-3" /> Export</>
                  )}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {(tier === 'free' || tier === 'builder' || tier === 'creator') && (
        <div className="text-center pt-4">
          <Button asChild variant="outline" className="gap-2 text-sm">
            <Link to="/store?tab=plans">
              Unlock More Exports <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
