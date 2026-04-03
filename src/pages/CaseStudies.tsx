/**
 * CaseStudies — Real-world Ascension case studies showcasing CMPSBL® refurbishment results.
 * Each study includes original source provenance, improvements analysis, and downloadable artifacts.
 */

import { Helmet } from 'react-helmet-async';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/layout/EnhancedFooter';
import { PageSEOBlock } from '@/components/seo/PageSEOBlock';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ExternalLink, Clock, Shield, Zap, GitBranch, Bug, Eye, FileCode, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

/* ───────── Case Study Data ───────── */

const ASTAR_VULNERABILITIES = [
  { severity: 'critical', title: 'No error handling detected', status: 'hardened', detail: 'Zero try/except blocks. Any runtime exception crashes the process — now wrapped with FAILSAFE circuit breakers.' },
  { severity: 'warning', title: 'Synchronous-only architecture', status: 'mitigated', detail: 'No async patterns in a compute-heavy path planner. Blocks the event loop under load.' },
  { severity: 'warning', title: 'High cyclomatic complexity (37)', status: 'mitigated', detail: '37 branching paths make the code difficult to test and maintain.' },
  { severity: 'warning', title: 'No test coverage detected', status: 'mitigated', detail: 'ORACLE predicts 73% probability of regression bugs within 6 months without test coverage.' },
  { severity: 'info', title: 'No fallback mechanisms', status: 'monitor', detail: 'Single-path execution — failure in any step halts the entire pipeline.' },
  { severity: 'warning', title: 'Monolithic file (283 lines)', status: 'mitigated', detail: 'Single-file architecture limits reusability and increases cognitive load.' },
  { severity: 'info', title: 'No module exports', status: 'monitor', detail: 'Self-contained with no exports. Limits reusability and testability in larger systems.' },
];

const PRIMITIVES_APPLIED = [
  { name: 'TENSOR', type: 'Engine', action: 'Sensor fusion and multi-modal signal processing for situational awareness' },
  { name: 'GUARDIAN', type: 'Agent', action: 'Safety monitoring and collision avoidance with emergency stop protocols' },
  { name: 'KINETIC', type: 'Engine', action: 'Motion planning and trajectory optimization for multi-axis coordination' },
  { name: 'VECTOR', type: 'Engine', action: 'Navigation, pathfinding, and localization with SLAM integration' },
  { name: 'SWARM', type: 'Agent', action: 'Multi-robot coordination and fleet management with consensus protocols' },
  { name: 'BRAIN', type: 'Organ', action: 'Continuous learning patterns for complex logic optimization' },
  { name: 'IDENTITY', type: 'Organ', action: 'Authentication and identity resolution for access control' },
  { name: 'WELDER', type: 'Agent', action: 'Assembly operations and joining processes with seam tracking' },
  { name: 'CALIBER', type: 'Engine', action: 'Precision calibration and tolerance enforcement for repeatable operations' },
  { name: 'CONSCIENCE', type: 'Organ', action: 'Ethical decision boundaries for complex systems' },
  { name: 'ECHO', type: 'Organ', action: 'Structured logging replacing scattered print statements' },
  { name: 'HARVEST', type: 'Organ', action: 'Dead code identification and pruning advisory' },
  { name: 'SHADOW', type: 'Layer', action: 'Shadow testing and canary deployment for safe rollouts' },
  { name: 'SIMULATE', type: 'Layer', action: 'Simulation-based safe testing of architectural changes' },
  { name: 'CONDUCTOR', type: 'Agent', action: 'Task sequencing and workflow automation for multi-step operations' },
  { name: 'SERVO', type: 'Engine', action: 'Motor control and actuator orchestration with PID tuning' },
  { name: 'ENVIRON', type: 'Agent', action: 'Environmental awareness and scene understanding for safe operation' },
  { name: 'SANDBOX', type: 'Layer', action: 'Sandboxed isolation for untrusted execution paths' },
  { name: 'TREATY', type: 'Layer', action: 'API contract enforcement and schema validation' },
  { name: 'DEFENSE', type: 'Layer', action: 'Defense-in-depth hardening for network-facing code' },
];

