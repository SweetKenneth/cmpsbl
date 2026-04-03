/**
 * CaseStudies — Real-world Ascension case studies showcasing CMPSBL® refurbishment results.
 * Each study includes original source provenance, improvements analysis, and downloadable artifacts.
 */

import { Helmet } from 'react-helmet-async';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { PageSEOBlock } from '@/components/seo/PageSEOBlock';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ExternalLink, Clock, Shield, Zap, GitBranch, Bug, Eye, FileCode, Award, ChevronDown, ChevronUp, Layers, FlaskConical, Atom } from 'lucide-react';
import { useState } from 'react';

/* ───────── Case Study #1 Data — A* Path Planner ───────── */

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

/* ───────── Case Study #2 Data — OpenClawAgent Cross-Vertical ───────── */

interface VerticalRun {
  vertical: string;
  verticalLabel: string;
  color: string;
  serial: string;
  fingerprint: string;
  cjpi: number;
  tier: string;
  timestamp: string;
  expansionPrimitives: { name: string; type: string; purpose: string }[];
  focusArea: string;
}

const OPENCLAW_RUNS: VerticalRun[] = [
  {
    vertical: 'main',
    verticalLabel: 'CMPSBL® Core',
    color: 'bg-primary/15 text-primary border-primary/20',
    serial: 'CMPSBL-MNHWO6NU-70AA',
    fingerprint: 'e1d40a3c',
    cjpi: 100,
    tier: 'Apex',
    timestamp: 'Apr 2, 2026 · 20:06 UTC',
    expansionPrimitives: [
      { name: 'ENGINEER', type: 'Engine', purpose: 'Structural analysis and code architecture assessment' },
      { name: 'CORTEX', type: 'Engine', purpose: 'Cognitive pattern recognition and decision optimization' },
      { name: 'MONOLITH', type: 'Agent', purpose: 'Monolithic-to-modular decomposition advisory' },
      { name: 'WRAITH', type: 'Agent', purpose: 'IP obfuscation and stealth hardening' },
      { name: 'OBSIDIAN', type: 'Agent', purpose: 'Deep structural integrity scanning' },
      { name: 'PRIMITIVE', type: 'Agent', purpose: 'Base-level guard injection and primitive activation' },
      { name: 'FAILSAFE', type: 'Engine', purpose: 'Circuit breaker injection for fault tolerance' },
      { name: 'ARCHITECT', type: 'Engine', purpose: 'High-level architecture pattern enforcement' },
    ],
    focusArea: 'General-purpose hardening: circuit breakers, structured logging, IP obfuscation, and modular decomposition advisory.',
  },
  {
    vertical: 'cyber',
    verticalLabel: 'CMPSBL CYBER™',
    color: 'bg-red-500/15 text-red-500 border-red-500/20',
    serial: 'CMPSBL-MNIHJAX3-4GSN',
    fingerprint: '32d6e316',
    cjpi: 100,
    tier: 'Apex',
    timestamp: 'Apr 3, 2026 · 05:50 UTC',
    expansionPrimitives: [
      { name: 'CIPHER', type: 'Engine', purpose: 'Cryptographic hardening and key management enforcement' },
      { name: 'VANGUARD', type: 'Engine', purpose: 'Proactive threat modeling and attack surface reduction' },
      { name: 'AEGIS', type: 'Agent', purpose: 'Shield layer for zero-trust perimeter enforcement' },
      { name: 'RECON', type: 'Agent', purpose: 'Reconnaissance detection and counter-intelligence patterns' },
      { name: 'IRONCLAD', type: 'Agent', purpose: 'Input validation and injection prevention' },
      { name: 'TEMPEST', type: 'Engine', purpose: 'Side-channel attack mitigation and emissions security' },
      { name: 'TRACER', type: 'Agent', purpose: 'Forensic logging with chain-of-custody evidence trails' },
      { name: 'BLACKOUT', type: 'Agent', purpose: 'Emergency kill-switch and data purge protocols' },
    ],
    focusArea: 'Offensive/defensive security: cryptographic hardening, zero-trust perimeters, forensic audit trails, and side-channel mitigation.',
  },
  {
    vertical: 'robotics',
    verticalLabel: 'CMPSBL ROBOTICS™',
    color: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
    serial: 'CMPSBL-MNIHLRJY-QJXQ',
    fingerprint: 'e3d1a767',
    cjpi: 100,
    tier: 'Apex',
    timestamp: 'Apr 3, 2026 · 05:52 UTC',
    expansionPrimitives: [
      { name: 'FABRICATOR', type: 'Engine', purpose: 'Manufacturing process optimization and assembly sequencing' },
      { name: 'INSPECTOR', type: 'Agent', purpose: 'Quality assurance and defect detection patterns' },
      { name: 'VECTOR', type: 'Engine', purpose: 'Navigation, pathfinding, and spatial reasoning' },
      { name: 'FLUX', type: 'Engine', purpose: 'Real-time data flow management and stream processing' },
      { name: 'KINETIC', type: 'Engine', purpose: 'Motion planning and trajectory optimization' },
      { name: 'CALIBER', type: 'Engine', purpose: 'Precision calibration and tolerance enforcement' },
      { name: 'GUARDIAN', type: 'Agent', purpose: 'Safety monitoring with emergency stop protocols' },
      { name: 'SWARM', type: 'Agent', purpose: 'Multi-robot coordination and fleet management' },
    ],
    focusArea: 'Physical-world intelligence: motion planning, sensor fusion, safety monitoring, multi-robot coordination, and precision calibration.',
  },
  {
    vertical: 'quantum',
    verticalLabel: 'CMPSBL QUANTUM™',
    color: 'bg-violet-500/15 text-violet-500 border-violet-500/20',
    serial: 'CMPSBL-MNIJ0Y6N-9ZQG',
    fingerprint: 'fd0f1eeb',
    cjpi: 100,
    tier: 'Apex',
    timestamp: 'Apr 3, 2026 · 06:32 UTC',
    expansionPrimitives: [
      { name: 'FERMION', type: 'Engine', purpose: 'Fermion-class state isolation and anti-symmetry enforcement' },
      { name: 'LATTICE', type: 'Engine', purpose: 'Lattice structure validation and crystal symmetry analysis' },
      { name: 'MESON', type: 'Agent', purpose: 'Quark-level decomposition and binding energy optimization' },
      { name: 'GLUON', type: 'Engine', purpose: 'Strong-force binding patterns for tightly coupled modules' },
      { name: 'MUON', type: 'Engine', purpose: 'Penetration testing at quantum depth with muon-class probes' },
      { name: 'HADRON', type: 'Agent', purpose: 'Composite particle simulation and collision modeling' },
      { name: 'CRYOGEN', type: 'Engine', purpose: 'Cryogenic-state optimization for low-noise computation' },
      { name: 'PHOTON', type: 'Agent', purpose: 'Light-speed data path optimization and zero-latency routing' },
    ],
    focusArea: 'Quantum-computational hardening: state isolation, lattice validation, collision modeling, and zero-latency path optimization.',
  },
];

