/**
 * CodeWrapAnimation — Animated visualization of Mana silently wrapping code
 * Shows real lodash code being enveloped by Layer 2 capabilities
 */
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const CODE_LINES = [
  { text: 'import _ from "lodash";', type: 'import' },
  { text: '', type: 'blank' },
  { text: 'export function processData(raw) {', type: 'fn' },
  { text: '  const merged = _.merge(defaults, raw);', type: 'target', cap: 'DEFENSE' },
  { text: '  const unique = _.uniq(merged.items);', type: 'target', cap: 'BEACON' },
  { text: '  const sorted = _.sortBy(unique, "id");', type: 'target', cap: 'BEACON' },
  { text: '  const deep = _.cloneDeep(sorted);', type: 'target', cap: 'CIRCUIT' },
  { text: '  const grouped = _.groupBy(deep, "type");', type: 'target', cap: 'BEACON' },
  { text: '  return grouped;', type: 'return' },
  { text: '}', type: 'fn' },
];

const CAP_COLORS: Record<string, string> = {
  DEFENSE: 'hsl(var(--destructive))',
  BEACON: 'hsl(var(--primary))',
  CIRCUIT: 'hsl(var(--neon-amber))',
};

const CAP_LABELS: Record<string, string> = {
  DEFENSE: '🛡 DEFENSE Gate',
  BEACON: '📡 BEACON Telemetry',
  CIRCUIT: '⚡ Circuit Breaker',
};

export function CodeWrapAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'wrapping' | 'active'>('idle');

  useEffect(() => {
    if (!isInView) return;
    const t1 = setTimeout(() => setPhase('scanning'), 400);
    const t2 = setTimeout(() => setPhase('wrapping'), 1800);
    const t3 = setTimeout(() => setPhase('active'), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isInView]);

  return (
    <div ref={ref} className="relative w-full max-w-4xl mx-auto">
      {/* Status bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="flex items-center justify-between mb-4 px-2"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${
            phase === 'active' ? 'bg-[hsl(var(--neon-green))]' :
            phase === 'wrapping' ? 'bg-[hsl(var(--neon-amber))] animate-pulse' :
            phase === 'scanning' ? 'bg-[hsl(var(--primary))] animate-pulse' :
            'bg-muted-foreground/30'
          }`} />
          <span className="text-xs font-mono text-muted-foreground dark:text-muted-foreground tracking-wider uppercase">
            {phase === 'idle' && 'Layer 1 — Unattached'}
            {phase === 'scanning' && 'Scanning function boundaries...'}
            {phase === 'wrapping' && 'Attaching Layer 2 capabilities...'}
            {phase === 'active' && 'Symbiotic — 5 functions wrapped · 0 lines modified'}
          </span>
        </div>
        {phase === 'active' && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-mono font-bold text-[hsl(var(--neon-green))]"
          >
            SHA-256 ✓ MATCH
          </motion.span>
        )}
      </motion.div>

      {/* Code block */}
      <div className="relative rounded-xl overflow-hidden border border-border/50 bg-[hsl(220,25%,6%)]">
        {/* Scan line effect */}
        {phase === 'scanning' && (
          <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent z-10"
            initial={{ top: 0 }}
            animate={{ top: '100%' }}
            transition={{ duration: 1.2, ease: 'linear', repeat: 1 }}
          />
        )}

        <div className="p-6 md:p-8 font-mono text-sm md:text-base leading-loose">
          {CODE_LINES.map((line, i) => {
            const isTarget = line.type === 'target';
            const isWrapped = isTarget && (phase === 'wrapping' || phase === 'active');
            const delay = isTarget ? i * 0.15 : 0;

            return (
              <div key={i} className="relative flex items-center group">
                {/* Line number */}
                <span className="w-8 text-right text-muted-foreground/30 text-xs mr-6 select-none flex-shrink-0">
                  {i + 1}
                </span>

                {/* Code content */}
                <div className="relative flex-1 min-h-[1.5em]">
                  {/* Wrap glow */}
                  {isWrapped && (
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                      className="absolute inset-0 -mx-3 -my-0.5 rounded"
                      style={{
                        background: `linear-gradient(90deg, ${CAP_COLORS[line.cap!]}15, transparent)`,
                        borderLeft: `2px solid ${CAP_COLORS[line.cap!]}60`,
                        originX: 0,
                      }}
                    />
                  )}

                  <span className={`relative z-10 ${
                    line.type === 'import' ? 'text-[hsl(var(--neon-purple))]' :
                    line.type === 'fn' ? 'text-[hsl(var(--neon-cyan))]' :
                    line.type === 'return' ? 'text-[hsl(var(--neon-magenta))]' :
                    'text-white/90'
                  }`}>
                    {line.text}
                  </span>
                </div>

                {/* Capability badge */}
                {isWrapped && line.cap && phase === 'active' && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: delay + 0.4, duration: 0.3 }}
                    className="ml-4 text-[10px] font-bold tracking-wider whitespace-nowrap flex-shrink-0"
                    style={{ color: CAP_COLORS[line.cap] }}
                  >
                    {CAP_LABELS[line.cap]}
                  </motion.span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
