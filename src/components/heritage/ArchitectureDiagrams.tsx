/**
 * Heritage Paper — Architectural Diagrams
 * SVG-based diagrams showing PromptFluid → CMPSBL progression
 */

/* ── Shared styles ────────────────────────────────────────── */

const nodeStyle = "fill-[hsl(var(--muted))] stroke-[hsl(var(--border))] stroke-[1.5]";
const nodeTextStyle = "fill-[hsl(var(--foreground))] text-[10px] font-mono font-bold";
const nodeSubStyle = "fill-[hsl(var(--muted-foreground))] text-[8px] font-mono";
const arrowStyle = "stroke-[hsl(var(--primary))] stroke-[2] fill-none";
const arrowHeadStyle = "fill-[hsl(var(--primary))]";
const labelStyle = "fill-[hsl(var(--primary))] text-[9px] font-mono font-semibold";
const sectorStyle = (color: string) => `fill-[hsl(var(--${color}))] fill-opacity-[0.08] stroke-[hsl(var(--${color}))] stroke-opacity-[0.3] stroke-[1.5] rx-[8]`;

const DiagramTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm sm:text-base font-semibold text-foreground mb-3 mt-8">
    {children}
  </h3>
);

const DiagramCaption = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-2 italic font-mono">
    {children}
  </p>
);

/* ═══════════════════════════════════════════════════════════
   DIAGRAM 1: PromptFluid Ecosystem Architecture (Pre-Consolidation)
   ═══════════════════════════════════════════════════════════ */

