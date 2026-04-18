/**
 * /lies — Fact vs. Fiction Evidence Ledger
 *
 * Public, print-ready audit of every documented claim
 * about CMPSBL/PromptFluid that has been verified against
 * the codebase and database. Built turn-by-turn as evidence
 * accumulates.
 */
import { Helmet } from 'react-helmet-async';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LIES_LEDGER, LEDGER_STATS, type FindingSeverity } from '@/data/lies-ledger';

const severityVariant: Record<FindingSeverity, string> = {
  FICTION: 'bg-destructive text-destructive-foreground',
  THEATER: 'bg-orange-500 text-white',
  PARTIAL: 'bg-yellow-500 text-black',
  FACT: 'bg-green-600 text-white',
};

export default function Lies() {
  return (
    <>
      <Helmet>
        <title>Fact vs. Fiction Ledger — CMPSBL Audit</title>
        <meta
          name="description"
          content="An open, evidence-based audit of every documented claim about CMPSBL — code and database verified, fiction labeled fiction."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <main className="min-h-screen bg-background text-foreground print:bg-white print:text-black">
        <article className="mx-auto max-w-4xl px-6 py-12 print:px-0 print:py-4">
          <header className="mb-12 print:mb-6">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              Engineering Honesty Ledger
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
              Fact vs. Fiction
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              A turn-by-turn audit of every claim Lov has generated about CMPSBL,
              cross-checked against the actual codebase and database. Maintained
              by Kenneth E. Sweet Jr. so that builders, researchers, and
              investors can separate what is real from what was theater.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Started: April 18, 2026. Oldest source document examined:{' '}
              <em>ascension-engine-whitepaper.md</em> (March 30, 2026).
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard label="Total Findings" value={LEDGER_STATS.totalFindings} />
              <StatCard label="Fiction" value={LEDGER_STATS.fiction} tone="destructive" />
              <StatCard label="Theater" value={LEDGER_STATS.theater} tone="orange" />
              <StatCard label="Partial" value={LEDGER_STATS.partial} tone="yellow" />
            </div>
          </header>

          <Separator className="mb-8" />

          <section className="space-y-6">
            {LIES_LEDGER.map((f) => (
              <Card key={f.id} className="print:break-inside-avoid print:border print:shadow-none">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">{f.id}</p>
                      <CardTitle className="mt-1 text-xl">{f.title}</CardTitle>
                    </div>
                    <Badge className={severityVariant[f.severity]}>{f.severity}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 text-sm leading-relaxed">
                  <Block label="Documented claim" body={f.source.quote} mono />
                  <p className="text-xs text-muted-foreground">
                    Source: <span className="font-mono">{f.source.document}</span>
                  </p>

                  <Block label="What the code/DB actually shows" body={f.evidence.reality} />
                  <p className="text-xs text-muted-foreground">
                    Method: <span className="font-mono">{f.evidence.method}</span>
                  </p>

                  <Block label="Verdict" body={f.verdict} emphasis />
                  <p className="text-xs text-muted-foreground">
                    Recorded: {f.recordedAt}
                  </p>
                </CardContent>
              </Card>
            ))}
          </section>

          <footer className="mt-12 border-t pt-6 text-xs text-muted-foreground">
            <p>
              This ledger is a living document. New findings are appended as
              additional Lov-generated documents are validated. Nothing is
              removed once recorded. Corrections welcome at{' '}
              <a className="underline" href="mailto:founder@cmpsbl.com">
                founder@cmpsbl.com
              </a>
              .
            </p>
            <p className="mt-2">
              © 2026 Kenneth E. Sweet Jr. — published in the public interest.
            </p>
          </footer>
        </article>
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: 'destructive' | 'orange' | 'yellow';
}) {
  const toneClass =
    tone === 'destructive'
      ? 'text-destructive'
      : tone === 'orange'
      ? 'text-orange-500'
      : tone === 'yellow'
      ? 'text-yellow-500'
      : 'text-foreground';
  return (
    <div className="rounded-lg border bg-card p-4 print:border-black">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function Block({
  label,
  body,
  mono,
  emphasis,
}: {
  label: string;
  body: string;
  mono?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 ${mono ? 'font-mono text-xs' : ''} ${
          emphasis ? 'font-medium text-foreground' : ''
        }`}
      >
        {body}
      </p>
    </div>
  );
}
