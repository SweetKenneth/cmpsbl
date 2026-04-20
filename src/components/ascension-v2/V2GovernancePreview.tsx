/**
 * V2GovernancePreview — shows WHERE Ascension governs and WHAT it provides.
 *
 * Renders two stacked panels:
 *   1. Source code with governance regions highlighted (function-level only)
 *   2. Plain-English governance report with per-finding include/exclude toggle
 *
 * Black-box preserved: NEVER reveals the wrapper code, internals, primitive
 * routing, or Lex rules. Only names risk surfaces and the protections added.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useMemo, useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { detectFunctionBoundaries } from '@/lib/mana';

// ────────────────────────────────────────────────────────────────
// Plain-English signal mapper.
// Independent from the internal Mana CAPABILITY_SIGNALS map so we
// never leak primitive names or capability identifiers to the UI.
// Each entry maps function-name patterns → marketing-warm description
// of WHAT protection Ascension provides for that surface.
// ────────────────────────────────────────────────────────────────

interface SurfaceSignal {
  readonly patterns: ReadonlyArray<RegExp>;
  /** Risk-surface label shown to non-technical users. */
  readonly surface: string;
  /** Marketing-warm description of the protection. */
  readonly protection: string;
}

const SURFACE_SIGNALS: ReadonlyArray<SurfaceSignal> = [
  {
    patterns: [/^(charge|payment|pay|invoice|refund|subscribe|checkout|purchase)/i],
    surface: 'Payment surface',
    protection:
      'Ascension keeps watch for unusual activity, replay attempts, and runaway charges — quietly stepping in when something looks off.',
  },
  {
    patterns: [/^(login|signup|signin|auth|register|verify|2fa|otp|password|reset|session)/i],
    surface: 'Authentication surface',
    protection:
      'Ascension oversees account access — slowing down repeated attempts, flagging anomalies, and protecting against credential stuffing.',
  },
  {
    patterns: [/^(parse|validate|sanitize|decode|deserialize|handle.*input|process.*request|accept|receive|read.*body)/i],
    surface: 'Untrusted input',
    protection:
      'Ascension wraps a friendly boundary around inputs — checking shape, size, and intent before they reach your business logic.',
  },
  {
    patterns: [/^(upload|file|attach|import|stream)/i],
    surface: 'File / upload boundary',
    protection:
      'Ascension oversees file handling — watching for size spikes, suspicious types, and abuse patterns.',
  },
  {
    patterns: [/^(query|fetch|find|get|search|select|read|load|list).*(user|data|record|order|account)/i, /^db|^sql|^prisma|^supabase/i],
    surface: 'Data access',
    protection:
      'Ascension watches data reads for unusual volume and pacing — providing a quiet record of who accessed what, and when.',
  },
  {
    patterns: [/^(send|email|notify|sms|push|webhook|publish|broadcast|dispatch)/i],
    surface: 'Outbound delivery',
    protection:
      'Ascension oversees outgoing messages — preventing accidental floods, retrying gracefully, and recording delivery for you.',
  },
  {
    patterns: [/^(call|invoke|request|http|api|rpc|fetch.*api|axios|client)/i],
    surface: 'External API call',
    protection:
      'Ascension wraps a circuit breaker around outside services — pacing retries, observing latency, and protecting your app from upstream failures.',
  },
  {
    patterns: [/^(delete|remove|drop|destroy|purge|wipe|truncate)/i],
    surface: 'Destructive operation',
    protection:
      'Ascension oversees deletes with extra care — recording who, what, and why, so a mistake never goes unnoticed.',
  },
  {
    patterns: [/^(admin|root|super|sudo|grant|elevate|impersonate|escalate)/i],
    surface: 'Privileged operation',
    protection:
      'Ascension keeps a careful watch on elevated actions — every invocation is observed and explainable.',
  },
];

function classifyFunction(name: string): SurfaceSignal | null {
  for (const signal of SURFACE_SIGNALS) {
    if (signal.patterns.some((p) => p.test(name))) return signal;
  }
  return null;
}

interface FindingRow {
  readonly functionName: string;
  readonly line: number;
  readonly surface: string;
  readonly protection: string;
}

// ────────────────────────────────────────────────────────────────
// Code highlighter — marks lines that fall inside a governed function.
// We highlight only the declaration line and the next ~6 lines as a
// visual region. We never render injected wrapper code.
// ────────────────────────────────────────────────────────────────

interface HighlightLine {
  readonly text: string;
  readonly governed: boolean;
  readonly excluded: boolean;
  readonly functionName?: string;
}

function buildHighlighting(
  source: string,
  governedFunctions: Map<string, { excluded: boolean }>,
  REGION_SIZE = 6,
): HighlightLine[] {
  const boundaries = detectFunctionBoundaries(source);
  const lines = source.split('\n');

  // Map each line index → governing function name (if any)
  const lineToFn = new Map<number, string>();
  for (const b of boundaries) {
    if (!governedFunctions.has(b.name)) continue;
    const startIdx = Math.max(0, b.line - 1);
    const endIdx = Math.min(lines.length, startIdx + REGION_SIZE);
    for (let i = startIdx; i < endIdx; i++) {
      if (!lineToFn.has(i)) lineToFn.set(i, b.name);
    }
  }

  return lines.map((text, i) => {
    const fn = lineToFn.get(i);
    const meta = fn ? governedFunctions.get(fn) : undefined;
    return {
      text,
      governed: !!fn && !(meta?.excluded ?? false),
      excluded: !!fn && (meta?.excluded ?? false),
      functionName: fn,
    };
  });
}

// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────

interface Props {
  source: string | null;
  excludedFunctions: ReadonlyArray<string>;
  onToggleExclude: (functionName: string) => void;
}

export function V2GovernancePreview({ source, excludedFunctions, onToggleExclude }: Props) {
  const [codeOpen, setCodeOpen] = useState(true);
  const [reportOpen, setReportOpen] = useState(true);

  const findings = useMemo<FindingRow[]>(() => {
    if (!source) return [];
    const boundaries = detectFunctionBoundaries(source);
    const rows: FindingRow[] = [];
    for (const b of boundaries) {
      const signal = classifyFunction(b.name);
      if (!signal) continue;
      rows.push({
        functionName: b.name,
        line: b.line,
        surface: signal.surface,
        protection: signal.protection,
      });
    }
    return rows;
  }, [source]);

  const excludedSet = useMemo(() => new Set(excludedFunctions), [excludedFunctions]);

  const governedFunctions = useMemo(() => {
    const m = new Map<string, { excluded: boolean }>();
    for (const f of findings) {
      m.set(f.functionName, { excluded: excludedSet.has(f.functionName) });
    }
    return m;
  }, [findings, excludedSet]);

  const highlighted = useMemo(
    () => (source ? buildHighlighting(source, governedFunctions) : []),
    [source, governedFunctions],
  );

  const activeCount = findings.filter((f) => !excludedSet.has(f.functionName)).length;

  if (!source) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Upload code in the previous step to see exactly where Ascension will govern.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ── Panel 1: Code with governance highlights ─────────────── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <button
          type="button"
          onClick={() => setCodeOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-accent/40 transition-colors"
          aria-expanded={codeOpen}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Your code, with governance highlights</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {activeCount} governed
            </span>
          </div>
          {codeOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {codeOpen && (
          <div className="border-t border-border bg-muted/20 max-h-[280px] overflow-auto">
            <pre className="text-[11px] leading-relaxed font-mono">
              {highlighted.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex hover:bg-accent/20',
                    line.governed && 'bg-primary/5 border-l-2 border-primary/60',
                    line.excluded && 'bg-muted/40 border-l-2 border-muted-foreground/40 opacity-60',
                  )}
                >
                  <span className="select-none text-muted-foreground/60 px-2 py-0.5 text-right w-10 flex-shrink-0">
                    {i + 1}
                  </span>
                  <code className="px-2 py-0.5 whitespace-pre text-foreground">
                    {line.text || ' '}
                  </code>
                </div>
              ))}
            </pre>
          </div>
        )}

        <div className="px-4 py-2 border-t border-border bg-card flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-primary/60" />
            Governed by Ascension
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-muted-foreground/40" />
            Excluded by you
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-transparent border border-border" />
            No governance needed
          </span>
        </div>
      </div>

      {/* ── Panel 2: Plain-English report ─────────────────────────── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <button
          type="button"
          onClick={() => setReportOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-accent/40 transition-colors"
          aria-expanded={reportOpen}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Ascension Governance Report</span>
          </div>
          {reportOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {reportOpen && (
          <div className="border-t border-border p-4 space-y-3">
            {findings.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No risk surfaces detected in this snippet — your code is simple enough that Ascension keeps a quiet, observational watch.
              </p>
            ) : (
              <>
                <p className="text-[11px] text-muted-foreground">
                  Ascension reviewed your code and identified <span className="text-foreground font-medium">{activeCount}</span> {activeCount === 1 ? 'surface' : 'surfaces'} where governance adds value. You can opt any out below.
                </p>
                <ul className="space-y-2">
                  {findings.map((f) => {
                    const isExcluded = excludedSet.has(f.functionName);
                    return (
                      <li
                        key={f.functionName}
                        className={cn(
                          'rounded-md border p-3 transition-colors',
                          isExcluded ? 'bg-muted/30 border-muted opacity-70' : 'bg-background border-border',
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <code className="text-[11px] font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
                                {f.functionName}()
                              </code>
                              <span className="text-[10px] text-muted-foreground">line {f.line}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                {f.surface}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                              {f.protection}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleExclude(f.functionName)}
                            className="flex-shrink-0 h-7 px-2 text-[10px]"
                            aria-label={isExcluded ? `Include ${f.functionName} in governance` : `Exclude ${f.functionName} from governance`}
                          >
                            {isExcluded ? (
                              <>
                                <Eye className="w-3 h-3 mr-1" />
                                Include
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 mr-1" />
                                Exclude
                              </>
                            )}
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            <p className="text-[10px] italic text-muted-foreground/80 pt-2 border-t border-border/50">
              Governance scope is determined by Ascension's analysis. You retain full ownership of your source code.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
