/**
 * Substrate Demo — Interactive AI OS Showcase
 * 37-Node / 11-Sector Field-Based Topology
 *
 * CORE → SYSTEM → CCR → OCG → Execution → ESZ → EPZ → EMZ → Fields → Plane → Shell
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Shield, Eye, Zap, Moon, 
  Play, Pause, RotateCcw, Activity,
  ChevronRight, Sparkles, Code, Layers, ArrowRight,
  Cpu, Network, Lock, Server, Workflow,
  Database, Send, FileCheck, Fingerprint, Coins, FlaskConical, Code2, Accessibility, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { SEO } from '@/components/SEO';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface ModuleState {
  id: string;
  name: string;
  icon: React.ElementType;
  layer: 'kernel' | 'module' | 'mesh-overlay' | 'zone-ccr' | 'zone-ocg';
  status: 'idle' | 'active' | 'processing' | 'complete';
  color: string;
  description: string;
}

interface LogEntry {
  timestamp: Date;
  module: string;
  action: string;
  status: 'info' | 'success' | 'warning';
}

const LAYER_COLORS = {
  kernel: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400' },
  module: { bg: 'bg-violet-500/20', border: 'border-violet-500/50', text: 'text-violet-400' },
  'mesh-overlay': { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400' },
  'zone-ccr': { bg: 'bg-fuchsia-500/20', border: 'border-fuchsia-500/50', text: 'text-fuchsia-400' },
  'zone-ocg': { bg: 'bg-slate-500/20', border: 'border-slate-500/50', text: 'text-slate-400' },
};

const INITIAL_MODULES: ModuleState[] = [
  // KERNEL (boots first)
  { id: 'core', name: 'CORE', icon: Cpu, layer: 'kernel', status: 'idle', color: 'orange', description: 'Kernel — Boots First' },
  // 8 PUBLIC MODULES
  { id: 'decode', name: 'DECODE', icon: MessageSquare, layer: 'module', status: 'idle', color: 'cyan', description: 'Intent Parsing' },
  { id: 'encode', name: 'ENCODE', icon: Code2, layer: 'module', status: 'idle', color: 'lime', description: 'Code Intelligence' },
  { id: 'vision', name: 'VISION', icon: Eye, layer: 'module', status: 'idle', color: 'rose', description: 'Observability' },
  { id: 'cortex', name: 'CORTEX', icon: Workflow, layer: 'module', status: 'idle', color: 'fuchsia', description: 'Orchestrator' },
  { id: 'nexus', name: 'NEXUS', icon: Layers, layer: 'module', status: 'idle', color: 'amber', description: 'AI Routing' },
  { id: 'economy', name: 'ECONOMY', icon: Coins, layer: 'module', status: 'idle', color: 'amber', description: 'Cost Control' },
  { id: 'sandbox', name: 'SANDBOX', icon: FlaskConical, layer: 'module', status: 'idle', color: 'cyan', description: 'Isolation' },
  { id: 'inclusive', name: 'INCLUSIVE', icon: Accessibility, layer: 'module', status: 'idle', color: 'rose', description: 'Accessibility' },
  // INTEGRATION (module — boots last)
  { id: 'integration', name: 'INTEGRATION', icon: Code, layer: 'module', status: 'idle', color: 'indigo', description: 'External APIs — Boots Last' },
  // MESH OVERLAYS (Fields + Plane + Shell — protective layers wrapping all sectors)
  { id: 'defense', name: 'DEFENSE', icon: Shield, layer: 'mesh-overlay', status: 'idle', color: 'emerald', description: 'Outermost — Security Shield' },
  { id: 'immunity', name: 'IMMUNITY', icon: Activity, layer: 'mesh-overlay', status: 'idle', color: 'emerald', description: 'Resilience Layer' },
  { id: 'evolution', name: 'EVOLUTION', icon: Sparkles, layer: 'mesh-overlay', status: 'idle', color: 'pink', description: 'Self-Improvement Layer' },
  { id: 'intent', name: 'INTENT', icon: Brain, layer: 'mesh-overlay', status: 'idle', color: 'violet', description: 'Goal Routing Layer' },
  { id: 'governance', name: 'GOVERNANCE', icon: Lock, layer: 'mesh-overlay', status: 'idle', color: 'slate', description: 'Innermost — Ethical Gates' },
  // CCR ZONES (4) — surgically hot-swappable
  { id: 'brain', name: 'BRAIN Zone', icon: Brain, layer: 'zone-ccr', status: 'idle', color: 'violet', description: 'CCR: Memory & Learning' },
  { id: 'system', name: 'SYSTEM Zone', icon: Server, layer: 'zone-ccr', status: 'idle', color: 'slate', description: 'CCR: Administration' },
  { id: 'memory', name: 'MEMORY Zone', icon: Database, layer: 'zone-ccr', status: 'idle', color: 'sky', description: 'CCR: Vector Storage' },
  { id: 'dream', name: 'DREAM Zone', icon: Moon, layer: 'zone-ccr', status: 'idle', color: 'purple', description: 'CCR: Synthesis' },
  // OCG ZONES (5) — Operational Compliance Grid
  { id: 'ripple', name: 'RIPPLE Zone', icon: Network, layer: 'zone-ocg', status: 'idle', color: 'teal', description: 'OCG: Event Bus' },
  { id: 'access', name: 'ACCESS Zone', icon: Lock, layer: 'zone-ocg', status: 'idle', color: 'yellow', description: 'OCG: API Keys' },
  { id: 'identity', name: 'IDENTITY Zone', icon: Fingerprint, layer: 'zone-ocg', status: 'idle', color: 'rose', description: 'OCG: Attribution' },
  { id: 'relay', name: 'RELAY Zone', icon: Send, layer: 'zone-ocg', status: 'idle', color: 'lime', description: 'OCG: Webhooks' },
  { id: 'audit', name: 'AUDIT Zone', icon: FileCheck, layer: 'zone-ocg', status: 'idle', color: 'stone', description: 'OCG: Compliance' },
];

const DEMO_SCENARIOS = [
  {
    name: 'User Request Flow',
    sequence: ['core', 'access', 'decode', 'brain', 'nexus', 'ripple'],
    description: 'Boot kernel → Authenticate → Parse intent → Recall memory → Route AI → Broadcast',
    icon: Zap,
  },
  {
    name: 'Security Pipeline',
    sequence: ['defense', 'vision', 'brain', 'governance'],
    description: 'Detect threats → Observe patterns → Store intel → Enforce ethics',
    icon: Shield,
  },
  {
    name: 'Dream Cycle',
    sequence: ['brain', 'dream', 'evolution', 'vision'],
    description: 'Consolidate memories → Synthesize insights → Self-improve → Monitor',
    icon: Moon,
  },
  {
    name: 'Full Orchestration',
    sequence: ['core', 'system', 'brain', 'memory', 'dream', 'ripple', 'access', 'identity', 'relay', 'audit', 'decode', 'encode', 'vision', 'cortex', 'nexus', 'economy', 'sandbox', 'inclusive', 'medic', 'nerve', 'integration', 'sovereign', 'oracle', 'conscience', 'treaty', 'compass', 'echo', 'reflex', 'forge', 'lingua', 'phantom', 'harvest', 'governance', 'intent', 'evolution', 'immunity', 'defense'],
    description: '37 nodes across 11 sectors — full substrate orchestration',
    icon: Sparkles,
  },
];

export default function SubstrateDemo() {
  const [modules, setModules] = useState<ModuleState[]>(INITIAL_MODULES);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(3);
  const [currentStep, setCurrentStep] = useState(-1);
  const [totalOperations, setTotalOperations] = useState(0);
  const [systemHealth, setSystemHealth] = useState(100);

  const addLog = useCallback((module: string, action: string, status: 'info' | 'success' | 'warning' = 'info') => {
    setLogs(prev => [...prev.slice(-15), { timestamp: new Date(), module, action, status }]);
  }, []);

  const resetDemo = () => {
    setModules(INITIAL_MODULES);
    setLogs([]);
    setIsRunning(false);
    setCurrentStep(-1);
  };

  const runScenario = async () => {
    if (isRunning) return;
    setIsRunning(true);
    resetDemo();

    const scenario = DEMO_SCENARIOS[currentScenario];
    addLog('SUBSTRATE', `→ ${scenario.name}`, 'info');

    for (let i = 0; i < scenario.sequence.length; i++) {
      const moduleId = scenario.sequence[i];
      setCurrentStep(i);
      
      setModules(prev => prev.map(m => 
        m.id === moduleId ? { ...m, status: 'processing' } : m
      ));
      addLog(moduleId.toUpperCase(), 'Processing...', 'info');

      await new Promise(r => setTimeout(r, 700));

      setModules(prev => prev.map(m => 
        m.id === moduleId ? { ...m, status: 'complete' } : m
      ));
      addLog(moduleId.toUpperCase(), '✓ Complete', 'success');
      setTotalOperations(prev => prev + 1);

      await new Promise(r => setTimeout(r, 200));
    }

    addLog('SUBSTRATE', '← Pipeline complete', 'success');
    setSystemHealth(prev => Math.min(100, prev + 1));
    setIsRunning(false);
    setCurrentStep(-1);
  };

  // Group by new architecture layers
  const groupedModules = {
    kernel: modules.filter(m => m.layer === 'kernel'),
    module: modules.filter(m => m.layer === 'module'),
    'mesh-overlay': modules.filter(m => m.layer === 'mesh-overlay'),
    'zone-ccr': modules.filter(m => m.layer === 'zone-ccr'),
    'zone-ocg': modules.filter(m => m.layer === 'zone-ocg'),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="Interactive Demo — AI Cognitive Substrate | CMPSBL®"
        description="Experience CMPSBL's cognitive substrate live. Watch execution surfaces, mesh overlays, and hot-swappable zones orchestrate in real-time."
        keywords={['AI demo', 'cognitive substrate demo', 'AI operating system demo', 'CMPSBL interactive', 'zone architecture']}
      />
      <PublicNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[80px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-violet-500/20 border border-primary/30 text-sm mb-6"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="font-medium">Interactive Demo</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-bold mb-4"
              >
                <span className="bg-gradient-to-r from-primary via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  37 Nodes
                </span>
                <span className="text-foreground"> · 11 Sectors · 675+ Capabilities</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground max-w-xl mx-auto"
              >
                Watch cognitive modules orchestrate in real-time. Select a scenario and observe data flow through the system.
              </motion.p>
            </div>

            {/* Main Demo Card - Centered and Contained */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-5xl mx-auto"
            >
              <Card className="border-primary/20 bg-card/80 backdrop-blur-xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                
                {/* Controls Bar */}
                <div className="p-4 border-b border-border/50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full transition-colors",
                      isRunning ? "bg-emerald-500 animate-pulse" : "bg-primary/50"
                    )} />
                    <span className="text-sm font-medium">
                      {isRunning ? `Running: ${DEMO_SCENARIOS[currentScenario].name}` : 'Ready'}
                    </span>
                    {isRunning && currentStep >= 0 && (
                      <Badge variant="outline" className="text-xs">
                        Step {currentStep + 1}/{DEMO_SCENARIOS[currentScenario].sequence.length}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{systemHealth}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Cpu className="w-3.5 h-3.5 text-primary" />
                      <span>{totalOperations} ops</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="grid lg:grid-cols-[1fr,280px] gap-6">
                    {/* Module Visualization - Stacked Layers */}
                    <div className="space-y-3">
                      {/* CORE Kernel */}
                      <LayerRow 
                        label="Kernel" 
                        modules={groupedModules.kernel} 
                        layerKey="kernel"
                        isRunning={isRunning}
                        activeSequence={DEMO_SCENARIOS[currentScenario].sequence}
                        currentStep={currentStep}
                      />
                      
                      {/* 8 Public Modules */}
                      <LayerRow 
                        label="Modules" 
                        modules={groupedModules.module} 
                        layerKey="module"
                        isRunning={isRunning}
                        activeSequence={DEMO_SCENARIOS[currentScenario].sequence}
                        currentStep={currentStep}
                      />
                      
                      {/* 5 Mesh Overlays (outermost → innermost) */}
                      <LayerRow 
                        label="Mesh Overlays" 
                        modules={groupedModules['mesh-overlay']} 
                        layerKey="mesh-overlay"
                        isRunning={isRunning}
                        activeSequence={DEMO_SCENARIOS[currentScenario].sequence}
                        currentStep={currentStep}
                      />

                      {/* CCR Zones */}
                      <LayerRow 
                        label="CCR Zones" 
                        modules={groupedModules['zone-ccr']} 
                        layerKey="zone-ccr"
                        isRunning={isRunning}
                        activeSequence={DEMO_SCENARIOS[currentScenario].sequence}
                        currentStep={currentStep}
                      />

                      {/* OCG Zones */}
                      <LayerRow 
                        label="OCG Zones" 
                        modules={groupedModules['zone-ocg']} 
                        layerKey="zone-ocg"
                        isRunning={isRunning}
                        activeSequence={DEMO_SCENARIOS[currentScenario].sequence}
                        currentStep={currentStep}
                      />
                    </div>

                    {/* Right Panel: Scenarios + Logs */}
                    <div className="space-y-4">
                      {/* Scenario Selection */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">Scenarios</h3>
                        <div className="space-y-1.5">
                          {DEMO_SCENARIOS.map((scenario, idx) => (
                            <button
                              key={scenario.name}
                              onClick={() => !isRunning && setCurrentScenario(idx)}
                              disabled={isRunning}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-lg border text-sm transition-all",
                                currentScenario === idx
                                  ? "border-primary bg-primary/10 text-foreground"
                                  : "border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground",
                                isRunning && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <scenario.icon className="w-4 h-4" />
                                <span className="font-medium">{scenario.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          onClick={runScenario}
                          disabled={isRunning}
                          className="flex-1 gap-2"
                        >
                          {isRunning ? (
                            <>
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              Running...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Run Demo
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={resetDemo}
                          disabled={isRunning}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Live Log */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">Event Log</h3>
                        <div className="h-[140px] overflow-y-auto bg-muted/30 rounded-lg p-2 font-mono text-xs space-y-0.5">
                          <AnimatePresence mode="popLayout">
                            {logs.length === 0 ? (
                              <p className="text-muted-foreground/50 text-center py-4">
                                Run a scenario to see events
                              </p>
                            ) : (
                              logs.map((log, idx) => (
                                <motion.div
                                  key={`${log.timestamp.getTime()}-${idx}`}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0 }}
                                  className={cn(
                                    "flex items-start gap-2",
                                    log.status === 'success' && "text-emerald-400",
                                    log.status === 'warning' && "text-amber-400",
                                    log.status === 'info' && "text-muted-foreground"
                                  )}
                                >
                                  <span className="opacity-50 shrink-0">
                                    {log.timestamp.toLocaleTimeString('en-US', { 
                                      hour12: false, 
                                      hour: '2-digit', 
                                      minute: '2-digit',
                                      second: '2-digit'
                                    })}
                                  </span>
                                  <span className="font-bold shrink-0">[{log.module}]</span>
                                  <span className="truncate">{log.action}</span>
                                </motion.div>
                              ))
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-10"
            >
              <p className="text-muted-foreground mb-4">
                Ready to build on the substrate?
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/explore">
                    Browse Templates
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/intelligence">
                    View Architecture
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </div>
  );
}

// Layer Row Component
function LayerRow({ 
  label, 
  modules, 
  layerKey,
  isRunning,
  activeSequence,
  currentStep
}: { 
  label: string; 
  modules: ModuleState[];
  layerKey: keyof typeof LAYER_COLORS;
  isRunning: boolean;
  activeSequence: string[];
  currentStep: number;
}) {
  const colors = LAYER_COLORS[layerKey];
  
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border transition-all",
      colors.bg, colors.border
    )}>
      <div className={cn("text-xs font-bold w-20 shrink-0", colors.text)}>
        {label}
      </div>
      <div className="flex-1 flex flex-wrap gap-2 justify-center">
        {modules.map((module) => {
          const Icon = module.icon;
          const isInSequence = activeSequence.includes(module.id);
          const sequenceIndex = activeSequence.indexOf(module.id);
          const isCurrentlyActive = isRunning && sequenceIndex === currentStep;
          const isComplete = module.status === 'complete';
          
          return (
            <motion.div
              key={module.id}
              className={cn(
                "relative flex flex-col items-center gap-1 p-2 rounded-lg border-2 min-w-[60px] transition-all",
                isComplete 
                  ? "bg-emerald-500/20 border-emerald-500"
                  : isCurrentlyActive
                    ? "bg-primary/20 border-primary animate-pulse"
                    : isInSequence
                      ? "bg-muted/50 border-primary/30"
                      : "bg-muted/20 border-transparent opacity-50"
              )}
              animate={isCurrentlyActive ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5, repeat: isCurrentlyActive ? Infinity : 0 }}
            >
              {isInSequence && (
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                  {sequenceIndex + 1}
                </div>
              )}
              <Icon className={cn(
                "w-5 h-5",
                isComplete ? "text-emerald-400" : isCurrentlyActive ? "text-primary" : "text-muted-foreground"
              )} />
              <span className="text-[10px] font-medium">{module.name}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
