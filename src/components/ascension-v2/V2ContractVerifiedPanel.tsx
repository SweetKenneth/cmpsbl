/**
 * V2 Contract Verified Panel — Phase 7 + Phase 9
 *
 * Phase 7 surfaced the result of the envelope verifier and export self-check.
 *
 * Phase 9 adds per-finding policy overrides: each drift finding now carries
 * an "accept" / "block" / "default" toggle. Decisions are local-only and
 * informational — they never re-write the artifact (the ZIP is already on
 * disk). They DO get summarized into a downloadable `findings-overrides.json`
 * sidecar that travels with the user's evidence pack so the next run, an
 * auditor, or a CI gate can replay the human decisions deterministically.
 *
 * The panel stays purely presentational at the export level: it owns its own
 * decision state and exposes nothing that mutates the parent unless an
 * `onOverridesChange` callback is provided.
 *
 * © CMPSBL® — All rights reserved.
 */
import { useMemo, useState, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Minus,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GovernanceMode } from '@/lib/ascension-v2/governance-mode';
import type { EnvelopeVerification } from '@/lib/export/envelope-verifier';
import type { ExportSelfCheckResult } from '@/lib/export/export-self-check';

export type FindingDecision = 'default' | 'accept' | 'block';

export interface FindingOverrideRecord {
  readonly source: 'self-check' | 'envelope';
  readonly key: string;
  readonly code: string;
  readonly message: string;
  readonly decision: FindingDecision;
}

export interface FindingsOverrideSummary {
  readonly totalFindings: number;
  readonly accepted: number;
  readonly blocked: number;
  readonly defaulted: number;
  readonly records: ReadonlyArray<FindingOverrideRecord>;
}