export function EcosystemDiagram() {
  return (
    <div className="my-6">
      <DiagramTitle>Figure 1 — PromptFluid Ecosystem Architecture (July–November 2025)</DiagramTitle>
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <svg viewBox="0 0 680 420" className="w-full max-w-[680px] mx-auto" role="img" aria-label="PromptFluid Ecosystem Architecture diagram showing 12 products connected through Cascade and Brain">
          {/* Background */}
          <rect x="0" y="0" width="680" height="420" fill="none" />
          
          {/* BRAIN — Center */}
          <rect x="260" y="170" width="160" height="60" rx="8" className="fill-[hsl(var(--primary))] fill-opacity-[0.15] stroke-[hsl(var(--primary))] stroke-[2]" />
          <text x="340" y="195" textAnchor="middle" className="fill-[hsl(var(--primary))] text-[13px] font-mono font-bold">BRAIN</text>
          <text x="340" y="215" textAnchor="middle" className={nodeSubStyle}>Genesis Engine · Jan 2025</text>

          {/* Cascade — Orchestration Ring */}
          <ellipse cx="340" cy="200" rx="230" ry="150" fill="none" className="stroke-[hsl(var(--primary))] stroke-opacity-[0.15] stroke-[1] stroke-dasharray-[4,4]" strokeDasharray="4 4" />
          <text x="340" y="55" textAnchor="middle" className="fill-[hsl(var(--primary))] fill-opacity-[0.4] text-[10px] font-mono">CASCADE ORCHESTRATION LAYER</text>

          {/* Product nodes — arranged in a ring */}
          {[
            { x: 80, y: 60, name: "Clarity", sub: "WCAG · 9 fn", color: "primary" },
            { x: 260, y: 30, name: "WebAdoption", sub: "Directory · 2 fn", color: "primary" },
            { x: 460, y: 60, name: "Verify", sub: "Certify · 4 fn", color: "primary" },
            { x: 560, y: 140, name: "Defense", sub: "Security · 18 fn", color: "destructive" },
            { x: 560, y: 240, name: "Red Team", sub: "Offensive · 99/100", color: "destructive" },
            { x: 460, y: 320, name: "SimNap", sub: "Dreams · 10+ fn", color: "accent" },
            { x: 260, y: 350, name: "Modernizer", sub: "Rebuild · 5 fn", color: "accent" },
            { x: 80, y: 320, name: "Marketing", sub: "Content · 23 fn", color: "accent" },
            { x: 20, y: 240, name: "Ripple", sub: "Events · 4 fn", color: "muted-foreground" },
            { x: 20, y: 140, name: "Nexus", sub: "23 Providers", color: "muted-foreground" },
            { x: 160, y: 90, name: "Studio", sub: "Builder · 6 fn", color: "accent" },
          ].map((node, i) => (
            <g key={i}>
              <rect x={node.x} y={node.y} width="120" height="40" rx="6" className={nodeStyle} />
              <text x={node.x + 60} y={node.y + 17} textAnchor="middle" className={nodeTextStyle}>{node.name}</text>
              <text x={node.x + 60} y={node.y + 30} textAnchor="middle" className={nodeSubStyle}>{node.sub}</text>
              {/* Connection line to BRAIN */}
              <line x1={node.x + 60} y1={node.y + 40} x2={340} y2={170} className="stroke-[hsl(var(--border))] stroke-[0.8] stroke-opacity-[0.4]" strokeDasharray="3 3" />
            </g>
          ))}

          {/* Stats */}
          <text x="340" y="405" textAnchor="middle" className="fill-[hsl(var(--muted-foreground))] text-[10px] font-mono">12+ Products · 252+ Edge Functions · 23 AI Providers</text>
        </svg>
      </div>
      <DiagramCaption>The PromptFluid ecosystem at peak scale (November 2025). All products fed learning data back to BRAIN.</DiagramCaption>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DIAGRAM 2: The Great Consolidation (252 → 40)
   ═══════════════════════════════════════════════════════════ */

export function ConsolidationDiagram() {
  return (
    <div className="my-6">
      <DiagramTitle>Figure 2 — The Great Consolidation (November 4–5, 2025)</DiagramTitle>
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <svg viewBox="0 0 680 280" className="w-full max-w-[680px] mx-auto" role="img" aria-label="Great Consolidation diagram showing 252 functions compressed to 40 primitives">
          {/* Left: sprawl */}
          <rect x="20" y="30" width="200" height="200" rx="8" className="fill-[hsl(var(--destructive))] fill-opacity-[0.06] stroke-[hsl(var(--destructive))] stroke-opacity-[0.2] stroke-[1.5]" />
          <text x="120" y="25" textAnchor="middle" className="fill-[hsl(var(--destructive))] text-[11px] font-mono font-bold">BEFORE</text>
          
          {/* Scatter small dots for 252 functions */}
          {Array.from({ length: 60 }).map((_, i) => {
            const x = 30 + (i % 10) * 19;
            const y = 40 + Math.floor(i / 10) * 30;
            return <rect key={i} x={x} y={y} width="14" height="14" rx="2" className="fill-[hsl(var(--destructive))] fill-opacity-[0.2] stroke-[hsl(var(--destructive))] stroke-opacity-[0.3] stroke-[0.5]" />;
          })}
          <text x="120" y="250" textAnchor="middle" className="fill-[hsl(var(--muted-foreground))] text-[10px] font-mono">252+ edge functions</text>

          {/* Arrow */}
          <g>
            <path d="M240,130 L320,130" className={arrowStyle} />
            <polygon points="320,125 330,130 320,135" className={arrowHeadStyle} />
            <text x="280" y="120" textAnchor="middle" className={labelStyle}>175 deleted</text>
            <text x="280" y="148" textAnchor="middle" className="fill-[hsl(var(--muted-foreground))] text-[8px] font-mono">Nov 4–5</text>
          </g>

          {/* Right: organized */}
          <rect x="340" y="30" width="320" height="200" rx="8" className="fill-[hsl(var(--primary))] fill-opacity-[0.06] stroke-[hsl(var(--primary))] stroke-opacity-[0.2] stroke-[1.5]" />
          <text x="500" y="25" textAnchor="middle" className="fill-[hsl(var(--primary))] text-[11px] font-mono font-bold">AFTER</text>

          {/* 4 category blocks */}
          {[
            { x: 350, y: 40, w: 145, h: 35, name: "Organs", n: "12" },
            { x: 505, y: 40, w: 145, h: 35, name: "Layers", n: "8" },
            { x: 350, y: 85, w: 145, h: 35, name: "Engines", n: "10" },
            { x: 505, y: 85, w: 145, h: 35, name: "Agents", n: "10" },
          ].map((s, i) => (
            <g key={i}>
              <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="4" className="fill-[hsl(var(--primary))] fill-opacity-[0.1] stroke-[hsl(var(--primary))] stroke-opacity-[0.3] stroke-[1]" />
              <text x={s.x + s.w / 2} y={s.y + 15} textAnchor="middle" className="fill-[hsl(var(--foreground))] text-[9px] font-mono font-semibold">{s.name}</text>
              <text x={s.x + s.w / 2} y={s.y + 27} textAnchor="middle" className="fill-[hsl(var(--muted-foreground))] text-[8px] font-mono">{s.n} primitives</text>
            </g>
          ))}

          {/* Resolver illustration */}
          <rect x="350" y="138" width="300" height="40" rx="4" className="fill-[hsl(var(--accent))] fill-opacity-[0.08] stroke-[hsl(var(--accent))] stroke-opacity-[0.2] stroke-[1]" />
          <text x="500" y="155" textAnchor="middle" className="fill-[hsl(var(--foreground))] text-[9px] font-mono font-semibold">primitive.resolver_name → composable capabilities</text>
          <text x="500" y="170" textAnchor="middle" className="fill-[hsl(var(--muted-foreground))] text-[8px] font-mono">80+ resolvers across 40 primitives</text>

          <text x="500" y="210" textAnchor="middle" className="fill-[hsl(var(--muted-foreground))] text-[10px] font-mono">40 primitives · 4 categories · Σ(weight) = 1.000</text>
        </svg>
      </div>
      <DiagramCaption>The founding axiom: sprawling functions compress into composable primitives without loss of capability.</DiagramCaption>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DIAGRAM 3: CMPSBL 40-Node Sector Topology
   ═══════════════════════════════════════════════════════════ */

export function SectorTopologyDiagram() {
  const sectors = [
    { name: "KERNEL", nodes: ["CORE", "SYSTEM"], x: 20, y: 20, w: 150, color: "primary" },
    { name: "CCR", nodes: ["BRAIN", "MEMORY", "DREAM"], x: 180, y: 20, w: 150, color: "accent" },
    { name: "OCG", nodes: ["ACCESS", "AUDIT", "IDENTITY", "RELAY", "RIPPLE", "GOVERNANCE"], x: 340, y: 20, w: 160, color: "muted-foreground" },
    { name: "EXECUTION", nodes: ["DECODE", "ENCODE", "CORTEX", "NEXUS", "VISION", "ORACLE", "FORGE", "ENGINEER", "LINGUA", "INTEGRATION"], x: 510, y: 20, w: 160, color: "primary" },
    { name: "ESZ", nodes: ["HARVEST", "OBSERVER", "COMPASS"], x: 20, y: 170, w: 150, color: "accent" },
    { name: "EPZ", nodes: ["INCLUSIVE", "ECHO", "ATLAS"], x: 180, y: 170, w: 150, color: "accent" },
    { name: "EMZ", nodes: ["SOVEREIGN", "REFLEX", "TREATY"], x: 340, y: 170, w: 160, color: "accent" },
    { name: "CSZ", nodes: ["PHANTOM", "SHADOW", "NERVE", "CONSCIENCE"], x: 510, y: 170, w: 160, color: "destructive" },
    { name: "FIELDS", nodes: ["EVOLUTION", "IMMUNITY"], x: 20, y: 310, w: 150, color: "primary" },
    { name: "PLANE", nodes: ["INTENT", "GOVERNANCE"], x: 180, y: 310, w: 150, color: "primary" },
    { name: "SHELL", nodes: ["DEFENSE"], x: 340, y: 310, w: 160, color: "destructive" },
  ];

  return (
    <div className="my-6">
      <DiagramTitle>Figure 3 — CMPSBL® 40-Primitive Taxonomy (v14.2.0 MINDGAMES)</DiagramTitle>
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <svg viewBox="0 0 690 430" className="w-full max-w-[690px] mx-auto" role="img" aria-label="CMPSBL 40-primitive taxonomy showing 4 categories">
          {sectors.map((sector, si) => {
            const nodeH = 18;
            const sectorH = 40 + sector.nodes.length * (nodeH + 2);
            return (
              <g key={si}>
                <rect x={sector.x} y={sector.y} width={sector.w} height={sectorH} rx="6" 
                  className={`fill-[hsl(var(--${sector.color}))] fill-opacity-[0.06] stroke-[hsl(var(--${sector.color}))] stroke-opacity-[0.25] stroke-[1.5]`} />
                <text x={sector.x + sector.w / 2} y={sector.y + 16} textAnchor="middle" 
                  className={`fill-[hsl(var(--${sector.color}))] text-[10px] font-mono font-bold`}>{sector.name}</text>
                {sector.nodes.map((node, ni) => (
                  <g key={ni}>
                    <rect x={sector.x + 8} y={sector.y + 26 + ni * (nodeH + 2)} width={sector.w - 16} height={nodeH} rx="3"
                      className="fill-[hsl(var(--muted))] fill-opacity-[0.5] stroke-[hsl(var(--border))] stroke-[0.5]" />
                    <text x={sector.x + sector.w / 2} y={sector.y + 26 + ni * (nodeH + 2) + 13} textAnchor="middle"
                      className="fill-[hsl(var(--foreground))] text-[8px] font-mono font-semibold">{node}</text>
                  </g>
                ))}
              </g>
            );
          })}
          {/* Weight invariant */}
          <text x="345" y="420" textAnchor="middle" className="fill-[hsl(var(--muted-foreground))] text-[10px] font-mono">
            Σ(primitive_weight) = 1.000 · Clockless Coordination · Deterministic Boot Sequence
          </text>
        </svg>
      </div>
      <DiagramCaption>The 40-primitive matrix organized into 4 canonical categories with weighted governance.</DiagramCaption>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DIAGRAM 4: Timeline Progression
   ═══════════════════════════════════════════════════════════ */

export function TimelineDiagram() {
  const phases = [
    { month: "Jan '25", label: "BRAIN", sub: "Genesis", color: "primary" },
    { month: "Jul '25", label: "Clarity", sub: "WCAG AI", color: "accent" },
    { month: "Aug '25", label: "Cascade", sub: "Orchestration", color: "accent" },
    { month: "Sep '25", label: "Shield", sub: "Stealth→Shield", color: "destructive" },
    { month: "Sep '25", label: "Dream", sub: "Protocol", color: "primary" },
    { month: "Oct '25", label: "Nexus", sub: "23 Providers", color: "accent" },
    { month: "Nov '25", label: "252→40", sub: "Consolidation", color: "destructive" },
    { month: "Dec '25", label: "SimNap", sub: "Dream System", color: "primary" },
    { month: "Jan '26", label: "v5.5", sub: "Substrate", color: "primary" },
    { month: "Mar '26", label: "v14.2", sub: "MINDGAMES", color: "primary" },
  ];

  const totalW = 660;
  const startX = 30;
  const stepW = totalW / (phases.length - 1);

  return (
    <div className="my-6">
      <DiagramTitle>Figure 4 — Development Timeline (January 2025 → March 2026)</DiagramTitle>
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <svg viewBox="0 0 700 180" className="w-full max-w-[700px] mx-auto" role="img" aria-label="Development timeline from January 2025 to March 2026">
          {/* Timeline line */}
          <line x1={startX} y1="90" x2={startX + totalW} y2="90" className="stroke-[hsl(var(--border))] stroke-[2]" />
          
          {phases.map((phase, i) => {
            const x = startX + i * stepW;
            const above = i % 2 === 0;
            const yDot = 90;
            const yText = above ? 40 : 140;
            const yLine = above ? 55 : 105;
            
            return (
              <g key={i}>
                {/* Connector */}
                <line x1={x} y1={yDot} x2={x} y2={yLine} className="stroke-[hsl(var(--border))] stroke-[1] stroke-opacity-[0.5]" />
                {/* Dot */}
                <circle cx={x} cy={yDot} r="5" className={`fill-[hsl(var(--${phase.color}))] stroke-[hsl(var(--background))] stroke-[2]`} />
                {/* Labels */}
                <text x={x} y={above ? yText : yText - 10} textAnchor="middle" className="fill-[hsl(var(--foreground))] text-[9px] font-mono font-bold">{phase.label}</text>
                <text x={x} y={above ? yText + 11 : yText + 1} textAnchor="middle" className="fill-[hsl(var(--muted-foreground))] text-[7px] font-mono">{phase.sub}</text>
                <text x={x} y={above ? yText - 10 : yText + 13} textAnchor="middle" className="fill-[hsl(var(--muted-foreground))] fill-opacity-[0.6] text-[7px] font-mono">{phase.month}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <DiagramCaption>15-month research trajectory from the first line of BRAIN code to the 40-primitive MINDGAMES epoch.</DiagramCaption>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DIAGRAM 5: Heritage Lineage Flow (Product → Node)
   ═══════════════════════════════════════════════════════════ */

export function LineageFlowDiagram() {
  const lineages = [
    { from: "BRAIN (Jan '25)", to: "BRAIN · MEMORY", pattern: "Zero-cost embeddings, crystallization" },
    { from: "Clarity (Jul '25)", to: "INCLUSIVE · ACCESS", pattern: "Detect → fix → validate governance" },
    { from: "Cascade (Aug '25)", to: "CORTEX · ORACLE · INTENT", pattern: "Orchestration as intelligence" },
    { from: "AetherionShield", to: "DEFENSE · IMMUNITY · PHANTOM", pattern: "Stealth → shield inversion" },
    { from: "Dream Protocol", to: "DREAM", pattern: "Autonomous cognitive loops" },
    { from: "Nexus Mesh", to: "NEXUS", pattern: "Multi-provider routing" },
    { from: "SimNap", to: "DREAM · Memory Stream", pattern: "Pipeline discovery + Foundry" },
    { from: "Studio", to: "FORGE · DECODE · ENCODE", pattern: "Artifact generation" },
    { from: "Verify", to: "SHADOW · AUDIT", pattern: "Sandboxed verification" },
  ];

  const rowH = 32;
  const totalH = 50 + lineages.length * rowH;

  return (
    <div className="my-6">
      <DiagramTitle>Figure 5 — Heritage Lineage: Product Origins → Substrate Nodes</DiagramTitle>
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <svg viewBox={`0 0 680 ${totalH}`} className="w-full max-w-[680px] mx-auto" role="img" aria-label="Heritage lineage showing how each PromptFluid product maps to CMPSBL substrate primitives">
          {/* Headers */}
          <text x="100" y="18" textAnchor="middle" className="fill-[hsl(var(--primary))] text-[10px] font-mono font-bold">ORIGIN</text>
          <text x="340" y="18" textAnchor="middle" className="fill-[hsl(var(--muted-foreground))] text-[10px] font-mono font-bold">KEY PATTERN</text>
          <text x="570" y="18" textAnchor="middle" className="fill-[hsl(var(--primary))] text-[10px] font-mono font-bold">SUBSTRATE NODE</text>
          <line x1="20" y1="25" x2="660" y2="25" className="stroke-[hsl(var(--border))] stroke-[1]" />

          {lineages.map((l, i) => {
            const y = 45 + i * rowH;
            return (
              <g key={i}>
                {/* Alternating row bg */}
                {i % 2 === 0 && <rect x="20" y={y - 11} width="640" height={rowH} rx="3" className="fill-[hsl(var(--muted))] fill-opacity-[0.3]" />}
                {/* Origin */}
                <text x="100" y={y + 4} textAnchor="middle" className="fill-[hsl(var(--foreground))] text-[9px] font-mono font-semibold">{l.from}</text>
                {/* Arrow */}
                <line x1="180" y1={y} x2="230" y2={y} className="stroke-[hsl(var(--primary))] stroke-[1.5]" />
                <polygon points={`230,${y - 3} 236,${y} 230,${y + 3}`} className={arrowHeadStyle} />
                {/* Pattern */}
                <text x="340" y={y + 4} textAnchor="middle" className="fill-[hsl(var(--muted-foreground))] text-[8px] font-mono">{l.pattern}</text>
                {/* Arrow */}
                <line x1="450" y1={y} x2="490" y2={y} className="stroke-[hsl(var(--primary))] stroke-[1.5]" />
                <polygon points={`490,${y - 3} 496,${y} 490,${y + 3}`} className={arrowHeadStyle} />
                {/* Node */}
                <text x="570" y={y + 4} textAnchor="middle" className="fill-[hsl(var(--foreground))] text-[9px] font-mono font-bold">{l.to}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <DiagramCaption>Every substrate node traces its design to a predecessor project. No architecture emerged in isolation.</DiagramCaption>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DIAGRAM 6: Execution Flow — Intent Mesh
   ═══════════════════════════════════════════════════════════ */

export function IntentMeshDiagram() {
  return (
    <div className="my-6">
      <DiagramTitle>Figure 6 — CMPSBL® Intent Mesh Execution Flow</DiagramTitle>
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <svg viewBox="0 0 680 220" className="w-full max-w-[680px] mx-auto" role="img" aria-label="Intent Mesh execution flow from user action through resolver execution to telemetry">
          {/* Flow boxes */}
          {[
            { x: 10, y: 80, w: 85, label: "User Action", sub: "" },
            { x: 115, y: 80, w: 100, label: "broadcastIntent()", sub: "NL / Structured" },
            { x: 235, y: 80, w: 85, label: "INTENT Router", sub: "DAG Planning" },
            { x: 340, y: 80, w: 95, label: "Resolver Exec", sub: "node.resolver" },
            { x: 455, y: 80, w: 90, label: "Mesh Comms", sub: "Signal Events" },
            { x: 565, y: 80, w: 100, label: "Telemetry", sub: "Dashboards" },
          ].map((box, i) => (
            <g key={i}>
              <rect x={box.x} y={box.y} width={box.w} height="50" rx="6" className={nodeStyle} />
              <text x={box.x + box.w / 2} y={box.y + 22} textAnchor="middle" className="fill-[hsl(var(--foreground))] text-[9px] font-mono font-bold">{box.label}</text>
              {box.sub && <text x={box.x + box.w / 2} y={box.y + 36} textAnchor="middle" className={nodeSubStyle}>{box.sub}</text>}
              {/* Arrow to next */}
              {i < 5 && (
                <>
                  <line x1={box.x + box.w + 2} y1={105} x2={box.x + box.w + 17} y2={105} className={arrowStyle} />
                  <polygon points={`${box.x + box.w + 17},102 ${box.x + box.w + 22},105 ${box.x + box.w + 17},108`} className={arrowHeadStyle} />
                </>
              )}
            </g>
          ))}

          {/* Feedback loop */}
          <path d="M615,130 L615,170 L60,170 L60,130" fill="none" className="stroke-[hsl(var(--primary))] stroke-opacity-[0.3] stroke-[1.5]" strokeDasharray="4 3" />
          <polygon points="60,130 56,137 64,137" className="fill-[hsl(var(--primary))] fill-opacity-[0.3]" />
          <text x="340" y="185" textAnchor="middle" className="fill-[hsl(var(--primary))] fill-opacity-[0.5] text-[8px] font-mono">MEMORY STREAM FEEDBACK → BRAIN CRYSTALLIZATION</text>

          {/* Top annotation */}
          <text x="340" y="60" textAnchor="middle" className="fill-[hsl(var(--primary))] text-[10px] font-mono font-semibold">All system actions route through broadcastIntent()</text>
        </svg>
      </div>
      <DiagramCaption>The universal execution model inherited from Cascade's orchestration-as-intelligence pattern.</DiagramCaption>
    </div>
  );
}