const SHARED_SPINE_PRIMITIVES = [
  'SIMULATE', 'MEMORY', 'SHADOW', 'RELAY', 'OBSERVER', 'FORGE', 'ECHO', 'EVOLUTION', 'COMPASS', 'LINGUA',
];

/* ───────── Case Study #3 Data — Qiskit ConsolidateBlocks (Quantum) ───────── */

const QISKIT_VULNERABILITIES = [
  { severity: 'warning', title: 'Synchronous-only architecture', status: 'mitigated', detail: 'No async patterns found in substantial codebase. May block the event loop under load.' },
  { severity: 'warning', title: 'High cyclomatic complexity (32)', status: 'mitigated', detail: 'Complexity score of 32 indicates too many branching paths. Hard to test and maintain.' },
  { severity: 'info', title: 'No fallback mechanisms detected', status: 'monitor', detail: 'ORACLE identifies single-path execution. Failure in any step halts the entire pipeline.' },
  { severity: 'info', title: 'Low function density', status: 'monitor', detail: 'ORACLE detects 3 functions across 192 lines (~64 lines/fn). Monolithic functions resist change.' },
  { severity: 'warning', title: 'High dependency coupling (19 imports)', status: 'mitigated', detail: '19 imports detected — high coupling increases blast radius of dependency failures.' },
  { severity: 'info', title: 'No module exports detected', status: 'monitor', detail: 'Code appears self-contained with no exports. Limits reusability and testability.' },
  { severity: 'info', title: 'No dependency failure fallbacks', status: 'monitor', detail: '19 dependencies with no fallback strategy. Any dependency failure cascades to your application.' },
];

