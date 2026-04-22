/**
 * V2 Contract Verified Panel — Phase 7
 *
 * Surfaces the result of the Phase 5 envelope verifier and the Phase 6
 * export self-check directly in the V2 results step. Turns the invisible
 * V1 contract into visible proof for the user.
 *
 * Pure presentational — all data is computed during export and passed in.
 *
 * © CMPSBL® — All rights reserved.
 */
import { useState } from 'react';
import { ShieldCheck, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GovernanceMode } from '@/lib/ascension-v2/governance-mode';
import type { EnvelopeVerification } from '@/lib/export/envelope-verifier';
import type { ExportSelfCheckResult } from '@/lib/export/export-self-check';

export interface V2ContractVerifiedPanelProps {
  readonly lang: string;
  readonly mode: GovernanceMode;
  readonly capability: string;
  readonly chain: ReadonlyArray<string>;
  readonly selfCheck: ExportSelfCheckResult;
  readonly envelope: EnvelopeVerification;
}

const MODE_LABEL: Record<GovernanceMode, string> = {
  observe: 'Observe',
  soft: 'Soft',
  enforce: 'Enforce',
};

const MODE_TONE: Record<GovernanceMode, string> = {
  observe: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  soft: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  enforce: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
};

export function V2ContractVerifiedPanel({
  lang, mode, capability, chain, selfCheck, envelope,
}: V2ContractVerifiedPanelProps) {
  const [open, setOpen] = useState(false);
  const passed = selfCheck.ok && envelope.ok;
  const issueCount = selfCheck.issues.length + envelope.issues.length;

  return (
    <div
      className={cn(
        'rounded-xl border bg-card/40 backdrop-blur-sm p-3 sm:p-4',
        passed ? 'border-emerald-500/30' : 'border-rose-500/40',
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
              passed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400',
            )}
          >
            {passed ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">
              {passed ? 'Contract verified' : 'Contract drift detected'}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {passed
                ? `V1 envelope shape locked across ${lang}`
                : `${issueCount} issue${issueCount === 1 ? '' : 's'} found before write`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={cn(
              'text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border',
              MODE_TONE[mode],
            )}
          >
            {MODE_LABEL[mode]}
          </span>
          {open ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t border-border/40 space-y-3 text-xs">
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Capability</dt>
              <dd className="text-foreground font-mono truncate">{capability}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Language</dt>
              <dd className="text-foreground font-mono">{lang}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Strategy</dt>
              <dd className="text-foreground font-mono">{envelope.summary.strategy ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Verdict</dt>
              <dd className="text-foreground font-mono">{envelope.summary.verdict ?? 'allow'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Chain</dt>
              <dd className="text-foreground font-mono break-words">{chain.join(' → ')}</dd>
            </div>
          </dl>

          {!passed && (
            <div className="rounded-md bg-rose-500/10 border border-rose-500/30 p-2 space-y-1">
              <div className="text-[11px] font-semibold text-rose-300">Drift report</div>
              <ul className="list-disc list-inside space-y-0.5 text-rose-200/90">
                {selfCheck.issues.map((i, idx) => (
                  <li key={`sc-${idx}`}>
                    <span className="font-mono">{i.token}</span>: {i.message}
                  </li>
                ))}
                {envelope.issues.map((i, idx) => (
                  <li key={`ev-${idx}`}>
                    <span className="font-mono">{i.path}</span>: {i.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Verified at export time via the substrate's structural self-check
            (Phase 6) and runtime envelope verifier (Phase 5). The same V1
            contract is locked across all 4 canonical languages and 23 polyglot
            bridges.
          </p>
        </div>
      )}
    </div>
  );
}
