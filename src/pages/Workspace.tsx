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
import { WorkspaceOnboarding } from '@/components/onboarding/WorkspaceOnboarding';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { RelatedCapabilities } from '@/components/RelatedCapabilities';
import { PageSEOBlock } from '@/components/seo/PageSEOBlock';
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
  { id: 'memory-store', name: 'Memory Store', description: 'Store and recall memories via substrate API', category: 'memory', tier: 'free' as const, code: `const GATEWAY = 'https://api.cmpsbl.com/v1/substrate';\n\n// Store a memory\nconst res = await fetch(GATEWAY, {\n  method: 'POST',\n  headers: {\n    'Authorization': \`Bearer \${API_KEY}\`,\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    module: 'MEMORY',\n    action: 'store',\n    input: {\n      content: 'User prefers concise answers',\n      agentId: 'my-agent'\n    }\n  })\n});\n\nconst { memoryId, tier } = await res.json();` },
  { id: 'memory-recall', name: 'Memory Recall', description: 'Semantic recall for agent context enrichment', category: 'memory', tier: 'free' as const, code: `const GATEWAY = 'https://api.cmpsbl.com/v1/substrate';\n\n// Recall relevant memories\nconst res = await fetch(GATEWAY, {\n  method: 'POST',\n  headers: {\n    'Authorization': \`Bearer \${API_KEY}\`,\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    module: 'MEMORY',\n    action: 'recall',\n    input: {\n      query: userMessage,\n      agentId: 'my-agent'\n    }\n  })\n});\n\nconst { contextString } = await res.json();\n// Append contextString to your LLM prompt` },
  { id: 'sdk-engine', name: 'Engine SDK', description: 'Typed client for all 54 hosted engines', category: 'engine', tier: 'free' as const, code: `import { Engine } from '@cmpsbl/sdk';\n\nconst engine = new Engine('your-api-key');\n\n// Universal engine call\nconst result = await engine.call(\n  'godmind',\n  'reason',\n  'Analyze market trends for Q3'\n);\n\n// Browse the engine catalog\nconsole.log(Engine.catalog);` },
  { id: 'sdk-discover', name: 'Memory Stream Discovery', description: 'Discover new memory chains from system behavior', category: 'discovery', tier: 'free' as const, code: `import { CMPSBL } from '@cmpsbl/sdk';\n\nconst cmpsbl = new CMPSBL({ apiKey: 'your-api-key' });\n\n// Discovery starts automatically\nconst discovery = await cmpsbl.discover({\n  input: 'track user behavior across sessions'\n});\n\nif (discovery.detected) {\n  console.log(discovery.memory);\n  await cmpsbl.capture(discovery.memory.id);\n}` },
  { id: 'runtime-cjpi', name: 'CJPI Scoring', description: 'Memory chain scoring and auto-tiering via mini runtime', category: 'runtime', tier: 'creator' as const, code: `import { score, classify } from '@cmpsbl/runtime';\n\n// Score a discovered memory chain\nconst cjpi = score({\n  novelty: 0.82,\n  utility: 0.91,\n  complexity: 0.65,\n  composability: 0.78\n});\n\n// Auto-classify tier\nconst tier = classify(cjpi);\nconsole.log(tier); // 'Prime' | 'Relic' | 'Mythic' | 'Apex'` },
  { id: 'cli-init', name: 'CLI Init', description: 'Bootstrap a project via the CMPSBL CLI', category: 'cli', tier: 'architect' as const, code: `# Install the CLI\nnpm install -g @cmpsbl/cli\n\n# Authenticate (key from cmpsbl.com/api-access)\nexport CMPSBL_API_KEY=your-key\n\n# Initialize a new project\nnpx cmpsbl init\n\n# Check substrate status\nnpx cmpsbl status\nnpx cmpsbl whoami` },
];