const QISKIT_PRIMITIVES = [
  { name: 'BOSON', type: 'Agent', action: 'Force carrier simulation and gauge field mapping for the Standard Model' },
  { name: 'NEUTRINO', type: 'Agent', action: 'Weak interaction modeling and neutrino flavor oscillation prediction' },
  { name: 'HARVEST', type: 'Organ', action: 'Dead code identification and pruning advisory for large codebases' },
  { name: 'PHOTON', type: 'Engine', action: 'Optical computing and photonic signal processing with interferometry modeling' },
  { name: 'FERMION', type: 'Engine', action: 'Many-body quantum state evolution with Schrödinger equation solvers' },
  { name: 'PLASMA', type: 'Engine', action: 'Plasma dynamics and magneto-hydrodynamics for fusion reactor modeling' },
  { name: 'MUON', type: 'Agent', action: 'Decay chain analysis and lepton tracking for particle detector data' },
  { name: 'QUBIT', type: 'Engine', action: 'Quantum gate orchestration and circuit transpilation for quantum algorithms' },
  { name: 'MESON', type: 'Agent', action: 'Quark confinement and hadronization processes for jet formation modeling' },
  { name: 'SHADOW', type: 'Layer', action: 'Shadow testing and canary analysis for complex system deployments' },
  { name: 'IMMUNITY', type: 'Layer', action: 'Dependency shielding and isolation barriers for high-coupling codebases' },
  { name: 'RELAY', type: 'Layer', action: 'Message relay with delivery guarantees and dead-letter handling' },
  { name: 'GLUON', type: 'Agent', action: 'Strong force coupling and QCD color charge simulation' },
  { name: 'CRYOGEN', type: 'Engine', action: 'Cryogenic system modeling and thermal noise reduction for quantum hardware' },
  { name: 'ECHO', type: 'Organ', action: 'Structured logging replacing scattered print/debug statements' },
  { name: 'IDENTITY', type: 'Organ', action: 'Authentication and identity resolution for access control' },
  { name: 'CONSCIENCE', type: 'Organ', action: 'Ethical decision boundaries for complex systems' },
  { name: 'COMPASS', type: 'Organ', action: 'Module navigation and dependency mapping' },
  { name: 'SIMULATE', type: 'Layer', action: 'Simulation-based safe testing of architectural changes' },
  { name: 'EVOLUTION', type: 'Layer', action: 'Managed evolution cycles for technical debt reduction' },
];

const QISKIT_CAPABILITIES = [
  { name: 'QCD Color Charge Simulator', mode: 'Active', desc: 'Lattice QCD Monte Carlo simulation for gluon exchange, asymptotic freedom verification, and hadron mass computation from first principles.' },
  { name: 'Quantum Teleportation Protocol', mode: 'Active', desc: 'End-to-end quantum state transfer using EPR pairs, Bell measurements, and classical communication channels with fidelity verification.' },
  { name: 'Silent Regression Scanner', mode: 'Passive', desc: 'Background scanner detecting behavioral regressions by comparing output signatures against historical baselines.' },
  { name: 'Neutrino Oscillation Predictor', mode: 'Passive', desc: 'Computes PMNS matrix parameters, predicts flavor transition probabilities over baseline distances, and models MSW matter effects.' },
  { name: 'Cryogenic Decoherence Shield', mode: 'Hybrid', desc: 'Models T1/T2 relaxation times, thermal photon flux, and Johnson-Nyquist noise to optimize dilution refrigerator staging for qubit coherence.' },
  { name: 'Canary Deployment Gate', mode: 'Hybrid', desc: 'Routes configurable traffic percentages to new code paths with anomaly monitoring and auto-rollback.' },
  { name: 'Fusion Reactor Modeler', mode: 'Active', desc: 'Simulates tokamak plasma confinement, computes Lawson criterion parameters, and optimizes magnetic field configurations.' },
  { name: 'Particle Collision Analyzer', mode: 'Active', desc: 'Reconstructs collision events from detector data, clusters jets, identifies decay products, and computes invariant mass distributions.' },
  { name: 'Chaos Pen Test Engine', mode: 'Active', desc: 'Automated penetration testing via chaos injection, adversarial simulation, and blast radius analysis.' },
  { name: 'Structural Drift Detector', mode: 'Passive', desc: 'Compares current architecture against original blueprint and flags deviations to prevent architectural erosion.' },
];

