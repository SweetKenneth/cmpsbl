/**
 * Receipt Detail Card — Phase-by-phase drill-down for /verify/:fingerprint
 * Sprint 1 (Ascension V2 Phase 1)
 */

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Sparkles, ListChecks } from "lucide-react";
import { buildReceiptDetail, type ReceiptDetail } from "@/lib/factory/receipt-drilldown";
import type { UnifiedLookupResult } from "@/lib/factory/restoration-session";

export const ReceiptDetailCard = ({ result }: { result: UnifiedLookupResult }) => {
  const [detail, setDetail] = useState<ReceiptDetail | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    buildReceiptDetail(result).then((d) => {
      if (!cancelled) setDetail(d);
    });
    return () => { cancelled = true; };
  }, [result]);

  if (!detail) return null;

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:bg-muted/40 transition-colors"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          <ListChecks className="h-3.5 w-3.5" />
          Receipt Detail
        </span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-5">
          {/* Forensics — only for failed runs */}
          {detail.forensics && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex gap-3">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-destructive">{detail.forensics.failedCheck}</p>
                <p className="text-muted-foreground">{detail.forensics.remediation}</p>
              </div>
            </div>
          )}

          {/* Phases */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Pipeline Phases
            </p>
            <ol className="space-y-1.5">
              {detail.phases.map((p) => {
                const tone =
                  p.status === 'complete' ? 'text-emerald-600' :
                  p.status === 'gated' ? 'text-destructive' :
                  p.status === 'skipped' ? 'text-muted-foreground' : 'text-amber-600';
                return (
                  <li key={p.key} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${tone}`} />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-foreground">{p.label}</span>
                      <span className="text-muted-foreground"> · {p.detail}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* VAULT promotions */}
          {detail.vaultMatches.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 inline-flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                Related VAULT Promotions
                <span className="text-muted-foreground/70 normal-case font-normal">
                  ({detail.vaultMatchCount} total in matched categories)
                </span>
              </p>
              <ul className="space-y-1.5">
                {detail.vaultMatches.map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-3 text-xs px-2 py-1.5 rounded-md bg-muted/40">
                    <span className="text-foreground truncate">{v.name}</span>
                    <span className="inline-flex items-center gap-2 shrink-0">
                      {v.category && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{v.category}</span>
                      )}
                      {v.cjpi !== null && (
                        <span className="font-mono text-muted-foreground">{v.cjpi}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
