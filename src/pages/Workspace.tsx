/**
 * Workspace — Personal Builder Space
 * In-browser SDK access, project scaffolding, tiered terminal,
 * and direct access to the Memory Stream and crystallized assets.
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Terminal, Code, Layers, Sparkles, Brain, Shield, Rocket,
  Play, Copy, Check, ChevronRight, Lock, Zap, Package,
  FolderOpen, FileCode, ArrowRight, Command, BookOpen,
} from 'lucide-react';
import { getCommandsForTier, getExclusiveCommands, getTierCommandCounts, type CommandTier, type TieredCommand } from '@/lib/terminal/tiered-commands';
import { motion, AnimatePresence } from 'framer-motion';

const SDK_TEMPLATES = [
  { id: 'memory-agent', name: 'Memory Agent', description: 'Agent with persistent memory and recall', category: 'agent', tier: 'free' as const, code: `import { MemoryClient } from '@cmpsbl/memory';\nimport { nexusRoute } from '@cmpsbl/nexus';\n\nconst memory = new MemoryClient({ namespace: 'my-agent' });\n\n// Store a memory\nawait memory.store('user-preference', {\n  content: 'Prefers concise answers',\n  tags: ['preference', 'style']\n});\n\n// Recall with vector search\nconst results = await memory.recall('how does the user like answers?');\nconsole.log(results);` },
  { id: 'decode-bot', name: 'DECODE Bot', description: 'Natural language intent parser', category: 'decode', tier: 'free' as const, code: `import { parseActionIntent } from '@cmpsbl/execution';\n\nconst input = "Find the top 3 competitors for Acme Corp";\nconst intent = parseActionIntent(input);\n\nconsole.log(intent);\n// { action: 'research', target: 'competitors',\n//   params: { company: 'Acme Corp', count: 3 } }` },
  { id: 'defense-scanner', name: 'DEFENSE Scanner', description: 'Anomaly detection pipeline', category: 'defense', tier: 'free' as const, code: `import { DefenseClient } from '@cmpsbl/defense';\n\nconst defense = new DefenseClient();\n\n// Scan for anomalies\nconst report = await defense.scan({\n  target: 'api-endpoint',\n  depth: 'standard'\n});\n\nconsole.log(report.threats);\nconsole.log(report.score); // 0.0 - 1.0` },
  { id: 'nexus-router', name: 'NEXUS Router', description: 'Multi-provider AI routing', category: 'nexus', tier: 'free' as const, code: `import { nexusRoute } from '@cmpsbl/nexus';\n\n// Route to best provider for the task\nconst result = await nexusRoute({\n  prompt: 'Summarize this quarterly report',\n  taskType: 'summarization',\n  budget: 'economy'\n});\n\nconsole.log(result.provider); // e.g. 'gemini-2.5-flash'\nconsole.log(result.output);` },
  { id: 'pipeline-export', name: 'Pipeline Exporter', description: 'Export crystallized pipelines to code', category: 'build', tier: 'creator' as const, code: `import { PipelineExporter } from '@cmpsbl/foundry';\n\nconst exporter = new PipelineExporter();\n\n// Export a crystallized pipeline to Python\nconst artifact = await exporter.export({\n  pipelineId: 'pipe_abc123',\n  language: 'python',\n  includeRuntime: true\n});\n\nconsole.log(artifact.code);\nconsole.log(artifact.testHarness);` },
  { id: 'evolution-watcher', name: 'EVOLUTION Watcher', description: 'Monitor self-improvement proposals', category: 'evolution', tier: 'architect' as const, code: `import { EvolutionClient } from '@cmpsbl/evolution';\n\nconst evo = new EvolutionClient();\n\n// Watch for new proposals\novo.onProposal((proposal) => {\n  console.log(proposal.type);\n  console.log(proposal.confidence);\n  if (proposal.confidence > 0.9) {\n    evo.approve(proposal.id);\n  }\n});` },
];

const TIER_LABELS: Record<CommandTier, { label: string; color: string; price: string }> = {
  free: { label: 'Free', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', price: '$0' },
  creator: { label: 'Creator', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20', price: '$29/mo' },
  studio: { label: 'Studio', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20', price: '$49/mo' },
  architect: { label: 'Architect', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', price: '$79/mo' },
  governor: { label: 'Governor', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', price: 'Admin' },
};

export default function Workspace() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sdk');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<{ input: string; output: string; tier?: CommandTier }[]>([]);
  const [expandedTier, setExpandedTier] = useState<CommandTier | null>('free');

  const userTier = (role === 'governor' ? 'governor' : role === 'architect' ? 'architect' : role === 'studio' ? 'studio' : role === 'creator' ? 'creator' : 'free') as CommandTier;
  const availableCommands = getCommandsForTier(userTier);
  const counts = getTierCommandCounts();

  const copyCode = useCallback((code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleTerminalSubmit = useCallback(() => {
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim().toLowerCase();
    const matched = availableCommands.find(c => c.command === cmd);
    
    if (cmd === 'help') {
      const output = availableCommands.map(c => `  ${c.command.padEnd(28)} ${c.description}`).join('\n');
      setTerminalHistory(prev => [...prev, { input: terminalInput, output: `Available commands (${availableCommands.length}):\n${output}` }]);
    } else if (cmd === 'whoami') {
      setTerminalHistory(prev => [...prev, { input: terminalInput, output: `Identity: ${user?.email || 'anonymous'}\nTier: ${TIER_LABELS[userTier].label} (${TIER_LABELS[userTier].price})\nCommands: ${availableCommands.length} available` }]);
    } else if (cmd === 'status') {
      setTerminalHistory(prev => [...prev, { input: terminalInput, output: `CMPSBL Substrate: ONLINE\nNodes: 38/38 active\nHealth: 97.2%\nYour tier: ${TIER_LABELS[userTier].label}` }]);
    } else if (cmd === 'modules') {
      setTerminalHistory(prev => [...prev, { input: terminalInput, output: '38 nodes across 12 sectors:\nCORE: BRAIN, MEMORY, DREAM, SYSTEM\nOCG: RIPPLE, ACCESS, DEFENSE, NERVE\nExecution: DECODE, NEXUS, VISION, CORTEX, INCLUSIVE, INTEGRATION, MODERNIZER\nESZ/EPZ/EMZ/CSZ: SOVEREIGN, CONSCIENCE, SENTINEL, ORACLE, REFLEX, PERCEPTION, FORGE, FOUNDRY, PHANTOM, SHADOW, EVOLUTION\nField: IMMUNITY, INTENT, EVOLUTION_MESH\nPlane: CONTROL, GOVERNOR\nShell: ENGINEER, ENCODE' }]);
    } else if (matched) {
      setTerminalHistory(prev => [...prev, { input: terminalInput, output: `[${matched.category.toUpperCase()}] ${matched.description}\n→ Executing ${matched.command}...\n✓ Complete`, tier: matched.tier }]);
    } else {
      const lockedCmd = getExclusiveCommands('creator').find(c => c.command === cmd) ||
        getExclusiveCommands('studio').find(c => c.command === cmd) ||
        getExclusiveCommands('architect').find(c => c.command === cmd) ||
        getExclusiveCommands('governor').find(c => c.command === cmd);
      if (lockedCmd) {
        setTerminalHistory(prev => [...prev, { input: terminalInput, output: `⛔ "${cmd}" requires ${TIER_LABELS[lockedCmd.tier].label} tier (${TIER_LABELS[lockedCmd.tier].price})\nUpgrade at /upgrade to unlock ${counts[lockedCmd.tier]} commands.`, tier: lockedCmd.tier }]);
      } else {
        setTerminalHistory(prev => [...prev, { input: terminalInput, output: `Unknown command: "${cmd}"\nType "help" to see available commands.` }]);
      }
    }
    setTerminalInput('');
  }, [terminalInput, availableCommands, user, userTier, counts]);

  return (
    <>
      <SEO
        title="Workspace — Build on the Substrate | CMPSBL"
        description="Your personal builder space. Access SDKs, crystallize pipelines, and build on the cognitive substrate — free tier included."
        canonical="https://cmpsbl.com/workspace"
      />
      <PublicNav />

      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-xs font-mono uppercase tracking-[0.4em] text-muted-foreground mb-4">
              Builder Workspace
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Build on the Substrate
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Your personal space to create, test, and deploy with the full power of 38 cognitive nodes.
              Free tier gets persistent memory, rare agents, and 12 terminal commands.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 font-mono text-xs">
                {counts.free} Free Commands
              </Badge>
              <Badge variant="outline" className="border-muted text-muted-foreground font-mono text-xs">
                {counts.governor} Total Commands
              </Badge>
              <Badge variant="outline" className="border-sky-500/30 text-sky-400 font-mono text-xs">
                Persistent Memory Included
              </Badge>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="w-full max-w-lg mx-auto grid grid-cols-3 bg-muted/30 border border-border">
              <TabsTrigger value="sdk" className="font-mono text-xs gap-1.5">
                <Code className="w-3.5 h-3.5" /> SDK
              </TabsTrigger>
              <TabsTrigger value="terminal" className="font-mono text-xs gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> Terminal
              </TabsTrigger>
              <TabsTrigger value="commands" className="font-mono text-xs gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Command Map
              </TabsTrigger>
            </TabsList>

            {/* ── SDK Tab ── */}
            <TabsContent value="sdk" className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SDK_TEMPLATES.map((tpl) => {
                  const tierInfo = TIER_LABELS[tpl.tier];
                  const isLocked = ['creator', 'studio', 'architect', 'governor'].indexOf(tpl.tier) > ['creator', 'studio', 'architect', 'governor'].indexOf(userTier) && tpl.tier !== 'free';
                  
                  return (
                    <Card key={tpl.id} className={`p-4 bg-card/50 border-border/50 backdrop-blur-sm transition-all hover:border-primary/30 ${isLocked ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-mono text-sm font-semibold text-foreground">{tpl.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{tpl.description}</p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${tierInfo.color}`}>
                          {isLocked && <Lock className="w-2.5 h-2.5 mr-1" />}
                          {tierInfo.label}
                        </Badge>
                      </div>

                      <div className="relative">
                        <pre className="text-[11px] font-mono bg-muted/40 rounded-md p-3 overflow-x-auto max-h-36 text-muted-foreground border border-border/30">
                          <code>{tpl.code}</code>
                        </pre>
                        {!isLocked && (
                          <button
                            onClick={() => copyCode(tpl.code, tpl.id)}
                            className="absolute top-2 right-2 p-1.5 rounded bg-background/80 border border-border/50 hover:bg-accent transition-colors"
                          >
                            {copiedId === tpl.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                          </button>
                        )}
                      </div>

                      {!isLocked && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="flex-1 text-xs font-mono h-8" onClick={() => copyCode(tpl.code, tpl.id)}>
                            <Copy className="w-3 h-3 mr-1" /> Copy
                          </Button>
                          <Button size="sm" className="flex-1 text-xs font-mono h-8" onClick={() => navigate('/codelab')}>
                            <Play className="w-3 h-3 mr-1" /> Open in CodeLab
                          </Button>
                        </div>
                      )}
                      {isLocked && (
                        <Button size="sm" variant="outline" className="w-full mt-3 text-xs font-mono h-8" onClick={() => navigate('/upgrade')}>
                          <Lock className="w-3 h-3 mr-1" /> Upgrade to {tierInfo.label}
                        </Button>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* Quick Links */}
              <div className="grid gap-3 sm:grid-cols-3 mt-8">
                <Card className="p-4 bg-card/50 border-border/50 cursor-pointer hover:border-primary/30 transition-all" onClick={() => navigate('/persistent-memory')}>
                  <Brain className="w-5 h-5 text-violet-400 mb-2" />
                  <h4 className="font-mono text-sm font-semibold">Persistent Memory</h4>
                  <p className="text-xs text-muted-foreground mt-1">Free for all tiers. Add memory to any agent.</p>
                  <Badge variant="outline" className="mt-2 text-[10px] border-emerald-500/30 text-emerald-400">FREE</Badge>
                </Card>
                <Card className="p-4 bg-card/50 border-border/50 cursor-pointer hover:border-primary/30 transition-all" onClick={() => navigate('/foundry')}>
                  <Sparkles className="w-5 h-5 text-sky-400 mb-2" />
                  <h4 className="font-mono text-sm font-semibold">Memory Stream</h4>
                  <p className="text-xs text-muted-foreground mt-1">Crystallize pipelines. Rare finds on every tier.</p>
                  <Badge variant="outline" className="mt-2 text-[10px] border-emerald-500/30 text-emerald-400">FREE</Badge>
                </Card>
                <Card className="p-4 bg-card/50 border-border/50 cursor-pointer hover:border-primary/30 transition-all" onClick={() => navigate('/documentation')}>
                  <BookOpen className="w-5 h-5 text-amber-400 mb-2" />
                  <h4 className="font-mono text-sm font-semibold">Documentation</h4>
                  <p className="text-xs text-muted-foreground mt-1">Full API reference and integration guides.</p>
                </Card>
              </div>
            </TabsContent>

            {/* ── Terminal Tab ── */}
            <TabsContent value="terminal">
              <Card className="bg-[hsl(var(--card))]/80 border-border/50 overflow-hidden">
                {/* Terminal Header */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 bg-muted/20">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground ml-2">
                    cmpsbl terminal — {TIER_LABELS[userTier].label} ({availableCommands.length} commands)
                  </span>
                </div>

                {/* Terminal Output */}
                <div className="h-80 overflow-y-auto p-4 font-mono text-xs space-y-3">
                  {/* Welcome */}
                  <div className="text-muted-foreground">
                    <div className="text-emerald-400">CMPSBL Substrate Terminal</div>
                    <div>Tier: {TIER_LABELS[userTier].label} · Commands: {availableCommands.length} · Type "help" to begin</div>
                    <div className="border-b border-border/20 mt-2" />
                  </div>

                  {terminalHistory.map((entry, i) => (
                    <div key={i}>
                      <div className="text-emerald-400">
                        <span className="text-muted-foreground">$</span> {entry.input}
                      </div>
                      <pre className="text-muted-foreground whitespace-pre-wrap mt-1 pl-2 border-l border-border/20">{entry.output}</pre>
                    </div>
                  ))}
                </div>

                {/* Terminal Input */}
                <div className="border-t border-border/30 px-4 py-3 flex items-center gap-2 bg-muted/10">
                  <span className="text-emerald-400 font-mono text-xs">$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTerminalSubmit()}
                    placeholder={user ? "Type a command..." : "Sign in to use the terminal"}
                    disabled={!user}
                    className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-foreground placeholder:text-muted-foreground/50"
                  />
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs font-mono" onClick={handleTerminalSubmit} disabled={!user}>
                    <Play className="w-3 h-3" />
                  </Button>
                </div>
              </Card>

              {!user && (
                <div className="text-center mt-6">
                  <p className="text-muted-foreground text-sm mb-3">Sign in to access the terminal — free tier includes 12 commands.</p>
                  <Button onClick={() => navigate('/auth')} className="font-mono text-sm">
                    Sign In <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* ── Command Map Tab ── */}
            <TabsContent value="commands" className="space-y-4">
              <p className="text-muted-foreground text-sm text-center mb-6">
                Commands build progressively. Every tier inherits all commands from lower tiers.
              </p>

              {(['free', 'creator', 'studio', 'architect', 'governor'] as CommandTier[]).map((tier) => {
                const tierCmds = getExclusiveCommands(tier);
                const info = TIER_LABELS[tier];
                const isExpanded = expandedTier === tier;
                const isAvailable = ['free', 'creator', 'studio', 'architect', 'governor'].indexOf(userTier) >= ['free', 'creator', 'studio', 'architect', 'governor'].indexOf(tier);

                return (
                  <Card
                    key={tier}
                    className={`border-border/50 overflow-hidden transition-all ${isAvailable ? 'bg-card/50' : 'bg-muted/20 opacity-70'}`}
                  >
                    <button
                      className="w-full px-4 py-3 flex items-center justify-between text-left"
                      onClick={() => setExpandedTier(isExpanded ? null : tier)}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`text-[10px] ${info.color}`}>
                          {!isAvailable && <Lock className="w-2.5 h-2.5 mr-1" />}
                          {info.label}
                        </Badge>
                        <span className="font-mono text-sm text-foreground">{tierCmds.length} commands</span>
                        <span className="text-xs text-muted-foreground">{info.price}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 grid gap-1">
                            {tierCmds.map((cmd) => (
                              <div key={cmd.command} className="flex items-center gap-3 py-1.5 border-b border-border/10 last:border-0">
                                <code className="font-mono text-[11px] text-primary w-48 shrink-0">{cmd.command}</code>
                                <span className="text-xs text-muted-foreground">{cmd.description}</span>
                                <Badge variant="outline" className="ml-auto text-[9px] border-border/30">{cmd.category}</Badge>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}

              <div className="text-center mt-6">
                <Button variant="outline" className="font-mono text-sm" onClick={() => navigate('/upgrade')}>
                  <Rocket className="w-4 h-4 mr-2" /> View Plans & Pricing
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <EnhancedFooter />
    </>
  );
}