const NEW_CAPABILITIES = [
  { name: 'Chaos Pen Test Engine', mode: 'Active', desc: 'Automated penetration testing via chaos injection and adversarial simulation.' },
  { name: 'Real-Time IOC Correlator', mode: 'Active', desc: 'Correlates Indicators of Compromise across telemetry streams, mapped to MITRE ATT&CK.' },
  { name: 'Silent Regression Scanner', mode: 'Passive', desc: 'Background scanner detecting behavioral regressions against historical baselines.' },
  { name: 'Device Fingerprint Layer', mode: 'Passive', desc: 'Unique device fingerprints for fraud detection and session binding.' },
  { name: 'Sandbox Escalation Guard', mode: 'Hybrid', desc: 'Sandboxed isolation with active termination of privilege escalation attempts.' },
  { name: 'Rate Limit Intelligence', mode: 'Hybrid', desc: 'Learns traffic patterns and dynamically adjusts rate limits per client/endpoint.' },
  { name: 'Cognitive Load Profiler', mode: 'Passive', desc: 'Measures code complexity and identifies maintainability threshold breaches.' },
  { name: 'Canary Deployment Gate', mode: 'Hybrid', desc: 'Routes configurable traffic percentages to new code paths with auto-rollback.' },
  { name: 'Behavioral Audit Trail', mode: 'Passive', desc: 'Records state transitions with FNV-1a hash-sealed tamper evidence.' },
  { name: 'Permission Boundary Map', mode: 'Passive', desc: 'Visualizes access control boundaries and identifies over-privileged paths.' },
];

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: 'bg-destructive/15 text-destructive border-destructive/20',
    warning: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    info: 'bg-primary/10 text-primary border-primary/20',
  };
  return <Badge variant="outline" className={`text-[10px] uppercase font-bold ${colors[severity] ?? ''}`}>{severity}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    hardened: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20',
    mitigated: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    monitor: 'bg-muted text-muted-foreground border-border',
  };
  return <Badge variant="outline" className={`text-[10px] uppercase font-bold ${colors[status] ?? ''}`}>{status}</Badge>;
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    Engine: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
    Agent: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20',
    Organ: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Layer: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20',
  };
  return <Badge variant="outline" className={`text-[10px] uppercase font-bold ${colors[type] ?? ''}`}>{type}</Badge>;
}