const TIER_LABELS: Record<CommandTier, { label: string; color: string; price: string }> = {
  free: { label: 'Builder', color: 'bg-neon-green/10 text-neon-green border-neon-green/20', price: 'Included' },
  studio: { label: 'Studio', color: 'bg-neon-purple/10 text-neon-purple border-neon-purple/20', price: '$29/mo' },
  creator: { label: 'Creator', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20', price: '$49/mo' },
  architect: { label: 'Architect', color: 'bg-neon-amber/10 text-neon-amber border-neon-amber/20', price: '$79/mo' },
  governor: { label: 'Governor', color: 'bg-neon-magenta/10 text-neon-magenta border-neon-magenta/20', price: 'Admin' },
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
      setTerminalHistory(prev => [...prev, { input: terminalInput, output: `CMPSBL Substrate: ONLINE\nPrimitives: 40/40 active\nHealth: 97.2%\nYour tier: ${TIER_LABELS[userTier].label}` }]);
    } else if (cmd === 'modules') {
      setTerminalHistory(prev => [...prev, { input: terminalInput, output: '40 primitives across the 12·12·8·8 matrix:\nOrgans (12): CORE, SYSTEM, BRAIN, MEMORY, NERVE, NEXUS, IDENTITY, SOVEREIGN, ATLAS, MEDIC, RELAY, CONSCIENCE\nLayers (12): DEFENSE, IMMUNITY, GOVERNANCE, TREATY, EVOLUTION, REFLEX, COMPASS, INTEGRATION, INTENT, ACCESS, VISION, SHADOW\nEngines (8): DREAM, HARVEST, FORGE, LINGUA, ECHO, PHANTOM, SANDBOX, RIPPLE\nAgents (8): ENCODE, DECODE, AUDIT, ECONOMY, INCLUSIVE, CORTEX, ORACLE, ENGINEER' }]);
    } else if (matched) {
      setTerminalHistory(prev => [...prev, { input: terminalInput, output: `[${matched.category.toUpperCase()}] ${matched.description}\n→ Executing ${matched.command}...\n✓ Complete`, tier: matched.tier }]);
    } else {
      const lockedCmd = getExclusiveCommands('creator').find(c => c.command === cmd) ||
        getExclusiveCommands('studio').find(c => c.command === cmd) ||
        getExclusiveCommands('architect').find(c => c.command === cmd) ||
        getExclusiveCommands('governor').find(c => c.command === cmd);
      if (lockedCmd) {
        setTerminalHistory(prev => [...prev, { input: terminalInput, output: `⛔ "${cmd}" requires ${TIER_LABELS[lockedCmd.tier].label} tier (${TIER_LABELS[lockedCmd.tier].price})\nUpgrade at /store to unlock ${counts[lockedCmd.tier]} commands.`, tier: lockedCmd.tier }]);
      } else {
        setTerminalHistory(prev => [...prev, { input: terminalInput, output: `Unknown command: "${cmd}"\nType "help" to see available commands.` }]);
      }
    }
    setTerminalInput('');
  }, [terminalInput, availableCommands, user, userTier, counts]);

  return (
    <>
      <SEO
        title="Workspace — Your Personal Builder Hub | CMPSBL"
        description="Your CMPSBL builder workspace: manage active Memory Packs, view vault inventory, track crystallization stats, access SDK keys, and configure capability slots."
        canonical="https://cmpsbl.com/workspace"
      />
      <PublicNav />
      <WorkspaceOnboarding />

      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-xs font-mono uppercase tracking-[0.4em] text-muted-foreground mb-4">
              Memory Stream · Builder Workspace
            </div>
             <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Your Builder Space
            </h1>
             <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
               Create, test, and deploy with the full power of the 12·12·8·8 substrate matrix. 
               Includes persistent memory, SDK templates, and {counts.free} terminal commands.
             </p>
            <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
              <Badge variant="outline" className="border-neon-green/30 text-neon-green font-mono text-xs">
                {counts.free} Builder Commands
              </Badge>
              <Badge variant="outline" className="border-muted text-muted-foreground font-mono text-xs">
                {counts.governor} Total Commands
              </Badge>
              <Badge variant="outline" className="border-sky-500/30 text-sky-400 font-mono text-xs">
                MEMORY Organ Active
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
                    <Card key={tpl.id} className={`p-4 bg-card/50 border-border/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 card-lift shimmer-on-hover glass-edge ${isLocked ? 'opacity-60' : ''}`}>
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
                            {copiedId === tpl.id ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
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
                        <Button size="sm" variant="outline" className="w-full mt-3 text-xs font-mono h-8" onClick={() => navigate('/store?tab=plans')}>
                          <Lock className="w-3 h-3 mr-1" /> Upgrade to {tierInfo.label}
                        </Button>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* Quick Links */}
              <div className="grid gap-3 sm:grid-cols-3 mt-8">
                <Card className="p-4 bg-card/50 border-border/50 cursor-pointer hover:border-primary/30 transition-all duration-300 card-lift shimmer-on-hover glass-edge" onClick={() => navigate('/persistent-memory')}>
                  <Brain className="w-5 h-5 text-neon-purple mb-2" />
                  <h4 className="font-mono text-sm font-semibold">MEMORY Organ</h4>
                  <p className="text-xs text-muted-foreground mt-1">4-tier cognitive storage. Add memory to any agent.</p>
                </Card>
                <Card className="p-4 bg-card/50 border-border/50 cursor-pointer hover:border-primary/30 transition-all duration-300 card-lift shimmer-on-hover glass-edge" onClick={() => navigate('/foundry')}>
                  <Sparkles className="w-5 h-5 text-sky-400 mb-2" />
                  <h4 className="font-mono text-sm font-semibold">Memory Stream</h4>
                  <p className="text-xs text-muted-foreground mt-1">Crystallize memories into deployable artifacts.</p>
                </Card>
                <Card className="p-4 bg-card/50 border-border/50 cursor-pointer hover:border-primary/30 transition-all duration-300 card-lift shimmer-on-hover glass-edge" onClick={() => navigate('/docs')}>
                  <BookOpen className="w-5 h-5 text-neon-amber mb-2" />
                  <h4 className="font-mono text-sm font-semibold">Documentation</h4>
                  <p className="text-xs text-muted-foreground mt-1">Full API reference and integration guides.</p>
                </Card>
              </div>
            </TabsContent>

            {/* ── Terminal Tab ── */}
            <TabsContent value="terminal">
              <Card className="bg-[hsl(var(--card))]/80 border-border/50 overflow-hidden glass-edge">
                {/* Terminal Header */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 bg-muted/20">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-foreground/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-primary/50" />
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground ml-2">
                    memory stream terminal — {TIER_LABELS[userTier].label} ({availableCommands.length} commands)
                  </span>
                </div>

                {/* Terminal Output */}
                <div className="h-80 overflow-y-auto p-4 font-mono text-xs space-y-3">
                  {/* Welcome */}
                  <div className="text-muted-foreground">
                    <div className="text-neon-green">CMPSBL Substrate Terminal</div>
                    <div>Tier: {TIER_LABELS[userTier].label} · Commands: {availableCommands.length} · Type "help" to begin</div>
                    <div className="border-b border-border/20 mt-2" />
                  </div>

                  {terminalHistory.map((entry, i) => (
                    <div key={i}>
                      <div className="text-neon-green">
                        <span className="text-muted-foreground">$</span> {entry.input}
                      </div>
                      <pre className="text-muted-foreground whitespace-pre-wrap mt-1 pl-2 border-l border-border/20">{entry.output}</pre>
                    </div>
                  ))}
                </div>

                {/* Terminal Input */}
                <div className="border-t border-border/30 px-4 py-3 flex items-center gap-2 bg-muted/10">
                  <span className="text-neon-green font-mono text-xs">$</span>
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
                  <p className="text-muted-foreground text-sm mb-3">Sign in to access the terminal — Builder tier includes {counts.free} commands.</p>
                  <Button onClick={() => navigate('/auth')} className="font-mono text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
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

              {(['free', 'studio', 'creator', 'architect', 'governor'] as CommandTier[]).map((tier) => {
                const tierCmds = getExclusiveCommands(tier);
                const info = TIER_LABELS[tier];
                const isExpanded = expandedTier === tier;
                const isAvailable = ['free', 'studio', 'creator', 'architect', 'governor'].indexOf(userTier) >= ['free', 'studio', 'creator', 'architect', 'governor'].indexOf(tier);

                return (
                  <Card
                    key={tier}
                    className={`border-border/50 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm ${isAvailable ? 'bg-card/50' : 'bg-muted/20 opacity-70'}`}
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
                <Button variant="outline" className="font-mono text-sm hover:border-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={() => navigate('/store?tab=plans')}>
                  <Rocket className="w-4 h-4 mr-2" /> View Plans & Pricing
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <RelatedCapabilities />
      <PageSEOBlock path="/workspace" title="Builder Workspace" />
      <EnhancedFooter />
    </>
  );
}
