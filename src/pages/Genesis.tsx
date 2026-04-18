/**
 * GENESIS — Offline Cognitive Substrates for Researchers
 *
 * Public landing for the installable-substrate program, plus the BRAIN Console:
 * a chat surface that speaks directly to BRAIN through DECODE, with no LLM,
 * no NEXUS routing, no network calls. Researchers can verify "no AI inside"
 * by opening devtools — there are no outbound requests.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Brain, Cpu, Lock, Download, FileText, Zap, ShieldCheck, WifiOff, Send, Sparkles, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { brainReason, BRAIN_REASONER_META, type BrainTrace } from '@/lib/genesis/brainReasoner';
import { processAIRequest } from '@/lib/nexus';

interface ChatTurn {
  id: string;
  role: 'user' | 'brain';
  text: string;
  trace?: BrainTrace;
  source?: 'brain' | 'nexus';
  nexusMeta?: { model: string; latency: number; cached: boolean };
  error?: boolean;
}

const SAMPLE_PROMPTS = [
  'What is BRAIN?',
  'How do you work without an LLM?',
  'Tell me about offline cognitive substrates',
  'What is GENESIS?',
  'How does Memory Stream recall work?',
];

export default function Genesis() {
  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      id: 'init',
      role: 'brain',
      text:
        "I am BRAIN, addressed through DECODE. I have no LLM behind me. Ask me anything — I will respond from my knowledge crystals, or honestly tell you when I don't have one. Open devtools → Network: you will see zero outbound calls when I think.",
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [lastReceipt, setLastReceipt] = useState('00000000');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns]);

  const send = useCallback(
    (raw?: string) => {
      const prompt = (raw ?? input).trim();
      if (!prompt || thinking) return;
      setInput('');
      setThinking(true);

      const userTurn: ChatTurn = {
        id: 'u_' + Date.now(),
        role: 'user',
        text: prompt,
      };
      setTurns(prev => [...prev, userTurn]);

      // Synchronous, deterministic — no await needed. We use a 0ms timeout
      // only so the UI repaints the user message before the response.
      setTimeout(() => {
        const trace = brainReason(prompt, lastReceipt);
        const brainTurn: ChatTurn = {
          id: 'b_' + Date.now(),
          role: 'brain',
          text: trace.response,
          trace,
        };
        setTurns(prev => [...prev, brainTurn]);
        setLastReceipt(trace.receipt.fingerprint);
        setThinking(false);
      }, 16);
    },
    [input, thinking, lastReceipt],
  );

  return (
    <>
      <Helmet>
        <title>GENESIS — Offline Cognitive Substrates for Research | CMPSBL</title>
        <meta
          name="description"
          content="Installable, offline-capable cognitive substrates for researchers. Talk directly to BRAIN — no LLM, no network, deterministic algorithmic cognition with signed receipts."
        />
        <link rel="canonical" href="https://cmpsbl.com/genesis" />
        <meta property="og:title" content="GENESIS — Offline Cognitive Substrates" />
        <meta property="og:description" content="Talk directly to BRAIN. No LLM. No network. Signed receipts." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* ─── Hero ────────────────────────────────────────────────────── */}
        <section className="border-b border-border bg-gradient-to-b from-card/50 to-background">
          <div className="container max-w-6xl mx-auto px-4 py-12 md:py-20">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <Badge variant="outline" className="gap-1.5">
                <Sparkles className="h-3 w-3" /> First-mover · Documented
              </Badge>
              <Badge variant="outline" className="gap-1.5 text-primary border-primary/30">
                <WifiOff className="h-3 w-3" /> Runs offline
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <Lock className="h-3 w-3" /> Zero LLM calls
              </Badge>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              GENESIS
              <span className="block text-2xl md:text-3xl font-normal text-muted-foreground mt-2">
                Installable cognitive substrates for researchers
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-3xl mb-4">
              Every other cognitive platform shipping today wraps a foundation model.
              CMPSBL is the only substrate whose cognition is{' '}
              <strong className="text-foreground">pure deterministic algorithm</strong> — so it
              runs offline, air-gapped, and inspectable. GENESIS is the path to install one.
            </p>

            <p className="text-sm text-muted-foreground max-w-3xl mb-8">
              For Zenodo readers, lab teams, and anyone in a restricted environment where
              calling an external model isn't an option. Spin one up, cite it, and own the
              first per-primitive layered substrate ever published.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <a href="#brain-console">
                  <Brain className="mr-2 h-4 w-4" /> Talk to BRAIN
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#install">
                  <Download className="mr-2 h-4 w-4" /> See install path
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* ─── BRAIN Console ───────────────────────────────────────────── */}
        <section id="brain-console" className="border-b border-border">
          <div className="container max-w-6xl mx-auto px-4 py-12 md:py-16">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" /> BRAIN Console
              </h2>
              <p className="text-muted-foreground max-w-3xl">
                You are addressing BRAIN through DECODE — no LLM in the loop, no NEXUS
                routing, no outbound network. Every response shows the parsed intent,
                matched crystal, embedding stats, and a signed receipt. This is what
                cognition looks like without a model.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr,360px]">
              {/* Chat column */}
              <Card className="flex flex-col h-[600px] overflow-hidden border-border">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-mono text-muted-foreground">
                      DECODE → BRAIN · {BRAIN_REASONER_META.modelVersion} ·{' '}
                      {BRAIN_REASONER_META.dimensions}-dim · {BRAIN_REASONER_META.crystalsLoaded} crystals
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    LLM calls: 0
                  </Badge>
                </div>

                <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef as never}>
                  <div className="space-y-4">
                    {turns.map(turn => (
                      <div
                        key={turn.id}
                        className={
                          turn.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                        }
                      >
                        <div
                          className={
                            'max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm ' +
                            (turn.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground border border-border')
                          }
                        >
                          {turn.role === 'brain' && (
                            <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-mono uppercase tracking-wider opacity-70">
                              <Brain className="h-3 w-3" /> BRAIN
                              {turn.trace?.matchedCrystal && (
                                <span className="ml-auto">
                                  match: {(turn.trace.matchedCrystal.similarity * 100).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          )}
                          <div className="whitespace-pre-wrap leading-relaxed">{turn.text}</div>
                          {turn.trace && (
                            <div className="mt-2 pt-2 border-t border-border/50 text-[10px] font-mono opacity-60 space-y-0.5">
                              <div>
                                intent: {turn.trace.decode.intent} · {turn.trace.decode.confidence}
                              </div>
                              <div>
                                receipt: {turn.trace.receipt.fingerprint} · {turn.trace.embedding.encodeMs.toFixed(2)}ms
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {thinking && (
                      <div className="flex justify-start">
                        <div className="bg-muted border border-border rounded-lg px-3.5 py-2.5 text-sm text-muted-foreground">
                          <span className="inline-flex gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '120ms' }} />
                            <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '240ms' }} />
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="border-t border-border p-3 bg-card/50">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {SAMPLE_PROMPTS.map(p => (
                      <button
                        key={p}
                        onClick={() => send(p)}
                        disabled={thinking}
                        className="text-[11px] px-2 py-1 rounded-md border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      send();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Ask BRAIN anything…"
                      disabled={thinking}
                      className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <Button type="submit" size="sm" disabled={thinking || !input.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </Card>

              {/* Trace column */}
              <Card className="p-4 border-border bg-card/50 h-[600px] overflow-auto">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Cpu className="h-4 w-4" /> Cognition trace
                </h3>
                <TracePanel trace={turns.filter(t => t.trace).slice(-1)[0]?.trace} />
              </Card>
            </div>
          </div>
        </section>

        {/* ─── Why this matters ────────────────────────────────────────── */}
        <section className="border-b border-border bg-muted/20">
          <div className="container max-w-6xl mx-auto px-4 py-12 md:py-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Why offline matters</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: WifiOff,
                  title: 'Air-gapped environments',
                  body: 'Defense, intelligence, classified networks, ships, embassies — anywhere outbound calls to a foundation model are forbidden. The substrate runs identically without a network.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Inspectable by design',
                  body: 'Every cognitive act produces a signed FNV-1a receipt chain. Researchers can audit exactly which primitives fired, in what order, with what confidence.',
                },
                {
                  icon: Lock,
                  title: 'No vendor dependency',
                  body: 'No OpenAI key, no Anthropic key, no API budget to manage. The 40-primitive matrix is pure algorithmic code. It does not stop working when a provider has an outage.',
                },
              ].map(item => (
                <Card key={item.title} className="p-5 border-border">
                  <item.icon className="h-5 w-5 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Install path ────────────────────────────────────────────── */}
        <section id="install" className="border-b border-border">
          <div className="container max-w-6xl mx-auto px-4 py-12 md:py-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Install path</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              Three honest tiers. Each is a real substrate, not a demo.
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  name: 'Open Genesis',
                  price: 'Free · Cite the work',
                  for: 'Researchers, Zenodo readers, students',
                  features: [
                    '40-primitive matrix',
                    'BRAIN + Memory Stream + DREAM',
                    'Signed receipt chain',
                    'Offline by default',
                    'Apache-2.0',
                  ],
                  cta: 'Request build',
                  highlight: false,
                },
                {
                  name: 'Hardened Substrate',
                  price: '$249 / mo',
                  for: 'Production teams, regulated workloads',
                  features: [
                    'Everything in Open',
                    'DEFENSE + GOVERNANCE + OBSERVABILITY layers',
                    'Per-primitive layer wrapping',
                    'Signed provenance attestation',
                    'Priority install support',
                  ],
                  cta: 'Talk to Kenneth',
                  highlight: true,
                },
                {
                  name: 'Sovereign Substrate',
                  price: 'Custom',
                  for: 'Defense, healthcare, critical infrastructure',
                  features: [
                    'Everything in Hardened',
                    'Air-gapped install',
                    'Customer-controlled keys',
                    'On-prem audit chain',
                    'Custom layers per buyer',
                  ],
                  cta: 'Contact',
                  highlight: false,
                },
              ].map(tier => (
                <Card
                  key={tier.name}
                  className={
                    'p-5 border-border ' + (tier.highlight ? 'border-primary/50 bg-card' : '')
                  }
                >
                  <h3 className="font-semibold text-lg">{tier.name}</h3>
                  <div className="text-sm text-primary font-mono mt-1">{tier.price}</div>
                  <div className="text-xs text-muted-foreground mt-1 mb-4">{tier.for}</div>
                  <Separator className="mb-4" />
                  <ul className="space-y-1.5 mb-5 text-sm">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-primary mt-0.5">·</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant={tier.highlight ? 'default' : 'outline'} className="w-full" asChild>
                    <a href="mailto:kennethsweet214@gmail.com?subject=GENESIS%20Substrate%20Inquiry">
                      {tier.cta}
                    </a>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Footer note ─────────────────────────────────────────────── */}
        <section className="container max-w-6xl mx-auto px-4 py-10 text-center">
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            CMPSBL® · PromptFluid™ · Apache-2.0 · U.S. App. No. 64/029,678 · Documented first
            mover on cognitive substrate creation. The BRAIN Console above performs zero LLM
            calls and zero outbound requests — verifiable in your browser's network tab.
          </p>
        </section>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Trace panel — shows what BRAIN actually did on the last turn
// ─────────────────────────────────────────────────────────────────────────────
function TracePanel({ trace }: { trace?: BrainTrace }) {
  if (!trace) {
    return (
      <p className="text-xs text-muted-foreground italic">
        Send a message to see DECODE's parse, BRAIN's embedding, the matched crystal, and the
        signed receipt for the cognitive act.
      </p>
    );
  }

  return (
    <div className="space-y-4 text-xs">
      <Section title="DECODE">
        <Row label="intent" value={trace.decode.intent} />
        <Row label="category" value={trace.decode.category} />
        <Row label="confidence" value={trace.decode.confidence} />
        <Row label="score" value={trace.decode.confidence_score.toFixed(3)} />
        {trace.decode.suggested_command && (
          <Row label="suggested" value={trace.decode.suggested_command} />
        )}
      </Section>

      <Section title="BRAIN embedding">
        <Row label="model" value={trace.embedding.modelVersion} />
        <Row label="dim" value={String(trace.embedding.dimensions)} />
        <Row label="L2 norm" value={trace.embedding.norm.toFixed(6)} />
        <Row label="encode" value={trace.embedding.encodeMs.toFixed(3) + 'ms'} />
        <div className="font-mono text-[10px] text-muted-foreground break-all bg-muted/50 rounded p-1.5 mt-1">
          [{trace.embedding.firstFive.join(', ')} …]
        </div>
      </Section>

      <Section title="Crystal match">
        {trace.matchedCrystal ? (
          <>
            <Row label="domain" value={trace.matchedCrystal.domain} />
            <Row
              label="similarity"
              value={(trace.matchedCrystal.similarity * 100).toFixed(2) + '%'}
            />
            <Row label="confidence" value={(trace.confidence * 100).toFixed(1) + '%'} />
          </>
        ) : (
          <div className="text-muted-foreground italic">
            Below similarity floor — BRAIN refused to fabricate.
          </div>
        )}
        <div className="mt-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            top candidates
          </div>
          {trace.candidates.map((c, i) => (
            <div key={c.key} className="font-mono text-[10px] text-muted-foreground truncate">
              {i + 1}. {(c.similarity * 100).toFixed(1)}% · {c.domain}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Receipt">
        <Row label="id" value={trace.receipt.id} />
        <Row label="fingerprint" value={trace.receipt.fingerprint} />
        <div className="font-mono text-[10px] text-muted-foreground break-all bg-muted/50 rounded p-1.5 mt-1">
          {trace.receipt.chain}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
        <Zap className="h-3 w-3" /> {title}
      </div>
      <div className="space-y-1 pl-4 border-l border-border">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 font-mono">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground truncate text-right">{value}</span>
    </div>
  );
}