export default function CaseStudies() {
  const [showAllPrimitives, setShowAllPrimitives] = useState(false);
  const visiblePrimitives = showAllPrimitives ? PRIMITIVES_APPLIED : PRIMITIVES_APPLIED.slice(0, 8);

  return (
    <>
      <Helmet>
        <title>Case Studies — CMPSBL® Ascension Results</title>
        <meta name="description" content="Real-world case studies demonstrating CMPSBL® Ascension refurbishment results. See before-and-after code analysis, vulnerability hardening, and primitive application on production robotics software." />
        <link rel="canonical" href="https://cmpsbl.com/case-studies" />
      </Helmet>

      <PublicNav />

      <main className="min-h-screen bg-background pt-20 pb-16">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 text-xs tracking-wider uppercase">Ascension Case Studies</Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
              Real Code. Real Results.
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Verified refurbishment results from the CMPSBL® Ascension pipeline — with downloadable before-and-after artifacts for independent verification.
            </p>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════ */}
        {/*  CASE STUDY #1 — A* Path Planning (PythonRobotics)        */}
        {/* ════════════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="border border-border rounded-2xl overflow-hidden bg-card">
            {/* Study Header */}
            <div className="bg-gradient-to-br from-muted/60 to-muted/30 border-b border-border p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">Robotics</Badge>
                <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20" variant="outline">CJPI 100 — Apex</Badge>
                <Badge variant="outline" className="text-muted-foreground">CMPSBL-MNJ3IKWL-PBKA</Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                A* Grid Path Planning Algorithm
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-3xl">
                The canonical A* path planner from <a href="https://github.com/AtsushiSakai/PythonRobotics" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">PythonRobotics</a> — the most-starred open-source robotics algorithms repository on GitHub (29,000+ stars). Refurbished through the CMPSBL ROBOTICS™ Ascension pipeline in under 10 seconds, with zero AI calls.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border">
              {[
                { icon: Clock, label: 'Processing Time', value: '~10s' },
                { icon: Shield, label: 'Primitives Applied', value: '20' },
                { icon: Bug, label: 'Vulnerabilities Found', value: '7' },
                { icon: Award, label: 'CJPI Score', value: '100' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-4 sm:p-5 text-center border-r border-border last:border-r-0">
                  <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{value}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>

            <div className="p-6 sm:p-8 space-y-10">

              {/* ─── Origin & Provenance ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-primary" /> Origin & Provenance
                </h3>
                <div className="prose-sm text-muted-foreground space-y-3 leading-relaxed">
                  <p>
                    <strong className="text-foreground">Repository:</strong>{' '}
                    <a href="https://github.com/AtsushiSakai/PythonRobotics" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">AtsushiSakai/PythonRobotics</a>{' '}
                    — a comprehensive collection of robotics algorithms with sample code and mathematical explanations, cited in academic papers and used in production autonomous driving systems worldwide.
                  </p>
                  <p>
                    <strong className="text-foreground">File:</strong>{' '}
                    <a href="https://github.com/AtsushiSakai/PythonRobotics/blob/master/PathPlanning/AStar/a_star.py" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 font-mono text-xs">PathPlanning/AStar/a_star.py</a>{' '}
                    — the A* grid-based path planning implementation. Originally authored by{' '}
                    <a href="https://github.com/AtsushiSakai" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Atsushi Sakai</a>{' '}
                    and <a href="https://github.com/nkanargias" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Nikos Kanargias</a>.
                  </p>
                  <p>
                    <strong className="text-foreground">Algorithm:</strong> A* search is a best-first graph traversal algorithm that finds the shortest path between nodes using a heuristic function. It is foundational in robotics for{' '}
                    <a href="https://en.wikipedia.org/wiki/A*_search_algorithm" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">grid-based motion planning</a>,{' '}
                    autonomous navigation, warehouse logistics, and multi-robot coordination. The algorithm is O(b^d) in time complexity where b is the branching factor and d is the depth of the solution.
                  </p>
                  <p>
                    <strong className="text-foreground">Real-World Applications:</strong> This specific implementation is used as a reference in autonomous vehicle path planning, drone navigation systems, industrial AGV (Automated Guided Vehicle) routing, and robotics education curricula at universities including MIT, Stanford, and ETH Zürich. The PythonRobotics repository has been cited in over 100 peer-reviewed papers (
                    <a href="https://scholar.google.com/scholar?q=PythonRobotics+Sakai" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Google Scholar</a>).
                  </p>
                </div>
              </div>

              {/* ─── Vulnerability Assessment ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Bug className="w-4 h-4 text-destructive" /> Pre-Ascension Vulnerability Assessment
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The CMPSBL six-primitive diagnostic squad (ENCODE, ORACLE, ENGINEER, MEDIC, DEFENSE, FAILSAFE) identified 7 structural vulnerabilities in the original 283-line source file:
                </p>
                <div className="space-y-2">
                  {ASTAR_VULNERABILITIES.map((v) => (
                    <div key={v.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                      <div className="flex gap-2 shrink-0 pt-0.5">
                        <SeverityBadge severity={v.severity} />
                        <StatusBadge status={v.status} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{v.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{v.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── Primitives Applied ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> 20 Primitives Applied
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The CMPSBL ROBOTICS™ vertical substrate selected 20 primitives — 10 from the fixed Spine (Organs/Layers) and 10 from the Robotics expansion matrix (Engines/Agents) — each providing domain-specific hardening:
                </p>
                <div className="grid gap-2">
                  {visiblePrimitives.map((p) => (
                    <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/40">
                      <span className="font-mono text-xs font-bold text-foreground w-24 shrink-0">{p.name}</span>
                      <TypeBadge type={p.type} />
                      <span className="text-xs text-muted-foreground">{p.action}</span>
                    </div>
                  ))}
                </div>
                {PRIMITIVES_APPLIED.length > 8 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 w-full text-xs text-muted-foreground"
                    onClick={() => setShowAllPrimitives(!showAllPrimitives)}
                  >
                    {showAllPrimitives ? <><ChevronUp className="w-3 h-3 mr-1" /> Show fewer</> : <><ChevronDown className="w-3 h-3 mr-1" /> Show all 20 primitives</>}
                  </Button>
                )}
              </div>

              {/* ─── New Capabilities Unlocked ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> 10 New Capabilities Unlocked
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {NEW_CAPABILITIES.map((c) => (
                    <div key={c.name} className="p-3 rounded-lg bg-muted/30 border border-border/40">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{c.name}</span>
                        <Badge variant="outline" className="text-[9px] uppercase">{c.mode}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── Key Insight ─── */}
              <div className="bg-primary/[0.04] border border-primary/15 rounded-xl p-5">
                <h3 className="text-base font-semibold text-foreground mb-2">Key Insight</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This 283-line Python file — used in production autonomous navigation worldwide — was analyzed, classified, registered as artifact #41, collided against all 40 Primitives, scored CJPI 100 (Apex tier), and delivered as a Sealed Runtime in <strong className="text-foreground">approximately 10 seconds</strong>. No AI was used at any stage of the Ascension pipeline. Every transformation is purely algorithmic — circuit breakers, defense layers, ethical gates, and structured logging were applied through deterministic pattern matching and structural analysis.
                </p>
              </div>

              {/* ─── Downloads ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" /> Download & Verify
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Both the original source and the full Ascension export are available for download. Inspect the before-and-after yourself.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="/downloads/case-studies/a_star_original.py" download>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileCode className="w-3.5 h-3.5" />
                      Original Source (.py)
                    </Button>
                  </a>
                  <a href="/downloads/case-studies/a-star-ascended-CMPSBL-MNJ3IKWL-PBKA.zip" download>
                    <Button size="sm" className="gap-2">
                      <Download className="w-3.5 h-3.5" />
                      Ascended Export (.zip)
                    </Button>
                  </a>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  Serial: <code className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">CMPSBL-MNJ3IKWL-PBKA</code>{' · '}
                  Fingerprint: <code className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">481694a088211ebe</code>{' · '}
                  Generated: April 3, 2026
                </p>
              </div>

              {/* ─── External References ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-primary" /> References & Further Reading
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {[
                    { label: 'PythonRobotics Repository', url: 'https://github.com/AtsushiSakai/PythonRobotics' },
                    { label: 'Original a_star.py Source', url: 'https://github.com/AtsushiSakai/PythonRobotics/blob/master/PathPlanning/AStar/a_star.py' },
                    { label: 'A* Search Algorithm — Wikipedia', url: 'https://en.wikipedia.org/wiki/A*_search_algorithm' },
                    { label: 'PythonRobotics Online Documentation', url: 'https://atsushisakai.github.io/PythonRobotics/' },
                    { label: 'Academic Citations — Google Scholar', url: 'https://scholar.google.com/scholar?q=PythonRobotics+Sakai' },
                  ].map((ref) => (
                    <li key={ref.url}>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors"
                      >
                        {ref.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PageSEOBlock
        path="/case-studies"
        title="Case Studies"
        faq={[
          { question: 'What is CMPSBL Ascension?', answer: 'Ascension is the CMPSBL® code refurbishment pipeline that analyzes, classifies, and hardens source code by colliding it against 40 Primitives — all without AI.' },
          { question: 'How long does Ascension take?', answer: 'A typical file processes through the full 20-primitive pipeline in approximately 10 seconds.' },
          { question: 'Does Ascension use AI?', answer: 'No. The Ascension pipeline is purely algorithmic — deterministic pattern matching, structural analysis, and primitive guard injection. Zero external AI calls.' },
        ]}
      />
      <EnhancedFooter />
    </>
  );
}
