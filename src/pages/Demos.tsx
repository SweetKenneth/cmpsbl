/**
 * CMPSBL Demos Hub — S-Tier Capability Showcase
 * Interactive demonstrations of substrate differentiators
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, Fingerprint, Wifi, WifiOff, Activity, 
  ArrowLeft, Play, Crown, Sparkles, Lock, Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';

interface DemoCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  tier: 'real' | 'hybrid' | 'simulated';
  tierLabel: string;
  path: string;
  features: string[];
  moatScore: number;
}

const DEMOS: DemoCard[] = [
  {
    id: 'self-healing',
    title: 'Self-Healing Architecture',
    subtitle: 'Autonomous fault recovery',
    description: 'Inject a real fault into a live module and watch the substrate detect, diagnose, and repair itself autonomously. No human intervention required.',
    icon: <Shield className="w-6 h-6" />,
    tier: 'real',
    tierLabel: 'REAL INFRASTRUCTURE',
    path: '/demos/self-healing',
    features: ['Live fault injection', 'Circuit breaker cascade', 'Auto-heal pipeline', 'Health delta visualization'],
    moatScore: 5,
  },
  {
    id: 'living-map',
    title: 'Living Architecture Map',
    subtitle: 'Real-time system organism',
    description: 'A cinematic, real-time visualization of all 21 substrate modules as a living organism. Modules pulse with activity, connections glow with data flow.',
    icon: <Activity className="w-6 h-6" />,
    tier: 'real',
    tierLabel: 'REAL DATA, CINEMATIC RENDER',
    path: '/demos/living-map',
    features: ['Live module telemetry', 'Animated data flow', 'Health-responsive coloring', 'Interactive module inspection'],
    moatScore: 5,
  },
  {
    id: 'provenance',
    title: 'Cognitive Provenance Chain',
    subtitle: 'AI supply-chain transparency',
    description: 'Every AI output gets an immutable, cryptographically-signed lineage trace. See which models, engines, heuristics, and memories contributed.',
    icon: <Fingerprint className="w-6 h-6" />,
    tier: 'hybrid',
    tierLabel: 'REAL CORE, SIMULATED EDGES',
    path: '/demos/provenance',
    features: ['Real provenance graph', 'Cryptographic signatures', 'Model attribution', 'Decision audit trail'],
    moatScore: 4,
  },
  {
    id: 'sovereign',
    title: 'Sovereign Execution Proof',
    subtitle: 'Zero-dependency offline AI',
    description: 'Demonstrate that an agency runs entirely without cloud calls — full local execution with persistent memory. No internet required.',
    icon: <WifiOff className="w-6 h-6" />,
    tier: 'simulated',
    tierLabel: 'SIMULATED DEMO',
    path: '/demos/sovereign',
    features: ['Offline execution proof', 'Local memory persistence', 'Zero cloud dependency', 'Architecture walkthrough'],
    moatScore: 5,
  },
];

const tierColors = {
  real: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
  hybrid: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
  simulated: 'border-sky-500/50 bg-sky-500/10 text-sky-400',
};

export default function Demos() {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <>
      <Helmet>
        <title>CMPSBL Demos — S-Tier Capability Showcase</title>
        <meta name="description" content="Interactive demonstrations of CMPSBL substrate capabilities: self-healing, living architecture, cognitive provenance, and sovereign execution." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 px-4 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <h1 className="text-xl font-bold">S-Tier Demos</h1>
                </div>
                <p className="text-sm text-muted-foreground">Capabilities no one else has shipped</p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1.5">
              <Sparkles className="w-3 h-3" />
              4 Demos
            </Badge>
          </div>
        </header>

        {/* Demo Grid */}
        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DEMOS.map((demo, i) => (
              <motion.div
                key={demo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onMouseEnter={() => setHoveredId(demo.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => navigate(demo.path)}
                className="group relative cursor-pointer rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Tier badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border ${tierColors[demo.tier]}`}>
                    {demo.tier === 'real' && <Cpu className="w-3 h-3" />}
                    {demo.tier === 'hybrid' && <Sparkles className="w-3 h-3" />}
                    {demo.tier === 'simulated' && <Lock className="w-3 h-3" />}
                    {demo.tierLabel}
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div
                        key={j}
                        className={`w-1.5 h-4 rounded-full ${j < demo.moatScore ? 'bg-primary' : 'bg-muted'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                    {demo.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold mb-1">{demo.title}</h2>
                    <p className="text-sm text-muted-foreground mb-3">{demo.description}</p>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5">
                      {demo.features.map(f => (
                        <span key={f} className="text-[11px] px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Launch indicator */}
                <AnimatePresence>
                  {hoveredId === demo.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute bottom-4 right-4"
                    >
                      <div className="flex items-center gap-1.5 text-sm text-primary font-medium">
                        <Play className="w-4 h-4" />
                        Launch Demo
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