export interface V2ContractVerifiedPanelProps {
  readonly lang: string;
  readonly mode: GovernanceMode;
  readonly capability: string;
  readonly chain: ReadonlyArray<string>;
  readonly selfCheck: ExportSelfCheckResult;
  readonly envelope: EnvelopeVerification;
  /** Optional — fired whenever the user changes any per-finding override. */
  readonly onOverridesChange?: (summary: FindingsOverrideSummary) => void;
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

interface NormalizedFinding {
  readonly source: 'self-check' | 'envelope';
  readonly key: string;
  readonly code: string;
  readonly label: string;
  readonly message: string;
}

export function V2ContractVerifiedPanel({
  lang,
  mode,
  capability,
  chain,
  selfCheck,
  envelope,
  onOverridesChange,
}: V2ContractVerifiedPanelProps) {
  const [open, setOpen] = useState(false);
  const passed = selfCheck.ok && envelope.ok;
  const issueCount = selfCheck.issues.length + envelope.issues.length;

  // Stable, deduped finding list — drives the override UI. Keys are stable
  // across renders so user decisions don't reset on re-render.
  const findings = useMemo<ReadonlyArray<NormalizedFinding>>(() => {
    const out: NormalizedFinding[] = [];
    selfCheck.issues.forEach((i, idx) => {
      out.push({
        source: 'self-check',
        key: `sc-${idx}-${i.token}`,
        code: i.token,
        label: i.token,
        message: i.message,
      });
    });
    envelope.issues.forEach((i, idx) => {
      out.push({
        source: 'envelope',
        key: `ev-${idx}-${i.code}-${i.path}`,
        code: i.code,
        label: i.path,
        message: i.message,
      });
    });
    return out;
  }, [selfCheck, envelope]);

  const [decisions, setDecisions] = useState<Record<string, FindingDecision>>({});

  const fireChange = useCallback(
    (next: Record<string, FindingDecision>) => {
      if (!onOverridesChange) return;
      const records: FindingOverrideRecord[] = findings.map((f) => ({
        source: f.source,
        key: f.label,
        code: f.code,
        message: f.message,
        decision: next[f.key] ?? 'default',
      }));
      const accepted = records.filter((r) => r.decision === 'accept').length;
      const blocked = records.filter((r) => r.decision === 'block').length;
      onOverridesChange({
        totalFindings: records.length,
        accepted,
        blocked,
        defaulted: records.length - accepted - blocked,
        records,
      });
    },
    [findings, onOverridesChange],
  );

  const setDecision = useCallback(
    (key: string, decision: FindingDecision) => {
      setDecisions((prev) => {
        const next = { ...prev, [key]: decision };
        fireChange(next);
        return next;
      });
    },
    [fireChange],
  );

  const acceptedCount = findings.filter((f) => decisions[f.key] === 'accept').length;
  const blockedCount = findings.filter((f) => decisions[f.key] === 'block').length;

  const downloadOverrides = useCallback(() => {
    const records: FindingOverrideRecord[] = findings.map((f) => ({
      source: f.source,
      key: f.label,
      code: f.code,
      message: f.message,
      decision: decisions[f.key] ?? 'default',
    }));
    const payload = {
      capability,
      language: lang,
      mode,
      chain: [...chain],
      generatedAt: new Date().toISOString(),
      summary: {
        totalFindings: records.length,
        accepted: records.filter((r) => r.decision === 'accept').length,
        blocked: records.filter((r) => r.decision === 'block').length,
        defaulted: records.filter((r) => r.decision === 'default').length,
      },
      records,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `findings-overrides-${capability}-${lang}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [findings, decisions, capability, lang, mode, chain]);

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
              {!passed && (acceptedCount > 0 || blockedCount > 0) && (
                <span className="ml-1 text-foreground/80">
                  · {acceptedCount} accepted · {blockedCount} blocked
                </span>
              )}
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

          {!passed && findings.length > 0 && (
            <div className="rounded-md bg-rose-500/5 border border-rose-500/30 p-2 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-semibold text-rose-300">
                  Drift report — per-finding policy
                </div>
                <button
                  type="button"
                  onClick={downloadOverrides}
                  className="text-[10px] inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                  title="Download findings-overrides.json"
                >
                  <Download className="w-3 h-3" />
                  Export decisions
                </button>
              </div>
              <ul className="space-y-1.5">
                {findings.map((f) => {
                  const current = decisions[f.key] ?? 'default';
                  return (
                    <li
                      key={f.key}
                      className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2 rounded border border-border/40 bg-background/40 p-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                            {f.source === 'self-check' ? 'self-check' : 'envelope'}
                          </span>
                          <span className="text-[10px] font-mono px-1 rounded bg-muted/40 text-foreground/90">
                            {f.code}
                          </span>
                          <span className="text-[10px] font-mono text-foreground/70 truncate">
                            {f.label}
                          </span>
                        </div>
                        <div className="text-[11px] text-rose-200/90 mt-0.5 leading-snug">
                          {f.message}
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-0.5 flex-shrink-0"
                        role="radiogroup"
                        aria-label={`Policy for ${f.label}`}
                      >
                        <DecisionButton
                          icon={<Minus className="w-3 h-3" />}
                          label="default"
                          active={current === 'default'}
                          activeClass="bg-muted text-foreground border-border"
                          onClick={() => setDecision(f.key, 'default')}
                        />
                        <DecisionButton
                          icon={<Check className="w-3 h-3" />}
                          label="accept"
                          active={current === 'accept'}
                          activeClass="bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          onClick={() => setDecision(f.key, 'accept')}
                        />
                        <DecisionButton
                          icon={<X className="w-3 h-3" />}
                          label="block"
                          active={current === 'block'}
                          activeClass="bg-rose-500/20 text-rose-300 border-rose-500/40"
                          onClick={() => setDecision(f.key, 'block')}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
                Decisions are local to this run and informational — the artifact you just downloaded is unchanged. Export decisions ships the audit trail (capability, language, mode, chain, per-finding code + message + verdict) for your evidence pack or next-run replay.
              </p>
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

interface DecisionButtonProps {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly active: boolean;
  readonly activeClass: string;
  readonly onClick: () => void;
}

function DecisionButton({ icon, label, active, activeClass, onClick }: DecisionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="radio"
      aria-checked={active}
      title={label}
      className={cn(
        'inline-flex items-center justify-center w-6 h-6 rounded border text-[10px] transition-colors',
        active
          ? activeClass
          : 'bg-background/60 text-muted-foreground border-border/40 hover:text-foreground hover:border-border',
      )}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </button>
  );
}
