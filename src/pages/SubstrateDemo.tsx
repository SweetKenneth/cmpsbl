/**
 * Substrate Demo — Interactive AI OS Showcase
 * Demonstrates the substrate as a cognitive operating system for AI
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Shield, Eye, Zap, Moon, 
  Play, Pause, RotateCcw, Terminal, Activity,
  ChevronRight, Sparkles, Code, Layers, ArrowRight,
  Check, Cpu, Network, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { SEO } from '@/components/SEO';
import { substrate } from '@/lib/substrate';
import { Link } from 'react-router-dom';

interface ModuleState {
  id: string;
  name: string;
  icon: React.ElementType;
  status: 'idle' | 'active' | 'processing' | 'complete';
  color: string;
  gradient: string;
  description: string;
  output?: string;
}

interface LogEntry {
  timestamp: Date;
  module: string;
  action: string;
  status: 'info' | 'success' | 'warning';
}

const INITIAL_MODULES: ModuleState[] = [
  // KERNEL LAYER
  { id: 'core', name: 'Core', icon: Cpu, status: 'idle', color: 'orange', gradient: 'from-orange-500 to-amber-600', description: 'Kernel Scheduling' },
  { id: 'ripple', name: 'Ripple', icon: Network, status: 'idle', color: 'teal', gradient: 'from-teal-500 to-cyan-600', description: 'Message Bus' },
  { id: 'access', name: 'Access', icon: Lock, status: 'idle', color: 'yellow', gradient: 'from-yellow-500 to-amber-600', description: 'Identity & Keys' },
  // COGNITIVE LAYER
  { id: 'brain', name: 'Brain', icon: Brain, status: 'idle', color: 'violet', gradient: 'from-violet-500 to-purple-600', description: 'Memory & Learning' },
  { id: 'decode', name: 'Decode', icon: Zap, status: 'idle', color: 'cyan', gradient: 'from-cyan-500 to-blue-600', description: 'Intent Parsing' },
  { id: 'nexus', name: 'Nexus', icon: Layers, status: 'idle', color: 'amber', gradient: 'from-amber-500 to-orange-600', description: 'AI Routing' },
  // OPERATIONAL LAYER
  { id: 'defense', name: 'Defense', icon: Shield, status: 'idle', color: 'emerald', gradient: 'from-emerald-500 to-teal-600', description: 'Threat Detection' },
  { id: 'vision', name: 'Vision', icon: Eye, status: 'idle', color: 'rose', gradient: 'from-rose-500 to-pink-600', description: 'Observability' },
  { id: 'dream', name: 'Dream', icon: Moon, status: 'idle', color: 'purple', gradient: 'from-purple-500 to-indigo-600', description: 'Evolution' },
  // ADMIN LAYER
  { id: 'system', name: 'System', icon: Cpu, status: 'idle', color: 'slate', gradient: 'from-slate-500 to-gray-600', description: 'Administration' },
  { id: 'modernizer', name: 'Modernizer', icon: Sparkles, status: 'idle', color: 'pink', gradient: 'from-pink-500 to-rose-600', description: 'Self-Upgrade' },
  { id: 'integration', name: 'Integration', icon: Code, status: 'idle', color: 'indigo', gradient: 'from-indigo-500 to-blue-600', description: 'Enterprise' },
];

const DEMO_SCENARIOS = [
  {
    name: 'Cognitive Pipeline',
    sequence: ['access', 'core', 'decode', 'brain', 'nexus', 'ripple'],
    description: 'Auth → orchestrate → interpret → memorize → route → broadcast',
    icon: Zap,
  },
  {
    name: 'Secure Intelligence',
    sequence: ['access', 'defense', 'vision', 'brain', 'system', 'ripple'],
    description: 'Authenticate → scan threats → observe → store intel → admin → notify',
    icon: Shield,
  },
  {
    name: 'Autonomous Evolution',
    sequence: ['core', 'brain', 'dream', 'modernizer', 'integration', 'vision'],
    description: 'Schedule → recall → synthesize → upgrade → connect → monitor',
    icon: Moon,
  },
  {
    name: 'Full System Demo',
    sequence: ['access', 'core', 'decode', 'defense', 'nexus', 'brain', 'dream', 'vision', 'modernizer', 'system', 'integration', 'ripple'],
    description: 'Complete 12-module orchestration across all layers',
    icon: Sparkles,
  },
];

export default function SubstrateDemo() {
  const [modules, setModules] = useState<ModuleState[]>(INITIAL_MODULES);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(3); // Start with Full Orchestration
  const [activeConnections, setActiveConnections] = useState<string[]>([]);
  const [systemHealth, setSystemHealth] = useState(100);
  const [totalOperations, setTotalOperations] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);

  const addLog = useCallback((module: string, action: string, status: 'info' | 'success' | 'warning' = 'info') => {
    setLogs(prev => [...prev.slice(-20), { timestamp: new Date(), module, action, status }]);
  }, []);

  const resetDemo = () => {
    setModules(INITIAL_MODULES);
    setLogs([]);
    setIsRunning(false);
    setActiveConnections([]);
    setCurrentStep(-1);
  };

  const runScenario = async () => {
    if (isRunning) return;
    setIsRunning(true);
    resetDemo();

    const scenario = DEMO_SCENARIOS[currentScenario];
    addLog('substrate', `→ Initiating: ${scenario.name}`, 'info');

    for (let i = 0; i < scenario.sequence.length; i++) {
      const moduleId = scenario.sequence[i];
      setCurrentStep(i);
      
      // Activate module
      setModules(prev => prev.map(m => 
        m.id === moduleId ? { ...m, status: 'processing' } : m
      ));
      addLog(moduleId.toUpperCase(), 'Activating...', 'info');

      // Show connection to next module
      if (i < scenario.sequence.length - 1) {
        setActiveConnections(prev => [...prev, `${moduleId}-${scenario.sequence[i + 1]}`]);
      }

      await new Promise(r => setTimeout(r, 900));

      // Complete module
      setModules(prev => prev.map(m => 
        m.id === moduleId ? { ...m, status: 'complete', output: `✓ ${m.name} processed` } : m
      ));
      addLog(moduleId.toUpperCase(), 'Complete ✓', 'success');
      setTotalOperations(prev => prev + 1);

      await new Promise(r => setTimeout(r, 300));
    }

    addLog('substrate', '← Pipeline complete', 'success');
    setSystemHealth(prev => Math.min(100, prev + 2));
    setIsRunning(false);
    setCurrentStep(-1);
  };

  // Live substrate ping on mount
  useEffect(() => {
    const ping = async () => {
      try {
        await substrate.invoke({ module: 'system', action: 'status' });
        addLog('SYSTEM', 'Substrate connected', 'success');
      } catch {
        addLog('SYSTEM', 'Demo mode active', 'warning');
      }
    };
    ping();
  }, [addLog]);

  const getModulePosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = 130;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="Substrate Demo — AI Operating System | promptfluid®"
        description="Interactive demonstration of the cognitive orchestration substrate. Build autonomous AI systems on a unified foundation."
      />
      <PublicNav />

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-cyan-500/5 blur-[150px]" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-10 md:mb-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-violet-500/20 border border-primary/30 text-sm mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="font-medium bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">Live Interactive Demo</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="text-foreground">The </span>
              <span className="bg-gradient-to-r from-primary via-violet-400 to-cyan-400 bg-clip-text text-transparent">Operating System</span>
              <span className="block text-foreground mt-2">for Autonomous AI</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Watch cognitive modules orchestrate in real-time. Memory, reasoning, defense, 
              and synthesis — unified into one coherent substrate.
            </motion.p>
          </div>

          {/* Main Demo Area */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-6xl mx-auto"
          >
            <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl">
              {/* Decorative top border */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              <div className="grid lg:grid-cols-[1fr,380px] divide-y lg:divide-y-0 lg:divide-x divide-border/50">
                {/* Visualization Panel */}
                <div className="p-6 md:p-8 relative">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-primary/50'}`} />
                        <span className="text-sm font-medium">
                          {isRunning ? 'Processing Pipeline' : 'Ready'}
                        </span>
                      </div>
                      {isRunning && currentStep >= 0 && (
                        <span className="text-xs text-muted-foreground">
                          Step {currentStep + 1} of {DEMO_SCENARIOS[currentScenario].sequence.length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{systemHealth}%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-primary" />
                        <span>{totalOperations} ops</span>
                      </div>
                    </div>
                  </div>

                  {/* Circular Module Layout */}
                  <div className="relative h-[320px] md:h-[400px] flex items-center justify-center">
                    {/* Orbital Rings */}
                    <div className="absolute w-[260px] h-[260px] md:w-[320px] md:h-[320px] rounded-full border border-border/20" />
                    <div className="absolute w-[200px] h-[200px] md:w-[240px] md:h-[240px] rounded-full border border-border/10" />
                    
                    {/* Center Core */}
                    <motion.div 
                      className="absolute w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-primary/30 via-violet-500/20 to-cyan-500/20 border border-primary/40 flex flex-col items-center justify-center backdrop-blur-sm"
                      animate={{ 
                        scale: isRunning ? [1, 1.05, 1] : 1,
                        boxShadow: isRunning 
                          ? ['0 0 30px rgba(139,92,246,0.3)', '0 0 60px rgba(139,92,246,0.5)', '0 0 30px rgba(139,92,246,0.3)'] 
                          : '0 0 40px rgba(139,92,246,0.2)'
                      }}
                      transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
                    >
                      <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary mb-1" />
                      <span className="text-[10px] md:text-xs font-medium text-muted-foreground">Substrate</span>
                    </motion.div>

                    {/* Connection Lines SVG */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                          <stop offset="50%" stopColor="hsl(263, 70%, 60%)" stopOpacity="1" />
                          <stop offset="100%" stopColor="hsl(190, 80%, 50%)" stopOpacity="0.8" />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      
                      {activeConnections.map((conn, i) => {
                        const [from, to] = conn.split('-');
                        const fromIdx = modules.findIndex(m => m.id === from);
                        const toIdx = modules.findIndex(m => m.id === to);
                        if (fromIdx === -1 || toIdx === -1) return null;
                        
                        const fromPos = getModulePosition(fromIdx, modules.length);
                        const toPos = getModulePosition(toIdx, modules.length);
                        const centerX = 160; // Approximate center for mobile
                        const centerY = 160;
                        
                        return (
                          <motion.line
                            key={conn}
                            x1={centerX + fromPos.x}
                            y1={centerY + fromPos.y}
                            x2={centerX + toPos.x}
                            y2={centerY + toPos.y}
                            stroke="url(#connectionGradient)"
                            strokeWidth="2"
                            filter="url(#glow)"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        );
                      })}
                    </svg>

                    {/* Module Nodes */}
                    {modules.map((module, index) => {
                      const pos = getModulePosition(index, modules.length);
                      const Icon = module.icon;
                      const isActive = module.status === 'processing';
                      const isComplete = module.status === 'complete';

                      return (
                        <motion.div
                          key={module.id}
                          className="absolute"
                          style={{ 
                            left: `calc(50% + ${pos.x}px - 32px)`,
                            top: `calc(50% + ${pos.y}px - 32px)`,
                          }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.08, type: "spring", stiffness: 200 }}
                        >
                          <motion.div 
                            className={`relative w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all duration-300 backdrop-blur-sm ${
                              isActive 
                                ? `bg-gradient-to-br ${module.gradient} border-white/30 shadow-lg shadow-${module.color}-500/30` 
                                : isComplete 
                                  ? 'bg-emerald-500/20 border-emerald-500/50 shadow-lg shadow-emerald-500/20' 
                                  : 'bg-card/80 border-border/50 hover:border-primary/40 hover:bg-card'
                            }`}
                            animate={isActive ? {
                              scale: [1, 1.1, 1],
                              transition: { duration: 0.6, repeat: Infinity }
                            } : {}}
                          >
                            <Icon className={`w-5 h-5 md:w-6 md:h-6 ${
                              isActive ? 'text-white' : 
                              isComplete ? 'text-emerald-400' : 'text-muted-foreground'
                            }`} />
                            <span className={`text-[10px] font-medium ${
                              isActive ? 'text-white/90' :
                              isComplete ? 'text-emerald-400' : 'text-muted-foreground'
                            }`}>{module.name}</span>
                            
                            {isComplete && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                              >
                                <Check className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Control Panel */}
                <div className="p-6 md:p-8 bg-muted/20">
                  {/* Scenario Selector */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Network className="w-4 h-4 text-primary" />
                      Select Pipeline
                    </h3>
                    <div className="space-y-2">
                      {DEMO_SCENARIOS.map((scenario, index) => {
                        const Icon = scenario.icon;
                        return (
                          <button
                            key={index}
                            onClick={() => setCurrentScenario(index)}
                            disabled={isRunning}
                            className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                              currentScenario === index 
                                ? 'bg-primary/15 border-primary/40 shadow-sm' 
                                : 'bg-card/50 border-border/50 hover:border-primary/30 hover:bg-card/80'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                currentScenario === index ? 'bg-primary/20' : 'bg-muted/50'
                              }`}>
                                <Icon className={`w-4 h-4 ${currentScenario === index ? 'text-primary' : 'text-muted-foreground'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-sm block">{scenario.name}</span>
                                <p className="text-xs text-muted-foreground truncate">{scenario.description}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mb-6">
                    <Button 
                      onClick={runScenario} 
                      disabled={isRunning}
                      className="flex-1 h-11 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg shadow-primary/25"
                    >
                      {isRunning ? (
                        <><Pause className="w-4 h-4 mr-2" /> Running...</>
                      ) : (
                        <><Play className="w-4 h-4 mr-2" /> Run Demo</>
                      )}
                    </Button>
                    <Button variant="outline" onClick={resetDemo} disabled={isRunning} className="h-11 px-4">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Live Log */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-primary" />
                      System Log
                    </h3>
                    <div className="h-40 overflow-y-auto space-y-0.5 font-mono text-xs bg-background/80 rounded-xl p-3 border border-border/30">
                      <AnimatePresence mode="popLayout">
                        {logs.length === 0 ? (
                          <p className="text-muted-foreground/60">$ awaiting commands...</p>
                        ) : (
                          logs.map((log, i) => (
                            <motion.div
                              key={`${log.timestamp.getTime()}-${i}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className="flex items-start gap-2"
                            >
                              <span className="text-muted-foreground/40 shrink-0">
                                {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                              <span className={`font-semibold shrink-0 ${
                                log.status === 'success' ? 'text-emerald-400' :
                                log.status === 'warning' ? 'text-amber-400' :
                                'text-primary'
                              }`}>
                                [{log.module}]
                              </span>
                              <span className="text-foreground/80">{log.action}</span>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 md:py-24 border-t border-border/30">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Build AI Products, Not Infrastructure
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stop reinventing the wheel. The substrate handles memory, security, routing, 
              and orchestration — so you can focus on what makes your AI unique.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Layers,
                title: 'Unified Foundation',
                description: 'All AI capabilities through one coherent interface. Memory, reasoning, security, and synthesis — orchestrated.',
                gradient: 'from-primary to-violet-500',
              },
              {
                icon: Lock,
                title: 'Enterprise Security',
                description: 'Built-in threat detection, rate limiting, and audit logging. Your AI infrastructure, hardened by default.',
                gradient: 'from-emerald-500 to-teal-500',
              },
              {
                icon: Zap,
                title: 'Instant Integration',
                description: 'RESTful API with typed contracts. Connect any frontend, any language. Build AI products in hours, not months.',
                gradient: 'from-amber-500 to-orange-500',
              }
            ].map((prop, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all duration-300 group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${prop.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <prop.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{prop.title}</h3>
                  <p className="text-sm text-muted-foreground">{prop.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/substrate">
              <Button size="lg" className="group h-12 px-6">
                Explore Documentation
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/decode">
              <Button size="lg" variant="outline" className="h-12 px-6">
                Try Decode Interface
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}