/* ───────── Shared Components ───────── */

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

/* ───────── Cross-Vertical Comparison Card ───────── */

function VerticalComparisonCard({ run, isExpanded, onToggle }: { run: VerticalRun; isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card/50">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`text-[10px] uppercase font-bold ${run.color}`}>
            {run.verticalLabel}
          </Badge>
          <span className="text-sm font-medium text-foreground">CJPI {run.cjpi} — {run.tier}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline font-mono">{run.serial}</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {isExpanded && (
        <div className="border-t border-border p-4 space-y-4">
          <p className="text-sm text-muted-foreground">{run.focusArea}</p>
          <div>
            <div className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Expansion Primitives (Vertical-Specific)
            </div>
            <div className="grid gap-1.5">
              {run.expansionPrimitives.map((p) => (
                <div key={p.name} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30 border border-border/40">
                  <span className="font-mono text-xs font-bold text-foreground w-24 shrink-0">{p.name}</span>
                  <TypeBadge type={p.type} />
                  <span className="text-xs text-muted-foreground">{p.purpose}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span>Serial: <code className="px-1 py-0.5 rounded bg-muted font-mono">{run.serial}</code></span>
            <span>{run.timestamp}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────── Main Page ───────── */

export default function CaseStudies() {
  const [showAllPrimitives, setShowAllPrimitives] = useState(false);
  const visiblePrimitives = showAllPrimitives ? PRIMITIVES_APPLIED : PRIMITIVES_APPLIED.slice(0, 8);
  const [showAllQiskitPrimitives, setShowAllQiskitPrimitives] = useState(false);
  const visibleQiskitPrimitives = showAllQiskitPrimitives ? QISKIT_PRIMITIVES : QISKIT_PRIMITIVES.slice(0, 8);
  const [expandedVerticals, setExpandedVerticals] = useState<Record<string, boolean>>({ main: true });

  const toggleVertical = (key: string) => {
    setExpandedVerticals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <Helmet>
        <title>Case Studies — CMPSBL® Ascension Results</title>
        <meta name="description" content="Real-world case studies demonstrating CMPSBL® Ascension refurbishment results. See before-and-after code analysis, cross-vertical substrate comparisons, and primitive application on production software." />
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
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
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

        {/* ════════════════════════════════════════════════════════════ */}
        {/*  CASE STUDY #2 — OpenClawAgent Cross-Vertical Comparison  */}
        {/* ════════════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
          <div className="border border-border rounded-2xl overflow-hidden bg-card">
            {/* Study Header */}
            <div className="bg-gradient-to-br from-muted/60 to-muted/30 border-b border-border p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-violet-500/15 text-violet-500 border-violet-500/20" variant="outline">Cross-Vertical</Badge>
                <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20" variant="outline">4× CJPI 100 — Apex</Badge>
                <Badge variant="outline" className="text-muted-foreground">PHP · OpenAI Agents SDK Pattern</Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                OpenClawAgent — Same Code, Four Substrates
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-3xl">
                A functional PHP agent mirroring the{' '}
                <a href="https://github.com/openai/openai-agents-python" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">OpenAI Agents SDK</a>{' '}
                architecture — featuring tool calling, memory management, planning loops, execution chains, and agent handoff — was uploaded to all four CMPSBL® substrates to demonstrate how the same source code receives fundamentally different hardening based on the active vertical.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border">
              {[
                { icon: Layers, label: 'Substrates Tested', value: '4' },
                { icon: Shield, label: 'Total Primitives', value: '72' },
                { icon: FlaskConical, label: 'Unique Expansion', value: '32' },
                { icon: Award, label: 'All CJPI Scores', value: '100' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-4 sm:p-5 text-center border-r border-border last:border-r-0">
                  <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{value}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>

            <div className="p-6 sm:p-8 space-y-10">

              {/* ─── About the Upload ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-primary" /> About the Upload
                </h3>
                <div className="prose-sm text-muted-foreground space-y-3 leading-relaxed">
                  <p>
                    <strong className="text-foreground">Subject:</strong> <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">OpenClawAgent</code> — a single-file PHP agent implementing the core architectural patterns from the{' '}
                    <a href="https://openai.com/index/new-tools-for-building-agents/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">OpenAI Agents SDK</a>: memory stores, tool registration and calling, planning loops with reasoning, multi-step execution chains, and inter-agent handoff protocols.
                  </p>
                  <p>
                    <strong className="text-foreground">Language:</strong> PHP — chosen deliberately to test a non-typical language for AI agent development. The Ascension pipeline correctly detected and preserved the PHP source language across all four substrate runs via the Bridge Adapter system.
                  </p>
                  <p>
                    <strong className="text-foreground">Experiment Design:</strong> The identical PHP file was uploaded to CMPSBL® Core, CMPSBL CYBER™, CMPSBL ROBOTICS™, and CMPSBL QUANTUM™ in sequence. Each substrate shares the same 24-primitive Spine (12 Organs + 12 Layers) but swaps in 16 vertical-specific expansion primitives (8 Engines + 8 Agents). This produces four distinct hardening profiles from the same input — demonstrating that Ascension is not a generic linter but a domain-aware specialization engine.
                  </p>
                </div>
              </div>

              {/* ─── Shared Spine ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> Shared Spine (Common Across All Verticals)
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  These 10 primitives from the fixed 24-primitive Spine were selected consistently across all four runs, providing the universal hardening baseline:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SHARED_SPINE_PRIMITIVES.map((name) => (
                    <Badge key={name} variant="outline" className="font-mono text-xs bg-muted/40">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* ─── Vertical Comparison ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" /> Vertical Expansion Comparison
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Each substrate swapped in its own 8 expansion primitives. Expand each vertical below to see the domain-specific Engines and Agents applied:
                </p>
                <div className="space-y-2">
                  {OPENCLAW_RUNS.map((run) => (
                    <VerticalComparisonCard
                      key={run.vertical}
                      run={run}
                      isExpanded={!!expandedVerticals[run.vertical]}
                      onToggle={() => toggleVertical(run.vertical)}
                    />
                  ))}
                </div>
              </div>

              {/* ─── Key Insight ─── */}
              <div className="bg-primary/[0.04] border border-primary/15 rounded-xl p-5">
                <h3 className="text-base font-semibold text-foreground mb-2">Key Insight</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  The same PHP agent file received <strong className="text-foreground">four completely different hardening profiles</strong> from the same Ascension pipeline — all scoring CJPI 100 (Apex). The difference is not cosmetic: CYBER applied cryptographic hardening and forensic audit trails; ROBOTICS injected motion planning and safety monitoring; QUANTUM added state isolation and collision modeling. The 24-primitive Spine remained constant while the 16 expansion slots specialized to each domain.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This demonstrates that CMPSBL® Ascension is a <strong className="text-foreground">domain-aware specialization engine</strong>, not a generic code formatter. The vertical substrate determines which expansion primitives collide with the uploaded artifact, producing fundamentally different cognitive infrastructure for the same source code — all in under 10 seconds, with zero AI.
                </p>
              </div>

              {/* ─── Session Evidence ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" /> Session Evidence
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  All four sessions are recorded in the restoration ledger with verifiable serial numbers and timestamps:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 text-muted-foreground font-medium">Vertical</th>
                        <th className="text-left p-2 text-muted-foreground font-medium">Serial</th>
                        <th className="text-left p-2 text-muted-foreground font-medium">CJPI</th>
                        <th className="text-left p-2 text-muted-foreground font-medium hidden sm:table-cell">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {OPENCLAW_RUNS.map((run) => (
                        <tr key={run.serial} className="border-b border-border/50">
                          <td className="p-2">
                            <Badge variant="outline" className={`text-[9px] ${run.color}`}>{run.verticalLabel}</Badge>
                          </td>
                          <td className="p-2 font-mono text-foreground">{run.serial}</td>
                          <td className="p-2 font-bold text-foreground">{run.cjpi}</td>
                          <td className="p-2 text-muted-foreground hidden sm:table-cell">{run.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ─── References ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-primary" /> References
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {[
                    { label: 'OpenAI Agents SDK (Python)', url: 'https://github.com/openai/openai-agents-python' },
                    { label: 'OpenAI Agents SDK Announcement', url: 'https://openai.com/index/new-tools-for-building-agents/' },
                    { label: 'CMPSBL® Ascension Lab', url: '/ascension' },
                    { label: 'CMPSBL® Primitive Reference', url: '/docs' },
                  ].map((ref) => (
                    <li key={ref.url}>
                      <a
                        href={ref.url}
                        target={ref.url.startsWith('http') ? '_blank' : undefined}
                        rel={ref.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors"
                      >
                        {ref.label} {ref.url.startsWith('http') ? '↗' : '→'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════ */}
        {/*  CASE STUDY #3 — Qiskit ConsolidateBlocks (Quantum)       */}
        {/* ════════════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
          <div className="border border-border rounded-2xl overflow-hidden bg-card">
            {/* Study Header */}
            <div className="bg-gradient-to-br from-violet-500/10 to-muted/30 border-b border-border p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-violet-500/15 text-violet-500 border-violet-500/20" variant="outline">Quantum</Badge>
                <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20" variant="outline">CJPI 100 — Apex</Badge>
                <Badge variant="outline" className="text-muted-foreground">CMPSBL-MNJ4Y3JG-CQOW</Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Qiskit ConsolidateBlocks — IBM's Quantum Circuit Optimizer
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-3xl">
                The{' '}
                <a href="https://github.com/Qiskit/qiskit" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">ConsolidateBlocks</a>{' '}
                transpiler pass from IBM's Qiskit SDK — the world's most-downloaded quantum computing framework (13M+ downloads, 7K+ GitHub stars). This critical optimization pass consolidates consecutive quantum gates into single unitary operations using{' '}
                <a href="https://en.wikipedia.org/wiki/KAK_decomposition" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">KAK decomposition</a>{' '}
                — refurbished through CMPSBL QUANTUM™ in under 10 seconds, with zero AI.
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
                    <a href="https://github.com/Qiskit/qiskit" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Qiskit/qiskit</a>{' '}
                    — IBM's open-source SDK for quantum computing. Qiskit is the world's most popular quantum software stack, with over{' '}
                    <strong className="text-foreground">13 million downloads</strong> and{' '}
                    <strong className="text-foreground">69% developer preference</strong> according to IBM. It powers research and production workloads on IBM Quantum hardware, including 1,121+ qubit processors.
                  </p>
                  <p>
                    <strong className="text-foreground">File:</strong>{' '}
                    <a href="https://github.com/Qiskit/qiskit/blob/main/qiskit/transpiler/passes/optimization/consolidate_blocks.py" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 font-mono text-xs">transpiler/passes/optimization/consolidate_blocks.py</a>{' '}
                    — the <code className="text-xs px-1 py-0.5 rounded bg-muted">ConsolidateBlocks</code> transpiler pass. Copyright IBM 2017–2019, licensed under Apache 2.0.
                  </p>
                  <p>
                    <strong className="text-foreground">Algorithm:</strong> ConsolidateBlocks replaces consecutive sequences of quantum gates acting on the same qubits with a single{' '}
                    <a href="https://en.wikipedia.org/wiki/Unitary_matrix" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Unitary</a>{' '}
                    node, which is then resynthesized into an optimal subcircuit using{' '}
                    <a href="https://quantum.cloud.ibm.com/docs/en/api/qiskit/qiskit.synthesis.TwoQubitBasisDecomposer" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">KAK (Cartan) decomposition</a>{' '}
                    — a mathematical technique from Lie group theory that decomposes any two-qubit unitary into a minimal sequence of single-qubit rotations and entangling gates. This is critical for reducing circuit depth on NISQ-era hardware where every additional gate introduces decoherence.
                  </p>
                  <p>
                    <strong className="text-foreground">Why This File Matters:</strong> On today's noisy quantum processors, circuit depth directly determines whether a computation produces meaningful results or noise. ConsolidateBlocks is activated at{' '}
                    <code className="text-xs px-1 py-0.5 rounded bg-muted">optimization_level=2</code> and above in Qiskit's transpiler pipeline — meaning it runs on virtually every production quantum circuit compiled through Qiskit. It supports 12 basis gate types (CX, CZ, iSwap, ECR, RXX, RYY, RZZ, RZX, CRX, CRY, CRZ, CPhase) and handles recursive control-flow operations.
                  </p>
                  <p>
                    <strong className="text-foreground">Real-World Impact:</strong> This pass is used by{' '}
                    <a href="https://www.ibm.com/quantum" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">IBM Quantum</a>,{' '}
                    research institutions worldwide, and every major quantum computing lab running Qiskit. It has been cited in hundreds of peer-reviewed quantum computing papers and is a core component of the{' '}
                    <a href="https://www.ibm.com/quantum/blog/qiskit-2-0-release-summary" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Qiskit 2.x release series</a>{' '}
                    that IBM describes as "the world's most performant quantum SDK." Open issues (
                    <a href="https://github.com/Qiskit/qiskit/issues/11975" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">#11975</a>,{' '}
                    <a href="https://github.com/Qiskit/qiskit/issues/15631" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">#15631</a>) demonstrate the ongoing complexity of this optimization problem.
                  </p>
                </div>
              </div>

              {/* ─── Vulnerability Assessment ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Bug className="w-4 h-4 text-destructive" /> Pre-Ascension Vulnerability Assessment
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The CMPSBL six-primitive diagnostic squad (ENCODE, ORACLE, ENGINEER, MEDIC, DEFENSE, FAILSAFE) identified 7 structural vulnerabilities in the 192-line transpiler pass:
                </p>
                <div className="space-y-2">
                  {QISKIT_VULNERABILITIES.map((v) => (
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

              {/* ─── Quantum-Specific Hardening ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Atom className="w-4 h-4 text-primary" /> Why Quantum Vertical Matters Here
                </h3>
                <div className="prose-sm text-muted-foreground space-y-3 leading-relaxed">
                  <p>
                    Running ConsolidateBlocks through the <strong className="text-foreground">CMPSBL QUANTUM™</strong> vertical instead of the core substrate is not arbitrary — it is the correct domain match. The Quantum vertical's expansion primitives understand quantum-computational semantics: QUBIT provides gate orchestration and circuit transpilation awareness, FERMION brings Schrödinger equation solvers for many-body state evolution, CRYOGEN models T1/T2 decoherence timescales that directly affect how aggressively gates should be consolidated, and PHOTON adds interferometry modeling relevant to optical quantum hardware.
                  </p>
                  <p>
                    The core substrate would harden this file generically — circuit breakers, logging, IP obfuscation. The Quantum vertical instead enriches it with <strong className="text-foreground">domain-aware capabilities</strong> like the Neutrino Oscillation Predictor (PMNS matrix computation), Cryogenic Decoherence Shield (dilution refrigerator optimization), and Fusion Reactor Modeler (tokamak plasma confinement). These capabilities compose with the existing KAK decomposition logic to create a transpiler pass that is not just hardened but quantum-physically informed.
                  </p>
                </div>
              </div>

              {/* ─── Primitives Applied ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> 20 Primitives Applied
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The CMPSBL QUANTUM™ vertical selected 20 primitives — 5 Organs for structural integrity, 5 Layers for operational resilience, 5 Engines for domain-specific computation, and 5 Agents for quantum-physical simulation:
                </p>
                <div className="grid gap-2">
                  {visibleQiskitPrimitives.map((p) => (
                    <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/40">
                      <span className="font-mono text-xs font-bold text-foreground w-24 shrink-0">{p.name}</span>
                      <TypeBadge type={p.type} />
                      <span className="text-xs text-muted-foreground">{p.action}</span>
                    </div>
                  ))}
                </div>
                {QISKIT_PRIMITIVES.length > 8 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 w-full text-xs text-muted-foreground"
                    onClick={() => setShowAllQiskitPrimitives(!showAllQiskitPrimitives)}
                  >
                    {showAllQiskitPrimitives ? <><ChevronUp className="w-3 h-3 mr-1" /> Show fewer</> : <><ChevronDown className="w-3 h-3 mr-1" /> Show all 20 primitives</>}
                  </Button>
                )}
              </div>

              {/* ─── New Capabilities Unlocked ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> 10 New Capabilities Unlocked
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {QISKIT_CAPABILITIES.map((c) => (
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
              <div className="bg-violet-500/[0.04] border border-violet-500/15 rounded-xl p-5">
                <h3 className="text-base font-semibold text-foreground mb-2">Key Insight</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  IBM's ConsolidateBlocks is arguably the single most-executed quantum circuit optimization in the world — it runs on every Qiskit circuit compiled at <code className="text-xs px-1 py-0.5 rounded bg-muted">optimization_level≥2</code>. Despite being authored by IBM Research and maintained by a world-class quantum engineering team, the CMPSBL six-primitive diagnostic squad still identified <strong className="text-foreground">3 actionable vulnerabilities</strong> (synchronous-only architecture, cyclomatic complexity of 32, and 19-dependency coupling with no fallback strategy) and <strong className="text-foreground">4 structural monitors</strong>.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The CMPSBL QUANTUM™ vertical then wrapped this file in 20 primitives that don't just harden it generically — they understand quantum physics. CRYOGEN models the thermal noise environment where consolidated gates will execute. FERMION tracks many-body state evolution that consolidation affects. BOSON and GLUON add Standard Model simulation capabilities. The result is a transpiler pass that is no longer just an optimizer — it is a <strong className="text-foreground">quantum-physically aware Sealed Runtime</strong>, processed in approximately 10 seconds with zero AI.
                </p>
              </div>

              {/* ─── Downloads ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" /> Download & Verify
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Both the original IBM source and the full CMPSBL QUANTUM™ Ascension export are available for download.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="/downloads/case-studies/consolidate_blocks_original.py" download>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileCode className="w-3.5 h-3.5" />
                      Original Source (.py)
                    </Button>
                  </a>
                  <a href="/downloads/case-studies/qiskit-consolidate-ascended-CMPSBL-MNJ4Y3JG-CQOW.zip" download>
                    <Button size="sm" className="gap-2">
                      <Download className="w-3.5 h-3.5" />
                      Ascended Export (.zip)
                    </Button>
                  </a>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  Serial: <code className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">CMPSBL-MNJ4Y3JG-CQOW</code>{' · '}
                  Fingerprint: <code className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">09d1c4bea3108524</code>{' · '}
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
                    { label: 'Qiskit GitHub Repository (7K+ ★)', url: 'https://github.com/Qiskit/qiskit' },
                    { label: 'ConsolidateBlocks — IBM Quantum Docs', url: 'https://quantum.cloud.ibm.com/docs/en/api/qiskit/qiskit.transpiler.passes.ConsolidateBlocks' },
                    { label: 'TwoQubitBasisDecomposer (KAK) — IBM Docs', url: 'https://quantum.cloud.ibm.com/docs/en/api/qiskit/qiskit.synthesis.TwoQubitBasisDecomposer' },
                    { label: 'Qiskit 2.0 Release Summary — IBM Blog', url: 'https://www.ibm.com/quantum/blog/qiskit-2-0-release-summary' },
                    { label: 'Issue #11975: Resynthesis Edge Cases', url: 'https://github.com/Qiskit/qiskit/issues/11975' },
                    { label: 'Issue #15631: Improve Block Merging', url: 'https://github.com/Qiskit/qiskit/issues/15631' },
                    { label: 'KAK Decomposition — Wikipedia', url: 'https://en.wikipedia.org/wiki/KAK_decomposition' },
                    { label: 'IBM Quantum Platform', url: 'https://www.ibm.com/quantum' },
                    { label: 'Qiskit PyPI Stats (13M+ Downloads)', url: 'https://pypistats.org/packages/qiskit' },
                    { label: 'CMPSBL® Ascension Lab', url: '/ascension' },
                  ].map((ref) => (
                    <li key={ref.url}>
                      <a
                        href={ref.url}
                        target={ref.url.startsWith('http') ? '_blank' : undefined}
                        rel={ref.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors"
                      >
                        {ref.label} {ref.url.startsWith('http') ? '↗' : '→'}
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
          { question: 'What are vertical substrates?', answer: 'Vertical substrates are domain-specific configurations of the CMPSBL® 40-Primitive topology. Each vertical shares the same 24-primitive Spine but swaps in 16 specialized expansion primitives for its domain — Cyber, Robotics, or Quantum.' },
        ]}
      />
      <EnhancedFooter />
    </>
  );
}
